import { Component, ReactNode, useState, useCallback, useEffect } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Wrench,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'wouter';
import {
  errorLogger,
  ErrorCategory,
  ErrorSeverity,
  categorizeError,
  determineSeverity,
} from '../../../lib/errorLogging';
import { mathErrorHandler } from '../../../lib/math/error-handler';

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

    // Enhanced error logging with categorization
    const category = categorizeError(error);
    const severity = determineSeverity(error, category);

    errorLogger.logError(error, errorInfo, category, severity, {
      toolName: this.props.toolName,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  getErrorMessage = (): string => {
    if (!this.state.error) {
      return 'Something went wrong with this tool.';
    }

    const message = this.state.error.message.toLowerCase();
    const toolName = this.props.toolName || 'tool';

    // Provide context-specific error messages
    if (message.includes('jsxgraph')) {
      return `The ${toolName} visualization engine failed to load. This might be due to a browser compatibility issue or network problem.`;
    }

    if (message.includes('math') || message.includes('calculate')) {
      return `The ${toolName} encountered a mathematical error. This could be due to invalid input or a calculation that's too complex.`;
    }

    if (message.includes('network') || message.includes('fetch')) {
      return `The ${toolName} couldn't load required resources. Please check your internet connection.`;
    }

    if (message.includes('memory') || message.includes('stack')) {
      return `The ${toolName} ran out of memory. Try using simpler calculations or refresh the page.`;
    }

    return `The ${toolName} encountered an unexpected error. This might be temporary.`;
  };

  getSuggestedActions = (): string[] => {
    if (!this.state.error) {
      return ['Try refreshing the page'];
    }

    const message = this.state.error.message.toLowerCase();
    const actions: string[] = [];

    if (message.includes('jsxgraph') || message.includes('visualization')) {
      actions.push(
        'Try refreshing the page to reload the visualization engine',
        'Check if your browser supports modern JavaScript features',
        'Disable browser extensions that might block scripts'
      );
    } else if (message.includes('math') || message.includes('calculate')) {
      actions.push(
        'Check your mathematical expression for errors',
        'Try using simpler calculations',
        'Ensure all parentheses are properly matched'
      );
    } else if (message.includes('network') || message.includes('fetch')) {
      actions.push(
        'Check your internet connection',
        'Try again in a few moments',
        'Disable any ad blockers or security extensions'
      );
    } else if (message.includes('memory') || message.includes('stack')) {
      actions.push(
        'Close other browser tabs to free up memory',
        'Try using smaller numbers or simpler expressions',
        'Refresh the page and try again'
      );
    }

    // Always include these general actions
    actions.push(
      'Try using a different browser if the problem persists',
      'Contact support if this error continues to occur'
    );

    return actions.slice(0, 4); // Limit to 4 actions to avoid overwhelming the user
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className='flex flex-col items-center justify-center p-8 bg-card border border-destructive/20 rounded-lg'>
          <AlertTriangle className='w-12 h-12 text-destructive mb-4' />

          <h3 className='text-lg font-semibold text-foreground mb-2'>
            {this.props.toolName
              ? `${this.props.toolName} Error`
              : 'Tool Error'}
          </h3>

          <p className='text-sm text-muted-foreground text-center mb-4 max-w-md'>
            {this.getErrorMessage()}
          </p>

          {/* Suggested Actions */}
          {this.getSuggestedActions().length > 0 && (
            <div className='mb-6 max-w-md'>
              <h4 className='text-sm font-medium text-foreground mb-2 flex items-center gap-2'>
                <HelpCircle className='w-4 h-4' />
                Try these solutions:
              </h4>
              <ul className='text-xs text-muted-foreground space-y-1'>
                {this.getSuggestedActions().map((action, index) => (
                  <li key={index} className='flex items-start gap-2'>
                    <span className='inline-block w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0'></span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className='flex flex-col sm:flex-row gap-3 mb-6'>
            <button
              onClick={this.handleRetry}
              className='inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            >
              <RefreshCw className='w-4 h-4' />
              Try Again
            </button>

            <Link
              href='/tools'
              className='inline-flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            >
              <Wrench className='w-4 h-4' />
              Other Tools
            </Link>
          </div>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className='w-full max-w-2xl'>
              <summary className='cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground mb-2'>
                Error Details (Development)
              </summary>
              <div className='p-4 bg-muted/50 rounded border text-xs font-mono text-left overflow-auto'>
                <div className='mb-2'>
                  <strong>Error:</strong> {this.state.error.message}
                </div>
                <div className='mb-2'>
                  <strong>Stack:</strong>
                  <pre className='whitespace-pre-wrap mt-1'>
                    {this.state.error.stack}
                  </pre>
                </div>
                {this.state.errorInfo && (
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className='whitespace-pre-wrap mt-1'>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          {/* Help Text */}
          <div className='mt-4 p-3 bg-muted/30 rounded text-center'>
            <p className='text-xs text-muted-foreground'>
              If this error persists, try refreshing the page or
              <Link
                href='/'
                className='text-primary hover:text-primary/80 font-medium mx-1'
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

// Hook version for functional components with enhanced error handling
export function useToolErrorHandler(toolName?: string) {
  const [error, setError] = useState<Error | null>(null);
  const [errorMetadata, setErrorMetadata] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);

  const resetError = useCallback(() => {
    setError(null);
    setErrorMetadata(null);
    setRetryCount(0);
  }, []);

  const handleError = useCallback(
    (error: Error, operation?: string, input?: string) => {
      const category = categorizeError(error);
      const severity = determineSeverity(error, category);
      
      // Log the error with enhanced context
      const errorId = errorLogger.logGeneralError(error, category, severity, {
        toolName,
        operation,
        input,
        retryCount,
        timestamp: new Date().toISOString(),
      });

      // Get enhanced error information
      const errorResult = mathErrorHandler.handleError(
        error,
        operation || 'unknown',
        input || '',
        { operation: operation || 'unknown', input: input || '', timestamp: new Date() }
      );

      setError(error);
      setErrorMetadata({
        errorId,
        category,
        severity,
        suggestedActions: errorResult.metadata?.suggestedActions || [],
        userFriendlyMessage: errorResult.error,
      });
      setRetryCount(prev => prev + 1);
    },
    [toolName, retryCount]
  );

  const handleMathError = useCallback(
    (error: Error, operation: string, input: string) => {
      const result = mathErrorHandler.handleError(error, operation, input);
      
      setError(error);
      setErrorMetadata({
        operation,
        input,
        fallbackResult: result.result,
        suggestedActions: result.metadata?.suggestedActions || [],
        userFriendlyMessage: result.error,
      });
      setRetryCount(prev => prev + 1);

      return result;
    },
    [toolName]
  );

  const handleValidationError = useCallback(
    (input: string, validationType: string, error: Error | string) => {
      return mathErrorHandler.handleValidation(input, validationType, error);
    },
    []
  );

  const retryOperation = useCallback(
    async <T>(operation: () => Promise<T> | T): Promise<T> => {
      try {
        const result = await operation();
        resetError(); // Clear error on success
        return result;
      } catch (error) {
        if (error instanceof Error) {
          handleError(error);
        }
        throw error;
      }
    },
    [handleError, resetError]
  );

  useEffect(() => {
    if (error && retryCount < 3) {
      // Auto-reset error after delay (with exponential backoff)
      const delay = Math.min(5000 * Math.pow(2, retryCount), 30000); // Max 30 seconds
      const timer = setTimeout(() => {
        resetError();
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [error, retryCount, resetError]);

  return { 
    error, 
    errorMetadata,
    retryCount,
    handleError, 
    handleMathError,
    handleValidationError,
    retryOperation,
    resetError,
    canRetry: retryCount < 3,
  };
}
