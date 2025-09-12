import { MathResult, MathContext, ValidationResult } from './types';
import { errorLogger, ErrorCategory, ErrorSeverity } from '../errorLogging';
import { createFallbackMath } from './fallback-math';
import { MathValidator } from './validation';

/**
 * Enhanced error handler for math operations with graceful fallbacks
 */
export class MathErrorHandler {
  private static retryAttempts = new Map<string, number>();
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000; // 1 second

  /**
   * Handles math operation errors with graceful fallback behaviors
   */
  static handleMathError(
    error: Error,
    operation: string,
    input: string,
    context?: Partial<MathContext>
  ): MathResult {
    const errorId = errorLogger.logMathError(operation, input, error, {
      context,
      timestamp: new Date().toISOString(),
    });

    // Determine fallback strategy based on operation type
    const fallbackResult = this.getFallbackResult(operation, input, error);

    return {
      result: fallbackResult.result,
      error: this.getUserFriendlyMessage(error, operation),
      metadata: {
        errorId,
        operation,
        originalInput: input,
        fallbackUsed: true,
        errorCategory: this.categorizeError(error),
        suggestedActions: this.getSuggestedActions(error, operation),
        ...fallbackResult.metadata,
      },
    };
  }

  /**
   * Handles validation errors with user-friendly messages
   */
  static handleValidationError(
    input: string,
    validationType: string,
    error: Error | string
  ): ValidationResult {
    const errorObj = typeof error === 'string' ? new Error(error) : error;

    errorLogger.logValidationError(input, validationType, errorObj);

    return {
      valid: false,
      error: this.getUserFriendlyValidationMessage(errorObj, validationType),
    };
  }

  /**
   * Handles library loading errors with fallback mechanisms
   */
  static handleLibraryError(
    libraryName: string,
    error: Error,
    operation?: string
  ): MathResult {
    const errorId = errorLogger.logLibraryError(libraryName, error, {
      operation,
      timestamp: new Date().toISOString(),
    });

    // Provide fallback using basic math operations
    const fallbackMath = createFallbackMath();

    return {
      result: 'Library unavailable',
      error: `${libraryName} is temporarily unavailable. Using basic math operations.`,
      metadata: {
        errorId,
        libraryName,
        fallbackUsed: true,
        fallbackMath: !!fallbackMath,
        suggestedActions: [
          'Try refreshing the page',
          'Check your internet connection',
          'Use simpler mathematical expressions',
        ],
      },
    };
  }

  /**
   * Handles Web Worker errors with main thread fallback
   */
  static handleWorkerError(
    workerType: string,
    operation: string,
    error: Error,
    fallbackFunction?: () => any
  ): MathResult {
    const errorId = errorLogger.logWorkerError(workerType, operation, error);

    let fallbackResult: any = 'Worker unavailable';
    let fallbackSuccess = false;

    // Try fallback function if provided
    if (fallbackFunction) {
      try {
        fallbackResult = fallbackFunction();
        fallbackSuccess = true;
      } catch (fallbackError) {
        console.warn('Fallback function also failed:', fallbackError);
      }
    }

    return {
      result: fallbackResult,
      error: fallbackSuccess
        ? undefined
        : `${workerType} worker is unavailable. Operation completed on main thread.`,
      metadata: {
        errorId,
        workerType,
        operation,
        fallbackUsed: true,
        fallbackSuccess,
        suggestedActions: [
          'Complex calculations may be slower',
          'Consider using simpler expressions',
          'Try refreshing the page',
        ],
      },
    };
  }

  /**
   * Provides retry mechanism for transient errors
   */
  static async retryOperation<T>(
    operationKey: string,
    operation: () => Promise<T> | T,
    maxRetries: number = this.MAX_RETRIES
  ): Promise<T> {
    const currentRetries = this.retryAttempts.get(operationKey) || 0;

    try {
      const result = await operation();
      // Reset retry count on success
      this.retryAttempts.delete(operationKey);
      return result;
    } catch (error) {
      if (currentRetries < maxRetries) {
        this.retryAttempts.set(operationKey, currentRetries + 1);

        // Exponential backoff
        const delay = this.RETRY_DELAY * Math.pow(2, currentRetries);
        await new Promise(resolve => setTimeout(resolve, delay));

        return this.retryOperation(operationKey, operation, maxRetries);
      } else {
        // Max retries reached, reset counter and throw
        this.retryAttempts.delete(operationKey);
        throw error;
      }
    }
  }

  /**
   * Gets fallback result based on operation type
   */
  private static getFallbackResult(
    operation: string,
    input: string,
    error: Error
  ): { result: any; metadata?: Record<string, any> } {
    const fallbackMath = createFallbackMath();

    try {
      switch (operation.toLowerCase()) {
        case 'evaluate':
        case 'calculate':
          // Try basic evaluation
          const result = fallbackMath.evaluate(input);
          return {
            result: result.toString(),
            metadata: { fallbackMethod: 'basic_evaluation' },
          };

        case 'solve':
          return {
            result: `Unable to solve: ${input}`,
            metadata: { fallbackMethod: 'error_message' },
          };

        case 'derivative':
          const derivative = fallbackMath.derivative(
            fallbackMath.parse(input),
            'x'
          );
          return {
            result: derivative.toString(),
            metadata: { fallbackMethod: 'basic_derivative' },
          };

        case 'simplify':
          return {
            result: input, // Return original expression
            metadata: { fallbackMethod: 'no_simplification' },
          };

        default:
          return {
            result: 'Operation unavailable',
            metadata: { fallbackMethod: 'generic_error' },
          };
      }
    } catch (fallbackError) {
      return {
        result: 'Calculation failed',
        metadata: {
          fallbackMethod: 'complete_failure',
          fallbackError: fallbackError.message,
        },
      };
    }
  }

  /**
   * Generates user-friendly error messages
   */
  private static getUserFriendlyMessage(
    error: Error,
    operation: string
  ): string {
    const message = error.message.toLowerCase();

    // Math library specific errors
    if (message.includes('undefined') || message.includes('not defined')) {
      return 'This mathematical function or variable is not recognized. Please check your expression.';
    }

    if (message.includes('syntax') || message.includes('parse')) {
      return "There's a syntax error in your mathematical expression. Please check parentheses and operators.";
    }

    if (
      message.includes('division by zero') ||
      message.includes('divide by zero')
    ) {
      return 'Division by zero is not allowed. Please check your calculation.';
    }

    if (message.includes('domain') || message.includes('range')) {
      return 'This operation is outside the valid mathematical domain. Try different values.';
    }

    if (message.includes('overflow') || message.includes('too large')) {
      return 'The result is too large to calculate. Try using smaller numbers.';
    }

    if (message.includes('timeout') || message.includes('time')) {
      return 'The calculation is taking too long. Try a simpler expression.';
    }

    // Operation-specific messages
    switch (operation.toLowerCase()) {
      case 'solve':
        return 'Unable to solve this equation. It may be too complex or have no solution.';
      case 'derivative':
        return 'Unable to calculate the derivative. Please check your function.';
      case 'integral':
        return 'Unable to calculate the integral. The function may be too complex.';
      case 'graph':
        return 'Unable to generate the graph. Please check your function definition.';
      default:
        return 'A mathematical error occurred. Please check your input and try again.';
    }
  }

  /**
   * Generates user-friendly validation error messages
   */
  private static getUserFriendlyValidationMessage(
    error: Error,
    validationType: string
  ): string {
    const message = error.message.toLowerCase();

    if (message.includes('empty')) {
      return 'Please enter a mathematical expression.';
    }

    if (message.includes('dangerous') || message.includes('security')) {
      return 'This expression contains invalid characters. Please use only mathematical symbols.';
    }

    if (message.includes('parentheses') || message.includes('bracket')) {
      return 'Please check that all parentheses are properly matched.';
    }

    if (message.includes('invalid characters')) {
      return 'Please use only numbers, mathematical operators, and function names.';
    }

    switch (validationType) {
      case 'expression':
        return 'Please enter a valid mathematical expression.';
      case 'equation':
        return 'Please enter a valid equation with an equals sign.';
      case 'function':
        return 'Please enter a valid mathematical function.';
      default:
        return 'Please check your input and try again.';
    }
  }

  /**
   * Categorizes errors for better handling
   */
  private static categorizeError(error: Error): string {
    const message = error.message.toLowerCase();

    if (message.includes('syntax') || message.includes('parse')) {
      return 'syntax_error';
    }

    if (message.includes('undefined') || message.includes('not defined')) {
      return 'undefined_function';
    }

    if (message.includes('domain') || message.includes('range')) {
      return 'domain_error';
    }

    if (message.includes('overflow') || message.includes('underflow')) {
      return 'numerical_overflow';
    }

    if (message.includes('timeout') || message.includes('time')) {
      return 'timeout_error';
    }

    if (message.includes('memory') || message.includes('stack')) {
      return 'memory_error';
    }

    return 'unknown_error';
  }

  /**
   * Provides suggested actions based on error type
   */
  private static getSuggestedActions(
    error: Error,
    operation: string
  ): string[] {
    const category = this.categorizeError(error);
    const baseActions = [
      'Try refreshing the page',
      'Check your input for typos',
    ];

    switch (category) {
      case 'syntax_error':
        return [
          'Check that all parentheses are matched',
          'Verify mathematical operators are correct',
          'Remove any invalid characters',
          ...baseActions,
        ];

      case 'undefined_function':
        return [
          'Check function names are spelled correctly',
          'Use supported mathematical functions only',
          'Try using basic operators (+, -, *, /)',
          ...baseActions,
        ];

      case 'domain_error':
        return [
          'Check that values are within valid ranges',
          'Avoid negative values for square roots',
          'Ensure denominators are not zero',
          ...baseActions,
        ];

      case 'numerical_overflow':
        return [
          'Try using smaller numbers',
          'Break complex calculations into steps',
          'Use scientific notation for large numbers',
          ...baseActions,
        ];

      case 'timeout_error':
        return [
          'Simplify your mathematical expression',
          'Break complex calculations into parts',
          'Try a different approach to the problem',
          ...baseActions,
        ];

      case 'memory_error':
        return [
          'Close other browser tabs to free memory',
          'Refresh the page and try again',
          'Use simpler mathematical expressions',
          ...baseActions,
        ];

      default:
        return [
          'Try a simpler version of your calculation',
          'Use basic mathematical operations',
          ...baseActions,
        ];
    }
  }

  /**
   * Clears retry attempts for cleanup
   */
  static clearRetryAttempts(): void {
    this.retryAttempts.clear();
  }

  /**
   * Gets current retry count for an operation
   */
  static getRetryCount(operationKey: string): number {
    return this.retryAttempts.get(operationKey) || 0;
  }
}

/**
 * Convenience functions for error handling
 */
export const mathErrorHandler = {
  /**
   * Handle math operation errors
   */
  handleError: (
    error: Error,
    operation: string,
    input: string,
    context?: Partial<MathContext>
  ): MathResult => {
    return MathErrorHandler.handleMathError(error, operation, input, context);
  },

  /**
   * Handle validation errors
   */
  handleValidation: (
    input: string,
    validationType: string,
    error: Error | string
  ): ValidationResult => {
    return MathErrorHandler.handleValidationError(input, validationType, error);
  },

  /**
   * Handle library errors
   */
  handleLibrary: (
    libraryName: string,
    error: Error,
    operation?: string
  ): MathResult => {
    return MathErrorHandler.handleLibraryError(libraryName, error, operation);
  },

  /**
   * Handle worker errors
   */
  handleWorker: (
    workerType: string,
    operation: string,
    error: Error,
    fallbackFunction?: () => any
  ): MathResult => {
    return MathErrorHandler.handleWorkerError(
      workerType,
      operation,
      error,
      fallbackFunction
    );
  },

  /**
   * Retry operation with exponential backoff
   */
  retry: <T>(
    operationKey: string,
    operation: () => Promise<T> | T,
    maxRetries?: number
  ): Promise<T> => {
    return MathErrorHandler.retryOperation(operationKey, operation, maxRetries);
  },

  /**
   * Clear retry attempts
   */
  clearRetries: (): void => {
    MathErrorHandler.clearRetryAttempts();
  },

  /**
   * Get retry count
   */
  getRetryCount: (operationKey: string): number => {
    return MathErrorHandler.getRetryCount(operationKey);
  },
};
