/**
 * Tests for curriculum data validation
 */

import { describe, it, expect } from 'vitest';
import {
  validateCurriculumMetadata,
  validateChapterData,
  validateUniqueQuestionIds,
  validateChapterPrerequisites,
} from '../curriculum-validator';
import type {
  CurriculumMetadata,
  ChapterData,
  PracticeQuestion,
} from '../../types/curriculum';

describe('Curriculum Validator', () => {
  describe('validateCurriculumMetadata', () => {
    it('should validate correct metadata', () => {
      const validMetadata: CurriculumMetadata = {
        topic: 'arithmetic',
        title: 'Arithmetic Fundamentals',
        difficulty: 'elementary',
        prerequisites: [],
        objectives: ['Master basic arithmetic'],
        estimatedHours: 25,
        chapters: 2,
        tools: ['calculator'],
        chapterFiles: ['chapter-01.json', 'chapter-02.json'],
      };

      const result = validateCurriculumMetadata(validMetadata);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject metadata with missing required fields', () => {
      const invalidMetadata = {
        topic: 'arithmetic',
        // missing title
        difficulty: 'elementary',
      };

      const result = validateCurriculumMetadata(invalidMetadata);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'title')).toBe(true);
    });

    it('should reject metadata with invalid difficulty', () => {
      const invalidMetadata = {
        topic: 'arithmetic',
        title: 'Test',
        difficulty: 'invalid-difficulty',
        prerequisites: [],
        objectives: [],
        estimatedHours: 10,
        chapters: 1,
        tools: [],
        chapterFiles: ['chapter-01.json'],
      };

      const result = validateCurriculumMetadata(invalidMetadata);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'difficulty')).toBe(true);
    });

    it('should reject metadata with mismatched chapter count', () => {
      const invalidMetadata = {
        topic: 'arithmetic',
        title: 'Test',
        difficulty: 'elementary',
        prerequisites: [],
        objectives: [],
        estimatedHours: 10,
        chapters: 3, // Says 3 chapters
        tools: [],
        chapterFiles: ['chapter-01.json', 'chapter-02.json'], // But only 2 files
      };

      const result = validateCurriculumMetadata(invalidMetadata);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'chapters')).toBe(true);
    });
  });

  describe('validateChapterData', () => {
    it('should validate correct chapter data', () => {
      const validChapter: ChapterData = {
        id: 'chapter-01',
        title: 'Test Chapter',
        duration: 2,
        objectives: ['Learn something'],
        prerequisites: [],
        introduction: {
          context: 'This is context',
          connection: 'This connects to previous learning',
        },
        theory: {
          concepts: [
            {
              title: 'Test Concept',
              content: 'This is the content',
            },
          ],
        },
        examples: [
          {
            problem: 'What is 2+2?',
            solution: '4',
            steps: ['Add 2 and 2'],
          },
        ],
        practice: [
          {
            id: 'p1-1',
            type: 'multiple-choice',
            problem: 'What is 1+1?',
            options: ['1', '2', '3'],
            correct: 1,
            hints: ['Think about addition'],
            explanation: 'Adding 1 and 1 gives 2',
            difficulty: 2,
          },
        ],
        tools: ['calculator'],
        assessment: {
          masteryThreshold: 0.8,
          requiredProblems: 3,
        },
      };

      const result = validateChapterData(validChapter);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject chapter with missing required fields', () => {
      const invalidChapter = {
        id: 'chapter-01',
        // missing title
        duration: 2,
      };

      const result = validateChapterData(invalidChapter);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'title')).toBe(true);
    });

    it('should reject chapter with invalid practice question', () => {
      const invalidChapter = {
        id: 'chapter-01',
        title: 'Test',
        duration: 2,
        objectives: [],
        prerequisites: [],
        introduction: { context: 'test', connection: 'test' },
        theory: { concepts: [] },
        examples: [],
        practice: [
          {
            id: 'p1-1',
            type: 'invalid-type', // Invalid type
            problem: 'Test?',
            correct: 'answer',
            hints: [],
            explanation: 'Test',
            difficulty: 2,
          },
        ],
        tools: [],
        assessment: { masteryThreshold: 0.8, requiredProblems: 1 },
      };

      const result = validateChapterData(invalidChapter);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field.includes('type'))).toBe(true);
    });
  });

  describe('validateUniqueQuestionIds', () => {
    it('should pass with unique IDs', () => {
      const questions: PracticeQuestion[] = [
        {
          id: 'p1-1',
          type: 'multiple-choice',
          problem: 'Test 1',
          options: ['A', 'B'],
          correct: 0,
          hints: [],
          explanation: 'Test',
          difficulty: 1,
        },
        {
          id: 'p1-2',
          type: 'fill-in',
          problem: 'Test 2',
          correct: 'answer',
          hints: [],
          explanation: 'Test',
          difficulty: 1,
        },
      ];

      const result = validateUniqueQuestionIds(questions);
      expect(result.isValid).toBe(true);
    });

    it('should fail with duplicate IDs', () => {
      const questions: PracticeQuestion[] = [
        {
          id: 'p1-1',
          type: 'multiple-choice',
          problem: 'Test 1',
          options: ['A', 'B'],
          correct: 0,
          hints: [],
          explanation: 'Test',
          difficulty: 1,
        },
        {
          id: 'p1-1', // Duplicate ID
          type: 'fill-in',
          problem: 'Test 2',
          correct: 'answer',
          hints: [],
          explanation: 'Test',
          difficulty: 1,
        },
      ];

      const result = validateUniqueQuestionIds(questions);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message.includes('Duplicate'))).toBe(
        true
      );
    });
  });

  describe('validateChapterPrerequisites', () => {
    it('should pass with valid prerequisites', () => {
      const chapter: ChapterData = {
        id: 'chapter-02',
        title: 'Chapter 2',
        duration: 2,
        objectives: [],
        prerequisites: ['chapter-01'], // Valid prerequisite
        introduction: { context: 'test', connection: 'test' },
        theory: { concepts: [] },
        examples: [],
        practice: [],
        tools: [],
        assessment: { masteryThreshold: 0.8, requiredProblems: 1 },
      };

      const availableChapters = ['chapter-01', 'chapter-02'];
      const result = validateChapterPrerequisites(chapter, availableChapters);
      expect(result.isValid).toBe(true);
    });

    it('should fail with invalid prerequisites', () => {
      const chapter: ChapterData = {
        id: 'chapter-02',
        title: 'Chapter 2',
        duration: 2,
        objectives: [],
        prerequisites: ['chapter-99'], // Invalid prerequisite
        introduction: { context: 'test', connection: 'test' },
        theory: { concepts: [] },
        examples: [],
        practice: [],
        tools: [],
        assessment: { masteryThreshold: 0.8, requiredProblems: 1 },
      };

      const availableChapters = ['chapter-01', 'chapter-02'];
      const result = validateChapterPrerequisites(chapter, availableChapters);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message.includes('not found'))).toBe(
        true
      );
    });
  });
});
