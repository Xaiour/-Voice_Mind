import { Request, Response, NextFunction } from "express";
import { redis } from "../config/redis";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

/**
 * Redis-based rate limiter using sliding window algorithm.
 * Tracks requests per IP address within a configurable time window.
 *
 * Default: 100 requests per 15 minutes
 */
export const rateLimiter = (
  maxRequests: number = env.RATE_LIMIT_MAX,
  windowSeconds: number = env.RATE_LIMIT_WINDOW
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const identifier = req.userId || req.ip || "unknown";
      const key = `ratelimit:${identifier}`;

      const current = await redis.incr(key);

      // Set expiry on first request in window
      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }

      // Set rate limit headers
      res.setHeader("X-RateLimit-Limit", maxRequests);
      res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - current));

      if (current > maxRequests) {
        throw ApiError.tooManyRequests(
          "Too many requests. Please try again later."
        );
      }

      next();
    } catch (error) {
      if (error instanceof ApiError) {
        return next(error);
      }
      // If Redis is down, allow request through (fail open)
      next();
    }
  };
};
