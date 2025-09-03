/**
 * Responsive utility functions and constants
 */

// Breakpoint constants matching Tailwind CSS
export const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
  desktop: 1280,
  xl: 1536,
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

/**
 * Check if current window width matches a breakpoint
 */
export function matchesBreakpoint(breakpoint: BreakpointKey): boolean {
  if (typeof window === 'undefined') return false;
  
  const width = window.innerWidth;
  
  switch (breakpoint) {
    case 'mobile':
      return width < BREAKPOINTS.mobile;
    case 'tablet':
      return width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet;
    case 'desktop':
      return width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop;
    case 'xl':
      return width >= BREAKPOINTS.desktop;
    default:
      return false;
  }
}

/**
 * Get current breakpoint based on window width
 */
export function getCurrentBreakpoint(): BreakpointKey {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  
  if (width < BREAKPOINTS.mobile) return 'mobile';
  if (width < BREAKPOINTS.tablet) return 'tablet';
  if (width < BREAKPOINTS.desktop) return 'desktop';
  return 'xl';
}

/**
 * Check if device is likely a touch device
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore - Legacy property
    navigator.msMaxTouchPoints > 0
  );
}

/**
 * Get responsive class names based on breakpoint
 */
export function getResponsiveClasses(
  mobile: string,
  tablet?: string,
  desktop?: string,
  xl?: string
): string {
  const classes = [mobile];
  
  if (tablet) classes.push(`sm:${tablet}`);
  if (desktop) classes.push(`lg:${desktop}`);
  if (xl) classes.push(`xl:${xl}`);
  
  return classes.join(' ');
}

/**
 * Responsive value selector
 */
export function getResponsiveValue<T>(
  values: {
    mobile: T;
    tablet?: T;
    desktop?: T;
    xl?: T;
  },
  currentBreakpoint?: BreakpointKey
): T {
  const breakpoint = currentBreakpoint || getCurrentBreakpoint();
  
  switch (breakpoint) {
    case 'mobile':
      return values.mobile;
    case 'tablet':
      return values.tablet || values.mobile;
    case 'desktop':
      return values.desktop || values.tablet || values.mobile;
    case 'xl':
      return values.xl || values.desktop || values.tablet || values.mobile;
    default:
      return values.mobile;
  }
}

/**
 * Debounce function for resize events
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for scroll events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}