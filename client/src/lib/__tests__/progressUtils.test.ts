import { describe, it, expect } from 'vitest';
import {
  daysBetween,
  calculateStreak,
  qualifiesForBadge,
  getBadgesByCategory,
  getMostRecentBadge,
  calculateCompletionStats,
  generateProgressSummary,
  validateProgressData,
  sanitizeProgressData,
  exportProgressData,
  importProgressData,
  BADGE_CATEGORIES,
} from '../progressUtils';
import { ProgressData, Badge } from '../../../../shared/types';

describe('progressUtils', () => {
  const mockBadge: Badge = {
    id: 'test-badge',
    name: 'Test Badge',
    description: 'A test badge',
    icon: 'star',
    category: 'exploration',
    earnedAt: new Date('2024-01-01'),
  };

  const mockProgressData: ProgressData = {
    sectionsVisited: ['hero', 'topics'],
    topicsExplored: ['algebra', 'geometry', 'calculus'],
    toolsUsed: ['calculator', 'graphing'],
    practiceCompleted: 5,
    streak: 3,
    badges: [mockBadge],
    lastVisit: new Date('2024-01-01'),
  };

  describe('daysBetween', () => {
    it('should calculate days between two dates correctly', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-03');
      
      expect(daysBetween(date1, date2)).toBe(2);
      expect(daysBetween(date2, date1)).toBe(2); // Should be absolute
    });

    it('should return 0 for same date', () => {
      const date = new Date('2024-01-01');
      expect(daysBetween(date, date)).toBe(0);
    });
  });

  describe('calculateStreak', () => {
    it('should maintain streak for same day visit', () => {
      const today = new Date();
      expect(calculateStreak(today, 5)).toBe(5);
    });

    it('should increment streak for next day visit', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(calculateStreak(yesterday, 5)).toBe(6);
    });

    it('should reset streak for gap of more than 1 day', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      expect(calculateStreak(threeDaysAgo, 5)).toBe(1);
    });
  });

  describe('qualifiesForBadge', () => {
    it('should return true for first-visit badge', () => {
      expect(qualifiesForBadge('first-visit', mockProgressData)).toBe(true);
    });

    it('should check topic-explorer qualification correctly', () => {
      expect(qualifiesForBadge('topic-explorer', mockProgressData)).toBe(true);
      
      const insufficientProgress = { ...mockProgressData, topicsExplored: ['algebra'] };
      expect(qualifiesForBadge('topic-explorer', insufficientProgress)).toBe(false);
    });

    it('should check tool-user qualification correctly', () => {
      expect(qualifiesForBadge('tool-user', mockProgressData)).toBe(true);
      
      const insufficientProgress = { ...mockProgressData, toolsUsed: ['calculator'] };
      expect(qualifiesForBadge('tool-user', insufficientProgress)).toBe(false);
    });

    it('should check practice-starter qualification correctly', () => {
      expect(qualifiesForBadge('practice-starter', mockProgressData)).toBe(true);
      
      const insufficientProgress = { ...mockProgressData, practiceCompleted: 0 };
      expect(qualifiesForBadge('practice-starter', insufficientProgress)).toBe(false);
    });

    it('should check streak-keeper qualification correctly', () => {
      expect(qualifiesForBadge('streak-keeper', mockProgressData)).toBe(true);
      
      const insufficientProgress = { ...mockProgressData, streak: 2 };
      expect(qualifiesForBadge('streak-keeper', insufficientProgress)).toBe(false);
    });

    it('should check dedicated-learner qualification correctly', () => {
      const qualifiedProgress = { ...mockProgressData, practiceCompleted: 10 };
      expect(qualifiesForBadge('dedicated-learner', qualifiedProgress)).toBe(true);
      
      expect(qualifiesForBadge('dedicated-learner', mockProgressData)).toBe(false);
    });

    it('should return false for unknown badge', () => {
      expect(qualifiesForBadge('unknown-badge', mockProgressData)).toBe(false);
    });
  });

  describe('getBadgesByCategory', () => {
    it('should filter badges by category', () => {
      const badges: Badge[] = [
        { ...mockBadge, category: 'exploration' },
        { ...mockBadge, id: 'practice-badge', category: 'practice' },
        { ...mockBadge, id: 'streak-badge', category: 'streak' },
      ];

      const explorationBadges = getBadgesByCategory(badges, 'exploration');
      expect(explorationBadges).toHaveLength(1);
      expect(explorationBadges[0].category).toBe('exploration');
    });

    it('should return empty array for non-existent category', () => {
      const badges = [mockBadge];
      expect(getBadgesByCategory(badges, 'nonexistent')).toEqual([]);
    });
  });

  describe('getMostRecentBadge', () => {
    it('should return the most recently earned badge', () => {
      const badges: Badge[] = [
        { ...mockBadge, earnedAt: new Date('2024-01-01') },
        { ...mockBadge, id: 'recent-badge', earnedAt: new Date('2024-01-03') },
        { ...mockBadge, id: 'old-badge', earnedAt: new Date('2023-12-01') },
      ];

      const recent = getMostRecentBadge(badges);
      expect(recent?.id).toBe('recent-badge');
    });

    it('should return null for empty badge array', () => {
      expect(getMostRecentBadge([])).toBe(null);
    });
  });

  describe('calculateCompletionStats', () => {
    it('should calculate completion percentages correctly', () => {
      const stats = calculateCompletionStats(mockProgressData);
      
      expect(stats.sectionsVisited).toBe(40); // 2/5 * 100
      expect(stats.topicsExplored).toBeCloseTo(33.33); // 3/9 * 100
      expect(stats.toolsUsed).toBeCloseTo(66.67); // 2/3 * 100
      expect(stats.badgesEarned).toBeCloseTo(16.67); // 1/6 * 100
      expect(stats.overall).toBeGreaterThan(0);
    });

    it('should cap percentages at 100%', () => {
      const maxProgress: ProgressData = {
        sectionsVisited: ['a', 'b', 'c', 'd', 'e', 'f'], // More than max
        topicsExplored: Array(15).fill('topic'), // More than max
        toolsUsed: Array(5).fill('tool'), // More than max
        practiceCompleted: 100,
        streak: 10,
        badges: Array(10).fill(mockBadge), // More than max
        lastVisit: new Date(),
      };

      const stats = calculateCompletionStats(maxProgress);
      expect(stats.sectionsVisited).toBe(100);
      expect(stats.topicsExplored).toBe(100);
      expect(stats.toolsUsed).toBe(100);
      expect(stats.badgesEarned).toBe(100);
      expect(stats.overall).toBe(100);
    });
  });

  describe('generateProgressSummary', () => {
    it('should generate a readable progress summary', () => {
      const summary = generateProgressSummary(mockProgressData);
      
      expect(summary).toContain('Explored 3 topics');
      expect(summary).toContain('used 2 tools');
      expect(summary).toContain('completed 5 practice problems');
      expect(summary).toContain('Current streak: 3 days');
      expect(summary).toContain('Latest achievement: Test Badge');
    });

    it('should handle singular streak correctly', () => {
      const singleDayStreak = { ...mockProgressData, streak: 1 };
      const summary = generateProgressSummary(singleDayStreak);
      
      expect(summary).toContain('Current streak: 1 day');
      expect(summary).not.toContain('1 days');
    });

    it('should handle zero streak', () => {
      const noStreak = { ...mockProgressData, streak: 0 };
      const summary = generateProgressSummary(noStreak);
      
      expect(summary).not.toContain('Current streak');
    });

    it('should handle no badges', () => {
      const noBadges = { ...mockProgressData, badges: [] };
      const summary = generateProgressSummary(noBadges);
      
      expect(summary).not.toContain('Latest achievement');
    });
  });

  describe('validateProgressData', () => {
    it('should validate correct progress data', () => {
      expect(validateProgressData(mockProgressData)).toBe(true);
    });

    it('should reject null or undefined data', () => {
      expect(validateProgressData(null)).toBe(false);
      expect(validateProgressData(undefined)).toBe(false);
    });

    it('should reject data missing required fields', () => {
      const incomplete = { sectionsVisited: [] };
      expect(validateProgressData(incomplete)).toBe(false);
    });

    it('should reject data with wrong types', () => {
      const wrongTypes = {
        ...mockProgressData,
        sectionsVisited: 'not an array',
      };
      expect(validateProgressData(wrongTypes)).toBe(false);
    });

    it('should reject data with invalid badges', () => {
      const invalidBadges = {
        ...mockProgressData,
        badges: [{ id: 'test' }], // Missing required fields
      };
      expect(validateProgressData(invalidBadges)).toBe(false);
    });
  });

  describe('sanitizeProgressData', () => {
    it('should sanitize progress data correctly', () => {
      const unsafeData: ProgressData = {
        sectionsVisited: ['valid', 'x'.repeat(100), 'also-valid'], // One too long
        topicsExplored: ['algebra', 'geometry'],
        toolsUsed: ['calculator'],
        practiceCompleted: 50000, // Too high
        streak: 500, // Too high
        badges: [mockBadge],
        lastVisit: new Date(),
      };

      const sanitized = sanitizeProgressData(unsafeData);
      
      expect(sanitized.sectionsVisited).toEqual(['valid', 'also-valid']);
      expect(sanitized.practiceCompleted).toBe(10000);
      expect(sanitized.streak).toBe(365);
    });
  });

  describe('exportProgressData', () => {
    it('should export progress data as JSON string', () => {
      const exported = exportProgressData(mockProgressData);
      const parsed = JSON.parse(exported);
      
      expect(parsed.version).toBe('1.0');
      expect(parsed.data).toBeDefined();
      expect(parsed.exportedAt).toBeDefined();
    });
  });

  describe('importProgressData', () => {
    it('should import valid progress data', () => {
      const exported = exportProgressData(mockProgressData);
      const imported = importProgressData(exported);
      
      expect(imported).not.toBe(null);
      expect(imported?.sectionsVisited).toEqual(mockProgressData.sectionsVisited);
    });

    it('should return null for invalid JSON', () => {
      expect(importProgressData('invalid json')).toBe(null);
    });

    it('should return null for wrong version', () => {
      const wrongVersion = JSON.stringify({
        version: '2.0',
        data: mockProgressData,
      });
      
      expect(importProgressData(wrongVersion)).toBe(null);
    });
  });

  describe('BADGE_CATEGORIES', () => {
    it('should export badge categories constants', () => {
      expect(BADGE_CATEGORIES.EXPLORATION).toBe('exploration');
      expect(BADGE_CATEGORIES.PRACTICE).toBe('practice');
      expect(BADGE_CATEGORIES.STREAK).toBe('streak');
      expect(BADGE_CATEGORIES.ACHIEVEMENT).toBe('achievement');
    });
  });
});