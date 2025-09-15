import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ModerationDashboard } from '../ModerationDashboard';
import { useModeration } from '../../hooks/useModeration';

// Mock the useModeration hook
vi.mock('../../hooks/useModeration');

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(() => 'mock-token'),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('ModerationDashboard', () => {
  const mockUseModeration = {
    resolveReport: vi.fn(),
    clearError: vi.fn(),
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    (useModeration as any).mockReturnValue(mockUseModeration);
    mockFetch.mockClear();
    mockLocalStorage.getItem.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Access Control', () => {
    it('should deny access to non-moderators', () => {
      render(<ModerationDashboard userRole='member' />);

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(
        screen.getByText(
          "You don't have permission to access moderation tools."
        )
      ).toBeInTheDocument();
    });

    it('should allow access to moderators', () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { reports: [] } }),
      });

      render(<ModerationDashboard userRole='moderator' />);

      expect(screen.getByText('Moderation Dashboard')).toBeInTheDocument();
      expect(
        screen.getByRole('badge', { name: /moderator/i })
      ).toBeInTheDocument();
    });

    it('should allow access to admins', () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { reports: [] } }),
      });

      render(<ModerationDashboard userRole='admin' />);

      expect(screen.getByText('Moderation Dashboard')).toBeInTheDocument();
      expect(screen.getByRole('badge', { name: /admin/i })).toBeInTheDocument();
    });
  });

  describe('Reports Tab', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              reports: [
                {
                  id: 1,
                  postId: 456,
                  reporterId: 2,
                  reason: 'Inappropriate content',
                  category: 'inappropriate_content',
                  status: 'pending',
                  createdAt: '2024-01-01T10:00:00Z',
                },
                {
                  id: 2,
                  postId: 789,
                  reporterId: 3,
                  reason: 'Spam posting',
                  category: 'spam',
                  status: 'pending',
                  createdAt: '2024-01-01T11:00:00Z',
                },
              ],
            },
          }),
      });
    });

    it('should display pending reports', async () => {
      render(<ModerationDashboard userRole='moderator' />);

      await waitFor(() => {
        expect(screen.getByText('Report #1')).toBeInTheDocument();
        expect(screen.getByText('Report #2')).toBeInTheDocument();
        expect(screen.getByText('Inappropriate content')).toBeInTheDocument();
        expect(screen.getByText('Spam posting')).toBeInTheDocument();
      });
    });

    it('should show report count badge', async () => {
      render(<ModerationDashboard userRole='moderator' />);

      await waitFor(() => {
        const reportsBadge = screen.getByText('2');
        expect(reportsBadge).toBeInTheDocument();
      });
    });

    it('should allow resolving reports', async () => {
      mockUseModeration.resolveReport.mockResolvedValueOnce(undefined);

      // Mock the refresh call after resolving
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { reports: [] } }),
      });

      render(<ModerationDashboard userRole='moderator' />);

      await waitFor(() => {
        expect(screen.getByText('Report #1')).toBeInTheDocument();
      });

      const resolveButton = screen.getAllByText('Resolve')[0];
      fireEvent.click(resolveButton);

      await waitFor(() => {
        expect(mockUseModeration.resolveReport).toHaveBeenCalledWith(
          1,
          'resolved'
        );
      });
    });

    it('should allow dismissing reports', async () => {
      mockUseModeration.resolveReport.mockResolvedValueOnce(undefined);

      // Mock the refresh call after dismissing
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { reports: [] } }),
      });

      render(<ModerationDashboard userRole='moderator' />);

      await waitFor(() => {
        expect(screen.getByText('Report #1')).toBeInTheDocument();
      });

      const dismissButton = screen.getAllByText('Dismiss')[0];
      fireEvent.click(dismissButton);

      await waitFor(() => {
        expect(mockUseModeration.resolveReport).toHaveBeenCalledWith(
          1,
          'dismissed'
        );
      });
    });

    it('should filter reports by search term', async () => {
      render(<ModerationDashboard userRole='moderator' />);

      await waitFor(() => {
        expect(screen.getByText('Report #1')).toBeInTheDocument();
        expect(screen.getByText('Report #2')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'spam' } });

      await waitFor(() => {
        expect(screen.queryByText('Report #1')).not.toBeInTheDocument();
        expect(screen.getByText('Report #2')).toBeInTheDocument();
      });
    });

    it('should filter reports by status', async () => {
      render(<ModerationDashboard userRole='moderator' />);

      // Change status filter to resolved
      const statusSelect = screen.getByRole('combobox');
      fireEvent.click(statusSelect);

      const resolvedOption = screen.getByText('Resolved');
      fireEvent.click(resolvedOption);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/forum/moderation/reports?status=resolved&limit=50',
          expect.objectContaining({
            headers: {
              Authorization: 'Bearer mock-token',
            },
          })
        );
      });
    });
  });

  describe('Audit Log Tab', () => {
    beforeEach(() => {
      // Mock initial reports call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { reports: [] } }),
      });
    });

    it('should switch to audit log tab', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              actions: [
                {
                  id: 1,
                  action: 'delete',
                  targetType: 'post',
                  targetId: 456,
                  moderatorId: 1,
                  moderatorUsername: 'admin',
                  reason: 'Spam content',
                  createdAt: '2024-01-01T10:00:00Z',
                },
              ],
            },
          }),
      });

      render(<ModerationDashboard userRole='moderator' />);

      const auditTab = screen.getByText('Audit Log');
      fireEvent.click(auditTab);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/forum/moderation/audit-log?limit=100',
          expect.objectContaining({
            headers: {
              Authorization: 'Bearer mock-token',
            },
          })
        );
      });

      await waitFor(() => {
        expect(screen.getByText('delete')).toBeInTheDocument();
        expect(screen.getByText('post #456')).toBeInTheDocument();
        expect(screen.getByText('Spam content')).toBeInTheDocument();
        expect(screen.getByText('By: admin')).toBeInTheDocument();
      });
    });
  });

  describe('Keyword Filters Tab', () => {
    beforeEach(() => {
      // Mock initial reports call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { reports: [] } }),
      });
    });

    it('should switch to keyword filters tab', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [
              {
                id: 1,
                keywords: ['spam', 'advertisement'],
                action: 'flag',
                severity: 'medium',
                isActive: true,
                createdAt: '2024-01-01T10:00:00Z',
              },
            ],
          }),
      });

      render(<ModerationDashboard userRole='moderator' />);

      const filtersTab = screen.getByText('Keyword Filters');
      fireEvent.click(filtersTab);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/forum/moderation/keyword-filters',
          expect.objectContaining({
            headers: {
              Authorization: 'Bearer mock-token',
            },
          })
        );
      });

      await waitFor(() => {
        expect(screen.getByText('spam')).toBeInTheDocument();
        expect(screen.getByText('advertisement')).toBeInTheDocument();
        expect(screen.getByText('medium')).toBeInTheDocument();
        expect(screen.getByText('flag')).toBeInTheDocument();
      });
    });

    it('should show add filter dialog', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      });

      render(<ModerationDashboard userRole='moderator' />);

      const filtersTab = screen.getByText('Keyword Filters');
      fireEvent.click(filtersTab);

      await waitFor(() => {
        const addButton = screen.getByText('Add Filter');
        expect(addButton).toBeInTheDocument();
      });

      const addButton = screen.getByText('Add Filter');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Add Keyword Filter')).toBeInTheDocument();
        expect(
          screen.getByLabelText('Keywords (comma-separated)')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading spinner when fetching data', async () => {
      // Mock a delayed response
      mockFetch.mockImplementationOnce(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve({ data: { reports: [] } }),
                }),
              100
            )
          )
      );

      render(<ModerationDashboard userRole='moderator' />);

      expect(screen.getByText('Loading reports...')).toBeInTheDocument();
      expect(screen.getByRole('img', { hidden: true })).toHaveClass(
        'animate-spin'
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<ModerationDashboard userRole='moderator' />);

      // Should not crash and should show empty state
      await waitFor(() => {
        expect(
          screen.getByText('No pending reports found')
        ).toBeInTheDocument();
      });
    });

    it('should handle non-ok responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      render(<ModerationDashboard userRole='moderator' />);

      await waitFor(() => {
        expect(
          screen.getByText('No pending reports found')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('should refresh data when refresh button is clicked', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { reports: [] } }),
      });

      render(<ModerationDashboard userRole='moderator' />);

      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2); // Initial load + refresh
      });
    });
  });

  describe('Authentication', () => {
    it('should include auth token in API requests', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { reports: [] } }),
      });

      render(<ModerationDashboard userRole='moderator' />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/forum/moderation/reports?status=pending&limit=50',
          expect.objectContaining({
            headers: {
              Authorization: 'Bearer mock-token',
            },
          })
        );
      });
    });
  });
});
