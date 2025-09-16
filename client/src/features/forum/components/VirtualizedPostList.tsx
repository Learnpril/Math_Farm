/**
 * Virtualized post list component for efficient rendering of long threads
 * Only renders visible posts to maintain performance with hundreds of posts
 */

import React, { useMemo, useCallback, useState } from 'react';
import { VirtualizedList } from '../../../components/ui/VirtualizedList';
import { PostItem } from './PostItem';
import { Button } from '../../../components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface ForumPost {
  id: number;
  threadId: number;
  authorId: number;
  authorName: string;
  parentPostId?: number;
  content: string;
  mathExpressions?: any[];
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
  likeCount?: number;
  isLiked?: boolean;
  replies?: ForumPost[];
  authorAvatar?: any;
  authorAchievements?: string[];
  authorStats?: any;
}

interface VirtualizedPostListProps {
  posts: ForumPost[];
  className?: string;
  itemHeight?: number;
  containerHeight?: number;
  currentUserId?: number;
  isThreadLocked?: boolean;
  onReply?: (postId?: number) => void;
  onLike?: (postId: number) => void;
  onReport?: (postId: number) => void;
  onShare?: (postId: number) => void;
  onQuote?: (postId: number) => void;
  onEdit?: (
    postId: number,
    content?: any,
    editReason?: string
  ) => Promise<void>;
  enableVirtualization?: boolean;
}

/**
 * Virtualized post list that efficiently renders large numbers of posts
 */
export function VirtualizedPostList({
  posts,
  className,
  itemHeight = 200,
  containerHeight = 800,
  currentUserId,
  isThreadLocked = false,
  onReply,
  onLike,
  onReport,
  onShare,
  onQuote,
  onEdit,
  enableVirtualization = true,
}: VirtualizedPostListProps) {
  const [expandedPosts, setExpandedPosts] = useState<Set<number>>(new Set());
  const [showAllPosts, setShowAllPosts] = useState(false);

  // Flatten nested posts for virtualization
  const flattenedPosts = useMemo(() => {
    const flatten = (
      posts: ForumPost[],
      level = 0
    ): Array<ForumPost & { level: number }> => {
      const result: Array<ForumPost & { level: number }> = [];

      for (const post of posts) {
        result.push({ ...post, level });

        // Add replies if expanded and not too deeply nested
        if (expandedPosts.has(post.id) && post.replies && level < 3) {
          result.push(...flatten(post.replies, level + 1));
        }
      }

      return result;
    };

    return flatten(posts);
  }, [posts, expandedPosts]);

  // Determine if we should use virtualization
  const shouldVirtualize = useMemo(() => {
    if (!enableVirtualization) return false;
    return flattenedPosts.length > 20; // Virtualize for more than 20 posts
  }, [flattenedPosts.length, enableVirtualization]);

  // Handle post expansion
  const handleToggleExpansion = useCallback((postId: number) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  }, []);

  // Render individual post item
  const renderPost = useCallback(
    (postWithLevel: ForumPost & { level: number }, index: number) => (
      <PostItem
        post={postWithLevel}
        level={postWithLevel.level}
        expandedPosts={expandedPosts}
        onToggleExpansion={handleToggleExpansion}
        onReply={onReply}
        onLike={onLike}
        onReport={onReport}
        onShare={onShare}
        onQuote={onQuote}
        onEdit={onEdit}
        currentUserId={currentUserId}
        isThreadLocked={isThreadLocked}
        className='mb-4'
      />
    ),
    [
      expandedPosts,
      handleToggleExpansion,
      onReply,
      onLike,
      onReport,
      onShare,
      onQuote,
      onEdit,
      currentUserId,
      isThreadLocked,
    ]
  );

  // Get unique key for each post
  const getPostKey = useCallback(
    (postWithLevel: ForumPost & { level: number }, index: number) =>
      `post-${postWithLevel.id}-level-${postWithLevel.level}`,
    []
  );

  // Calculate dynamic item height based on content
  const calculateItemHeight = useCallback(
    (post: ForumPost & { level: number }) => {
      const baseHeight = 150;
      const contentHeight = Math.min(post.content.length / 5, 100); // Rough estimate
      const levelPadding = post.level * 20;
      return baseHeight + contentHeight + levelPadding;
    },
    []
  );

  // Show limited posts initially for better performance
  const displayPosts = useMemo(() => {
    if (showAllPosts || flattenedPosts.length <= 50) {
      return flattenedPosts;
    }
    return flattenedPosts.slice(0, 50);
  }, [flattenedPosts, showAllPosts]);

  if (posts.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <div className='text-center'>
          <div className='text-muted-foreground mb-2'>No posts found</div>
          <div className='text-sm text-muted-foreground'>
            Be the first to reply to this thread!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Post count and controls */}
      <div className='flex items-center justify-between'>
        <div className='text-sm text-muted-foreground'>
          {posts.length} posts ({flattenedPosts.length} including replies)
        </div>

        {flattenedPosts.length > 50 && !showAllPosts && (
          <Button
            variant='outline'
            size='sm'
            onClick={() => setShowAllPosts(true)}
          >
            Show all posts
          </Button>
        )}
      </div>

      {/* Posts list */}
      {shouldVirtualize ? (
        <VirtualizedList
          items={displayPosts}
          itemHeight={itemHeight}
          containerHeight={containerHeight}
          renderItem={renderPost}
          getItemKey={getPostKey}
          overscan={2}
          className='border border-border rounded-lg p-4'
        />
      ) : (
        <div className='space-y-4' role='list' aria-label='Forum posts'>
          {displayPosts.map((post, index) => (
            <div key={getPostKey(post, index)} role='listitem'>
              {renderPost(post, index)}
            </div>
          ))}
        </div>
      )}

      {/* Load more button for non-virtualized lists */}
      {!shouldVirtualize &&
        !showAllPosts &&
        flattenedPosts.length > displayPosts.length && (
          <div className='flex justify-center pt-4'>
            <Button variant='outline' onClick={() => setShowAllPosts(true)}>
              <ChevronDown className='h-4 w-4 mr-2' />
              Show {flattenedPosts.length - displayPosts.length} more posts
            </Button>
          </div>
        )}

      {/* Collapse button */}
      {showAllPosts && flattenedPosts.length > 50 && (
        <div className='flex justify-center pt-4'>
          <Button variant='outline' onClick={() => setShowAllPosts(false)}>
            <ChevronUp className='h-4 w-4 mr-2' />
            Show fewer posts
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Hook for managing post list virtualization settings
 */
export function usePostListVirtualization(
  posts: ForumPost[],
  options: {
    itemHeight?: number;
    containerHeight?: number;
    enableVirtualization?: boolean;
  } = {}
) {
  const {
    itemHeight = 200,
    containerHeight = 800,
    enableVirtualization = true,
  } = options;

  // Calculate if virtualization should be enabled
  const shouldVirtualize = useMemo(() => {
    if (!enableVirtualization) return false;

    // Count total posts including nested replies
    const countPosts = (posts: ForumPost[]): number => {
      return posts.reduce((count, post) => {
        return count + 1 + (post.replies ? countPosts(post.replies) : 0);
      }, 0);
    };

    const totalPosts = countPosts(posts);
    return totalPosts > 20;
  }, [posts, enableVirtualization]);

  // Calculate optimal item height based on content
  const optimalItemHeight = useMemo(() => {
    if (posts.length === 0) return itemHeight;

    const avgContentLength =
      posts.reduce((sum, post) => sum + post.content.length, 0) / posts.length;

    const baseHeight = 150;
    const contentHeight = Math.min(avgContentLength / 5, 100);

    return Math.max(baseHeight + contentHeight, itemHeight);
  }, [posts, itemHeight]);

  return {
    shouldVirtualize,
    itemHeight: optimalItemHeight,
    containerHeight,
    totalPosts: posts.length,
  };
}
