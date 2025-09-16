import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ForumSearch } from '../ForumSearch';
import { TrendingTopics } from '../TrendingTopics';
import { PopularDiscussions } from '../PopularDiscussions';
import { useForumSearch } from '../../hooks/useForumSearch';
import { useForumApi } from '../../hooks/useForumApi';

// Mock the hooks
vi.mock('../../hooks/useForumSearch');
vi.mock('../../hooks/useForumApi');

const mockApiCall = vi.fn();

describe('Search and Discovery Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useForumApi).mockReturnValue({
      apiCall: mockApiCall,
      isLoading: false,
      error: null,
    });

    vi.mocked(useForumSearch).mockReturnValue({
      searchResults: [],
      suggestions: [],
      searchFilters: null,
      isLoading: false,
      error: null,
      pagination: { page: 1, limit: 20, total: 0, pages: 0 },
      currentQuery: null,
      hasMoreResults: false,
      performSearch: vi.fn(),
      getSuggestions: vi.fn(),
      loadMoreResults: vi.fn(),
      clearSearch: vi.fn(),
      loadSearchFilters: vi.fn(),
    });
  });

  it('should render search component without errors', () => {
    render(<ForumSearch />);

    expect(
      screen.getByPlaceholderText('Search forum discussions...')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument();
  });

  it('should render trending topics component', async () => {
    const mockTrendingData = [
      {
        id: 1,
        title: 'Test Trending Topic',
        category: { id: 1, name: 'General' },
        author: { id: 1, username: 'testuser' },
        postCount: 5,
        recentActivity: 2,
        trendScore: 0.8,
        tags: ['test'],
        createdAt: '2024-01-01T00:00:00Z',
        lastPostAt: '2024-01-01T12:00:00Z',
      },
    ];

    mockApiCall.mockResolvedValue({
      success: true,
      data: mockTrendingData,
    });

    render(<TrendingTopics />);

    await waitFor(() => {
      expect(screen.getByText('Trending Topics')).toBeInTheDocument();
    });
  });

  it('should render popular discussions component', async () => {
    const mockPopularData = [
      {
        id: 1,
        title: 'Test Popular Discussion',
        category: { id: 1, name: 'General' },
        author: { id: 1, username: 'testuser' },
        postCount: 10,
        viewCount: 50,
        likeCount: 5,
        popularityScore: 100,
        tags: ['popular'],
        createdAt: '2024-01-01T00:00:00Z',
        lastPostAt: '2024-01-01T12:00:00Z',
      },
    ];

    mockApiCall.mockResolvedValue({
      success: true,
      data: mockPopularData,
    });

    render(<PopularDiscussions />);

    await waitFor(() => {
      expect(screen.getByText('Popular Discussions')).toBeInTheDocument();
    });
  });

  it('should handle search input interaction', async () => {
    const mockPerformSearch = vi.fn();
    const mockGetSuggestions = vi.fn();

    vi.mocked(useForumSearch).mockReturnValue({
      searchResults: [],
      suggestions: [],
      searchFilters: null,
      isLoading: false,
      error: null,
      pagination: { page: 1, limit: 20, total: 0, pages: 0 },
      currentQuery: null,
      hasMoreResults: false,
      performSearch: mockPerformSearch,
      getSuggestions: mockGetSuggestions,
      loadMoreResults: vi.fn(),
      clearSearch: vi.fn(),
      loadSearchFilters: vi.fn(),
    });

    const user = userEvent.setup();
    render(<ForumSearch />);

    const searchInput = screen.getByPlaceholderText(
      'Search forum discussions...'
    );

    await user.type(searchInput, 'test query');
    await user.keyboard('{Enter}');

    expect(mockPerformSearch).toHaveBeenCalledWith({
      q: 'test query',
      category: '',
      author: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'relevance',
      page: 1,
      limit: 20,
      includeMath: false,
    });
  });

  it('should display search suggestions', () => {
    const mockSuggestions = [
      { text: 'algebra', type: 'thread' as const, count: 5 },
      { text: 'calculus', type: 'category' as const, count: 10 },
    ];

    vi.mocked(useForumSearch).mockReturnValue({
      searchResults: [],
      suggestions: mockSuggestions,
      searchFilters: null,
      isLoading: false,
      error: null,
      pagination: { page: 1, limit: 20, total: 0, pages: 0 },
      currentQuery: null,
      hasMoreResults: false,
      performSearch: vi.fn(),
      getSuggestions: vi.fn(),
      loadMoreResults: vi.fn(),
      clearSearch: vi.fn(),
      loadSearchFilters: vi.fn(),
    });

    render(<ForumSearch />);

    // Focus input to show suggestions
    const searchInput = screen.getByPlaceholderText(
      'Search forum discussions...'
    );
    searchInput.focus();

    expect(screen.getByText('algebra')).toBeInTheDocument();
    expect(screen.getByText('calculus')).toBeInTheDocument();
  });

  it('should display search results', () => {
    const mockResults = [
      {
        id: 1,
        type: 'post' as const,
        title: 'Test Result',
        content: 'Test content',
        excerpt: 'Test excerpt with <mark>search</mark> term',
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
    ];

    vi.mocked(useForumSearch).mockReturnValue({
      searchResults: mockResults,
      suggestions: [],
      searchFilters: null,
      isLoading: false,
      error: null,
      pagination: { page: 1, limit: 20, total: 1, pages: 1 },
      currentQuery: null,
      hasMoreResults: false,
      performSearch: vi.fn(),
      getSuggestions: vi.fn(),
      loadMoreResults: vi.fn(),
      clearSearch: vi.fn(),
      loadSearchFilters: vi.fn(),
    });

    render(<ForumSearch />);

    // Focus input to show results
    const searchInput = screen.getByPlaceholderText(
      'Search forum discussions...'
    );
    searchInput.focus();

    expect(screen.getByText('Test Thread')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('General')).toBeInTheDocument();
  });
});
