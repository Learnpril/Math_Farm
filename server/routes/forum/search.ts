import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import { searchService } from '../../services/search-service.js';
import { z } from 'zod';

const router = Router();

// Search validation schema
const searchQuerySchema = z.object({
  q: z.string().min(1).max(500),
  category: z.string().optional(),
  author: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(['relevance', 'date', 'replies']).default('relevance'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  includeMath: z.coerce.boolean().default(false),
});

// Full-text search endpoint
router.get('/search', async (req, res) => {
  try {
    const query = searchQuerySchema.parse(req.query);

    const results = await searchService.searchForum(query);

    res.json({
      success: true,
      data: results,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: results.total,
        pages: Math.ceil(results.total / query.limit),
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(400).json({
      success: false,
      error:
        error instanceof z.ZodError
          ? 'Invalid search parameters'
          : 'Search failed',
    });
  }
});

// Search suggestions endpoint
router.get('/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const suggestions = await searchService.getSearchSuggestions(q);

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get search suggestions',
    });
  }
});

// Advanced search filters endpoint
router.get('/search/filters', async (req, res) => {
  try {
    const filters = await searchService.getSearchFilters();

    res.json({
      success: true,
      data: filters,
    });
  } catch (error) {
    console.error('Search filters error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get search filters',
    });
  }
});

export default router;
