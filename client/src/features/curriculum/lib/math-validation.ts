/**
 * Math validation utilities for practice problems using math.js
 * Provides comprehensive answer validation for arithmetic curriculum
 */

import { loadMathJS, getMathInstance } from '../../../lib/math/math-loader';
import { MathValidator } from '../../../lib/math/validation';

export interface MathValidationResult {
  isCorrect: boolean;
  normalizedAnswer?: string;
  evaluatedAnswer?: number | string;
  error?: string;
  suggestions?: string[];
}

export interface ValidationOptions {
  tolerance?: number;
  allowEquivalentForms?: boolean;
  caseSensitive?: boolean;
  normalizeSpaces?: boolean;
}

/**
 * Enhanced math validation class for practice problems
 */
export class PracticeMathValidator {
  private static mathInstance: any = null;
  private static initialized = false;

  /**
   * Initialize the math.js instance
   */
  static async initialize(): Promise<boolean> {
    if (this.initialized && this.mathInstance) {
      return true;
    }

    try {
      const result = await loadMathJS();
      if (result.loaded) {
        this.mathInstance = getMathInstance();
        this.initialized = true;
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Failed to initialize math.js for validation:', error);
      return false;
    }
  }

  /**
   * Validate a user's answer against the correct answer
   */
  static async validateAnswer(
    userAnswer: string | number,
    correctAnswer: string | number,
    options: ValidationOptions = {}
  ): Promise<MathValidationResult> {
    const {
      tolerance = 0.0001,
      allowEquivalentForms = true,
      caseSensitive = false,
      normalizeSpaces = true,
    } = options;

    try {
      // Initialize math.js if needed
      await this.initialize();

      // Convert inputs to strings for processing
      const userStr = this.normalizeInput(userAnswer, {
        caseSensitive,
        normalizeSpaces,
      });
      const correctStr = this.normalizeInput(correctAnswer, {
        caseSensitive,
        normalizeSpaces,
      });

      // Direct string comparison first (fastest)
      if (userStr === correctStr) {
        return {
          isCorrect: true,
          normalizedAnswer: userStr,
        };
      }

      // Try mathematical evaluation if math.js is available
      if (this.mathInstance && allowEquivalentForms) {
        const mathResult = await this.validateWithMathJS(
          userStr,
          correctStr,
          tolerance
        );
        if (mathResult.isCorrect) {
          return mathResult;
        }
      }

      // Try pattern-based validation for specific formats
      const patternResult = this.validateWithPatterns(userStr, correctStr);
      if (patternResult.isCorrect) {
        return patternResult;
      }

      // Generate suggestions for common mistakes
      const suggestions = this.generateSuggestions(userStr, correctStr);

      return {
        isCorrect: false,
        normalizedAnswer: userStr,
        suggestions,
      };
    } catch (error) {
      console.error('Error in answer validation:', error);
      return {
        isCorrect: false,
        error: 'Validation error occurred',
      };
    }
  }

  /**
   * Normalize input for comparison
   */
  private static normalizeInput(
    input: string | number,
    options: { caseSensitive?: boolean; normalizeSpaces?: boolean } = {}
  ): string {
    let normalized = String(input);

    if (!options.caseSensitive) {
      normalized = normalized.toLowerCase();
    }

    if (options.normalizeSpaces) {
      normalized = normalized.replace(/\s+/g, ' ').trim();
    }

    // Remove common formatting
    normalized = normalized.replace(/,/g, ''); // Remove commas
    normalized = normalized.replace(/\$/g, ''); // Remove dollar signs
    normalized = normalized.replace(/%/g, ''); // Remove percent signs (handle separately)

    return normalized;
  }

  /**
   * Validate using math.js evaluation
   */
  private static async validateWithMathJS(
    userAnswer: string,
    correctAnswer: string,
    tolerance: number
  ): Promise<MathValidationResult> {
    if (!this.mathInstance) {
      return { isCorrect: false, error: 'Math.js not available' };
    }

    try {
      // Validate expressions for security
      const userValidation = MathValidator.validateExpression(userAnswer);
      const correctValidation = MathValidator.validateExpression(correctAnswer);

      if (!userValidation.valid) {
        return {
          isCorrect: false,
          error: `Invalid user expression: ${userValidation.error}`,
        };
      }

      if (!correctValidation.valid) {
        return {
          isCorrect: false,
          error: `Invalid correct expression: ${correctValidation.error}`,
        };
      }

      // Evaluate both expressions
      const userEvaluated = this.mathInstance.evaluate(
        userValidation.sanitized || userAnswer
      );
      const correctEvaluated = this.mathInstance.evaluate(
        correctValidation.sanitized || correctAnswer
      );

      // Handle different types of results
      if (
        typeof userEvaluated === 'number' &&
        typeof correctEvaluated === 'number'
      ) {
        const isEqual = Math.abs(userEvaluated - correctEvaluated) <= tolerance;
        return {
          isCorrect: isEqual,
          normalizedAnswer: userAnswer,
          evaluatedAnswer: userEvaluated,
        };
      }

      // Handle complex numbers, matrices, etc.
      if (
        this.mathInstance.equal &&
        this.mathInstance.equal(userEvaluated, correctEvaluated)
      ) {
        return {
          isCorrect: true,
          normalizedAnswer: userAnswer,
          evaluatedAnswer: userEvaluated,
        };
      }

      // Convert to string and compare
      const userStr = String(userEvaluated);
      const correctStr = String(correctEvaluated);

      return {
        isCorrect: userStr === correctStr,
        normalizedAnswer: userAnswer,
        evaluatedAnswer: userEvaluated,
      };
    } catch (error) {
      console.warn('Math.js evaluation failed:', error);
      return {
        isCorrect: false,
        error: `Evaluation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Validate using pattern matching for specific formats
   */
  private static validateWithPatterns(
    userAnswer: string,
    correctAnswer: string
  ): MathValidationResult {
    // Handle expanded form (e.g., "20,000 + 3,000 + 400 + 50 + 6")
    if (userAnswer.includes('+') && correctAnswer.includes('+')) {
      const userParts = this.parseExpandedForm(userAnswer);
      const correctParts = this.parseExpandedForm(correctAnswer);

      if (userParts.length === correctParts.length) {
        const userSorted = userParts.sort((a, b) => b - a);
        const correctSorted = correctParts.sort((a, b) => b - a);

        const isEqual = userSorted.every(
          (val, idx) => val === correctSorted[idx]
        );
        if (isEqual) {
          return {
            isCorrect: true,
            normalizedAnswer: userAnswer,
          };
        }
      }
    }

    // Handle fractions (e.g., "1/2", "3/4")
    if (userAnswer.includes('/') && correctAnswer.includes('/')) {
      const userFraction = this.parseFraction(userAnswer);
      const correctFraction = this.parseFraction(correctAnswer);

      if (userFraction && correctFraction) {
        const userDecimal = userFraction.numerator / userFraction.denominator;
        const correctDecimal =
          correctFraction.numerator / correctFraction.denominator;

        if (Math.abs(userDecimal - correctDecimal) < 0.0001) {
          return {
            isCorrect: true,
            normalizedAnswer: userAnswer,
          };
        }
      }
    }

    // Handle percentages
    if (userAnswer.includes('%') || correctAnswer.includes('%')) {
      const userPercent = this.parsePercentage(userAnswer);
      const correctPercent = this.parsePercentage(correctAnswer);

      if (userPercent !== null && correctPercent !== null) {
        if (Math.abs(userPercent - correctPercent) < 0.01) {
          return {
            isCorrect: true,
            normalizedAnswer: userAnswer,
          };
        }
      }
    }

    return { isCorrect: false };
  }

  /**
   * Parse expanded form expressions
   */
  private static parseExpandedForm(expression: string): number[] {
    try {
      const parts = expression.split('+').map(part => {
        const cleaned = part.trim().replace(/,/g, '');
        return parseFloat(cleaned);
      });

      return parts.filter(num => !isNaN(num));
    } catch {
      return [];
    }
  }

  /**
   * Parse fraction expressions
   */
  private static parseFraction(
    expression: string
  ): { numerator: number; denominator: number } | null {
    try {
      const match = expression.match(/(\d+)\s*\/\s*(\d+)/);
      if (match) {
        return {
          numerator: parseInt(match[1]),
          denominator: parseInt(match[2]),
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Parse percentage expressions
   */
  private static parsePercentage(expression: string): number | null {
    try {
      const match = expression.match(/([\d.]+)\s*%?/);
      if (match) {
        const value = parseFloat(match[1]);
        return expression.includes('%') ? value : value * 100;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Generate helpful suggestions for incorrect answers
   */
  private static generateSuggestions(
    userAnswer: string,
    correctAnswer: string
  ): string[] {
    const suggestions: string[] = [];

    // Check for common formatting issues
    if (userAnswer.replace(/,/g, '') === correctAnswer.replace(/,/g, '')) {
      suggestions.push('Check your comma placement in large numbers');
    }

    // Check for missing operations
    if (correctAnswer.includes('+') && !userAnswer.includes('+')) {
      suggestions.push(
        'This might be an expanded form - try adding the parts together'
      );
    }

    // Check for decimal vs percentage confusion
    if (correctAnswer.includes('%') && !userAnswer.includes('%')) {
      suggestions.push('Remember to include the % symbol for percentages');
    }

    // Check for rounding issues
    const userNum = parseFloat(userAnswer.replace(/[^0-9.-]/g, ''));
    const correctNum = parseFloat(correctAnswer.replace(/[^0-9.-]/g, ''));

    if (!isNaN(userNum) && !isNaN(correctNum)) {
      const diff = Math.abs(userNum - correctNum);
      if (diff > 0 && diff < correctNum * 0.1) {
        suggestions.push(
          'Your answer is close - check your rounding or calculation'
        );
      }
    }

    return suggestions;
  }

  /**
   * Validate specific arithmetic operations
   */
  static async validateArithmeticOperation(
    operation: string,
    userResult: string | number,
    expectedResult: string | number
  ): Promise<MathValidationResult> {
    await this.initialize();

    if (!this.mathInstance) {
      // Fallback to basic validation
      return {
        isCorrect: String(userResult) === String(expectedResult),
        normalizedAnswer: String(userResult),
      };
    }

    try {
      // Validate the operation expression
      const validation = MathValidator.validateExpression(operation);
      if (!validation.valid) {
        return {
          isCorrect: false,
          error: `Invalid operation: ${validation.error}`,
        };
      }

      // Evaluate the operation
      const calculated = this.mathInstance.evaluate(
        validation.sanitized || operation
      );
      const userNum =
        typeof userResult === 'number'
          ? userResult
          : parseFloat(String(userResult));
      const expectedNum =
        typeof expectedResult === 'number'
          ? expectedResult
          : parseFloat(String(expectedResult));

      // Check if user result matches calculated result
      const userCorrect = Math.abs(calculated - userNum) < 0.0001;
      const expectedCorrect = Math.abs(calculated - expectedNum) < 0.0001;

      return {
        isCorrect: userCorrect && expectedCorrect,
        normalizedAnswer: String(userResult),
        evaluatedAnswer: calculated,
      };
    } catch (error) {
      return {
        isCorrect: false,
        error: `Operation validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}
