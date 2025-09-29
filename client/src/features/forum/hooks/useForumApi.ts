import { useState, useCallback } from 'react';
import { ForumCategory, ForumThread, PostContent } from '../types';

interface CreateThreadRequest {
  title: string;
  categoryId: number;
  content: PostContent;
}

interface CreateThreadResponse {
  id: number;
  title: string;
  categoryId: number;
  authorId: number;
  createdAt: Date;
}

/**
 * Hook for forum API operations
 */
export function useForumApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createThread = useCallback(
    async (request: CreateThreadRequest): Promise<CreateThreadResponse> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/forum/threads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          throw new Error(`Failed to create thread: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create thread';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getCategories = useCallback(async (): Promise<ForumCategory[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/forum/categories');

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch categories';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getThreadsByCategory = useCallback(
    async (categoryId: number): Promise<ForumThread[]> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/forum/categories/${categoryId}/threads`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch threads: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch threads';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Mock categories for now - these would come from the API
  const categories: ForumCategory[] = [
    {
      id: 1,
      name: 'General Math',
      description: 'General mathematical discussions',
      sortOrder: 1,
      threadCount: 0,
      postCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      name: 'Algebra',
      description: 'Algebraic equations and expressions',
      sortOrder: 2,
      threadCount: 0,
      postCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      name: 'Calculus',
      description: 'Derivatives, integrals, and limits',
      sortOrder: 3,
      threadCount: 0,
      postCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 4,
      name: 'Trigonometry',
      description: 'Angles and trigonometric functions',
      sortOrder: 4,
      threadCount: 0,
      postCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 5,
      name: 'Linear Algebra',
      description: 'Vectors, matrices, and transformations',
      sortOrder: 5,
      threadCount: 0,
      postCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 6,
      name: 'Statistics',
      description: 'Data analysis and probability',
      sortOrder: 6,
      threadCount: 0,
      postCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 7,
      name: 'Geometry',
      description: 'Shapes, angles, and spatial relationships',
      sortOrder: 7,
      threadCount: 0,
      postCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 8,
      name: 'Math Tools',
      description: 'Calculator and tool discussions',
      sortOrder: 8,
      threadCount: 0,
      postCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // Generic API call function
  const apiCall = useCallback(
    async (url: string, options: RequestInit = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            ...options.headers,
          },
          ...options,
        });

        if (!response.ok) {
          throw new Error(`API call failed: ${response.statusText}`);
        }

        const data = await response.json();
        return {
          success: true,
          data,
          pagination: response.headers.get('X-Pagination')
            ? JSON.parse(response.headers.get('X-Pagination') || '{}')
            : undefined,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'API call failed';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
          data: null,
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    createThread,
    getCategories,
    getThreadsByCategory,
    categories,
    isLoading,
    error,
    apiCall,
  };
}
