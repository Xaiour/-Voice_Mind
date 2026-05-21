import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/**
 * Centralized Axios instance for all API calls.
 *
 * Dummy auth mode:
 * - Sends `x-user-id` header instead of Bearer token
 * - No token refresh logic
 *
 * TODO: When re-enabling JWT:
 * - Change header back to Authorization: Bearer <token>
 * - Restore 401 interceptor with token refresh
 */
export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor: Attach User ID ────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userId = useAuthStore.getState().userId;
    if (userId) {
      config.headers["x-user-id"] = userId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: Handle Errors ────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 — user not found or invalid
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
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
