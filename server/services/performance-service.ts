/**
 * Performance monitoring and optimization service for the forum
 * Tracks query performance, cache hit rates, and provides optimization insights
 */

interface QueryMetrics {
  query: string;
  executionTime: number;
  timestamp: number;
  params?: any[];
}

interface PerformanceMetrics {
  totalQueries: number;
  averageQueryTime: number;
  slowQueries: QueryMetrics[];
  cacheHitRate: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  uptime: number;
}

interface OptimizationSuggestion {
  type: 'index' | 'query' | 'cache' | 'connection';
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion: string;
  impact: string;
}

export class PerformanceService {
  private queryMetrics: QueryMetrics[] = [];
  private readonly SLOW_QUERY_THRESHOLD = 1000; // 1 second
  private readonly MAX_METRICS_HISTORY = 1000;
  private startTime = Date.now();

  /**
   * Record a database query execution
   */
  recordQuery(query: string, executionTime: number, params?: any[]): void {
    const metric: QueryMetrics = {
      query: this.sanitizeQuery(query),
      executionTime,
      timestamp: Date.now(),
      params: params ? this.sanitizeParams(params) : undefined,
    };

    this.queryMetrics.push(metric);

    // Keep only recent metrics to prevent memory leaks
    if (this.queryMetrics.length > this.MAX_METRICS_HISTORY) {
      this.queryMetrics = this.queryMetrics.slice(-this.MAX_METRICS_HISTORY);
    }

    // Log slow queries
    if (executionTime > this.SLOW_QUERY_THRESHOLD) {
      console.warn(`🐌 Slow query detected (${executionTime}ms):`, {
        query: metric.query,
        executionTime,
        params: metric.params,
      });
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    const now = Date.now();
    const recentMetrics = this.queryMetrics.filter(
      m => now - m.timestamp < 60000 // Last minute
    );

    const totalQueries = recentMetrics.length;
    const averageQueryTime =
      totalQueries > 0
        ? recentMetrics.reduce((sum, m) => sum + m.executionTime, 0) /
          totalQueries
        : 0;

    const slowQueries = this.queryMetrics
      .filter(m => m.executionTime > this.SLOW_QUERY_THRESHOLD)
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 10); // Top 10 slowest queries

    const memoryUsage = process.memoryUsage();

    return {
      totalQueries,
      averageQueryTime: Math.round(averageQueryTime * 100) / 100,
      slowQueries,
      cacheHitRate: this.getCacheHitRate(),
      memoryUsage: {
        heapUsed: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
        heapTotal:
          Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
        external: Math.round((memoryUsage.external / 1024 / 1024) * 100) / 100,
      },
      uptime: Math.round((now - this.startTime) / 1000),
    };
  }

  /**
   * Get optimization suggestions based on current metrics
   */
  getOptimizationSuggestions(): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    const metrics = this.getMetrics();

    // Check average query time
    if (metrics.averageQueryTime > 500) {
      suggestions.push({
        type: 'query',
        severity: 'high',
        description: `Average query time is ${metrics.averageQueryTime}ms`,
        suggestion: 'Review slow queries and add appropriate indexes',
        impact: 'Reducing query time will improve overall response times',
      });
    } else if (metrics.averageQueryTime > 200) {
      suggestions.push({
        type: 'query',
        severity: 'medium',
        description: `Average query time is ${metrics.averageQueryTime}ms`,
        suggestion: 'Consider optimizing frequently used queries',
        impact: 'Minor improvement in response times',
      });
    }

    // Check cache hit rate
    if (metrics.cacheHitRate < 50) {
      suggestions.push({
        type: 'cache',
        severity: 'high',
        description: `Cache hit rate is only ${metrics.cacheHitRate}%`,
        suggestion: 'Increase cache TTL or improve cache key strategies',
        impact: 'Better caching will significantly reduce database load',
      });
    } else if (metrics.cacheHitRate < 70) {
      suggestions.push({
        type: 'cache',
        severity: 'medium',
        description: `Cache hit rate is ${metrics.cacheHitRate}%`,
        suggestion: 'Fine-tune cache expiration times',
        impact: 'Moderate reduction in database queries',
      });
    }

    // Check memory usage
    const memoryUsagePercent =
      (metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal) * 100;
    if (memoryUsagePercent > 90) {
      suggestions.push({
        type: 'connection',
        severity: 'high',
        description: `Memory usage is at ${Math.round(memoryUsagePercent)}%`,
        suggestion:
          'Consider increasing available memory or optimizing memory usage',
        impact: 'Prevent out-of-memory errors and improve stability',
      });
    }

    // Check for specific slow query patterns
    const slowQueries = metrics.slowQueries;
    if (slowQueries.length > 0) {
      const commonSlowPatterns = this.analyzeSlowQueryPatterns(slowQueries);

      commonSlowPatterns.forEach(pattern => {
        suggestions.push({
          type: 'index',
          severity: pattern.count > 5 ? 'high' : 'medium',
          description: `Slow query pattern detected: ${pattern.pattern}`,
          suggestion: pattern.suggestion,
          impact: 'Adding appropriate indexes will improve query performance',
        });
      });
    }

    return suggestions;
  }

  /**
   * Get detailed query analysis
   */
  getQueryAnalysis(): {
    topSlowQueries: QueryMetrics[];
    queryFrequency: { [key: string]: number };
    queryTypeDistribution: { [key: string]: number };
  } {
    const topSlowQueries = this.queryMetrics
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 20);

    const queryFrequency: { [key: string]: number } = {};
    const queryTypeDistribution: { [key: string]: number } = {};

    this.queryMetrics.forEach(metric => {
      const normalizedQuery = this.normalizeQuery(metric.query);
      queryFrequency[normalizedQuery] =
        (queryFrequency[normalizedQuery] || 0) + 1;

      const queryType = this.getQueryType(metric.query);
      queryTypeDistribution[queryType] =
        (queryTypeDistribution[queryType] || 0) + 1;
    });

    return {
      topSlowQueries,
      queryFrequency,
      queryTypeDistribution,
    };
  }

  /**
   * Generate performance report
   */
  generateReport(): {
    summary: PerformanceMetrics;
    suggestions: OptimizationSuggestion[];
    analysis: ReturnType<typeof this.getQueryAnalysis>;
    recommendations: string[];
  } {
    const summary = this.getMetrics();
    const suggestions = this.getOptimizationSuggestions();
    const analysis = this.getQueryAnalysis();

    const recommendations = this.generateRecommendations(
      summary,
      suggestions,
      analysis
    );

    return {
      summary,
      suggestions,
      analysis,
      recommendations,
    };
  }

  /**
   * Clear performance metrics history
   */
  clearMetrics(): void {
    this.queryMetrics = [];
    console.log('📊 Performance metrics cleared');
  }

  /**
   * Private helper methods
   */

  private sanitizeQuery(query: string): string {
    // Remove sensitive data from queries for logging
    return query
      .replace(/VALUES\s*\([^)]*\)/gi, 'VALUES (?)')
      .replace(/=\s*'[^']*'/gi, "= '?'")
      .replace(/=\s*\d+/gi, '= ?')
      .trim();
  }

  private sanitizeParams(params: any[]): any[] {
    // Sanitize parameters to avoid logging sensitive data
    return params.map(param => {
      if (typeof param === 'string' && param.length > 100) {
        return `${param.substring(0, 100)}...`;
      }
      if (typeof param === 'object') {
        return '[Object]';
      }
      return param;
    });
  }

  private getCacheHitRate(): number {
    // This would integrate with the cache manager
    // For now, return a placeholder
    try {
      const { cacheManager } = require('../database/cache-manager.js');
      const stats = cacheManager.getStats();
      return stats.hitRate;
    } catch {
      return 0;
    }
  }

  private normalizeQuery(query: string): string {
    // Normalize queries for frequency analysis
    return query
      .replace(/\s+/g, ' ')
      .replace(/\d+/g, '?')
      .replace(/'[^']*'/g, '?')
      .toLowerCase()
      .trim();
  }

  private getQueryType(query: string): string {
    const trimmed = query.trim().toLowerCase();
    if (trimmed.startsWith('select')) return 'SELECT';
    if (trimmed.startsWith('insert')) return 'INSERT';
    if (trimmed.startsWith('update')) return 'UPDATE';
    if (trimmed.startsWith('delete')) return 'DELETE';
    if (trimmed.startsWith('create')) return 'CREATE';
    if (trimmed.startsWith('alter')) return 'ALTER';
    return 'OTHER';
  }

  private analyzeSlowQueryPatterns(slowQueries: QueryMetrics[]): Array<{
    pattern: string;
    count: number;
    suggestion: string;
  }> {
    const patterns: { [key: string]: number } = {};

    slowQueries.forEach(query => {
      const normalized = this.normalizeQuery(query.query);
      patterns[normalized] = (patterns[normalized] || 0) + 1;
    });

    return Object.entries(patterns)
      .filter(([_, count]) => count > 1)
      .map(([pattern, count]) => ({
        pattern,
        count,
        suggestion: this.getSuggestionForPattern(pattern),
      }))
      .sort((a, b) => b.count - a.count);
  }

  private getSuggestionForPattern(pattern: string): string {
    if (pattern.includes('forum_posts') && pattern.includes('thread_id')) {
      return 'Add composite index on (thread_id, created_at) for forum_posts';
    }
    if (pattern.includes('forum_threads') && pattern.includes('category_id')) {
      return 'Add composite index on (category_id, is_pinned, last_post_at) for forum_threads';
    }
    if (pattern.includes('join') && pattern.includes('forum_')) {
      return 'Consider denormalizing frequently joined data or adding covering indexes';
    }
    if (pattern.includes('order by') && pattern.includes('limit')) {
      return 'Add index on ORDER BY columns for efficient pagination';
    }
    if (pattern.includes('count(*)')) {
      return 'Consider caching count queries or using approximate counts';
    }
    return 'Review query structure and add appropriate indexes';
  }

  private generateRecommendations(
    summary: PerformanceMetrics,
    suggestions: OptimizationSuggestion[],
    analysis: ReturnType<typeof this.getQueryAnalysis>
  ): string[] {
    const recommendations: string[] = [];

    // High-level recommendations based on metrics
    if (summary.averageQueryTime > 300) {
      recommendations.push(
        'Consider implementing query result caching for frequently accessed data'
      );
    }

    if (summary.cacheHitRate < 60) {
      recommendations.push(
        'Increase cache TTL for stable data like categories and user profiles'
      );
    }

    if (summary.slowQueries.length > 5) {
      recommendations.push(
        'Review and optimize the most frequently slow queries'
      );
    }

    // Specific recommendations based on query patterns
    const selectQueries = analysis.queryTypeDistribution.SELECT || 0;
    const totalQueries = Object.values(analysis.queryTypeDistribution).reduce(
      (a, b) => a + b,
      0
    );

    if (selectQueries / totalQueries > 0.8) {
      recommendations.push(
        'High read-to-write ratio detected - consider read replicas for scaling'
      );
    }

    // Memory recommendations
    if (summary.memoryUsage.heapUsed > 500) {
      recommendations.push(
        'Consider implementing memory-efficient pagination for large result sets'
      );
    }

    return recommendations;
  }
}

// Export singleton instance
export const performanceService = new PerformanceService();

// Middleware to automatically track query performance
export const trackQueryPerformance = (originalQuery: Function) => {
  return async function (sql: string, params?: any[]) {
    const startTime = Date.now();
    try {
      const result = await originalQuery.call(this, sql, params);
      const executionTime = Date.now() - startTime;
      performanceService.recordQuery(sql, executionTime, params);
      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      performanceService.recordQuery(sql, executionTime, params);
      throw error;
    }
  };
};
