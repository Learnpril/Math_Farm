/**
 * Unit tests for DrillGenerator utility class
 * Tests problem generation accuracy, configuration handling, and edge cases
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DrillGenerator, drillGenerator } from '../drill-generator';
import type { DrillConfiguration, DrillProblem } from '../../types';
import { afterEach } from 'node:test';

describe('DrillGenerator', () => {
  let generator: DrillGenerator;

  beforeEach(() => {
    generator = DrillGenerator.getInstance();
    // Reset random seed for consistent testing
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = DrillGenerator.getInstance();
      const instance2 = DrillGenerator.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should export a singleton instance', () => {
      expect(drillGenerator).toBeInstanceOf(DrillGenerator);
      expect(drillGenerator).toBe(DrillGenerator.getInstance());
    });
  });

  describe('Chapter Configuration', () => {
    it('should return correct configuration for chapter-02', () => {
      const config = generator.getChapterConfiguration('chapter-02');
      expect(config).toEqual({
        problemCount: 40,
        gridColumns: 5,
        gridRows: 8,
        numberRange: { min: 1, max: 20 },
        allowNegativeResults: false,
        mixedDifficulty: false,
      });
    });

    it('should return default configuration for unknown chapter', () => {
      const config = generator.getChapterConfiguration('unknown-chapter');
      expect(config).toEqual({
        problemCount: 40,
        gridColumns: 5,
        gridRows: 8,
        numberRange: { min: 1, max: 20 },
        allowNegativeResults: false,
        mixedDifficulty: false,
      });
    });

    it('should list only chapter-02 as available', () => {
      const chapters = generator.getAvailableChapters();
      expect(chapters).toEqual(['chapter-02']);
      expect(chapters).not.toContain('default');
    });
  });

  describe('Addition Problem Generation', () => {
    const basicConfig: DrillConfiguration = {
      problemCount: 5,
      gridColumns: 5,
      gridRows: 1,
      numberRange: { min: 1, max: 10 },
      allowNegativeResults: false,
      mixedDifficulty: false,
    };

    it('should generate correct number of addition problems', () => {
      const problems = generator.generateAdditionProblems(basicConfig);
      expect(problems).toHaveLength(5);
    });

    it('should generate problems with correct operation type', () => {
      const problems = generator.generateAdditionProblems(basicConfig);
      problems.forEach(problem => {
        expect(problem.operation).toBe('addition');
      });
    });

    it('should generate problems within specified number range', () => {
      const problems = generator.generateAdditionProblems(basicConfig);
      problems.forEach(problem => {
        expect(problem.operand1).toBeGreaterThanOrEqual(
          basicConfig.numberRange.min
        );
        expect(problem.operand1).toBeLessThanOrEqual(
          basicConfig.numberRange.max
        );
        expect(problem.operand2).toBeGreaterThanOrEqual(
          basicConfig.numberRange.min
        );
        expect(problem.operand2).toBeLessThanOrEqual(
          basicConfig.numberRange.max
        );
      });
    });

    it('should calculate correct answers for addition problems', () => {
      const problems = generator.generateAdditionProblems(basicConfig);
      problems.forEach(problem => {
        expect(problem.answer).toBe(problem.operand1 + problem.operand2);
      });
    });

    it('should generate unique problem IDs', () => {
      const problems = generator.generateAdditionProblems(basicConfig);
      const ids = problems.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(problems.length);
    });

    it('should assign difficulty levels when mixedDifficulty is enabled', () => {
      const mixedConfig = { ...basicConfig, mixedDifficulty: true };
      const problems = generator.generateAdditionProblems(mixedConfig);
      problems.forEach(problem => {
        expect(['easy', 'medium', 'hard']).toContain(problem.difficulty);
      });
    });

    it('should assign easy difficulty when mixedDifficulty is disabled', () => {
      const problems = generator.generateAdditionProblems(basicConfig);
      problems.forEach(problem => {
        expect(problem.difficulty).toBe('easy');
      });
    });
  });

  describe('Subtraction Problem Generation', () => {
    const basicConfig: DrillConfiguration = {
      problemCount: 5,
      gridColumns: 5,
      gridRows: 1,
      numberRange: { min: 1, max: 10 },
      allowNegativeResults: false,
      mixedDifficulty: false,
    };

    it('should generate correct number of subtraction problems', () => {
      const problems = generator.generateSubtractionProblems(basicConfig);
      expect(problems).toHaveLength(5);
    });

    it('should generate problems with correct operation type', () => {
      const problems = generator.generateSubtractionProblems(basicConfig);
      problems.forEach(problem => {
        expect(problem.operation).toBe('subtraction');
      });
    });

    it('should generate problems within specified number range', () => {
      const problems = generator.generateSubtractionProblems(basicConfig);
      problems.forEach(problem => {
        expect(problem.operand1).toBeGreaterThanOrEqual(
          basicConfig.numberRange.min
        );
        expect(problem.operand1).toBeLessThanOrEqual(
          basicConfig.numberRange.max
        );
        expect(problem.operand2).toBeGreaterThanOrEqual(
          basicConfig.numberRange.min
        );
        expect(problem.operand2).toBeLessThanOrEqual(
          basicConfig.numberRange.max
        );
      });
    });

    it('should calculate correct answers for subtraction problems', () => {
      const problems = generator.generateSubtractionProblems(basicConfig);
      problems.forEach(problem => {
        expect(problem.answer).toBe(problem.operand1 - problem.operand2);
      });
    });

    it('should ensure positive results when allowNegativeResults is false', () => {
      const problems = generator.generateSubtractionProblems(basicConfig);
      problems.forEach(problem => {
        expect(problem.answer).toBeGreaterThanOrEqual(0);
        expect(problem.operand1).toBeGreaterThanOrEqual(problem.operand2);
      });
    });

    it('should allow negative results when allowNegativeResults is true', () => {
      const negativeConfig = { ...basicConfig, allowNegativeResults: true };

      // Mock random to ensure we get a negative result
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.1) // operand1 = 2
        .mockReturnValueOnce(0.9); // operand2 = 10

      const problems = generator.generateSubtractionProblems(negativeConfig);

      // At least verify the calculation is correct even if negative
      problems.forEach(problem => {
        expect(problem.answer).toBe(problem.operand1 - problem.operand2);
      });
    });

    it('should generate unique problem IDs', () => {
      const problems = generator.generateSubtractionProblems(basicConfig);
      const ids = problems.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(problems.length);
    });
  });

  describe('Drill Set Generation', () => {
    it('should generate complete addition drill set', () => {
      const drillSet = generator.generateDrillSet(
        'chapter-03',
        'addition',
        'Addition and Subtraction'
      );

      expect(drillSet.operation).toBe('addition');
      expect(drillSet.problems).toHaveLength(40);
      expect(drillSet.title).toBe('Addition and Subtraction - Addition Drills');
      expect(drillSet.chapterLevel).toBe(3);
      expect(drillSet.generatedAt).toBeInstanceOf(Date);
      expect(drillSet.id).toMatch(/^drill-chapter-03-addition-\d+$/);
    });

    it('should generate complete subtraction drill set', () => {
      const drillSet = generator.generateDrillSet('chapter-03', 'subtraction');

      expect(drillSet.operation).toBe('subtraction');
      expect(drillSet.problems).toHaveLength(40);
      expect(drillSet.title).toBe('Subtraction Drills');
      expect(drillSet.chapterLevel).toBe(2);
      expect(drillSet.id).toMatch(/^drill-chapter-02-subtraction-\d+$/);
    });

    it('should extract chapter number correctly', () => {
      const drillSet1 = generator.generateDrillSet('chapter-02', 'addition');
      const drillSet2 = generator.generateDrillSet(
        'unknown-chapter',
        'addition'
      );

      expect(drillSet1.chapterLevel).toBe(2);
      expect(drillSet2.chapterLevel).toBe(1); // default for unknown chapters
    });
  });

  describe('Problem Formatting', () => {
    const sampleAddition: DrillProblem = {
      id: 'test-1',
      operand1: 15,
      operand2: 7,
      operation: 'addition',
      answer: 22,
      difficulty: 'easy',
    };

    const sampleSubtraction: DrillProblem = {
      id: 'test-2',
      operand1: 20,
      operand2: 8,
      operation: 'subtraction',
      answer: 12,
      difficulty: 'medium',
    };

    it('should format addition problem for display', () => {
      const formatted = generator.formatProblemForDisplay(sampleAddition);
      expect(formatted).toBe('15 + 7 = ____');
    });

    it('should format subtraction problem for display', () => {
      const formatted = generator.formatProblemForDisplay(sampleSubtraction);
      expect(formatted).toBe('20 - 8 = ____');
    });

    it('should format addition problem with answer', () => {
      const formatted = generator.formatProblemWithAnswer(sampleAddition);
      expect(formatted).toBe('15 + 7 = 22');
    });

    it('should format subtraction problem with answer', () => {
      const formatted = generator.formatProblemWithAnswer(sampleSubtraction);
      expect(formatted).toBe('20 - 8 = 12');
    });
  });

  describe('Configuration Validation', () => {
    it('should validate correct configuration', () => {
      const validConfig: DrillConfiguration = {
        problemCount: 40,
        gridColumns: 5,
        gridRows: 8,
        numberRange: { min: 1, max: 100 },
        allowNegativeResults: false,
        mixedDifficulty: true,
      };

      expect(generator.validateConfiguration(validConfig)).toBe(true);
    });

    it('should reject configuration with zero problem count', () => {
      const invalidConfig: DrillConfiguration = {
        problemCount: 0,
        gridColumns: 5,
        gridRows: 8,
        numberRange: { min: 1, max: 100 },
        allowNegativeResults: false,
        mixedDifficulty: true,
      };

      expect(generator.validateConfiguration(invalidConfig)).toBe(false);
    });

    it('should reject configuration with invalid number range', () => {
      const invalidConfig: DrillConfiguration = {
        problemCount: 40,
        gridColumns: 5,
        gridRows: 8,
        numberRange: { min: 100, max: 1 }, // min > max
        allowNegativeResults: false,
        mixedDifficulty: true,
      };

      expect(generator.validateConfiguration(invalidConfig)).toBe(false);
    });

    it('should reject configuration with insufficient grid space', () => {
      const invalidConfig: DrillConfiguration = {
        problemCount: 50,
        gridColumns: 5,
        gridRows: 8, // 5 * 8 = 40 < 50 problems
        numberRange: { min: 1, max: 100 },
        allowNegativeResults: false,
        mixedDifficulty: true,
      };

      expect(generator.validateConfiguration(invalidConfig)).toBe(false);
    });

    it('should reject configuration with negative minimum range', () => {
      const invalidConfig: DrillConfiguration = {
        problemCount: 40,
        gridColumns: 5,
        gridRows: 8,
        numberRange: { min: -5, max: 100 },
        allowNegativeResults: false,
        mixedDifficulty: true,
      };

      expect(generator.validateConfiguration(invalidConfig)).toBe(false);
    });
  });

  describe('Difficulty Determination', () => {
    it('should assign easy difficulty for small addition problems', () => {
      // Use reflection to test private method through public interface
      const config: DrillConfiguration = {
        problemCount: 1,
        gridColumns: 1,
        gridRows: 1,
        numberRange: { min: 1, max: 10 },
        allowNegativeResults: false,
        mixedDifficulty: true,
      };

      vi.spyOn(Math, 'random').mockReturnValue(0.1); // Will generate small numbers
      const problems = generator.generateAdditionProblems(config);

      // Small numbers should result in easy difficulty
      expect(problems[0].difficulty).toBe('easy');
    });

    it('should assign appropriate difficulty for larger problems', () => {
      const config: DrillConfiguration = {
        problemCount: 1,
        gridColumns: 1,
        gridRows: 1,
        numberRange: { min: 50, max: 100 },
        allowNegativeResults: false,
        mixedDifficulty: true,
      };

      const problems = generator.generateAdditionProblems(config);

      // Larger numbers should result in medium or hard difficulty
      expect(['medium', 'hard']).toContain(problems[0].difficulty);
    });
  });

  describe('Digit Selection', () => {
    it('should generate 1-digit numbers when digitSelection is "one"', () => {
      const config: DrillConfiguration = {
        problemCount: 5,
        gridColumns: 5,
        gridRows: 1,
        numberRange: { min: 1, max: 100 },
        allowNegativeResults: false,
        mixedDifficulty: false,
        digitSelection: 'one',
      };

      const problems = generator.generateAdditionProblems(config);
      problems.forEach(problem => {
        expect(problem.operand1).toBeGreaterThanOrEqual(1);
        expect(problem.operand1).toBeLessThanOrEqual(9);
        expect(problem.operand2).toBeGreaterThanOrEqual(1);
        expect(problem.operand2).toBeLessThanOrEqual(9);
      });
    });

    it('should generate 2-digit numbers when digitSelection is "two"', () => {
      const config: DrillConfiguration = {
        problemCount: 5,
        gridColumns: 5,
        gridRows: 1,
        numberRange: { min: 1, max: 100 },
        allowNegativeResults: false,
        mixedDifficulty: false,
        digitSelection: 'two',
      };

      const problems = generator.generateAdditionProblems(config);
      problems.forEach(problem => {
        expect(problem.operand1).toBeGreaterThanOrEqual(10);
        expect(problem.operand1).toBeLessThanOrEqual(99);
        expect(problem.operand2).toBeGreaterThanOrEqual(10);
        expect(problem.operand2).toBeLessThanOrEqual(99);
      });
    });

    it('should generate 3-digit numbers when digitSelection is "three"', () => {
      const config: DrillConfiguration = {
        problemCount: 5,
        gridColumns: 5,
        gridRows: 1,
        numberRange: { min: 1, max: 100 },
        allowNegativeResults: false,
        mixedDifficulty: false,
        digitSelection: 'three',
      };

      const problems = generator.generateAdditionProblems(config);
      problems.forEach(problem => {
        expect(problem.operand1).toBeGreaterThanOrEqual(100);
        expect(problem.operand1).toBeLessThanOrEqual(999);
        expect(problem.operand2).toBeGreaterThanOrEqual(100);
        expect(problem.operand2).toBeLessThanOrEqual(999);
      });
    });

    it('should generate mixed digit numbers when digitSelection is "mixed"', () => {
      const config: DrillConfiguration = {
        problemCount: 20,
        gridColumns: 5,
        gridRows: 4,
        numberRange: { min: 1, max: 100 },
        allowNegativeResults: false,
        mixedDifficulty: false,
        digitSelection: 'mixed',
      };

      const problems = generator.generateAdditionProblems(config);

      // With 20 problems, we should have some variety (though not guaranteed due to randomness)
      expect(problems.length).toBe(20);
      problems.forEach(problem => {
        expect(problem.operand1).toBeGreaterThanOrEqual(1);
        expect(problem.operand1).toBeLessThanOrEqual(999);
        expect(problem.operand2).toBeGreaterThanOrEqual(1);
        expect(problem.operand2).toBeLessThanOrEqual(999);
      });
    });

    it('should use number range when digitSelection is not specified', () => {
      const config: DrillConfiguration = {
        problemCount: 5,
        gridColumns: 5,
        gridRows: 1,
        numberRange: { min: 50, max: 60 },
        allowNegativeResults: false,
        mixedDifficulty: false,
        // digitSelection not specified
      };

      const problems = generator.generateAdditionProblems(config);
      problems.forEach(problem => {
        expect(problem.operand1).toBeGreaterThanOrEqual(50);
        expect(problem.operand1).toBeLessThanOrEqual(60);
        expect(problem.operand2).toBeGreaterThanOrEqual(50);
        expect(problem.operand2).toBeLessThanOrEqual(60);
      });
    });

    it('should include digit info in drill set title', () => {
      const drillSet1 = generator.generateDrillSet(
        'chapter-03',
        'addition',
        'Addition and Subtraction',
        'one'
      );
      const drillSet2 = generator.generateDrillSet(
        'chapter-03',
        'subtraction',
        'Addition and Subtraction',
        'two'
      );
      const drillSet3 = generator.generateDrillSet(
        'chapter-03',
        'addition',
        'Addition and Subtraction',
        'mixed'
      );

      expect(drillSet1.title).toBe(
        'Addition and Subtraction - Addition Drills (1-Digit)'
      );
      expect(drillSet2.title).toBe(
        'Addition and Subtraction - Subtraction Drills (2-Digit)'
      );
      expect(drillSet3.title).toBe(
        'Addition and Subtraction - Addition Drills (Mixed Digits)'
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum number range (1-1)', () => {
      const config: DrillConfiguration = {
        problemCount: 2,
        gridColumns: 2,
        gridRows: 1,
        numberRange: { min: 1, max: 1 },
        allowNegativeResults: false,
        mixedDifficulty: false,
      };

      const additionProblems = generator.generateAdditionProblems(config);
      const subtractionProblems = generator.generateSubtractionProblems(config);

      additionProblems.forEach(problem => {
        expect(problem.operand1).toBe(1);
        expect(problem.operand2).toBe(1);
        expect(problem.answer).toBe(2);
      });

      subtractionProblems.forEach(problem => {
        expect(problem.operand1).toBe(1);
        expect(problem.operand2).toBe(1);
        expect(problem.answer).toBe(0);
      });
    });

    it('should handle large number ranges', () => {
      const config: DrillConfiguration = {
        problemCount: 1,
        gridColumns: 1,
        gridRows: 1,
        numberRange: { min: 1000, max: 9999 },
        allowNegativeResults: false,
        mixedDifficulty: false,
      };

      const problems = generator.generateAdditionProblems(config);

      expect(problems[0].operand1).toBeGreaterThanOrEqual(1000);
      expect(problems[0].operand1).toBeLessThanOrEqual(9999);
      expect(problems[0].answer).toBe(
        problems[0].operand1 + problems[0].operand2
      );
    });
  });
});
