import { Router, Request, Response } from 'express';
import { authenticateToken, requirePermission } from '../../middleware/auth';
import { FORUM_PERMISSIONS } from '../../middleware/auth';
import { UserManagementService } from '../../services/user-management-service';
import { body, param, query, validationResult } from 'express-validator';
import { rateLimit } from 'express-rate-limit';

const router = Router();
const userManagementService = new UserManagementService();

// Rate limiting for user management actions
const userManagementRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each user to 30 user management actions per windowMs
  message: 'Too many user management actions, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation middleware
const validateBanUser = [
  body('userId')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
  body('reason')
    .isLength({ min: 5, max: 500 })
    .withMessage('Reason must be between 5 and 500 characters'),
  body('duration')
    .optional()
    .isInt({ min: 1, max: 8760 })
    .withMessage('Duration must be between 1 and 8760 hours'),
];

const validateRestrictUser = [
  body('userId')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
  body('type')
    .isIn(['post_limit', 'thread_limit', 'no_images', 'no_links', 'shadow_ban'])
    .withMessage('Invalid restriction type'),
  body('reason')
    .isLength({ min: 5, max: 500 })
    .withMessage('Reason must be between 5 and 500 characters'),
  body('duration')
    .optional()
    .isInt({ min: 1, max: 8760 })
    .withMessage('Duration must be between 1 and 8760 hours'),
];

const validateWarnUser = [
  body('userId')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
  body('reason')
    .isLength({ min: 5, max: 500 })
    .withMessage('Reason must be between 5 and 500 characters'),
  body('severity')
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid severity level'),
];

const validateAppeal = [
  body('actionType')
    .isIn(['ban', 'restriction', 'warning'])
    .withMessage('Invalid action type'),
  body('actionId')
    .isInt({ min: 1 })
    .withMessage('Action ID must be a positive integer'),
  body('reason')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Appeal reason must be between 10 and 1000 characters'),
];

/**
 * POST /api/forum/user-management/ban
 * Ban a user
 */
router.post(
  '/ban',
  userManagementRateLimit,
  authenticateToken,
  requirePermission(FORUM_PERMISSIONS.BAN_USERS),
  validateBanUser,
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { userId, reason, duration } = req.body;
      const moderatorId = req.user!.userId;

      // Check if trying to ban self
      if (userId === moderatorId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot ban yourself',
        });
      }

      const ban = await userManagementService.banUser({
        userId,
        moderatorId,
        reason,
        duration,
        isActive: true,
      });

      res.json({
        success: true,
        message: 'User banned successfully',
        data: ban,
      });
    } catch (error) {
      console.error('Ban user failed:', error);
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }
);

/**
 * POST /api/forum/user-management/unban
 * Unban a user
 */
router.post(
  '/unban',
  userManagementRateLimit,
  authenticateToken,
  requirePermission(FORUM_PERMISSIONS.BAN_USERS),
  [
    body('userId')
      .isInt({ min: 1 })
      .withMessage('User ID must be a positive integer'),
    body('reason')
      .isLength({ min: 5, max: 500 })
      .withMessage('Reason must be between 5 and 500 characters'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { userId, reason } = req.body;
      const moderatorId = req.user!.userId;

      const success = await userManagementService.unbanUser(
        userId,
        moderatorId,
        reason
      );

      res.json({
        success,
        message: success
          ? 'User unbanned successfully'
          : 'User is not currently banned',
      });
    } catch (error) {
      console.error('Unban user failed:', error);
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }
);

/**
 * POST /api/forum/user-management/restrict
 * Restrict a user
 */
router.post(
  '/restrict',
  userManagementRateLimit,
  authenticateToken,
  requirePermission(FORUM_PERMISSIONS.MODERATE_CONTENT),
  validateRestrictUser,
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { userId, type, reason, duration, metadata } = req.body;
      const moderatorId = req.user!.userId;

      const restriction = await userManagementService.restrictUser({
        userId,
        moderatorId,
        type,
        reason,
        duration,
        metadata,
        isActive: true,
      });

      res.json({
        success: true,
        message: 'User restricted successfully',
        data: restriction,
      });
    } catch (error) {
      console.error('Restrict user failed:', error);
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }
);

/**
 * DELETE /api/forum/user-management/restrictions/:id
 * Remove a user restriction
 */
router.delete(
  '/restrictions/:id',
  userManagementRateLimit,
  authenticateToken,
  requirePermission(FORUM_PERMISSIONS.MODERATE_CONTENT),
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Restriction ID must be a positive integer'),
    body('reason')
      .isLength({ min: 5, max: 500 })
      .withMessage('Reason must be between 5 and 500 characters'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const restrictionId = Number(req.params.id);
      const { reason } = req.body;
      const moderatorId = req.user!.userId;

      const success = await userManagementService.removeRestriction(
        restrictionId,
        moderatorId,
        reason
      );

      res.json({
        success,
        message: success
          ? 'Restriction removed successfully'
          : 'Restriction not found',
      });
    } catch (error) {
      console.error('Remove restriction failed:', error);
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }
);

/**
 * POST /api/forum/user-management/warn
 * Warn a user
 */
router.post(
  '/warn',
  userManagementRateLimit,
  authenticateToken,
  requirePermission(FORUM_PERMISSIONS.MODERATE_CONTENT),
  validateWarnUser,
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { userId, reason, severity } = req.body;
      const moderatorId = req.user!.userId;

      const warning = await userManagementService.warnUser({
        userId,
        moderatorId,
        reason,
        severity,
        isActive: true,
      });

      res.json({
        success: true,
        message: 'User warned successfully',
        data: warning,
      });
    } catch (error) {
      console.error('Warn user failed:', error);
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }
);

/**
 * GET /api/forum/user-management/users/:id/history
 * Get user's moderation history
 */
router.get(
  '/users/:id/history',
  authenticateToken,
  requirePermission(FORUM_PERMISSIONS.MODERATE_CONTENT),
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('User ID must be a positive integer'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const userId = Number(req.params.id);
      const history =
        await userManagementService.getUserModerationHistory(userId);

      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      console.error('Get user history failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user history',
      });
    }
  }
);

/**
 * POST /api/forum/user-management/spam-check
 * Check user for spam behavior
 */
router.post(
  '/spam-check',
  userManagementRateLimit,
  authenticateToken,
  requirePermission(FORUM_PERMISSIONS.MODERATE_CONTENT),
  [
    body('userId')
      .isInt({ min: 1 })
      .withMessage('User ID must be a positive integer'),
    body('content')
      .optional()
      .isLength({ max: 10000 })
      .withMessage('Content too long'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { userId, content } = req.body;
      const spamResult = await userManagementService.detectSpam(
        userId,
        content
      );

      res.json({
        success: true,
        data: spamResult,
      });
    } catch (error) {
      console.error('Spam check failed:', error);
      res.status(500).json({
        success: false,
        message: 'Spam check failed',
      });
    }
  }
);

/**
 * POST /api/forum/user-management/appeals
 * Submit an appeal
 */
router.post(
  '/appeals',
  userManagementRateLimit,
  authenticateToken,
  validateAppeal,
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { actionType, actionId, reason } = req.body;
      const userId = req.user!.userId;

      const appeal = await userManagementService.submitAppeal({
        userId,
        actionType,
        actionId,
        reason,
      });

      res.status(201).json({
        success: true,
        message: 'Appeal submitted successfully',
        data: appeal,
      });
    } catch (error) {
      console.error('Submit appeal failed:', error);
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }
);

/**
 * GET /api/forum/user-management/appeals
 * Get appeals (for moderators)
 */
router.get(
  '/appeals',
  authenticateToken,
  requirePermission(FORUM_PERMISSIONS.MODERATE_CONTENT),
  [
    query('status')
      .optional()
      .isIn(['pending', 'approved', 'denied'])
      .withMessage('Invalid status'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      // This would need to be implemented in the service
      // For now, return empty result
      res.json({
        success: true,
        data: {
          appeals: [],
          total: 0,
          page: 1,
          limit: 20,
        },
      });
    } catch (error) {
      console.error('Get appeals failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get appeals',
      });
    }
  }
);

/**
 * PATCH /api/forum/user-management/appeals/:id
 * Process an appeal (approve or deny)
 */
router.patch(
  '/appeals/:id',
  userManagementRateLimit,
  authenticateToken,
  requirePermission(FORUM_PERMISSIONS.MODERATE_CONTENT),
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Appeal ID must be a positive integer'),
    body('decision')
      .isIn(['approved', 'denied'])
      .withMessage('Decision must be approved or denied'),
    body('response')
      .isLength({ min: 10, max: 1000 })
      .withMessage('Response must be between 10 and 1000 characters'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const appealId = Number(req.params.id);
      const { decision, response } = req.body;
      const moderatorId = req.user!.userId;

      const appeal = await userManagementService.processAppeal(
        appealId,
        moderatorId,
        decision,
        response
      );

      res.json({
        success: true,
        message: `Appeal ${decision} successfully`,
        data: appeal,
      });
    } catch (error) {
      console.error('Process appeal failed:', error);
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }
);

/**
 * GET /api/forum/user-management/users/:id/permissions
 * Check if user can perform specific action
 */
router.get(
  '/users/:id/permissions',
  authenticateToken,
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('User ID must be a positive integer'),
    query('action').notEmpty().withMessage('Action is required'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const userId = Number(req.params.id);
      const action = req.query.action as string;

      // Only allow users to check their own permissions, or moderators to check any
      const requestingUserId = req.user!.userId;
      const userRole = req.user!.role;

      if (
        userId !== requestingUserId &&
        userRole !== 'moderator' &&
        userRole !== 'admin'
      ) {
        return res.status(403).json({
          success: false,
          message: 'Can only check your own permissions',
        });
      }

      const permissionCheck = await userManagementService.canUserPerformAction(
        userId,
        action
      );

      res.json({
        success: true,
        data: permissionCheck,
      });
    } catch (error) {
      console.error('Permission check failed:', error);
      res.status(500).json({
        success: false,
        message: 'Permission check failed',
      });
    }
  }
);

export default router;
