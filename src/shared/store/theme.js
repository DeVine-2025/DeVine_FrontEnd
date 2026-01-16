import { create } from 'zustand';
const THEME_KEY = 'theme';
const DEFAULT_THEME = 'dark';
export const useThemeStore = create((set) => {
    var _a;
    return ({
        theme: (_a = localStorage.getItem(THEME_KEY)) !== null && _a !== void 0 ? _a : DEFAULT_THEME,
        setTheme: (theme) => {
            document.documentElement.dataset.theme = theme;
            localStorage.setItem(THEME_KEY, theme);
            set({ theme });
        },
        toggleTheme: () => set((state) => {
            const next = state.theme === 'dark' ? 'light' : 'dark';
            document.documentElement.dataset.theme = next;
            localStorage.setItem(THEME_KEY, next);
            return { theme: next };
        }),
    });
});
