import React, { useState, useEffect } from 'react';
import { Link2, MessageSquare, User, Hash, Clock } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { useForumApi } from '../hooks/useForumApi';
import type { RelatedThread } from '../../../../shared/forum-types';

interface RelatedThreadsProps {
  threadId: number;
  limit?: number;
  onThreadClick?: (thread: RelatedThread) => void;
  className?: string;
}

export function RelatedThreads({
  threadId,
  limit = 5,
  onThreadClick,
  className = '',
}: RelatedThreadsProps) {
  const [relatedThreads, setRelatedThreads] = useState<RelatedThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { apiCall } = useForumApi();

  useEffect(() => {
    if (threadId) {
      loadRelatedThreads();
    }
  }, [threadId, limit]);

  const loadRelatedThreads = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiCall(
        `/api/forum/discovery/related/${threadId}?limit=${limit}`,
        {
          method: 'GET',
        }
      );

      if (response.success) {
        setRelatedThreads(response.data);
      } else {
        setError(response.error || 'Failed to load related threads');
      }
    } catch (err) {
      console.error('Load related threads error:', err);
      setError('Failed to load related threads');
    } finally {
      setIsLoading(false);
    }
  };

  const handleThreadClick = (thread: RelatedThread) => {
    onThreadClick?.(thread);
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

  const getSimilarityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-gray-600';
  };

  if (!threadId) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Link2 className='h-5 w-5 text-primary' />
          Related Discussions
        </CardTitle>
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
            <Button variant='outline' size='sm' onClick={loadRelatedThreads}>
              Try Again
            </Button>
          </div>
        )}

        {!isLoading && !error && relatedThreads.length === 0 && (
          <div className='text-center py-4 text-muted-foreground'>
            <Link2 className='h-8 w-8 mx-auto mb-2 opacity-50' />
            <p className='text-sm'>No related discussions found</p>
          </div>
        )}

        {!isLoading && !error && relatedThreads.length > 0 && (
          <div className='space-y-3'>
            {relatedThreads.map(thread => (
              <div
                key={thread.id}
                className='group cursor-pointer p-3 rounded-lg border hover:bg-muted/50 transition-colors'
                onClick={() => handleThreadClick(thread)}
              >
                <div className='flex items-start gap-3'>
                  {/* Similarity Score */}
                  <div className='flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center'>
                    <span
                      className={`text-xs font-bold ${getSimilarityColor(thread.similarityScore)}`}
                    >
                      {Math.round(thread.similarityScore * 100)}%
                    </span>
                  </div>

                  <div className='flex-1 min-w-0'>
                    {/* Thread Title */}
                    <h4 className='font-medium text-sm group-hover:text-primary transition-colors line-clamp-2'>
                      {thread.title}
                    </h4>

                    {/* Metadata */}
                    <div className='flex items-center gap-3 mt-1 text-xs text-muted-foreground'>
                      <div className='flex items-center gap-1'>
                        <User className='h-3 w-3' />
                        <span>{thread.author.username}</span>
                      </div>

                      <div className='flex items-center gap-1'>
                        <Hash className='h-3 w-3' />
                        <span>{thread.category.name}</span>
                      </div>

                      <div className='flex items-center gap-1'>
                        <MessageSquare className='h-3 w-3' />
                        <span>{thread.postCount}</span>
                      </div>

                      <div className='flex items-center gap-1'>
                        <Clock className='h-3 w-3' />
                        <span>{formatTimeAgo(thread.lastPostAt)}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {thread.tags.length > 0 && (
                      <div className='flex items-center gap-1 mt-2'>
                        {thread.tags.slice(0, 2).map(tag => (
                          <Badge
                            key={tag}
                            variant='secondary'
                            className='text-xs'
                          >
                            {tag}
                          </Badge>
                        ))}
                        {thread.tags.length > 2 && (
                          <span className='text-xs text-muted-foreground'>
                            +{thread.tags.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !error && relatedThreads.length > 0 && (
          <div className='mt-4 pt-4 border-t'>
            <p className='text-xs text-muted-foreground text-center'>
              Similarity based on category and tags
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
