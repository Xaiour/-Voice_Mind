import { Redis } from "@upstash/redis";
import { env } from "./env";
import { logger } from "../utils/logger";

// ─── Upstash Redis (REST-based — works everywhere, no TCP needed) ───
let upstashClient: Redis | null = null;

if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
  upstashClient = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
  logger.info("Upstash Redis client initialized (REST)");
} else {
  logger.info("No Redis configured — running without Redis (OK for development).");
}

// ─── Unified Redis Service ──────────────────────────────────
// All methods are safe to call even when Redis is unavailable.
// They return sensible defaults (null, false, 0) when no client exists.

export const redis = {
  async get(key: string): Promise<string | null> {
    if (!upstashClient) return null;
    try {
      return await upstashClient.get(key);
    } catch (err) {
      logger.warn("Redis GET failed:", (err as Error).message);
      return null;
    }
  },

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!upstashClient) return;
    try {
      if (ttlSeconds) {
        await upstashClient.set(key, value, { ex: ttlSeconds });
      } else {
        await upstashClient.set(key, value);
      }
    } catch (err) {
      logger.warn("Redis SET failed:", (err as Error).message);
    }
  },

  async del(key: string): Promise<void> {
    if (!upstashClient) return;
    try {
      await upstashClient.del(key);
    } catch (err) {
      logger.warn("Redis DEL failed:", (err as Error).message);
    }
  },

  async exists(key: string): Promise<boolean> {
    if (!upstashClient) return true; // Allow through when no Redis
    try {
      const result = await upstashClient.exists(key);
      return result === 1;
    } catch (err) {
      logger.warn("Redis EXISTS failed:", (err as Error).message);
      return true; // Fail open — allow request through
    }
  },

  async incr(key: string): Promise<number> {
    if (!upstashClient) return 0;
    try {
      return await upstashClient.incr(key);
    } catch (err) {
      logger.warn("Redis INCR failed:", (err as Error).message);
      return 0;
    }
  },

  async expire(key: string, ttlSeconds: number): Promise<void> {
    if (!upstashClient) return;
    try {
      await upstashClient.expire(key, ttlSeconds);
    } catch (err) {
      logger.warn("Redis EXPIRE failed:", (err as Error).message);
    }
  },
};
