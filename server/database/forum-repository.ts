import { query, queryOne, transaction } from './connection.js';
import type {
  ForumCategory,
  ForumThread,
  ForumPost,
  UserAvatar,
  ForumReport,
  PublicUserProfile,
} from '../../shared/forum-types.js';

/**
 * Repository class for forum database operations
 * Provides a clean interface for database interactions
 */
export class ForumRepository {
  // Category operations
  async getCategories(): Promise<ForumCategory[]> {
    return await query<ForumCategory>(`
      SELECT id, name, description, parent_id as parentId, sort_order as sortOrder,
             created_at as createdAt, updated_at as updatedAt
      FROM forum_categories 
      ORDER BY parent_id IS NULL DESC, sort_order ASC, name ASC
    `);
  }

  async getCategoryById(id: number): Promise<ForumCategory | null> {
    return await queryOne<ForumCategory>(
      `
      SELECT id, name, description, parent_id as parentId, sort_order as sortOrder,
             created_at as createdAt, updated_at as updatedAt
      FROM forum_categories 
      WHERE id = ?
    `,
      [id]
    );
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
      return; // No updates to perform
    }

    values.push(id);

    await query(
      `UPDATE forum_categories SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );
  }

  async deleteCategory(id: number): Promise<void> {
    await query('DELETE FROM forum_categories WHERE id = ?', [id]);
  }

  // Thread operations
  async getThreadsByCategory(
    categoryId: number,
    limit = 20,
    offset = 0
  ): Promise<ForumThread[]> {
    return await query<ForumThread>(
      `
      SELECT t.id, t.title, t.category_id as categoryId, t.author_id as authorId,
             t.is_pinned as isPinned, t.is_locked as isLocked, t.post_count as postCount,
             t.last_post_at as lastPostAt, t.created_at as createdAt, t.updated_at as updatedAt
      FROM forum_threads t
      WHERE t.category_id = ?
      ORDER BY t.is_pinned DESC, t.last_post_at DESC, t.created_at DESC
      LIMIT ? OFFSET ?
    `,
      [categoryId, limit, offset]
    );
  }

  async getThreadById(id: number): Promise<ForumThread | null> {
    return await queryOne<ForumThread>(
      `
      SELECT id, title, category_id as categoryId, author_id as authorId,
             is_pinned as isPinned, is_locked as isLocked, post_count as postCount,
             last_post_at as lastPostAt, created_at as createdAt, updated_at as updatedAt
      FROM forum_threads 
      WHERE id = ?
    `,
      [id]
    );
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
      return; // No updates to perform
    }

    values.push(id);

    await query(
      `UPDATE forum_threads SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );
  }

  async deleteThread(id: number): Promise<void> {
    await query('DELETE FROM forum_threads WHERE id = ?', [id]);
  }

  // Post operations
  async getPostsByThread(
    threadId: number,
    limit = 50,
    offset = 0
  ): Promise<ForumPost[]> {
    return await query<ForumPost>(
      `
      SELECT id, thread_id as threadId, author_id as authorId, parent_post_id as parentPostId,
             content, math_expressions as mathExpressions, is_edited as isEdited,
             edited_at as editedAt, created_at as createdAt, updated_at as updatedAt
      FROM forum_posts 
      WHERE thread_id = ?
      ORDER BY created_at ASC
      LIMIT ? OFFSET ?
    `,
      [threadId, limit, offset]
    );
  }

  async getPostById(id: number): Promise<ForumPost | null> {
    return await queryOne<ForumPost>(
      `
      SELECT id, thread_id as threadId, author_id as authorId, parent_post_id as parentPostId,
             content, math_expressions as mathExpressions, is_edited as isEdited,
             edited_at as editedAt, created_at as createdAt, updated_at as updatedAt
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

      // Update thread post count and last post time
      await connection.execute(
        `
        UPDATE forum_threads 
        SET post_count = post_count + 1, last_post_at = NOW()
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
      return; // No updates to perform
    }

    values.push(id);

    await query(
      `UPDATE forum_posts SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );
  }

  async deletePost(id: number): Promise<void> {
    await transaction(async connection => {
      // Get post info before deletion
      const [postRows] = await connection.execute(
        'SELECT thread_id, author_id FROM forum_posts WHERE id = ?',
        [id]
      );

      if ((postRows as any[]).length === 0) {
        return; // Post doesn't exist
      }

      const post = (postRows as any[])[0];

      // Delete the post (cascades to replies)
      await connection.execute('DELETE FROM forum_posts WHERE id = ?', [id]);

      // Update thread post count
      await connection.execute(
        `
        UPDATE forum_threads 
        SET post_count = (SELECT COUNT(*) FROM forum_posts WHERE thread_id = ?),
            last_post_at = (SELECT MAX(created_at) FROM forum_posts WHERE thread_id = ?)
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
    });
  }

  async getPostReplies(
    parentPostId: number,
    limit = 20,
    offset = 0
  ): Promise<ForumPost[]> {
    return await query<ForumPost>(
      `
      SELECT id, thread_id as threadId, author_id as authorId, parent_post_id as parentPostId,
             content, math_expressions as mathExpressions, is_edited as isEdited,
             edited_at as editedAt, created_at as createdAt, updated_at as updatedAt
      FROM forum_posts 
      WHERE parent_post_id = ?
      ORDER BY created_at ASC
      LIMIT ? OFFSET ?
    `,
      [parentPostId, limit, offset]
    );
  }

  // User operations
  async getUserProfile(userId: number): Promise<PublicUserProfile | null> {
    return await queryOne<PublicUserProfile>(
      `
      SELECT u.id, u.username, u.forum_role as role, u.created_at as joinedAt,
             u.forum_post_count as postCount,
             ua.config as avatar
      FROM users u
      LEFT JOIN user_avatars ua ON u.id = ua.user_id
      WHERE u.id = ?
    `,
      [userId]
    );
  }

  // Avatar operations
  async getUserAvatar(userId: number): Promise<UserAvatar | null> {
    return await queryOne<UserAvatar>(
      `
      SELECT id, user_id as userId, config, unlocked_items as unlockedItems,
             created_at as createdAt, updated_at as updatedAt
      FROM user_avatars 
      WHERE user_id = ?
    `,
      [userId]
    );
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
  }

  // Search operations
  async searchPosts(
    searchQuery: string,
    limit = 20,
    offset = 0
  ): Promise<any[]> {
    return await query(
      `
      SELECT p.id, p.content, p.created_at as createdAt,
             t.id as threadId, t.title as threadTitle,
             u.username as authorName,
             MATCH(p.content) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance
      FROM forum_posts p
      JOIN forum_threads t ON p.thread_id = t.id
      JOIN users u ON p.author_id = u.id
      WHERE MATCH(p.content) AGAINST(? IN NATURAL LANGUAGE MODE)
      ORDER BY relevance DESC, p.created_at DESC
      LIMIT ? OFFSET ?
    `,
      [searchQuery, searchQuery, limit, offset]
    );
  }

  // Statistics
  async getForumStats(): Promise<any> {
    const stats = await queryOne(`
      SELECT 
        (SELECT COUNT(*) FROM forum_threads) as totalThreads,
        (SELECT COUNT(*) FROM forum_posts) as totalPosts,
        (SELECT COUNT(*) FROM users WHERE forum_role IS NOT NULL) as totalUsers,
        (SELECT COUNT(*) FROM users WHERE forum_role IS NOT NULL AND updated_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)) as activeUsers
    `);

    return stats;
  }
}

// Export singleton instance
export const forumRepository = new ForumRepository();
