/**
 * Avatar Achievement System
 * Math Farm Community Forum - Achievement Definitions and Rewards
 */

import type { AvatarAchievement } from '../types/avatar';

// Forum activity achievements
export const FORUM_ACHIEVEMENTS: AvatarAchievement[] = [
  {
    id: 'first-post',
    name: 'First Steps',
    description: 'Made your first forum post',
    icon: '👋',
    unlockedAt: new Date(), // Will be set when unlocked
    rewardItems: ['glasses-round'],
  },
  {
    id: 'helpful-member',
    name: 'Helpful Member',
    description: 'Helped 10 other users with their math questions',
    icon: '🤝',
    unlockedAt: new Date(),
    rewardItems: ['pose-teaching', 'hat-thinking-cap'],
  },
  {
    id: 'math-mentor',
    name: 'Math Mentor',
    description: 'Helped 50 users and received 25 "Best Answer" marks',
    icon: '🎓',
    unlockedAt: new Date(),
    rewardItems: ['lab-coat-professor', 'badge-pi-day'],
  },
  {
    id: 'community-champion',
    name: 'Community Champion',
    description:
      'Helped 100 users and maintained positive community engagement',
    icon: '🏆',
    unlockedAt: new Date(),
    rewardItems: ['crown-math-master'],
  },
];

// Mathematical achievements
export const MATH_ACHIEVEMENTS: AvatarAchievement[] = [
  {
    id: 'calculation-novice',
    name: 'Calculation Novice',
    description: 'Shared 10 mathematical calculations in posts',
    icon: '🧮',
    unlockedAt: new Date(),
    rewardItems: ['calculator-handheld', 'eyes-calculator'],
  },
  {
    id: 'geometry-explorer',
    name: 'Geometry Explorer',
    description: 'Completed geometry fundamentals and shared geometric proofs',
    icon: '📐',
    unlockedAt: new Date(),
    rewardItems: ['protractor-compass', 'hair-pi-buns'],
  },
  {
    id: 'calculus-master',
    name: 'Calculus Master',
    description:
      'Mastered derivatives, integrals, and advanced calculus concepts',
    icon: '∫',
    unlockedAt: new Date(),
    rewardItems: ['hoodie-calculus', 'expression-eureka'],
  },
  {
    id: 'equation-artist',
    name: 'Equation Artist',
    description:
      'Created beautiful mathematical expressions and shared complex equations',
    icon: '🎨',
    unlockedAt: new Date(),
    rewardItems: ['hair-equation-streaks', 'shirt-equation-print'],
  },
  {
    id: 'infinity-seeker',
    name: 'Infinity Seeker',
    description: 'Explored advanced mathematical concepts and infinite series',
    icon: '∞',
    unlockedAt: new Date(),
    rewardItems: ['eyes-infinity', 'holographic-equations'],
  },
];

// Streak and consistency achievements
export const STREAK_ACHIEVEMENTS: AvatarAchievement[] = [
  {
    id: 'daily-learner',
    name: 'Daily Learner',
    description: 'Maintained a 7-day learning streak',
    icon: '📅',
    unlockedAt: new Date(),
    rewardItems: ['expression-thinking'],
  },
  {
    id: 'dedicated-student',
    name: 'Dedicated Student',
    description: 'Maintained a 30-day problem-solving streak',
    icon: '📚',
    unlockedAt: new Date(),
    rewardItems: ['body-mathematician', 'bg-graph-paper'],
  },
  {
    id: 'math-marathon',
    name: 'Math Marathon',
    description: 'Maintained a 100-day continuous learning streak',
    icon: '🏃‍♂️',
    unlockedAt: new Date(),
    rewardItems: ['graphing-tablet', 'pose-celebrating'],
  },
];

// Special event achievements
export const EVENT_ACHIEVEMENTS: AvatarAchievement[] = [
  {
    id: 'pi-day-participant',
    name: 'Pi Day Participant',
    description: 'Participated in Pi Day forum celebrations',
    icon: 'π',
    unlockedAt: new Date(),
    rewardItems: ['badge-pi-day'],
  },
  {
    id: 'math-week-champion',
    name: 'Math Week Champion',
    description: 'Excelled during National Mathematics Week events',
    icon: '🎉',
    unlockedAt: new Date(),
    rewardItems: ['bg-starfield', 'crown-math-master'],
  },
  {
    id: 'problem-solver-extraordinaire',
    name: 'Problem Solver Extraordinaire',
    description: 'Solved the monthly challenge problem',
    icon: '🧩',
    unlockedAt: new Date(),
    rewardItems: ['holographic-equations'],
  },
];

// Combine all achievements
export const ALL_ACHIEVEMENTS: AvatarAchievement[] = [
  ...FORUM_ACHIEVEMENTS,
  ...MATH_ACHIEVEMENTS,
  ...STREAK_ACHIEVEMENTS,
  ...EVENT_ACHIEVEMENTS,
];

// Achievement categories for organization
export const ACHIEVEMENT_CATEGORIES = {
  forum: FORUM_ACHIEVEMENTS,
  math: MATH_ACHIEVEMENTS,
  streak: STREAK_ACHIEVEMENTS,
  event: EVENT_ACHIEVEMENTS,
} as const;

// Helper functions for achievement management
export const getAchievementById = (
  id: string
): AvatarAchievement | undefined => {
  return ALL_ACHIEVEMENTS.find(achievement => achievement.id === id);
};

export const getAchievementsByCategory = (
  category: keyof typeof ACHIEVEMENT_CATEGORIES
): AvatarAchievement[] => {
  return ACHIEVEMENT_CATEGORIES[category];
};

export const getRewardItemsForAchievement = (
  achievementId: string
): string[] => {
  const achievement = getAchievementById(achievementId);
  return achievement?.rewardItems || [];
};

export const getAllRewardItems = (): string[] => {
  const allRewards: string[] = [];
  ALL_ACHIEVEMENTS.forEach(achievement => {
    if (achievement.rewardItems) {
      allRewards.push(...achievement.rewardItems);
    }
  });
  return [...new Set(allRewards)]; // Remove duplicates
};

// Achievement progress tracking
export interface AchievementProgress {
  achievementId: string;
  currentValue: number;
  targetValue: number;
  isCompleted: boolean;
  completedAt?: Date;
}

// Achievement unlock conditions
export interface AchievementUnlockCondition {
  type:
    | 'posts'
    | 'best-answers'
    | 'help-count'
    | 'streak'
    | 'calculations'
    | 'event-participation';
  threshold: number;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all-time';
}

// Extended achievement definition with unlock conditions
export interface ExtendedAvatarAchievement extends AvatarAchievement {
  unlockCondition: AchievementUnlockCondition;
  category: 'forum' | 'math' | 'streak' | 'event';
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  points: number;
}

// Achievement unlock conditions mapping
export const ACHIEVEMENT_UNLOCK_CONDITIONS: Record<
  string,
  AchievementUnlockCondition
> = {
  'first-post': {
    type: 'posts',
    threshold: 1,
    timeframe: 'all-time',
  },
  'helpful-member': {
    type: 'help-count',
    threshold: 10,
    timeframe: 'all-time',
  },
  'math-mentor': {
    type: 'best-answers',
    threshold: 25,
    timeframe: 'all-time',
  },
  'community-champion': {
    type: 'help-count',
    threshold: 100,
    timeframe: 'all-time',
  },
  'calculation-novice': {
    type: 'calculations',
    threshold: 10,
    timeframe: 'all-time',
  },
  'geometry-explorer': {
    type: 'posts',
    threshold: 20,
    timeframe: 'all-time',
  },
  'calculus-master': {
    type: 'posts',
    threshold: 50,
    timeframe: 'all-time',
  },
  'equation-artist': {
    type: 'calculations',
    threshold: 50,
    timeframe: 'all-time',
  },
  'infinity-seeker': {
    type: 'posts',
    threshold: 100,
    timeframe: 'all-time',
  },
  'daily-learner': {
    type: 'streak',
    threshold: 7,
    timeframe: 'daily',
  },
  'dedicated-student': {
    type: 'streak',
    threshold: 30,
    timeframe: 'daily',
  },
  'math-marathon': {
    type: 'streak',
    threshold: 100,
    timeframe: 'daily',
  },
  'pi-day-participant': {
    type: 'event-participation',
    threshold: 1,
    timeframe: 'all-time',
  },
  'math-week-champion': {
    type: 'event-participation',
    threshold: 1,
    timeframe: 'all-time',
  },
  'problem-solver-extraordinaire': {
    type: 'event-participation',
    threshold: 1,
    timeframe: 'monthly',
  },
};

// Function to check if user qualifies for achievement
export const checkAchievementUnlock = (
  achievementId: string,
  userStats: {
    posts: number;
    bestAnswers: number;
    helpCount: number;
    streak: number;
    calculations: number;
    eventParticipation: number;
  }
): boolean => {
  const condition = ACHIEVEMENT_UNLOCK_CONDITIONS[achievementId];
  if (!condition) return false;

  switch (condition.type) {
    case 'posts':
      return userStats.posts >= condition.threshold;
    case 'best-answers':
      return userStats.bestAnswers >= condition.threshold;
    case 'help-count':
      return userStats.helpCount >= condition.threshold;
    case 'streak':
      return userStats.streak >= condition.threshold;
    case 'calculations':
      return userStats.calculations >= condition.threshold;
    case 'event-participation':
      return userStats.eventParticipation >= condition.threshold;
    default:
      return false;
  }
};
