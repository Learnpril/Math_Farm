/**
 * Fallback math implementation for basic operations when math.js fails to load
 */

export class FallbackMath {
  /**
   * Basic expression evaluator for simple mathematical expressions
   */
  static evaluate(
    expression: string,
    scope: Record<string, number> = {}
  ): number {
    try {
      // Replace variables with their values
      let expr = expression;
      for (const [variable, value] of Object.entries(scope)) {
        expr = expr.replace(
          new RegExp(`\\b${variable}\\b`, 'g'),
          value.toString()
        );
      }

      // Replace mathematical functions with JavaScript equivalents
      expr = expr.replace(/\bsin\(/g, 'Math.sin(');
      expr = expr.replace(/\bcos\(/g, 'Math.cos(');
      expr = expr.replace(/\btan\(/g, 'Math.tan(');
      expr = expr.replace(/\bsqrt\(/g, 'Math.sqrt(');
      expr = expr.replace(/\babs\(/g, 'Math.abs(');
      expr = expr.replace(/\blog\(/g, 'Math.log(');
      expr = expr.replace(/\blog10\(/g, 'Math.log10(');
      expr = expr.replace(/\bexp\(/g, 'Math.exp(');
      expr = expr.replace(/\bpi\b/g, 'Math.PI');
      expr = expr.replace(/\be\b/g, 'Math.E');

      // Replace ^ with ** for exponentiation
      expr = expr.replace(/\^/g, '**');

      // Basic factorial implementation
      expr = expr.replace(/(\d+)!/g, (match, num) => {
        const n = parseInt(num);
        let result = 1;
        for (let i = 2; i <= n; i++) {
          result *= i;
        }
        return result.toString();
      });

      // Evaluate the expression safely
      return Function(`"use strict"; return (${expr})`)();
    } catch (error) {
      throw new Error(`Cannot evaluate expression: ${expression}`);
    }
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
    if (powerMatch) {
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
  static config(options: any): void {
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
