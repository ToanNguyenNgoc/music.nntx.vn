import { useEffect } from 'react';
import { useThemeStore } from '../store/useThemeStore';

export const useThemeInit = () => {
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = (t: 'light' | 'dark') => {
      root.classList.remove('light', 'dark');
      root.classList.add(t);
    };

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      applyTheme(systemTheme);

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      applyTheme(theme);
    }
  }, [theme]);
};
