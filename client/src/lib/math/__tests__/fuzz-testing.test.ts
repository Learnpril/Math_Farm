import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Calculator } from '../calculator';
import { EquationSolver } from '../equation-solver';
import { FunctionGrapher } from '../function-grapher';
import { MathValidator } from '../validation';

// Mock the math loader for consistent testing
vi.mock('../math-loader', () => ({
  getMathInstance: vi.fn(() => ({
    evaluate: vi.fn((expr: string, scope?: any) => {
      try {
        if (scope && scope.x !== undefined) {
          const x = scope.x;
          // Handle common mathematical functions for fuzz testing
          if (expr === 'x^2') return x * x;
          if (expr === 'x^3') return x * x * x;
          if (expr === 'sin(x)') return Math.sin(x);
          if (expr === 'cos(x)') return Math.cos(x);
          if (expr === 'sqrt(x)') return x >= 0 ? Math.sqrt(x) : NaN;
          if (expr === 'log(x)') return x > 0 ? Math.log(x) : NaN;
          if (expr === '1/x') return x !== 0 ? 1 / x : Infinity;
          if (expr === 'abs(x)') return Math.abs(x);
          if (expr === 'exp(x)') return Math.exp(x);

          // Fallback evaluation
          return eval(expr.replace(/x/g, x.toString()));
        }
        return eval(expr);
      } catch (error) {
        throw new Error(`Math evaluation failed: ${error}`);
      }
    }),
    create: vi.fn(() => ({
      config: vi.fn(),
      evaluate: vi.fn((expr: string) => eval(expr)),
    })),
  })),
}));

describe('Fuzz Testing for Numerical Stability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Calculator Fuzz Testing', () => {
    it('should handle random arithmetic expressions without crashing', () => {
      const operators = ['+', '-', '*', '/', '^'];
      const numbers = [0, 1, -1, 0.1, -0.1, 1e10, 1e-10, Math.PI, Math.E];

      for (let i = 0; i < 100; i++) {
        const num1 = numbers[Math.floor(Math.random() * numbers.length)];
        const num2 = numbers[Math.floor(Math.random() * numbers.length)];
        const op = operators[Math.floor(Math.random() * operators.length)];

        const expression = `${num1}${op}${num2}`;

        expect(() => {
          const result = Calculator.evaluate(expression);
          // Result should always be defined, even if it contains an error
          expect(result).toBeDefined();
          expect(typeof result.result === 'string' || result.error).toBe(true);
        }).not.toThrow();
      }
    });

    it('should handle extreme numerical values', () => {
      const extremeValues = [
        Number.MAX_VALUE,
        Number.MIN_VALUE,
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER,
        1e308,
        1e-308,
        0,
        -0,
      ];

      extremeValues.forEach(value => {
        expect(() => {
          const result = Calculator.evaluate(value.toString());
          expect(result).toBeDefined();
        }).not.toThrow();
      });
    });

    it('should handle floating-point precision edge cases', () => {
      const precisionTests = [
        '0.1 + 0.2',
        '0.3 - 0.1',
        '0.1 * 3',
        '1.0 / 3.0 * 3.0',
        '(0.1 + 0.2) - 0.3',
        'sqrt(2) * sqrt(2)',
        'sin(pi/2)',
        'cos(0)',
      ];

      precisionTests.forEach(expr => {
        expect(() => {
          const result = Calculator.evaluate(expr);
          expect(result).toBeDefined();

          if (!result.error) {
            const numResult = parseFloat(result.result);
            expect(isFinite(numResult) || isNaN(numResult)).toBe(true);
          }
        }).not.toThrow();
      });
    });

    it('should handle random function compositions', () => {
      const functions = ['sin', 'cos', 'tan', 'sqrt', 'abs', 'log', 'exp'];
      const values = [0, 1, -1, Math.PI / 2, Math.PI, 2 * Math.PI, Math.E];

      for (let i = 0; i < 50; i++) {
        const func = functions[Math.floor(Math.random() * functions.length)];
        const value = values[Math.floor(Math.random() * values.length)];
        const expression = `${func}(${value})`;

        expect(() => {
          const result = Calculator.evaluate(expression);
          expect(result).toBeDefined();
        }).not.toThrow();
      }
    });

    it('should handle nested function calls with random depth', () => {
      const functions = ['sin', 'cos', 'abs', 'sqrt'];

      for (let depth = 1; depth <= 5; depth++) {
        let expression = '1';

        for (let i = 0; i < depth; i++) {
          const func = functions[Math.floor(Math.random() * functions.length)];
          expression = `${func}(${expression})`;
        }

        expect(() => {
          const result = Calculator.evaluate(expression);
          expect(result).toBeDefined();
        }).not.toThrow();
      }
    });
  });

  describe('Function Grapher Fuzz Testing', () => {
    it('should handle random function evaluations', () => {
      const functions = [
        'x^2',
        'sin(x)',
        'cos(x)',
        'sqrt(x)',
        'log(x)',
        '1/x',
        'abs(x)',
      ];
      const xValues = [-1000, -100, -10, -1, -0.1, 0, 0.1, 1, 10, 100, 1000];

      functions.forEach(func => {
        xValues.forEach(x => {
          expect(() => {
            const result = FunctionGrapher.evaluateFunction(func, x);
            // Result should be null or a finite number
            expect(result === null || typeof result === 'number').toBe(true);
            if (typeof result === 'number') {
              expect(isFinite(result) || isNaN(result)).toBe(true);
            }
          }).not.toThrow();
        });
      });
    });

    it('should handle random bounds for point generation', () => {
      const functions = ['x^2', 'sin(x)', 'x^3'];

      for (let i = 0; i < 20; i++) {
        const xMin = (Math.random() - 0.5) * 1000;
        const xMax = xMin + Math.random() * 100;
        const yMin = (Math.random() - 0.5) * 1000;
        const yMax = yMin + Math.random() * 100;

        const bounds = { xMin, xMax, yMin, yMax };
        const func = functions[Math.floor(Math.random() * functions.length)];

        expect(() => {
          const points = FunctionGrapher.generateFunctionPoints(
            func,
            bounds,
            10
          );
          expect(Array.isArray(points)).toBe(true);

          points.forEach(point => {
            expect(typeof point.x).toBe('number');
            expect(typeof point.y).toBe('number');
            expect(isFinite(point.x)).toBe(true);
            expect(isFinite(point.y)).toBe(true);
          });
        }).not.toThrow();
      }
    });

    it('should handle functions with discontinuities', () => {
      const discontinuousFunctions = [
        '1/x',
        'log(x)',
        'sqrt(x)',
        'tan(x)',
        '1/(x-1)',
        'log(x-2)',
      ];

      discontinuousFunctions.forEach(func => {
        const bounds = { xMin: -5, xMax: 5, yMin: -10, yMax: 10 };

        expect(() => {
          const points = FunctionGrapher.generateFunctionPoints(
            func,
            bounds,
            100
          );
          expect(Array.isArray(points)).toBe(true);

          // All returned points should have finite values
          points.forEach(point => {
            expect(isFinite(point.x)).toBe(true);
            expect(isFinite(point.y)).toBe(true);
          });
        }).not.toThrow();
      });
    });
  });

  describe('Equation Solver Fuzz Testing', () => {
    it('should handle random quadratic coefficients', () => {
      for (let i = 0; i < 50; i++) {
        const a = (Math.random() - 0.5) * 100;
        const b = (Math.random() - 0.5) * 100;
        const c = (Math.random() - 0.5) * 100;

        // Skip if a is too close to zero (not quadratic)
        if (Math.abs(a) < 0.001) continue;

        const equation = `${a}*x^2 + ${b}*x + ${c}`;

        expect(() => {
          const result = EquationSolver.solveQuadratic(equation, 'x');
          expect(result).toBeDefined();
          expect(result.result).toBeDefined();
          expect(Array.isArray(result.steps)).toBe(true);
        }).not.toThrow();
      }
    });

    it('should handle edge cases in quadratic solving', () => {
      const edgeCases = [
        { a: 1, b: 0, c: 0 }, // x^2 = 0
        { a: 1, b: 0, c: -1 }, // x^2 = 1
        { a: 1, b: 0, c: 1 }, // x^2 = -1 (no real roots)
        { a: 1, b: -2, c: 1 }, // (x-1)^2 = 0 (repeated root)
        { a: 0.001, b: 1000, c: 0.001 }, // Very small a
        { a: 1000, b: 0.001, c: 1000 }, // Very large a and c
      ];

      edgeCases.forEach(({ a, b, c }) => {
        const equation = `${a}*x^2 + ${b}*x + ${c}`;

        expect(() => {
          const result = EquationSolver.solveQuadratic(equation, 'x');
          expect(result).toBeDefined();
          expect(result.steps.length).toBeGreaterThan(0);
        }).not.toThrow();
      });
    });

    it('should handle random polynomial expressions', () => {
      const variables = ['x', 'y', 't'];
      const operations = ['+', '-', '*'];

      for (let i = 0; i < 30; i++) {
        const variable =
          variables[Math.floor(Math.random() * variables.length)];
        const coeff = Math.floor(Math.random() * 20) - 10;
        const power = Math.floor(Math.random() * 4) + 1;
        const constant = Math.floor(Math.random() * 20) - 10;

        const expression = `${coeff}*${variable}^${power} + ${constant}`;

        expect(() => {
          const result = EquationSolver.solve(expression, variable, 'solve');
          expect(result).toBeDefined();
        }).not.toThrow();
      }
    });
  });

  describe('Validation Fuzz Testing', () => {
    it('should handle random character combinations', () => {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789+-*/^().,';

      for (let i = 0; i < 100; i++) {
        let randomString = '';
        const length = Math.floor(Math.random() * 20) + 1;

        for (let j = 0; j < length; j++) {
          randomString += chars[Math.floor(Math.random() * chars.length)];
        }

        expect(() => {
          const result = MathValidator.validateExpression(randomString);
          expect(result).toBeDefined();
          expect(typeof result.valid).toBe('boolean');
        }).not.toThrow();
      }
    });

    it('should handle random array structures', () => {
      for (let i = 0; i < 50; i++) {
        const depth = Math.floor(Math.random() * 3) + 1;
        const size = Math.floor(Math.random() * 10) + 1;

        let testArray: any = [];

        // Generate random nested array
        for (let d = 0; d < depth; d++) {
          if (d === 0) {
            testArray = Array.from(
              { length: size },
              () => Math.random() * 1000 - 500
            );
          } else {
            testArray = [testArray, testArray.slice()];
          }
        }

        expect(() => {
          const result = MathValidator.validateMathData(testArray);
          expect(result).toBeDefined();
          expect(typeof result.valid).toBe('boolean');
        }).not.toThrow();
      }
    });

    it('should handle extreme floating-point values', () => {
      const extremeValues = [
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
        Number.NaN,
        Number.MAX_VALUE,
        Number.MIN_VALUE,
        Number.EPSILON,
        -Number.EPSILON,
        1.7976931348623157e308, // Near MAX_VALUE
        5e-324, // Near MIN_VALUE
        9007199254740991, // MAX_SAFE_INTEGER
        -9007199254740991, // MIN_SAFE_INTEGER
      ];

      extremeValues.forEach(value => {
        expect(() => {
          const result = MathValidator.validateFloatingPoint(value);
          expect(result).toBeDefined();
          expect(typeof result.valid).toBe('boolean');
        }).not.toThrow();
      });
    });
  });

  describe('Stress Testing', () => {
    it('should handle high-frequency calculations', () => {
      const startTime = Date.now();
      let successCount = 0;

      for (let i = 0; i < 1000; i++) {
        try {
          const result = Calculator.evaluate(`${i} + ${i * 2}`);
          if (!result.error) {
            successCount++;
          }
        } catch (error) {
          // Count failures but don't throw
        }
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(successCount).toBeGreaterThan(900); // At least 90% success rate
      expect(duration).toBeLessThan(5000); // Should complete in reasonable time
    });

    it('should handle concurrent-like operations', () => {
      const operations = [
        () => Calculator.evaluate('sin(pi/2)'),
        () => FunctionGrapher.evaluateFunction('x^2', 5),
        () => MathValidator.validateExpression('2 + 2'),
        () => EquationSolver.solve('x^2 - 4', 'x', 'solve'),
      ];

      const results = [];

      // Simulate concurrent operations
      for (let i = 0; i < 100; i++) {
        const op = operations[i % operations.length];
        expect(() => {
          const result = op();
          results.push(result);
        }).not.toThrow();
      }

      expect(results.length).toBe(100);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });

    it('should maintain precision across multiple operations', () => {
      let value = 1.0;
      const operations = [
        (x: number) => x * 2,
        (x: number) => x / 2,
        (x: number) => x + 0.1,
        (x: number) => x - 0.1,
      ];

      for (let i = 0; i < 1000; i++) {
        const op = operations[i % operations.length];
        value = op(value);

        // Value should remain reasonable
        expect(isFinite(value)).toBe(true);
        expect(Math.abs(value)).toBeLessThan(1e10);
      }

      // After many operations, should be close to original value
      expect(Math.abs(value - 1.0)).toBeLessThan(1e-10);
    });
  });

  describe('Memory and Performance Testing', () => {
    it('should not leak memory with repeated operations', () => {
      const initialMemory = process.memoryUsage?.()?.heapUsed || 0;

      for (let i = 0; i < 10000; i++) {
        Calculator.evaluate(`${Math.random()} + ${Math.random()}`);

        // Force garbage collection periodically if available
        if (i % 1000 === 0 && global.gc) {
          global.gc();
        }
      }

      const finalMemory = process.memoryUsage?.()?.heapUsed || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    it('should handle large expression trees efficiently', () => {
      let expression = 'x';

      // Build a large nested expression
      for (let i = 0; i < 100; i++) {
        expression = `sin(${expression})`;
      }

      const startTime = Date.now();

      expect(() => {
        const result = MathValidator.validateExpression(expression);
        expect(result).toBeDefined();
      }).not.toThrow();

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time even for large expressions
      expect(duration).toBeLessThan(1000);
    });
  });
});
