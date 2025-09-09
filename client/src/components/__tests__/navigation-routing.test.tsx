import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Router } from "wouter";
import { ThemeProvider } from "../ThemeProvider";
import App from "../../App";
import { Header } from "../layout/Header";
import { NotFound } from "../../pages/NotFound";
import topicsData from "../../data/topicsData.json";

// Mock MathJax and other heavy dependencies
vi.mock("../../lib/mathJaxLoader", () => ({
  preloadMathJax: vi.fn(),
}));

vi.mock("../../lib/domErrorHandler", () => ({
  installDOMErrorHandler: vi.fn(),
}));

vi.mock("../../components/LazyComponents", () => ({
  LazyTopicPage: () => <div data-testid="topic-page">Topic Page</div>,
  LazyToolsPage: () => <div data-testid="tools-page">Tools Page</div>,
  LazyLaTeXGuidePage: () => <div data-testid="latex-page">LaTeX Guide</div>,
  LazyMATLABGuidePage: () => <div data-testid="matlab-page">MATLAB Guide</div>,
}));

vi.mock("../../components/LazyWrapper", () => ({
  LazyWrapper: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("../../components/PerformanceDashboard", () => ({
  PerformanceDashboard: () => null,
}));

// Test wrapper component
const TestWrapper = ({
  children,
  initialPath = "/",
}: {
  children: React.ReactNode;
  initialPath?: string;
}) => {
  // Mock window.location for initial path
  Object.defineProperty(window, "location", {
    value: { pathname: initialPath, href: `http://localhost${initialPath}` },
    writable: true,
  });

  return (
    <ThemeProvider>
      <Router base={initialPath}>{children}</Router>
    </ThemeProvider>
  );
};

describe("Navigation and Routing", () => {
  beforeEach(() => {
    // Reset window.location
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

    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();

    // Mock history API
    Object.defineProperty(window, "history", {
      value: {
        pushState: vi.fn(),
        replaceState: vi.fn(),
        back: vi.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Route Parameter Parsing", () => {
    it("should parse topic ID from URL parameters correctly", async () => {
      render(
        <TestWrapper initialPath="/topic/algebra">
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId("topic-page")).toBeInTheDocument();
      });
    });

    it("should handle invalid topic IDs gracefully", async () => {
      render(
        <TestWrapper initialPath="/topic/invalid-topic">
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId("topic-page")).toBeInTheDocument();
      });
    });

    it("should handle special characters in topic IDs", async () => {
      render(
        <TestWrapper initialPath="/topic/test-topic-with-dashes">
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId("topic-page")).toBeInTheDocument();
      });
    });
  });

  describe("Route Navigation", () => {
    it("should navigate to home page by default", () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      expect(screen.getByText("Math Farm")).toBeInTheDocument();
    });

    it("should navigate to tools page", async () => {
      render(
        <TestWrapper initialPath="/tools">
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId("tools-page")).toBeInTheDocument();
      });
    });

    it("should navigate to LaTeX guide page", async () => {
      render(
        <TestWrapper initialPath="/latex-guide">
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId("latex-page")).toBeInTheDocument();
      });
    });

    it("should navigate to MATLAB guide page", async () => {
      render(
        <TestWrapper initialPath="/matlab-guide">
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId("matlab-page")).toBeInTheDocument();
      });
    });

    it("should show 404 page for invalid routes", async () => {
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
  });

  describe("Header Navigation Component", () => {
    it("should render all navigation items", () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      expect(screen.getByText("Math Farm")).toBeInTheDocument();
      expect(screen.getByText("Topics")).toBeInTheDocument();
      expect(screen.getByText("Tools")).toBeInTheDocument();
      expect(screen.getByText("LaTeX Guide")).toBeInTheDocument();
      expect(screen.getByText("MATLAB Guide")).toBeInTheDocument();
      expect(screen.getByText("Practice")).toBeInTheDocument();
      expect(screen.getByText("Community")).toBeInTheDocument();
      expect(screen.getByText("About")).toBeInTheDocument();
    });

    it("should highlight active navigation item", () => {
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
      expect(toolsLink).toHaveClass("text-primary");
    });

    it("should show back button on non-home pages", () => {
      render(
        <TestWrapper initialPath="/tools">
          <Header />
        </TestWrapper>
      );

      expect(
        screen.getByLabelText("Go back to previous page")
      ).toBeInTheDocument();
    });

    it("should not show back button on home page", () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      expect(
        screen.queryByLabelText("Go back to previous page")
      ).not.toBeInTheDocument();
    });

    it("should toggle mobile menu", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      const menuButton = screen.getByLabelText("Toggle navigation menu");

      // Menu should be closed initially
      expect(
        screen.queryByRole("navigation", { name: "Mobile navigation" })
      ).not.toBeInTheDocument();

      // Open menu
      await user.click(menuButton);
      expect(
        screen.getByRole("navigation", { name: "Mobile navigation" })
      ).toBeInTheDocument();

      // Close menu
      await user.click(menuButton);
      expect(
        screen.queryByRole("navigation", { name: "Mobile navigation" })
      ).not.toBeInTheDocument();
    });

    it("should close mobile menu on escape key", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      const menuButton = screen.getByLabelText("Toggle navigation menu");

      // Open menu
      await user.click(menuButton);
      expect(
        screen.getByRole("navigation", { name: "Mobile navigation" })
      ).toBeInTheDocument();

      // Press escape
      await user.keyboard("{Escape}");
      expect(
        screen.queryByRole("navigation", { name: "Mobile navigation" })
      ).not.toBeInTheDocument();
    });
  });

  describe("Click Handlers and Navigation State", () => {
    it("should handle internal navigation clicks", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      const topicsLink = screen.getByText("Topics");
      await user.click(topicsLink);

      // Should call scrollIntoView for hash navigation
      expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    });

    it("should handle back button click", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper initialPath="/tools">
          <Header />
        </TestWrapper>
      );

      const backButton = screen.getByLabelText("Go back to previous page");
      await user.click(backButton);

      expect(window.history.back).toHaveBeenCalled();
    });

    it("should handle logo click navigation to home", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper initialPath="/tools">
          <Header />
        </TestWrapper>
      );

      const logo = screen.getByText("Math Farm");
      await user.click(logo);

      // Should navigate to home (this would be handled by Wouter in real app)
      expect(logo.closest("a")).toHaveAttribute("href", "/");
    });
  });

  describe("Error Handling for Invalid Routes", () => {
    it("should render NotFound component for invalid routes", () => {
      render(
        <TestWrapper>
          <NotFound />
        </TestWrapper>
      );

      expect(screen.getByText("404")).toBeInTheDocument();
      expect(screen.getByText("Page Not Found")).toBeInTheDocument();
    });

    it("should suggest topics for invalid topic routes", () => {
      // Mock location to simulate invalid topic route
      Object.defineProperty(window, "location", {
        value: { pathname: "/topic/invalid-topic" },
        writable: true,
      });

      render(
        <TestWrapper>
          <NotFound />
        </TestWrapper>
      );

      expect(screen.getByText("Topic Not Found")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Search for topics...")
      ).toBeInTheDocument();
    });

    it("should provide search functionality in NotFound page", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <NotFound />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText("Search for topics...");
      await user.type(searchInput, "algebra");

      expect(searchInput).toHaveValue("algebra");
    });

    it("should show topic suggestions based on search", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <NotFound />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText("Search for topics...");
      await user.type(searchInput, "algebra");

      // Should show algebra topic if it exists in topicsData
      const algebraTopic = topicsData.find((topic) =>
        topic.title.toLowerCase().includes("algebra")
      );
      if (algebraTopic) {
        expect(screen.getByText(algebraTopic.title)).toBeInTheDocument();
      }
    });

    it("should handle missing topic data gracefully", () => {
      // Mock empty topics data
      vi.doMock("../../data/topicsData.json", () => ({ default: [] }));

      render(
        <TestWrapper>
          <NotFound />
        </TestWrapper>
      );

      expect(screen.getByText("404")).toBeInTheDocument();
      // Should still render without crashing
    });
  });

  describe("Accessibility and ARIA Support", () => {
    it("should have proper ARIA labels on navigation elements", () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      expect(screen.getByRole("banner")).toBeInTheDocument();
      expect(
        screen.getByRole("navigation", { name: "Main navigation" })
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("Toggle navigation menu")
      ).toBeInTheDocument();
    });

    it("should set aria-current on active navigation items", () => {
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

    it("should have proper focus management", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      const menuButton = screen.getByLabelText("Toggle navigation menu");

      // Focus should be manageable
      await user.tab();
      expect(document.activeElement).toBeTruthy();
    });
  });
});
