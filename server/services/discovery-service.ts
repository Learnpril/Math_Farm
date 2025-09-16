import { discoveryRepository } from '../database/discovery-repository.js';
import type {
  TrendingTopic,
  PopularDiscussion,
  ActivityFeedItem,
  RelatedThread,
  ForumTag,
  UserFollow,
} from '../../shared/forum-types.js';

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

class DiscoveryService {
  async getTrendingTopics(
    params: TrendingTopicsParams
  ): Promise<TrendingTopic[]> {
    try {
      const topics = await discoveryRepository.getTrendingTopics(params);

      return topics.map(topic => ({
        id: topic.id,
        title: topic.title,
        category: {
          id: topic.category_id,
          name: topic.category_name,
        },
        author: {
          id: topic.author_id,
          username: topic.author_username,
        },
        postCount: topic.post_count,
        recentActivity: topic.recent_activity,
        trendScore: topic.trend_score,
        tags: topic.tags ? JSON.parse(topic.tags) : [],
        createdAt: topic.created_at,
        lastPostAt: topic.last_post_at,
      }));
    } catch (error) {
      console.error('Get trending topics error:', error);
      throw new Error('Failed to get trending topics');
    }
  }

  async getPopularDiscussions(
    params: PopularDiscussionsParams
  ): Promise<PopularDiscussion[]> {
    try {
      const discussions =
        await discoveryRepository.getPopularDiscussions(params);

      return discussions.map(discussion => ({
        id: discussion.id,
        title: discussion.title,
        category: {
          id: discussion.category_id,
          name: discussion.category_name,
        },
        author: {
          id: discussion.author_id,
          username: discussion.author_username,
        },
        postCount: discussion.post_count,
        viewCount: discussion.view_count,
        likeCount: discussion.like_count,
        popularityScore: discussion.popularity_score,
        tags: discussion.tags ? JSON.parse(discussion.tags) : [],
        createdAt: discussion.created_at,
        lastPostAt: discussion.last_post_at,
      }));
    } catch (error) {
      console.error('Get popular discussions error:', error);
      throw new Error('Failed to get popular discussions');
    }
  }

  async getUserActivityFeed(params: ActivityFeedParams): Promise<{
    items: ActivityFeedItem[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const result = await discoveryRepository.getUserActivityFeed(params);

      const items = result.items.map(item => ({
        id: item.id,
        type: item.type,
        title: item.title,
        content: item.content,
        author: {
          id: item.author_id,
          username: item.author_username,
        },
        thread: item.thread_id
          ? {
              id: item.thread_id,
              title: item.thread_title,
              category: {
                id: item.category_id,
                name: item.category_name,
              },
            }
          : undefined,
        createdAt: item.created_at,
        isFollowing: item.is_following || false,
      }));

      return {
        items,
        total: result.total,
        hasMore: params.page * params.limit < result.total,
      };
    } catch (error) {
      console.error('Get user activity feed error:', error);
      throw new Error('Failed to get activity feed');
    }
  }

  async followUser(
    followerId: number,
    followingId: number
  ): Promise<UserFollow> {
    try {
      const follow = await discoveryRepository.followUser(
        followerId,
        followingId
      );

      return {
        id: follow.id,
        followerId: follow.follower_id,
        followingId: follow.following_id,
        createdAt: follow.created_at,
      };
    } catch (error) {
      console.error('Follow user error:', error);
      throw new Error('Failed to follow user');
    }
  }

  async unfollowUser(followerId: number, followingId: number): Promise<void> {
    try {
      await discoveryRepository.unfollowUser(followerId, followingId);
    } catch (error) {
      console.error('Unfollow user error:', error);
      throw new Error('Failed to unfollow user');
    }
  }

  async getUserFollowing(userId: number): Promise<
    Array<{
      id: number;
      username: string;
      postCount: number;
      followedAt: string;
    }>
  > {
    try {
      const following = await discoveryRepository.getUserFollowing(userId);

      return following.map(user => ({
        id: user.id,
        username: user.username,
        postCount: user.post_count,
        followedAt: user.followed_at,
      }));
    } catch (error) {
      console.error('Get user following error:', error);
      throw new Error('Failed to get following list');
    }
  }

  async getRelatedThreads(
    params: RelatedThreadsParams
  ): Promise<RelatedThread[]> {
    try {
      const threads = await discoveryRepository.getRelatedThreads(params);

      return threads.map(thread => ({
        id: thread.id,
        title: thread.title,
        category: {
          id: thread.category_id,
          name: thread.category_name,
        },
        author: {
          id: thread.author_id,
          username: thread.author_username,
        },
        postCount: thread.post_count,
        similarityScore: thread.similarity_score,
        tags: thread.tags ? JSON.parse(thread.tags) : [],
        createdAt: thread.created_at,
        lastPostAt: thread.last_post_at,
      }));
    } catch (error) {
      console.error('Get related threads error:', error);
      throw new Error('Failed to get related threads');
    }
  }

  async getTags(params: TagsParams): Promise<ForumTag[]> {
    try {
      const tags = await discoveryRepository.getTags(params);

      return tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        description: tag.description,
        color: tag.color,
        threadCount: tag.thread_count,
        postCount: tag.post_count,
        createdAt: tag.created_at,
      }));
    } catch (error) {
      console.error('Get tags error:', error);
      throw new Error('Failed to get tags');
    }
  }

  async getThreadsByTag(params: ThreadsByTagParams): Promise<{
    threads: Array<{
      id: number;
      title: string;
      category: { id: number; name: string };
      author: { id: number; username: string };
      postCount: number;
      createdAt: string;
      lastPostAt: string;
    }>;
    total: number;
    hasMore: boolean;
  }> {
    try {
      const result = await discoveryRepository.getThreadsByTag(params);

      const threads = result.threads.map(thread => ({
        id: thread.id,
        title: thread.title,
        category: {
          id: thread.category_id,
          name: thread.category_name,
        },
        author: {
          id: thread.author_id,
          username: thread.author_username,
        },
        postCount: thread.post_count,
        createdAt: thread.created_at,
        lastPostAt: thread.last_post_at,
      }));

      return {
        threads,
        total: result.total,
        hasMore: params.page * params.limit < result.total,
      };
    } catch (error) {
      console.error('Get threads by tag error:', error);
      throw new Error('Failed to get threads by tag');
    }
  }
}

export const discoveryService = new DiscoveryService();
