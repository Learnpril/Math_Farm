import React, { useState, useEffect } from 'react';
import { Flame, Eye, Heart, MessageSquare, User, Hash } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { useForumApi } from '../hooks/useForumApi';
import type { PopularDiscussion } from '../../../../shared/forum-types';

interface PopularDiscussionsProps {
  timeframe?: 'day' | 'week' | 'month';
  limit?: number;
  onDiscussionClick?: (discussion: PopularDiscussion) => void;
  className?: string;
}

export function PopularDiscussions({
  timeframe = 'week',
  limit = 10,
  onDiscussionClick,
  className = '',
}: PopularDiscussionsProps) {
  const [discussions, setDiscussions] = useState<PopularDiscussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);

  const { apiCall } = useForumApi();

  useEffect(() => {
    loadPopularDiscussions();
  }, [selectedTimeframe, limit]);

  const loadPopularDiscussions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiCall(
        `/api/forum/discovery/popular?timeframe=${selectedTimeframe}&limit=${limit}`,
        {
          method: 'GET',
        }
      );

      if (response.success) {
        setDiscussions(response.data);
      } else {
        setError(response.error || 'Failed to load popular discussions');
      }
    } catch (err) {
      console.error('Load popular discussions error:', err);
      setError('Failed to load popular discussions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscussionClick = (discussion: PopularDiscussion) => {
    onDiscussionClick?.(discussion);
  };

  const formatPopularityScore = (score: number) => {
    if (score >= 1000) {
      return `${(score / 1000).toFixed(1)}k`;
    }
    return Math.round(score).toString();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2'>
            <Flame className='h-5 w-5 text-orange-500' />
            Popular Discussions
          </CardTitle>

          <div className='flex items-center gap-1'>
            {(['day', 'week', 'month'] as const).map(period => (
              <Button
                key={period}
                variant={selectedTimeframe === period ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setSelectedTimeframe(period)}
                className='text-xs'
              >
                {period === 'day' ? '24h' : period === 'week' ? '7d' : '30d'}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading && (
          <div className='space-y-3'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className='animate-pulse'>
                <div className='h-4 bg-muted rounded w-3/4 mb-2'></div>
                <div className='h-3 bg-muted rounded w-1/2'></div>
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
              onClick={loadPopularDiscussions}
            >
              Try Again
            </Button>
          </div>
        )}

        {!isLoading && !error && discussions.length === 0 && (
          <div className='text-center py-4 text-muted-foreground'>
            <Flame className='h-8 w-8 mx-auto mb-2 opacity-50' />
            <p className='text-sm'>No popular discussions found</p>
          </div>
        )}

        {!isLoading && !error && discussions.length > 0 && (
          <div className='space-y-3'>
            {discussions.map((discussion, index) => (
              <div
                key={discussion.id}
                className='group cursor-pointer p-3 rounded-lg border hover:bg-muted/50 transition-colors'
                onClick={() => handleDiscussionClick(discussion)}
              >
                <div className='flex items-start gap-3'>
                  {/* Popularity Rank */}
                  <div className='flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center'>
                    <span className='text-xs font-bold text-orange-500'>
                      {index + 1}
                    </span>
                  </div>

                  <div className='flex-1 min-w-0'>
                    {/* Discussion Title */}
                    <h4 className='font-medium text-sm group-hover:text-primary transition-colors truncate'>
                      {discussion.title}
                    </h4>

                    {/* Metadata */}
                    <div className='flex items-center gap-3 mt-1 text-xs text-muted-foreground'>
                      <div className='flex items-center gap-1'>
                        <User className='h-3 w-3' />
                        <span>{discussion.author.username}</span>
                      </div>

                      <div className='flex items-center gap-1'>
                        <Hash className='h-3 w-3' />
                        <span>{discussion.category.name}</span>
                      </div>

                      <div className='flex items-center gap-1'>
                        <MessageSquare className='h-3 w-3' />
                        <span>{discussion.postCount}</span>
                      </div>
                    </div>

                    {/* Engagement Stats */}
                    <div className='flex items-center gap-3 mt-2 text-xs text-muted-foreground'>
                      <div className='flex items-center gap-1'>
                        <Eye className='h-3 w-3' />
                        <span>{discussion.viewCount} views</span>
                      </div>

                      <div className='flex items-center gap-1'>
                        <Heart className='h-3 w-3' />
                        <span>{discussion.likeCount} likes</span>
                      </div>

                      <span>•</span>
                      <span>{formatTimeAgo(discussion.lastPostAt)}</span>
                    </div>

                    {/* Tags */}
                    {discussion.tags.length > 0 && (
                      <div className='flex items-center gap-1 mt-2'>
                        {discussion.tags.slice(0, 3).map(tag => (
                          <Badge
                            key={tag}
                            variant='secondary'
                            className='text-xs'
                          >
                            {tag}
                          </Badge>
                        ))}
                        {discussion.tags.length > 3 && (
                          <span className='text-xs text-muted-foreground'>
                            +{discussion.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Popularity Score */}
                  <div className='flex-shrink-0 text-right'>
                    <div className='text-xs font-medium text-orange-500'>
                      {formatPopularityScore(discussion.popularityScore)}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      popularity
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
