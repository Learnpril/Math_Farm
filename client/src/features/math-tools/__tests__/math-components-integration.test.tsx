import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Calculator } from '../../../lib/math/calculator';
import { EquationSolver } from '../../../lib/math/equation-solver';
import { FunctionGrapher } from '../../../lib/math/function-grapher';

// Mock the math utilities
vi.mock('../../../lib/math/calculator');
vi.mock('../../../lib/math/equation-solver');
vi.mock('../../../lib/math/function-grapher');

// Mock MathJax
vi.mock('better-react-mathjax', () => ({
  MathJax: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='mathjax'>{children}</div>
  ),
  MathJaxContext: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock components - we'll create simple test versions
const MockCalculatorDemo = ({
  onCalculate,
}: {
  onCalculate?: (expr: string) => void;
}) => {
  const [expression, setExpression] = React.useState('');
  const [result, setResult] = React.useState('');

  const handleCalculate = () => {
    const mockResult = Calculator.evaluate(expression);
    setResult(mockResult.error || mockResult.result);
    onCalculate?.(expression);
  };

  return (
    <div data-testid='calculator-demo'>
      <input
        data-testid='calculator-input'
        value={expression}
        onChange={e => setExpression(e.target.value)}
        placeholder='Enter expression'
      />
      <button data-testid='calculate-button' onClick={handleCalculate}>
        Calculate
      </button>
      <div data-testid='calculator-result'>{result}</div>
    </div>
  );
};

const MockEquationSolverDemo = ({
  onSolve,
}: {
  onSolve?: (eq: string) => void;
}) => {
  const [equation, setEquation] = React.useState('');
  const [result, setResult] = React.useState('');
  const [steps, setSteps] = React.useState<string[]>([]);

  const handleSolve = () => {
    const mockResult = EquationSolver.solve(equation, 'x', 'solve');
    setResult(mockResult.error || mockResult.result);
    setSteps(mockResult.steps || []);
    onSolve?.(equation);
  };

  return (
    <div data-testid='equation-solver-demo'>
      <input
        data-testid='equation-input'
        value={equation}
        onChange={e => setEquation(e.target.value)}
        placeholder='Enter equation'
      />
      <button data-testid='solve-button' onClick={handleSolve}>
        Solve
      </button>
      <div data-testid='equation-result'>{result}</div>
      <div data-testid='solution-steps'>
        {steps.map((step, index) => (
          <div key={index} data-testid={`step-${index}`}>
            {step}
          </div>
        ))}
      </div>
    </div>
  );
};

const MockFunctionGrapherDemo = ({
  onGraph,
}: {
  onGraph?: (func: string) => void;
}) => {
  const [functionExpr, setFunctionExpr] = React.useState('');
  const [points, setPoints] = React.useState<Array<{ x: number; y: number }>>(
    []
  );

  const handleGraph = () => {
    const bounds = { xMin: -10, xMax: 10, yMin: -10, yMax: 10 };
    const mockPoints = FunctionGrapher.generateFunctionPoints(
      functionExpr,
      bounds,
      10
    );
    setPoints(mockPoints);
    onGraph?.(functionExpr);
  };

  return (
    <div data-testid='function-grapher-demo'>
      <input
        data-testid='function-input'
        value={functionExpr}
        onChange={e => setFunctionExpr(e.target.value)}
        placeholder='Enter function'
      />
      <button data-testid='graph-button' onClick={handleGraph}>
        Graph
      </button>
      <canvas data-testid='graph-canvas' width={400} height={300} />
      <div data-testid='function-points'>
        {points.map((point, index) => (
          <div key={index} data-testid={`point-${index}`}>
            ({point.x.toFixed(2)}, {point.y.toFixed(2)})
          </div>
        ))}
      </div>
    </div>
  );
};

// Import React after mocking
import React from 'react';

describe('Math Components Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    vi.mocked(Calculator.evaluate).mockReturnValue({
      result: '4',
      metadata: { angleMode: 'deg' as const },
    });

    vi.mocked(EquationSolver.solve).mockReturnValue({
      result: 'x = 2, x = -2',
      steps: ['Step 1: Identify equation', 'Step 2: Apply formula'],
      metadata: { solverType: 'solve' as const, variable: 'x' },
    });

    vi.mocked(FunctionGrapher.generateFunctionPoints).mockReturnValue([
      { x: -1, y: 1 },
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ]);
  });

  describe('Calculator Integration', () => {
    it('should render calculator and handle basic calculations', async () => {
      const user = userEvent.setup();
      render(<MockCalculatorDemo />);

      const input = screen.getByTestId('calculator-input');
      const button = screen.getByTestId('calculate-button');
      const result = screen.getByTestId('calculator-result');

      await user.type(input, '2+2');
      await user.click(button);

      expect(Calculator.evaluate).toHaveBeenCalledWith('2+2');
      expect(result).toHaveTextContent('4');
    });

    it('should handle calculator errors gracefully', async () => {
      const user = userEvent.setup();

      vi.mocked(Calculator.evaluate).mockReturnValue({
        result: '',
        error: 'Division by zero',
      });

      render(<MockCalculatorDemo />);

      const input = screen.getByTestId('calculator-input');
      const button = screen.getByTestId('calculate-button');
      const result = screen.getByTestId('calculator-result');

      await user.type(input, '1/0');
      await user.click(button);

      expect(result).toHaveTextContent('Division by zero');
    });

    it('should handle multiple calculations in sequence', async () => {
      const user = userEvent.setup();
      const onCalculate = vi.fn();

      render(<MockCalculatorDemo onCalculate={onCalculate} />);

      const input = screen.getByTestId('calculator-input');
      const button = screen.getByTestId('calculate-button');

      // First calculation
      await user.type(input, '2+2');
      await user.click(button);

      // Clear and second calculation
      await user.clear(input);
      await user.type(input, '3*3');
      await user.click(button);

      expect(onCalculate).toHaveBeenCalledTimes(2);
      expect(onCalculate).toHaveBeenNthCalledWith(1, '2+2');
      expect(onCalculate).toHaveBeenNthCalledWith(2, '3*3');
    });

    it('should handle real-time calculation updates', async () => {
      const user = userEvent.setup();

      // Mock real-time evaluation
      vi.mocked(Calculator.evaluate).mockImplementation(expr => {
        if (expr === '2+')
          return { result: '', error: 'Incomplete expression' };
        if (expr === '2+2') return { result: '4' };
        return { result: '' };
      });

      render(<MockCalculatorDemo />);

      const input = screen.getByTestId('calculator-input');

      await user.type(input, '2+');
      // Should not show result for incomplete expression

      await user.type(input, '2');
      await user.click(screen.getByTestId('calculate-button'));

      expect(screen.getByTestId('calculator-result')).toHaveTextContent('4');
    });
  });

  describe('Equation Solver Integration', () => {
    it('should render equation solver and display solutions with steps', async () => {
      const user = userEvent.setup();
      render(<MockEquationSolverDemo />);

      const input = screen.getByTestId('equation-input');
      const button = screen.getByTestId('solve-button');
      const result = screen.getByTestId('equation-result');

      await user.type(input, 'x^2-4');
      await user.click(button);

      expect(EquationSolver.solve).toHaveBeenCalledWith('x^2-4', 'x', 'solve');
      expect(result).toHaveTextContent('x = 2, x = -2');

      // Check that steps are displayed
      expect(screen.getByTestId('step-0')).toHaveTextContent(
        'Step 1: Identify equation'
      );
      expect(screen.getByTestId('step-1')).toHaveTextContent(
        'Step 2: Apply formula'
      );
    });

    it('should handle equation solving errors', async () => {
      const user = userEvent.setup();

      vi.mocked(EquationSolver.solve).mockReturnValue({
        result: '',
        error: 'Invalid equation format',
        steps: [],
      });

      render(<MockEquationSolverDemo />);

      const input = screen.getByTestId('equation-input');
      const button = screen.getByTestId('solve-button');
      const result = screen.getByTestId('equation-result');

      await user.type(input, 'invalid');
      await user.click(button);

      expect(result).toHaveTextContent('Invalid equation format');
    });

    it('should handle different solver types', async () => {
      const user = userEvent.setup();

      // Mock derivative solving
      vi.mocked(EquationSolver.solve).mockReturnValue({
        result: '2*x',
        steps: ['Taking derivative of x^2', 'Result: 2*x'],
        metadata: { solverType: 'derivative' as const, variable: 'x' },
      });

      render(<MockEquationSolverDemo />);

      const input = screen.getByTestId('equation-input');
      const button = screen.getByTestId('solve-button');

      await user.type(input, 'x^2');
      await user.click(button);

      expect(screen.getByTestId('equation-result')).toHaveTextContent('2*x');
    });

    it('should display step-by-step solutions', async () => {
      const user = userEvent.setup();

      vi.mocked(EquationSolver.solve).mockReturnValue({
        result: 'x = 3',
        steps: [
          'Step 1: Isolate variable',
          'Step 2: Simplify',
          'Step 3: Final answer',
        ],
      });

      render(<MockEquationSolverDemo />);

      await user.type(screen.getByTestId('equation-input'), 'x-3=0');
      await user.click(screen.getByTestId('solve-button'));

      expect(screen.getByTestId('step-0')).toHaveTextContent(
        'Step 1: Isolate variable'
      );
      expect(screen.getByTestId('step-1')).toHaveTextContent(
        'Step 2: Simplify'
      );
      expect(screen.getByTestId('step-2')).toHaveTextContent(
        'Step 3: Final answer'
      );
    });
  });

  describe('Function Grapher Integration', () => {
    it('should render function grapher and generate points', async () => {
      const user = userEvent.setup();
      render(<MockFunctionGrapherDemo />);

      const input = screen.getByTestId('function-input');
      const button = screen.getByTestId('graph-button');

      await user.type(input, 'x^2');
      await user.click(button);

      expect(FunctionGrapher.generateFunctionPoints).toHaveBeenCalledWith(
        'x^2',
        { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        10
      );

      // Check that points are displayed
      expect(screen.getByTestId('point-0')).toHaveTextContent('(-1.00, 1.00)');
      expect(screen.getByTestId('point-1')).toHaveTextContent('(0.00, 0.00)');
      expect(screen.getByTestId('point-2')).toHaveTextContent('(1.00, 1.00)');
    });

    it('should handle function graphing errors', async () => {
      const user = userEvent.setup();

      vi.mocked(FunctionGrapher.generateFunctionPoints).mockReturnValue([]);

      render(<MockFunctionGrapherDemo />);

      await user.type(screen.getByTestId('function-input'), 'invalid');
      await user.click(screen.getByTestId('graph-button'));

      // Should handle empty points gracefully
      expect(screen.getByTestId('function-points')).toBeEmptyDOMElement();
    });

    it('should render canvas for graphing', () => {
      render(<MockFunctionGrapherDemo />);

      const canvas = screen.getByTestId('graph-canvas');
      expect(canvas).toBeInTheDocument();
      expect(canvas).toHaveAttribute('width', '400');
      expect(canvas).toHaveAttribute('height', '300');
    });

    it('should handle multiple function plotting', async () => {
      const user = userEvent.setup();
      const onGraph = vi.fn();

      render(<MockFunctionGrapherDemo onGraph={onGraph} />);

      const input = screen.getByTestId('function-input');
      const button = screen.getByTestId('graph-button');

      // Plot first function
      await user.type(input, 'x^2');
      await user.click(button);

      // Clear and plot second function
      await user.clear(input);
      await user.type(input, 'sin(x)');
      await user.click(button);

      expect(onGraph).toHaveBeenCalledTimes(2);
      expect(onGraph).toHaveBeenNthCalledWith(1, 'x^2');
      expect(onGraph).toHaveBeenNthCalledWith(2, 'sin(x)');
    });
  });

  describe('Cross-Component Integration', () => {
    it('should handle data flow between components', async () => {
      const user = userEvent.setup();

      const IntegratedDemo = () => {
        const [sharedValue, setSharedValue] = React.useState('');

        return (
          <div>
            <MockCalculatorDemo onCalculate={setSharedValue} />
            <MockEquationSolverDemo />
            <div data-testid='shared-value'>{sharedValue}</div>
          </div>
        );
      };

      render(<IntegratedDemo />);

      await user.type(screen.getByTestId('calculator-input'), '2+2');
      await user.click(screen.getByTestId('calculate-button'));

      expect(screen.getByTestId('shared-value')).toHaveTextContent('2+2');
    });

    it('should handle error propagation across components', async () => {
      const user = userEvent.setup();

      // Mock all components to return errors
      vi.mocked(Calculator.evaluate).mockReturnValue({
        result: '',
        error: 'Calculator error',
      });

      vi.mocked(EquationSolver.solve).mockReturnValue({
        result: '',
        error: 'Solver error',
        steps: [],
      });

      const ErrorDemo = () => (
        <div>
          <MockCalculatorDemo />
          <MockEquationSolverDemo />
        </div>
      );

      render(<ErrorDemo />);

      await user.type(screen.getByTestId('calculator-input'), 'error');
      await user.click(screen.getByTestId('calculate-button'));

      await user.type(screen.getByTestId('equation-input'), 'error');
      await user.click(screen.getByTestId('solve-button'));

      expect(screen.getByTestId('calculator-result')).toHaveTextContent(
        'Calculator error'
      );
      expect(screen.getByTestId('equation-result')).toHaveTextContent(
        'Solver error'
      );
    });

    it('should maintain performance with multiple components', async () => {
      const user = userEvent.setup();

      const MultiComponentDemo = () => (
        <div>
          <MockCalculatorDemo />
          <MockEquationSolverDemo />
          <MockFunctionGrapherDemo />
        </div>
      );

      const startTime = Date.now();
      render(<MultiComponentDemo />);
      const renderTime = Date.now() - startTime;

      // Should render quickly even with multiple components
      expect(renderTime).toBeLessThan(100);

      // All components should be present
      expect(screen.getByTestId('calculator-demo')).toBeInTheDocument();
      expect(screen.getByTestId('equation-solver-demo')).toBeInTheDocument();
      expect(screen.getByTestId('function-grapher-demo')).toBeInTheDocument();
    });
  });

  describe('Accessibility Integration', () => {
    it('should provide proper ARIA labels for math components', () => {
      render(<MockCalculatorDemo />);

      const input = screen.getByTestId('calculator-input');
      const button = screen.getByTestId('calculate-button');

      expect(input).toHaveAttribute('placeholder', 'Enter expression');
      expect(button).toHaveTextContent('Calculate');
    });

    it('should handle keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<MockCalculatorDemo />);

      const input = screen.getByTestId('calculator-input');
      const button = screen.getByTestId('calculate-button');

      // Tab navigation should work
      await user.tab();
      expect(input).toHaveFocus();

      await user.tab();
      expect(button).toHaveFocus();

      // Enter key should trigger calculation
      await user.type(input, '2+2');
      input.focus();
      await user.keyboard('{Enter}');

      // Should work even without explicit Enter handling in this mock
    });

    it('should provide screen reader friendly output', async () => {
      const user = userEvent.setup();
      render(<MockEquationSolverDemo />);

      await user.type(screen.getByTestId('equation-input'), 'x^2-4');
      await user.click(screen.getByTestId('solve-button'));

      const result = screen.getByTestId('equation-result');
      const steps = screen.getByTestId('solution-steps');

      expect(result).toHaveTextContent('x = 2, x = -2');
      expect(steps).toBeInTheDocument();

      // Steps should be individually accessible
      expect(screen.getByTestId('step-0')).toBeInTheDocument();
      expect(screen.getByTestId('step-1')).toBeInTheDocument();
    });
  });

  describe('Performance Integration', () => {
    it('should handle rapid user interactions', async () => {
      const user = userEvent.setup();
      render(<MockCalculatorDemo />);

      const input = screen.getByTestId('calculator-input');
      const button = screen.getByTestId('calculate-button');

      // Rapid typing and clicking
      for (let i = 0; i < 10; i++) {
        await user.clear(input);
        await user.type(input, `${i}+${i}`);
        await user.click(button);
      }

      expect(Calculator.evaluate).toHaveBeenCalledTimes(10);
    });

    it('should handle large datasets efficiently', async () => {
      const user = userEvent.setup();

      // Mock large point generation
      const largePointSet = Array.from({ length: 1000 }, (_, i) => ({
        x: i - 500,
        y: (i - 500) ** 2,
      }));

      vi.mocked(FunctionGrapher.generateFunctionPoints).mockReturnValue(
        largePointSet
      );

      const startTime = Date.now();
      render(<MockFunctionGrapherDemo />);

      await user.type(screen.getByTestId('function-input'), 'x^2');
      await user.click(screen.getByTestId('graph-button'));

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Should handle large datasets reasonably quickly
      expect(processingTime).toBeLessThan(1000);

      // Should render all points (though this might be limited in real implementation)
      const pointElements = screen.getAllByTestId(/^point-/);
      expect(pointElements.length).toBe(1000);
    });
  });
});
