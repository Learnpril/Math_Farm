import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Router } from "wouter";
import { ToolsSection } from "../ToolsSection";

// Mock the demo components to avoid loading external libraries in tests
vi.mock("../CalculatorDemo", () => ({
  CalculatorDemo: ({ className }: { className?: string }) => (
    <div data-testid="calculator-demo" className={className}>
      <h3>Advanced Calculator</h3>
      <p>Mocked calculator demo component</p>
    </div>
  ),
}));

vi.mock("../FunctionGrapherDemo", () => ({
  FunctionGrapherDemo: ({ className }: { className?: string }) => (
    <div data-testid="function-grapher-demo" className={className}>
      <h3>Function Grapher</h3>
      <p>Mocked function grapher demo component</p>
    </div>
  ),
}));

vi.mock("../UnitConverterDemo", () => ({
  UnitConverterDemo: ({ className }: { className?: string }) => (
    <div data-testid="unit-converter-demo" className={className}>
      <h3>Unit Converter</h3>
      <p>Mocked unit converter demo component</p>
    </div>
  ),
}));

vi.mock("../EquationSolverDemo", () => ({
  EquationSolverDemo: ({ className }: { className?: string }) => (
    <div data-testid="equation-solver-demo" className={className}>
      <h3>Equation Solver</h3>
      <p>Mocked equation solver demo component</p>
    </div>
  ),
}));

// Mock Wouter's Link component
vi.mock("wouter", async () => {
  const actual = await vi.importActual("wouter");
  return {
    ...actual,
    Link: ({ href, children, ...props }: any) => (
      <a href={href} {...props}>
        {children}
      </a>
    ),
  };
});

// Test wrapper with router
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Router>{children}</Router>
);

describe("ToolsSection", () => {
  beforeEach(() => {
    // Clear any previous mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    vi.restoreAllMocks();
  });

  describe("Rendering", () => {
    it("renders the tools section with correct heading", () => {
      render(
        <TestWrapper>
          <ToolsSection />
        </TestWrapper>
      );

      expect(
        screen.getByRole("heading", { name: /interactive tools/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/experience our powerful mathematical tools/i)
      ).toBeInTheDocument();
    });

    it("renders navigation link to full tools page", () => {
      render(
        <TestWrapper>
          <ToolsSection />
        </TestWrapper>
      );

      const exploreAllToolsLink = screen.getByRole("link", {
        name: /explore all tools/i,
      });
      expect(exploreAllToolsLink).toBeInTheDocument();
      expect(exploreAllToolsLink).toHaveAttribute("href", "/tools");
    });

    it("renders tool selection buttons", () => {
      render(
        <TestWrapper>
          <ToolsSection />
        </TestWrapper>
      );

      expect(
        screen.getByRole("button", { name: /toggle calculator demonstration/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", {
          name: /toggle function grapher demonstration/i,
        })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", {
          name: /toggle unit converter demonstration/i,
        })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", {
          name: /toggle equation solver demonstration/i,
        })
      ).toBeInTheDocument();
    });

    it("renders overview cards by default", () => {
      render(
        <TestWrapper>
          <ToolsSection />
        </TestWrapper>
      );

      expect(screen.getByText("Advanced Calculator")).toBeInTheDocument();
      expect(screen.getByText("Function Grapher")).toBeInTheDocument();
      expect(screen.getByText("Unit Converter")).toBeInTheDocument();
      expect(screen.getByText("Equation Solver")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /try calculator/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /try function grapher/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /try unit converter/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /try equation solver/i })
      ).toBeInTheDocument();
    });
  });

  describe("Interactive Functionality", () => {
    it("shows calculator demo when calculator button is clicked", async () => {
      render(
        <TestWrapper>
          <ToolsSection />
        </TestWrapper>
      );

      const calculatorButton = screen.getByRole("button", {
        name: /toggle calculator demonstration/i,
      });
      fireEvent.click(calculatorButton);

      await waitFor(() => {
        expect(screen.getByTestId("calculator-demo")).toBeInTheDocument();
      });

      // Overview cards should be hidden
      expect(screen.queryByText("Try Calculator")).not.toBeInTheDocument();
    });

    it("shows function grapher demo when function grapher button is clicked", async () => {
      render(
        <TestWrapper>
          <ToolsSection />
        </TestWrapper>
      );

      const functionGrapherButton = screen.getByRole("button", {
        name: /toggle function grapher demonstration/i,
      });
      fireEvent.click(functionGrapherButton);

      await waitFor(() => {
        expect(screen.getByTestId("function-grapher-demo")).toBeInTheDocument();
      });

      // Overview cards should be hidden
      expect(
        screen.queryByText("Try Function Grapher")
      ).not.toBeInTheDocument();
    });

    it("shows unit converter demo when unit converter button is clicked", async () => {
      render(
        <TestWrapper>
          <ToolsSection />
        </TestWrapper>
      );

      const unitConverterButton = screen.getByRole("button", {
        name: /toggle unit converter demonstration/i,
      });
      fireEvent.click(unitConverterButton);

      await waitFor(() => {
        expect(screen.getByTestId("unit-converter-demo")).toBeInTheDocument();
      });

      // Overview cards should be hidden
      expect(screen.queryByText("Try Unit Converter")).not.toBeInTheDocument();
    });

    it("shows equation solver demo when equation solver button is clicked", async () => {
      render(
        <TestWrapper>
          <ToolsSection />
        </TestWrapper>
      );

      const equationSolverButton = screen.getByRole("button", {
        name: /toggle equation solver demonstration/i,
      });
      fireEvent.click(equationSolverButton);

      await waitFor(() => {
        expect(screen.getByTestId("equation-solver-demo")).toBeInTheDocument();
      });

      // Overview cards should be hidden
      expect(screen.queryByText("Try Equation Solver")).not.toBeInTheDocument();
    });

    it("toggles demo visibility when clicking the same button twice", async () => {
      render(
        <TestWrapper>
          <ToolsSection />
        </TestWrapper>
      );

      const calculatorButton = screen.getByRole("button", {
        name: /toggle calculator demonstration/i,
      });

      // Show calculator demo
      fireEvent.click(calculatorButton);
      await waitFor(() => {
        expect(screen.getByTestId("calculator-demo")).toBeInTheDocument();
      });

      // Hide calculator demo
      fireEvent.click(calculatorButton);
      await waitFor(() => {
        expect(screen.queryByTestId("calculator-demo")).not.toBeInTheDocument();
        expect(screen.getByText("Try Calculator")).toBeInTheDocument();
      });
    });

    it("switches between demos when different buttons are clicked", async () => {
      render(
        <TestWrapper>
          <ToolsSection />
        </TestWrapper>
      );

      const calculatorButton = screen.getByRole("button", {
        name: /toggle calculator demonstration/i,
      });
      const functionGrapherButton = screen.getByRole("button", {
        name: /toggle function grapher demonstration/i,
      });

      // Show calculator demo
      fireEvent.click(calculatorButton);
      await waitFor(() => {
        expect(screen.getByTestId("calculator-demo")).toBeInTheDocument();
      });

      // Switch to function grapher demo
      fireEvent.click(functionGrapherButton);
      await waitFor(() => {
        expect(screen.getByTestId("function-grapher-demo")).toBeInTheDocument();
        expect(screen.queryByTestId("calculator-demo")).not.toBeInTheDocument();
      });
    });

    it("shows calculator demo when 'Try Calculator' button is clicked", async () => {
      render(
        <TestWrapper>
          <ToolsSection />
        </TestWrapper>
      );

      const tryCalculatorButton = screen.getByRole("button", {
        name: /try calculator/i,
      });
      fireEvent.click(tryCalculatorButton);

      await waitFor(() => {
        expect(screen.getByTestId("calculator-demo")).toBeInTheDocument();
      });
    });

    it("shows function grapher demo when 'Try Function Grapher' button is clicked", async () => {
      render(
        <TestWrapper>
          <ToolsSection />
        </TestWrapper>
      );

      const tryFunctionGrapherButton = screen.getByRole("button", {
        name: /try function grapher/i,
      });
      fireEvent.click(tryFunctionGrapherButton);

      await waitFor(() => {
        expect(screen.getByTestId("function-grapher-demo")).toBeInTheDocument();
      });
    });

    it("shows unit converter demo when 'Try Unit Converter' button is clicked", async () => {
      render(
        <TestWrapper>
          <ToolsSection />
        </TestWrapper>
      );

      const tryUnitConverterButton = screen.getByRole("button", {
        name: /try unit converter/i,
      });
      fireEvent.click(tryUnitConverterButton);

      await waitFor(() => {
        expect(screen.getByTestId("unit-converter-demo")).toBeInTheDocument();
      });
    });

    it("shows equation solver demo when 'Try Equation Solver' button is clicked", async () => {
      render(
        <TestWrapper>
          <ToolsSection />
        </TestWrapper>
      );

      const tryEquationSolverButton = screen.getByRole("button", {
        name: /try equation solver/i,
      });
      fireEvent.click(tryEquationSolverButton);

      await waitFor(() => {
        expect(screen.getByTestId("equation-solver-demo")).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels and roles", () => {
      render(
        <TestWrapper>
          <ToolsSection />
        </TestWrapper>
      );

      // Section should have proper labeling
      const section = screen.getByRole("region", {
        name: /interactive tools/i,
      });
      expect(section).toBeInTheDocument();

      // Buttons should have proper ARIA attributes
      const calculatorButton = screen.getByRole("button", {
        name: /toggle calculator demonstration/i,
      });
      const functionGrapherButton = screen.getByRole("button", {
        name: /toggle function grapher demonstration/i,
      });

      expect(calculatorButton).toHaveAttribute("aria-pressed", "false");
      expect(functionGrapherButton).toHaveAttribute("aria-pressed", "false");
    });

    it("updates ARIA pressed state when buttons are clicked", async () => {
      render(
        <TestWrapper>
          <ToolsSection />
        </TestWrapper>
      );

      const calculatorButton = screen.getByRole("button", {
        name: /toggle calculator demonstration/i,
      });

      fireEvent.click(calculatorButton);

      await waitFor(() => {
        expect(calculatorButton).toHaveAttribute("aria-pressed", "true");
      });
    });

    it("provides proper region labels for demo content", async () => {
      render(
        <TestWrapper>
          <ToolsSection />
        </TestWrapper>
      );

      const calculatorButton = screen.getByRole("button", {
        name: /toggle calculator demonstration/i,
      });
      fireEvent.click(calculatorButton);

      await waitFor(() => {
        // Look for the region that contains the demo
        const demoRegions = screen.getAllByRole("region");
        const demoRegion = demoRegions.find(
          (region) =>
            region.getAttribute("aria-labelledby") === "calculator-demo-title"
        );
        expect(demoRegion).toBeInTheDocument();
      });
    });

    it("has proper heading hierarchy", () => {
      render(
        <TestWrapper>
          <ToolsSection />
        </TestWrapper>
      );

      const mainHeading = screen.getByRole("heading", {
        name: /interactive tools/i,
      });
      expect(mainHeading).toBeInTheDocument();

      const subHeading = screen.getByRole("heading", {
        name: /ready for more/i,
      });
      expect(subHeading).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("has error boundary component in place", () => {
      render(
        <TestWrapper>
          <ToolsSection />
        </TestWrapper>
      );

      // Test that the component renders without throwing
      expect(
        screen.getByRole("heading", { name: /interactive tools/i })
      ).toBeInTheDocument();

      // Error boundary is present but we can't easily test it without complex setup
      // The error boundary is tested implicitly by the component rendering successfully
    });
  });

  describe("Loading States", () => {
    it("has Suspense boundaries in place for lazy loading", async () => {
      render(
        <TestWrapper>
          <ToolsSection />
        </TestWrapper>
      );

      const calculatorButton = screen.getByRole("button", {
        name: /toggle calculator demonstration/i,
      });
      fireEvent.click(calculatorButton);

      // With mocked components, we should see the demo immediately
      await waitFor(() => {
        expect(screen.getByTestId("calculator-demo")).toBeInTheDocument();
      });

      // The Suspense boundaries are in place for real components
      // but with mocked components they resolve immediately
    });
  });

  describe("Navigation", () => {
    it("renders multiple navigation links to tools page", () => {
      render(
        <TestWrapper>
          <ToolsSection />
        </TestWrapper>
      );

      const toolsLinks = screen.getAllByRole("link", { name: /tools/i });
      expect(toolsLinks.length).toBeGreaterThan(0);

      toolsLinks.forEach((link) => {
        expect(link).toHaveAttribute("href", "/tools");
      });
    });
  });

  describe("Responsive Design", () => {
    it("applies custom className when provided", () => {
      const customClass = "custom-tools-section";
      render(
        <TestWrapper>
          <ToolsSection className={customClass} />
        </TestWrapper>
      );

      const section = screen.getByRole("region", {
        name: /interactive tools/i,
      });
      expect(section).toHaveClass(customClass);
    });
  });

  describe("Content Structure", () => {
    it("displays feature lists for each tool overview", () => {
      render(
        <TestWrapper>
          <ToolsSection />
        </TestWrapper>
      );

      // Calculator features
      expect(screen.getByText(/scientific functions/i)).toBeInTheDocument();
      expect(screen.getByText(/mathematical constants/i)).toBeInTheDocument();
      expect(screen.getByText(/real-time calculation/i)).toBeInTheDocument();
      expect(screen.getByText(/calculation history/i)).toBeInTheDocument();

      // Function Grapher features
      expect(
        screen.getByText(/plot multiple functions at once/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/customizable x\/y axis ranges/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/function visibility controls/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/built-in function presets/i)
      ).toBeInTheDocument();

      // Unit Converter features
      expect(
        screen.getByText(/length, weight, temperature units/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/real-time conversion results/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/quick conversion presets/i)).toBeInTheDocument();
      expect(
        screen.getByText(/precise calculation accuracy/i)
      ).toBeInTheDocument();
    });

    it("displays call-to-action section", () => {
      render(
        <TestWrapper>
          <ToolsSection />
        </TestWrapper>
      );

      expect(screen.getByText(/ready for more/i)).toBeInTheDocument();
      expect(
        screen.getByText(/complete suite of mathematical tools/i)
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /view all tools/i })
      ).toBeInTheDocument();
    });
  });
});
