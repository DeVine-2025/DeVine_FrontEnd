import { createContext, useContext } from 'react';

export type LaunchTheme = 'dark' | 'light' | 'system';
export const LaunchThemeContext = createContext<{ theme: LaunchTheme; setTheme: (theme: LaunchTheme) => void }>({ theme: 'dark', setTheme: () => {} });
export const useLaunchTheme = () => useContext(LaunchThemeContext);
