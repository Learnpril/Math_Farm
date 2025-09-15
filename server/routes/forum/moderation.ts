import { Router, Request, Response } from 'express';
import { authenticateToken, requirePermission } from '../../middleware/auth';
import { FORUM_PERMISSIONS } from '../../middleware/auth';
import { ModerationService } from '../../services/moderation-service';
import { body, param, validationResult } from 'express-validator';
import { rateLimit } from 'express-rate-limit';

const router = Router();
const moderationService = new ModerationService();

// Rate limiting for moderation actions
const moderationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each user to 50 moderation actions per windowMs
  message: 'Too many moderation actions, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation middleware
const validateModerationAction = [
  body('type')
    .isIn(['delete', 'hide', 'lock', 'unlock', 'pin', 'unpin', 'warn', 'ban'])
    .withMessage('Invalid moderation action type'),
  body('reason')
    .isLength({ min: 5, max: 500 })
    .withMessage('Reason must be between 5 and 500 characters'),
  body('targetId')
    .isInt({ min: 1 })
    .withMessage('Target ID must be a positive integer'),
  body('targetType')
    .isIn(['post', 'thread', 'user'])
    .withMessage('Invalid target type'),
  body('duration')
    .optional()
    .isInt({ min: 1, max: 8760 })
    .withMessage('Duration must be between 1 and 8760 hours'),
];

const validateReportSubmission = [
  body('postId')
    .isInt({ min: 1 })
    .withMessage('Post ID must be a positive integer'),
  body('reason')
    .isLength({ min: 3, max: 200 })
    .withMessage('Reason must be between 3 and 200 characters'),
  body('category')
    .isIn([
      'spam',
      'harassment',
      'inappropriate_content',
      'misinformation',
      'copyright',
      'other',
    ])
    .withMessage('Invalid report category'),
  body('details')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Details must not exceed 1000 characters'),
];

/**
 * POST /api/forum/moderation/actions
 * Perform moderation action on content or users
 */
router.post(
  '/actions',
  moderationRateLimit,
  authenticateToken,
  requirePermission(FORUM_PERMISSIONS.MODERATE_CONTENT),
  validateModerationAction,
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

      const { type, reason, targetId, targetType, duration } = req.body;
      const moderatorId = req.user!.userId;

      const result = await moderationService.performAction({
        type,
        reason,
        targetId,
        targetType,
        moderatorId,
        duration,
      });

      res.json({
        success: true,
        message: 'Moderation action completed successfully',
        data: result,
      });
    } catch (error) {
      console.error('Moderation action failed:', error);
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }
);

/**
 * POST /api/forum/reports
 * Submit content report
 */
router.post(
  '/reports',
  moderationRateLimit,
  authenticateToken,
  validateReportSubmission,
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

      const { postId, reason, category, details } = req.body;
      const reporterId = req.user!.userId;

      const report = await moderationService.submitReport({
        postId,
        reporterId,
        reason,
        category,
        details,
      });

      res.status(201).json({
        success: true,
        message: 'Report submitted successfully',
        data: report,
      });
    } catch (error) {
      console.error('Report submission failed:', error);
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }
);

/**
 * GET /api/forum/reports
 * Get reports for moderation review
 */
router.get(
  '/reports',
  authenticateToken,
  requirePermission(FORUM_PERMISSIONS.MODERATE_CONTENT),
  async (req: Request, res: Response) => {
    try {
      const { status = 'pending', page = 1, limit = 20 } = req.query;

      const reports = await moderationService.getReports({
        status: status as string,
        page: Number(page),
        limit: Number(limit),
      });

      res.json({
        success: true,
        data: reports,
      });
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch reports',
      });
    }
  }
);

/**
 * PATCH /api/forum/reports/:id/resolve
 * Resolve a content report
 */
router.patch(
  '/reports/:id/resolve',
  moderationRateLimit,
  authenticateToken,
  requirePermission(FORUM_PERMISSIONS.MODERATE_CONTENT),
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Report ID must be a positive integer'),
    body('action')
      .isIn(['resolved', 'dismissed'])
      .withMessage('Invalid resolution action'),
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

      const reportId = Number(req.params.id);
      const { action } = req.body;
      const moderatorId = req.user!.userId;

      const result = await moderationService.resolveReport(
        reportId,
        action,
        moderatorId
      );

      res.json({
        success: true,
        message: `Report ${action} successfully`,
        data: result,
      });
    } catch (error) {
      console.error('Report resolution failed:', error);
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }
);

/**
 * GET /api/forum/moderation/audit-log
 * Get moderation audit log
 */
router.get(
  '/audit-log',
  authenticateToken,
  requirePermission(FORUM_PERMISSIONS.MODERATE_CONTENT),
  async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 50, targetType, moderatorId } = req.query;

      const auditLog = await moderationService.getAuditLog({
        page: Number(page),
        limit: Number(limit),
        targetType: targetType as string,
        moderatorId: moderatorId ? Number(moderatorId) : undefined,
      });

      res.json({
        success: true,
        data: auditLog,
      });
    } catch (error) {
      console.error('Failed to fetch audit log:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch audit log',
      });
    }
  }
);

/**
 * GET /api/forum/moderation/keyword-filters
 * Get keyword filters for content moderation
 */
router.get(
  '/keyword-filters',
  authenticateToken,
  requirePermission(FORUM_PERMISSIONS.MODERATE_CONTENT),
  async (req: Request, res: Response) => {
    try {
      const filters = await moderationService.getKeywordFilters();

      res.json({
        success: true,
        data: filters,
      });
    } catch (error) {
      console.error('Failed to fetch keyword filters:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch keyword filters',
      });
    }
  }
);

/**
 * POST /api/forum/moderation/keyword-filters
 * Add or update keyword filters
 */
router.post(
  '/keyword-filters',
  moderationRateLimit,
  authenticateToken,
  requirePermission(FORUM_PERMISSIONS.MODERATE_CONTENT),
  [
    body('keywords')
      .isArray({ min: 1 })
      .withMessage('Keywords must be a non-empty array'),
    body('keywords.*')
      .isLength({ min: 2, max: 50 })
      .withMessage('Each keyword must be between 2 and 50 characters'),
    body('action')
      .isIn(['flag', 'auto_hide', 'auto_delete'])
      .withMessage('Invalid filter action'),
    body('severity')
      .isIn(['low', 'medium', 'high'])
      .withMessage('Invalid severity level'),
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

      const { keywords, action, severity } = req.body;
      const moderatorId = req.user!.userId;

      const result = await moderationService.updateKeywordFilters({
        keywords,
        action,
        severity,
        moderatorId,
      });

      res.json({
        success: true,
        message: 'Keyword filters updated successfully',
        data: result,
      });
    } catch (error) {
      console.error('Failed to update keyword filters:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update keyword filters',
      });
    }
  }
);

export default router;
