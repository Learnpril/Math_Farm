import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import threadsRouter from '../threads.js';
import { forumRepository } from '../../../database/forum-repository.js';

// Mock the forum repository
vi.mock('../../../database/forum-repository.js', () => ({
  forumRepository: {
    getThreadById: vi.fn(),
    createThread: vi.fn(),
    updateThread: vi.fn(),
    deleteThread: vi.fn(),
    getPostsByThread: vi.fn(),
    getCategoryById: vi.fn(),
  },
}));

// Mock auth middleware
vi.mock('../../../middleware/auth.js', async importOriginal => {
  const actual =
    await importOriginal<typeof import('../../../middleware/auth.js')>();
  return {
    ...actual,
    optionalAuth: vi.fn((req, res, next) => next()),
    authenticateToken: vi.fn((req, res, next) => {
      req.user = { userId: 1, username: 'testuser', role: 'member' };
      next();
    }),
    requirePermission: vi.fn(() => (req, res, next) => next()),
  };
});

const app = express();
app.use(express.json());
app.use('/api/forum/threads', threadsRouter);

describe('Threads API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/forum/threads/:id', () => {
    it('should return thread with posts', async () => {
      const mockThread = {
        id: 1,
        title: 'Test Thread',
        categoryId: 1,
        authorId: 1,
        isPinned: false,
        isLocked: false,
        postCount: 2,
        lastPostAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockCategory = {
        id: 1,
        name: 'Test Category',
        description: 'Test description',
        parentId: null,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPosts = [
        {
          id: 1,
          threadId: 1,
          authorId: 1,
          parentPostId: null,
          content: 'First post',
          mathExpressions: [],
          isEdited: false,
          editedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(forumRepository.getThreadById).mockResolvedValue(mockThread);
      vi.mocked(forumRepository.getCategoryById).mockResolvedValue(
        mockCategory
      );
      vi.mocked(forumRepository.getPostsByThread).mockResolvedValue(mockPosts);

      const response = await request(app).get('/api/forum/threads/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('thread');
      expect(response.body).toHaveProperty('category');
      expect(response.body).toHaveProperty('posts');
      expect(response.body).toHaveProperty('pagination');
      expect(forumRepository.getThreadById).toHaveBeenCalledWith(1);
      expect(forumRepository.getPostsByThread).toHaveBeenCalledWith(1, 50, 0);
    });

    it('should return 404 for non-existent thread', async () => {
      vi.mocked(forumRepository.getThreadById).mockResolvedValue(null);

      const response = await request(app).get('/api/forum/threads/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Thread not found');
      expect(response.body).toHaveProperty('code', 'THREAD_NOT_FOUND');
    });

    it('should return 400 for invalid thread ID', async () => {
      const response = await request(app).get('/api/forum/threads/invalid');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid thread ID');
      expect(response.body).toHaveProperty('code', 'INVALID_THREAD_ID');
    });

    it('should handle pagination parameters', async () => {
      const mockThread = {
        id: 1,
        title: 'Test Thread',
        categoryId: 1,
        authorId: 1,
        isPinned: false,
        isLocked: false,
        postCount: 2,
        lastPostAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(forumRepository.getThreadById).mockResolvedValue(mockThread);
      vi.mocked(forumRepository.getCategoryById).mockResolvedValue(null);
      vi.mocked(forumRepository.getPostsByThread).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/forum/threads/1')
        .query({ page: '2', limit: '25' });

      expect(response.status).toBe(200);
      expect(forumRepository.getPostsByThread).toHaveBeenCalledWith(1, 25, 25);
    });
  });

  describe('POST /api/forum/threads', () => {
    it('should create new thread', async () => {
      const newThreadData = {
        title: 'New Thread',
        categoryId: 1,
      };

      const mockCategory = {
        id: 1,
        name: 'Test Category',
        description: 'Test description',
        parentId: null,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createdThread = {
        id: 1,
        title: 'New Thread',
        categoryId: 1,
        authorId: 1,
        isPinned: false,
        isLocked: false,
        postCount: 0,
        lastPostAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(forumRepository.getCategoryById).mockResolvedValue(
        mockCategory
      );
      vi.mocked(forumRepository.createThread).mockResolvedValue(1);
      vi.mocked(forumRepository.getThreadById).mockResolvedValue(createdThread);

      const response = await request(app)
        .post('/api/forum/threads')
        .send(newThreadData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        ...createdThread,
        lastPostAt: null,
        createdAt: createdThread.createdAt.toISOString(),
        updatedAt: createdThread.updatedAt.toISOString(),
      });
      expect(forumRepository.createThread).toHaveBeenCalledWith({
        title: 'New Thread',
        categoryId: 1,
        authorId: 1,
        isPinned: false,
        isLocked: false,
      });
    });

    it('should validate required fields', async () => {
      const response = await request(app).post('/api/forum/threads').send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.details).toContain(
        'Thread title is required and must be a non-empty string'
      );
      expect(response.body.details).toContain('Valid category ID is required');
    });

    it('should validate category exists', async () => {
      vi.mocked(forumRepository.getCategoryById).mockResolvedValue(null);

      const response = await request(app).post('/api/forum/threads').send({
        title: 'New Thread',
        categoryId: 999,
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Category not found');
      expect(response.body).toHaveProperty('code', 'CATEGORY_NOT_FOUND');
    });

    it('should prevent regular users from creating pinned threads', async () => {
      const mockCategory = {
        id: 1,
        name: 'Test Category',
        description: 'Test description',
        parentId: null,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(forumRepository.getCategoryById).mockResolvedValue(
        mockCategory
      );

      const response = await request(app).post('/api/forum/threads').send({
        title: 'Pinned Thread',
        categoryId: 1,
        isPinned: true,
      });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty(
        'error',
        'Only moderators and admins can create pinned or locked threads'
      );
      expect(response.body).toHaveProperty('code', 'INSUFFICIENT_PERMISSIONS');
    });
  });

  describe('PUT /api/forum/threads/:id', () => {
    it('should allow owner to update thread title', async () => {
      const existingThread = {
        id: 1,
        title: 'Old Title',
        categoryId: 1,
        authorId: 1, // Same as authenticated user
        isPinned: false,
        isLocked: false,
        postCount: 1,
        lastPostAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedThread = {
        ...existingThread,
        title: 'New Title',
      };

      vi.mocked(forumRepository.getThreadById)
        .mockResolvedValueOnce(existingThread)
        .mockResolvedValueOnce(updatedThread);
      vi.mocked(forumRepository.updateThread).mockResolvedValue();

      const response = await request(app)
        .put('/api/forum/threads/1')
        .send({ title: 'New Title' });

      expect(response.status).toBe(200);
      expect(forumRepository.updateThread).toHaveBeenCalledWith(1, {
        title: 'New Title',
      });
    });

    it('should prevent non-owners from updating threads', async () => {
      const existingThread = {
        id: 1,
        title: 'Thread Title',
        categoryId: 1,
        authorId: 2, // Different from authenticated user (1)
        isPinned: false,
        isLocked: false,
        postCount: 1,
        lastPostAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(forumRepository.getThreadById).mockResolvedValue(
        existingThread
      );

      const response = await request(app)
        .put('/api/forum/threads/1')
        .send({ title: 'New Title' });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty(
        'error',
        'Insufficient permissions to edit thread'
      );
      expect(response.body).toHaveProperty('code', 'INSUFFICIENT_PERMISSIONS');
    });

    it('should prevent regular users from changing pinned status', async () => {
      const existingThread = {
        id: 1,
        title: 'Thread Title',
        categoryId: 1,
        authorId: 1,
        isPinned: false,
        isLocked: false,
        postCount: 1,
        lastPostAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(forumRepository.getThreadById).mockResolvedValue(
        existingThread
      );

      const response = await request(app)
        .put('/api/forum/threads/1')
        .send({ isPinned: true });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty(
        'error',
        'Only moderators can change thread pinned/locked status'
      );
      expect(response.body).toHaveProperty('code', 'INSUFFICIENT_PERMISSIONS');
    });
  });

  describe('DELETE /api/forum/threads/:id', () => {
    it('should allow owner to delete thread', async () => {
      const thread = {
        id: 1,
        title: 'Thread to Delete',
        categoryId: 1,
        authorId: 1, // Same as authenticated user
        isPinned: false,
        isLocked: false,
        postCount: 1,
        lastPostAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(forumRepository.getThreadById).mockResolvedValue(thread);
      vi.mocked(forumRepository.deleteThread).mockResolvedValue();

      const response = await request(app).delete('/api/forum/threads/1');

      expect(response.status).toBe(204);
      expect(forumRepository.deleteThread).toHaveBeenCalledWith(1);
    });

    it('should prevent non-owners from deleting threads', async () => {
      const thread = {
        id: 1,
        title: 'Thread to Delete',
        categoryId: 1,
        authorId: 2, // Different from authenticated user (1)
        isPinned: false,
        isLocked: false,
        postCount: 1,
        lastPostAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(forumRepository.getThreadById).mockResolvedValue(thread);

      const response = await request(app).delete('/api/forum/threads/1');

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty(
        'error',
        'Insufficient permissions to delete thread'
      );
      expect(response.body).toHaveProperty('code', 'INSUFFICIENT_PERMISSIONS');
    });
  });

  describe('POST /api/forum/threads/:id/pin', () => {
    it('should validate pinned status is boolean', async () => {
      const response = await request(app)
        .post('/api/forum/threads/1/pin')
        .send({ pinned: 'true' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        'error',
        'Pinned status must be a boolean'
      );
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    it('should return 404 for non-existent thread', async () => {
      vi.mocked(forumRepository.getThreadById).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/forum/threads/999/pin')
        .send({ pinned: true });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Thread not found');
      expect(response.body).toHaveProperty('code', 'THREAD_NOT_FOUND');
    });
  });

  describe('POST /api/forum/threads/:id/lock', () => {
    it('should validate locked status is boolean', async () => {
      const response = await request(app)
        .post('/api/forum/threads/1/lock')
        .send({ locked: 'true' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        'error',
        'Locked status must be a boolean'
      );
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    it('should return 404 for non-existent thread', async () => {
      vi.mocked(forumRepository.getThreadById).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/forum/threads/999/lock')
        .send({ locked: true });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Thread not found');
      expect(response.body).toHaveProperty('code', 'THREAD_NOT_FOUND');
    });
  });
});
