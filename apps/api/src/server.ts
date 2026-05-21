import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import { corsMiddleware } from "./middleware/cors";
import { rateLimiter } from "./middleware/rateLimiter";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { logger } from "./utils/logger";
import routes from "./routes";

// ─── Create Express App ─────────────────────────────────────
const app = express();

// ─── Global Middleware ──────────────────────────────────────
app.use(helmet()); // Security headers
app.use(corsMiddleware); // CORS
app.use(morgan("dev")); // Request logging
app.use(express.json({ limit: "10mb" })); // JSON body parser
app.use(express.urlencoded({ extended: true })); // URL-encoded parser
app.use(rateLimiter()); // Global rate limiting (100 req/15min)

// ─── Static Files (uploads) ────────────────────────────────
app.use("/uploads", express.static(env.UPLOAD_DIR));

// ─── API Routes ─────────────────────────────────────────────
app.use("/api", routes);

// ─── Error Handling ─────────────────────────────────────────
app.use(notFoundHandler); // 404 catch-all
app.use(errorHandler); // Global error handler

// ─── Start Server ───────────────────────────────────────────
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    app.listen(env.PORT, () => {
      logger.info(`
╔══════════════════════════════════════════════╗
║                                              ║
║   🧠 VoiceMind API Server                   ║
║                                              ║
║   Port:    ${env.PORT}                           ║
║   Env:     ${env.NODE_ENV.padEnd(26)}║
║   MongoDB: Connected                         ║
║   Redis:   Ready                             ║
║                                              ║
║   Routes:                                    ║
║   POST /api/auth/register                    ║
║   POST /api/auth/login                       ║
║   POST /api/auth/logout                      ║
║   GET  /api/users/profile                    ║
║   PUT  /api/users/profile                    ║
║   POST /api/voice/upload                     ║
║   POST /api/voice/analyze                    ║
║   GET  /api/voice/history                    ║
║   POST /api/ai/chat                          ║
║   GET  /api/health                           ║
║                                              ║
╚══════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
