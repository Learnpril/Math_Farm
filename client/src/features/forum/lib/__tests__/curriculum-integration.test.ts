import { describe, it, expect } from 'vitest';
import {
  generateCurriculumCategories,
  getTopicCategoryMapping,
  getCategoryForTopic,
  getTopicForCategory,
  createTopicDeepLink,
  createForumDeepLink,
  generateStudyGroupSuggestions,
  createTopicDiscussionThread,
  updateProgressWithForumActivity,
} from '../curriculum-integration';
import type { CurriculumProgress } from '../curriculum-integration';

describe('Curriculum Integration', () => {
  describe('generateCurriculumCategories', () => {
    it('should generate categories based on curriculum structure', () => {
      const categories = generateCurriculumCategories();

      expect(categories.length).toBeGreaterThan(0);

      // Should have level-based parent categories
      const parentCategories = categories.filter(cat => !cat.parentId);
      expect(
        parentCategories.some(cat => cat.name.includes('Elementary'))
      ).toBe(true);
      expect(parentCategories.some(cat => cat.name.includes('Advanced'))).toBe(
        true
      );

      // Should have topic-based subcategories
      const subCategories = categories.filter(cat => cat.parentId);
      expect(subCategories.some(cat => cat.name === 'Algebra')).toBe(true);
      expect(subCategories.some(cat => cat.name === 'Calculus')).toBe(true);
    });

    it('should include general categories', () => {
      const categories = generateCurriculumCategories();

      expect(categories.some(cat => cat.name === 'General Discussion')).toBe(
        true
      );
      expect(
        categories.some(cat => cat.name === 'Math Tools & Calculators')
      ).toBe(true);
      expect(categories.some(cat => cat.name === 'Study Groups')).toBe(true);
    });
  });

  describe('getTopicCategoryMapping', () => {
    it('should map topics to categories', () => {
      const mapping = getTopicCategoryMapping();

      expect(mapping.length).toBeGreaterThan(0);

      const algebraMapping = mapping.find(m => m.topicId === 'algebra');
      expect(algebraMapping).toBeDefined();
      expect(algebraMapping?.topicTitle).toBe('Algebra');
      expect(algebraMapping?.level).toBe('middle');
    });
  });

  describe('getCategoryForTopic', () => {
    it('should return category ID for valid topic', () => {
      const categoryId = getCategoryForTopic('algebra');
      expect(categoryId).toBeTypeOf('number');
      expect(categoryId).toBeGreaterThan(0);
    });

    it('should return undefined for invalid topic', () => {
      const categoryId = getCategoryForTopic('nonexistent-topic');
      expect(categoryId).toBeUndefined();
    });
  });

  describe('getTopicForCategory', () => {
    it('should return topic for valid category', () => {
      const categoryId = getCategoryForTopic('algebra');
      if (categoryId) {
        const topic = getTopicForCategory(categoryId);
        expect(topic).toBeDefined();
        expect(topic?.id).toBe('algebra');
      }
    });

    it('should return undefined for invalid category', () => {
      const topic = getTopicForCategory(999);
      expect(topic).toBeUndefined();
    });
  });

  describe('createTopicDeepLink', () => {
    it('should create topic deep link', () => {
      const link = createTopicDeepLink('algebra');
      expect(link).toContain('/topic/algebra');
    });

    it('should include section anchor when provided', () => {
      const link = createTopicDeepLink('algebra', 'practice');
      expect(link).toContain('/topic/algebra#practice');
    });
  });

  describe('createForumDeepLink', () => {
    it('should create forum deep link for topic', () => {
      const link = createForumDeepLink('algebra');
      expect(link).toContain('/community/category/');
    });

    it('should return general forum link for unmapped topic', () => {
      const link = createForumDeepLink('nonexistent-topic');
      expect(link).toBe(`${window.location.origin}/community`);
    });
  });

  describe('generateStudyGroupSuggestions', () => {
    const mockProgress: CurriculumProgress[] = [
      {
        topicId: 'algebra',
        completed: false,
        progress: 0.3,
        lastActivity: new Date(),
      },
      {
        topicId: 'arithmetic',
        completed: true,
        progress: 1.0,
        lastActivity: new Date(),
      },
    ];

    it('should generate study group suggestions', () => {
      const suggestions = generateStudyGroupSuggestions(
        mockProgress,
        'calculus'
      );

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.every(s => s.id && s.name && s.topicId)).toBe(true);
    });

    it('should suggest prerequisite groups for struggling topics', () => {
      const suggestions = generateStudyGroupSuggestions(
        mockProgress,
        'trigonometry'
      );

      // Should suggest algebra group since user is struggling with it (30% progress)
      expect(suggestions.some(s => s.topicId === 'algebra')).toBe(true);
    });
  });

  describe('createTopicDiscussionThread', () => {
    it('should create discussion thread data', () => {
      const threadData = createTopicDiscussionThread('algebra', 'general');

      expect(threadData.title).toContain('Algebra');
      expect(threadData.categoryId).toBeTypeOf('number');
      expect(threadData.content).toContain('algebra');
      expect(threadData.content).toContain('/topic/algebra');
    });

    it('should create different content for different discussion types', () => {
      const generalThread = createTopicDiscussionThread('algebra', 'general');
      const homeworkThread = createTopicDiscussionThread('algebra', 'homework');

      expect(generalThread.title).not.toBe(homeworkThread.title);
      expect(generalThread.content).not.toBe(homeworkThread.content);
    });

    it('should throw error for invalid topic', () => {
      expect(() => {
        createTopicDiscussionThread('nonexistent-topic', 'general');
      }).toThrow('Topic not found');
    });
  });

  describe('updateProgressWithForumActivity', () => {
    const mockProgress: CurriculumProgress = {
      topicId: 'algebra',
      completed: false,
      progress: 0.5,
      lastActivity: new Date(),
      forumParticipation: {
        postsCount: 5,
        threadsCreated: 1,
        helpGiven: 2,
        helpReceived: 1,
      },
    };

    it('should update forum participation stats', () => {
      const updated = updateProgressWithForumActivity(mockProgress, {
        postsCreated: 2,
        helpGiven: 1,
      });

      expect(updated.forumParticipation?.postsCount).toBe(7);
      expect(updated.forumParticipation?.helpGiven).toBe(3);
      expect(updated.lastActivity).toBeInstanceOf(Date);
    });

    it('should increase progress based on forum activity', () => {
      const updated = updateProgressWithForumActivity(mockProgress, {
        postsCreated: 5,
        helpGiven: 3,
        threadsCreated: 1,
      });

      expect(updated.progress).toBeGreaterThan(mockProgress.progress);
      expect(updated.progress).toBeLessThanOrEqual(1.0);
    });

    it('should handle missing forum participation data', () => {
      const progressWithoutForum: CurriculumProgress = {
        topicId: 'algebra',
        completed: false,
        progress: 0.5,
        lastActivity: new Date(),
      };

      const updated = updateProgressWithForumActivity(progressWithoutForum, {
        postsCreated: 1,
      });

      expect(updated.forumParticipation?.postsCount).toBe(1);
      expect(updated.forumParticipation?.threadsCreated).toBe(0);
    });
  });
});
