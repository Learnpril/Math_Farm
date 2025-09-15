import { useEffect, useState, useCallback, useRef } from 'react';
import { useWebSocket } from './useWebSocket.js';
import { ForumWebSocketMessage, WebSocketState } from '../types/websocket.js';
import { ForumPost } from '../types.js';

interface UseRealTimeUpdatesOptions {
  token?: string;
  threadId?: string;
  onNewPost?: (post: ForumPost) => void;
  onPostEdit?: (post: ForumPost) => void;
  onPostDelete?: (postId: number) => void;
  onThreadLock?: (threadId: string, isLocked: boolean) => void;
  onUserStatusChange?: (userId: number, isOnline: boolean) => void;
  onNotification?: (notification: any) => void;
}

interface UseRealTimeUpdatesReturn extends WebSocketState {
  subscribeToThread: (threadId: string) => void;
  unsubscribeFromThread: (threadId: string) => void;
  startTyping: (threadId: string) => void;
  stopTyping: (threadId: string) => void;
  sendPing: () => void;
}

export function useRealTimeUpdates({
  token,
  threadId,
  onNewPost,
  onPostEdit,
  onPostDelete,
  onThreadLock,
  onUserStatusChange,
  onNotification,
}: UseRealTimeUpdatesOptions): UseRealTimeUpdatesReturn {
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<string, Set<number>>>(
    new Map()
  );
  const subscribedThreadsRef = useRef<Set<string>>(new Set());
  const typingTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // WebSocket URL - adjust based on your environment
  const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/forum`;

  const handleMessage = useCallback(
    (message: ForumWebSocketMessage) => {
      console.log('WebSocket message received:', message);

      switch (message.type) {
        case 'connection_established':
          console.log(
            'WebSocket connection established for user:',
            message.data.userId
          );
          break;

        case 'new_post':
          if (message.data.post) {
            onNewPost?.(message.data.post);
          }
          break;

        case 'post_edited':
          if (message.data.post) {
            onPostEdit?.(message.data.post);
          }
          break;

        case 'post_deleted':
          if (message.data.postId) {
            onPostDelete?.(message.data.postId);
          }
          break;

        case 'thread_locked':
          if (
            message.data.threadId !== undefined &&
            message.data.isLocked !== undefined
          ) {
            onThreadLock?.(message.data.threadId, message.data.isLocked);
          }
          break;

        case 'user_status_change':
          if (message.data.userId && message.data.isOnline !== undefined) {
            setOnlineUsers(prev => {
              const newSet = new Set(prev);
              if (message.data.isOnline) {
                newSet.add(message.data.userId);
              } else {
                newSet.delete(message.data.userId);
              }
              return newSet;
            });
            onUserStatusChange?.(message.data.userId, message.data.isOnline);
          }
          break;

        case 'user_typing_start':
          if (message.data.userId && message.data.threadId) {
            setTypingUsers(prev => {
              const newMap = new Map(prev);
              const threadTypers =
                newMap.get(message.data.threadId) || new Set();
              threadTypers.add(message.data.userId);
              newMap.set(message.data.threadId, threadTypers);
              return newMap;
            });

            // Clear typing indicator after 5 seconds
            const timeoutKey = `${message.data.threadId}-${message.data.userId}`;
            const existingTimeout = typingTimeoutsRef.current.get(timeoutKey);
            if (existingTimeout) {
              clearTimeout(existingTimeout);
            }

            const timeout = setTimeout(() => {
              setTypingUsers(prev => {
                const newMap = new Map(prev);
                const threadTypers = newMap.get(message.data.threadId);
                if (threadTypers) {
                  threadTypers.delete(message.data.userId);
                  if (threadTypers.size === 0) {
                    newMap.delete(message.data.threadId);
                  } else {
                    newMap.set(message.data.threadId, threadTypers);
                  }
                }
                return newMap;
              });
              typingTimeoutsRef.current.delete(timeoutKey);
            }, 5000);

            typingTimeoutsRef.current.set(timeoutKey, timeout);
          }
          break;

        case 'user_typing_stop':
          if (message.data.userId && message.data.threadId) {
            setTypingUsers(prev => {
              const newMap = new Map(prev);
              const threadTypers = newMap.get(message.data.threadId);
              if (threadTypers) {
                threadTypers.delete(message.data.userId);
                if (threadTypers.size === 0) {
                  newMap.delete(message.data.threadId);
                } else {
                  newMap.set(message.data.threadId, threadTypers);
                }
              }
              return newMap;
            });

            // Clear timeout for this user
            const timeoutKey = `${message.data.threadId}-${message.data.userId}`;
            const existingTimeout = typingTimeoutsRef.current.get(timeoutKey);
            if (existingTimeout) {
              clearTimeout(existingTimeout);
              typingTimeoutsRef.current.delete(timeoutKey);
            }
          }
          break;

        case 'thread_subscribed':
          console.log('Subscribed to thread:', message.data.threadId);
          break;

        case 'thread_unsubscribed':
          console.log('Unsubscribed from thread:', message.data.threadId);
          break;

        case 'pong':
          console.log('Received pong from server');
          break;

        case 'notification':
          if (message.data) {
            onNotification?.(message.data);
          }
          break;

        default:
          console.warn('Unknown WebSocket message type:', message.type);
      }
    },
    [onNewPost, onPostEdit, onPostDelete, onThreadLock, onUserStatusChange]
  );

  const { isConnected, isConnecting, error, sendMessage, reconnectAttempts } =
    useWebSocket({
      url: wsUrl,
      token,
      onMessage: handleMessage,
      onConnect: () => {
        console.log('WebSocket connected, re-subscribing to threads');
        // Re-subscribe to all threads on reconnect
        subscribedThreadsRef.current.forEach(threadId => {
          sendMessage({
            type: 'subscribe_thread',
            data: { threadId },
            timestamp: Date.now(),
          });
        });
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        // Clear typing indicators on disconnect
        setTypingUsers(new Map());
        // Clear typing timeouts
        typingTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
        typingTimeoutsRef.current.clear();
      },
    });

  const subscribeToThread = useCallback(
    (threadId: string) => {
      if (!isConnected) {
        console.warn('Cannot subscribe to thread: WebSocket not connected');
        return;
      }

      subscribedThreadsRef.current.add(threadId);
      sendMessage({
        type: 'subscribe_thread',
        data: { threadId },
        timestamp: Date.now(),
      });
    },
    [isConnected, sendMessage]
  );

  const unsubscribeFromThread = useCallback(
    (threadId: string) => {
      if (!isConnected) {
        return;
      }

      subscribedThreadsRef.current.delete(threadId);
      sendMessage({
        type: 'unsubscribe_thread',
        data: { threadId },
        timestamp: Date.now(),
      });

      // Clear typing indicators for this thread
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        newMap.delete(threadId);
        return newMap;
      });
    },
    [isConnected, sendMessage]
  );

  const startTyping = useCallback(
    (threadId: string) => {
      if (!isConnected) {
        return;
      }

      sendMessage({
        type: 'typing_start',
        data: { threadId },
        timestamp: Date.now(),
      });
    },
    [isConnected, sendMessage]
  );

  const stopTyping = useCallback(
    (threadId: string) => {
      if (!isConnected) {
        return;
      }

      sendMessage({
        type: 'typing_stop',
        data: { threadId },
        timestamp: Date.now(),
      });
    },
    [isConnected, sendMessage]
  );

  const sendPing = useCallback(() => {
    if (!isConnected) {
      return;
    }

    sendMessage({
      type: 'ping',
      data: {},
      timestamp: Date.now(),
    });
  }, [isConnected, sendMessage]);

  // Auto-subscribe to current thread
  useEffect(() => {
    if (threadId && isConnected) {
      subscribeToThread(threadId);

      return () => {
        unsubscribeFromThread(threadId);
      };
    }
  }, [threadId, isConnected, subscribeToThread, unsubscribeFromThread]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all typing timeouts
      typingTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      typingTimeoutsRef.current.clear();
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    error,
    onlineUsers,
    typingUsers,
    subscribeToThread,
    unsubscribeFromThread,
    startTyping,
    stopTyping,
    sendPing,
    reconnectAttempts,
  };
}
