import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: (origin?: { x: number; y: number }) => void;
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> };
};

const THEME_KEY = 'theme';
const DEFAULT_THEME: ThemeMode = 'dark';
const initialTheme = (localStorage.getItem(THEME_KEY) as ThemeMode) ?? DEFAULT_THEME;

document.documentElement.dataset.theme = initialTheme;

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initialTheme,

  setTheme: (theme) => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
    set({ theme });
  },

  toggleTheme: (origin) => {
    const next: ThemeMode = useThemeStore.getState().theme === 'dark' ? 'light' : 'dark';
    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const transitionDocument = document as ViewTransitionDocument;

    const applyTheme = () => {
      root.dataset.theme = next;
      localStorage.setItem(THEME_KEY, next);
      set({ theme: next });
    };

    if (!origin || reduceMotion || !transitionDocument.startViewTransition) {
      applyTheme();
      return;
    }

    root.style.setProperty('--theme-origin-x', `${origin.x}px`);
    root.style.setProperty('--theme-origin-y', `${origin.y}px`);
    const transition = transitionDocument.startViewTransition(applyTheme);
    const clearOrigin = () => {
      root.style.removeProperty('--theme-origin-x');
      root.style.removeProperty('--theme-origin-y');
    };
    void transition.finished.then(clearOrigin, clearOrigin);
  },
}));
