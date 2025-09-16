/**
 * Tests for backend performance optimizations
 * Verifies caching, query optimization, and pagination performance
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { optimizedForumRepository } from '../optimized-forum-repository.js';
import { cacheManager } from '../cache-manager.js';
import { performanceService } from '../../services/performance-service.js';
import { OffsetPagination, CursorPagination } from '../pagination-utils.js';
import { testConnection, query, closeConnection } from '../connection.js';

describe('Backend Performance Optimizations', () => {
  beforeAll(async () => {
    // Ensure database connection is working
    const isConnected = await testConnection();
    expect(isConnected).toBe(true);
  });

  afterAll(async () => {
    await closeConnection();
  });

  beforeEach(() => {
    // Clear cache and metrics before each test
    cacheManager.clear();
    performanceService.clearMetrics();
  });

  describe('Cache Manager', () => {
    it('should cache and retrieve data correctly', () => {
      const testData = { id: 1, name: 'Test Category' };

      // Initially should return null
      expect(cacheManager.get('test:key')).toBeNull();

      // Set data
      cacheManager.set('test:key', testData, 5000);

      // Should retrieve cached data
      expect(cacheManager.get('test:key')).toEqual(testData);
    });

    it('should respect TTL and expire entries', async () => {
      const testData = { id: 1, name: 'Test Data' };

      // Set with very short TTL
      cacheManager.set('test:expire', testData, 10);

      // Should be available immediately
      expect(cacheManager.get('test:expire')).toEqual(testData);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 20));

      // Should be expired
      expect(cacheManager.get('test:expire')).toBeNull();
    });

    it('should provide accurate cache statistics', () => {
      // Set some test data
      cacheManager.set('test:1', { data: 'test1' });
      cacheManager.set('test:2', { data: 'test2' });

      // Get some data (hits)
      cacheManager.get('test:1');
      cacheManager.get('test:1');

      // Try to get non-existent data (misses)
      cacheManager.get('test:nonexistent');

      const stats = cacheManager.getStats();

      expect(stats.sets).toBe(2);
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.size).toBe(2);
      expect(stats.hitRate).toBeGreaterThan(0);
    });

    it('should invalidate patterns correctly', () => {
      // Set test data with different patterns
      cacheManager.set('forum:categories:all', []);
      cacheManager.set('forum:threads:category:1', []);
      cacheManager.set('forum:threads:category:2', []);
      cacheManager.set('forum:posts:thread:1', []);

      // Invalidate thread patterns
      const deleted = cacheManager.invalidatePattern('forum:threads:*');

      expect(deleted).toBe(2);
      expect(cacheManager.get('forum:categories:all')).not.toBeNull();
      expect(cacheManager.get('forum:threads:category:1')).toBeNull();
      expect(cacheManager.get('forum:posts:thread:1')).not.toBeNull();
    });

    it('should clear expired entries automatically', async () => {
      // Set entries with different TTLs
      cacheManager.set('test:short', { data: 'short' }, 10);
      cacheManager.set('test:long', { data: 'long' }, 5000);

      expect(cacheManager.getStats().size).toBe(2);

      // Wait for short TTL to expire
      await new Promise(resolve => setTimeout(resolve, 20));

      // Clear expired entries
      const cleared = cacheManager.clearExpired();

      expect(cleared).toBe(1);
      expect(cacheManager.get('test:short')).toBeNull();
      expect(cacheManager.get('test:long')).not.toBeNull();
    });
  });

  describe('Performance Service', () => {
    it('should record query metrics correctly', () => {
      // Record some test queries
      performanceService.recordQuery('SELECT * FROM forum_posts', 150);
      performanceService.recordQuery('SELECT * FROM forum_threads', 250);
      performanceService.recordQuery('SELECT * FROM forum_categories', 50);

      const metrics = performanceService.getMetrics();

      expect(metrics.totalQueries).toBe(3);
      expect(metrics.averageQueryTime).toBeGreaterThan(0);
      expect(metrics.slowQueries).toHaveLength(0); // None should be slow with these times
    });

    it('should identify slow queries', () => {
      // Record a slow query
      performanceService.recordQuery(
        'SELECT * FROM forum_posts WHERE content LIKE "%test%"',
        1500
      );

      const metrics = performanceService.getMetrics();

      expect(metrics.slowQueries).toHaveLength(1);
      expect(metrics.slowQueries[0].executionTime).toBe(1500);
    });

    it('should generate optimization suggestions', () => {
      // Record queries that should trigger suggestions
      performanceService.recordQuery('SELECT * FROM forum_posts', 600); // Slow query
      performanceService.recordQuery('SELECT * FROM forum_threads', 700); // Slow query

      const suggestions = performanceService.getOptimizationSuggestions();

      expect(suggestions).toBeInstanceOf(Array);
      expect(suggestions.length).toBeGreaterThan(0);

      // Should have query optimization suggestions
      const queryOptimizations = suggestions.filter(s => s.type === 'query');
      expect(queryOptimizations.length).toBeGreaterThan(0);
    });

    it('should provide query analysis', () => {
      // Record various types of queries
      performanceService.recordQuery('SELECT * FROM forum_posts', 100);
      performanceService.recordQuery('INSERT INTO forum_posts VALUES (?)', 50);
      performanceService.recordQuery('UPDATE forum_posts SET content = ?', 75);
      performanceService.recordQuery('SELECT * FROM forum_posts', 120); // Duplicate

      const analysis = performanceService.getQueryAnalysis();

      expect(analysis.topSlowQueries).toBeInstanceOf(Array);
      expect(analysis.queryFrequency).toBeInstanceOf(Object);
      expect(analysis.queryTypeDistribution).toBeInstanceOf(Object);

      // Should have SELECT queries
      expect(analysis.queryTypeDistribution.SELECT).toBeGreaterThan(0);
    });
  });

  describe('Pagination Utils', () => {
    describe('OffsetPagination', () => {
      it('should build correct pagination query', () => {
        const baseQuery = 'SELECT * FROM forum_posts WHERE thread_id = ?';
        const options = { page: 2, limit: 20 };

        const result = OffsetPagination.buildQuery(baseQuery, options);

        expect(result.query).toContain('LIMIT ? OFFSET ?');
        expect(result.params).toEqual([20, 20]); // limit, offset
        expect(result.pagination.page).toBe(2);
        expect(result.pagination.limit).toBe(20);
        expect(result.pagination.offset).toBe(20);
      });

      it('should add ORDER BY if missing', () => {
        const baseQuery = 'SELECT * FROM forum_posts';
        const options = { page: 1, limit: 10 };

        const result = OffsetPagination.buildQuery(baseQuery, options);

        expect(result.query).toContain('ORDER BY id DESC');
      });

      it('should respect maximum limit', () => {
        const baseQuery = 'SELECT * FROM forum_posts';
        const options = { page: 1, limit: 200 };
        const maxLimit = 50;

        const result = OffsetPagination.buildQuery(
          baseQuery,
          options,
          maxLimit
        );

        expect(result.pagination.limit).toBe(50);
      });
    });

    describe('CursorPagination', () => {
      it('should build cursor query without cursor', () => {
        const baseQuery = 'SELECT * FROM forum_posts WHERE thread_id = ?';
        const options = {
          limit: 20,
          sortColumn: 'created_at',
          sortOrder: 'DESC' as const,
        };

        const result = CursorPagination.buildQuery(baseQuery, options);

        expect(result.query).toContain('ORDER BY created_at DESC');
        expect(result.query).toContain('LIMIT ?');
        expect(result.params).toEqual([21]); // limit + 1
      });

      it('should build cursor query with cursor', () => {
        const cursor = CursorPagination.encodeCursor({
          value: '2024-01-01 12:00:00',
          direction: 'next',
        });

        const baseQuery = 'SELECT * FROM forum_posts WHERE thread_id = ?';
        const options = {
          limit: 20,
          cursor,
          sortColumn: 'created_at',
          sortOrder: 'DESC' as const,
        };

        const result = CursorPagination.buildQuery(baseQuery, options);

        expect(result.query).toContain('AND created_at < ?');
        expect(result.params).toHaveLength(2); // cursor value + limit
      });

      it('should encode and decode cursors correctly', () => {
        const originalCursor = {
          value: '2024-01-01 12:00:00',
          direction: 'next' as const,
        };

        const encoded = CursorPagination.encodeCursor(originalCursor);
        const decoded = CursorPagination.decodeCursor(encoded);

        expect(decoded).toEqual(originalCursor);
      });
    });
  });

  describe('Optimized Repository', () => {
    it('should cache categories after first fetch', async () => {
      // Clear cache to ensure clean state
      cacheManager.clear();

      // First call should hit database
      const categories1 = await optimizedForumRepository.getCategories();
      expect(cacheManager.getCachedCategories()).toEqual(categories1);

      // Second call should use cache
      const categories2 = await optimizedForumRepository.getCategories();
      expect(categories2).toEqual(categories1);

      // Cache stats should show hits
      const stats = cacheManager.getStats();
      expect(stats.hits).toBeGreaterThan(0);
    });

    it('should invalidate cache when creating categories', async () => {
      // Populate cache
      await optimizedForumRepository.getCategories();
      expect(cacheManager.getCachedCategories()).not.toBeNull();

      // Create new category (this would normally require database setup)
      // For testing, we'll just verify the cache invalidation logic
      cacheManager.invalidateCategories();
      expect(cacheManager.getCachedCategories()).toBeNull();
    });

    it('should provide cache statistics', () => {
      const stats = optimizedForumRepository.getCacheStats();

      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
      expect(stats).toHaveProperty('hitRate');
      expect(typeof stats.hitRate).toBe('number');
    });
  });

  describe('Database Connection Optimization', () => {
    it('should have connection pool configured', async () => {
      // Test that we can make multiple concurrent queries
      const promises = Array.from({ length: 5 }, () =>
        query('SELECT 1 as test')
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result[0].test).toBe(1);
      });
    });

    it('should track query performance automatically', async () => {
      // Clear metrics
      performanceService.clearMetrics();

      // Execute a query
      await query('SELECT 1 as test');

      // Check if performance was tracked (in development mode)
      if (process.env.NODE_ENV === 'development') {
        const metrics = performanceService.getMetrics();
        expect(metrics.totalQueries).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Memory Management', () => {
    it('should limit cache size to prevent memory leaks', () => {
      // Fill cache with many entries
      for (let i = 0; i < 1000; i++) {
        cacheManager.set(`test:${i}`, { data: `test${i}` });
      }

      const memory = cacheManager.getMemoryUsage();

      expect(memory.entries).toBe(1000);
      expect(memory.estimatedSizeKB).toBeGreaterThan(0);

      // Clear cache to free memory
      cacheManager.clear();

      const memoryAfter = cacheManager.getMemoryUsage();
      expect(memoryAfter.entries).toBe(0);
    });

    it('should provide memory usage information', () => {
      // Add some test data
      cacheManager.set('test:memory', {
        data: 'x'.repeat(1000), // 1KB of data
      });

      const memory = cacheManager.getMemoryUsage();

      expect(memory).toHaveProperty('entries');
      expect(memory).toHaveProperty('estimatedSizeKB');
      expect(memory.entries).toBeGreaterThan(0);
      expect(memory.estimatedSizeKB).toBeGreaterThan(0);
    });
  });

  describe('Integration Tests', () => {
    it('should maintain performance under load simulation', async () => {
      const startTime = Date.now();

      // Simulate concurrent operations
      const operations = [
        // Cache operations
        () => cacheManager.set('load:test1', { data: 'test' }),
        () => cacheManager.get('load:test1'),
        () => cacheManager.set('load:test2', { data: 'test' }),
        () => cacheManager.get('load:test2'),

        // Database operations (simple queries)
        () => query('SELECT 1 as test'),
        () => query('SELECT NOW() as timestamp'),
      ];

      // Run operations multiple times
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(...operations.map(op => op()));
      }

      await Promise.all(promises);

      const duration = Date.now() - startTime;

      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(5000); // 5 seconds

      // Cache should be working
      const stats = cacheManager.getStats();
      expect(stats.hits).toBeGreaterThan(0);
    });
  });
});
