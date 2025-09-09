import { useState, useEffect, useRef, ReactNode } from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import { SkeletonLoader } from "./SkeletonLoader";

interface ProgressiveLoaderProps {
  children: ReactNode;
  loadingText?: string;
  skeleton?: boolean;
  skeletonVariant?: "page" | "card" | "tool" | "topic" | "math";
  delay?: number;
  priority?: "high" | "normal" | "low";
  onLoad?: () => void;
}

export function ProgressiveLoader({
  children,
  loadingText = "Loading...",
  skeleton = false,
  skeletonVariant = "card",
  delay = 0,
  priority = "normal",
  onLoad,
}: ProgressiveLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!containerRef.current || priority === "high") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: priority === "low" ? "0px" : "100px",
        threshold: 0.1,
      }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [priority]);

  // Progressive loading with delay
  useEffect(() => {
    if (!isVisible) return;

    const loadDelay =
      priority === "high" ? 0 : priority === "normal" ? delay : delay + 200;

    const timer = setTimeout(() => {
      setIsLoaded(true);
      onLoad?.();
    }, loadDelay);

    return () => clearTimeout(timer);
  }, [isVisible, delay, priority, onLoad]);

  if (!isVisible || !isLoaded) {
    return (
      <div ref={containerRef} className="progressive-loader">
        {skeleton ? (
          <SkeletonLoader variant={skeletonVariant} />
        ) : (
          <div className="flex items-center justify-center min-h-[100px]">
            <LoadingSpinner text={loadingText} />
          </div>
        )}
      </div>
    );
  }

  return <div ref={containerRef}>{children}</div>;
}

// Hook for progressive content loading
export function useProgressiveLoading(
  items: any[],
  batchSize: number = 5,
  delay: number = 100
) {
  const [loadedCount, setLoadedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadNextBatch = () => {
    if (loadedCount >= items.length || isLoading) return;

    setIsLoading(true);

    setTimeout(() => {
      setLoadedCount((prev) => Math.min(prev + batchSize, items.length));
      setIsLoading(false);
    }, delay);
  };

  useEffect(() => {
    if (loadedCount === 0 && items.length > 0) {
      loadNextBatch();
    }
  }, [items.length]);

  const loadedItems = items.slice(0, loadedCount);
  const hasMore = loadedCount < items.length;

  return {
    loadedItems,
    hasMore,
    isLoading,
    loadNextBatch,
    progress: items.length > 0 ? (loadedCount / items.length) * 100 : 0,
  };
}
