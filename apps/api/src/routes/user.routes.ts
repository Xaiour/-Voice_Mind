import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { z } from "zod";

const router = Router();

// ─── Validation Schemas ─────────────────────────────────────
const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().max(20).optional(),
  specialization: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
});

// ─── Routes (all protected) ─────────────────────────────────
router.get("/profile", authenticate, UserController.getProfile);
router.put(
  "/profile",
  authenticate,
  validate({ body: updateProfileSchema }),
  UserController.updateProfile
);

export default router;
