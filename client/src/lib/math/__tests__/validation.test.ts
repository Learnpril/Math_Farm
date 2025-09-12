import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MathValidator, mathValidation } from '../validation';

// Mock the error logger
vi.mock('../../errorLogging', () => ({
  errorLogger: {
    logValidationError: vi.fn().mockReturnValue('test-error-id'),
  },
}));

describe('MathValidator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateExpression', () => {
    it('should validate safe mathematical expressions', () => {
      const validExpressions = [
        '2 + 2',
        'sin(x)',
        'sqrt(16)',
        'x^2 + 2*x + 1',
        'log(10)',
        'pi * e',
        'abs(-5)',
        'factorial(5)',
      ];

      validExpressions.forEach(expr => {
        const result = MathValidator.validateExpression(expr);
        expect(result.valid).toBe(true);
        expect(result.sanitized).toBeDefined();
      });
    });

    it('should reject dangerous expressions', () => {
      const dangerousExpressions = [
        'eval(malicious)',
        'function()',
        'constructor',
        'prototype',
        '__proto__',
        'import(',
        'require(',
        'process.',
        'global.',
        'window.',
        'document.',
        'alert(',
        'console.',
        'setTimeout',
        'setInterval',
        'fetch(',
        'XMLHttpRequest',
      ];

      dangerousExpressions.forEach(expr => {
        const result = MathValidator.validateExpression(expr);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('dangerous');
      });
    });

    it('should handle empty and null inputs', () => {
      expect(MathValidator.validateExpression('').valid).toBe(false);
      expect(MathValidator.validateExpression('   ').valid).toBe(false);
      // @ts-ignore - Testing runtime behavior
      expect(MathValidator.validateExpression(null).valid).toBe(false);
      // @ts-ignore - Testing runtime behavior
      expect(MathValidator.validateExpression(undefined).valid).toBe(false);
    });

    it('should check for balanced parentheses', () => {
      expect(MathValidator.validateExpression('(2 + 3)').valid).toBe(true);
      expect(MathValidator.validateExpression('((2 + 3) * 4)').valid).toBe(
        true
      );
      expect(MathValidator.validateExpression('(2 + 3').valid).toBe(false);
      expect(MathValidator.validateExpression('2 + 3)').valid).toBe(false);
      expect(MathValidator.validateExpression('((2 + 3)').valid).toBe(false);
    });

    it('should validate character set', () => {
      expect(MathValidator.validateExpression('2 + 2').valid).toBe(true);
      expect(MathValidator.validateExpression('sin(π)').valid).toBe(true);
      expect(MathValidator.validateExpression('e^x').valid).toBe(true);
      expect(MathValidator.validateExpression('2 + 2; rm -rf /').valid).toBe(
        false
      );
      expect(MathValidator.validateExpression('2 + 2 & echo hello').valid).toBe(
        false
      );
    });

    it('should provide sanitized output', () => {
      const result = MathValidator.validateExpression('2 + 2');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('2 + 2');
    });

    it('should handle validation errors gracefully', () => {
      // Mock validation to throw an error
      const originalValidate = MathValidator.validateExpression;
      vi.spyOn(MathValidator, 'validateExpression').mockImplementation(() => {
        throw new Error('Validation error');
      });

      const result = MathValidator.validateExpression('test');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('unexpected error');

      // Restore original method
      vi.mocked(MathValidator.validateExpression).mockRestore();
    });
  });

  describe('sanitizeExpression', () => {
    it('should normalize mathematical constants', () => {
      expect(MathValidator.sanitizeExpression('π')).toBe('pi');
      expect(MathValidator.sanitizeExpression('∞')).toBe('infinity');
    });

    it('should normalize operators', () => {
      expect(MathValidator.sanitizeExpression('2×3')).toBe('2*3');
      expect(MathValidator.sanitizeExpression('6÷2')).toBe('6/2');
      expect(MathValidator.sanitizeExpression('5−3')).toBe('5-3');
    });

    it('should normalize exponentiation', () => {
      expect(MathValidator.sanitizeExpression('2**3')).toBe('2^3');
    });

    it('should add implicit multiplication', () => {
      expect(MathValidator.sanitizeExpression('2x')).toBe('2*x');
      expect(MathValidator.sanitizeExpression('x2')).toBe('x*2');
      expect(MathValidator.sanitizeExpression('(x+1)y')).toBe('(x+1)*y');
      expect(MathValidator.sanitizeExpression('x(y+1)')).toBe('x*(y+1)');
    });

    it('should remove extra whitespace', () => {
      expect(MathValidator.sanitizeExpression('  2  +  3  ')).toBe('2 + 3');
      expect(MathValidator.sanitizeExpression('2\t+\n3')).toBe('2 + 3');
    });

    it('should handle complex expressions', () => {
      const input = '2π×(x+1)²';
      const output = MathValidator.sanitizeExpression(input);
      expect(output).toBe('2*pi*(x+1)^2');
    });
  });

  describe('validateMathData', () => {
    it('should validate numbers', () => {
      expect(MathValidator.validateMathData(42).valid).toBe(true);
      expect(MathValidator.validateMathData(3.14).valid).toBe(true);
      expect(MathValidator.validateMathData(0).valid).toBe(true);
      expect(MathValidator.validateMathData(-5).valid).toBe(true);
    });

    it('should reject infinite numbers', () => {
      expect(MathValidator.validateMathData(Infinity).valid).toBe(false);
      expect(MathValidator.validateMathData(-Infinity).valid).toBe(false);
      expect(MathValidator.validateMathData(NaN).valid).toBe(false);
    });

    it('should validate strings as expressions', () => {
      expect(MathValidator.validateMathData('2 + 2').valid).toBe(true);
      expect(MathValidator.validateMathData('eval(bad)').valid).toBe(false);
    });

    it('should validate arrays (vectors)', () => {
      expect(MathValidator.validateMathData([1, 2, 3]).valid).toBe(true);
      expect(MathValidator.validateMathData([]).valid).toBe(false);
      expect(MathValidator.validateMathData([1, Infinity, 3]).valid).toBe(
        false
      );
    });

    it('should validate nested arrays (matrices)', () => {
      expect(
        MathValidator.validateMathData([
          [1, 2],
          [3, 4],
        ]).valid
      ).toBe(true);
      expect(MathValidator.validateMathData([[1, 2], []]).valid).toBe(false);
      expect(
        MathValidator.validateMathData([
          [1, 2],
          [3, NaN],
        ]).valid
      ).toBe(false);
    });

    it('should reject null and undefined', () => {
      expect(MathValidator.validateMathData(null).valid).toBe(false);
      expect(MathValidator.validateMathData(undefined).valid).toBe(false);
    });

    it('should reject unsupported types', () => {
      expect(MathValidator.validateMathData({}).valid).toBe(false);
      expect(MathValidator.validateMathData(() => {}).valid).toBe(false);
      expect(MathValidator.validateMathData(Symbol('test')).valid).toBe(false);
    });
  });

  describe('validateFloatingPoint', () => {
    it('should validate finite numbers', () => {
      expect(MathValidator.validateFloatingPoint(42).valid).toBe(true);
      expect(MathValidator.validateFloatingPoint(3.14159).valid).toBe(true);
      expect(MathValidator.validateFloatingPoint(0).valid).toBe(true);
      expect(MathValidator.validateFloatingPoint(-273.15).valid).toBe(true);
    });

    it('should reject non-numbers', () => {
      // @ts-ignore - Testing runtime behavior
      expect(MathValidator.validateFloatingPoint('42').valid).toBe(false);
      // @ts-ignore - Testing runtime behavior
      expect(MathValidator.validateFloatingPoint(null).valid).toBe(false);
      // @ts-ignore - Testing runtime behavior
      expect(MathValidator.validateFloatingPoint(undefined).valid).toBe(false);
    });

    it('should reject NaN', () => {
      expect(MathValidator.validateFloatingPoint(NaN).valid).toBe(false);
    });

    it('should reject infinite values', () => {
      expect(MathValidator.validateFloatingPoint(Infinity).valid).toBe(false);
      expect(MathValidator.validateFloatingPoint(-Infinity).valid).toBe(false);
    });

    it('should handle very small numbers', () => {
      const result = MathValidator.validateFloatingPoint(1e-20);
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('0');
    });

    it('should reject numbers exceeding safe integer range', () => {
      const result = MathValidator.validateFloatingPoint(
        Number.MAX_SAFE_INTEGER + 1
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain('safe integer range');
    });

    it('should handle edge cases near zero', () => {
      expect(
        MathValidator.validateFloatingPoint(Number.EPSILON / 2).sanitized
      ).toBe('0');
      expect(
        MathValidator.validateFloatingPoint(-Number.EPSILON / 2).sanitized
      ).toBe('0');
    });
  });

  describe('edge cases and security', () => {
    it('should handle nested dangerous patterns', () => {
      const result = MathValidator.validateExpression('sin(eval(x))');
      expect(result.valid).toBe(false);
    });

    it('should handle case-insensitive dangerous patterns', () => {
      expect(MathValidator.validateExpression('EVAL(x)').valid).toBe(false);
      expect(MathValidator.validateExpression('Eval(x)').valid).toBe(false);
      expect(MathValidator.validateExpression('eVaL(x)').valid).toBe(false);
    });

    it('should handle unicode and special characters', () => {
      expect(MathValidator.validateExpression('2 + 2').valid).toBe(true);
      expect(MathValidator.validateExpression('2\u0000+\u00002').valid).toBe(
        false
      );
    });

    it('should handle very long expressions', () => {
      const longExpr = 'x+'.repeat(10000) + '1';
      const result = MathValidator.validateExpression(longExpr);
      // Should handle gracefully without crashing
      expect(result).toBeDefined();
    });

    it('should handle expressions with many nested parentheses', () => {
      const nested = '('.repeat(100) + '1' + ')'.repeat(100);
      const result = MathValidator.validateExpression(nested);
      expect(result.valid).toBe(true);
    });

    it('should handle unbalanced parentheses edge cases', () => {
      expect(MathValidator.validateExpression('(((').valid).toBe(false);
      expect(MathValidator.validateExpression(')))').valid).toBe(false);
      expect(MathValidator.validateExpression('())(').valid).toBe(false);
    });
  });

  describe('performance and stress testing', () => {
    it('should handle repeated validation calls efficiently', () => {
      const startTime = Date.now();

      for (let i = 0; i < 1000; i++) {
        MathValidator.validateExpression('2 + 2');
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete 1000 validations in reasonable time (< 1 second)
      expect(duration).toBeLessThan(1000);
    });

    it('should handle complex expressions efficiently', () => {
      const complexExpr = 'sin(cos(tan(sqrt(abs(log(exp(x^2 + 2*x + 1)))))))';
      const startTime = Date.now();

      const result = MathValidator.validateExpression(complexExpr);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(result.valid).toBe(true);
      expect(duration).toBeLessThan(100); // Should be fast
    });
  });
});

describe('mathValidation convenience functions', () => {
  it('should provide validateAndSanitize function', () => {
    const result = mathValidation.validateAndSanitize('2 + 2');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('2 + 2');
  });

  it('should provide validateData function', () => {
    const result = mathValidation.validateData([1, 2, 3]);
    expect(result.valid).toBe(true);
  });

  it('should provide validateNumber function', () => {
    const result = mathValidation.validateNumber(3.14);
    expect(result.valid).toBe(true);
  });

  it('should provide isSafeExpression function', () => {
    expect(mathValidation.isSafeExpression('2 + 2')).toBe(true);
    expect(mathValidation.isSafeExpression('eval(bad)')).toBe(false);
  });

  it('should handle all convenience functions with edge cases', () => {
    // Test with null/undefined inputs
    // @ts-ignore - Testing runtime behavior
    expect(mathValidation.validateAndSanitize(null).valid).toBe(false);
    expect(mathValidation.validateData(null).valid).toBe(false);
    // @ts-ignore - Testing runtime behavior
    expect(mathValidation.validateNumber('not a number').valid).toBe(false);
    // @ts-ignore - Testing runtime behavior
    expect(mathValidation.isSafeExpression(null)).toBe(false);
  });
});
