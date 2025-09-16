import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import searchRouter from '../search.js';
import { searchService } from '../../../services/search-service.js';

// Mock the search service
vi.mock('../../../services/search-service.js', () => ({
  searchService: {
    searchForum: vi.fn(),
    getSearchSuggestions: vi.fn(),
    getSearchFilters: vi.fn(),
  },
}));

const app = express();
app.use(express.json());
app.use('/api/forum', searchRouter);

describe('Forum Search Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/forum/search', () => {
    it('should perform search with valid query', async () => {
      const mockResults = {
        results: [
          {
            id: 1,
            type: 'post',
            title: 'Test Thread',
            content: 'Test content with <mark>search</mark> term',
            excerpt: 'Test content with search term...',
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

      vi.mocked(searchService.searchForum).mockResolvedValue(mockResults);

      const response = await request(app)
        .get('/api/forum/search')
        .query({ q: 'test search' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.results).toHaveLength(1);
      expect(response.body.data.results[0].title).toBe('Test Thread');
      expect(response.body.pagination.total).toBe(1);
    });

    it('should handle search with filters', async () => {
      const mockResults = {
        results: [],
        total: 0,
        facets: { categories: [], authors: [] },
      };

      vi.mocked(searchService.searchForum).mockResolvedValue(mockResults);

      await request(app)
        .get('/api/forum/search')
        .query({
          q: 'test',
          category: '1',
          author: '2',
          dateFrom: '2024-01-01',
          sortBy: 'date',
          includeMath: 'true',
        })
        .expect(200);

      expect(searchService.searchForum).toHaveBeenCalledWith({
        q: 'test',
        category: '1',
        author: '2',
        dateFrom: '2024-01-01',
        dateTo: undefined,
        sortBy: 'date',
        page: 1,
        limit: 20,
        includeMath: true,
      });
    });

    it('should validate search parameters', async () => {
      // Empty query
      await request(app).get('/api/forum/search').query({ q: '' }).expect(400);

      // Invalid sort option
      await request(app)
        .get('/api/forum/search')
        .query({ q: 'test', sortBy: 'invalid' })
        .expect(400);

      // Invalid page number
      await request(app)
        .get('/api/forum/search')
        .query({ q: 'test', page: '0' })
        .expect(400);
    });

    it('should handle search service errors', async () => {
      vi.mocked(searchService.searchForum).mockRejectedValue(
        new Error('Search failed')
      );

      const response = await request(app)
        .get('/api/forum/search')
        .query({ q: 'test' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Search failed');
    });
  });

  describe('GET /api/forum/search/suggestions', () => {
    it('should return search suggestions', async () => {
      const mockSuggestions = [
        { text: 'algebra basics', type: 'thread', count: 5 },
        { text: 'calculus', type: 'category', count: 12 },
      ];

      vi.mocked(searchService.getSearchSuggestions).mockResolvedValue(
        mockSuggestions
      );

      const response = await request(app)
        .get('/api/forum/search/suggestions')
        .query({ q: 'alg' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockSuggestions);
    });

    it('should return empty array for short queries', async () => {
      const response = await request(app)
        .get('/api/forum/search/suggestions')
        .query({ q: 'a' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(searchService.getSearchSuggestions).not.toHaveBeenCalled();
    });

    it('should handle missing query parameter', async () => {
      const response = await request(app)
        .get('/api/forum/search/suggestions')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /api/forum/search/filters', () => {
    it('should return search filters', async () => {
      const mockFilters = {
        categories: [
          { id: 1, name: 'General', postCount: 10 },
          { id: 2, name: 'Math Help', postCount: 25 },
        ],
        authors: [
          { id: 1, username: 'mathexpert', postCount: 15 },
          { id: 2, username: 'student123', postCount: 8 },
        ],
        dateRanges: [
          { label: 'Last 24 hours', value: 'day' },
          { label: 'Last week', value: 'week' },
        ],
      };

      vi.mocked(searchService.getSearchFilters).mockResolvedValue(mockFilters);

      const response = await request(app)
        .get('/api/forum/search/filters')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockFilters);
    });

    it('should handle service errors', async () => {
      vi.mocked(searchService.getSearchFilters).mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app)
        .get('/api/forum/search/filters')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to get search filters');
    });
  });
});
