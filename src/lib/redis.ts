const REDIS_URL = process.env.REDIS_URL || "";
const ENABLED = REDIS_URL.length > 0;

type RedisClient = import("ioredis").Redis;

let redisClient: RedisClient | null = null;

function getRedis(): Promise<RedisClient> {
  return import("ioredis").then((mod) => {
    const Redis = mod.default;
    const client = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryStrategy(times: number) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    });
    client.on("error", () => {});
    return client;
  });
}

export async function getCache<T>(key: string): Promise<{ data: T | null; cached: boolean }> {
  if (!ENABLED) return { data: null, cached: false };
  try {
    if (!redisClient) redisClient = await getRedis();
    const raw = await redisClient.get(key);
    if (raw) {
      return { data: JSON.parse(raw), cached: true };
    }
  } catch {
    // Redis unavailable — proceed without cache
  }
  return { data: null, cached: false };
}

export async function setCache<T>(key: string, data: T, ttlSeconds = 900): Promise<void> {
  if (!ENABLED) return;
  try {
    if (!redisClient) redisClient = await getRedis();
    await redisClient.setex(key, ttlSeconds, JSON.stringify(data));
  } catch {
    // Redis unavailable — skip caching
  }
}

export async function incrementRateLimit(ip: string): Promise<{ count: number; ttl: number }> {
  if (!ENABLED) return { count: 0, ttl: 0 };
  try {
    if (!redisClient) redisClient = await getRedis();
    const count = await redisClient.incr(key(ip));
    let ttl = await redisClient.ttl(key(ip));
    if (count === 1) {
      await redisClient.expire(key(ip), 86400);
      ttl = 86400;
    }
    return { count, ttl };
  } catch {
    return { count: 0, ttl: 0 };
  }
}

function key(ip: string): string {
  return `ratelimit:${ip}`;
}
