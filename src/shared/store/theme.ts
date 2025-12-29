import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const THEME_KEY = 'theme';
const DEFAULT_THEME: ThemeMode = 'dark';

export const useThemeStore = create<ThemeState>((set) => ({
  theme: (localStorage.getItem(THEME_KEY) as ThemeMode) ?? DEFAULT_THEME,

  setTheme: (theme) => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
    set({ theme });
  },

  toggleTheme: () =>
    set((state) => {
      const next: ThemeMode = state.theme === 'dark' ? 'light' : 'dark';

      document.documentElement.dataset.theme = next;
      localStorage.setItem(THEME_KEY, next);

      return { theme: next };
    }),
}));
