import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import {
  rateLimitConfigs,
  validateRequest,
  sanitizeHTML,
  logAuditEvent,
  auditLog,
  getAuditLogs,
  securityHeaders,
  requestSizeLimit,
  ValidationRule,
} from '../security.js';
import { AuthenticatedRequest } from '../auth.js';

describe('Security Middleware', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      ip: '127.0.0.1',
      path: '/api/test',
      body: {},
      headers: {},
      get: vi.fn(),
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      setHeader: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rate Limiting Configurations', () => {
    it('should have correct rate limit configurations', () => {
      expect(rateLimitConfigs.general.max).toBe(100);
      expect(rateLimitConfigs.general.windowMs).toBe(15 * 60 * 1000);

      expect(rateLimitConfigs.auth.max).toBe(5);
      expect(rateLimitConfigs.auth.windowMs).toBe(15 * 60 * 1000);

      expect(rateLimitConfigs.posting.max).toBe(10);
      expect(rateLimitConfigs.posting.windowMs).toBe(5 * 60 * 1000);

      expect(rateLimitConfigs.search.max).toBe(20);
      expect(rateLimitConfigs.search.windowMs).toBe(1 * 60 * 1000);

      expect(rateLimitConfigs.avatar.max).toBe(5);
      expect(rateLimitConfigs.avatar.windowMs).toBe(60 * 60 * 1000);
    });

    it('should skip rate limiting for health checks', () => {
      const skipFunction = rateLimitConfigs.general.skip;
      expect(skipFunction).toBeDefined();

      if (skipFunction) {
        expect(skipFunction({ path: '/api/health' } as Request)).toBe(true);
        expect(skipFunction({ path: '/api/forum' } as Request)).toBe(false);
      }
    });

    it('should use user ID for posting rate limit key generation', () => {
      const keyGenerator = rateLimitConfigs.posting.keyGenerator;
      expect(keyGenerator).toBeDefined();

      if (keyGenerator) {
        const authenticatedReq = {
          user: { userId: 123 },
          ip: '127.0.0.1',
        } as AuthenticatedRequest;
        const guestReq = { ip: '127.0.0.1' } as AuthenticatedRequest;

        expect(keyGenerator(authenticatedReq)).toBe('user:123');
        expect(keyGenerator(guestReq)).toBe('127.0.0.1');
      }
    });
  });

  describe('HTML Sanitization', () => {
    it('should sanitize basic HTML content', () => {
      const input = '<script>alert("xss")</script><p>Safe content</p>';
      const result = sanitizeHTML(input);

      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
      expect(result).toContain('<p>Safe content</p>');
    });

    it('should preserve safe HTML tags', () => {
      const input =
        '<p>Paragraph</p><strong>Bold</strong><em>Italic</em><code>Code</code>';
      const result = sanitizeHTML(input);

      expect(result).toContain('<p>Paragraph</p>');
      expect(result).toContain('<strong>Bold</strong>');
      expect(result).toContain('<em>Italic</em>');
      expect(result).toContain('<code>Code</code>');
    });

    it('should allow math tags when allowMath is true', () => {
      const input = '<math><mrow><mi>x</mi><mo>+</mo><mn>1</mn></mrow></math>';
      const result = sanitizeHTML(input, true);

      expect(result).toContain('<math>');
      expect(result).toContain('<mrow>');
      expect(result).toContain('<mi>x</mi>');
    });

    it('should remove math tags when allowMath is false', () => {
      const input = '<math><mrow><mi>x</mi><mo>+</mo><mn>1</mn></mrow></math>';
      const result = sanitizeHTML(input, false);

      expect(result).not.toContain('<math>');
      expect(result).not.toContain('<mrow>');
    });
  });

  describe('Request Validation', () => {
    it('should validate required fields', () => {
      const rules: ValidationRule[] = [
        { field: 'title', required: true, type: 'string' },
        { field: 'content', required: true, type: 'string' },
      ];

      mockReq.body = { title: 'Test Title' }; // Missing content

      const middleware = validateRequest(rules);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: 'content',
            code: 'FIELD_REQUIRED',
          }),
        ]),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should validate string length', () => {
      const rules: ValidationRule[] = [
        {
          field: 'title',
          required: true,
          type: 'string',
          minLength: 5,
          maxLength: 100,
        },
      ];

      mockReq.body = { title: 'Hi' }; // Too short

      const middleware = validateRequest(rules);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: 'title',
            code: 'TOO_SHORT',
          }),
        ]),
      });
    });

    it('should validate email format', () => {
      const rules: ValidationRule[] = [
        { field: 'email', required: true, type: 'email' },
      ];

      mockReq.body = { email: 'invalid-email' };

      const middleware = validateRequest(rules);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
            code: 'INVALID_EMAIL',
          }),
        ]),
      });
    });

    it('should validate number ranges', () => {
      const rules: ValidationRule[] = [
        { field: 'rating', required: true, type: 'number', min: 1, max: 5 },
      ];

      mockReq.body = { rating: 10 }; // Too high

      const middleware = validateRequest(rules);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: 'rating',
            code: 'TOO_LARGE',
          }),
        ]),
      });
    });

    it('should sanitize HTML content when requested', () => {
      const rules: ValidationRule[] = [
        {
          field: 'content',
          required: true,
          type: 'string',
          sanitize: true,
          allowHTML: true,
        },
      ];

      mockReq.body = {
        content: '<script>alert("xss")</script><p>Safe content</p>',
      };

      const middleware = validateRequest(rules);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.body.content).not.toContain('<script>');
      expect(mockReq.body.content).toContain('<p>Safe content</p>');
    });

    it('should pass validation for valid data', () => {
      const rules: ValidationRule[] = [
        {
          field: 'title',
          required: true,
          type: 'string',
          minLength: 5,
          maxLength: 100,
        },
        { field: 'content', required: true, type: 'string', sanitize: true },
      ];

      mockReq.body = {
        title: 'Valid Title',
        content: '<p>Valid content</p>',
      };

      const middleware = validateRequest(rules);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('Audit Logging', () => {
    beforeEach(() => {
      // Clear audit logs before each test
      const logs = getAuditLogs();
      logs.length = 0;
    });

    it('should log audit events', () => {
      mockReq.user = {
        userId: 123,
        username: 'testuser',
        role: 'member',
        iat: 0,
        exp: 0,
      };
      mockReq.ip = '192.168.1.1';
      (mockReq.get as any) = vi.fn().mockReturnValue('Mozilla/5.0');

      logAuditEvent(mockReq as AuthenticatedRequest, 'CREATE_POST', true, {
        resource: 'post',
        resourceId: 456,
        metadata: { threadId: 789 },
      });

      const logs = getAuditLogs({ limit: 1 });
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        userId: 123,
        username: 'testuser',
        action: 'CREATE_POST',
        resource: 'post',
        resourceId: 456,
        ipAddress: '192.168.1.1',
        success: true,
      });
    });

    it('should log failed events with error codes', () => {
      mockReq.user = {
        userId: 123,
        username: 'testuser',
        role: 'member',
        iat: 0,
        exp: 0,
      };

      logAuditEvent(mockReq as AuthenticatedRequest, 'DELETE_POST', false, {
        resource: 'post',
        resourceId: 456,
        errorCode: 'INSUFFICIENT_PERMISSIONS',
      });

      const logs = getAuditLogs({ limit: 1 });
      expect(logs[0]).toMatchObject({
        action: 'DELETE_POST',
        success: false,
        errorCode: 'INSUFFICIENT_PERMISSIONS',
      });
    });

    it('should filter audit logs correctly', () => {
      mockReq.user = {
        userId: 123,
        username: 'testuser',
        role: 'member',
        iat: 0,
        exp: 0,
      };

      // Log multiple events
      logAuditEvent(mockReq as AuthenticatedRequest, 'CREATE_POST', true, {
        resource: 'post',
      });
      logAuditEvent(mockReq as AuthenticatedRequest, 'EDIT_POST', true, {
        resource: 'post',
      });
      logAuditEvent(mockReq as AuthenticatedRequest, 'CREATE_THREAD', true, {
        resource: 'thread',
      });

      // Filter by action
      const createLogs = getAuditLogs({ action: 'CREATE_POST' });
      expect(createLogs).toHaveLength(1);
      expect(createLogs[0].action).toBe('CREATE_POST');

      // Filter by resource
      const postLogs = getAuditLogs({ resource: 'post' });
      expect(postLogs).toHaveLength(2);

      // Filter by user
      const userLogs = getAuditLogs({ userId: 123 });
      expect(userLogs).toHaveLength(3);
    });

    it('should create audit log middleware', () => {
      mockReq.user = {
        userId: 123,
        username: 'testuser',
        role: 'member',
        iat: 0,
        exp: 0,
      };
      mockRes.statusCode = 200;

      const middleware = auditLog('TEST_ACTION', {
        resource: 'test',
        getResourceId: req => req.params?.id || 'unknown',
      });

      // Mock params
      mockReq.params = { id: '456' };

      middleware(
        mockReq as AuthenticatedRequest,
        mockRes as Response,
        mockNext
      );

      // Simulate response
      (mockRes.json as any)({ success: true });

      expect(mockNext).toHaveBeenCalled();

      const logs = getAuditLogs({ limit: 1 });
      expect(logs[0]).toMatchObject({
        action: 'TEST_ACTION',
        resource: 'test',
        resourceId: '456',
        success: true,
      });
    });
  });

  describe('Security Headers', () => {
    it('should set all required security headers', () => {
      securityHeaders(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'X-Content-Type-Options',
        'nosniff'
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'X-XSS-Protection',
        '1; mode=block'
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Referrer-Policy',
        'strict-origin-when-cross-origin'
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Security-Policy',
        expect.stringContaining("default-src 'self'")
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it('should set CSP header with MathJax support', () => {
      securityHeaders(mockReq as Request, mockRes as Response, mockNext);

      const cspCall = (mockRes.setHeader as any).mock.calls.find(
        (call: any[]) => call[0] === 'Content-Security-Policy'
      );
      expect(cspCall).toBeDefined();
      expect(cspCall[1]).toContain(
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      );
    });
  });

  describe('Request Size Limiting', () => {
    it('should allow requests within size limit', () => {
      (mockReq.get as any) = vi.fn().mockReturnValue('1000'); // 1000 bytes
      const middleware = requestSizeLimit('1mb');

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should reject requests exceeding size limit', () => {
      (mockReq.get as any) = vi.fn().mockReturnValue('2000000'); // 2MB
      const middleware = requestSizeLimit('1mb');

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(413);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Request entity too large',
        code: 'REQUEST_TOO_LARGE',
        maxSize: '1mb',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should continue when no content-length header', () => {
      (mockReq.get as any) = vi.fn().mockReturnValue(undefined);
      const middleware = requestSizeLimit('1mb');

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });
});
