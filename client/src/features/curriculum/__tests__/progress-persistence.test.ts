import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCurriculumProgress } from '../hooks/useCurriculumProgress';

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

describe('Progress Persistence Across Browser Sessions', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
  });

  it('persists progress when user completes chapters', async () => {
    // Start with empty localStorage
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useCurriculumProgress());

    // Complete chapter 1
    await act(async () => {
      result.current.completeChapter('chapter-01');
    });

    // Add some practice scores
    await act(async () => {
      result.current.recordPracticeAttempt('chapter-01', 'p1-1', 0.9, 1);
      result.current.recordPracticeAttempt('chapter-01', 'p1-2', 0.8, 0);
    });

    // Add time spent
    await act(async () => {
      result.current.addTimeSpent('chapter-01', 120);
    });

    // Verify localStorage was called with correct data
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'mathfarm_arithmetic_progress',
      expect.stringContaining('"completedChapters":[1]')
    );

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'mathfarm_arithmetic_progress',
      expect.stringContaining('"chapter-01"')
    );

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'mathfarm_arithmetic_progress',
      expect.stringContaining('"totalTimeSpent":120')
    );
  });

  it('restores progress in new browser session', () => {
    // Simulate stored progress from previous session
    const storedProgress = {
      currentChapter: 3,
      completedChapters: [1, 2],
      chapterProgress: {
        'chapter-01': {
          completed: true,
          timeSpent: 120,
          practiceScores: {
            'p1-1': 0.9,
            'p1-2': 0.8,
            'p1-3': 0.85,
          },
          masteryLevel: 0.85,
          attemptsCount: 6,
          hintsUsed: 2,
        },
        'chapter-02': {
          completed: true,
          timeSpent: 90,
          practiceScores: {
            'p2-1': 1.0,
            'p2-2': 0.7,
          },
          masteryLevel: 0.85,
          attemptsCount: 4,
          hintsUsed: 1,
        },
      },
      totalTimeSpent: 210,
      achievements: ['first-chapter', 'quick-learner'],
      lastAccessed: '2024-01-15T10:00:00.000Z',
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedProgress));

    // Create new hook instance (simulating new session)
    const { result } = renderHook(() => useCurriculumProgress());

    // Should restore all progress data (except currentChapter which is always 999)
    expect(result.current.progress).toEqual({
      ...storedProgress,
      currentChapter: 999, // Always unlocked
    });

    expect(result.current.progress.completedChapters).toEqual([1, 2]);
    expect(result.current.progress.totalTimeSpent).toBe(210);
    expect(result.current.progress.achievements).toEqual([
      'first-chapter',
      'quick-learner',
    ]);
  });

  it('handles partial progress restoration', () => {
    // Simulate progress with missing fields (from older version)
    const partialProgress = {
      currentChapter: 2,
      completedChapters: [1],
      chapterProgress: {
        'chapter-01': {
          completed: true,
          timeSpent: 60,
          // Missing practiceScores, masteryLevel, etc.
        },
      },
      totalTimeSpent: 60,
      // Missing achievements and lastAccessed
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(partialProgress));

    const { result } = renderHook(() => useCurriculumProgress());

    // Should fill in missing fields with defaults
    expect(result.current.progress.achievements).toEqual([]);
    expect(result.current.progress.lastAccessed).toBeDefined();
    expect(result.current.progress.chapterProgress['chapter-01']).toEqual({
      completed: true,
      timeSpent: 60,
      practiceScores: {},
      masteryLevel: 0,
      attemptsCount: 0,
      hintsUsed: 0,
    });
  });

  it('maintains progress consistency across multiple operations', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useCurriculumProgress());

    // Perform multiple operations in sequence
    await act(async () => {
      // Start chapter 1
      result.current.addTimeSpent('chapter-01', 30);

      // Practice some problems
      result.current.recordPracticeAttempt('chapter-01', 'p1-1', 0.7, 2);
      result.current.recordPracticeAttempt('chapter-01', 'p1-2', 0.9, 0);

      // Add more time
      result.current.addTimeSpent('chapter-01', 45);

      // Complete the chapter
      result.current.completeChapter('chapter-01');

      // Start chapter 2
      result.current.addTimeSpent('chapter-02', 15);
    });

    // Verify final state is consistent
    const progress = result.current.progress;

    expect(progress.completedChapters).toEqual([1]);
    expect(progress.totalTimeSpent).toBe(90); // 30 + 45 + 15

    const chapter1Progress = progress.chapterProgress['chapter-01'];
    expect(chapter1Progress.completed).toBe(true);
    expect(chapter1Progress.timeSpent).toBe(75); // 30 + 45
    expect(chapter1Progress.practiceScores).toEqual({
      'p1-1': 0.7,
      'p1-2': 0.9,
    });
    expect(chapter1Progress.attemptsCount).toBe(2);
    expect(chapter1Progress.hintsUsed).toBe(2);

    const chapter2Progress = progress.chapterProgress['chapter-02'];
    expect(chapter2Progress.timeSpent).toBe(15);
    expect(chapter2Progress.completed).toBe(false);
  });

  it('handles localStorage quota exceeded gracefully', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useCurriculumProgress());

    await act(async () => {
      result.current.completeChapter('chapter-01');
    });

    // Should log warning but not crash
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to save curriculum progress:',
      expect.any(DOMException)
    );

    // Progress should still be updated in memory
    expect(result.current.progress.completedChapters).toContain(1);

    consoleSpy.mockRestore();
  });

  it('migrates old progress format to new format', () => {
    // Simulate old format without some new fields
    const oldFormatProgress = {
      currentChapter: 2,
      completedChapters: [1],
      chapterProgress: {
        'chapter-01': {
          completed: true,
          timeSpent: 120,
          practiceScores: { 'p1-1': 0.8 },
          // Missing masteryLevel, attemptsCount, hintsUsed
        },
      },
      totalTimeSpent: 120,
      // Missing achievements, lastAccessed
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(oldFormatProgress));

    const { result } = renderHook(() => useCurriculumProgress());

    // Should migrate to new format
    const progress = result.current.progress;
    expect(progress.achievements).toEqual([]);
    expect(progress.lastAccessed).toBeDefined();

    const chapterProgress = progress.chapterProgress['chapter-01'];
    expect(chapterProgress.masteryLevel).toBe(0);
    expect(chapterProgress.attemptsCount).toBe(0);
    expect(chapterProgress.hintsUsed).toBe(0);
  });

  it('preserves progress across hook re-renders', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result, rerender } = renderHook(() => useCurriculumProgress());

    // Make some progress
    await act(async () => {
      result.current.completeChapter('chapter-01');
      result.current.addTimeSpent('chapter-01', 60);
    });

    const progressAfterChanges = result.current.progress;

    // Re-render the hook
    rerender();

    // Progress should be preserved
    expect(result.current.progress).toEqual(progressAfterChanges);
  });

  it('handles concurrent localStorage access', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    // Create two hook instances (simulating multiple tabs)
    const { result: result1 } = renderHook(() => useCurriculumProgress());
    const { result: result2 } = renderHook(() => useCurriculumProgress());

    // Make changes in both instances
    await act(async () => {
      result1.current.completeChapter('chapter-01');
    });

    await act(async () => {
      result2.current.addTimeSpent('chapter-02', 30);
    });

    // Both should save to localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
  });

  it('validates stored data integrity', () => {
    // Test with various invalid data scenarios
    const invalidDataScenarios = [
      'not json',
      '{"invalid": "structure"}',
      '{"completedChapters": "not an array"}',
      '{"chapterProgress": "not an object"}',
      '{"totalTimeSpent": "not a number"}',
    ];

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    invalidDataScenarios.forEach(invalidData => {
      localStorageMock.getItem.mockReturnValue(invalidData);

      const { result } = renderHook(() => useCurriculumProgress());

      // Should fall back to default progress
      expect(result.current.progress.completedChapters).toEqual([]);
      expect(result.current.progress.totalTimeSpent).toBe(0);
      expect(result.current.progress.chapterProgress).toEqual({});
    });

    consoleSpy.mockRestore();
  });
});
