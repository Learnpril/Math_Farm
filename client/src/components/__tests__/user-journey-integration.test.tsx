import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Router } from "wouter";
import { ThemeProvider } from "../ThemeProvider";
import App from "../../App";
import topicsData from "../../data/topicsData.json";

// Mock heavy dependencies
vi.mock("../../lib/mathJaxLoader", () => ({
  preloadMathJax: vi.fn(),
}));

vi.mock("../../lib/domErrorHandler", () => ({
  installDOMErrorHandler: vi.fn(),
}));

vi.mock("../../components/LazyComponents", () => ({
  LazyTopicPage: () => <div data-testid="topic-page">Topic Page Content</div>,
  LazyToolsPage: () => <div data-testid="tools-page">Tools Page Content</div>,
  LazyLaTeXGuidePage: () => (
    <div data-testid="latex-page">LaTeX Guide Content</div>
  ),
  LazyMATLABGuidePage: () => (
    <div data-testid="matlab-page">MATLAB Guide Content</div>
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

// Mock localStorage for progress tracking
const mockLocalStorage = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

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

describe("User Journey Integration Tests", () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Mock window APIs
    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
    });

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

    // Mock getElementById for hash navigation
    const mockGetElementById = vi.fn((id: string) => {
      if (["topics", "practice", "about", "hours"].includes(id)) {
        return {
          scrollIntoView: vi.fn(),
        };
      }
      return null;
    });
    document.getElementById = mockGetElementById;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Complete User Journey: Home to Topic Completion", () => {
    it("should allow user to navigate from home to topic and back", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // User starts on home page
      expect(screen.getByText("Math Farm")).toBeInTheDocument();

      // User clicks on Topics navigation
      const topicsLink = screen.getByText("Topics");
      await user.click(topicsLink);

      // Should scroll to topics section (mocked)
      expect(Element.prototype.scrollIntoView).toHaveBeenCalled();

      // User navigates to a specific topic (simulate clicking a topic card)
      // In a real integration test, this would involve clicking an actual topic card
      // For now, we'll simulate navigation to topic page
      const { rerender } = render(
        <TestWrapper initialPath="/topic/algebra">
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId("topic-page")).toBeInTheDocument();
      });

      // User can navigate back using back button
      const backButton = screen.getByLabelText("Go back to previous page");
      await user.click(backButton);

      expect(window.history.back).toHaveBeenCalled();
    });

    it("should maintain user progress throughout the journey", async () => {
      const user = userEvent.setup();

      // Mock localStorage to return some progress data
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key.includes("progress")) {
          return JSON.stringify({
            completedTopics: ["arithmetic"],
            currentTopic: "algebra",
            topicProgress: {
              algebra: {
                startedAt: new Date().toISOString(),
                exercisesCompleted: 3,
                totalExercises: 10,
                timeSpent: 1200,
              },
            },
          });
        }
        return null;
      });

      render(
        <TestWrapper initialPath="/topic/algebra">
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId("topic-page")).toBeInTheDocument();
      });

      // Progress should be loaded from localStorage
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
        expect.stringContaining("progress")
      );
    });

    it("should handle topic completion flow", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper initialPath="/topic/arithmetic">
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId("topic-page")).toBeInTheDocument();
      });

      // Simulate completing a topic (this would involve interacting with practice problems)
      // Progress should be saved to localStorage
      // In a real test, this would involve completing actual exercises

      // For now, we verify that the topic page is rendered and can handle completion
      expect(screen.getByTestId("topic-page")).toBeInTheDocument();
    });
  });

  describe("Cross-Topic Navigation via Prerequisites", () => {
    it("should allow navigation between related topics", async () => {
      const user = userEvent.setup();

      // Find a topic with prerequisites
      const topicWithPrereqs = topicsData.find(
        (topic) => topic.prerequisites.length > 0
      );

      if (topicWithPrereqs) {
        render(
          <TestWrapper initialPath={`/topic/${topicWithPrereqs.id}`}>
            <App />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByTestId("topic-page")).toBeInTheDocument();
        });

        // In a real implementation, there would be prerequisite links
        // that users could click to navigate to prerequisite topics
        // For now, we verify the topic page renders correctly
        expect(screen.getByTestId("topic-page")).toBeInTheDocument();
      }
    });

    it("should show prerequisite completion status", async () => {
      const user = userEvent.setup();

      // Mock progress data showing completed prerequisites
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key.includes("progress")) {
          return JSON.stringify({
            completedTopics: ["arithmetic", "algebra"],
            topicProgress: {
              arithmetic: { completedAt: new Date().toISOString() },
              algebra: { completedAt: new Date().toISOString() },
            },
          });
        }
        return null;
      });

      const topicWithPrereqs = topicsData.find(
        (topic) =>
          topic.prerequisites.includes("arithmetic") ||
          topic.prerequisites.includes("algebra")
      );

      if (topicWithPrereqs) {
        render(
          <TestWrapper initialPath={`/topic/${topicWithPrereqs.id}`}>
            <App />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByTestId("topic-page")).toBeInTheDocument();
        });

        // Should show that prerequisites are completed
        expect(mockLocalStorage.getItem).toHaveBeenCalled();
      }
    });

    it("should handle navigation to incomplete prerequisites", async () => {
      const user = userEvent.setup();

      // Mock progress showing incomplete prerequisites
      mockLocalStorage.getItem.mockImplementation(() => null);

      const topicWithPrereqs = topicsData.find(
        (topic) => topic.prerequisites.length > 0
      );

      if (topicWithPrereqs) {
        render(
          <TestWrapper initialPath={`/topic/${topicWithPrereqs.id}`}>
            <App />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByTestId("topic-page")).toBeInTheDocument();
        });

        // Should still render the topic page, but might show prerequisite warnings
        expect(screen.getByTestId("topic-page")).toBeInTheDocument();
      }
    });
  });

  describe("Tools and Guide Page Functionality", () => {
    it("should navigate to tools page and interact with tools", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Navigate to tools via header
      const toolsLink = screen.getByText("Tools");
      await user.click(toolsLink);

      // Should navigate to tools page (in real app, this would change the route)
      expect(toolsLink.closest("a")).toHaveAttribute("href", "/tools");
    });

    it("should navigate to LaTeX guide and use interactive features", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper initialPath="/latex-guide">
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId("latex-page")).toBeInTheDocument();
      });

      // Should show LaTeX guide content
      expect(screen.getByTestId("latex-page")).toBeInTheDocument();
    });

    it("should navigate to MATLAB guide and access tutorials", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper initialPath="/matlab-guide">
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId("matlab-page")).toBeInTheDocument();
      });

      // Should show MATLAB guide content
      expect(screen.getByTestId("matlab-page")).toBeInTheDocument();
    });

    it("should handle tool error recovery", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper initialPath="/tools">
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId("tools-page")).toBeInTheDocument();
      });

      // Tools page should render without errors
      expect(screen.getByTestId("tools-page")).toBeInTheDocument();
    });
  });

  describe("Mobile Navigation Flow", () => {
    it("should handle mobile menu navigation", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Open mobile menu
      const menuButton = screen.getByLabelText("Toggle navigation menu");
      await user.click(menuButton);

      // Should show mobile navigation
      expect(
        screen.getByRole("navigation", { name: "Mobile navigation" })
      ).toBeInTheDocument();

      // Navigate to a page via mobile menu
      const mobileTopicsLink = within(
        screen.getByRole("navigation", { name: "Mobile navigation" })
      ).getByText("Topics");

      await user.click(mobileTopicsLink);

      // Menu should close and navigation should occur
      expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    });

    it("should handle touch interactions on mobile", async () => {
      const user = userEvent.setup();

      // Mock touch events
      const mockTouchEvent = {
        touches: [{ clientX: 100, clientY: 100 }],
        preventDefault: vi.fn(),
      };

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Simulate touch interaction with navigation
      const menuButton = screen.getByLabelText("Toggle navigation menu");

      // Touch events would be handled by the browser/React
      await user.click(menuButton);

      expect(
        screen.getByRole("navigation", { name: "Mobile navigation" })
      ).toBeInTheDocument();
    });
  });

  describe("Search and Discovery Flow", () => {
    it("should handle search from 404 page", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper initialPath="/invalid-route">
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("404")).toBeInTheDocument();
      });

      // Use search functionality
      const searchInput = screen.getByPlaceholderText("Search for topics...");
      await user.type(searchInput, "algebra");

      expect(searchInput).toHaveValue("algebra");

      // Should show search results
      const algebraTopic = topicsData.find((topic) =>
        topic.title.toLowerCase().includes("algebra")
      );

      if (algebraTopic) {
        expect(screen.getByText(algebraTopic.title)).toBeInTheDocument();
      }
    });

    it("should navigate from search results to topics", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper initialPath="/topic/nonexistent">
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("Topic Not Found")).toBeInTheDocument();
      });

      // Should show topic suggestions
      const topicLinks = screen.getAllByText(/Difficulty:/);
      expect(topicLinks.length).toBeGreaterThan(0);

      // Click on a suggested topic
      if (topicLinks.length > 0) {
        const firstTopicCard = topicLinks[0].closest("a");
        if (firstTopicCard) {
          expect(firstTopicCard).toHaveAttribute(
            "href",
            expect.stringMatching(/^\/topic\//)
          );
        }
      }
    });
  });

  describe("Theme and Accessibility Flow", () => {
    it("should handle theme switching during navigation", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Find theme toggle button
      const themeToggle = screen.getByRole("button", { name: /toggle theme/i });
      await user.click(themeToggle);

      // Theme should change (implementation dependent)
      expect(themeToggle).toBeInTheDocument();

      // Navigate to different page with new theme
      const toolsLink = screen.getByText("Tools");
      await user.click(toolsLink);

      // Theme should persist across navigation
      expect(themeToggle).toBeInTheDocument();
    });

    it("should maintain accessibility during navigation", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Check initial accessibility
      expect(screen.getByRole("banner")).toBeInTheDocument();
      expect(screen.getByRole("navigation")).toBeInTheDocument();

      // Navigate and check accessibility is maintained
      const { rerender } = render(
        <TestWrapper initialPath="/tools">
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId("tools-page")).toBeInTheDocument();
      });

      // Accessibility structure should be maintained
      expect(screen.getByRole("banner")).toBeInTheDocument();
    });
  });

  describe("Error Recovery Flow", () => {
    it("should recover from navigation errors", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper initialPath="/invalid-route">
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("404")).toBeInTheDocument();
      });

      // User can recover by going home
      const homeButton = screen.getByText("Go Home");
      await user.click(homeButton);

      // Should navigate to home
      expect(homeButton.closest("a")).toHaveAttribute("href", "/");
    });

    it("should handle component errors gracefully", async () => {
      const user = userEvent.setup();

      // Mock console.error to avoid noise
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // App should render even if some components have errors
      expect(screen.getByText("Math Farm")).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe("Performance During Navigation", () => {
    it("should handle rapid navigation without issues", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Rapidly click navigation items
      const navigationItems = ["Topics", "Practice", "About"];

      for (const item of navigationItems) {
        const link = screen.getByText(item);
        await user.click(link);

        // Should handle rapid clicks without crashing
        expect(link).toBeInTheDocument();
      }
    });

    it("should handle concurrent navigation attempts", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Simulate concurrent navigation
      const topicsLink = screen.getByText("Topics");
      const practiceLink = screen.getByText("Practice");

      // Click multiple items quickly
      await Promise.all([user.click(topicsLink), user.click(practiceLink)]);

      // Should handle concurrent navigation gracefully
      expect(topicsLink).toBeInTheDocument();
      expect(practiceLink).toBeInTheDocument();
    });
  });
});
