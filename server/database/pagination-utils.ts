/**
 * Efficient pagination utilities for large datasets
 * Implements cursor-based and offset-based pagination with optimizations
 */

export interface PaginationOptions {
  page?: number;
  limit?: number;
  cursor?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page?: number;
    limit: number;
    total?: number;
    hasMore: boolean;
    nextCursor?: string;
    prevCursor?: string;
  };
}

export interface CursorPaginationOptions {
  limit: number;
  cursor?: string;
  sortColumn: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Efficient offset-based pagination with optimizations
 */
export class OffsetPagination {
  /**
   * Create optimized pagination query with LIMIT and OFFSET
   */
  static buildQuery(
    baseQuery: string,
    options: PaginationOptions,
    maxLimit = 100
  ): {
    query: string;
    params: any[];
    pagination: { page: number; limit: number; offset: number };
  } {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(Math.max(1, options.limit || 20), maxLimit);
    const offset = (page - 1) * limit;

    // Add ORDER BY if not present (required for consistent pagination)
    let query = baseQuery.trim();
    if (!query.toLowerCase().includes('order by')) {
      query += ' ORDER BY id DESC';
    }

    // Add LIMIT and OFFSET
    query += ' LIMIT ? OFFSET ?';

    return {
      query,
      params: [limit, offset],
      pagination: { page, limit, offset },
    };
  }

  /**
   * Get total count for pagination metadata
   * Uses optimized counting techniques
   */
  static async getTotalCount(
    countQuery: string,
    params: any[] = []
  ): Promise<number> {
    const { query } = await import('./connection.js');

    // Optimize count query by removing unnecessary clauses
    const optimizedCountQuery = this.optimizeCountQuery(countQuery);

    const result = await query(optimizedCountQuery, params);
    return result[0]?.total || 0;
  }

  /**
   * Create complete paginated result
   */
  static async paginate<T>(
    baseQuery: string,
    countQuery: string,
    params: any[],
    options: PaginationOptions,
    maxLimit = 100
  ): Promise<PaginationResult<T>> {
    const { query } = await import('./connection.js');

    const {
      query: paginatedQuery,
      params: paginationParams,
      pagination,
    } = this.buildQuery(baseQuery, options, maxLimit);

    // Execute data query
    const data = await query<T>(paginatedQuery, [
      ...params,
      ...paginationParams,
    ]);

    // Get total count (can be skipped for performance if not needed)
    let total: number | undefined;
    if (options.page === 1 || data.length === pagination.limit) {
      // Only get count when necessary
      total = await this.getTotalCount(countQuery, params);
    }

    return {
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        hasMore: data.length === pagination.limit,
      },
    };
  }

  /**
   * Optimize count queries for better performance
   */
  private static optimizeCountQuery(countQuery: string): string {
    // Remove unnecessary ORDER BY clauses from count queries
    return countQuery
      .replace(/ORDER BY[^)]*(?=\s*$|\s*LIMIT|\s*OFFSET)/gi, '')
      .replace(/LIMIT\s+\d+/gi, '')
      .replace(/OFFSET\s+\d+/gi, '')
      .trim();
  }
}

/**
 * Cursor-based pagination for better performance on large datasets
 */
export class CursorPagination {
  /**
   * Build cursor-based pagination query
   */
  static buildQuery(
    baseQuery: string,
    options: CursorPaginationOptions
  ): {
    query: string;
    params: any[];
  } {
    const { limit, cursor, sortColumn, sortOrder = 'DESC' } = options;

    let query = baseQuery.trim();
    const params: any[] = [];

    // Add cursor condition if provided
    if (cursor) {
      const decodedCursor = this.decodeCursor(cursor);
      const operator = sortOrder === 'DESC' ? '<' : '>';

      // Add WHERE clause or extend existing one
      if (query.toLowerCase().includes('where')) {
        query += ` AND ${sortColumn} ${operator} ?`;
      } else {
        query += ` WHERE ${sortColumn} ${operator} ?`;
      }
      params.push(decodedCursor.value);
    }

    // Add ORDER BY
    if (!query.toLowerCase().includes('order by')) {
      query += ` ORDER BY ${sortColumn} ${sortOrder}`;
    }

    // Add LIMIT (fetch one extra to determine if there are more results)
    query += ' LIMIT ?';
    params.push(limit + 1);

    return { query, params };
  }

  /**
   * Create cursor-based paginated result
   */
  static async paginate<T extends Record<string, any>>(
    baseQuery: string,
    params: any[],
    options: CursorPaginationOptions
  ): Promise<PaginationResult<T>> {
    const { query } = await import('./connection.js');

    const { query: paginatedQuery, params: paginationParams } = this.buildQuery(
      baseQuery,
      options
    );

    const results = await query<T>(paginatedQuery, [
      ...params,
      ...paginationParams,
    ]);

    const hasMore = results.length > options.limit;
    const data = hasMore ? results.slice(0, options.limit) : results;

    let nextCursor: string | undefined;
    let prevCursor: string | undefined;

    if (data.length > 0) {
      // Create next cursor from last item
      if (hasMore) {
        const lastItem = data[data.length - 1];
        nextCursor = this.encodeCursor({
          value: lastItem[options.sortColumn],
          direction: 'next',
        });
      }

      // Create previous cursor from first item
      if (options.cursor) {
        const firstItem = data[0];
        prevCursor = this.encodeCursor({
          value: firstItem[options.sortColumn],
          direction: 'prev',
        });
      }
    }

    return {
      data,
      pagination: {
        limit: options.limit,
        hasMore,
        nextCursor,
        prevCursor,
      },
    };
  }

  /**
   * Encode cursor for client use
   */
  static encodeCursor(cursor: {
    value: any;
    direction: 'next' | 'prev';
  }): string {
    return Buffer.from(JSON.stringify(cursor)).toString('base64');
  }

  /**
   * Decode cursor from client
   */
  static decodeCursor(cursor: string): {
    value: any;
    direction: 'next' | 'prev';
  } {
    try {
      return JSON.parse(Buffer.from(cursor, 'base64').toString());
    } catch {
      throw new Error('Invalid cursor format');
    }
  }
}

/**
 * Keyset pagination for optimal performance on very large datasets
 */
export class KeysetPagination {
  /**
   * Build keyset pagination query using multiple columns for uniqueness
   */
  static buildQuery(
    baseQuery: string,
    keyColumns: string[],
    lastValues: any[],
    limit: number,
    sortOrder: 'ASC' | 'DESC' = 'DESC'
  ): {
    query: string;
    params: any[];
  } {
    let query = baseQuery.trim();
    const params: any[] = [];

    if (lastValues.length > 0 && lastValues.length === keyColumns.length) {
      // Build keyset condition
      const conditions: string[] = [];
      const operator = sortOrder === 'DESC' ? '<' : '>';
      const equalOperator = '=';

      // Create progressive conditions for keyset pagination
      for (let i = 0; i < keyColumns.length; i++) {
        const currentConditions: string[] = [];

        // Add equality conditions for previous columns
        for (let j = 0; j < i; j++) {
          currentConditions.push(`${keyColumns[j]} ${equalOperator} ?`);
          params.push(lastValues[j]);
        }

        // Add comparison condition for current column
        currentConditions.push(`${keyColumns[i]} ${operator} ?`);
        params.push(lastValues[i]);

        conditions.push(`(${currentConditions.join(' AND ')})`);
      }

      // Add WHERE clause or extend existing one
      const keysetCondition = conditions.join(' OR ');
      if (query.toLowerCase().includes('where')) {
        query += ` AND (${keysetCondition})`;
      } else {
        query += ` WHERE (${keysetCondition})`;
      }
    }

    // Add ORDER BY
    const orderByClause = keyColumns
      .map(col => `${col} ${sortOrder}`)
      .join(', ');
    if (!query.toLowerCase().includes('order by')) {
      query += ` ORDER BY ${orderByClause}`;
    }

    // Add LIMIT
    query += ' LIMIT ?';
    params.push(limit + 1); // Fetch one extra to check for more results

    return { query, params };
  }

  /**
   * Create keyset paginated result
   */
  static async paginate<T extends Record<string, any>>(
    baseQuery: string,
    params: any[],
    keyColumns: string[],
    lastValues: any[],
    limit: number,
    sortOrder: 'ASC' | 'DESC' = 'DESC'
  ): Promise<PaginationResult<T>> {
    const { query } = await import('./connection.js');

    const { query: paginatedQuery, params: paginationParams } = this.buildQuery(
      baseQuery,
      keyColumns,
      lastValues,
      limit,
      sortOrder
    );

    const results = await query<T>(paginatedQuery, [
      ...params,
      ...paginationParams,
    ]);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;

    let nextCursor: string | undefined;
    if (hasMore && data.length > 0) {
      const lastItem = data[data.length - 1];
      const nextValues = keyColumns.map(col => lastItem[col]);
      nextCursor = this.encodeCursor(nextValues);
    }

    return {
      data,
      pagination: {
        limit,
        hasMore,
        nextCursor,
      },
    };
  }

  /**
   * Encode keyset values as cursor
   */
  static encodeCursor(values: any[]): string {
    return Buffer.from(JSON.stringify(values)).toString('base64');
  }

  /**
   * Decode cursor to keyset values
   */
  static decodeCursor(cursor: string): any[] {
    try {
      return JSON.parse(Buffer.from(cursor, 'base64').toString());
    } catch {
      throw new Error('Invalid cursor format');
    }
  }
}

/**
 * Utility functions for pagination
 */
export class PaginationUtils {
  /**
   * Calculate pagination metadata
   */
  static calculateMetadata(
    total: number,
    page: number,
    limit: number
  ): {
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    startIndex: number;
    endIndex: number;
  } {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    const startIndex = (page - 1) * limit + 1;
    const endIndex = Math.min(page * limit, total);

    return {
      totalPages,
      hasNextPage,
      hasPrevPage,
      startIndex,
      endIndex,
    };
  }

  /**
   * Validate pagination parameters
   */
  static validateParams(
    page?: number,
    limit?: number,
    maxLimit = 100
  ): { page: number; limit: number } {
    const validatedPage = Math.max(1, page || 1);
    const validatedLimit = Math.min(Math.max(1, limit || 20), maxLimit);

    return {
      page: validatedPage,
      limit: validatedLimit,
    };
  }

  /**
   * Create pagination links for API responses
   */
  static createLinks(
    baseUrl: string,
    page: number,
    limit: number,
    totalPages: number
  ): {
    first?: string;
    prev?: string;
    next?: string;
    last?: string;
  } {
    const links: any = {};

    if (page > 1) {
      links.first = `${baseUrl}?page=1&limit=${limit}`;
      links.prev = `${baseUrl}?page=${page - 1}&limit=${limit}`;
    }

    if (page < totalPages) {
      links.next = `${baseUrl}?page=${page + 1}&limit=${limit}`;
      links.last = `${baseUrl}?page=${totalPages}&limit=${limit}`;
    }

    return links;
  }
}
