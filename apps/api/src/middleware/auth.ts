import { Request, Response, NextFunction } from "express";
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
 * Authentication middleware — Dummy mode (no JWT).
 *
 * Reads user ID from `x-user-id` header and looks up user in DB.
 * This is a simple passthrough for development.
 *
 * TODO: Re-enable JWT verification when ready:
 * 1. Read Bearer token from Authorization header
 * 2. Verify JWT signature
 * 3. Check Redis session
 * 4. Attach user to request
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Read user ID from header
    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      throw ApiError.unauthorized("No user ID provided. Please log in.");
    }

    // Look up user in DB
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw ApiError.unauthorized("User not found.");
    }

    req.user = user;
    req.userId = userId;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional auth — doesn't throw if no user ID, but attaches user if valid.
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
      return next();
    }

    const user = await User.findById(userId).select("-password");
    if (user) {
      req.user = user;
      req.userId = userId;
    }
  } catch {
    // Silently continue without auth
  }
  next();
};
