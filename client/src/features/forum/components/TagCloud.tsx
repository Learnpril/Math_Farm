import React, { useState, useEffect } from 'react';
import { Tag, Hash } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { useForumApi } from '../hooks/useForumApi';
import type { ForumTag } from '../../../../shared/forum-types';

interface TagCloudProps {
  showPopular?: boolean;
  limit?: number;
  onTagClick?: (tag: ForumTag) => void;
  className?: string;
}

export function TagCloud({
  showPopular = true,
  limit = 30,
  onTagClick,
  className = '',
}: TagCloudProps) {
  const [tags, setTags] = useState<ForumTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'popular' | 'all'>(
    showPopular ? 'popular' : 'all'
  );

  const { apiCall } = useForumApi();

  useEffect(() => {
    loadTags();
  }, [viewMode, limit]);

  const loadTags = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiCall(
        `/api/forum/discovery/tags?popular=${viewMode === 'popular'}&limit=${limit}`,
        {
          method: 'GET',
        }
      );

      if (response.success) {
        setTags(response.data);
      } else {
        setError(response.error || 'Failed to load tags');
      }
    } catch (err) {
      console.error('Load tags error:', err);
      setError('Failed to load tags');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagClick = (tag: ForumTag) => {
    onTagClick?.(tag);
  };

  const getTagSize = (tag: ForumTag, maxCount: number) => {
    const ratio = tag.threadCount / maxCount;
    if (ratio > 0.8) return 'text-lg';
    if (ratio > 0.6) return 'text-base';
    if (ratio > 0.4) return 'text-sm';
    return 'text-xs';
  };

  const getTagOpacity = (tag: ForumTag, maxCount: number) => {
    const ratio = tag.threadCount / maxCount;
    if (ratio > 0.8) return 'opacity-100';
    if (ratio > 0.6) return 'opacity-90';
    if (ratio > 0.4) return 'opacity-80';
    return 'opacity-70';
  };

  const maxThreadCount = Math.max(...tags.map(tag => tag.threadCount), 1);

  return (
    <Card className={className}>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2'>
            <Tag className='h-5 w-5 text-primary' />
            Tags
          </CardTitle>

          <div className='flex items-center gap-1'>
            <Button
              variant={viewMode === 'popular' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('popular')}
              className='text-xs'
            >
              Popular
            </Button>
            <Button
              variant={viewMode === 'all' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('all')}
              className='text-xs'
            >
              All
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading && (
          <div className='space-y-2'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='animate-pulse'>
                <div className='h-6 bg-muted rounded w-20 inline-block mr-2'></div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className='text-center py-4'>
            <p className='text-destructive text-sm mb-2'>{error}</p>
            <Button variant='outline' size='sm' onClick={loadTags}>
              Try Again
            </Button>
          </div>
        )}

        {!isLoading && !error && tags.length === 0 && (
          <div className='text-center py-4 text-muted-foreground'>
            <Tag className='h-8 w-8 mx-auto mb-2 opacity-50' />
            <p className='text-sm'>No tags found</p>
          </div>
        )}

        {!isLoading && !error && tags.length > 0 && (
          <div className='flex flex-wrap gap-2'>
            {tags.map(tag => (
              <button
                key={tag.id}
                onClick={() => handleTagClick(tag)}
                className={`
                  inline-flex items-center gap-1 px-2 py-1 rounded-md
                  bg-muted hover:bg-muted/80 transition-colors
                  ${getTagSize(tag, maxThreadCount)}
                  ${getTagOpacity(tag, maxThreadCount)}
                `}
                style={{
                  backgroundColor: tag.color ? `${tag.color}20` : undefined,
                  borderColor: tag.color || undefined,
                  borderWidth: tag.color ? '1px' : undefined,
                }}
              >
                <Hash className='h-3 w-3' />
                <span className='font-medium'>{tag.name}</span>
                <Badge variant='secondary' className='text-xs ml-1'>
                  {tag.threadCount}
                </Badge>
              </button>
            ))}
          </div>
        )}

        {!isLoading && !error && tags.length > 0 && viewMode === 'popular' && (
          <div className='mt-4 pt-4 border-t'>
            <p className='text-xs text-muted-foreground text-center'>
              Tag size indicates popularity • {tags.length} tags shown
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
