import React, { createContext, useContext, ReactNode, ErrorInfo } from "react";
import {
  errorLogger,
  ErrorCategory,
  ErrorSeverity,
  categorizeError,
  determineSeverity,
} from "../lib/errorLogging";

interface ErrorBoundaryContextValue {
  /** Log an error manually */
  logError: (
    error: Error,
    category?: ErrorCategory,
    severity?: ErrorSeverity,
    additionalData?: Record<string, any>
  ) => string;

  /** Log a performance issue */
  logPerformanceIssue: (
    message: string,
    metric: string,
    value: number,
    threshold: number
  ) => string;

  /** Log a library loading failure */
  logLibraryFailure: (libraryName: string, error: Error) => string;

  /** Get all logged errors */
  getErrors: () => any[];

  /** Clear all errors */
  clearErrors: () => void;

  /** Export errors for debugging */
  exportErrors: () => string;
}

const ErrorBoundaryContext = createContext<ErrorBoundaryContextValue | null>(
  null
);

interface ErrorBoundaryProviderProps {
  children: ReactNode;
  /** Global error handler for unhandled errors */
  onGlobalError?: (error: Error, errorId: string) => void;
  /** Whether to enable development features */
  isDevelopment?: boolean;
}

/**
 * Provider component that sets up global error handling and logging
 */
export function ErrorBoundaryProvider({
  children,
  onGlobalError,
  isDevelopment = process.env.NODE_ENV === "development",
}: ErrorBoundaryProviderProps) {
  // Set up global error handlers
  React.useEffect(() => {
    const handleUnhandledError = (event: ErrorEvent) => {
      const error = event.error || new Error(event.message);
      const category = categorizeError(error);
      const severity = determineSeverity(error, category);

      const errorId = errorLogger.logGeneralError(error, category, severity, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        type: "unhandled_error",
      });

      onGlobalError?.(error, errorId);

      // Prevent default browser error handling in development
      if (isDevelopment) {
        event.preventDefault();
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason));

      const category = categorizeError(error);
      const severity = determineSeverity(error, category);

      const errorId = errorLogger.logGeneralError(error, category, severity, {
        type: "unhandled_promise_rejection",
      });

      onGlobalError?.(error, errorId);

      // Prevent default browser error handling in development
      if (isDevelopment) {
        event.preventDefault();
      }
    };

    // Add global error listeners
    window.addEventListener("error", handleUnhandledError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener("error", handleUnhandledError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, [onGlobalError, isDevelopment]);

  const contextValue: ErrorBoundaryContextValue = {
    logError: (error, category, severity, additionalData) => {
      const autoCategory = category || categorizeError(error);
      const autoSeverity = severity || determineSeverity(error, autoCategory);

      return errorLogger.logGeneralError(
        error,
        autoCategory,
        autoSeverity,
        additionalData
      );
    },

    logPerformanceIssue: (message, metric, value, threshold) => {
      return errorLogger.logPerformanceError(message, metric, value, threshold);
    },

    logLibraryFailure: (libraryName, error) => {
      return errorLogger.logLibraryError(libraryName, error);
    },

    getErrors: () => errorLogger.getErrors(),

    clearErrors: () => errorLogger.clearErrors(),

    exportErrors: () => errorLogger.exportErrors(),
  };

  return (
    <ErrorBoundaryContext.Provider value={contextValue}>
      {children}
    </ErrorBoundaryContext.Provider>
  );
}

/**
 * Hook to access error boundary context
 */
export function useErrorBoundary(): ErrorBoundaryContextValue {
  const context = useContext(ErrorBoundaryContext);

  if (!context) {
    throw new Error(
      "useErrorBoundary must be used within an ErrorBoundaryProvider"
    );
  }

  return context;
}

/**
 * Hook to manually trigger an error boundary
 * Useful for testing error boundaries or handling async errors
 */
export function useThrowError() {
  const [, setError] = React.useState<Error | null>(null);

  return React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
}

/**
 * Higher-order component that provides error boundary context
 */
export function withErrorBoundaryProvider<P extends object>(
  Component: React.ComponentType<P>,
  providerProps?: Omit<ErrorBoundaryProviderProps, "children">
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundaryProvider {...providerProps}>
      <Component {...props} />
    </ErrorBoundaryProvider>
  );

  WrappedComponent.displayName = `withErrorBoundaryProvider(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}

/**
 * Development-only error boundary testing component
 */
export function ErrorBoundaryTester({ children }: { children: ReactNode }) {
  const throwError = useThrowError();
  const { logError, getErrors, clearErrors, exportErrors } = useErrorBoundary();

  if (process.env.NODE_ENV !== "development") {
    return <>{children}</>;
  }

  const handleTestError = () => {
    throwError(new Error("Test error from ErrorBoundaryTester"));
  };

  const handleTestAsyncError = async () => {
    try {
      await new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Test async error")), 100);
      });
    } catch (error) {
      logError(
        error as Error,
        ErrorCategory.USER_INTERACTION,
        ErrorSeverity.LOW,
        {
          testType: "async_error",
        }
      );
    }
  };

  const handleExportErrors = () => {
    const errors = exportErrors();
    console.log("Exported Errors:", errors);

    // Create downloadable file
    const blob = new Blob([errors], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `math-farm-errors-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {children}

      {/* Development Error Testing Panel */}
      <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg p-4 shadow-lg z-50">
        <h3 className="text-sm font-semibold text-foreground mb-2">
          🔧 Error Testing
        </h3>
        <div className="space-y-2">
          <button
            onClick={handleTestError}
            className="block w-full px-3 py-1 text-xs bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
          >
            Test Error Boundary
          </button>

          <button
            onClick={handleTestAsyncError}
            className="block w-full px-3 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Test Async Error
          </button>

          <button
            onClick={handleExportErrors}
            className="block w-full px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Export Errors ({getErrors().length})
          </button>

          <button
            onClick={clearErrors}
            className="block w-full px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
          >
            Clear Errors
          </button>
        </div>
      </div>
    </>
  );
}
