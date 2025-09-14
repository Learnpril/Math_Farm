import { Router, Request, Response } from 'express';
import { forumRepository } from '../../database/forum-repository.js';
import {
  authenticateToken,
  optionalAuth,
  requirePermission,
  requireOwnership,
  FORUM_PERMISSIONS,
  AuthenticatedRequest,
} from '../../middleware/auth.js';
import { ForumThread } from '../../../shared/forum-types.js';

const router = Router();

// Validation helpers
const validateThreadData = (data: any): string[] => {
  const errors: string[] = [];

  if (
    !data.title ||
    typeof data.title !== 'string' ||
    data.title.trim().length === 0
  ) {
    errors.push('Thread title is required and must be a non-empty string');
  }

  if (data.title && data.title.length > 500) {
    errors.push('Thread title must be 500 characters or less');
  }

  if (
    !data.categoryId ||
    !Number.isInteger(data.categoryId) ||
    data.categoryId <= 0
  ) {
    errors.push('Valid category ID is required');
  }

  if (data.isPinned !== undefined && typeof data.isPinned !== 'boolean') {
    errors.push('isPinned must be a boolean');
  }

  if (data.isLocked !== undefined && typeof data.isLocked !== 'boolean') {
    errors.push('isLocked must be a boolean');
  }

  return errors;
};

// Helper to get thread owner ID for ownership checks
const getThreadOwnerId = async (
  req: AuthenticatedRequest
): Promise<number | null> => {
  const threadId = parseInt(req.params.id, 10);
  if (!Number.isInteger(threadId) || threadId <= 0) {
    return null;
  }

  const thread = await forumRepository.getThreadById(threadId);
  return thread ? thread.authorId : null;
};

// GET /api/forum/threads/:id - Get specific thread with posts
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const threadId = parseInt(req.params.id, 10);
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 50, 100);
    const offset = (page - 1) * limit;

    if (!Number.isInteger(threadId) || threadId <= 0) {
      return res.status(400).json({
        error: 'Invalid thread ID',
        code: 'INVALID_THREAD_ID',
      });
    }

    const thread = await forumRepository.getThreadById(threadId);
    if (!thread) {
      return res.status(404).json({
        error: 'Thread not found',
        code: 'THREAD_NOT_FOUND',
      });
    }

    const posts = await forumRepository.getPostsByThread(
      threadId,
      limit,
      offset
    );
    const category = await forumRepository.getCategoryById(thread.categoryId);

    res.json({
      thread,
      category,
      posts,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit,
      },
    });
  } catch (error) {
    console.error('Error fetching thread:', error);
    res.status(500).json({
      error: 'Failed to fetch thread',
      code: 'FETCH_THREAD_ERROR',
    });
  }
});

// POST /api/forum/threads - Create new thread
router.post(
  '/',
  authenticateToken,
  requirePermission(FORUM_PERMISSIONS.CREATE_THREADS),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const validationErrors = validateThreadData(req.body);

      if (validationErrors.length > 0) {
        return res.status(400).json({
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: validationErrors,
        });
      }

      const {
        title,
        categoryId,
        isPinned = false,
        isLocked = false,
      } = req.body;

      // Verify category exists
      const category = await forumRepository.getCategoryById(categoryId);
      if (!category) {
        return res.status(400).json({
          error: 'Category not found',
          code: 'CATEGORY_NOT_FOUND',
        });
      }

      // Only moderators and admins can create pinned or locked threads
      if ((isPinned || isLocked) && !req.user) {
        return res.status(403).json({
          error: 'Insufficient permissions to create pinned or locked threads',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      if (
        (isPinned || isLocked) &&
        req.user.role !== 'moderator' &&
        req.user.role !== 'admin'
      ) {
        return res.status(403).json({
          error:
            'Only moderators and admins can create pinned or locked threads',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      const threadData: Omit<
        ForumThread,
        'id' | 'postCount' | 'lastPostAt' | 'createdAt' | 'updatedAt'
      > = {
        title: title.trim(),
        categoryId,
        authorId: req.user!.userId,
        isPinned,
        isLocked,
      };

      const threadId = await forumRepository.createThread(threadData);
      const newThread = await forumRepository.getThreadById(threadId);

      res.status(201).json(newThread);
    } catch (error) {
      console.error('Error creating thread:', error);
      res.status(500).json({
        error: 'Failed to create thread',
        code: 'CREATE_THREAD_ERROR',
      });
    }
  }
);

// PUT /api/forum/threads/:id - Update thread (owner or moderator)
router.put(
  '/:id',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const threadId = parseInt(req.params.id, 10);

      if (!Number.isInteger(threadId) || threadId <= 0) {
        return res.status(400).json({
          error: 'Invalid thread ID',
          code: 'INVALID_THREAD_ID',
        });
      }

      const existingThread = await forumRepository.getThreadById(threadId);
      if (!existingThread) {
        return res.status(404).json({
          error: 'Thread not found',
          code: 'THREAD_NOT_FOUND',
        });
      }

      // Check permissions - owner can edit title, moderators can edit all
      const isOwner = existingThread.authorId === req.user!.userId;
      const isModerator =
        req.user!.role === 'moderator' || req.user!.role === 'admin';

      if (!isOwner && !isModerator) {
        return res.status(403).json({
          error: 'Insufficient permissions to edit thread',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      const { title, isPinned, isLocked } = req.body;

      // Validate title if provided
      if (title !== undefined) {
        if (!title || typeof title !== 'string' || title.trim().length === 0) {
          return res.status(400).json({
            error: 'Thread title must be a non-empty string',
            code: 'VALIDATION_ERROR',
          });
        }
        if (title.length > 500) {
          return res.status(400).json({
            error: 'Thread title must be 500 characters or less',
            code: 'VALIDATION_ERROR',
          });
        }
      }

      // Only moderators can change pinned/locked status
      if ((isPinned !== undefined || isLocked !== undefined) && !isModerator) {
        return res.status(403).json({
          error: 'Only moderators can change thread pinned/locked status',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      const updates: Partial<
        Omit<ForumThread, 'id' | 'createdAt' | 'updatedAt'>
      > = {};

      if (title !== undefined) {
        updates.title = title.trim();
      }
      if (isPinned !== undefined && isModerator) {
        updates.isPinned = isPinned;
      }
      if (isLocked !== undefined && isModerator) {
        updates.isLocked = isLocked;
      }

      await forumRepository.updateThread(threadId, updates);
      const updatedThread = await forumRepository.getThreadById(threadId);

      res.json(updatedThread);
    } catch (error) {
      console.error('Error updating thread:', error);
      res.status(500).json({
        error: 'Failed to update thread',
        code: 'UPDATE_THREAD_ERROR',
      });
    }
  }
);

// DELETE /api/forum/threads/:id - Delete thread (owner or moderator)
router.delete(
  '/:id',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const threadId = parseInt(req.params.id, 10);

      if (!Number.isInteger(threadId) || threadId <= 0) {
        return res.status(400).json({
          error: 'Invalid thread ID',
          code: 'INVALID_THREAD_ID',
        });
      }

      const thread = await forumRepository.getThreadById(threadId);
      if (!thread) {
        return res.status(404).json({
          error: 'Thread not found',
          code: 'THREAD_NOT_FOUND',
        });
      }

      // Check permissions - owner or moderator can delete
      const isOwner = thread.authorId === req.user!.userId;
      const isModerator =
        req.user!.role === 'moderator' || req.user!.role === 'admin';

      if (!isOwner && !isModerator) {
        return res.status(403).json({
          error: 'Insufficient permissions to delete thread',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      await forumRepository.deleteThread(threadId);

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting thread:', error);
      res.status(500).json({
        error: 'Failed to delete thread',
        code: 'DELETE_THREAD_ERROR',
      });
    }
  }
);

// POST /api/forum/threads/:id/pin - Pin/unpin thread (moderator only)
router.post(
  '/:id/pin',
  authenticateToken,
  requirePermission(FORUM_PERMISSIONS.PIN_THREADS),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const threadId = parseInt(req.params.id, 10);
      const { pinned } = req.body;

      if (!Number.isInteger(threadId) || threadId <= 0) {
        return res.status(400).json({
          error: 'Invalid thread ID',
          code: 'INVALID_THREAD_ID',
        });
      }

      if (typeof pinned !== 'boolean') {
        return res.status(400).json({
          error: 'Pinned status must be a boolean',
          code: 'VALIDATION_ERROR',
        });
      }

      const thread = await forumRepository.getThreadById(threadId);
      if (!thread) {
        return res.status(404).json({
          error: 'Thread not found',
          code: 'THREAD_NOT_FOUND',
        });
      }

      await forumRepository.updateThread(threadId, { isPinned: pinned });
      const updatedThread = await forumRepository.getThreadById(threadId);

      res.json(updatedThread);
    } catch (error) {
      console.error('Error updating thread pin status:', error);
      res.status(500).json({
        error: 'Failed to update thread pin status',
        code: 'UPDATE_THREAD_PIN_ERROR',
      });
    }
  }
);

// POST /api/forum/threads/:id/lock - Lock/unlock thread (moderator only)
router.post(
  '/:id/lock',
  authenticateToken,
  requirePermission(FORUM_PERMISSIONS.LOCK_THREADS),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const threadId = parseInt(req.params.id, 10);
      const { locked } = req.body;

      if (!Number.isInteger(threadId) || threadId <= 0) {
        return res.status(400).json({
          error: 'Invalid thread ID',
          code: 'INVALID_THREAD_ID',
        });
      }

      if (typeof locked !== 'boolean') {
        return res.status(400).json({
          error: 'Locked status must be a boolean',
          code: 'VALIDATION_ERROR',
        });
      }

      const thread = await forumRepository.getThreadById(threadId);
      if (!thread) {
        return res.status(404).json({
          error: 'Thread not found',
          code: 'THREAD_NOT_FOUND',
        });
      }

      await forumRepository.updateThread(threadId, { isLocked: locked });
      const updatedThread = await forumRepository.getThreadById(threadId);

      res.json(updatedThread);
    } catch (error) {
      console.error('Error updating thread lock status:', error);
      res.status(500).json({
        error: 'Failed to update thread lock status',
        code: 'UPDATE_THREAD_LOCK_ERROR',
      });
    }
  }
);

export default router;
