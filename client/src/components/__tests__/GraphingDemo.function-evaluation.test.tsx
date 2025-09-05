import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GraphingDemo } from "../GraphingDemo";

// Mock JSXGraph
const mockBoard = {
  create: vi.fn(),
  removeObject: vi.fn(),
  update: vi.fn(),
};

const mockJSXGraph = {
  initBoard: vi.fn(() => mockBoard),
  freeBoard: vi.fn(),
};

// Mock window.JXG
Object.defineProperty(window, "JXG", {
  value: {
    JSXGraph: mockJSXGraph,
  },
  writable: true,
});

// Mock scrollIntoView
Object.defineProperty(Element.prototype, "scrollIntoView", {
  value: vi.fn(),
  writable: true,
});

describe("GraphingDemo Function Evaluation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBoard.create.mockReturnValue({ id: "test-curve" });
  });

  // Helper function to extract the function from the create call
  const getPlottedFunction = () => {
    const createCalls = mockBoard.create.mock.calls;
    const functionGraphCall = createCalls.find(
      (call) => call[0] === "functiongraph"
    );
    return functionGraphCall ? functionGraphCall[1][0] : null;
  };

  // Helper function to test a function at multiple x values
  const testFunctionValues = (
    plottedFunc: any,
    expectedValues: Array<{ x: number; y: number }>
  ) => {
    expectedValues.forEach(({ x, y }) => {
      const result = plottedFunc(x);
      if (isNaN(y)) {
        expect(result).toBeNaN();
      } else {
        expect(result).toBeCloseTo(y, 5);
      }
    });
  };

  describe("Polynomial Functions", () => {
    it("handles simple quadratic: x^2", async () => {
      render(<GraphingDemo />);

      await waitFor(() => {
        expect(mockJSXGraph.initBoard).toHaveBeenCalled();
      });

      const input = screen.getByRole("textbox");
      const plotButton = screen.getByRole("button", { name: /plot function/i });

      fireEvent.change(input, { target: { value: "x^2" } });
      fireEvent.click(plotButton);

      const plottedFunc = getPlottedFunction();
      expect(plottedFunc).toBeTruthy();

      testFunctionValues(plottedFunc, [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 4 },
        { x: -1, y: 1 },
        { x: -2, y: 4 },
      ]);
    });

    it("handles quadratic with coefficients: x^2 + 3x + 2", async () => {
      render(<GraphingDemo />);

      await waitFor(() => {
        expect(mockJSXGraph.initBoard).toHaveBeenCalled();
      });

      const input = screen.getByRole("textbox");
      const plotButton = screen.getByRole("button", { name: /plot function/i });

      fireEvent.change(input, { target: { value: "x^2 + 3x + 2" } });
      fireEvent.click(plotButton);

      const plottedFunc = getPlottedFunction();
      expect(plottedFunc).toBeTruthy();

      testFunctionValues(plottedFunc, [
        { x: 0, y: 2 }, // 0 + 0 + 2 = 2
        { x: 1, y: 6 }, // 1 + 3 + 2 = 6
        { x: -1, y: 0 }, // 1 - 3 + 2 = 0
        { x: -2, y: 0 }, // 4 - 6 + 2 = 0
        { x: 2, y: 12 }, // 4 + 6 + 2 = 12
      ]);
    });

    it("handles cubic functions: x^3 - 2x", async () => {
      render(<GraphingDemo />);

      await waitFor(() => {
        expect(mockJSXGraph.initBoard).toHaveBeenCalled();
      });

      const input = screen.getByRole("textbox");
      const plotButton = screen.getByRole("button", { name: /plot function/i });

      fireEvent.change(input, { target: { value: "x^3 - 2x" } });
      fireEvent.click(plotButton);

      const plottedFunc = getPlottedFunction();
      expect(plottedFunc).toBeTruthy();

      testFunctionValues(plottedFunc, [
        { x: 0, y: 0 }, // 0 - 0 = 0
        { x: 1, y: -1 }, // 1 - 2 = -1
        { x: 2, y: 4 }, // 8 - 4 = 4
        { x: -1, y: 1 }, // -1 + 2 = 1
        { x: -2, y: -4 }, // -8 + 4 = -4
      ]);
    });

    it("handles complex polynomials: 2x^3 + 3x^2 - 4x + 1", async () => {
      render(<GraphingDemo />);

      await waitFor(() => {
        expect(mockJSXGraph.initBoard).toHaveBeenCalled();
      });

      const input = screen.getByRole("textbox");
      const plotButton = screen.getByRole("button", { name: /plot function/i });

      fireEvent.change(input, { target: { value: "2x^3 + 3x^2 - 4x + 1" } });
      fireEvent.click(plotButton);

      const plottedFunc = getPlottedFunction();
      expect(plottedFunc).toBeTruthy();

      testFunctionValues(plottedFunc, [
        { x: 0, y: 1 }, // 0 + 0 - 0 + 1 = 1
        { x: 1, y: 2 }, // 2 + 3 - 4 + 1 = 2
        { x: -1, y: 8 }, // -2 + 3 + 4 + 1 = 6
      ]);
    });
  });

  describe("Trigonometric Functions", () => {
    it("handles sine function: sin(x)", async () => {
      render(<GraphingDemo />);

      await waitFor(() => {
        expect(mockJSXGraph.initBoard).toHaveBeenCalled();
      });

      const input = screen.getByRole("textbox");
      const plotButton = screen.getByRole("button", { name: /plot function/i });

      fireEvent.change(input, { target: { value: "sin(x)" } });
      fireEvent.click(plotButton);

      const plottedFunc = getPlottedFunction();
      expect(plottedFunc).toBeTruthy();

      testFunctionValues(plottedFunc, [
        { x: 0, y: 0 },
        { x: Math.PI / 2, y: 1 },
        { x: Math.PI, y: 0 },
        { x: (3 * Math.PI) / 2, y: -1 },
        { x: 2 * Math.PI, y: 0 },
      ]);
    });

    it("handles cosine function: cos(x)", async () => {
      render(<GraphingDemo />);

      await waitFor(() => {
        expect(mockJSXGraph.initBoard).toHaveBeenCalled();
      });

      const input = screen.getByRole("textbox");
      const plotButton = screen.getByRole("button", { name: /plot function/i });

      fireEvent.change(input, { target: { value: "cos(x)" } });
      fireEvent.click(plotButton);

      const plottedFunc = getPlottedFunction();
      expect(plottedFunc).toBeTruthy();

      testFunctionValues(plottedFunc, [
        { x: 0, y: 1 },
        { x: Math.PI / 2, y: 0 },
        { x: Math.PI, y: -1 },
        { x: (3 * Math.PI) / 2, y: 0 },
        { x: 2 * Math.PI, y: 1 },
      ]);
    });

    it("handles modified trig functions: 2sin(3x)", async () => {
      render(<GraphingDemo />);

      await waitFor(() => {
        expect(mockJSXGraph.initBoard).toHaveBeenCalled();
      });

      const input = screen.getByRole("textbox");
      const plotButton = screen.getByRole("button", { name: /plot function/i });

      fireEvent.change(input, { target: { value: "2sin(3x)" } });
      fireEvent.click(plotButton);

      const plottedFunc = getPlottedFunction();
      expect(plottedFunc).toBeTruthy();

      testFunctionValues(plottedFunc, [
        { x: 0, y: 0 },
        { x: Math.PI / 6, y: 2 }, // 2*sin(π/2) = 2*1 = 2
        { x: Math.PI / 3, y: 0 }, // 2*sin(π) = 2*0 = 0
      ]);
    });
  });

  describe("Exponential and Logarithmic Functions", () => {
    it("handles exponential function: exp(x)", async () => {
      render(<GraphingDemo />);

      await waitFor(() => {
        expect(mockJSXGraph.initBoard).toHaveBeenCalled();
      });

      const input = screen.getByRole("textbox");
      const plotButton = screen.getByRole("button", { name: /plot function/i });

      fireEvent.change(input, { target: { value: "exp(x)" } });
      fireEvent.click(plotButton);

      const plottedFunc = getPlottedFunction();
      expect(plottedFunc).toBeTruthy();

      testFunctionValues(plottedFunc, [
        { x: 0, y: 1 },
        { x: 1, y: Math.E },
        { x: -1, y: 1 / Math.E },
        { x: 2, y: Math.E * Math.E },
      ]);
    });

    it("handles natural logarithm: ln(x)", async () => {
      render(<GraphingDemo />);

      await waitFor(() => {
        expect(mockJSXGraph.initBoard).toHaveBeenCalled();
      });

      const input = screen.getByRole("textbox");
      const plotButton = screen.getByRole("button", { name: /plot function/i });

      fireEvent.change(input, { target: { value: "ln(x)" } });
      fireEvent.click(plotButton);

      const plottedFunc = getPlottedFunction();
      expect(plottedFunc).toBeTruthy();

      testFunctionValues(plottedFunc, [
        { x: 1, y: 0 },
        { x: Math.E, y: 1 },
        { x: Math.E * Math.E, y: 2 },
        { x: 0.5, y: Math.log(0.5) },
      ]);
    });

    it("handles base-10 logarithm: log(x)", async () => {
      render(<GraphingDemo />);

      await waitFor(() => {
        expect(mockJSXGraph.initBoard).toHaveBeenCalled();
      });

      const input = screen.getByRole("textbox");
      const plotButton = screen.getByRole("button", { name: /plot function/i });

      fireEvent.change(input, { target: { value: "log(x)" } });
      fireEvent.click(plotButton);

      const plottedFunc = getPlottedFunction();
      expect(plottedFunc).toBeTruthy();

      testFunctionValues(plottedFunc, [
        { x: 1, y: 0 },
        { x: 10, y: 1 },
        { x: 100, y: 2 },
        { x: 0.1, y: -1 },
      ]);
    });
  });

  describe("Other Mathematical Functions", () => {
    it("handles square root: sqrt(x)", async () => {
      render(<GraphingDemo />);

      await waitFor(() => {
        expect(mockJSXGraph.initBoard).toHaveBeenCalled();
      });

      const input = screen.getByRole("textbox");
      const plotButton = screen.getByRole("button", { name: /plot function/i });

      fireEvent.change(input, { target: { value: "sqrt(x)" } });
      fireEvent.click(plotButton);

      const plottedFunc = getPlottedFunction();
      expect(plottedFunc).toBeTruthy();

      testFunctionValues(plottedFunc, [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 4, y: 2 },
        { x: 9, y: 3 },
        { x: 16, y: 4 },
      ]);
    });

    it("handles absolute value: abs(x)", async () => {
      render(<GraphingDemo />);

      await waitFor(() => {
        expect(mockJSXGraph.initBoard).toHaveBeenCalled();
      });

      const input = screen.getByRole("textbox");
      const plotButton = screen.getByRole("button", { name: /plot function/i });

      fireEvent.change(input, { target: { value: "abs(x)" } });
      fireEvent.click(plotButton);

      const plottedFunc = getPlottedFunction();
      expect(plottedFunc).toBeTruthy();

      testFunctionValues(plottedFunc, [
        { x: 0, y: 0 },
        { x: 5, y: 5 },
        { x: -5, y: 5 },
        { x: 3.5, y: 3.5 },
        { x: -3.5, y: 3.5 },
      ]);
    });

    it("handles reciprocal function: 1/x", async () => {
      render(<GraphingDemo />);

      await waitFor(() => {
        expect(mockJSXGraph.initBoard).toHaveBeenCalled();
      });

      const input = screen.getByRole("textbox");
      const plotButton = screen.getByRole("button", { name: /plot function/i });

      fireEvent.change(input, { target: { value: "1/x" } });
      fireEvent.click(plotButton);

      const plottedFunc = getPlottedFunction();
      expect(plottedFunc).toBeTruthy();

      testFunctionValues(plottedFunc, [
        { x: 1, y: 1 },
        { x: 2, y: 0.5 },
        { x: 0.5, y: 2 },
        { x: -1, y: -1 },
        { x: -2, y: -0.5 },
        { x: 0, y: NaN }, // Division by zero
      ]);
    });
  });

  describe("Complex Expressions", () => {
    it("handles mixed functions: sin(x) + x^2", async () => {
      render(<GraphingDemo />);

      await waitFor(() => {
        expect(mockJSXGraph.initBoard).toHaveBeenCalled();
      });

      const input = screen.getByRole("textbox");
      const plotButton = screen.getByRole("button", { name: /plot function/i });

      fireEvent.change(input, { target: { value: "sin(x) + x^2" } });
      fireEvent.click(plotButton);

      const plottedFunc = getPlottedFunction();
      expect(plottedFunc).toBeTruthy();

      testFunctionValues(plottedFunc, [
        { x: 0, y: 0 }, // sin(0) + 0^2 = 0 + 0 = 0
        { x: 1, y: Math.sin(1) + 1 }, // sin(1) + 1^2
        { x: Math.PI / 2, y: 1 + (Math.PI / 2) ** 2 }, // sin(π/2) + (π/2)^2
      ]);
    });

    it("handles functions with constants: 2x^2 + 3sin(x) - 1", async () => {
      render(<GraphingDemo />);

      await waitFor(() => {
        expect(mockJSXGraph.initBoard).toHaveBeenCalled();
      });

      const input = screen.getByRole("textbox");
      const plotButton = screen.getByRole("button", { name: /plot function/i });

      fireEvent.change(input, { target: { value: "2x^2 + 3sin(x) - 1" } });
      fireEvent.click(plotButton);

      const plottedFunc = getPlottedFunction();
      expect(plottedFunc).toBeTruthy();

      testFunctionValues(plottedFunc, [
        { x: 0, y: -1 }, // 2*0 + 3*sin(0) - 1 = 0 + 0 - 1 = -1
        { x: 1, y: 2 + 3 * Math.sin(1) - 1 }, // 2*1 + 3*sin(1) - 1
      ]);
    });

    it("handles nested functions: sin(cos(x))", async () => {
      render(<GraphingDemo />);

      await waitFor(() => {
        expect(mockJSXGraph.initBoard).toHaveBeenCalled();
      });

      const input = screen.getByRole("textbox");
      const plotButton = screen.getByRole("button", { name: /plot function/i });

      fireEvent.change(input, { target: { value: "sin(cos(x))" } });
      fireEvent.click(plotButton);

      const plottedFunc = getPlottedFunction();
      expect(plottedFunc).toBeTruthy();

      testFunctionValues(plottedFunc, [
        { x: 0, y: Math.sin(Math.cos(0)) }, // sin(cos(0)) = sin(1)
        { x: Math.PI / 2, y: Math.sin(Math.cos(Math.PI / 2)) }, // sin(cos(π/2)) = sin(0) = 0
        { x: Math.PI, y: Math.sin(Math.cos(Math.PI)) }, // sin(cos(π)) = sin(-1)
      ]);
    });
  });

  describe("Constants", () => {
    it("handles pi constant: sin(pi)", async () => {
      render(<GraphingDemo />);

      await waitFor(() => {
        expect(mockJSXGraph.initBoard).toHaveBeenCalled();
      });

      const input = screen.getByRole("textbox");
      const plotButton = screen.getByRole("button", { name: /plot function/i });

      fireEvent.change(input, { target: { value: "sin(pi)" } });
      fireEvent.click(plotButton);

      const plottedFunc = getPlottedFunction();
      expect(plottedFunc).toBeTruthy();

      // sin(π) should be very close to 0 for all x values since it's a constant
      testFunctionValues(plottedFunc, [
        { x: 0, y: Math.sin(Math.PI) },
        { x: 1, y: Math.sin(Math.PI) },
        { x: -1, y: Math.sin(Math.PI) },
      ]);
    });

    it("handles e constant: exp(1) vs e", async () => {
      render(<GraphingDemo />);

      await waitFor(() => {
        expect(mockJSXGraph.initBoard).toHaveBeenCalled();
      });

      const input = screen.getByRole("textbox");
      const plotButton = screen.getByRole("button", { name: /plot function/i });

      fireEvent.change(input, { target: { value: "e" } });
      fireEvent.click(plotButton);

      const plottedFunc = getPlottedFunction();
      expect(plottedFunc).toBeTruthy();

      // e should be a constant function
      testFunctionValues(plottedFunc, [
        { x: 0, y: Math.E },
        { x: 1, y: Math.E },
        { x: -1, y: Math.E },
      ]);
    });
  });

  describe("Error Handling", () => {
    it("handles invalid expressions gracefully", async () => {
      render(<GraphingDemo />);

      await waitFor(() => {
        expect(mockJSXGraph.initBoard).toHaveBeenCalled();
      });

      const input = screen.getByRole("textbox");
      const plotButton = screen.getByRole("button", { name: /plot function/i });

      fireEvent.change(input, { target: { value: "invalid_function(x)" } });
      fireEvent.click(plotButton);

      const plottedFunc = getPlottedFunction();
      expect(plottedFunc).toBeTruthy();

      // Should return NaN for invalid expressions
      testFunctionValues(plottedFunc, [
        { x: 0, y: NaN },
        { x: 1, y: NaN },
        { x: -1, y: NaN },
      ]);
    });

    it("handles division by zero", async () => {
      render(<GraphingDemo />);

      await waitFor(() => {
        expect(mockJSXGraph.initBoard).toHaveBeenCalled();
      });

      const input = screen.getByRole("textbox");
      const plotButton = screen.getByRole("button", { name: /plot function/i });

      fireEvent.change(input, { target: { value: "1/(x-1)" } });
      fireEvent.click(plotButton);

      const plottedFunc = getPlottedFunction();
      expect(plottedFunc).toBeTruthy();

      testFunctionValues(plottedFunc, [
        { x: 0, y: -1 }, // 1/(0-1) = -1
        { x: 2, y: 1 }, // 1/(2-1) = 1
        { x: 1, y: NaN }, // 1/(1-1) = 1/0 = Infinity (should be NaN)
      ]);
    });
  });
});
