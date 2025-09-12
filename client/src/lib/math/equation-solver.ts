import { MathResult, SolutionStep, SolverType } from './types';
import { MathValidator } from './validation';
import { getMathInstance } from './math-loader';
import { createFallbackMath } from './fallback-math';

/**
 * Pure equation solving functions extracted from EquationSolverDemo
 */
export class EquationSolver {
  /**
   * Solves equations based on the specified type
   */
  static solve(
    equation: string,
    variable: string = 'x',
    solverType: SolverType = 'solve'
  ): MathResult {
    try {
      // Validate input
      const validation = MathValidator.validateExpression(equation);
      if (!validation.valid) {
        return {
          result: '',
          error: `Validation error: ${validation.error}`,
        };
      }

      // Always use fallback math implementation to avoid external dependencies
      const math = createFallbackMath();

      const sanitizedEquation = validation.sanitized || equation;
      let steps: SolutionStep[] = [];
      let solution: any;

      switch (solverType) {
        case 'solve':
          const solveResult = this.solveEquation(sanitizedEquation, variable);
          steps = solveResult.steps;
          solution = solveResult.result;
          break;

        case 'derivative':
          const derivativeResult = this.findDerivative(
            sanitizedEquation,
            variable
          );
          steps = derivativeResult.steps;
          solution = derivativeResult.result;
          break;

        case 'simplify':
          const simplifyResult = this.simplifyExpression(sanitizedEquation);
          steps = simplifyResult.steps;
          solution = simplifyResult.result;
          break;

        default:
          return {
            result: '',
            error: `Unknown solver type: ${solverType}`,
          };
      }

      return {
        result: solution,
        steps: steps.map(step => step.explanation),
        metadata: {
          solverType,
          variable,
          originalEquation: equation,
          sanitizedEquation,
          detailedSteps: steps,
        },
      };
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown solving error';
      console.error('Equation solver error:', error);
      return {
        result: '',
        error: `Solving failed: ${errorMsg}`,
      };
    }
  }

  /**
   * Solves algebraic equations
   */
  private static solveEquation(
    equation: string,
    variable: string
  ): {
    result: string;
    steps: SolutionStep[];
  } {
    const steps: SolutionStep[] = [];

    try {
      // Check if it's a quadratic equation
      if (
        equation.includes(`${variable}^2`) &&
        !equation.includes(`${variable}^3`)
      ) {
        return this.solveQuadratic(equation, variable);
      }

      // For other equations, try simple numerical root finding
      steps.push({
        step: '1',
        explanation: 'Attempting to find roots numerically',
        result: 'Checking common values...',
      });

      const math = getMathInstance();
      if (!math) {
        steps.push({
          step: 'Error',
          explanation: 'Math library not available',
          result: 'Math library not loaded',
        });
        return { result: 'Math library not loaded', steps };
      }

      const roots: number[] = [];

      // Simple root finding for basic equations
      for (let i = -10; i <= 10; i++) {
        try {
          const expr = equation.replace(
            new RegExp(variable, 'g'),
            i.toString()
          );
          const result = math.evaluate(expr);
          if (typeof result === 'number' && Math.abs(result) < 0.0001) {
            roots.push(i);
          }
        } catch (err) {
          // Continue checking other values
        }
      }

      const solution =
        roots.length > 0
          ? `${variable} = ${roots.join(', ')}`
          : 'No simple integer roots found';

      steps.push({
        step: '2',
        explanation: 'Found roots by testing integer values from -10 to 10',
        result: solution,
      });

      return { result: solution, steps };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      steps.push({
        step: 'Error',
        explanation: `Error solving equation: ${errorMsg}`,
        result: 'Equation solving failed',
      });
      return { result: `Error: ${errorMsg}`, steps };
    }
  }

  /**
   * Solves quadratic equations with detailed steps
   */
  static solveQuadratic(
    equation: string,
    variable: string = 'x'
  ): {
    result: string;
    steps: SolutionStep[];
  } {
    const steps: SolutionStep[] = [];

    try {
      // Parse quadratic equation of form ax^2 + bx + c = 0
      const { a, b, c } = this.parseQuadraticCoefficients(equation, variable);

      steps.push({
        step: '1',
        explanation: `Identify coefficients in a${variable}² + b${variable} + c = 0`,
        result: `a = ${a}, b = ${b}, c = ${c}`,
        latex: `a = ${a}, \\quad b = ${b}, \\quad c = ${c}`,
      });

      const discriminant = b * b - 4 * a * c;

      steps.push({
        step: '2',
        explanation: 'Calculate discriminant: b² - 4ac',
        result: `Δ = ${b}² - 4(${a})(${c}) = ${discriminant}`,
        latex: `\\Delta = ${b}^2 - 4(${a})(${c}) = ${discriminant}`,
      });

      if (discriminant < 0) {
        steps.push({
          step: '3',
          explanation: 'Since discriminant < 0, there are no real roots',
          result: 'No real solutions',
          latex: '\\text{No real solutions}',
        });
        return { result: 'No real solutions', steps };
      } else if (discriminant === 0) {
        const root = -b / (2 * a);
        steps.push({
          step: '3',
          explanation: `Since discriminant = 0, there is one repeated root: ${variable} = -b/(2a)`,
          result: `${variable} = ${root}`,
          latex: `${variable} = ${root}`,
        });
        return { result: `${variable} = ${root}`, steps };
      } else {
        const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);

        steps.push({
          step: '3',
          explanation: `Apply quadratic formula: ${variable} = (-b ± √Δ)/(2a)`,
          result: `${variable}₁ = ${root1.toFixed(4)}, ${variable}₂ = ${root2.toFixed(4)}`,
          latex: `${variable}_1 = ${root1.toFixed(4)}, \\quad ${variable}_2 = ${root2.toFixed(4)}`,
        });
        return {
          result: `${variable}₁ = ${root1.toFixed(4)}, ${variable}₂ = ${root2.toFixed(4)}`,
          steps,
        };
      }
    } catch (err) {
      steps.push({
        step: 'Error',
        explanation: 'Could not parse quadratic equation',
        result: 'Please check equation format (e.g., x^2 + 2*x + 1)',
      });
      return { result: 'Error parsing equation', steps };
    }
  }

  /**
   * Parses coefficients from a quadratic equation
   */
  private static parseQuadraticCoefficients(
    equation: string,
    variable: string
  ): {
    a: number;
    b: number;
    c: number;
  } {
    // Normalize the equation
    const normalized = equation.replace(/\s/g, '').replace(/-/g, '+-');
    const terms = normalized.split('+').filter(t => t);

    let a = 0,
      b = 0,
      c = 0;

    for (const term of terms) {
      if (term.includes(`${variable}^2`)) {
        const coeff = term.replace(`${variable}^2`, '') || '1';
        a =
          coeff === '' || coeff === '+'
            ? 1
            : coeff === '-'
              ? -1
              : parseFloat(coeff);
      } else if (term.includes(variable) && !term.includes(`${variable}^2`)) {
        const coeff = term.replace(variable, '') || '1';
        b =
          coeff === '' || coeff === '+'
            ? 1
            : coeff === '-'
              ? -1
              : parseFloat(coeff);
      } else if (term && !term.includes(variable)) {
        c = parseFloat(term);
      }
    }

    return { a, b, c };
  }

  /**
   * Finds the derivative of an expression
   */
  private static findDerivative(
    expression: string,
    variable: string
  ): {
    result: string;
    steps: SolutionStep[];
  } {
    const steps: SolutionStep[] = [];
    const math = getMathInstance();

    if (!math) {
      steps.push({
        step: 'Error',
        explanation: 'Math library not available',
        result: 'Math library not loaded',
      });
      return { result: 'Math library not loaded', steps };
    }

    try {
      // Check if derivative function exists
      if (typeof math.derivative !== 'function') {
        // Provide a basic derivative for simple cases
        return this.basicDerivative(expression, variable);
      }

      const expr = math.parse(expression);
      const derivative = math.derivative(expr, variable);
      const result = derivative.toString();

      steps.push({
        step: '1',
        explanation: `Taking the derivative of ${expression} with respect to ${variable}`,
        result: result,
        latex: this.toLatex(result),
      });

      return { result, steps };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      steps.push({
        step: 'Error',
        explanation: `Could not compute derivative: ${errorMsg}`,
        result: 'Derivative calculation failed',
      });
      return { result: `Error computing derivative: ${errorMsg}`, steps };
    }
  }

  /**
   * Simplifies mathematical expressions
   */
  private static simplifyExpression(expression: string): {
    result: string;
    steps: SolutionStep[];
  } {
    const steps: SolutionStep[] = [];
    const math = getMathInstance();

    if (!math) {
      steps.push({
        step: 'Error',
        explanation: 'Math library not available',
        result: 'Math library not loaded',
      });
      return { result: 'Math library not loaded', steps };
    }

    try {
      // Check if simplify function exists
      if (typeof math.simplify !== 'function') {
        // Return the expression as-is if simplify is not available
        steps.push({
          step: '1',
          explanation: `Expression: ${expression} (simplification not available)`,
          result: expression,
          latex: this.toLatex(expression),
        });
        return { result: expression, steps };
      }

      const expr = math.parse(expression);
      const simplified = math.simplify(expr);
      const result = simplified.toString();

      steps.push({
        step: '1',
        explanation: `Simplifying ${expression}`,
        result: result,
        latex: this.toLatex(result),
      });

      return { result, steps };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      steps.push({
        step: 'Error',
        explanation: `Could not simplify expression: ${errorMsg}`,
        result: 'Simplification failed',
      });
      return { result: `Error simplifying expression: ${errorMsg}`, steps };
    }
  }

  /**
   * Converts mathematical expressions to LaTeX format
   */
  static toLatex(expression: string): string {
    let latex = expression;

    // Replace common mathematical notation
    latex = latex.replace(/\*\*/g, '^'); // ** to ^

    // Handle coefficient multiplication (number * variable) - remove multiplication symbol
    latex = latex.replace(/(\d+)\s*\*\s*([a-zA-Z])/g, '$1$2'); // 4*x -> 4x
    latex = latex.replace(/(\d+)\s*\*\s*\(/g, '$1('); // 4*(x+1) -> 4(x+1)

    // Handle variable * variable or function * function - keep multiplication symbol
    latex = latex.replace(/([a-zA-Z])\s*\*\s*([a-zA-Z])/g, '$1 \\cdot $2'); // x*y -> x·y
    latex = latex.replace(/\)\s*\*\s*\(/g, ') \\cdot ('); // (x+1)*(x-1) -> (x+1)·(x-1)
    latex = latex.replace(/\)\s*\*\s*([a-zA-Z])/g, ') \\cdot $1'); // (x+1)*y -> (x+1)·y
    latex = latex.replace(/([a-zA-Z])\s*\*\s*\(/g, '$1 \\cdot ('); // x*(y+1) -> x·(y+1)

    // Handle any remaining * as multiplication
    latex = latex.replace(/\*/g, ' \\cdot ');
    latex = latex.replace(/\^(\w+)/g, '^{$1}'); // x^2 to x^{2}
    latex = latex.replace(/\^(\d+)/g, '^{$1}'); // x^2 to x^{2}
    latex = latex.replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}'); // sqrt() to \sqrt{}
    latex = latex.replace(/sin\(([^)]+)\)/g, '\\sin($1)'); // sin() to \sin()
    latex = latex.replace(/cos\(([^)]+)\)/g, '\\cos($1)'); // cos() to \cos()
    latex = latex.replace(/tan\(([^)]+)\)/g, '\\tan($1)'); // tan() to \tan()
    latex = latex.replace(/log\(([^)]+)\)/g, '\\log($1)'); // log() to \log()
    latex = latex.replace(/ln\(([^)]+)\)/g, '\\ln($1)'); // ln() to \ln()
    latex = latex.replace(/exp\(([^)]+)\)/g, 'e^{$1}'); // exp() to e^{}
    latex = latex.replace(/pi/g, '\\pi'); // pi to \pi
    latex = latex.replace(/infinity/g, '\\infty'); // infinity to \infty

    // Handle fractions (simple cases)
    latex = latex.replace(/(\w+)\/(\w+)/g, '\\frac{$1}{$2}');
    latex = latex.replace(/\(([^)]+)\)\/\(([^)]+)\)/g, '\\frac{$1}{$2}');

    // Handle subscripts for roots like x₁, x₂
    latex = latex.replace(/x₁/g, 'x_1');
    latex = latex.replace(/x₂/g, 'x_2');
    latex = latex.replace(/x₃/g, 'x_3');
    latex = latex.replace(/x₄/g, 'x_4');

    // Handle discriminant symbol
    latex = latex.replace(/Δ/g, '\\Delta');

    // Handle equals signs in results
    latex = latex.replace(
      /x₁ = ([^,]+), x₂ = ([^,]+)/g,
      'x_1 = $1, \\quad x_2 = $2'
    );

    // Clean up extra spaces
    latex = latex.replace(/\s+/g, ' ').trim();

    return latex;
  }

  /**
   * Basic derivative calculation for simple cases when math.js derivative is not available
   */
  private static basicDerivative(
    expression: string,
    variable: string
  ): {
    result: string;
    steps: SolutionStep[];
  } {
    const steps: SolutionStep[] = [];

    // Handle basic polynomial derivatives
    if (expression.includes(`${variable}^`)) {
      // Simple power rule for x^n
      const powerMatch = expression.match(
        new RegExp(`(\\d*)\\*?${variable}\\^(\\d+)`)
      );
      if (powerMatch) {
        const coeff = powerMatch[1] ? parseInt(powerMatch[1]) : 1;
        const power = parseInt(powerMatch[2]);
        const newCoeff = coeff * power;
        const newPower = power - 1;

        let result;
        if (newPower === 0) {
          result = newCoeff.toString();
        } else if (newPower === 1) {
          result = newCoeff === 1 ? variable : `${newCoeff}*${variable}`;
        } else {
          result =
            newCoeff === 1
              ? `${variable}^${newPower}`
              : `${newCoeff}*${variable}^${newPower}`;
        }

        steps.push({
          step: '1',
          explanation: `Using power rule: d/d${variable}[${variable}^${power}] = ${power}*${variable}^${power - 1}`,
          result: result,
          latex: this.toLatex(result),
        });

        return { result, steps };
      }
    }

    // Handle simple linear terms
    if (expression === variable) {
      steps.push({
        step: '1',
        explanation: `Derivative of ${variable} with respect to ${variable} is 1`,
        result: '1',
        latex: '1',
      });
      return { result: '1', steps };
    }

    // Handle constants
    if (!expression.includes(variable)) {
      steps.push({
        step: '1',
        explanation: `Derivative of constant ${expression} is 0`,
        result: '0',
        latex: '0',
      });
      return { result: '0', steps };
    }

    // Fallback
    steps.push({
      step: '1',
      explanation: `Basic derivative calculation not available for ${expression}`,
      result: `d/d${variable}[${expression}]`,
      latex: `\\frac{d}{d${variable}}[${this.toLatex(expression)}]`,
    });

    return { result: `d/d${variable}[${expression}]`, steps };
  }

  /**
   * Gets preset equation examples
   */
  static getExamples(): Array<{
    type: SolverType;
    equation: string;
    description: string;
  }> {
    return [
      { type: 'solve', equation: 'x^2 - 4', description: 'Simple quadratic' },
      {
        type: 'solve',
        equation: 'x^2 + 2*x - 3',
        description: 'Quadratic with linear term',
      },
      {
        type: 'derivative',
        equation: 'x^3 + 2*x^2 + x',
        description: 'Polynomial derivative',
      },
      {
        type: 'derivative',
        equation: 'sin(x)',
        description: 'Trigonometric derivative',
      },
      {
        type: 'simplify',
        equation: '(x + 2)^2',
        description: 'Expand expression',
      },
      {
        type: 'simplify',
        equation: 'x^2 + 4*x + 4',
        description: 'Factor expression',
      },
    ];
  }
}

/**
 * Convenience functions for equation solving
 */
export const equationSolver = {
  /**
   * Solves an equation
   */
  solve: (
    equation: string,
    variable: string = 'x',
    type: SolverType = 'solve'
  ): MathResult => {
    return EquationSolver.solve(equation, variable, type);
  },

  /**
   * Solves quadratic equations specifically
   */
  solveQuadratic: (equation: string, variable: string = 'x') => {
    return EquationSolver.solveQuadratic(equation, variable);
  },

  /**
   * Converts expression to LaTeX
   */
  toLatex: (expression: string): string => {
    return EquationSolver.toLatex(expression);
  },

  /**
   * Gets example equations
   */
  getExamples: () => EquationSolver.getExamples(),

  /**
   * Validates equation input
   */
  validateInput: (equation: string) =>
    MathValidator.validateExpression(equation),
};
