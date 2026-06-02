const REDIS_URL = process.env.REDIS_URL || "";
const ENABLED = REDIS_URL.length > 0;

type RedisClient = import("ioredis").Redis;

let redisClient: RedisClient | null = null;

// In-memory fallback for when Redis is unavailable
const memStore = new Map<string, { count: number; expiresAt: number }>();

function memKey(ip: string): string {
  return `ratelimit:${ip}`;
}

function memSweep(): void {
  const now = Date.now();
  for (const [k, v] of memStore) {
    if (v.expiresAt <= now) memStore.delete(k);
  }
}

function memGet(ip: string): { count: number; ttl: number } {
  memSweep();
  const k = memKey(ip);
  const entry = memStore.get(k);
  if (!entry) return { count: 0, ttl: 86400 };
  const ttl = Math.max(0, Math.round((entry.expiresAt - Date.now()) / 1000));
  return { count: entry.count, ttl };
}

function memIncrement(ip: string): { count: number; ttl: number } {
  memSweep();
  const k = memKey(ip);
  const now = Date.now();
  const entry = memStore.get(k);
  if (!entry) {
    memStore.set(k, { count: 1, expiresAt: now + 86400_000 });
    return { count: 1, ttl: 86400 };
  }
  entry.count += 1;
  const ttl = Math.max(0, Math.round((entry.expiresAt - now) / 1000));
  return { count: entry.count, ttl };
}

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

export async function getRateLimitInfo(ip: string): Promise<{ count: number; ttl: number }> {
  if (ENABLED) {
    try {
      if (!redisClient) redisClient = await getRedis();
      const count = Number(await redisClient.get(redisKey(ip))) || 0;
      const ttl = await redisClient.ttl(redisKey(ip));
      return { count, ttl: ttl < 0 ? 86400 : ttl };
    } catch {
      // fall through to in-memory fallback
    }
  }
  return memGet(ip);
}

export async function incrementRateLimit(ip: string): Promise<{ count: number; ttl: number }> {
  if (ENABLED) {
    try {
      if (!redisClient) redisClient = await getRedis();
      const count = await redisClient.incr(redisKey(ip));
      let ttl = await redisClient.ttl(redisKey(ip));
      if (count === 1) {
        await redisClient.expire(redisKey(ip), 86400);
        ttl = 86400;
      }
      return { count, ttl };
    } catch {
      // fall through to in-memory fallback
    }
  }
  return memIncrement(ip);
}

function redisKey(ip: string): string {
  return `ratelimit:${ip}`;
}
