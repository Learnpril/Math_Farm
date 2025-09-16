import { useState, useCallback, useEffect } from 'react';
import { useForumApi } from './useForumApi';
import type {
  SearchQuery,
  SearchResult,
  SearchSuggestion,
  SearchFilters,
} from '../../../../shared/forum-types';

interface SearchState {
  results: SearchResult[];
  total: number;
  facets: {
    categories: Array<{ id: number; name: string; count: number }>;
    authors: Array<{ id: number; username: string; count: number }>;
  };
}

export function useForumSearch() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchFilters, setSearchFilters] = useState<SearchFilters | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState<SearchQuery | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const { apiCall } = useForumApi();

  // Load search filters on mount
  useEffect(() => {
    loadSearchFilters();
  }, []);

  const loadSearchFilters = useCallback(async () => {
    try {
      const response = await apiCall('/api/forum/search/filters', {
        method: 'GET',
      });

      if (response.success) {
        setSearchFilters(response.data);
      }
    } catch (err) {
      console.error('Failed to load search filters:', err);
    }
  }, [apiCall]);

  const performSearch = useCallback(
    async (query: SearchQuery) => {
      if (!query.q.trim() || query.q.length < 2) {
        setSearchResults([]);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      setCurrentQuery(query);

      try {
        const params = new URLSearchParams();
        params.append('q', query.q);
        params.append('page', query.page.toString());
        params.append('limit', query.limit.toString());
        params.append('sortBy', query.sortBy);
        params.append('includeMath', query.includeMath.toString());

        if (query.category) params.append('category', query.category);
        if (query.author) params.append('author', query.author);
        if (query.dateFrom) params.append('dateFrom', query.dateFrom);
        if (query.dateTo) params.append('dateTo', query.dateTo);

        const response = await apiCall(
          `/api/forum/search?${params.toString()}`,
          {
            method: 'GET',
          }
        );

        if (response.success) {
          const searchState: SearchState = response.data;
          setSearchResults(searchState.results);
          setPagination(response.pagination);

          // Update search filters with facets if available
          if (searchState.facets && searchFilters) {
            setSearchFilters({
              ...searchFilters,
              categories: searchState.facets.categories.map(cat => ({
                id: cat.id,
                name: cat.name,
                postCount: cat.count,
              })),
              authors: searchState.facets.authors.map(author => ({
                id: author.id,
                username: author.username,
                postCount: author.count,
              })),
            });
          }
        } else {
          setError(response.error || 'Search failed');
          setSearchResults([]);
        }
      } catch (err) {
        console.error('Search error:', err);
        setError('Search failed. Please try again.');
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [apiCall, searchFilters]
  );

  const getSuggestions = useCallback(
    async (query: string) => {
      if (!query.trim() || query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const params = new URLSearchParams();
        params.append('q', query);

        const response = await apiCall(
          `/api/forum/search/suggestions?${params.toString()}`,
          {
            method: 'GET',
          }
        );

        if (response.success) {
          setSuggestions(response.data);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error('Suggestions error:', err);
        setSuggestions([]);
      }
    },
    [apiCall]
  );

  const loadMoreResults = useCallback(async () => {
    if (!currentQuery || isLoading || pagination.page >= pagination.pages) {
      return;
    }

    const nextQuery = {
      ...currentQuery,
      page: pagination.page + 1,
    };

    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      params.append('q', nextQuery.q);
      params.append('page', nextQuery.page.toString());
      params.append('limit', nextQuery.limit.toString());
      params.append('sortBy', nextQuery.sortBy);
      params.append('includeMath', nextQuery.includeMath.toString());

      if (nextQuery.category) params.append('category', nextQuery.category);
      if (nextQuery.author) params.append('author', nextQuery.author);
      if (nextQuery.dateFrom) params.append('dateFrom', nextQuery.dateFrom);
      if (nextQuery.dateTo) params.append('dateTo', nextQuery.dateTo);

      const response = await apiCall(`/api/forum/search?${params.toString()}`, {
        method: 'GET',
      });

      if (response.success) {
        const searchState: SearchState = response.data;
        setSearchResults(prev => [...prev, ...searchState.results]);
        setPagination(response.pagination);
        setCurrentQuery(nextQuery);
      }
    } catch (err) {
      console.error('Load more error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentQuery, isLoading, pagination, apiCall]);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSuggestions([]);
    setError(null);
    setCurrentQuery(null);
    setPagination({
      page: 1,
      limit: 20,
      total: 0,
      pages: 0,
    });
  }, []);

  const hasMoreResults = pagination.page < pagination.pages;

  return {
    searchResults,
    suggestions,
    searchFilters,
    isLoading,
    error,
    pagination,
    currentQuery,
    hasMoreResults,
    performSearch,
    getSuggestions,
    loadMoreResults,
    clearSearch,
    loadSearchFilters,
  };
}
