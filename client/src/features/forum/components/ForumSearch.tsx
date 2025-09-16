import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, Clock, Hash, User } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { useForumSearch } from '../hooks/useForumSearch';
import { SearchResult, SearchSuggestion } from '../../../../shared/forum-types';
import { cn } from '../../../lib/utils';

interface ForumSearchProps {
  onResultSelect?: (result: SearchResult) => void;
  className?: string;
}

export function ForumSearch({ onResultSelect, className }: ForumSearchProps) {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    author: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'relevance' as const,
    includeMath: false,
  });

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    searchResults,
    suggestions,
    searchFilters,
    isLoading,
    error,
    performSearch,
    getSuggestions,
    clearSearch,
  } = useForumSearch();

  // Handle search input changes
  useEffect(() => {
    if (query.length >= 2) {
      const timeoutId = setTimeout(() => {
        getSuggestions(query);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [query, getSuggestions]);

  // Handle click outside to close search
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
        setShowFilters(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim().length >= 2) {
      performSearch({
        q: finalQuery.trim(),
        ...filters,
        page: 1,
        limit: 20,
      });
      setIsExpanded(true);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    handleSearch(suggestion.text);
    inputRef.current?.focus();
  };

  const handleResultClick = (result: SearchResult) => {
    onResultSelect?.(result);
    setIsExpanded(false);
  };

  const handleClearSearch = () => {
    setQuery('');
    clearSearch();
    setIsExpanded(false);
    setShowFilters(false);
    inputRef.current?.focus();
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const hasActiveFilters = Object.values(filters).some(
    value => value !== '' && value !== 'relevance' && value !== false
  );

  return (
    <div ref={searchRef} className={cn('relative', className)}>
      {/* Search Input */}
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
        <Input
          ref={inputRef}
          type='text'
          placeholder='Search forum discussions...'
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleSearch();
            } else if (e.key === 'Escape') {
              handleClearSearch();
            }
          }}
          onFocus={() => {
            if (query.length >= 2 || suggestions.length > 0) {
              setIsExpanded(true);
            }
          }}
          className='pl-10 pr-20'
        />

        <div className='absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'h-7 w-7 p-0',
              hasActiveFilters && 'text-primary',
              showFilters && 'bg-muted'
            )}
          >
            <Filter className='h-3 w-3' />
          </Button>

          {query && (
            <Button
              variant='ghost'
              size='sm'
              onClick={handleClearSearch}
              className='h-7 w-7 p-0'
            >
              <X className='h-3 w-3' />
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className='absolute top-full left-0 right-0 mt-2 z-50 shadow-lg'>
          <CardContent className='p-4 space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='text-sm font-medium mb-2 block'>
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={e => handleFilterChange('category', e.target.value)}
                  className='w-full p-2 border rounded-md text-sm'
                >
                  <option value=''>All categories</option>
                  {searchFilters?.categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.postCount})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='text-sm font-medium mb-2 block'>Author</label>
                <select
                  value={filters.author}
                  onChange={e => handleFilterChange('author', e.target.value)}
                  className='w-full p-2 border rounded-md text-sm'
                >
                  <option value=''>Any author</option>
                  {searchFilters?.authors.map(author => (
                    <option key={author.id} value={author.id}>
                      {author.username} ({author.postCount})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='text-sm font-medium mb-2 block'>
                  Date From
                </label>
                <Input
                  type='date'
                  value={filters.dateFrom}
                  onChange={e => handleFilterChange('dateFrom', e.target.value)}
                  className='text-sm'
                />
              </div>

              <div>
                <label className='text-sm font-medium mb-2 block'>
                  Date To
                </label>
                <Input
                  type='date'
                  value={filters.dateTo}
                  onChange={e => handleFilterChange('dateTo', e.target.value)}
                  className='text-sm'
                />
              </div>
            </div>

            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <label className='flex items-center gap-2 text-sm'>
                  <input
                    type='checkbox'
                    checked={filters.includeMath}
                    onChange={e =>
                      handleFilterChange('includeMath', e.target.checked)
                    }
                  />
                  Include math content only
                </label>

                <select
                  value={filters.sortBy}
                  onChange={e => handleFilterChange('sortBy', e.target.value)}
                  className='p-1 border rounded text-sm'
                >
                  <option value='relevance'>Sort by relevance</option>
                  <option value='date'>Sort by date</option>
                  <option value='replies'>Sort by replies</option>
                </select>
              </div>

              <Button
                onClick={() => handleSearch()}
                disabled={!query.trim()}
                size='sm'
              >
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results/Suggestions */}
      {isExpanded && (
        <Card className='absolute top-full left-0 right-0 mt-2 z-40 shadow-lg max-h-96 overflow-hidden'>
          <CardContent className='p-0'>
            {isLoading && (
              <div className='p-4 text-center text-muted-foreground'>
                Searching...
              </div>
            )}

            {error && (
              <div className='p-4 text-center text-destructive'>
                Search failed. Please try again.
              </div>
            )}

            {/* Suggestions */}
            {!isLoading && !searchResults.length && suggestions.length > 0 && (
              <div className='p-2'>
                <div className='text-xs font-medium text-muted-foreground mb-2 px-2'>
                  Suggestions
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className='w-full text-left p-2 hover:bg-muted rounded-md flex items-center gap-2'
                  >
                    {suggestion.type === 'thread' && (
                      <Hash className='h-3 w-3' />
                    )}
                    {suggestion.type === 'category' && (
                      <Filter className='h-3 w-3' />
                    )}
                    {suggestion.type === 'term' && (
                      <Clock className='h-3 w-3' />
                    )}
                    <span className='text-sm'>{suggestion.text}</span>
                    <Badge variant='secondary' className='ml-auto text-xs'>
                      {suggestion.count}
                    </Badge>
                  </button>
                ))}
              </div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className='max-h-80 overflow-y-auto'>
                <div className='text-xs font-medium text-muted-foreground mb-2 px-4 pt-2'>
                  Search Results
                </div>
                {searchResults.map(result => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className='w-full text-left p-4 hover:bg-muted border-b last:border-b-0'
                  >
                    <div className='flex items-start justify-between gap-2'>
                      <div className='flex-1 min-w-0'>
                        <h4 className='font-medium text-sm truncate'>
                          {result.thread.title}
                        </h4>
                        <div
                          className='text-xs text-muted-foreground mt-1 line-clamp-2'
                          dangerouslySetInnerHTML={{ __html: result.excerpt }}
                        />
                        <div className='flex items-center gap-2 mt-2 text-xs text-muted-foreground'>
                          <User className='h-3 w-3' />
                          <span>{result.author.username}</span>
                          <span>•</span>
                          <span>{result.thread.category.name}</span>
                          {result.mathContent && (
                            <>
                              <span>•</span>
                              <Badge variant='outline' className='text-xs'>
                                Math
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        {new Date(result.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!isLoading &&
              !error &&
              searchResults.length === 0 &&
              query.length >= 2 && (
                <div className='p-4 text-center text-muted-foreground'>
                  No results found for "{query}"
                </div>
              )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
