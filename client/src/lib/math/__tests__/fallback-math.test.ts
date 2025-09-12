import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createFallbackMath, FallbackMath } from '../fallback-math';

describe('Fallback Math', () => {
  let fallbackMath: FallbackMath;

  beforeEach(() => {
    fallbackMath = createFallbackMath();
  });

  describe('basic arithmetic', () => {
    it('should evaluate simple addition', () => {
      expect(fallbackMath.evaluate('2+2')).toBe(4);
      expect(fallbackMath.evaluate('10+5')).toBe(15);
      expect(fallbackMath.evaluate('-3+7')).toBe(4);
    });

    it('should evaluate simple subtraction', () => {
      expect(fallbackMath.evaluate('5-3')).toBe(2);
      expect(fallbackMath.evaluate('10-15')).toBe(-5);
      expect(fallbackMath.evaluate('0-5')).toBe(-5);
    });

    it('should evaluate simple multiplication', () => {
      expect(fallbackMath.evaluate('3*4')).toBe(12);
      expect(fallbackMath.evaluate('7*0')).toBe(0);
      expect(fallbackMath.evaluate('-2*3')).toBe(-6);
    });

    it('should evaluate simple division', () => {
      expect(fallbackMath.evaluate('8/2')).toBe(4);
      expect(fallbackMath.evaluate('15/3')).toBe(5);
      expect(fallbackMath.evaluate('1/2')).toBe(0.5);
    });

    it('should handle division by zero', () => {
      expect(fallbackMath.evaluate('5/0')).toBe(Infinity);
      expect(fallbackMath.evaluate('-5/0')).toBe(-Infinity);
    });

    it('should evaluate exponentiation', () => {
      expect(fallbackMath.evaluate('2^3')).toBe(8);
      expect(fallbackMath.evaluate('5^2')).toBe(25);
      expect(fallbackMath.evaluate('2^0')).toBe(1);
    });
  });

  describe('mathematical functions', () => {
    it('should evaluate trigonometric functions', () => {
      expect(fallbackMath.evaluate('sin(0)')).toBeCloseTo(0, 10);
      expect(fallbackMath.evaluate('cos(0)')).toBeCloseTo(1, 10);
      expect(fallbackMath.evaluate('tan(0)')).toBeCloseTo(0, 10);
    });

    it('should evaluate inverse trigonometric functions', () => {
      expect(fallbackMath.evaluate('asin(0)')).toBeCloseTo(0, 10);
      expect(fallbackMath.evaluate('acos(1)')).toBeCloseTo(0, 10);
      expect(fallbackMath.evaluate('atan(0)')).toBeCloseTo(0, 10);
    });

    it('should evaluate logarithmic functions', () => {
      expect(fallbackMath.evaluate('log(1)')).toBeCloseTo(0, 10);
      expect(fallbackMath.evaluate('log10(10)')).toBeCloseTo(1, 10);
      expect(fallbackMath.evaluate('log2(8)')).toBeCloseTo(3, 10);
    });

    it('should evaluate exponential functions', () => {
      expect(fallbackMath.evaluate('exp(0)')).toBeCloseTo(1, 10);
      expect(fallbackMath.evaluate('exp(1)')).toBeCloseTo(Math.E, 10);
    });

    it('should evaluate square root', () => {
      expect(fallbackMath.evaluate('sqrt(4)')).toBe(2);
      expect(fallbackMath.evaluate('sqrt(9)')).toBe(3);
      expect(fallbackMath.evaluate('sqrt(0)')).toBe(0);
    });

    it('should handle square root of negative numbers', () => {
      expect(isNaN(fallbackMath.evaluate('sqrt(-1)'))).toBe(true);
    });

    it('should evaluate absolute value', () => {
      expect(fallbackMath.evaluate('abs(5)')).toBe(5);
      expect(fallbackMath.evaluate('abs(-5)')).toBe(5);
      expect(fallbackMath.evaluate('abs(0)')).toBe(0);
    });

    it('should evaluate ceiling and floor functions', () => {
      expect(fallbackMath.evaluate('ceil(3.2)')).toBe(4);
      expect(fallbackMath.evaluate('floor(3.8)')).toBe(3);
      expect(fallbackMath.evaluate('round(3.6)')).toBe(4);
      expect(fallbackMath.evaluate('round(3.4)')).toBe(3);
    });
  });

  describe('mathematical constants', () => {
    it('should provide pi constant', () => {
      expect(fallbackMath.evaluate('pi')).toBeCloseTo(Math.PI, 10);
      expect(fallbackMath.evaluate('PI')).toBeCloseTo(Math.PI, 10);
    });

    it('should provide e constant', () => {
      expect(fallbackMath.evaluate('e')).toBeCloseTo(Math.E, 10);
      expect(fallbackMath.evaluate('E')).toBeCloseTo(Math.E, 10);
    });
  });

  describe('complex expressions', () => {
    it('should handle parentheses correctly', () => {
      expect(fallbackMath.evaluate('(2+3)*4')).toBe(20);
      expect(fallbackMath.evaluate('2+(3*4)')).toBe(14);
      expect(fallbackMath.evaluate('((2+3)*4)-5')).toBe(15);
    });

    it('should handle operator precedence', () => {
      expect(fallbackMath.evaluate('2+3*4')).toBe(14);
      expect(fallbackMath.evaluate('2*3+4')).toBe(10);
      expect(fallbackMath.evaluate('2^3*4')).toBe(32);
    });

    it('should handle nested function calls', () => {
      expect(fallbackMath.evaluate('sin(cos(0))')).toBeCloseTo(Math.sin(1), 10);
      expect(fallbackMath.evaluate('sqrt(abs(-16))')).toBe(4);
    });

    it('should handle mixed operations', () => {
      expect(fallbackMath.evaluate('2*pi*5')).toBeCloseTo(2 * Math.PI * 5, 10);
      expect(fallbackMath.evaluate('sin(pi/2)')).toBeCloseTo(1, 10);
      expect(fallbackMath.evaluate('log(e)')).toBeCloseTo(1, 10);
    });
  });

  describe('error handling', () => {
    it('should handle invalid expressions', () => {
      expect(() => fallbackMath.evaluate('invalid')).toThrow();
      expect(() => fallbackMath.evaluate('2+')).toThrow();
      expect(() => fallbackMath.evaluate('(2+3')).toThrow();
    });

    it('should handle empty expressions', () => {
      expect(() => fallbackMath.evaluate('')).toThrow();
      expect(() => fallbackMath.evaluate('   ')).toThrow();
    });

    it('should handle undefined functions', () => {
      expect(() => fallbackMath.evaluate('unknownFunction(5)')).toThrow();
    });

    it('should handle malformed function calls', () => {
      expect(() => fallbackMath.evaluate('sin(')).toThrow();
      expect(() => fallbackMath.evaluate('cos)')).toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle very large numbers', () => {
      const result = fallbackMath.evaluate('1e10*1e10');
      expect(result).toBe(1e20);
    });

    it('should handle very small numbers', () => {
      const result = fallbackMath.evaluate('1e-10*1e-10');
      expect(result).toBe(1e-20);
    });

    it('should handle infinity', () => {
      expect(fallbackMath.evaluate('1/0')).toBe(Infinity);
      expect(fallbackMath.evaluate('-1/0')).toBe(-Infinity);
    });

    it('should handle NaN cases', () => {
      expect(isNaN(fallbackMath.evaluate('0/0'))).toBe(true);
      expect(isNaN(fallbackMath.evaluate('sqrt(-1)'))).toBe(true);
    });

    it('should handle negative zero', () => {
      const result = fallbackMath.evaluate('-0');
      expect(Object.is(result, -0)).toBe(true);
    });
  });

  describe('whitespace handling', () => {
    it('should handle expressions with spaces', () => {
      expect(fallbackMath.evaluate('2 + 3')).toBe(5);
      expect(fallbackMath.evaluate('sin( pi / 2 )')).toBeCloseTo(1, 10);
      expect(fallbackMath.evaluate('  2  *  3  ')).toBe(6);
    });

    it('should handle expressions without spaces', () => {
      expect(fallbackMath.evaluate('2+3')).toBe(5);
      expect(fallbackMath.evaluate('sin(pi/2)')).toBeCloseTo(1, 10);
    });
  });

  describe('case sensitivity', () => {
    it('should handle case-insensitive constants', () => {
      expect(fallbackMath.evaluate('PI')).toBeCloseTo(Math.PI, 10);
      expect(fallbackMath.evaluate('pi')).toBeCloseTo(Math.PI, 10);
      expect(fallbackMath.evaluate('E')).toBeCloseTo(Math.E, 10);
      expect(fallbackMath.evaluate('e')).toBeCloseTo(Math.E, 10);
    });

    it('should handle case-insensitive functions', () => {
      expect(fallbackMath.evaluate('SIN(0)')).toBeCloseTo(0, 10);
      expect(fallbackMath.evaluate('COS(0)')).toBeCloseTo(1, 10);
      expect(fallbackMath.evaluate('SQRT(4)')).toBe(2);
    });
  });

  describe('performance', () => {
    it('should evaluate simple expressions quickly', () => {
      const startTime = Date.now();

      for (let i = 0; i < 1000; i++) {
        fallbackMath.evaluate('2+2');
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // Should complete 1000 evaluations in less than 1 second
    });

    it('should handle complex expressions efficiently', () => {
      const complexExpr = 'sin(cos(tan(sqrt(abs(log(exp(2+3*4)))))))';

      const startTime = Date.now();
      const result = fallbackMath.evaluate(complexExpr);
      const endTime = Date.now();

      expect(typeof result).toBe('number');
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('createFallbackMath factory', () => {
    it('should create independent instances', () => {
      const math1 = createFallbackMath();
      const math2 = createFallbackMath();

      expect(math1).not.toBe(math2);
      expect(math1.evaluate('2+2')).toBe(math2.evaluate('2+2'));
    });

    it('should create instances with consistent behavior', () => {
      const math1 = createFallbackMath();
      const math2 = createFallbackMath();

      const testExpressions = ['2+2', 'sin(pi/2)', 'sqrt(16)', 'log(e)', '2^3'];

      testExpressions.forEach(expr => {
        expect(math1.evaluate(expr)).toBeCloseTo(math2.evaluate(expr), 10);
      });
    });
  });

  describe('mathematical accuracy', () => {
    it('should maintain precision for common calculations', () => {
      expect(fallbackMath.evaluate('0.1 + 0.2')).toBeCloseTo(0.3, 10);
      expect(fallbackMath.evaluate('1/3 * 3')).toBeCloseTo(1, 10);
      expect(fallbackMath.evaluate('sqrt(2) * sqrt(2)')).toBeCloseTo(2, 10);
    });

    it('should handle trigonometric identities', () => {
      expect(fallbackMath.evaluate('sin(pi/2)')).toBeCloseTo(1, 10);
      expect(fallbackMath.evaluate('cos(pi)')).toBeCloseTo(-1, 10);
      expect(fallbackMath.evaluate('tan(pi/4)')).toBeCloseTo(1, 10);
    });

    it('should handle logarithmic properties', () => {
      expect(fallbackMath.evaluate('log(e^2)')).toBeCloseTo(2, 10);
      expect(fallbackMath.evaluate('log10(100)')).toBeCloseTo(2, 10);
      expect(fallbackMath.evaluate('log2(16)')).toBeCloseTo(4, 10);
    });
  });
});
