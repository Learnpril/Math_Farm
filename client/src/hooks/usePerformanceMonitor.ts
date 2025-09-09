import { useEffect, useRef, useState, useCallback } from "react";

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
  componentCount: number;
  mathExpressionCount: number;
}

interface PerformanceMonitorOptions {
  trackMemory?: boolean;
  trackRender?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

export function usePerformanceMonitor(
  componentName: string,
  options: PerformanceMonitorOptions = {}
) {
  const { trackMemory = false, trackRender = true, onMetricsUpdate } = options;

  // Use useCallback to stabilize the callback
  const stableOnMetricsUpdate = useCallback(
    (metrics: PerformanceMetrics) => {
      onMetricsUpdate?.(metrics);
    },
    [onMetricsUpdate]
  );

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    componentCount: 0,
    mathExpressionCount: 0,
  });

  const startTime = useRef<number>(Date.now());
  const renderStartTime = useRef<number>(0);
  const isInitialized = useRef<boolean>(false);

  // Track component mount time
  useEffect(() => {
    if (!isInitialized.current) {
      const loadTime = Date.now() - startTime.current;

      setMetrics((prev) => {
        const newMetrics = { ...prev, loadTime };
        stableOnMetricsUpdate(newMetrics);
        return newMetrics;
      });

      isInitialized.current = true;
    }
  }, [stableOnMetricsUpdate]);

  // Track render performance - only run once on mount
  useEffect(() => {
    if (trackRender && !isInitialized.current) {
      renderStartTime.current = performance.now();

      // Use requestAnimationFrame to measure after render
      requestAnimationFrame(() => {
        const renderTime = performance.now() - renderStartTime.current;

        setMetrics((prev) => {
          const newMetrics = { ...prev, renderTime };
          stableOnMetricsUpdate(newMetrics);
          return newMetrics;
        });
      });
    }
  }, [trackRender, stableOnMetricsUpdate]);

  // Track memory usage (if supported)
  useEffect(() => {
    if (trackMemory && "memory" in performance) {
      const updateMemoryUsage = () => {
        const memoryInfo = (performance as any).memory;
        const memoryUsage = memoryInfo.usedJSHeapSize / 1024 / 1024; // MB

        setMetrics((prev) => {
          const newMetrics = { ...prev, memoryUsage };
          return newMetrics;
        });
      };

      updateMemoryUsage();
      const interval = setInterval(updateMemoryUsage, 5000); // Every 5 seconds

      return () => clearInterval(interval);
    }
  }, [trackMemory]);

  // Count components and math expressions
  const updateComponentCounts = () => {
    const componentCount = document.querySelectorAll("[data-component]").length;
    const mathExpressionCount = document.querySelectorAll(
      ".math-expression, mjx-container"
    ).length;

    setMetrics((prev) => {
      const newMetrics = { ...prev, componentCount, mathExpressionCount };
      onMetricsUpdate?.(newMetrics);
      return newMetrics;
    });
  };

  // Performance optimization suggestions
  const getOptimizationSuggestions = (): string[] => {
    const suggestions: string[] = [];

    if (metrics.loadTime > 2000) {
      suggestions.push("Consider lazy loading heavy components");
    }

    if (metrics.renderTime > 16) {
      // 60fps threshold
      suggestions.push("Render time exceeds 16ms - consider memoization");
    }

    if (metrics.memoryUsage && metrics.memoryUsage > 50) {
      suggestions.push("High memory usage detected - check for memory leaks");
    }

    if (metrics.mathExpressionCount > 10) {
      suggestions.push("Many math expressions - consider progressive loading");
    }

    if (metrics.componentCount > 100) {
      suggestions.push("High component count - consider virtualization");
    }

    return suggestions;
  };

  return {
    metrics,
    updateComponentCounts,
    getOptimizationSuggestions,
    isLoading: !isInitialized.current,
  };
}

// Hook for monitoring Core Web Vitals
export function useCoreWebVitals() {
  const [vitals, setVitals] = useState<{
    lcp?: number;
    fid?: number;
    cls?: number;
    fcp?: number;
    ttfb?: number;
  }>({});

  useEffect(() => {
    // Largest Contentful Paint (LCP)
    const observeLCP = () => {
      if ("PerformanceObserver" in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          setVitals((prev) => ({ ...prev, lcp: lastEntry.startTime }));
        });

        observer.observe({ entryTypes: ["largest-contentful-paint"] });
        return () => observer.disconnect();
      }
    };

    // First Contentful Paint (FCP)
    const observeFCP = () => {
      if ("PerformanceObserver" in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find(
            (entry) => entry.name === "first-contentful-paint"
          );
          if (fcpEntry) {
            setVitals((prev) => ({ ...prev, fcp: fcpEntry.startTime }));
          }
        });

        observer.observe({ entryTypes: ["paint"] });
        return () => observer.disconnect();
      }
    };

    // Cumulative Layout Shift (CLS)
    const observeCLS = () => {
      if ("PerformanceObserver" in window) {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
              setVitals((prev) => ({ ...prev, cls: clsValue }));
            }
          }
        });

        observer.observe({ entryTypes: ["layout-shift"] });
        return () => observer.disconnect();
      }
    };

    // Time to First Byte (TTFB)
    const measureTTFB = () => {
      if ("performance" in window && "getEntriesByType" in performance) {
        const navigationEntries = performance.getEntriesByType(
          "navigation"
        ) as PerformanceNavigationTiming[];
        if (navigationEntries.length > 0) {
          const ttfb =
            navigationEntries[0].responseStart -
            navigationEntries[0].requestStart;
          setVitals((prev) => ({ ...prev, ttfb }));
        }
      }
    };

    const cleanupFunctions = [observeLCP(), observeFCP(), observeCLS()].filter(
      Boolean
    );

    measureTTFB();

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup?.());
    };
  }, []);

  const getVitalsScore = () => {
    const scores = {
      lcp: vitals.lcp
        ? vitals.lcp <= 2500
          ? "good"
          : vitals.lcp <= 4000
          ? "needs-improvement"
          : "poor"
        : "unknown",
      fid: vitals.fid
        ? vitals.fid <= 100
          ? "good"
          : vitals.fid <= 300
          ? "needs-improvement"
          : "poor"
        : "unknown",
      cls: vitals.cls
        ? vitals.cls <= 0.1
          ? "good"
          : vitals.cls <= 0.25
          ? "needs-improvement"
          : "poor"
        : "unknown",
      fcp: vitals.fcp
        ? vitals.fcp <= 1800
          ? "good"
          : vitals.fcp <= 3000
          ? "needs-improvement"
          : "poor"
        : "unknown",
      ttfb: vitals.ttfb
        ? vitals.ttfb <= 800
          ? "good"
          : vitals.ttfb <= 1800
          ? "needs-improvement"
          : "poor"
        : "unknown",
    };

    return scores;
  };

  return {
    vitals,
    scores: getVitalsScore(),
  };
}
