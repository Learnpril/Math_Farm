/**
 * DrillGenerator utility class for generating printable math drill problems
 * Supports addition, subtraction, multiplication, and division with configurable difficulty levels
 */

import type {
  DrillProblem,
  DrillSet,
  DrillConfiguration,
  DigitSelection,
} from '../types';

/**
 * Chapter-based difficulty configurations
 * Chapter 3: Addition and Subtraction (was Chapter 2)
 * Chapter 4: Multiplication Basics (was Chapter 3)
 * Chapter 5: Division Basics (was Chapter 4)
 * Future chapters will have their own drill types (fractions, etc.)
 */
const CHAPTER_CONFIGURATIONS: Record<string, DrillConfiguration> = {
  'chapter-03': {
    problemCount: 20,
    gridColumns: 4,
    gridRows: 5,
    numberRange: { min: 1, max: 20 },
    allowNegativeResults: false,
    mixedDifficulty: false,
  },
  'chapter-04': {
    problemCount: 20,
    gridColumns: 4,
    gridRows: 5,
    numberRange: { min: 1, max: 12 }, // Times tables up to 12
    allowNegativeResults: false,
    mixedDifficulty: false,
  },
  'chapter-05': {
    problemCount: 20,
    gridColumns: 4,
    gridRows: 5,
    numberRange: { min: 1, max: 12 }, // Division facts up to 12
    allowNegativeResults: false,
    mixedDifficulty: false,
  },
  // Default configuration (fallback for Chapter 2)
  default: {
    problemCount: 20,
    gridColumns: 4,
    gridRows: 5,
    numberRange: { min: 1, max: 20 },
    allowNegativeResults: false,
    mixedDifficulty: false,
  },
};

export class DrillGenerator {
  private static instance: DrillGenerator;
  private seedCounter: number = 0;

  private constructor() {}

  public static getInstance(): DrillGenerator {
    if (!DrillGenerator.instance) {
      DrillGenerator.instance = new DrillGenerator();
    }
    return DrillGenerator.instance;
  }

  /**
   * Get configuration for a specific chapter
   */
  public getChapterConfiguration(chapterId: string): DrillConfiguration {
    return (
      CHAPTER_CONFIGURATIONS[chapterId] || CHAPTER_CONFIGURATIONS['default']!
    );
  }

  /**
   * Generate a set of addition problems
   */
  public generateAdditionProblems(
    config: DrillConfiguration,
    chapterId?: string
  ): DrillProblem[] {
    const problems: DrillProblem[] = [];

    for (let i = 0; i < config.problemCount; i++) {
      let operand1: number;
      let operand2: number;

      // Use digit selection if specified, otherwise use number range
      if (config.digitSelection) {
        const numbers = this.generateNumbersByDigitSelection(
          config.digitSelection,
          chapterId
        );
        operand1 = numbers.operand1;
        operand2 = numbers.operand2;
      } else {
        operand1 = this.generateRandomNumber(
          config.numberRange.min,
          config.numberRange.max
        );
        operand2 = this.generateRandomNumber(
          config.numberRange.min,
          config.numberRange.max
        );
      }

      const answer = operand1 + operand2;

      const difficulty = config.mixedDifficulty
        ? this.determineDifficulty(operand1, operand2, 'addition')
        : 'easy';

      problems.push({
        id: `add-${i + 1}-${this.seedCounter}`,
        operand1,
        operand2,
        operation: 'addition',
        answer,
        difficulty,
      });
    }

    this.seedCounter++;
    return problems;
  }

  /**
   * Generate a set of multiplication problems
   */
  public generateMultiplicationProblems(
    config: DrillConfiguration,
    chapterId?: string
  ): DrillProblem[] {
    const problems: DrillProblem[] = [];

    for (let i = 0; i < config.problemCount; i++) {
      let operand1: number;
      let operand2: number;

      // Use digit selection if specified, otherwise use number range
      if (config.digitSelection) {
        const numbers = this.generateNumbersByDigitSelection(
          config.digitSelection,
          chapterId
        );
        operand1 = numbers.operand1;
        operand2 = numbers.operand2;
      } else {
        operand1 = this.generateRandomNumber(
          config.numberRange.min,
          config.numberRange.max
        );
        operand2 = this.generateRandomNumber(
          config.numberRange.min,
          config.numberRange.max
        );
      }

      // For multiplication, ensure the larger number is always on top (operand1)
      if (operand2 > operand1) {
        const temp = operand1;
        operand1 = operand2;
        operand2 = temp;
      }

      const answer = operand1 * operand2;

      const difficulty = config.mixedDifficulty
        ? this.determineDifficulty(operand1, operand2, 'multiplication')
        : 'easy';

      problems.push({
        id: `mult-${i + 1}-${this.seedCounter}`,
        operand1,
        operand2,
        operation: 'multiplication',
        answer,
        difficulty,
      });
    }

    this.seedCounter++;
    return problems;
  }

  /**
   * Generate a set of division problems
   */
  public generateDivisionProblems(
    config: DrillConfiguration,
    chapterId?: string
  ): DrillProblem[] {
    const problems: DrillProblem[] = [];

    for (let i = 0; i < config.problemCount; i++) {
      let divisor: number;
      let quotient: number;

      // Use digit selection if specified, otherwise use number range
      if (config.digitSelection) {
        const numbers = this.generateNumbersByDigitSelection(
          config.digitSelection,
          chapterId
        );
        // For division, we want smaller divisors and reasonable quotients
        divisor = Math.min(numbers.operand1, numbers.operand2);
        quotient = Math.max(numbers.operand1, numbers.operand2);
      } else {
        divisor = this.generateRandomNumber(
          config.numberRange.min,
          config.numberRange.max
        );
        quotient = this.generateRandomNumber(
          config.numberRange.min,
          config.numberRange.max
        );
      }

      // Ensure divisor is not 0 and is reasonable for division
      if (divisor === 0) divisor = 1;

      // Calculate dividend (the number being divided)
      const dividend = divisor * quotient;

      const difficulty = config.mixedDifficulty
        ? this.determineDifficulty(dividend, divisor, 'division')
        : 'easy';

      problems.push({
        id: `div-${i + 1}-${this.seedCounter}`,
        operand1: dividend, // dividend (top number)
        operand2: divisor, // divisor (bottom number)
        operation: 'division',
        answer: quotient, // quotient (answer)
        difficulty,
      });
    }

    this.seedCounter++;
    return problems;
  }

  /**
   * Generate a set of subtraction problems
   */
  public generateSubtractionProblems(
    config: DrillConfiguration,
    chapterId?: string
  ): DrillProblem[] {
    const problems: DrillProblem[] = [];

    for (let i = 0; i < config.problemCount; i++) {
      let operand1: number;
      let operand2: number;
      let answer: number;

      // Use digit selection if specified
      if (config.digitSelection) {
        const numbers = this.generateNumbersByDigitSelection(
          config.digitSelection,
          chapterId
        );

        if (config.allowNegativeResults) {
          operand1 = numbers.operand1;
          operand2 = numbers.operand2;
          answer = operand1 - operand2;
        } else {
          // Ensure operand1 >= operand2 for positive results
          operand1 = Math.max(numbers.operand1, numbers.operand2);
          operand2 = Math.min(numbers.operand1, numbers.operand2);
          answer = operand1 - operand2;
        }
      } else {
        // Generate numbers ensuring positive results unless negative results are allowed
        if (config.allowNegativeResults) {
          operand1 = this.generateRandomNumber(
            config.numberRange.min,
            config.numberRange.max
          );
          operand2 = this.generateRandomNumber(
            config.numberRange.min,
            config.numberRange.max
          );
          answer = operand1 - operand2;
        } else {
          // Ensure operand1 >= operand2 for positive results
          const num1 = this.generateRandomNumber(
            config.numberRange.min,
            config.numberRange.max
          );
          const num2 = this.generateRandomNumber(
            config.numberRange.min,
            config.numberRange.max
          );

          operand1 = Math.max(num1, num2);
          operand2 = Math.min(num1, num2);
          answer = operand1 - operand2;
        }
      }

      const difficulty = config.mixedDifficulty
        ? this.determineDifficulty(operand1, operand2, 'subtraction')
        : 'easy';

      problems.push({
        id: `sub-${i + 1}-${this.seedCounter}`,
        operand1,
        operand2,
        operation: 'subtraction',
        answer,
        difficulty,
      });
    }

    this.seedCounter++;
    return problems;
  }

  /**
   * Generate a complete drill set for a chapter
   */
  public generateDrillSet(
    chapterId: string,
    operation: 'addition' | 'subtraction' | 'multiplication' | 'division',
    chapterTitle?: string,
    digitSelection?: DigitSelection
  ): DrillSet {
    const config = this.getChapterConfiguration(chapterId);

    // Override digit selection if provided
    if (digitSelection) {
      config.digitSelection = digitSelection;
    }

    let problems: DrillProblem[];
    switch (operation) {
      case 'addition':
        problems = this.generateAdditionProblems(config, chapterId);
        break;
      case 'subtraction':
        problems = this.generateSubtractionProblems(config, chapterId);
        break;
      case 'multiplication':
        problems = this.generateMultiplicationProblems(config, chapterId);
        break;
      case 'division':
        problems = this.generateDivisionProblems(config, chapterId);
        break;
      default:
        problems = this.generateAdditionProblems(config, chapterId);
    }

    // Update title to include digit information
    let digitInfo = '';
    if (digitSelection) {
      switch (digitSelection) {
        case 'one':
          digitInfo = ' (1-Digit)';
          break;
        case 'two':
          digitInfo = ' (2-Digit)';
          break;
        case 'three':
          digitInfo = ' (3-Digit)';
          break;
        case 'mixed':
          digitInfo = ' (Mixed Digits)';
          break;
      }
    }

    const title = chapterTitle
      ? `${chapterTitle} - ${operation.charAt(0).toUpperCase() + operation.slice(1)} Drills${digitInfo}`
      : `${operation.charAt(0).toUpperCase() + operation.slice(1)} Drills${digitInfo}`;

    return {
      id: `drill-${chapterId}-${operation}-${Date.now()}`,
      title,
      operation,
      problems,
      generatedAt: new Date(),
      chapterLevel: this.extractChapterNumber(chapterId),
    };
  }

  /**
   * Format a problem for display
   */
  public formatProblemForDisplay(problem: DrillProblem): string {
    let operator: string;
    switch (problem.operation) {
      case 'addition':
        operator = '+';
        break;
      case 'subtraction':
        operator = '-';
        break;
      case 'multiplication':
        operator = '×';
        break;
      case 'division':
        operator = '÷';
        break;
      default:
        operator = '+';
    }
    return `${problem.operand1} ${operator} ${problem.operand2} = ____`;
  }

  /**
   * Format a problem with answer for display
   */
  public formatProblemWithAnswer(problem: DrillProblem): string {
    let operator: string;
    switch (problem.operation) {
      case 'addition':
        operator = '+';
        break;
      case 'subtraction':
        operator = '-';
        break;
      case 'multiplication':
        operator = '×';
        break;
      case 'division':
        operator = '÷';
        break;
      default:
        operator = '+';
    }
    return `${problem.operand1} ${operator} ${problem.operand2} = ${problem.answer}`;
  }

  /**
   * Generate a random number within the specified range (inclusive)
   */
  private generateRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generate a random number with specified digit count
   */
  private generateNumberByDigits(
    digitCount: number,
    chapterId?: string
  ): number {
    if (digitCount === 1) {
      return this.generateRandomNumber(1, 9);
    } else if (digitCount === 2) {
      // For Chapter 5 (Division), use smaller 2-digit numbers to keep problems manageable
      if (chapterId === 'chapter-05') {
        return this.generateRandomNumber(10, 25); // Much smaller range for division
      }
      return this.generateRandomNumber(10, 99);
    } else if (digitCount === 3) {
      return this.generateRandomNumber(100, 999);
    }
    return this.generateRandomNumber(1, 9); // fallback
  }

  /**
   * Generate numbers based on digit selection
   */
  private generateNumbersByDigitSelection(
    digitSelection: DigitSelection,
    chapterId?: string
  ): {
    operand1: number;
    operand2: number;
  } {
    switch (digitSelection) {
      case 'one':
        return {
          operand1: this.generateNumberByDigits(1, chapterId),
          operand2: this.generateNumberByDigits(1, chapterId),
        };
      case 'two':
        return {
          operand1: this.generateNumberByDigits(2, chapterId),
          operand2: this.generateNumberByDigits(2, chapterId),
        };
      case 'three':
        return {
          operand1: this.generateNumberByDigits(3, chapterId),
          operand2: this.generateNumberByDigits(3, chapterId),
        };
      case 'mixed':
        // Mix of 1, 2, and 3 digit numbers (but exclude 3-digit for Chapter 4 and 5)
        const availableDigits =
          chapterId === 'chapter-04' || chapterId === 'chapter-05'
            ? [1, 2]
            : [1, 2, 3];
        const digits1 = availableDigits[
          Math.floor(Math.random() * availableDigits.length)
        ] as 1 | 2 | 3;
        const digits2 = availableDigits[
          Math.floor(Math.random() * availableDigits.length)
        ] as 1 | 2 | 3;
        return {
          operand1: this.generateNumberByDigits(digits1, chapterId),
          operand2: this.generateNumberByDigits(digits2, chapterId),
        };
      default:
        return {
          operand1: this.generateNumberByDigits(1, chapterId),
          operand2: this.generateNumberByDigits(1, chapterId),
        };
    }
  }

  /**
   * Determine difficulty level based on operands and operation
   */
  private determineDifficulty(
    operand1: number,
    operand2: number,
    operation: 'addition' | 'subtraction' | 'multiplication' | 'division'
  ): 'easy' | 'medium' | 'hard' {
    const maxOperand = Math.max(operand1, operand2);
    const sum = operand1 + operand2;

    if (operation === 'addition') {
      if (sum <= 20) return 'easy';
      if (sum <= 100) return 'medium';
      return 'hard';
    } else if (operation === 'subtraction') {
      if (maxOperand <= 20) return 'easy';
      if (maxOperand <= 100) return 'medium';
      return 'hard';
    } else if (operation === 'multiplication') {
      if (maxOperand <= 5) return 'easy';
      if (maxOperand <= 10) return 'medium';
      return 'hard';
    } else {
      // division - based on dividend (operand1)
      if (operand1 <= 50) return 'easy';
      if (operand1 <= 144) return 'medium';
      return 'hard';
    }
  }

  /**
   * Extract chapter number from chapter ID
   */
  private extractChapterNumber(chapterId: string): number {
    const match = chapterId.match(/chapter-(\d+)/);
    return match && match[1] ? parseInt(match[1], 10) : 1;
  }

  /**
   * Validate drill configuration
   */
  public validateConfiguration(config: DrillConfiguration): boolean {
    return (
      config.problemCount > 0 &&
      config.gridColumns > 0 &&
      config.gridRows > 0 &&
      config.numberRange.min >= 0 &&
      config.numberRange.max > config.numberRange.min &&
      config.gridColumns * config.gridRows >= config.problemCount
    );
  }

  /**
   * Get all available chapter configurations
   */
  public getAvailableChapters(): string[] {
    return Object.keys(CHAPTER_CONFIGURATIONS).filter(key => key !== 'default');
  }
}

// Export singleton instance
export const drillGenerator = DrillGenerator.getInstance();
