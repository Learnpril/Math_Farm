import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import {
  generateJWT,
  verifyJWT,
  hashPassword,
  verifyPassword,
  hasPermission,
  canPerformAction,
  authenticateToken,
  optionalAuth,
  requirePermission,
  requireRole,
  requireOwnership,
  FORUM_PERMISSIONS,
  ROLE_PERMISSIONS,
  AuthenticatedRequest,
  JWTPayload,
} from '../auth.js';
import { UserRole } from '../../../shared/forum-types.js';

// Mock environment variables
const mockEnv = {
  JWT_SECRET: 'test-secret-key-that-is-at-least-32-characters-long',
  BCRYPT_ROUNDS: '12',
};

describe('Auth Middleware', () => {
  beforeEach(() => {
    // Set up environment variables
    Object.entries(mockEnv).forEach(([key, value]) => {
      process.env[key] = value;
    });
  });

  afterEach(() => {
    // Clean up environment variables
    Object.keys(mockEnv).forEach(key => {
      delete process.env[key];
    });
    vi.clearAllMocks();
  });

  describe('JWT Functions', () => {
    it('should generate a valid JWT token', () => {
      const token = generateJWT(1, 'testuser', 'member');
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should verify a valid JWT token', () => {
      const token = generateJWT(1, 'testuser', 'member');
      const decoded = verifyJWT(token);

      expect(decoded.userId).toBe(1);
      expect(decoded.username).toBe('testuser');
      expect(decoded.role).toBe('member');
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it('should throw error for invalid JWT token', () => {
      expect(() => verifyJWT('invalid-token')).toThrow('Invalid token');
    });

    it('should throw error for expired JWT token', () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        { userId: 1, username: 'test', role: 'member' },
        mockEnv.JWT_SECRET,
        { expiresIn: '-1h' }
      );

      expect(() => verifyJWT(expiredToken)).toThrow('Token expired');
    });

    it('should throw error when JWT_SECRET is missing', () => {
      delete process.env.JWT_SECRET;
      expect(() => generateJWT(1, 'test', 'member')).toThrow(
        'JWT_SECRET environment variable is required'
      );
    });

    it('should throw error when JWT_SECRET is too short', () => {
      process.env.JWT_SECRET = 'short';
      expect(() => generateJWT(1, 'test', 'member')).toThrow(
        'JWT_SECRET must be at least 32 characters long'
      );
    });
  });

  describe('Password Functions', () => {
    it('should hash password correctly', async () => {
      const password = 'testpassword123';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.startsWith('$2b$')).toBe(true);
    });

    it('should verify password against hash', async () => {
      const password = 'testpassword123';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword('wrongpassword', hash);
      expect(isInvalid).toBe(false);
    });

    it('should throw error when BCRYPT_ROUNDS is too low', async () => {
      process.env.BCRYPT_ROUNDS = '5';
      await expect(hashPassword('test')).rejects.toThrow(
        'BCRYPT_ROUNDS must be at least 10'
      );
    });
  });

  describe('Permission Functions', () => {
    it('should check permissions correctly for different roles', () => {
      expect(hasPermission('guest', FORUM_PERMISSIONS.READ_POSTS)).toBe(true);
      expect(hasPermission('guest', FORUM_PERMISSIONS.CREATE_POSTS)).toBe(
        false
      );

      expect(hasPermission('member', FORUM_PERMISSIONS.CREATE_POSTS)).toBe(
        true
      );
      expect(hasPermission('member', FORUM_PERMISSIONS.BAN_USERS)).toBe(false);

      expect(hasPermission('moderator', FORUM_PERMISSIONS.LOCK_THREADS)).toBe(
        true
      );
      expect(hasPermission('moderator', FORUM_PERMISSIONS.MANAGE_USERS)).toBe(
        false
      );

      expect(hasPermission('admin', FORUM_PERMISSIONS.MANAGE_USERS)).toBe(true);
    });

    it('should check ownership-based actions correctly', () => {
      // User can edit their own posts
      expect(
        canPerformAction('member', FORUM_PERMISSIONS.EDIT_OWN_POSTS, 1, 1)
      ).toBe(true);
      expect(
        canPerformAction('member', FORUM_PERMISSIONS.EDIT_OWN_POSTS, 2, 1)
      ).toBe(false);

      // Moderator can edit any post regardless of ownership
      expect(
        canPerformAction('moderator', FORUM_PERMISSIONS.EDIT_ANY_POST, 2, 1)
      ).toBe(true);

      // User without permission cannot perform action
      expect(
        canPerformAction('guest', FORUM_PERMISSIONS.EDIT_OWN_POSTS, 1, 1)
      ).toBe(false);
    });
  });

  describe('Authentication Middleware', () => {
    let mockReq: Partial<AuthenticatedRequest>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockReq = {
        headers: {},
      };
      mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };
      mockNext = vi.fn();
    });

    describe('authenticateToken', () => {
      it('should authenticate valid token', () => {
        const token = generateJWT(1, 'testuser', 'member');
        mockReq.headers = { authorization: `Bearer ${token}` };

        authenticateToken(
          mockReq as AuthenticatedRequest,
          mockRes as Response,
          mockNext
        );

        expect(mockNext).toHaveBeenCalled();
        expect(mockReq.user).toBeDefined();
        expect(mockReq.user?.userId).toBe(1);
        expect(mockReq.user?.username).toBe('testuser');
        expect(mockReq.user?.role).toBe('member');
      });

      it('should reject request without token', () => {
        authenticateToken(
          mockReq as AuthenticatedRequest,
          mockRes as Response,
          mockNext
        );

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Access token required',
          code: 'NO_TOKEN',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should reject request with invalid token', () => {
        mockReq.headers = { authorization: 'Bearer invalid-token' };

        authenticateToken(
          mockReq as AuthenticatedRequest,
          mockRes as Response,
          mockNext
        );

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Invalid or expired token',
          code: 'INVALID_TOKEN',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });
    });

    describe('optionalAuth', () => {
      it('should authenticate valid token', () => {
        const token = generateJWT(1, 'testuser', 'member');
        mockReq.headers = { authorization: `Bearer ${token}` };

        optionalAuth(
          mockReq as AuthenticatedRequest,
          mockRes as Response,
          mockNext
        );

        expect(mockNext).toHaveBeenCalled();
        expect(mockReq.user).toBeDefined();
        expect(mockReq.user?.userId).toBe(1);
      });

      it('should continue without authentication when no token provided', () => {
        optionalAuth(
          mockReq as AuthenticatedRequest,
          mockRes as Response,
          mockNext
        );

        expect(mockNext).toHaveBeenCalled();
        expect(mockReq.user).toBeUndefined();
      });

      it('should continue as guest when invalid token provided', () => {
        mockReq.headers = { authorization: 'Bearer invalid-token' };

        optionalAuth(
          mockReq as AuthenticatedRequest,
          mockRes as Response,
          mockNext
        );

        expect(mockNext).toHaveBeenCalled();
        expect(mockReq.user).toBeUndefined();
      });
    });

    describe('requirePermission', () => {
      it('should allow user with required permission', () => {
        mockReq.user = {
          userId: 1,
          username: 'test',
          role: 'member',
          iat: 0,
          exp: 0,
        };
        const middleware = requirePermission(FORUM_PERMISSIONS.CREATE_POSTS);

        middleware(
          mockReq as AuthenticatedRequest,
          mockRes as Response,
          mockNext
        );

        expect(mockNext).toHaveBeenCalled();
      });

      it('should reject unauthenticated user', () => {
        const middleware = requirePermission(FORUM_PERMISSIONS.CREATE_POSTS);

        middleware(
          mockReq as AuthenticatedRequest,
          mockRes as Response,
          mockNext
        );

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should reject user without required permission', () => {
        mockReq.user = {
          userId: 1,
          username: 'test',
          role: 'guest',
          iat: 0,
          exp: 0,
        };
        const middleware = requirePermission(FORUM_PERMISSIONS.CREATE_POSTS);

        middleware(
          mockReq as AuthenticatedRequest,
          mockRes as Response,
          mockNext
        );

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          required: FORUM_PERMISSIONS.CREATE_POSTS,
        });
        expect(mockNext).not.toHaveBeenCalled();
      });
    });

    describe('requireRole', () => {
      it('should allow user with sufficient role', () => {
        mockReq.user = {
          userId: 1,
          username: 'test',
          role: 'moderator',
          iat: 0,
          exp: 0,
        };
        const middleware = requireRole('member');

        middleware(
          mockReq as AuthenticatedRequest,
          mockRes as Response,
          mockNext
        );

        expect(mockNext).toHaveBeenCalled();
      });

      it('should reject user with insufficient role', () => {
        mockReq.user = {
          userId: 1,
          username: 'test',
          role: 'member',
          iat: 0,
          exp: 0,
        };
        const middleware = requireRole('moderator');

        middleware(
          mockReq as AuthenticatedRequest,
          mockRes as Response,
          mockNext
        );

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Insufficient role level',
          code: 'INSUFFICIENT_ROLE',
          required: 'moderator',
          current: 'member',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });
    });

    describe('requireOwnership', () => {
      it('should allow resource owner', async () => {
        mockReq.user = {
          userId: 1,
          username: 'test',
          role: 'member',
          iat: 0,
          exp: 0,
        };
        const getResourceOwnerId = vi.fn().mockResolvedValue(1);
        const middleware = requireOwnership(getResourceOwnerId);

        await middleware(
          mockReq as AuthenticatedRequest,
          mockRes as Response,
          mockNext
        );

        expect(mockNext).toHaveBeenCalled();
        expect(getResourceOwnerId).toHaveBeenCalledWith(mockReq);
      });

      it('should allow admin regardless of ownership', async () => {
        mockReq.user = {
          userId: 1,
          username: 'test',
          role: 'admin',
          iat: 0,
          exp: 0,
        };
        const getResourceOwnerId = vi.fn().mockResolvedValue(2);
        const middleware = requireOwnership(getResourceOwnerId);

        await middleware(
          mockReq as AuthenticatedRequest,
          mockRes as Response,
          mockNext
        );

        expect(mockNext).toHaveBeenCalled();
      });

      it('should reject non-owner', async () => {
        mockReq.user = {
          userId: 1,
          username: 'test',
          role: 'member',
          iat: 0,
          exp: 0,
        };
        const getResourceOwnerId = vi.fn().mockResolvedValue(2);
        const middleware = requireOwnership(getResourceOwnerId);

        await middleware(
          mockReq as AuthenticatedRequest,
          mockRes as Response,
          mockNext
        );

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Access denied - not resource owner',
          code: 'NOT_RESOURCE_OWNER',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should handle resource not found', async () => {
        mockReq.user = {
          userId: 1,
          username: 'test',
          role: 'member',
          iat: 0,
          exp: 0,
        };
        const getResourceOwnerId = vi.fn().mockResolvedValue(null);
        const middleware = requireOwnership(getResourceOwnerId);

        await middleware(
          mockReq as AuthenticatedRequest,
          mockRes as Response,
          mockNext
        );

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Resource not found',
          code: 'RESOURCE_NOT_FOUND',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should handle errors gracefully', async () => {
        mockReq.user = {
          userId: 1,
          username: 'test',
          role: 'member',
          iat: 0,
          exp: 0,
        };
        const getResourceOwnerId = vi
          .fn()
          .mockRejectedValue(new Error('Database error'));
        const middleware = requireOwnership(getResourceOwnerId);

        await middleware(
          mockReq as AuthenticatedRequest,
          mockRes as Response,
          mockNext
        );

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Authorization check failed',
          code: 'AUTHORIZATION_ERROR',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });
    });
  });

  describe('Permission Constants', () => {
    it('should have all required permissions defined', () => {
      const expectedPermissions = [
        'read_posts',
        'create_posts',
        'edit_own_posts',
        'delete_own_posts',
        'create_threads',
        'edit_own_threads',
        'edit_any_post',
        'delete_any_post',
        'lock_threads',
        'pin_threads',
        'move_threads',
        'ban_users',
        'manage_categories',
        'view_reports',
        'resolve_reports',
        'manage_users',
        'manage_forum_settings',
      ];

      const actualPermissions = Object.values(FORUM_PERMISSIONS);
      expectedPermissions.forEach(permission => {
        expect(actualPermissions).toContain(permission);
      });
    });

    it('should have role permissions properly configured', () => {
      // Guest should only have read access
      expect(ROLE_PERMISSIONS.guest).toEqual([FORUM_PERMISSIONS.READ_POSTS]);

      // Member should have basic posting permissions
      expect(ROLE_PERMISSIONS.member).toContain(FORUM_PERMISSIONS.CREATE_POSTS);
      expect(ROLE_PERMISSIONS.member).toContain(
        FORUM_PERMISSIONS.EDIT_OWN_POSTS
      );
      expect(ROLE_PERMISSIONS.member).not.toContain(
        FORUM_PERMISSIONS.BAN_USERS
      );

      // Moderator should have moderation permissions
      expect(ROLE_PERMISSIONS.moderator).toContain(
        FORUM_PERMISSIONS.LOCK_THREADS
      );
      expect(ROLE_PERMISSIONS.moderator).toContain(
        FORUM_PERMISSIONS.VIEW_REPORTS
      );
      expect(ROLE_PERMISSIONS.moderator).not.toContain(
        FORUM_PERMISSIONS.MANAGE_USERS
      );

      // Admin should have all permissions
      expect(ROLE_PERMISSIONS.admin).toContain(FORUM_PERMISSIONS.MANAGE_USERS);
      expect(ROLE_PERMISSIONS.admin).toContain(
        FORUM_PERMISSIONS.MANAGE_FORUM_SETTINGS
      );
    });
  });
});
