import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

interface UseThemeReturn {
  theme: Theme;
  toggleTheme: () => void;
  systemTheme: Theme;
  setTheme: (theme: Theme) => void;
}

/**
 * Custom hook for managing light/dark theme with localStorage persistence
 * and system preference detection
 */
export function useTheme(): UseThemeReturn {
  // Get system theme preference
  const getSystemTheme = (): Theme => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Get stored theme or fall back to system preference
  const getStoredTheme = (): Theme => {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem('theme') as Theme | null;
    return stored || getSystemTheme();
  };

  const [theme, setThemeState] = useState<Theme>(getStoredTheme);
  const [systemTheme, setSystemTheme] = useState<Theme>(getSystemTheme);

  // Apply theme to document
  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const themeColor = newTheme === 'dark' 
        ? 'hsl(255, 25%, 8%)' 
        : 'hsl(255, 15%, 98%)';
      metaThemeColor.setAttribute('content', themeColor);
    }
  };

  // Set theme and persist to localStorage
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  // Toggle between light and dark themes
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      setSystemTheme(newSystemTheme);
      
      // If no theme is stored, update to match system
      const storedTheme = localStorage.getItem('theme');
      if (!storedTheme) {
        setThemeState(newSystemTheme);
        applyTheme(newSystemTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Initialize theme on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (!storedTheme) {
      // No stored preference, use system theme
      const currentSystemTheme = getSystemTheme();
      setThemeState(currentSystemTheme);
      applyTheme(currentSystemTheme);
    } else {
      // Use stored preference
      applyTheme(storedTheme);
    }
  }, []);

  return {
    theme,
    toggleTheme,
    systemTheme,
    setTheme,
  };
}