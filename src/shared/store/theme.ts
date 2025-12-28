export type ThemeMode = 'light' | 'dark';

const THEME_KEY = 'theme';
const DEFAULT_THEME: ThemeMode = 'dark';

export function getTheme(): ThemeMode {
  return (localStorage.getItem(THEME_KEY) as ThemeMode) ?? DEFAULT_THEME;
}

export function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
}

export function toggleTheme() {
  const current = getTheme();
  const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
}
