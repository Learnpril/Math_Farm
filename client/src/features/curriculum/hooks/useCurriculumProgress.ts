import { useState, useEffect, useCallback } from 'react';
import { CurriculumProgress, ChapterProgress } from '../types';

const STORAGE_KEY = 'mathfarm_arithmetic_progress';

const defaultProgress: CurriculumProgress = {
  currentChapter: 999, // Allow access to all chapters - no locking
  completedChapters: [],
  chapterProgress: {},
  totalTimeSpent: 0,
  achievements: [],
  lastAccessed: new Date().toISOString(),
};

export function useCurriculumProgress() {
  const [progress, setProgress] = useState<CurriculumProgress>(defaultProgress);
  const [loading, setLoading] = useState(true);

  // Load progress from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure all chapters are always unlocked
        setProgress({
          ...defaultProgress,
          ...parsed,
          currentChapter: 999, // No chapter locking
        });
      }
    } catch (error) {
      console.warn('Failed to load curriculum progress:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      } catch (error) {
        console.warn('Failed to save curriculum progress:', error);
      }
    }
  }, [progress, loading]);

  const updateChapterProgress = useCallback(
    (chapterId: string, updates: Partial<ChapterProgress>) => {
      setProgress(prev => ({
        ...prev,
        chapterProgress: {
          ...prev.chapterProgress,
          [chapterId]: {
            completed: false,
            timeSpent: 0,
            practiceScores: {},
            masteryLevel: 0,
            attemptsCount: 0,
            hintsUsed: 0,
            ...prev.chapterProgress[chapterId],
            ...updates,
          },
        },
        lastAccessed: new Date().toISOString(),
      }));
    },
    []
  );

  const completeChapter = useCallback((chapterId: string) => {
    const chapterNum = parseInt(chapterId.split('-')[1]);

    setProgress(prev => ({
      ...prev,
      completedChapters: [...new Set([...prev.completedChapters, chapterNum])],
      currentChapter: Math.max(prev.currentChapter, chapterNum + 1),
      chapterProgress: {
        ...prev.chapterProgress,
        [chapterId]: {
          ...prev.chapterProgress[chapterId],
          completed: true,
          masteryLevel: 1,
        },
      },
      lastAccessed: new Date().toISOString(),
    }));
  }, []);

  const recordPracticeAttempt = useCallback(
    (
      chapterId: string,
      problemId: string,
      score: number,
      hintsUsed: number = 0
    ) => {
      const currentProgress = progress.chapterProgress[chapterId];
      updateChapterProgress(chapterId, {
        practiceScores: {
          ...currentProgress?.practiceScores,
          [problemId]: score,
        },
        attemptsCount: (currentProgress?.attemptsCount || 0) + 1,
        hintsUsed: (currentProgress?.hintsUsed || 0) + hintsUsed,
      });
    },
    [progress.chapterProgress, updateChapterProgress]
  );

  const addTimeSpent = useCallback(
    (chapterId: string, minutes: number) => {
      updateChapterProgress(chapterId, {
        timeSpent:
          (progress.chapterProgress[chapterId]?.timeSpent || 0) + minutes,
      });

      setProgress(prev => ({
        ...prev,
        totalTimeSpent: prev.totalTimeSpent + minutes,
      }));
    },
    [progress.chapterProgress, updateChapterProgress]
  );

  const calculateMasteryLevel = useCallback(
    (chapterId: string): number => {
      const chapterProgress = progress.chapterProgress[chapterId];
      if (!chapterProgress) return 0;

      const scores = Object.values(chapterProgress.practiceScores);
      if (scores.length === 0) return 0;

      const averageScore =
        scores.reduce((sum, score) => sum + score, 0) / scores.length;
      return Math.min(averageScore, 1);
    },
    [progress.chapterProgress]
  );

  const getOverallProgress = useCallback((): number => {
    const totalChapters = 8; // Arithmetic has 8 chapters
    return progress.completedChapters.length / totalChapters;
  }, [progress.completedChapters]);

  const resetProgress = useCallback(() => {
    setProgress(defaultProgress);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const clearProgressForTesting = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setProgress(defaultProgress);
  }, []);

  return {
    progress,
    loading,
    updateChapterProgress,
    completeChapter,
    recordPracticeAttempt,
    addTimeSpent,
    calculateMasteryLevel,
    getOverallProgress,
    resetProgress,
    clearProgressForTesting,
  };
}
