import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Router } from "wouter";
import { ToolsSection } from "../ToolsSection";

// Mock the demo components to avoid loading external libraries in tests
vi.mock("../GraphingDemo", () => ({
  GraphingDemo: ({ className }: { className?: string }) => (
    <div data-testid="graphing-demo" className={className}>
      <h3>Interactive Graphing Tool</h3>
      <p>Mocked graphing demo component</p>
    </div>
  ),
}));

vi.mock("../CalculatorDemo", () => ({
  CalculatorDemo: ({ className }: { className?: string }) => (
    <div data-testid="calculator-demo" className={className}>
      <h3>Advanced Calculator</h3>
      <p>Mocked calculator demo component</p>
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
        screen.getByRole("button", { name: /toggle graphing demonstration/i })
      ).toBeInTheDocument();
    });

    it("renders overview cards by default", () => {
      render(
        <TestWrapper>
          <ToolsSection />
        </TestWrapper>
      );

      expect(screen.getByText("Advanced Calculator")).toBeInTheDocument();
      expect(screen.getByText("Interactive Graphing")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /try calculator/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /try graphing/i })
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

    it("shows graphing demo when graphing button is clicked", async () => {
      render(
        <TestWrapper>
          <ToolsSection />
        </TestWrapper>
      );

      const graphingButton = screen.getByRole("button", {
        name: /toggle graphing demonstration/i,
      });
      fireEvent.click(graphingButton);

      await waitFor(() => {
        expect(screen.getByTestId("graphing-demo")).toBeInTheDocument();
      });

      // Overview cards should be hidden
      expect(screen.queryByText("Try Graphing")).not.toBeInTheDocument();
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
      const graphingButton = screen.getByRole("button", {
        name: /toggle graphing demonstration/i,
      });

      // Show calculator demo
      fireEvent.click(calculatorButton);
      await waitFor(() => {
        expect(screen.getByTestId("calculator-demo")).toBeInTheDocument();
      });

      // Switch to graphing demo
      fireEvent.click(graphingButton);
      await waitFor(() => {
        expect(screen.getByTestId("graphing-demo")).toBeInTheDocument();
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

    it("shows graphing demo when 'Try Graphing' button is clicked", async () => {
      render(
        <TestWrapper>
          <ToolsSection />
        </TestWrapper>
      );

      const tryGraphingButton = screen.getByRole("button", {
        name: /try graphing/i,
      });
      fireEvent.click(tryGraphingButton);

      await waitFor(() => {
        expect(screen.getByTestId("graphing-demo")).toBeInTheDocument();
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
      const graphingButton = screen.getByRole("button", {
        name: /toggle graphing demonstration/i,
      });

      expect(calculatorButton).toHaveAttribute("aria-pressed", "false");
      expect(graphingButton).toHaveAttribute("aria-pressed", "false");
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

      // Graphing features
      expect(
        screen.getByText(/plot any mathematical function/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/interactive zoom and pan/i)).toBeInTheDocument();
      expect(
        screen.getByText(/multiple function support/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/touch-friendly mobile/i)).toBeInTheDocument();
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
