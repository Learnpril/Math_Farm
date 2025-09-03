import { createContext, useContext, ReactNode } from 'react';
import { useTheme, Theme } from '../hooks/useTheme';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  systemTheme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Theme provider component that wraps the application
 * Provides theme context to all child components
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const themeHook = useTheme();

  return (
    <ThemeContext.Provider value={themeHook}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 * Must be used within a ThemeProvider
 */
export function useThemeContext(): ThemeContextType {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  
  return context;
}

/**
 * Higher-order component for theme-aware components
 */
export function withTheme<P extends object>(
  Component: React.ComponentType<P & { theme: Theme }>
) {
  return function ThemedComponent(props: P) {
    const { theme } = useThemeContext();
    return <Component {...props} theme={theme} />;
  };
}