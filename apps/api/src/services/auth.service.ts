import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { User, IUser } from "../models/User";
import { redis } from "../config/redis";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

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
   */
  static async register(input: RegisterInput): Promise<{ user: IUser; tokens: TokenPair }> {
    const { firstName, lastName, email, password, role } = input;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.conflict("An account with this email already exists.");
    }

    // Create user (password hashed via pre-save hook)
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || "therapist",
    });

    // Generate tokens and create session
    const tokens = await this.generateTokens(user._id.toString());

    // Remove password from response
    const userResponse = user.toObject();
    delete (userResponse as any).password;

    return { user: userResponse as IUser, tokens };
  }

  /**
   * Login an existing user.
   */
  static async login(input: LoginInput): Promise<{ user: IUser; tokens: TokenPair }> {
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

    // Generate tokens and create session
    const tokens = await this.generateTokens(user._id.toString());

    // Remove password from response
    const userResponse = user.toObject();
    delete (userResponse as any).password;

    return { user: userResponse as IUser, tokens };
  }

  /**
   * Logout — destroy Redis session.
   */
  static async logout(userId: string): Promise<void> {
    const sessionKey = `session:${userId}`;
    await redis.del(sessionKey);
  }

  /**
   * Refresh access token using refresh token.
   */
  static async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      const decoded: any = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
      const userId = decoded.userId;

      // Check session still exists
      const sessionExists = await redis.exists(`session:${userId}`);
      if (!sessionExists) {
        throw ApiError.unauthorized("Session expired. Please log in again.");
      }

      // Generate new token pair
      return this.generateTokens(userId);
    } catch (error) {
      throw ApiError.unauthorized("Invalid refresh token.");
    }
  }

  /**
   * Generate JWT access and refresh tokens + store session in Redis.
   */
  private static async generateTokens(userId: string): Promise<TokenPair> {
    const tokenId = uuidv4();

    // Access token (short-lived)
    const accessToken = jwt.sign(
      { userId, tokenId, type: "access" },
      env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Refresh token (long-lived)
    const refreshToken = jwt.sign(
      { userId, tokenId, type: "refresh" },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
    );

    // Store session in Redis with TTL
    const sessionKey = `session:${userId}`;
    await redis.set(
      sessionKey,
      JSON.stringify({ tokenId, createdAt: Date.now() }),
      env.SESSION_TTL
    );

    return { accessToken, refreshToken };
  }
}
