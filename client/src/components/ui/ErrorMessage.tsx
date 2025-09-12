import React from 'react';
import {
  AlertTriangle,
  RefreshCw,
  HelpCircle,
  ExternalLink,
  X,
} from 'lucide-react';
import { ErrorSeverity } from '../../lib/errorLogging';

interface ErrorMessageProps {
  /** The error message to display */
  message: string;
  /** Error severity level */
  severity?: ErrorSeverity;
  /** Optional title for the error */
  title?: string;
  /** List of suggested actions */
  suggestedActions?: string[];
  /** Whether the error can be dismissed */
  dismissible?: boolean;
  /** Callback when error is dismissed */
  onDismiss?: () => void;
  /** Whether to show retry button */
  showRetry?: boolean;
  /** Callback for retry action */
  onRetry?: () => void;
  /** Whether retry is disabled */
  retryDisabled?: boolean;
  /** Additional help text or link */
  helpText?: string;
  /** Help link URL */
  helpLink?: string;
  /** Custom icon to display */
  icon?: React.ReactNode;
  /** Whether to show in compact mode */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function ErrorMessage({
  message,
  severity = ErrorSeverity.MEDIUM,
  title,
  suggestedActions = [],
  dismissible = false,
  onDismiss,
  showRetry = false,
  onRetry,
  retryDisabled = false,
  helpText,
  helpLink,
  icon,
  compact = false,
  className = '',
}: ErrorMessageProps) {
  const getSeverityStyles = () => {
    switch (severity) {
      case ErrorSeverity.LOW:
        return {
          container:
            'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
          icon: 'text-yellow-600 dark:text-yellow-400',
          title: 'text-yellow-800 dark:text-yellow-200',
          text: 'text-yellow-700 dark:text-yellow-300',
        };
      case ErrorSeverity.MEDIUM:
        return {
          container:
            'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800',
          icon: 'text-orange-600 dark:text-orange-400',
          title: 'text-orange-800 dark:text-orange-200',
          text: 'text-orange-700 dark:text-orange-300',
        };
      case ErrorSeverity.HIGH:
        return {
          container:
            'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
          icon: 'text-red-600 dark:text-red-400',
          title: 'text-red-800 dark:text-red-200',
          text: 'text-red-700 dark:text-red-300',
        };
      case ErrorSeverity.CRITICAL:
        return {
          container:
            'bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-700',
          icon: 'text-red-700 dark:text-red-300',
          title: 'text-red-900 dark:text-red-100',
          text: 'text-red-800 dark:text-red-200',
        };
      default:
        return {
          container:
            'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800',
          icon: 'text-gray-600 dark:text-gray-400',
          title: 'text-gray-800 dark:text-gray-200',
          text: 'text-gray-700 dark:text-gray-300',
        };
    }
  };

  const styles = getSeverityStyles();
  const defaultIcon = <AlertTriangle className='w-5 h-5' />;

  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 p-2 rounded border ${styles.container} ${className}`}
      >
        <div className={styles.icon}>{icon || defaultIcon}</div>
        <span className={`text-sm ${styles.text} flex-1`}>{message}</span>
        {showRetry && (
          <button
            onClick={onRetry}
            disabled={retryDisabled}
            className={`p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${
              retryDisabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title='Retry'
          >
            <RefreshCw className='w-4 h-4' />
          </button>
        )}
        {dismissible && (
          <button
            onClick={onDismiss}
            className='p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors'
            title='Dismiss'
          >
            <X className='w-4 h-4' />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border p-4 ${styles.container} ${className}`}
      role='alert'
    >
      <div className='flex items-start gap-3'>
        {/* Icon */}
        <div className={`flex-shrink-0 ${styles.icon}`}>
          {icon || defaultIcon}
        </div>

        <div className='flex-1 min-w-0'>
          {/* Title */}
          {title && (
            <h3 className={`font-semibold mb-1 ${styles.title}`}>{title}</h3>
          )}

          {/* Message */}
          <p className={`text-sm ${styles.text} mb-3`}>{message}</p>

          {/* Suggested Actions */}
          {suggestedActions.length > 0 && (
            <div className='mb-3'>
              <h4
                className={`text-sm font-medium mb-2 ${styles.title} flex items-center gap-1`}
              >
                <HelpCircle className='w-4 h-4' />
                Suggested solutions:
              </h4>
              <ul className={`text-sm ${styles.text} space-y-1`}>
                {suggestedActions.map((action, index) => (
                  <li key={index} className='flex items-start gap-2'>
                    <span className='inline-block w-1.5 h-1.5 bg-current rounded-full mt-2 flex-shrink-0 opacity-60'></span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Help Text */}
          {helpText && (
            <div className={`text-xs ${styles.text} opacity-80 mb-3`}>
              {helpText}
              {helpLink && (
                <a
                  href={helpLink}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1 ml-2 underline hover:no-underline'
                >
                  Learn more
                  <ExternalLink className='w-3 h-3' />
                </a>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className='flex flex-wrap gap-2'>
            {showRetry && (
              <button
                onClick={onRetry}
                disabled={retryDisabled}
                className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  retryDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                } ${styles.text}`}
              >
                <RefreshCw className='w-4 h-4' />
                Try Again
              </button>
            )}

            {dismissible && (
              <button
                onClick={onDismiss}
                className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${styles.text}`}
              >
                <X className='w-4 h-4' />
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Specialized error message for math operations
 */
export function MathErrorMessage({
  operation,
  input,
  error,
  fallbackResult,
  onRetry,
  onDismiss,
  ...props
}: {
  operation: string;
  input: string;
  error: string;
  fallbackResult?: any;
  onRetry?: () => void;
  onDismiss?: () => void;
} & Omit<ErrorMessageProps, 'message' | 'title' | 'suggestedActions'>) {
  const title = `${operation.charAt(0).toUpperCase() + operation.slice(1)} Error`;

  const suggestedActions = [
    'Check your mathematical expression for syntax errors',
    'Ensure all parentheses are properly matched',
    'Try using simpler mathematical operations',
    'Verify that all variables and functions are defined',
  ];

  return (
    <ErrorMessage
      title={title}
      message={error}
      suggestedActions={suggestedActions}
      showRetry={!!onRetry}
      onRetry={onRetry}
      dismissible={!!onDismiss}
      onDismiss={onDismiss}
      helpText={
        fallbackResult ? `Fallback result: ${fallbackResult}` : undefined
      }
      {...props}
    />
  );
}

/**
 * Specialized error message for validation errors
 */
export function ValidationErrorMessage({
  input,
  validationType,
  error,
  onFix,
  ...props
}: {
  input: string;
  validationType: string;
  error: string;
  onFix?: () => void;
} & Omit<ErrorMessageProps, 'message' | 'title' | 'severity'>) {
  const title = `${validationType.charAt(0).toUpperCase() + validationType.slice(1)} Validation Error`;

  const suggestedActions = [
    'Remove any invalid characters from your input',
    'Check that mathematical symbols are used correctly',
    'Ensure the expression follows proper mathematical syntax',
  ];

  return (
    <ErrorMessage
      title={title}
      message={error}
      severity={ErrorSeverity.LOW}
      suggestedActions={suggestedActions}
      showRetry={!!onFix}
      onRetry={onFix}
      helpText={`Input: "${input.length > 50 ? input.substring(0, 50) + '...' : input}"`}
      {...props}
    />
  );
}
