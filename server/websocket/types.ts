import { WebSocket } from 'ws';

export interface ForumWebSocketMessage {
  type:
    | 'new_post'
    | 'post_edited'
    | 'post_deleted'
    | 'thread_locked'
    | 'user_online'
    | 'user_offline'
    | 'user_typing_start'
    | 'user_typing_stop'
    | 'subscribe_thread'
    | 'unsubscribe_thread'
    | 'thread_subscribed'
    | 'thread_unsubscribed'
    | 'connection_established'
    | 'user_status_change'
    | 'ping'
    | 'pong'
    | 'typing_start'
    | 'typing_stop'
    | 'notification';
  data: any;
  timestamp: number;
  threadId?: string;
}

export interface WebSocketClient {
  id: number;
  ws: WebSocket;
  isOnline: boolean;
  lastSeen: Date;
  subscribedThreads: Set<string>;
}

export interface TypingIndicator {
  userId: number;
  threadId: string;
  timestamp: number;
}

export interface OnlineStatus {
  userId: number;
  isOnline: boolean;
  lastSeen?: Date;
}
