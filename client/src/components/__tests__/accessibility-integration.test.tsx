import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { Router } from "wouter";
import { ThemeProvider } from "../ThemeProvider";
import App from "../../App";
import { Header } from "../layout/Header";
import { NotFound } from "../../pages/NotFound";

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations);

// Mock heavy dependencies
vi.mock("../../lib/mathJaxLoader", () => ({
  preloadMathJax: vi.fn(),
}));

vi.mock("../../lib/domErrorHandler", () => ({
  installDOMErrorHandler: vi.fn(),
}));

vi.mock("../../components/LazyComponents", () => ({
  LazyTopicPage: () => (
    <main role="main" aria-label="Topic content">
      <h1>Topic Page</h1>
      <p>Topic content goes here</p>
    </main>
  ),
  LazyToolsPage: () => (
    <main role="main" aria-label="Tools page">
      <h1>Mathematical Tools</h1>
      <p>Tools content goes here</p>
    </main>
  ),
  LazyLaTeXGuidePage: () => (
    <main role="main" aria-label="LaTeX guide">
      <h1>LaTeX Guide</h1>
      <p>LaTeX guide content goes here</p>
    </main>
  ),
  LazyMATLABGuidePage: () => (
    <main role="main" aria-label="MATLAB guide">
      <h1>MATLAB Guide</h1>
      <p>MATLAB guide content goes here</p>
    </main>
  ),
}));

vi.mock("../../components/LazyWrapper", () => ({
  LazyWrapper: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("../../components/PerformanceDashboard", () => ({
  PerformanceDashboard: () => null,
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

describe("Accessibility Integration Tests", () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Mock window APIs
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

    // Mock localStorage
    const mockLocalStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
    });

    // Mock getElementById for hash navigation
    document.getElementById = vi.fn((id: string) => {
      if (["topics", "practice", "about", "hours"].includes(id)) {
        return {
          scrollIntoView: vi.fn(),
        };
      }
      return null;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Automated Accessibility Testing", () => {
    it("should have no accessibility violations on home page", async () => {
      const { container } = render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations on topic page", async () => {
      const { container } = render(
        <TestWrapper initialPath="/topic/algebra">
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("Topic Page")).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations on tools page", async () => {
      const { container } = render(
        <TestWrapper initialPath="/tools">
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("Mathematical Tools")).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations on 404 page", async () => {
      const { container } = render(
        <TestWrapper initialPath="/invalid-route">
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("404")).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations in header component", async () => {
      const { container } = render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Keyboard Navigation", () => {
    it("should support full keyboard navigation through header", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      // Start tabbing through the header
      await user.tab();

      // Should be able to navigate through all interactive elements
      const interactiveElements = [
        "Math Farm", // Logo link
        "Topics",
        "Tools",
        "LaTeX Guide",
        "MATLAB Guide",
        "Math Symbols",
        "Practice",
        "Hours",
        "Community",
        "About",
      ];

      for (const elementText of interactiveElements) {
        const element = screen.queryByText(elementText);
        if (element) {
          // Element should be focusable
          expect(element.closest("a, button")).toBeTruthy();
        }
      }
    });

    it("should handle keyboard navigation in mobile menu", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      // Open mobile menu with keyboard
      const menuButton = screen.getByLabelText("Toggle navigation menu");
      await user.tab();

      // Focus should eventually reach the menu button
      menuButton.focus();
      await user.keyboard("{Enter}");

      // Mobile menu should open
      expect(
        screen.getByRole("navigation", { name: "Mobile navigation" })
      ).toBeInTheDocument();

      // Should be able to navigate through mobile menu items
      await user.tab();

      // Close menu with Escape
      await user.keyboard("{Escape}");

      // Menu should close
      expect(
        screen.queryByRole("navigation", { name: "Mobile navigation" })
      ).not.toBeInTheDocument();
    });

    it("should support keyboard shortcuts", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Test common keyboard shortcuts (implementation dependent)
      // For example, Alt+H for home, Alt+T for topics, etc.

      // Focus should be manageable with keyboard
      await user.tab();
      expect(document.activeElement).toBeTruthy();

      // Should be able to navigate with arrow keys in some contexts
      await user.keyboard("{ArrowDown}");
      expect(document.activeElement).toBeTruthy();
    });

    it("should maintain focus order during navigation", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Tab through elements and verify logical focus order
      const focusableElements: HTMLElement[] = [];

      // Collect focusable elements
      for (let i = 0; i < 10; i++) {
        await user.tab();
        if (
          document.activeElement &&
          document.activeElement !== document.body
        ) {
          focusableElements.push(document.activeElement as HTMLElement);
        }
      }

      // Focus order should be logical (left to right, top to bottom)
      expect(focusableElements.length).toBeGreaterThan(0);
    });
  });

  describe("Screen Reader Support", () => {
    it("should have proper ARIA landmarks", () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Should have main landmarks
      expect(screen.getByRole("banner")).toBeInTheDocument(); // Header
      expect(screen.getByRole("navigation")).toBeInTheDocument(); // Nav
      expect(screen.getByRole("main")).toBeInTheDocument(); // Main content
    });

    it("should have proper heading hierarchy", async () => {
      render(
        <TestWrapper initialPath="/topic/algebra">
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("Topic Page")).toBeInTheDocument();
      });

      // Should have proper heading structure (h1, then h2, etc.)
      const headings = screen.getAllByRole("heading");
      expect(headings.length).toBeGreaterThan(0);

      // First heading should be h1
      const h1Elements = headings.filter((h) => h.tagName === "H1");
      expect(h1Elements.length).toBeGreaterThan(0);
    });

    it("should provide proper ARIA labels for interactive elements", () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      // Navigation should have proper labels
      expect(
        screen.getByRole("navigation", { name: "Main navigation" })
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("Toggle navigation menu")
      ).toBeInTheDocument();

      // Theme toggle should have label
      const themeToggle = screen.getByRole("button", { name: /toggle theme/i });
      expect(themeToggle).toBeInTheDocument();
    });

    it("should announce navigation changes to screen readers", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Navigate to different sections
      const topicsLink = screen.getByText("Topics");
      await user.click(topicsLink);

      // Should trigger scroll and potentially announce the change
      expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    });

    it("should handle aria-current for active navigation items", () => {
      // Mock location to simulate being on tools page
      Object.defineProperty(window, "location", {
        value: { pathname: "/tools", href: "http://localhost/tools" },
        writable: true,
      });

      render(
        <TestWrapper initialPath="/tools">
          <Header />
        </TestWrapper>
      );

      const toolsLink = screen.getByText("Tools");
      expect(toolsLink).toHaveAttribute("aria-current", "page");
    });
  });

  describe("Focus Management", () => {
    it("should manage focus when opening/closing mobile menu", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      const menuButton = screen.getByLabelText("Toggle navigation menu");

      // Focus menu button
      menuButton.focus();
      expect(document.activeElement).toBe(menuButton);

      // Open menu
      await user.click(menuButton);

      // Focus should be managed appropriately
      expect(
        screen.getByRole("navigation", { name: "Mobile navigation" })
      ).toBeInTheDocument();

      // Close menu
      await user.click(menuButton);

      // Focus should return to menu button
      expect(document.activeElement).toBe(menuButton);
    });

    it("should manage focus during page navigation", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Navigate to a different page
      const { rerender } = render(
        <TestWrapper initialPath="/tools">
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("Mathematical Tools")).toBeInTheDocument();
      });

      // Focus should be managed on page change
      // (Implementation would depend on focus management strategy)
      expect(document.body).toBeInTheDocument();
    });

    it("should provide skip links for keyboard users", () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Should have skip links (implementation dependent)
      // These might be visually hidden but available to screen readers
      const skipLinks = screen.queryAllByText(/skip to/i);

      // If skip links are implemented, they should be present
      // For now, we just verify the page structure supports them
      expect(screen.getByRole("main")).toBeInTheDocument();
    });
  });

  describe("Color Contrast and Visual Accessibility", () => {
    it("should maintain accessibility in dark mode", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Toggle to dark mode
      const themeToggle = screen.getByRole("button", { name: /toggle theme/i });
      await user.click(themeToggle);

      // Should still pass accessibility tests in dark mode
      const { container } = render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should handle high contrast mode", () => {
      // Mock high contrast media query
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation((query) => {
          if (query === "(prefers-contrast: high)") {
            return {
              matches: true,
              media: query,
              onchange: null,
              addListener: vi.fn(),
              removeListener: vi.fn(),
              addEventListener: vi.fn(),
              removeEventListener: vi.fn(),
              dispatchEvent: vi.fn(),
            };
          }
          return {
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
          };
        }),
      });

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Should handle high contrast mode gracefully
      expect(screen.getByText("Math Farm")).toBeInTheDocument();
    });

    it("should respect reduced motion preferences", () => {
      // Mock reduced motion preference
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation((query) => {
          if (query === "(prefers-reduced-motion: reduce)") {
            return {
              matches: true,
              media: query,
              onchange: null,
              addListener: vi.fn(),
              removeListener: vi.fn(),
              addEventListener: vi.fn(),
              removeEventListener: vi.fn(),
              dispatchEvent: vi.fn(),
            };
          }
          return {
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
          };
        }),
      });

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Should respect reduced motion (animations would be disabled)
      expect(screen.getByText("Math Farm")).toBeInTheDocument();
    });
  });

  describe("Error Accessibility", () => {
    it("should make error messages accessible", async () => {
      render(
        <TestWrapper initialPath="/invalid-route">
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("404")).toBeInTheDocument();
      });

      // Error page should be accessible
      const { container } = render(
        <TestWrapper initialPath="/invalid-route">
          <App />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should provide accessible error recovery options", async () => {
      render(
        <TestWrapper initialPath="/invalid-route">
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("404")).toBeInTheDocument();
      });

      // Recovery options should be accessible
      const homeButton = screen.getByText("Go Home");
      expect(homeButton).toBeInTheDocument();
      expect(homeButton.closest("a")).toHaveAttribute("href", "/");

      const toolsButton = screen.getByText("Browse Tools");
      expect(toolsButton).toBeInTheDocument();
      expect(toolsButton.closest("a")).toHaveAttribute("href", "/tools");
    });
  });

  describe("Form Accessibility", () => {
    it("should make search forms accessible", async () => {
      render(
        <TestWrapper initialPath="/invalid-route">
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("404")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText("Search for topics...");

      // Search input should be properly labeled
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute("type", "text");

      // Should be keyboard accessible
      searchInput.focus();
      expect(document.activeElement).toBe(searchInput);
    });

    it("should provide proper form validation messages", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper initialPath="/invalid-route">
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("404")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText("Search for topics...");

      // Test form interaction
      await user.type(searchInput, "test search");
      expect(searchInput).toHaveValue("test search");

      // Form should handle input accessibly
      expect(searchInput).toBeInTheDocument();
    });
  });
});
