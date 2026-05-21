import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/**
 * Centralized Axios instance for all API calls.
 *
 * Features:
 * - Auto-attaches JWT from Zustand store
 * - Handles 401 → automatic token refresh
 * - Handles 403, 500 → error formatting
 * - Type-safe response handling
 */
export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor: Attach JWT ────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: Handle Errors ────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 — try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          // Update tokens in store
          useAuthStore.getState().setTokens(
            data.data.accessToken,
            data.data.refreshToken
          );

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(originalRequest);
        } catch {
          // Refresh failed — logout
          useAuthStore.getState().logout();
          window.location.href = "/login";
        }
      } else {
        useAuthStore.getState().logout();
        window.location.href = "/login";
      }
    }

    // Format error message
    const message =
      error.response?.data?.error?.message ||
      error.message ||
      "Something went wrong";

    return Promise.reject(new Error(message));
  }
);

/**
 * Upload helper for multipart/form-data requests.
 */
export const uploadFile = async (endpoint: string, file: File, data?: Record<string, string>) => {
  const formData = new FormData();
  formData.append("audio", file);

  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }

  return api.post(endpoint, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000, // Longer timeout for file uploads
  });
};
