import React, { useState, useEffect } from 'react';
import {
  Activity,
  MessageSquare,
  FileText,
  User,
  Hash,
  Clock,
  Loader2,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { useForumApi } from '../hooks/useForumApi';
import type { ActivityFeedItem } from '../../../../shared/forum-types';

interface ActivityFeedProps {
  onItemClick?: (item: ActivityFeedItem) => void;
  className?: string;
}

export function ActivityFeed({
  onItemClick,
  className = '',
}: ActivityFeedProps) {
  const [feedItems, setFeedItems] = useState<ActivityFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { apiCall } = useForumApi();

  useEffect(() => {
    loadActivityFeed();
  }, []);

  const loadActivityFeed = async (pageNum = 1, append = false) => {
    if (pageNum === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    try {
      const response = await apiCall(
        `/api/forum/discovery/activity-feed?page=${pageNum}&limit=20`,
        {
          method: 'GET',
        }
      );

      if (response.success) {
        const newItems = response.data.items;

        if (append) {
          setFeedItems(prev => [...prev, ...newItems]);
        } else {
          setFeedItems(newItems);
        }

        setHasMore(response.data.hasMore);
        setPage(pageNum);
      } else {
        setError(response.error || 'Failed to load activity feed');
      }
    } catch (err) {
      console.error('Load activity feed error:', err);
      setError('Failed to load activity feed');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      loadActivityFeed(page + 1, true);
    }
  };

  const handleItemClick = (item: ActivityFeedItem) => {
    onItemClick?.(item);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <MessageSquare className='h-4 w-4' />;
      case 'thread':
        return <FileText className='h-4 w-4' />;
      default:
        return <Activity className='h-4 w-4' />;
    }
  };

  const getActivityText = (item: ActivityFeedItem) => {
    switch (item.type) {
      case 'post':
        return `replied to "${item.thread?.title}"`;
      case 'thread':
        return `started a new discussion`;
      default:
        return 'activity';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Activity className='h-5 w-5 text-primary' />
          Activity Feed
        </CardTitle>
      </CardHeader>

      <CardContent>
        {isLoading && (
          <div className='space-y-4'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className='animate-pulse flex gap-3'>
                <div className='w-8 h-8 bg-muted rounded-full'></div>
                <div className='flex-1'>
                  <div className='h-4 bg-muted rounded w-3/4 mb-2'></div>
                  <div className='h-3 bg-muted rounded w-1/2'></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className='text-center py-4'>
            <p className='text-destructive text-sm mb-2'>{error}</p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => loadActivityFeed()}
            >
              Try Again
            </Button>
          </div>
        )}

        {!isLoading && !error && feedItems.length === 0 && (
          <div className='text-center py-8 text-muted-foreground'>
            <Activity className='h-8 w-8 mx-auto mb-2 opacity-50' />
            <p className='text-sm mb-2'>No activity to show</p>
            <p className='text-xs'>Follow users to see their activity here</p>
          </div>
        )}

        {!isLoading && !error && feedItems.length > 0 && (
          <div className='space-y-4'>
            {feedItems.map(item => (
              <div
                key={`${item.type}-${item.id}`}
                className='group cursor-pointer p-3 rounded-lg border hover:bg-muted/50 transition-colors'
                onClick={() => handleItemClick(item)}
              >
                <div className='flex gap-3'>
                  {/* Activity Icon */}
                  <div className='flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary'>
                    {getActivityIcon(item.type)}
                  </div>

                  <div className='flex-1 min-w-0'>
                    {/* Activity Header */}
                    <div className='flex items-center gap-2 text-sm'>
                      <span className='font-medium'>
                        {item.author.username}
                      </span>
                      <span className='text-muted-foreground'>
                        {getActivityText(item)}
                      </span>
                    </div>

                    {/* Content Preview */}
                    <div className='mt-1'>
                      <p className='text-sm text-muted-foreground line-clamp-2'>
                        {item.content}
                      </p>
                    </div>

                    {/* Metadata */}
                    <div className='flex items-center gap-3 mt-2 text-xs text-muted-foreground'>
                      {item.thread && (
                        <>
                          <div className='flex items-center gap-1'>
                            <Hash className='h-3 w-3' />
                            <span>{item.thread.category.name}</span>
                          </div>
                          <span>•</span>
                        </>
                      )}

                      <div className='flex items-center gap-1'>
                        <Clock className='h-3 w-3' />
                        <span>{formatTimeAgo(item.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className='text-center pt-4'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className='flex items-center gap-2'
                >
                  {isLoadingMore && (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  )}
                  Load More Activity
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
