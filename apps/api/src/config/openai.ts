import OpenAI from "openai";
import { env } from "./env";

// ─── AI Provider Configuration ──────────────────────────────
// Supports both OpenAI (default) and Google Gemini (free fallback)
// Set AI_PROVIDER=openai in .env to use OpenAI (default)
// Set AI_PROVIDER=gemini to use Gemini (free, no card needed)

const provider = env.AI_PROVIDER || "openai";

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
