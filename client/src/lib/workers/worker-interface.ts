/**
 * Web Worker communication interface for math operations
 * Provides a clean API for interacting with math workers
 */

import { MathResult, GraphBounds, AngleMode } from '../math/types';

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

export interface WorkerPool {
  getWorker(): Worker | null;
  terminateAll(): void;
  isSupported(): boolean;
}

/**
 * Math Worker Manager - handles worker lifecycle and communication
 */
export class MathWorkerManager {
  private workers: Worker[] = [];
  private workerIndex = 0;
  private readonly maxWorkers = 2; // Limit concurrent workers
  private pendingOperations = new Map<
    string,
    {
      resolve: (value: any) => void;
      reject: (error: Error) => void;
      timeout: number;
      startTime: number;
      operation: string;
    }
  >();
  private performanceMetrics: Array<{
    operation: string;
    duration: number;
    success: boolean;
    timestamp: number;
  }> = [];

  constructor() {
    this.initializeWorkers();
  }

  /**
   * Check if Web Workers are supported
   */
  static isSupported(): boolean {
    return typeof Worker !== 'undefined';
  }

  /**
   * Initialize worker pool
   */
  private initializeWorkers(): void {
    if (!MathWorkerManager.isSupported()) {
      console.warn('Web Workers not supported, falling back to main thread');
      return;
    }

    try {
      for (let i = 0; i < this.maxWorkers; i++) {
        // Create worker using URL approach for better compatibility
        const workerUrl = new URL('./math-worker.ts', import.meta.url);
        const worker = new Worker(workerUrl, {
          type: 'module',
        });

        worker.onmessage = this.handleWorkerMessage.bind(this);
        worker.onerror = this.handleWorkerError.bind(this);

        this.workers.push(worker);
      }
    } catch (error) {
      console.warn('Failed to initialize workers:', error);
    }
  }

  /**
   * Handle messages from workers
   */
  private handleWorkerMessage(event: MessageEvent<WorkerResponse>): void {
    const { id, success, result, error } = event.data;
    const operation = this.pendingOperations.get(id);

    if (operation) {
      const duration = performance.now() - operation.startTime;
      clearTimeout(operation.timeout);
      this.pendingOperations.delete(id);

      // Record performance metric
      this.performanceMetrics.push({
        operation: operation.operation,
        duration,
        success,
        timestamp: Date.now(),
      });

      // Keep only recent metrics
      if (this.performanceMetrics.length > 100) {
        this.performanceMetrics.shift();
      }

      if (success) {
        operation.resolve(result);
      } else {
        operation.reject(new Error(error || 'Worker operation failed'));
      }
    }
  }

  /**
   * Handle worker errors
   */
  private handleWorkerError(error: ErrorEvent): void {
    console.error('Worker error:', error);
    // Could implement worker restart logic here
  }

  /**
   * Get next available worker
   */
  private getWorker(): Worker | null {
    if (this.workers.length === 0) {
      return null;
    }

    const worker = this.workers[this.workerIndex];
    this.workerIndex = (this.workerIndex + 1) % this.workers.length;
    return worker || null;
  }

  /**
   * Send operation to worker with timeout
   */
  private sendToWorker<T>(
    type: WorkerMessage['type'],
    payload: any,
    timeoutMs: number = 10000
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const worker = this.getWorker();

      if (!worker) {
        reject(new Error('No workers available'));
        return;
      }

      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const startTime = performance.now();

      const timeout = setTimeout(() => {
        const operation = this.pendingOperations.get(id);
        if (operation) {
          const duration = performance.now() - operation.startTime;
          this.performanceMetrics.push({
            operation: operation.operation,
            duration,
            success: false,
            timestamp: Date.now(),
          });
        }
        this.pendingOperations.delete(id);
        reject(new Error('Worker operation timed out'));
      }, timeoutMs) as unknown as number;

      this.pendingOperations.set(id, {
        resolve,
        reject,
        timeout,
        startTime,
        operation: type,
      });

      const message: WorkerMessage = { id, type, payload };
      worker.postMessage(message);
    });
  }

  /**
   * Solve equation using worker
   */
  async solveEquation(
    equation: string,
    variable: string = 'x',
    type: 'solve' | 'derivative' | 'simplify' = 'solve'
  ): Promise<MathResult> {
    try {
      const result = await this.sendToWorker<MathResult>('equation-solve', {
        equation,
        variable,
        type,
      });
      return result;
    } catch (error) {
      throw new Error(
        `Worker equation solving failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate function points using worker
   */
  async generateFunctionPoints(
    expression: string,
    bounds: GraphBounds,
    resolution: number = 1000
  ): Promise<Array<{ x: number; y: number }>> {
    try {
      const result = await this.sendToWorker<Array<{ x: number; y: number }>>(
        'function-graph',
        {
          expression,
          bounds,
          resolution,
        }
      );
      return result;
    } catch (error) {
      throw new Error(
        `Worker function graphing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Find critical points using worker
   */
  async findCriticalPoints(
    expression: string,
    bounds: GraphBounds,
    tolerance: number = 0.01
  ): Promise<
    Array<{ x: number; y: number; type: 'max' | 'min' | 'inflection' }>
  > {
    try {
      const result = await this.sendToWorker<
        Array<{ x: number; y: number; type: 'max' | 'min' | 'inflection' }>
      >('critical-points', {
        expression,
        bounds,
        tolerance,
      });
      return result;
    } catch (error) {
      throw new Error(
        `Worker critical points finding failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Evaluate calculator expression using worker
   */
  async evaluateCalculator(
    expression: string,
    angleMode: AngleMode = 'deg'
  ): Promise<{ result: string; error?: string }> {
    try {
      const result = await this.sendToWorker<{
        result: string;
        error?: string;
      }>('calculator-eval', {
        expression,
        angleMode,
      });
      return result;
    } catch (error) {
      throw new Error(
        `Worker calculator evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Terminate all workers
   */
  terminate(): void {
    // Clear pending operations
    this.pendingOperations.forEach(operation => {
      clearTimeout(operation.timeout);
      operation.reject(new Error('Worker manager terminated'));
    });
    this.pendingOperations.clear();

    // Terminate workers
    for (const worker of this.workers) {
      worker.terminate();
    }
    this.workers = [];
  }

  /**
   * Check if workers are available
   */
  isAvailable(): boolean {
    return this.workers.length > 0;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): Array<{
    operation: string;
    duration: number;
    success: boolean;
    timestamp: number;
  }> {
    return [...this.performanceMetrics];
  }

  /**
   * Clear performance metrics
   */
  clearPerformanceMetrics(): void {
    this.performanceMetrics = [];
  }
}

/**
 * Fallback implementations for when workers are not available
 */
export class FallbackMathOperations {
  /**
   * Import and use main thread implementations as fallback
   */
  static async solveEquation(
    equation: string,
    variable: string = 'x',
    type: 'solve' | 'derivative' | 'simplify' = 'solve'
  ): Promise<MathResult> {
    const { EquationSolver } = await import('../math/equation-solver');
    return EquationSolver.solve(equation, variable, type);
  }

  static async generateFunctionPoints(
    expression: string,
    bounds: GraphBounds,
    resolution: number = 1000
  ): Promise<Array<{ x: number; y: number }>> {
    const { FunctionGrapher } = await import('../math/function-grapher');
    return FunctionGrapher.generateFunctionPoints(
      expression,
      bounds,
      resolution
    );
  }

  static async findCriticalPoints(
    expression: string,
    bounds: GraphBounds,
    tolerance: number = 0.01
  ): Promise<
    Array<{ x: number; y: number; type: 'max' | 'min' | 'inflection' }>
  > {
    const { FunctionGrapher } = await import('../math/function-grapher');
    return FunctionGrapher.findCriticalPoints(expression, bounds, tolerance);
  }

  static async evaluateCalculator(
    expression: string,
    angleMode: AngleMode = 'deg'
  ): Promise<{ result: string; error?: string }> {
    const { Calculator } = await import('../math/calculator');
    const result = Calculator.evaluate(expression, angleMode);
    const returnValue: { result: string; error?: string } = {
      result: result.result.toString(),
    };
    if (result.error) {
      returnValue.error = result.error;
    }
    return returnValue;
  }
}

/**
 * Unified Math Operations API with automatic fallback
 */
export class MathOperationsAPI {
  private workerManager: MathWorkerManager | null = null;
  private useWorkers: boolean;

  constructor(useWorkers: boolean = true) {
    this.useWorkers = useWorkers && MathWorkerManager.isSupported();

    if (this.useWorkers) {
      this.workerManager = new MathWorkerManager();
    }
  }

  /**
   * Solve equation with automatic worker/fallback selection
   */
  async solveEquation(
    equation: string,
    variable: string = 'x',
    type: 'solve' | 'derivative' | 'simplify' = 'solve'
  ): Promise<MathResult> {
    if (this.useWorkers && this.workerManager?.isAvailable()) {
      try {
        return await this.workerManager.solveEquation(equation, variable, type);
      } catch (error) {
        console.warn('Worker failed, falling back to main thread:', error);
        return await FallbackMathOperations.solveEquation(
          equation,
          variable,
          type
        );
      }
    }

    return await FallbackMathOperations.solveEquation(equation, variable, type);
  }

  /**
   * Generate function points with automatic worker/fallback selection
   */
  async generateFunctionPoints(
    expression: string,
    bounds: GraphBounds,
    resolution: number = 1000
  ): Promise<Array<{ x: number; y: number }>> {
    if (this.useWorkers && this.workerManager?.isAvailable()) {
      try {
        return await this.workerManager.generateFunctionPoints(
          expression,
          bounds,
          resolution
        );
      } catch (error) {
        console.warn('Worker failed, falling back to main thread:', error);
        return await FallbackMathOperations.generateFunctionPoints(
          expression,
          bounds,
          resolution
        );
      }
    }

    return await FallbackMathOperations.generateFunctionPoints(
      expression,
      bounds,
      resolution
    );
  }

  /**
   * Find critical points with automatic worker/fallback selection
   */
  async findCriticalPoints(
    expression: string,
    bounds: GraphBounds,
    tolerance: number = 0.01
  ): Promise<
    Array<{ x: number; y: number; type: 'max' | 'min' | 'inflection' }>
  > {
    if (this.useWorkers && this.workerManager?.isAvailable()) {
      try {
        return await this.workerManager.findCriticalPoints(
          expression,
          bounds,
          tolerance
        );
      } catch (error) {
        console.warn('Worker failed, falling back to main thread:', error);
        return await FallbackMathOperations.findCriticalPoints(
          expression,
          bounds,
          tolerance
        );
      }
    }

    return await FallbackMathOperations.findCriticalPoints(
      expression,
      bounds,
      tolerance
    );
  }

  /**
   * Evaluate calculator expression with automatic worker/fallback selection
   */
  async evaluateCalculator(
    expression: string,
    angleMode: AngleMode = 'deg'
  ): Promise<{ result: string; error?: string }> {
    if (this.useWorkers && this.workerManager?.isAvailable()) {
      try {
        return await this.workerManager.evaluateCalculator(
          expression,
          angleMode
        );
      } catch (error) {
        console.warn('Worker failed, falling back to main thread:', error);
        return await FallbackMathOperations.evaluateCalculator(
          expression,
          angleMode
        );
      }
    }

    return await FallbackMathOperations.evaluateCalculator(
      expression,
      angleMode
    );
  }

  /**
   * Check if workers are being used
   */
  isUsingWorkers(): boolean {
    return this.useWorkers && (this.workerManager?.isAvailable() ?? false);
  }

  /**
   * Get performance info
   */
  getPerformanceInfo(): {
    workersSupported: boolean;
    workersEnabled: boolean;
    workersAvailable: boolean;
  } {
    return {
      workersSupported: MathWorkerManager.isSupported(),
      workersEnabled: this.useWorkers,
      workersAvailable: this.workerManager?.isAvailable() ?? false,
    };
  }

  /**
   * Cleanup resources
   */
  terminate(): void {
    if (this.workerManager) {
      this.workerManager.terminate();
      this.workerManager = null;
    }
  }
}

// Create singleton instance
export const mathOperations = new MathOperationsAPI();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    mathOperations.terminate();
  });
}
