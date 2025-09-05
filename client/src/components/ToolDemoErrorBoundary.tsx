import React, { Component, ErrorInfo, ReactNode } from "react";

interface ToolDemoErrorBoundaryProps {
  children: ReactNode;
  /** Name of the tool for better error messaging */
  toolName?: string;
  /** Fallback component to render when error occurs */
  fallback?: ReactNode;
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Whether to show error details in development */
  showErrorDetails?: boolean;
}

interface ToolDemoErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

/**
 * Error boundary specifically designed for interactive tool demonstrations
 * Handles JSXGraph, math.js, and other library initialization failures
 */
export class ToolDemoErrorBoundary extends Component<
  ToolDemoErrorBoundaryProps,
  ToolDemoErrorBoundaryState
> {
  private maxRetries = 2;

  constructor(props: ToolDemoErrorBoundaryProps) {
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
  ): Partial<ToolDemoErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const toolName = this.props.toolName || "Unknown Tool";

    // Log error details for debugging
    console.error(`ToolDemoErrorBoundary (${toolName}) caught an error:`, {
      toolName,
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      retryCount: this.state.retryCount,
    });

    this.setState({
      error,
      errorInfo,
    });

    // Call optional error callback
    this.props.onError?.(error, errorInfo);

    // Log specific tool error patterns
    this.logToolSpecificError(error, toolName);
  }

  private logToolSpecificError = (error: Error, toolName: string) => {
    const errorMessage = error.message.toLowerCase();
    let errorCategory = "Unknown";
    let possibleCauses: string[] = [];

    // Categorize common tool errors
    if (errorMessage.includes("jsxgraph") || errorMessage.includes("jsx")) {
      errorCategory = "JSXGraph Error";
      possibleCauses = [
        "JSXGraph library failed to load",
        "Invalid board configuration",
        "DOM element not found",
        "Browser compatibility issue",
      ];
    } else if (
      errorMessage.includes("math") ||
      errorMessage.includes("evaluate")
    ) {
      errorCategory = "Math.js Error";
      possibleCauses = [
        "Math.js library failed to load",
        "Invalid mathematical expression",
        "Unsupported operation",
        "Memory limit exceeded",
      ];
    } else if (
      errorMessage.includes("network") ||
      errorMessage.includes("fetch")
    ) {
      errorCategory = "Network Error";
      possibleCauses = [
        "Library CDN unavailable",
        "Network connectivity issues",
        "CORS policy blocking request",
      ];
    } else if (
      errorMessage.includes("canvas") ||
      errorMessage.includes("webgl")
    ) {
      errorCategory = "Graphics Error";
      possibleCauses = [
        "Canvas not supported",
        "WebGL not available",
        "Graphics driver issues",
      ];
    }

    console.group(`🔧 Tool Demo Error Analysis: ${toolName}`);
    console.error("Category:", errorCategory);
    console.error("Possible Causes:", possibleCauses);
    console.error("Original Error:", error);
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

  private getErrorSuggestions = (): string[] => {
    const error = this.state.error;
    if (!error) return [];

    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes("jsxgraph")) {
      return [
        "Try refreshing the page to reload JSXGraph",
        "Check if your browser supports modern JavaScript",
        "Disable browser extensions that might block scripts",
      ];
    }

    if (errorMessage.includes("math")) {
      return [
        "Verify the mathematical expression is valid",
        "Try a simpler calculation first",
        "Check if all required math libraries loaded",
      ];
    }

    if (errorMessage.includes("network")) {
      return [
        "Check your internet connection",
        "Try again in a few moments",
        "Contact your network administrator if on a restricted network",
      ];
    }

    return [
      "Try refreshing the page",
      "Check your browser console for more details",
      "Try using a different browser",
    ];
  };

  render() {
    if (this.state.hasError) {
      const toolName = this.props.toolName || "Interactive Tool";

      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default tool demo error UI
      return (
        <div
          className="tool-demo-error-boundary border border-destructive/20 rounded-lg p-6 bg-destructive/5"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start space-x-4">
            {/* Error Icon */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-destructive"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              {/* Error Title */}
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {toolName} Unavailable
              </h3>

              {/* Error Description */}
              <p className="text-muted-foreground mb-4">
                We're having trouble loading this interactive demonstration.
                This might be due to a library loading issue or browser
                compatibility.
              </p>

              {/* Error Suggestions */}
              <div className="mb-4">
                <h4 className="font-medium text-foreground mb-2 text-sm">
                  Suggestions:
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {this.getErrorSuggestions().map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {this.state.retryCount < this.maxRetries && (
                  <button
                    type="button"
                    onClick={this.handleRetry}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                  >
                    Try Again ({this.maxRetries - this.state.retryCount} left)
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 border border-border text-foreground rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
                >
                  Reload Page
                </button>
              </div>

              {/* Graceful Degradation Message */}
              <div className="mt-4 p-3 bg-muted/50 rounded-md">
                <p className="text-sm text-muted-foreground">
                  <strong>Alternative:</strong> While this interactive demo
                  isn't working, you can still explore other tools and
                  mathematical content on Math Farm. The core functionality
                  remains available.
                </p>
              </div>

              {/* Error Details for Development */}
              {this.props.showErrorDetails && this.state.error && (
                <details className="mt-4 border-t border-border pt-4">
                  <summary className="cursor-pointer text-sm font-medium text-foreground hover:text-primary transition-colors">
                    🔧 Technical Details
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">
                        Error:
                      </span>
                      <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto text-muted-foreground">
                        {this.state.error.message}
                      </pre>
                    </div>

                    {this.state.error.stack && (
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">
                          Stack:
                        </span>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto text-muted-foreground max-h-32">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Max Retries Warning */}
              {this.state.retryCount >= this.maxRetries && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive">
                    This tool demo is temporarily unavailable. Other Math Farm
                    features are still working normally.
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
 * Hook-based wrapper for the ToolDemoErrorBoundary
 */
export function withToolDemoErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  toolName?: string,
  errorBoundaryProps?: Omit<ToolDemoErrorBoundaryProps, "children" | "toolName">
) {
  const WrappedComponent = (props: P) => (
    <ToolDemoErrorBoundary toolName={toolName} {...errorBoundaryProps}>
      <Component {...props} />
    </ToolDemoErrorBoundary>
  );

  WrappedComponent.displayName = `withToolDemoErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}
