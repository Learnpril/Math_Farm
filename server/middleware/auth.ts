import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../shared/forum-types.js';

// JWT payload interface
export interface JWTPayload {
  userId: number;
  username: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Extended Request interface with user data
export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

// Forum permission constants
export const FORUM_PERMISSIONS = {
  // Basic permissions
  READ_POSTS: 'read_posts',
  CREATE_POSTS: 'create_posts',
  EDIT_OWN_POSTS: 'edit_own_posts',
  DELETE_OWN_POSTS: 'delete_own_posts',

  // Thread permissions
  CREATE_THREADS: 'create_threads',
  EDIT_OWN_THREADS: 'edit_own_threads',

  // Moderation permissions
  EDIT_ANY_POST: 'edit_any_post',
  DELETE_ANY_POST: 'delete_any_post',
  LOCK_THREADS: 'lock_threads',
  PIN_THREADS: 'pin_threads',
  MOVE_THREADS: 'move_threads',

  // User management permissions
  BAN_USERS: 'ban_users',
  MANAGE_CATEGORIES: 'manage_categories',
  VIEW_REPORTS: 'view_reports',
  RESOLVE_REPORTS: 'resolve_reports',

  // Admin permissions
  MANAGE_USERS: 'manage_users',
  MANAGE_FORUM_SETTINGS: 'manage_forum_settings',
} as const;

export type ForumPermission =
  (typeof FORUM_PERMISSIONS)[keyof typeof FORUM_PERMISSIONS];

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, ForumPermission[]> = {
  guest: [FORUM_PERMISSIONS.READ_POSTS],
  member: [
    FORUM_PERMISSIONS.READ_POSTS,
    FORUM_PERMISSIONS.CREATE_POSTS,
    FORUM_PERMISSIONS.EDIT_OWN_POSTS,
    FORUM_PERMISSIONS.DELETE_OWN_POSTS,
    FORUM_PERMISSIONS.CREATE_THREADS,
    FORUM_PERMISSIONS.EDIT_OWN_THREADS,
  ],
  moderator: [
    FORUM_PERMISSIONS.READ_POSTS,
    FORUM_PERMISSIONS.CREATE_POSTS,
    FORUM_PERMISSIONS.EDIT_OWN_POSTS,
    FORUM_PERMISSIONS.DELETE_OWN_POSTS,
    FORUM_PERMISSIONS.CREATE_THREADS,
    FORUM_PERMISSIONS.EDIT_OWN_THREADS,
    FORUM_PERMISSIONS.EDIT_ANY_POST,
    FORUM_PERMISSIONS.DELETE_ANY_POST,
    FORUM_PERMISSIONS.LOCK_THREADS,
    FORUM_PERMISSIONS.PIN_THREADS,
    FORUM_PERMISSIONS.MOVE_THREADS,
    FORUM_PERMISSIONS.VIEW_REPORTS,
    FORUM_PERMISSIONS.RESOLVE_REPORTS,
  ],
  admin: [
    FORUM_PERMISSIONS.READ_POSTS,
    FORUM_PERMISSIONS.CREATE_POSTS,
    FORUM_PERMISSIONS.EDIT_OWN_POSTS,
    FORUM_PERMISSIONS.DELETE_OWN_POSTS,
    FORUM_PERMISSIONS.CREATE_THREADS,
    FORUM_PERMISSIONS.EDIT_OWN_THREADS,
    FORUM_PERMISSIONS.EDIT_ANY_POST,
    FORUM_PERMISSIONS.DELETE_ANY_POST,
    FORUM_PERMISSIONS.LOCK_THREADS,
    FORUM_PERMISSIONS.PIN_THREADS,
    FORUM_PERMISSIONS.MOVE_THREADS,
    FORUM_PERMISSIONS.BAN_USERS,
    FORUM_PERMISSIONS.MANAGE_CATEGORIES,
    FORUM_PERMISSIONS.VIEW_REPORTS,
    FORUM_PERMISSIONS.RESOLVE_REPORTS,
    FORUM_PERMISSIONS.MANAGE_USERS,
    FORUM_PERMISSIONS.MANAGE_FORUM_SETTINGS,
  ],
};

// JWT secret validation
const getJWTSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
  return secret;
};

// Generate secure JWT token
export const generateJWT = (
  userId: number,
  username: string,
  role: UserRole
): string => {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId,
    username,
    role,
  };

  return jwt.sign(payload, getJWTSecret(), {
    algorithm: 'HS256',
    expiresIn: '24h', // 24 hours
  });
};

// Verify JWT token
export const verifyJWT = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, getJWTSecret()) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

// Hash password using bcrypt
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
  if (saltRounds < 10) {
    throw new Error('BCRYPT_ROUNDS must be at least 10');
  }
  return await bcrypt.hash(password, saltRounds);
};

// Verify password against hash
export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// Check if user has specific permission
export const hasPermission = (
  userRole: UserRole,
  permission: ForumPermission
): boolean => {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  return rolePermissions.includes(permission);
};

// Check if user can perform action on resource (ownership check)
export const canPerformAction = (
  userRole: UserRole,
  permission: ForumPermission,
  resourceOwnerId?: number,
  userId?: number
): boolean => {
  // Check if user has the permission
  if (!hasPermission(userRole, permission)) {
    return false;
  }

  // For "own" permissions, check ownership
  if (
    permission.includes('own') &&
    resourceOwnerId !== undefined &&
    userId !== undefined
  ) {
    return resourceOwnerId === userId;
  }

  return true;
};

// Authentication middleware - validates JWT token
export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : null;

  if (!token) {
    res.status(401).json({
      error: 'Access token required',
      code: 'NO_TOKEN',
    });
    return;
  }

  try {
    const decoded = verifyJWT(token);
    req.user = decoded;
    next();
  } catch (error) {
    // Log authentication failure without exposing token
    console.error(
      'JWT verification failed:',
      error instanceof Error ? error.message : 'Unknown error'
    );

    res.status(401).json({
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN',
    });
  }
};

// Optional authentication middleware - allows both authenticated and guest users
export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : null;

  if (token) {
    try {
      const decoded = verifyJWT(token);
      req.user = decoded;
    } catch (error) {
      // Log but don't fail - continue as guest
      console.error(
        'Optional auth failed:',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  // Continue regardless of authentication status
  next();
};

// Permission-based authorization middleware
export const requirePermission = (permission: ForumPermission) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED',
      });
      return;
    }

    if (!hasPermission(req.user.role, permission)) {
      res.status(403).json({
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: permission,
      });
      return;
    }

    next();
  };
};

// Role-based authorization middleware
export const requireRole = (minRole: UserRole) => {
  const roleHierarchy: Record<UserRole, number> = {
    guest: 0,
    member: 1,
    moderator: 2,
    admin: 3,
  };

  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED',
      });
      return;
    }

    const userRoleLevel = roleHierarchy[req.user.role];
    const requiredRoleLevel = roleHierarchy[minRole];

    if (userRoleLevel < requiredRoleLevel) {
      res.status(403).json({
        error: 'Insufficient role level',
        code: 'INSUFFICIENT_ROLE',
        required: minRole,
        current: req.user.role,
      });
      return;
    }

    next();
  };
};

// Resource ownership authorization middleware
export const requireOwnership = (
  getResourceOwnerId: (req: AuthenticatedRequest) => Promise<number | null>
) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED',
      });
      return;
    }

    try {
      const resourceOwnerId = await getResourceOwnerId(req);

      if (resourceOwnerId === null) {
        res.status(404).json({
          error: 'Resource not found',
          code: 'RESOURCE_NOT_FOUND',
        });
        return;
      }

      // Admin and moderator can access any resource
      if (req.user.role === 'admin' || req.user.role === 'moderator') {
        next();
        return;
      }

      // Check ownership for regular users
      if (resourceOwnerId !== req.user.userId) {
        res.status(403).json({
          error: 'Access denied - not resource owner',
          code: 'NOT_RESOURCE_OWNER',
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Ownership check failed:', error);
      res.status(500).json({
        error: 'Authorization check failed',
        code: 'AUTHORIZATION_ERROR',
      });
    }
  };
};
