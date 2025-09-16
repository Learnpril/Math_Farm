import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useForumSearch } from '../useForumSearch';
import { useForumApi } from '../useForumApi';

// Mock the useForumApi hook
vi.mock('../useForumApi', () => ({
  useForumApi: vi.fn(),
}));

const mockApiCall = vi.fn();

describe('useForumSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useForumApi).mockReturnValue({
      apiCall: mockApiCall,
      isLoading: false,
      error: null,
    });
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useForumSearch());

    expect(result.current.searchResults).toEqual([]);
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.searchFilters).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.currentQuery).toBeNull();
  });

  it('should load search filters on mount', async () => {
    const mockFilters = {
      categories: [{ id: 1, name: 'General', postCount: 10 }],
      authors: [{ id: 1, username: 'testuser', postCount: 5 }],
      dateRanges: [{ label: 'Last week', value: 'week' }],
    };

    mockApiCall.mockResolvedValue({
      success: true,
      data: mockFilters,
    });

    const { result } = renderHook(() => useForumSearch());

    await waitFor(() => {
      expect(result.current.searchFilters).toEqual(mockFilters);
    });

    expect(mockApiCall).toHaveBeenCalledWith('/api/forum/search/filters', {
      method: 'GET',
    });
  });

  it('should perform search with valid query', async () => {
    const mockSearchResults = {
      results: [
        {
          id: 1,
          type: 'post',
          title: 'Test Thread',
          content: 'Test content',
          excerpt: 'Test excerpt',
          author: { id: 1, username: 'testuser' },
          thread: {
            id: 1,
            title: 'Test Thread',
            category: { id: 1, name: 'General' },
          },
          createdAt: '2024-01-01T00:00:00Z',
          relevanceScore: 0.85,
          mathContent: null,
        },
      ],
      total: 1,
      facets: {
        categories: [{ id: 1, name: 'General', count: 1 }],
        authors: [{ id: 1, username: 'testuser', count: 1 }],
      },
    };

    const mockPagination = {
      page: 1,
      limit: 20,
      total: 1,
      pages: 1,
    };

    mockApiCall.mockResolvedValue({
      success: true,
      data: mockSearchResults,
      pagination: mockPagination,
    });

    const { result } = renderHook(() => useForumSearch());

    await act(async () => {
      await result.current.performSearch({
        q: 'test query',
        sortBy: 'relevance',
        page: 1,
        limit: 20,
        includeMath: false,
      });
    });

    expect(result.current.searchResults).toEqual(mockSearchResults.results);
    expect(result.current.pagination).toEqual(mockPagination);
    expect(mockApiCall).toHaveBeenCalledWith(
      expect.stringContaining('/api/forum/search?'),
      { method: 'GET' }
    );
  });

  it('should get search suggestions', async () => {
    const mockSuggestions = [
      { text: 'algebra', type: 'thread', count: 5 },
      { text: 'calculus', type: 'category', count: 10 },
    ];

    mockApiCall.mockResolvedValue({
      success: true,
      data: mockSuggestions,
    });

    const { result } = renderHook(() => useForumSearch());

    await act(async () => {
      await result.current.getSuggestions('alg');
    });

    expect(result.current.suggestions).toEqual(mockSuggestions);
    expect(mockApiCall).toHaveBeenCalledWith(
      '/api/forum/search/suggestions?q=alg',
      { method: 'GET' }
    );
  });

  it('should not search with short queries', async () => {
    const { result } = renderHook(() => useForumSearch());

    await act(async () => {
      await result.current.performSearch({
        q: 'a',
        sortBy: 'relevance',
        page: 1,
        limit: 20,
        includeMath: false,
      });
    });

    expect(result.current.searchResults).toEqual([]);
    expect(mockApiCall).not.toHaveBeenCalledWith(
      expect.stringContaining('/api/forum/search?'),
      expect.any(Object)
    );
  });

  it('should handle search errors', async () => {
    mockApiCall.mockRejectedValue(new Error('Search failed'));

    const { result } = renderHook(() => useForumSearch());

    await act(async () => {
      await result.current.performSearch({
        q: 'test query',
        sortBy: 'relevance',
        page: 1,
        limit: 20,
        includeMath: false,
      });
    });

    expect(result.current.error).toBe('Search failed. Please try again.');
    expect(result.current.searchResults).toEqual([]);
  });

  it('should load more results', async () => {
    // First, set up initial search results
    const initialResults = [
      {
        id: 1,
        type: 'post',
        title: 'Test 1',
        content: 'Content 1',
        excerpt: 'Excerpt 1',
        author: { id: 1, username: 'user1' },
        thread: {
          id: 1,
          title: 'Thread 1',
          category: { id: 1, name: 'General' },
        },
        createdAt: '2024-01-01T00:00:00Z',
        relevanceScore: 0.9,
        mathContent: null,
      },
    ];

    const additionalResults = [
      {
        id: 2,
        type: 'post',
        title: 'Test 2',
        content: 'Content 2',
        excerpt: 'Excerpt 2',
        author: { id: 2, username: 'user2' },
        thread: {
          id: 2,
          title: 'Thread 2',
          category: { id: 1, name: 'General' },
        },
        createdAt: '2024-01-02T00:00:00Z',
        relevanceScore: 0.8,
        mathContent: null,
      },
    ];

    // Mock initial search
    mockApiCall.mockResolvedValueOnce({
      success: true,
      data: {
        results: initialResults,
        total: 2,
        facets: { categories: [], authors: [] },
      },
      pagination: { page: 1, limit: 1, total: 2, pages: 2 },
    });

    // Mock load more
    mockApiCall.mockResolvedValueOnce({
      success: true,
      data: {
        results: additionalResults,
        total: 2,
        facets: { categories: [], authors: [] },
      },
      pagination: { page: 2, limit: 1, total: 2, pages: 2 },
    });

    const { result } = renderHook(() => useForumSearch());

    // Perform initial search
    await act(async () => {
      await result.current.performSearch({
        q: 'test',
        sortBy: 'relevance',
        page: 1,
        limit: 1,
        includeMath: false,
      });
    });

    expect(result.current.searchResults).toHaveLength(1);
    expect(result.current.hasMoreResults).toBe(true);

    // Load more results
    await act(async () => {
      await result.current.loadMoreResults();
    });

    expect(result.current.searchResults).toHaveLength(2);
    expect(result.current.searchResults[0].id).toBe(1);
    expect(result.current.searchResults[1].id).toBe(2);
  });

  it('should clear search results', () => {
    const { result } = renderHook(() => useForumSearch());

    // Set some initial state
    act(() => {
      result.current.clearSearch();
    });

    expect(result.current.searchResults).toEqual([]);
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.currentQuery).toBeNull();
  });
});
