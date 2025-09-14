import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { AuthenticatedRequest } from './auth.js';

// Initialize DOMPurify with JSDOM for server-side use
const window = new JSDOM('').window;
const purify = DOMPurify(window);

// Rate limiting configurations for different endpoint types
export const rateLimitConfigs = {
  // General API rate limiting
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: '15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Don't count successful requests
    skipSuccessfulRequests: false,
    // Skip rate limiting for certain conditions
    skip: (req: Request) => {
      // Skip rate limiting for health checks
      return req.path === '/api/health';
    },
  }),

  // Strict rate limiting for authentication endpoints
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 auth attempts per windowMs
    message: {
      error: 'Too many authentication attempts',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      retryAfter: '15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful logins
  }),

  // Rate limiting for forum posting
  posting: rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // limit each IP to 10 posts per 5 minutes
    message: {
      error: 'Too many posts created',
      code: 'POST_RATE_LIMIT_EXCEEDED',
      retryAfter: '5 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: AuthenticatedRequest) => {
      // Rate limit by user ID if authenticated, otherwise by IP
      return req.user ? `user:${req.user.userId}` : req.ip;
    },
  }),

  // Rate limiting for search operations
  search: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // limit each IP to 20 searches per minute
    message: {
      error: 'Too many search requests',
      code: 'SEARCH_RATE_LIMIT_EXCEEDED',
      retryAfter: '1 minute',
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Rate limiting for avatar changes
  avatar: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each user to 5 avatar changes per hour
    message: {
      error: 'Too many avatar changes',
      code: 'AVATAR_RATE_LIMIT_EXCEEDED',
      retryAfter: '1 hour',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: AuthenticatedRequest) => {
      return req.user ? `avatar:${req.user.userId}` : req.ip;
    },
  }),
};

// Input validation and sanitization
export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'email' | 'url';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  sanitize?: boolean;
  allowHTML?: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Sanitize HTML content while preserving safe tags
export const sanitizeHTML = (
  content: string,
  allowMath: boolean = false
): string => {
  const allowedTags = allowMath
    ? [
        'p',
        'br',
        'strong',
        'em',
        'code',
        'pre',
        'span',
        'div',
        'math',
        'mrow',
        'mi',
        'mo',
        'mn',
        'msup',
        'msub',
        'mfrac',
      ]
    : ['p', 'br', 'strong', 'em', 'code', 'pre'];

  const allowedAttributes = allowMath
    ? ['class', 'data-*', 'mathvariant', 'displaystyle']
    : ['class'];

  return purify.sanitize(content, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  });
};

// Validate and sanitize request data
export const validateRequest = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: ValidationError[] = [];
    const sanitizedData: Record<string, any> = {};

    for (const rule of rules) {
      const value = req.body[rule.field];

      // Check required fields
      if (
        rule.required &&
        (value === undefined || value === null || value === '')
      ) {
        errors.push({
          field: rule.field,
          message: `${rule.field} is required`,
          code: 'FIELD_REQUIRED',
        });
        continue;
      }

      // Skip validation for optional empty fields
      if (
        !rule.required &&
        (value === undefined || value === null || value === '')
      ) {
        continue;
      }

      // Type validation
      if (rule.type) {
        switch (rule.type) {
          case 'string':
            if (typeof value !== 'string') {
              errors.push({
                field: rule.field,
                message: `${rule.field} must be a string`,
                code: 'INVALID_TYPE',
              });
              continue;
            }
            break;
          case 'number':
            if (typeof value !== 'number' || isNaN(value)) {
              errors.push({
                field: rule.field,
                message: `${rule.field} must be a number`,
                code: 'INVALID_TYPE',
              });
              continue;
            }
            break;
          case 'boolean':
            if (typeof value !== 'boolean') {
              errors.push({
                field: rule.field,
                message: `${rule.field} must be a boolean`,
                code: 'INVALID_TYPE',
              });
              continue;
            }
            break;
          case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (typeof value !== 'string' || !emailRegex.test(value)) {
              errors.push({
                field: rule.field,
                message: `${rule.field} must be a valid email`,
                code: 'INVALID_EMAIL',
              });
              continue;
            }
            break;
          case 'url':
            try {
              new URL(value);
            } catch {
              errors.push({
                field: rule.field,
                message: `${rule.field} must be a valid URL`,
                code: 'INVALID_URL',
              });
              continue;
            }
            break;
        }
      }

      // String length validation
      if (typeof value === 'string') {
        if (rule.minLength && value.length < rule.minLength) {
          errors.push({
            field: rule.field,
            message: `${rule.field} must be at least ${rule.minLength} characters`,
            code: 'TOO_SHORT',
          });
          continue;
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          errors.push({
            field: rule.field,
            message: `${rule.field} must be no more than ${rule.maxLength} characters`,
            code: 'TOO_LONG',
          });
          continue;
        }
      }

      // Number range validation
      if (typeof value === 'number') {
        if (rule.min !== undefined && value < rule.min) {
          errors.push({
            field: rule.field,
            message: `${rule.field} must be at least ${rule.min}`,
            code: 'TOO_SMALL',
          });
          continue;
        }
        if (rule.max !== undefined && value > rule.max) {
          errors.push({
            field: rule.field,
            message: `${rule.field} must be no more than ${rule.max}`,
            code: 'TOO_LARGE',
          });
          continue;
        }
      }

      // Pattern validation
      if (
        rule.pattern &&
        typeof value === 'string' &&
        !rule.pattern.test(value)
      ) {
        errors.push({
          field: rule.field,
          message: `${rule.field} format is invalid`,
          code: 'INVALID_FORMAT',
        });
        continue;
      }

      // Sanitization
      let sanitizedValue = value;
      if (rule.sanitize && typeof value === 'string') {
        if (rule.allowHTML) {
          sanitizedValue = sanitizeHTML(value, true); // Allow math content
        } else {
          sanitizedValue = purify.sanitize(value, { ALLOWED_TAGS: [] }); // Strip all HTML
        }
      }

      sanitizedData[rule.field] = sanitizedValue;
    }

    // Return validation errors
    if (errors.length > 0) {
      res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors,
      });
      return;
    }

    // Add sanitized data to request
    req.body = { ...req.body, ...sanitizedData };
    next();
  };
};

// Audit logging interface
export interface AuditLogEntry {
  timestamp: Date;
  userId?: number;
  username?: string;
  action: string;
  resource?: string;
  resourceId?: string | number;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorCode?: string;
  metadata?: Record<string, any>;
}

// In-memory audit log storage (in production, this should be a database)
const auditLogs: AuditLogEntry[] = [];
const MAX_AUDIT_LOGS = 10000; // Keep last 10k entries in memory

// Audit logging function
export const logAuditEvent = (
  req: AuthenticatedRequest,
  action: string,
  success: boolean,
  options: {
    resource?: string;
    resourceId?: string | number;
    errorCode?: string;
    metadata?: Record<string, any>;
  } = {}
): void => {
  const logEntry: AuditLogEntry = {
    timestamp: new Date(),
    userId: req.user?.userId,
    username: req.user?.username,
    action,
    resource: options.resource,
    resourceId: options.resourceId,
    ipAddress: req.ip || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown',
    success,
    errorCode: options.errorCode,
    metadata: options.metadata,
  };

  // Add to in-memory storage
  auditLogs.push(logEntry);

  // Keep only the most recent entries
  if (auditLogs.length > MAX_AUDIT_LOGS) {
    auditLogs.splice(0, auditLogs.length - MAX_AUDIT_LOGS);
  }

  // Log to console (in production, this should go to a proper logging system)
  const logLevel = success ? 'info' : 'warn';
  const logMessage = `AUDIT: ${action} by ${logEntry.username || 'anonymous'} (${logEntry.userId || 'no-id'}) - ${success ? 'SUCCESS' : 'FAILED'}`;

  console[logLevel](logMessage, {
    timestamp: logEntry.timestamp.toISOString(),
    userId: logEntry.userId,
    action: logEntry.action,
    resource: logEntry.resource,
    resourceId: logEntry.resourceId,
    ipAddress: logEntry.ipAddress,
    success: logEntry.success,
    errorCode: logEntry.errorCode,
    // Don't log sensitive metadata
    metadata: options.metadata ? Object.keys(options.metadata) : undefined,
  });
};

// Audit logging middleware
export const auditLog = (
  action: string,
  options: {
    resource?: string;
    getResourceId?: (req: AuthenticatedRequest) => string | number;
    metadata?: (req: AuthenticatedRequest) => Record<string, any>;
  } = {}
) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    // Store original res.json to intercept response
    const originalJson = res.json;
    let responseLogged = false;

    res.json = function (body: any) {
      if (!responseLogged) {
        responseLogged = true;
        const success = res.statusCode >= 200 && res.statusCode < 400;
        const errorCode = !success && body?.code ? body.code : undefined;

        logAuditEvent(req, action, success, {
          resource: options.resource,
          resourceId: options.getResourceId
            ? options.getResourceId(req)
            : undefined,
          errorCode,
          metadata: options.metadata ? options.metadata(req) : undefined,
        });
      }

      return originalJson.call(this, body);
    };

    next();
  };
};

// Get audit logs (for admin use)
export const getAuditLogs = (
  filters: {
    userId?: number;
    action?: string;
    resource?: string;
    success?: boolean;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
): AuditLogEntry[] => {
  let filteredLogs = [...auditLogs];

  // Apply filters
  if (filters.userId !== undefined) {
    filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
  }
  if (filters.action) {
    filteredLogs = filteredLogs.filter(log => log.action === filters.action);
  }
  if (filters.resource) {
    filteredLogs = filteredLogs.filter(
      log => log.resource === filters.resource
    );
  }
  if (filters.success !== undefined) {
    filteredLogs = filteredLogs.filter(log => log.success === filters.success);
  }
  if (filters.startDate) {
    filteredLogs = filteredLogs.filter(
      log => log.timestamp >= filters.startDate!
    );
  }
  if (filters.endDate) {
    filteredLogs = filteredLogs.filter(
      log => log.timestamp <= filters.endDate!
    );
  }

  // Sort by timestamp (newest first)
  filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Apply limit
  if (filters.limit && filters.limit > 0) {
    filteredLogs = filteredLogs.slice(0, filters.limit);
  }

  return filteredLogs;
};

// Security headers middleware
export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Set security headers
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

  // Content Security Policy for forum content
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // MathJax requires unsafe-eval
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');

  res.setHeader('Content-Security-Policy', csp);

  next();
};

// Request size limiting middleware
export const requestSizeLimit = (maxSize: string = '1mb') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = req.get('content-length');
    if (contentLength) {
      const sizeInBytes = parseInt(contentLength, 10);
      const maxSizeInBytes = parseSize(maxSize);

      if (sizeInBytes > maxSizeInBytes) {
        res.status(413).json({
          error: 'Request entity too large',
          code: 'REQUEST_TOO_LARGE',
          maxSize,
        });
        return;
      }
    }
    next();
  };
};

// Helper function to parse size strings like '1mb', '500kb'
const parseSize = (size: string): number => {
  const units: Record<string, number> = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
  };

  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)(b|kb|mb|gb)$/);
  if (!match) {
    throw new Error(`Invalid size format: ${size}`);
  }

  const [, value, unit] = match;
  return Math.floor(parseFloat(value) * units[unit]);
};
