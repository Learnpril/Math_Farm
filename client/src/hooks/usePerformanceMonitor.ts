/**
 * Enhanced performance monitoring hook for math operations
 * Tracks operation times, memory usage, and component render performance
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface PerformanceMetric {
  id: string;
  operation: string;
  component?: string;
  duration: number;
  memoryBefore?: number;
  memoryAfter?: number;
  timestamp: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export interface PerformanceStats {
  totalOperations: number;
  averageDuration: number;
  successRate: number;
  memoryUsage: {
    current: number;
    peak: number;
    average: number;
  };
  operationsByType: Record<string, number>;
  recentMetrics: PerformanceMetric[];
}

export interface ComponentRenderMetric {
  componentName: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
  propsChanges: number;
}

class PerformanceTracker {
  private metrics: PerformanceMetric[] = [];
  private renderMetrics: Map<string, ComponentRenderMetric> = new Map();
  private readonly maxMetrics = 1000;
  private memoryPeaks: number[] = [];
  private listeners: Set<() => void> = new Set();

  /**
   * Track a math operation performance
   */
  trackMathOperation(
    operation: string,
    component?: string,
    metadata?: Record<string, any>
  ): {
    start: () => void;
    end: (success?: boolean, error?: string) => PerformanceMetric;
  } {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    let startTime: number;
    let memoryBefore: number | undefined;

    const start = () => {
      startTime = performance.now();
      memoryBefore = this.getCurrentMemoryUsage();
    };

    const end = (
      success: boolean = true,
      error?: string
    ): PerformanceMetric => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      const memoryAfter = this.getCurrentMemoryUsage();

      const metric: PerformanceMetric = {
        id,
        operation,
        component,
        duration,
        memoryBefore,
        memoryAfter,
        timestamp: Date.now(),
        success,
        error,
        metadata,
      };

      this.addMetric(metric);
      return metric;
    };

    return { start, end };
  }

  /**
   * Track component render performance
   */
  trackComponentRender(
    componentName: string,
    renderTime: number,
    propsChanged: boolean = false
  ): void {
    const existing = this.renderMetrics.get(componentName) || {
      componentName,
      renderCount: 0,
      totalRenderTime: 0,
      averageRenderTime: 0,
      lastRenderTime: 0,
      propsChanges: 0,
    };

    existing.renderCount++;
    existing.totalRenderTime += renderTime;
    existing.averageRenderTime =
      existing.totalRenderTime / existing.renderCount;
    existing.lastRenderTime = renderTime;

    if (propsChanged) {
      existing.propsChanges++;
    }

    this.renderMetrics.set(componentName, existing);
    this.notifyListeners();
  }

  /**
   * Get current memory usage (if available)
   */
  private getCurrentMemoryUsage(): number | undefined {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize;
    }
    return undefined;
  }

  /**
   * Add a performance metric
   */
  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Track memory peaks
    if (metric.memoryAfter) {
      this.memoryPeaks.push(metric.memoryAfter);
      if (this.memoryPeaks.length > 100) {
        this.memoryPeaks.shift();
      }
    }

    // Limit metrics array size
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    this.notifyListeners();
  }

  /**
   * Get performance statistics
   */
  getStats(): PerformanceStats {
    const recentMetrics = this.metrics.slice(-50);
    const successfulMetrics = this.metrics.filter(m => m.success);

    const totalDuration = successfulMetrics.reduce(
      (sum, m) => sum + m.duration,
      0
    );
    const averageDuration =
      successfulMetrics.length > 0
        ? totalDuration / successfulMetrics.length
        : 0;

    const operationsByType = this.metrics.reduce(
      (acc, metric) => {
        acc[metric.operation] = (acc[metric.operation] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const memoryValues = this.metrics
      .map(m => m.memoryAfter)
      .filter((m): m is number => m !== undefined);

    const currentMemory = this.getCurrentMemoryUsage() || 0;
    const peakMemory = Math.max(...this.memoryPeaks, 0);
    const averageMemory =
      memoryValues.length > 0
        ? memoryValues.reduce((sum, m) => sum + m, 0) / memoryValues.length
        : 0;

    return {
      totalOperations: this.metrics.length,
      averageDuration,
      successRate:
        this.metrics.length > 0
          ? successfulMetrics.length / this.metrics.length
          : 1,
      memoryUsage: {
        current: currentMemory,
        peak: peakMemory,
        average: averageMemory,
      },
      operationsByType,
      recentMetrics,
    };
  }

  /**
   * Get component render statistics
   */
  getRenderStats(): ComponentRenderMetric[] {
    return Array.from(this.renderMetrics.values());
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.renderMetrics.clear();
    this.memoryPeaks = [];
    this.notifyListeners();
  }

  /**
   * Subscribe to performance updates
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of updates
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

// Singleton instance
const performanceTracker = new PerformanceTracker();

/**
 * Hook for tracking math operation performance
 */
export function useMathOperationTracker() {
  const trackOperation = useCallback(
    (operation: string, component?: string, metadata?: Record<string, any>) => {
      return performanceTracker.trackMathOperation(
        operation,
        component,
        metadata
      );
    },
    []
  );

  return { trackOperation };
}

/**
 * Hook for tracking component render performance
 */
export function useRenderTracker(componentName: string) {
  const renderStartTime = useRef<number>();
  const previousProps = useRef<any>();

  const startRender = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  const endRender = useCallback(
    (currentProps?: any) => {
      if (renderStartTime.current) {
        const renderTime = performance.now() - renderStartTime.current;
        const propsChanged =
          previousProps.current !== undefined &&
          JSON.stringify(previousProps.current) !==
            JSON.stringify(currentProps);

        performanceTracker.trackComponentRender(
          componentName,
          renderTime,
          propsChanged
        );
        previousProps.current = currentProps;
      }
    },
    [componentName]
  );

  // Auto-track render on every render
  useEffect(() => {
    if (renderStartTime.current) {
      const renderTime = performance.now() - renderStartTime.current;
      performanceTracker.trackComponentRender(componentName, renderTime);
    }
  });

  return { startRender, endRender };
}

/**
 * Hook for accessing performance statistics
 */
export function usePerformanceStats() {
  const [stats, setStats] = useState<PerformanceStats>(() =>
    performanceTracker.getStats()
  );
  const [renderStats, setRenderStats] = useState<ComponentRenderMetric[]>(() =>
    performanceTracker.getRenderStats()
  );

  useEffect(() => {
    const updateStats = () => {
      setStats(performanceTracker.getStats());
      setRenderStats(performanceTracker.getRenderStats());
    };

    const unsubscribe = performanceTracker.subscribe(updateStats);

    // Update stats periodically
    const interval = setInterval(updateStats, 2000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const clearStats = useCallback(() => {
    performanceTracker.clear();
  }, []);

  return {
    stats,
    renderStats,
    clearStats,
  };
}

/**
 * Hook for memory usage monitoring
 */
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<{
    supported: boolean;
    current?: number;
    peak?: number;
    limit?: number;
  }>({ supported: false });

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMemoryInfo({
          supported: true,
          current: memory.usedJSHeapSize,
          peak: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
        });
      } else {
        setMemoryInfo({ supported: false });
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 1000);

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
}

export { performanceTracker };
