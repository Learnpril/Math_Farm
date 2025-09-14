import { useState, useCallback } from 'react';
import {
  ModerationAction,
  ReportSubmission,
} from '../components/ModerationTools';
import { PostEditHistory } from '../components/PostEditor';
import { ForumReport } from '../types';

export interface ModerationApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface UseModerationOptions {
  apiBaseUrl?: string;
}

export interface UseModerationReturn {
  isLoading: boolean;
  error: string | null;
  performModerationAction: (action: ModerationAction) => Promise<void>;
  submitReport: (report: ReportSubmission) => Promise<void>;
  resolveReport: (
    reportId: number,
    action: 'resolved' | 'dismissed'
  ) => Promise<void>;
  getEditHistory: (postId: number) => Promise<PostEditHistory[]>;
  clearError: () => void;
}

/**
 * Hook for managing moderation actions and reports
 * Handles API calls for moderation features with proper error handling
 */
export function useModeration({
  apiBaseUrl = '/api/forum',
}: UseModerationOptions = {}): UseModerationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Perform moderation action
  const performModerationAction = useCallback(
    async (action: ModerationAction) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiBaseUrl}/moderation/actions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify(action),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `HTTP ${response.status}: ${response.statusText}`
          );
        }

        const result: ModerationApiResponse = await response.json();

        if (!result.success) {
          throw new Error(result.message || 'Moderation action failed');
        }

        // Log successful action for audit trail
        console.info('Moderation action completed:', {
          type: action.type,
          targetType: action.targetType,
          targetId: action.targetId,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Moderation action failed:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiBaseUrl]
  );

  // Submit report
  const submitReport = useCallback(
    async (report: ReportSubmission) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiBaseUrl}/reports`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify(report),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `HTTP ${response.status}: ${response.statusText}`
          );
        }

        const result: ModerationApiResponse = await response.json();

        if (!result.success) {
          throw new Error(result.message || 'Report submission failed');
        }

        // Log successful report submission
        console.info('Report submitted:', {
          postId: report.postId,
          category: report.category,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Report submission failed:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiBaseUrl]
  );

  // Resolve report
  const resolveReport = useCallback(
    async (reportId: number, action: 'resolved' | 'dismissed') => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${apiBaseUrl}/reports/${reportId}/resolve`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
            },
            body: JSON.stringify({ action }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `HTTP ${response.status}: ${response.statusText}`
          );
        }

        const result: ModerationApiResponse = await response.json();

        if (!result.success) {
          throw new Error(result.message || 'Report resolution failed');
        }

        // Log successful report resolution
        console.info('Report resolved:', {
          reportId,
          action,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Report resolution failed:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiBaseUrl]
  );

  // Get edit history for a post
  const getEditHistory = useCallback(
    async (postId: number): Promise<PostEditHistory[]> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiBaseUrl}/posts/${postId}/history`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `HTTP ${response.status}: ${response.statusText}`
          );
        }

        const result: ModerationApiResponse = await response.json();

        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch edit history');
        }

        return result.data || [];
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Failed to fetch edit history:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiBaseUrl]
  );

  return {
    isLoading,
    error,
    performModerationAction,
    submitReport,
    resolveReport,
    getEditHistory,
    clearError,
  };
}
