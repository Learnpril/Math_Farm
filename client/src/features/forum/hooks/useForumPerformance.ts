/**
 * Performance monitoring hook for forum components
 * Tracks rendering performance, memory usage, and user interactions
 */

import { useEffect, useRef, useState, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  componentCount: number;
  lastUpdate: number;
}

interface ForumPerformanceOptions {
  enableMemoryTracking?: boolean;
  enableRenderTracking?: boolean;
  sampleRate?: number; // 0-1, percentage of renders to track
}

/**
 * Hook for monitoring forum component performance
 */
export function useForumPerformance(
  componentName: string,
  options: ForumPerformanceOptions = {}
) {
  const {
    enableMemoryTracking = true,
    enableRenderTracking = true,
    sampleRate = 0.1, // Track 10% of renders by default
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    componentCount: 0,
    lastUpdate: Date.now(),
  });

  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);
  const shouldTrack = useRef<boolean>(false);

  // Start render timing
  const startRenderTracking = useCallback(() => {
    if (!enableRenderTracking) return;

    // Sample renders based on sampleRate
    shouldTrack.current = Math.random() < sampleRate;

    if (shouldTrack.current) {
      renderStartTime.current = performance.now();
    }
  }, [enableRenderTracking, sampleRate]);

  // End render timing
  const endRenderTracking = useCallback(() => {
    if (!enableRenderTracking || !shouldTrack.current) return;

    const renderTime = performance.now() - renderStartTime.current;
    renderCount.current++;

    setMetrics(prev => ({
      ...prev,
      renderTime,
      componentCount: renderCount.current,
      lastUpdate: Date.now(),
    }));

    // Log performance warnings
    if (renderTime > 16) {
      // More than one frame at 60fps
      console.warn(
        `Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`
      );
    }
  }, [enableRenderTracking, componentName]);

  // Memory usage tracking
  const trackMemoryUsage = useCallback(() => {
    if (!enableMemoryTracking || !('memory' in performance)) return;

    const memory = (performance as any).memory;
    if (memory) {
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memory.usedJSHeapSize / 1024 / 1024, // MB
      }));
    }
  }, [enableMemoryTracking]);

  // Track memory usage periodically
  useEffect(() => {
    if (!enableMemoryTracking) return;

    const interval = setInterval(trackMemoryUsage, 5000); // Every 5 seconds
    return () => clearInterval(interval);
  }, [enableMemoryTracking, trackMemoryUsage]);

  // Performance observer for long tasks
  useEffect(() => {
    if (!enableRenderTracking || typeof PerformanceObserver === 'undefined')
      return;

    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          // Long task threshold
          console.warn(
            `Long task detected in ${componentName}: ${entry.duration.toFixed(2)}ms`
          );
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      // Long task API not supported
    }

    return () => observer.disconnect();
  }, [enableRenderTracking, componentName]);

  return {
    metrics,
    startRenderTracking,
    endRenderTracking,
    trackMemoryUsage,
  };
}

/**
 * Hook for tracking virtualized list performance
 */
export function useVirtualizedListPerformance(
  listName: string,
  itemCount: number,
  visibleItemCount: number
) {
  const [scrollPerformance, setScrollPerformance] = useState({
    averageScrollTime: 0,
    maxScrollTime: 0,
    scrollEventCount: 0,
  });

  const scrollTimes = useRef<number[]>([]);
  const lastScrollTime = useRef<number>(0);

  const trackScrollPerformance = useCallback(
    (scrollTop: number) => {
      const now = performance.now();

      if (lastScrollTime.current > 0) {
        const scrollTime = now - lastScrollTime.current;
        scrollTimes.current.push(scrollTime);

        // Keep only last 100 measurements
        if (scrollTimes.current.length > 100) {
          scrollTimes.current.shift();
        }

        const averageScrollTime =
          scrollTimes.current.reduce((a, b) => a + b, 0) /
          scrollTimes.current.length;
        const maxScrollTime = Math.max(...scrollTimes.current);

        setScrollPerformance({
          averageScrollTime,
          maxScrollTime,
          scrollEventCount: scrollTimes.current.length,
        });

        // Warn about slow scrolling
        if (scrollTime > 16) {
          console.warn(
            `Slow scroll detected in ${listName}: ${scrollTime.toFixed(2)}ms`
          );
        }
      }

      lastScrollTime.current = now;
    },
    [listName]
  );

  const getVirtualizationEfficiency = useCallback(() => {
    if (itemCount === 0) return 100;
    return ((itemCount - visibleItemCount) / itemCount) * 100;
  }, [itemCount, visibleItemCount]);

  return {
    scrollPerformance,
    trackScrollPerformance,
    virtualizationEfficiency: getVirtualizationEfficiency(),
  };
}

/**
 * Hook for tracking image loading performance
 */
export function useImageLoadingPerformance() {
  const [imageMetrics, setImageMetrics] = useState({
    totalImages: 0,
    loadedImages: 0,
    failedImages: 0,
    averageLoadTime: 0,
    cacheHitRate: 0,
  });

  const loadTimes = useRef<number[]>([]);
  const cacheHits = useRef<number>(0);
  const totalRequests = useRef<number>(0);

  const trackImageLoad = useCallback(
    (src: string, loadTime: number, fromCache: boolean = false) => {
      totalRequests.current++;

      if (fromCache) {
        cacheHits.current++;
      }

      loadTimes.current.push(loadTime);

      // Keep only last 50 measurements
      if (loadTimes.current.length > 50) {
        loadTimes.current.shift();
      }

      const averageLoadTime =
        loadTimes.current.reduce((a, b) => a + b, 0) / loadTimes.current.length;
      const cacheHitRate = (cacheHits.current / totalRequests.current) * 100;

      setImageMetrics(prev => ({
        ...prev,
        totalImages: totalRequests.current,
        loadedImages: prev.loadedImages + 1,
        averageLoadTime,
        cacheHitRate,
      }));

      // Warn about slow image loading
      if (loadTime > 1000 && !fromCache) {
        console.warn(`Slow image load: ${src} took ${loadTime}ms`);
      }
    },
    []
  );

  const trackImageError = useCallback((src: string) => {
    setImageMetrics(prev => ({
      ...prev,
      failedImages: prev.failedImages + 1,
    }));

    console.warn(`Failed to load image: ${src}`);
  }, []);

  return {
    imageMetrics,
    trackImageLoad,
    trackImageError,
  };
}

/**
 * Hook for tracking code splitting performance
 */
export function useCodeSplittingPerformance() {
  const [chunkMetrics, setChunkMetrics] = useState({
    chunksLoaded: 0,
    totalLoadTime: 0,
    averageChunkSize: 0,
    failedChunks: 0,
  });

  const chunkLoadTimes = useRef<number[]>([]);
  const chunkSizes = useRef<number[]>([]);

  const trackChunkLoad = useCallback(
    (chunkName: string, loadTime: number, size?: number) => {
      chunkLoadTimes.current.push(loadTime);

      if (size) {
        chunkSizes.current.push(size);
      }

      const totalLoadTime = chunkLoadTimes.current.reduce((a, b) => a + b, 0);
      const averageChunkSize =
        chunkSizes.current.length > 0
          ? chunkSizes.current.reduce((a, b) => a + b, 0) /
            chunkSizes.current.length
          : 0;

      setChunkMetrics(prev => ({
        ...prev,
        chunksLoaded: chunkLoadTimes.current.length,
        totalLoadTime,
        averageChunkSize,
      }));

      // Log chunk loading performance
      console.log(
        `Chunk loaded: ${chunkName} in ${loadTime}ms${size ? ` (${(size / 1024).toFixed(1)}KB)` : ''}`
      );

      // Warn about slow chunk loading
      if (loadTime > 2000) {
        console.warn(`Slow chunk load: ${chunkName} took ${loadTime}ms`);
      }
    },
    []
  );

  const trackChunkError = useCallback((chunkName: string, error: Error) => {
    setChunkMetrics(prev => ({
      ...prev,
      failedChunks: prev.failedChunks + 1,
    }));

    console.error(`Failed to load chunk: ${chunkName}`, error);
  }, []);

  return {
    chunkMetrics,
    trackChunkLoad,
    trackChunkError,
  };
}

/**
 * Comprehensive forum performance monitoring
 */
export function useForumPerformanceMonitor(componentName: string) {
  const componentPerf = useForumPerformance(componentName);
  const imagePerf = useImageLoadingPerformance();
  const chunkPerf = useCodeSplittingPerformance();

  const getPerformanceReport = useCallback(() => {
    return {
      component: {
        name: componentName,
        ...componentPerf.metrics,
      },
      images: imagePerf.imageMetrics,
      chunks: chunkPerf.chunkMetrics,
      timestamp: Date.now(),
    };
  }, [
    componentName,
    componentPerf.metrics,
    imagePerf.imageMetrics,
    chunkPerf.chunkMetrics,
  ]);

  const logPerformanceReport = useCallback(() => {
    const report = getPerformanceReport();
    console.group(`Performance Report: ${componentName}`);
    console.table(report.component);
    console.table(report.images);
    console.table(report.chunks);
    console.groupEnd();
  }, [getPerformanceReport, componentName]);

  return {
    ...componentPerf,
    ...imagePerf,
    ...chunkPerf,
    getPerformanceReport,
    logPerformanceReport,
  };
}
