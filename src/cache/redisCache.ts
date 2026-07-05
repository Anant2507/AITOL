import Redis from "ioredis";
import crypto from "crypto";

export const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
});

redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", (err) => console.error("❌ Redis error:", err));

export function generateCacheKey(payload: object): string {
  const raw = JSON.stringify(payload);
  return "aitol:cache:" + crypto.createHash("sha256").update(raw).digest("hex");
}

export async function getCache(key: string): Promise<string | null> {
  return redis.get(key);
}

export async function setCache(
  key: string,
  value: string,
  ttlSeconds: number = 3600
): Promise<void> {
  await redis.set(key, value, "EX", ttlSeconds);
}

export async function trackStat(type: "hit" | "miss" | "semantic_hit"): Promise<void> {
  await redis.incr(`aitol:stats:${type}`);
}

export async function getStats() {
  const [hits, misses, semanticHits, costSpent, costSaved, mrlTokensSaved, mrlTokensOriginal, history] = await Promise.all([
    redis.get("aitol:stats:hit"),
    redis.get("aitol:stats:miss"),
    redis.get("aitol:stats:semantic_hit"),
    redis.get("aitol:cost:spent"),
    redis.get("aitol:cost:saved"),
    redis.get("aitol:mrl:tokens_saved"),
    redis.get("aitol:mrl:tokens_original"),
    getRequestHistory(7),
  ]);
  const h = Number(hits) || 0;
  const m = Number(misses) || 0;
  const sh = Number(semanticHits) || 0;
  const total = h + m;
  const mrlSaved = Number(mrlTokensSaved) || 0;
  const mrlOriginal = Number(mrlTokensOriginal) || 0;

  return {
    hits: h,
    misses: m,
    semanticHits: sh,
    total,
    hitRate: total > 0 ? ((h / total) * 100).toFixed(2) + "%" : "0%",
    costSpent: Number(costSpent) || 0,
    costSaved: Number(costSaved) || 0,
    mrlTokensSaved: mrlSaved,
    mrlCompressionRatio: mrlOriginal > 0 ? ((mrlSaved / mrlOriginal) * 100).toFixed(1) + "%" : "0%",
    requestsLast7Days: history,
  };
}

export async function trackCost(type: "spent" | "saved", amount: number): Promise<void> {
  await redis.incrbyfloat(`aitol:cost:${type}`, amount);
}

function getTodayKey(): string {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  return `aitol:history:${today}`;
}

export async function trackDailyRequest(): Promise<void> {
  const key = getTodayKey();
  await redis.incr(key);
  await redis.expire(key, 60 * 60 * 24 * 14); // keep 14 days of history
}

export async function getRequestHistory(days: number = 7): Promise<{ day: string; requests: number }[]> {
  const result: { day: string; requests: number }[] = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split("T")[0];
    const count = await redis.get(`aitol:history:${dateKey}`);
    result.push({
      day: dayNames[date.getDay()],
      requests: Number(count) || 0,
    });
  }

  return result;
}

export async function createVectorIndex(): Promise<void> {
  try {
    await redis.call(
      "FT.CREATE", "idx:aitol_cache",
      "ON", "HASH",
      "PREFIX", "1", "aitol:vec:",
      "SCHEMA",
      "prompt", "TEXT",
      "response", "TEXT",
      "model", "TEXT",
      "tokensUsed", "NUMERIC",
      "embedding", "VECTOR", "FLAT", "6",
      "TYPE", "FLOAT32",
      "DIM", "384",
      "DISTANCE_METRIC", "COSINE"
    );
    console.log("✅ Vector index created");
  } catch (err: any) {
    if (err.message?.includes("Index already exists")) {
      console.log("ℹ️ Vector index already exists");
    } else {
      console.error("❌ Vector index creation failed:", err.message);
    }
  }
}

export async function storeVectorCache(
  prompt: string,
  response: string,
  model: string,
  tokensUsed: number,
  embedding: number[]
): Promise<void> {
  const key = `aitol:vec:${crypto.randomUUID()}`;
  const embeddingBuffer = Buffer.from(new Float32Array(embedding).buffer);

  await redis.call(
    "HSET", key,
    "prompt", prompt,
    "response", response,
    "model", model,
    "tokensUsed", tokensUsed.toString(),
    "embedding", embeddingBuffer
  );
}

export async function searchSimilarPrompt(
  embedding: number[],
  model: string,
  threshold: number = 0.90
): Promise<{ prompt: string; response: string; tokensUsed: number } | null> {
  const embeddingBuffer = Buffer.from(new Float32Array(embedding).buffer);

  try {
    const results: any = await redis.call(
      "FT.SEARCH", "idx:aitol_cache",
      `(@model:"${model}")=>[KNN 1 @embedding $vec AS score]`,
      "PARAMS", "2", "vec", embeddingBuffer,
      "SORTBY", "score",
      "DIALECT", "2"
    );

    // results format: [count, key1, [field, value, field, value, ...], ...]
    if (results[0] === 0) return null;

    const fields = results[2];
    const fieldMap: Record<string, string> = {};
    for (let i = 0; i < fields.length; i += 2) {
      fieldMap[fields[i]] = fields[i + 1];
    }

    const score = parseFloat(fieldMap["score"]);
    const similarity = 1 - score; // COSINE distance -> similarity

    if (similarity >= threshold) {
      return {
        prompt: fieldMap["prompt"],
        response: fieldMap["response"],
        tokensUsed: Number(fieldMap["tokensUsed"]) || 0,
      };
    }

    return null;
  } catch (err) {
    console.error("Vector search error:", err);
    return null;
  }
}

export async function trackMrlSavings(originalTokens: number, tokensSaved: number): Promise<void> {
  if (tokensSaved > 0) {
    await redis.incrby("aitol:mrl:tokens_saved", tokensSaved);
    await redis.incrby("aitol:mrl:tokens_original", originalTokens);
  }
}