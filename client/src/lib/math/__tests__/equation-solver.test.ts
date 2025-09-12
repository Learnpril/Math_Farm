import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EquationSolver, equationSolver } from '../equation-solver';
import { SolverType } from '../types';

// Mock the math loader and nerdamer loader
vi.mock('../math-loader', () => ({
  getMathInstance: vi.fn(() => ({
    evaluate: vi.fn((expr: string, scope?: any) => {
      if (scope && scope.x !== undefined) {
        // Simple substitution for testing
        const substituted = expr.replace(/x/g, scope.x.toString());
        return eval(substituted);
      }
      return eval(expr);
    }),
    parse: vi.fn((expr: string) => ({ toString: () => expr })),
    derivative: vi.fn((expr: any, variable: string) => ({
      toString: () => `d/dx[${expr}]`,
    })),
    simplify: vi.fn((expr: any) => ({ toString: () => `simplified(${expr})` })),
  })),
}));

vi.mock('../nerdamer-loader', () => ({
  getNerdamerInstance: vi.fn(() => ({
    solve: vi.fn((equation: string, variable: string) => [
      { toString: () => '2' },
      { toString: () => '-2' },
    ]),
    diff: vi.fn((expr: string, variable: string) => ({
      toString: () => `d/d${variable}[${expr}]`,
    })),
    simplify: vi.fn((expr: string) => ({
      toString: () => `simplified(${expr})`,
    })),
  })),
  loadNerdamer: vi.fn(() =>
    Promise.resolve({
      loaded: true,
      nerdamerInstance: {
        solve: vi.fn(() => [{ toString: () => '2' }, { toString: () => '-2' }]),
        diff: vi.fn(() => ({ toString: () => 'derivative' })),
        simplify: vi.fn(() => ({ toString: () => 'simplified' })),
      },
    })
  ),
}));

describe('EquationSolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('solve', () => {
    it('should solve basic equations', () => {
      const result = EquationSolver.solve('x^2 - 4', 'x', 'solve');
      expect(result.result).toContain('x = ');
      expect(result.steps).toBeDefined();
      expect(Array.isArray(result.steps)).toBe(true);
    });

    it('should handle different solver types', () => {
      const solveResult = EquationSolver.solve('x^2 - 4', 'x', 'solve');
      expect(solveResult.metadata?.solverType).toBe('solve');

      const derivativeResult = EquationSolver.solve('x^2', 'x', 'derivative');
      expect(derivativeResult.metadata?.solverType).toBe('derivative');

      const simplifyResult = EquationSolver.solve('(x+1)^2', 'x', 'simplify');
      expect(simplifyResult.metadata?.solverType).toBe('simplify');
    });

    it('should handle invalid equations', () => {
      const result = EquationSolver.solve('', 'x', 'solve');
      expect(result.error).toBeDefined();
    });

    it('should handle unknown solver types', () => {
      // @ts-ignore - Testing runtime behavior
      const result = EquationSolver.solve('x^2 - 4', 'x', 'unknown');
      expect(result.error).toContain('Unknown solver type');
    });

    it('should include metadata in results', () => {
      const result = EquationSolver.solve('x^2 - 4', 'x', 'solve');
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.variable).toBe('x');
      expect(result.metadata?.originalEquation).toBe('x^2 - 4');
      expect(result.metadata?.sanitizedEquation).toBeDefined();
    });
  });

  describe('solveQuadratic', () => {
    it('should solve quadratic equations with two real roots', () => {
      const result = EquationSolver.solveQuadratic('x^2 - 4', 'x');
      expect(result.result).toContain('x₁');
      expect(result.result).toContain('x₂');
      expect(result.steps.length).toBeGreaterThan(0);
    });

    it('should solve quadratic equations with one repeated root', () => {
      const result = EquationSolver.solveQuadratic('x^2 - 2*x + 1', 'x');
      expect(result.steps.length).toBeGreaterThan(0);
      // Should identify discriminant = 0 case
      expect(
        result.steps.some(step => step.explanation.includes('repeated root'))
      ).toBe(true);
    });

    it('should handle quadratic equations with no real roots', () => {
      const result = EquationSolver.solveQuadratic('x^2 + 1', 'x');
      expect(result.result).toContain('No real solutions');
      expect(
        result.steps.some(step => step.explanation.includes('discriminant < 0'))
      ).toBe(true);
    });

    it('should provide detailed steps for quadratic solving', () => {
      const result = EquationSolver.solveQuadratic('x^2 + 2*x - 3', 'x');
      expect(result.steps.length).toBeGreaterThanOrEqual(3);
      expect(result.steps[0].explanation).toContain('coefficients');
      expect(result.steps[1].explanation).toContain('discriminant');
    });

    it('should handle different variable names', () => {
      const result = EquationSolver.solveQuadratic('y^2 - 4', 'y');
      expect(result.result).toContain('y');
      expect(result.steps[0].explanation).toContain('y');
    });

    it('should handle malformed quadratic equations', () => {
      const result = EquationSolver.solveQuadratic('not a quadratic', 'x');
      expect(result.result).toContain('Error');
    });
  });

  describe('toLatex', () => {
    it('should convert basic expressions to LaTeX', () => {
      expect(EquationSolver.toLatex('x^2')).toBe('x^{2}');
      expect(EquationSolver.toLatex('sqrt(x)')).toBe('\\sqrt{x}');
      expect(EquationSolver.toLatex('sin(x)')).toBe('\\sin(x)');
    });

    it('should handle multiplication correctly', () => {
      expect(EquationSolver.toLatex('2*x')).toBe('2x');
      expect(EquationSolver.toLatex('x*y')).toBe('x \\cdot y');
      expect(EquationSolver.toLatex('(x+1)*(x-1)')).toBe('(x+1) \\cdot (x-1)');
    });

    it('should handle fractions', () => {
      expect(EquationSolver.toLatex('x/y')).toBe('\\frac{x}{y}');
      expect(EquationSolver.toLatex('(x+1)/(x-1)')).toBe('\\frac{x+1}{x-1}');
    });

    it('should handle mathematical constants', () => {
      expect(EquationSolver.toLatex('pi')).toBe('\\pi');
      expect(EquationSolver.toLatex('infinity')).toBe('\\infty');
    });

    it('should handle subscripts', () => {
      expect(EquationSolver.toLatex('x₁')).toBe('x_1');
      expect(EquationSolver.toLatex('x₂')).toBe('x_2');
    });

    it('should handle complex expressions', () => {
      const input = 'x^2 + 2*x + 1';
      const output = EquationSolver.toLatex(input);
      expect(output).toContain('^{2}');
      expect(output).toContain('2x');
    });
  });

  describe('getExamples', () => {
    it('should return array of example equations', () => {
      const examples = EquationSolver.getExamples();
      expect(Array.isArray(examples)).toBe(true);
      expect(examples.length).toBeGreaterThan(0);

      examples.forEach(example => {
        expect(example).toHaveProperty('type');
        expect(example).toHaveProperty('equation');
        expect(example).toHaveProperty('description');
      });
    });

    it('should include different solver types in examples', () => {
      const examples = EquationSolver.getExamples();
      const types = examples.map(ex => ex.type);
      expect(types).toContain('solve');
      expect(types).toContain('derivative');
      expect(types).toContain('simplify');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null and undefined inputs', () => {
      // @ts-ignore - Testing runtime behavior
      const nullResult = EquationSolver.solve(null, 'x', 'solve');
      expect(nullResult.error).toBeDefined();

      // @ts-ignore - Testing runtime behavior
      const undefinedResult = EquationSolver.solve(undefined, 'x', 'solve');
      expect(undefinedResult.error).toBeDefined();
    });

    it('should handle empty variable names', () => {
      const result = EquationSolver.solve('x^2 - 4', '', 'solve');
      expect(result).toBeDefined();
    });

    it('should handle complex equations', () => {
      const result = EquationSolver.solve('x^3 + 2*x^2 - x - 2', 'x', 'solve');
      expect(result).toBeDefined();
      expect(result.steps).toBeDefined();
    });

    it('should handle equations with multiple variables', () => {
      const result = EquationSolver.solve('x + y = 5', 'x', 'solve');
      expect(result).toBeDefined();
    });

    it('should handle trigonometric equations', () => {
      const result = EquationSolver.solve('sin(x) = 0.5', 'x', 'solve');
      expect(result).toBeDefined();
    });

    it('should handle logarithmic equations', () => {
      const result = EquationSolver.solve('log(x) = 2', 'x', 'solve');
      expect(result).toBeDefined();
    });
  });

  describe('numerical solving fallback', () => {
    it('should find integer roots for simple equations', () => {
      // Mock nerdamer to fail, forcing numerical fallback
      vi.mocked(
        require('../nerdamer-loader').getNerdamerInstance
      ).mockReturnValue(null);

      const result = EquationSolver.solve('x - 5', 'x', 'solve');
      expect(result.result).toContain('5');
    });

    it('should handle equations with no integer solutions', () => {
      vi.mocked(
        require('../nerdamer-loader').getNerdamerInstance
      ).mockReturnValue(null);

      const result = EquationSolver.solve('x^2 + 1', 'x', 'solve');
      expect(result.result).toContain('No simple integer roots');
    });
  });

  describe('derivative calculations', () => {
    it('should calculate basic derivatives', () => {
      const result = EquationSolver.solve('x^2', 'x', 'derivative');
      expect(result.metadata?.solverType).toBe('derivative');
      expect(result.steps.length).toBeGreaterThan(0);
    });

    it('should handle trigonometric derivatives', () => {
      const result = EquationSolver.solve('sin(x)', 'x', 'derivative');
      expect(result).toBeDefined();
    });

    it('should handle polynomial derivatives', () => {
      const result = EquationSolver.solve('x^3 + 2*x^2 + x', 'x', 'derivative');
      expect(result).toBeDefined();
    });
  });

  describe('expression simplification', () => {
    it('should simplify basic expressions', () => {
      const result = EquationSolver.solve('(x + 1)^2', 'x', 'simplify');
      expect(result.metadata?.solverType).toBe('simplify');
      expect(result.steps.length).toBeGreaterThan(0);
    });

    it('should handle algebraic expressions', () => {
      const result = EquationSolver.solve('x^2 + 2*x + 1', 'x', 'simplify');
      expect(result).toBeDefined();
    });
  });
});

describe('equationSolver convenience functions', () => {
  it('should provide solve function', () => {
    const result = equationSolver.solve('x^2 - 4', 'x', 'solve');
    expect(result.result).toBeDefined();
  });

  it('should provide solveQuadratic function', () => {
    const result = equationSolver.solveQuadratic('x^2 - 4', 'x');
    expect(result.result).toBeDefined();
  });

  it('should provide toLatex function', () => {
    const latex = equationSolver.toLatex('x^2');
    expect(latex).toBe('x^{2}');
  });

  it('should provide getExamples function', () => {
    const examples = equationSolver.getExamples();
    expect(Array.isArray(examples)).toBe(true);
  });

  it('should provide validateInput function', () => {
    const result = equationSolver.validateInput('x^2 - 4');
    expect(result.valid).toBe(true);
  });
});
