import dotenv from "dotenv";
dotenv.config();

export const env = {
  // App
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "8000"),
  APP_URL: process.env.APP_URL || "http://localhost:3000",

  // MongoDB
  MONGODB_URI:
    process.env.MONGODB_URI || "mongodb://localhost:27017/voicemind",

  // Redis (Upstash)
  REDIS_URL: process.env.REDIS_URL || "",
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL || "",
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN || "",

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "change-me-in-production",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET || "refresh-secret-change-me",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",

  // OpenAI
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-4o",

  // Python Voice Service
  VOICE_SERVICE_URL: process.env.VOICE_SERVICE_URL || "http://localhost:8001",

  // File Uploads
  UPLOAD_DIR: process.env.UPLOAD_DIR || "./uploads",
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || "50mb",

  // Rate Limiting
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || "900"), // 15 min
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || "100"),

  // Session
  SESSION_TTL: parseInt(process.env.SESSION_TTL || "86400"), // 24 hours
};

// ─── Startup Validation ─────────────────────────────────────
const warnings: string[] = [];

if (!env.OPENAI_API_KEY) {
  warnings.push(
    "OPENAI_API_KEY is not set! AI Chat and voice analysis insights will NOT work.\n" +
    "  → Set it in your .env file at the project root, then run: docker compose up -d --build"
  );
} else if (!env.OPENAI_API_KEY.startsWith("sk-")) {
  warnings.push(
    `OPENAI_API_KEY looks invalid (doesn't start with "sk-"). Current value starts with: "${env.OPENAI_API_KEY.slice(0, 8)}..."\n` +
    "  → Make sure you copied the full key from https://platform.openai.com/api-keys"
  );
} else {
  console.log(`✓ OpenAI configured — model: ${env.OPENAI_MODEL}, key: ${env.OPENAI_API_KEY.slice(0, 8)}...${env.OPENAI_API_KEY.slice(-4)}`);
}

if (warnings.length > 0) {
  console.warn("\n╔══════════════════════════════════════════════════════════╗");
  console.warn("║  ⚠️  VoiceMind Environment Warnings                      ║");
  console.warn("╚══════════════════════════════════════════════════════════╝");
  warnings.forEach((w) => console.warn(`\n⚠️  ${w}`));
  console.warn("");
}
