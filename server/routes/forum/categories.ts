import { Router, Request, Response } from 'express';
import { forumRepository } from '../../database/forum-repository.js';
import {
  authenticateToken,
  optionalAuth,
  requirePermission,
  FORUM_PERMISSIONS,
  AuthenticatedRequest,
} from '../../middleware/auth.js';
import { ForumCategory } from '../../../shared/forum-types.js';

const router = Router();

// Validation helpers
const validateCategoryData = (data: any): string[] => {
  const errors: string[] = [];

  if (
    !data.name ||
    typeof data.name !== 'string' ||
    data.name.trim().length === 0
  ) {
    errors.push('Category name is required and must be a non-empty string');
  }

  if (data.name && data.name.length > 255) {
    errors.push('Category name must be 255 characters or less');
  }

  if (data.description && typeof data.description !== 'string') {
    errors.push('Category description must be a string');
  }

  if (data.parentId !== undefined && data.parentId !== null) {
    if (!Number.isInteger(data.parentId) || data.parentId <= 0) {
      errors.push('Parent ID must be a positive integer');
    }
  }

  if (data.sortOrder !== undefined) {
    if (!Number.isInteger(data.sortOrder)) {
      errors.push('Sort order must be an integer');
    }
  }

  return errors;
};

// GET /api/forum/categories - Get all categories with hierarchical structure
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const categories = await forumRepository.getCategories();

    // Build hierarchical structure
    const categoryMap = new Map<
      number,
      ForumCategory & { children: ForumCategory[] }
    >();
    const rootCategories: (ForumCategory & { children: ForumCategory[] })[] =
      [];

    // First pass: create map with children arrays
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // Second pass: build hierarchy
    categories.forEach(category => {
      const categoryWithChildren = categoryMap.get(category.id)!;

      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(categoryWithChildren);
        } else {
          // Parent not found, treat as root
          rootCategories.push(categoryWithChildren);
        }
      } else {
        rootCategories.push(categoryWithChildren);
      }
    });

    res.json({
      categories: rootCategories,
      total: categories.length,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      error: 'Failed to fetch categories',
      code: 'FETCH_CATEGORIES_ERROR',
    });
  }
});

// GET /api/forum/categories/:id - Get specific category
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const categoryId = parseInt(req.params.id, 10);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({
        error: 'Invalid category ID',
        code: 'INVALID_CATEGORY_ID',
      });
    }

    const category = await forumRepository.getCategoryById(categoryId);

    if (!category) {
      return res.status(404).json({
        error: 'Category not found',
        code: 'CATEGORY_NOT_FOUND',
      });
    }

    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      error: 'Failed to fetch category',
      code: 'FETCH_CATEGORY_ERROR',
    });
  }
});

// POST /api/forum/categories - Create new category (admin only)
router.post(
  '/',
  authenticateToken,
  requirePermission(FORUM_PERMISSIONS.MANAGE_CATEGORIES),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const validationErrors = validateCategoryData(req.body);

      if (validationErrors.length > 0) {
        return res.status(400).json({
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: validationErrors,
        });
      }

      const { name, description, parentId, sortOrder = 0 } = req.body;

      // Verify parent category exists if parentId is provided
      if (parentId) {
        const parentCategory = await forumRepository.getCategoryById(parentId);
        if (!parentCategory) {
          return res.status(400).json({
            error: 'Parent category not found',
            code: 'PARENT_CATEGORY_NOT_FOUND',
          });
        }
      }

      const categoryData: Omit<
        ForumCategory,
        'id' | 'createdAt' | 'updatedAt'
      > = {
        name: name.trim(),
        description: description?.trim() || undefined,
        parentId: parentId || undefined,
        sortOrder,
      };

      const categoryId = await forumRepository.createCategory(categoryData);
      const newCategory = await forumRepository.getCategoryById(categoryId);

      res.status(201).json(newCategory);
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({
        error: 'Failed to create category',
        code: 'CREATE_CATEGORY_ERROR',
      });
    }
  }
);

// PUT /api/forum/categories/:id - Update category (admin only)
router.put(
  '/:id',
  authenticateToken,
  requirePermission(FORUM_PERMISSIONS.MANAGE_CATEGORIES),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const categoryId = parseInt(req.params.id, 10);

      if (!Number.isInteger(categoryId) || categoryId <= 0) {
        return res.status(400).json({
          error: 'Invalid category ID',
          code: 'INVALID_CATEGORY_ID',
        });
      }

      const existingCategory =
        await forumRepository.getCategoryById(categoryId);
      if (!existingCategory) {
        return res.status(404).json({
          error: 'Category not found',
          code: 'CATEGORY_NOT_FOUND',
        });
      }

      const validationErrors = validateCategoryData(req.body);

      if (validationErrors.length > 0) {
        return res.status(400).json({
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: validationErrors,
        });
      }

      const { name, description, parentId, sortOrder } = req.body;

      // Prevent circular parent relationships
      if (parentId === categoryId) {
        return res.status(400).json({
          error: 'Category cannot be its own parent',
          code: 'CIRCULAR_PARENT_RELATIONSHIP',
        });
      }

      // Verify parent category exists if parentId is provided
      if (parentId && parentId !== existingCategory.parentId) {
        const parentCategory = await forumRepository.getCategoryById(parentId);
        if (!parentCategory) {
          return res.status(400).json({
            error: 'Parent category not found',
            code: 'PARENT_CATEGORY_NOT_FOUND',
          });
        }
      }

      await forumRepository.updateCategory(categoryId, {
        name: name?.trim() || existingCategory.name,
        description: description?.trim() || existingCategory.description,
        parentId: parentId !== undefined ? parentId : existingCategory.parentId,
        sortOrder:
          sortOrder !== undefined ? sortOrder : existingCategory.sortOrder,
      });

      const updatedCategory = await forumRepository.getCategoryById(categoryId);
      res.json(updatedCategory);
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({
        error: 'Failed to update category',
        code: 'UPDATE_CATEGORY_ERROR',
      });
    }
  }
);

// DELETE /api/forum/categories/:id - Delete category (admin only)
router.delete(
  '/:id',
  authenticateToken,
  requirePermission(FORUM_PERMISSIONS.MANAGE_CATEGORIES),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const categoryId = parseInt(req.params.id, 10);

      if (!Number.isInteger(categoryId) || categoryId <= 0) {
        return res.status(400).json({
          error: 'Invalid category ID',
          code: 'INVALID_CATEGORY_ID',
        });
      }

      const category = await forumRepository.getCategoryById(categoryId);
      if (!category) {
        return res.status(404).json({
          error: 'Category not found',
          code: 'CATEGORY_NOT_FOUND',
        });
      }

      // Check if category has child categories
      const allCategories = await forumRepository.getCategories();
      const hasChildren = allCategories.some(
        cat => cat.parentId === categoryId
      );

      if (hasChildren) {
        return res.status(400).json({
          error: 'Cannot delete category with child categories',
          code: 'CATEGORY_HAS_CHILDREN',
        });
      }

      // Check if category has threads
      const threads = await forumRepository.getThreadsByCategory(
        categoryId,
        1,
        0
      );
      if (threads.length > 0) {
        return res.status(400).json({
          error: 'Cannot delete category with existing threads',
          code: 'CATEGORY_HAS_THREADS',
        });
      }

      await forumRepository.deleteCategory(categoryId);

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({
        error: 'Failed to delete category',
        code: 'DELETE_CATEGORY_ERROR',
      });
    }
  }
);

// GET /api/forum/categories/:id/threads - Get threads in category
router.get(
  '/:id/threads',
  optionalAuth,
  async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.id, 10);
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = Math.min(
        parseInt(req.query.limit as string, 10) || 20,
        100
      );
      const offset = (page - 1) * limit;

      if (!Number.isInteger(categoryId) || categoryId <= 0) {
        return res.status(400).json({
          error: 'Invalid category ID',
          code: 'INVALID_CATEGORY_ID',
        });
      }

      // Verify category exists
      const category = await forumRepository.getCategoryById(categoryId);
      if (!category) {
        return res.status(404).json({
          error: 'Category not found',
          code: 'CATEGORY_NOT_FOUND',
        });
      }

      const threads = await forumRepository.getThreadsByCategory(
        categoryId,
        limit,
        offset
      );

      res.json({
        threads,
        category,
        pagination: {
          page,
          limit,
          hasMore: threads.length === limit,
        },
      });
    } catch (error) {
      console.error('Error fetching category threads:', error);
      res.status(500).json({
        error: 'Failed to fetch category threads',
        code: 'FETCH_CATEGORY_THREADS_ERROR',
      });
    }
  }
);

export default router;
