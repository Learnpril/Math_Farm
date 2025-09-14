import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import categoriesRouter from '../categories.js';
import { forumRepository } from '../../../database/forum-repository.js';
import { generateJWT } from '../../../middleware/auth.js';

// Mock the forum repository
vi.mock('../../../database/forum-repository.js', () => ({
  forumRepository: {
    getCategories: vi.fn(),
    getCategoryById: vi.fn(),
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    deleteCategory: vi.fn(),
    getThreadsByCategory: vi.fn(),
  },
}));

// Mock auth middleware
vi.mock('../../../middleware/auth.js', async importOriginal => {
  const actual =
    await importOriginal<typeof import('../../../middleware/auth.js')>();
  return {
    ...actual,
    generateJWT: vi.fn(),
    optionalAuth: vi.fn((req, res, next) => next()),
    authenticateToken: vi.fn((req, res, next) => {
      req.user = { userId: 1, username: 'testuser', role: 'admin' };
      next();
    }),
    requirePermission: vi.fn(() => (req, res, next) => next()),
  };
});

const app = express();
app.use(express.json());
app.use('/api/forum/categories', categoriesRouter);

describe('Categories API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/forum/categories', () => {
    it('should return hierarchical categories', async () => {
      const mockCategories = [
        {
          id: 1,
          name: 'Math Discussions',
          description: 'General math discussions',
          parentId: null,
          sortOrder: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Algebra',
          description: 'Algebra discussions',
          parentId: 1,
          sortOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(forumRepository.getCategories).mockResolvedValue(
        mockCategories
      );

      const response = await request(app).get('/api/forum/categories');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('categories');
      expect(response.body).toHaveProperty('total', 2);
      expect(response.body.categories).toHaveLength(1); // Only root categories
      expect(response.body.categories[0]).toHaveProperty('children');
      expect(response.body.categories[0].children).toHaveLength(1);
    });

    it('should handle empty categories', async () => {
      vi.mocked(forumRepository.getCategories).mockResolvedValue([]);

      const response = await request(app).get('/api/forum/categories');

      expect(response.status).toBe(200);
      expect(response.body.categories).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });

    it('should handle database errors', async () => {
      vi.mocked(forumRepository.getCategories).mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app).get('/api/forum/categories');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty(
        'error',
        'Failed to fetch categories'
      );
      expect(response.body).toHaveProperty('code', 'FETCH_CATEGORIES_ERROR');
    });
  });

  describe('GET /api/forum/categories/:id', () => {
    it('should return specific category', async () => {
      const mockCategory = {
        id: 1,
        name: 'Math Discussions',
        description: 'General math discussions',
        parentId: null,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(forumRepository.getCategoryById).mockResolvedValue(
        mockCategory
      );

      const response = await request(app).get('/api/forum/categories/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockCategory,
        createdAt: mockCategory.createdAt.toISOString(),
        updatedAt: mockCategory.updatedAt.toISOString(),
      });
      expect(forumRepository.getCategoryById).toHaveBeenCalledWith(1);
    });

    it('should return 404 for non-existent category', async () => {
      vi.mocked(forumRepository.getCategoryById).mockResolvedValue(null);

      const response = await request(app).get('/api/forum/categories/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Category not found');
      expect(response.body).toHaveProperty('code', 'CATEGORY_NOT_FOUND');
    });

    it('should return 400 for invalid category ID', async () => {
      const response = await request(app).get('/api/forum/categories/invalid');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid category ID');
      expect(response.body).toHaveProperty('code', 'INVALID_CATEGORY_ID');
    });
  });

  describe('POST /api/forum/categories', () => {
    it('should create new category', async () => {
      const newCategoryData = {
        name: 'New Category',
        description: 'A new category',
        sortOrder: 1,
      };

      const createdCategory = {
        id: 1,
        ...newCategoryData,
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(forumRepository.createCategory).mockResolvedValue(1);
      vi.mocked(forumRepository.getCategoryById).mockResolvedValue(
        createdCategory
      );

      const response = await request(app)
        .post('/api/forum/categories')
        .send(newCategoryData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        ...createdCategory,
        createdAt: createdCategory.createdAt.toISOString(),
        updatedAt: createdCategory.updatedAt.toISOString(),
      });
      expect(forumRepository.createCategory).toHaveBeenCalledWith({
        name: 'New Category',
        description: 'A new category',
        parentId: undefined,
        sortOrder: 1,
      });
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/forum/categories')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.details).toContain(
        'Category name is required and must be a non-empty string'
      );
    });

    it('should validate parent category exists', async () => {
      vi.mocked(forumRepository.getCategoryById).mockResolvedValue(null);

      const response = await request(app).post('/api/forum/categories').send({
        name: 'Child Category',
        parentId: 999,
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        'error',
        'Parent category not found'
      );
      expect(response.body).toHaveProperty('code', 'PARENT_CATEGORY_NOT_FOUND');
    });
  });

  describe('PUT /api/forum/categories/:id', () => {
    it('should update existing category', async () => {
      const existingCategory = {
        id: 1,
        name: 'Old Name',
        description: 'Old description',
        parentId: null,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedCategory = {
        ...existingCategory,
        name: 'New Name',
        description: 'New description',
      };

      vi.mocked(forumRepository.getCategoryById)
        .mockResolvedValueOnce(existingCategory)
        .mockResolvedValueOnce(updatedCategory);
      vi.mocked(forumRepository.updateCategory).mockResolvedValue();

      const response = await request(app).put('/api/forum/categories/1').send({
        name: 'New Name',
        description: 'New description',
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...updatedCategory,
        createdAt: updatedCategory.createdAt.toISOString(),
        updatedAt: updatedCategory.updatedAt.toISOString(),
      });
      expect(forumRepository.updateCategory).toHaveBeenCalledWith(1, {
        name: 'New Name',
        description: 'New description',
        parentId: null,
        sortOrder: 0,
      });
    });

    it('should prevent circular parent relationships', async () => {
      const existingCategory = {
        id: 1,
        name: 'Category',
        description: 'Description',
        parentId: null,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(forumRepository.getCategoryById).mockResolvedValue(
        existingCategory
      );

      const response = await request(app).put('/api/forum/categories/1').send({
        name: 'Category',
        parentId: 1, // Self as parent
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        'error',
        'Category cannot be its own parent'
      );
      expect(response.body).toHaveProperty(
        'code',
        'CIRCULAR_PARENT_RELATIONSHIP'
      );
    });
  });

  describe('DELETE /api/forum/categories/:id', () => {
    it('should delete category without children or threads', async () => {
      const category = {
        id: 1,
        name: 'Category',
        description: 'Description',
        parentId: null,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(forumRepository.getCategoryById).mockResolvedValue(category);
      vi.mocked(forumRepository.getCategories).mockResolvedValue([]);
      vi.mocked(forumRepository.getThreadsByCategory).mockResolvedValue([]);
      vi.mocked(forumRepository.deleteCategory).mockResolvedValue();

      const response = await request(app).delete('/api/forum/categories/1');

      expect(response.status).toBe(204);
      expect(forumRepository.deleteCategory).toHaveBeenCalledWith(1);
    });

    it('should prevent deletion of category with children', async () => {
      const category = {
        id: 1,
        name: 'Parent Category',
        description: 'Description',
        parentId: null,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const childCategory = {
        id: 2,
        name: 'Child Category',
        description: 'Description',
        parentId: 1,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(forumRepository.getCategoryById).mockResolvedValue(category);
      vi.mocked(forumRepository.getCategories).mockResolvedValue([
        category,
        childCategory,
      ]);

      const response = await request(app).delete('/api/forum/categories/1');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        'error',
        'Cannot delete category with child categories'
      );
      expect(response.body).toHaveProperty('code', 'CATEGORY_HAS_CHILDREN');
    });

    it('should prevent deletion of category with threads', async () => {
      const category = {
        id: 1,
        name: 'Category',
        description: 'Description',
        parentId: null,
        sortOrder: 0,
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
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(forumRepository.getCategoryById).mockResolvedValue(category);
      vi.mocked(forumRepository.getCategories).mockResolvedValue([category]);
      vi.mocked(forumRepository.getThreadsByCategory).mockResolvedValue([
        mockThread,
      ]);

      const response = await request(app).delete('/api/forum/categories/1');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        'error',
        'Cannot delete category with existing threads'
      );
      expect(response.body).toHaveProperty('code', 'CATEGORY_HAS_THREADS');
    });
  });

  describe('GET /api/forum/categories/:id/threads', () => {
    it('should return threads in category', async () => {
      const category = {
        id: 1,
        name: 'Category',
        description: 'Description',
        parentId: null,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockThreads = [
        {
          id: 1,
          title: 'Test Thread',
          categoryId: 1,
          authorId: 1,
          isPinned: false,
          isLocked: false,
          postCount: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(forumRepository.getCategoryById).mockResolvedValue(category);
      vi.mocked(forumRepository.getThreadsByCategory).mockResolvedValue(
        mockThreads
      );

      const response = await request(app).get(
        '/api/forum/categories/1/threads'
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('threads');
      expect(response.body.threads).toHaveLength(1);
      expect(response.body.threads[0]).toEqual({
        ...mockThreads[0],
        createdAt: mockThreads[0].createdAt.toISOString(),
        updatedAt: mockThreads[0].updatedAt.toISOString(),
      });
      expect(response.body).toHaveProperty('category');
      expect(response.body.category).toEqual({
        ...category,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      });
      expect(response.body).toHaveProperty('pagination');
      expect(forumRepository.getThreadsByCategory).toHaveBeenCalledWith(
        1,
        20,
        0
      );
    });

    it('should handle pagination parameters', async () => {
      const category = {
        id: 1,
        name: 'Category',
        description: 'Description',
        parentId: null,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(forumRepository.getCategoryById).mockResolvedValue(category);
      vi.mocked(forumRepository.getThreadsByCategory).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/forum/categories/1/threads')
        .query({ page: '2', limit: '10' });

      expect(response.status).toBe(200);
      expect(forumRepository.getThreadsByCategory).toHaveBeenCalledWith(
        1,
        10,
        10
      );
    });
  });
});
