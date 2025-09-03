import { Theme } from '../hooks/useTheme';

/**
 * Theme utility functions and constants
 */

// Theme-specific color values
export const THEME_COLORS = {
  light: {
    background: 'hsl(255, 15%, 98%)',
    foreground: 'hsl(255, 25%, 15%)',
    primary: 'hsl(262, 65%, 45%)',
    accent: 'hsl(270, 75%, 65%)',
    card: 'hsl(255, 25%, 100%)',
    muted: 'hsl(255, 15%, 95%)',
    border: 'hsl(255, 15%, 90%)',
  },
  dark: {
    background: 'hsl(255, 25%, 8%)',
    foreground: 'hsl(255, 15%, 92%)',
    primary: 'hsl(262, 65%, 55%)',
    accent: 'hsl(270, 75%, 70%)',
    card: 'hsl(255, 25%, 12%)',
    muted: 'hsl(255, 25%, 15%)',
    border: 'hsl(255, 25%, 20%)',
  },
} as const;

/**
 * Get system theme preference
 */
export function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches 
    ? 'dark' 
    : 'light';
}

/**
 * Get stored theme from localStorage
 */
export function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem('theme');
  return stored === 'dark' || stored === 'light' ? stored : null;
}

/**
 * Store theme in localStorage
 */
export function storeTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('theme', theme);
}

/**
 * Remove theme from localStorage
 */
export function removeStoredTheme(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('theme');
}

/**
 * Apply theme to document element
 */
export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  
  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute(
      'content', 
      THEME_COLORS[theme].background
    );
  }
}

/**
 * Get theme-specific CSS custom property value
 */
export function getThemeColor(
  colorName: keyof typeof THEME_COLORS.light,
  theme?: Theme
): string {
  const currentTheme = theme || getSystemTheme();
  return THEME_COLORS[currentTheme][colorName];
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if user prefers high contrast
 */
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * Get theme-aware class names
 */
export function getThemeClasses(
  lightClasses: string,
  darkClasses: string,
  theme?: Theme
): string {
  const currentTheme = theme || getSystemTheme();
  return currentTheme === 'dark' ? darkClasses : lightClasses;
}

/**
 * Create theme-aware CSS variables
 */
export function createThemeVariables(theme: Theme): Record<string, string> {
  const colors = THEME_COLORS[theme];
  
  return Object.entries(colors).reduce((vars, [key, value]) => {
    vars[`--${key}`] = value;
    return vars;
  }, {} as Record<string, string>);
}

/**
 * Listen for system theme changes
 */
export function onSystemThemeChange(callback: (theme: Theme) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleChange = (e: MediaQueryListEvent) => {
    callback(e.matches ? 'dark' : 'light');
  };
  
  mediaQuery.addEventListener('change', handleChange);
  
  return () => {
    mediaQuery.removeEventListener('change', handleChange);
  };
}