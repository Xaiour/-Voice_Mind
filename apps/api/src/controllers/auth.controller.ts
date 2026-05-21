import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";

/**
 * Auth Controller — Dummy auth mode (no JWT tokens).
 *
 * Returns userId instead of tokens. Frontend stores userId
 * and sends it via x-user-id header on subsequent requests.
 *
 * TODO: When re-enabling JWT, return { user, accessToken, refreshToken }
 */
export class AuthController {
  /**
   * POST /api/auth/register
   * Create a new user account.
   */
  static register = asyncHandler(async (req: Request, res: Response) => {
    const { firstName, lastName, email, password, role } = req.body;

    const { user, userId } = await AuthService.register({
      firstName,
      lastName,
      email,
      password,
      role,
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: {
        user,
        userId,
      },
    });
  });

  /**
   * POST /api/auth/login
   * Authenticate user and return user data.
   */
  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const { user, userId } = await AuthService.login({ email, password });

    res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        user,
        userId,
      },
    });
  });

  /**
   * POST /api/auth/logout
   * No-op for dummy auth.
   */
  static logout = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId || req.headers["x-user-id"] as string;
    if (userId) {
      await AuthService.logout(userId);
    }

    res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  });

  /**
   * POST /api/auth/refresh
   * No-op for dummy auth — just returns success.
   * TODO: Implement token refresh when JWT is re-enabled.
   */
  static refresh = asyncHandler(async (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: "No token refresh needed in dummy auth mode.",
      data: {},
    });
  });
}
