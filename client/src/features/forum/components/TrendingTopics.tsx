import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, MessageSquare, User, Hash } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { useForumApi } from '../hooks/useForumApi';
import type { TrendingTopic } from '../../../../shared/forum-types';

interface TrendingTopicsProps {
  timeframe?: 'day' | 'week' | 'month';
  limit?: number;
  onTopicClick?: (topic: TrendingTopic) => void;
  className?: string;
}

export function TrendingTopics({
  timeframe = 'week',
  limit = 10,
  onTopicClick,
  className = '',
}: TrendingTopicsProps) {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);

  const { apiCall } = useForumApi();

  useEffect(() => {
    loadTrendingTopics();
  }, [selectedTimeframe, limit]);

  const loadTrendingTopics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiCall(
        `/api/forum/discovery/trending?timeframe=${selectedTimeframe}&limit=${limit}`,
        {
          method: 'GET',
        }
      );

      if (response.success) {
        setTopics(response.data);
      } else {
        setError(response.error || 'Failed to load trending topics');
      }
    } catch (err) {
      console.error('Load trending topics error:', err);
      setError('Failed to load trending topics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicClick = (topic: TrendingTopic) => {
    onTopicClick?.(topic);
  };

  const formatTrendScore = (score: number) => {
    return (score * 100).toFixed(1);
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
            <TrendingUp className='h-5 w-5 text-primary' />
            Trending Topics
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
            <Button variant='outline' size='sm' onClick={loadTrendingTopics}>
              Try Again
            </Button>
          </div>
        )}

        {!isLoading && !error && topics.length === 0 && (
          <div className='text-center py-4 text-muted-foreground'>
            <TrendingUp className='h-8 w-8 mx-auto mb-2 opacity-50' />
            <p className='text-sm'>No trending topics found</p>
          </div>
        )}

        {!isLoading && !error && topics.length > 0 && (
          <div className='space-y-3'>
            {topics.map((topic, index) => (
              <div
                key={topic.id}
                className='group cursor-pointer p-3 rounded-lg border hover:bg-muted/50 transition-colors'
                onClick={() => handleTopicClick(topic)}
              >
                <div className='flex items-start gap-3'>
                  {/* Trend Rank */}
                  <div className='flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center'>
                    <span className='text-xs font-bold text-primary'>
                      {index + 1}
                    </span>
                  </div>

                  <div className='flex-1 min-w-0'>
                    {/* Topic Title */}
                    <h4 className='font-medium text-sm group-hover:text-primary transition-colors truncate'>
                      {topic.title}
                    </h4>

                    {/* Metadata */}
                    <div className='flex items-center gap-3 mt-1 text-xs text-muted-foreground'>
                      <div className='flex items-center gap-1'>
                        <User className='h-3 w-3' />
                        <span>{topic.author.username}</span>
                      </div>

                      <div className='flex items-center gap-1'>
                        <Hash className='h-3 w-3' />
                        <span>{topic.category.name}</span>
                      </div>

                      <div className='flex items-center gap-1'>
                        <MessageSquare className='h-3 w-3' />
                        <span>{topic.postCount}</span>
                      </div>

                      <div className='flex items-center gap-1'>
                        <Clock className='h-3 w-3' />
                        <span>{formatTimeAgo(topic.lastPostAt)}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {topic.tags.length > 0 && (
                      <div className='flex items-center gap-1 mt-2'>
                        {topic.tags.slice(0, 3).map(tag => (
                          <Badge
                            key={tag}
                            variant='secondary'
                            className='text-xs'
                          >
                            {tag}
                          </Badge>
                        ))}
                        {topic.tags.length > 3 && (
                          <span className='text-xs text-muted-foreground'>
                            +{topic.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Trend Score */}
                  <div className='flex-shrink-0 text-right'>
                    <div className='text-xs font-medium text-primary'>
                      {formatTrendScore(topic.trendScore)}%
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      {topic.recentActivity} new
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
