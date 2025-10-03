/**
 * Shared utilities for visual components to reduce boilerplate
 */

// Common CSS class patterns used across visual components
export const visualStyles = {
  // Dark mode text classes
  text: {
    primary: 'text-gray-900 dark:text-gray-100',
    secondary: 'text-gray-700 dark:text-gray-300',
    muted: 'text-gray-600 dark:text-gray-400',
    small: 'text-xs text-gray-500 dark:text-gray-400',
  },

  // Card and container classes
  card: {
    base: 'bg-white dark:bg-gray-900',
    content: 'bg-gray-50 dark:bg-gray-800',
    info: 'bg-gray-50 dark:bg-gray-950',
  },

  // Title classes for different visual components
  title: {
    primary: 'text-lg font-semibold text-purple-700 dark:text-purple-300',
    equation: 'text-2xl font-bold text-purple-700 dark:text-purple-300',
    large: 'text-3xl font-bold text-purple-700 dark:text-purple-300',
  },

  // Label classes
  label: {
    base: 'block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100',
    inline: 'text-sm font-medium text-gray-900 dark:text-gray-100',
    small: 'w-8 text-xs text-gray-700 dark:text-gray-300',
  },

  // Background classes for different contexts
  background: {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800',
    purple:
      'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800',
    green:
      'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800',
    red: 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800',
    yellow:
      'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800',
  },

  // Text colors for different contexts
  textColor: {
    blue: 'text-blue-800 dark:text-blue-200',
    purple: 'text-purple-800 dark:text-purple-200',
    green: 'text-green-800 dark:text-green-200',
    red: 'text-red-800 dark:text-red-200',
    yellow: 'text-yellow-800 dark:text-yellow-200',
  },
} as const;

// Common mathematical utility functions
export const mathUtils = {
  gcd: (a: number, b: number): number => {
    return b === 0 ? a : mathUtils.gcd(b, a % b);
  },

  simplifyFraction: (num: number, den: number) => {
    const divisor = mathUtils.gcd(num, den);
    return { num: num / divisor, den: den / divisor };
  },

  toPercentage: (value: number, decimals = 1): string => {
    return `${(value * 100).toFixed(decimals)}%`;
  },

  formatDecimal: (value: number, decimals = 3): string => {
    return value.toFixed(decimals);
  },
};

// Common component props interface
export interface BaseVisualProps {
  title?: string;
  description?: string;
  className?: string;
}

// Common slider configuration
export interface SliderConfig {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label: string;
}

// Utility function to create consistent slider markup
export const createSliderControl = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
}: SliderConfig) => ({
  value: [value],
  onValueChange: (newValue: number[]) => onChange(newValue[0] || min),
  min,
  max,
  step,
  label,
  className: 'flex-1',
});

// Common preset button configurations
export const createPresetButtons = <T>(
  presets: Array<{ label: string; value: T }>,
  currentValue: T,
  onSelect: (value: T) => void,
  compareValues: (a: T, b: T) => boolean = (a, b) =>
    JSON.stringify(a) === JSON.stringify(b)
) => {
  return presets.map(preset => ({
    ...preset,
    isActive: compareValues(currentValue, preset.value),
    onClick: () => onSelect(preset.value),
  }));
};

// Common explanation box component props
export interface ExplanationBoxProps {
  title: string;
  children: React.ReactNode;
  variant?: 'blue' | 'purple' | 'green' | 'red' | 'yellow';
}
