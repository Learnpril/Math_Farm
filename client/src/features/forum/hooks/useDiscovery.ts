import { useState, useCallback } from 'react';
import { useForumApi } from './useForumApi';
import type {
  TrendingTopic,
  PopularDiscussion,
  ActivityFeedItem,
  ForumTag,
  RelatedThread,
  UserFollow,
} from '../../../../shared/forum-types';

export function useDiscovery() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { apiCall } = useForumApi();

  const getTrendingTopics = useCallback(
    async (
      params: {
        timeframe?: 'day' | 'week' | 'month';
        limit?: number;
      } = {}
    ): Promise<TrendingTopic[]> => {
      setIsLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        if (params.timeframe) queryParams.append('timeframe', params.timeframe);
        if (params.limit) queryParams.append('limit', params.limit.toString());

        const response = await apiCall(
          `/api/forum/discovery/trending?${queryParams.toString()}`,
          {
            method: 'GET',
          }
        );

        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.error || 'Failed to get trending topics');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get trending topics';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiCall]
  );

  const getPopularDiscussions = useCallback(
    async (
      params: {
        timeframe?: 'day' | 'week' | 'month';
        limit?: number;
      } = {}
    ): Promise<PopularDiscussion[]> => {
      setIsLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        if (params.timeframe) queryParams.append('timeframe', params.timeframe);
        if (params.limit) queryParams.append('limit', params.limit.toString());

        const response = await apiCall(
          `/api/forum/discovery/popular?${queryParams.toString()}`,
          {
            method: 'GET',
          }
        );

        if (response.success) {
          return response.data;
        } else {
          throw new Error(
            response.error || 'Failed to get popular discussions'
          );
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to get popular discussions';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiCall]
  );

  const getActivityFeed = useCallback(
    async (
      params: {
        page?: number;
        limit?: number;
      } = {}
    ): Promise<{
      items: ActivityFeedItem[];
      total: number;
      hasMore: boolean;
    }> => {
      setIsLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());

        const response = await apiCall(
          `/api/forum/discovery/activity-feed?${queryParams.toString()}`,
          {
            method: 'GET',
          }
        );

        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.error || 'Failed to get activity feed');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get activity feed';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiCall]
  );

  const followUser = useCallback(
    async (userId: number): Promise<UserFollow> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiCall(
          `/api/forum/discovery/follow/${userId}`,
          {
            method: 'POST',
          }
        );

        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.error || 'Failed to follow user');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to follow user';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiCall]
  );

  const unfollowUser = useCallback(
    async (userId: number): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiCall(
          `/api/forum/discovery/follow/${userId}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.success) {
          throw new Error(response.error || 'Failed to unfollow user');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to unfollow user';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiCall]
  );

  const getUserFollowing = useCallback(async (): Promise<
    Array<{
      id: number;
      username: string;
      postCount: number;
      followedAt: string;
    }>
  > => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiCall('/api/forum/discovery/following', {
        method: 'GET',
      });

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to get following list');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to get following list';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [apiCall]);

  const getRelatedThreads = useCallback(
    async (threadId: number, limit = 5): Promise<RelatedThread[]> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiCall(
          `/api/forum/discovery/related/${threadId}?limit=${limit}`,
          {
            method: 'GET',
          }
        );

        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.error || 'Failed to get related threads');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get related threads';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiCall]
  );

  const getTags = useCallback(
    async (
      params: {
        popular?: boolean;
        limit?: number;
      } = {}
    ): Promise<ForumTag[]> => {
      setIsLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        if (params.popular !== undefined)
          queryParams.append('popular', params.popular.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());

        const response = await apiCall(
          `/api/forum/discovery/tags?${queryParams.toString()}`,
          {
            method: 'GET',
          }
        );

        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.error || 'Failed to get tags');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get tags';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiCall]
  );

  const getThreadsByTag = useCallback(
    async (
      tag: string,
      params: {
        page?: number;
        limit?: number;
      } = {}
    ): Promise<{
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
    }> => {
      setIsLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());

        const response = await apiCall(
          `/api/forum/discovery/tags/${encodeURIComponent(tag)}/threads?${queryParams.toString()}`,
          {
            method: 'GET',
          }
        );

        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.error || 'Failed to get threads by tag');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get threads by tag';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiCall]
  );

  return {
    isLoading,
    error,
    getTrendingTopics,
    getPopularDiscussions,
    getActivityFeed,
    followUser,
    unfollowUser,
    getUserFollowing,
    getRelatedThreads,
    getTags,
    getThreadsByTag,
  };
}
