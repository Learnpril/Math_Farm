import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HomePageErrorBoundary } from "../HomePageErrorBoundary";

// Mock console methods to avoid noise in tests
const originalConsoleError = console.error;
const originalConsoleGroup = console.group;
const originalConsoleTable = console.table;
const originalConsoleGroupEnd = console.groupEnd;

beforeEach(() => {
  console.error = vi.fn();
  console.group = vi.fn();
  console.table = vi.fn();
  console.groupEnd = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  console.group = originalConsoleGroup;
  console.table = originalConsoleTable;
  console.groupEnd = originalConsoleGroupEnd;
});

// Test component that throws an error
const ThrowError: React.FC<{
  shouldThrow?: boolean;
  errorMessage?: string;
}> = ({ shouldThrow = true, errorMessage = "Test error" }) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div>No error</div>;
};

describe("HomePageErrorBoundary", () => {
  it("renders children when there is no error", () => {
    render(
      <HomePageErrorBoundary>
        <div>Test content</div>
      </HomePageErrorBoundary>
    );

    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("renders error UI when child component throws", () => {
    render(
      <HomePageErrorBoundary>
        <ThrowError />
      </HomePageErrorBoundary>
    );

    expect(screen.getByText("Oops! Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText(/We encountered an unexpected error/)
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("displays troubleshooting steps", () => {
    render(
      <HomePageErrorBoundary>
        <ThrowError />
      </HomePageErrorBoundary>
    );

    expect(screen.getByText("Try these steps:")).toBeInTheDocument();
    expect(
      screen.getByText(/Refresh the page to reload all resources/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Check your internet connection/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Clear your browser cache and cookies/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Try using a different browser/)
    ).toBeInTheDocument();
  });

  it("provides action buttons", () => {
    render(
      <HomePageErrorBoundary>
        <ThrowError />
      </HomePageErrorBoundary>
    );

    expect(screen.getByText(/Try Again/)).toBeInTheDocument();
    expect(screen.getByText("Reload Page")).toBeInTheDocument();
    expect(screen.getByText("Go to Home")).toBeInTheDocument();
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
      <HomePageErrorBoundary>
        <TestComponent />
      </HomePageErrorBoundary>
    );

    // Initially shows error
    expect(screen.getByText("Oops! Something went wrong")).toBeInTheDocument();

    // Click retry button
    const retryButton = screen.getByText(/Try Again/);
    fireEvent.click(retryButton);

    // Should attempt to render children again
    await waitFor(() => {
      expect(
        screen.queryByText("Oops! Something went wrong")
      ).not.toBeInTheDocument();
    });
  });

  it("limits retry attempts", () => {
    render(
      <HomePageErrorBoundary>
        <ThrowError />
      </HomePageErrorBoundary>
    );

    // Initial retry button should show 3 attempts left
    expect(
      screen.getByText(/Try Again \(3 attempts left\)/)
    ).toBeInTheDocument();

    // Click retry multiple times
    const retryButton = screen.getByText(/Try Again/);
    fireEvent.click(retryButton);
    fireEvent.click(retryButton);
    fireEvent.click(retryButton);

    // After max retries, should show warning
    expect(
      screen.getByText(/Maximum retry attempts reached/)
    ).toBeInTheDocument();
    expect(screen.queryByText(/Try Again/)).not.toBeInTheDocument();
  });

  it("shows error details in development mode", () => {
    render(
      <HomePageErrorBoundary showErrorDetails={true}>
        <ThrowError errorMessage="Detailed test error" />
      </HomePageErrorBoundary>
    );

    expect(
      screen.getByText("🔧 Error Details (Development Mode)")
    ).toBeInTheDocument();

    // Click to expand details
    fireEvent.click(screen.getByText("🔧 Error Details (Development Mode)"));

    expect(screen.getByText("Error Message:")).toBeInTheDocument();
    expect(screen.getByText("Detailed test error")).toBeInTheDocument();
  });

  it("hides error details in production mode", () => {
    render(
      <HomePageErrorBoundary showErrorDetails={false}>
        <ThrowError />
      </HomePageErrorBoundary>
    );

    expect(
      screen.queryByText("🔧 Error Details (Development Mode)")
    ).not.toBeInTheDocument();
  });

  it("calls onError callback when error occurs", () => {
    const onError = vi.fn();

    render(
      <HomePageErrorBoundary onError={onError}>
        <ThrowError errorMessage="Callback test error" />
      </HomePageErrorBoundary>
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
    const customFallback = <div>Custom error message</div>;

    render(
      <HomePageErrorBoundary fallback={customFallback}>
        <ThrowError />
      </HomePageErrorBoundary>
    );

    expect(screen.getByText("Custom error message")).toBeInTheDocument();
    expect(
      screen.queryByText("Oops! Something went wrong")
    ).not.toBeInTheDocument();
  });

  it("logs error information to console", () => {
    render(
      <HomePageErrorBoundary>
        <ThrowError errorMessage="Console test error" />
      </HomePageErrorBoundary>
    );

    expect(console.error).toHaveBeenCalledWith(
      "HomePageErrorBoundary caught an error:",
      expect.objectContaining({
        error: "Error: Console test error",
        timestamp: expect.any(String),
        userAgent: expect.any(String),
        url: expect.any(String),
      })
    );

    expect(console.group).toHaveBeenCalledWith("🚨 Home Page Error Report");
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
      <HomePageErrorBoundary>
        <ThrowError />
      </HomePageErrorBoundary>
    );

    fireEvent.click(screen.getByText("Reload Page"));
    expect(mockReload).toHaveBeenCalled();
  });

  it("handles go to home action", () => {
    // Mock window.location.href
    const mockLocation = { href: "" };
    Object.defineProperty(window, "location", {
      value: mockLocation,
      writable: true,
    });

    render(
      <HomePageErrorBoundary>
        <ThrowError />
      </HomePageErrorBoundary>
    );

    fireEvent.click(screen.getByText("Go to Home"));
    expect(mockLocation.href).toBe("/");
  });

  it("has proper accessibility attributes", () => {
    render(
      <HomePageErrorBoundary>
        <ThrowError />
      </HomePageErrorBoundary>
    );

    const errorContainer = screen.getByRole("alert");
    expect(errorContainer).toHaveAttribute("aria-live", "assertive");

    // Check that buttons have proper labels
    expect(screen.getByText(/Try Again/)).toBeInTheDocument();
    expect(screen.getByText("Reload Page")).toBeInTheDocument();
    expect(screen.getByText("Go to Home")).toBeInTheDocument();
  });

  it("maintains error state across re-renders", () => {
    const { rerender } = render(
      <HomePageErrorBoundary>
        <ThrowError />
      </HomePageErrorBoundary>
    );

    expect(screen.getByText("Oops! Something went wrong")).toBeInTheDocument();

    // Re-render with same error
    rerender(
      <HomePageErrorBoundary>
        <ThrowError />
      </HomePageErrorBoundary>
    );

    expect(screen.getByText("Oops! Something went wrong")).toBeInTheDocument();
  });
});
