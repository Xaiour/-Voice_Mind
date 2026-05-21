import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar?: string;
  specialization?: string;
  bio?: string;
}

interface AuthState {
  user: User | null;
  userId: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  // Actions
  setUser: (user: User) => void;
  login: (user: User, userId: string) => void;
  logout: () => void;
  setHydrated: () => void;
}

/**
 * Auth Store — Dummy auth mode (no JWT tokens).
 *
 * Stores userId + user object in localStorage via Zustand persist.
 * The userId is sent as `x-user-id` header on API requests.
 *
 * TODO: When re-enabling JWT, add back:
 * - accessToken: string | null
 * - refreshToken: string | null
 * - setTokens(accessToken, refreshToken)
 * - Update login() to accept tokens
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      userId: null,
      isAuthenticated: false,
      isHydrated: false,

      setUser: (user) => set({ user }),

      login: (user, userId) =>
        set({
          user,
          userId,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          userId: null,
          isAuthenticated: false,
        }),

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "voicemind-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
