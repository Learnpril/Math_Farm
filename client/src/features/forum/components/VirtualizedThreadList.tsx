/**
 * Virtualized thread list component for efficient rendering of large thread lists
 * Only renders visible threads to maintain performance with thousands of threads
 */

import React, { useMemo, useCallback } from 'react';
import { VirtualizedList } from '../../../components/ui/VirtualizedList';
import { ThreadListItem } from './ThreadListItem';
import { cn } from '../../../lib/utils';

interface ForumThread {
  id: number;
  title: string;
  categoryId: number;
  authorId: number;
  authorName: string;
  isPinned: boolean;
  isLocked: boolean;
  postCount: number;
  lastPostAt?: Date;
  createdAt: Date;
  lastPostAuthor?: string;
}

interface VirtualizedThreadListProps {
  threads: ForumThread[];
  className?: string;
  itemHeight?: number;
  containerHeight?: number;
  onThreadClick?: (threadId: number) => void;
  onAuthorClick?: (authorId: number) => void;
  showPinnedSeparately?: boolean;
}

/**
 * Virtualized thread list that efficiently renders large numbers of threads
 */
export function VirtualizedThreadList({
  threads,
  className,
  itemHeight = 120,
  containerHeight = 600,
  onThreadClick,
  onAuthorClick,
  showPinnedSeparately = true,
}: VirtualizedThreadListProps) {
  // Separate pinned and regular threads
  const { pinnedThreads, regularThreads } = useMemo(() => {
    if (!showPinnedSeparately) {
      return { pinnedThreads: [], regularThreads: threads };
    }

    return {
      pinnedThreads: threads.filter(thread => thread.isPinned),
      regularThreads: threads.filter(thread => !thread.isPinned),
    };
  }, [threads, showPinnedSeparately]);

  // Render individual thread item
  const renderThread = useCallback(
    (thread: ForumThread, index: number) => (
      <ThreadListItem
        thread={thread}
        onClick={() => onThreadClick?.(thread.id)}
        onAuthorClick={() => onAuthorClick?.(thread.authorId)}
        isPinned={thread.isPinned}
        className='mx-2 mb-2'
      />
    ),
    [onThreadClick, onAuthorClick]
  );

  // Get unique key for each thread
  const getThreadKey = useCallback(
    (thread: ForumThread, index: number) => `thread-${thread.id}`,
    []
  );

  if (threads.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <div className='text-center'>
          <div className='text-muted-foreground mb-2'>No threads found</div>
          <div className='text-sm text-muted-foreground'>
            Be the first to start a discussion!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Pinned threads (non-virtualized for better UX) */}
      {pinnedThreads.length > 0 && (
        <div className='space-y-2'>
          <div className='text-sm font-medium text-muted-foreground px-2'>
            Pinned Threads
          </div>
          <div className='space-y-2'>
            {pinnedThreads.map((thread, index) => (
              <div key={getThreadKey(thread, index)}>
                {renderThread(thread, index)}
              </div>
            ))}
          </div>
          {regularThreads.length > 0 && (
            <div className='border-t border-border pt-4'>
              <div className='text-sm font-medium text-muted-foreground px-2 mb-2'>
                All Threads
              </div>
            </div>
          )}
        </div>
      )}

      {/* Regular threads (virtualized) */}
      {regularThreads.length > 0 && (
        <VirtualizedList
          items={regularThreads}
          itemHeight={itemHeight}
          containerHeight={containerHeight}
          renderItem={renderThread}
          getItemKey={getThreadKey}
          overscan={3}
          className='border border-border rounded-lg'
        />
      )}
    </div>
  );
}

/**
 * Hook for calculating optimal item height based on content
 */
export function useThreadItemHeight(threads: ForumThread[]) {
  return useMemo(() => {
    // Calculate average title length to estimate height
    const avgTitleLength =
      threads.reduce((sum, thread) => sum + thread.title.length, 0) /
      threads.length;

    // Base height + extra for longer titles
    const baseHeight = 100;
    const extraHeight = Math.min(Math.floor(avgTitleLength / 50) * 20, 40);

    return baseHeight + extraHeight;
  }, [threads]);
}

/**
 * Hook for managing virtualized thread list state
 */
export function useVirtualizedThreadList(
  threads: ForumThread[],
  options: {
    itemHeight?: number;
    containerHeight?: number;
    enableVirtualization?: boolean;
  } = {}
) {
  const {
    itemHeight = 120,
    containerHeight = 600,
    enableVirtualization = true,
  } = options;

  // Auto-calculate item height if not provided
  const calculatedItemHeight = useThreadItemHeight(threads);
  const finalItemHeight = itemHeight || calculatedItemHeight;

  // Determine if virtualization should be enabled
  const shouldVirtualize = useMemo(() => {
    if (!enableVirtualization) return false;

    // Enable virtualization for lists with many items
    const totalHeight = threads.length * finalItemHeight;
    return totalHeight > containerHeight * 2;
  }, [threads.length, finalItemHeight, containerHeight, enableVirtualization]);

  return {
    itemHeight: finalItemHeight,
    containerHeight,
    shouldVirtualize,
    threadCount: threads.length,
  };
}
