import { FunctionData, GraphBounds, ValidationResult } from './types';
import { MathValidator } from './validation';
import { getMathInstance } from './math-loader';
import { createFallbackMath } from './fallback-math';

/**
 * Pure function graphing utilities extracted from FunctionGrapherDemo
 */
export class FunctionGrapher {
  /**
   * Evaluates a mathematical function at a given x value
   */
  static evaluateFunction(expression: string, x: number): number | null {
    // Validate the expression
    const validation = MathValidator.validateExpression(expression);
    if (!validation.valid) {
      return null;
    }

    const math = getMathInstance();
    if (!math) {
      return null;
    }

    try {
      // Use math.js for evaluation with the x variable
      const result = math.evaluate(expression, { x });
      return typeof result === 'number' && isFinite(result) ? result : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Generates function data points for graphing
   */
  static generateFunctionPoints(
    expression: string,
    bounds: GraphBounds,
    resolution: number = 1000
  ): Array<{ x: number; y: number }> {
    const points: Array<{ x: number; y: number }> = [];
    const { xMin, xMax } = bounds;
    const step = (xMax - xMin) / resolution;

    for (let x = xMin; x <= xMax; x += step) {
      const y = this.evaluateFunction(expression, x);
      if (y !== null && isFinite(y)) {
        points.push({ x, y });
      }
    }

    return points;
  }

  /**
   * Draws a function graph on a canvas
   */
  static drawGraph(
    canvas: HTMLCanvasElement,
    functions: FunctionData[],
    bounds: GraphBounds
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const { xMin, xMax, yMin, yMax } = bounds;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set up coordinate system
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;

    // Convert graph coordinates to canvas coordinates
    const toCanvasX = (x: number) => ((x - xMin) / xRange) * width;
    const toCanvasY = (y: number) => height - ((y - yMin) / yRange) * height;

    // Draw grid
    this.drawGrid(ctx, bounds, width, height, toCanvasX, toCanvasY);

    // Draw axes
    this.drawAxes(ctx, bounds, width, height, toCanvasX, toCanvasY);

    // Draw functions
    functions.forEach(func => {
      if (func.visible) {
        this.drawFunction(ctx, func, bounds, width, toCanvasX, toCanvasY);
      }
    });

    // Draw axis labels
    this.drawAxisLabels(ctx, bounds, toCanvasX, toCanvasY, width, height);
  }

  /**
   * Draws the coordinate grid
   */
  private static drawGrid(
    ctx: CanvasRenderingContext2D,
    bounds: GraphBounds,
    width: number,
    height: number,
    toCanvasX: (x: number) => number,
    toCanvasY: (y: number) => number
  ): void {
    const { xMin, xMax, yMin, yMax } = bounds;

    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    // Vertical grid lines
    for (let x = Math.ceil(xMin); x <= xMax; x++) {
      const canvasX = toCanvasX(x);
      ctx.beginPath();
      ctx.moveTo(canvasX, 0);
      ctx.lineTo(canvasX, height);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let y = Math.ceil(yMin); y <= yMax; y++) {
      const canvasY = toCanvasY(y);
      ctx.beginPath();
      ctx.moveTo(0, canvasY);
      ctx.lineTo(width, canvasY);
      ctx.stroke();
    }
  }

  /**
   * Draws the coordinate axes
   */
  private static drawAxes(
    ctx: CanvasRenderingContext2D,
    bounds: GraphBounds,
    width: number,
    height: number,
    toCanvasX: (x: number) => number,
    toCanvasY: (y: number) => number
  ): void {
    const { xMin, xMax, yMin, yMax } = bounds;

    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 2;

    // X-axis
    if (yMin <= 0 && yMax >= 0) {
      const y0 = toCanvasY(0);
      ctx.beginPath();
      ctx.moveTo(0, y0);
      ctx.lineTo(width, y0);
      ctx.stroke();
    }

    // Y-axis
    if (xMin <= 0 && xMax >= 0) {
      const x0 = toCanvasX(0);
      ctx.beginPath();
      ctx.moveTo(x0, 0);
      ctx.lineTo(x0, height);
      ctx.stroke();
    }
  }

  /**
   * Draws a single function
   */
  private static drawFunction(
    ctx: CanvasRenderingContext2D,
    func: FunctionData,
    bounds: GraphBounds,
    width: number,
    toCanvasX: (x: number) => number,
    toCanvasY: (y: number) => number
  ): void {
    const { xMin, xMax, yMin, yMax } = bounds;
    const xRange = xMax - xMin;

    ctx.strokeStyle = func.color;
    ctx.lineWidth = 3;
    ctx.beginPath();

    let firstPoint = true;
    const step = xRange / (width * 2); // Higher resolution

    for (let x = xMin; x <= xMax; x += step) {
      const y = this.evaluateFunction(func.expression, x);
      if (y !== null && y >= yMin && y <= yMax) {
        const canvasX = toCanvasX(x);
        const canvasY = toCanvasY(y);

        if (firstPoint) {
          ctx.moveTo(canvasX, canvasY);
          firstPoint = false;
        } else {
          ctx.lineTo(canvasX, canvasY);
        }
      } else {
        firstPoint = true;
      }
    }

    ctx.stroke();
  }

  /**
   * Draws axis labels
   */
  private static drawAxisLabels(
    ctx: CanvasRenderingContext2D,
    bounds: GraphBounds,
    toCanvasX: (x: number) => number,
    toCanvasY: (y: number) => number,
    width: number,
    height: number
  ): void {
    const { xMin, xMax, yMin, yMax } = bounds;

    // Use appropriate text color based on theme
    const isDarkMode = document.documentElement.classList.contains('dark');
    ctx.fillStyle = isDarkMode ? '#ffffff' : '#000000';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';

    // X-axis labels
    for (let x = Math.ceil(xMin); x <= xMax; x++) {
      if (x !== 0) {
        const canvasX = toCanvasX(x);
        const canvasY = yMin <= 0 && yMax >= 0 ? toCanvasY(0) + 15 : height - 5;
        ctx.fillText(x.toString(), canvasX, canvasY);
      }
    }

    // Y-axis labels
    ctx.textAlign = 'left';
    for (let y = Math.ceil(yMin); y <= yMax; y++) {
      if (y !== 0) {
        const canvasX = xMin <= 0 && xMax >= 0 ? toCanvasX(0) + 5 : 5;
        const canvasY = toCanvasY(y) + 4;
        ctx.fillText(y.toString(), canvasX, canvasY);
      }
    }
  }

  /**
   * Creates a new function data object
   */
  static createFunction(
    expression: string,
    color?: string,
    visible: boolean = true
  ): FunctionData {
    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      expression,
      color: color || this.generateRandomColor(),
      visible,
    };
  }

  /**
   * Generates a random color for functions
   */
  static generateRandomColor(): string {
    const hue = Math.random() * 360;
    return `hsl(${hue}, 70%, 50%)`;
  }

  /**
   * Validates a function expression
   */
  static validateFunction(expression: string): ValidationResult {
    if (!expression.trim()) {
      return { valid: false, error: 'Function expression cannot be empty' };
    }

    // Check if expression contains the variable 'x'
    if (!expression.includes('x')) {
      return { valid: false, error: 'Function must contain variable "x"' };
    }

    return MathValidator.validateExpression(expression);
  }

  /**
   * Gets preset function examples
   */
  static getPresetFunctions(): string[] {
    return [
      'x^2',
      'sin(x)',
      'cos(x)',
      'tan(x)',
      'log(x)',
      'sqrt(x)',
      'abs(x)',
      'x^3',
      '1/x',
      'e^x',
      'x^2 + 2*x + 1',
      'sin(x) + cos(x)',
      '2*x + 3',
      'x^3 - 3*x^2 + 2*x',
      'sqrt(abs(x))',
    ];
  }

  /**
   * Calculates optimal bounds for a set of functions
   */
  static calculateOptimalBounds(
    functions: FunctionData[],
    samplePoints: number = 100
  ): GraphBounds {
    let xMin = -10,
      xMax = 10,
      yMin = -10,
      yMax = 10;

    const visibleFunctions = functions.filter(f => f.visible);
    if (visibleFunctions.length === 0) {
      return { xMin, xMax, yMin, yMax };
    }

    let allYValues: number[] = [];

    // Sample each function to find y range
    for (const func of visibleFunctions) {
      for (let i = 0; i <= samplePoints; i++) {
        const x = xMin + (i / samplePoints) * (xMax - xMin);
        const y = this.evaluateFunction(func.expression, x);
        if (y !== null && isFinite(y)) {
          allYValues.push(y);
        }
      }
    }

    if (allYValues.length > 0) {
      const minY = Math.min(...allYValues);
      const maxY = Math.max(...allYValues);
      const yPadding = (maxY - minY) * 0.1; // 10% padding

      yMin = minY - yPadding;
      yMax = maxY + yPadding;
    }

    return { xMin, xMax, yMin, yMax };
  }

  /**
   * Finds critical points of a function (approximate)
   */
  static findCriticalPoints(
    expression: string,
    bounds: GraphBounds,
    tolerance: number = 0.01
  ): Array<{ x: number; y: number; type: 'max' | 'min' | 'inflection' }> {
    const points: Array<{
      x: number;
      y: number;
      type: 'max' | 'min' | 'inflection';
    }> = [];
    const { xMin, xMax } = bounds;
    const step = (xMax - xMin) / 1000;

    for (let x = xMin + step; x < xMax - step; x += step) {
      const y1 = this.evaluateFunction(expression, x - step);
      const y2 = this.evaluateFunction(expression, x);
      const y3 = this.evaluateFunction(expression, x + step);

      if (y1 !== null && y2 !== null && y3 !== null) {
        // Check for local maximum
        if (
          y2 > y1 &&
          y2 > y3 &&
          Math.abs(y2 - y1) > tolerance &&
          Math.abs(y2 - y3) > tolerance
        ) {
          points.push({ x, y: y2, type: 'max' });
        }
        // Check for local minimum
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
}

/**
 * Convenience functions for function graphing
 */
export const functionGrapher = {
  /**
   * Evaluates a function at a point
   */
  evaluate: (expression: string, x: number): number | null => {
    return FunctionGrapher.evaluateFunction(expression, x);
  },

  /**
   * Generates points for graphing
   */
  generatePoints: (
    expression: string,
    bounds: GraphBounds,
    resolution?: number
  ) => {
    return FunctionGrapher.generateFunctionPoints(
      expression,
      bounds,
      resolution
    );
  },

  /**
   * Draws a complete graph
   */
  drawGraph: (
    canvas: HTMLCanvasElement,
    functions: FunctionData[],
    bounds: GraphBounds
  ) => {
    return FunctionGrapher.drawGraph(canvas, functions, bounds);
  },

  /**
   * Creates a new function
   */
  createFunction: (
    expression: string,
    color?: string,
    visible?: boolean
  ): FunctionData => {
    return FunctionGrapher.createFunction(expression, color, visible);
  },

  /**
   * Validates function expression
   */
  validateFunction: (expression: string): ValidationResult => {
    return FunctionGrapher.validateFunction(expression);
  },

  /**
   * Gets preset functions
   */
  getPresets: (): string[] => FunctionGrapher.getPresetFunctions(),

  /**
   * Calculates optimal viewing bounds
   */
  calculateBounds: (
    functions: FunctionData[],
    samplePoints?: number
  ): GraphBounds => {
    return FunctionGrapher.calculateOptimalBounds(functions, samplePoints);
  },

  /**
   * Finds critical points
   */
  findCriticalPoints: (
    expression: string,
    bounds: GraphBounds,
    tolerance?: number
  ) => {
    return FunctionGrapher.findCriticalPoints(expression, bounds, tolerance);
  },

  /**
   * Generates random color
   */
  randomColor: (): string => FunctionGrapher.generateRandomColor(),
};
