import { ErrorInfo } from 'react';

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Error categories for better organization
 */
export enum ErrorCategory {
  MATH_RENDERING = 'math_rendering',
  TOOL_DEMO = 'tool_demo',
  NETWORK = 'network',
  LIBRARY_LOADING = 'library_loading',
  USER_INTERACTION = 'user_interaction',
  PERFORMANCE = 'performance',
  ACCESSIBILITY = 'accessibility',
  UNKNOWN = 'unknown'
}

/**
 * Structured error report interface
 */
export interface ErrorReport {
  id: string;
  timestamp: string;
  message: string;
  stack?: string;
  componentStack?: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  context: {
    url: string;
    userAgent: string;
    viewport: {
      width: number;
      height: number;
    };
    theme: string;
    retryCount?: number;
    additionalData?: Record<string, any>;
  };
}

/**
 * Error logging utility class
 */
export class ErrorLogger {
  private static instance: ErrorLogger;
  private errorQueue: ErrorReport[] = [];
  private maxQueueSize = 50;

  private constructor() {}

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * Log an error with React error boundary information
   */
  logError(
    error: Error,
    errorInfo: ErrorInfo,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    additionalData?: Record<string, any>
  ): string {
    const errorReport = this.createErrorReport(
      error,
      category,
      severity,
      errorInfo.componentStack,
      additionalData
    );

    this.addToQueue(errorReport);
    this.logToConsole(errorReport);

    return errorReport.id;
  }

  /**
   * Log a general error without React context
   */
  logGeneralError(
    error: Error | string,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    additionalData?: Record<string, any>
  ): string {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    
    const errorReport = this.createErrorReport(
      errorObj,
      category,
      severity,
      undefined,
      additionalData
    );

    this.addToQueue(errorReport);
    this.logToConsole(errorReport);

    return errorReport.id;
  }

  /**
   * Log a performance-related error
   */
  logPerformanceError(
    message: string,
    metric: string,
    value: number,
    threshold: number,
    additionalData?: Record<string, any>
  ): string {
    const error = new Error(`Performance threshold exceeded: ${message}`);
    
    return this.logGeneralError(
      error,
      ErrorCategory.PERFORMANCE,
      ErrorSeverity.MEDIUM,
      {
        metric,
        value,
        threshold,
        ...additionalData
      }
    );
  }

  /**
   * Log a library loading failure
   */
  logLibraryError(
    libraryName: string,
    error: Error,
    additionalData?: Record<string, any>
  ): string {
    return this.logGeneralError(
      error,
      ErrorCategory.LIBRARY_LOADING,
      ErrorSeverity.HIGH,
      {
        libraryName,
        ...additionalData
      }
    );
  }

  /**
   * Get all logged errors
   */
  getErrors(): ErrorReport[] {
    return [...this.errorQueue];
  }

  /**
   * Get errors by category
   */
  getErrorsByCategory(category: ErrorCategory): ErrorReport[] {
    return this.errorQueue.filter(error => error.category === category);
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: ErrorSeverity): ErrorReport[] {
    return this.errorQueue.filter(error => error.severity === severity);
  }

  /**
   * Clear all logged errors
   */
  clearErrors(): void {
    this.errorQueue = [];
  }

  /**
   * Export errors as JSON for debugging
   */
  exportErrors(): string {
    return JSON.stringify(this.errorQueue, null, 2);
  }

  private createErrorReport(
    error: Error,
    category: ErrorCategory,
    severity: ErrorSeverity,
    componentStack?: string,
    additionalData?: Record<string, any>
  ): ErrorReport {
    const id = this.generateErrorId();
    const theme = this.getCurrentTheme();

    return {
      id,
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      componentStack,
      category,
      severity,
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        theme,
        additionalData,
      },
    };
  }

  private addToQueue(errorReport: ErrorReport): void {
    this.errorQueue.push(errorReport);
    
    // Keep queue size manageable
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  private logToConsole(errorReport: ErrorReport): void {
    const severityEmoji = {
      [ErrorSeverity.LOW]: '🟡',
      [ErrorSeverity.MEDIUM]: '🟠',
      [ErrorSeverity.HIGH]: '🔴',
      [ErrorSeverity.CRITICAL]: '💥'
    };

    const categoryEmoji = {
      [ErrorCategory.MATH_RENDERING]: '📐',
      [ErrorCategory.TOOL_DEMO]: '🔧',
      [ErrorCategory.NETWORK]: '🌐',
      [ErrorCategory.LIBRARY_LOADING]: '📚',
      [ErrorCategory.USER_INTERACTION]: '👆',
      [ErrorCategory.PERFORMANCE]: '⚡',
      [ErrorCategory.ACCESSIBILITY]: '♿',
      [ErrorCategory.UNKNOWN]: '❓'
    };

    console.group(
      `${severityEmoji[errorReport.severity]} ${categoryEmoji[errorReport.category]} Error Report [${errorReport.id}]`
    );
    
    console.error('Message:', errorReport.message);
    console.error('Category:', errorReport.category);
    console.error('Severity:', errorReport.severity);
    console.error('Timestamp:', errorReport.timestamp);
    
    if (errorReport.stack) {
      console.error('Stack Trace:', errorReport.stack);
    }
    
    if (errorReport.componentStack) {
      console.error('Component Stack:', errorReport.componentStack);
    }
    
    console.table(errorReport.context);
    
    if (errorReport.context.additionalData) {
      console.error('Additional Data:', errorReport.context.additionalData);
    }
    
    console.groupEnd();
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentTheme(): string {
    try {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    } catch {
      return 'unknown';
    }
  }
}

/**
 * Convenience function to get the error logger instance
 */
export const errorLogger = ErrorLogger.getInstance();

/**
 * Utility function to categorize errors based on error message
 */
export function categorizeError(error: Error): ErrorCategory {
  const message = error.message.toLowerCase();
  
  if (message.includes('mathjax') || message.includes('latex') || message.includes('math')) {
    return ErrorCategory.MATH_RENDERING;
  }
  
  if (message.includes('jsxgraph') || message.includes('tool') || message.includes('demo')) {
    return ErrorCategory.TOOL_DEMO;
  }
  
  if (message.includes('network') || message.includes('fetch') || message.includes('xhr')) {
    return ErrorCategory.NETWORK;
  }
  
  if (message.includes('load') || message.includes('import') || message.includes('module')) {
    return ErrorCategory.LIBRARY_LOADING;
  }
  
  if (message.includes('click') || message.includes('touch') || message.includes('input')) {
    return ErrorCategory.USER_INTERACTION;
  }
  
  if (message.includes('performance') || message.includes('timeout') || message.includes('memory')) {
    return ErrorCategory.PERFORMANCE;
  }
  
  if (message.includes('aria') || message.includes('accessibility') || message.includes('screen reader')) {
    return ErrorCategory.ACCESSIBILITY;
  }
  
  return ErrorCategory.UNKNOWN;
}

/**
 * Utility function to determine error severity based on error type
 */
export function determineSeverity(error: Error, category: ErrorCategory): ErrorSeverity {
  // Critical errors that break core functionality
  if (category === ErrorCategory.LIBRARY_LOADING || error.message.includes('chunk load')) {
    return ErrorSeverity.CRITICAL;
  }
  
  // High severity for math rendering and tool demos
  if (category === ErrorCategory.MATH_RENDERING || category === ErrorCategory.TOOL_DEMO) {
    return ErrorSeverity.HIGH;
  }
  
  // Medium severity for network and performance issues
  if (category === ErrorCategory.NETWORK || category === ErrorCategory.PERFORMANCE) {
    return ErrorSeverity.MEDIUM;
  }
  
  // Low severity for user interaction and accessibility issues
  if (category === ErrorCategory.USER_INTERACTION || category === ErrorCategory.ACCESSIBILITY) {
    return ErrorSeverity.LOW;
  }
  
  return ErrorSeverity.MEDIUM;
}