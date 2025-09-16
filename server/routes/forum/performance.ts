import { Router, Request, Response } from 'express';
import {
  authenticateToken,
  requirePermission,
  FORUM_PERMISSIONS,
  AuthenticatedRequest,
} from '../../middleware/auth.js';
import { performanceService } from '../../services/performance-service.js';
import { cacheManager } from '../../database/cache-manager.js';
import { optimizedForumRepository } from '../../database/optimized-forum-repository.js';
import { healthCheck } from '../../database/connection.js';

const router = Router();

// GET /api/forum/performance/metrics - Get current performance metrics (admin only)
router.get(
  '/metrics',
  authenticateToken,
  requirePermission(FORUM_PERMISSIONS.ADMIN_ACCESS),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const metrics = performanceService.getMetrics();
      const cacheStats = cacheManager.getStats();
      const cacheMemory = cacheManager.getMemoryUsage();

      res.json({
        performance: metrics,
        cache: {
          ...cacheStats,
          memory: cacheMemory,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      res.status(500).json({
        error: 'Failed to fetch performance metrics',
        code: 'PERFORMANCE_METRICS_ERROR',
      });
    }
  }
);

// GET /api/forum/performance/report - Get detailed performance report (admin only)
router.get(
  '/report',
  authenticateToken,
  requirePermission(FORUM_PERMISSIONS.ADMIN_ACCESS),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const report = performanceService.generateReport();
      const dbHealth = await healthCheck();

      res.json({
        ...report,
        database: dbHealth,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error generating performance report:', error);
      res.status(500).json({
        error: 'Failed to generate performance report',
        code: 'PERFORMANCE_REPORT_ERROR',
      });
    }
  }
);

// GET /api/forum/performance/cache - Get cache statistics (admin only)
router.get(
  '/cache',
  authenticateToken,
  requirePermission(FORUM_PERMISSIONS.ADMIN_ACCESS),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const stats = cacheManager.getStats();
      const memory = cacheManager.getMemoryUsage();
      const keys = cacheManager.getKeys();

      // Group keys by type for better insights
      const keysByType = keys.reduce(
        (acc, key) => {
          const type = key.split(':')[1] || 'other';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        },
        {} as { [key: string]: number }
      );

      res.json({
        stats,
        memory,
        keyDistribution: keysByType,
        totalKeys: keys.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error fetching cache statistics:', error);
      res.status(500).json({
        error: 'Failed to fetch cache statistics',
        code: 'CACHE_STATS_ERROR',
      });
    }
  }
);

// POST /api/forum/performance/cache/clear - Clear cache (admin only)
router.post(
  '/cache/clear',
  authenticateToken,
  requirePermission(FORUM_PERMISSIONS.ADMIN_ACCESS),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { pattern } = req.body;

      if (pattern) {
        // Clear specific pattern
        const cleared = cacheManager.invalidatePattern(pattern);
        res.json({
          message: `Cleared ${cleared} cache entries matching pattern: ${pattern}`,
          cleared,
          pattern,
        });
      } else {
        // Clear all cache
        cacheManager.clear();
        res.json({
          message: 'All cache entries cleared',
          cleared: 'all',
        });
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      res.status(500).json({
        error: 'Failed to clear cache',
        code: 'CACHE_CLEAR_ERROR',
      });
    }
  }
);

// POST /api/forum/performance/cache/warmup - Warm up cache (admin only)
router.post(
  '/cache/warmup',
  authenticateToken,
  requirePermission(FORUM_PERMISSIONS.ADMIN_ACCESS),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      await optimizedForumRepository.warmupCache();

      const stats = cacheManager.getStats();
      res.json({
        message: 'Cache warmed up successfully',
        stats,
      });
    } catch (error) {
      console.error('Error warming up cache:', error);
      res.status(500).json({
        error: 'Failed to warm up cache',
        code: 'CACHE_WARMUP_ERROR',
      });
    }
  }
);

// GET /api/forum/performance/queries - Get query analysis (admin only)
router.get(
  '/queries',
  authenticateToken,
  requirePermission(FORUM_PERMISSIONS.ADMIN_ACCESS),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const analysis = performanceService.getQueryAnalysis();

      res.json({
        ...analysis,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error fetching query analysis:', error);
      res.status(500).json({
        error: 'Failed to fetch query analysis',
        code: 'QUERY_ANALYSIS_ERROR',
      });
    }
  }
);

// POST /api/forum/performance/queries/clear - Clear query metrics (admin only)
router.post(
  '/queries/clear',
  authenticateToken,
  requirePermission(FORUM_PERMISSIONS.ADMIN_ACCESS),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      performanceService.clearMetrics();

      res.json({
        message: 'Query metrics cleared successfully',
      });
    } catch (error) {
      console.error('Error clearing query metrics:', error);
      res.status(500).json({
        error: 'Failed to clear query metrics',
        code: 'CLEAR_METRICS_ERROR',
      });
    }
  }
);

// GET /api/forum/performance/suggestions - Get optimization suggestions (admin only)
router.get(
  '/suggestions',
  authenticateToken,
  requirePermission(FORUM_PERMISSIONS.ADMIN_ACCESS),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const suggestions = performanceService.getOptimizationSuggestions();

      // Group suggestions by severity
      const groupedSuggestions = suggestions.reduce(
        (acc, suggestion) => {
          acc[suggestion.severity] = acc[suggestion.severity] || [];
          acc[suggestion.severity].push(suggestion);
          return acc;
        },
        {} as { [key: string]: typeof suggestions }
      );

      res.json({
        suggestions: groupedSuggestions,
        total: suggestions.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error fetching optimization suggestions:', error);
      res.status(500).json({
        error: 'Failed to fetch optimization suggestions',
        code: 'SUGGESTIONS_ERROR',
      });
    }
  }
);

// GET /api/forum/performance/health - Get system health check (admin only)
router.get(
  '/health',
  authenticateToken,
  requirePermission(FORUM_PERMISSIONS.ADMIN_ACCESS),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const dbHealth = await healthCheck();
      const cacheStats = cacheManager.getStats();
      const performanceMetrics = performanceService.getMetrics();

      // Determine overall health status
      let status = 'healthy';
      const issues: string[] = [];

      if (dbHealth.status === 'unhealthy') {
        status = 'unhealthy';
        issues.push('Database connection issues');
      }

      if (performanceMetrics.averageQueryTime > 1000) {
        status = status === 'healthy' ? 'degraded' : status;
        issues.push('High average query time');
      }

      if (cacheStats.hitRate < 50) {
        status = status === 'healthy' ? 'degraded' : status;
        issues.push('Low cache hit rate');
      }

      if (performanceMetrics.memoryUsage.heapUsed > 1000) {
        status = status === 'healthy' ? 'degraded' : status;
        issues.push('High memory usage');
      }

      res.json({
        status,
        issues,
        database: dbHealth,
        cache: {
          hitRate: cacheStats.hitRate,
          size: cacheStats.size,
        },
        performance: {
          averageQueryTime: performanceMetrics.averageQueryTime,
          memoryUsage: performanceMetrics.memoryUsage,
          uptime: performanceMetrics.uptime,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error checking system health:', error);
      res.status(500).json({
        status: 'unhealthy',
        error: 'Failed to check system health',
        code: 'HEALTH_CHECK_ERROR',
      });
    }
  }
);

export default router;
