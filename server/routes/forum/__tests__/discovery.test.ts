import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import discoveryRouter from '../discovery.js';
import { discoveryService } from '../../../services/discovery-service.js';

// Mock the discovery service
vi.mock('../../../services/discovery-service.js', () => ({
  discoveryService: {
    getTrendingTopics: vi.fn(),
    getPopularDiscussions: vi.fn(),
    getUserActivityFeed: vi.fn(),
    followUser: vi.fn(),
    unfollowUser: vi.fn(),
    getUserFollowing: vi.fn(),
    getRelatedThreads: vi.fn(),
    getTags: vi.fn(),
    getThreadsByTag: vi.fn(),
  },
}));

// Mock authentication middleware
vi.mock('../../../middleware/auth.js', () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    req.user = { userId: 1 };
    next();
  },
}));

const app = express();
app.use(express.json());
app.use('/api/forum/discovery', discoveryRouter);

describe('Forum Discovery Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/forum/discovery/trending', () => {
    it('should return trending topics', async () => {
      const mockTrendingTopics = [
        {
          id: 1,
          title: 'Algebra Basics',
          category: { id: 1, name: 'Math Help' },
          author: { id: 1, username: 'mathexpert' },
          postCount: 15,
          recentActivity: 5,
          trendScore: 0.85,
          tags: ['algebra', 'basics'],
          createdAt: '2024-01-01T00:00:00Z',
          lastPostAt: '2024-01-02T00:00:00Z',
        },
      ];

      vi.mocked(discoveryService.getTrendingTopics).mockResolvedValue(
        mockTrendingTopics
      );

      const response = await request(app)
        .get('/api/forum/discovery/trending')
        .query({ timeframe: 'week', limit: '10' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockTrendingTopics);
      expect(discoveryService.getTrendingTopics).toHaveBeenCalledWith({
        timeframe: 'week',
        limit: 10,
      });
    });

    it('should handle service errors', async () => {
      vi.mocked(discoveryService.getTrendingTopics).mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app)
        .get('/api/forum/discovery/trending')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to get trending topics');
    });
  });

  describe('GET /api/forum/discovery/popular', () => {
    it('should return popular discussions', async () => {
      const mockPopularDiscussions = [
        {
          id: 1,
          title: 'Calculus Help',
          category: { id: 2, name: 'Advanced Math' },
          author: { id: 2, username: 'calcstudent' },
          postCount: 25,
          viewCount: 150,
          likeCount: 12,
          popularityScore: 200,
          tags: ['calculus', 'derivatives'],
          createdAt: '2024-01-01T00:00:00Z',
          lastPostAt: '2024-01-02T00:00:00Z',
        },
      ];

      vi.mocked(discoveryService.getPopularDiscussions).mockResolvedValue(
        mockPopularDiscussions
      );

      const response = await request(app)
        .get('/api/forum/discovery/popular')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockPopularDiscussions);
    });
  });

  describe('GET /api/forum/discovery/activity-feed', () => {
    it('should return user activity feed', async () => {
      const mockActivityFeed = {
        items: [
          {
            id: 1,
            type: 'post',
            title: 'New post content',
            content: 'This is a new post...',
            author: { id: 2, username: 'activeuser' },
            thread: {
              id: 1,
              title: 'Math Discussion',
              category: { id: 1, name: 'General' },
            },
            createdAt: '2024-01-01T00:00:00Z',
            isFollowing: true,
          },
        ],
        total: 1,
        hasMore: false,
      };

      vi.mocked(discoveryService.getUserActivityFeed).mockResolvedValue(
        mockActivityFeed
      );

      const response = await request(app)
        .get('/api/forum/discovery/activity-feed')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockActivityFeed);
    });

    it('should require authentication', async () => {
      // Mock unauthenticated request
      const unauthApp = express();
      unauthApp.use(express.json());
      unauthApp.use(
        '/api/forum/discovery',
        (req, res, next) => {
          req.user = undefined;
          next();
        },
        discoveryRouter
      );

      await request(unauthApp)
        .get('/api/forum/discovery/activity-feed')
        .expect(401);
    });
  });

  describe('POST /api/forum/discovery/follow/:userId', () => {
    it('should follow a user', async () => {
      const mockFollow = {
        id: 1,
        followerId: 1,
        followingId: 2,
        createdAt: '2024-01-01T00:00:00Z',
      };

      vi.mocked(discoveryService.followUser).mockResolvedValue(mockFollow);

      const response = await request(app)
        .post('/api/forum/discovery/follow/2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockFollow);
      expect(discoveryService.followUser).toHaveBeenCalledWith(1, 2);
    });

    it('should not allow following yourself', async () => {
      const response = await request(app)
        .post('/api/forum/discovery/follow/1')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Cannot follow yourself');
    });
  });

  describe('DELETE /api/forum/discovery/follow/:userId', () => {
    it('should unfollow a user', async () => {
      vi.mocked(discoveryService.unfollowUser).mockResolvedValue();

      const response = await request(app)
        .delete('/api/forum/discovery/follow/2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(discoveryService.unfollowUser).toHaveBeenCalledWith(1, 2);
    });
  });

  describe('GET /api/forum/discovery/related/:threadId', () => {
    it('should return related threads', async () => {
      const mockRelatedThreads = [
        {
          id: 2,
          title: 'Similar Math Topic',
          category: { id: 1, name: 'Math Help' },
          author: { id: 3, username: 'mathhelper' },
          postCount: 8,
          similarityScore: 0.75,
          tags: ['algebra'],
          createdAt: '2024-01-01T00:00:00Z',
          lastPostAt: '2024-01-01T12:00:00Z',
        },
      ];

      vi.mocked(discoveryService.getRelatedThreads).mockResolvedValue(
        mockRelatedThreads
      );

      const response = await request(app)
        .get('/api/forum/discovery/related/1')
        .query({ limit: '5' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockRelatedThreads);
      expect(discoveryService.getRelatedThreads).toHaveBeenCalledWith({
        threadId: 1,
        limit: 5,
      });
    });
  });

  describe('GET /api/forum/discovery/tags', () => {
    it('should return forum tags', async () => {
      const mockTags = [
        {
          id: 1,
          name: 'algebra',
          description: 'Algebraic topics',
          color: '#6366f1',
          threadCount: 15,
          postCount: 45,
          createdAt: '2024-01-01T00:00:00Z',
        },
      ];

      vi.mocked(discoveryService.getTags).mockResolvedValue(mockTags);

      const response = await request(app)
        .get('/api/forum/discovery/tags')
        .query({ popular: 'true', limit: '20' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockTags);
      expect(discoveryService.getTags).toHaveBeenCalledWith({
        popular: true,
        limit: 20,
      });
    });
  });

  describe('GET /api/forum/discovery/tags/:tag/threads', () => {
    it('should return threads by tag', async () => {
      const mockThreadsByTag = {
        threads: [
          {
            id: 1,
            title: 'Algebra Question',
            category: { id: 1, name: 'Math Help' },
            author: { id: 1, username: 'student' },
            postCount: 5,
            createdAt: '2024-01-01T00:00:00Z',
            lastPostAt: '2024-01-01T12:00:00Z',
          },
        ],
        total: 1,
        hasMore: false,
      };

      vi.mocked(discoveryService.getThreadsByTag).mockResolvedValue(
        mockThreadsByTag
      );

      const response = await request(app)
        .get('/api/forum/discovery/tags/algebra/threads')
        .query({ page: '1', limit: '20' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockThreadsByTag);
      expect(discoveryService.getThreadsByTag).toHaveBeenCalledWith({
        tag: 'algebra',
        page: 1,
        limit: 20,
      });
    });
  });
});
