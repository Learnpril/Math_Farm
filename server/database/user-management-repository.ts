import { Database } from 'better-sqlite3';
import { getDatabase } from './connection';

export interface UserBan {
  id?: number;
  userId: number;
  moderatorId: number;
  reason: string;
  duration?: number;
  isActive: boolean;
  createdAt?: Date;
  expiresAt?: Date;
}

export interface UserRestriction {
  id?: number;
  userId: number;
  moderatorId: number;
  type: 'post_limit' | 'thread_limit' | 'no_images' | 'no_links' | 'shadow_ban';
  reason: string;
  duration?: number;
  metadata?: any;
  isActive: boolean;
  createdAt?: Date;
  expiresAt?: Date;
}

export interface UserWarning {
  id?: number;
  userId: number;
  moderatorId: number;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  isActive: boolean;
  createdAt?: Date;
}

export interface UserAppeal {
  id?: number;
  userId: number;
  actionType: 'ban' | 'restriction' | 'warning';
  actionId: number;
  reason: string;
  status: 'pending' | 'approved' | 'denied';
  moderatorId?: number;
  moderatorResponse?: string;
  createdAt?: Date;
  resolvedAt?: Date;
}

export interface UserActivity {
  postCount: number;
  threadCount: number;
  linkCount: number;
  duplicateContentCount: number;
}

export interface UserStats {
  accountAgeHours: number;
  totalPosts: number;
  totalThreads: number;
  warningCount: number;
  banCount: number;
}

/**
 * Repository for user management and safety operations
 * Handles bans, restrictions, warnings, and appeals
 */
export class UserManagementRepository {
  private db: Database;

  constructor() {
    this.db = getDatabase();
    this.initializeTables();
  }

  /**
   * Initialize user management tables
   */
  private initializeTables(): void {
    // User bans table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_bans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        moderator_id INTEGER NOT NULL,
        reason TEXT NOT NULL,
        duration INTEGER,
        is_active BOOLEAN NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (moderator_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // User restrictions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_restrictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        moderator_id INTEGER NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('post_limit', 'thread_limit', 'no_images', 'no_links', 'shadow_ban')),
        reason TEXT NOT NULL,
        duration INTEGER,
        metadata TEXT,
        is_active BOOLEAN NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (moderator_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // User warnings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_warnings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        moderator_id INTEGER NOT NULL,
        reason TEXT NOT NULL,
        severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
        is_active BOOLEAN NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (moderator_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // User appeals table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_appeals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        action_type TEXT NOT NULL CHECK (action_type IN ('ban', 'restriction', 'warning')),
        action_id INTEGER NOT NULL,
        reason TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
        moderator_id INTEGER,
        moderator_response TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        resolved_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (moderator_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_user_bans_user_active ON user_bans(user_id, is_active);
      CREATE INDEX IF NOT EXISTS idx_user_bans_expires ON user_bans(expires_at);
      
      CREATE INDEX IF NOT EXISTS idx_user_restrictions_user_active ON user_restrictions(user_id, is_active);
      CREATE INDEX IF NOT EXISTS idx_user_restrictions_expires ON user_restrictions(expires_at);
      CREATE INDEX IF NOT EXISTS idx_user_restrictions_type ON user_restrictions(type);
      
      CREATE INDEX IF NOT EXISTS idx_user_warnings_user_active ON user_warnings(user_id, is_active);
      CREATE INDEX IF NOT EXISTS idx_user_warnings_severity ON user_warnings(severity);
      
      CREATE INDEX IF NOT EXISTS idx_user_appeals_user_status ON user_appeals(user_id, status);
      CREATE INDEX IF NOT EXISTS idx_user_appeals_action ON user_appeals(action_type, action_id);
    `);
  }

  /**
   * Create a user ban
   */
  async createBan(ban: Omit<UserBan, 'id' | 'createdAt'>): Promise<UserBan> {
    const stmt = this.db.prepare(`
      INSERT INTO user_bans (
        user_id, moderator_id, reason, duration, is_active, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      ban.userId,
      ban.moderatorId,
      ban.reason,
      ban.duration || null,
      ban.isActive ? 1 : 0,
      ban.expiresAt ? ban.expiresAt.toISOString() : null
    );

    const banId = result.lastInsertRowid as number;
    return this.getBanById(banId)!;
  }

  /**
   * Get ban by ID
   */
  getBanById(id: number): UserBan | null {
    const stmt = this.db.prepare(`
      SELECT 
        id,
        user_id as userId,
        moderator_id as moderatorId,
        reason,
        duration,
        is_active as isActive,
        created_at as createdAt,
        expires_at as expiresAt
      FROM user_bans 
      WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return {
      ...row,
      isActive: Boolean(row.isActive),
      createdAt: new Date(row.createdAt),
      expiresAt: row.expiresAt ? new Date(row.expiresAt) : undefined,
    };
  }

  /**
   * Get active ban for user
   */
  getActiveBan(userId: number): UserBan | null {
    const stmt = this.db.prepare(`
      SELECT 
        id,
        user_id as userId,
        moderator_id as moderatorId,
        reason,
        duration,
        is_active as isActive,
        created_at as createdAt,
        expires_at as expiresAt
      FROM user_bans 
      WHERE user_id = ? AND is_active = 1 
        AND (expires_at IS NULL OR expires_at > datetime('now'))
      ORDER BY created_at DESC
      LIMIT 1
    `);

    const row = stmt.get(userId) as any;
    if (!row) return null;

    return {
      ...row,
      isActive: Boolean(row.isActive),
      createdAt: new Date(row.createdAt),
      expiresAt: row.expiresAt ? new Date(row.expiresAt) : undefined,
    };
  }

  /**
   * Deactivate a ban
   */
  async deactivateBan(banId: number): Promise<boolean> {
    const stmt = this.db.prepare(`
      UPDATE user_bans 
      SET is_active = 0 
      WHERE id = ?
    `);

    const result = stmt.run(banId);
    return result.changes > 0;
  }

  /**
   * Get all bans for a user
   */
  getUserBans(userId: number): UserBan[] {
    const stmt = this.db.prepare(`
      SELECT 
        id,
        user_id as userId,
        moderator_id as moderatorId,
        reason,
        duration,
        is_active as isActive,
        created_at as createdAt,
        expires_at as expiresAt
      FROM user_bans 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `);

    const rows = stmt.all(userId) as any[];
    return rows.map(row => ({
      ...row,
      isActive: Boolean(row.isActive),
      createdAt: new Date(row.createdAt),
      expiresAt: row.expiresAt ? new Date(row.expiresAt) : undefined,
    }));
  }

  /**
   * Create a user restriction
   */
  async createRestriction(
    restriction: Omit<UserRestriction, 'id' | 'createdAt'>
  ): Promise<UserRestriction> {
    const stmt = this.db.prepare(`
      INSERT INTO user_restrictions (
        user_id, moderator_id, type, reason, duration, metadata, is_active, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      restriction.userId,
      restriction.moderatorId,
      restriction.type,
      restriction.reason,
      restriction.duration || null,
      restriction.metadata ? JSON.stringify(restriction.metadata) : null,
      restriction.isActive ? 1 : 0,
      restriction.expiresAt ? restriction.expiresAt.toISOString() : null
    );

    const restrictionId = result.lastInsertRowid as number;
    return this.getRestrictionById(restrictionId)!;
  }

  /**
   * Get restriction by ID
   */
  getRestrictionById(id: number): UserRestriction | null {
    const stmt = this.db.prepare(`
      SELECT 
        id,
        user_id as userId,
        moderator_id as moderatorId,
        type,
        reason,
        duration,
        metadata,
        is_active as isActive,
        created_at as createdAt,
        expires_at as expiresAt
      FROM user_restrictions 
      WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return {
      ...row,
      isActive: Boolean(row.isActive),
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
      createdAt: new Date(row.createdAt),
      expiresAt: row.expiresAt ? new Date(row.expiresAt) : undefined,
    };
  }

  /**
   * Get active restrictions for user
   */
  getActiveRestrictions(userId: number): UserRestriction[] {
    const stmt = this.db.prepare(`
      SELECT 
        id,
        user_id as userId,
        moderator_id as moderatorId,
        type,
        reason,
        duration,
        metadata,
        is_active as isActive,
        created_at as createdAt,
        expires_at as expiresAt
      FROM user_restrictions 
      WHERE user_id = ? AND is_active = 1 
        AND (expires_at IS NULL OR expires_at > datetime('now'))
      ORDER BY created_at DESC
    `);

    const rows = stmt.all(userId) as any[];
    return rows.map(row => ({
      ...row,
      isActive: Boolean(row.isActive),
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
      createdAt: new Date(row.createdAt),
      expiresAt: row.expiresAt ? new Date(row.expiresAt) : undefined,
    }));
  }

  /**
   * Deactivate a restriction
   */
  async deactivateRestriction(restrictionId: number): Promise<boolean> {
    const stmt = this.db.prepare(`
      UPDATE user_restrictions 
      SET is_active = 0 
      WHERE id = ?
    `);

    const result = stmt.run(restrictionId);
    return result.changes > 0;
  }

  /**
   * Get all restrictions for a user
   */
  getUserRestrictions(userId: number): UserRestriction[] {
    const stmt = this.db.prepare(`
      SELECT 
        id,
        user_id as userId,
        moderator_id as moderatorId,
        type,
        reason,
        duration,
        metadata,
        is_active as isActive,
        created_at as createdAt,
        expires_at as expiresAt
      FROM user_restrictions 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `);

    const rows = stmt.all(userId) as any[];
    return rows.map(row => ({
      ...row,
      isActive: Boolean(row.isActive),
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
      createdAt: new Date(row.createdAt),
      expiresAt: row.expiresAt ? new Date(row.expiresAt) : undefined,
    }));
  }

  /**
   * Create a user warning
   */
  async createWarning(
    warning: Omit<UserWarning, 'id' | 'createdAt'>
  ): Promise<UserWarning> {
    const stmt = this.db.prepare(`
      INSERT INTO user_warnings (
        user_id, moderator_id, reason, severity, is_active
      ) VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      warning.userId,
      warning.moderatorId,
      warning.reason,
      warning.severity,
      warning.isActive ? 1 : 0
    );

    const warningId = result.lastInsertRowid as number;
    return this.getWarningById(warningId)!;
  }

  /**
   * Get warning by ID
   */
  getWarningById(id: number): UserWarning | null {
    const stmt = this.db.prepare(`
      SELECT 
        id,
        user_id as userId,
        moderator_id as moderatorId,
        reason,
        severity,
        is_active as isActive,
        created_at as createdAt
      FROM user_warnings 
      WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return {
      ...row,
      isActive: Boolean(row.isActive),
      createdAt: new Date(row.createdAt),
    };
  }

  /**
   * Get active warning count for user
   */
  getActiveWarningCount(userId: number): number {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count 
      FROM user_warnings 
      WHERE user_id = ? AND is_active = 1
    `);

    const { count } = stmt.get(userId) as { count: number };
    return count;
  }

  /**
   * Deactivate a warning
   */
  async deactivateWarning(warningId: number): Promise<boolean> {
    const stmt = this.db.prepare(`
      UPDATE user_warnings 
      SET is_active = 0 
      WHERE id = ?
    `);

    const result = stmt.run(warningId);
    return result.changes > 0;
  }

  /**
   * Get all warnings for a user
   */
  getUserWarnings(userId: number): UserWarning[] {
    const stmt = this.db.prepare(`
      SELECT 
        id,
        user_id as userId,
        moderator_id as moderatorId,
        reason,
        severity,
        is_active as isActive,
        created_at as createdAt
      FROM user_warnings 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `);

    const rows = stmt.all(userId) as any[];
    return rows.map(row => ({
      ...row,
      isActive: Boolean(row.isActive),
      createdAt: new Date(row.createdAt),
    }));
  }

  /**
   * Create an appeal
   */
  async createAppeal(
    appeal: Omit<UserAppeal, 'id' | 'createdAt'>
  ): Promise<UserAppeal> {
    const stmt = this.db.prepare(`
      INSERT INTO user_appeals (
        user_id, action_type, action_id, reason, status
      ) VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      appeal.userId,
      appeal.actionType,
      appeal.actionId,
      appeal.reason,
      appeal.status
    );

    const appealId = result.lastInsertRowid as number;
    return this.getAppealById(appealId)!;
  }

  /**
   * Get appeal by ID
   */
  getAppealById(id: number): UserAppeal | null {
    const stmt = this.db.prepare(`
      SELECT 
        id,
        user_id as userId,
        action_type as actionType,
        action_id as actionId,
        reason,
        status,
        moderator_id as moderatorId,
        moderator_response as moderatorResponse,
        created_at as createdAt,
        resolved_at as resolvedAt
      FROM user_appeals 
      WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return {
      ...row,
      createdAt: new Date(row.createdAt),
      resolvedAt: row.resolvedAt ? new Date(row.resolvedAt) : undefined,
    };
  }

  /**
   * Find existing appeal for action
   */
  findExistingAppeal(
    userId: number,
    actionType: string,
    actionId: number
  ): UserAppeal | null {
    const stmt = this.db.prepare(`
      SELECT 
        id,
        user_id as userId,
        action_type as actionType,
        action_id as actionId,
        reason,
        status,
        moderator_id as moderatorId,
        moderator_response as moderatorResponse,
        created_at as createdAt,
        resolved_at as resolvedAt
      FROM user_appeals 
      WHERE user_id = ? AND action_type = ? AND action_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `);

    const row = stmt.get(userId, actionType, actionId) as any;
    if (!row) return null;

    return {
      ...row,
      createdAt: new Date(row.createdAt),
      resolvedAt: row.resolvedAt ? new Date(row.resolvedAt) : undefined,
    };
  }

  /**
   * Update appeal
   */
  async updateAppeal(
    appealId: number,
    update: {
      status: 'approved' | 'denied';
      moderatorId: number;
      moderatorResponse: string;
      resolvedAt: Date;
    }
  ): Promise<UserAppeal> {
    const stmt = this.db.prepare(`
      UPDATE user_appeals 
      SET status = ?, moderator_id = ?, moderator_response = ?, resolved_at = ?
      WHERE id = ?
    `);

    stmt.run(
      update.status,
      update.moderatorId,
      update.moderatorResponse,
      update.resolvedAt.toISOString(),
      appealId
    );

    return this.getAppealById(appealId)!;
  }

  /**
   * Get all appeals for a user
   */
  getUserAppeals(userId: number): UserAppeal[] {
    const stmt = this.db.prepare(`
      SELECT 
        id,
        user_id as userId,
        action_type as actionType,
        action_id as actionId,
        reason,
        status,
        moderator_id as moderatorId,
        moderator_response as moderatorResponse,
        created_at as createdAt,
        resolved_at as resolvedAt
      FROM user_appeals 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `);

    const rows = stmt.all(userId) as any[];
    return rows.map(row => ({
      ...row,
      createdAt: new Date(row.createdAt),
      resolvedAt: row.resolvedAt ? new Date(row.resolvedAt) : undefined,
    }));
  }

  /**
   * Get user's recent activity for spam detection
   */
  getUserRecentActivity(userId: number, hours: number): UserActivity {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    // Get post count
    const postStmt = this.db.prepare(`
      SELECT COUNT(*) as count 
      FROM forum_posts 
      WHERE author_id = ? AND created_at > ?
    `);
    const postCount = (postStmt.get(userId, since) as any)?.count || 0;

    // Get thread count
    const threadStmt = this.db.prepare(`
      SELECT COUNT(*) as count 
      FROM forum_threads 
      WHERE author_id = ? AND created_at > ?
    `);
    const threadCount = (threadStmt.get(userId, since) as any)?.count || 0;

    // Get link count (approximate)
    const linkStmt = this.db.prepare(`
      SELECT COUNT(*) as count 
      FROM forum_posts 
      WHERE author_id = ? AND created_at > ? 
        AND (content LIKE '%http://%' OR content LIKE '%https://%')
    `);
    const linkCount = (linkStmt.get(userId, since) as any)?.count || 0;

    // Get duplicate content count (simplified)
    const duplicateStmt = this.db.prepare(`
      SELECT content, COUNT(*) as count 
      FROM forum_posts 
      WHERE author_id = ? AND created_at > ? 
      GROUP BY content 
      HAVING COUNT(*) > 1
    `);
    const duplicates = duplicateStmt.all(userId, since) as any[];
    const duplicateContentCount = duplicates.reduce(
      (sum, dup) => sum + dup.count - 1,
      0
    );

    return {
      postCount,
      threadCount,
      linkCount,
      duplicateContentCount,
    };
  }

  /**
   * Get user statistics
   */
  getUserStats(userId: number): UserStats {
    // Get account age
    const userStmt = this.db.prepare(`
      SELECT created_at 
      FROM users 
      WHERE id = ?
    `);
    const userRow = userStmt.get(userId) as any;
    const accountAgeHours = userRow
      ? (Date.now() - new Date(userRow.created_at).getTime()) / (1000 * 60 * 60)
      : 0;

    // Get total posts
    const postStmt = this.db.prepare(`
      SELECT COUNT(*) as count 
      FROM forum_posts 
      WHERE author_id = ?
    `);
    const totalPosts = (postStmt.get(userId) as any)?.count || 0;

    // Get total threads
    const threadStmt = this.db.prepare(`
      SELECT COUNT(*) as count 
      FROM forum_threads 
      WHERE author_id = ?
    `);
    const totalThreads = (threadStmt.get(userId) as any)?.count || 0;

    // Get warning count
    const warningStmt = this.db.prepare(`
      SELECT COUNT(*) as count 
      FROM user_warnings 
      WHERE user_id = ?
    `);
    const warningCount = (warningStmt.get(userId) as any)?.count || 0;

    // Get ban count
    const banStmt = this.db.prepare(`
      SELECT COUNT(*) as count 
      FROM user_bans 
      WHERE user_id = ?
    `);
    const banCount = (banStmt.get(userId) as any)?.count || 0;

    return {
      accountAgeHours,
      totalPosts,
      totalThreads,
      warningCount,
      banCount,
    };
  }

  /**
   * Clean up expired bans and restrictions
   */
  async cleanupExpiredActions(): Promise<void> {
    const now = new Date().toISOString();

    // Deactivate expired bans
    const banStmt = this.db.prepare(`
      UPDATE user_bans 
      SET is_active = 0 
      WHERE is_active = 1 AND expires_at IS NOT NULL AND expires_at <= ?
    `);
    banStmt.run(now);

    // Deactivate expired restrictions
    const restrictionStmt = this.db.prepare(`
      UPDATE user_restrictions 
      SET is_active = 0 
      WHERE is_active = 1 AND expires_at IS NOT NULL AND expires_at <= ?
    `);
    restrictionStmt.run(now);
  }
}
