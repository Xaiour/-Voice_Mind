/**
 * Shared constants used across VoiceMind services.
 */

export const APP_NAME = "VoiceMind";
export const APP_VERSION = "1.0.0";

// Audio constraints
export const AUDIO = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_MIME_TYPES: [
    "audio/wav",
    "audio/mpeg",
    "audio/mp3",
    "audio/ogg",
    "audio/webm",
    "audio/x-wav",
  ],
  MAX_DURATION: 3600, // 1 hour in seconds
} as const;

// Analysis
export const ANALYSIS = {
  SENTIMENT_MIN: 1,
  SENTIMENT_MAX: 10,
  RISK_LEVELS: ["low", "moderate", "high", "critical"] as const,
  EMOTIONS: [
    "happy",
    "sad",
    "angry",
    "fearful",
    "neutral",
    "surprised",
    "disgusted",
  ] as const,
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// Cache TTL (seconds)
export const CACHE = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 86400, // 24 hours
} as const;
