import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FunctionGrapher, functionGrapher } from '../function-grapher';
import { FunctionData, GraphBounds } from '../types';

// Mock the math loader
vi.mock('../math-loader', () => ({
  getMathInstance: vi.fn(() => ({
    evaluate: vi.fn((expr: string, scope?: any) => {
      if (scope && scope.x !== undefined) {
        const x = scope.x;
        // Simple mock implementations for common functions
        if (expr === 'x^2') return x * x;
        if (expr === 'sin(x)') return Math.sin(x);
        if (expr === 'cos(x)') return Math.cos(x);
        if (expr === 'sqrt(x)') return x >= 0 ? Math.sqrt(x) : NaN;
        if (expr === '1/x') return x !== 0 ? 1 / x : Infinity;
        if (expr === 'log(x)') return x > 0 ? Math.log(x) : NaN;
        // Fallback to simple evaluation
        try {
          return eval(expr.replace(/x/g, x.toString()));
        } catch {
          return NaN;
        }
      }
      return NaN;
    }),
  })),
}));

// Mock canvas context
const mockContext = {
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  fillText: vi.fn(),
  strokeStyle: '',
  lineWidth: 0,
  fillStyle: '',
  font: '',
  textAlign: '',
};

const mockCanvas = {
  getContext: vi.fn(() => mockContext),
  width: 800,
  height: 600,
};

// Mock document for theme detection
Object.defineProperty(document, 'documentElement', {
  value: {
    classList: {
      contains: vi.fn(() => false), // Default to light mode
    },
  },
  writable: true,
});

describe('FunctionGrapher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('evaluateFunction', () => {
    it('should evaluate basic functions at given x values', () => {
      expect(FunctionGrapher.evaluateFunction('x^2', 2)).toBe(4);
      expect(FunctionGrapher.evaluateFunction('x^2', -2)).toBe(4);
      expect(FunctionGrapher.evaluateFunction('x^2', 0)).toBe(0);
    });

    it('should handle trigonometric functions', () => {
      expect(FunctionGrapher.evaluateFunction('sin(x)', 0)).toBe(0);
      expect(FunctionGrapher.evaluateFunction('cos(x)', 0)).toBe(1);
    });

    it('should handle square root functions', () => {
      expect(FunctionGrapher.evaluateFunction('sqrt(x)', 4)).toBe(2);
      expect(FunctionGrapher.evaluateFunction('sqrt(x)', 0)).toBe(0);
      expect(FunctionGrapher.evaluateFunction('sqrt(x)', -1)).toBe(null);
    });

    it('should handle division by zero', () => {
      expect(FunctionGrapher.evaluateFunction('1/x', 0)).toBe(null);
      expect(FunctionGrapher.evaluateFunction('1/x', 1)).toBe(1);
      expect(FunctionGrapher.evaluateFunction('1/x', -1)).toBe(-1);
    });

    it('should handle logarithmic functions', () => {
      expect(FunctionGrapher.evaluateFunction('log(x)', 1)).toBe(0);
      expect(FunctionGrapher.evaluateFunction('log(x)', 0)).toBe(null);
      expect(FunctionGrapher.evaluateFunction('log(x)', -1)).toBe(null);
    });

    it('should return null for invalid expressions', () => {
      expect(FunctionGrapher.evaluateFunction('', 1)).toBe(null);
      expect(FunctionGrapher.evaluateFunction('invalid', 1)).toBe(null);
    });

    it('should handle infinite results', () => {
      expect(FunctionGrapher.evaluateFunction('1/x', 0)).toBe(null);
    });
  });

  describe('generateFunctionPoints', () => {
    const bounds: GraphBounds = { xMin: -2, xMax: 2, yMin: -4, yMax: 4 };

    it('should generate points for valid functions', () => {
      const points = FunctionGrapher.generateFunctionPoints('x^2', bounds, 10);
      expect(Array.isArray(points)).toBe(true);
      expect(points.length).toBeGreaterThan(0);

      points.forEach(point => {
        expect(point).toHaveProperty('x');
        expect(point).toHaveProperty('y');
        expect(typeof point.x).toBe('number');
        expect(typeof point.y).toBe('number');
      });
    });

    it('should respect the specified resolution', () => {
      const lowRes = FunctionGrapher.generateFunctionPoints('x^2', bounds, 5);
      const highRes = FunctionGrapher.generateFunctionPoints('x^2', bounds, 20);

      expect(highRes.length).toBeGreaterThan(lowRes.length);
    });

    it('should handle functions with discontinuities', () => {
      const points = FunctionGrapher.generateFunctionPoints('1/x', bounds, 100);
      expect(Array.isArray(points)).toBe(true);
      // Should skip points where function is undefined
      points.forEach(point => {
        expect(isFinite(point.y)).toBe(true);
      });
    });

    it('should handle functions that return NaN', () => {
      const points = FunctionGrapher.generateFunctionPoints(
        'sqrt(x)',
        { xMin: -2, xMax: 2, yMin: -2, yMax: 2 },
        10
      );

      // Should only include points where sqrt is defined (x >= 0)
      points.forEach(point => {
        expect(point.x).toBeGreaterThanOrEqual(0);
        expect(isFinite(point.y)).toBe(true);
      });
    });
  });

  describe('drawGraph', () => {
    const bounds: GraphBounds = { xMin: -10, xMax: 10, yMin: -10, yMax: 10 };
    const functions: FunctionData[] = [
      { id: '1', expression: 'x^2', color: '#ff0000', visible: true },
      { id: '2', expression: 'sin(x)', color: '#00ff00', visible: false },
    ];

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should clear canvas before drawing', () => {
      FunctionGrapher.drawGraph(mockCanvas as any, functions, bounds);
      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
    });

    it('should draw grid lines', () => {
      FunctionGrapher.drawGraph(mockCanvas as any, functions, bounds);
      expect(mockContext.beginPath).toHaveBeenCalled();
      expect(mockContext.moveTo).toHaveBeenCalled();
      expect(mockContext.lineTo).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
    });

    it('should draw axes', () => {
      FunctionGrapher.drawGraph(mockCanvas as any, functions, bounds);
      // Should draw both x and y axes
      expect(mockContext.stroke).toHaveBeenCalled();
    });

    it('should only draw visible functions', () => {
      FunctionGrapher.drawGraph(mockCanvas as any, functions, bounds);
      // Should set stroke style for visible function
      expect(mockContext.strokeStyle).toBe('#ff0000');
    });

    it('should draw axis labels', () => {
      FunctionGrapher.drawGraph(mockCanvas as any, functions, bounds);
      expect(mockContext.fillText).toHaveBeenCalled();
    });

    it('should handle empty function list', () => {
      expect(() => {
        FunctionGrapher.drawGraph(mockCanvas as any, [], bounds);
      }).not.toThrow();
    });

    it('should handle null canvas context', () => {
      const nullCanvas = { ...mockCanvas, getContext: () => null };
      expect(() => {
        FunctionGrapher.drawGraph(nullCanvas as any, functions, bounds);
      }).not.toThrow();
    });
  });

  describe('createFunction', () => {
    it('should create function with default values', () => {
      const func = FunctionGrapher.createFunction('x^2');
      expect(func.expression).toBe('x^2');
      expect(func.visible).toBe(true);
      expect(func.color).toBeDefined();
      expect(func.id).toBeDefined();
    });

    it('should create function with custom values', () => {
      const func = FunctionGrapher.createFunction('sin(x)', '#ff0000', false);
      expect(func.expression).toBe('sin(x)');
      expect(func.color).toBe('#ff0000');
      expect(func.visible).toBe(false);
    });

    it('should generate unique IDs', () => {
      const func1 = FunctionGrapher.createFunction('x^2');
      const func2 = FunctionGrapher.createFunction('x^3');
      expect(func1.id).not.toBe(func2.id);
    });
  });

  describe('generateRandomColor', () => {
    it('should generate valid HSL color strings', () => {
      const color = FunctionGrapher.generateRandomColor();
      expect(color).toMatch(/^hsl\(\d+, 70%, 50%\)$/);
    });

    it('should generate different colors', () => {
      const colors = Array.from({ length: 10 }, () =>
        FunctionGrapher.generateRandomColor()
      );
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBeGreaterThan(1);
    });
  });

  describe('validateFunction', () => {
    it('should validate correct function expressions', () => {
      const result = FunctionGrapher.validateFunction('x^2');
      expect(result.valid).toBe(true);
    });

    it('should reject empty expressions', () => {
      const result = FunctionGrapher.validateFunction('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should reject expressions without x variable', () => {
      const result = FunctionGrapher.validateFunction('2 + 3');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('variable "x"');
    });

    it('should handle whitespace', () => {
      const result = FunctionGrapher.validateFunction('  ');
      expect(result.valid).toBe(false);
    });
  });

  describe('getPresetFunctions', () => {
    it('should return array of preset function expressions', () => {
      const presets = FunctionGrapher.getPresetFunctions();
      expect(Array.isArray(presets)).toBe(true);
      expect(presets.length).toBeGreaterThan(0);

      presets.forEach(preset => {
        expect(typeof preset).toBe('string');
        expect(preset).toContain('x');
      });
    });

    it('should include common mathematical functions', () => {
      const presets = FunctionGrapher.getPresetFunctions();
      expect(presets).toContain('x^2');
      expect(presets).toContain('sin(x)');
      expect(presets).toContain('cos(x)');
      expect(presets).toContain('sqrt(x)');
    });
  });

  describe('calculateOptimalBounds', () => {
    it('should return default bounds for empty function list', () => {
      const bounds = FunctionGrapher.calculateOptimalBounds([]);
      expect(bounds.xMin).toBe(-10);
      expect(bounds.xMax).toBe(10);
      expect(bounds.yMin).toBe(-10);
      expect(bounds.yMax).toBe(10);
    });

    it('should calculate bounds based on function values', () => {
      const functions: FunctionData[] = [
        { id: '1', expression: 'x^2', color: '#ff0000', visible: true },
      ];

      const bounds = FunctionGrapher.calculateOptimalBounds(functions, 10);
      expect(bounds.yMin).toBeLessThan(bounds.yMax);
    });

    it('should ignore invisible functions', () => {
      const functions: FunctionData[] = [
        { id: '1', expression: 'x^2', color: '#ff0000', visible: false },
      ];

      const bounds = FunctionGrapher.calculateOptimalBounds(functions);
      expect(bounds.xMin).toBe(-10);
      expect(bounds.xMax).toBe(10);
    });
  });

  describe('findCriticalPoints', () => {
    const bounds: GraphBounds = { xMin: -5, xMax: 5, yMin: -5, yMax: 5 };

    it('should find critical points for quadratic functions', () => {
      const points = FunctionGrapher.findCriticalPoints('x^2', bounds, 0.1);
      expect(Array.isArray(points)).toBe(true);

      if (points.length > 0) {
        points.forEach(point => {
          expect(point).toHaveProperty('x');
          expect(point).toHaveProperty('y');
          expect(point).toHaveProperty('type');
          expect(['max', 'min', 'inflection']).toContain(point.type);
        });
      }
    });

    it('should handle functions with no critical points', () => {
      const points = FunctionGrapher.findCriticalPoints('x', bounds, 0.1);
      expect(Array.isArray(points)).toBe(true);
    });

    it('should respect tolerance parameter', () => {
      const lowTol = FunctionGrapher.findCriticalPoints('x^2', bounds, 0.001);
      const highTol = FunctionGrapher.findCriticalPoints('x^2', bounds, 1.0);

      expect(Array.isArray(lowTol)).toBe(true);
      expect(Array.isArray(highTol)).toBe(true);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle extremely large bounds', () => {
      const largeBounds: GraphBounds = {
        xMin: -1000000,
        xMax: 1000000,
        yMin: -1000000,
        yMax: 1000000,
      };

      expect(() => {
        FunctionGrapher.generateFunctionPoints('x^2', largeBounds, 10);
      }).not.toThrow();
    });

    it('should handle very small bounds', () => {
      const smallBounds: GraphBounds = {
        xMin: -0.001,
        xMax: 0.001,
        yMin: -0.001,
        yMax: 0.001,
      };

      const points = FunctionGrapher.generateFunctionPoints(
        'x^2',
        smallBounds,
        10
      );
      expect(Array.isArray(points)).toBe(true);
    });

    it('should handle complex mathematical expressions', () => {
      const result = FunctionGrapher.evaluateFunction(
        'sin(x) + cos(x)',
        Math.PI / 4
      );
      expect(typeof result).toBe('number');
    });

    it('should handle nested function calls', () => {
      const result = FunctionGrapher.evaluateFunction('sin(cos(x))', 0);
      expect(typeof result).toBe('number');
    });
  });
});

describe('functionGrapher convenience functions', () => {
  it('should provide evaluate function', () => {
    const result = functionGrapher.evaluate('x^2', 2);
    expect(result).toBe(4);
  });

  it('should provide generatePoints function', () => {
    const bounds: GraphBounds = { xMin: -2, xMax: 2, yMin: -4, yMax: 4 };
    const points = functionGrapher.generatePoints('x^2', bounds, 10);
    expect(Array.isArray(points)).toBe(true);
  });

  it('should provide drawGraph function', () => {
    const bounds: GraphBounds = { xMin: -10, xMax: 10, yMin: -10, yMax: 10 };
    const functions: FunctionData[] = [];

    expect(() => {
      functionGrapher.drawGraph(mockCanvas as any, functions, bounds);
    }).not.toThrow();
  });

  it('should provide createFunction function', () => {
    const func = functionGrapher.createFunction('x^2');
    expect(func.expression).toBe('x^2');
  });

  it('should provide validateFunction function', () => {
    const result = functionGrapher.validateFunction('x^2');
    expect(result.valid).toBe(true);
  });

  it('should provide getPresets function', () => {
    const presets = functionGrapher.getPresets();
    expect(Array.isArray(presets)).toBe(true);
  });

  it('should provide calculateBounds function', () => {
    const functions: FunctionData[] = [];
    const bounds = functionGrapher.calculateBounds(functions);
    expect(bounds).toHaveProperty('xMin');
    expect(bounds).toHaveProperty('xMax');
    expect(bounds).toHaveProperty('yMin');
    expect(bounds).toHaveProperty('yMax');
  });

  it('should provide findCriticalPoints function', () => {
    const bounds: GraphBounds = { xMin: -5, xMax: 5, yMin: -5, yMax: 5 };
    const points = functionGrapher.findCriticalPoints('x^2', bounds);
    expect(Array.isArray(points)).toBe(true);
  });

  it('should provide randomColor function', () => {
    const color = functionGrapher.randomColor();
    expect(color).toMatch(/^hsl\(\d+, 70%, 50%\)$/);
  });
});
