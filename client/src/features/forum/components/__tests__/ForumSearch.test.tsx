import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ForumSearch } from '../ForumSearch';
import { useForumSearch } from '../../hooks/useForumSearch';

// Mock the useForumSearch hook
vi.mock('../../hooks/useForumSearch', () => ({
  useForumSearch: vi.fn(),
}));

const mockUseForumSearch = {
  searchResults: [],
  suggestions: [],
  searchFilters: null,
  isLoading: false,
  error: null,
  performSearch: vi.fn(),
  getSuggestions: vi.fn(),
  clearSearch: vi.fn(),
};

describe('ForumSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useForumSearch).mockReturnValue(mockUseForumSearch);
  });

  it('should render search input', () => {
    render(<ForumSearch />);

    const searchInput = screen.getByPlaceholderText(
      'Search forum discussions...'
    );
    expect(searchInput).toBeInTheDocument();
  });

  it('should show filter button', () => {
    render(<ForumSearch />);

    const filterButton = screen.getByRole('button', { name: /filter/i });
    expect(filterButton).toBeInTheDocument();
  });

  it('should call getSuggestions when typing', async () => {
    const user = userEvent.setup();
    render(<ForumSearch />);

    const searchInput = screen.getByPlaceholderText(
      'Search forum discussions...'
    );

    await user.type(searchInput, 'test query');

    // Wait for debounce
    await waitFor(
      () => {
        expect(mockUseForumSearch.getSuggestions).toHaveBeenCalledWith(
          'test query'
        );
      },
      { timeout: 500 }
    );
  });

  it('should perform search on Enter key', async () => {
    const user = userEvent.setup();
    render(<ForumSearch />);

    const searchInput = screen.getByPlaceholderText(
      'Search forum discussions...'
    );

    await user.type(searchInput, 'test query');
    await user.keyboard('{Enter}');

    expect(mockUseForumSearch.performSearch).toHaveBeenCalledWith({
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

  it('should show suggestions when available', () => {
    const mockSuggestions = [
      { text: 'algebra basics', type: 'thread', count: 5 },
      { text: 'calculus', type: 'category', count: 10 },
    ];

    vi.mocked(useForumSearch).mockReturnValue({
      ...mockUseForumSearch,
      suggestions: mockSuggestions,
    });

    render(<ForumSearch />);

    // Focus input to show suggestions
    const searchInput = screen.getByPlaceholderText(
      'Search forum discussions...'
    );
    fireEvent.focus(searchInput);

    expect(screen.getByText('algebra basics')).toBeInTheDocument();
    expect(screen.getByText('calculus')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('should show search results when available', () => {
    const mockResults = [
      {
        id: 1,
        type: 'post' as const,
        title: 'Test Thread',
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
      ...mockUseForumSearch,
      searchResults: mockResults,
    });

    render(<ForumSearch />);

    // Focus input to show results
    const searchInput = screen.getByPlaceholderText(
      'Search forum discussions...'
    );
    fireEvent.focus(searchInput);

    expect(screen.getByText('Test Thread')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('General')).toBeInTheDocument();
  });

  it('should call onResultSelect when result is clicked', async () => {
    const mockOnResultSelect = vi.fn();
    const mockResults = [
      {
        id: 1,
        type: 'post' as const,
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
    ];

    vi.mocked(useForumSearch).mockReturnValue({
      ...mockUseForumSearch,
      searchResults: mockResults,
    });

    const user = userEvent.setup();
    render(<ForumSearch onResultSelect={mockOnResultSelect} />);

    // Focus input to show results
    const searchInput = screen.getByPlaceholderText(
      'Search forum discussions...'
    );
    fireEvent.focus(searchInput);

    const resultButton = screen.getByRole('button', { name: /test thread/i });
    await user.click(resultButton);

    expect(mockOnResultSelect).toHaveBeenCalledWith(mockResults[0]);
  });

  it('should show loading state', () => {
    vi.mocked(useForumSearch).mockReturnValue({
      ...mockUseForumSearch,
      isLoading: true,
    });

    render(<ForumSearch />);

    // Focus input to show loading
    const searchInput = screen.getByPlaceholderText(
      'Search forum discussions...'
    );
    fireEvent.focus(searchInput);

    expect(screen.getByText('Searching...')).toBeInTheDocument();
  });

  it('should show error state', () => {
    vi.mocked(useForumSearch).mockReturnValue({
      ...mockUseForumSearch,
      error: 'Search failed',
    });

    render(<ForumSearch />);

    // Focus input to show error
    const searchInput = screen.getByPlaceholderText(
      'Search forum discussions...'
    );
    fireEvent.focus(searchInput);

    expect(
      screen.getByText('Search failed. Please try again.')
    ).toBeInTheDocument();
  });

  it('should show and hide advanced filters', async () => {
    const mockFilters = {
      categories: [{ id: 1, name: 'General', postCount: 10 }],
      authors: [{ id: 1, username: 'testuser', postCount: 5 }],
      dateRanges: [{ label: 'Last week', value: 'week' }],
    };

    vi.mocked(useForumSearch).mockReturnValue({
      ...mockUseForumSearch,
      searchFilters: mockFilters,
    });

    const user = userEvent.setup();
    render(<ForumSearch />);

    const filterButton = screen.getByRole('button', { name: /filter/i });

    // Filters should not be visible initially
    expect(screen.queryByText('Category')).not.toBeInTheDocument();

    // Click to show filters
    await user.click(filterButton);

    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Author')).toBeInTheDocument();
    expect(screen.getByText('Date From')).toBeInTheDocument();
    expect(screen.getByText('Date To')).toBeInTheDocument();
  });

  it('should clear search when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<ForumSearch />);

    const searchInput = screen.getByPlaceholderText(
      'Search forum discussions...'
    );

    // Type something to show clear button
    await user.type(searchInput, 'test');

    const clearButton = screen.getByRole('button', { name: /clear/i });
    await user.click(clearButton);

    expect(mockUseForumSearch.clearSearch).toHaveBeenCalled();
    expect(searchInput).toHaveValue('');
  });

  it('should handle suggestion click', async () => {
    const mockSuggestions = [
      { text: 'algebra basics', type: 'thread', count: 5 },
    ];

    vi.mocked(useForumSearch).mockReturnValue({
      ...mockUseForumSearch,
      suggestions: mockSuggestions,
    });

    const user = userEvent.setup();
    render(<ForumSearch />);

    // Focus input to show suggestions
    const searchInput = screen.getByPlaceholderText(
      'Search forum discussions...'
    );
    fireEvent.focus(searchInput);

    const suggestionButton = screen.getByRole('button', {
      name: /algebra basics/i,
    });
    await user.click(suggestionButton);

    expect(searchInput).toHaveValue('algebra basics');
    expect(mockUseForumSearch.performSearch).toHaveBeenCalledWith({
      q: 'algebra basics',
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
});
