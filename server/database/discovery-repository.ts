import { db } from './connection.js';

interface TrendingTopicsParams {
  timeframe: 'day' | 'week' | 'month';
  limit: number;
}

interface PopularDiscussionsParams {
  timeframe: 'day' | 'week' | 'month';
  limit: number;
}

interface ActivityFeedParams {
  userId: number;
  page: number;
  limit: number;
}

interface RelatedThreadsParams {
  threadId: number;
  limit: number;
}

interface TagsParams {
  popular: boolean;
  limit: number;
}

interface ThreadsByTagParams {
  tag: string;
  page: number;
  limit: number;
}

class DiscoveryRepository {
  async getTrendingTopics(params: TrendingTopicsParams): Promise<any[]> {
    const timeframeDays = this.getTimeframeDays(params.timeframe);

    const query = `
      SELECT 
        t.id,
        t.title,
        t.category_id,
        c.name as category_name,
        t.author_id,
        u.username as author_username,
        t.post_count,
        COUNT(p.id) as recent_activity,
        (COUNT(p.id) * 1.0 / GREATEST(1, DATEDIFF(NOW(), t.created_at))) as trend_score,
        GROUP_CONCAT(DISTINCT tag.name) as tags,
        t.created_at,
        t.last_post_at
      FROM forum_threads t
      JOIN forum_categories c ON t.category_id = c.id
      JOIN users u ON t.author_id = u.id
      LEFT JOIN forum_posts p ON t.id = p.thread_id 
        AND p.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      LEFT JOIN forum_thread_tags tt ON t.id = tt.thread_id
      LEFT JOIN forum_tags tag ON tt.tag_id = tag.id
      WHERE t.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY t.id, t.title, t.category_id, c.name, t.author_id, u.username, 
               t.post_count, t.created_at, t.last_post_at
      ORDER BY trend_score DESC, recent_activity DESC
      LIMIT ?
    `;

    return await db.all(query, [timeframeDays, timeframeDays, params.limit]);
  }

  async getPopularDiscussions(
    params: PopularDiscussionsParams
  ): Promise<any[]> {
    const timeframeDays = this.getTimeframeDays(params.timeframe);

    const query = `
      SELECT 
        t.id,
        t.title,
        t.category_id,
        c.name as category_name,
        t.author_id,
        u.username as author_username,
        t.post_count,
        COALESCE(tv.view_count, 0) as view_count,
        COALESCE(tl.like_count, 0) as like_count,
        (t.post_count * 2 + COALESCE(tv.view_count, 0) * 0.1 + COALESCE(tl.like_count, 0) * 5) as popularity_score,
        GROUP_CONCAT(DISTINCT tag.name) as tags,
        t.created_at,
        t.last_post_at
      FROM forum_threads t
      JOIN forum_categories c ON t.category_id = c.id
      JOIN users u ON t.author_id = u.id
      LEFT JOIN (
        SELECT thread_id, COUNT(*) as view_count
        FROM forum_thread_views
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY thread_id
      ) tv ON t.id = tv.thread_id
      LEFT JOIN (
        SELECT thread_id, COUNT(*) as like_count
        FROM forum_post_likes pl
        JOIN forum_posts p ON pl.post_id = p.id
        WHERE pl.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY p.thread_id
      ) tl ON t.id = tl.thread_id
      LEFT JOIN forum_thread_tags tt ON t.id = tt.thread_id
      LEFT JOIN forum_tags tag ON tt.tag_id = tag.id
      WHERE t.last_post_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY t.id, t.title, t.category_id, c.name, t.author_id, u.username,
               t.post_count, tv.view_count, tl.like_count, t.created_at, t.last_post_at
      ORDER BY popularity_score DESC
      LIMIT ?
    `;

    return await db.all(query, [
      timeframeDays,
      timeframeDays,
      timeframeDays,
      params.limit,
    ]);
  }

  async getUserActivityFeed(params: ActivityFeedParams): Promise<{
    items: any[];
    total: number;
  }> {
    const offset = (params.page - 1) * params.limit;

    // Get activity from followed users
    const query = `
      SELECT 
        'post' as type,
        p.id,
        p.content as title,
        LEFT(p.content, 200) as content,
        p.author_id,
        u.username as author_username,
        p.thread_id,
        t.title as thread_title,
        t.category_id,
        c.name as category_name,
        p.created_at,
        1 as is_following
      FROM forum_posts p
      JOIN users u ON p.author_id = u.id
      JOIN forum_threads t ON p.thread_id = t.id
      JOIN forum_categories c ON t.category_id = c.id
      JOIN forum_user_follows f ON p.author_id = f.following_id
      WHERE f.follower_id = ?
        AND p.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      
      UNION ALL
      
      SELECT 
        'thread' as type,
        t.id,
        t.title,
        t.title as content,
        t.author_id,
        u.username as author_username,
        t.id as thread_id,
        t.title as thread_title,
        t.category_id,
        c.name as category_name,
        t.created_at,
        1 as is_following
      FROM forum_threads t
      JOIN users u ON t.author_id = u.id
      JOIN forum_categories c ON t.category_id = c.id
      JOIN forum_user_follows f ON t.author_id = f.following_id
      WHERE f.follower_id = ?
        AND t.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const items = await db.all(query, [
      params.userId,
      params.userId,
      params.limit,
      offset,
    ]);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total FROM (
        SELECT p.id
        FROM forum_posts p
        JOIN forum_user_follows f ON p.author_id = f.following_id
        WHERE f.follower_id = ?
          AND p.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        
        UNION ALL
        
        SELECT t.id
        FROM forum_threads t
        JOIN forum_user_follows f ON t.author_id = f.following_id
        WHERE f.follower_id = ?
          AND t.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ) combined
    `;

    const totalResult = (await db.get(countQuery, [
      params.userId,
      params.userId,
    ])) as { total: number };

    return {
      items,
      total: totalResult.total,
    };
  }

  async followUser(followerId: number, followingId: number): Promise<any> {
    // Check if already following
    const existing = await db.get(
      'SELECT id FROM forum_user_follows WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId]
    );

    if (existing) {
      return existing;
    }

    const result = await db.run(
      'INSERT INTO forum_user_follows (follower_id, following_id) VALUES (?, ?)',
      [followerId, followingId]
    );

    return {
      id: result.lastID,
      follower_id: followerId,
      following_id: followingId,
      created_at: new Date().toISOString(),
    };
  }

  async unfollowUser(followerId: number, followingId: number): Promise<void> {
    await db.run(
      'DELETE FROM forum_user_follows WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId]
    );
  }

  async getUserFollowing(userId: number): Promise<any[]> {
    const query = `
      SELECT 
        u.id,
        u.username,
        u.forum_post_count as post_count,
        f.created_at as followed_at
      FROM forum_user_follows f
      JOIN users u ON f.following_id = u.id
      WHERE f.follower_id = ?
      ORDER BY f.created_at DESC
    `;

    return await db.all(query, [userId]);
  }

  async getRelatedThreads(params: RelatedThreadsParams): Promise<any[]> {
    // Get the original thread's category and tags
    const originalThread = await db.get(
      `
      SELECT t.category_id, GROUP_CONCAT(tag.name) as tags
      FROM forum_threads t
      LEFT JOIN forum_thread_tags tt ON t.id = tt.thread_id
      LEFT JOIN forum_tags tag ON tt.tag_id = tag.id
      WHERE t.id = ?
      GROUP BY t.id, t.category_id
    `,
      [params.threadId]
    );

    if (!originalThread) {
      return [];
    }

    // Find related threads based on category and tags
    const query = `
      SELECT 
        t.id,
        t.title,
        t.category_id,
        c.name as category_name,
        t.author_id,
        u.username as author_username,
        t.post_count,
        (
          CASE WHEN t.category_id = ? THEN 0.5 ELSE 0 END +
          CASE WHEN GROUP_CONCAT(tag.name) IS NOT NULL THEN 0.3 ELSE 0 END
        ) as similarity_score,
        GROUP_CONCAT(DISTINCT tag.name) as tags,
        t.created_at,
        t.last_post_at
      FROM forum_threads t
      JOIN forum_categories c ON t.category_id = c.id
      JOIN users u ON t.author_id = u.id
      LEFT JOIN forum_thread_tags tt ON t.id = tt.thread_id
      LEFT JOIN forum_tags tag ON tt.tag_id = tag.id
      WHERE t.id != ?
        AND (
          t.category_id = ? 
          OR EXISTS (
            SELECT 1 FROM forum_thread_tags tt2
            JOIN forum_tags tag2 ON tt2.tag_id = tag2.id
            WHERE tt2.thread_id = t.id
              AND tag2.name IN (${
                originalThread.tags
                  ? originalThread.tags
                      .split(',')
                      .map(() => '?')
                      .join(',')
                  : 'NULL'
              })
          )
        )
      GROUP BY t.id, t.title, t.category_id, c.name, t.author_id, u.username,
               t.post_count, t.created_at, t.last_post_at
      HAVING similarity_score > 0
      ORDER BY similarity_score DESC, t.last_post_at DESC
      LIMIT ?
    `;

    const queryParams = [
      originalThread.category_id,
      params.threadId,
      originalThread.category_id,
      ...(originalThread.tags ? originalThread.tags.split(',') : []),
      params.limit,
    ];

    return await db.all(query, queryParams);
  }

  async getTags(params: TagsParams): Promise<any[]> {
    let query = `
      SELECT 
        t.id,
        t.name,
        t.description,
        t.color,
        COUNT(DISTINCT tt.thread_id) as thread_count,
        COUNT(DISTINCT p.id) as post_count,
        t.created_at
      FROM forum_tags t
      LEFT JOIN forum_thread_tags tt ON t.id = tt.tag_id
      LEFT JOIN forum_threads th ON tt.thread_id = th.id
      LEFT JOIN forum_posts p ON th.id = p.thread_id
      GROUP BY t.id, t.name, t.description, t.color, t.created_at
    `;

    if (params.popular) {
      query +=
        ' HAVING thread_count > 0 ORDER BY thread_count DESC, post_count DESC';
    } else {
      query += ' ORDER BY t.name ASC';
    }

    query += ' LIMIT ?';

    return await db.all(query, [params.limit]);
  }

  async getThreadsByTag(params: ThreadsByTagParams): Promise<{
    threads: any[];
    total: number;
  }> {
    const offset = (params.page - 1) * params.limit;

    const query = `
      SELECT 
        t.id,
        t.title,
        t.category_id,
        c.name as category_name,
        t.author_id,
        u.username as author_username,
        t.post_count,
        t.created_at,
        t.last_post_at
      FROM forum_threads t
      JOIN forum_categories c ON t.category_id = c.id
      JOIN users u ON t.author_id = u.id
      JOIN forum_thread_tags tt ON t.id = tt.thread_id
      JOIN forum_tags tag ON tt.tag_id = tag.id
      WHERE tag.name = ?
      ORDER BY t.last_post_at DESC
      LIMIT ? OFFSET ?
    `;

    const threads = await db.all(query, [params.tag, params.limit, offset]);

    const countQuery = `
      SELECT COUNT(*) as total
      FROM forum_threads t
      JOIN forum_thread_tags tt ON t.id = tt.thread_id
      JOIN forum_tags tag ON tt.tag_id = tag.id
      WHERE tag.name = ?
    `;

    const totalResult = (await db.get(countQuery, [params.tag])) as {
      total: number;
    };

    return {
      threads,
      total: totalResult.total,
    };
  }

  private getTimeframeDays(timeframe: 'day' | 'week' | 'month'): number {
    switch (timeframe) {
      case 'day':
        return 1;
      case 'week':
        return 7;
      case 'month':
        return 30;
      default:
        return 7;
    }
  }
}

export const discoveryRepository = new DiscoveryRepository();
