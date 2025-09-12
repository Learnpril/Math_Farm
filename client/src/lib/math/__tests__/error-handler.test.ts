import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MathErrorHandler, mathErrorHandler } from '../error-handler';
import { ErrorCategory, ErrorSeverity } from '../../errorLogging';

// Mock the error logger
vi.mock('../../errorLogging', () => ({
  errorLogger: {
    logMathError: vi.fn().mockReturnValue('test-error-id'),
    logValidationError: vi.fn().mockReturnValue('test-validation-id'),
    logLibraryError: vi.fn().mockReturnValue('test-library-id'),
    logWorkerError: vi.fn().mockReturnValue('test-worker-id'),
  },
  ErrorCategory: {
    MATH_OPERATION: 'math_operation',
    VALIDATION: 'validation',
    LIBRARY_LOADING: 'library_loading',
    WORKER: 'worker',
  },
  ErrorSeverity: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
  },
}));

describe('MathErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    MathErrorHandler.clearRetryAttempts();
  });

  describe('handleMathError', () => {
    it('should handle math operation errors with fallback', () => {
      const error = new Error('Division by zero');
      const result = MathErrorHandler.handleMathError(error, 'evaluate', '1/0');

      expect(result.error).toContain('Division by zero is not allowed');
      expect(result.metadata?.errorId).toBe('test-error-id');
      expect(result.metadata?.fallbackUsed).toBe(true);
      expect(result.metadata?.suggestedActions).toBeInstanceOf(Array);
    });

    it('should provide appropriate fallback for different operations', () => {
      const error = new Error('Invalid expression');

      // Test evaluate operation
      const evaluateResult = MathErrorHandler.handleMathError(
        error,
        'evaluate',
        '2+2'
      );
      expect(evaluateResult.result).toBe('4'); // Fallback should work for simple expressions

      // Test solve operation
      const solveResult = MathErrorHandler.handleMathError(
        error,
        'solve',
        'x^2 = 4'
      );
      expect(solveResult.result).toContain('Unable to solve');
    });

    it('should categorize errors correctly', () => {
      const syntaxError = new Error('Syntax error in expression');
      const result = MathErrorHandler.handleMathError(
        syntaxError,
        'evaluate',
        'invalid('
      );

      expect(result.metadata?.errorCategory).toBe('syntax_error');
      expect(result.metadata?.suggestedActions).toContain(
        'Check that all parentheses are matched'
      );
    });
  });

  describe('handleValidationError', () => {
    it('should handle validation errors with user-friendly messages', () => {
      const result = MathErrorHandler.handleValidationError(
        'eval(malicious)',
        'expression',
        'Expression contains potentially dangerous code'
      );

      expect(result.valid).toBe(false);
      expect(result.error).toContain('invalid characters');
    });

    it('should handle empty input validation', () => {
      const result = MathErrorHandler.handleValidationError(
        '',
        'expression',
        'Expression cannot be empty'
      );

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Please enter a mathematical expression.');
    });
  });

  describe('handleLibraryError', () => {
    it('should handle library loading failures', () => {
      const error = new Error('Failed to load math.js');
      const result = MathErrorHandler.handleLibraryError(
        'math.js',
        error,
        'evaluate'
      );

      expect(result.error).toContain('math.js is temporarily unavailable');
      expect(result.metadata?.libraryName).toBe('math.js');
      expect(result.metadata?.fallbackUsed).toBe(true);
      expect(result.metadata?.suggestedActions).toContain(
        'Try refreshing the page'
      );
    });
  });

  describe('handleWorkerError', () => {
    it('should handle worker errors with main thread fallback', () => {
      const error = new Error('Worker failed to initialize');
      const fallbackFunction = vi.fn().mockReturnValue('fallback result');

      const result = MathErrorHandler.handleWorkerError(
        'math-worker',
        'calculate',
        error,
        fallbackFunction
      );

      expect(result.result).toBe('fallback result');
      expect(result.metadata?.fallbackSuccess).toBe(true);
      expect(fallbackFunction).toHaveBeenCalled();
    });

    it('should handle worker errors without fallback function', () => {
      const error = new Error('Worker unavailable');
      const result = MathErrorHandler.handleWorkerError(
        'math-worker',
        'calculate',
        error
      );

      expect(result.result).toBe('Worker unavailable');
      expect(result.error).toContain('worker is unavailable');
      expect(result.metadata?.fallbackSuccess).toBe(false);
    });
  });

  describe('retryOperation', () => {
    it('should retry failed operations with exponential backoff', async () => {
      let attempts = 0;
      const operation = vi.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Temporary failure');
        }
        return 'success';
      });

      const result = await MathErrorHandler.retryOperation(
        'test-op',
        operation,
        3
      );

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries', async () => {
      const operation = vi
        .fn()
        .mockRejectedValue(new Error('Persistent failure'));

      await expect(
        MathErrorHandler.retryOperation('test-op', operation, 2)
      ).rejects.toThrow('Persistent failure');

      expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should reset retry count on success', async () => {
      const operation = vi.fn().mockResolvedValue('success');

      await MathErrorHandler.retryOperation('test-op', operation);

      expect(MathErrorHandler.getRetryCount('test-op')).toBe(0);
    });
  });

  describe('convenience functions', () => {
    it('should provide mathErrorHandler convenience object', () => {
      expect(mathErrorHandler.handleError).toBeDefined();
      expect(mathErrorHandler.handleValidation).toBeDefined();
      expect(mathErrorHandler.handleLibrary).toBeDefined();
      expect(mathErrorHandler.handleWorker).toBeDefined();
      expect(mathErrorHandler.retry).toBeDefined();
    });

    it('should handle errors through convenience functions', () => {
      const error = new Error('Test error');
      const result = mathErrorHandler.handleError(error, 'test', 'input');

      expect(result.error).toBeDefined();
      expect(result.metadata?.fallbackUsed).toBe(true);
    });
  });

  describe('error categorization', () => {
    it('should categorize syntax errors correctly', () => {
      const error = new Error('Syntax error: unexpected token');
      const result = MathErrorHandler.handleMathError(
        error,
        'evaluate',
        'invalid'
      );

      expect(result.metadata?.errorCategory).toBe('syntax_error');
    });

    it('should categorize domain errors correctly', () => {
      const error = new Error('Domain error: negative square root');
      const result = MathErrorHandler.handleMathError(
        error,
        'evaluate',
        'sqrt(-1)'
      );

      expect(result.metadata?.errorCategory).toBe('domain_error');
    });

    it('should categorize timeout errors correctly', () => {
      const error = new Error('Operation timed out');
      const result = MathErrorHandler.handleMathError(
        error,
        'solve',
        'complex equation'
      );

      expect(result.metadata?.errorCategory).toBe('timeout_error');
    });
  });

  describe('suggested actions', () => {
    it('should provide relevant suggestions for syntax errors', () => {
      const error = new Error('Syntax error');
      const result = MathErrorHandler.handleMathError(
        error,
        'evaluate',
        'invalid('
      );

      const suggestions = result.metadata?.suggestedActions || [];
      expect(suggestions).toContain('Check that all parentheses are matched');
      expect(suggestions).toContain(
        'Verify mathematical operators are correct'
      );
    });

    it('should provide relevant suggestions for domain errors', () => {
      const error = new Error('Domain error');
      const result = MathErrorHandler.handleMathError(
        error,
        'evaluate',
        'sqrt(-1)'
      );

      const suggestions = result.metadata?.suggestedActions || [];
      expect(suggestions).toContain(
        'Check that values are within valid ranges'
      );
      expect(suggestions).toContain('Avoid negative values for square roots');
    });

    it('should provide relevant suggestions for timeout errors', () => {
      const error = new Error('Timeout error');
      const result = MathErrorHandler.handleMathError(
        error,
        'solve',
        'complex'
      );

      const suggestions = result.metadata?.suggestedActions || [];
      expect(suggestions).toContain('Simplify your mathematical expression');
      expect(suggestions).toContain('Break complex calculations into parts');
    });
  });
});
