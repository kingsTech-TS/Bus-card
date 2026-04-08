import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import Cookies from "js-cookie";

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,

      setAuth: (user, accessToken) => {
        // Also set a short-lived cookie for Next.js middleware to read
        Cookies.set("auth_token", accessToken, {
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          expires: 1, // 1 day (the real expiry is enforced server-side)
        });
        set({ user, accessToken });
      },

      setAccessToken: (token) => {
        Cookies.set("auth_token", token, {
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          expires: 1,
        });
        set({ accessToken: token });
      },

      clearAuth: () => {
        Cookies.remove("auth_token");
        set({ user: null, accessToken: null });
      },
    }),
    {
      name: "buscard-auth",
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
    }
  )
);
