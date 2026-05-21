import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";

/**
 * Auth Controller — handles registration, login, logout, and token refresh.
 */
export class AuthController {
  /**
   * POST /api/auth/register
   * Create a new user account.
   */
  static register = asyncHandler(async (req: Request, res: Response) => {
    const { firstName, lastName, email, password, role } = req.body;

    const { user, tokens } = await AuthService.register({
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
        ...tokens,
      },
    });
  });

  /**
   * POST /api/auth/login
   * Authenticate user and return tokens.
   */
  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const { user, tokens } = await AuthService.login({ email, password });

    res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        user,
        ...tokens,
      },
    });
  });

  /**
   * POST /api/auth/logout
   * Invalidate current session.
   */
  static logout = asyncHandler(async (req: Request, res: Response) => {
    await AuthService.logout(req.userId!);

    res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  });

  /**
   * POST /api/auth/refresh
   * Get new access token using refresh token.
   */
  static refresh = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    const tokens = await AuthService.refreshToken(refreshToken);

    res.status(200).json({
      success: true,
      data: tokens,
    });
  });
}
