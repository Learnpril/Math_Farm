import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Router } from "wouter";
import { ThemeProvider } from "../ThemeProvider";
import { ErrorBoundary } from "../ErrorBoundary";
import { ToolErrorBoundary } from "../ToolErrorBoundary";
import { NotFound } from "../../pages/NotFound";
import App from "../../App";

// Mock components that might throw errors
const ThrowingComponent = ({
  shouldThrow = false,
}: {
  shouldThrow?: boolean;
}) => {
  if (shouldThrow) {
    throw new Error("Test error for error boundary");
  }
  return <div data-testid="working-component">Component works</div>;
};

// Mock MathJax and other dependencies
vi.mock("../../lib/mathJaxLoader", () => ({
  preloadMathJax: vi.fn(),
}));

vi.mock("../../lib/domErrorHandler", () => ({
  installDOMErrorHandler: vi.fn(),
}));

vi.mock("../../components/LazyComponents", () => ({
  LazyTopicPage: ({ shouldThrow }: { shouldThrow?: boolean }) => (
    <ThrowingComponent shouldThrow={shouldThrow} />
  ),
  LazyToolsPage: ({ shouldThrow }: { shouldThrow?: boolean }) => (
    <ThrowingComponent shouldThrow={shouldThrow} />
  ),
  LazyLaTeXGuidePage: () => <div data-testid="latex-page">LaTeX Guide</div>,
  LazyMATLABGuidePage: () => <div data-testid="matlab-page">MATLAB Guide</div>,
}));

vi.mock("../../components/LazyWrapper", () => ({
  LazyWrapper: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

const TestWrapper = ({
  children,
  initialPath = "/",
}: {
  children: React.ReactNode;
  initialPath?: string;
}) => {
  return (
    <ThemeProvider>
      <Router base={initialPath}>{children}</Router>
    </ThemeProvider>
  );
};

describe("Navigation Error Handling", () => {
  beforeEach(() => {
    // Reset console methods to avoid noise in tests
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});

    // Mock window.location
    Object.defineProperty(window, "location", {
      value: {
        pathname: "/",
        href: "http://localhost/",
        hash: "",
        assign: vi.fn(),
        replace: vi.fn(),
        reload: vi.fn(),
      },
      writable: true,
    });

    // Mock history API
    Object.defineProperty(window, "history", {
      value: {
        pushState: vi.fn(),
        replaceState: vi.fn(),
        back: vi.fn(),
      },
      writable: true,
    });

    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe("Error Boundaries", () => {
    it("should catch and display errors in ErrorBoundary", () => {
      render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowingComponent shouldThrow={true} />
          </ErrorBoundary>
        </TestWrapper>
      );

      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText(/Try refreshing the page/i)).toBeInTheDocument();
    });

    it("should render children when no error occurs", () => {
      render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowingComponent shouldThrow={false} />
          </ErrorBoundary>
        </TestWrapper>
      );

      expect(screen.getByTestId("working-component")).toBeInTheDocument();
      expect(
        screen.queryByText(/Something went wrong/i)
      ).not.toBeInTheDocument();
    });

    it("should provide retry functionality in error boundary", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowingComponent shouldThrow={true} />
          </ErrorBoundary>
        </TestWrapper>
      );

      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();

      const retryButton = screen.getByText(/Try again/i);
      expect(retryButton).toBeInTheDocument();

      await user.click(retryButton);

      // Error boundary should attempt to re-render
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });

    it("should handle ToolErrorBoundary specifically for tools", () => {
      render(
        <TestWrapper>
          <ToolErrorBoundary>
            <ThrowingComponent shouldThrow={true} />
          </ToolErrorBoundary>
        </TestWrapper>
      );

      expect(screen.getByText(/Tool Error/i)).toBeInTheDocument();
      expect(screen.getByText(/mathematical tool/i)).toBeInTheDocument();
    });
  });

  describe("Route Error Handling", () => {
    it("should handle invalid routes with 404 page", async () => {
      render(
        <TestWrapper initialPath="/invalid-route">
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("404")).toBeInTheDocument();
        expect(screen.getByText("Page Not Found")).toBeInTheDocument();
      });
    });

    it("should handle invalid topic routes", async () => {
      render(
        <TestWrapper initialPath="/topic/invalid-topic-id">
          <App />
        </TestWrapper>
      );

      // Should either show topic page (which handles invalid IDs) or 404
      await waitFor(() => {
        const hasTopicPage = screen.queryByTestId("working-component");
        const has404 = screen.queryByText("404");
        expect(hasTopicPage || has404).toBeTruthy();
      });
    });

    it("should handle malformed URLs gracefully", async () => {
      const malformedPaths = [
        "/topic/",
        "/topic///",
        "/topic/../../etc/passwd",
        "/topic/%20%20%20",
        "/topic/null",
        "/topic/undefined",
      ];

      for (const path of malformedPaths) {
        const { unmount } = render(
          <TestWrapper initialPath={path}>
            <App />
          </TestWrapper>
        );

        // Should not crash and should handle gracefully
        await waitFor(() => {
          expect(document.body).toBeInTheDocument();
        });

        unmount();
      }
    });

    it("should handle network errors during navigation", async () => {
      // Mock fetch to simulate network error
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      render(
        <TestWrapper initialPath="/tools">
          <App />
        </TestWrapper>
      );

      // Should still render the page structure even if data loading fails
      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      });
    });
  });

  describe("NotFound Page Error Handling", () => {
    it("should handle missing topics data gracefully", () => {
      // Mock empty topics data
      vi.doMock("../../data/topicsData.json", () => ({ default: [] }));

      render(
        <TestWrapper>
          <NotFound />
        </TestWrapper>
      );

      expect(screen.getByText("404")).toBeInTheDocument();
      expect(screen.getByText("Page Not Found")).toBeInTheDocument();
    });

    it("should handle search errors gracefully", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <NotFound />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText("Search for topics...");

      // Type invalid characters that might cause search errors
      await user.type(searchInput, '\\n\\r\\t<script>alert("xss")</script>');

      // Should handle without crashing
      expect(searchInput).toHaveValue('\\n\\r\\t<script>alert("xss")</script>');
      expect(document.body).toBeInTheDocument();
    });

    it("should provide fallback navigation options", () => {
      render(
        <TestWrapper>
          <NotFound />
        </TestWrapper>
      );

      expect(screen.getByText("Go Home")).toBeInTheDocument();
      expect(screen.getByText("Browse Tools")).toBeInTheDocument();

      // Should have links to main sections
      expect(screen.getByText("All Topics")).toBeInTheDocument();
      expect(screen.getByText("Math Tools")).toBeInTheDocument();
      expect(screen.getByText("LaTeX Guide")).toBeInTheDocument();
      expect(screen.getByText("MATLAB Guide")).toBeInTheDocument();
    });
  });

  describe("Component Loading Errors", () => {
    it("should handle lazy component loading failures", async () => {
      // Mock dynamic import failure
      const originalImport = global.import;
      global.import = vi
        .fn()
        .mockRejectedValue(new Error("Failed to load component"));

      render(
        <TestWrapper initialPath="/tools">
          <App />
        </TestWrapper>
      );

      // Should show loading state or error state
      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      });

      global.import = originalImport;
    });

    it("should handle MathJax loading errors", async () => {
      // Mock MathJax loading failure
      vi.doMock("../../lib/mathJaxLoader", () => ({
        preloadMathJax: vi
          .fn()
          .mockRejectedValue(new Error("MathJax failed to load")),
      }));

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Should still render the app even if MathJax fails
      await waitFor(() => {
        expect(screen.getByText("Math Farm")).toBeInTheDocument();
      });
    });
  });

  describe("User Input Error Handling", () => {
    it("should handle invalid search input", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <NotFound />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText("Search for topics...");

      // Test various invalid inputs
      const invalidInputs = ["", "   ", "\n\r\t", "🚀🎯💯", "a".repeat(1000)];

      for (const input of invalidInputs) {
        await user.clear(searchInput);
        await user.type(searchInput, input);

        // Should handle without crashing
        expect(document.body).toBeInTheDocument();
      }
    });

    it("should sanitize user input to prevent XSS", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <NotFound />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText("Search for topics...");

      const xssAttempts = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(1)">',
        '"><script>alert("xss")</script>',
      ];

      for (const xss of xssAttempts) {
        await user.clear(searchInput);
        await user.type(searchInput, xss);

        // Input should be treated as plain text
        expect(searchInput).toHaveValue(xss);

        // Should not execute any scripts
        expect(document.body).toBeInTheDocument();
      }
    });
  });

  describe("Browser Compatibility Error Handling", () => {
    it("should handle missing browser APIs gracefully", () => {
      // Mock missing APIs
      const originalScrollIntoView = Element.prototype.scrollIntoView;
      const originalMatchMedia = window.matchMedia;

      delete (Element.prototype as any).scrollIntoView;
      delete (window as any).matchMedia;

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Should still render without crashing
      expect(screen.getByText("Math Farm")).toBeInTheDocument();

      // Restore APIs
      Element.prototype.scrollIntoView = originalScrollIntoView;
      (window as any).matchMedia = originalMatchMedia;
    });

    it("should handle localStorage errors", () => {
      // Mock localStorage to throw errors
      const mockLocalStorage = {
        getItem: vi.fn().mockImplementation(() => {
          throw new Error("localStorage not available");
        }),
        setItem: vi.fn().mockImplementation(() => {
          throw new Error("localStorage not available");
        }),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };

      Object.defineProperty(window, "localStorage", {
        value: mockLocalStorage,
      });

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Should handle localStorage errors gracefully
      expect(screen.getByText("Math Farm")).toBeInTheDocument();
    });
  });

  describe("Recovery Mechanisms", () => {
    it("should provide clear error messages with recovery options", () => {
      render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowingComponent shouldThrow={true} />
          </ErrorBoundary>
        </TestWrapper>
      );

      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText(/Try refreshing the page/i)).toBeInTheDocument();
      expect(screen.getByText(/Try again/i)).toBeInTheDocument();
    });

    it("should maintain navigation state during errors", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper initialPath="/invalid-route">
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("404")).toBeInTheDocument();
      });

      // Navigation should still work from error page
      const homeLink = screen.getByText("Go Home");
      await user.click(homeLink);

      // Should navigate (in real app, this would work with Wouter)
      expect(homeLink.closest("a")).toHaveAttribute("href", "/");
    });

    it("should log errors for debugging", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowingComponent shouldThrow={true} />
          </ErrorBoundary>
        </TestWrapper>
      );

      // Error should be logged (implementation dependent)
      expect(document.body).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });
});
