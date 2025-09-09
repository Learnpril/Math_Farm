// Simple test to verify lazy loading components work
import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { LazyWrapper } from "./components/LazyWrapper";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { SkeletonLoader } from "./components/SkeletonLoader";

// Test lazy component
const TestComponent = React.lazy(() =>
  Promise.resolve({
    default: () => <div>Lazy component loaded successfully!</div>,
  })
);

function TestApp() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Lazy Loading Test</h1>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Loading Spinner Test</h2>
        <LoadingSpinner text="Testing spinner..." />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Skeleton Loader Test</h2>
        <SkeletonLoader variant="card" />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Lazy Wrapper Test</h2>
        <LazyWrapper fallback="spinner" loadingText="Loading test component...">
          <TestComponent />
        </LazyWrapper>
      </div>
    </div>
  );
}

// Only run test if this file is executed directly
if (
  typeof window !== "undefined" &&
  window.location.search.includes("test=lazy")
) {
  const container = document.getElementById("root");
  if (container) {
    const root = createRoot(container);
    root.render(<TestApp />);
  }
}

export { TestApp };
