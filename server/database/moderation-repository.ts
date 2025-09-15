import { Database } from 'better-sqlite3';
import { getDatabase } from './connection';

export interface ModerationActionLog {
  id?: number;
  action: string;
  targetType: 'post' | 'thread' | 'user' | 'report' | 'system';
  targetId: number;
  moderatorId: number;
  reason: string;
  duration?: number;
  metadata?: any;
  createdAt?: Date;
}

export interface ForumReport {
  id?: number;
  postId: number;
  reporterId: number;
  reason: string;
  category: string;
  details?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  moderatorId?: number;
  createdAt?: Date;
  resolvedAt?: Date;
}

export interface KeywordFilter {
  id?: number;
  keywords: string[];
  action: 'flag' | 'auto_hide' | 'auto_delete';
  severity: 'low' | 'medium' | 'high';
  isActive: boolean;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Repository for moderation-related database operations
 * Handles audit logging, reports, and keyword filtering
 */
export class ModerationRepository {
  private db: Database;

  constructor() {
    this.db = getDatabase();
    this.initializeTables();
  }

  /**
   * Initialize moderation tables if they don't exist
   */
  private initializeTables(): void {
    // Moderation action log table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS moderation_actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        target_type TEXT NOT NULL CHECK (target_type IN ('post', 'thread', 'user', 'report', 'system')),
        target_id INTEGER NOT NULL,
        moderator_id INTEGER NOT NULL,
        reason TEXT NOT NULL,
        duration INTEGER,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (moderator_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Forum reports table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS forum_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        reporter_id INTEGER NOT NULL,
        reason TEXT NOT NULL,
        category TEXT NOT NULL CHECK (category IN ('spam', 'harassment', 'inappropriate_content', 'misinformation', 'copyright', 'other')),
        details TEXT,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
        moderator_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        resolved_at DATETIME,
        FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
        FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (moderator_id) REFERENCES users(id) ON DELETE SET NULL,
        UNIQUE(post_id, reporter_id)
      )
    `);

    // Keyword filters table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS keyword_filters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        keywords TEXT NOT NULL,
        action TEXT NOT NULL CHECK (action IN ('flag', 'auto_hide', 'auto_delete')),
        severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
        is_active BOOLEAN NOT NULL DEFAULT 1,
        created_by INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_moderation_actions_target ON moderation_actions(target_type, target_id);
      CREATE INDEX IF NOT EXISTS idx_moderation_actions_moderator ON moderation_actions(moderator_id);
      CREATE INDEX IF NOT EXISTS idx_moderation_actions_created ON moderation_actions(created_at);
      
      CREATE INDEX IF NOT EXISTS idx_forum_reports_post ON forum_reports(post_id);
      CREATE INDEX IF NOT EXISTS idx_forum_reports_reporter ON forum_reports(reporter_id);
      CREATE INDEX IF NOT EXISTS idx_forum_reports_status ON forum_reports(status);
      CREATE INDEX IF NOT EXISTS idx_forum_reports_created ON forum_reports(created_at);
      
      CREATE INDEX IF NOT EXISTS idx_keyword_filters_active ON keyword_filters(is_active);
      CREATE INDEX IF NOT EXISTS idx_keyword_filters_severity ON keyword_filters(severity);
    `);
  }

  /**
   * Log a moderation action for audit trail
   */
  async logModerationAction(action: ModerationActionLog): Promise<number> {
    const stmt = this.db.prepare(`
      INSERT INTO moderation_actions (
        action, target_type, target_id, moderator_id, reason, duration, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      action.action,
      action.targetType,
      action.targetId,
      action.moderatorId,
      action.reason,
      action.duration || null,
      action.metadata ? JSON.stringify(action.metadata) : null
    );

    return result.lastInsertRowid as number;
  }

  /**
   * Create a new content report
   */
  async createReport(
    report: Omit<ForumReport, 'id' | 'createdAt'>
  ): Promise<ForumReport> {
    const stmt = this.db.prepare(`
      INSERT INTO forum_reports (
        post_id, reporter_id, reason, category, details, status
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      report.postId,
      report.reporterId,
      report.reason,
      report.category,
      report.details || null,
      report.status
    );

    const reportId = result.lastInsertRowid as number;
    return this.getReportById(reportId)!;
  }

  /**
   * Get report by ID
   */
  getReportById(id: number): ForumReport | null {
    const stmt = this.db.prepare(`
      SELECT 
        id,
        post_id as postId,
        reporter_id as reporterId,
        reason,
        category,
        details,
        status,
        moderator_id as moderatorId,
        created_at as createdAt,
        resolved_at as resolvedAt
      FROM forum_reports 
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
   * Check for existing report from same user for same post
   */
  findExistingReport(postId: number, reporterId: number): ForumReport | null {
    const stmt = this.db.prepare(`
      SELECT 
        id,
        post_id as postId,
        reporter_id as reporterId,
        reason,
        category,
        details,
        status,
        moderator_id as moderatorId,
        created_at as createdAt,
        resolved_at as resolvedAt
      FROM forum_reports 
      WHERE post_id = ? AND reporter_id = ?
    `);

    const row = stmt.get(postId, reporterId) as any;
    if (!row) return null;

    return {
      ...row,
      createdAt: new Date(row.createdAt),
      resolvedAt: row.resolvedAt ? new Date(row.resolvedAt) : undefined,
    };
  }

  /**
   * Get reports with pagination and filtering
   */
  getReports(options: { status?: string; page?: number; limit?: number }): {
    reports: ForumReport[];
    total: number;
    page: number;
    limit: number;
  } {
    const { status = 'pending', page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    // Count total reports
    const countStmt = this.db.prepare(`
      SELECT COUNT(*) as count 
      FROM forum_reports 
      WHERE status = ?
    `);
    const { count: total } = countStmt.get(status) as { count: number };

    // Get reports with pagination
    const stmt = this.db.prepare(`
      SELECT 
        r.id,
        r.post_id as postId,
        r.reporter_id as reporterId,
        r.reason,
        r.category,
        r.details,
        r.status,
        r.moderator_id as moderatorId,
        r.created_at as createdAt,
        r.resolved_at as resolvedAt,
        u.username as reporterUsername
      FROM forum_reports r
      LEFT JOIN users u ON r.reporter_id = u.id
      WHERE r.status = ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `);

    const rows = stmt.all(status, limit, offset) as any[];
    const reports = rows.map(row => ({
      ...row,
      createdAt: new Date(row.createdAt),
      resolvedAt: row.resolvedAt ? new Date(row.resolvedAt) : undefined,
    }));

    return { reports, total, page, limit };
  }

  /**
   * Update report status
   */
  async updateReportStatus(
    reportId: number,
    update: {
      status: 'resolved' | 'dismissed';
      moderatorId: number;
      resolvedAt: Date;
    }
  ): Promise<boolean> {
    const stmt = this.db.prepare(`
      UPDATE forum_reports 
      SET status = ?, moderator_id = ?, resolved_at = ?
      WHERE id = ?
    `);

    const result = stmt.run(
      update.status,
      update.moderatorId,
      update.resolvedAt.toISOString(),
      reportId
    );

    return result.changes > 0;
  }

  /**
   * Get report count for a specific post
   */
  getReportCountForPost(postId: number): number {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count 
      FROM forum_reports 
      WHERE post_id = ? AND status = 'pending'
    `);

    const { count } = stmt.get(postId) as { count: number };
    return count;
  }

  /**
   * Get moderation audit log
   */
  getAuditLog(options: {
    page?: number;
    limit?: number;
    targetType?: string;
    moderatorId?: number;
  }): {
    actions: ModerationActionLog[];
    total: number;
    page: number;
    limit: number;
  } {
    const { page = 1, limit = 50, targetType, moderatorId } = options;
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params: any[] = [];

    if (targetType) {
      whereClause += ' WHERE target_type = ?';
      params.push(targetType);
    }

    if (moderatorId) {
      whereClause += whereClause
        ? ' AND moderator_id = ?'
        : ' WHERE moderator_id = ?';
      params.push(moderatorId);
    }

    // Count total actions
    const countStmt = this.db.prepare(`
      SELECT COUNT(*) as count 
      FROM moderation_actions${whereClause}
    `);
    const { count: total } = countStmt.get(...params) as { count: number };

    // Get actions with pagination
    const stmt = this.db.prepare(`
      SELECT 
        ma.id,
        ma.action,
        ma.target_type as targetType,
        ma.target_id as targetId,
        ma.moderator_id as moderatorId,
        ma.reason,
        ma.duration,
        ma.metadata,
        ma.created_at as createdAt,
        u.username as moderatorUsername
      FROM moderation_actions ma
      LEFT JOIN users u ON ma.moderator_id = u.id
      ${whereClause}
      ORDER BY ma.created_at DESC
      LIMIT ? OFFSET ?
    `);

    const rows = stmt.all(...params, limit, offset) as any[];
    const actions = rows.map(row => ({
      ...row,
      createdAt: new Date(row.createdAt),
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
    }));

    return { actions, total, page, limit };
  }

  /**
   * Get keyword filters
   */
  getKeywordFilters(): KeywordFilter[] {
    const stmt = this.db.prepare(`
      SELECT 
        id,
        keywords,
        action,
        severity,
        is_active as isActive,
        created_by as createdBy,
        created_at as createdAt,
        updated_at as updatedAt
      FROM keyword_filters
      ORDER BY severity DESC, created_at DESC
    `);

    const rows = stmt.all() as any[];
    return rows.map(row => ({
      ...row,
      keywords: JSON.parse(row.keywords),
      isActive: Boolean(row.isActive),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    }));
  }

  /**
   * Update keyword filters
   */
  async updateKeywordFilters(
    filter: Omit<KeywordFilter, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<number> {
    const stmt = this.db.prepare(`
      INSERT INTO keyword_filters (
        keywords, action, severity, is_active, created_by
      ) VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      JSON.stringify(filter.keywords),
      filter.action,
      filter.severity,
      filter.isActive ? 1 : 0,
      filter.createdBy
    );

    return result.lastInsertRowid as number;
  }

  /**
   * Delete keyword filter
   */
  async deleteKeywordFilter(id: number): Promise<boolean> {
    const stmt = this.db.prepare('DELETE FROM keyword_filters WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Toggle keyword filter active status
   */
  async toggleKeywordFilter(id: number, isActive: boolean): Promise<boolean> {
    const stmt = this.db.prepare(`
      UPDATE keyword_filters 
      SET is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(isActive ? 1 : 0, id);
    return result.changes > 0;
  }
}
