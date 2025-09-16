import React, { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  MessageSquare,
  User,
  Clock,
  Pin,
  Lock,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Calendar,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import {
  VirtualizedThreadList,
  useVirtualizedThreadList,
} from './VirtualizedThreadList';

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

interface ThreadListProps {
  threads: ForumThread[];
  className?: string;
  showPagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  sortBy?: 'recent' | 'popular' | 'oldest' | 'title';
  onSortChange?: (sort: 'recent' | 'popular' | 'oldest' | 'title') => void;
  enableVirtualization?: boolean;
  containerHeight?: number;
}

/**
 * Forum thread list component with pagination and sorting
 * Displays thread information with status indicators and activity data
 */
export function ThreadList({
  threads,
  className = '',
  showPagination = true,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  sortBy = 'recent',
  onSortChange,
  enableVirtualization = true,
  containerHeight = 600,
}: ThreadListProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Use virtualization settings
  const virtualizationSettings = useVirtualizedThreadList(threads, {
    containerHeight,
    enableVirtualization,
  });

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    const diffInMonths = Math.floor(diffInWeeks / 4);
    return `${diffInMonths}mo ago`;
  };

  const handleSortChange = (newSort: typeof sortBy) => {
    if (newSort === sortBy) {
      // Toggle sort order if same sort type
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Change sort type
      onSortChange?.(newSort);
      setSortOrder('desc');
    }
  };

  // Separate pinned and regular threads
  const pinnedThreads = threads.filter(thread => thread.isPinned);
  const regularThreads = threads.filter(thread => !thread.isPinned);

  const ThreadItem = ({ thread }: { thread: ForumThread }) => (
    <Card className='hover:shadow-md transition-shadow'>
      <CardContent className='p-4'>
        <div className='flex items-start gap-4'>
          {/* Thread status indicators */}
          <div className='flex flex-col items-center gap-1 pt-1'>
            {thread.isPinned && (
              <Pin
                className='h-4 w-4 text-primary'
                aria-label='Pinned thread'
              />
            )}
            {thread.isLocked && (
              <Lock
                className='h-4 w-4 text-muted-foreground'
                aria-label='Locked thread'
              />
            )}
            {!thread.isPinned && !thread.isLocked && (
              <MessageSquare className='h-4 w-4 text-muted-foreground' />
            )}
          </div>

          {/* Thread content */}
          <div className='flex-1 min-w-0'>
            <div className='flex items-start justify-between gap-4'>
              <div className='flex-1 min-w-0'>
                <h3 className='font-semibold text-foreground'>
                  <Link
                    href={`/forum/thread/${thread.id}`}
                    className='hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm'
                  >
                    {thread.title}
                  </Link>
                </h3>

                <div className='flex items-center gap-3 mt-2 text-sm text-muted-foreground'>
                  <div className='flex items-center gap-1'>
                    <User className='h-3 w-3' />
                    <span>{thread.authorName}</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Calendar className='h-3 w-3' />
                    <span>{formatTimeAgo(thread.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Thread stats */}
              <div className='flex items-center gap-4 text-sm'>
                <div className='text-center'>
                  <div className='font-semibold text-foreground'>
                    {thread.postCount}
                  </div>
                  <div className='text-xs text-muted-foreground'>replies</div>
                </div>

                {thread.lastPostAt && (
                  <div className='text-right min-w-0'>
                    <div className='flex items-center gap-1 text-muted-foreground'>
                      <Clock className='h-3 w-3' />
                      <span className='truncate'>
                        {formatTimeAgo(thread.lastPostAt)}
                      </span>
                    </div>
                    {thread.lastPostAuthor && (
                      <div className='text-xs text-muted-foreground truncate'>
                        by {thread.lastPostAuthor}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* Sort controls */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-muted-foreground'>Sort by:</span>
          <div className='flex items-center gap-1'>
            <Button
              variant={sortBy === 'recent' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => handleSortChange('recent')}
              className='h-8'
            >
              Recent
              {sortBy === 'recent' &&
                (sortOrder === 'desc' ? (
                  <ArrowDown className='h-3 w-3 ml-1' />
                ) : (
                  <ArrowUp className='h-3 w-3 ml-1' />
                ))}
            </Button>
            <Button
              variant={sortBy === 'popular' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => handleSortChange('popular')}
              className='h-8'
            >
              Popular
              {sortBy === 'popular' &&
                (sortOrder === 'desc' ? (
                  <ArrowDown className='h-3 w-3 ml-1' />
                ) : (
                  <ArrowUp className='h-3 w-3 ml-1' />
                ))}
            </Button>
            <Button
              variant={sortBy === 'title' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => handleSortChange('title')}
              className='h-8'
            >
              Title
              {sortBy === 'title' &&
                (sortOrder === 'desc' ? (
                  <ArrowDown className='h-3 w-3 ml-1' />
                ) : (
                  <ArrowUp className='h-3 w-3 ml-1' />
                ))}
            </Button>
          </div>
        </div>

        <div className='text-sm text-muted-foreground'>
          {threads.length} threads
        </div>
      </div>

      {/* Thread list - use virtualization for better performance */}
      {virtualizationSettings.shouldVirtualize ? (
        <VirtualizedThreadList
          threads={threads}
          containerHeight={virtualizationSettings.containerHeight}
          itemHeight={virtualizationSettings.itemHeight}
          onThreadClick={threadId => {
            // Navigate to thread
            window.location.href = `/forum/thread/${threadId}`;
          }}
          onAuthorClick={authorId => {
            // Navigate to user profile
            window.location.href = `/forum/user/${authorId}`;
          }}
          showPinnedSeparately={true}
          className='min-h-[400px]'
        />
      ) : (
        <div className='space-y-3' role='list' aria-label='Forum threads'>
          {/* Pinned threads */}
          {pinnedThreads.length > 0 && (
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <Pin className='h-4 w-4 text-primary' />
                <Badge variant='secondary' className='text-xs'>
                  Pinned Threads
                </Badge>
              </div>
              {pinnedThreads.map(thread => (
                <div key={thread.id} role='listitem'>
                  <ThreadItem thread={thread} />
                </div>
              ))}
            </div>
          )}

          {/* Regular threads */}
          {regularThreads.length > 0 && (
            <div className='space-y-3'>
              {pinnedThreads.length > 0 && (
                <div className='border-t border-border pt-4'>
                  <Badge variant='outline' className='text-xs'>
                    All Threads
                  </Badge>
                </div>
              )}
              {regularThreads.map(thread => (
                <div key={thread.id} role='listitem'>
                  <ThreadItem thread={thread} />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {threads.length === 0 && (
            <Card>
              <CardContent className='p-8 text-center'>
                <MessageSquare className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
                <h3 className='text-lg font-semibold mb-2'>No threads found</h3>
                <p className='text-muted-foreground'>
                  Be the first to start a discussion in this category!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className='flex items-center justify-center gap-2 pt-4'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className='h-4 w-4 mr-1' />
            Previous
          </Button>

          <div className='flex items-center gap-1'>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => onPageChange?.(page)}
                  className='w-8 h-8 p-0'
                >
                  {page}
                </Button>
              );
            })}

            {totalPages > 5 && (
              <>
                <span className='text-muted-foreground'>...</span>
                <Button
                  variant={currentPage === totalPages ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => onPageChange?.(totalPages)}
                  className='w-8 h-8 p-0'
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>

          <Button
            variant='outline'
            size='sm'
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
            <ChevronRight className='h-4 w-4 ml-1' />
          </Button>
        </div>
      )}
    </div>
  );
}
