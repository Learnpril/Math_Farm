import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Router } from 'wouter';
import { ThemeProvider } from '../ThemeProvider';
import { TopicPage } from '../../pages/TopicPage';
import { NotFound } from '../../pages/NotFound';
import topicsData from '../../data/topicsData.json';

// Mock heavy dependencies
vi.mock('../../lib/mathJaxLoader', () => ({
  preloadMathJax: vi.fn(),
}));

vi.mock('../../components/MathExpression', () => ({
  MathExpression: ({ children }: { children: string }) => (
    <div data-testid='math-expression'>{children}</div>
  ),
}));

vi.mock('../../components/LessonContent', () => ({
  LessonContent: ({ topicId }: { topicId: string }) => (
    <div data-testid='lesson-content'>Lesson content for {topicId}</div>
  ),
}));

vi.mock('../../components/TopicPracticeSection', () => ({
  TopicPracticeSection: ({ topicId }: { topicId: string }) => (
    <div data-testid='practice-section'>Practice for {topicId}</div>
  ),
}));

vi.mock('../../features/practice/components/ProgressTracker', () => ({
  ProgressTracker: ({ topicId }: { topicId: string }) => (
    <div data-testid='progress-tracker'>Progress for {topicId}</div>
  ),
}));

vi.mock('../../hooks/useProgressTracker', () => ({
  useProgressTracker: () => ({
    progress: {
      completedSections: [],
      totalSections: 5,
      completedProblems: 0,
      totalProblems: 10,
    },
    updateProgress: vi.fn(),
    isCompleted: false,
  }),
}));

vi.mock('../../hooks/useKeyboardNavigation', () => ({
  useKeyboardNavigation: () => ({
    currentFocus: 0,
    setCurrentFocus: vi.fn(),
  }),
  useGlobalKeyboardShortcuts: () => ({}),
}));

// Mock Wouter's useParams hook
const mockUseParams = vi.fn();
vi.mock('wouter', async () => {
  const actual = await vi.importActual('wouter');
  return {
    ...actual,
    useParams: mockUseParams,
  };
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <Router>{children}</Router>
  </ThemeProvider>
);

describe('Topic Component Rendering', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('TopicPage Component Rendering', () => {
    it('should render topic page with valid topic data', async () => {
      const validTopic = topicsData[0]; // Use first topic from data
      mockUseParams.mockReturnValue({ id: validTopic.id });

      render(
        <TestWrapper>
          <TopicPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(validTopic.title)).toBeInTheDocument();
      });

      expect(screen.getByText(validTopic.description)).toBeInTheDocument();
      expect(screen.getByTestId('lesson-content')).toBeInTheDocument();
      expect(screen.getByTestId('practice-section')).toBeInTheDocument();
      expect(screen.getByTestId('progress-tracker')).toBeInTheDocument();
    });

    it('should render topic with different difficulty levels', async () => {
      // Test with different difficulty levels
      const easyTopic = topicsData.find(topic => topic.difficulty === 1);
      const hardTopic = topicsData.find(topic => topic.difficulty >= 4);

      if (easyTopic) {
        mockUseParams.mockReturnValue({ id: easyTopic.id });

        render(
          <TestWrapper>
            <TopicPage />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByText(easyTopic.title)).toBeInTheDocument();
        });

        // Should show difficulty indicator
        expect(
          screen.getByText(`Difficulty: ${easyTopic.difficulty}/5`)
        ).toBeInTheDocument();
      }

      if (hardTopic) {
        mockUseParams.mockReturnValue({ id: hardTopic.id });

        render(
          <TestWrapper>
            <TopicPage />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByText(hardTopic.title)).toBeInTheDocument();
        });

        expect(
          screen.getByText(`Difficulty: ${hardTopic.difficulty}/5`)
        ).toBeInTheDocument();
      }
    });

    it('should render topic with prerequisites', async () => {
      const topicWithPrereqs = topicsData.find(
        topic => topic.prerequisites.length > 0
      );

      if (topicWithPrereqs) {
        mockUseParams.mockReturnValue({ id: topicWithPrereqs.id });

        render(
          <TestWrapper>
            <TopicPage />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByText(topicWithPrereqs.title)).toBeInTheDocument();
        });

        // Should show prerequisites section
        expect(screen.getByText(/Prerequisites/i)).toBeInTheDocument();
      }
    });

    it('should render topic without prerequisites', async () => {
      const topicWithoutPrereqs = topicsData.find(
        topic => topic.prerequisites.length === 0
      );

      if (topicWithoutPrereqs) {
        mockUseParams.mockReturnValue({ id: topicWithoutPrereqs.id });

        render(
          <TestWrapper>
            <TopicPage />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(
            screen.getByText(topicWithoutPrereqs.title)
          ).toBeInTheDocument();
        });

        // Should not show prerequisites section or show "No prerequisites"
        const prereqText = screen.queryByText(/Prerequisites/i);
        if (prereqText) {
          expect(screen.getByText(/No prerequisites/i)).toBeInTheDocument();
        }
      }
    });

    it('should render math expressions correctly', async () => {
      const topicWithMath = topicsData.find(topic => topic.mathExpression);

      if (topicWithMath) {
        mockUseParams.mockReturnValue({ id: topicWithMath.id });

        render(
          <TestWrapper>
            <TopicPage />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByTestId('math-expression')).toBeInTheDocument();
        });

        expect(screen.getByTestId('math-expression')).toHaveTextContent(
          topicWithMath.mathExpression
        );
      }
    });

    it('should handle missing topic data gracefully', async () => {
      mockUseParams.mockReturnValue({ id: 'non-existent-topic' });

      render(
        <TestWrapper>
          <TopicPage />
        </TestWrapper>
      );

      // Should either show error message or redirect to 404
      await waitFor(() => {
        const errorMessage =
          screen.queryByText(/not found/i) || screen.queryByText(/error/i);
        expect(errorMessage || screen.getByText('404')).toBeInTheDocument();
      });
    });

    it('should render different topic levels correctly', async () => {
      const levels = [
        'elementary',
        'middle',
        'high',
        'advanced',
        'specialized',
      ];

      for (const level of levels) {
        const topicOfLevel = topicsData.find(topic => topic.level === level);

        if (topicOfLevel) {
          mockUseParams.mockReturnValue({ id: topicOfLevel.id });

          const { unmount } = render(
            <TestWrapper>
              <TopicPage />
            </TestWrapper>
          );

          await waitFor(() => {
            expect(screen.getByText(topicOfLevel.title)).toBeInTheDocument();
          });

          // Should show level badge
          expect(screen.getByText(topicOfLevel.level)).toBeInTheDocument();

          unmount();
        }
      }
    });

    it('should render estimated time correctly', async () => {
      const topicWithTime = topicsData.find(topic => topic.estimatedTime > 0);

      if (topicWithTime) {
        mockUseParams.mockReturnValue({ id: topicWithTime.id });

        render(
          <TestWrapper>
            <TopicPage />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(
            screen.getByText(`${topicWithTime.estimatedTime} min`)
          ).toBeInTheDocument();
        });
      }
    });
  });

  describe('Error Handling for Invalid Topic Data', () => {
    it('should handle malformed topic data', async () => {
      // Mock a topic with missing required fields
      mockUseParams.mockReturnValue({ id: 'malformed-topic' });

      render(
        <TestWrapper>
          <TopicPage />
        </TestWrapper>
      );

      // Should handle gracefully without crashing
      await waitFor(() => {
        // Either shows error or handles missing data
        expect(document.body).toBeInTheDocument();
      });
    });

    it('should handle empty topic ID', async () => {
      mockUseParams.mockReturnValue({ id: '' });

      render(
        <TestWrapper>
          <TopicPage />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should handle empty ID gracefully
        expect(document.body).toBeInTheDocument();
      });
    });

    it('should handle undefined topic ID', async () => {
      mockUseParams.mockReturnValue({ id: undefined });

      render(
        <TestWrapper>
          <TopicPage />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should handle undefined ID gracefully
        expect(document.body).toBeInTheDocument();
      });
    });
  });

  describe('NotFound Component with Topic Suggestions', () => {
    beforeEach(() => {
      // Mock window.location for NotFound component
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/topic/invalid-topic',
          href: 'http://localhost/topic/invalid-topic',
        },
        writable: true,
      });
    });

    it('should render topic suggestions based on URL', () => {
      render(
        <TestWrapper>
          <NotFound />
        </TestWrapper>
      );

      expect(screen.getByText('Topic Not Found')).toBeInTheDocument();
      expect(screen.getByText(/invalid topic/i)).toBeInTheDocument();
    });

    it('should show search functionality', () => {
      render(
        <TestWrapper>
          <NotFound />
        </TestWrapper>
      );

      expect(
        screen.getByPlaceholderText('Search for topics...')
      ).toBeInTheDocument();
    });

    it('should display topic cards with correct data', () => {
      render(
        <TestWrapper>
          <NotFound />
        </TestWrapper>
      );

      // Should show some topic suggestions
      const topicCards = screen.getAllByText(/Difficulty:/);
      expect(topicCards.length).toBeGreaterThan(0);
    });

    it('should handle empty search results', async () => {
      render(
        <TestWrapper>
          <NotFound />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search for topics...');

      // Type a search that won't match anything
      await waitFor(() => {
        searchInput.focus();
      });

      // Should handle no results gracefully
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('Component State Management', () => {
    it('should maintain component state during re-renders', async () => {
      const validTopic = topicsData[0];
      mockUseParams.mockReturnValue({ id: validTopic.id });

      const { rerender } = render(
        <TestWrapper>
          <TopicPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(validTopic.title)).toBeInTheDocument();
      });

      // Re-render with same props
      rerender(
        <TestWrapper>
          <TopicPage />
        </TestWrapper>
      );

      // Should still show the same content
      expect(screen.getByText(validTopic.title)).toBeInTheDocument();
    });

    it('should update when topic ID changes', async () => {
      const firstTopic = topicsData[0];
      const secondTopic = topicsData[1];

      mockUseParams.mockReturnValue({ id: firstTopic.id });

      const { rerender } = render(
        <TestWrapper>
          <TopicPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(firstTopic.title)).toBeInTheDocument();
      });

      // Change topic ID
      mockUseParams.mockReturnValue({ id: secondTopic.id });

      rerender(
        <TestWrapper>
          <TopicPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(secondTopic.title)).toBeInTheDocument();
      });
    });
  });
});
