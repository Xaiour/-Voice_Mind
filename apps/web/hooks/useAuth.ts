import { useState } from "react";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/**
 * Authentication hook — Dummy auth mode.
 *
 * Handles login, register, logout.
 * Stores userId (no tokens) via Zustand auth store.
 *
 * TODO: When re-enabling JWT, update to extract accessToken/refreshToken
 * from API response and pass them to storeLogin().
 */
export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const { login: storeLogin, logout: storeLogout, user } = useAuthStore();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      const { user, userId } = data.data;
      storeLogin(user, userId);
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (formData: RegisterData) => {
    setIsLoading(true);
    try {
      const { data } = await api.post("/auth/register", formData);
      const { user, userId } = data.data;
      storeLogin(user, userId);
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Logout even if API call fails
    } finally {
      storeLogout();
    }
  };

  return { login, register, logout, isLoading, user };
}
