import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  initPerformanceMonitoring,
  getPerformanceMetrics,
  getPerformanceScore,
  markPerformance,
  measurePerformance,
  cleanupPerformanceMonitoring,
  PERFORMANCE_THRESHOLDS
} from '../performance';

// Mock PerformanceObserver
const mockPerformanceObserver = vi.fn();
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

mockPerformanceObserver.mockImplementation(() => ({
  observe: mockObserve,
  disconnect: mockDisconnect,
}));

// Mock performance API
const mockPerformance = {
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByName: vi.fn(),
  timing: {
    navigationStart: 1000,
    loadEventEnd: 3000,
    responseStart: 1200,
    requestStart: 1100,
    fetchStart: 1050,
  },
};

// Setup global mocks
beforeEach(() => {
  vi.clearAllMocks();
  
  // Mock window and performance objects
  Object.defineProperty(global, 'window', {
    value: {
      PerformanceObserver: mockPerformanceObserver,
      performance: mockPerformance,
      addEventListener: vi.fn(),
    },
    writable: true,
  });
  
  Object.defineProperty(global, 'performance', {
    value: mockPerformance,
    writable: true,
  });
  
  Object.defineProperty(global, 'document', {
    value: {
      readyState: 'loading',
    },
    writable: true,
  });
});

afterEach(() => {
  cleanupPerformanceMonitoring();
});

describe('Performance Monitoring', () => {
  describe('initPerformanceMonitoring', () => {
    it('should initialize performance observer when supported', () => {
      initPerformanceMonitoring();
      
      expect(mockPerformanceObserver).toHaveBeenCalled();
      expect(mockObserve).toHaveBeenCalledWith({ type: 'largest-contentful-paint', buffered: true });
      expect(mockObserve).toHaveBeenCalledWith({ type: 'first-input', buffered: true });
      expect(mockObserve).toHaveBeenCalledWith({ type: 'layout-shift', buffered: true });
      expect(mockObserve).toHaveBeenCalledWith({ type: 'paint', buffered: true });
      expect(mockObserve).toHaveBeenCalledWith({ type: 'navigation', buffered: true });
    });

    it('should handle unsupported environment gracefully', () => {
      // Remove PerformanceObserver support
      delete (global.window as any).PerformanceObserver;
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      initPerformanceMonitoring();
      
      expect(consoleSpy).toHaveBeenCalledWith('Performance monitoring not supported in this environment');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Performance Metrics', () => {
    it('should return empty metrics initially', () => {
      const metrics = getPerformanceMetrics();
      expect(metrics).toEqual({});
    });

    it('should calculate performance score correctly', () => {
      // Test perfect score
      expect(getPerformanceScore()).toBe(100);
    });

    it('should deduct points for poor metrics', () => {
      // Mock poor performance metrics by simulating observer callback
      initPerformanceMonitoring();
      
      // Get the observer callback
      const observerCallback = mockPerformanceObserver.mock.calls[0][0];
      
      // Simulate poor LCP
      observerCallback({
        getEntries: () => [{
          entryType: 'largest-contentful-paint',
          startTime: 3000, // Exceeds 2500ms threshold
        }]
      });
      
      const score = getPerformanceScore();
      expect(score).toBe(75); // 100 - 25 for poor LCP
    });
  });

  describe('Performance Marking and Measuring', () => {
    it('should mark performance timing', () => {
      markPerformance('test-mark');
      expect(mockPerformance.mark).toHaveBeenCalledWith('test-mark');
    });

    it('should measure performance timing', () => {
      mockPerformance.getEntriesByName.mockReturnValue([{ duration: 100 }]);
      
      const duration = measurePerformance('test-measure', 'start-mark', 'end-mark');
      
      expect(mockPerformance.measure).toHaveBeenCalledWith('test-measure', 'start-mark', 'end-mark');
      expect(duration).toBe(100);
    });

    it('should handle measurement errors gracefully', () => {
      mockPerformance.measure.mockImplementation(() => {
        throw new Error('Measurement failed');
      });
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const duration = measurePerformance('test-measure', 'start-mark');
      
      expect(duration).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to measure performance for test-measure:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('Performance Thresholds', () => {
    it('should have correct threshold values', () => {
      expect(PERFORMANCE_THRESHOLDS.LCP).toBe(2500);
      expect(PERFORMANCE_THRESHOLDS.FID).toBe(100);
      expect(PERFORMANCE_THRESHOLDS.CLS).toBe(0.1);
      expect(PERFORMANCE_THRESHOLDS.FCP).toBe(1800);
      expect(PERFORMANCE_THRESHOLDS.TTFB).toBe(800);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup performance observer', () => {
      initPerformanceMonitoring();
      cleanupPerformanceMonitoring();
      
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });
});

describe('Performance Metrics Processing', () => {
  beforeEach(() => {
    initPerformanceMonitoring();
  });

  it('should process LCP entries correctly', () => {
    const observerCallback = mockPerformanceObserver.mock.calls[0][0];
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    observerCallback({
      getEntries: () => [{
        entryType: 'largest-contentful-paint',
        startTime: 2000, // Good LCP
      }]
    });
    
    const metrics = getPerformanceMetrics();
    expect(metrics.lcp).toBe(2000);
    expect(consoleSpy).toHaveBeenCalledWith('LCP: 2000ms (Good)');
    
    consoleSpy.mockRestore();
  });

  it('should process FID entries correctly', () => {
    const observerCallback = mockPerformanceObserver.mock.calls[0][0];
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    observerCallback({
      getEntries: () => [{
        entryType: 'first-input',
        startTime: 1000,
        processingStart: 1050, // 50ms FID (good)
      }]
    });
    
    const metrics = getPerformanceMetrics();
    expect(metrics.fid).toBe(50);
    expect(consoleSpy).toHaveBeenCalledWith('FID: 50ms (Good)');
    
    consoleSpy.mockRestore();
  });

  it('should process CLS entries correctly', () => {
    const observerCallback = mockPerformanceObserver.mock.calls[0][0];
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    observerCallback({
      getEntries: () => [{
        entryType: 'layout-shift',
        value: 0.05,
        hadRecentInput: false,
      }]
    });
    
    const metrics = getPerformanceMetrics();
    expect(metrics.cls).toBe(0.05);
    expect(consoleSpy).toHaveBeenCalledWith('CLS: 0.050 (Good)');
    
    consoleSpy.mockRestore();
  });

  it('should process FCP entries correctly', () => {
    const observerCallback = mockPerformanceObserver.mock.calls[0][0];
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    observerCallback({
      getEntries: () => [{
        entryType: 'paint',
        name: 'first-contentful-paint',
        startTime: 1500, // Good FCP
      }]
    });
    
    const metrics = getPerformanceMetrics();
    expect(metrics.fcp).toBe(1500);
    expect(consoleSpy).toHaveBeenCalledWith('FCP: 1500ms (Good)');
    
    consoleSpy.mockRestore();
  });

  it('should ignore layout shifts with recent input', () => {
    const observerCallback = mockPerformanceObserver.mock.calls[0][0];
    
    observerCallback({
      getEntries: () => [{
        entryType: 'layout-shift',
        value: 0.2,
        hadRecentInput: true, // Should be ignored
      }]
    });
    
    const metrics = getPerformanceMetrics();
    expect(metrics.cls).toBeUndefined();
  });
});