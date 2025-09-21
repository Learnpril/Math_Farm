import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ArithmeticCurriculumPage } from '../components/ArithmeticCurriculumPage';

// Mock the wouter hooks
const mockSetLocation = vi.fn();
vi.mock('wouter', () => ({
  useParams: () => ({ chapter: '1' }),
  useLocation: () => ['/topic/arithmetic/curriculum/1', mockSetLocation],
}));

// Mock the curriculum data loader
vi.mock('../lib/curriculum-data-loader', () => ({
  loadCurriculumMetadata: vi.fn().mockResolvedValue({
    topic: 'arithmetic',
    title: 'Arithmetic Fundamentals',
    prerequisites: [],
    objectives: ['Master basic arithmetic operations'],
    chapters: 8,
    tools: ['calculator'],
    chapterFiles: [],
    estimatedHours: 25,
    difficulty: 'elementary',
  }),
  loadChapterData: vi.fn().mockImplementation((topic, chapterId) => {
    const chapterNumber = parseInt(chapterId.split('-')[1]);
    return Promise.resolve({
      id: chapterId,
      title: `Chapter ${chapterNumber} Title`,
      objectives: [`Learn chapter ${chapterNumber} concepts`],
      prerequisites: [],
      introduction: {
        context: `Chapter ${chapterNumber} context`,
        connection: `Chapter ${chapterNumber} connection`,
      },
      theory: {
        concepts: [
          {
            title: `Concept ${chapterNumber}`,
            content: `Content for chapter ${chapterNumber}`,
            latex: `x = ${chapterNumber}`,
            visuals: ['chart'],
          },
        ],
      },
      examples: [
        {
          problem: `Example problem ${chapterNumber}`,
          solution: `Solution ${chapterNumber}`,
          steps: [`Step 1 for chapter ${chapterNumber}`],
          commonErrors: [`Common error ${chapterNumber}`],
        },
      ],
      practice: [
        {
          id: `p${chapterNumber}-1`,
          type: 'multiple-choice' as const,
          problem: `Practice problem ${chapterNumber}`,
          options: ['A', 'B', 'C', 'D'],
          correct: 0,
          hints: [`Hint for chapter ${chapterNumber}`],
          explanation: `Explanation for chapter ${chapterNumber}`,
          difficulty: 1 as const,
        },
      ],
      tools: ['calculator'],
      assessment: {
        masteryThreshold: 0.8,
        requiredProblems: 3,
      },
    });
  }),
}));

// Mock MathJax components
vi.mock('../components/MathExpression', () => ({
  MathJaxProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  MathExpression: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Navigation and Progress Integration', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    mockSetLocation.mockClear();
  });

  it('loads and displays curriculum with navigation', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    render(<ArithmeticCurriculumPage />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getAllByText('Arithmetic Fundamentals')).toHaveLength(2); // Header and navigation
    });

    // Check navigation is rendered
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('0/8 chapters')).toBeInTheDocument();

    // Check all chapters are listed
    for (let i = 1; i <= 8; i++) {
      expect(screen.getByText(`Chapter ${i}`)).toBeInTheDocument();
    }
  });

  it('navigates between chapters and updates URL', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    render(<ArithmeticCurriculumPage />);

    await waitFor(() => {
      expect(screen.getByText('Arithmetic Fundamentals')).toBeInTheDocument();
    });

    // Click on Chapter 3
    const chapter3Button = screen.getByRole('button', { name: /Chapter 3/ });
    fireEvent.click(chapter3Button);

    // Should update the URL
    expect(mockSetLocation).toHaveBeenCalledWith(
      '/topic/arithmetic/curriculum/3'
    );
  });

  it('persists progress across browser sessions', async () => {
    // First session - complete chapter 1
    const initialProgress = {
      currentChapter: 999,
      completedChapters: [1],
      chapterProgress: {
        'chapter-01': {
          completed: true,
          timeSpent: 120,
          practiceScores: { 'p1-1': 0.9 },
          masteryLevel: 0.9,
          attemptsCount: 3,
          hintsUsed: 1,
        },
      },
      totalTimeSpent: 120,
      achievements: [],
      lastAccessed: '2024-01-15T10:00:00.000Z',
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(initialProgress));

    render(<ArithmeticCurriculumPage />);

    await waitFor(() => {
      expect(screen.getByText('Arithmetic Fundamentals')).toBeInTheDocument();
    });

    // Should show completed chapter 1
    expect(screen.getByText('1/8 chapters')).toBeInTheDocument();

    // Should show progress bar at 12.5% (1/8)
    const progressBar = screen.getByRole('progressbar', { hidden: true });
    expect(progressBar).toHaveStyle('width: 12.5%');

    // Should show time spent
    expect(screen.getByText('Time spent: 2h 0m')).toBeInTheDocument();
  });

  it('validates mastery calculation logic', async () => {
    const progressWithScores = {
      currentChapter: 999,
      completedChapters: [1, 2],
      chapterProgress: {
        'chapter-01': {
          completed: true,
          timeSpent: 120,
          practiceScores: {
            'p1-1': 0.8,
            'p1-2': 0.9,
            'p1-3': 0.7,
          },
          masteryLevel: 0.8,
          attemptsCount: 6,
          hintsUsed: 2,
        },
        'chapter-02': {
          completed: true,
          timeSpent: 90,
          practiceScores: {
            'p2-1': 1.0,
            'p2-2': 0.95,
          },
          masteryLevel: 0.975,
          attemptsCount: 4,
          hintsUsed: 0,
        },
      },
      totalTimeSpent: 210,
      achievements: [],
      lastAccessed: '2024-01-15T10:00:00.000Z',
    };

    localStorageMock.getItem.mockReturnValue(
      JSON.stringify(progressWithScores)
    );

    render(<ArithmeticCurriculumPage />);

    await waitFor(() => {
      expect(screen.getByText('Arithmetic Fundamentals')).toBeInTheDocument();
    });

    // Should show mastery levels
    // Chapter 1: (0.8 + 0.9 + 0.7) / 3 = 0.8 = 80%
    expect(screen.getByText('80%')).toBeInTheDocument();

    // Chapter 2: (1.0 + 0.95) / 2 = 0.975 = 98%
    expect(screen.getByText('98%')).toBeInTheDocument();
  });

  it('handles navigation with incomplete progress data', async () => {
    const partialProgress = {
      currentChapter: 999,
      completedChapters: [1],
      chapterProgress: {
        'chapter-01': {
          completed: true,
          timeSpent: 60,
          practiceScores: {},
          masteryLevel: 0,
          attemptsCount: 0,
          hintsUsed: 0,
        },
        // Missing chapter-02 and beyond
      },
      totalTimeSpent: 60,
      achievements: [],
      lastAccessed: '2024-01-15T10:00:00.000Z',
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(partialProgress));

    render(<ArithmeticCurriculumPage />);

    await waitFor(() => {
      expect(screen.getByText('Arithmetic Fundamentals')).toBeInTheDocument();
    });

    // Should still show all chapters
    for (let i = 1; i <= 8; i++) {
      expect(screen.getByText(`Chapter ${i}`)).toBeInTheDocument();
    }

    // Should be able to navigate to any chapter
    const chapter5Button = screen.getByRole('button', { name: /Chapter 5/ });
    fireEvent.click(chapter5Button);

    expect(mockSetLocation).toHaveBeenCalledWith(
      '/topic/arithmetic/curriculum/5'
    );
  });

  it('updates progress when navigating between chapters', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    render(<ArithmeticCurriculumPage />);

    await waitFor(() => {
      expect(screen.getByText('Arithmetic Fundamentals')).toBeInTheDocument();
    });

    // Navigate to chapter 2
    const chapter2Button = screen.getByRole('button', { name: /Chapter 2/ });
    fireEvent.click(chapter2Button);

    // Should save progress to localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'mathfarm_arithmetic_progress',
      expect.stringContaining('"lastAccessed"')
    );
  });

  it('displays correct chapter status icons', async () => {
    const progressWithMixedStatus = {
      currentChapter: 999,
      completedChapters: [1, 3],
      chapterProgress: {
        'chapter-01': {
          completed: true,
          timeSpent: 120,
          practiceScores: { 'p1-1': 0.9 },
          masteryLevel: 0.9,
          attemptsCount: 3,
          hintsUsed: 1,
        },
        'chapter-02': {
          completed: false,
          timeSpent: 30,
          practiceScores: { 'p2-1': 0.6 },
          masteryLevel: 0.6,
          attemptsCount: 2,
          hintsUsed: 3,
        },
        'chapter-03': {
          completed: true,
          timeSpent: 90,
          practiceScores: { 'p3-1': 0.8 },
          masteryLevel: 0.8,
          attemptsCount: 2,
          hintsUsed: 0,
        },
      },
      totalTimeSpent: 240,
      achievements: [],
      lastAccessed: '2024-01-15T10:00:00.000Z',
    };

    localStorageMock.getItem.mockReturnValue(
      JSON.stringify(progressWithMixedStatus)
    );

    render(<ArithmeticCurriculumPage />);

    await waitFor(() => {
      expect(screen.getByText('Arithmetic Fundamentals')).toBeInTheDocument();
    });

    // Should show 2 completed chapters (1 and 3)
    const checkIcons = screen.getAllByTestId('check-circle-icon');
    expect(checkIcons).toHaveLength(2);

    // Should show progress as 2/8 chapters
    expect(screen.getByText('2/8 chapters')).toBeInTheDocument();
  });

  it('handles corrupted localStorage gracefully', async () => {
    localStorageMock.getItem.mockReturnValue('invalid json data');
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(<ArithmeticCurriculumPage />);

    await waitFor(() => {
      expect(screen.getByText('Arithmetic Fundamentals')).toBeInTheDocument();
    });

    // Should still render with default progress
    expect(screen.getByText('0/8 chapters')).toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
