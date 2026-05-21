import { Request, Response } from "express";
import { User } from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { cleanObject } from "../utils/helpers";

/**
 * User Controller — handles profile operations.
 */
export class UserController {
  /**
   * GET /api/users/profile
   * Get current user's profile.
   */
  static getProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.userId);
    if (!user) {
      throw ApiError.notFound("User not found.");
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  });

  /**
   * PUT /api/users/profile
   * Update current user's profile.
   */
  static updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const { firstName, lastName, phone, specialization, bio, avatar } = req.body;

    // Build update object (only non-null fields)
    const updates = cleanObject({
      firstName,
      lastName,
      phone,
      specialization,
      bio,
      avatar,
    });

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw ApiError.notFound("User not found.");
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: user,
    });
  });
}
