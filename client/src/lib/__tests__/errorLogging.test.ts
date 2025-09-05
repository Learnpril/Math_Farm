import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  ErrorLogger, 
  errorLogger, 
  ErrorCategory, 
  ErrorSeverity,
  categorizeError,
  determineSeverity
} from '../errorLogging';

// Mock console methods
const originalConsoleError = console.error;
const originalConsoleGroup = console.group;
const originalConsoleTable = console.table;
const originalConsoleGroupEnd = console.groupEnd;

beforeEach(() => {
  console.error = vi.fn();
  console.group = vi.fn();
  console.table = vi.fn();
  console.groupEnd = vi.fn();
  
  // Clear error queue before each test
  errorLogger.clearErrors();
});

afterEach(() => {
  console.error = originalConsoleError;
  console.group = originalConsoleGroup;
  console.table = originalConsoleTable;
  console.groupEnd = originalConsoleGroupEnd;
});

describe('ErrorLogger', () => {
  it('should be a singleton', () => {
    const instance1 = ErrorLogger.getInstance();
    const instance2 = ErrorLogger.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should log errors with React error boundary information', () => {
    const error = new Error('Test error');
    const errorInfo = {
      componentStack: '\n    in TestComponent\n    in ErrorBoundary'
    };

    const errorId = errorLogger.logError(
      error,
      errorInfo,
      ErrorCategory.MATH_RENDERING,
      ErrorSeverity.HIGH
    );

    expect(errorId).toMatch(/^err_\d+_[a-z0-9]+$/);
    
    const errors = errorLogger.getErrors();
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({
      id: errorId,
      message: 'Test error',
      category: ErrorCategory.MATH_RENDERING,
      severity: ErrorSeverity.HIGH,
      componentStack: errorInfo.componentStack
    });
  });

  it('should log general errors without React context', () => {
    const error = new Error('General error');
    
    const errorId = errorLogger.logGeneralError(
      error,
      ErrorCategory.NETWORK,
      ErrorSeverity.MEDIUM
    );

    const errors = errorLogger.getErrors();
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({
      id: errorId,
      message: 'General error',
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.MEDIUM
    });
  });

  it('should log performance errors', () => {
    const errorId = errorLogger.logPerformanceError(
      'Page load too slow',
      'LCP',
      3500,
      2500
    );

    const errors = errorLogger.getErrors();
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({
      category: ErrorCategory.PERFORMANCE,
      severity: ErrorSeverity.MEDIUM,
      context: expect.objectContaining({
        additionalData: {
          metric: 'LCP',
          value: 3500,
          threshold: 2500
        }
      })
    });
  });

  it('should log library loading errors', () => {
    const error = new Error('Failed to load MathJax');
    
    const errorId = errorLogger.logLibraryError('MathJax', error);

    const errors = errorLogger.getErrors();
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({
      category: ErrorCategory.LIBRARY_LOADING,
      severity: ErrorSeverity.HIGH,
      context: expect.objectContaining({
        additionalData: {
          libraryName: 'MathJax'
        }
      })
    });
  });

  it('should filter errors by category', () => {
    errorLogger.logGeneralError(new Error('Math error'), ErrorCategory.MATH_RENDERING);
    errorLogger.logGeneralError(new Error('Network error'), ErrorCategory.NETWORK);
    errorLogger.logGeneralError(new Error('Another math error'), ErrorCategory.MATH_RENDERING);

    const mathErrors = errorLogger.getErrorsByCategory(ErrorCategory.MATH_RENDERING);
    const networkErrors = errorLogger.getErrorsByCategory(ErrorCategory.NETWORK);

    expect(mathErrors).toHaveLength(2);
    expect(networkErrors).toHaveLength(1);
    expect(mathErrors[0].message).toBe('Math error');
    expect(mathErrors[1].message).toBe('Another math error');
    expect(networkErrors[0].message).toBe('Network error');
  });

  it('should filter errors by severity', () => {
    errorLogger.logGeneralError(new Error('Critical error'), ErrorCategory.UNKNOWN, ErrorSeverity.CRITICAL);
    errorLogger.logGeneralError(new Error('High error'), ErrorCategory.UNKNOWN, ErrorSeverity.HIGH);
    errorLogger.logGeneralError(new Error('Medium error'), ErrorCategory.UNKNOWN, ErrorSeverity.MEDIUM);

    const criticalErrors = errorLogger.getErrorsBySeverity(ErrorSeverity.CRITICAL);
    const highErrors = errorLogger.getErrorsBySeverity(ErrorSeverity.HIGH);

    expect(criticalErrors).toHaveLength(1);
    expect(highErrors).toHaveLength(1);
    expect(criticalErrors[0].message).toBe('Critical error');
    expect(highErrors[0].message).toBe('High error');
  });

  it('should maintain queue size limit', () => {
    // Log more than the max queue size (50)
    for (let i = 0; i < 55; i++) {
      errorLogger.logGeneralError(new Error(`Error ${i}`));
    }

    const errors = errorLogger.getErrors();
    expect(errors).toHaveLength(50);
    
    // Should keep the most recent errors
    expect(errors[0].message).toBe('Error 54');
    expect(errors[49].message).toBe('Error 5');
  });

  it('should export errors as JSON', () => {
    errorLogger.logGeneralError(new Error('Export test'));
    
    const exported = errorLogger.exportErrors();
    const parsed = JSON.parse(exported);
    
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].message).toBe('Export test');
  });

  it('should clear all errors', () => {
    errorLogger.logGeneralError(new Error('Error 1'));
    errorLogger.logGeneralError(new Error('Error 2'));
    
    expect(errorLogger.getErrors()).toHaveLength(2);
    
    errorLogger.clearErrors();
    
    expect(errorLogger.getErrors()).toHaveLength(0);
  });

  it('should log to console with proper formatting', () => {
    const error = new Error('Console test');
    
    errorLogger.logGeneralError(error, ErrorCategory.MATH_RENDERING, ErrorSeverity.HIGH);

    expect(console.group).toHaveBeenCalledWith('🔴 📐 Error Report [expect.any(String)]');
    expect(console.error).toHaveBeenCalledWith('Message:', 'Console test');
    expect(console.error).toHaveBeenCalledWith('Category:', ErrorCategory.MATH_RENDERING);
    expect(console.error).toHaveBeenCalledWith('Severity:', ErrorSeverity.HIGH);
    expect(console.table).toHaveBeenCalled();
    expect(console.groupEnd).toHaveBeenCalled();
  });

  it('should include context information', () => {
    // Mock window properties
    Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 1080, writable: true });
    Object.defineProperty(window, 'location', { 
      value: { href: 'https://example.com/test' }, 
      writable: true 
    });

    const error = new Error('Context test');
    errorLogger.logGeneralError(error);

    const errors = errorLogger.getErrors();
    expect(errors[0].context).toMatchObject({
      url: 'https://example.com/test',
      userAgent: expect.any(String),
      viewport: {
        width: 1920,
        height: 1080
      },
      theme: expect.any(String)
    });
  });
});

describe('categorizeError', () => {
  it('should categorize math rendering errors', () => {
    const mathErrors = [
      new Error('MathJax failed to load'),
      new Error('LaTeX syntax error'),
      new Error('Math expression invalid')
    ];

    mathErrors.forEach(error => {
      expect(categorizeError(error)).toBe(ErrorCategory.MATH_RENDERING);
    });
  });

  it('should categorize tool demo errors', () => {
    const toolErrors = [
      new Error('JSXGraph initialization failed'),
      new Error('Tool demo crashed'),
      new Error('Demo component error')
    ];

    toolErrors.forEach(error => {
      expect(categorizeError(error)).toBe(ErrorCategory.TOOL_DEMO);
    });
  });

  it('should categorize network errors', () => {
    const networkErrors = [
      new Error('Network request failed'),
      new Error('Fetch error occurred'),
      new Error('XHR timeout')
    ];

    networkErrors.forEach(error => {
      expect(categorizeError(error)).toBe(ErrorCategory.NETWORK);
    });
  });

  it('should categorize library loading errors', () => {
    const loadingErrors = [
      new Error('Failed to load module'),
      new Error('Import error'),
      new Error('Module not found')
    ];

    loadingErrors.forEach(error => {
      expect(categorizeError(error)).toBe(ErrorCategory.LIBRARY_LOADING);
    });
  });

  it('should categorize user interaction errors', () => {
    const interactionErrors = [
      new Error('Click handler failed'),
      new Error('Touch event error'),
      new Error('Input validation failed')
    ];

    interactionErrors.forEach(error => {
      expect(categorizeError(error)).toBe(ErrorCategory.USER_INTERACTION);
    });
  });

  it('should categorize performance errors', () => {
    const performanceErrors = [
      new Error('Performance threshold exceeded'),
      new Error('Timeout occurred'),
      new Error('Memory limit reached')
    ];

    performanceErrors.forEach(error => {
      expect(categorizeError(error)).toBe(ErrorCategory.PERFORMANCE);
    });
  });

  it('should categorize accessibility errors', () => {
    const a11yErrors = [
      new Error('ARIA attribute missing'),
      new Error('Accessibility violation'),
      new Error('Screen reader error')
    ];

    a11yErrors.forEach(error => {
      expect(categorizeError(error)).toBe(ErrorCategory.ACCESSIBILITY);
    });
  });

  it('should default to unknown category', () => {
    const unknownError = new Error('Some random error');
    expect(categorizeError(unknownError)).toBe(ErrorCategory.UNKNOWN);
  });
});

describe('determineSeverity', () => {
  it('should assign critical severity to library loading errors', () => {
    const error = new Error('chunk load failed');
    expect(determineSeverity(error, ErrorCategory.LIBRARY_LOADING)).toBe(ErrorSeverity.CRITICAL);
  });

  it('should assign high severity to math rendering errors', () => {
    const error = new Error('math rendering failed');
    expect(determineSeverity(error, ErrorCategory.MATH_RENDERING)).toBe(ErrorSeverity.HIGH);
  });

  it('should assign high severity to tool demo errors', () => {
    const error = new Error('tool demo failed');
    expect(determineSeverity(error, ErrorCategory.TOOL_DEMO)).toBe(ErrorSeverity.HIGH);
  });

  it('should assign medium severity to network errors', () => {
    const error = new Error('network failed');
    expect(determineSeverity(error, ErrorCategory.NETWORK)).toBe(ErrorSeverity.MEDIUM);
  });

  it('should assign medium severity to performance errors', () => {
    const error = new Error('performance issue');
    expect(determineSeverity(error, ErrorCategory.PERFORMANCE)).toBe(ErrorSeverity.MEDIUM);
  });

  it('should assign low severity to user interaction errors', () => {
    const error = new Error('click failed');
    expect(determineSeverity(error, ErrorCategory.USER_INTERACTION)).toBe(ErrorSeverity.LOW);
  });

  it('should assign low severity to accessibility errors', () => {
    const error = new Error('accessibility issue');
    expect(determineSeverity(error, ErrorCategory.ACCESSIBILITY)).toBe(ErrorSeverity.LOW);
  });

  it('should default to medium severity', () => {
    const error = new Error('unknown error');
    expect(determineSeverity(error, ErrorCategory.UNKNOWN)).toBe(ErrorSeverity.MEDIUM);
  });
});