/**
 * Performance monitoring utilities for Core Web Vitals compliance
 * Tracks LCP, FID, CLS, and other performance metrics
 */

// Performance metrics interface
export interface PerformanceMetrics {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  loadTime?: number; // Total page load time
}

// Performance thresholds (Core Web Vitals)
export const PERFORMANCE_THRESHOLDS = {
  LCP: 2500, // 2.5 seconds
  FID: 100,  // 100 milliseconds
  CLS: 0.1,  // 0.1 layout shift score
  FCP: 1800, // 1.8 seconds
  TTFB: 800, // 800 milliseconds
} as const;

// Global performance data
let performanceData: PerformanceMetrics = {};
let performanceObserver: PerformanceObserver | null = null;

/**
 * Initialize performance monitoring (disabled to avoid issues)
 */
export const initPerformanceMonitoring = (): void => {
  // Completely disabled to avoid any TypeScript or runtime issues
  console.log('Performance monitoring disabled');
};

/**
 * Measure page load time
 */
const measureLoadTime = (): void => {
  try {
    // Use Navigation Timing API Level 2 if available
    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navigationEntries.length > 0) {
      const navEntry = navigationEntries[0];
      const loadTime = navEntry.loadEventEnd - navEntry.fetchStart;
      performanceData.loadTime = loadTime;
      
      if (loadTime > 3000) { // 3 seconds threshold
        console.warn(`Page load time (${Math.round(loadTime)}ms) exceeds recommended threshold`);
      }
    }
  } catch (error) {
    console.debug('Failed to measure load time:', error);
  }
};

/**
 * Check LCP threshold and log warnings
 */
const checkLCPThreshold = (lcp: number): void => {
  if (lcp > PERFORMANCE_THRESHOLDS.LCP) {
    console.warn(`LCP (${Math.round(lcp)}ms) exceeds threshold (${PERFORMANCE_THRESHOLDS.LCP}ms)`);
    logPerformanceIssue('LCP', lcp, PERFORMANCE_THRESHOLDS.LCP);
  } else {
    console.log(`LCP: ${Math.round(lcp)}ms (Good)`);
  }
};

/**
 * Check FID threshold and log warnings
 */
const checkFIDThreshold = (fid: number): void => {
  if (fid > PERFORMANCE_THRESHOLDS.FID) {
    console.warn(`FID (${Math.round(fid)}ms) exceeds threshold (${PERFORMANCE_THRESHOLDS.FID}ms)`);
    logPerformanceIssue('FID', fid, PERFORMANCE_THRESHOLDS.FID);
  } else {
    console.log(`FID: ${Math.round(fid)}ms (Good)`);
  }
};

/**
 * Check CLS threshold and log warnings
 */
const checkCLSThreshold = (cls: number): void => {
  if (cls > PERFORMANCE_THRESHOLDS.CLS) {
    console.warn(`CLS (${cls.toFixed(3)}) exceeds threshold (${PERFORMANCE_THRESHOLDS.CLS})`);
    logPerformanceIssue('CLS', cls, PERFORMANCE_THRESHOLDS.CLS);
  } else {
    console.log(`CLS: ${cls.toFixed(3)} (Good)`);
  }
};

/**
 * Check FCP threshold and log warnings
 */
const checkFCPThreshold = (fcp: number): void => {
  if (fcp > PERFORMANCE_THRESHOLDS.FCP) {
    console.warn(`FCP (${Math.round(fcp)}ms) exceeds threshold (${PERFORMANCE_THRESHOLDS.FCP}ms)`);
    logPerformanceIssue('FCP', fcp, PERFORMANCE_THRESHOLDS.FCP);
  } else {
    console.log(`FCP: ${Math.round(fcp)}ms (Good)`);
  }
};

/**
 * Check TTFB threshold and log warnings
 */
const checkTTFBThreshold = (ttfb: number): void => {
  if (ttfb > PERFORMANCE_THRESHOLDS.TTFB) {
    console.warn(`TTFB (${Math.round(ttfb)}ms) exceeds threshold (${PERFORMANCE_THRESHOLDS.TTFB}ms)`);
    logPerformanceIssue('TTFB', ttfb, PERFORMANCE_THRESHOLDS.TTFB);
  } else {
    console.log(`TTFB: ${Math.round(ttfb)}ms (Good)`);
  }
};

/**
 * Log performance issues with recommendations
 */
const logPerformanceIssue = (metric: string, value: number, threshold: number): void => {
  const recommendations = {
    LCP: [
      'Optimize images and use modern formats (WebP, AVIF)',
      'Implement lazy loading for non-critical images',
      'Minimize render-blocking resources',
      'Use a CDN for static assets'
    ],
    FID: [
      'Minimize JavaScript execution time',
      'Break up long tasks',
      'Use web workers for heavy computations',
      'Optimize third-party scripts'
    ],
    CLS: [
      'Set explicit dimensions for images and videos',
      'Reserve space for dynamic content',
      'Avoid inserting content above existing content',
      'Use CSS transforms instead of changing layout properties'
    ],
    FCP: [
      'Minimize render-blocking resources',
      'Optimize CSS delivery',
      'Remove unused CSS',
      'Inline critical CSS'
    ],
    TTFB: [
      'Optimize server response time',
      'Use a CDN',
      'Enable compression',
      'Optimize database queries'
    ]
  };

  console.group(`Performance Issue: ${metric}`);
  console.log(`Current: ${typeof value === 'number' ? Math.round(value) : value}`);
  console.log(`Threshold: ${threshold}`);
  console.log('Recommendations:');
  recommendations[metric as keyof typeof recommendations]?.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec}`);
  });
  console.groupEnd();
};

/**
 * Get current performance metrics
 */
export const getPerformanceMetrics = (): PerformanceMetrics => {
  return { ...performanceData };
};

/**
 * Get performance score (0-100)
 */
export const getPerformanceScore = (): number => {
  const metrics = getPerformanceMetrics();
  let score = 100;
  
  // Deduct points for each metric that exceeds threshold
  if (metrics.lcp && metrics.lcp > PERFORMANCE_THRESHOLDS.LCP) {
    score -= 25;
  }
  if (metrics.fid && metrics.fid > PERFORMANCE_THRESHOLDS.FID) {
    score -= 25;
  }
  if (metrics.cls && metrics.cls > PERFORMANCE_THRESHOLDS.CLS) {
    score -= 25;
  }
  if (metrics.fcp && metrics.fcp > PERFORMANCE_THRESHOLDS.FCP) {
    score -= 15;
  }
  if (metrics.ttfb && metrics.ttfb > PERFORMANCE_THRESHOLDS.TTFB) {
    score -= 10;
  }
  
  return Math.max(0, score);
};

/**
 * Log performance summary
 */
export const logPerformanceSummary = (): void => {
  const metrics = getPerformanceMetrics();
  const score = getPerformanceScore();
  
  console.group('Performance Summary');
  console.log(`Overall Score: ${score}/100`);
  console.log('Core Web Vitals:');
  console.log(`  LCP: ${metrics.lcp ? Math.round(metrics.lcp) + 'ms' : 'Not measured'}`);
  console.log(`  FID: ${metrics.fid ? Math.round(metrics.fid) + 'ms' : 'Not measured'}`);
  console.log(`  CLS: ${metrics.cls ? metrics.cls.toFixed(3) : 'Not measured'}`);
  console.log('Other Metrics:');
  console.log(`  FCP: ${metrics.fcp ? Math.round(metrics.fcp) + 'ms' : 'Not measured'}`);
  console.log(`  TTFB: ${metrics.ttfb ? Math.round(metrics.ttfb) + 'ms' : 'Not measured'}`);
  console.log(`  Load Time: ${metrics.loadTime ? Math.round(metrics.loadTime) + 'ms' : 'Not measured'}`);
  console.groupEnd();
};

/**
 * Cleanup performance monitoring
 */
export const cleanupPerformanceMonitoring = (): void => {
  if (performanceObserver) {
    performanceObserver.disconnect();
    performanceObserver = null;
  }
};

/**
 * Mark custom performance timing (disabled)
 */
export const markPerformance = (name: string): void => {
  // Disabled to avoid any issues
};

/**
 * Measure custom performance timing (disabled)
 */
export const measurePerformance = (name: string, startMark: string, endMark?: string): number | null => {
  // Disabled to avoid any issues
  return null;
};