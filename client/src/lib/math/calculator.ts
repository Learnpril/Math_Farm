import {
  MathResult,
  CalculationHistory,
  AngleMode,
  ValidationResult,
} from './types';
import { MathValidator } from './validation';
import { getMathInstance } from './math-loader';
import { createFallbackMath } from './fallback-math';
import { mathErrorHandler } from './error-handler';

/**
 * Pure calculator functions extracted from CalculatorDemo.
 * Provides safe mathematical expression evaluation with comprehensive error handling,
 * input validation, and support for various mathematical operations.
 *
 * @example
 * ```typescript
 * const result = Calculator.evaluate('2 + 3 * 4', 'deg');
 * console.log(result.result); // "14"
 * ```
 */
export class Calculator {
  /**
   * Evaluates a mathematical expression with angle mode support.
   * Validates input for security, sanitizes expressions, and handles errors gracefully.
   *
   * @param expression - The mathematical expression to evaluate (e.g., "sin(pi/2)", "2^3")
   * @param angleMode - The angle mode for trigonometric functions ('deg' or 'rad')
   * @returns A MathResult object containing the result, error information, and metadata
   *
   * @example
   * ```typescript
   * // Basic arithmetic
   * Calculator.evaluate('2 + 3 * 4'); // { result: "14", metadata: {...} }
   *
   * // Trigonometric functions
   * Calculator.evaluate('sin(90)', 'deg'); // { result: "1", metadata: {...} }
   *
   * // Error handling
   * Calculator.evaluate('invalid'); // { result: "", error: "Invalid expression" }
   * ```
   *
   * @throws Never throws - all errors are captured and returned in the result object
   */
  static evaluate(
    expression: string,
    angleMode: AngleMode = 'deg'
  ): MathResult {
    // Validate input
    const validation = MathValidator.validateExpression(expression);
    if (!validation.valid) {
      return mathErrorHandler.handleValidation(
        expression,
        'expression',
        validation.error || 'Invalid expression'
      );
    }

    const math = getMathInstance();
    if (!math) {
      const error = new Error('Math library not loaded');
      return mathErrorHandler.handleLibrary('math.js', error, 'evaluate');
    }

    try {
      const sanitizedExpr = validation.sanitized || expression;
      let result: any;

      // Try to configure angle mode if math.js supports it
      if (math.create && typeof math.create === 'function') {
        const configuredMath = math.create();
        configuredMath.config({
          angleUnit: angleMode,
        });
        result = configuredMath.evaluate(sanitizedExpr);
      } else {
        // Fallback for basic math.js or mocked version
        result = math.evaluate(sanitizedExpr);
      }

      // Format result
      const resultStr = this.formatResult(result);

      return {
        result: resultStr,
        metadata: {
          angleMode,
          originalExpression: expression,
          sanitizedExpression: sanitizedExpr,
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        return mathErrorHandler.handleError(error, 'evaluate', expression);
      }

      const fallbackError = new Error('Invalid expression');
      return mathErrorHandler.handleError(
        fallbackError,
        'evaluate',
        expression
      );
    }
  }

  /**
   * Formats calculation results consistently for display.
   * Handles special values (null, undefined, Infinity, NaN) and applies
   * appropriate precision formatting for numeric results.
   *
   * @param result - The raw calculation result from math.js evaluation
   * @returns A formatted string representation of the result
   *
   * @example
   * ```typescript
   * Calculator.formatResult(3.14159265); // "3.14159265"
   * Calculator.formatResult(Infinity); // "Infinity"
   * Calculator.formatResult(null); // "null"
   * Calculator.formatResult(1e-12); // "0" (very small numbers)
   * ```
   */
  static formatResult(result: any): string {
    if (result === null) {
      return 'null';
    }

    if (result === undefined) {
      return 'undefined';
    }

    if (typeof result === 'number') {
      if (!isFinite(result)) {
        return result.toString(); // Infinity, -Infinity, NaN
      }

      // Handle very small numbers (close to zero)
      if (Math.abs(result) < 1e-10 && result !== 0) {
        return '0';
      }

      // Format based on magnitude
      if (Number.isInteger(result)) {
        return result.toString();
      } else {
        // Remove trailing zeros and unnecessary decimal points
        return result.toFixed(8).replace(/\.?0+$/, '');
      }
    }

    return result?.toString() || 'null';
  }

  /**
   * Performs real-time calculation for simple expressions during user input.
   * Only evaluates expressions that appear complete (no trailing operators)
   * to provide live feedback without errors.
   *
   * @param expression - The mathematical expression being typed
   * @param angleMode - The angle mode for trigonometric functions
   * @returns The calculated result as a string, or empty string if incomplete/invalid
   *
   * @example
   * ```typescript
   * Calculator.evaluateRealTime('2 + 3'); // "5"
   * Calculator.evaluateRealTime('2 +'); // "" (incomplete)
   * Calculator.evaluateRealTime(''); // "" (empty)
   * ```
   */
  static evaluateRealTime(
    expression: string,
    angleMode: AngleMode = 'deg'
  ): string {
    if (!expression.trim()) {
      return '';
    }

    // Only calculate if expression looks complete (no trailing operators)
    if (/[+\-*/^(]$/.test(expression.trim())) {
      return '';
    }

    const result = this.evaluate(expression, angleMode);
    return result.error ? '' : result.result.toString();
  }

  /**
   * Processes calculator button input and updates the calculator state.
   * Handles special buttons (equals, clear, memory operations) and mathematical
   * functions while maintaining proper expression syntax.
   *
   * @param button - The button pressed (e.g., '=', 'C', '⌫', 'sin', '+', '1')
   * @param currentExpression - The current mathematical expression
   * @param currentResult - The current displayed result
   * @param memory - The current memory value
   * @param angleMode - The angle mode for trigonometric functions
   * @returns Updated calculator state with new expression, result, memory, and calculation flag
   *
   * @example
   * ```typescript
   * const state = Calculator.processButtonInput('5', '2+', '', 0, 'deg');
   * // Returns: { expression: '2+5', result: '', memory: 0, shouldCalculate: false }
   *
   * const equalState = Calculator.processButtonInput('=', '2+3', '', 0, 'deg');
   * // Returns: { expression: '2+3', result: '', memory: 0, shouldCalculate: true }
   * ```
   */
  static processButtonInput(
    button: string,
    currentExpression: string,
    currentResult: string,
    memory: number,
    angleMode: AngleMode = 'deg'
  ): {
    expression: string;
    result: string;
    memory: number;
    shouldCalculate: boolean;
  } {
    let newExpression = currentExpression;
    let newResult = currentResult;
    let newMemory = memory;
    let shouldCalculate = false;

    switch (button) {
      case '=':
        shouldCalculate = true;
        break;

      case 'C':
        newExpression = '';
        newResult = '';
        break;

      case '⌫':
        newExpression = currentExpression.slice(0, -1);
        break;

      case 'M+':
        const addValue = parseFloat(currentResult);
        if (!isNaN(addValue)) {
          newMemory = MemoryOperations.add(addValue);
        }
        break;

      case 'M-':
        const subtractValue = parseFloat(currentResult);
        if (!isNaN(subtractValue)) {
          newMemory = MemoryOperations.subtract(subtractValue);
        }
        break;

      case 'MR':
        const memoryValue = MemoryOperations.recall();
        newExpression = memoryValue.toString();
        newResult = memoryValue.toString();
        break;

      case 'MC':
        newMemory = MemoryOperations.clear();
        break;

      // Mathematical constants and functions
      case 'π':
        newExpression += 'pi';
        break;
      case 'e':
        newExpression += 'e';
        break;
      case 'x²':
        newExpression += '^2';
        break;
      case 'x³':
        newExpression += '^3';
        break;
      case '√':
        newExpression += 'sqrt(';
        break;
      case '∛':
        newExpression += 'cbrt(';
        break;
      case 'x!':
        newExpression += '!';
        break;
      case '1/x':
        newExpression += '1/(';
        break;
      case 'ln':
        newExpression += 'log(';
        break;
      case 'log':
        newExpression += 'log10(';
        break;
      case 'sin':
        newExpression += 'sin(';
        break;
      case 'cos':
        newExpression += 'cos(';
        break;
      case 'tan':
        newExpression += 'tan(';
        break;
      case 'sin⁻¹':
        newExpression += 'asin(';
        break;
      case 'cos⁻¹':
        newExpression += 'acos(';
        break;
      case 'tan⁻¹':
        newExpression += 'atan(';
        break;
      case 'sinh':
        newExpression += 'sinh(';
        break;
      case 'cosh':
        newExpression += 'cosh(';
        break;
      case 'tanh':
        newExpression += 'tanh(';
        break;
      case 'x^y':
        newExpression += '^';
        break;
      case 'EXP':
        newExpression += 'e^';
        break;
      case 'Ans':
        newExpression += currentResult;
        break;

      default:
        // Regular input (numbers, operators, etc.)
        newExpression += button;
        break;
    }

    return {
      expression: newExpression,
      result: newResult,
      memory: newMemory,
      shouldCalculate,
    };
  }

  /**
   * Validates calculator input for safety with enhanced error handling.
   * Uses the MathValidator to check for dangerous patterns, invalid syntax,
   * and security threats before evaluation.
   *
   * @param input - The mathematical expression to validate
   * @returns ValidationResult indicating if the input is safe and valid
   *
   * @example
   * ```typescript
   * Calculator.validateCalculatorInput('2 + 3'); // { valid: true, sanitized: '2 + 3' }
   * Calculator.validateCalculatorInput('eval(alert())'); // { valid: false, error: '...' }
   * ```
   */
  static validateCalculatorInput(input: string): ValidationResult {
    try {
      return MathValidator.validateExpression(input);
    } catch (error) {
      if (error instanceof Error) {
        return mathErrorHandler.handleValidation(input, 'calculator', error);
      }
      return mathErrorHandler.handleValidation(
        input,
        'calculator',
        'Validation failed'
      );
    }
  }

  /**
   * Gets preset calculator examples for demonstration and testing.
   * Provides a variety of mathematical expressions showcasing different
   * calculator capabilities and functions.
   *
   * @returns Array of example mathematical expressions
   *
   * @example
   * ```typescript
   * const examples = Calculator.getExamples();
   * console.log(examples[0]); // "sqrt(16)"
   * ```
   */
  static getExamples(): string[] {
    return [
      'sqrt(16)',
      'sin(pi/2)',
      '2^8',
      'log10(100)',
      'factorial(5)',
      'gcd(48, 18)',
      'cbrt(27)',
      'sinh(1)',
      'asin(0.5)',
      'e^2',
      'abs(-5)',
      'round(3.14159, 2)',
    ];
  }
}

/**
 * Memory operations utility class for calculator memory functions.
 * Provides persistent memory storage for mathematical calculations
 * with add, subtract, recall, clear, and store operations.
 *
 * @example
 * ```typescript
 * MemoryOperations.store(42);
 * MemoryOperations.add(8); // Memory now contains 50
 * const value = MemoryOperations.recall(); // 50
 * ```
 */
class MemoryOperations {
  private static memory = 0;

  /**
   * Adds a value to the current memory content.
   * Only adds finite numbers to prevent memory corruption.
   *
   * @param value - The number to add to memory
   * @returns The new memory value after addition
   */
  static add(value: number): number {
    if (isFinite(value)) {
      this.memory += value;
    }
    return this.memory;
  }

  /**
   * Subtracts a value from the current memory content.
   * Only subtracts finite numbers to prevent memory corruption.
   *
   * @param value - The number to subtract from memory
   * @returns The new memory value after subtraction
   */
  static subtract(value: number): number {
    if (isFinite(value)) {
      this.memory -= value;
    }
    return this.memory;
  }

  /**
   * Recalls the current value stored in memory.
   *
   * @returns The current memory value
   */
  static recall(): number {
    return this.memory;
  }

  /**
   * Clears the memory by setting it to zero.
   *
   * @returns The cleared memory value (always 0)
   */
  static clear(): number {
    this.memory = 0;
    return this.memory;
  }

  /**
   * Stores a new value in memory, replacing the current content.
   * Only stores finite numbers to prevent memory corruption.
   *
   * @param value - The number to store in memory
   * @returns The stored memory value
   */
  static store(value: number): number {
    if (isFinite(value)) {
      this.memory = value;
    }
    return this.memory;
  }

  /**
   * Gets the current memory value (alias for recall).
   *
   * @returns The current memory value
   */
  static getValue(): number {
    return this.memory;
  }
}

/**
 * History management utility class for calculator calculation history.
 * Maintains a limited history of calculations with timestamps and provides
 * methods for adding, clearing, and formatting history entries.
 *
 * @example
 * ```typescript
 * const history = HistoryManager.addToHistory('2+3', '5', []);
 * const formatted = HistoryManager.formatHistoryEntry(history[0]); // "2+3 = 5"
 * ```
 */
class HistoryManager {
  /** Maximum number of history entries to maintain */
  private static readonly MAX_HISTORY = 20;

  /**
   * Adds a new calculation to the history.
   * Maintains a maximum of MAX_HISTORY entries by removing oldest entries.
   *
   * @param expression - The mathematical expression that was calculated
   * @param result - The result of the calculation
   * @param currentHistory - The existing history array
   * @returns Updated history array with the new entry at the beginning
   */
  static addToHistory(
    expression: string,
    result: string,
    currentHistory: CalculationHistory[]
  ): CalculationHistory[] {
    const newEntry: CalculationHistory = {
      expression,
      result,
      timestamp: Date.now(),
    };

    return [newEntry, ...currentHistory.slice(0, this.MAX_HISTORY - 1)];
  }

  /**
   * Clears all calculation history.
   *
   * @returns Empty history array
   */
  static clearHistory(): CalculationHistory[] {
    return [];
  }

  /**
   * Formats a history entry for display.
   *
   * @param entry - The history entry to format
   * @returns Formatted string in "expression = result" format
   */
  static formatHistoryEntry(entry: CalculationHistory): string {
    return `${entry.expression} = ${entry.result}`;
  }
}

/**
 * Convenience functions for calculator operations.
 * Provides a simplified API for common calculator functionality
 * with direct access to Calculator class methods and utilities.
 *
 * @example
 * ```typescript
 * import { calculatorUtils } from './calculator';
 *
 * const result = calculatorUtils.evaluate('2 + 3');
 * const formatted = calculatorUtils.formatResult(result.result);
 * calculatorUtils.memory.store(42);
 * ```
 */
export const calculatorUtils = {
  /**
   * Evaluates a mathematical expression safely with validation and error handling.
   *
   * @param expression - The mathematical expression to evaluate
   * @param angleMode - The angle mode for trigonometric functions (default: 'deg')
   * @returns MathResult object with result, error information, and metadata
   */
  evaluate: (expression: string, angleMode: AngleMode = 'deg'): MathResult => {
    return Calculator.evaluate(expression, angleMode);
  },

  /**
   * Formats a calculation result for consistent display.
   *
   * @param result - The raw calculation result to format
   * @returns Formatted string representation of the result
   */
  formatResult: (result: any): string => {
    return Calculator.formatResult(result);
  },

  /**
   * Processes calculator button input and updates calculator state.
   *
   * @param button - The button that was pressed
   * @param expression - Current mathematical expression
   * @param result - Current displayed result
   * @param memory - Current memory value
   * @param angleMode - Angle mode for trigonometric functions (default: 'deg')
   * @returns Updated calculator state object
   */
  processButton: (
    button: string,
    expression: string,
    result: string,
    memory: number,
    angleMode: AngleMode = 'deg'
  ) => {
    return Calculator.processButtonInput(
      button,
      expression,
      result,
      memory,
      angleMode
    );
  },

  /**
   * Memory operations utility for calculator memory functions.
   * Provides add, subtract, recall, clear, store, and getValue methods.
   */
  memory: MemoryOperations,

  /**
   * History management utility for calculation history.
   * Provides addToHistory, clearHistory, and formatHistoryEntry methods.
   */
  history: HistoryManager,

  /**
   * Gets preset calculator examples for demonstration and testing.
   *
   * @returns Array of example mathematical expressions
   */
  getExamples: (): string[] => Calculator.getExamples(),

  /**
   * Validates calculator input for safety and correctness.
   *
   * @param input - The mathematical expression to validate
   * @returns ValidationResult indicating if input is safe and valid
   */
  validateInput: (input: string): ValidationResult =>
    Calculator.validateCalculatorInput(input),
};
