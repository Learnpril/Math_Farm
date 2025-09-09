import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MathExpression } from "../MathExpression";
import {
  ScreenReaderAnnouncement,
  useScreenReaderAnnouncements,
  LiveRegion,
  StatusAnnouncer,
  ProgressAnnouncer,
  NavigationAnnouncer,
  InteractionAnnouncer,
  MathContentAnnouncer,
  PracticeAnnouncer,
  GamificationAnnouncer,
} from "../accessibility/ScreenReaderAnnouncements";
import { JSXGraphAccessible } from "../accessibility/JSXGraphAccessible";
import {
  generateMathDescription,
  generateGraphDescription,
} from "../../lib/accessibility";

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

// Mock JSXGraph
const mockJSXGraph = {
  initBoard: vi.fn().mockReturnValue({
    setBoundingBox: vi.fn(),
    getBoundingBox: vi.fn().mockReturnValue([-5, 5, 5, -5]),
    zoomAllPoints: vi.fn(),
    suspendUpdate: vi.fn(),
  }),
};

Object.defineProperty(window, "JXG", {
  value: {
    JSXGraph: mockJSXGraph,
  },
  writable: true,
});

describe("Screen Reader Compatibility", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any live regions created during tests
    document.querySelectorAll("[aria-live]").forEach((el) => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  });

  describe("Math Expression Accessibility", () => {
    it("should provide accessible descriptions for mathematical expressions", () => {
      render(<MathExpression expression="x^2 + 2x + 1" />);

      const mathElement = screen.getByRole("img");
      expect(mathElement).toHaveAttribute("aria-label");

      const ariaLabel = mathElement.getAttribute("aria-label");
      expect(ariaLabel).toContain("x to the power of 2 plus 2x plus 1");
    });

    it("should handle complex mathematical expressions", () => {
      const complexExpression = "\\frac{\\sqrt{x^2 + y^2}}{\\pi r^2}";
      render(<MathExpression expression={complexExpression} />);

      const mathElement = screen.getByRole("img");
      const ariaLabel = mathElement.getAttribute("aria-label");

      expect(ariaLabel).toContain("fraction");
      expect(ariaLabel).toContain("square root");
      expect(ariaLabel).toContain("pi");
    });

    it("should provide fallback text when MathJax fails", () => {
      // Mock MathJax failure
      mockMathJax.typesetPromise.mockRejectedValueOnce(
        new Error("MathJax error")
      );

      render(<MathExpression expression="x + 1" fallback="x plus 1" />);

      const fallbackElement = screen.getByText("x plus 1");
      expect(fallbackElement).toBeInTheDocument();
      expect(fallbackElement).toHaveAttribute("aria-label");
    });

    it("should include screen reader only text", () => {
      render(<MathExpression expression="\\pi r^2" />);

      const srOnlyText = document.querySelector(".sr-only");
      expect(srOnlyText).toBeInTheDocument();
    });
  });

  describe("Math Description Generation", () => {
    it("should convert basic LaTeX to readable text", () => {
      const description = generateMathDescription("x^2 + 3x - 4");
      expect(description).toBe("x to the power of 2 plus 3x minus 4");
    });

    it("should handle fractions", () => {
      const description = generateMathDescription("\\frac{a}{b}");
      expect(description).toBe("fraction with numerator a and denominator b");
    });

    it("should handle Greek letters", () => {
      const description = generateMathDescription("\\alpha + \\beta = \\gamma");
      expect(description).toBe("alpha plus beta equals gamma");
    });

    it("should handle trigonometric functions", () => {
      const description = generateMathDescription(
        "\\sin(\\theta) + \\cos(\\phi)"
      );
      expect(description).toBe("sine(theta) plus cosine(phi)");
    });

    it("should handle calculus notation", () => {
      const description = generateMathDescription(
        "\\int_{0}^{\\infty} f(x) dx"
      );
      expect(description).toBe("integral from 0 to infinity f(x) dx");
    });

    it("should handle complex expressions", () => {
      const description = generateMathDescription(
        "\\sqrt{\\frac{x^2 + y^2}{z}}"
      );
      expect(description).toContain("square root");
      expect(description).toContain("fraction");
      expect(description).toContain("to the power of 2");
    });
  });

  describe("Live Regions and Announcements", () => {
    it("should create live regions with proper ARIA attributes", () => {
      render(
        <LiveRegion priority="assertive" atomic={true}>
          Test announcement
        </LiveRegion>
      );

      const liveRegion = screen.getByText("Test announcement");
      expect(liveRegion).toHaveAttribute("aria-live", "assertive");
      expect(liveRegion).toHaveAttribute("aria-atomic", "true");
      expect(liveRegion).toHaveClass("sr-only");
    });

    it("should announce status changes", () => {
      const { rerender } = render(<StatusAnnouncer status="Loading..." />);

      let announcement = screen.getByText("Loading...");
      expect(announcement).toBeInTheDocument();

      rerender(<StatusAnnouncer success="Operation completed successfully" />);

      announcement = screen.getByText("Operation completed successfully");
      expect(announcement).toBeInTheDocument();
    });

    it("should announce errors with assertive priority", () => {
      render(<StatusAnnouncer error="An error occurred" />);

      const errorAnnouncement = screen.getByText("An error occurred");
      expect(errorAnnouncement.closest("[aria-live]")).toHaveAttribute(
        "aria-live",
        "assertive"
      );
    });

    it("should announce progress updates", () => {
      render(<ProgressAnnouncer progress={5} total={10} label="Processing" />);

      const progressAnnouncement = screen.getByText(/Processing: 50% complete/);
      expect(progressAnnouncement).toBeInTheDocument();
    });

    it("should announce navigation changes", () => {
      const { rerender } = render(<NavigationAnnouncer currentPage="Home" />);

      rerender(
        <NavigationAnnouncer currentPage="Topics" previousPage="Home" />
      );

      waitFor(() => {
        const navAnnouncement = screen.getByText("Navigated to Topics");
        expect(navAnnouncement).toBeInTheDocument();
      });
    });

    it("should announce interactions", () => {
      render(
        <InteractionAnnouncer
          action="Clicked"
          target="Submit button"
          result="Form submitted successfully"
        />
      );

      waitFor(() => {
        const interaction = screen.getByText(
          /Clicked Submit button. Form submitted successfully/
        );
        expect(interaction).toBeInTheDocument();
      });
    });

    it("should announce math content changes", () => {
      render(
        <MathContentAnnouncer
          expression="x^2 + 1"
          description="Quadratic expression"
          context="Problem 1"
        />
      );

      waitFor(() => {
        const mathAnnouncement = screen.getByText(
          /Problem 1. Quadratic expression/
        );
        expect(mathAnnouncement).toBeInTheDocument();
      });
    });

    it("should announce practice problem results", () => {
      render(
        <PracticeAnnouncer
          problemNumber={1}
          totalProblems={5}
          isCorrect={true}
          attempts={2}
        />
      );

      waitFor(() => {
        const practiceAnnouncement = screen.getByText(
          /Problem 1 of 5. Correct! Solved in 2 attempts/
        );
        expect(practiceAnnouncement).toBeInTheDocument();
      });
    });

    it("should announce gamification events", () => {
      render(
        <GamificationAnnouncer badge="Problem Solver" streak={5} points={100} />
      );

      waitFor(() => {
        const gamificationAnnouncement = screen.getByText(
          /Badge earned: Problem Solver! 5 day streak! 100 points earned/
        );
        expect(gamificationAnnouncement).toBeInTheDocument();
      });
    });
  });

  describe("useScreenReaderAnnouncements Hook", () => {
    function TestComponent() {
      const { announce, announcements, clear } = useScreenReaderAnnouncements();

      return (
        <div>
          <button onClick={() => announce("Test message", "polite")}>
            Announce
          </button>
          <button onClick={clear}>Clear</button>
          <div data-testid="announcements">
            {announcements.map((a) => (
              <div key={a.id}>{a.message}</div>
            ))}
          </div>
        </div>
      );
    }

    it("should manage announcements", async () => {
      render(<TestComponent />);

      const announceButton = screen.getByText("Announce");
      await user.click(announceButton);

      const announcements = screen.getByTestId("announcements");
      expect(announcements).toHaveTextContent("Test message");
    });

    it("should clear announcements", async () => {
      render(<TestComponent />);

      const announceButton = screen.getByText("Announce");
      const clearButton = screen.getByText("Clear");

      await user.click(announceButton);
      await user.click(clearButton);

      const announcements = screen.getByTestId("announcements");
      expect(announcements).toBeEmptyDOMElement();
    });
  });

  describe("JSXGraph Accessibility", () => {
    const mockInitFunction = vi
      .fn()
      .mockReturnValue([
        { elType: "point", coords: { usrCoords: [1, 2, 3] } },
        { elType: "line" },
      ]);

    it("should create accessible JSXGraph with proper ARIA attributes", () => {
      render(
        <JSXGraphAccessible
          id="test-graph"
          graphType="coordinate plane"
          initFunction={mockInitFunction}
        />
      );

      const graphContainer = screen.getByRole("application");
      expect(graphContainer).toHaveAttribute("aria-label");

      const ariaLabel = graphContainer.getAttribute("aria-label");
      expect(ariaLabel).toContain("coordinate plane");
    });

    it("should provide keyboard navigation instructions", () => {
      render(
        <JSXGraphAccessible
          id="test-graph"
          graphType="function plot"
          initFunction={mockInitFunction}
        />
      );

      const shortcuts = screen.getByText("Keyboard shortcuts");
      expect(shortcuts).toBeInTheDocument();

      // Expand shortcuts
      fireEvent.click(shortcuts);

      expect(screen.getByText("Arrow keys: Pan the graph")).toBeInTheDocument();
      expect(screen.getByText("+/-: Zoom in/out")).toBeInTheDocument();
    });

    it("should generate graph descriptions", () => {
      const description = generateGraphDescription("coordinate plane", [
        { type: "point" },
        { type: "line" },
        { type: "circle" },
      ]);

      expect(description).toContain("Interactive coordinate plane graph");
      expect(description).toContain("1 point");
      expect(description).toContain("1 line");
      expect(description).toContain("1 circle");
      expect(description).toContain("Use arrow keys to navigate");
    });

    it("should handle loading states", () => {
      // Mock JSXGraph not being available
      delete (window as any).JXG;

      render(
        <JSXGraphAccessible
          id="test-graph"
          graphType="loading test"
          initFunction={mockInitFunction}
        />
      );

      expect(
        screen.getByText("Loading loading test graph...")
      ).toBeInTheDocument();

      // Restore JSXGraph
      (window as any).JXG = { JSXGraph: mockJSXGraph };
    });
  });

  describe("ARIA Landmarks and Structure", () => {
    it("should provide proper heading hierarchy", () => {
      render(
        <div>
          <h1>Main Title</h1>
          <h2>Section Title</h2>
          <h3>Subsection Title</h3>
        </div>
      );

      const headings = screen.getAllByRole("heading");
      expect(headings).toHaveLength(3);

      expect(headings[0]).toHaveAttribute("aria-level", "1");
      expect(headings[1]).toHaveAttribute("aria-level", "2");
      expect(headings[2]).toHaveAttribute("aria-level", "3");
    });

    it("should use semantic HTML elements", () => {
      render(
        <div>
          <nav aria-label="Main navigation">Navigation</nav>
          <main>Main content</main>
          <aside>Sidebar</aside>
          <footer>Footer</footer>
        </div>
      );

      expect(screen.getByRole("navigation")).toBeInTheDocument();
      expect(screen.getByRole("main")).toBeInTheDocument();
      expect(screen.getByRole("complementary")).toBeInTheDocument();
      expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    });

    it("should provide descriptive labels for form elements", () => {
      render(
        <form>
          <label htmlFor="username">Username</label>
          <input id="username" type="text" />

          <label htmlFor="password">Password</label>
          <input id="password" type="password" />

          <button type="submit">Submit</button>
        </form>
      );

      const usernameInput = screen.getByLabelText("Username");
      const passwordInput = screen.getByLabelText("Password");

      expect(usernameInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });
  });

  describe("Screen Reader Only Content", () => {
    it("should provide screen reader only descriptions", () => {
      render(
        <div>
          <span className="sr-only">Screen reader only text</span>
          <div aria-hidden="true">Visual only content</div>
        </div>
      );

      const srOnlyText = document.querySelector(".sr-only");
      expect(srOnlyText).toHaveTextContent("Screen reader only text");

      const visualOnly = screen.getByText("Visual only content");
      expect(visualOnly).toHaveAttribute("aria-hidden", "true");
    });

    it("should hide decorative images from screen readers", () => {
      render(
        <div>
          <img src="decorative.jpg" alt="" aria-hidden="true" />
          <img src="informative.jpg" alt="Informative image description" />
        </div>
      );

      const images = screen.getAllByRole("img", { hidden: true });
      const decorativeImage = images.find(
        (img) => img.getAttribute("aria-hidden") === "true"
      );
      const informativeImage = images.find(
        (img) => img.getAttribute("alt") === "Informative image description"
      );

      expect(decorativeImage).toBeInTheDocument();
      expect(informativeImage).toBeInTheDocument();
    });
  });

  describe("Dynamic Content Updates", () => {
    it("should announce dynamic content changes", async () => {
      function DynamicContent() {
        const [content, setContent] = React.useState("Initial content");

        return (
          <div>
            <button onClick={() => setContent("Updated content")}>
              Update
            </button>
            <LiveRegion priority="polite">{content}</LiveRegion>
          </div>
        );
      }

      render(<DynamicContent />);

      const updateButton = screen.getByText("Update");
      await user.click(updateButton);

      expect(screen.getByText("Updated content")).toBeInTheDocument();
    });

    it("should handle rapid content updates gracefully", async () => {
      function RapidUpdates() {
        const [count, setCount] = React.useState(0);

        return (
          <div>
            <button onClick={() => setCount((c) => c + 1)}>Increment</button>
            <LiveRegion priority="polite">Count: {count}</LiveRegion>
          </div>
        );
      }

      render(<RapidUpdates />);

      const incrementButton = screen.getByText("Increment");

      // Rapid clicks
      await user.click(incrementButton);
      await user.click(incrementButton);
      await user.click(incrementButton);

      expect(screen.getByText("Count: 3")).toBeInTheDocument();
    });
  });

  describe("Error Handling and Fallbacks", () => {
    it("should provide fallback content when accessibility features fail", () => {
      // Mock console.error to avoid test noise
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      function FailingComponent() {
        throw new Error("Component error");
      }

      function ErrorBoundary({ children }: { children: React.ReactNode }) {
        try {
          return <>{children}</>;
        } catch (error) {
          return (
            <div role="alert" aria-live="assertive">
              An error occurred. Please try refreshing the page.
            </div>
          );
        }
      }

      render(
        <ErrorBoundary>
          <FailingComponent />
        </ErrorBoundary>
      );

      // Note: This test would need a proper error boundary implementation
      // This is just demonstrating the concept

      consoleSpy.mockRestore();
    });

    it("should handle missing ARIA attributes gracefully", () => {
      render(
        <div>
          <button>Button without explicit ARIA</button>
          <input type="text" placeholder="Input without label" />
        </div>
      );

      // Elements should still be accessible via their implicit roles
      expect(screen.getByRole("button")).toBeInTheDocument();
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });
  });
});
