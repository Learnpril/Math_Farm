import {
  notificationRepository,
  ForumNotification,
} from '../database/notification-repository.js';
import { forumRepository } from '../database/forum-repository.js';
import { getWebSocketServer } from '../websocket/websocket-manager.js';

export interface NotificationTrigger {
  type:
    | 'mention'
    | 'reply'
    | 'thread_reply'
    | 'thread_locked'
    | 'post_liked'
    | 'achievement';
  userId: number;
  triggeredBy: number;
  data: any;
}

class NotificationService {
  // Create notification for post reply
  async createReplyNotification(
    postId: number,
    replyAuthorId: number
  ): Promise<void> {
    try {
      const post = await forumRepository.getPostById(postId);
      if (!post || post.authorId === replyAuthorId) {
        return; // Don't notify if replying to own post
      }

      const thread = await forumRepository.getThreadById(post.threadId);
      if (!thread) {
        return;
      }

      // Check if user wants reply notifications
      const preferences = await notificationRepository.getUserPreferences(
        post.authorId
      );
      if (preferences && !preferences.repliesEnabled) {
        return;
      }

      const notification: Omit<ForumNotification, 'id' | 'createdAt'> = {
        userId: post.authorId,
        type: 'reply',
        title: 'New reply to your post',
        message: `Someone replied to your post in "${thread.title}"`,
        data: {
          postId: post.id,
          threadId: thread.id,
          threadTitle: thread.title,
          replyAuthorId,
        },
        isRead: false,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      };

      const notificationId =
        await notificationRepository.createNotification(notification);

      // Send real-time notification via WebSocket
      this.sendRealTimeNotification(post.authorId, {
        ...notification,
        id: notificationId,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Error creating reply notification:', error);
    }
  }

  // Create notification for thread reply (for thread subscribers)
  async createThreadReplyNotification(
    threadId: number,
    replyAuthorId: number
  ): Promise<void> {
    try {
      const thread = await forumRepository.getThreadById(threadId);
      if (!thread) {
        return;
      }

      // Get thread subscribers
      const subscribers =
        await notificationRepository.getThreadSubscribers(threadId);

      // Filter out the reply author
      const notifyUsers = subscribers.filter(
        userId => userId !== replyAuthorId
      );

      for (const userId of notifyUsers) {
        // Check user preferences
        const preferences =
          await notificationRepository.getUserPreferences(userId);
        if (preferences && !preferences.threadRepliesEnabled) {
          continue;
        }

        const notification: Omit<ForumNotification, 'id' | 'createdAt'> = {
          userId,
          type: 'thread_reply',
          title: 'New reply in subscribed thread',
          message: `New reply in "${thread.title}"`,
          data: {
            threadId: thread.id,
            threadTitle: thread.title,
            replyAuthorId,
          },
          isRead: false,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        };

        const notificationId =
          await notificationRepository.createNotification(notification);

        // Send real-time notification via WebSocket
        this.sendRealTimeNotification(userId, {
          ...notification,
          id: notificationId,
          createdAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Error creating thread reply notifications:', error);
    }
  }

  // Create notification for mentions in post content
  async createMentionNotifications(
    postId: number,
    mentionedUserIds: number[],
    authorId: number
  ): Promise<void> {
    try {
      const post = await forumRepository.getPostById(postId);
      if (!post) {
        return;
      }

      const thread = await forumRepository.getThreadById(post.threadId);
      if (!thread) {
        return;
      }

      // Filter out the author
      const notifyUsers = mentionedUserIds.filter(
        userId => userId !== authorId
      );

      for (const userId of notifyUsers) {
        // Check user preferences
        const preferences =
          await notificationRepository.getUserPreferences(userId);
        if (preferences && !preferences.mentionsEnabled) {
          continue;
        }

        const notification: Omit<ForumNotification, 'id' | 'createdAt'> = {
          userId,
          type: 'mention',
          title: 'You were mentioned in a post',
          message: `You were mentioned in "${thread.title}"`,
          data: {
            postId: post.id,
            threadId: thread.id,
            threadTitle: thread.title,
            authorId,
          },
          isRead: false,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        };

        const notificationId =
          await notificationRepository.createNotification(notification);

        // Send real-time notification via WebSocket
        this.sendRealTimeNotification(userId, {
          ...notification,
          id: notificationId,
          createdAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Error creating mention notifications:', error);
    }
  }

  // Create notification for thread lock/unlock
  async createThreadLockNotification(
    threadId: number,
    isLocked: boolean,
    moderatorId: number
  ): Promise<void> {
    try {
      const thread = await forumRepository.getThreadById(threadId);
      if (!thread) {
        return;
      }

      // Get thread subscribers and author
      const subscribers =
        await notificationRepository.getThreadSubscribers(threadId);
      const notifyUsers = new Set([...subscribers, thread.authorId]);

      // Remove moderator from notifications
      notifyUsers.delete(moderatorId);

      for (const userId of notifyUsers) {
        // Check user preferences
        const preferences =
          await notificationRepository.getUserPreferences(userId);
        if (preferences && !preferences.threadUpdatesEnabled) {
          continue;
        }

        const notification: Omit<ForumNotification, 'id' | 'createdAt'> = {
          userId,
          type: 'thread_locked',
          title: isLocked ? 'Thread locked' : 'Thread unlocked',
          message: `Thread "${thread.title}" has been ${isLocked ? 'locked' : 'unlocked'}`,
          data: {
            threadId: thread.id,
            threadTitle: thread.title,
            isLocked,
            moderatorId,
          },
          isRead: false,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        };

        const notificationId =
          await notificationRepository.createNotification(notification);

        // Send real-time notification via WebSocket
        this.sendRealTimeNotification(userId, {
          ...notification,
          id: notificationId,
          createdAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Error creating thread lock notifications:', error);
    }
  }

  // Create notification for post likes
  async createLikeNotification(
    postId: number,
    likedByUserId: number
  ): Promise<void> {
    try {
      const post = await forumRepository.getPostById(postId);
      if (!post || post.authorId === likedByUserId) {
        return; // Don't notify if liking own post
      }

      // Check user preferences
      const preferences = await notificationRepository.getUserPreferences(
        post.authorId
      );
      if (preferences && !preferences.likesEnabled) {
        return;
      }

      const thread = await forumRepository.getThreadById(post.threadId);
      if (!thread) {
        return;
      }

      const notification: Omit<ForumNotification, 'id' | 'createdAt'> = {
        userId: post.authorId,
        type: 'post_liked',
        title: 'Your post was liked',
        message: `Someone liked your post in "${thread.title}"`,
        data: {
          postId: post.id,
          threadId: thread.id,
          threadTitle: thread.title,
          likedByUserId,
        },
        isRead: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      };

      const notificationId =
        await notificationRepository.createNotification(notification);

      // Send real-time notification via WebSocket
      this.sendRealTimeNotification(post.authorId, {
        ...notification,
        id: notificationId,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Error creating like notification:', error);
    }
  }

  // Create achievement notification
  async createAchievementNotification(
    userId: number,
    achievementId: string,
    achievementName: string
  ): Promise<void> {
    try {
      // Check user preferences
      const preferences =
        await notificationRepository.getUserPreferences(userId);
      if (preferences && !preferences.achievementsEnabled) {
        return;
      }

      const notification: Omit<ForumNotification, 'id' | 'createdAt'> = {
        userId,
        type: 'achievement',
        title: 'Achievement unlocked!',
        message: `You earned the "${achievementName}" achievement!`,
        data: {
          achievementId,
          achievementName,
        },
        isRead: false,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      };

      const notificationId =
        await notificationRepository.createNotification(notification);

      // Send real-time notification via WebSocket
      this.sendRealTimeNotification(userId, {
        ...notification,
        id: notificationId,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Error creating achievement notification:', error);
    }
  }

  // Send real-time notification via WebSocket
  private sendRealTimeNotification(
    userId: number,
    notification: ForumNotification
  ): void {
    const wsServer = getWebSocketServer();
    if (wsServer) {
      // Send notification to user if they're online
      wsServer.sendNotificationToUser(userId, notification);
      console.log(
        `Sent real-time notification to user ${userId}:`,
        notification.title
      );
    }
  }

  // Utility method to extract mentions from post content
  extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }

    return mentions;
  }

  // Auto-subscribe user to thread when they post
  async autoSubscribeToThread(userId: number, threadId: number): Promise<void> {
    try {
      await notificationRepository.createSubscription({
        userId,
        subscriptionType: 'thread',
        targetId: threadId,
        isActive: true,
      });
    } catch (error) {
      console.error('Error auto-subscribing to thread:', error);
    }
  }

  // Cleanup expired notifications (should be run periodically)
  async cleanupExpiredNotifications(): Promise<void> {
    try {
      await notificationRepository.cleanupExpiredNotifications();
      console.log('Cleaned up expired notifications');
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
    }
  }
}

export const notificationService = new NotificationService();
