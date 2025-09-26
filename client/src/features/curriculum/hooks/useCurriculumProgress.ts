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
      hintsUsed: number = 0,
      totalProblems?: number
    ) => {
      const currentProgress = progress.chapterProgress[chapterId];
      const newPracticeScores = {
        ...currentProgress?.practiceScores,
        [problemId]: score,
      };

      // Calculate mastery level based on unique problems solved correctly
      const correctProblems = Object.entries(newPracticeScores).filter(
        ([_, score]) => score === 1
      ).length;

      // Use provided totalProblems or default to 8 (most chapters have 8 problems)
      const totalChapterProblems = totalProblems || 8;
      let newMasteryLevel = correctProblems / totalChapterProblems;

      // Ensure 100% mastery when all problems are solved correctly
      const isFullyMastered = correctProblems === totalChapterProblems;
      if (isFullyMastered) {
        newMasteryLevel = 1.0; // Guarantee exactly 100%
      }

      console.log('Mastery Update:', {
        chapterId,
        problemId,
        score,
        correctProblems,
        totalChapterProblems,
        newMasteryLevel: Math.round(newMasteryLevel * 100) + '%',
        isFullyMastered,
        practiceScores: newPracticeScores,
      });

      updateChapterProgress(chapterId, {
        practiceScores: newPracticeScores,
        attemptsCount: (currentProgress?.attemptsCount || 0) + 1,
        hintsUsed: (currentProgress?.hintsUsed || 0) + hintsUsed,
        masteryLevel: newMasteryLevel,
        completed: isFullyMastered, // Mark chapter as completed when 100% mastery is achieved
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
    (chapterId: string, totalProblems: number = 8): number => {
      const chapterProgress = progress.chapterProgress[chapterId];
      if (!chapterProgress) return 0;

      const practiceScores = chapterProgress.practiceScores || {};
      const correctProblems = Object.entries(practiceScores).filter(
        ([_, score]) => score === 1
      ).length;

      return correctProblems / totalProblems;
    },
    [progress.chapterProgress]
  );

  // Get current mastery level for a chapter (returns the stored value or calculates it)
  const getCurrentMasteryLevel = useCallback(
    (chapterId: string, totalProblems: number = 8): number => {
      const chapterProgress = progress.chapterProgress[chapterId];
      if (!chapterProgress) {
        console.log('No chapter progress found for:', chapterId);
        return 0;
      }

      const storedMastery = chapterProgress.masteryLevel;
      const calculatedMastery = calculateMasteryLevel(chapterId, totalProblems);
      const finalMastery = storedMastery ?? calculatedMastery;

      console.log('getCurrentMasteryLevel Debug:', {
        chapterId,
        totalProblems,
        storedMastery,
        calculatedMastery,
        finalMastery,
        practiceScores: chapterProgress.practiceScores,
      });

      // Always calculate from current state to ensure real-time updates
      return calculatedMastery;
    },
    [progress.chapterProgress, calculateMasteryLevel]
  );

  const getOverallProgress = useCallback((): number => {
    const totalChapters = 7; // Arithmetic has 7 chapters
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
    getCurrentMasteryLevel,
    getOverallProgress,
    resetProgress,
    clearProgressForTesting,
  };
}
