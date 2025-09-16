/**
 * In-memory cache manager for forum data
 * Provides caching for frequently accessed data to reduce database load
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  size: number;
}

export class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    size: 0,
  };

  // Default TTL values (in milliseconds)
  private readonly DEFAULT_TTL = {
    categories: 30 * 60 * 1000, // 30 minutes - categories change infrequently
    threads: 5 * 60 * 1000, // 5 minutes - threads change moderately
    posts: 2 * 60 * 1000, // 2 minutes - posts change frequently
    users: 10 * 60 * 1000, // 10 minutes - user data changes infrequently
    avatars: 60 * 60 * 1000, // 1 hour - avatars change very infrequently
    stats: 5 * 60 * 1000, // 5 minutes - stats change moderately
    search: 10 * 60 * 1000, // 10 minutes - search results can be cached longer
  };

  /**
   * Get data from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.deletes++;
      return null;
    }

    this.stats.hits++;
    return entry.data;
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const defaultTtl = this.getDefaultTtl(key);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || defaultTtl,
    };

    this.cache.set(key, entry);
    this.stats.sets++;
    this.updateSize();
  }

  /**
   * Delete data from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
      this.updateSize();
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      size: 0,
    };
  }

  /**
   * Clear expired entries
   */
  clearExpired(): number {
    let cleared = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleared++;
      }
    }

    this.stats.deletes += cleared;
    this.updateSize();
    return cleared;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & { hitRate: number } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100,
    };
  }

  /**
   * Get cache keys matching a pattern
   */
  getKeys(pattern?: string): string[] {
    const keys = Array.from(this.cache.keys());

    if (!pattern) {
      return keys;
    }

    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return keys.filter(key => regex.test(key));
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidatePattern(pattern: string): number {
    const keys = this.getKeys(pattern);
    let deleted = 0;

    keys.forEach(key => {
      if (this.delete(key)) {
        deleted++;
      }
    });

    return deleted;
  }

  /**
   * Get memory usage information
   */
  getMemoryUsage(): {
    entries: number;
    estimatedSizeKB: number;
  } {
    let estimatedSize = 0;

    for (const [key, entry] of this.cache.entries()) {
      // Rough estimation of memory usage
      estimatedSize += key.length * 2; // String key (UTF-16)
      estimatedSize += JSON.stringify(entry.data).length * 2; // Data size
      estimatedSize += 24; // Entry metadata overhead
    }

    return {
      entries: this.cache.size,
      estimatedSizeKB: Math.round(estimatedSize / 1024),
    };
  }

  /**
   * Cache helper methods for specific data types
   */

  // Categories cache helpers
  getCachedCategories(): any[] | null {
    return this.get('forum:categories:all');
  }

  setCachedCategories(categories: any[]): void {
    this.set('forum:categories:all', categories);
  }

  invalidateCategories(): void {
    this.invalidatePattern('forum:categories:*');
  }

  // Thread cache helpers
  getCachedThreads(
    categoryId: number,
    page: number,
    limit: number
  ): any[] | null {
    return this.get(`forum:threads:category:${categoryId}:${page}:${limit}`);
  }

  setCachedThreads(
    categoryId: number,
    page: number,
    limit: number,
    threads: any[]
  ): void {
    this.set(`forum:threads:category:${categoryId}:${page}:${limit}`, threads);
  }

  getCachedThread(threadId: number): any | null {
    return this.get(`forum:thread:${threadId}`);
  }

  setCachedThread(thread: any): void {
    this.set(`forum:thread:${thread.id}`, thread);
  }

  invalidateThreads(categoryId?: number): void {
    if (categoryId) {
      this.invalidatePattern(`forum:threads:category:${categoryId}:*`);
    } else {
      this.invalidatePattern('forum:threads:*');
    }
  }

  // Posts cache helpers
  getCachedPosts(threadId: number, page: number, limit: number): any[] | null {
    return this.get(`forum:posts:thread:${threadId}:${page}:${limit}`);
  }

  setCachedPosts(
    threadId: number,
    page: number,
    limit: number,
    posts: any[]
  ): void {
    this.set(`forum:posts:thread:${threadId}:${page}:${limit}`, posts);
  }

  invalidatePosts(threadId?: number): void {
    if (threadId) {
      this.invalidatePattern(`forum:posts:thread:${threadId}:*`);
    } else {
      this.invalidatePattern('forum:posts:*');
    }
  }

  // User cache helpers
  getCachedUser(userId: number): any | null {
    return this.get(`forum:user:${userId}`);
  }

  setCachedUser(user: any): void {
    this.set(`forum:user:${user.id}`, user);
  }

  invalidateUser(userId: number): void {
    this.invalidatePattern(`forum:user:${userId}*`);
  }

  // Avatar cache helpers
  getCachedAvatar(userId: number): any | null {
    return this.get(`forum:avatar:${userId}`);
  }

  setCachedAvatar(userId: number, avatar: any): void {
    this.set(`forum:avatar:${userId}`, avatar);
  }

  invalidateAvatar(userId: number): void {
    this.delete(`forum:avatar:${userId}`);
  }

  // Stats cache helpers
  getCachedStats(): any | null {
    return this.get('forum:stats:general');
  }

  setCachedStats(stats: any): void {
    this.set('forum:stats:general', stats);
  }

  invalidateStats(): void {
    this.invalidatePattern('forum:stats:*');
  }

  // Search cache helpers
  getCachedSearch(query: string, page: number, limit: number): any | null {
    const key = `forum:search:${Buffer.from(query).toString('base64')}:${page}:${limit}`;
    return this.get(key);
  }

  setCachedSearch(
    query: string,
    page: number,
    limit: number,
    results: any
  ): void {
    const key = `forum:search:${Buffer.from(query).toString('base64')}:${page}:${limit}`;
    this.set(key, results);
  }

  /**
   * Private helper methods
   */
  private getDefaultTtl(key: string): number {
    if (key.includes('categories')) return this.DEFAULT_TTL.categories;
    if (key.includes('threads')) return this.DEFAULT_TTL.threads;
    if (key.includes('posts')) return this.DEFAULT_TTL.posts;
    if (key.includes('user')) return this.DEFAULT_TTL.users;
    if (key.includes('avatar')) return this.DEFAULT_TTL.avatars;
    if (key.includes('stats')) return this.DEFAULT_TTL.stats;
    if (key.includes('search')) return this.DEFAULT_TTL.search;

    return 5 * 60 * 1000; // Default 5 minutes
  }

  private updateSize(): void {
    this.stats.size = this.cache.size;
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

// Cleanup expired entries every 5 minutes
setInterval(
  () => {
    const cleared = cacheManager.clearExpired();
    if (cleared > 0) {
      console.log(`🧹 Cleared ${cleared} expired cache entries`);
    }
  },
  5 * 60 * 1000
);

// Log cache stats every hour in development
if (process.env.NODE_ENV === 'development') {
  setInterval(
    () => {
      const stats = cacheManager.getStats();
      const memory = cacheManager.getMemoryUsage();
      console.log('📊 Cache Stats:', {
        ...stats,
        ...memory,
      });
    },
    60 * 60 * 1000
  );
}
