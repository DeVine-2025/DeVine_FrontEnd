import { create } from 'zustand';
import { revealTheme } from '../libs/theme-transition';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  theme: ThemeMode;
  transitioning: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: (origin?: { x: number; y: number }) => void;
}

const THEME_KEY = 'theme';
const DEFAULT_THEME: ThemeMode = 'dark';
const initialTheme: ThemeMode = DEFAULT_THEME;

document.documentElement.dataset.theme = initialTheme;
localStorage.setItem(THEME_KEY, initialTheme);

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initialTheme,
  transitioning: false,

  setTheme: (theme) => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
    set({ theme });
  },

  toggleTheme: async () => {
    if (useThemeStore.getState().transitioning) return;
    const next: ThemeMode = useThemeStore.getState().theme === 'dark' ? 'light' : 'dark';
    const root = document.documentElement;

    const applyTheme = () => {
      root.dataset.theme = next;
      localStorage.setItem(THEME_KEY, next);
      set({ theme: next });
    };

    set({ transitioning: true });
    try {
      await revealTheme(applyTheme);
    } finally {
      set({ transitioning: false });
    }
  },
}));
