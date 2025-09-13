import { FunctionData, GraphBounds, ValidationResult } from './types';
import { MathValidator } from './validation';
import { getMathInstance } from './math-loader';
import { createFallbackMath } from './fallback-math';

/**
 * Pure function graphing utilities extracted from FunctionGrapherDemo.
 * Provides comprehensive function evaluation, graph generation, and visualization
 * capabilities with support for multiple functions, custom bounds, and critical point analysis.
 *
 * @example
 * ```typescript
 * const points = FunctionGrapher.generateFunctionPoints('x^2', { xMin: -5, xMax: 5, yMin: -1, yMax: 25 });
 * const criticalPoints = FunctionGrapher.findCriticalPoints('x^3 - 3*x', bounds);
 * ```
 */
export class FunctionGrapher {
  /**
   * Evaluates a mathematical function at a given x value with error handling.
   * Validates the expression and safely evaluates it using math.js,
   * returning null for invalid or undefined results.
   *
   * @param expression - The mathematical function expression (must contain variable 'x')
   * @param x - The x-value at which to evaluate the function
   * @returns The function value at x, or null if evaluation fails or result is invalid
   *
   * @example
   * ```typescript
   * FunctionGrapher.evaluateFunction('x^2', 3); // 9
   * FunctionGrapher.evaluateFunction('sin(x)', Math.PI/2); // 1
   * FunctionGrapher.evaluateFunction('1/x', 0); // null (division by zero)
   * ```
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
   * Generates function data points for graphing within specified bounds.
   * Creates an array of coordinate points by evaluating the function
   * at regular intervals across the specified x-range.
   *
   * @param expression - The mathematical function expression to graph
   * @param bounds - The graphing bounds (xMin, xMax, yMin, yMax)
   * @param resolution - Number of points to generate (default: 1000)
   * @returns Array of {x, y} coordinate points for the function
   *
   * @example
   * ```typescript
   * const bounds = { xMin: -5, xMax: 5, yMin: -10, yMax: 10 };
   * const points = FunctionGrapher.generateFunctionPoints('x^2', bounds, 500);
   * // Returns 500 points from x=-5 to x=5
   * ```
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
   * Draws a complete function graph on an HTML5 canvas element.
   * Renders multiple functions with grid, axes, labels, and proper scaling
   * within the specified bounds with theme-aware styling.
   *
   * @param canvas - The HTML5 canvas element to draw on
   * @param functions - Array of function data objects to render
   * @param bounds - The viewing bounds for the graph
   *
   * @example
   * ```typescript
   * const canvas = document.getElementById('graph') as HTMLCanvasElement;
   * const functions = [
   *   { id: '1', expression: 'x^2', color: 'blue', visible: true },
   *   { id: '2', expression: 'sin(x)', color: 'red', visible: true }
   * ];
   * FunctionGrapher.drawGraph(canvas, functions, bounds);
   * ```
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
   * Draws the coordinate grid on the canvas.
   * Creates vertical and horizontal grid lines at integer coordinates
   * to provide visual reference for the graph.
   *
   * @param ctx - The 2D rendering context of the canvas
   * @param bounds - The viewing bounds for the graph
   * @param width - Canvas width in pixels
   * @param height - Canvas height in pixels
   * @param toCanvasX - Function to convert graph x-coordinates to canvas coordinates
   * @param toCanvasY - Function to convert graph y-coordinates to canvas coordinates
   *
   * @private
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
   * Draws the coordinate axes (x-axis and y-axis) on the canvas.
   * Only draws axes that are visible within the current viewing bounds.
   *
   * @param ctx - The 2D rendering context of the canvas
   * @param bounds - The viewing bounds for the graph
   * @param width - Canvas width in pixels
   * @param height - Canvas height in pixels
   * @param toCanvasX - Function to convert graph x-coordinates to canvas coordinates
   * @param toCanvasY - Function to convert graph y-coordinates to canvas coordinates
   *
   * @private
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
   * Draws a single function curve on the canvas.
   * Evaluates the function at high resolution and connects points
   * with smooth curves, handling discontinuities appropriately.
   *
   * @param ctx - The 2D rendering context of the canvas
   * @param func - The function data object containing expression and styling
   * @param bounds - The viewing bounds for the graph
   * @param width - Canvas width in pixels
   * @param toCanvasX - Function to convert graph x-coordinates to canvas coordinates
   * @param toCanvasY - Function to convert graph y-coordinates to canvas coordinates
   *
   * @private
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
   * Draws numeric labels on the coordinate axes.
   * Places labels at integer coordinates with theme-aware text color
   * and proper positioning relative to the axes.
   *
   * @param ctx - The 2D rendering context of the canvas
   * @param bounds - The viewing bounds for the graph
   * @param toCanvasX - Function to convert graph x-coordinates to canvas coordinates
   * @param toCanvasY - Function to convert graph y-coordinates to canvas coordinates
   * @param width - Canvas width in pixels
   * @param height - Canvas height in pixels
   *
   * @private
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
   * Creates a new function data object with unique ID and styling.
   * Generates a function object suitable for use in the graphing system
   * with automatic color assignment if not specified.
   *
   * @param expression - The mathematical function expression
   * @param color - Optional color for the function curve (auto-generated if not provided)
   * @param visible - Whether the function should be visible initially (default: true)
   * @returns FunctionData object with unique ID and specified properties
   *
   * @example
   * ```typescript
   * const func1 = FunctionGrapher.createFunction('x^2', 'blue');
   * const func2 = FunctionGrapher.createFunction('sin(x)'); // Auto-generated color
   * ```
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
   * Generates a random HSL color for function curves.
   * Creates visually distinct colors with consistent saturation and lightness
   * for optimal visibility on both light and dark themes.
   *
   * @returns HSL color string in format "hsl(hue, 70%, 50%)"
   */
  static generateRandomColor(): string {
    const hue = Math.random() * 360;
    return `hsl(${hue}, 70%, 50%)`;
  }

  /**
   * Validates a function expression for graphing suitability.
   * Checks that the expression is non-empty, contains the variable 'x',
   * and passes general mathematical expression validation.
   *
   * @param expression - The function expression to validate
   * @returns ValidationResult indicating if the expression is valid for graphing
   *
   * @example
   * ```typescript
   * FunctionGrapher.validateFunction('x^2'); // { valid: true }
   * FunctionGrapher.validateFunction('2 + 3'); // { valid: false, error: 'Function must contain variable "x"' }
   * ```
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
   * Gets preset function examples for demonstration and testing.
   * Provides a variety of mathematical functions showcasing different
   * types of curves and mathematical concepts.
   *
   * @returns Array of example function expressions
   *
   * @example
   * ```typescript
   * const presets = FunctionGrapher.getPresetFunctions();
   * console.log(presets[0]); // "x^2"
   * ```
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
   * Calculates optimal viewing bounds for a set of functions.
   * Analyzes function behavior by sampling points and determines
   * appropriate y-range with padding for optimal visualization.
   *
   * @param functions - Array of function data objects to analyze
   * @param samplePoints - Number of sample points to use for analysis (default: 100)
   * @returns GraphBounds object with optimal xMin, xMax, yMin, yMax values
   *
   * @example
   * ```typescript
   * const functions = [FunctionGrapher.createFunction('x^2')];
   * const bounds = FunctionGrapher.calculateOptimalBounds(functions);
   * // Returns bounds that nicely frame the parabola
   * ```
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
   * Finds critical points of a function using numerical approximation.
   * Identifies local maxima, minima, and inflection points by analyzing
   * function behavior at sample points within the specified bounds.
   *
   * @param expression - The function expression to analyze
   * @param bounds - The bounds within which to search for critical points
   * @param tolerance - Minimum difference threshold for identifying critical points (default: 0.01)
   * @returns Array of critical point objects with coordinates and type classification
   *
   * @example
   * ```typescript
   * const bounds = { xMin: -5, xMax: 5, yMin: -10, yMax: 10 };
   * const critical = FunctionGrapher.findCriticalPoints('x^3 - 3*x', bounds);
   * // Returns points like [{ x: -1, y: 2, type: 'max' }, { x: 1, y: -2, type: 'min' }]
   * ```
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
 * Convenience functions for function graphing operations.
 * Provides a simplified API for common function graphing tasks
 * with direct access to FunctionGrapher class methods.
 *
 * @example
 * ```typescript
 * import { functionGrapher } from './function-grapher';
 *
 * const points = functionGrapher.generatePoints('x^2', bounds);
 * const func = functionGrapher.createFunction('sin(x)', 'red');
 * functionGrapher.drawGraph(canvas, [func], bounds);
 * ```
 */
export const functionGrapher = {
  /**
   * Evaluates a mathematical function at a specific x-value.
   *
   * @param expression - The function expression to evaluate
   * @param x - The x-value at which to evaluate the function
   * @returns The function value at x, or null if evaluation fails
   */
  evaluate: (expression: string, x: number): number | null => {
    return FunctionGrapher.evaluateFunction(expression, x);
  },

  /**
   * Generates coordinate points for graphing a function.
   *
   * @param expression - The function expression to graph
   * @param bounds - The viewing bounds for point generation
   * @param resolution - Number of points to generate (optional)
   * @returns Array of {x, y} coordinate points
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
   * Draws a complete function graph on a canvas element.
   *
   * @param canvas - The HTML5 canvas element to draw on
   * @param functions - Array of function data objects to render
   * @param bounds - The viewing bounds for the graph
   */
  drawGraph: (
    canvas: HTMLCanvasElement,
    functions: FunctionData[],
    bounds: GraphBounds
  ) => {
    return FunctionGrapher.drawGraph(canvas, functions, bounds);
  },

  /**
   * Creates a new function data object with styling.
   *
   * @param expression - The mathematical function expression
   * @param color - Optional color for the function curve
   * @param visible - Whether the function should be visible initially
   * @returns FunctionData object ready for graphing
   */
  createFunction: (
    expression: string,
    color?: string,
    visible?: boolean
  ): FunctionData => {
    return FunctionGrapher.createFunction(expression, color, visible);
  },

  /**
   * Validates a function expression for graphing suitability.
   *
   * @param expression - The function expression to validate
   * @returns ValidationResult indicating if expression is valid
   */
  validateFunction: (expression: string): ValidationResult => {
    return FunctionGrapher.validateFunction(expression);
  },

  /**
   * Gets preset function examples for demonstration.
   *
   * @returns Array of example function expressions
   */
  getPresets: (): string[] => FunctionGrapher.getPresetFunctions(),

  /**
   * Calculates optimal viewing bounds for a set of functions.
   *
   * @param functions - Array of function data objects to analyze
   * @param samplePoints - Number of sample points for analysis (optional)
   * @returns GraphBounds with optimal viewing area
   */
  calculateBounds: (
    functions: FunctionData[],
    samplePoints?: number
  ): GraphBounds => {
    return FunctionGrapher.calculateOptimalBounds(functions, samplePoints);
  },

  /**
   * Finds critical points (maxima, minima) of a function.
   *
   * @param expression - The function expression to analyze
   * @param bounds - The bounds within which to search
   * @param tolerance - Minimum difference threshold for critical points
   * @returns Array of critical point objects with coordinates and types
   */
  findCriticalPoints: (
    expression: string,
    bounds: GraphBounds,
    tolerance?: number
  ) => {
    return FunctionGrapher.findCriticalPoints(expression, bounds, tolerance);
  },

  /**
   * Generates a random HSL color for function curves.
   *
   * @returns Random HSL color string
   */
  randomColor: (): string => FunctionGrapher.generateRandomColor(),
};
