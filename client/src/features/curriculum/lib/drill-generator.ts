/**
 * DrillGenerator utility class for generating printable math drill problems
 * Supports addition and subtraction with configurable difficulty levels
 */

import type {
  DrillProblem,
  DrillSet,
  DrillConfiguration,
} from '../types/curriculum';

/**
 * Chapter-based difficulty configurations
 * Maps chapter IDs to appropriate number ranges and difficulty settings
 */
const CHAPTER_CONFIGURATIONS: Record<string, DrillConfiguration> = {
  'chapter-01': {
    problemCount: 40,
    gridColumns: 5,
    gridRows: 8,
    numberRange: { min: 1, max: 10 },
    allowNegativeResults: false,
    mixedDifficulty: false,
  },
  'chapter-02': {
    problemCount: 40,
    gridColumns: 5,
    gridRows: 8,
    numberRange: { min: 1, max: 20 },
    allowNegativeResults: false,
    mixedDifficulty: false,
  },
  'chapter-03': {
    problemCount: 40,
    gridColumns: 5,
    gridRows: 8,
    numberRange: { min: 1, max: 50 },
    allowNegativeResults: false,
    mixedDifficulty: true,
  },
  'chapter-04': {
    problemCount: 40,
    gridColumns: 5,
    gridRows: 8,
    numberRange: { min: 1, max: 100 },
    allowNegativeResults: false,
    mixedDifficulty: true,
  },
  'chapter-05': {
    problemCount: 40,
    gridColumns: 5,
    gridRows: 8,
    numberRange: { min: 10, max: 500 },
    allowNegativeResults: false,
    mixedDifficulty: true,
  },
  'chapter-06': {
    problemCount: 40,
    gridColumns: 5,
    gridRows: 8,
    numberRange: { min: 10, max: 1000 },
    allowNegativeResults: false,
    mixedDifficulty: true,
  },
  'chapter-07': {
    problemCount: 40,
    gridColumns: 5,
    gridRows: 8,
    numberRange: { min: 50, max: 10000 },
    allowNegativeResults: false,
    mixedDifficulty: true,
  },
  // Default configuration for unknown chapters
  default: {
    problemCount: 40,
    gridColumns: 5,
    gridRows: 8,
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
      CHAPTER_CONFIGURATIONS[chapterId] || CHAPTER_CONFIGURATIONS['default']
    );
  }

  /**
   * Generate a set of addition problems
   */
  public generateAdditionProblems(config: DrillConfiguration): DrillProblem[] {
    const problems: DrillProblem[] = [];

    for (let i = 0; i < config.problemCount; i++) {
      const operand1 = this.generateRandomNumber(
        config.numberRange.min,
        config.numberRange.max
      );
      const operand2 = this.generateRandomNumber(
        config.numberRange.min,
        config.numberRange.max
      );
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
   * Generate a set of subtraction problems
   */
  public generateSubtractionProblems(
    config: DrillConfiguration
  ): DrillProblem[] {
    const problems: DrillProblem[] = [];

    for (let i = 0; i < config.problemCount; i++) {
      let operand1: number;
      let operand2: number;
      let answer: number;

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
    operation: 'addition' | 'subtraction',
    chapterTitle?: string
  ): DrillSet {
    const config = this.getChapterConfiguration(chapterId);
    const problems =
      operation === 'addition'
        ? this.generateAdditionProblems(config)
        : this.generateSubtractionProblems(config);

    const title = chapterTitle
      ? `${chapterTitle} - ${operation.charAt(0).toUpperCase() + operation.slice(1)} Drills`
      : `${operation.charAt(0).toUpperCase() + operation.slice(1)} Drills`;

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
    const operator = problem.operation === 'addition' ? '+' : '-';
    return `${problem.operand1} ${operator} ${problem.operand2} = ____`;
  }

  /**
   * Format a problem with answer for display
   */
  public formatProblemWithAnswer(problem: DrillProblem): string {
    const operator = problem.operation === 'addition' ? '+' : '-';
    return `${problem.operand1} ${operator} ${problem.operand2} = ${problem.answer}`;
  }

  /**
   * Generate a random number within the specified range (inclusive)
   */
  private generateRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Determine difficulty level based on operands and operation
   */
  private determineDifficulty(
    operand1: number,
    operand2: number,
    operation: 'addition' | 'subtraction'
  ): 'easy' | 'medium' | 'hard' {
    const maxOperand = Math.max(operand1, operand2);
    const sum = operand1 + operand2;

    if (operation === 'addition') {
      if (sum <= 20) return 'easy';
      if (sum <= 100) return 'medium';
      return 'hard';
    } else {
      // subtraction
      if (maxOperand <= 20) return 'easy';
      if (maxOperand <= 100) return 'medium';
      return 'hard';
    }
  }

  /**
   * Extract chapter number from chapter ID
   */
  private extractChapterNumber(chapterId: string): number {
    const match = chapterId.match(/chapter-(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
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
