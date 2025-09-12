/**
 * Tests for Web Worker interface
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MathWorkerManager, FallbackMathOperations } from '../worker-interface';

// Mock Worker for testing
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((error: ErrorEvent) => void) | null = null;

  constructor(
    public url: string | URL,
    public options?: WorkerOptions
  ) {}

  postMessage(message: any) {
    // Simulate async worker response
    setTimeout(() => {
      if (this.onmessage) {
        const response = {
          data: {
            id: message.id,
            success: true,
            result: this.mockResponse(message),
          },
        };
        this.onmessage(response as MessageEvent);
      }
    }, 10);
  }

  terminate() {
    // Mock terminate
  }

  private mockResponse(message: any) {
    switch (message.type) {
      case 'equation-solve':
        return {
          result: 'x = 2, x = -2',
          steps: [
            'Step 1: Identify quadratic equation',
            'Step 2: Apply quadratic formula',
          ],
          metadata: { roots: [2, -2] },
        };
      case 'function-graph':
        return [
          { x: -1, y: 1 },
          { x: 0, y: 0 },
          { x: 1, y: 1 },
        ];
      case 'calculator-eval':
        return { result: '4', error: undefined };
      case 'critical-points':
        return [{ x: 0, y: 0, type: 'min' }];
      default:
        return null;
    }
  }
}

// Mock global Worker
const originalWorker = global.Worker;

describe('MathWorkerManager', () => {
  beforeEach(() => {
    // @ts-ignore
    global.Worker = MockWorker;
  });

  afterEach(() => {
    global.Worker = originalWorker;
  });

  it('should detect Web Worker support', () => {
    expect(MathWorkerManager.isSupported()).toBe(true);
  });

  it('should solve equations using worker', async () => {
    const manager = new MathWorkerManager();

    const result = await manager.solveEquation('x^2 - 4', 'x', 'solve');

    expect(result.result).toBe('x = 2, x = -2');
    expect(result.steps).toHaveLength(2);
    expect(result.metadata?.roots).toEqual([2, -2]);

    manager.terminate();
  });

  it('should generate function points using worker', async () => {
    const manager = new MathWorkerManager();

    const bounds = { xMin: -10, xMax: 10, yMin: -10, yMax: 10 };
    const points = await manager.generateFunctionPoints('x^2', bounds, 100);

    expect(Array.isArray(points)).toBe(true);
    expect(points.length).toBeGreaterThan(0);
    expect(points[0]).toHaveProperty('x');
    expect(points[0]).toHaveProperty('y');

    manager.terminate();
  });

  it('should evaluate calculator expressions using worker', async () => {
    const manager = new MathWorkerManager();

    const result = await manager.evaluateCalculator('2 + 2', 'deg');

    expect(result.result).toBe('4');
    expect(result.error).toBeUndefined();

    manager.terminate();
  });

  it('should find critical points using worker', async () => {
    const manager = new MathWorkerManager();

    const bounds = { xMin: -5, xMax: 5, yMin: -5, yMax: 5 };
    const points = await manager.findCriticalPoints('x^2', bounds, 0.01);

    expect(Array.isArray(points)).toBe(true);
    expect(points.length).toBeGreaterThan(0);
    expect(points[0]).toHaveProperty('type');

    manager.terminate();
  });

  it('should handle worker timeout', async () => {
    const manager = new MathWorkerManager();

    // Mock a worker that never responds
    const slowWorker = new MockWorker('test');
    slowWorker.postMessage = () => {}; // Never responds

    // Override getWorker to return slow worker
    // @ts-ignore
    manager['getWorker'] = () => slowWorker;

    await expect(
      manager.solveEquation('x^2 - 4', 'x', 'solve')
    ).rejects.toThrow('Worker operation timed out');

    manager.terminate();
  }, 15000); // Increase timeout for this test
});

describe('FallbackMathOperations', () => {
  it('should solve equations using fallback', async () => {
    const result = await FallbackMathOperations.solveEquation(
      'x^2 - 4',
      'x',
      'solve'
    );

    expect(result).toHaveProperty('result');
    expect(result).toHaveProperty('steps');
  });

  it('should generate function points using fallback', async () => {
    const bounds = { xMin: -2, xMax: 2, yMin: -2, yMax: 2 };
    const points = await FallbackMathOperations.generateFunctionPoints(
      'x^2',
      bounds,
      10
    );

    expect(Array.isArray(points)).toBe(true);
    expect(points.length).toBeGreaterThan(0);
  });

  it('should evaluate calculator expressions using fallback', async () => {
    const result = await FallbackMathOperations.evaluateCalculator(
      '2 + 2',
      'deg'
    );

    expect(result).toHaveProperty('result');
    expect(result.result).toBe('4');
  });

  it('should find critical points using fallback', async () => {
    const bounds = { xMin: -2, xMax: 2, yMin: -2, yMax: 2 };
    const points = await FallbackMathOperations.findCriticalPoints(
      'x^2',
      bounds,
      0.01
    );

    expect(Array.isArray(points)).toBe(true);
  });
});

describe('Worker vs Fallback Integration', () => {
  beforeEach(() => {
    // @ts-ignore
    global.Worker = MockWorker;
  });

  afterEach(() => {
    global.Worker = originalWorker;
  });

  it('should use workers when available', () => {
    const manager = new MathWorkerManager();
    expect(manager.isAvailable()).toBe(true);
    manager.terminate();
  });

  it('should gracefully handle worker unavailability', () => {
    // @ts-ignore
    global.Worker = undefined;

    expect(MathWorkerManager.isSupported()).toBe(false);
  });
});
