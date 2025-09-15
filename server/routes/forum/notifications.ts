import { Router, Request, Response } from 'express';
import { notificationRepository } from '../../database/notification-repository.js';
import {
  authenticateToken,
  AuthenticatedRequest,
} from '../../middleware/auth.js';

const router = Router();

// GET /api/forum/notifications - Get user notifications
router.get(
  '/',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = Math.min(
        parseInt(req.query.limit as string, 10) || 20,
        100
      );
      const offset = (page - 1) * limit;
      const unreadOnly = req.query.unread === 'true';

      const notifications = await notificationRepository.getUserNotifications(
        req.user!.userId,
        limit,
        offset,
        unreadOnly
      );

      const unreadCount =
        await notificationRepository.getUnreadNotificationCount(
          req.user!.userId
        );

      res.json({
        notifications,
        unreadCount,
        pagination: {
          page,
          limit,
          hasMore: notifications.length === limit,
        },
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({
        error: 'Failed to fetch notifications',
        code: 'FETCH_NOTIFICATIONS_ERROR',
      });
    }
  }
);

// GET /api/forum/notifications/unread-count - Get unread notification count
router.get(
  '/unread-count',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const count = await notificationRepository.getUnreadNotificationCount(
        req.user!.userId
      );

      res.json({ count });
    } catch (error) {
      console.error('Error fetching unread count:', error);
      res.status(500).json({
        error: 'Failed to fetch unread count',
        code: 'FETCH_UNREAD_COUNT_ERROR',
      });
    }
  }
);

// PUT /api/forum/notifications/:id/read - Mark notification as read
router.put(
  '/:id/read',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const notificationId = parseInt(req.params.id, 10);

      if (!Number.isInteger(notificationId) || notificationId <= 0) {
        return res.status(400).json({
          error: 'Invalid notification ID',
          code: 'INVALID_NOTIFICATION_ID',
        });
      }

      // Verify notification belongs to user
      const notification =
        await notificationRepository.getNotificationById(notificationId);

      if (!notification) {
        return res.status(404).json({
          error: 'Notification not found',
          code: 'NOTIFICATION_NOT_FOUND',
        });
      }

      if (notification.userId !== req.user!.userId) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      await notificationRepository.markNotificationAsRead(notificationId);

      res.json({ success: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({
        error: 'Failed to mark notification as read',
        code: 'MARK_READ_ERROR',
      });
    }
  }
);

// PUT /api/forum/notifications/read-all - Mark all notifications as read
router.put(
  '/read-all',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      await notificationRepository.markAllNotificationsAsRead(req.user!.userId);

      res.json({ success: true });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({
        error: 'Failed to mark all notifications as read',
        code: 'MARK_ALL_READ_ERROR',
      });
    }
  }
);

// DELETE /api/forum/notifications/:id - Delete notification
router.delete(
  '/:id',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const notificationId = parseInt(req.params.id, 10);

      if (!Number.isInteger(notificationId) || notificationId <= 0) {
        return res.status(400).json({
          error: 'Invalid notification ID',
          code: 'INVALID_NOTIFICATION_ID',
        });
      }

      // Verify notification belongs to user
      const notification =
        await notificationRepository.getNotificationById(notificationId);

      if (!notification) {
        return res.status(404).json({
          error: 'Notification not found',
          code: 'NOTIFICATION_NOT_FOUND',
        });
      }

      if (notification.userId !== req.user!.userId) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      await notificationRepository.deleteNotification(notificationId);

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({
        error: 'Failed to delete notification',
        code: 'DELETE_NOTIFICATION_ERROR',
      });
    }
  }
);

// GET /api/forum/notifications/preferences - Get notification preferences
router.get(
  '/preferences',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      let preferences = await notificationRepository.getUserPreferences(
        req.user!.userId
      );

      // Create default preferences if none exist
      if (!preferences) {
        const defaultPreferences = {
          userId: req.user!.userId,
          mentionsEnabled: true,
          repliesEnabled: true,
          threadRepliesEnabled: true,
          threadUpdatesEnabled: true,
          likesEnabled: true,
          achievementsEnabled: true,
          emailNotifications: false,
          digestFrequency: 'none' as const,
        };

        await notificationRepository.createOrUpdatePreferences(
          defaultPreferences
        );
        preferences = await notificationRepository.getUserPreferences(
          req.user!.userId
        );
      }

      res.json(preferences);
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      res.status(500).json({
        error: 'Failed to fetch notification preferences',
        code: 'FETCH_PREFERENCES_ERROR',
      });
    }
  }
);

// PUT /api/forum/notifications/preferences - Update notification preferences
router.put(
  '/preferences',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        mentionsEnabled,
        repliesEnabled,
        threadRepliesEnabled,
        threadUpdatesEnabled,
        likesEnabled,
        achievementsEnabled,
        emailNotifications,
        digestFrequency,
      } = req.body;

      // Validate boolean fields
      const booleanFields = {
        mentionsEnabled,
        repliesEnabled,
        threadRepliesEnabled,
        threadUpdatesEnabled,
        likesEnabled,
        achievementsEnabled,
        emailNotifications,
      };

      for (const [field, value] of Object.entries(booleanFields)) {
        if (value !== undefined && typeof value !== 'boolean') {
          return res.status(400).json({
            error: `${field} must be a boolean`,
            code: 'VALIDATION_ERROR',
          });
        }
      }

      // Validate digestFrequency
      if (
        digestFrequency !== undefined &&
        !['none', 'daily', 'weekly'].includes(digestFrequency)
      ) {
        return res.status(400).json({
          error: 'digestFrequency must be one of: none, daily, weekly',
          code: 'VALIDATION_ERROR',
        });
      }

      const preferences = {
        userId: req.user!.userId,
        mentionsEnabled: mentionsEnabled ?? true,
        repliesEnabled: repliesEnabled ?? true,
        threadRepliesEnabled: threadRepliesEnabled ?? true,
        threadUpdatesEnabled: threadUpdatesEnabled ?? true,
        likesEnabled: likesEnabled ?? true,
        achievementsEnabled: achievementsEnabled ?? true,
        emailNotifications: emailNotifications ?? false,
        digestFrequency: digestFrequency ?? 'none',
      };

      await notificationRepository.createOrUpdatePreferences(preferences);

      const updatedPreferences =
        await notificationRepository.getUserPreferences(req.user!.userId);

      res.json(updatedPreferences);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      res.status(500).json({
        error: 'Failed to update notification preferences',
        code: 'UPDATE_PREFERENCES_ERROR',
      });
    }
  }
);

// GET /api/forum/notifications/subscriptions - Get user subscriptions
router.get(
  '/subscriptions',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const subscriptionType = req.query.type as string;

      const subscriptions = await notificationRepository.getUserSubscriptions(
        req.user!.userId,
        subscriptionType
      );

      res.json({ subscriptions });
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      res.status(500).json({
        error: 'Failed to fetch subscriptions',
        code: 'FETCH_SUBSCRIPTIONS_ERROR',
      });
    }
  }
);

// POST /api/forum/notifications/subscriptions - Create subscription
router.post(
  '/subscriptions',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { subscriptionType, targetId } = req.body;

      if (
        !subscriptionType ||
        !['thread', 'category', 'user'].includes(subscriptionType)
      ) {
        return res.status(400).json({
          error: 'Valid subscription type is required (thread, category, user)',
          code: 'VALIDATION_ERROR',
        });
      }

      if (!targetId || !Number.isInteger(targetId) || targetId <= 0) {
        return res.status(400).json({
          error: 'Valid target ID is required',
          code: 'VALIDATION_ERROR',
        });
      }

      const subscriptionId = await notificationRepository.createSubscription({
        userId: req.user!.userId,
        subscriptionType,
        targetId,
        isActive: true,
      });

      res.status(201).json({ id: subscriptionId, success: true });
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({
        error: 'Failed to create subscription',
        code: 'CREATE_SUBSCRIPTION_ERROR',
      });
    }
  }
);

// DELETE /api/forum/notifications/subscriptions - Remove subscription
router.delete(
  '/subscriptions',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { subscriptionType, targetId } = req.body;

      if (
        !subscriptionType ||
        !['thread', 'category', 'user'].includes(subscriptionType)
      ) {
        return res.status(400).json({
          error: 'Valid subscription type is required (thread, category, user)',
          code: 'VALIDATION_ERROR',
        });
      }

      if (!targetId || !Number.isInteger(targetId) || targetId <= 0) {
        return res.status(400).json({
          error: 'Valid target ID is required',
          code: 'VALIDATION_ERROR',
        });
      }

      await notificationRepository.removeSubscription(
        req.user!.userId,
        subscriptionType,
        targetId
      );

      res.json({ success: true });
    } catch (error) {
      console.error('Error removing subscription:', error);
      res.status(500).json({
        error: 'Failed to remove subscription',
        code: 'REMOVE_SUBSCRIPTION_ERROR',
      });
    }
  }
);

export default router;
