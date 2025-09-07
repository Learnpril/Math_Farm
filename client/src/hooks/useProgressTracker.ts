import { useState, useEffect, useCallback, useRef } from 'react';

export interface TopicProgress {
  startedAt: Date;
  completedAt?: Date;
  sectionsCompleted: string[];
  lessonSectionsCompleted: string[];
  practiceProblemsCompleted: string[];
  timeSpent: number; // in seconds
  lastVisited: Date;
}

export interface UserProgress {
  completedTopics: string[];
  topicProgress: Record<string, TopicProgress>;
  totalTimeSpent: number;
  streak: number;
  lastVisitDate: string;
  badges: string[];
}

export interface ProgressStats {
  totalTopicsStarted: number;
  totalTopicsCompleted: number;
  totalTimeSpent: number;
  averageTimePerTopic: number;
  completionRate: number;
  currentStreak: number;
}

const STORAGE_KEY = 'mathfarm-progress';

export function useProgressTracker() {
  const lastUpdateTime = useRef<number>(0);
  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert date strings back to Date objects
        Object.keys(parsed.topicProgress || {}).forEach(topicId => {
          const progress = parsed.topicProgress[topicId];
          if (progress.startedAt) progress.startedAt = new Date(progress.startedAt);
          if (progress.completedAt) progress.completedAt = new Date(progress.completedAt);
          if (progress.lastVisited) progress.lastVisited = new Date(progress.lastVisited);
        });
        return parsed;
      }
    } catch (error) {
      console.error('Failed to load progress from localStorage:', error);
    }
    
    return {
      completedTopics: [],
      topicProgress: {},
      totalTimeSpent: 0,
      streak: 0,
      lastVisitDate: new Date().toDateString(),
      badges: []
    };
  });

  // Save to localStorage whenever progress changes (with aggressive throttling)
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      try {
        // Use requestIdleCallback if available to avoid blocking the main thread
        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(userProgress));
          });
        } else {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(userProgress));
        }
      } catch (error) {
        console.error('Failed to save progress to localStorage:', error);
        // If localStorage is full, try to clear some space
        try {
          localStorage.removeItem('mathfarm-progress-backup');
        } catch (e) {
          console.error('Failed to clear localStorage space:', e);
        }
      }
    }, 500); // Increased throttle to 500ms to reduce frequency

    return () => clearTimeout(saveTimer);
  }, [userProgress]);

  // Track time spent on current session
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [currentTopicId, setCurrentTopicId] = useState<string | null>(null);

  // Start tracking time for a topic
  const startTopicSession = useCallback((topicId: string) => {
    setCurrentTopicId(topicId);
    setSessionStartTime(new Date());
    
    setUserProgress(prev => ({
      ...prev,
      topicProgress: {
        ...prev.topicProgress,
        [topicId]: {
          ...prev.topicProgress[topicId],
          startedAt: prev.topicProgress[topicId]?.startedAt || new Date(),
          sectionsCompleted: prev.topicProgress[topicId]?.sectionsCompleted || [],
          lessonSectionsCompleted: prev.topicProgress[topicId]?.lessonSectionsCompleted || [],
          practiceProblemsCompleted: prev.topicProgress[topicId]?.practiceProblemsCompleted || [],
          timeSpent: prev.topicProgress[topicId]?.timeSpent || 0,
          lastVisited: new Date(),
        },
      },
    }));
  }, []);

  // End tracking time for current topic
  const endTopicSession = useCallback(() => {
    if (sessionStartTime && currentTopicId) {
      const timeSpent = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000);
      
      setUserProgress(prev => ({
        ...prev,
        totalTimeSpent: prev.totalTimeSpent + timeSpent,
        topicProgress: {
          ...prev.topicProgress,
          [currentTopicId]: {
            ...prev.topicProgress[currentTopicId],
            timeSpent: (prev.topicProgress[currentTopicId]?.timeSpent || 0) + timeSpent,
          },
        },
      }));
    }
    
    setSessionStartTime(null);
    setCurrentTopicId(null);
  }, [sessionStartTime, currentTopicId]);

  // Mark a lesson section as completed
  const markLessonSectionCompleted = useCallback((topicId: string, sectionId: string) => {
    setUserProgress(prev => {
      const currentProgress = prev.topicProgress[topicId] || {
        startedAt: new Date(),
        sectionsCompleted: [],
        lessonSectionsCompleted: [],
        practiceProblemsCompleted: [],
        timeSpent: 0,
        lastVisited: new Date(),
      };

      // Check if already completed to prevent unnecessary updates
      if (currentProgress.lessonSectionsCompleted.includes(sectionId)) {
        return prev; // No change needed
      }

      const updatedSections = [...currentProgress.lessonSectionsCompleted, sectionId];

      return {
        ...prev,
        topicProgress: {
          ...prev.topicProgress,
          [topicId]: {
            ...currentProgress,
            lessonSectionsCompleted: updatedSections,
            lastVisited: new Date(),
          },
        },
      };
    });
  }, []);

  // Mark a practice problem as completed
  const markPracticeCompleted = useCallback((topicId: string, problemId: string) => {
    // Debounce to prevent excessive calls
    const now = Date.now();
    if (now - lastUpdateTime.current < 100) {
      return; // Skip if called too frequently
    }
    lastUpdateTime.current = now;

    setUserProgress(prev => {
      const currentProgress = prev.topicProgress[topicId] || {
        startedAt: new Date(),
        sectionsCompleted: [],
        lessonSectionsCompleted: [],
        practiceProblemsCompleted: [],
        timeSpent: 0,
        lastVisited: new Date(),
      };

      // Check if already completed to prevent unnecessary updates
      if (currentProgress.practiceProblemsCompleted.includes(problemId)) {
        return prev; // No change needed
      }

      const updatedProblems = [...currentProgress.practiceProblemsCompleted, problemId];

      return {
        ...prev,
        topicProgress: {
          ...prev.topicProgress,
          [topicId]: {
            ...currentProgress,
            practiceProblemsCompleted: updatedProblems,
            lastVisited: new Date(),
          },
        },
      };
    });
  }, []);

  // Mark entire topic as completed
  const markTopicCompleted = useCallback((topicId: string) => {
    setUserProgress(prev => {
      const completedTopics = [...prev.completedTopics];
      if (!completedTopics.includes(topicId)) {
        completedTopics.push(topicId);
      }

      return {
        ...prev,
        completedTopics,
        topicProgress: {
          ...prev.topicProgress,
          [topicId]: {
            ...prev.topicProgress[topicId],
            completedAt: new Date(),
            lastVisited: new Date(),
          },
        },
      };
    });
  }, []);

  // Calculate progress statistics
  const getProgressStats = useCallback((): ProgressStats => {
    const topicsStarted = Object.keys(userProgress.topicProgress).length;
    const topicsCompleted = userProgress.completedTopics.length;
    const totalTime = userProgress.totalTimeSpent;
    const averageTime = topicsStarted > 0 ? totalTime / topicsStarted : 0;
    const completionRate = topicsStarted > 0 ? (topicsCompleted / topicsStarted) * 100 : 0;

    return {
      totalTopicsStarted: topicsStarted,
      totalTopicsCompleted: topicsCompleted,
      totalTimeSpent: totalTime,
      averageTimePerTopic: averageTime,
      completionRate,
      currentStreak: userProgress.streak,
    };
  }, [userProgress]);

  // Get progress for a specific topic
  const getTopicProgress = useCallback((topicId: string) => {
    if (!topicId || !userProgress || !userProgress.topicProgress) {
      return null;
    }
    return userProgress.topicProgress[topicId] || null;
  }, [userProgress]);

  // Check if topic is completed
  const isTopicCompleted = useCallback((topicId: string) => {
    if (!topicId || !userProgress || !Array.isArray(userProgress.completedTopics)) {
      return false;
    }
    return userProgress.completedTopics.includes(topicId);
  }, [userProgress]);

  // Calculate completion percentage for a topic
  const getTopicCompletionPercentage = useCallback((
    topicId: string,
    totalLessonSections: number,
    totalPracticeProblems: number
  ) => {
    if (!topicId || !userProgress || !userProgress.topicProgress) {
      return 0;
    }
    
    const progress = userProgress.topicProgress[topicId];
    if (!progress) return 0;

    const lessonSectionsCompleted = Array.isArray(progress.lessonSectionsCompleted) 
      ? progress.lessonSectionsCompleted 
      : [];
    const practiceProblemsCompleted = Array.isArray(progress.practiceProblemsCompleted) 
      ? progress.practiceProblemsCompleted 
      : [];

    const lessonProgress = totalLessonSections > 0 
      ? (lessonSectionsCompleted.length / totalLessonSections) * 50 
      : 0;
    const practiceProgress = totalPracticeProblems > 0 
      ? (practiceProblemsCompleted.length / totalPracticeProblems) * 50 
      : 0;

    return Math.round(lessonProgress + practiceProgress);
  }, [userProgress]);

  // Update daily streak
  const updateStreak = useCallback(() => {
    const today = new Date().toDateString();
    const lastVisit = userProgress.lastVisitDate;
    
    if (lastVisit !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      setUserProgress(prev => ({
        ...prev,
        lastVisitDate: today,
        streak: lastVisit === yesterday.toDateString() ? prev.streak + 1 : 1,
      }));
    }
  }, [userProgress.lastVisitDate]);

  // Clean up session tracking on unmount
  useEffect(() => {
    return () => {
      endTopicSession();
    };
  }, [endTopicSession]);

  return {
    userProgress,
    startTopicSession,
    endTopicSession,
    markLessonSectionCompleted,
    markPracticeCompleted,
    markTopicCompleted,
    getProgressStats,
    getTopicProgress,
    isTopicCompleted,
    getTopicCompletionPercentage,
    updateStreak,
  };
}