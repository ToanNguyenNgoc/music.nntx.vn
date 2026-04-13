import React, { useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { motion, AnimatePresence } from 'motion/react';

export const ThemeToggle = () => {
  const { theme, setTheme } = useThemeStore();

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

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  const getIcon = () => {
    if (theme === 'dark') return <Moon size={18} />;
    if (theme === 'light') return <Sun size={18} />;
    return <Monitor size={18} />;
  };

  const getLabel = () => {
    if (theme === 'dark') return 'Dark Mode';
    if (theme === 'light') return 'Light Mode';
    return 'System';
  };

  return (
    <button
      onClick={cycleTheme}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 dark:bg-white/10 hover:bg-black/30 dark:hover:bg-white/20 transition-colors text-app-text"
      title={`Switch theme (Current: ${getLabel()})`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {getIcon()}
        </motion.div>
      </AnimatePresence>
      <span className="text-xs font-bold hidden sm:inline">{getLabel()}</span>
    </button>
  );
};
