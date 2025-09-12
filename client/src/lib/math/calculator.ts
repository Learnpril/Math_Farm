import {
  MathResult,
  CalculationHistory,
  AngleMode,
  ValidationResult,
} from './types';
import { MathValidator } from './validation';
import { getMathInstance } from './math-loader';
import { createFallbackMath } from './fallback-math';

/**
 * Pure calculator functions extracted from CalculatorDemo
 */
export class Calculator {
  /**
   * Evaluates a mathematical expression with angle mode support
   */
  static evaluate(
    expression: string,
    angleMode: AngleMode = 'deg'
  ): MathResult {
    // Validate input
    const validation = MathValidator.validateExpression(expression);
    if (!validation.valid) {
      return {
        result: 0,
        error: validation.error,
      };
    }

    const math = getMathInstance();
    if (!math) {
      return {
        result: 0,
        error: 'Math library not loaded',
      };
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
      const errorMsg =
        error instanceof Error ? error.message : 'Invalid expression';
      return {
        result: 0,
        error: `Calculation error: ${errorMsg}`,
      };
    }
  }

  /**
   * Formats calculation results consistently
   */
  static formatResult(result: any): string {
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

    return result.toString();
  }

  /**
   * Performs real-time calculation for simple expressions
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
   * Button input processing
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
   * Validates calculator input for safety
   */
  static validateCalculatorInput(input: string): ValidationResult {
    return MathValidator.validateExpression(input);
  }

  /**
   * Gets preset calculator examples
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
 * Memory operations utility class
 */
class MemoryOperations {
  private static memory = 0;

  static add(value: number): number {
    if (isFinite(value)) {
      this.memory += value;
    }
    return this.memory;
  }

  static subtract(value: number): number {
    if (isFinite(value)) {
      this.memory -= value;
    }
    return this.memory;
  }

  static recall(): number {
    return this.memory;
  }

  static clear(): number {
    this.memory = 0;
    return this.memory;
  }

  static store(value: number): number {
    if (isFinite(value)) {
      this.memory = value;
    }
    return this.memory;
  }

  static getValue(): number {
    return this.memory;
  }
}

/**
 * History management utility class
 */
class HistoryManager {
  private static readonly MAX_HISTORY = 20;

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

  static clearHistory(): CalculationHistory[] {
    return [];
  }

  static formatHistoryEntry(entry: CalculationHistory): string {
    return `${entry.expression} = ${entry.result}`;
  }
}

/**
 * Convenience functions for calculator operations
 */
export const calculatorUtils = {
  /**
   * Evaluates an expression safely
   */
  evaluate: (expression: string, angleMode: AngleMode = 'deg'): MathResult => {
    return Calculator.evaluate(expression, angleMode);
  },

  /**
   * Formats a number result
   */
  formatResult: (result: any): string => {
    return Calculator.formatResult(result);
  },

  /**
   * Processes button input
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
   * Memory operations
   */
  memory: MemoryOperations,

  /**
   * History management
   */
  history: HistoryManager,

  /**
   * Get example expressions
   */
  getExamples: (): string[] => Calculator.getExamples(),

  /**
   * Validate input
   */
  validateInput: (input: string): ValidationResult =>
    Calculator.validateCalculatorInput(input),
};
