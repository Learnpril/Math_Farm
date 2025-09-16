import { Router, Request, Response } from 'express';
import DOMPurify from 'isomorphic-dompurify';
import { optimizedForumRepository as forumRepository } from '../../database/optimized-forum-repository.js';
import {
  authenticateToken,
  optionalAuth,
  requirePermission,
  FORUM_PERMISSIONS,
  AuthenticatedRequest,
} from '../../middleware/auth.js';
import { ForumPost, MathExpression } from '../../../shared/forum-types.js';
import {
  broadcastNewPost,
  broadcastPostEdit,
  broadcastPostDelete,
} from '../../websocket/websocket-manager.js';
import { notificationService } from '../../services/notification-service.js';

const router = Router();

// Content sanitization configuration
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    'p',
    'br',
    'strong',
    'em',
    'u',
    'code',
    'pre',
    'blockquote',
    'ul',
    'ol',
    'li',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'a',
    'img',
  ],
  ALLOWED_ATTR: {
    a: ['href', 'title'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    '*': ['class'],
  },
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
  FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover'],
};

// Validation helpers
const validatePostData = (data: any): string[] => {
  const errors: string[] = [];

  if (
    !data.content ||
    typeof data.content !== 'string' ||
    data.content.trim().length === 0
  ) {
    errors.push('Post content is required and must be a non-empty string');
  }

  if (data.content && data.content.length > 50000) {
    errors.push('Post content must be 50,000 characters or less');
  }

  if (
    !data.threadId ||
    !Number.isInteger(data.threadId) ||
    data.threadId <= 0
  ) {
    errors.push('Valid thread ID is required');
  }

  if (data.parentPostId !== undefined && data.parentPostId !== null) {
    if (!Number.isInteger(data.parentPostId) || data.parentPostId <= 0) {
      errors.push('Parent post ID must be a positive integer');
    }
  }

  if (data.mathExpressions && !Array.isArray(data.mathExpressions)) {
    errors.push('Math expressions must be an array');
  }

  return errors;
};

// Sanitize post content
const sanitizeContent = (content: string): string => {
  return DOMPurify.sanitize(content, SANITIZE_CONFIG);
};

// Validate MathJax expressions
const validateMathExpressions = (expressions: MathExpression[]): string[] => {
  const errors: string[] = [];

  expressions.forEach((expr, index) => {
    if (!expr.id || typeof expr.id !== 'string') {
      errors.push(
        `Math expression ${index}: ID is required and must be a string`
      );
    }
    if (!expr.latex || typeof expr.latex !== 'string') {
      errors.push(
        `Math expression ${index}: LaTeX is required and must be a string`
      );
    }
    if (
      !expr.position ||
      typeof expr.position.start !== 'number' ||
      typeof expr.position.end !== 'number'
    ) {
      errors.push(
        `Math expression ${index}: Position with start and end numbers is required`
      );
    }
    if (expr.position && expr.position.start >= expr.position.end) {
      errors.push(
        `Math expression ${index}: Position start must be less than end`
      );
    }
  });

  return errors;
};

// Process MathJax expressions in content
const processMathExpressions = (
  content: string,
  expressions: MathExpression[]
): MathExpression[] => {
  // Validate expressions against content
  const validExpressions = expressions.filter(expr => {
    const { start, end } = expr.position;
    return start >= 0 && end <= content.length && start < end;
  });

  // Sort by position for consistent processing
  return validExpressions.sort((a, b) => a.position.start - b.position.start);
};

// GET /api/forum/posts/:id - Get specific post
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id, 10);

    if (!Number.isInteger(postId) || postId <= 0) {
      return res.status(400).json({
        error: 'Invalid post ID',
        code: 'INVALID_POST_ID',
      });
    }

    const post = await forumRepository.getPostById(postId);
    if (!post) {
      return res.status(404).json({
        error: 'Post not found',
        code: 'POST_NOT_FOUND',
      });
    }

    // Get thread and category info
    const thread = await forumRepository.getThreadById(post.threadId);
    const category = thread
      ? await forumRepository.getCategoryById(thread.categoryId)
      : null;

    res.json({
      post,
      thread,
      category,
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({
      error: 'Failed to fetch post',
      code: 'FETCH_POST_ERROR',
    });
  }
});

// POST /api/forum/posts - Create new post
router.post(
  '/',
  authenticateToken,
  requirePermission(FORUM_PERMISSIONS.CREATE_POSTS),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const validationErrors = validatePostData(req.body);

      if (validationErrors.length > 0) {
        return res.status(400).json({
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: validationErrors,
        });
      }

      const {
        content,
        threadId,
        parentPostId,
        mathExpressions = [],
      } = req.body;

      // Verify thread exists and is not locked
      const thread = await forumRepository.getThreadById(threadId);
      if (!thread) {
        return res.status(400).json({
          error: 'Thread not found',
          code: 'THREAD_NOT_FOUND',
        });
      }

      if (
        thread.isLocked &&
        req.user!.role !== 'moderator' &&
        req.user!.role !== 'admin'
      ) {
        return res.status(403).json({
          error: 'Cannot post in locked thread',
          code: 'THREAD_LOCKED',
        });
      }

      // Verify parent post exists if specified
      if (parentPostId) {
        const parentPost = await forumRepository.getPostById(parentPostId);
        if (!parentPost || parentPost.threadId !== threadId) {
          return res.status(400).json({
            error: 'Parent post not found or not in the same thread',
            code: 'INVALID_PARENT_POST',
          });
        }
      }

      // Validate math expressions
      if (mathExpressions.length > 0) {
        const mathErrors = validateMathExpressions(mathExpressions);
        if (mathErrors.length > 0) {
          return res.status(400).json({
            error: 'Math expression validation failed',
            code: 'MATH_VALIDATION_ERROR',
            details: mathErrors,
          });
        }
      }

      // Sanitize content
      const sanitizedContent = sanitizeContent(content);

      // Process math expressions
      const processedMathExpressions = processMathExpressions(
        sanitizedContent,
        mathExpressions
      );

      const postData: Omit<
        ForumPost,
        'id' | 'isEdited' | 'editedAt' | 'createdAt' | 'updatedAt'
      > = {
        threadId,
        authorId: req.user!.userId,
        parentPostId: parentPostId || undefined,
        content: sanitizedContent,
        mathExpressions: processedMathExpressions,
      };

      const postId = await forumRepository.createPost(postData);
      const newPost = await forumRepository.getPostById(postId);

      // Broadcast new post to WebSocket subscribers
      broadcastNewPost(threadId.toString(), newPost);

      // Create notifications
      if (parentPostId) {
        // Reply notification
        await notificationService.createReplyNotification(
          parentPostId,
          req.user!.userId
        );
      }

      // Thread reply notifications for subscribers
      await notificationService.createThreadReplyNotification(
        threadId,
        req.user!.userId
      );

      // Auto-subscribe user to thread
      await notificationService.autoSubscribeToThread(
        req.user!.userId,
        threadId
      );

      // Extract and create mention notifications
      const mentions = notificationService.extractMentions(sanitizedContent);
      if (mentions.length > 0) {
        // In a real app, you'd resolve usernames to user IDs
        // For now, we'll skip this part
        console.log('Mentions found:', mentions);
      }

      res.status(201).json(newPost);
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({
        error: 'Failed to create post',
        code: 'CREATE_POST_ERROR',
      });
    }
  }
);

// PUT /api/forum/posts/:id - Update post (owner or moderator)
router.put(
  '/:id',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const postId = parseInt(req.params.id, 10);

      if (!Number.isInteger(postId) || postId <= 0) {
        return res.status(400).json({
          error: 'Invalid post ID',
          code: 'INVALID_POST_ID',
        });
      }

      const existingPost = await forumRepository.getPostById(postId);
      if (!existingPost) {
        return res.status(404).json({
          error: 'Post not found',
          code: 'POST_NOT_FOUND',
        });
      }

      // Check permissions - owner can edit own posts, moderators can edit any
      const isOwner = existingPost.authorId === req.user!.userId;
      const isModerator =
        req.user!.role === 'moderator' || req.user!.role === 'admin';

      if (!isOwner && !isModerator) {
        return res.status(403).json({
          error: 'Insufficient permissions to edit post',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      // Check if thread is locked (only moderators can edit in locked threads)
      const thread = await forumRepository.getThreadById(existingPost.threadId);
      if (thread?.isLocked && !isModerator) {
        return res.status(403).json({
          error: 'Cannot edit post in locked thread',
          code: 'THREAD_LOCKED',
        });
      }

      const { content, mathExpressions = [] } = req.body;

      if (
        !content ||
        typeof content !== 'string' ||
        content.trim().length === 0
      ) {
        return res.status(400).json({
          error: 'Post content is required and must be a non-empty string',
          code: 'VALIDATION_ERROR',
        });
      }

      if (content.length > 50000) {
        return res.status(400).json({
          error: 'Post content must be 50,000 characters or less',
          code: 'VALIDATION_ERROR',
        });
      }

      // Validate math expressions
      if (mathExpressions.length > 0) {
        const mathErrors = validateMathExpressions(mathExpressions);
        if (mathErrors.length > 0) {
          return res.status(400).json({
            error: 'Math expression validation failed',
            code: 'MATH_VALIDATION_ERROR',
            details: mathErrors,
          });
        }
      }

      // Sanitize content
      const sanitizedContent = sanitizeContent(content);

      // Process math expressions
      const processedMathExpressions = processMathExpressions(
        sanitizedContent,
        mathExpressions
      );

      await forumRepository.updatePost(postId, {
        content: sanitizedContent,
        mathExpressions: processedMathExpressions,
        isEdited: true,
        editedAt: new Date(),
      });

      const updatedPost = await forumRepository.getPostById(postId);

      // Broadcast post edit to WebSocket subscribers
      broadcastPostEdit(existingPost.threadId.toString(), updatedPost);

      res.json(updatedPost);
    } catch (error) {
      console.error('Error updating post:', error);
      res.status(500).json({
        error: 'Failed to update post',
        code: 'UPDATE_POST_ERROR',
      });
    }
  }
);

// DELETE /api/forum/posts/:id - Delete post (owner or moderator)
router.delete(
  '/:id',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const postId = parseInt(req.params.id, 10);

      if (!Number.isInteger(postId) || postId <= 0) {
        return res.status(400).json({
          error: 'Invalid post ID',
          code: 'INVALID_POST_ID',
        });
      }

      const post = await forumRepository.getPostById(postId);
      if (!post) {
        return res.status(404).json({
          error: 'Post not found',
          code: 'POST_NOT_FOUND',
        });
      }

      // Check permissions - owner can delete own posts, moderators can delete any
      const isOwner = post.authorId === req.user!.userId;
      const isModerator =
        req.user!.role === 'moderator' || req.user!.role === 'admin';

      if (!isOwner && !isModerator) {
        return res.status(403).json({
          error: 'Insufficient permissions to delete post',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      // Check if post has replies
      const replies = await forumRepository.getPostReplies(postId);
      if (replies.length > 0 && !isModerator) {
        return res.status(400).json({
          error:
            'Cannot delete post with replies. Only moderators can delete posts with replies.',
          code: 'POST_HAS_REPLIES',
        });
      }

      await forumRepository.deletePost(postId);

      // Broadcast post deletion to WebSocket subscribers
      broadcastPostDelete(post.threadId.toString(), postId);

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting post:', error);
      res.status(500).json({
        error: 'Failed to delete post',
        code: 'DELETE_POST_ERROR',
      });
    }
  }
);

// GET /api/forum/posts/:id/replies - Get replies to a post
router.get(
  '/:id/replies',
  optionalAuth,
  async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.id, 10);
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = Math.min(
        parseInt(req.query.limit as string, 10) || 20,
        100
      );
      const offset = (page - 1) * limit;

      if (!Number.isInteger(postId) || postId <= 0) {
        return res.status(400).json({
          error: 'Invalid post ID',
          code: 'INVALID_POST_ID',
        });
      }

      const post = await forumRepository.getPostById(postId);
      if (!post) {
        return res.status(404).json({
          error: 'Post not found',
          code: 'POST_NOT_FOUND',
        });
      }

      const replies = await forumRepository.getPostReplies(
        postId,
        limit,
        offset
      );

      res.json({
        post,
        replies,
        pagination: {
          page,
          limit,
          hasMore: replies.length === limit,
        },
      });
    } catch (error) {
      console.error('Error fetching post replies:', error);
      res.status(500).json({
        error: 'Failed to fetch post replies',
        code: 'FETCH_POST_REPLIES_ERROR',
      });
    }
  }
);

export default router;
