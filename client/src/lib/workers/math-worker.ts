/**
 * Web Worker for expensive math computations
 * Handles equation solving, function graphing, and complex calculations
 */

// Import math utilities for worker context
import { createFallbackMath } from '../math/fallback-math';

// Worker message types
export interface WorkerMessage {
  id: string;
  type:
    | 'equation-solve'
    | 'function-graph'
    | 'calculator-eval'
    | 'critical-points';
  payload: any;
}

export interface WorkerResponse {
  id: string;
  success: boolean;
  result?: any;
  error?: string;
}

// Initialize math instance for worker
let mathInstance: any = null;

// Initialize math library in worker context
function initializeMath() {
  if (!mathInstance) {
    mathInstance = createFallbackMath();
  }
  return mathInstance;
}

// Equation solving operations
function solveEquation(data: {
  equation: string;
  variable: string;
  type: 'solve' | 'derivative' | 'simplify';
}): any {
  const math = initializeMath();
  const { equation, variable, type } = data;

  try {
    switch (type) {
      case 'solve':
        return solveAlgebraicEquation(equation, variable, math);
      case 'derivative':
        return computeDerivative(equation, variable, math);
      case 'simplify':
        return simplifyExpression(equation, math);
      default:
        throw new Error(`Unknown solver type: ${type}`);
    }
  } catch (error) {
    throw new Error(
      `Equation solving failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Algebraic equation solving with numerical methods
function solveAlgebraicEquation(equation: string, variable: string, math: any) {
  const steps: Array<{ step: string; explanation: string; result: string }> =
    [];

  // Check for quadratic equations
  if (
    equation.includes(`${variable}^2`) &&
    !equation.includes(`${variable}^3`)
  ) {
    return solveQuadraticEquation(equation, variable, steps);
  }

  // Numerical root finding for general equations
  steps.push({
    step: '1',
    explanation: 'Using numerical methods to find roots',
    result: 'Searching for solutions...',
  });

  const roots: number[] = [];
  const searchRange = 100; // Search from -100 to 100
  const precision = 0.1;

  // Bisection method for root finding
  for (let start = -searchRange; start < searchRange; start += 10) {
    const end = start + 10;
    try {
      const root = bisectionMethod(
        equation,
        variable,
        start,
        end,
        math,
        0.0001
      );
      if (root !== null && !roots.some(r => Math.abs(r - root) < 0.001)) {
        roots.push(root);
      }
    } catch (e) {
      // Continue searching
    }
  }

  const result =
    roots.length > 0
      ? `${variable} = ${roots.map(r => r.toFixed(4)).join(', ')}`
      : 'No real roots found in range [-100, 100]';

  steps.push({
    step: '2',
    explanation: `Found ${roots.length} root(s) using numerical methods`,
    result: result,
  });

  return {
    result,
    steps: steps.map(s => s.explanation),
    metadata: { roots, method: 'numerical' },
  };
}

// Bisection method for root finding
function bisectionMethod(
  equation: string,
  variable: string,
  a: number,
  b: number,
  math: any,
  tolerance: number = 0.0001
): number | null {
  const maxIterations = 100;

  const evaluate = (x: number): number => {
    try {
      const expr = equation.replace(new RegExp(variable, 'g'), x.toString());
      return math.evaluate(expr);
    } catch (e) {
      throw new Error('Evaluation failed');
    }
  };

  let fa = evaluate(a);
  let fb = evaluate(b);

  // Check if root exists in interval
  if (fa * fb > 0) {
    return null;
  }

  let iteration = 0;
  while (Math.abs(b - a) > tolerance && iteration < maxIterations) {
    const c = (a + b) / 2;
    const fc = evaluate(c);

    if (Math.abs(fc) < tolerance) {
      return c;
    }

    if (fa * fc < 0) {
      b = c;
      fb = fc;
    } else {
      a = c;
      fa = fc;
    }

    iteration++;
  }

  return (a + b) / 2;
}

// Quadratic equation solver
function solveQuadraticEquation(
  equation: string,
  variable: string,
  steps: any[]
) {
  // Parse coefficients from ax^2 + bx + c = 0
  const coeffs = parseQuadraticCoefficients(equation, variable);
  const { a, b, c } = coeffs;

  steps.push({
    step: '1',
    explanation: `Identified quadratic equation: ${a}${variable}² + ${b}${variable} + ${c} = 0`,
    result: `a = ${a}, b = ${b}, c = ${c}`,
  });

  const discriminant = b * b - 4 * a * c;

  steps.push({
    step: '2',
    explanation: 'Calculate discriminant: b² - 4ac',
    result: `Δ = ${discriminant}`,
  });

  if (discriminant < 0) {
    steps.push({
      step: '3',
      explanation: 'Discriminant < 0: No real solutions',
      result: 'No real solutions',
    });
    return {
      result: 'No real solutions',
      steps: steps.map(s => s.explanation),
    };
  } else if (discriminant === 0) {
    const root = -b / (2 * a);
    steps.push({
      step: '3',
      explanation: 'Discriminant = 0: One repeated root',
      result: `${variable} = ${root}`,
    });
    return {
      result: `${variable} = ${root}`,
      steps: steps.map(s => s.explanation),
    };
  } else {
    const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    steps.push({
      step: '3',
      explanation: 'Apply quadratic formula',
      result: `${variable}₁ = ${root1.toFixed(4)}, ${variable}₂ = ${root2.toFixed(4)}`,
    });
    return {
      result: `${variable}₁ = ${root1.toFixed(4)}, ${variable}₂ = ${root2.toFixed(4)}`,
      steps: steps.map(s => s.explanation),
      metadata: { roots: [root1, root2] },
    };
  }
}

// Parse quadratic coefficients
function parseQuadraticCoefficients(equation: string, variable: string) {
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

// Derivative computation
function computeDerivative(expression: string, variable: string, math: any) {
  const steps: Array<{ step: string; explanation: string; result: string }> =
    [];

  // Basic derivative rules for common functions
  if (expression === variable) {
    steps.push({
      step: '1',
      explanation: `Derivative of ${variable} with respect to ${variable}`,
      result: '1',
    });
    return { result: '1', steps: steps.map(s => s.explanation) };
  }

  // Power rule: x^n -> n*x^(n-1)
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
      explanation: `Power rule: d/d${variable}[${variable}^${power}] = ${power}*${variable}^${power - 1}`,
      result: result,
    });

    return { result, steps: steps.map(s => s.explanation) };
  }

  // Fallback for complex expressions
  steps.push({
    step: '1',
    explanation: `Derivative calculation for ${expression}`,
    result: `d/d${variable}[${expression}]`,
  });

  return {
    result: `d/d${variable}[${expression}]`,
    steps: steps.map(s => s.explanation),
  };
}

// Expression simplification
function simplifyExpression(expression: string, math: any) {
  const steps: Array<{ step: string; explanation: string; result: string }> =
    [];

  try {
    // Basic simplification - expand and collect terms
    steps.push({
      step: '1',
      explanation: `Simplifying expression: ${expression}`,
      result: expression,
    });

    // For now, return the expression as-is since we don't have advanced CAS
    return { result: expression, steps: steps.map(s => s.explanation) };
  } catch (error) {
    return { result: expression, steps: ['Expression returned as-is'] };
  }
}

// Function graphing operations
function generateFunctionPoints(data: {
  expression: string;
  bounds: { xMin: number; xMax: number; yMin: number; yMax: number };
  resolution: number;
}): Array<{ x: number; y: number }> {
  const math = initializeMath();
  const { expression, bounds, resolution } = data;
  const { xMin, xMax } = bounds;

  const points: Array<{ x: number; y: number }> = [];
  const step = (xMax - xMin) / resolution;

  for (let x = xMin; x <= xMax; x += step) {
    try {
      const y = math.evaluate(expression, { x });
      if (typeof y === 'number' && isFinite(y)) {
        points.push({ x, y });
      }
    } catch (e) {
      // Skip invalid points
    }
  }

  return points;
}

// Critical points finding
function findCriticalPoints(data: {
  expression: string;
  bounds: { xMin: number; xMax: number; yMin: number; yMax: number };
  tolerance: number;
}): Array<{ x: number; y: number; type: 'max' | 'min' | 'inflection' }> {
  const math = initializeMath();
  const { expression, bounds, tolerance } = data;
  const { xMin, xMax } = bounds;

  const points: Array<{
    x: number;
    y: number;
    type: 'max' | 'min' | 'inflection';
  }> = [];
  const step = (xMax - xMin) / 1000;

  const evaluate = (x: number): number | null => {
    try {
      const result = math.evaluate(expression, { x });
      return typeof result === 'number' && isFinite(result) ? result : null;
    } catch (e) {
      return null;
    }
  };

  for (let x = xMin + step; x < xMax - step; x += step) {
    const y1 = evaluate(x - step);
    const y2 = evaluate(x);
    const y3 = evaluate(x + step);

    if (y1 !== null && y2 !== null && y3 !== null) {
      // Local maximum
      if (
        y2 > y1 &&
        y2 > y3 &&
        Math.abs(y2 - y1) > tolerance &&
        Math.abs(y2 - y3) > tolerance
      ) {
        points.push({ x, y: y2, type: 'max' });
      }
      // Local minimum
      else if (
        y2 < y1 &&
        y2 < y3 &&
        Math.abs(y1 - y2) > tolerance &&
        Math.abs(y3 - y2) > tolerance
      ) {
        points.push({ x, y: y2, type: 'min' });
      }
    }
  }

  return points;
}

// Calculator evaluation
function evaluateCalculatorExpression(data: {
  expression: string;
  angleMode: 'deg' | 'rad';
}): { result: string; error?: string } {
  const math = initializeMath();
  const { expression, angleMode } = data;

  try {
    // Configure angle mode if supported
    let result: any;
    if (math.create && typeof math.create === 'function') {
      const configuredMath = math.create();
      configuredMath.config({ angleUnit: angleMode });
      result = configuredMath.evaluate(expression);
    } else {
      result = math.evaluate(expression);
    }

    // Format result
    if (typeof result === 'number') {
      if (!isFinite(result)) {
        return { result: result.toString() };
      }
      if (Math.abs(result) < 1e-10 && result !== 0) {
        return { result: '0' };
      }
      if (Number.isInteger(result)) {
        return { result: result.toString() };
      } else {
        return { result: result.toFixed(8).replace(/\.?0+$/, '') };
      }
    }

    return { result: result.toString() };
  } catch (error) {
    return {
      result: '0',
      error: `Calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// Main message handler
self.onmessage = function (event: MessageEvent<WorkerMessage>) {
  const { id, type, payload } = event.data;

  try {
    let result: any;

    switch (type) {
      case 'equation-solve':
        result = solveEquation(payload);
        break;

      case 'function-graph':
        result = generateFunctionPoints(payload);
        break;

      case 'critical-points':
        result = findCriticalPoints(payload);
        break;

      case 'calculator-eval':
        result = evaluateCalculatorExpression(payload);
        break;

      default:
        throw new Error(`Unknown operation type: ${type}`);
    }

    const response: WorkerResponse = {
      id,
      success: true,
      result,
    };

    self.postMessage(response);
  } catch (error) {
    const response: WorkerResponse = {
      id,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown worker error',
    };

    self.postMessage(response);
  }
};

// Export types for TypeScript
export {};
