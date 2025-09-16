import { searchRepository } from '../database/search-repository.js';
import type {
  SearchQuery,
  SearchResult,
  SearchSuggestion,
  SearchFilters,
} from '../../shared/forum-types.js';

class SearchService {
  async searchForum(query: SearchQuery): Promise<{
    results: SearchResult[];
    total: number;
    facets: {
      categories: Array<{ id: number; name: string; count: number }>;
      authors: Array<{ id: number; username: string; count: number }>;
    };
  }> {
    try {
      // Sanitize search query
      const sanitizedQuery = this.sanitizeSearchQuery(query.q);

      // Perform full-text search
      const results = await searchRepository.searchPosts({
        query: sanitizedQuery,
        categoryId: query.category ? parseInt(query.category) : undefined,
        authorId: query.author ? parseInt(query.author) : undefined,
        dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
        dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
        sortBy: query.sortBy,
        page: query.page,
        limit: query.limit,
        includeMath: query.includeMath,
      });

      // Get search facets for filtering
      const facets = await searchRepository.getSearchFacets(sanitizedQuery, {
        categoryId: query.category ? parseInt(query.category) : undefined,
        dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
        dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
      });

      return {
        results: results.posts.map(post => ({
          id: post.id,
          type: 'post' as const,
          title: post.thread_title,
          content: this.highlightSearchTerms(post.content, sanitizedQuery),
          excerpt: this.createExcerpt(post.content, sanitizedQuery),
          author: {
            id: post.author_id,
            username: post.author_username,
          },
          thread: {
            id: post.thread_id,
            title: post.thread_title,
            category: {
              id: post.category_id,
              name: post.category_name,
            },
          },
          createdAt: post.created_at,
          relevanceScore: post.relevance_score || 0,
          mathContent: post.math_expressions
            ? JSON.parse(post.math_expressions)
            : null,
        })),
        total: results.total,
        facets,
      };
    } catch (error) {
      console.error('Search service error:', error);
      throw new Error('Search operation failed');
    }
  }

  async getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
    try {
      const sanitizedQuery = this.sanitizeSearchQuery(query);

      // Get suggestions from thread titles and popular search terms
      const suggestions =
        await searchRepository.getSearchSuggestions(sanitizedQuery);

      return suggestions.map(suggestion => ({
        text: suggestion.text,
        type: suggestion.type,
        count: suggestion.count,
      }));
    } catch (error) {
      console.error('Search suggestions error:', error);
      return [];
    }
  }

  async getSearchFilters(): Promise<SearchFilters> {
    try {
      const [categories, topAuthors] = await Promise.all([
        searchRepository.getActiveCategories(),
        searchRepository.getTopAuthors(),
      ]);

      return {
        categories: categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          postCount: cat.post_count,
        })),
        authors: topAuthors.map(author => ({
          id: author.id,
          username: author.username,
          postCount: author.post_count,
        })),
        dateRanges: [
          { label: 'Last 24 hours', value: 'day' },
          { label: 'Last week', value: 'week' },
          { label: 'Last month', value: 'month' },
          { label: 'Last year', value: 'year' },
        ],
      };
    } catch (error) {
      console.error('Search filters error:', error);
      throw new Error('Failed to get search filters');
    }
  }

  private sanitizeSearchQuery(query: string): string {
    // Remove potentially dangerous characters and normalize
    return query
      .trim()
      .replace(/[<>'"]/g, '') // Remove HTML/script injection chars
      .replace(/\s+/g, ' ') // Normalize whitespace
      .substring(0, 500); // Limit length
  }

  private highlightSearchTerms(content: string, query: string): string {
    if (!query || query.length < 2) return content;

    // Split query into terms and create regex
    const terms = query.split(/\s+/).filter(term => term.length > 1);
    const regex = new RegExp(
      `(${terms
        .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|')})`,
      'gi'
    );

    // Highlight matching terms
    return content.replace(regex, '<mark>$1</mark>');
  }

  private createExcerpt(
    content: string,
    query: string,
    maxLength: number = 200
  ): string {
    if (!query || query.length < 2) {
      return (
        content.substring(0, maxLength) +
        (content.length > maxLength ? '...' : '')
      );
    }

    // Find the first occurrence of any search term
    const terms = query.split(/\s+/).filter(term => term.length > 1);
    let bestMatch = -1;
    let bestTerm = '';

    for (const term of terms) {
      const index = content.toLowerCase().indexOf(term.toLowerCase());
      if (index !== -1 && (bestMatch === -1 || index < bestMatch)) {
        bestMatch = index;
        bestTerm = term;
      }
    }

    if (bestMatch === -1) {
      return (
        content.substring(0, maxLength) +
        (content.length > maxLength ? '...' : '')
      );
    }

    // Create excerpt around the match
    const start = Math.max(0, bestMatch - 50);
    const end = Math.min(content.length, bestMatch + bestTerm.length + 150);

    let excerpt = content.substring(start, end);
    if (start > 0) excerpt = '...' + excerpt;
    if (end < content.length) excerpt = excerpt + '...';

    return excerpt;
  }
}

export const searchService = new SearchService();
