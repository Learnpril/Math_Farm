import { useTheme } from '../hooks/useTheme';
import { useBreakpoint } from '../hooks/useBreakpoint';

/**
 * Test component to verify theme and responsive functionality
 */
export function ThemeTest() {
  const { theme, systemTheme, toggleTheme } = useTheme();
  const { breakpoint, isMobile, isTablet, isDesktop } = useBreakpoint();

  return (
    <div className="p-6 bg-card border border-border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Theme & Responsive Test</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Current Theme:</strong> {theme}
        </div>
        <div>
          <strong>System Theme:</strong> {systemTheme}
        </div>
        <div>
          <strong>Breakpoint:</strong> {breakpoint}
        </div>

        <div>
          <strong>Device Type:</strong>{' '}
          {isMobile && 'Mobile'}
          {isTablet && 'Tablet'}
          {isDesktop && 'Desktop'}
        </div>
      </div>
      
      <button
        onClick={toggleTheme}
        className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        Toggle Theme
      </button>
    </div>
  );
}