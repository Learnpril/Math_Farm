import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import CalculatorDemo from "../CalculatorDemo";

// Mock Math.js
const mockMath = {
  evaluate: vi.fn(),
};

describe("CalculatorDemo", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock window.math
    Object.defineProperty(window, "math", {
      value: mockMath,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if ("math" in window) {
      delete (window as any).math;
    }
  });

  it("renders loading state initially when math.js is not available", () => {
    delete (window as any).math;
    render(<CalculatorDemo />);

    expect(screen.getByText("Loading calculator tool...")).toBeInTheDocument();
  });

  it("renders successfully when Math.js is loaded", async () => {
    render(<CalculatorDemo />);

    await waitFor(() => {
      expect(screen.getByText("Advanced Calculator")).toBeInTheDocument();
    });

    expect(screen.getByLabelText("Calculator input")).toBeInTheDocument();
  });

  it("handles expression input and real-time calculation", async () => {
    mockMath.evaluate.mockReturnValue(7);
    const user = userEvent.setup();

    render(<CalculatorDemo />);

    await waitFor(() => {
      expect(screen.getByLabelText("Calculator input")).toBeInTheDocument();
    });

    const input = screen.getByLabelText("Calculator input");
    await user.type(input, "3 + 4");

    await waitFor(() => {
      expect(screen.getByText("= 7")).toBeInTheDocument();
    });
  });

  it("handles calculator button clicks", async () => {
    mockMath.evaluate.mockReturnValue(9);
    const user = userEvent.setup();

    render(<CalculatorDemo />);

    await waitFor(() => {
      expect(screen.getByLabelText("Input 3")).toBeInTheDocument();
    });

    // Click number buttons
    await user.click(screen.getByLabelText("Input 3"));
    await user.click(screen.getByLabelText("Input +"));
    await user.click(screen.getByLabelText("Input 6"));
    await user.click(screen.getByLabelText("Calculate"));

    expect(mockMath.evaluate).toHaveBeenCalledWith("3+6");
  });

  it("handles clear button", async () => {
    const user = userEvent.setup();

    render(<CalculatorDemo />);

    await waitFor(() => {
      expect(screen.getByLabelText("Calculator input")).toBeInTheDocument();
    });

    const input = screen.getByLabelText("Calculator input");
    await user.type(input, "123");

    await user.click(screen.getByLabelText("Clear"));

    expect(input).toHaveValue("");
  });

  it("handles backspace button", async () => {
    const user = userEvent.setup();

    render(<CalculatorDemo />);

    await waitFor(() => {
      expect(screen.getByLabelText("Calculator input")).toBeInTheDocument();
    });

    const input = screen.getByLabelText("Calculator input");
    await user.type(input, "123");

    await user.click(screen.getByLabelText("Backspace"));

    expect(input).toHaveValue("12");
  });

  it("handles example buttons", async () => {
    mockMath.evaluate.mockReturnValue(4);
    const user = userEvent.setup();

    render(<CalculatorDemo />);

    await waitFor(() => {
      expect(
        screen.getByLabelText("Try example: sqrt(16)")
      ).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText("Try example: sqrt(16)"));

    const input = screen.getByLabelText("Calculator input");
    expect(input).toHaveValue("sqrt(16)");
  });

  it("displays calculation history", async () => {
    mockMath.evaluate.mockReturnValue(8);
    const user = userEvent.setup();

    render(<CalculatorDemo />);

    await waitFor(() => {
      expect(screen.getByLabelText("Calculator input")).toBeInTheDocument();
    });

    // Perform a calculation
    const input = screen.getByLabelText("Calculator input");
    await user.type(input, "2^3");
    await user.keyboard("{Enter}");

    // Open history
    await user.click(screen.getByText(/History \(1\)/));

    await waitFor(() => {
      expect(screen.getByText("2^3")).toBeInTheDocument();
      expect(screen.getAllByText("= 8")).toHaveLength(2); // One in result area, one in history
    });
  });

  it("handles calculation errors gracefully", async () => {
    mockMath.evaluate.mockImplementation(() => {
      throw new Error("Invalid expression");
    });

    const user = userEvent.setup();
    render(<CalculatorDemo />);

    await waitFor(() => {
      expect(screen.getByLabelText("Calculator input")).toBeInTheDocument();
    });

    const input = screen.getByLabelText("Calculator input");
    await user.type(input, "1/0");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(screen.getByText(/Error: Invalid expression/)).toBeInTheDocument();
    });
  });

  it("formats number results correctly", async () => {
    // Test integer result
    mockMath.evaluate.mockReturnValue(42);
    const user = userEvent.setup();

    render(<CalculatorDemo />);

    await waitFor(() => {
      expect(screen.getByLabelText("Calculator input")).toBeInTheDocument();
    });

    const input = screen.getByLabelText("Calculator input");
    await user.type(input, "6*7");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(screen.getByText("= 42")).toBeInTheDocument();
    });
  });

  it("has proper accessibility attributes", async () => {
    render(<CalculatorDemo />);

    await waitFor(() => {
      const input = screen.getByLabelText("Calculator input");
      expect(input).toBeInTheDocument();
    });

    // Check ARIA attributes
    const historyButton = screen.getByRole("button", { name: /History/ });
    expect(historyButton).toHaveAttribute("aria-expanded", "false");
    expect(historyButton).toHaveAttribute(
      "aria-controls",
      "calculation-history"
    );
  });

  it("displays help text", async () => {
    render(<CalculatorDemo />);

    await waitFor(() => {
      expect(screen.getByText(/Quick Reference/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Constants: pi \(π\), e/)).toBeInTheDocument();
  });
});
