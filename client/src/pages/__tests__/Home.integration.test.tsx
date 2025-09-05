import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Router } from "wouter";
import { ThemeProvider } from "../../components/ThemeProvider";
import { Home } from "../Home";

// Mock MathJax
vi.mock("../../hooks/useMathJax", () => ({
  useMathJax: () => ({
    isLoaded: true,
    renderMath: vi.fn(),
    error: null,
  }),
}));

// Mock scrollIntoView
const mockScrollIntoView = vi.fn();
Object.defineProperty(Element.prototype, "scrollIntoView", {
  value: mockScrollIntoView,
  writable: true,
});

// Mock querySelector for features section
const mockQuerySelector = vi.fn();
Object.defineProperty(document, "querySelector", {
  value: mockQuerySelector,
  writable: true,
});

// Mock getElementById
const mockGetElementById = vi.fn();
Object.defineProperty(document, "getElementById", {
  value: mockGetElementById,
  writable: true,
});

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Router>{children}</Router>
    </ThemeProvider>
  );
}

describe("Home Page Integration", () => {
  beforeEach(() => {
    mockScrollIntoView.mockClear();
    mockQuerySelector.mockClear();
    mockGetElementById.mockClear();
  });

  it("renders all main sections", () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    // Check for main sections
    expect(
      screen.getByText(/start your mathematical journey/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/explore mathematics topics/i)).toBeInTheDocument();
    expect(screen.getByText(/why choose math farm/i)).toBeInTheDocument();
    expect(screen.getByText(/about math farm/i)).toBeInTheDocument();
  });

  it("has proper visual hierarchy and spacing", () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    // Check for proper heading levels
    const mainHeadings = screen.getAllByRole("heading", { level: 2 });
    expect(mainHeadings.length).toBeGreaterThan(0);

    // Check for section spacing classes
    const sections = document.querySelectorAll("section");
    sections.forEach((section) => {
      expect(section).toHaveClass("py-12");
    });
  });

  it("enables smooth scrolling between sections", async () => {
    const mockElement = { scrollIntoView: mockScrollIntoView };
    mockGetElementById.mockReturnValue(mockElement);

    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    // Test navigation to topics section
    const startLearningButton = screen.getByRole("button", {
      name: /start learning/i,
    });
    fireEvent.click(startLearningButton);

    await waitFor(() => {
      expect(mockGetElementById).toHaveBeenCalledWith("topics");
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
    });
  });

  it("handles navigation from features section", async () => {
    const mockElement = { scrollIntoView: mockScrollIntoView };
    mockGetElementById.mockReturnValue(mockElement);

    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    // Test navigation from features section
    const exploreTopicsButton = screen.getByRole("button", {
      name: /explore topics/i,
    });
    fireEvent.click(exploreTopicsButton);

    await waitFor(() => {
      expect(mockGetElementById).toHaveBeenCalledWith("topics");
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
    });
  });

  it("has accessible navigation structure", () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    // Check for proper ARIA landmarks
    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();

    const sections = screen.getAllByRole("region");
    expect(sections.length).toBeGreaterThan(0);

    // Each section should have proper aria-label
    sections.forEach((section) => {
      expect(section).toHaveAttribute("aria-labelledby");
    });
  });

  it("maintains responsive design across sections", () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    // Check for responsive grid classes in features section
    const featuresGrid = document.querySelector(
      ".grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3"
    );
    expect(featuresGrid).toBeInTheDocument();

    // Check for responsive text classes
    const headings = screen.getAllByRole("heading", { level: 2 });
    headings.forEach((heading) => {
      expect(heading).toHaveClass("text-3xl", "md:text-4xl");
    });
  });

  it("handles topic card navigation", () => {
    // Mock console.log and alert for topic navigation
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    // Find and click a topic card
    const topicCards = screen.getAllByRole("button");
    const topicCard = topicCards.find(
      (card) =>
        card.textContent?.includes("Algebra") ||
        card.textContent?.includes("Geometry")
    );

    if (topicCard) {
      fireEvent.click(topicCard);
      expect(consoleSpy).toHaveBeenCalled();
    }

    consoleSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it("has proper section alternating backgrounds", () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    // Check for alternating background classes
    const sections = document.querySelectorAll("section");
    let hasBackground = false;
    let hasMuted = false;

    sections.forEach((section) => {
      if (section.classList.contains("bg-background")) {
        hasBackground = true;
      }
      if (section.classList.contains("bg-muted/50")) {
        hasMuted = true;
      }
    });

    expect(hasBackground).toBe(true);
    expect(hasMuted).toBe(true);
  });

  it("includes all required call-to-action buttons", () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    // Hero section CTAs
    expect(
      screen.getByRole("button", { name: /start learning/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /explore tools/i })
    ).toBeInTheDocument();

    // Features section CTAs
    expect(
      screen.getByRole("button", { name: /explore topics/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /try practice problems/i })
    ).toBeInTheDocument();
  });

  it("maintains proper focus management", () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    // All interactive elements should have focus-visible classes
    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toHaveClass("focus-visible:outline-none");
      expect(button).toHaveClass("focus-visible:ring-2");
    });
  });
});
