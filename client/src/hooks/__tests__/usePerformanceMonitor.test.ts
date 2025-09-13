/**
 * Tests for performance monitoring hooks
 */

import { renderHook, act } from '@testing-library/react';
import {
  useMathOperationTracker,
  usePerformanceStats,
  useMemoryMonitor,
  performanceTracker,
} from '../usePerformanceMonitor';

// Mock performance API
const mockPerformanceNow = jest.fn();

// Setup performance mock
beforeAll(() => {
  Object.defineProperty(global, 'performance', {
    value: {
      now: mockPerformanceNow,
      memory: {
        usedJSHeapSize: 50 * 1024 * 1024, // 50MB
        totalJSHeapSize: 100 * 1024 * 1024, // 100MB
        jsHeapSizeLimit: 2 * 1024 * 1024 * 1024, // 2GB
      },
    },
    writable: true,
  });
});

describe('usePerformanceMonitor', () => {
  beforeEach(() => {
    mockPerformanceNow.mockReturnValue(0);
    performanceTracker.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('useMathOperationTracker', () => {
    it('should track math operations', () => {
      const { result } = renderHook(() => useMathOperationTracker());

      act(() => {
        const tracker = result.current.trackOperation(
          'test-operation',
          'TestComponent'
        );
        tracker.start();

        // Simulate time passing
        mockPerformanceNow.mockReturnValue(100);
        tracker.end(true);
      });

      // Verify operation was tracked
      const stats = performanceTracker.getStats();
      expect(stats.totalOperations).toBe(1);
      expect(stats.averageDuration).toBe(100);
      expect(stats.successRate).toBe(1);
    });

    it('should track failed operations', () => {
      const { result } = renderHook(() => useMathOperationTracker());

      act(() => {
        const tracker = result.current.trackOperation(
          'test-operation',
          'TestComponent'
        );
        tracker.start();

        mockPerformanceNow.mockReturnValue(50);
        tracker.end(false, 'Test error');
      });

      const stats = performanceTracker.getStats();
      expect(stats.totalOperations).toBe(1);
      expect(stats.successRate).toBe(0);
      expect(stats.recentMetrics[0].error).toBe('Test error');
    });

    it('should track memory usage', () => {
      const { result } = renderHook(() => useMathOperationTracker());

      act(() => {
        const tracker = result.current.trackOperation('memory-test');
        tracker.start();
        tracker.end(true);
      });

      const stats = performanceTracker.getStats();
      expect(stats.recentMetrics[0].memoryBefore).toBeDefined();
      expect(stats.recentMetrics[0].memoryAfter).toBeDefined();
    });
  });

  describe('usePerformanceStats', () => {
    it('should provide performance statistics', () => {
      const { result } = renderHook(() => usePerformanceStats());

      expect(result.current.stats).toBeDefined();
      expect(result.current.renderStats).toBeDefined();
      expect(typeof result.current.clearStats).toBe('function');
    });

    it('should update stats when operations are tracked', async () => {
      const { result: trackerResult } = renderHook(() =>
        useMathOperationTracker()
      );
      const { result: statsResult } = renderHook(() => usePerformanceStats());

      act(() => {
        const tracker = trackerResult.current.trackOperation('update-test');
        tracker.start();
        mockPerformanceNow.mockReturnValue(200);
        tracker.end(true);
      });

      // Stats should be updated
      expect(statsResult.current.stats.totalOperations).toBe(1);
      expect(statsResult.current.stats.averageDuration).toBe(200);
    });

    it('should clear stats when requested', () => {
      const { result: trackerResult } = renderHook(() =>
        useMathOperationTracker()
      );
      const { result: statsResult } = renderHook(() => usePerformanceStats());

      // Add some operations
      act(() => {
        const tracker = trackerResult.current.trackOperation('clear-test');
        tracker.start();
        tracker.end(true);
      });

      expect(statsResult.current.stats.totalOperations).toBe(1);

      // Clear stats
      act(() => {
        statsResult.current.clearStats();
      });

      expect(statsResult.current.stats.totalOperations).toBe(0);
    });
  });

  describe('useMemoryMonitor', () => {
    it('should detect memory API support', () => {
      const { result } = renderHook(() => useMemoryMonitor());

      expect(result.current.supported).toBe(true);
      expect(result.current.current).toBeDefined();
      expect(result.current.peak).toBeDefined();
      expect(result.current.limit).toBeDefined();
    });

    it('should handle missing memory API', () => {
      // Temporarily remove memory API
      const originalMemory = (global.performance as any).memory;
      delete (global.performance as any).memory;

      const { result } = renderHook(() => useMemoryMonitor());

      expect(result.current.supported).toBe(false);
      expect(result.current.current).toBeUndefined();

      // Restore memory API
      (global.performance as any).memory = originalMemory;
    });
  });

  describe('performanceTracker', () => {
    it('should limit metrics array size', () => {
      const tracker = performanceTracker;

      // Add more than the limit (1000) operations
      for (let i = 0; i < 1100; i++) {
        const operation = tracker.trackMathOperation(`test-${i}`);
        operation.start();
        operation.end(true);
      }

      const stats = tracker.getStats();
      expect(stats.totalOperations).toBeLessThanOrEqual(1000);
    });

    it('should calculate operation statistics correctly', () => {
      const tracker = performanceTracker;
      tracker.clear();

      // Add operations with known durations
      const durations = [100, 200, 300];
      durations.forEach((duration, index) => {
        mockPerformanceNow.mockReturnValue(0);
        const operation = tracker.trackMathOperation(`test-${index}`);
        operation.start();

        mockPerformanceNow.mockReturnValue(duration);
        operation.end(true);
      });

      const stats = tracker.getStats();
      expect(stats.totalOperations).toBe(3);
      expect(stats.averageDuration).toBe(200); // (100 + 200 + 300) / 3
      expect(stats.successRate).toBe(1);
    });

    it('should track operations by type', () => {
      const tracker = performanceTracker;
      tracker.clear();

      // Add different operation types
      ['calculate', 'solve', 'calculate', 'graph'].forEach(operation => {
        const op = tracker.trackMathOperation(operation);
        op.start();
        op.end(true);
      });

      const stats = tracker.getStats();
      expect(stats.operationsByType.calculate).toBe(2);
      expect(stats.operationsByType.solve).toBe(1);
      expect(stats.operationsByType.graph).toBe(1);
    });

    it('should track component render performance', () => {
      const tracker = performanceTracker;
      tracker.clear();

      act(() => {
        tracker.trackComponentRender('TestComponent', 16.7, false);
        tracker.trackComponentRender('TestComponent', 33.3, true);
      });

      const renderStats = tracker.getRenderStats();
      const componentStats = renderStats.find(
        s => s.componentName === 'TestComponent'
      );

      expect(componentStats).toBeDefined();
      expect(componentStats!.renderCount).toBe(2);
      expect(componentStats!.averageRenderTime).toBe(25); // (16.7 + 33.3) / 2
      expect(componentStats!.propsChanges).toBe(1);
    });
  });
});
