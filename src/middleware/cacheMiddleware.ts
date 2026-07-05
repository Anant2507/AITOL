import { Request, Response, NextFunction } from "express";
import {
  generateCacheKey,
  getCache,
  setCache,
  trackStat,
  trackCost,
  trackDailyRequest,
  storeVectorCache,
  searchSimilarPrompt,
  trackMrlSavings,
} from "../cache/redisCache";
import { calculateCost } from "../pricing";
import { generateEmbedding } from "../services/embeddingService";
import { mrlCompressor } from "../mrl/index";

export interface CacheableRequestBody {
  prompt: string;
  model?: string;
  params?: Record<string, any>;
}

const DEFAULT_TTL = 3600;

export function cacheMiddleware(ttlSeconds: number = DEFAULT_TTL) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { prompt, model, params = {} } = req.body as CacheableRequestBody;

    if (!prompt) {
      return res.status(400).json({ error: "prompt is required" });
    }

    // ── MRL Compression ─────────────────────────────────────
    const mrlResult = mrlCompressor.compress(prompt);
    const tokensSaved = mrlResult.originalTokenCount - mrlResult.compressedTokenCount;
    (req as any).mrlResult = mrlResult;
    await trackMrlSavings(mrlResult.originalTokenCount, tokensSaved);
    await trackDailyRequest();

    if (params.temperature && params.temperature > 0) {
      return next();
    }

    // ── 1. Exact-match cache ─────────────────────────────────
    const resolvedModel = model || "auto";
    const cacheKey = generateCacheKey({ prompt: mrlResult.compressed, model: resolvedModel, params });
    const cached = await getCache(cacheKey);

    if (cached) {
      await trackStat("hit");
      const cachedData = JSON.parse(cached);
      const savedCost = calculateCost(resolvedModel, cachedData.tokensUsed || 0);
      await trackCost("saved", savedCost);
      return res.json({
        ...cachedData,
        cached: true,
        cacheType: "exact",
        routing: {
          model:      resolvedModel,
          tier:       "cached",
          score:      null,
          autoRouted: !model,
        },
        mrl: {
          originalTokens:   mrlResult.originalTokenCount,
          compressedTokens: mrlResult.compressedTokenCount,
          compressionRatio: mrlResult.compressionRatio,
          tokensSaved,
        },
      });
    }

    // ── 2. Semantic cache ────────────────────────────────────
    try {
      const embedding = await generateEmbedding(prompt);
      (req as any).promptEmbedding = embedding;

      const similarMatch = await searchSimilarPrompt(embedding, resolvedModel, 0.82);

      if (similarMatch) {
        await trackStat("hit");
        await trackStat("semantic_hit");
        const savedCost = calculateCost(resolvedModel, similarMatch.tokensUsed);
        await trackCost("saved", savedCost);
        return res.json({
          text: similarMatch.response,
          tokensUsed: similarMatch.tokensUsed,
          cached: true,
          cacheType: "semantic",
          matchedPrompt: similarMatch.prompt,
          routing: {
            model:      resolvedModel,
            tier:       "cached",
            score:      null,
            autoRouted: !model,
          },
          mrl: {
            originalTokens:   mrlResult.originalTokenCount,
            compressedTokens: mrlResult.compressedTokenCount,
            compressionRatio: mrlResult.compressionRatio,
            tokensSaved,
          },
        });
      }
    } catch (err) {
      console.error("Semantic search failed, falling back to LLM:", err);
    }

    // ── 3. Cache miss — forward to LLM ───────────────────────
    await trackStat("miss");
    (req as any).cacheKey = cacheKey;
    (req as any).cacheTTL = ttlSeconds;
    next();
  };
}

export async function cacheResponse(req: Request, responseData: any) {
  const key = (req as any).cacheKey;
  const ttl = (req as any).cacheTTL || DEFAULT_TTL;
  const embedding = (req as any).promptEmbedding;
  const { prompt, model } = req.body as CacheableRequestBody;

  if (key) {
    await setCache(key, JSON.stringify(responseData), ttl);
  }

  if (embedding) {
    await storeVectorCache(
      prompt,
      responseData.text,
      model || "auto",
      responseData.tokensUsed || 0,
      embedding
    );
  }
}