import React, { Component, ErrorInfo, ReactNode } from 'react';

interface MathRenderingErrorBoundaryProps {
  children: ReactNode;
  /** Fallback component to render when error occurs */
  fallback?: ReactNode;
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Whether to show error details in development */
  showErrorDetails?: boolean;
}

interface MathRenderingErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error boundary specifically designed for math rendering components
 * Provides graceful fallback when MathJax or math expression rendering fails
 */
export class MathRenderingErrorBoundary extends Component<
  MathRenderingErrorBoundaryProps,
  MathRenderingErrorBoundaryState
> {
  constructor(props: MathRenderingErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<MathRenderingErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('MathRenderingErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error callback
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div 
          className="math-error-boundary p-4 border border-red-300 dark:border-red-700 rounded-lg bg-red-50 dark:bg-red-950/20"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Math Rendering Error
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                There was a problem displaying the mathematical expression. This might be due to:
              </p>
              <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside space-y-1">
                <li>MathJax library failed to load</li>
                <li>Invalid LaTeX syntax in the expression</li>
                <li>Network connectivity issues</li>
              </ul>
              
              {this.props.showErrorDetails && this.state.error && (
                <details className="mt-3">
                  <summary className="text-sm font-medium text-red-800 dark:text-red-200 cursor-pointer">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-2 rounded overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              
              <div className="mt-3">
                <button
                  type="button"
                  onClick={this.handleRetry}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based wrapper for the MathRenderingErrorBoundary
 * Provides a more convenient way to wrap components with error boundary
 */
export function withMathErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<MathRenderingErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <MathRenderingErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </MathRenderingErrorBoundary>
  );

  WrappedComponent.displayName = `withMathErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}