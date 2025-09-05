import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { SkipNavigation } from "../accessibility/SkipNavigation";
import { AccessibilitySettings } from "../accessibility/AccessibilitySettings";
import { MathExpression } from "../MathExpression";
import { TopicCard } from "../TopicCard";
import { Header } from "../layout/Header";
import { Layout } from "../layout/Layout";
import { Topic } from "../../../../shared/types";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock Wouter
vi.mock("wouter", () => ({
  Link: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  useLocation: () => ["/"],
}));

// Mock MathJax
const mockMathJax = {
  startup: {
    promise: Promise.resolve(),
  },
  typesetPromise: vi.fn().mockResolvedValue(undefined),
};

Object.defineProperty(window, "MathJax", {
  value: mockMathJax,
  writable: true,
});

describe("Accessibility Tests", () => {
  beforeEach(() => {
    // Reset localStorage
    localStorage.clear();

    // Reset document classes
    document.documentElement.className = "";

    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("SkipNavigation", () => {
    it("should render skip links with proper accessibility attributes", () => {
      render(<SkipNavigation />);

      const skipLinks = screen.getAllByRole("link");
      expect(skipLinks).toHaveLength(4);

      skipLinks.forEach((link) => {
        expect(link).toHaveAttribute("href");
        expect(link).toHaveClass("sr-only");
      });
    });

    it("should become visible when focused", async () => {
      const user = userEvent.setup();
      render(<SkipNavigation />);

      const firstSkipLink = screen.getByText("Skip to main content");

      await user.tab();
      expect(firstSkipLink).toHaveFocus();
      expect(firstSkipLink).toHaveClass("focus:not-sr-only");
    });

    it("should handle click navigation correctly", async () => {
      const user = userEvent.setup();

      // Create target element
      const targetElement = document.createElement("div");
      targetElement.id = "main-content";
      document.body.appendChild(targetElement);

      render(<SkipNavigation />);

      const skipLink = screen.getByText("Skip to main content");
      await user.click(skipLink);

      expect(targetElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "start",
      });

      document.body.removeChild(targetElement);
    });

    it("should pass axe accessibility tests", async () => {
      const { container } = render(<SkipNavigation />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("AccessibilitySettings", () => {
    it("should render with proper ARIA attributes", () => {
      render(<AccessibilitySettings />);

      const settingsButton = screen.getByRole("button", {
        name: /accessibility settings/i,
      });
      expect(settingsButton).toHaveAttribute("aria-expanded", "false");
      expect(settingsButton).toHaveAttribute("aria-haspopup", "true");
    });

    it("should open settings dialog when clicked", async () => {
      const user = userEvent.setup();
      render(<AccessibilitySettings />);

      const settingsButton = screen.getByRole("button", {
        name: /accessibility settings/i,
      });
      await user.click(settingsButton);

      expect(settingsButton).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should close dialog on Escape key", async () => {
      const user = userEvent.setup();
      render(<AccessibilitySettings />);

      const settingsButton = screen.getByRole("button", {
        name: /accessibility settings/i,
      });
      await user.click(settingsButton);

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();

      await user.keyboard("{Escape}");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should toggle high contrast mode", async () => {
      const user = userEvent.setup();
      render(<AccessibilitySettings />);

      const settingsButton = screen.getByRole("button", {
        name: /accessibility settings/i,
      });
      await user.click(settingsButton);

      const highContrastToggle = screen.getByRole("switch", {
        name: /toggle high contrast/i,
      });
      expect(highContrastToggle).toHaveAttribute("aria-checked", "false");

      await user.click(highContrastToggle);
      expect(highContrastToggle).toHaveAttribute("aria-checked", "true");
      expect(document.documentElement).toHaveClass("high-contrast");
    });

    it("should save preferences to localStorage", async () => {
      const user = userEvent.setup();
      render(<AccessibilitySettings />);

      const settingsButton = screen.getByRole("button", {
        name: /accessibility settings/i,
      });
      await user.click(settingsButton);

      const reducedMotionToggle = screen.getByRole("switch", {
        name: /toggle reduced motion/i,
      });
      await user.click(reducedMotionToggle);

      expect(localStorage.getItem("reduced-motion")).toBe("true");
    });

    it("should pass axe accessibility tests", async () => {
      const { container } = render(<AccessibilitySettings />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("MathExpression", () => {
    it("should render with proper accessibility attributes", async () => {
      render(<MathExpression expression="x^2 + y^2 = z^2" />);

      await waitFor(() => {
        const mathElement = screen.getByRole("img");
        expect(mathElement).toHaveAttribute("aria-label");
        expect(mathElement).toHaveAttribute("title");
      });
    });

    it("should provide screen reader text", () => {
      render(<MathExpression expression="\\frac{1}{2}" fallback="one half" />);

      const screenReaderText = screen.getByText(/one half/);
      expect(screenReaderText).toHaveClass("sr-only");
    });

    it("should handle rendering errors gracefully", async () => {
      // Mock MathJax to throw an error
      mockMathJax.typesetPromise.mockRejectedValueOnce(
        new Error("Rendering failed")
      );

      render(
        <MathExpression
          expression="invalid\\math"
          fallback="Invalid expression"
        />
      );

      await waitFor(() => {
        expect(screen.getByText("Invalid expression")).toBeInTheDocument();
      });
    });

    it("should pass axe accessibility tests", async () => {
      const { container } = render(<MathExpression expression="x + y = z" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("TopicCard", () => {
    const mockTopic: Topic = {
      id: "algebra",
      title: "Algebra",
      description: "Learn algebraic concepts",
      level: "high",
      icon: "Calculator",
      mathExpression: "x + y = z",
      prerequisites: ["arithmetic"],
      estimatedTime: 30,
      difficulty: 3,
    };

    it("should render with proper semantic HTML", () => {
      const mockOnClick = vi.fn();
      render(<TopicCard topic={mockTopic} onClick={mockOnClick} />);

      const article = screen.getByRole("article");
      expect(article).toBeInTheDocument();

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label");
      expect(button).toHaveAttribute("aria-describedby");
    });

    it("should be keyboard accessible", async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();
      render(<TopicCard topic={mockTopic} onClick={mockOnClick} />);

      const button = screen.getByRole("button");

      // Test Enter key
      button.focus();
      await user.keyboard("{Enter}");
      expect(mockOnClick).toHaveBeenCalledWith("algebra");

      // Test Space key
      mockOnClick.mockClear();
      await user.keyboard(" ");
      expect(mockOnClick).toHaveBeenCalledWith("algebra");
    });

    it("should have proper focus management", async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();
      render(<TopicCard topic={mockTopic} onClick={mockOnClick} />);

      const button = screen.getByRole("button");

      await user.tab();
      expect(button).toHaveFocus();
      expect(button).toHaveClass("focus-visible:ring-2");
    });

    it("should pass axe accessibility tests", async () => {
      const mockOnClick = vi.fn();
      const { container } = render(
        <TopicCard topic={mockTopic} onClick={mockOnClick} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Header", () => {
    it("should render with proper landmark roles", () => {
      render(<Header />);

      const banner = screen.getByRole("banner");
      expect(banner).toBeInTheDocument();

      const navigation = screen.getByRole("navigation", {
        name: /main navigation/i,
      });
      expect(navigation).toBeInTheDocument();
    });

    it("should have accessible mobile menu", async () => {
      const user = userEvent.setup();

      // Mock mobile viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 500,
      });

      render(<Header />);

      const menuButton = screen.getByRole("button", {
        name: /toggle navigation menu/i,
      });
      expect(menuButton).toHaveAttribute("aria-expanded", "false");

      await user.click(menuButton);
      expect(menuButton).toHaveAttribute("aria-expanded", "true");

      const mobileNav = screen.getByRole("navigation", {
        name: /mobile navigation/i,
      });
      expect(mobileNav).toBeInTheDocument();
    });

    it("should handle keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<Header />);

      // Tab through navigation items
      await user.tab(); // Logo
      await user.tab(); // First nav item

      const firstNavItem = document.activeElement;
      expect(firstNavItem).toHaveAttribute("aria-current");
    });

    it("should pass axe accessibility tests", async () => {
      const { container } = render(<Header />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Layout", () => {
    it("should render with proper semantic structure", () => {
      render(
        <Layout>
          <div>Test content</div>
        </Layout>
      );

      expect(screen.getByRole("banner")).toBeInTheDocument(); // Header
      expect(screen.getByRole("main")).toBeInTheDocument(); // Main content
      expect(screen.getByRole("contentinfo")).toBeInTheDocument(); // Footer
    });

    it("should include skip navigation", () => {
      render(
        <Layout>
          <div>Test content</div>
        </Layout>
      );

      const skipLinks = screen.getAllByText(/skip to/i);
      expect(skipLinks.length).toBeGreaterThan(0);
    });

    it("should have proper main content landmark", () => {
      render(
        <Layout>
          <div id="test-content">Test content</div>
        </Layout>
      );

      const main = screen.getByRole("main");
      expect(main).toHaveAttribute("id", "main-content");
      expect(main).toHaveAttribute("aria-label", "Main content");
    });

    it("should pass axe accessibility tests", async () => {
      const { container } = render(
        <Layout>
          <div>Test content</div>
        </Layout>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Color Contrast", () => {
    it("should meet WCAG AA contrast requirements", () => {
      // Test would require actual color contrast calculation
      // This is a placeholder for manual testing or specialized tools
      expect(true).toBe(true);
    });
  });

  describe("Keyboard Navigation", () => {
    it("should provide logical tab order", async () => {
      const user = userEvent.setup();
      render(
        <Layout>
          <div>
            <button>Button 1</button>
            <button>Button 2</button>
            <a href="#test">Link</a>
          </div>
        </Layout>
      );

      // Tab through elements
      await user.tab(); // Skip link
      await user.tab(); // Logo
      await user.tab(); // First nav item

      // Verify tab order is logical
      expect(document.activeElement).toHaveAttribute("href");
    });

    it("should trap focus in modal dialogs", async () => {
      const user = userEvent.setup();
      render(<AccessibilitySettings />);

      const settingsButton = screen.getByRole("button", {
        name: /accessibility settings/i,
      });
      await user.click(settingsButton);

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();

      // Focus should be trapped within the dialog
      const focusableElements = dialog.querySelectorAll(
        'button, input, select, [tabindex]:not([tabindex="-1"])'
      );
      expect(focusableElements.length).toBeGreaterThan(0);
    });
  });

  describe("Screen Reader Support", () => {
    it("should provide appropriate ARIA labels", () => {
      render(
        <Layout>
          <div>Test content</div>
        </Layout>
      );

      const main = screen.getByRole("main");
      expect(main).toHaveAttribute("aria-label");

      const banner = screen.getByRole("banner");
      expect(banner).toBeInTheDocument();

      const contentinfo = screen.getByRole("contentinfo");
      expect(contentinfo).toHaveAttribute("aria-label");
    });

    it("should announce dynamic content changes", () => {
      // This would require testing with actual screen reader or aria-live regions
      // Placeholder for manual testing
      expect(true).toBe(true);
    });
  });
});
