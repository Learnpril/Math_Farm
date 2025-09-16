import React, { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Search, Filter, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { ForumLayout } from '../components/ForumLayout';
import { useForumSearch } from '../hooks/useForumSearch';
import { SearchResult } from '../../../../shared/forum-types';

export function SearchResultsPage() {
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute('/forum/search');

  const {
    searchResults,
    isLoading,
    error,
    pagination,
    currentQuery,
    hasMoreResults,
    performSearch,
    loadMoreResults,
  } = useForumSearch();

  const [searchParams, setSearchParams] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      q: urlParams.get('q') || '',
      category: urlParams.get('category') || '',
      author: urlParams.get('author') || '',
      dateFrom: urlParams.get('dateFrom') || '',
      dateTo: urlParams.get('dateTo') || '',
      sortBy:
        (urlParams.get('sortBy') as 'relevance' | 'date' | 'replies') ||
        'relevance',
      includeMath: urlParams.get('includeMath') === 'true',
    };
  });

  // Perform search when component mounts or search params change
  useEffect(() => {
    if (searchParams.q.trim().length >= 2) {
      performSearch({
        ...searchParams,
        page: 1,
        limit: 20,
      });
    }
  }, [searchParams, performSearch]);

  const handleResultClick = (result: SearchResult) => {
    setLocation(`/forum/threads/${result.thread.id}#post-${result.id}`);
  };

  const handleBackToForum = () => {
    setLocation('/forum');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const breadcrumbs = [
    { label: 'Forum', href: '/forum' },
    { label: 'Search Results', href: '/forum/search' },
  ];

  return (
    <ForumLayout breadcrumbs={breadcrumbs}>
      <div className='space-y-6'>
        {/* Search Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleBackToForum}
              className='flex items-center gap-2'
            >
              <ArrowLeft className='h-4 w-4' />
              Back to Forum
            </Button>

            <div className='flex items-center gap-2'>
              <Search className='h-5 w-5 text-muted-foreground' />
              <h1 className='text-2xl font-bold'>Search Results</h1>
            </div>
          </div>
        </div>

        {/* Search Query Info */}
        {searchParams.q && (
          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-muted-foreground'>
                    Searching for:
                  </span>
                  <Badge variant='secondary' className='font-mono'>
                    "{searchParams.q}"
                  </Badge>

                  {searchParams.category && (
                    <Badge variant='outline'>
                      Category: {searchParams.category}
                    </Badge>
                  )}

                  {searchParams.author && (
                    <Badge variant='outline'>
                      Author: {searchParams.author}
                    </Badge>
                  )}

                  {searchParams.includeMath && (
                    <Badge variant='outline'>Math Content</Badge>
                  )}
                </div>

                {pagination.total > 0 && (
                  <div className='text-sm text-muted-foreground'>
                    {pagination.total} result{pagination.total !== 1 ? 's' : ''}{' '}
                    found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && searchResults.length === 0 && (
          <Card>
            <CardContent className='p-8 text-center'>
              <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4' />
              <p className='text-muted-foreground'>Searching forum...</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className='p-8 text-center'>
              <div className='text-destructive mb-4'>
                <Search className='h-8 w-8 mx-auto mb-2' />
                <p className='font-medium'>Search Failed</p>
              </div>
              <p className='text-muted-foreground mb-4'>{error}</p>
              <Button
                onClick={() =>
                  performSearch({
                    ...searchParams,
                    page: 1,
                    limit: 20,
                  })
                }
                variant='outline'
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* No Results */}
        {!isLoading &&
          !error &&
          searchResults.length === 0 &&
          searchParams.q && (
            <Card>
              <CardContent className='p-8 text-center'>
                <Search className='h-8 w-8 mx-auto mb-4 text-muted-foreground' />
                <h3 className='font-medium mb-2'>No results found</h3>
                <p className='text-muted-foreground mb-4'>
                  Try adjusting your search terms or filters
                </p>
                <div className='space-y-2 text-sm text-muted-foreground'>
                  <p>• Check your spelling</p>
                  <p>• Try more general terms</p>
                  <p>• Remove filters to broaden your search</p>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className='space-y-4'>
            {searchResults.map(result => (
              <Card
                key={result.id}
                className='cursor-pointer hover:shadow-md transition-shadow'
                onClick={() => handleResultClick(result)}
              >
                <CardContent className='p-6'>
                  <div className='space-y-3'>
                    {/* Thread Title */}
                    <div className='flex items-start justify-between gap-4'>
                      <h3 className='font-semibold text-lg hover:text-primary transition-colors'>
                        {result.thread.title}
                      </h3>
                      <div className='text-sm text-muted-foreground whitespace-nowrap'>
                        {formatDate(result.createdAt)}
                      </div>
                    </div>

                    {/* Content Excerpt */}
                    <div
                      className='text-muted-foreground leading-relaxed'
                      dangerouslySetInnerHTML={{ __html: result.excerpt }}
                    />

                    {/* Math Content Preview */}
                    {result.mathContent && result.mathContent.length > 0 && (
                      <div className='bg-muted/50 rounded-lg p-3'>
                        <div className='text-xs font-medium text-muted-foreground mb-2'>
                          Math Content:
                        </div>
                        <div className='font-mono text-sm'>
                          {result.mathContent.slice(0, 2).map((expr, index) => (
                            <div key={index} className='mb-1'>
                              ${expr.latex}$
                            </div>
                          ))}
                          {result.mathContent.length > 2 && (
                            <div className='text-muted-foreground'>
                              +{result.mathContent.length - 2} more expressions
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                      <div className='flex items-center gap-1'>
                        <span>By</span>
                        <span className='font-medium'>
                          {result.author.username}
                        </span>
                      </div>

                      <div className='flex items-center gap-1'>
                        <span>in</span>
                        <Badge variant='outline' className='text-xs'>
                          {result.thread.category.name}
                        </Badge>
                      </div>

                      {result.relevanceScore > 0 && (
                        <div className='flex items-center gap-1'>
                          <span>Relevance:</span>
                          <span className='font-medium'>
                            {Math.round(result.relevanceScore * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Load More Button */}
            {hasMoreResults && (
              <div className='text-center'>
                <Button
                  onClick={loadMoreResults}
                  disabled={isLoading}
                  variant='outline'
                  className='flex items-center gap-2'
                >
                  {isLoading && <Loader2 className='h-4 w-4 animate-spin' />}
                  Load More Results
                </Button>
              </div>
            )}

            {/* Pagination Info */}
            <div className='text-center text-sm text-muted-foreground'>
              Showing {searchResults.length} of {pagination.total} results
            </div>
          </div>
        )}
      </div>
    </ForumLayout>
  );
}
