import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: (localStorage.getItem('app-theme') as Theme) || 'dark',
  setTheme: (theme) => {
    localStorage.setItem('app-theme', theme);
    set({ theme });
  },
}));
