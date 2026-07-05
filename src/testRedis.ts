import Redis from "ioredis";

const redis = new Redis(); // connects to localhost:6379 by default

async function test() {
  await redis.set("hello", "world");
  const value = await redis.get("hello");
  console.log("Redis says:", value);
  process.exit(0);
}

test();