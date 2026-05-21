import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";
import { env } from "../config/env";

/**
 * Global error handler middleware.
 * Catches all errors and returns consistent JSON error responses.
 *
 * In development: includes stack trace
 * In production: hides internal error details
 */
export const errorHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Default error values
  let statusCode = 500;
  let message = "Internal Server Error";
  let isOperational = false;

  // Handle known ApiError instances
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = err.message;
    isOperational = true;
  }

  // Handle Mongoose duplicate key errors
  if ((err as any).code === 11000) {
    statusCode = 409;
    message = "A record with that value already exists.";
    isOperational = true;
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token.";
    isOperational = true;
  }

  // Handle Multer errors
  if (err.name === "MulterError") {
    statusCode = 400;
    message = `File upload error: ${err.message}`;
    isOperational = true;
  }

  // Log error
  if (!isOperational) {
    logger.error("Unhandled Error:", err);
  } else {
    logger.warn(`Operational Error [${statusCode}]: ${message}`);
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(env.NODE_ENV === "development" && {
        stack: err.stack,
      }),
    },
  });
};

/**
 * 404 Not Found handler — catches unmatched routes.
 */
export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};
