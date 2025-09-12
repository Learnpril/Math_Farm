/**
 * React hook for using Web Workers in math operations
 * Provides easy integration with React components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  MathOperationsAPI,
  mathOperations,
} from '../lib/workers/worker-interface';
import { MathResult, GraphBounds, AngleMode } from '../lib/math/types';
import { mathErrorHandler } from '../lib/math/error-handler';
import { errorLogger } from '../lib/errorLogging';

export interface MathWorkerState {
  isLoading: boolean;
  error: string | null;
  isWorkerSupported: boolean;
  isUsingWorkers: boolean;
}

export interface MathWorkerOperations {
  solveEquation: (
    equation: string,
    variable?: string,
    type?: 'solve' | 'derivative' | 'simplify'
  ) => Promise<MathResult>;
  generateFunctionPoints: (
    expression: string,
    bounds: GraphBounds,
    resolution?: number
  ) => Promise<Array<{ x: number; y: number }>>;
  findCriticalPoints: (
    expression: string,
    bounds: GraphBounds,
    tolerance?: number
  ) => Promise<
    Array<{ x: number; y: number; type: 'max' | 'min' | 'inflection' }>
  >;
  evaluateCalculator: (
    expression: string,
    angleMode?: AngleMode
  ) => Promise<{ result: string; error?: string }>;
}

/**
 * Hook for math worker operations
 */
export function useMathWorker(): MathWorkerState & MathWorkerOperations {
  const [state, setState] = useState<MathWorkerState>({
    isLoading: false,
    error: null,
    isWorkerSupported: false,
    isUsingWorkers: false,
  });

  const operationCountRef = useRef(0);

  // Initialize worker state
  useEffect(() => {
    const performanceInfo = mathOperations.getPerformanceInfo();
    setState(prev => ({
      ...prev,
      isWorkerSupported: performanceInfo.workersSupported,
      isUsingWorkers: performanceInfo.workersAvailable,
    }));
  }, []);

  // Generic operation wrapper
  const executeOperation = useCallback(
    async <T>(
      operation: () => Promise<T>,
      operationName: string
    ): Promise<T> => {
      const operationId = ++operationCountRef.current;

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await operation();

        // Only update state if this is still the latest operation
        if (operationId === operationCountRef.current) {
          setState(prev => ({ ...prev, isLoading: false }));
        }

        return result;
      } catch (error) {
        // Only update state if this is still the latest operation
        if (operationId === operationCountRef.current) {
          const errorObj =
            error instanceof Error
              ? error
              : new Error(`${operationName} failed`);

          // Enhanced error handling for worker operations
          const errorResult = mathErrorHandler.handleWorker(
            'math-worker',
            operationName,
            errorObj
          );

          setState(prev => ({
            ...prev,
            isLoading: false,
            error: errorResult.error || errorObj.message,
          }));
        }
        throw error;
      }
    },
    []
  );

  // Equation solving
  const solveEquation = useCallback(
    async (
      equation: string,
      variable: string = 'x',
      type: 'solve' | 'derivative' | 'simplify' = 'solve'
    ): Promise<MathResult> => {
      return executeOperation(
        () => mathOperations.solveEquation(equation, variable, type),
        'Equation solving'
      );
    },
    [executeOperation]
  );

  // Function point generation
  const generateFunctionPoints = useCallback(
    async (
      expression: string,
      bounds: GraphBounds,
      resolution: number = 1000
    ): Promise<Array<{ x: number; y: number }>> => {
      return executeOperation(
        () =>
          mathOperations.generateFunctionPoints(expression, bounds, resolution),
        'Function point generation'
      );
    },
    [executeOperation]
  );

  // Critical points finding
  const findCriticalPoints = useCallback(
    async (
      expression: string,
      bounds: GraphBounds,
      tolerance: number = 0.01
    ): Promise<
      Array<{ x: number; y: number; type: 'max' | 'min' | 'inflection' }>
    > => {
      return executeOperation(
        () => mathOperations.findCriticalPoints(expression, bounds, tolerance),
        'Critical points finding'
      );
    },
    [executeOperation]
  );

  // Calculator evaluation
  const evaluateCalculator = useCallback(
    async (
      expression: string,
      angleMode: AngleMode = 'deg'
    ): Promise<{ result: string; error?: string }> => {
      return executeOperation(
        () => mathOperations.evaluateCalculator(expression, angleMode),
        'Calculator evaluation'
      );
    },
    [executeOperation]
  );

  return {
    ...state,
    solveEquation,
    generateFunctionPoints,
    findCriticalPoints,
    evaluateCalculator,
  };
}

/**
 * Hook for equation solving specifically
 */
export function useEquationSolver() {
  const { solveEquation, isLoading, error, isUsingWorkers } = useMathWorker();

  const [lastResult, setLastResult] = useState<MathResult | null>(null);

  const solve = useCallback(
    async (
      equation: string,
      variable?: string,
      type?: 'solve' | 'derivative' | 'simplify'
    ) => {
      try {
        const result = await solveEquation(equation, variable, type);
        setLastResult(result);
        return result;
      } catch (error) {
        setLastResult(null);
        throw error;
      }
    },
    [solveEquation]
  );

  return {
    solve,
    lastResult,
    isLoading,
    error,
    isUsingWorkers,
  };
}

/**
 * Hook for function graphing specifically
 */
export function useFunctionGrapher() {
  const {
    generateFunctionPoints,
    findCriticalPoints,
    isLoading,
    error,
    isUsingWorkers,
  } = useMathWorker();

  const [lastPoints, setLastPoints] = useState<Array<{ x: number; y: number }>>(
    []
  );
  const [lastCriticalPoints, setLastCriticalPoints] = useState<
    Array<{
      x: number;
      y: number;
      type: 'max' | 'min' | 'inflection';
    }>
  >([]);

  const generatePoints = useCallback(
    async (expression: string, bounds: GraphBounds, resolution?: number) => {
      try {
        const points = await generateFunctionPoints(
          expression,
          bounds,
          resolution
        );
        setLastPoints(points);
        return points;
      } catch (error) {
        setLastPoints([]);
        throw error;
      }
    },
    [generateFunctionPoints]
  );

  const findCritical = useCallback(
    async (expression: string, bounds: GraphBounds, tolerance?: number) => {
      try {
        const points = await findCriticalPoints(expression, bounds, tolerance);
        setLastCriticalPoints(points);
        return points;
      } catch (error) {
        setLastCriticalPoints([]);
        throw error;
      }
    },
    [findCriticalPoints]
  );

  return {
    generatePoints,
    findCritical,
    lastPoints,
    lastCriticalPoints,
    isLoading,
    error,
    isUsingWorkers,
  };
}

/**
 * Hook for calculator operations specifically
 */
export function useCalculatorWorker() {
  const { evaluateCalculator, isLoading, error, isUsingWorkers } =
    useMathWorker();

  const [lastResult, setLastResult] = useState<string>('');

  const evaluate = useCallback(
    async (expression: string, angleMode?: AngleMode) => {
      try {
        const result = await evaluateCalculator(expression, angleMode);
        if (!result.error) {
          setLastResult(result.result);
        }
        return result;
      } catch (error) {
        setLastResult('');
        throw error;
      }
    },
    [evaluateCalculator]
  );

  return {
    evaluate,
    lastResult,
    isLoading,
    error,
    isUsingWorkers,
  };
}

/**
 * Hook for performance monitoring
 */
export function useMathWorkerPerformance() {
  const [performanceInfo, setPerformanceInfo] = useState({
    workersSupported: false,
    workersEnabled: false,
    workersAvailable: false,
  });

  useEffect(() => {
    const updatePerformanceInfo = () => {
      setPerformanceInfo(mathOperations.getPerformanceInfo());
    };

    updatePerformanceInfo();

    // Update periodically to catch worker state changes
    const interval = setInterval(updatePerformanceInfo, 5000);

    return () => clearInterval(interval);
  }, []);

  return performanceInfo;
}
