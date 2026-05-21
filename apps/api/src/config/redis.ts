import { Redis } from "@upstash/redis";
import IORedis from "ioredis";
import { env } from "./env";
import { logger } from "../utils/logger";

// ─── Upstash Redis (Production - REST-based) ────────────────
let upstashClient: Redis | null = null;

if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
  upstashClient = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
  logger.info("Upstash Redis client initialized");
}

// ─── IORedis (Local development - TCP-based) ────────────────
let ioRedisClient: IORedis | null = null;

if (env.REDIS_URL && !upstashClient) {
  ioRedisClient = new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  ioRedisClient.on("connect", () => {
    logger.info("IORedis connected");
  });

  ioRedisClient.on("error", (err) => {
    logger.error("IORedis error:", err.message);
  });
}

// ─── Unified Redis Service ──────────────────────────────────
export const redis = {
  async get(key: string): Promise<string | null> {
    if (upstashClient) {
      return upstashClient.get(key);
    }
    if (ioRedisClient) {
      return ioRedisClient.get(key);
    }
    return null;
  },

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (upstashClient) {
      if (ttlSeconds) {
        await upstashClient.set(key, value, { ex: ttlSeconds });
      } else {
        await upstashClient.set(key, value);
      }
      return;
    }
    if (ioRedisClient) {
      if (ttlSeconds) {
        await ioRedisClient.set(key, value, "EX", ttlSeconds);
      } else {
        await ioRedisClient.set(key, value);
      }
    }
  },

  async del(key: string): Promise<void> {
    if (upstashClient) {
      await upstashClient.del(key);
      return;
    }
    if (ioRedisClient) {
      await ioRedisClient.del(key);
    }
  },

  async exists(key: string): Promise<boolean> {
    if (upstashClient) {
      const result = await upstashClient.exists(key);
      return result === 1;
    }
    if (ioRedisClient) {
      const result = await ioRedisClient.exists(key);
      return result === 1;
    }
    return false;
  },

  async incr(key: string): Promise<number> {
    if (upstashClient) {
      return upstashClient.incr(key);
    }
    if (ioRedisClient) {
      return ioRedisClient.incr(key);
    }
    return 0;
  },

  async expire(key: string, ttlSeconds: number): Promise<void> {
    if (upstashClient) {
      await upstashClient.expire(key, ttlSeconds);
      return;
    }
    if (ioRedisClient) {
      await ioRedisClient.expire(key, ttlSeconds);
    }
  },
};
