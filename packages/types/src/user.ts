export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "therapist" | "admin" | "patient";
  avatar?: string;
  phone?: string;
  specialization?: string;
  bio?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: "therapist" | "admin" | "patient";
}
