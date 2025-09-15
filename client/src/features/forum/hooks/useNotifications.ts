import { useState, useEffect, useCallback } from 'react';
import {
  ForumNotification,
  NotificationPreferences,
} from '../types/notifications.js';

interface UseNotificationsOptions {
  token?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseNotificationsReturn {
  notifications: ForumNotification[];
  unreadCount: number;
  preferences: NotificationPreferences | null;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: (unreadOnly?: boolean) => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
  updatePreferences: (
    preferences: Partial<NotificationPreferences>
  ) => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

export function useNotifications({
  token,
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
}: UseNotificationsOptions = {}): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<ForumNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] =
    useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = useCallback(
    async (endpoint: string, options: RequestInit = {}) => {
      if (!token) {
        throw new Error('Authentication token required');
      }

      const response = await fetch(`/api/forum/notifications${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return response.json();
    },
    [token]
  );

  const fetchNotifications = useCallback(
    async (unreadOnly: boolean = false) => {
      if (!token) return;

      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (unreadOnly) {
          params.set('unread', 'true');
        }

        const data = await apiCall(`?${params.toString()}`);

        setNotifications(
          data.notifications.map((n: any) => ({
            ...n,
            createdAt: new Date(n.createdAt),
            readAt: n.readAt ? new Date(n.readAt) : undefined,
            expiresAt: n.expiresAt ? new Date(n.expiresAt) : undefined,
          }))
        );

        setUnreadCount(data.unreadCount);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch notifications'
        );
        console.error('Error fetching notifications:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [token, apiCall]
  );

  const refreshUnreadCount = useCallback(async () => {
    if (!token) return;

    try {
      const data = await apiCall('/unread-count');
      setUnreadCount(data.count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [token, apiCall]);

  const markAsRead = useCallback(
    async (notificationId: number) => {
      if (!token) return;

      try {
        await apiCall(`/${notificationId}/read`, {
          method: 'PUT',
        });

        // Update local state
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId
              ? { ...n, isRead: true, readAt: new Date() }
              : n
          )
        );

        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to mark notification as read'
        );
        console.error('Error marking notification as read:', err);
      }
    },
    [token, apiCall]
  );

  const markAllAsRead = useCallback(async () => {
    if (!token) return;

    try {
      await apiCall('/read-all', {
        method: 'PUT',
      });

      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true, readAt: new Date() }))
      );

      setUnreadCount(0);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to mark all notifications as read'
      );
      console.error('Error marking all notifications as read:', err);
    }
  }, [token, apiCall]);

  const deleteNotification = useCallback(
    async (notificationId: number) => {
      if (!token) return;

      try {
        await apiCall(`/${notificationId}`, {
          method: 'DELETE',
        });

        // Update local state
        const notification = notifications.find(n => n.id === notificationId);
        setNotifications(prev => prev.filter(n => n.id !== notificationId));

        if (notification && !notification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to delete notification'
        );
        console.error('Error deleting notification:', err);
      }
    },
    [token, apiCall, notifications]
  );

  const fetchPreferences = useCallback(async () => {
    if (!token) return;

    try {
      const data = await apiCall('/preferences');
      setPreferences({
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      });
    } catch (err) {
      console.error('Error fetching preferences:', err);
    }
  }, [token, apiCall]);

  const updatePreferences = useCallback(
    async (updates: Partial<NotificationPreferences>) => {
      if (!token) return;

      try {
        const data = await apiCall('/preferences', {
          method: 'PUT',
          body: JSON.stringify(updates),
        });

        setPreferences({
          ...data,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to update preferences'
        );
        console.error('Error updating preferences:', err);
      }
    },
    [token, apiCall]
  );

  // Initial fetch
  useEffect(() => {
    if (token) {
      fetchNotifications();
      fetchPreferences();
      refreshUnreadCount();
    }
  }, [token, fetchNotifications, fetchPreferences, refreshUnreadCount]);

  // Auto-refresh unread count
  useEffect(() => {
    if (!token || !autoRefresh) return;

    const interval = setInterval(() => {
      refreshUnreadCount();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [token, autoRefresh, refreshInterval, refreshUnreadCount]);

  return {
    notifications,
    unreadCount,
    preferences,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
    refreshUnreadCount,
  };
}
