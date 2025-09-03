import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'icon';
  showLabel?: boolean;
}

/**
 * Theme toggle component with accessibility support
 * Provides visual feedback and keyboard navigation
 */
export function ThemeToggle({ 
  className = '', 
  size = 'md', 
  variant = 'button',
  showLabel = false 
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const baseClasses = `
    inline-flex items-center justify-center rounded-md
    border border-input bg-background
    hover:bg-accent hover:text-accent-foreground
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
    disabled:pointer-events-none disabled:opacity-50
    transition-colors duration-200
  `;

  const buttonClasses = variant === 'button' 
    ? `${baseClasses} ${sizeClasses[size]} ${className}`
    : `${baseClasses} ${sizeClasses[size]} ${className}`;

  const handleToggle = () => {
    toggleTheme();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  };

  const isDark = theme === 'dark';
  const Icon = isDark ? Sun : Moon;
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  const displayLabel = isDark ? 'Light mode' : 'Dark mode';

  return (
    <button
      type="button"
      className={buttonClasses}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      aria-label={label}
      title={label}
      role="switch"
      aria-checked={isDark}
    >
      <Icon 
        size={iconSizes[size]} 
        className="transition-transform duration-200 hover:scale-110" 
        aria-hidden="true"
      />
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {displayLabel}
        </span>
      )}
      <span className="sr-only">{label}</span>
    </button>
  );
}

/**
 * Compact theme toggle for use in navigation bars
 */
export function CompactThemeToggle({ className = '' }: { className?: string }) {
  return (
    <ThemeToggle 
      size="sm" 
      variant="icon" 
      className={className}
    />
  );
}

/**
 * Theme toggle with label for settings pages
 */
export function LabeledThemeToggle({ className = '' }: { className?: string }) {
  return (
    <ThemeToggle 
      size="md" 
      variant="button" 
      showLabel={true}
      className={className}
    />
  );
}