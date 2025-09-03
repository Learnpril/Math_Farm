import { useBreakpoint } from '../hooks/useBreakpoint';

/**
 * Demo component showing responsive behavior
 */
export function ResponsiveDemo() {
  const { breakpoint, isMobile, isTablet, isDesktop } = useBreakpoint();

  return (
    <div className="p-6 bg-card border border-border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Responsive Behavior Demo</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-md ${isMobile ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
          <div className="font-medium">Mobile</div>
          <div className="text-sm opacity-75">&lt; 640px</div>
          <div className="text-xs mt-1">{isMobile ? 'Active' : 'Inactive'}</div>
        </div>
        
        <div className={`p-4 rounded-md ${isTablet ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
          <div className="font-medium">Tablet</div>
          <div className="text-sm opacity-75">640px - 1023px</div>
          <div className="text-xs mt-1">{isTablet ? 'Active' : 'Inactive'}</div>
        </div>
        
        <div className={`p-4 rounded-md ${isDesktop ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
          <div className="font-medium">Desktop</div>
          <div className="text-sm opacity-75">&gt;= 1024px</div>
          <div className="text-xs mt-1">{isDesktop ? 'Active' : 'Inactive'}</div>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground">
        <div><strong>Current breakpoint:</strong> {breakpoint}</div>
        <div className="mt-2">
          <strong>Resize your browser window</strong> to see the responsive behavior in action.
        </div>
      </div>
      
      {/* Visual demonstration of responsive classes */}
      <div className="mt-6 p-4 bg-accent/10 rounded-md">
        <div className="text-sm font-medium mb-2">Responsive Layout Example:</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="bg-primary/20 p-2 rounded text-xs text-center">
            Always visible
          </div>
          <div className="bg-primary/20 p-2 rounded text-xs text-center hidden sm:block">
            Tablet+ only
          </div>
          <div className="bg-primary/20 p-2 rounded text-xs text-center hidden lg:block">
            Desktop+ only
          </div>
          <div className="bg-primary/20 p-2 rounded text-xs text-center hidden lg:block">
            Desktop+ only
          </div>
        </div>
      </div>
    </div>
  );
}