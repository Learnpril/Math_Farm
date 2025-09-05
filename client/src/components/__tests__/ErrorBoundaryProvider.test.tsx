import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  ErrorBoundaryProvider,
  useErrorBoundary,
  useThrowError,
  ErrorBoundaryTester,
} from "../ErrorBoundaryProvider";
import { ErrorCategory, ErrorSeverity } from "../../lib/errorLogging";

// Mock console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

beforeEach(() => {
  console.error = vi.fn();
  console.warn = vi.fn();
  console.log = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
});

// Test component that uses the error boundary context
const TestComponent: React.FC = () => {
  const {
    logError,
    logPerformanceIssue,
    logLibraryFailure,
    getErrors,
    clearErrors,
  } = useErrorBoundary();

  return (
    <div>
      <button
        onClick={() =>
          logError(
            new Error("Test error"),
            ErrorCategory.MATH_RENDERING,
            ErrorSeverity.HIGH
          )
        }
      >
        Log Error
      </button>
      <button
        onClick={() => logPerformanceIssue("Slow loading", "LCP", 3000, 2500)}
      >
        Log Performance Issue
      </button>
      <button
        onClick={() => logLibraryFailure("MathJax", new Error("Load failed"))}
      >
        Log Library Failure
      </button>
      <button onClick={clearErrors}>Clear Errors</button>
      <div>Error count: {getErrors().length}</div>
    </div>
  );
};

// Test component that throws an error
const ThrowErrorComponent: React.FC = () => {
  const throwError = useThrowError();

  return (
    <button onClick={() => throwError(new Error("Thrown error"))}>
      Throw Error
    </button>
  );
};

describe("ErrorBoundaryProvider", () => {
  it("provides error boundary context to children", () => {
    render(
      <ErrorBoundaryProvider>
        <TestComponent />
      </ErrorBoundaryProvider>
    );

    expect(screen.getByText("Error count: 0")).toBeInTheDocument();
    expect(screen.getByText("Log Error")).toBeInTheDocument();
  });

  it("throws error when useErrorBoundary is used outside provider", () => {
    // Suppress console.error for this test since we expect an error
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useErrorBoundary must be used within an ErrorBoundaryProvider");

    console.error = originalError;
  });

  it("logs errors through context methods", () => {
    render(
      <ErrorBoundaryProvider>
        <TestComponent />
      </ErrorBoundaryProvider>
    );

    fireEvent.click(screen.getByText("Log Error"));
    expect(screen.getByText("Error count: 1")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Log Performance Issue"));
    expect(screen.getByText("Error count: 2")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Log Library Failure"));
    expect(screen.getByText("Error count: 3")).toBeInTheDocument();
  });

  it("clears errors through context method", () => {
    render(
      <ErrorBoundaryProvider>
        <TestComponent />
      </ErrorBoundaryProvider>
    );

    fireEvent.click(screen.getByText("Log Error"));
    expect(screen.getByText("Error count: 1")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Clear Errors"));
    expect(screen.getByText("Error count: 0")).toBeInTheDocument();
  });

  it("handles global unhandled errors", async () => {
    const onGlobalError = vi.fn();

    render(
      <ErrorBoundaryProvider onGlobalError={onGlobalError}>
        <TestComponent />
      </ErrorBoundaryProvider>
    );

    // Simulate unhandled error
    const errorEvent = new ErrorEvent("error", {
      error: new Error("Unhandled error"),
      message: "Unhandled error",
      filename: "test.js",
      lineno: 10,
      colno: 5,
    });

    window.dispatchEvent(errorEvent);

    await waitFor(() => {
      expect(onGlobalError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Unhandled error",
        }),
        expect.any(String)
      );
    });
  });

  it("handles unhandled promise rejections", async () => {
    const onGlobalError = vi.fn();

    render(
      <ErrorBoundaryProvider onGlobalError={onGlobalError}>
        <TestComponent />
      </ErrorBoundaryProvider>
    );

    // Simulate unhandled promise rejection
    const rejectionEvent = new PromiseRejectionEvent("unhandledrejection", {
      promise: Promise.reject(new Error("Promise rejection")),
      reason: new Error("Promise rejection"),
    });

    window.dispatchEvent(rejectionEvent);

    await waitFor(() => {
      expect(onGlobalError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Promise rejection",
        }),
        expect.any(String)
      );
    });
  });

  it("handles string-based promise rejections", async () => {
    const onGlobalError = vi.fn();

    render(
      <ErrorBoundaryProvider onGlobalError={onGlobalError}>
        <TestComponent />
      </ErrorBoundaryProvider>
    );

    // Simulate unhandled promise rejection with string reason
    const rejectionEvent = new PromiseRejectionEvent("unhandledrejection", {
      promise: Promise.reject("String rejection"),
      reason: "String rejection",
    });

    window.dispatchEvent(rejectionEvent);

    await waitFor(() => {
      expect(onGlobalError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "String rejection",
        }),
        expect.any(String)
      );
    });
  });

  it("prevents default error handling in development mode", () => {
    const preventDefault = vi.fn();

    render(
      <ErrorBoundaryProvider isDevelopment={true}>
        <TestComponent />
      </ErrorBoundaryProvider>
    );

    const errorEvent = new ErrorEvent("error", {
      error: new Error("Dev error"),
    });
    errorEvent.preventDefault = preventDefault;

    window.dispatchEvent(errorEvent);

    expect(preventDefault).toHaveBeenCalled();
  });

  it("does not prevent default error handling in production mode", () => {
    const preventDefault = vi.fn();

    render(
      <ErrorBoundaryProvider isDevelopment={false}>
        <TestComponent />
      </ErrorBoundaryProvider>
    );

    const errorEvent = new ErrorEvent("error", {
      error: new Error("Prod error"),
    });
    errorEvent.preventDefault = preventDefault;

    window.dispatchEvent(errorEvent);

    expect(preventDefault).not.toHaveBeenCalled();
  });

  it("cleans up event listeners on unmount", () => {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = render(
      <ErrorBoundaryProvider>
        <TestComponent />
      </ErrorBoundaryProvider>
    );

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "error",
      expect.any(Function)
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "unhandledrejection",
      expect.any(Function)
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "error",
      expect.any(Function)
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "unhandledrejection",
      expect.any(Function)
    );

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});

describe("useThrowError", () => {
  it("allows manual error throwing for testing", () => {
    // We need an error boundary to catch the thrown error
    class TestErrorBoundary extends React.Component<
      { children: React.ReactNode },
      { hasError: boolean }
    > {
      constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
      }

      static getDerivedStateFromError() {
        return { hasError: true };
      }

      render() {
        if (this.state.hasError) {
          return <div>Error caught</div>;
        }
        return this.props.children;
      }
    }

    render(
      <ErrorBoundaryProvider>
        <TestErrorBoundary>
          <ThrowErrorComponent />
        </TestErrorBoundary>
      </ErrorBoundaryProvider>
    );

    fireEvent.click(screen.getByText("Throw Error"));
    expect(screen.getByText("Error caught")).toBeInTheDocument();
  });
});

describe("ErrorBoundaryTester", () => {
  // Mock NODE_ENV for development mode
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = "development";
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("renders testing panel in development mode", () => {
    render(
      <ErrorBoundaryProvider>
        <ErrorBoundaryTester>
          <div>App content</div>
        </ErrorBoundaryTester>
      </ErrorBoundaryProvider>
    );

    expect(screen.getByText("🔧 Error Testing")).toBeInTheDocument();
    expect(screen.getByText("Test Error Boundary")).toBeInTheDocument();
    expect(screen.getByText("Test Async Error")).toBeInTheDocument();
    expect(screen.getByText(/Export Errors/)).toBeInTheDocument();
    expect(screen.getByText("Clear Errors")).toBeInTheDocument();
  });

  it("does not render testing panel in production mode", () => {
    process.env.NODE_ENV = "production";

    render(
      <ErrorBoundaryProvider>
        <ErrorBoundaryTester>
          <div>App content</div>
        </ErrorBoundaryTester>
      </ErrorBoundaryProvider>
    );

    expect(screen.queryByText("🔧 Error Testing")).not.toBeInTheDocument();
    expect(screen.getByText("App content")).toBeInTheDocument();
  });

  it("handles async error testing", async () => {
    render(
      <ErrorBoundaryProvider>
        <ErrorBoundaryTester>
          <div>App content</div>
        </ErrorBoundaryTester>
      </ErrorBoundaryProvider>
    );

    fireEvent.click(screen.getByText("Test Async Error"));

    // Wait for async error to be logged
    await waitFor(() => {
      expect(screen.getByText(/Export Errors \(1\)/)).toBeInTheDocument();
    });
  });

  it("exports errors as downloadable file", () => {
    // Mock URL.createObjectURL and related methods
    const mockCreateObjectURL = vi.fn(() => "mock-url");
    const mockRevokeObjectURL = vi.fn();
    const mockClick = vi.fn();
    const mockAppendChild = vi.fn();
    const mockRemoveChild = vi.fn();

    Object.defineProperty(URL, "createObjectURL", {
      value: mockCreateObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      value: mockRevokeObjectURL,
    });

    const mockAnchor = {
      href: "",
      download: "",
      click: mockClick,
    };

    vi.spyOn(document, "createElement").mockReturnValue(mockAnchor as any);
    vi.spyOn(document.body, "appendChild").mockImplementation(mockAppendChild);
    vi.spyOn(document.body, "removeChild").mockImplementation(mockRemoveChild);

    render(
      <ErrorBoundaryProvider>
        <ErrorBoundaryTester>
          <div>App content</div>
        </ErrorBoundaryTester>
      </ErrorBoundaryProvider>
    );

    // First log an error
    fireEvent.click(screen.getByText("Test Async Error"));

    // Then export errors
    fireEvent.click(screen.getByText(/Export Errors/));

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalledWith("mock-url");
  });
});
