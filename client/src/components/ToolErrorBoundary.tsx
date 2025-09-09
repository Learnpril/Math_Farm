import { Component, ReactNode, useState, useCallback, useEffect } from "react";
import { AlertTriangle, RefreshCw, Home, Wrench } from "lucide-react";
import { Link } from "wouter";

interface Props {
  children: ReactNode;
  toolName?: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any | null;
}

export class ToolErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error for debugging
    console.error(
      `Tool Error in ${this.props.toolName || "Unknown Tool"}:`,
      error,
      errorInfo
    );
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 bg-card border border-destructive/20 rounded-lg">
          <AlertTriangle className="w-12 h-12 text-destructive mb-4" />

          <h3 className="text-lg font-semibold text-foreground mb-2">
            {this.props.toolName
              ? `${this.props.toolName} Error`
              : "Tool Error"}
          </h3>

          <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
            Something went wrong with this tool. This might be due to a library
            loading issue or an unexpected error in the calculation.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>

            <Link
              href="/tools"
              className="inline-flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Wrench className="w-4 h-4" />
              Other Tools
            </Link>
          </div>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === "development" && this.state.error && (
            <details className="w-full max-w-2xl">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground mb-2">
                Error Details (Development)
              </summary>
              <div className="p-4 bg-muted/50 rounded border text-xs font-mono text-left overflow-auto">
                <div className="mb-2">
                  <strong>Error:</strong> {this.state.error.message}
                </div>
                <div className="mb-2">
                  <strong>Stack:</strong>
                  <pre className="whitespace-pre-wrap mt-1">
                    {this.state.error.stack}
                  </pre>
                </div>
                {this.state.errorInfo && (
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="whitespace-pre-wrap mt-1">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          {/* Help Text */}
          <div className="mt-4 p-3 bg-muted/30 rounded text-center">
            <p className="text-xs text-muted-foreground">
              If this error persists, try refreshing the page or
              <Link
                href="/"
                className="text-primary hover:text-primary/80 font-medium mx-1"
              >
                return to the home page
              </Link>
              .
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useToolErrorHandler(toolName?: string) {
  const [error, setError] = useState<Error | null>(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback(
    (error: Error) => {
      console.error(`Tool Error in ${toolName || "Unknown Tool"}:`, error);
      setError(error);
    },
    [toolName]
  );

  useEffect(() => {
    if (error) {
      // Auto-reset error after 10 seconds
      const timer = setTimeout(() => {
        setError(null);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  return { error, handleError, resetError };
}
