import OpenAI from "openai";
import { env } from "./env";

// ─── AI Provider Configuration ──────────────────────────────
// Supports both OpenAI and Google Gemini (free, no card needed)
// Set AI_PROVIDER=gemini in .env to use Gemini (default for free deployment)
// Set AI_PROVIDER=openai to use OpenAI (requires billing)

const provider = env.AI_PROVIDER || "gemini";

const config =
  provider === "gemini"
    ? {
        apiKey: env.GEMINI_API_KEY || env.OPENAI_API_KEY,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      }
    : {
        apiKey: env.OPENAI_API_KEY,
      };

export const openai = new OpenAI(config);

export const OPENAI_MODEL =
  provider === "gemini"
    ? env.GEMINI_MODEL || "gemini-2.0-flash"
    : env.OPENAI_MODEL;
