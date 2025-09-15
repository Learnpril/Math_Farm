import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ModerationService } from '../moderation-service';
import { ModerationRepository } from '../../database/moderation-repository';
import { ForumRepository } from '../../database/forum-repository';

// Mock the repositories
vi.mock('../../database/moderation-repository');
vi.mock('../../database/forum-repository');

describe('ModerationService', () => {
  let moderationService: ModerationService;
  let mockModerationRepo: any;
  let mockForumRepo: any;

  beforeEach(() => {
    mockModerationRepo = {
      logModerationAction: vi.fn(),
      createReport: vi.fn(),
      findExistingReport: vi.fn(),
      getReportById: vi.fn(),
      updateReportStatus: vi.fn(),
      getReports: vi.fn(),
      getAuditLog: vi.fn(),
      getKeywordFilters: vi.fn(),
      updateKeywordFilters: vi.fn(),
      getReportCountForPost: vi.fn(),
    };

    mockForumRepo = {
      getPostById: vi.fn(),
      getThreadById: vi.fn(),
      deletePost: vi.fn(),
      deleteThread: vi.fn(),
      updatePost: vi.fn(),
      updateThread: vi.fn(),
    };

    // Mock the constructors
    (ModerationRepository as any).mockImplementation(() => mockModerationRepo);
    (ForumRepository as any).mockImplementation(() => mockForumRepo);

    moderationService = new ModerationService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('performAction', () => {
    it('should perform delete action on post', async () => {
      const mockPost = { id: 456, content: 'Test post', authorId: 2 };
      mockForumRepo.getPostById.mockResolvedValue(mockPost);
      mockForumRepo.deletePost.mockResolvedValue({ success: true });
      mockModerationRepo.logModerationAction.mockResolvedValue(123);

      const action = {
        type: 'delete' as const,
        reason: 'Spam content',
        targetId: 456,
        targetType: 'post' as const,
        moderatorId: 1,
      };

      const result = await moderationService.performAction(action);

      expect(mockForumRepo.getPostById).toHaveBeenCalledWith(456);
      expect(mockForumRepo.deletePost).toHaveBeenCalledWith(456);
      expect(mockModerationRepo.logModerationAction).toHaveBeenCalledWith({
        action: 'delete',
        targetType: 'post',
        targetId: 456,
        moderatorId: 1,
        reason: 'Spam content',
        duration: undefined,
        metadata: { success: true },
      });
      expect(result).toEqual({ success: true });
    });

    it('should perform lock action on thread', async () => {
      const mockThread = { id: 789, title: 'Test thread', isLocked: false };
      mockForumRepo.getThreadById.mockResolvedValue(mockThread);
      mockForumRepo.updateThread.mockResolvedValue({ success: true });
      mockModerationRepo.logModerationAction.mockResolvedValue(124);

      const action = {
        type: 'lock' as const,
        reason: 'Off-topic discussion',
        targetId: 789,
        targetType: 'thread' as const,
        moderatorId: 1,
        duration: 24,
      };

      const result = await moderationService.performAction(action);

      expect(mockForumRepo.getThreadById).toHaveBeenCalledWith(789);
      expect(mockForumRepo.updateThread).toHaveBeenCalledWith(789, {
        isLocked: true,
      });
      expect(mockModerationRepo.logModerationAction).toHaveBeenCalledWith({
        action: 'lock',
        targetType: 'thread',
        targetId: 789,
        moderatorId: 1,
        reason: 'Off-topic discussion',
        duration: 24,
        metadata: { success: true },
      });
    });

    it('should throw error for non-existent target', async () => {
      mockForumRepo.getPostById.mockResolvedValue(null);

      const action = {
        type: 'delete' as const,
        reason: 'Test reason',
        targetId: 999,
        targetType: 'post' as const,
        moderatorId: 1,
      };

      await expect(moderationService.performAction(action)).rejects.toThrow(
        'Post not found'
      );
    });

    it('should throw error for unsupported action', async () => {
      const mockPost = { id: 456, content: 'Test post' };
      mockForumRepo.getPostById.mockResolvedValue(mockPost);

      const action = {
        type: 'unsupported' as any,
        reason: 'Test reason',
        targetId: 456,
        targetType: 'post' as const,
        moderatorId: 1,
      };

      await expect(moderationService.performAction(action)).rejects.toThrow(
        'Unsupported moderation action: unsupported'
      );
    });
  });

  describe('submitReport', () => {
    it('should submit report successfully', async () => {
      const mockPost = { id: 456, content: 'Test post', authorId: 2 };
      const mockReport = {
        id: 789,
        postId: 456,
        reporterId: 3,
        reason: 'Inappropriate content',
        category: 'inappropriate_content',
        status: 'pending',
      };

      mockForumRepo.getPostById.mockResolvedValue(mockPost);
      mockModerationRepo.findExistingReport.mockResolvedValue(null);
      mockModerationRepo.createReport.mockResolvedValue(mockReport);
      mockModerationRepo.getReportCountForPost.mockResolvedValue(1);

      const reportData = {
        postId: 456,
        reporterId: 3,
        reason: 'Inappropriate content',
        category: 'inappropriate_content' as const,
        details: 'Contains offensive language',
      };

      const result = await moderationService.submitReport(reportData);

      expect(mockForumRepo.getPostById).toHaveBeenCalledWith(456);
      expect(mockModerationRepo.findExistingReport).toHaveBeenCalledWith(
        456,
        3
      );
      expect(mockModerationRepo.createReport).toHaveBeenCalledWith({
        postId: 456,
        reporterId: 3,
        reason: 'Inappropriate content',
        category: 'inappropriate_content',
        details: 'Contains offensive language',
        status: 'pending',
      });
      expect(result).toEqual(mockReport);
    });

    it('should throw error for non-existent post', async () => {
      mockForumRepo.getPostById.mockResolvedValue(null);

      const reportData = {
        postId: 999,
        reporterId: 3,
        reason: 'Test reason',
        category: 'spam' as const,
      };

      await expect(moderationService.submitReport(reportData)).rejects.toThrow(
        'Post not found'
      );
    });

    it('should throw error for duplicate report', async () => {
      const mockPost = { id: 456, content: 'Test post' };
      const existingReport = { id: 123, postId: 456, reporterId: 3 };

      mockForumRepo.getPostById.mockResolvedValue(mockPost);
      mockModerationRepo.findExistingReport.mockResolvedValue(existingReport);

      const reportData = {
        postId: 456,
        reporterId: 3,
        reason: 'Test reason',
        category: 'spam' as const,
      };

      await expect(moderationService.submitReport(reportData)).rejects.toThrow(
        'You have already reported this post'
      );
    });

    it('should trigger auto-moderation for multiple reports', async () => {
      const mockPost = { id: 456, content: 'Test post' };
      const mockReport = { id: 789, postId: 456, reporterId: 3 };

      mockForumRepo.getPostById.mockResolvedValue(mockPost);
      mockModerationRepo.findExistingReport.mockResolvedValue(null);
      mockModerationRepo.createReport.mockResolvedValue(mockReport);
      mockModerationRepo.getReportCountForPost.mockResolvedValue(3); // 3 reports triggers auto-hide
      mockForumRepo.updatePost.mockResolvedValue({ success: true });
      mockModerationRepo.logModerationAction.mockResolvedValue(125);

      const reportData = {
        postId: 456,
        reporterId: 3,
        reason: 'Spam',
        category: 'spam' as const,
      };

      await moderationService.submitReport(reportData);

      expect(mockForumRepo.updatePost).toHaveBeenCalledWith(456, {
        isHidden: true,
      });
      expect(mockModerationRepo.logModerationAction).toHaveBeenCalledWith({
        action: 'auto_hide',
        targetType: 'post',
        targetId: 456,
        moderatorId: 0,
        reason: 'Auto-hidden due to 3 reports',
        metadata: { reportCount: 3, category: 'spam' },
      });
    });
  });

  describe('resolveReport', () => {
    it('should resolve report successfully', async () => {
      const mockReport = {
        id: 789,
        postId: 456,
        reporterId: 3,
        status: 'pending',
      };

      mockModerationRepo.getReportById.mockResolvedValue(mockReport);
      mockModerationRepo.updateReportStatus.mockResolvedValue(true);
      mockModerationRepo.logModerationAction.mockResolvedValue(126);

      const result = await moderationService.resolveReport(789, 'resolved', 1);

      expect(mockModerationRepo.getReportById).toHaveBeenCalledWith(789);
      expect(mockModerationRepo.updateReportStatus).toHaveBeenCalledWith(789, {
        status: 'resolved',
        moderatorId: 1,
        resolvedAt: expect.any(Date),
      });
      expect(mockModerationRepo.logModerationAction).toHaveBeenCalledWith({
        action: 'report_resolved',
        targetType: 'report',
        targetId: 789,
        moderatorId: 1,
        reason: 'Report resolved',
        metadata: { originalReport: mockReport },
      });
    });

    it('should throw error for non-existent report', async () => {
      mockModerationRepo.getReportById.mockResolvedValue(null);

      await expect(
        moderationService.resolveReport(999, 'resolved', 1)
      ).rejects.toThrow('Report not found');
    });

    it('should throw error for already resolved report', async () => {
      const mockReport = {
        id: 789,
        status: 'resolved',
      };

      mockModerationRepo.getReportById.mockResolvedValue(mockReport);

      await expect(
        moderationService.resolveReport(789, 'resolved', 1)
      ).rejects.toThrow('Report has already been resolved');
    });
  });

  describe('moderateContent', () => {
    it('should detect flagged content', async () => {
      const mockFilters = [
        {
          id: 1,
          keywords: ['spam', 'advertisement'],
          action: 'flag',
          severity: 'medium',
          isActive: true,
        },
        {
          id: 2,
          keywords: ['offensive'],
          action: 'auto_hide',
          severity: 'high',
          isActive: true,
        },
      ];

      mockModerationRepo.getKeywordFilters.mockResolvedValue(mockFilters);

      const result = await moderationService.moderateContent(
        'This is spam content'
      );

      expect(result.flagged).toBe(true);
      expect(result.action).toBe('flag');
      expect(result.matchedFilters).toContain('spam');
      expect(result.severity).toBe('medium');
    });

    it('should return clean result for safe content', async () => {
      const mockFilters = [
        {
          id: 1,
          keywords: ['spam', 'advertisement'],
          action: 'flag',
          severity: 'medium',
          isActive: true,
        },
      ];

      mockModerationRepo.getKeywordFilters.mockResolvedValue(mockFilters);

      const result = await moderationService.moderateContent(
        'This is a normal math question'
      );

      expect(result.flagged).toBe(false);
      expect(result.action).toBe('none');
      expect(result.matchedFilters).toHaveLength(0);
      expect(result.severity).toBe(null);
    });

    it('should handle multiple severity levels correctly', async () => {
      const mockFilters = [
        {
          id: 1,
          keywords: ['mild'],
          action: 'flag',
          severity: 'low',
          isActive: true,
        },
        {
          id: 2,
          keywords: ['severe'],
          action: 'auto_delete',
          severity: 'high',
          isActive: true,
        },
      ];

      mockModerationRepo.getKeywordFilters.mockResolvedValue(mockFilters);

      const result = await moderationService.moderateContent(
        'This has mild and severe content'
      );

      expect(result.flagged).toBe(true);
      expect(result.action).toBe('auto_delete'); // Highest action
      expect(result.severity).toBe('high'); // Highest severity
      expect(result.matchedFilters).toContain('mild');
      expect(result.matchedFilters).toContain('severe');
    });

    it('should handle service errors gracefully', async () => {
      mockModerationRepo.getKeywordFilters.mockRejectedValue(
        new Error('Database error')
      );

      const result = await moderationService.moderateContent('Test content');

      // Should return safe default on error
      expect(result.flagged).toBe(false);
      expect(result.action).toBe('none');
      expect(result.matchedFilters).toHaveLength(0);
      expect(result.severity).toBe(null);
    });
  });

  describe('getReports', () => {
    it('should fetch reports with pagination', async () => {
      const mockReports = {
        reports: [{ id: 1, reason: 'Test' }],
        total: 1,
        page: 1,
        limit: 20,
      };

      mockModerationRepo.getReports.mockResolvedValue(mockReports);

      const result = await moderationService.getReports({
        status: 'pending',
        page: 1,
        limit: 20,
      });

      expect(mockModerationRepo.getReports).toHaveBeenCalledWith({
        status: 'pending',
        page: 1,
        limit: 20,
      });
      expect(result).toEqual(mockReports);
    });
  });

  describe('getAuditLog', () => {
    it('should fetch audit log with filters', async () => {
      const mockAuditLog = {
        actions: [{ id: 1, action: 'delete' }],
        total: 1,
        page: 1,
        limit: 50,
      };

      mockModerationRepo.getAuditLog.mockResolvedValue(mockAuditLog);

      const result = await moderationService.getAuditLog({
        page: 1,
        limit: 50,
        targetType: 'post',
        moderatorId: 1,
      });

      expect(mockModerationRepo.getAuditLog).toHaveBeenCalledWith({
        page: 1,
        limit: 50,
        targetType: 'post',
        moderatorId: 1,
      });
      expect(result).toEqual(mockAuditLog);
    });
  });

  describe('updateKeywordFilters', () => {
    it('should update keyword filters and log action', async () => {
      const mockResult = { id: 123, success: true };
      mockModerationRepo.updateKeywordFilters.mockResolvedValue(mockResult);
      mockModerationRepo.logModerationAction.mockResolvedValue(127);

      const filterData = {
        keywords: ['spam', 'advertisement'],
        action: 'flag' as const,
        severity: 'medium' as const,
        moderatorId: 1,
      };

      const result = await moderationService.updateKeywordFilters(filterData);

      expect(mockModerationRepo.updateKeywordFilters).toHaveBeenCalledWith({
        keywords: ['spam', 'advertisement'],
        action: 'flag',
        severity: 'medium',
        isActive: true,
        createdBy: 1,
      });

      expect(mockModerationRepo.logModerationAction).toHaveBeenCalledWith({
        action: 'update_filters',
        targetType: 'system',
        targetId: 0,
        moderatorId: 1,
        reason: 'Updated keyword filters',
        metadata: { filterUpdate: filterData },
      });

      expect(result).toEqual(mockResult);
    });
  });
});
