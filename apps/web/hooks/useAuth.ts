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
 * Authentication hook — handles login, register, logout.
 * Connects to the Zustand auth store and API client.
 */
export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const { login: storeLogin, logout: storeLogout, user } = useAuthStore();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      const { user, accessToken, refreshToken } = data.data;
      storeLogin(user, accessToken, refreshToken);
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (formData: RegisterData) => {
    setIsLoading(true);
    try {
      const { data } = await api.post("/auth/register", formData);
      const { user, accessToken, refreshToken } = data.data;
      storeLogin(user, accessToken, refreshToken);
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
