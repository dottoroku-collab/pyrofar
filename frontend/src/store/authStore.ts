import { create } from "zustand";
import type { UserPublic } from "@/types/auth";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserPublic | null;
  setSession: (accessToken: string, refreshToken: string, user: UserPublic) => void;
  logout: () => void;
}

const STORAGE_KEY = "sim-armada-auth";

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { accessToken: null, refreshToken: null, user: null };
    return JSON.parse(raw);
  } catch {
    return { accessToken: null, refreshToken: null, user: null };
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  ...loadInitial(),
  setSession: (accessToken, refreshToken, user) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken, refreshToken, user }));
    set({ accessToken, refreshToken, user });
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ accessToken: null, refreshToken: null, user: null });
  },
}));
