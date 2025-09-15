import { ModerationRepository } from '../database/moderation-repository';
import { ForumRepository } from '../database/forum-repository';

export interface ModerationAction {
  type:
    | 'delete'
    | 'hide'
    | 'lock'
    | 'unlock'
    | 'pin'
    | 'unpin'
    | 'warn'
    | 'ban';
  reason: string;
  targetId: number;
  targetType: 'post' | 'thread' | 'user';
  moderatorId: number;
  duration?: number; // in hours
}

export interface ReportSubmission {
  postId: number;
  reporterId: number;
  reason: string;
  category:
    | 'spam'
    | 'harassment'
    | 'inappropriate_content'
    | 'misinformation'
    | 'copyright'
    | 'other';
  details?: string;
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

export interface ContentModerationResult {
  flagged: boolean;
  action: 'none' | 'flag' | 'hide' | 'delete';
  matchedFilters: string[];
  severity: 'low' | 'medium' | 'high' | null;
}

/**
 * Service for handling moderation actions, reports, and content filtering
 * Provides comprehensive moderation capabilities with audit logging
 */
export class ModerationService {
  private moderationRepo: ModerationRepository;
  private forumRepo: ForumRepository;

  constructor() {
    this.moderationRepo = new ModerationRepository();
    this.forumRepo = new ForumRepository();
  }

  /**
   * Perform moderation action on content or users
   */
  async performAction(action: ModerationAction): Promise<any> {
    try {
      // Validate target exists
      await this.validateTarget(action.targetType, action.targetId);

      // Perform the specific action
      let result;
      switch (action.type) {
        case 'delete':
          result = await this.handleDeleteAction(action);
          break;
        case 'hide':
          result = await this.handleHideAction(action);
          break;
        case 'lock':
        case 'unlock':
          result = await this.handleLockAction(action);
          break;
        case 'pin':
        case 'unpin':
          result = await this.handlePinAction(action);
          break;
        case 'warn':
          result = await this.handleWarnAction(action);
          break;
        case 'ban':
          result = await this.handleBanAction(action);
          break;
        default:
          throw new Error(`Unsupported moderation action: ${action.type}`);
      }

      // Log the action for audit trail
      await this.moderationRepo.logModerationAction({
        action: action.type,
        targetType: action.targetType,
        targetId: action.targetId,
        moderatorId: action.moderatorId,
        reason: action.reason,
        duration: action.duration,
        metadata: result,
      });

      return result;
    } catch (error) {
      console.error('Moderation action failed:', error);
      throw error;
    }
  }

  /**
   * Submit content report
   */
  async submitReport(report: ReportSubmission): Promise<any> {
    try {
      // Check if post exists
      const post = await this.forumRepo.getPostById(report.postId);
      if (!post) {
        throw new Error('Post not found');
      }

      // Check for duplicate reports from same user
      const existingReport = await this.moderationRepo.findExistingReport(
        report.postId,
        report.reporterId
      );

      if (existingReport) {
        throw new Error('You have already reported this post');
      }

      // Create the report
      const newReport = await this.moderationRepo.createReport({
        postId: report.postId,
        reporterId: report.reporterId,
        reason: report.reason,
        category: report.category,
        details: report.details,
        status: 'pending',
      });

      // Auto-moderate based on report category and history
      await this.checkAutoModeration(report.postId, report.category);

      return newReport;
    } catch (error) {
      console.error('Report submission failed:', error);
      throw error;
    }
  }

  /**
   * Resolve a content report
   */
  async resolveReport(
    reportId: number,
    action: 'resolved' | 'dismissed',
    moderatorId: number
  ): Promise<any> {
    try {
      const report = await this.moderationRepo.getReportById(reportId);
      if (!report) {
        throw new Error('Report not found');
      }

      if (report.status !== 'pending') {
        throw new Error('Report has already been resolved');
      }

      const result = await this.moderationRepo.updateReportStatus(reportId, {
        status: action,
        moderatorId,
        resolvedAt: new Date(),
      });

      // Log the resolution
      await this.moderationRepo.logModerationAction({
        action: `report_${action}`,
        targetType: 'report',
        targetId: reportId,
        moderatorId,
        reason: `Report ${action}`,
        metadata: { originalReport: report },
      });

      return result;
    } catch (error) {
      console.error('Report resolution failed:', error);
      throw error;
    }
  }

  /**
   * Get reports for moderation review
   */
  async getReports(options: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    try {
      return await this.moderationRepo.getReports(options);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      throw error;
    }
  }

  /**
   * Get moderation audit log
   */
  async getAuditLog(options: {
    page?: number;
    limit?: number;
    targetType?: string;
    moderatorId?: number;
  }): Promise<any> {
    try {
      return await this.moderationRepo.getAuditLog(options);
    } catch (error) {
      console.error('Failed to fetch audit log:', error);
      throw error;
    }
  }

  /**
   * Get keyword filters
   */
  async getKeywordFilters(): Promise<KeywordFilter[]> {
    try {
      return await this.moderationRepo.getKeywordFilters();
    } catch (error) {
      console.error('Failed to fetch keyword filters:', error);
      throw error;
    }
  }

  /**
   * Update keyword filters
   */
  async updateKeywordFilters(filter: {
    keywords: string[];
    action: 'flag' | 'auto_hide' | 'auto_delete';
    severity: 'low' | 'medium' | 'high';
    moderatorId: number;
  }): Promise<any> {
    try {
      const result = await this.moderationRepo.updateKeywordFilters({
        keywords: filter.keywords,
        action: filter.action,
        severity: filter.severity,
        isActive: true,
        createdBy: filter.moderatorId,
      });

      // Log the filter update
      await this.moderationRepo.logModerationAction({
        action: 'update_filters',
        targetType: 'system',
        targetId: 0,
        moderatorId: filter.moderatorId,
        reason: 'Updated keyword filters',
        metadata: { filterUpdate: filter },
      });

      return result;
    } catch (error) {
      console.error('Failed to update keyword filters:', error);
      throw error;
    }
  }

  /**
   * Check content against moderation filters
   */
  async moderateContent(content: string): Promise<ContentModerationResult> {
    try {
      const filters = await this.getKeywordFilters();
      const activeFilters = filters.filter(f => f.isActive);

      let flagged = false;
      let action: 'none' | 'flag' | 'hide' | 'delete' = 'none';
      let matchedFilters: string[] = [];
      let severity: 'low' | 'medium' | 'high' | null = null;

      const contentLower = content.toLowerCase();

      for (const filter of activeFilters) {
        const matchedKeywords = filter.keywords.filter(keyword =>
          contentLower.includes(keyword.toLowerCase())
        );

        if (matchedKeywords.length > 0) {
          flagged = true;
          matchedFilters.push(...matchedKeywords);

          // Determine action based on highest severity match
          if (
            !severity ||
            this.compareSeverity(filter.severity, severity) > 0
          ) {
            severity = filter.severity;
            action = filter.action;
          }
        }
      }

      return {
        flagged,
        action,
        matchedFilters: [...new Set(matchedFilters)], // Remove duplicates
        severity,
      };
    } catch (error) {
      console.error('Content moderation failed:', error);
      // Return safe default on error
      return {
        flagged: false,
        action: 'none',
        matchedFilters: [],
        severity: null,
      };
    }
  }

  // Private helper methods

  private async validateTarget(
    targetType: string,
    targetId: number
  ): Promise<void> {
    switch (targetType) {
      case 'post':
        const post = await this.forumRepo.getPostById(targetId);
        if (!post) throw new Error('Post not found');
        break;
      case 'thread':
        const thread = await this.forumRepo.getThreadById(targetId);
        if (!thread) throw new Error('Thread not found');
        break;
      case 'user':
        // User validation would go here
        break;
      default:
        throw new Error(`Invalid target type: ${targetType}`);
    }
  }

  private async handleDeleteAction(action: ModerationAction): Promise<any> {
    if (action.targetType === 'post') {
      return await this.forumRepo.deletePost(action.targetId);
    } else if (action.targetType === 'thread') {
      return await this.forumRepo.deleteThread(action.targetId);
    }
    throw new Error('Delete action not supported for this target type');
  }

  private async handleHideAction(action: ModerationAction): Promise<any> {
    if (action.targetType === 'post') {
      return await this.forumRepo.updatePost(action.targetId, {
        isHidden: true,
      });
    }
    throw new Error('Hide action not supported for this target type');
  }

  private async handleLockAction(action: ModerationAction): Promise<any> {
    if (action.targetType === 'thread') {
      const isLocked = action.type === 'lock';
      return await this.forumRepo.updateThread(action.targetId, { isLocked });
    }
    throw new Error('Lock action only supported for threads');
  }

  private async handlePinAction(action: ModerationAction): Promise<any> {
    if (action.targetType === 'thread') {
      const isPinned = action.type === 'pin';
      return await this.forumRepo.updateThread(action.targetId, { isPinned });
    }
    throw new Error('Pin action only supported for threads');
  }

  private async handleWarnAction(action: ModerationAction): Promise<any> {
    // Implementation for user warnings would go here
    return { warned: true, targetId: action.targetId };
  }

  private async handleBanAction(action: ModerationAction): Promise<any> {
    // Implementation for user banning would go here
    return {
      banned: true,
      targetId: action.targetId,
      duration: action.duration,
    };
  }

  private async checkAutoModeration(
    postId: number,
    category: string
  ): Promise<void> {
    // Check if this post has multiple reports
    const reportCount = await this.moderationRepo.getReportCountForPost(postId);

    // Auto-hide posts with multiple reports
    if (reportCount >= 3) {
      await this.forumRepo.updatePost(postId, { isHidden: true });

      // Log auto-moderation action
      await this.moderationRepo.logModerationAction({
        action: 'auto_hide',
        targetType: 'post',
        targetId: postId,
        moderatorId: 0, // System action
        reason: `Auto-hidden due to ${reportCount} reports`,
        metadata: { reportCount, category },
      });
    }
  }

  private compareSeverity(
    a: 'low' | 'medium' | 'high',
    b: 'low' | 'medium' | 'high'
  ): number {
    const severityOrder = { low: 1, medium: 2, high: 3 };
    return severityOrder[a] - severityOrder[b];
  }
}
