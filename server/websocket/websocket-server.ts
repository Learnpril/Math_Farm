import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import { ForumWebSocketMessage, WebSocketClient } from './types.js';

export class ForumWebSocketServer {
  private wss: WebSocketServer;
  private clients: Map<number, WebSocketClient> = new Map();
  private threadSubscriptions: Map<string, Set<number>> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({
      server,
      path: '/ws/forum',
    });

    this.wss.on('connection', this.handleConnection.bind(this));
  }

  private async handleConnection(ws: WebSocket, request: any) {
    try {
      // Extract JWT token from query parameters or headers
      const url = new URL(request.url!, `http://${request.headers.host}`);
      const token =
        url.searchParams.get('token') ||
        request.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        ws.close(1008, 'Authentication required');
        return;
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const userId = decoded.userId;

      if (!userId) {
        ws.close(1008, 'Invalid token');
        return;
      }

      // Create client object
      const client: WebSocketClient = {
        id: userId,
        ws,
        isOnline: true,
        lastSeen: new Date(),
        subscribedThreads: new Set(),
      };

      // Store client
      this.clients.set(userId, client);

      // Set up message handlers
      ws.on('message', data => this.handleMessage(userId, data));
      ws.on('close', () => this.handleDisconnection(userId));
      ws.on('error', error => this.handleError(userId, error));

      // Send connection confirmation
      this.sendToClient(userId, {
        type: 'connection_established',
        data: { userId },
        timestamp: Date.now(),
      });

      // Broadcast user online status
      this.broadcastUserStatus(userId, true);

      console.log(`WebSocket client connected: User ${userId}`);
    } catch (error) {
      console.error('WebSocket authentication failed:', error);
      ws.close(1008, 'Authentication failed');
    }
  }

  private handleMessage(userId: number, data: any) {
    try {
      const message = JSON.parse(data.toString()) as ForumWebSocketMessage;

      switch (message.type) {
        case 'subscribe_thread':
          this.subscribeToThread(userId, message.data.threadId);
          break;
        case 'unsubscribe_thread':
          this.unsubscribeFromThread(userId, message.data.threadId);
          break;
        case 'typing_start':
          this.handleTypingIndicator(userId, message.data.threadId, true);
          break;
        case 'typing_stop':
          this.handleTypingIndicator(userId, message.data.threadId, false);
          break;
        case 'ping':
          this.sendToClient(userId, {
            type: 'pong',
            data: {},
            timestamp: Date.now(),
          });
          break;
        default:
          console.warn(`Unknown WebSocket message type: ${message.type}`);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  private handleDisconnection(userId: number) {
    const client = this.clients.get(userId);
    if (client) {
      // Unsubscribe from all threads
      client.subscribedThreads.forEach(threadId => {
        this.unsubscribeFromThread(userId, threadId);
      });

      // Remove client
      this.clients.delete(userId);

      // Broadcast user offline status
      this.broadcastUserStatus(userId, false);

      console.log(`WebSocket client disconnected: User ${userId}`);
    }
  }

  private handleError(userId: number, error: Error) {
    console.error(`WebSocket error for user ${userId}:`, error);
  }

  private subscribeToThread(userId: number, threadId: string) {
    const client = this.clients.get(userId);
    if (!client) return;

    // Add to client's subscriptions
    client.subscribedThreads.add(threadId);

    // Add to thread subscribers
    if (!this.threadSubscriptions.has(threadId)) {
      this.threadSubscriptions.set(threadId, new Set());
    }
    this.threadSubscriptions.get(threadId)!.add(userId);

    // Confirm subscription
    this.sendToClient(userId, {
      type: 'thread_subscribed',
      data: { threadId },
      timestamp: Date.now(),
    });
  }

  private unsubscribeFromThread(userId: number, threadId: string) {
    const client = this.clients.get(userId);
    if (!client) return;

    // Remove from client's subscriptions
    client.subscribedThreads.delete(threadId);

    // Remove from thread subscribers
    const subscribers = this.threadSubscriptions.get(threadId);
    if (subscribers) {
      subscribers.delete(userId);
      if (subscribers.size === 0) {
        this.threadSubscriptions.delete(threadId);
      }
    }

    // Confirm unsubscription
    this.sendToClient(userId, {
      type: 'thread_unsubscribed',
      data: { threadId },
      timestamp: Date.now(),
    });
  }

  private handleTypingIndicator(
    userId: number,
    threadId: string,
    isTyping: boolean
  ) {
    const subscribers = this.threadSubscriptions.get(threadId);
    if (!subscribers) return;

    // Broadcast typing indicator to other subscribers
    const message: ForumWebSocketMessage = {
      type: isTyping ? 'user_typing_start' : 'user_typing_stop',
      data: { userId, threadId },
      timestamp: Date.now(),
    };

    subscribers.forEach(subscriberId => {
      if (subscriberId !== userId) {
        this.sendToClient(subscriberId, message);
      }
    });
  }

  private broadcastUserStatus(userId: number, isOnline: boolean) {
    const message: ForumWebSocketMessage = {
      type: 'user_status_change',
      data: { userId, isOnline },
      timestamp: Date.now(),
    };

    // Broadcast to all connected clients
    this.clients.forEach((client, clientId) => {
      if (clientId !== userId) {
        this.sendToClient(clientId, message);
      }
    });
  }

  private sendToClient(userId: number, message: ForumWebSocketMessage) {
    const client = this.clients.get(userId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error(`Error sending message to user ${userId}:`, error);
      }
    }
  }

  // Public methods for broadcasting events
  public broadcastNewPost(threadId: string, postData: any) {
    const subscribers = this.threadSubscriptions.get(threadId);
    if (!subscribers) return;

    const message: ForumWebSocketMessage = {
      type: 'new_post',
      data: { threadId, post: postData },
      timestamp: Date.now(),
    };

    subscribers.forEach(userId => {
      this.sendToClient(userId, message);
    });
  }

  public broadcastPostEdit(threadId: string, postData: any) {
    const subscribers = this.threadSubscriptions.get(threadId);
    if (!subscribers) return;

    const message: ForumWebSocketMessage = {
      type: 'post_edited',
      data: { threadId, post: postData },
      timestamp: Date.now(),
    };

    subscribers.forEach(userId => {
      this.sendToClient(userId, message);
    });
  }

  public broadcastPostDelete(threadId: string, postId: number) {
    const subscribers = this.threadSubscriptions.get(threadId);
    if (!subscribers) return;

    const message: ForumWebSocketMessage = {
      type: 'post_deleted',
      data: { threadId, postId },
      timestamp: Date.now(),
    };

    subscribers.forEach(userId => {
      this.sendToClient(userId, message);
    });
  }

  public broadcastThreadLock(threadId: string, isLocked: boolean) {
    const subscribers = this.threadSubscriptions.get(threadId);
    if (!subscribers) return;

    const message: ForumWebSocketMessage = {
      type: 'thread_locked',
      data: { threadId, isLocked },
      timestamp: Date.now(),
    };

    subscribers.forEach(userId => {
      this.sendToClient(userId, message);
    });
  }

  public getOnlineUsers(): number[] {
    return Array.from(this.clients.keys());
  }

  public isUserOnline(userId: number): boolean {
    return this.clients.has(userId);
  }

  public getThreadSubscribers(threadId: string): number[] {
    const subscribers = this.threadSubscriptions.get(threadId);
    return subscribers ? Array.from(subscribers) : [];
  }

  // Send notification to specific user
  public sendNotificationToUser(userId: number, notification: any) {
    const message: ForumWebSocketMessage = {
      type: 'notification',
      data: notification,
      timestamp: Date.now(),
    };

    this.sendToClient(userId, message);
  }

  // Graceful shutdown
  public close() {
    this.clients.forEach(client => {
      client.ws.close(1001, 'Server shutting down');
    });
    this.wss.close();
  }
}
