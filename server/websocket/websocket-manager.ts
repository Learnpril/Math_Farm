import { ForumWebSocketServer } from './websocket-server.js';
import { Server } from 'http';

let wsServer: ForumWebSocketServer | null = null;

export function initializeWebSocket(httpServer: Server): ForumWebSocketServer {
  if (wsServer) {
    return wsServer;
  }

  wsServer = new ForumWebSocketServer(httpServer);

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('Shutting down WebSocket server...');
    wsServer?.close();
  });

  process.on('SIGINT', () => {
    console.log('Shutting down WebSocket server...');
    wsServer?.close();
  });

  return wsServer;
}

export function getWebSocketServer(): ForumWebSocketServer | null {
  return wsServer;
}

// Helper functions for broadcasting events
export function broadcastNewPost(threadId: string, postData: any) {
  wsServer?.broadcastNewPost(threadId, postData);
}

export function broadcastPostEdit(threadId: string, postData: any) {
  wsServer?.broadcastPostEdit(threadId, postData);
}

export function broadcastPostDelete(threadId: string, postId: number) {
  wsServer?.broadcastPostDelete(threadId, postId);
}

export function broadcastThreadLock(threadId: string, isLocked: boolean) {
  wsServer?.broadcastThreadLock(threadId, isLocked);
}

export function getOnlineUsers(): number[] {
  return wsServer?.getOnlineUsers() || [];
}

export function isUserOnline(userId: number): boolean {
  return wsServer?.isUserOnline(userId) || false;
}

export function getThreadSubscribers(threadId: string): number[] {
  return wsServer?.getThreadSubscribers(threadId) || [];
}
