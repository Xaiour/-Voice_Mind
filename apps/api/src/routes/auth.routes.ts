import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { z } from "zod";

const router = Router();

// ─── Validation Schemas ─────────────────────────────────────
const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["therapist", "admin", "patient"]).optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

// ─── Routes ─────────────────────────────────────────────────
router.post("/register", validate({ body: registerSchema }), AuthController.register);
router.post("/login", validate({ body: loginSchema }), AuthController.login);
router.post("/logout", authenticate, AuthController.logout);
router.post("/refresh", validate({ body: refreshSchema }), AuthController.refresh);

export default router;
