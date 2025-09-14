import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import postsRouter from '../posts.js';
import { forumRepository } from '../../../database/forum-repository.js';

// Mock the forum repository
vi.mock('../../../database/forum-repository.js', () => ({
  forumRepository: {
    getPostById: vi.fn(),
    createPost: vi.fn(),
    updatePost: vi.fn(),
    deletePost: vi.fn(),
    getPostReplies: vi.fn(),
    getThreadById: vi.fn(),
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
app.use('/api/forum/posts', postsRouter);

describe('Posts API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/forum/posts/:id', () => {
    it('should return post with thread and category info', async () => {
      const mockPost = {
        id: 1,
        threadId: 1,
        authorId: 1,
        parentPostId: null,
        content: 'Test post content',
        mathExpressions: [],
        isEdited: false,
        editedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockThread = {
        id: 1,
        title: 'Test Thread',
        categoryId: 1,
        authorId: 1,
        isPinned: false,
        isLocked: false,
        postCount: 1,
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

      vi.mocked(forumRepository.getPostById).mockResolvedValue(mockPost);
      vi.mocked(forumRepository.getThreadById).mockResolvedValue(mockThread);
      vi.mocked(forumRepository.getCategoryById).mockResolvedValue(
        mockCategory
      );

      const response = await request(app).get('/api/forum/posts/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('post');
      expect(response.body).toHaveProperty('thread');
      expect(response.body).toHaveProperty('category');
      expect(forumRepository.getPostById).toHaveBeenCalledWith(1);
    });

    it('should return 404 for non-existent post', async () => {
      vi.mocked(forumRepository.getPostById).mockResolvedValue(null);

      const response = await request(app).get('/api/forum/posts/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Post not found');
      expect(response.body).toHaveProperty('code', 'POST_NOT_FOUND');
    });

    it('should return 400 for invalid post ID', async () => {
      const response = await request(app).get('/api/forum/posts/invalid');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid post ID');
      expect(response.body).toHaveProperty('code', 'INVALID_POST_ID');
    });
  });

  describe('POST /api/forum/posts', () => {
    it('should create new post', async () => {
      const newPostData = {
        content: 'This is a test post',
        threadId: 1,
      };

      const mockThread = {
        id: 1,
        title: 'Test Thread',
        categoryId: 1,
        authorId: 1,
        isPinned: false,
        isLocked: false,
        postCount: 1,
        lastPostAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createdPost = {
        id: 1,
        threadId: 1,
        authorId: 1,
        parentPostId: null,
        content: 'This is a test post',
        mathExpressions: [],
        isEdited: false,
        editedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(forumRepository.getThreadById).mockResolvedValue(mockThread);
      vi.mocked(forumRepository.createPost).mockResolvedValue(1);
      vi.mocked(forumRepository.getPostById).mockResolvedValue(createdPost);

      const response = await request(app)
        .post('/api/forum/posts')
        .send(newPostData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        ...createdPost,
        editedAt: null,
        createdAt: createdPost.createdAt.toISOString(),
        updatedAt: createdPost.updatedAt.toISOString(),
      });
      expect(forumRepository.createPost).toHaveBeenCalledWith({
        threadId: 1,
        authorId: 1,
        parentPostId: undefined,
        content: 'This is a test post',
        mathExpressions: [],
      });
    });

    it('should validate required fields', async () => {
      const response = await request(app).post('/api/forum/posts').send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.details).toContain(
        'Post content is required and must be a non-empty string'
      );
      expect(response.body.details).toContain('Valid thread ID is required');
    });

    it('should validate thread exists', async () => {
      vi.mocked(forumRepository.getThreadById).mockResolvedValue(null);

      const response = await request(app).post('/api/forum/posts').send({
        content: 'Test post',
        threadId: 999,
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Thread not found');
      expect(response.body).toHaveProperty('code', 'THREAD_NOT_FOUND');
    });

    it('should prevent posting in locked threads for regular users', async () => {
      const lockedThread = {
        id: 1,
        title: 'Locked Thread',
        categoryId: 1,
        authorId: 2,
        isPinned: false,
        isLocked: true,
        postCount: 1,
        lastPostAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(forumRepository.getThreadById).mockResolvedValue(lockedThread);

      const response = await request(app).post('/api/forum/posts').send({
        content: 'Test post',
        threadId: 1,
      });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty(
        'error',
        'Cannot post in locked thread'
      );
      expect(response.body).toHaveProperty('code', 'THREAD_LOCKED');
    });

    it('should validate parent post exists and is in same thread', async () => {
      const mockThread = {
        id: 1,
        title: 'Test Thread',
        categoryId: 1,
        authorId: 1,
        isPinned: false,
        isLocked: false,
        postCount: 1,
        lastPostAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(forumRepository.getThreadById).mockResolvedValue(mockThread);
      vi.mocked(forumRepository.getPostById).mockResolvedValue(null);

      const response = await request(app).post('/api/forum/posts').send({
        content: 'Reply post',
        threadId: 1,
        parentPostId: 999,
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        'error',
        'Parent post not found or not in the same thread'
      );
      expect(response.body).toHaveProperty('code', 'INVALID_PARENT_POST');
    });

    it('should handle math expressions', async () => {
      const mockThread = {
        id: 1,
        title: 'Test Thread',
        categoryId: 1,
        authorId: 1,
        isPinned: false,
        isLocked: false,
        postCount: 1,
        lastPostAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mathExpressions = [
        {
          id: 'math1',
          latex: 'x^2 + y^2 = z^2',
          position: { start: 0, end: 15 },
        },
      ];

      const createdPost = {
        id: 1,
        threadId: 1,
        authorId: 1,
        parentPostId: null,
        content: 'Math equation: x^2 + y^2 = z^2',
        mathExpressions,
        isEdited: false,
        editedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(forumRepository.getThreadById).mockResolvedValue(mockThread);
      vi.mocked(forumRepository.createPost).mockResolvedValue(1);
      vi.mocked(forumRepository.getPostById).mockResolvedValue(createdPost);

      const response = await request(app).post('/api/forum/posts').send({
        content: 'Math equation: x^2 + y^2 = z^2',
        threadId: 1,
        mathExpressions,
      });

      expect(response.status).toBe(201);
      expect(forumRepository.createPost).toHaveBeenCalledWith({
        threadId: 1,
        authorId: 1,
        parentPostId: undefined,
        content: 'Math equation: x^2 + y^2 = z^2',
        mathExpressions,
      });
    });

    it('should validate math expressions format', async () => {
      const mockThread = {
        id: 1,
        title: 'Test Thread',
        categoryId: 1,
        authorId: 1,
        isPinned: false,
        isLocked: false,
        postCount: 1,
        lastPostAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const invalidMathExpressions = [
        {
          // Missing required fields
          latex: 'x^2',
        },
      ];

      vi.mocked(forumRepository.getThreadById).mockResolvedValue(mockThread);

      const response = await request(app).post('/api/forum/posts').send({
        content: 'Math equation',
        threadId: 1,
        mathExpressions: invalidMathExpressions,
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        'error',
        'Math expression validation failed'
      );
      expect(response.body).toHaveProperty('code', 'MATH_VALIDATION_ERROR');
    });
  });

  describe('PUT /api/forum/posts/:id', () => {
    it('should allow owner to update post', async () => {
      const existingPost = {
        id: 1,
        threadId: 1,
        authorId: 1, // Same as authenticated user
        parentPostId: null,
        content: 'Original content',
        mathExpressions: [],
        isEdited: false,
        editedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockThread = {
        id: 1,
        title: 'Test Thread',
        categoryId: 1,
        authorId: 1,
        isPinned: false,
        isLocked: false,
        postCount: 1,
        lastPostAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedPost = {
        ...existingPost,
        content: 'Updated content',
        isEdited: true,
        editedAt: new Date(),
      };

      vi.mocked(forumRepository.getPostById)
        .mockResolvedValueOnce(existingPost)
        .mockResolvedValueOnce(updatedPost);
      vi.mocked(forumRepository.getThreadById).mockResolvedValue(mockThread);
      vi.mocked(forumRepository.updatePost).mockResolvedValue();

      const response = await request(app)
        .put('/api/forum/posts/1')
        .send({ content: 'Updated content' });

      expect(response.status).toBe(200);
      expect(forumRepository.updatePost).toHaveBeenCalledWith(1, {
        content: 'Updated content',
        mathExpressions: [],
        isEdited: true,
        editedAt: expect.any(Date),
      });
    });

    it('should prevent non-owners from updating posts', async () => {
      const existingPost = {
        id: 1,
        threadId: 1,
        authorId: 2, // Different from authenticated user (1)
        parentPostId: null,
        content: 'Original content',
        mathExpressions: [],
        isEdited: false,
        editedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(forumRepository.getPostById).mockResolvedValue(existingPost);

      const response = await request(app)
        .put('/api/forum/posts/1')
        .send({ content: 'Updated content' });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty(
        'error',
        'Insufficient permissions to edit post'
      );
      expect(response.body).toHaveProperty('code', 'INSUFFICIENT_PERMISSIONS');
    });

    it('should prevent editing posts in locked threads for regular users', async () => {
      const existingPost = {
        id: 1,
        threadId: 1,
        authorId: 1,
        parentPostId: null,
        content: 'Original content',
        mathExpressions: [],
        isEdited: false,
        editedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const lockedThread = {
        id: 1,
        title: 'Locked Thread',
        categoryId: 1,
        authorId: 1,
        isPinned: false,
        isLocked: true,
        postCount: 1,
        lastPostAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(forumRepository.getPostById).mockResolvedValue(existingPost);
      vi.mocked(forumRepository.getThreadById).mockResolvedValue(lockedThread);

      const response = await request(app)
        .put('/api/forum/posts/1')
        .send({ content: 'Updated content' });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty(
        'error',
        'Cannot edit post in locked thread'
      );
      expect(response.body).toHaveProperty('code', 'THREAD_LOCKED');
    });
  });

  describe('DELETE /api/forum/posts/:id', () => {
    it('should allow owner to delete post without replies', async () => {
      const post = {
        id: 1,
        threadId: 1,
        authorId: 1, // Same as authenticated user
        parentPostId: null,
        content: 'Post to delete',
        mathExpressions: [],
        isEdited: false,
        editedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(forumRepository.getPostById).mockResolvedValue(post);
      vi.mocked(forumRepository.getPostReplies).mockResolvedValue([]);
      vi.mocked(forumRepository.deletePost).mockResolvedValue();

      const response = await request(app).delete('/api/forum/posts/1');

      expect(response.status).toBe(204);
      expect(forumRepository.deletePost).toHaveBeenCalledWith(1);
    });

    it('should prevent non-owners from deleting posts', async () => {
      const post = {
        id: 1,
        threadId: 1,
        authorId: 2, // Different from authenticated user (1)
        parentPostId: null,
        content: 'Post to delete',
        mathExpressions: [],
        isEdited: false,
        editedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(forumRepository.getPostById).mockResolvedValue(post);

      const response = await request(app).delete('/api/forum/posts/1');

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty(
        'error',
        'Insufficient permissions to delete post'
      );
      expect(response.body).toHaveProperty('code', 'INSUFFICIENT_PERMISSIONS');
    });

    it('should prevent regular users from deleting posts with replies', async () => {
      const post = {
        id: 1,
        threadId: 1,
        authorId: 1,
        parentPostId: null,
        content: 'Post with replies',
        mathExpressions: [],
        isEdited: false,
        editedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const replies = [
        {
          id: 2,
          threadId: 1,
          authorId: 2,
          parentPostId: 1,
          content: 'Reply',
          mathExpressions: [],
          isEdited: false,
          editedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(forumRepository.getPostById).mockResolvedValue(post);
      vi.mocked(forumRepository.getPostReplies).mockResolvedValue(replies);

      const response = await request(app).delete('/api/forum/posts/1');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        'error',
        'Cannot delete post with replies. Only moderators can delete posts with replies.'
      );
      expect(response.body).toHaveProperty('code', 'POST_HAS_REPLIES');
    });
  });

  describe('GET /api/forum/posts/:id/replies', () => {
    it('should return post replies', async () => {
      const post = {
        id: 1,
        threadId: 1,
        authorId: 1,
        parentPostId: null,
        content: 'Original post',
        mathExpressions: [],
        isEdited: false,
        editedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const replies = [
        {
          id: 2,
          threadId: 1,
          authorId: 2,
          parentPostId: 1,
          content: 'First reply',
          mathExpressions: [],
          isEdited: false,
          editedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(forumRepository.getPostById).mockResolvedValue(post);
      vi.mocked(forumRepository.getPostReplies).mockResolvedValue(replies);

      const response = await request(app).get('/api/forum/posts/1/replies');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('post');
      expect(response.body).toHaveProperty('replies');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.replies).toHaveLength(1);
      expect(forumRepository.getPostReplies).toHaveBeenCalledWith(1, 20, 0);
    });

    it('should handle pagination parameters', async () => {
      const post = {
        id: 1,
        threadId: 1,
        authorId: 1,
        parentPostId: null,
        content: 'Original post',
        mathExpressions: [],
        isEdited: false,
        editedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(forumRepository.getPostById).mockResolvedValue(post);
      vi.mocked(forumRepository.getPostReplies).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/forum/posts/1/replies')
        .query({ page: '2', limit: '10' });

      expect(response.status).toBe(200);
      expect(forumRepository.getPostReplies).toHaveBeenCalledWith(1, 10, 10);
    });
  });
});
