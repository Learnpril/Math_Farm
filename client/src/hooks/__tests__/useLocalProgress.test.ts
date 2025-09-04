import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useLocalProgress } from '../useLocalProgress';

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

describe('useLocalProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset localStorage mock
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default progress data on first visit', () => {
      const { result } = renderHook(() => useLocalProgress());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.progress.sectionsVisited).toEqual([]);
      expect(result.current.progress.topicsExplored).toEqual([]);
      expect(result.current.progress.toolsUsed).toEqual([]);
      expect(result.current.progress.practiceCompleted).toBe(0);
      expect(result.current.progress.streak).toBe(0);
      expect(result.current.progress.badges).toHaveLength(1);
      expect(result.current.progress.badges[0].id).toBe('first-visit');
    });

    it('should load existing progress from localStorage', () => {
      const existingProgress = {
        version: '1.0',
        data: {
          sectionsVisited: ['hero', 'topics'],
          topicsExplored: ['algebra', 'geometry'],
          toolsUsed: ['calculator'],
          practiceCompleted: 5,
          streak: 2,
          badges: [
            {
              id: 'first-visit',
              name: 'Welcome Explorer',
              description: 'Visited Math Farm for the first time',
              icon: 'star',
              category: 'exploration',
              earnedAt: '2024-01-01T00:00:00.000Z',
            },
          ],
          lastVisit: '2024-01-01T00:00:00.000Z',
        },
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingProgress));

      const { result } = renderHook(() => useLocalProgress());

      expect(result.current.progress.sectionsVisited).toEqual(['hero', 'topics']);
      expect(result.current.progress.topicsExplored).toEqual(['algebra', 'geometry']);
      expect(result.current.progress.toolsUsed).toEqual(['calculator']);
      expect(result.current.progress.practiceCompleted).toBe(5);
      expect(result.current.progress.streak).toBe(2);
      expect(result.current.progress.badges).toHaveLength(1);
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const { result } = renderHook(() => useLocalProgress());

      expect(result.current.error).toBe('Failed to load progress data');
      expect(result.current.progress).toEqual(expect.objectContaining({
        sectionsVisited: [],
        topicsExplored: [],
        toolsUsed: [],
        practiceCompleted: 0,
        streak: 0,
      }));
    });

    it('should handle version mismatch by starting fresh', () => {
      const oldVersionProgress = {
        version: '0.9',
        data: {
          sectionsVisited: ['old-section'],
          topicsExplored: ['old-topic'],
          toolsUsed: [],
          practiceCompleted: 0,
          streak: 0,
          badges: [],
          lastVisit: '2024-01-01T00:00:00.000Z',
        },
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(oldVersionProgress));

      const { result } = renderHook(() => useLocalProgress());

      expect(result.current.progress.sectionsVisited).toEqual([]);
      expect(result.current.progress.topicsExplored).toEqual([]);
    });
  });

  describe('section visiting', () => {
    it('should track visited sections', () => {
      const { result } = renderHook(() => useLocalProgress());

      act(() => {
        result.current.visitSection('hero');
      });

      expect(result.current.progress.sectionsVisited).toContain('hero');
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should not duplicate section visits', () => {
      const { result } = renderHook(() => useLocalProgress());

      act(() => {
        result.current.visitSection('hero');
        result.current.visitSection('hero');
      });

      expect(result.current.progress.sectionsVisited.filter(s => s === 'hero')).toHaveLength(1);
    });
  });

  describe('topic exploration', () => {
    it('should track explored topics', () => {
      const { result } = renderHook(() => useLocalProgress());

      act(() => {
        result.current.exploreTopic('algebra');
      });

      expect(result.current.progress.topicsExplored).toContain('algebra');
    });

    it('should not duplicate topic exploration', () => {
      const { result } = renderHook(() => useLocalProgress());

      act(() => {
        result.current.exploreTopic('algebra');
        result.current.exploreTopic('algebra');
      });

      expect(result.current.progress.topicsExplored.filter(t => t === 'algebra')).toHaveLength(1);
    });

    it('should award topic explorer badge after exploring 3 topics', () => {
      const { result } = renderHook(() => useLocalProgress());

      act(() => {
        result.current.exploreTopic('algebra');
        result.current.exploreTopic('geometry');
        result.current.exploreTopic('calculus');
      });

      const badges = result.current.getBadges();
      expect(badges.some(b => b.id === 'topic-explorer')).toBe(true);
    });
  });

  describe('tool usage', () => {
    it('should track used tools', () => {
      const { result } = renderHook(() => useLocalProgress());

      act(() => {
        result.current.useTool('calculator');
      });

      expect(result.current.progress.toolsUsed).toContain('calculator');
    });

    it('should not duplicate tool usage', () => {
      const { result } = renderHook(() => useLocalProgress());

      act(() => {
        result.current.useTool('calculator');
        result.current.useTool('calculator');
      });

      expect(result.current.progress.toolsUsed.filter(t => t === 'calculator')).toHaveLength(1);
    });

    it('should award tool user badge after using 2 tools', () => {
      const { result } = renderHook(() => useLocalProgress());

      act(() => {
        result.current.useTool('calculator');
        result.current.useTool('graphing');
      });

      const badges = result.current.getBadges();
      expect(badges.some(b => b.id === 'tool-user')).toBe(true);
    });
  });

  describe('practice completion', () => {
    it('should increment practice completed count', () => {
      const { result } = renderHook(() => useLocalProgress());

      act(() => {
        result.current.completePractice();
      });

      expect(result.current.progress.practiceCompleted).toBe(1);
    });

    it('should award practice starter badge after first completion', () => {
      const { result } = renderHook(() => useLocalProgress());

      act(() => {
        result.current.completePractice();
      });

      const badges = result.current.getBadges();
      expect(badges.some(b => b.id === 'practice-starter')).toBe(true);
    });

    it('should award dedicated learner badge after 10 completions', () => {
      const { result } = renderHook(() => useLocalProgress());

      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.completePractice();
        }
      });

      const badges = result.current.getBadges();
      expect(badges.some(b => b.id === 'dedicated-learner')).toBe(true);
    });
  });

  describe('streak calculation', () => {
    it('should return current streak', () => {
      const { result } = renderHook(() => useLocalProgress());

      const streak = result.current.getStreak();
      expect(typeof streak).toBe('number');
      expect(streak).toBeGreaterThanOrEqual(0);
    });

    it('should award streak keeper badge after 3-day streak', () => {
      // Mock a progress with existing streak
      const existingProgress = {
        version: '1.0',
        data: {
          sectionsVisited: [],
          topicsExplored: [],
          toolsUsed: [],
          practiceCompleted: 0,
          streak: 3,
          badges: [],
          lastVisit: new Date().toISOString(),
        },
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingProgress));

      const { result } = renderHook(() => useLocalProgress());

      act(() => {
        result.current.visitSection('test');
      });

      const badges = result.current.getBadges();
      expect(badges.some(b => b.id === 'streak-keeper')).toBe(true);
    });
  });

  describe('badge management', () => {
    it('should return all earned badges', () => {
      const { result } = renderHook(() => useLocalProgress());

      const badges = result.current.getBadges();
      expect(Array.isArray(badges)).toBe(true);
      expect(badges.length).toBeGreaterThanOrEqual(1); // At least welcome badge
    });

    it('should not award duplicate badges', () => {
      const { result } = renderHook(() => useLocalProgress());

      act(() => {
        result.current.exploreTopic('algebra');
        result.current.exploreTopic('geometry');
        result.current.exploreTopic('calculus');
        result.current.exploreTopic('trigonometry'); // Should not award another topic explorer badge
      });

      const badges = result.current.getBadges();
      const topicExplorerBadges = badges.filter(b => b.id === 'topic-explorer');
      expect(topicExplorerBadges).toHaveLength(1);
    });
  });

  describe('data persistence', () => {
    it('should save to localStorage on updates', () => {
      const { result } = renderHook(() => useLocalProgress());

      act(() => {
        result.current.visitSection('test');
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'mathfarm_progress',
        expect.stringContaining('"version":"1.0"')
      );
    });

    it('should handle save errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const { result } = renderHook(() => useLocalProgress());

      act(() => {
        result.current.visitSection('test');
      });

      expect(result.current.error).toBe('Failed to save progress data');
    });
  });

  describe('progress clearing', () => {
    it('should clear all progress data', () => {
      const { result } = renderHook(() => useLocalProgress());

      act(() => {
        result.current.visitSection('test');
        result.current.clearProgress();
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('mathfarm_progress');
      expect(result.current.progress.sectionsVisited).toEqual([]);
    });

    it('should handle clear errors gracefully', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Clear failed');
      });

      const { result } = renderHook(() => useLocalProgress());

      act(() => {
        result.current.clearProgress();
      });

      expect(result.current.error).toBe('Failed to clear progress data');
    });
  });

  describe('legacy updateProgress method', () => {
    it('should support legacy updateProgress interface', () => {
      const { result } = renderHook(() => useLocalProgress());

      act(() => {
        result.current.updateProgress('test-section', true);
      });

      expect(result.current.progress.sectionsVisited).toContain('test-section');
    });

    it('should not update when completed is false', () => {
      const { result } = renderHook(() => useLocalProgress());

      act(() => {
        result.current.updateProgress('test-section', false);
      });

      expect(result.current.progress.sectionsVisited).not.toContain('test-section');
    });
  });
});