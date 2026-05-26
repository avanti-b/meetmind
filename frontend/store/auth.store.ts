"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { clearTokens } from "@/lib/api/client";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (user: User, access_token: string, refresh_token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setAuth: (user, access_token, refresh_token) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", access_token);
          localStorage.setItem("refresh_token", refresh_token);
        }
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        clearTokens();
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "meetmind-auth",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
