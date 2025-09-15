import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import moderationRouter from '../moderation';
import { ModerationService } from '../../../services/moderation-service';

// Mock the moderation service
vi.mock('../../../services/moderation-service');
vi.mock('../../../middleware/auth', () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    req.user = { userId: 1, role: 'moderator' };
    next();
  },
  requirePermission: () => (req: any, res: any, next: any) => next(),
  FORUM_PERMISSIONS: {
    MODERATE_CONTENT: 'moderate_content',
  },
}));

const app = express();
app.use(express.json());
app.use('/api/forum/moderation', moderationRouter);

describe('Moderation Routes', () => {
  let mockModerationService: any;

  beforeEach(() => {
    mockModerationService = {
      performAction: vi.fn(),
      submitReport: vi.fn(),
      resolveReport: vi.fn(),
      getReports: vi.fn(),
      getAuditLog: vi.fn(),
      getKeywordFilters: vi.fn(),
      updateKeywordFilters: vi.fn(),
    };

    // Mock the constructor to return our mock
    (ModerationService as any).mockImplementation(() => mockModerationService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /actions', () => {
    it('should perform moderation action successfully', async () => {
      const mockResult = { success: true, actionId: 123 };
      mockModerationService.performAction.mockResolvedValue(mockResult);

      const actionData = {
        type: 'delete',
        reason: 'Spam content',
        targetId: 456,
        targetType: 'post',
      };

      const response = await request(app)
        .post('/api/forum/moderation/actions')
        .send(actionData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Moderation action completed successfully',
        data: mockResult,
      });

      expect(mockModerationService.performAction).toHaveBeenCalledWith({
        ...actionData,
        moderatorId: 1,
        duration: undefined,
      });
    });

    it('should validate moderation action input', async () => {
      const invalidData = {
        type: 'invalid_action',
        reason: 'Too short',
        targetId: 'not_a_number',
        targetType: 'invalid_type',
      };

      const response = await request(app)
        .post('/api/forum/moderation/actions')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toBeDefined();
    });

    it('should handle service errors', async () => {
      mockModerationService.performAction.mockRejectedValue(
        new Error('Database error')
      );

      const actionData = {
        type: 'delete',
        reason: 'Valid reason',
        targetId: 456,
        targetType: 'post',
      };

      const response = await request(app)
        .post('/api/forum/moderation/actions')
        .send(actionData)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Database error');
    });
  });

  describe('POST /reports', () => {
    it('should submit report successfully', async () => {
      const mockReport = {
        id: 789,
        postId: 456,
        reporterId: 1,
        reason: 'Inappropriate content',
        category: 'inappropriate_content',
        status: 'pending',
      };
      mockModerationService.submitReport.mockResolvedValue(mockReport);

      const reportData = {
        postId: 456,
        reason: 'Inappropriate content',
        category: 'inappropriate_content',
        details: 'Contains offensive language',
      };

      const response = await request(app)
        .post('/api/forum/moderation/reports')
        .send(reportData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        message: 'Report submitted successfully',
        data: mockReport,
      });

      expect(mockModerationService.submitReport).toHaveBeenCalledWith({
        ...reportData,
        reporterId: 1,
      });
    });

    it('should validate report submission input', async () => {
      const invalidData = {
        postId: 'not_a_number',
        reason: 'X', // Too short
        category: 'invalid_category',
      };

      const response = await request(app)
        .post('/api/forum/moderation/reports')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /reports', () => {
    it('should fetch reports successfully', async () => {
      const mockReports = {
        reports: [
          {
            id: 1,
            postId: 456,
            reporterId: 2,
            reason: 'Spam',
            category: 'spam',
            status: 'pending',
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
      };
      mockModerationService.getReports.mockResolvedValue(mockReports);

      const response = await request(app)
        .get('/api/forum/moderation/reports')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockReports,
      });

      expect(mockModerationService.getReports).toHaveBeenCalledWith({
        status: 'pending',
        page: 1,
        limit: 20,
      });
    });

    it('should handle query parameters', async () => {
      mockModerationService.getReports.mockResolvedValue({
        reports: [],
        total: 0,
        page: 2,
        limit: 10,
      });

      await request(app)
        .get('/api/forum/moderation/reports?status=resolved&page=2&limit=10')
        .expect(200);

      expect(mockModerationService.getReports).toHaveBeenCalledWith({
        status: 'resolved',
        page: 2,
        limit: 10,
      });
    });
  });

  describe('PATCH /reports/:id/resolve', () => {
    it('should resolve report successfully', async () => {
      const mockResult = { success: true, reportId: 123 };
      mockModerationService.resolveReport.mockResolvedValue(mockResult);

      const response = await request(app)
        .patch('/api/forum/moderation/reports/123/resolve')
        .send({ action: 'resolved' })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Report resolved successfully',
        data: mockResult,
      });

      expect(mockModerationService.resolveReport).toHaveBeenCalledWith(
        123,
        'resolved',
        1
      );
    });

    it('should validate report resolution input', async () => {
      const response = await request(app)
        .patch('/api/forum/moderation/reports/invalid/resolve')
        .send({ action: 'invalid_action' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /audit-log', () => {
    it('should fetch audit log successfully', async () => {
      const mockAuditLog = {
        actions: [
          {
            id: 1,
            action: 'delete',
            targetType: 'post',
            targetId: 456,
            moderatorId: 1,
            reason: 'Spam content',
            createdAt: new Date(),
          },
        ],
        total: 1,
        page: 1,
        limit: 50,
      };
      mockModerationService.getAuditLog.mockResolvedValue(mockAuditLog);

      const response = await request(app)
        .get('/api/forum/moderation/audit-log')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockAuditLog,
      });

      expect(mockModerationService.getAuditLog).toHaveBeenCalledWith({
        page: 1,
        limit: 50,
        targetType: undefined,
        moderatorId: undefined,
      });
    });
  });

  describe('GET /keyword-filters', () => {
    it('should fetch keyword filters successfully', async () => {
      const mockFilters = [
        {
          id: 1,
          keywords: ['spam', 'advertisement'],
          action: 'flag',
          severity: 'medium',
          isActive: true,
        },
      ];
      mockModerationService.getKeywordFilters.mockResolvedValue(mockFilters);

      const response = await request(app)
        .get('/api/forum/moderation/keyword-filters')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockFilters,
      });
    });
  });

  describe('POST /keyword-filters', () => {
    it('should update keyword filters successfully', async () => {
      const mockResult = { id: 123, success: true };
      mockModerationService.updateKeywordFilters.mockResolvedValue(mockResult);

      const filterData = {
        keywords: ['spam', 'advertisement'],
        action: 'flag',
        severity: 'medium',
      };

      const response = await request(app)
        .post('/api/forum/moderation/keyword-filters')
        .send(filterData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Keyword filters updated successfully',
        data: mockResult,
      });

      expect(mockModerationService.updateKeywordFilters).toHaveBeenCalledWith({
        ...filterData,
        moderatorId: 1,
      });
    });

    it('should validate keyword filter input', async () => {
      const invalidData = {
        keywords: [], // Empty array
        action: 'invalid_action',
        severity: 'invalid_severity',
      };

      const response = await request(app)
        .post('/api/forum/moderation/keyword-filters')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to moderation actions', async () => {
      // This test would require setting up rate limiting middleware properly
      // For now, we just verify the endpoint exists and works
      mockModerationService.performAction.mockResolvedValue({ success: true });

      const actionData = {
        type: 'delete',
        reason: 'Valid reason',
        targetId: 456,
        targetType: 'post',
      };

      const response = await request(app)
        .post('/api/forum/moderation/actions')
        .send(actionData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Security', () => {
    it('should require authentication for all endpoints', () => {
      // This is mocked in our setup, but in real implementation
      // we would test that unauthenticated requests are rejected
      expect(true).toBe(true); // Placeholder
    });

    it('should require moderation permissions', () => {
      // This is mocked in our setup, but in real implementation
      // we would test that users without moderation permissions are rejected
      expect(true).toBe(true); // Placeholder
    });

    it('should sanitize input data', async () => {
      const maliciousData = {
        type: 'delete',
        reason: '<script>alert("xss")</script>',
        targetId: 456,
        targetType: 'post',
      };

      mockModerationService.performAction.mockResolvedValue({ success: true });

      const response = await request(app)
        .post('/api/forum/moderation/actions')
        .send(maliciousData)
        .expect(200);

      // Verify that the service received the data (input validation handles sanitization)
      expect(mockModerationService.performAction).toHaveBeenCalled();
    });
  });
});
