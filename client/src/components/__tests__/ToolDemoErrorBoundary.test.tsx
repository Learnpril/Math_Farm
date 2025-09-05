import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ToolDemoErrorBoundary } from "../ToolDemoErrorBoundary";

// Mock console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleGroup = console.group;
const originalConsoleGroupEnd = console.groupEnd;

beforeEach(() => {
  console.error = vi.fn();
  console.warn = vi.fn();
  console.group = vi.fn();
  console.groupEnd = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.group = originalConsoleGroup;
  console.groupEnd = originalConsoleGroupEnd;
});

// Test component that throws different types of errors
const ThrowError: React.FC<{
  shouldThrow?: boolean;
  errorMessage?: string;
  errorType?: "jsxgraph" | "math" | "network" | "canvas" | "generic";
}> = ({
  shouldThrow = true,
  errorMessage = "Test error",
  errorType = "generic",
}) => {
  if (shouldThrow) {
    let message = errorMessage;

    switch (errorType) {
      case "jsxgraph":
        message = "JSXGraph initialization failed";
        break;
      case "math":
        message = "Math.js evaluation error";
        break;
      case "network":
        message = "Network fetch failed";
        break;
      case "canvas":
        message = "Canvas context not supported";
        break;
    }

    throw new Error(message);
  }
  return <div>Tool working correctly</div>;
};

describe("ToolDemoErrorBoundary", () => {
  it("renders children when there is no error", () => {
    render(
      <ToolDemoErrorBoundary toolName="Test Tool">
        <div>Tool content</div>
      </ToolDemoErrorBoundary>
    );

    expect(screen.getByText("Tool content")).toBeInTheDocument();
  });

  it("renders error UI when child component throws", () => {
    render(
      <ToolDemoErrorBoundary toolName="Test Tool">
        <ThrowError />
      </ToolDemoErrorBoundary>
    );

    expect(screen.getByText("Test Tool Unavailable")).toBeInTheDocument();
    expect(
      screen.getByText(
        /We're having trouble loading this interactive demonstration/
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("uses default tool name when not provided", () => {
    render(
      <ToolDemoErrorBoundary>
        <ThrowError />
      </ToolDemoErrorBoundary>
    );

    expect(
      screen.getByText("Interactive Tool Unavailable")
    ).toBeInTheDocument();
  });

  it("provides specific suggestions for JSXGraph errors", () => {
    render(
      <ToolDemoErrorBoundary toolName="Graphing Tool">
        <ThrowError errorType="jsxgraph" />
      </ToolDemoErrorBoundary>
    );

    expect(screen.getByText("Suggestions:")).toBeInTheDocument();
    expect(
      screen.getByText(/Try refreshing the page to reload JSXGraph/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Check if your browser supports modern JavaScript/)
    ).toBeInTheDocument();
  });

  it("provides specific suggestions for math errors", () => {
    render(
      <ToolDemoErrorBoundary toolName="Calculator">
        <ThrowError errorType="math" />
      </ToolDemoErrorBoundary>
    );

    expect(
      screen.getByText(/Verify the mathematical expression is valid/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Try a simpler calculation first/)
    ).toBeInTheDocument();
  });

  it("provides specific suggestions for network errors", () => {
    render(
      <ToolDemoErrorBoundary toolName="Online Tool">
        <ThrowError errorType="network" />
      </ToolDemoErrorBoundary>
    );

    expect(
      screen.getByText(/Check your internet connection/)
    ).toBeInTheDocument();
    expect(screen.getByText(/Try again in a few moments/)).toBeInTheDocument();
  });

  it("provides generic suggestions for unknown errors", () => {
    render(
      <ToolDemoErrorBoundary toolName="Generic Tool">
        <ThrowError errorType="generic" />
      </ToolDemoErrorBoundary>
    );

    expect(screen.getByText(/Try refreshing the page/)).toBeInTheDocument();
    expect(
      screen.getByText(/Check your browser console for more details/)
    ).toBeInTheDocument();
  });

  it("handles retry functionality", async () => {
    const TestComponent: React.FC = () => {
      const [shouldThrow, setShouldThrow] = React.useState(true);

      React.useEffect(() => {
        const timer = setTimeout(() => setShouldThrow(false), 100);
        return () => clearTimeout(timer);
      }, []);

      return <ThrowError shouldThrow={shouldThrow} />;
    };

    render(
      <ToolDemoErrorBoundary toolName="Retry Tool">
        <TestComponent />
      </ToolDemoErrorBoundary>
    );

    // Initially shows error
    expect(screen.getByText("Retry Tool Unavailable")).toBeInTheDocument();

    // Click retry button
    const retryButton = screen.getByText(/Try Again/);
    fireEvent.click(retryButton);

    // Should attempt to render children again
    await waitFor(() => {
      expect(
        screen.queryByText("Retry Tool Unavailable")
      ).not.toBeInTheDocument();
    });
  });

  it("limits retry attempts to 2", () => {
    render(
      <ToolDemoErrorBoundary toolName="Limited Retry Tool">
        <ThrowError />
      </ToolDemoErrorBoundary>
    );

    // Initial retry button should show 2 attempts left
    expect(screen.getByText(/Try Again \(2 left\)/)).toBeInTheDocument();

    // Click retry twice
    const retryButton = screen.getByText(/Try Again/);
    fireEvent.click(retryButton);
    fireEvent.click(retryButton);

    // After max retries, should show unavailable message
    expect(
      screen.getByText(/This tool demo is temporarily unavailable/)
    ).toBeInTheDocument();
    expect(screen.queryByText(/Try Again/)).not.toBeInTheDocument();
  });

  it("shows graceful degradation message", () => {
    render(
      <ToolDemoErrorBoundary toolName="Degraded Tool">
        <ThrowError />
      </ToolDemoErrorBoundary>
    );

    expect(
      screen.getByText(/While this interactive demo isn't working/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/you can still explore other tools/)
    ).toBeInTheDocument();
  });

  it("shows error details in development mode", () => {
    render(
      <ToolDemoErrorBoundary toolName="Dev Tool" showErrorDetails={true}>
        <ThrowError errorMessage="Development error details" />
      </ToolDemoErrorBoundary>
    );

    expect(screen.getByText("🔧 Technical Details")).toBeInTheDocument();

    // Click to expand details
    fireEvent.click(screen.getByText("🔧 Technical Details"));

    expect(screen.getByText("Error:")).toBeInTheDocument();
    expect(screen.getByText("Development error details")).toBeInTheDocument();
  });

  it("hides error details in production mode", () => {
    render(
      <ToolDemoErrorBoundary toolName="Prod Tool" showErrorDetails={false}>
        <ThrowError />
      </ToolDemoErrorBoundary>
    );

    expect(screen.queryByText("🔧 Technical Details")).not.toBeInTheDocument();
  });

  it("calls onError callback when error occurs", () => {
    const onError = vi.fn();

    render(
      <ToolDemoErrorBoundary toolName="Callback Tool" onError={onError}>
        <ThrowError errorMessage="Callback test error" />
      </ToolDemoErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Callback test error",
      }),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it("renders custom fallback when provided", () => {
    const customFallback = <div>Custom tool error message</div>;

    render(
      <ToolDemoErrorBoundary toolName="Custom Tool" fallback={customFallback}>
        <ThrowError />
      </ToolDemoErrorBoundary>
    );

    expect(screen.getByText("Custom tool error message")).toBeInTheDocument();
    expect(
      screen.queryByText("Custom Tool Unavailable")
    ).not.toBeInTheDocument();
  });

  it("logs tool-specific error analysis", () => {
    render(
      <ToolDemoErrorBoundary toolName="Analysis Tool">
        <ThrowError errorType="jsxgraph" />
      </ToolDemoErrorBoundary>
    );

    expect(console.error).toHaveBeenCalledWith(
      "ToolDemoErrorBoundary (Analysis Tool) caught an error:",
      expect.objectContaining({
        toolName: "Analysis Tool",
        error: "Error: JSXGraph initialization failed",
        timestamp: expect.any(String),
      })
    );

    expect(console.group).toHaveBeenCalledWith(
      "🔧 Tool Demo Error Analysis: Analysis Tool"
    );
    expect(console.error).toHaveBeenCalledWith("Category:", "JSXGraph Error");
    expect(console.groupEnd).toHaveBeenCalled();
  });

  it("handles reload page action", () => {
    // Mock window.location.reload
    const mockReload = vi.fn();
    Object.defineProperty(window, "location", {
      value: { reload: mockReload },
      writable: true,
    });

    render(
      <ToolDemoErrorBoundary toolName="Reload Tool">
        <ThrowError />
      </ToolDemoErrorBoundary>
    );

    fireEvent.click(screen.getByText("Reload Page"));
    expect(mockReload).toHaveBeenCalled();
  });

  it("has proper accessibility attributes", () => {
    render(
      <ToolDemoErrorBoundary toolName="Accessible Tool">
        <ThrowError />
      </ToolDemoErrorBoundary>
    );

    const errorContainer = screen.getByRole("alert");
    expect(errorContainer).toHaveAttribute("aria-live", "polite");

    // Check that buttons have proper labels
    expect(screen.getByText(/Try Again/)).toBeInTheDocument();
    expect(screen.getByText("Reload Page")).toBeInTheDocument();
  });

  it("categorizes different error types correctly", () => {
    const errorTypes = [
      { type: "jsxgraph" as const, expectedCategory: "JSXGraph Error" },
      { type: "math" as const, expectedCategory: "Math.js Error" },
      { type: "network" as const, expectedCategory: "Network Error" },
      { type: "canvas" as const, expectedCategory: "Graphics Error" },
    ];

    errorTypes.forEach(({ type, expectedCategory }) => {
      const { unmount } = render(
        <ToolDemoErrorBoundary toolName={`${type} Tool`}>
          <ThrowError errorType={type} />
        </ToolDemoErrorBoundary>
      );

      expect(console.error).toHaveBeenCalledWith("Category:", expectedCategory);
      unmount();
    });
  });

  it("maintains error state across re-renders", () => {
    const { rerender } = render(
      <ToolDemoErrorBoundary toolName="Persistent Tool">
        <ThrowError />
      </ToolDemoErrorBoundary>
    );

    expect(screen.getByText("Persistent Tool Unavailable")).toBeInTheDocument();

    // Re-render with same error
    rerender(
      <ToolDemoErrorBoundary toolName="Persistent Tool">
        <ThrowError />
      </ToolDemoErrorBoundary>
    );

    expect(screen.getByText("Persistent Tool Unavailable")).toBeInTheDocument();
  });
});
