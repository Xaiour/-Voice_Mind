import cors from "cors";
import { env } from "../config/env";

/**
 * CORS configuration.
 * In production, restrict to specific origins.
 * In development, allow localhost.
 */
const allowedOrigins =
  env.NODE_ENV === "production"
    ? [env.APP_URL]
    : ["http://localhost:3000", "http://localhost:3001", env.APP_URL];

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["X-RateLimit-Limit", "X-RateLimit-Remaining"],
});
