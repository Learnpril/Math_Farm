import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Pin, Lock, MessageSquare, Share2, Reply } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { PostItem } from './PostItem';
import { useRealTimeUpdates } from '../hooks/useRealTimeUpdates';
import { TypingIndicator } from './TypingIndicator';
import { WebSocketStatus } from './WebSocketStatus';
import { ForumPost } from '../types';

// Remove duplicate interface - using imported ForumPost

interface ForumThread {
  id: number;
  title: string;
  categoryId: number;
  categoryName: string;
  authorId: number;
  authorName: string;
  isPinned: boolean;
  isLocked: boolean;
  postCount: number;
  lastPostAt?: Date;
  createdAt: Date;
}

interface ThreadViewProps {
  thread: ForumThread;
  posts: ForumPost[];
  className?: string;
  onReply?: (postId?: number) => void;
  onLike?: (postId: number) => void;
  onReport?: (postId: number) => void;
  onShare?: (postId: number) => void;
  currentUserId?: number;
  authToken?: string;
  onPostsUpdate?: (posts: ForumPost[]) => void;
}

/**
 * Thread view component that displays a forum thread with nested posts
 * Supports post interactions like replies, likes, and reporting
 */
export function ThreadView({
  thread,
  posts,
  className = '',
  onReply,
  onLike,
  onReport,
  onShare,
  currentUserId,
  authToken,
  onPostsUpdate,
}: ThreadViewProps) {
  const [expandedPosts, setExpandedPosts] = useState<Set<number>>(new Set());
  const [sortBy, setSortBy] = useState<'chronological' | 'popular'>(
    'chronological'
  );
  const [localPosts, setLocalPosts] = useState<ForumPost[]>(posts);
  const [isThreadLocked, setIsThreadLocked] = useState(thread.isLocked);

  // Real-time updates
  const {
    isConnected,
    isConnecting,
    error,
    typingUsers,
    reconnectAttempts,
    startTyping,
    stopTyping,
  } = useRealTimeUpdates({
    token: authToken,
    threadId: thread.id.toString(),
    onNewPost: useCallback(
      (newPost: ForumPost) => {
        setLocalPosts(prev => {
          const updated = [...prev, newPost];
          onPostsUpdate?.(updated);
          return updated;
        });
      },
      [onPostsUpdate]
    ),
    onPostEdit: useCallback(
      (editedPost: ForumPost) => {
        setLocalPosts(prev => {
          const updated = prev.map(post =>
            post.id === editedPost.id ? editedPost : post
          );
          onPostsUpdate?.(updated);
          return updated;
        });
      },
      [onPostsUpdate]
    ),
    onPostDelete: useCallback(
      (deletedPostId: number) => {
        setLocalPosts(prev => {
          const updated = prev.filter(post => post.id !== deletedPostId);
          onPostsUpdate?.(updated);
          return updated;
        });
      },
      [onPostsUpdate]
    ),
    onThreadLock: useCallback(
      (threadId: string, locked: boolean) => {
        if (threadId === thread.id.toString()) {
          setIsThreadLocked(locked);
        }
      },
      [thread.id]
    ),
  });

  // Update local posts when props change
  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  // Get typing indicator data for current thread
  const currentThreadTyping =
    typingUsers.get(thread.id.toString()) || new Set();
  const typingUserNames = Array.from(currentThreadTyping)
    .filter(userId => userId !== currentUserId)
    .map(userId => `User ${userId}`); // In real app, you'd fetch user names

  // Build nested post structure
  const buildPostTree = (posts: ForumPost[]): ForumPost[] => {
    const postMap = new Map<number, ForumPost>();
    const rootPosts: ForumPost[] = [];

    // First pass: create map and initialize replies arrays
    posts.forEach(post => {
      postMap.set(post.id, { ...post, replies: [] });
    });

    // Second pass: build tree structure
    posts.forEach(post => {
      const postWithReplies = postMap.get(post.id)!;

      if (post.parentPostId) {
        const parent = postMap.get(post.parentPostId);
        if (parent) {
          parent.replies!.push(postWithReplies);
        }
      } else {
        rootPosts.push(postWithReplies);
      }
    });

    return rootPosts;
  };

  const nestedPosts = buildPostTree(localPosts);

  const togglePostExpansion = (postId: number) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedPosts(newExpanded);
  };

  const sortPosts = (posts: ForumPost[]): ForumPost[] => {
    return [...posts].sort((a, b) => {
      if (sortBy === 'popular') {
        return (b.likeCount || 0) - (a.likeCount || 0);
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Thread header */}
      <Card>
        <CardHeader>
          <div className='flex items-start justify-between gap-4'>
            <div className='flex-1'>
              <div className='flex items-center gap-2 mb-2'>
                {thread.isPinned && (
                  <Badge
                    variant='secondary'
                    className='flex items-center gap-1'
                  >
                    <Pin className='h-3 w-3' />
                    Pinned
                  </Badge>
                )}
                {isThreadLocked && (
                  <Badge variant='outline' className='flex items-center gap-1'>
                    <Lock className='h-3 w-3' />
                    Locked
                  </Badge>
                )}
                <Badge variant='outline'>{thread.categoryName}</Badge>
              </div>

              <h1 className='text-2xl font-bold text-foreground mb-2'>
                {thread.title}
              </h1>

              <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                <span>Started by {thread.authorName}</span>
                <span>•</span>
                <span>{thread.postCount} replies</span>
                <span>•</span>
                <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Thread actions */}
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => onShare?.(posts[0]?.id)}
              >
                <Share2 className='h-4 w-4 mr-1' />
                Share
              </Button>

              {!isThreadLocked && (
                <Button size='sm' onClick={() => onReply?.()}>
                  <Reply className='h-4 w-4 mr-1' />
                  Reply
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Sort controls */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-muted-foreground'>Sort by:</span>
          <Button
            variant={sortBy === 'chronological' ? 'default' : 'ghost'}
            size='sm'
            onClick={() => setSortBy('chronological')}
          >
            Chronological
          </Button>
          <Button
            variant={sortBy === 'popular' ? 'default' : 'ghost'}
            size='sm'
            onClick={() => setSortBy('popular')}
          >
            Popular
          </Button>
        </div>

        <div className='flex items-center gap-4'>
          <div className='text-sm text-muted-foreground'>
            {localPosts.length} posts
          </div>
          <WebSocketStatus
            isConnected={isConnected}
            isConnecting={isConnecting}
            error={error}
            reconnectAttempts={reconnectAttempts}
          />
        </div>
      </div>

      {/* Typing indicator */}
      {typingUserNames.length > 0 && (
        <TypingIndicator userNames={typingUserNames} />
      )}

      {/* Posts */}
      <div className='space-y-4' role='list' aria-label='Forum posts'>
        {sortPosts(nestedPosts).map(post => (
          <PostItem
            key={post.id}
            post={post}
            level={0}
            expandedPosts={expandedPosts}
            onToggleExpansion={togglePostExpansion}
            onReply={onReply}
            onLike={onLike}
            onReport={onReport}
            onShare={onShare}
            currentUserId={currentUserId}
            isThreadLocked={isThreadLocked}
            onStartTyping={() => startTyping(thread.id.toString())}
            onStopTyping={() => stopTyping(thread.id.toString())}
          />
        ))}
      </div>

      {/* Empty state */}
      {localPosts.length === 0 && (
        <Card>
          <CardContent className='p-8 text-center'>
            <MessageSquare className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
            <h3 className='text-lg font-semibold mb-2'>No posts yet</h3>
            <p className='text-muted-foreground mb-4'>
              Be the first to contribute to this discussion!
            </p>
            {!isThreadLocked && (
              <Button onClick={() => onReply?.()}>
                <Reply className='h-4 w-4 mr-1' />
                Start the conversation
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reply button for locked threads */}
      {isThreadLocked && (
        <Card>
          <CardContent className='p-4 text-center'>
            <Lock className='h-8 w-8 mx-auto mb-2 text-muted-foreground' />
            <p className='text-muted-foreground'>
              This thread is locked and no longer accepting new replies.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
