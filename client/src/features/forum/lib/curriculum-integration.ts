/**
 * Integration utilities for linking forum with Math Farm curriculum
 */

import topicsData from '../../../data/topicsData.json';
import { ForumCategory, ForumThread } from '../types';

export interface TopicForumMapping {
  topicId: string;
  topicTitle: string;
  categoryId: number;
  categoryName: string;
  level: string;
  prerequisites: string[];
}

export interface StudyGroupData {
  id: string;
  name: string;
  topicId: string;
  categoryId: number;
  memberCount: number;
  isActive: boolean;
  createdAt: Date;
  description?: string;
}

export interface CurriculumProgress {
  topicId: string;
  completed: boolean;
  progress: number;
  lastActivity?: Date;
  forumParticipation?: {
    postsCount: number;
    threadsCreated: number;
    helpGiven: number;
    helpReceived: number;
  };
}

/**
 * Create forum categories based on Math Farm curriculum structure
 */
export function generateCurriculumCategories(): ForumCategory[] {
  const topics = topicsData as any[];
  const categories: ForumCategory[] = [];

  // Group topics by level
  const levelGroups = topics.reduce(
    (acc, topic) => {
      if (!acc[topic.level]) {
        acc[topic.level] = [];
      }
      acc[topic.level].push(topic);
      return acc;
    },
    {} as Record<string, any[]>
  );

  let sortOrder = 1;

  // Create level-based parent categories
  const levelOrder = [
    'elementary',
    'middle',
    'high',
    'advanced',
    'specialized',
  ];
  const levelNames = {
    elementary: 'Elementary Math',
    middle: 'Middle School Math',
    high: 'High School Math',
    advanced: 'Advanced Math',
    specialized: 'Specialized Topics',
  };

  levelOrder.forEach(level => {
    if (levelGroups[level]) {
      // Create parent category for the level
      const parentCategory: ForumCategory = {
        id: sortOrder,
        name: levelNames[level as keyof typeof levelNames],
        description: `Discussion topics for ${levelNames[level as keyof typeof levelNames].toLowerCase()}`,
        sortOrder: sortOrder++,
        threadCount: 0,
        postCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        children: [],
      };

      categories.push(parentCategory);

      // Create subcategories for each topic in the level
      levelGroups[level].forEach(topic => {
        const subcategory: ForumCategory = {
          id: sortOrder,
          name: topic.title,
          description: topic.description,
          parentId: parentCategory.id,
          sortOrder: sortOrder++,
          threadCount: 0,
          postCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        categories.push(subcategory);
        parentCategory.children!.push(subcategory);
      });
    }
  });

  // Add general categories
  const generalCategories = [
    {
      name: 'General Discussion',
      description: 'General mathematical discussions and questions',
    },
    {
      name: 'Math Tools & Calculators',
      description: 'Discussions about mathematical tools and calculators',
    },
    {
      name: 'Study Groups',
      description: 'Organize and join study groups for collaborative learning',
    },
    {
      name: 'Homework Help',
      description: 'Get help with homework and assignments',
    },
    {
      name: 'Math Challenges',
      description: 'Share and solve mathematical challenges and puzzles',
    },
  ];

  generalCategories.forEach(cat => {
    categories.push({
      id: sortOrder,
      name: cat.name,
      description: cat.description,
      sortOrder: sortOrder++,
      threadCount: 0,
      postCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  return categories;
}

/**
 * Get topic-to-category mapping
 */
export function getTopicCategoryMapping(): TopicForumMapping[] {
  const topics = topicsData as any[];
  const categories = generateCurriculumCategories();

  return topics.map(topic => {
    const category = categories.find(
      cat => cat.name === topic.title && cat.parentId !== undefined
    );

    return {
      topicId: topic.id,
      topicTitle: topic.title,
      categoryId: category?.id || 1, // Default to general discussion
      categoryName: category?.name || 'General Discussion',
      level: topic.level,
      prerequisites: topic.prerequisites || [],
    };
  });
}

/**
 * Get forum category for a specific topic
 */
export function getCategoryForTopic(topicId: string): number | undefined {
  const mapping = getTopicCategoryMapping();
  return mapping.find(m => m.topicId === topicId)?.categoryId;
}

/**
 * Get topic information for a forum category
 */
export function getTopicForCategory(categoryId: number): any | undefined {
  const topics = topicsData as any[];
  const mapping = getTopicCategoryMapping();
  const topicMapping = mapping.find(m => m.categoryId === categoryId);

  if (topicMapping) {
    return topics.find(t => t.id === topicMapping.topicId);
  }

  return undefined;
}

/**
 * Create deep links between forum discussions and math topics
 */
export function createTopicDeepLink(topicId: string, section?: string): string {
  const baseUrl = window.location.origin;
  let url = `${baseUrl}/topic/${topicId}`;

  if (section) {
    url += `#${section}`;
  }

  return url;
}

/**
 * Create forum deep link for a topic
 */
export function createForumDeepLink(topicId: string): string {
  const baseUrl = window.location.origin;
  const categoryId = getCategoryForTopic(topicId);

  if (categoryId) {
    return `${baseUrl}/community/category/${categoryId}`;
  }

  return `${baseUrl}/community`;
}

/**
 * Generate study group suggestions based on user progress and topic relationships
 */
export function generateStudyGroupSuggestions(
  userProgress: CurriculumProgress[],
  currentTopicId?: string
): StudyGroupData[] {
  const topics = topicsData as any[];
  const suggestions: StudyGroupData[] = [];

  // Find current topic
  const currentTopic = currentTopicId
    ? topics.find(t => t.id === currentTopicId)
    : null;

  // Suggest groups for prerequisite topics if user is struggling
  if (currentTopic && currentTopic.prerequisites) {
    currentTopic.prerequisites.forEach((prereqId: string) => {
      const prereqTopic = topics.find(t => t.id === prereqId);
      const userPrereqProgress = userProgress.find(p => p.topicId === prereqId);

      if (
        prereqTopic &&
        (!userPrereqProgress || userPrereqProgress.progress < 0.8)
      ) {
        suggestions.push({
          id: `study-${prereqId}`,
          name: `${prereqTopic.title} Study Group`,
          topicId: prereqId,
          categoryId: getCategoryForTopic(prereqId) || 1,
          memberCount: Math.floor(Math.random() * 20) + 5, // Mock data
          isActive: true,
          createdAt: new Date(),
          description: `Study group for mastering ${prereqTopic.title} concepts`,
        });
      }
    });
  }

  // Suggest groups for topics at similar level
  const userLevel = currentTopic?.level;
  if (userLevel) {
    const similarTopics = topics.filter(
      t =>
        t.level === userLevel &&
        t.id !== currentTopicId &&
        !suggestions.some(s => s.topicId === t.id)
    );

    similarTopics.slice(0, 3).forEach(topic => {
      suggestions.push({
        id: `study-${topic.id}`,
        name: `${topic.title} Study Group`,
        topicId: topic.id,
        categoryId: getCategoryForTopic(topic.id) || 1,
        memberCount: Math.floor(Math.random() * 15) + 3,
        isActive: true,
        createdAt: new Date(),
        description: `Collaborative learning for ${topic.title}`,
      });
    });
  }

  return suggestions.slice(0, 5); // Limit to 5 suggestions
}

/**
 * Get related forum threads for a topic
 */
export function getRelatedForumThreads(
  topicId: string
): Promise<ForumThread[]> {
  // This would typically make an API call
  // For now, return mock data
  return Promise.resolve([]);
}

/**
 * Create a forum thread for topic-specific discussion
 */
export function createTopicDiscussionThread(
  topicId: string,
  discussionType: 'general' | 'homework' | 'concept' | 'application'
): {
  title: string;
  categoryId: number;
  content: string;
} {
  const topics = topicsData as any[];
  const topic = topics.find(t => t.id === topicId);
  const categoryId = getCategoryForTopic(topicId) || 1;

  if (!topic) {
    throw new Error(`Topic not found: ${topicId}`);
  }

  const titles = {
    general: `General Discussion: ${topic.title}`,
    homework: `Homework Help: ${topic.title}`,
    concept: `Understanding ${topic.title} Concepts`,
    application: `Real-world Applications of ${topic.title}`,
  };

  const contents = {
    general: `Let's discuss ${topic.title}! Share your thoughts, questions, and insights about this topic.`,
    homework: `Need help with ${topic.title} homework? Post your questions here and get help from the community.`,
    concept: `Having trouble understanding ${topic.title} concepts? Let's break them down together.`,
    application: `How is ${topic.title} used in real life? Share examples and applications you've discovered.`,
  };

  return {
    title: titles[discussionType],
    categoryId,
    content: `${contents[discussionType]}\n\n**Topic:** ${topic.title}\n**Level:** ${topic.level}\n**Description:** ${topic.description}\n\n[View topic details](${createTopicDeepLink(topicId)})`,
  };
}

/**
 * Track forum participation for progress calculation
 */
export function updateProgressWithForumActivity(
  progress: CurriculumProgress,
  activity: {
    postsCreated?: number;
    helpGiven?: number;
    helpReceived?: number;
    threadsCreated?: number;
  }
): CurriculumProgress {
  const forumParticipation = progress.forumParticipation || {
    postsCount: 0,
    threadsCreated: 0,
    helpGiven: 0,
    helpReceived: 0,
  };

  // Update forum participation stats
  if (activity.postsCreated) {
    forumParticipation.postsCount += activity.postsCreated;
  }
  if (activity.helpGiven) {
    forumParticipation.helpGiven += activity.helpGiven;
  }
  if (activity.helpReceived) {
    forumParticipation.helpReceived += activity.helpReceived;
  }
  if (activity.threadsCreated) {
    forumParticipation.threadsCreated += activity.threadsCreated;
  }

  // Calculate bonus progress from forum participation
  const forumBonus = Math.min(
    0.1,
    forumParticipation.postsCount * 0.01 +
      forumParticipation.helpGiven * 0.02 +
      forumParticipation.threadsCreated * 0.03
  );

  return {
    ...progress,
    progress: Math.min(1.0, progress.progress + forumBonus),
    lastActivity: new Date(),
    forumParticipation,
  };
}
