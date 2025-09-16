import { db } from './connection.js';

interface SearchParams {
  query: string;
  categoryId?: number;
  authorId?: number;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy: 'relevance' | 'date' | 'replies';
  page: number;
  limit: number;
  includeMath: boolean;
}

interface SearchPostResult {
  id: number;
  content: string;
  thread_id: number;
  thread_title: string;
  author_id: number;
  author_username: string;
  category_id: number;
  category_name: string;
  created_at: string;
  math_expressions: string | null;
  relevance_score?: number;
}

class SearchRepository {
  async searchPosts(params: SearchParams): Promise<{
    posts: SearchPostResult[];
    total: number;
  }> {
    const offset = (params.page - 1) * params.limit;

    // Build the search query with full-text search
    let searchQuery = `
      SELECT 
        p.id,
        p.content,
        p.thread_id,
        t.title as thread_title,
        p.author_id,
        u.username as author_username,
        c.id as category_id,
        c.name as category_name,
        p.created_at,
        p.math_expressions,
        MATCH(p.content) AGAINST (? IN NATURAL LANGUAGE MODE) as relevance_score
      FROM forum_posts p
      JOIN forum_threads t ON p.thread_id = t.id
      JOIN forum_categories c ON t.category_id = c.id
      JOIN users u ON p.author_id = u.id
      WHERE MATCH(p.content) AGAINST (? IN NATURAL LANGUAGE MODE)
    `;

    const queryParams: any[] = [params.query, params.query];

    // Add filters
    if (params.categoryId) {
      searchQuery += ' AND c.id = ?';
      queryParams.push(params.categoryId);
    }

    if (params.authorId) {
      searchQuery += ' AND p.author_id = ?';
      queryParams.push(params.authorId);
    }

    if (params.dateFrom) {
      searchQuery += ' AND p.created_at >= ?';
      queryParams.push(params.dateFrom.toISOString());
    }

    if (params.dateTo) {
      searchQuery += ' AND p.created_at <= ?';
      queryParams.push(params.dateTo.toISOString());
    }

    if (params.includeMath) {
      searchQuery += ' AND p.math_expressions IS NOT NULL';
    }

    // Add sorting
    switch (params.sortBy) {
      case 'relevance':
        searchQuery += ' ORDER BY relevance_score DESC, p.created_at DESC';
        break;
      case 'date':
        searchQuery += ' ORDER BY p.created_at DESC';
        break;
      case 'replies':
        searchQuery += `
          ORDER BY (
            SELECT COUNT(*) 
            FROM forum_posts p2 
            WHERE p2.thread_id = p.thread_id
          ) DESC, p.created_at DESC
        `;
        break;
    }

    // Add pagination
    searchQuery += ' LIMIT ? OFFSET ?';
    queryParams.push(params.limit, offset);

    // Execute search query
    const posts = (await db.all(
      searchQuery,
      queryParams
    )) as SearchPostResult[];

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM forum_posts p
      JOIN forum_threads t ON p.thread_id = t.id
      JOIN forum_categories c ON t.category_id = c.id
      WHERE MATCH(p.content) AGAINST (? IN NATURAL LANGUAGE MODE)
    `;

    const countParams: any[] = [params.query];
    let countParamIndex = 1;

    if (params.categoryId) {
      countQuery += ' AND c.id = ?';
      countParams.push(params.categoryId);
    }

    if (params.authorId) {
      countQuery += ' AND p.author_id = ?';
      countParams.push(params.authorId);
    }

    if (params.dateFrom) {
      countQuery += ' AND p.created_at >= ?';
      countParams.push(params.dateFrom.toISOString());
    }

    if (params.dateTo) {
      countQuery += ' AND p.created_at <= ?';
      countParams.push(params.dateTo.toISOString());
    }

    if (params.includeMath) {
      countQuery += ' AND p.math_expressions IS NOT NULL';
    }

    const totalResult = (await db.get(countQuery, countParams)) as {
      total: number;
    };

    return {
      posts,
      total: totalResult.total,
    };
  }

  async getSearchSuggestions(
    query: string,
    limit: number = 10
  ): Promise<
    Array<{
      text: string;
      type: 'thread' | 'category' | 'term';
      count: number;
    }>
  > {
    const suggestions: Array<{
      text: string;
      type: 'thread' | 'category' | 'term';
      count: number;
    }> = [];

    // Get thread title suggestions
    const threadSuggestions = await db.all(
      `
      SELECT t.title as text, COUNT(p.id) as count
      FROM forum_threads t
      JOIN forum_posts p ON t.id = p.thread_id
      WHERE t.title LIKE ?
      GROUP BY t.id, t.title
      ORDER BY count DESC
      LIMIT ?
    `,
      [`%${query}%`, Math.floor(limit / 2)]
    );

    suggestions.push(
      ...threadSuggestions.map(s => ({
        text: s.text,
        type: 'thread' as const,
        count: s.count,
      }))
    );

    // Get category suggestions
    const categorySuggestions = await db.all(
      `
      SELECT c.name as text, COUNT(p.id) as count
      FROM forum_categories c
      JOIN forum_threads t ON c.id = t.category_id
      JOIN forum_posts p ON t.id = p.thread_id
      WHERE c.name LIKE ?
      GROUP BY c.id, c.name
      ORDER BY count DESC
      LIMIT ?
    `,
      [`%${query}%`, Math.floor(limit / 2)]
    );

    suggestions.push(
      ...categorySuggestions.map(s => ({
        text: s.text,
        type: 'category' as const,
        count: s.count,
      }))
    );

    return suggestions.slice(0, limit);
  }

  async getSearchFacets(
    query: string,
    filters: {
      categoryId?: number;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ): Promise<{
    categories: Array<{ id: number; name: string; count: number }>;
    authors: Array<{ id: number; username: string; count: number }>;
  }> {
    let baseQuery = `
      FROM forum_posts p
      JOIN forum_threads t ON p.thread_id = t.id
      JOIN forum_categories c ON t.category_id = c.id
      JOIN users u ON p.author_id = u.id
      WHERE MATCH(p.content) AGAINST (? IN NATURAL LANGUAGE MODE)
    `;

    const queryParams: any[] = [query];

    if (filters.dateFrom) {
      baseQuery += ' AND p.created_at >= ?';
      queryParams.push(filters.dateFrom.toISOString());
    }

    if (filters.dateTo) {
      baseQuery += ' AND p.created_at <= ?';
      queryParams.push(filters.dateTo.toISOString());
    }

    // Get category facets
    const categoryFacets = await db.all(
      `
      SELECT c.id, c.name, COUNT(*) as count
      ${baseQuery}
      ${filters.categoryId ? '' : 'GROUP BY c.id, c.name'}
      ORDER BY count DESC
      LIMIT 10
    `,
      queryParams
    );

    // Get author facets
    const authorFacets = await db.all(
      `
      SELECT u.id, u.username, COUNT(*) as count
      ${baseQuery}
      GROUP BY u.id, u.username
      ORDER BY count DESC
      LIMIT 10
    `,
      queryParams
    );

    return {
      categories: categoryFacets.map(f => ({
        id: f.id,
        name: f.name,
        count: f.count,
      })),
      authors: authorFacets.map(f => ({
        id: f.id,
        username: f.username,
        count: f.count,
      })),
    };
  }

  async getActiveCategories(): Promise<
    Array<{
      id: number;
      name: string;
      post_count: number;
    }>
  > {
    return await db.all(`
      SELECT 
        c.id,
        c.name,
        COUNT(p.id) as post_count
      FROM forum_categories c
      LEFT JOIN forum_threads t ON c.id = t.category_id
      LEFT JOIN forum_posts p ON t.id = p.thread_id
      GROUP BY c.id, c.name
      HAVING post_count > 0
      ORDER BY post_count DESC
    `);
  }

  async getTopAuthors(limit: number = 20): Promise<
    Array<{
      id: number;
      username: string;
      post_count: number;
    }>
  > {
    return await db.all(
      `
      SELECT 
        u.id,
        u.username,
        COUNT(p.id) as post_count
      FROM users u
      JOIN forum_posts p ON u.id = p.author_id
      GROUP BY u.id, u.username
      ORDER BY post_count DESC
      LIMIT ?
    `,
      [limit]
    );
  }
}

export const searchRepository = new SearchRepository();
