/**
 * Fallback math implementation for basic operations when math.js fails to load
 * Enhanced with security validation
 */

export class FallbackMath {
  /**
   * Basic expression evaluator for simple mathematical expressions with security validation
   */
  static evaluate(
    expression: string,
    scope: Record<string, number> = {}
  ): number {
    try {
      // Basic security validation (inline to avoid circular dependency)
      if (!expression || typeof expression !== 'string') {
        throw new Error('Expression must be a non-empty string');
      }

      // Check for dangerous patterns
      const dangerousPatterns = [
        /eval\s*\(/i,
        /function\s*\(/i,
        /constructor/i,
        /prototype/i,
        /__proto__/i,
        /import\s*\(/i,
        /require\s*\(/i,
        /process\./i,
        /global\./i,
        /window\./i,
        /document\./i,
        /alert\s*\(/i,
        /console\./i,
        /setTimeout/i,
        /setInterval/i,
        /script\s*>/i,
        /<\s*script/i,
        /javascript\s*:/i,
        /[;&|`${}\\]/,
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(expression)) {
          throw new Error('Expression contains potentially dangerous code');
        }
      }

      // Use the expression after basic validation
      let expr = expression.trim();

      // Validate scope variables
      for (const [variable, value] of Object.entries(scope)) {
        if (typeof value !== 'number' || !isFinite(value)) {
          throw new Error(
            `Invalid scope variable '${variable}': must be a finite number`
          );
        }

        // Validate variable name
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(variable)) {
          throw new Error(
            `Invalid variable name '${variable}': must be a valid identifier`
          );
        }
      }

      // Replace variables with their values (with validation)
      for (const [variable, value] of Object.entries(scope)) {
        const safeValue = this.sanitizeNumber(value);
        expr = expr.replace(
          new RegExp(`\\b${variable}\\b`, 'g'),
          safeValue.toString()
        );
      }

      // Replace mathematical functions with JavaScript equivalents (whitelist approach)
      const functionReplacements: Record<string, string> = {
        'sin(': 'Math.sin(',
        'cos(': 'Math.cos(',
        'tan(': 'Math.tan(',
        'asin(': 'Math.asin(',
        'acos(': 'Math.acos(',
        'atan(': 'Math.atan(',
        'sinh(': 'Math.sinh(',
        'cosh(': 'Math.cosh(',
        'tanh(': 'Math.tanh(',
        'sqrt(': 'Math.sqrt(',
        'cbrt(': 'Math.cbrt(',
        'abs(': 'Math.abs(',
        'log(': 'Math.log(',
        'log10(': 'Math.log10(',
        'log2(': 'Math.log2(',
        'exp(': 'Math.exp(',
        'ceil(': 'Math.ceil(',
        'floor(': 'Math.floor(',
        'round(': 'Math.round(',
        'max(': 'Math.max(',
        'min(': 'Math.min(',
        'pow(': 'Math.pow(',
        'sign(': 'Math.sign(',
      };

      for (const [mathFunc, jsFunc] of Object.entries(functionReplacements)) {
        expr = expr.replace(new RegExp(`\\b${mathFunc}`, 'g'), jsFunc);
      }

      // Replace constants
      expr = expr.replace(/\bpi\b/g, 'Math.PI');
      expr = expr.replace(/\be\b/g, 'Math.E');

      // Replace ^ with ** for exponentiation (with validation)
      expr = expr.replace(/\^/g, '**');

      // Basic factorial implementation (with limits for security)
      expr = expr.replace(/(\d+)!/g, (_, num) => {
        const n = parseInt(num);
        if (n < 0) {
          throw new Error('Factorial of negative number is undefined');
        }
        if (n > 170) {
          throw new Error('Factorial too large (would cause overflow)');
        }

        let result = 1;
        for (let i = 2; i <= n; i++) {
          result *= i;
        }
        return result.toString();
      });

      // Validate the final expression before evaluation
      if (this.containsUnsafePatterns(expr)) {
        throw new Error('Expression contains unsafe patterns after processing');
      }

      // Evaluate the expression safely with restricted context
      const result = this.safeEvaluate(expr);

      // Validate the result
      if (!isFinite(result)) {
        throw new Error('Result is not a finite number');
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Cannot evaluate expression: ${errorMessage}`);
    }
  }

  /**
   * Safe evaluation with restricted context
   */
  private static safeEvaluate(expr: string): number {
    // Create a restricted context for evaluation
    const safeContext = {
      Math: Math,
      Infinity: Infinity,
      NaN: NaN,
    };

    // Use Function constructor with restricted context
    const func = new Function(
      'Math',
      'Infinity',
      'NaN',
      `"use strict"; return (${expr});`
    );

    return func(safeContext.Math, safeContext.Infinity, safeContext.NaN);
  }

  /**
   * Check for unsafe patterns in processed expression
   */
  private static containsUnsafePatterns(expr: string): boolean {
    const unsafePatterns = [
      /\b(constructor|prototype|__proto__|eval|Function|Object|Array|String|Number|Boolean|Date|RegExp|Error)\b/i,
      /\[\s*["'`]/, // Property access with strings
      /\.\s*constructor/i,
      /\.\s*prototype/i,
      /\.\s*__proto__/i,
      /this\s*\./,
      /window\s*\./,
      /global\s*\./,
      /process\s*\./,
      /require\s*\(/,
      /import\s*\(/,
    ];

    return unsafePatterns.some(pattern => pattern.test(expr));
  }

  /**
   * Sanitize number values to prevent injection
   */
  private static sanitizeNumber(value: number): number {
    if (!isFinite(value)) {
      throw new Error('Number must be finite');
    }

    // Prevent extremely large numbers that could cause issues
    if (Math.abs(value) > Number.MAX_SAFE_INTEGER) {
      throw new Error('Number too large for safe computation');
    }

    return value;
  }

  /**
   * Basic parsing - just returns the expression as a string
   */
  static parse(expression: string): { toString: () => string } {
    return {
      toString: () => expression,
    };
  }

  /**
   * Basic derivative calculation for simple polynomial expressions
   */
  static derivative(
    expr: { toString: () => string },
    variable: string
  ): { toString: () => string } {
    const expression = expr.toString();

    // Handle x^n terms
    const powerMatch = expression.match(
      new RegExp(`(\\d*)\\*?${variable}\\^(\\d+)`)
    );
    if (powerMatch && powerMatch[2]) {
      const coeff = powerMatch[1] ? parseInt(powerMatch[1]) : 1;
      const power = parseInt(powerMatch[2]);
      const newCoeff = coeff * power;
      const newPower = power - 1;

      if (newPower === 0) {
        return { toString: () => newCoeff.toString() };
      } else if (newPower === 1) {
        return {
          toString: () =>
            newCoeff === 1 ? variable : `${newCoeff}*${variable}`,
        };
      } else {
        return {
          toString: () =>
            newCoeff === 1
              ? `${variable}^${newPower}`
              : `${newCoeff}*${variable}^${newPower}`,
        };
      }
    }

    // Handle linear terms
    if (expression === variable) {
      return { toString: () => '1' };
    }

    // Handle constants
    if (!expression.includes(variable)) {
      return { toString: () => '0' };
    }

    // Fallback
    return { toString: () => `d/d${variable}[${expression}]` };
  }

  /**
   * Basic simplification - just returns the expression as-is
   */
  static simplify(expr: { toString: () => string }): {
    toString: () => string;
  } {
    return expr;
  }

  /**
   * Create a configured instance (just returns this class)
   */
  static create(): typeof FallbackMath {
    return FallbackMath;
  }

  /**
   * Config method (no-op for fallback)
   */
  static config(_options: any): void {
    // No-op for fallback implementation
  }
}

/**
 * Creates a fallback math instance that mimics math.js API
 */
export const createFallbackMath = () => {
  return {
    evaluate: FallbackMath.evaluate,
    parse: FallbackMath.parse,
    derivative: FallbackMath.derivative,
    simplify: FallbackMath.simplify,
    create: FallbackMath.create,
    config: FallbackMath.config,
  };
};
