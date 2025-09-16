/**
 * Individual thread list item component optimized for virtualization
 * Lightweight component designed for efficient rendering in virtual lists
 */

import React, { memo } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { OptimizedImage } from '../../../components/ui/OptimizedImage';
import {
  MessageSquare,
  User,
  Clock,
  Pin,
  Lock,
  Calendar,
  TrendingUp,
} from 'lucide-react';
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
  authorAvatar?: string;
  excerpt?: string;
  tags?: string[];
  isHot?: boolean;
}

interface ThreadListItemProps {
  thread: ForumThread;
  onClick?: () => void;
  onAuthorClick?: () => void;
  isPinned?: boolean;
  className?: string;
  compact?: boolean;
  showExcerpt?: boolean;
  showTags?: boolean;
}

/**
 * Optimized thread list item component
 * Memoized to prevent unnecessary re-renders in virtual lists
 */
export const ThreadListItem = memo<ThreadListItemProps>(
  ({
    thread,
    onClick,
    onAuthorClick,
    isPinned = false,
    className,
    compact = false,
    showExcerpt = true,
    showTags = true,
  }) => {
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

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      onClick?.();
    };

    const handleAuthorClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onAuthorClick?.();
    };

    return (
      <Card
        className={cn(
          'hover:shadow-md transition-shadow cursor-pointer',
          isPinned && 'border-primary/50 bg-primary/5',
          thread.isHot &&
            'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950',
          className
        )}
        onClick={handleClick}
      >
        <CardContent className={cn('p-4', compact && 'p-3')}>
          <div className='flex items-start gap-3'>
            {/* Thread status indicators */}
            <div className='flex flex-col items-center gap-1 pt-1 flex-shrink-0'>
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
              {thread.isHot && (
                <TrendingUp
                  className='h-4 w-4 text-orange-500'
                  aria-label='Hot thread'
                />
              )}
              {!thread.isPinned && !thread.isLocked && !thread.isHot && (
                <MessageSquare className='h-4 w-4 text-muted-foreground' />
              )}
            </div>

            {/* Author avatar */}
            {!compact && (
              <div className='flex-shrink-0'>
                {thread.authorAvatar ? (
                  <OptimizedImage
                    src={thread.authorAvatar}
                    alt={`${thread.authorName}'s avatar`}
                    width={32}
                    height={32}
                    className='rounded-full cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all'
                    onClick={handleAuthorClick}
                    lazy={true}
                    placeholder='skeleton'
                  />
                ) : (
                  <div
                    className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors'
                    onClick={handleAuthorClick}
                  >
                    <User className='h-4 w-4 text-primary' />
                  </div>
                )}
              </div>
            )}

            {/* Thread content */}
            <div className='flex-1 min-w-0'>
              <div className='flex items-start justify-between gap-4'>
                <div className='flex-1 min-w-0'>
                  {/* Thread title */}
                  <h3
                    className={cn(
                      'font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors',
                      compact ? 'text-sm' : 'text-base'
                    )}
                  >
                    {thread.title}
                  </h3>

                  {/* Thread excerpt */}
                  {showExcerpt && thread.excerpt && !compact && (
                    <p className='text-sm text-muted-foreground mt-1 line-clamp-2'>
                      {thread.excerpt}
                    </p>
                  )}

                  {/* Thread metadata */}
                  <div
                    className={cn(
                      'flex items-center gap-3 mt-2 text-xs text-muted-foreground',
                      compact && 'gap-2'
                    )}
                  >
                    <button
                      onClick={handleAuthorClick}
                      className='flex items-center gap-1 hover:text-primary transition-colors'
                    >
                      {compact && <User className='h-3 w-3' />}
                      <span>{thread.authorName}</span>
                    </button>
                    <div className='flex items-center gap-1'>
                      <Calendar className='h-3 w-3' />
                      <span>{formatTimeAgo(thread.createdAt)}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {showTags &&
                    thread.tags &&
                    thread.tags.length > 0 &&
                    !compact && (
                      <div className='flex items-center gap-1 mt-2'>
                        {thread.tags.slice(0, 3).map((tag, index) => (
                          <Badge
                            key={index}
                            variant='secondary'
                            className='text-xs px-2 py-0.5'
                          >
                            {tag}
                          </Badge>
                        ))}
                        {thread.tags.length > 3 && (
                          <Badge
                            variant='outline'
                            className='text-xs px-2 py-0.5'
                          >
                            +{thread.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                </div>

                {/* Thread stats */}
                <div className='flex items-center gap-4 text-sm flex-shrink-0'>
                  <div className='text-center'>
                    <div
                      className={cn(
                        'font-semibold text-foreground',
                        compact ? 'text-sm' : 'text-base'
                      )}
                    >
                      {thread.postCount}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      {compact ? 'replies' : 'replies'}
                    </div>
                  </div>

                  {thread.lastPostAt && !compact && (
                    <div className='text-right min-w-0'>
                      <div className='flex items-center gap-1 text-muted-foreground'>
                        <Clock className='h-3 w-3' />
                        <span className='truncate text-xs'>
                          {formatTimeAgo(thread.lastPostAt)}
                        </span>
                      </div>
                      {thread.lastPostAuthor && (
                        <div className='text-xs text-muted-foreground truncate max-w-[100px]'>
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
  }
);

ThreadListItem.displayName = 'ThreadListItem';
