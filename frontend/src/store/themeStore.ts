/**
 * DAMKAR CLOUD PLATFORM — Theme Store
 *
 * Persists the user's light/dark mode preference.
 * Consumed by App.tsx and any component that needs to react to theme changes.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { lightTokens, darkTokens, type ThemeTokens } from '@/theme/tokens';

type ThemeMode = 'light' | 'dark';

interface ThemeState {
  isSidebarHidden: boolean;
  toggleSidebarHidden: () => void;
  mode: ThemeMode;
  tokens: ThemeTokens;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'light',
      isSidebarHidden: false,
      tokens: lightTokens,

      toggleSidebarHidden: () =>
        set((state) => ({ isSidebarHidden: !state.isSidebarHidden })),

      toggleTheme: () =>
        set((state) => {
          const nextMode = state.mode === 'light' ? 'dark' : 'light';
          return {
            mode: nextMode,
            tokens: nextMode === 'dark' ? darkTokens : lightTokens,
          };
        }),

      setTheme: (mode: ThemeMode) =>
        set({
          mode,
          tokens: mode === 'dark' ? darkTokens : lightTokens,
        }),
    }),
    {
      name: 'damkar-theme',
      partialize: (state) => ({ mode: state.mode }),
      onRehydrateStorage: () => (state) => {
        // Rehydrate the tokens object from the persisted mode
        if (state) {
          state.tokens = state.mode === 'dark' ? darkTokens : lightTokens;
        }
      },
    }
  )
);

/** Convenience hook for components that only need the current tokens */
export function useTokens(): ThemeTokens {
  return useThemeStore((s) => s.tokens);
}
