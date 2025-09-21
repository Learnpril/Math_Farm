/**
 * Tests for math validation utilities
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { PracticeMathValidator } from '../math-validation';

describe('PracticeMathValidator', () => {
  beforeAll(async () => {
    // Initialize the validator before running tests
    await PracticeMathValidator.initialize();
  });

  describe('validateAnswer', () => {
    it('should validate exact string matches', async () => {
      const result = await PracticeMathValidator.validateAnswer('42', '42');
      expect(result.isCorrect).toBe(true);
    });

    it('should validate case-insensitive matches', async () => {
      const result = await PracticeMathValidator.validateAnswer('ABC', 'abc');
      expect(result.isCorrect).toBe(true);
    });

    it('should validate numeric equivalence', async () => {
      const result = await PracticeMathValidator.validateAnswer('2 + 3', '5');
      expect(result.isCorrect).toBe(true);
    });

    it('should validate expanded form expressions', async () => {
      const result = await PracticeMathValidator.validateAnswer(
        '20000 + 3000 + 400 + 50 + 6',
        '20,000 + 3,000 + 400 + 50 + 6'
      );
      expect(result.isCorrect).toBe(true);
    });

    it('should validate equivalent fractions', async () => {
      const result = await PracticeMathValidator.validateAnswer('1/2', '2/4');
      expect(result.isCorrect).toBe(true);
    });

    it('should handle percentage validation', async () => {
      const result = await PracticeMathValidator.validateAnswer('50%', '0.5');
      expect(result.isCorrect).toBe(true);
    });

    it('should provide suggestions for incorrect answers', async () => {
      const result = await PracticeMathValidator.validateAnswer('42', '43');
      expect(result.isCorrect).toBe(false);
      expect(result.suggestions).toBeDefined();
    });

    it('should handle mathematical expressions with variables', async () => {
      const result = await PracticeMathValidator.validateAnswer(
        'x + 1',
        'x + 1'
      );
      expect(result.isCorrect).toBe(true);
    });

    it('should validate with tolerance for floating point numbers', async () => {
      const result = await PracticeMathValidator.validateAnswer(
        '0.33333',
        '1/3',
        {
          tolerance: 0.01,
        }
      );
      expect(result.isCorrect).toBe(true);
    });

    it('should reject invalid mathematical expressions', async () => {
      const result = await PracticeMathValidator.validateAnswer(
        'eval(alert("xss"))',
        '42'
      );
      expect(result.isCorrect).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validateArithmeticOperation', () => {
    it('should validate basic arithmetic operations', async () => {
      const result = await PracticeMathValidator.validateArithmeticOperation(
        '15 + 27',
        '42',
        '42'
      );
      expect(result.isCorrect).toBe(true);
    });

    it('should validate multiplication operations', async () => {
      const result = await PracticeMathValidator.validateArithmeticOperation(
        '6 * 7',
        42,
        42
      );
      expect(result.isCorrect).toBe(true);
    });

    it('should validate division operations', async () => {
      const result = await PracticeMathValidator.validateArithmeticOperation(
        '84 / 2',
        '42',
        '42'
      );
      expect(result.isCorrect).toBe(true);
    });

    it('should handle complex expressions', async () => {
      const result = await PracticeMathValidator.validateArithmeticOperation(
        '(10 + 5) * 2 + 12',
        '42',
        '42'
      );
      expect(result.isCorrect).toBe(true);
    });

    it('should reject dangerous operations', async () => {
      const result = await PracticeMathValidator.validateArithmeticOperation(
        'eval("malicious code")',
        '42',
        '42'
      );
      expect(result.isCorrect).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('pattern matching', () => {
    it('should handle expanded form with different ordering', async () => {
      const result = await PracticeMathValidator.validateAnswer(
        '6 + 50 + 400 + 3000 + 20000',
        '20,000 + 3,000 + 400 + 50 + 6'
      );
      expect(result.isCorrect).toBe(true);
    });

    it('should handle mixed number formats', async () => {
      const result = await PracticeMathValidator.validateAnswer(
        '8500',
        '8,500'
      );
      expect(result.isCorrect).toBe(true);
    });

    it('should handle decimal equivalents', async () => {
      const result = await PracticeMathValidator.validateAnswer('0.75', '3/4');
      expect(result.isCorrect).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle null/undefined inputs gracefully', async () => {
      const result = await PracticeMathValidator.validateAnswer('', '42');
      expect(result.isCorrect).toBe(false);
    });

    it('should handle malformed expressions', async () => {
      const result = await PracticeMathValidator.validateAnswer('2 + + 3', '5');
      expect(result.isCorrect).toBe(false);
    });

    it('should provide meaningful error messages', async () => {
      const result = await PracticeMathValidator.validateAnswer(
        'invalid expression',
        '42'
      );
      expect(result.isCorrect).toBe(false);
      expect(result.error || result.suggestions).toBeDefined();
    });
  });
});
