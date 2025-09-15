import { connection } from './connection.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface ForumNotification {
  id: number;
  userId: number;
  type:
    | 'mention'
    | 'reply'
    | 'thread_reply'
    | 'thread_locked'
    | 'post_liked'
    | 'achievement';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
  expiresAt?: Date;
}

export interface NotificationPreferences {
  id: number;
  userId: number;
  mentionsEnabled: boolean;
  repliesEnabled: boolean;
  threadRepliesEnabled: boolean;
  threadUpdatesEnabled: boolean;
  likesEnabled: boolean;
  achievementsEnabled: boolean;
  emailNotifications: boolean;
  digestFrequency: 'none' | 'daily' | 'weekly';
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationSubscription {
  id: number;
  userId: number;
  subscriptionType: 'thread' | 'category' | 'user';
  targetId: number;
  isActive: boolean;
  createdAt: Date;
}

class NotificationRepository {
  // Notification CRUD operations
  async createNotification(
    notification: Omit<ForumNotification, 'id' | 'createdAt'>
  ): Promise<number> {
    const query = `
      INSERT INTO forum_notifications (user_id, type, title, message, data, is_read, read_at, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await connection.execute<ResultSetHeader>(query, [
      notification.userId,
      notification.type,
      notification.title,
      notification.message,
      notification.data ? JSON.stringify(notification.data) : null,
      notification.isRead,
      notification.readAt || null,
      notification.expiresAt || null,
    ]);

    return result.insertId;
  }

  async getNotificationById(id: number): Promise<ForumNotification | null> {
    const query = `
      SELECT id, user_id as userId, type, title, message, data, is_read as isRead,
             created_at as createdAt, read_at as readAt, expires_at as expiresAt
      FROM forum_notifications
      WHERE id = ?
    `;

    const [rows] = await connection.execute<RowDataPacket[]>(query, [id]);

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      ...row,
      data: row.data ? JSON.parse(row.data) : null,
      createdAt: new Date(row.createdAt),
      readAt: row.readAt ? new Date(row.readAt) : undefined,
      expiresAt: row.expiresAt ? new Date(row.expiresAt) : undefined,
    };
  }

  async getUserNotifications(
    userId: number,
    limit: number = 50,
    offset: number = 0,
    unreadOnly: boolean = false
  ): Promise<ForumNotification[]> {
    let query = `
      SELECT id, user_id as userId, type, title, message, data, is_read as isRead,
             created_at as createdAt, read_at as readAt, expires_at as expiresAt
      FROM forum_notifications
      WHERE user_id = ?
    `;

    const params: any[] = [userId];

    if (unreadOnly) {
      query += ' AND is_read = FALSE';
    }

    // Filter out expired notifications
    query += ' AND (expires_at IS NULL OR expires_at > NOW())';
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

    params.push(limit, offset);

    const [rows] = await connection.execute<RowDataPacket[]>(query, params);

    return rows.map(row => ({
      ...row,
      data: row.data ? JSON.parse(row.data) : null,
      createdAt: new Date(row.createdAt),
      readAt: row.readAt ? new Date(row.readAt) : undefined,
      expiresAt: row.expiresAt ? new Date(row.expiresAt) : undefined,
    }));
  }

  async markNotificationAsRead(id: number): Promise<void> {
    const query = `
      UPDATE forum_notifications
      SET is_read = TRUE, read_at = NOW()
      WHERE id = ?
    `;

    await connection.execute(query, [id]);
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    const query = `
      UPDATE forum_notifications
      SET is_read = TRUE, read_at = NOW()
      WHERE user_id = ? AND is_read = FALSE
    `;

    await connection.execute(query, [userId]);
  }

  async deleteNotification(id: number): Promise<void> {
    const query = 'DELETE FROM forum_notifications WHERE id = ?';
    await connection.execute(query, [id]);
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM forum_notifications
      WHERE user_id = ? AND is_read = FALSE
        AND (expires_at IS NULL OR expires_at > NOW())
    `;

    const [rows] = await connection.execute<RowDataPacket[]>(query, [userId]);
    return rows[0].count;
  }

  // Notification Preferences
  async getUserPreferences(
    userId: number
  ): Promise<NotificationPreferences | null> {
    const query = `
      SELECT id, user_id as userId, mentions_enabled as mentionsEnabled,
             replies_enabled as repliesEnabled, thread_replies_enabled as threadRepliesEnabled,
             thread_updates_enabled as threadUpdatesEnabled, likes_enabled as likesEnabled,
             achievements_enabled as achievementsEnabled, email_notifications as emailNotifications,
             digest_frequency as digestFrequency, created_at as createdAt, updated_at as updatedAt
      FROM notification_preferences
      WHERE user_id = ?
    `;

    const [rows] = await connection.execute<RowDataPacket[]>(query, [userId]);

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      ...row,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  async createOrUpdatePreferences(
    preferences: Omit<NotificationPreferences, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<void> {
    const query = `
      INSERT INTO notification_preferences (
        user_id, mentions_enabled, replies_enabled, thread_replies_enabled,
        thread_updates_enabled, likes_enabled, achievements_enabled,
        email_notifications, digest_frequency
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        mentions_enabled = VALUES(mentions_enabled),
        replies_enabled = VALUES(replies_enabled),
        thread_replies_enabled = VALUES(thread_replies_enabled),
        thread_updates_enabled = VALUES(thread_updates_enabled),
        likes_enabled = VALUES(likes_enabled),
        achievements_enabled = VALUES(achievements_enabled),
        email_notifications = VALUES(email_notifications),
        digest_frequency = VALUES(digest_frequency),
        updated_at = NOW()
    `;

    await connection.execute(query, [
      preferences.userId,
      preferences.mentionsEnabled,
      preferences.repliesEnabled,
      preferences.threadRepliesEnabled,
      preferences.threadUpdatesEnabled,
      preferences.likesEnabled,
      preferences.achievementsEnabled,
      preferences.emailNotifications,
      preferences.digestFrequency,
    ]);
  }

  // Notification Subscriptions
  async createSubscription(
    subscription: Omit<NotificationSubscription, 'id' | 'createdAt'>
  ): Promise<number> {
    const query = `
      INSERT INTO notification_subscriptions (user_id, subscription_type, target_id, is_active)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE is_active = VALUES(is_active)
    `;

    const [result] = await connection.execute<ResultSetHeader>(query, [
      subscription.userId,
      subscription.subscriptionType,
      subscription.targetId,
      subscription.isActive,
    ]);

    return result.insertId;
  }

  async getUserSubscriptions(
    userId: number,
    subscriptionType?: string
  ): Promise<NotificationSubscription[]> {
    let query = `
      SELECT id, user_id as userId, subscription_type as subscriptionType,
             target_id as targetId, is_active as isActive, created_at as createdAt
      FROM notification_subscriptions
      WHERE user_id = ? AND is_active = TRUE
    `;

    const params: any[] = [userId];

    if (subscriptionType) {
      query += ' AND subscription_type = ?';
      params.push(subscriptionType);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await connection.execute<RowDataPacket[]>(query, params);

    return rows.map(row => ({
      ...row,
      createdAt: new Date(row.createdAt),
    }));
  }

  async removeSubscription(
    userId: number,
    subscriptionType: string,
    targetId: number
  ): Promise<void> {
    const query = `
      UPDATE notification_subscriptions
      SET is_active = FALSE
      WHERE user_id = ? AND subscription_type = ? AND target_id = ?
    `;

    await connection.execute(query, [userId, subscriptionType, targetId]);
  }

  async getThreadSubscribers(threadId: number): Promise<number[]> {
    const query = `
      SELECT DISTINCT user_id
      FROM notification_subscriptions
      WHERE subscription_type = 'thread' AND target_id = ? AND is_active = TRUE
    `;

    const [rows] = await connection.execute<RowDataPacket[]>(query, [threadId]);
    return rows.map(row => row.user_id);
  }

  async getCategorySubscribers(categoryId: number): Promise<number[]> {
    const query = `
      SELECT DISTINCT user_id
      FROM notification_subscriptions
      WHERE subscription_type = 'category' AND target_id = ? AND is_active = TRUE
    `;

    const [rows] = await connection.execute<RowDataPacket[]>(query, [
      categoryId,
    ]);
    return rows.map(row => row.user_id);
  }

  // Cleanup expired notifications
  async cleanupExpiredNotifications(): Promise<void> {
    const query = `
      DELETE FROM forum_notifications
      WHERE expires_at IS NOT NULL AND expires_at < NOW()
    `;

    await connection.execute(query);
  }
}

export const notificationRepository = new NotificationRepository();
