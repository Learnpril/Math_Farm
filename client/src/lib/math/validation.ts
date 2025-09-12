import { ValidationResult } from './types';
import { errorLogger } from '../errorLogging';

/**
 * Validates and sanitizes mathematical expressions for safe evaluation
 */
export class MathValidator {
  // Dangerous patterns that should be blocked
  private static readonly DANGEROUS_PATTERNS = [
    /eval\s*\(/i,
    /function\s*\(/i,
    /constructor/i,
    /prototype/i,
    /__proto__/i,
    /import\s*\(/i,
    /require\s*\(/i,
    /process\./i,
    /global\./i,
    /window\./i,
    /document\./i,
    /alert\s*\(/i,
    /console\./i,
    /setTimeout/i,
    /setInterval/i,
    /fetch\s*\(/i,
    /XMLHttpRequest/i,
  ];

  // Allowed mathematical functions and constants
  private static readonly ALLOWED_FUNCTIONS = [
    'sin',
    'cos',
    'tan',
    'asin',
    'acos',
    'atan',
    'atan2',
    'sinh',
    'cosh',
    'tanh',
    'asinh',
    'acosh',
    'atanh',
    'sqrt',
    'cbrt',
    'pow',
    'exp',
    'log',
    'log10',
    'log2',
    'abs',
    'ceil',
    'floor',
    'round',
    'max',
    'min',
    'factorial',
    'gcd',
    'lcm',
    'mod',
    'sign',
    'pi',
    'e',
    'i',
    'infinity',
    'NaN',
  ];

  /**
   * Validates a mathematical expression for safety and correctness
   */
  static validateExpression(input: string): ValidationResult {
    try {
      if (!input || typeof input !== 'string') {
        const error = 'Input must be a non-empty string';
        errorLogger.logValidationError(input || '', 'expression', error);
        return { valid: false, error };
      }

      const trimmed = input.trim();
      if (!trimmed) {
        const error = 'Expression cannot be empty';
        errorLogger.logValidationError(input, 'expression', error);
        return { valid: false, error };
      }

      // Check for dangerous patterns
      for (const pattern of this.DANGEROUS_PATTERNS) {
        if (pattern.test(trimmed)) {
          const error = 'Expression contains potentially dangerous code';
          errorLogger.logValidationError(input, 'security', error, {
            pattern: pattern.toString(),
            securityRisk: true,
          });
          return { valid: false, error };
        }
      }

      // Check for balanced parentheses
      if (!this.hasBalancedParentheses(trimmed)) {
        const error = 'Unbalanced parentheses';
        errorLogger.logValidationError(input, 'syntax', error);
        return { valid: false, error };
      }

      // Check for valid characters (allow letters, numbers, operators, parentheses, dots, spaces)
      const validCharPattern = /^[a-zA-Z0-9+\-*/^().,\s_πe]+$/;
      if (!validCharPattern.test(trimmed)) {
        const error = 'Expression contains invalid characters';
        errorLogger.logValidationError(input, 'characters', error);
        return { valid: false, error };
      }

      // Sanitize the expression
      const sanitized = this.sanitizeExpression(trimmed);

      return { valid: true, sanitized };
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error('Validation failed');
      errorLogger.logValidationError(input || '', 'general', errorObj);
      return {
        valid: false,
        error: 'Validation failed due to an unexpected error',
      };
    }
  }

  /**
   * Sanitizes a mathematical expression by normalizing notation
   */
  static sanitizeExpression(expression: string): string {
    let sanitized = expression.trim();

    // Normalize mathematical constants
    sanitized = sanitized.replace(/π/g, 'pi');
    sanitized = sanitized.replace(/∞/g, 'infinity');

    // Normalize operators
    sanitized = sanitized.replace(/×/g, '*');
    sanitized = sanitized.replace(/÷/g, '/');
    sanitized = sanitized.replace(/−/g, '-');

    // Normalize exponentiation
    sanitized = sanitized.replace(/\*\*/g, '^');

    // Remove extra whitespace
    sanitized = sanitized.replace(/\s+/g, ' ').trim();

    // Ensure proper multiplication syntax (add * between number and variable)
    sanitized = sanitized.replace(/(\d)([a-zA-Z])/g, '$1*$2');
    sanitized = sanitized.replace(/([a-zA-Z])(\d)/g, '$1*$2');
    sanitized = sanitized.replace(/\)([a-zA-Z\d])/g, ')*$1');
    sanitized = sanitized.replace(/([a-zA-Z\d])\(/g, '$1*(');

    return sanitized;
  }

  /**
   * Validates mathematical data structures like vectors and matrices
   */
  static validateMathData(data: any): ValidationResult {
    if (data === null || data === undefined) {
      return { valid: false, error: 'Data cannot be null or undefined' };
    }

    // Check for arrays (vectors/matrices)
    if (Array.isArray(data)) {
      return this.validateArray(data);
    }

    // Check for numbers
    if (typeof data === 'number') {
      if (!isFinite(data)) {
        return { valid: false, error: 'Number must be finite' };
      }
      return { valid: true };
    }

    // Check for strings (expressions)
    if (typeof data === 'string') {
      return this.validateExpression(data);
    }

    return { valid: false, error: 'Unsupported data type' };
  }

  /**
   * Validates array data (vectors/matrices)
   */
  private static validateArray(arr: any[]): ValidationResult {
    if (arr.length === 0) {
      return { valid: false, error: 'Array cannot be empty' };
    }

    // Check if all elements are numbers or valid expressions
    for (let i = 0; i < arr.length; i++) {
      const element = arr[i];

      if (Array.isArray(element)) {
        // Nested array (matrix)
        const nestedResult = this.validateArray(element);
        if (!nestedResult.valid) {
          return {
            valid: false,
            error: `Invalid element at index ${i}: ${nestedResult.error}`,
          };
        }
      } else if (typeof element === 'number') {
        if (!isFinite(element)) {
          return {
            valid: false,
            error: `Element at index ${i} must be finite`,
          };
        }
      } else if (typeof element === 'string') {
        const exprResult = this.validateExpression(element);
        if (!exprResult.valid) {
          return {
            valid: false,
            error: `Invalid expression at index ${i}: ${exprResult.error}`,
          };
        }
      } else {
        return {
          valid: false,
          error: `Element at index ${i} has unsupported type`,
        };
      }
    }

    return { valid: true };
  }

  /**
   * Checks if parentheses are balanced in an expression
   */
  private static hasBalancedParentheses(expression: string): boolean {
    let count = 0;
    for (const char of expression) {
      if (char === '(') {
        count++;
      } else if (char === ')') {
        count--;
        if (count < 0) {
          return false; // More closing than opening
        }
      }
    }
    return count === 0; // Should be zero if balanced
  }

  /**
   * Validates floating-point precision and handles edge cases
   */
  static validateFloatingPoint(value: number): ValidationResult {
    if (typeof value !== 'number') {
      return { valid: false, error: 'Value must be a number' };
    }

    if (isNaN(value)) {
      return { valid: false, error: 'Value is NaN' };
    }

    if (!isFinite(value)) {
      return { valid: false, error: 'Value must be finite' };
    }

    // Check for precision issues
    if (Math.abs(value) < Number.EPSILON && value !== 0) {
      return { valid: true, sanitized: '0' };
    }

    // Check for very large numbers that might cause overflow
    if (Math.abs(value) > Number.MAX_SAFE_INTEGER) {
      return { valid: false, error: 'Value exceeds safe integer range' };
    }

    return { valid: true };
  }
}

/**
 * Utility functions for safe mathematical operations
 */
export const mathValidation = {
  /**
   * Safely validates and sanitizes an expression
   */
  validateAndSanitize: (expression: string): ValidationResult => {
    return MathValidator.validateExpression(expression);
  },

  /**
   * Validates mathematical data structures
   */
  validateData: (data: any): ValidationResult => {
    return MathValidator.validateMathData(data);
  },

  /**
   * Validates floating-point numbers
   */
  validateNumber: (value: number): ValidationResult => {
    return MathValidator.validateFloatingPoint(value);
  },

  /**
   * Checks if a string contains only safe mathematical characters
   */
  isSafeExpression: (expression: string): boolean => {
    const result = MathValidator.validateExpression(expression);
    return result.valid;
  },
};
