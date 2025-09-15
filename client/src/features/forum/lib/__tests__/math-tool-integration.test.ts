import { describe, it, expect } from 'vitest';
import {
  convertToolResultToPostContent,
  createMathToolDeepLink,
  generateThreadTitle,
  suggestForumCategory,
  createForumPostWithMathTool,
} from '../math-tool-integration';
import { ToolResult } from '../../../../lib/toolUtils';

describe('Math Tool Integration', () => {
  const mockCalculatorResult: ToolResult = {
    toolId: 'calculator',
    toolName: 'Advanced Calculator',
    input: {
      expression: '2 + 3 * 4',
      angleMode: 'deg',
    },
    output: {
      result: '14',
    },
    timestamp: new Date('2024-01-01T12:00:00Z'),
  };

  const mockSolverResult: ToolResult = {
    toolId: 'solver',
    toolName: 'Equation Solver',
    input: {
      equation: 'x^2 - 4',
      variable: 'x',
      solverType: 'solve',
    },
    output: {
      result: 'x = ±2',
      latex: 'x = \\pm 2',
    },
    timestamp: new Date('2024-01-01T12:00:00Z'),
    steps: [
      {
        step: '1',
        explanation: 'Factor the expression',
        result: '(x - 2)(x + 2) = 0',
        latex: '(x - 2)(x + 2) = 0',
      },
      {
        step: '2',
        explanation: 'Solve for x',
        result: 'x = 2 or x = -2',
        latex: 'x = 2 \\text{ or } x = -2',
      },
    ],
  };

  describe('convertToolResultToPostContent', () => {
    it('should convert calculator result to post content', () => {
      const shareData = {
        toolResult: mockCalculatorResult,
        shareType: 'result' as const,
        includeSteps: false,
      };

      const result = convertToolResultToPostContent(shareData);

      expect(result.text).toContain('Advanced Calculator Result');
      expect(result.text).toContain('2 + 3 * 4');
      expect(result.text).toContain('14');
      expect(result.text).toContain('DEG');
      expect(result.mathExpressions).toHaveLength(0); // No LaTeX in this case
    });

    it('should convert solver result with steps to post content', () => {
      const shareData = {
        toolResult: mockSolverResult,
        shareType: 'solution' as const,
        includeSteps: true,
      };

      const result = convertToolResultToPostContent(shareData);

      expect(result.text).toContain('Equation Solver Result');
      expect(result.text).toContain('x^2 - 4');
      expect(result.text).toContain('Step-by-step Solution');
      expect(result.text).toContain('Factor the expression');
      expect(result.mathExpressions.length).toBeGreaterThan(0);
    });

    it('should include custom message when provided', () => {
      const shareData = {
        toolResult: mockCalculatorResult,
        shareType: 'result' as const,
        customMessage: 'This is a test calculation',
      };

      const result = convertToolResultToPostContent(shareData);

      expect(result.text).toContain('This is a test calculation');
    });
  });

  describe('createMathToolDeepLink', () => {
    it('should create calculator deep link', () => {
      const link = createMathToolDeepLink(mockCalculatorResult);

      expect(link).toContain('/tools/calculator');
      expect(link).toContain('expr=2%20%2B%203%20*%204');
      expect(link).toContain('mode=deg');
    });

    it('should create solver deep link', () => {
      const link = createMathToolDeepLink(mockSolverResult);

      expect(link).toContain('/tools/solver');
      expect(link).toContain('eq=x%5E2%20-%204');
      expect(link).toContain('var=x');
      expect(link).toContain('type=solve');
    });
  });

  describe('generateThreadTitle', () => {
    it('should generate appropriate titles for different share types', () => {
      expect(generateThreadTitle(mockCalculatorResult, 'result')).toBe(
        'Advanced Calculator Result'
      );
      expect(generateThreadTitle(mockCalculatorResult, 'problem')).toBe(
        'Help with Advanced Calculator Problem'
      );
      expect(generateThreadTitle(mockSolverResult, 'solution')).toBe(
        'Equation Solver Solution'
      );
    });
  });

  describe('suggestForumCategory', () => {
    it('should suggest category based on tool type', () => {
      expect(suggestForumCategory(mockCalculatorResult)).toBe(1);
      expect(suggestForumCategory(mockSolverResult)).toBe(2);
    });

    it('should suggest category based on content', () => {
      const trigResult: ToolResult = {
        ...mockCalculatorResult,
        input: { expression: 'sin(30)' },
      };

      expect(suggestForumCategory(trigResult)).toBe(4); // Trigonometry category
    });
  });

  describe('createForumPostWithMathTool', () => {
    it('should create complete forum post data', () => {
      const shareData = {
        toolResult: mockCalculatorResult,
        shareType: 'result' as const,
      };

      const result = createForumPostWithMathTool(shareData);

      expect(result.content.text).toContain('Advanced Calculator Result');
      expect(result.title).toBe('Advanced Calculator Result');
      expect(result.categoryId).toBe(1);
      expect(result.deepLink).toContain('/tools/calculator');
    });

    it('should use provided options', () => {
      const shareData = {
        toolResult: mockCalculatorResult,
        shareType: 'result' as const,
      };

      const options = {
        title: 'Custom Title',
        categoryId: 5,
        includeDeepLink: false,
      };

      const result = createForumPostWithMathTool(shareData, options);

      expect(result.title).toBe('Custom Title');
      expect(result.categoryId).toBe(5);
      expect(result.deepLink).toBeUndefined();
    });
  });
});
