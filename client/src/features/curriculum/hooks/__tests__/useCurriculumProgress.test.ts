import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCurriculumProgress } from '../useCurriculumProgress';

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

describe('useCurriculumProgress', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
  });

  it('initializes with default progress when localStorage is empty', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useCurriculumProgress());

    expect(result.current.progress).toEqual({
      currentChapter: 999,
      completedChapters: [],
      chapterProgress: {},
      totalTimeSpent: 0,
      achievements: [],
      lastAccessed: expect.any(String),
    });
    expect(result.current.loading).toBe(false);
  });

  it('loads progress from localStorage on mount', () => {
    const storedProgress = {
      currentChapter: 3,
      completedChapters: [1, 2],
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
      achievements: ['first-chapter'],
      lastAccessed: '2024-01-15T10:00:00.000Z',
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedProgress));

    const { result } = renderHook(() => useCurriculumProgress());

    expect(result.current.progress).toEqual({
      ...storedProgress,
      currentChapter: 999, // Always unlocked
    });
  });

  it('handles corrupted localStorage data gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid json');
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useCurriculumProgress());

    expect(result.current.progress.currentChapter).toBe(999);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to load curriculum progress:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('saves progress to localStorage when progress changes', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useCurriculumProgress());

    await act(async () => {
      result.current.updateChapterProgress('chapter-01', {
        completed: true,
        masteryLevel: 0.8,
      });
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'mathfarm_arithmetic_progress',
      expect.stringContaining('"chapter-01"')
    );
  });

  it('updates chapter progress correctly', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useCurriculumProgress());

    await act(async () => {
      result.current.updateChapterProgress('chapter-01', {
        completed: true,
        timeSpent: 60,
        masteryLevel: 0.85,
      });
    });

    expect(result.current.progress.chapterProgress['chapter-01']).toEqual({
      completed: true,
      timeSpent: 60,
      practiceScores: {},
      masteryLevel: 0.85,
      attemptsCount: 0,
      hintsUsed: 0,
    });
  });

  it('completes chapter and updates progress correctly', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useCurriculumProgress());

    await act(async () => {
      result.current.completeChapter('chapter-02');
    });

    expect(result.current.progress.completedChapters).toContain(2);
    const chapterProgress =
      result.current.progress.chapterProgress['chapter-02'];
    expect(chapterProgress.completed).toBe(true);
    expect(chapterProgress.masteryLevel).toBe(1);
    // Since completeChapter doesn't call updateChapterProgress, it only sets the fields it explicitly sets
    expect(chapterProgress).toEqual({
      completed: true,
      masteryLevel: 1,
    });
  });

  it('records practice attempts correctly', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useCurriculumProgress());

    await act(async () => {
      result.current.recordPracticeAttempt('chapter-01', 'p1-1', 0.9, 2);
    });

    const chapterProgress =
      result.current.progress.chapterProgress['chapter-01'];
    expect(chapterProgress.practiceScores['p1-1']).toBe(0.9);
    expect(chapterProgress.attemptsCount).toBe(1);
    expect(chapterProgress.hintsUsed).toBe(2);
  });

  it('adds time spent correctly', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useCurriculumProgress());

    await act(async () => {
      result.current.addTimeSpent('chapter-01', 30);
    });

    expect(
      result.current.progress.chapterProgress['chapter-01'].timeSpent
    ).toBe(30);
    expect(result.current.progress.totalTimeSpent).toBe(30);

    await act(async () => {
      result.current.addTimeSpent('chapter-01', 15);
    });

    expect(
      result.current.progress.chapterProgress['chapter-01'].timeSpent
    ).toBe(45);
    expect(result.current.progress.totalTimeSpent).toBe(45);
  });

  it('calculates mastery level correctly', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useCurriculumProgress());

    // Add some practice scores
    await act(async () => {
      result.current.updateChapterProgress('chapter-01', {
        practiceScores: {
          'p1-1': 0.8,
          'p1-2': 0.9,
          'p1-3': 0.7,
        },
      });
    });

    const masteryLevel = result.current.calculateMasteryLevel('chapter-01');
    expect(masteryLevel).toBeCloseTo(0.8); // (0.8 + 0.9 + 0.7) / 3
  });

  it('returns 0 mastery level for chapters with no scores', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useCurriculumProgress());

    const masteryLevel = result.current.calculateMasteryLevel('chapter-01');
    expect(masteryLevel).toBe(0);
  });

  it('calculates overall progress correctly', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useCurriculumProgress());

    await act(async () => {
      result.current.completeChapter('chapter-01');
      result.current.completeChapter('chapter-02');
    });

    const overallProgress = result.current.getOverallProgress();
    expect(overallProgress).toBeCloseTo(0.25); // 2/8 chapters
  });

  it('resets progress correctly', async () => {
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify({
        currentChapter: 5,
        completedChapters: [1, 2, 3, 4],
        chapterProgress: { 'chapter-01': { completed: true } },
        totalTimeSpent: 300,
        achievements: ['test'],
        lastAccessed: '2024-01-15T10:00:00.000Z',
      })
    );

    const { result } = renderHook(() => useCurriculumProgress());

    await act(async () => {
      result.current.resetProgress();
    });

    expect(result.current.progress.completedChapters).toEqual([]);
    expect(result.current.progress.chapterProgress).toEqual({});
    expect(result.current.progress.totalTimeSpent).toBe(0);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(
      'mathfarm_arithmetic_progress'
    );
  });

  it('clears progress for testing', async () => {
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify({
        currentChapter: 5,
        completedChapters: [1, 2],
        totalTimeSpent: 100,
      })
    );

    const { result } = renderHook(() => useCurriculumProgress());

    await act(async () => {
      result.current.clearProgressForTesting();
    });

    expect(result.current.progress.completedChapters).toEqual([]);
    expect(result.current.progress.totalTimeSpent).toBe(0);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(
      'mathfarm_arithmetic_progress'
    );
  });

  it('handles localStorage save errors gracefully', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useCurriculumProgress());

    await act(async () => {
      result.current.updateChapterProgress('chapter-01', { completed: true });
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to save curriculum progress:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('updates lastAccessed timestamp when progress changes', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useCurriculumProgress());

    const initialTimestamp = result.current.progress.lastAccessed;

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    await act(async () => {
      result.current.updateChapterProgress('chapter-01', { completed: true });
    });

    expect(result.current.progress.lastAccessed).not.toBe(initialTimestamp);
    expect(
      new Date(result.current.progress.lastAccessed).getTime()
    ).toBeGreaterThan(new Date(initialTimestamp).getTime());
  });

  it('preserves existing chapter progress when updating', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useCurriculumProgress());

    // Set initial progress
    await act(async () => {
      result.current.updateChapterProgress('chapter-01', {
        timeSpent: 60,
        practiceScores: { 'p1-1': 0.8 },
        attemptsCount: 3,
      });
    });

    // Update with partial data
    await act(async () => {
      result.current.updateChapterProgress('chapter-01', {
        completed: true,
        masteryLevel: 0.9,
      });
    });

    const chapterProgress =
      result.current.progress.chapterProgress['chapter-01'];
    expect(chapterProgress).toEqual({
      completed: true,
      timeSpent: 60,
      practiceScores: { 'p1-1': 0.8 },
      masteryLevel: 0.9,
      attemptsCount: 3,
      hintsUsed: 0,
    });
  });
});
