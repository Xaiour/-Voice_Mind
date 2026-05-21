import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { env } from "./env";

// ─── Storage Configuration ──────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, env.UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// ─── File Filter (Audio only) ───────────────────────────────
const audioFileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = [
    "audio/wav",
    "audio/mpeg",
    "audio/mp3",
    "audio/ogg",
    "audio/webm",
    "audio/x-wav",
    "audio/wave",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only audio files are allowed.`));
  }
};

// ─── Upload Middleware ──────────────────────────────────────
export const uploadAudio = multer({
  storage,
  fileFilter: audioFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
    files: 1, // Single file at a time
  },
});
