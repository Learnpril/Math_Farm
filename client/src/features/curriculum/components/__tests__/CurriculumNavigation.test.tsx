import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CurriculumNavigation } from '../CurriculumNavigation';
import type { CurriculumMetadata, CurriculumProgress } from '../../types';

// Mock data
const mockMetadata: CurriculumMetadata = {
  topic: 'arithmetic',
  title: 'Arithmetic Fundamentals',
  prerequisites: [],
  objectives: ['Master basic arithmetic operations'],
  chapters: 8,
  tools: ['calculator'],
  chapterFiles: [],
  estimatedHours: 25,
  difficulty: 'elementary',
};

const mockProgress: CurriculumProgress = {
  currentChapter: 999, // All chapters unlocked
  completedChapters: [1, 2],
  chapterProgress: {
    'chapter-01': {
      completed: true,
      timeSpent: 120,
      practiceScores: { 'p1-1': 0.9, 'p1-2': 0.8 },
      masteryLevel: 0.85,
      attemptsCount: 5,
      hintsUsed: 2,
    },
    'chapter-02': {
      completed: true,
      timeSpent: 90,
      practiceScores: { 'p2-1': 1.0, 'p2-2': 0.7 },
      masteryLevel: 0.85,
      attemptsCount: 3,
      hintsUsed: 1,
    },
    'chapter-03': {
      completed: false,
      timeSpent: 30,
      practiceScores: { 'p3-1': 0.6 },
      masteryLevel: 0.6,
      attemptsCount: 2,
      hintsUsed: 3,
    },
  },
  totalTimeSpent: 240,
  achievements: [],
  lastAccessed: '2024-01-15T10:00:00.000Z',
};

describe('CurriculumNavigation', () => {
  const mockOnChapterSelect = vi.fn();

  beforeEach(() => {
    mockOnChapterSelect.mockClear();
  });

  it('renders curriculum title and progress overview', () => {
    render(
      <CurriculumNavigation
        metadata={mockMetadata}
        progress={mockProgress}
        currentChapter={1}
        onChapterSelect={mockOnChapterSelect}
      />
    );

    expect(screen.getByText('Arithmetic Fundamentals')).toBeInTheDocument();
    expect(screen.getByText('2/7 chapters')).toBeInTheDocument();
  });

  it('displays overall progress bar correctly', () => {
    render(
      <CurriculumNavigation
        metadata={mockMetadata}
        progress={mockProgress}
        currentChapter={1}
        onChapterSelect={mockOnChapterSelect}
      />
    );

    // Look for the progress bar div with the specific classes
    const progressBar = document.querySelector(
      '.bg-gradient-to-r.from-purple-500.to-purple-600'
    );
    expect(progressBar).toHaveStyle('width: 28.57%'); // 2/7 chapters ≈ 28.57%
  });

  it('renders all chapters with correct titles', () => {
    render(
      <CurriculumNavigation
        metadata={mockMetadata}
        progress={mockProgress}
        currentChapter={1}
        onChapterSelect={mockOnChapterSelect}
      />
    );

    const expectedTitles = [
      'Numbers and Place Value',
      'Addition and Subtraction',
      'Multiplication Basics',
      'Division Basics',
      'Fractions',
      'Decimals',
      'Percentages and Ratios',
      'Problem Solving and Applications',
    ];

    expectedTitles.forEach(title => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });

  it('shows completed chapters with check icons', () => {
    render(
      <CurriculumNavigation
        metadata={mockMetadata}
        progress={mockProgress}
        currentChapter={1}
        onChapterSelect={mockOnChapterSelect}
      />
    );

    // Check for completed chapters (1 and 2) - look for SVG elements with green color
    const checkIcons = document.querySelectorAll('svg.text-green-500');
    expect(checkIcons).toHaveLength(2);
  });

  it('shows mastery levels for completed chapters', () => {
    render(
      <CurriculumNavigation
        metadata={mockMetadata}
        progress={mockProgress}
        currentChapter={1}
        onChapterSelect={mockOnChapterSelect}
      />
    );

    // Both completed chapters should show 85% mastery
    const masteryTexts = screen.getAllByText('85%');
    expect(masteryTexts).toHaveLength(2);
  });

  it('highlights current chapter correctly', () => {
    render(
      <CurriculumNavigation
        metadata={mockMetadata}
        progress={mockProgress}
        currentChapter={3}
        onChapterSelect={mockOnChapterSelect}
      />
    );

    const chapter3Button = screen.getByRole('button', { name: /Chapter 3/ });
    expect(chapter3Button).toHaveClass('bg-purple-50');
  });

  it('calls onChapterSelect when chapter is clicked', () => {
    render(
      <CurriculumNavigation
        metadata={mockMetadata}
        progress={mockProgress}
        currentChapter={1}
        onChapterSelect={mockOnChapterSelect}
      />
    );

    const chapter3Button = screen.getByRole('button', { name: /Chapter 3/ });
    fireEvent.click(chapter3Button);

    expect(mockOnChapterSelect).toHaveBeenCalledWith(3);
  });

  it('calls onChapterSelect even when current chapter is clicked', () => {
    render(
      <CurriculumNavigation
        metadata={mockMetadata}
        progress={mockProgress}
        currentChapter={2}
        onChapterSelect={mockOnChapterSelect}
      />
    );

    const chapter2Button = screen.getByRole('button', { name: /Chapter 2/ });
    fireEvent.click(chapter2Button);

    // The component should call onChapterSelect - parent handles preventing duplicate navigation
    expect(mockOnChapterSelect).toHaveBeenCalledWith(2);
  });

  it('displays total time spent correctly', () => {
    render(
      <CurriculumNavigation
        metadata={mockMetadata}
        progress={mockProgress}
        currentChapter={1}
        onChapterSelect={mockOnChapterSelect}
      />
    );

    expect(screen.getByText('Time spent: 4h 0m')).toBeInTheDocument();
  });

  it('displays last accessed date correctly', () => {
    render(
      <CurriculumNavigation
        metadata={mockMetadata}
        progress={mockProgress}
        currentChapter={1}
        onChapterSelect={mockOnChapterSelect}
      />
    );

    expect(screen.getByText(/Last accessed: 1\/15\/2024/)).toBeInTheDocument();
  });

  it('handles chapters without progress data', () => {
    const progressWithoutChapter4: CurriculumProgress = {
      ...mockProgress,
      chapterProgress: {
        'chapter-01': mockProgress.chapterProgress['chapter-01'],
        'chapter-02': mockProgress.chapterProgress['chapter-02'],
        // chapter-04 missing
      },
    };

    render(
      <CurriculumNavigation
        metadata={mockMetadata}
        progress={progressWithoutChapter4}
        currentChapter={4}
        onChapterSelect={mockOnChapterSelect}
      />
    );

    // Should still render chapter 4 without errors
    expect(screen.getByText('Chapter 4')).toBeInTheDocument();
    expect(screen.getByText('Division Basics')).toBeInTheDocument();
  });

  it('calculates mastery level correctly for chapters with no practice scores', () => {
    const progressWithEmptyScores: CurriculumProgress = {
      ...mockProgress,
      chapterProgress: {
        'chapter-01': {
          completed: false,
          timeSpent: 30,
          practiceScores: {}, // Empty scores
          masteryLevel: 0,
          attemptsCount: 0,
          hintsUsed: 0,
        },
      },
    };

    render(
      <CurriculumNavigation
        metadata={mockMetadata}
        progress={progressWithEmptyScores}
        currentChapter={1}
        onChapterSelect={mockOnChapterSelect}
      />
    );

    // Should not show mastery level for chapters with no scores
    expect(screen.queryByText('Mastery')).not.toBeInTheDocument();
  });
});
