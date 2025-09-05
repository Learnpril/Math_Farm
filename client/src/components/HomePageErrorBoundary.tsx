import React, { Component, ErrorInfo, ReactNode } from "react";

interface HomePageErrorBoundaryProps {
  children: ReactNode;
  /** Fallback component to render when error occurs */
  fallback?: ReactNode;
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Whether to show error details in development */
  showErrorDetails?: boolean;
}

interface HomePageErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

/**
 * Top-level error boundary for the Home page
 * Provides comprehensive error handling with graceful degradation
 */
export class HomePageErrorBoundary extends Component<
  HomePageErrorBoundaryProps,
  HomePageErrorBoundaryState
> {
  private maxRetries = 3;

  constructor(props: HomePageErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(
    error: Error
  ): Partial<HomePageErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error("HomePageErrorBoundary caught an error:", {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    this.setState({
      error,
      errorInfo,
    });

    // Call optional error callback
    this.props.onError?.(error, errorInfo);

    // Report to error tracking service if available (console only for now)
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // For now, just log to console. In the future, this could send to a logging service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryCount: this.state.retryCount,
    };

    console.group("🚨 Home Page Error Report");
    console.error("Error:", error);
    console.error("Error Info:", errorInfo);
    console.table(errorReport);
    console.groupEnd();
  };

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState((prevState) => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default comprehensive fallback UI
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div
              className="error-boundary-container bg-card border border-destructive/20 rounded-lg p-8 shadow-lg"
              role="alert"
              aria-live="assertive"
            >
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-destructive"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
              </div>

              {/* Error Title */}
              <h1 className="text-2xl font-bold text-center text-foreground mb-4">
                Oops! Something went wrong
              </h1>

              {/* Error Description */}
              <p className="text-center text-muted-foreground mb-6">
                We encountered an unexpected error while loading the Math Farm
                home page. This might be due to a temporary issue or a problem
                with your browser.
              </p>

              {/* Troubleshooting Steps */}
              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-foreground mb-3">
                  Try these steps:
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Refresh the page to reload all resources
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Check your internet connection
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Clear your browser cache and cookies
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Try using a different browser
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {this.state.retryCount < this.maxRetries && (
                  <button
                    type="button"
                    onClick={this.handleRetry}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                  >
                    Try Again ({this.maxRetries - this.state.retryCount}{" "}
                    attempts left)
                  </button>
                )}

                <button
                  type="button"
                  onClick={this.handleReload}
                  className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition-colors"
                >
                  Reload Page
                </button>

                <button
                  type="button"
                  onClick={this.handleGoHome}
                  className="px-6 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
                >
                  Go to Home
                </button>
              </div>

              {/* Error Details for Development */}
              {this.props.showErrorDetails && this.state.error && (
                <details className="mt-6 border-t border-border pt-6">
                  <summary className="cursor-pointer font-medium text-foreground hover:text-primary transition-colors">
                    🔧 Error Details (Development Mode)
                  </summary>
                  <div className="mt-4 space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-foreground mb-2">
                        Error Message:
                      </h4>
                      <pre className="text-xs bg-muted p-3 rounded overflow-auto text-muted-foreground">
                        {this.state.error.message}
                      </pre>
                    </div>

                    {this.state.error.stack && (
                      <div>
                        <h4 className="font-medium text-sm text-foreground mb-2">
                          Stack Trace:
                        </h4>
                        <pre className="text-xs bg-muted p-3 rounded overflow-auto text-muted-foreground max-h-40">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}

                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <h4 className="font-medium text-sm text-foreground mb-2">
                          Component Stack:
                        </h4>
                        <pre className="text-xs bg-muted p-3 rounded overflow-auto text-muted-foreground max-h-40">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Retry Count Warning */}
              {this.state.retryCount >= this.maxRetries && (
                <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive text-center">
                    Maximum retry attempts reached. Please reload the page or
                    contact support if the problem persists.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based wrapper for the HomePageErrorBoundary
 */
export function withHomePageErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<HomePageErrorBoundaryProps, "children">
) {
  const WrappedComponent = (props: P) => (
    <HomePageErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </HomePageErrorBoundary>
  );

  WrappedComponent.displayName = `withHomePageErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}
