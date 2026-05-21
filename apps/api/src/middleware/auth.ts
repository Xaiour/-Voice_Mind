import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { redis } from "../config/redis";
import { ApiError } from "../utils/ApiError";
import { User } from "../models/User";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: any;
      userId?: string;
    }
  }
}

/**
 * Authentication middleware.
 * Verifies JWT token from Authorization header and checks Redis session.
 *
 * Flow:
 * 1. Extract Bearer token from header
 * 2. Verify JWT signature
 * 3. Check if session exists in Redis (not revoked)
 * 4. Attach user to request object
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Extract token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized("No token provided. Please log in.");
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify JWT
    let decoded: any;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        throw ApiError.unauthorized("Token expired. Please refresh.");
      }
      throw ApiError.unauthorized("Invalid token.");
    }

    // 3. Check Redis session (ensures token hasn't been revoked)
    const sessionKey = `session:${decoded.userId}`;
    const sessionExists = await redis.exists(sessionKey);

    if (!sessionExists) {
      throw ApiError.unauthorized("Session expired. Please log in again.");
    }

    // 4. Attach user info to request
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      throw ApiError.unauthorized("User no longer exists.");
    }

    req.user = user;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional auth — doesn't throw if no token, but attaches user if valid.
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (user) {
      req.user = user;
      req.userId = decoded.userId;
    }
  } catch {
    // Silently continue without auth
  }
  next();
};
