import { useState } from 'react';
import { ThemeToggle, CompactThemeToggle, LabeledThemeToggle } from './ui/ThemeToggle';

/**
 * Demo component showcasing accessibility features
 */
export function AccessibilityDemo() {
  const [focusedElement, setFocusedElement] = useState<string>('');

  const handleFocus = (elementName: string) => {
    setFocusedElement(elementName);
  };

  const handleBlur = () => {
    setFocusedElement('');
  };

  return (
    <div className="p-6 bg-card border border-border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Accessibility Features Demo</h3>
      
      <div className="space-y-6">
        {/* Theme Toggle Variants */}
        <div>
          <h4 className="font-medium mb-3">Theme Toggle Variants</h4>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex flex-col items-center gap-2">
              <ThemeToggle size="sm" />
              <span className="text-xs text-muted-foreground">Small</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ThemeToggle size="md" />
              <span className="text-xs text-muted-foreground">Medium</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ThemeToggle size="lg" />
              <span className="text-xs text-muted-foreground">Large</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <CompactThemeToggle />
              <span className="text-xs text-muted-foreground">Compact</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <LabeledThemeToggle />
              <span className="text-xs text-muted-foreground">Labeled</span>
            </div>
          </div>
        </div>

        {/* Keyboard Navigation Test */}
        <div>
          <h4 className="font-medium mb-3">Keyboard Navigation Test</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Use Tab to navigate through these elements. The currently focused element will be highlighted.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              className="p-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
              onFocus={() => handleFocus('Button 1')}
              onBlur={handleBlur}
            >
              Focusable Button 1
            </button>
            <button
              className="p-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
              onFocus={() => handleFocus('Button 2')}
              onBlur={handleBlur}
            >
              Focusable Button 2
            </button>
            <input
              type="text"
              placeholder="Focusable input"
              className="p-3 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
              onFocus={() => handleFocus('Text Input')}
              onBlur={handleBlur}
            />
          </div>
          {focusedElement && (
            <div className="mt-3 p-2 bg-accent/20 rounded-md text-sm">
              <strong>Currently focused:</strong> {focusedElement}
            </div>
          )}
        </div>

        {/* Color Contrast Demo */}
        <div>
          <h4 className="font-medium mb-3">Color Contrast Examples</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="p-3 bg-primary text-primary-foreground rounded-md">
                <div className="font-medium">Primary Colors</div>
                <div className="text-sm opacity-90">High contrast text on primary background</div>
              </div>
              <div className="p-3 bg-secondary text-secondary-foreground rounded-md">
                <div className="font-medium">Secondary Colors</div>
                <div className="text-sm opacity-90">High contrast text on secondary background</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="p-3 bg-accent text-accent-foreground rounded-md">
                <div className="font-medium">Accent Colors</div>
                <div className="text-sm opacity-90">High contrast text on accent background</div>
              </div>
              <div className="p-3 bg-muted text-muted-foreground rounded-md">
                <div className="font-medium">Muted Colors</div>
                <div className="text-sm">Appropriate contrast for secondary text</div>
              </div>
            </div>
          </div>
        </div>

        {/* Screen Reader Support */}
        <div>
          <h4 className="font-medium mb-3">Screen Reader Support</h4>
          <div className="space-y-3">
            <div className="p-3 bg-muted rounded-md">
              <div className="font-medium" aria-label="Status indicator">
                Status: <span className="text-green-600" aria-label="Active">●</span> Active
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                This status uses both visual and text indicators for accessibility.
              </div>
            </div>
            
            <div className="p-3 bg-muted rounded-md">
              <div className="font-medium">Progress Example</div>
              <div 
                className="w-full bg-background rounded-full h-2 mt-2"
                role="progressbar"
                aria-valuenow={75}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Task completion progress"
              >
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: '75%' }}
                ></div>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Progress bar with proper ARIA attributes (75% complete).
              </div>
            </div>
          </div>
        </div>

        {/* Skip Links Demo */}
        <div>
          <h4 className="font-medium mb-3">Skip Links</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Press Tab when focused on this page to see the skip link appear at the top.
            Skip links help keyboard users navigate efficiently.
          </p>
          <div className="p-3 bg-muted rounded-md text-sm">
            <strong>Note:</strong> The skip link is already implemented in the HTML head and will appear 
            when you tab through the page elements.
          </div>
        </div>
      </div>
    </div>
  );
}