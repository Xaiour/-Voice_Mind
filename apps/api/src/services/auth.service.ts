/**
 * Auth Service — Dummy auth (no JWT).
 *
 * Users are stored in MongoDB with hashed passwords.
 * On login/register, we just return the user object + userId.
 * No tokens, no Redis sessions.
 *
 * TODO: Re-enable JWT auth later by restoring token generation here.
 */

import { User, IUser } from "../models/User";
import { ApiError } from "../utils/ApiError";

interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  /**
   * Register a new user.
   * Saves to DB with hashed password, returns user object.
   */
  static async register(input: RegisterInput): Promise<{ user: IUser; userId: string }> {
    const { firstName, lastName, email, password, role } = input;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.conflict("An account with this email already exists.");
    }

    // Create user (password hashed via pre-save hook in User model)
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || "therapist",
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete (userResponse as any).password;

    return { user: userResponse as IUser, userId: user._id.toString() };
  }

  /**
   * Login an existing user.
   * Checks email + password against DB, returns user object.
   */
  static async login(input: LoginInput): Promise<{ user: IUser; userId: string }> {
    const { email, password } = input;

    // Find user with password field
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw ApiError.unauthorized("Invalid email or password.");
    }

    // Check if account is active
    if (!user.isActive) {
      throw ApiError.forbidden("Account has been deactivated.");
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized("Invalid email or password.");
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete (userResponse as any).password;

    return { user: userResponse as IUser, userId: user._id.toString() };
  }

  /**
   * Logout — no-op for dummy auth.
   * TODO: Clear Redis session when JWT is re-enabled.
   */
  static async logout(_userId: string): Promise<void> {
    // No-op — no sessions to destroy in dummy auth mode
  }
}
