import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';

export function useTheme() {
  const [theme, setThemeStorage] = useLocalStorage('clipboard-helper-theme', 'light');
  const [mounted, setMounted] = useState(typeof window !== 'undefined');
  const initialMountRef = useRef(false);

  // Update document class when theme changes
  useEffect(() => {
    if (!initialMountRef.current) {
      initialMountRef.current = true;
      setMounted(true);
    }
    const root = window.document.documentElement;
    
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeStorage(prev => prev === 'light' ? 'dark' : 'light');
  }, [setThemeStorage]);

  const setTheme = useCallback((newTheme) => {
    setThemeStorage(newTheme);
  }, [setThemeStorage]);

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    mounted
  };
}

export default useTheme;
