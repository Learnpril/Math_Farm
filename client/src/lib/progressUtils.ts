import { ProgressData, Badge } from '../../../shared/types';

/**
 * Utility functions for progress tracking calculations and badge management
 */

// Badge categories for filtering
export const BADGE_CATEGORIES = {
  EXPLORATION: 'exploration',
  PRACTICE: 'practice',
  STREAK: 'streak',
  ACHIEVEMENT: 'achievement',
} as const;

/**
 * Calculate the number of days between two dates
 */
export function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  return Math.floor(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
}

/**
 * Calculate streak based on last visit date
 * Returns 0 if more than 1 day gap, otherwise maintains/increments streak
 */
export function calculateStreak(lastVisit: Date, currentStreak: number): number {
  const now = new Date();
  const daysSinceLastVisit = daysBetween(now, lastVisit);
  
  if (daysSinceLastVisit === 0) {
    // Same day visit, maintain current streak
    return currentStreak;
  } else if (daysSinceLastVisit === 1) {
    // Next day visit, increment streak
    return currentStreak + 1;
  } else {
    // Gap of more than 1 day, reset streak to 1 (current visit)
    return 1;
  }
}

/**
 * Check if a user qualifies for a specific badge based on their progress
 */
export function qualifiesForBadge(badgeId: string, progress: ProgressData): boolean {
  switch (badgeId) {
    case 'first-visit':
      return true; // Always qualifies on first visit
    
    case 'topic-explorer':
      return progress.topicsExplored.length >= 3;
    
    case 'tool-user':
      return progress.toolsUsed.length >= 2;
    
    case 'practice-starter':
      return progress.practiceCompleted >= 1;
    
    case 'streak-keeper':
      return progress.streak >= 3;
    
    case 'dedicated-learner':
      return progress.practiceCompleted >= 10;
    
    default:
      return false;
  }
}

/**
 * Get badges by category
 */
export function getBadgesByCategory(badges: Badge[], category: string): Badge[] {
  return badges.filter(badge => badge.category === category);
}

/**
 * Get the most recently earned badge
 */
export function getMostRecentBadge(badges: Badge[]): Badge | null {
  if (badges.length === 0) return null;
  
  return badges.reduce((latest, current) => {
    return current.earnedAt > latest.earnedAt ? current : latest;
  });
}

/**
 * Calculate completion percentage for different aspects of progress
 */
export function calculateCompletionStats(progress: ProgressData) {
  // Define maximum values for percentage calculations
  const MAX_SECTIONS = 5; // hero, topics, tools, practice, features
  const MAX_TOPICS = 9; // Based on topicsData.json
  const MAX_TOOLS = 3; // calculator, graphing, solver
  const MAX_BADGES = 6; // Total available badges
  
  return {
    sectionsVisited: Math.min((progress.sectionsVisited.length / MAX_SECTIONS) * 100, 100),
    topicsExplored: Math.min((progress.topicsExplored.length / MAX_TOPICS) * 100, 100),
    toolsUsed: Math.min((progress.toolsUsed.length / MAX_TOOLS) * 100, 100),
    badgesEarned: Math.min((progress.badges.length / MAX_BADGES) * 100, 100),
    overall: Math.min(
      ((progress.sectionsVisited.length + progress.topicsExplored.length + progress.toolsUsed.length + progress.badges.length) / 
       (MAX_SECTIONS + MAX_TOPICS + MAX_TOOLS + MAX_BADGES)) * 100, 
      100
    ),
  };
}

/**
 * Generate a progress summary for display
 */
export function generateProgressSummary(progress: ProgressData): string {
  const stats = calculateCompletionStats(progress);
  const recentBadge = getMostRecentBadge(progress.badges);
  
  let summary = `Explored ${progress.topicsExplored.length} topics, used ${progress.toolsUsed.length} tools, `;
  summary += `completed ${progress.practiceCompleted} practice problems. `;
  
  if (progress.streak > 0) {
    summary += `Current streak: ${progress.streak} day${progress.streak > 1 ? 's' : ''}. `;
  }
  
  if (recentBadge) {
    summary += `Latest achievement: ${recentBadge.name}.`;
  }
  
  return summary;
}

/**
 * Check if progress data is valid and complete
 */
export function validateProgressData(data: any): data is ProgressData {
  if (!data || typeof data !== 'object') return false;
  
  const required = [
    'sectionsVisited',
    'topicsExplored', 
    'toolsUsed',
    'practiceCompleted',
    'streak',
    'badges',
    'lastVisit'
  ];
  
  for (const field of required) {
    if (!(field in data)) return false;
  }
  
  // Type checks
  if (!Array.isArray(data.sectionsVisited)) return false;
  if (!Array.isArray(data.topicsExplored)) return false;
  if (!Array.isArray(data.toolsUsed)) return false;
  if (!Array.isArray(data.badges)) return false;
  if (typeof data.practiceCompleted !== 'number') return false;
  if (typeof data.streak !== 'number') return false;
  
  // Validate badges structure
  for (const badge of data.badges) {
    if (!badge.id || !badge.name || !badge.category || !badge.earnedAt) {
      return false;
    }
  }
  
  return true;
}

/**
 * Sanitize progress data to ensure it meets privacy requirements
 * Removes any potentially identifying information
 */
export function sanitizeProgressData(data: ProgressData): ProgressData {
  return {
    sectionsVisited: data.sectionsVisited.filter(section => 
      typeof section === 'string' && section.length < 50
    ),
    topicsExplored: data.topicsExplored.filter(topic => 
      typeof topic === 'string' && topic.length < 50
    ),
    toolsUsed: data.toolsUsed.filter(tool => 
      typeof tool === 'string' && tool.length < 50
    ),
    practiceCompleted: Math.max(0, Math.min(data.practiceCompleted, 10000)),
    streak: Math.max(0, Math.min(data.streak, 365)),
    badges: data.badges.filter(badge => 
      badge.id && badge.name && badge.category && badge.earnedAt
    ),
    lastVisit: data.lastVisit,
  };
}

/**
 * Export progress data for backup (privacy-compliant)
 */
export function exportProgressData(progress: ProgressData): string {
  const sanitized = sanitizeProgressData(progress);
  return JSON.stringify({
    version: '1.0',
    exportedAt: new Date().toISOString(),
    data: sanitized,
  }, null, 2);
}

/**
 * Import progress data from backup
 */
export function importProgressData(jsonString: string): ProgressData | null {
  try {
    const parsed = JSON.parse(jsonString);
    
    if (parsed.version !== '1.0' || !parsed.data) {
      throw new Error('Invalid backup format');
    }
    
    if (!validateProgressData(parsed.data)) {
      throw new Error('Invalid progress data structure');
    }
    
    return sanitizeProgressData({
      ...parsed.data,
      lastVisit: new Date(parsed.data.lastVisit),
      badges: parsed.data.badges.map((badge: any) => ({
        ...badge,
        earnedAt: new Date(badge.earnedAt),
      })),
    });
  } catch (error) {
    console.error('Failed to import progress data:', error);
    return null;
  }
}