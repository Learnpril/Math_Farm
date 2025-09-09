import { Suspense, ComponentType } from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import { SkeletonLoader } from "./SkeletonLoader";

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: "spinner" | "skeleton";
  skeletonVariant?: "page" | "card" | "tool" | "topic" | "math";
  loadingText?: string;
  className?: string;
}

export function LazyWrapper({
  children,
  fallback = "spinner",
  skeletonVariant = "page",
  loadingText = "Loading component...",
  className = "",
}: LazyWrapperProps) {
  const fallbackComponent =
    fallback === "skeleton" ? (
      <SkeletonLoader variant={skeletonVariant} className={className} />
    ) : (
      <div
        className={`flex items-center justify-center min-h-[200px] ${className}`}
      >
        <LoadingSpinner text={loadingText} />
      </div>
    );

  return <Suspense fallback={fallbackComponent}>{children}</Suspense>;
}

// Higher-order component for wrapping lazy components
export function withLazyWrapper<P extends object>(
  Component: ComponentType<P>,
  options: Omit<LazyWrapperProps, "children"> = {}
) {
  return function WrappedComponent(props: P) {
    return (
      <LazyWrapper {...options}>
        <Component {...props} />
      </LazyWrapper>
    );
  };
}
