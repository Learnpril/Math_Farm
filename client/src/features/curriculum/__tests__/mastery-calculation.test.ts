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

describe('Mastery Calculation Logic', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('calculates mastery level correctly for single practice score', async () => {
    const { result } = renderHook(() => useCurriculumProgress());

    await act(async () => {
      result.current.recordPracticeAttempt('chapter-01', 'p1-1', 0.85, 1);
    });

    const masteryLevel = result.current.calculateMasteryLevel('chapter-01');
    expect(masteryLevel).toBe(0.85);
  });

  it('calculates mastery level correctly for multiple practice scores', async () => {
    const { result } = renderHook(() => useCurriculumProgress());

    await act(async () => {
      result.current.recordPracticeAttempt('chapter-01', 'p1-1', 0.8, 0);
    });

    await act(async () => {
      result.current.recordPracticeAttempt('chapter-01', 'p1-2', 0.9, 1);
    });

    await act(async () => {
      result.current.recordPracticeAttempt('chapter-01', 'p1-3', 0.7, 2);
    });

    const masteryLevel = result.current.calculateMasteryLevel('chapter-01');
    expect(masteryLevel).toBeCloseTo(0.8); // (0.8 + 0.9 + 0.7) / 3 = 0.8
  });

  it('returns 0 mastery level for chapters with no practice scores', () => {
    const { result } = renderHook(() => useCurriculumProgress());

    const masteryLevel = result.current.calculateMasteryLevel('chapter-01');
    expect(masteryLevel).toBe(0);
  });

  it('returns 0 mastery level for non-existent chapters', () => {
    const { result } = renderHook(() => useCurriculumProgress());

    const masteryLevel = result.current.calculateMasteryLevel('chapter-99');
    expect(masteryLevel).toBe(0);
  });

  it('handles perfect scores correctly', async () => {
    const { result } = renderHook(() => useCurriculumProgress());

    await act(async () => {
      result.current.recordPracticeAttempt('chapter-01', 'p1-1', 1.0, 0);
      result.current.recordPracticeAttempt('chapter-01', 'p1-2', 1.0, 0);
      result.current.recordPracticeAttempt('chapter-01', 'p1-3', 1.0, 0);
    });

    const masteryLevel = result.current.calculateMasteryLevel('chapter-01');
    expect(masteryLevel).toBe(1.0);
  });

  it('handles zero scores correctly', async () => {
    const { result } = renderHook(() => useCurriculumProgress());

    await act(async () => {
      result.current.recordPracticeAttempt('chapter-01', 'p1-1', 0.0, 3);
      result.current.recordPracticeAttempt('chapter-01', 'p1-2', 0.0, 3);
    });

    const masteryLevel = result.current.calculateMasteryLevel('chapter-01');
    expect(masteryLevel).toBe(0.0);
  });

  it('updates mastery level when practice scores change', async () => {
    const { result } = renderHook(() => useCurriculumProgress());

    // Initial attempt with low score
    await act(async () => {
      result.current.recordPracticeAttempt('chapter-01', 'p1-1', 0.5, 2);
    });

    expect(result.current.calculateMasteryLevel('chapter-01')).toBe(0.5);

    // Retry with better score
    await act(async () => {
      result.current.recordPracticeAttempt('chapter-01', 'p1-1', 0.9, 0);
    });

    expect(result.current.calculateMasteryLevel('chapter-01')).toBe(0.9);
  });

  it('calculates mastery level with mixed performance', async () => {
    const { result } = renderHook(() => useCurriculumProgress());

    await act(async () => {
      result.current.recordPracticeAttempt('chapter-01', 'p1-1', 1.0, 0); // Perfect
    });

    await act(async () => {
      result.current.recordPracticeAttempt('chapter-01', 'p1-2', 0.6, 3); // Struggling
    });

    await act(async () => {
      result.current.recordPracticeAttempt('chapter-01', 'p1-3', 0.8, 1); // Good
    });

    await act(async () => {
      result.current.recordPracticeAttempt('chapter-01', 'p1-4', 0.4, 4); // Poor
    });

    await act(async () => {
      result.current.recordPracticeAttempt('chapter-01', 'p1-5', 0.9, 0); // Excellent
    });

    const masteryLevel = result.current.calculateMasteryLevel('chapter-01');
    expect(masteryLevel).toBeCloseTo(0.74); // (1.0 + 0.6 + 0.8 + 0.4 + 0.9) / 5 = 0.74
  });

  it('caps mastery level at 1.0 even with scores above 1', async () => {
    const { result } = renderHook(() => useCurriculumProgress());

    // Manually set scores above 1 (edge case)
    await act(async () => {
      result.current.updateChapterProgress('chapter-01', {
        practiceScores: {
          'p1-1': 1.2, // Invalid score above 1
          'p1-2': 0.8,
        },
      });
    });

    const masteryLevel = result.current.calculateMasteryLevel('chapter-01');
    expect(masteryLevel).toBeLessThanOrEqual(1.0);
  });

  it('calculates overall progress correctly', async () => {
    const { result } = renderHook(() => useCurriculumProgress());

    // Complete 3 out of 7 chapters
    await act(async () => {
      result.current.completeChapter('chapter-01');
      result.current.completeChapter('chapter-03');
      result.current.completeChapter('chapter-05');
    });

    const overallProgress = result.current.getOverallProgress();
    expect(overallProgress).toBeCloseTo(0.375); // 3/8 = 0.375
  });

  it('handles duplicate chapter completions correctly', async () => {
    const { result } = renderHook(() => useCurriculumProgress());

    await act(async () => {
      result.current.completeChapter('chapter-01');
      result.current.completeChapter('chapter-01'); // Duplicate
      result.current.completeChapter('chapter-02');
    });

    expect(result.current.progress.completedChapters).toEqual([1, 2]);
    expect(result.current.getOverallProgress()).toBeCloseTo(0.25); // 2/8 = 0.25
  });

  it('maintains mastery level consistency across operations', async () => {
    const { result } = renderHook(() => useCurriculumProgress());

    // Build up practice scores gradually
    await act(async () => {
      result.current.recordPracticeAttempt('chapter-01', 'p1-1', 0.7, 2);
    });

    expect(result.current.calculateMasteryLevel('chapter-01')).toBe(0.7);

    await act(async () => {
      result.current.recordPracticeAttempt('chapter-01', 'p1-2', 0.9, 0);
    });

    expect(result.current.calculateMasteryLevel('chapter-01')).toBeCloseTo(0.8); // (0.7 + 0.9) / 2

    await act(async () => {
      result.current.recordPracticeAttempt('chapter-01', 'p1-3', 0.6, 3);
    });

    expect(result.current.calculateMasteryLevel('chapter-01')).toBeCloseTo(
      0.733
    ); // (0.7 + 0.9 + 0.6) / 3
  });

  it('calculates mastery for multiple chapters independently', async () => {
    const { result } = renderHook(() => useCurriculumProgress());

    // Chapter 1: High mastery
    await act(async () => {
      result.current.recordPracticeAttempt('chapter-01', 'p1-1', 0.9, 0);
    });

    await act(async () => {
      result.current.recordPracticeAttempt('chapter-01', 'p1-2', 0.95, 0);
    });

    // Chapter 2: Medium mastery
    await act(async () => {
      result.current.recordPracticeAttempt('chapter-02', 'p2-1', 0.7, 1);
    });

    await act(async () => {
      result.current.recordPracticeAttempt('chapter-02', 'p2-2', 0.8, 1);
    });

    // Chapter 3: Low mastery
    await act(async () => {
      result.current.recordPracticeAttempt('chapter-03', 'p3-1', 0.5, 3);
    });

    await act(async () => {
      result.current.recordPracticeAttempt('chapter-03', 'p3-2', 0.4, 4);
    });

    expect(result.current.calculateMasteryLevel('chapter-01')).toBeCloseTo(
      0.925
    ); // (0.9 + 0.95) / 2
    expect(result.current.calculateMasteryLevel('chapter-02')).toBeCloseTo(
      0.75
    ); // (0.7 + 0.8) / 2
    expect(result.current.calculateMasteryLevel('chapter-03')).toBeCloseTo(
      0.45
    ); // (0.5 + 0.4) / 2
  });

  it('handles edge case of empty practice scores object', async () => {
    const { result } = renderHook(() => useCurriculumProgress());

    await act(async () => {
      result.current.updateChapterProgress('chapter-01', {
        practiceScores: {}, // Explicitly empty
        completed: false,
      });
    });

    const masteryLevel = result.current.calculateMasteryLevel('chapter-01');
    expect(masteryLevel).toBe(0);
  });

  it('preserves mastery calculation across browser sessions', async () => {
    // First session
    const { result: result1 } = renderHook(() => useCurriculumProgress());

    await act(async () => {
      result1.current.recordPracticeAttempt('chapter-01', 'p1-1', 0.8, 1);
    });

    await act(async () => {
      result1.current.recordPracticeAttempt('chapter-01', 'p1-2', 0.9, 0);
    });

    const masteryLevel1 = result1.current.calculateMasteryLevel('chapter-01');
    expect(masteryLevel1).toBeCloseTo(0.85);

    // Simulate saving to localStorage
    const savedProgress = JSON.stringify(result1.current.progress);
    localStorageMock.getItem.mockReturnValue(savedProgress);

    // Second session (new hook instance)
    const { result: result2 } = renderHook(() => useCurriculumProgress());

    const masteryLevel2 = result2.current.calculateMasteryLevel('chapter-01');
    expect(masteryLevel2).toBeCloseTo(0.85); // Should be the same
  });
});
