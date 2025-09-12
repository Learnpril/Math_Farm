// Math operation types and interfaces

export interface MathResult {
  result: string | number;
  steps?: string[];
  error?: string;
  metadata?: Record<string, any>;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: string;
}

export interface CalculationHistory {
  expression: string;
  result: string;
  timestamp: number;
}

export interface SolutionStep {
  step: string;
  explanation: string;
  result: string;
  latex?: string;
}

export interface FunctionData {
  id: string;
  expression: string;
  color: string;
  visible: boolean;
}

export interface GraphBounds {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface MathContext {
  operation: string;
  input: string;
  timestamp: Date;
  userAgent?: string;
}

export type AngleMode = 'deg' | 'rad';
export type SolverType = 'solve' | 'derivative' | 'simplify';

// Math.js global type declaration
declare global {
  interface Window {
    math?: any;
  }
}
