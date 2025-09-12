/**
 * TypeScript declarations for nerdamer library
 * Custom declarations since @types/nerdamer doesn't exist
 */

declare module 'nerdamer' {
  interface NerdamerExpression {
    toString(): string;
    text(): string;
    evaluate(): NerdamerExpression;
    expand(): NerdamerExpression;
    factor(): NerdamerExpression;
    simplify(): NerdamerExpression;
    diff(variable?: string): NerdamerExpression;
    integrate(variable?: string): NerdamerExpression;
    solve(variable?: string): NerdamerExpression[];
    sub(variable: string, value: string | number): NerdamerExpression;
    valueOf(): number;
  }

  interface NerdamerStatic {
    (
      expression: string,
      substitutions?: Record<string, string | number>
    ): NerdamerExpression;
    solve(equation: string, variable?: string): NerdamerExpression[];
    diff(expression: string, variable?: string): NerdamerExpression;
    integrate(expression: string, variable?: string): NerdamerExpression;
    expand(expression: string): NerdamerExpression;
    factor(expression: string): NerdamerExpression;
    simplify(expression: string): NerdamerExpression;
    set(setting: string, value: any): void;
    get(setting: string): any;
    clearVars(): void;
    setVar(variable: string, value: string | number): void;
    getVars(): Record<string, any>;
  }

  const nerdamer: NerdamerStatic;
  export = nerdamer;
}

declare global {
  interface Window {
    nerdamer?: any;
  }
}
