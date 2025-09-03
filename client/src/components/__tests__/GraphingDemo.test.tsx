import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import GraphingDemo from "../GraphingDemo";

// Mock JSXGraph
const mockBoard = {
  create: vi.fn(),
  removeObject: vi.fn(),
  update: vi.fn(),
  objectsList: [],
};

const mockJXG = {
  JSXGraph: {
    initBoard: vi.fn(() => mockBoard),
    freeBoard: vi.fn(),
  },
};

describe("GraphingDemo", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock window.JXG
    Object.defineProperty(window, "JXG", {
      value: mockJXG,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if ("JXG" in window) {
      delete (window as any).JXG;
    }
  });

  it("renders loading state initially when JXG is not available", () => {
    delete (window as any).JXG;
    render(<GraphingDemo />);

    expect(screen.getByText("Loading graphing tool...")).toBeInTheDocument();
  });

  it("renders successfully when JSXGraph is loaded", async () => {
    render(<GraphingDemo />);

    await waitFor(() => {
      expect(screen.getByText("Interactive Graphing Tool")).toBeInTheDocument();
    });

    expect(
      screen.getByLabelText("Function equation input")
    ).toBeInTheDocument();
    expect(screen.getByText("Plot Function")).toBeInTheDocument();
  });

  it("initializes JSXGraph board correctly", async () => {
    render(<GraphingDemo />);

    await waitFor(() => {
      expect(mockJXG.JSXGraph.initBoard).toHaveBeenCalled();
    });
  });

  it("handles equation input changes", async () => {
    const user = userEvent.setup();
    render(<GraphingDemo />);

    await waitFor(() => {
      expect(
        screen.getByLabelText("Function equation input")
      ).toBeInTheDocument();
    });

    const input = screen.getByLabelText("Function equation input");
    await user.clear(input);
    await user.type(input, "sin(x)");

    expect(input).toHaveValue("sin(x)");
  });

  it("plots function when Plot Function button is clicked", async () => {
    const user = userEvent.setup();
    render(<GraphingDemo />);

    await waitFor(() => {
      expect(screen.getByText("Plot Function")).toBeInTheDocument();
    });

    const input = screen.getByLabelText("Function equation input");
    await user.clear(input);
    await user.type(input, "x^2");

    const plotButton = screen.getByText("Plot Function");
    await user.click(plotButton);

    // Should create a function graph
    expect(mockBoard.create).toHaveBeenCalledWith(
      "functiongraph",
      expect.any(Array),
      expect.any(Object)
    );
  });

  it("handles preset function buttons", async () => {
    const user = userEvent.setup();
    render(<GraphingDemo />);

    await waitFor(() => {
      expect(screen.getByLabelText("Plot x^2")).toBeInTheDocument();
    });

    const presetButton = screen.getByLabelText("Plot x^2");
    await user.click(presetButton);

    const input = screen.getByLabelText("Function equation input");
    expect(input).toHaveValue("x^2");
  });

  it("displays help text and instructions", async () => {
    render(<GraphingDemo />);

    await waitFor(() => {
      expect(
        screen.getByText(/Use mouse wheel or pinch to zoom/)
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Click and drag to pan around the graph/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Try functions like: x\^2, sin\(x\)/)
    ).toBeInTheDocument();
  });

  it("cleans up board on unmount", async () => {
    const { unmount } = render(<GraphingDemo />);

    await waitFor(() => {
      expect(mockJXG.JSXGraph.initBoard).toHaveBeenCalled();
    });

    unmount();

    expect(mockJXG.JSXGraph.freeBoard).toHaveBeenCalledWith(mockBoard);
  });

  it("has proper accessibility attributes", async () => {
    render(<GraphingDemo />);

    await waitFor(() => {
      const graphArea = screen.getByRole("img");
      expect(graphArea).toHaveAttribute(
        "aria-label",
        "Graph of function f(x) = x^2"
      );
      expect(graphArea).toHaveAttribute("tabIndex", "0");
    });
  });
});
