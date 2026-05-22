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

  // Google Gemini (free alternative - no card needed)
  AI_PROVIDER: process.env.AI_PROVIDER || "openai",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-2.0-flash",

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
const provider = env.AI_PROVIDER || "openai";

if (provider === "openai") {
  if (!env.OPENAI_API_KEY) {
    warnings.push(
      "OPENAI_API_KEY is not set! AI Chat and voice analysis insights will NOT work.\n" +
      "  → Get your key from: https://platform.openai.com/api-keys\n" +
      "  → Set OPENAI_API_KEY=sk-... in your .env file"
    );
  } else if (!env.OPENAI_API_KEY.startsWith("sk-")) {
    warnings.push(
      `OPENAI_API_KEY looks invalid (doesn't start with "sk-"). Current value starts with: "${env.OPENAI_API_KEY.slice(0, 8)}..."\n` +
      "  → Make sure you copied the full key from https://platform.openai.com/api-keys"
    );
  } else {
    console.log(`✓ AI configured — provider: OpenAI, model: ${env.OPENAI_MODEL}, key: ${env.OPENAI_API_KEY.slice(0, 8)}...${env.OPENAI_API_KEY.slice(-4)}`);
  }
} else {
  if (!env.GEMINI_API_KEY) {
    warnings.push(
      "GEMINI_API_KEY is not set! AI Chat will NOT work.\n" +
      "  → Get a FREE key from: https://aistudio.google.com/app/apikey\n" +
      "  → Set GEMINI_API_KEY=AIzaSy... in your .env file"
    );
  } else {
    console.log(`✓ AI configured — provider: Gemini, model: ${env.GEMINI_MODEL}, key: ${env.GEMINI_API_KEY.slice(0, 8)}...`);
  }
}

if (warnings.length > 0) {
  console.warn("\n╔══════════════════════════════════════════════════════════╗");
  console.warn("║  ⚠️  VoiceMind Environment Warnings                      ║");
  console.warn("╚══════════════════════════════════════════════════════════╝");
  warnings.forEach((w) => console.warn(`\n⚠️  ${w}`));
  console.warn("");
}
