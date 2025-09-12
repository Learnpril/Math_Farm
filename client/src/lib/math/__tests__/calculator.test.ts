import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Calculator, calculatorUtils } from '../calculator';
import { AngleMode } from '../types';

// Mock the math loader with realistic behavior
vi.mock('../math-loader', () => ({
  getMathInstance: vi.fn(() => ({
    evaluate: vi.fn((expr: string, scope?: any) => {
      // Handle specific test cases with proper results
      const testCases: Record<string, number> = {
        '2+2': 4,
        'sin(pi/2)': 1,
        'sqrt(16)': 4,
        'sin(90)': Math.sin((90 * Math.PI) / 180),
        '999999999999999999999': 999999999999999999999,
        '0.000000000001': 0.000000000001,
        '0.1 + 0.2': 0.30000000000000004, // Realistic floating point
        '1/3 * 3': 0.9999999999999999, // Realistic floating point
      };

      if (testCases.hasOwnProperty(expr)) {
        return testCases[expr];
      }

      // Handle error cases
      if (expr === '1/0') throw new Error('Division by zero');
      if (expr === 'invalid(' || expr === 'invalid')
        throw new Error('Syntax error');

      // Handle complex expressions by trying to evaluate them
      try {
        let processedExpr = expr
          .replace(/\bpi\b/g, Math.PI.toString())
          .replace(/\be\b/g, Math.E.toString())
          .replace(/sin\(/g, 'Math.sin(')
          .replace(/cos\(/g, 'Math.cos(')
          .replace(/tan\(/g, 'Math.tan(')
          .replace(/sqrt\(/g, 'Math.sqrt(')
          .replace(/log\(/g, 'Math.log(')
          .replace(/abs\(/g, 'Math.abs(')
          .replace(/exp\(/g, 'Math.exp(')
          .replace(/\^/g, '**');

        if (scope && scope.x !== undefined) {
          processedExpr = processedExpr.replace(/x/g, scope.x.toString());
        }

        const result = eval(processedExpr);

        // Handle infinity results as errors
        if (result === Infinity || result === -Infinity) {
          throw new Error('Division by zero');
        }

        return result;
      } catch (error) {
        throw new Error(`Math evaluation failed: ${error}`);
      }
    }),
    create: vi.fn(() => ({
      config: vi.fn(),
      evaluate: vi.fn((expr: string) => {
        // Simplified evaluation for created instance
        if (expr === '2+2') return 4;
        return eval(expr.replace(/\^/g, '**'));
      }),
    })),
  })),
}));

describe('Calculator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('evaluate', () => {
    it('should evaluate basic arithmetic expressions', () => {
      const result = Calculator.evaluate('2+2');
      expect(result.result).toBe('4');
      expect(result.error).toBeUndefined();
    });

    it('should handle trigonometric functions', () => {
      const result = Calculator.evaluate('sin(pi/2)');
      expect(result.result).toBe('1');
      expect(result.metadata?.angleMode).toBe('deg');
    });

    it('should handle square root functions', () => {
      const result = Calculator.evaluate('sqrt(16)');
      expect(result.result).toBe('4');
    });

    it('should handle division by zero gracefully', () => {
      const result = Calculator.evaluate('1/0');
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Division by zero');
    });

    it('should handle invalid expressions', () => {
      const result = Calculator.evaluate('invalid(');
      expect(result.error).toBeDefined();
    });

    it('should support different angle modes', () => {
      const degResult = Calculator.evaluate('sin(90)', 'deg');
      const radResult = Calculator.evaluate('sin(pi/2)', 'rad');

      expect(degResult.metadata?.angleMode).toBe('deg');
      expect(radResult.metadata?.angleMode).toBe('rad');
    });

    it('should handle empty expressions', () => {
      const result = Calculator.evaluate('');
      expect(result.error).toBeDefined();
    });

    it('should handle very large numbers', () => {
      const result = Calculator.evaluate('999999999999999999999');
      expect(result.result).toBeDefined();
    });

    it('should handle very small numbers', () => {
      const result = Calculator.evaluate('0.000000000001');
      expect(result.result).toBeDefined();
    });
  });

  describe('formatResult', () => {
    it('should format integers correctly', () => {
      expect(Calculator.formatResult(42)).toBe('42');
      expect(Calculator.formatResult(0)).toBe('0');
      expect(Calculator.formatResult(-5)).toBe('-5');
    });

    it('should format decimals correctly', () => {
      expect(Calculator.formatResult(3.14159)).toBe('3.14159');
      expect(Calculator.formatResult(2.0)).toBe('2');
      expect(Calculator.formatResult(1.5)).toBe('1.5');
    });

    it('should handle special values', () => {
      expect(Calculator.formatResult(Infinity)).toBe('Infinity');
      expect(Calculator.formatResult(-Infinity)).toBe('-Infinity');
      expect(Calculator.formatResult(NaN)).toBe('NaN');
    });

    it('should handle very small numbers close to zero', () => {
      expect(Calculator.formatResult(1e-11)).toBe('0');
      expect(Calculator.formatResult(-1e-11)).toBe('0');
    });

    it('should handle non-numeric values', () => {
      expect(Calculator.formatResult('text')).toBe('text');
      expect(Calculator.formatResult(null)).toBe('null');
      expect(Calculator.formatResult(undefined)).toBe('undefined');
    });
  });

  describe('evaluateRealTime', () => {
    it('should return empty string for incomplete expressions', () => {
      expect(Calculator.evaluateRealTime('2+')).toBe('');
      expect(Calculator.evaluateRealTime('sin(')).toBe('');
      expect(Calculator.evaluateRealTime('')).toBe('');
    });

    it('should evaluate complete expressions', () => {
      expect(Calculator.evaluateRealTime('2+2')).toBe('4');
      expect(Calculator.evaluateRealTime('sqrt(16)')).toBe('4');
    });

    it('should handle errors gracefully in real-time', () => {
      // Division by zero should return empty string in real-time mode
      expect(Calculator.evaluateRealTime('1/0')).toBe('');
      expect(Calculator.evaluateRealTime('invalid')).toBe('');
    });
  });

  describe('processButtonInput', () => {
    it('should handle number inputs', () => {
      const result = Calculator.processButtonInput('5', '', '', 0);
      expect(result.expression).toBe('5');
      expect(result.shouldCalculate).toBe(false);
    });

    it('should handle operator inputs', () => {
      const result = Calculator.processButtonInput('+', '2', '', 0);
      expect(result.expression).toBe('2+');
      expect(result.shouldCalculate).toBe(false);
    });

    it('should handle equals button', () => {
      const result = Calculator.processButtonInput('=', '2+2', '', 0);
      expect(result.shouldCalculate).toBe(true);
    });

    it('should handle clear button', () => {
      const result = Calculator.processButtonInput('C', '2+2', '4', 0);
      expect(result.expression).toBe('');
      expect(result.result).toBe('');
    });

    it('should handle backspace button', () => {
      const result = Calculator.processButtonInput('⌫', '123', '', 0);
      expect(result.expression).toBe('12');
    });

    it('should handle mathematical constants', () => {
      const piResult = Calculator.processButtonInput('π', '', '', 0);
      expect(piResult.expression).toBe('pi');

      const eResult = Calculator.processButtonInput('e', '', '', 0);
      expect(eResult.expression).toBe('e');
    });

    it('should handle mathematical functions', () => {
      const sinResult = Calculator.processButtonInput('sin', '', '', 0);
      expect(sinResult.expression).toBe('sin(');

      const sqrtResult = Calculator.processButtonInput('√', '', '', 0);
      expect(sqrtResult.expression).toBe('sqrt(');
    });

    it('should handle memory operations', () => {
      const mPlusResult = Calculator.processButtonInput('M+', '', '5', 0);
      expect(mPlusResult.memory).toBe(5);

      const mRecallResult = Calculator.processButtonInput('MR', '', '', 5);
      expect(mRecallResult.expression).toBe('5');
      expect(mRecallResult.result).toBe('5');

      const mClearResult = Calculator.processButtonInput('MC', '', '', 5);
      expect(mClearResult.memory).toBe(0);
    });
  });

  describe('validateCalculatorInput', () => {
    it('should validate safe expressions', () => {
      const result = Calculator.validateCalculatorInput('2+2');
      expect(result.valid).toBe(true);
    });

    it('should reject dangerous expressions', () => {
      const result = Calculator.validateCalculatorInput('eval(malicious)');
      expect(result.valid).toBe(false);
    });

    it('should handle validation errors', () => {
      const result = Calculator.validateCalculatorInput('');
      expect(result.valid).toBe(false);
    });
  });

  describe('getExamples', () => {
    it('should return array of example expressions', () => {
      const examples = Calculator.getExamples();
      expect(Array.isArray(examples)).toBe(true);
      expect(examples.length).toBeGreaterThan(0);
      expect(examples).toContain('sqrt(16)');
      expect(examples).toContain('sin(pi/2)');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null and undefined inputs', () => {
      // @ts-ignore - Testing runtime behavior
      const nullResult = Calculator.evaluate(null);
      expect(nullResult.error).toBeDefined();

      // @ts-ignore - Testing runtime behavior
      const undefinedResult = Calculator.evaluate(undefined);
      expect(undefinedResult.error).toBeDefined();
    });

    it('should handle extremely long expressions', () => {
      const longExpr = '1+'.repeat(1000) + '1';
      const result = Calculator.evaluate(longExpr);
      // Should either work or fail gracefully
      expect(result).toBeDefined();
    });

    it('should handle nested function calls', () => {
      const result = Calculator.evaluate('sin(cos(tan(0)))');
      expect(result.result).toBeDefined();
    });

    it('should handle complex mathematical expressions', () => {
      const result = Calculator.evaluate('sqrt(sin(pi/4)^2 + cos(pi/4)^2)');
      expect(result.result).toBeDefined();
    });
  });

  describe('floating-point precision', () => {
    it('should handle floating-point arithmetic correctly', () => {
      const result = Calculator.evaluate('0.1 + 0.2');
      // Should handle floating-point precision issues
      expect(parseFloat(result.result)).toBeCloseTo(0.3, 10);
    });

    it('should handle very precise calculations', () => {
      const result = Calculator.evaluate('1/3 * 3');
      expect(parseFloat(result.result)).toBeCloseTo(1, 10);
    });
  });
});

describe('calculatorUtils convenience functions', () => {
  it('should provide evaluate function', () => {
    const result = calculatorUtils.evaluate('2+2');
    expect(result.result).toBe('4');
  });

  it('should provide formatResult function', () => {
    const formatted = calculatorUtils.formatResult(3.14159);
    expect(formatted).toBe('3.14159');
  });

  it('should provide processButton function', () => {
    const result = calculatorUtils.processButton('5', '', '', 0);
    expect(result.expression).toBe('5');
  });

  it('should provide memory operations', () => {
    expect(calculatorUtils.memory.add).toBeDefined();
    expect(calculatorUtils.memory.recall).toBeDefined();
    expect(calculatorUtils.memory.clear).toBeDefined();
  });

  it('should provide history operations', () => {
    expect(calculatorUtils.history.addToHistory).toBeDefined();
    expect(calculatorUtils.history.clearHistory).toBeDefined();
  });

  it('should provide examples', () => {
    const examples = calculatorUtils.getExamples();
    expect(Array.isArray(examples)).toBe(true);
  });

  it('should provide input validation', () => {
    const result = calculatorUtils.validateInput('2+2');
    expect(result.valid).toBe(true);
  });
});
