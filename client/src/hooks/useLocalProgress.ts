import { useState, useEffect, useCallback } from 'react';
import { ProgressData, Badge } from '../../../shared/types';

const STORAGE_KEY = 'mathfarm_progress';
const STORAGE_VERSION = '1.0';

// Default progress data
const defaultProgressData: ProgressData = {
  sectionsVisited: [],
  topicsExplored: [],
  toolsUsed: [],
  practiceCompleted: 0,
  streak: 0,
  badges: [],
  lastVisit: new Date(),
};

// Badge definitions for earning logic
const AVAILABLE_BADGES = {
  FIRST_VISIT: {
    id: 'first-visit',
    name: 'Welcome Explorer',
    description: 'Visited Math Farm for the first time',
    icon: 'star',
    category: 'exploration' as const,
  },
  TOPIC_EXPLORER: {
    id: 'topic-explorer',
    name: 'Topic Explorer',
    description: 'Explored 3 different topics',
    icon: 'compass',
    category: 'exploration' as const,
  },
  TOOL_USER: {
    id: 'tool-user',
    name: 'Tool Master',
    description: 'Used 2 different tools',
    icon: 'wrench',
    category: 'exploration' as const,
  },
  PRACTICE_STARTER: {
    id: 'practice-starter',
    name: 'Practice Starter',
    description: 'Completed first practice problem',
    icon: 'target',
    category: 'practice' as const,
  },
  STREAK_KEEPER: {
    id: 'streak-keeper',
    name: 'Streak Keeper',
    description: 'Maintained a 3-day learning streak',
    icon: 'flame',
    category: 'streak' as const,
  },
  DEDICATED_LEARNER: {
    id: 'dedicated-learner',
    name: 'Dedicated Learner',
    description: 'Completed 10 practice problems',
    icon: 'trophy',
    category: 'achievement' as const,
  },
};

interface UseLocalProgressReturn {
  progress: ProgressData;
  updateProgress: (section: string, completed: boolean) => void;
  visitSection: (section: string) => void;
  exploreTopic: (topicId: string) => void;
  useTool: (toolId: string) => void;
  completePractice: () => void;
  getStreak: () => number;
  getBadges: () => Badge[];
  clearProgress: () => void;
  isLoading: boolean;
  error: string | null;
}

export function useLocalProgress(): UseLocalProgressReturn {
  const [progress, setProgress] = useState<ProgressData>(defaultProgressData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load progress from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Check version compatibility
        if (parsed.version === STORAGE_VERSION) {
          const progressData: ProgressData = {
            ...parsed.data,
            lastVisit: new Date(parsed.data.lastVisit),
            badges: parsed.data.badges.map((badge: any) => ({
              ...badge,
              earnedAt: new Date(badge.earnedAt),
            })),
          };
          setProgress(progressData);
        } else {
          // Version mismatch, start fresh but preserve some data
          console.warn('Progress data version mismatch, starting fresh');
          setProgress(defaultProgressData);
        }
      } else {
        // First visit - award welcome badge
        const welcomeBadge: Badge = {
          ...AVAILABLE_BADGES.FIRST_VISIT,
          earnedAt: new Date(),
        };
        const initialProgress = {
          ...defaultProgressData,
          badges: [welcomeBadge],
        };
        setProgress(initialProgress);
        saveToStorage(initialProgress);
      }
    } catch (err) {
      console.error('Failed to load progress from localStorage:', err);
      setError('Failed to load progress data');
      setProgress(defaultProgressData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save progress to localStorage
  const saveToStorage = useCallback((progressData: ProgressData) => {
    try {
      const toStore = {
        version: STORAGE_VERSION,
        data: progressData,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
      setError(null);
    } catch (err) {
      console.error('Failed to save progress to localStorage:', err);
      setError('Failed to save progress data');
    }
  }, []);

  // Calculate current streak
  const calculateStreak = useCallback((progressData: ProgressData): number => {
    const lastVisit = new Date(progressData.lastVisit);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
    
    // If last visit was today or yesterday, maintain streak
    if (daysDiff <= 1) {
      return progressData.streak + (daysDiff === 1 ? 1 : 0);
    } else {
      // Reset streak if more than 1 day gap
      return 1;
    }
  }, []);

  // Check and award new badges
  const checkForNewBadges = useCallback((progressData: ProgressData): Badge[] => {
    const currentBadgeIds = progressData.badges.map(b => b.id);
    const newBadges: Badge[] = [];

    // Topic Explorer badge
    if (progressData.topicsExplored.length >= 3 && !currentBadgeIds.includes('topic-explorer')) {
      newBadges.push({
        ...AVAILABLE_BADGES.TOPIC_EXPLORER,
        earnedAt: new Date(),
      });
    }

    // Tool User badge
    if (progressData.toolsUsed.length >= 2 && !currentBadgeIds.includes('tool-user')) {
      newBadges.push({
        ...AVAILABLE_BADGES.TOOL_USER,
        earnedAt: new Date(),
      });
    }

    // Practice Starter badge
    if (progressData.practiceCompleted >= 1 && !currentBadgeIds.includes('practice-starter')) {
      newBadges.push({
        ...AVAILABLE_BADGES.PRACTICE_STARTER,
        earnedAt: new Date(),
      });
    }

    // Streak Keeper badge
    if (progressData.streak >= 3 && !currentBadgeIds.includes('streak-keeper')) {
      newBadges.push({
        ...AVAILABLE_BADGES.STREAK_KEEPER,
        earnedAt: new Date(),
      });
    }

    // Dedicated Learner badge
    if (progressData.practiceCompleted >= 10 && !currentBadgeIds.includes('dedicated-learner')) {
      newBadges.push({
        ...AVAILABLE_BADGES.DEDICATED_LEARNER,
        earnedAt: new Date(),
      });
    }

    return newBadges;
  }, []);

  // Update progress with new data
  const updateProgressData = useCallback((updater: (prev: ProgressData) => ProgressData) => {
    setProgress(prev => {
      const updated = updater(prev);
      const newStreak = calculateStreak(updated);
      const updatedWithStreak = { ...updated, streak: newStreak, lastVisit: new Date() };
      const newBadges = checkForNewBadges(updatedWithStreak);
      const final = {
        ...updatedWithStreak,
        badges: [...updatedWithStreak.badges, ...newBadges],
      };
      
      saveToStorage(final);
      return final;
    });
  }, [calculateStreak, checkForNewBadges, saveToStorage]);

  // Generic update function (legacy support)
  const updateProgress = useCallback((section: string, completed: boolean) => {
    if (completed) {
      visitSection(section);
    }
  }, []);

  // Visit a section
  const visitSection = useCallback((section: string) => {
    updateProgressData(prev => ({
      ...prev,
      sectionsVisited: prev.sectionsVisited.includes(section) 
        ? prev.sectionsVisited 
        : [...prev.sectionsVisited, section],
    }));
  }, [updateProgressData]);

  // Explore a topic
  const exploreTopic = useCallback((topicId: string) => {
    updateProgressData(prev => ({
      ...prev,
      topicsExplored: prev.topicsExplored.includes(topicId)
        ? prev.topicsExplored
        : [...prev.topicsExplored, topicId],
    }));
  }, [updateProgressData]);

  // Use a tool
  const useTool = useCallback((toolId: string) => {
    updateProgressData(prev => ({
      ...prev,
      toolsUsed: prev.toolsUsed.includes(toolId)
        ? prev.toolsUsed
        : [...prev.toolsUsed, toolId],
    }));
  }, [updateProgressData]);

  // Complete practice
  const completePractice = useCallback(() => {
    updateProgressData(prev => ({
      ...prev,
      practiceCompleted: prev.practiceCompleted + 1,
    }));
  }, [updateProgressData]);

  // Get current streak
  const getStreak = useCallback(() => {
    return progress.streak;
  }, [progress.streak]);

  // Get badges
  const getBadges = useCallback(() => {
    return progress.badges;
  }, [progress.badges]);

  // Clear all progress (for testing/reset)
  const clearProgress = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setProgress(defaultProgressData);
      setError(null);
    } catch (err) {
      console.error('Failed to clear progress:', err);
      setError('Failed to clear progress data');
    }
  }, []);

  return {
    progress,
    updateProgress,
    visitSection,
    exploreTopic,
    useTool,
    completePractice,
    getStreak,
    getBadges,
    clearProgress,
    isLoading,
    error,
  };
}