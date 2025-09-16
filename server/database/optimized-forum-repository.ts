import { query, queryOne, transaction } from './connection.js';
import { cacheManager } from './cache-manager.js';
import type {
  ForumCategory,
  ForumThread,
  ForumPost,
  UserAvatar,
  ForumReport,
  PublicUserProfile,
} from '../../shared/forum-types.js';

/**
 * Optimized repository class for forum database operations
 * Includes caching, optimized queries, and efficient pagination
 */
export class OptimizedForumRepository {
  // ============================================================================
  // CATEGORY OPERATIONS (with caching)
  // ============================================================================

  async getCategories(): Promise<ForumCategory[]> {
    // Check cache first
    const cached = cacheManager.getCachedCategories();
    if (cached) {
      return cached;
    }

    // Optimized query with covering index
    const categories = await query<ForumCategory>(`
      SELECT 
        id, 
        name, 
        description, 
        parent_id as parentId, 
        sort_order as sortOrder,
        created_at as createdAt, 
        updated_at as updatedAt
      FROM forum_categories 
      ORDER BY parent_id IS NULL DESC, sort_order ASC, name ASC
    `);

    // Cache the results
    cacheManager.setCachedCategories(categories);
    return categories;
  }

  async getCategoryById(id: number): Promise<ForumCategory | null> {
    // For individual categories, we can check if it's in the cached list
    const allCategories = await this.getCategories();
    return allCategories.find(cat => cat.id === id) || null;
  }

  async createCategory(
    category: Omit<ForumCategory, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<number> {
    const result = await query(
      `
      INSERT INTO forum_categories (name, description, parent_id, sort_order)
      VALUES (?, ?, ?, ?)
    `,
      [
        category.name,
        category.description,
        category.parentId,
        category.sortOrder,
      ]
    );

    // Invalidate categories cache
    cacheManager.invalidateCategories();

    return (result as any).insertId;
  }

  async updateCategory(
    id: number,
    updates: Partial<Omit<ForumCategory, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.parentId !== undefined) {
      fields.push('parent_id = ?');
      values.push(updates.parentId);
    }
    if (updates.sortOrder !== undefined) {
      fields.push('sort_order = ?');
      values.push(updates.sortOrder);
    }

    if (fields.length === 0) {
      return;
    }

    values.push(id);

    await query(
      `UPDATE forum_categories SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );

    // Invalidate categories cache
    cacheManager.invalidateCategories();
  }

  async deleteCategory(id: number): Promise<void> {
    await query('DELETE FROM forum_categories WHERE id = ?', [id]);

    // Invalidate categories cache
    cacheManager.invalidateCategories();
  }

  // ============================================================================
  // THREAD OPERATIONS (with caching and optimized pagination)
  // ============================================================================

  async getThreadsByCategory(
    categoryId: number,
    limit = 20,
    offset = 0
  ): Promise<ForumThread[]> {
    const page = Math.floor(offset / limit) + 1;

    // Check cache first
    const cached = cacheManager.getCachedThreads(categoryId, page, limit);
    if (cached) {
      return cached;
    }

    // Optimized query using composite index
    const threads = await query<ForumThread>(
      `
      SELECT 
        t.id, 
        t.title, 
        t.category_id as categoryId, 
        t.author_id as authorId,
        t.is_pinned as isPinned, 
        t.is_locked as isLocked, 
        t.post_count as postCount,
        t.last_post_at as lastPostAt, 
        t.created_at as createdAt, 
        t.updated_at as updatedAt
      FROM forum_threads t
      WHERE t.category_id = ?
      ORDER BY t.is_pinned DESC, t.last_post_at DESC, t.created_at DESC
      LIMIT ? OFFSET ?
    `,
      [categoryId, limit, offset]
    );

    // Cache the results
    cacheManager.setCachedThreads(categoryId, page, limit, threads);
    return threads;
  }

  async getThreadById(id: number): Promise<ForumThread | null> {
    // Check cache first
    const cached = cacheManager.getCachedThread(id);
    if (cached) {
      return cached;
    }

    const thread = await queryOne<ForumThread>(
      `
      SELECT 
        id, 
        title, 
        category_id as categoryId, 
        author_id as authorId,
        is_pinned as isPinned, 
        is_locked as isLocked, 
        post_count as postCount,
        last_post_at as lastPostAt, 
        created_at as createdAt, 
        updated_at as updatedAt
      FROM forum_threads 
      WHERE id = ?
    `,
      [id]
    );

    if (thread) {
      cacheManager.setCachedThread(thread);
    }

    return thread;
  }

  async createThread(
    thread: Omit<
      ForumThread,
      'id' | 'postCount' | 'lastPostAt' | 'createdAt' | 'updatedAt'
    >
  ): Promise<number> {
    const result = await query(
      `
      INSERT INTO forum_threads (title, category_id, author_id, is_pinned, is_locked)
      VALUES (?, ?, ?, ?, ?)
    `,
      [
        thread.title,
        thread.categoryId,
        thread.authorId,
        thread.isPinned,
        thread.isLocked,
      ]
    );

    // Invalidate related caches
    cacheManager.invalidateThreads(thread.categoryId);
    cacheManager.invalidateStats();

    return (result as any).insertId;
  }

  async updateThread(
    id: number,
    updates: Partial<Omit<ForumThread, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.categoryId !== undefined) {
      fields.push('category_id = ?');
      values.push(updates.categoryId);
    }
    if (updates.isPinned !== undefined) {
      fields.push('is_pinned = ?');
      values.push(updates.isPinned);
    }
    if (updates.isLocked !== undefined) {
      fields.push('is_locked = ?');
      values.push(updates.isLocked);
    }

    if (fields.length === 0) {
      return;
    }

    values.push(id);

    await query(
      `UPDATE forum_threads SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );

    // Invalidate related caches
    const thread = await this.getThreadById(id);
    if (thread) {
      cacheManager.invalidateThreads(thread.categoryId);
      cacheManager.delete(`forum:thread:${id}`);
    }
  }

  async deleteThread(id: number): Promise<void> {
    // Get thread info before deletion for cache invalidation
    const thread = await this.getThreadById(id);

    await query('DELETE FROM forum_threads WHERE id = ?', [id]);

    // Invalidate related caches
    if (thread) {
      cacheManager.invalidateThreads(thread.categoryId);
    }
    cacheManager.delete(`forum:thread:${id}`);
    cacheManager.invalidateStats();
  }

  // ============================================================================
  // POST OPERATIONS (with optimized pagination)
  // ============================================================================

  async getPostsByThread(
    threadId: number,
    limit = 50,
    offset = 0
  ): Promise<ForumPost[]> {
    const page = Math.floor(offset / limit) + 1;

    // Check cache first
    const cached = cacheManager.getCachedPosts(threadId, page, limit);
    if (cached) {
      return cached;
    }

    // Optimized query using composite index for pagination
    const posts = await query<ForumPost>(
      `
      SELECT 
        id, 
        thread_id as threadId, 
        author_id as authorId, 
        parent_post_id as parentPostId,
        content, 
        math_expressions as mathExpressions, 
        is_edited as isEdited,
        edited_at as editedAt, 
        created_at as createdAt, 
        updated_at as updatedAt
      FROM forum_posts 
      WHERE thread_id = ?
      ORDER BY created_at ASC, id ASC
      LIMIT ? OFFSET ?
    `,
      [threadId, limit, offset]
    );

    // Cache the results
    cacheManager.setCachedPosts(threadId, page, limit, posts);
    return posts;
  }

  async getPostById(id: number): Promise<ForumPost | null> {
    return await queryOne<ForumPost>(
      `
      SELECT 
        id, 
        thread_id as threadId, 
        author_id as authorId, 
        parent_post_id as parentPostId,
        content, 
        math_expressions as mathExpressions, 
        is_edited as isEdited,
        edited_at as editedAt, 
        created_at as createdAt, 
        updated_at as updatedAt
      FROM forum_posts 
      WHERE id = ?
    `,
      [id]
    );
  }

  async createPost(
    post: Omit<
      ForumPost,
      'id' | 'isEdited' | 'editedAt' | 'createdAt' | 'updatedAt'
    >
  ): Promise<number> {
    return await transaction(async connection => {
      // Insert the post
      const [result] = await connection.execute(
        `
        INSERT INTO forum_posts (thread_id, author_id, parent_post_id, content, math_expressions)
        VALUES (?, ?, ?, ?, ?)
      `,
        [
          post.threadId,
          post.authorId,
          post.parentPostId,
          post.content,
          JSON.stringify(post.mathExpressions),
        ]
      );

      const postId = (result as any).insertId;

      // Update thread post count and last post time using optimized query
      await connection.execute(
        `
        UPDATE forum_threads 
        SET post_count = post_count + 1, 
            last_post_at = NOW(),
            updated_at = NOW()
        WHERE id = ?
      `,
        [post.threadId]
      );

      // Update user post count
      await connection.execute(
        `
        UPDATE users 
        SET forum_post_count = forum_post_count + 1
        WHERE id = ?
      `,
        [post.authorId]
      );

      // Invalidate related caches
      cacheManager.invalidatePosts(post.threadId);
      cacheManager.delete(`forum:thread:${post.threadId}`);
      cacheManager.invalidateUser(post.authorId);
      cacheManager.invalidateStats();

      return postId;
    });
  }

  async updatePost(
    id: number,
    updates: Partial<Omit<ForumPost, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.content !== undefined) {
      fields.push('content = ?');
      values.push(updates.content);
    }
    if (updates.mathExpressions !== undefined) {
      fields.push('math_expressions = ?');
      values.push(JSON.stringify(updates.mathExpressions));
    }
    if (updates.isEdited !== undefined) {
      fields.push('is_edited = ?');
      values.push(updates.isEdited);
    }
    if (updates.editedAt !== undefined) {
      fields.push('edited_at = ?');
      values.push(updates.editedAt);
    }

    if (fields.length === 0) {
      return;
    }

    values.push(id);

    // Get post info for cache invalidation
    const post = await this.getPostById(id);

    await query(
      `UPDATE forum_posts SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );

    // Invalidate related caches
    if (post) {
      cacheManager.invalidatePosts(post.threadId);
    }
  }

  async deletePost(id: number): Promise<void> {
    await transaction(async connection => {
      // Get post info before deletion
      const [postRows] = await connection.execute(
        'SELECT thread_id, author_id FROM forum_posts WHERE id = ?',
        [id]
      );

      if ((postRows as any[]).length === 0) {
        return;
      }

      const post = (postRows as any[])[0];

      // Delete the post (cascades to replies)
      await connection.execute('DELETE FROM forum_posts WHERE id = ?', [id]);

      // Update thread post count using optimized subquery
      await connection.execute(
        `
        UPDATE forum_threads 
        SET post_count = (
          SELECT COUNT(*) FROM forum_posts WHERE thread_id = ?
        ),
        last_post_at = (
          SELECT MAX(created_at) FROM forum_posts WHERE thread_id = ?
        ),
        updated_at = NOW()
        WHERE id = ?
      `,
        [post.thread_id, post.thread_id, post.thread_id]
      );

      // Update user post count
      await connection.execute(
        `
        UPDATE users 
        SET forum_post_count = GREATEST(0, forum_post_count - 1)
        WHERE id = ?
      `,
        [post.author_id]
      );

      // Invalidate related caches
      cacheManager.invalidatePosts(post.thread_id);
      cacheManager.delete(`forum:thread:${post.thread_id}`);
      cacheManager.invalidateUser(post.author_id);
      cacheManager.invalidateStats();
    });
  }

  async getPostReplies(
    parentPostId: number,
    limit = 20,
    offset = 0
  ): Promise<ForumPost[]> {
    // Optimized query for replies
    return await query<ForumPost>(
      `
      SELECT 
        id, 
        thread_id as threadId, 
        author_id as authorId, 
        parent_post_id as parentPostId,
        content, 
        math_expressions as mathExpressions, 
        is_edited as isEdited,
        edited_at as editedAt, 
        created_at as createdAt, 
        updated_at as updatedAt
      FROM forum_posts 
      WHERE parent_post_id = ?
      ORDER BY created_at ASC
      LIMIT ? OFFSET ?
    `,
      [parentPostId, limit, offset]
    );
  }

  // ============================================================================
  // USER OPERATIONS (with caching)
  // ============================================================================

  async getUserProfile(userId: number): Promise<PublicUserProfile | null> {
    // Check cache first
    const cached = cacheManager.getCachedUser(userId);
    if (cached) {
      return cached;
    }

    const profile = await queryOne<PublicUserProfile>(
      `
      SELECT 
        u.id, 
        u.username, 
        u.forum_role as role, 
        u.created_at as joinedAt,
        u.forum_post_count as postCount,
        ua.config as avatar
      FROM users u
      LEFT JOIN user_avatars ua ON u.id = ua.user_id
      WHERE u.id = ?
    `,
      [userId]
    );

    if (profile) {
      cacheManager.setCachedUser(profile);
    }

    return profile;
  }

  // ============================================================================
  // AVATAR OPERATIONS (with caching)
  // ============================================================================

  async getUserAvatar(userId: number): Promise<UserAvatar | null> {
    // Check cache first
    const cached = cacheManager.getCachedAvatar(userId);
    if (cached) {
      return cached;
    }

    const avatar = await queryOne<UserAvatar>(
      `
      SELECT 
        id, 
        user_id as userId, 
        config, 
        unlocked_items as unlockedItems,
        created_at as createdAt, 
        updated_at as updatedAt
      FROM user_avatars 
      WHERE user_id = ?
    `,
      [userId]
    );

    if (avatar) {
      cacheManager.setCachedAvatar(userId, avatar);
    }

    return avatar;
  }

  async saveUserAvatar(
    userId: number,
    config: any,
    unlockedItems: string[]
  ): Promise<void> {
    await query(
      `
      INSERT INTO user_avatars (user_id, config, unlocked_items)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        config = VALUES(config),
        unlocked_items = VALUES(unlocked_items),
        updated_at = NOW()
    `,
      [userId, JSON.stringify(config), JSON.stringify(unlockedItems)]
    );

    // Invalidate avatar cache
    cacheManager.invalidateAvatar(userId);
  }

  // ============================================================================
  // SEARCH OPERATIONS (with caching)
  // ============================================================================

  async searchPosts(
    searchQuery: string,
    limit = 20,
    offset = 0
  ): Promise<any[]> {
    const page = Math.floor(offset / limit) + 1;

    // Check cache first
    const cached = cacheManager.getCachedSearch(searchQuery, page, limit);
    if (cached) {
      return cached;
    }

    // Optimized full-text search query
    const results = await query(
      `
      SELECT 
        p.id, 
        p.content, 
        p.created_at as createdAt,
        t.id as threadId, 
        t.title as threadTitle,
        u.username as authorName,
        MATCH(p.content) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance
      FROM forum_posts p
      FORCE INDEX (idx_content_search)
      JOIN forum_threads t ON p.thread_id = t.id
      JOIN users u ON p.author_id = u.id
      WHERE MATCH(p.content) AGAINST(? IN NATURAL LANGUAGE MODE)
      ORDER BY relevance DESC, p.created_at DESC
      LIMIT ? OFFSET ?
    `,
      [searchQuery, searchQuery, limit, offset]
    );

    // Cache the results
    cacheManager.setCachedSearch(searchQuery, page, limit, results);
    return results;
  }

  // ============================================================================
  // STATISTICS (with caching)
  // ============================================================================

  async getForumStats(): Promise<any> {
    // Check cache first
    const cached = cacheManager.getCachedStats();
    if (cached) {
      return cached;
    }

    // Optimized stats query using covering indexes
    const stats = await queryOne(`
      SELECT 
        (SELECT COUNT(*) FROM forum_threads) as totalThreads,
        (SELECT COUNT(*) FROM forum_posts) as totalPosts,
        (SELECT COUNT(*) FROM users WHERE forum_role IS NOT NULL) as totalUsers,
        (SELECT COUNT(*) FROM users 
         WHERE forum_role IS NOT NULL 
         AND updated_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)) as activeUsers
    `);

    if (stats) {
      cacheManager.setCachedStats(stats);
    }

    return stats;
  }

  // ============================================================================
  // BATCH OPERATIONS for better performance
  // ============================================================================

  async getMultipleThreads(threadIds: number[]): Promise<ForumThread[]> {
    if (threadIds.length === 0) return [];

    // Check cache for each thread
    const cached: ForumThread[] = [];
    const uncachedIds: number[] = [];

    threadIds.forEach(id => {
      const cachedThread = cacheManager.getCachedThread(id);
      if (cachedThread) {
        cached.push(cachedThread);
      } else {
        uncachedIds.push(id);
      }
    });

    // Fetch uncached threads in batch
    if (uncachedIds.length > 0) {
      const placeholders = uncachedIds.map(() => '?').join(',');
      const uncached = await query<ForumThread>(
        `
        SELECT 
          id, 
          title, 
          category_id as categoryId, 
          author_id as authorId,
          is_pinned as isPinned, 
          is_locked as isLocked, 
          post_count as postCount,
          last_post_at as lastPostAt, 
          created_at as createdAt, 
          updated_at as updatedAt
        FROM forum_threads 
        WHERE id IN (${placeholders})
      `,
        uncachedIds
      );

      // Cache the fetched threads
      uncached.forEach(thread => {
        cacheManager.setCachedThread(thread);
      });

      cached.push(...uncached);
    }

    // Return in original order
    return threadIds
      .map(id => cached.find(thread => thread.id === id))
      .filter(Boolean) as ForumThread[];
  }

  async getMultipleUsers(userIds: number[]): Promise<PublicUserProfile[]> {
    if (userIds.length === 0) return [];

    // Check cache for each user
    const cached: PublicUserProfile[] = [];
    const uncachedIds: number[] = [];

    userIds.forEach(id => {
      const cachedUser = cacheManager.getCachedUser(id);
      if (cachedUser) {
        cached.push(cachedUser);
      } else {
        uncachedIds.push(id);
      }
    });

    // Fetch uncached users in batch
    if (uncachedIds.length > 0) {
      const placeholders = uncachedIds.map(() => '?').join(',');
      const uncached = await query<PublicUserProfile>(
        `
        SELECT 
          u.id, 
          u.username, 
          u.forum_role as role, 
          u.created_at as joinedAt,
          u.forum_post_count as postCount,
          ua.config as avatar
        FROM users u
        LEFT JOIN user_avatars ua ON u.id = ua.user_id
        WHERE u.id IN (${placeholders})
      `,
        uncachedIds
      );

      // Cache the fetched users
      uncached.forEach(user => {
        cacheManager.setCachedUser(user);
      });

      cached.push(...uncached);
    }

    // Return in original order
    return userIds
      .map(id => cached.find(user => user.id === id))
      .filter(Boolean) as PublicUserProfile[];
  }

  // ============================================================================
  // CACHE MANAGEMENT METHODS
  // ============================================================================

  async warmupCache(): Promise<void> {
    console.log('🔥 Warming up forum cache...');

    // Preload categories
    await this.getCategories();

    // Preload forum stats
    await this.getForumStats();

    console.log('✅ Forum cache warmed up');
  }

  getCacheStats() {
    return cacheManager.getStats();
  }

  clearCache(): void {
    cacheManager.clear();
  }
}

// Export singleton instance
export const optimizedForumRepository = new OptimizedForumRepository();
