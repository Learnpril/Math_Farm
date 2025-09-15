import { UserManagementRepository } from '../database/user-management-repository';
import { ModerationRepository } from '../database/moderation-repository';

export interface UserBan {
  id?: number;
  userId: number;
  moderatorId: number;
  reason: string;
  duration?: number; // in hours, null for permanent
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
  duration?: number; // in hours
  metadata?: any; // Additional restriction parameters
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

export interface SpamDetectionResult {
  isSpam: boolean;
  confidence: number;
  reasons: string[];
  suggestedAction: 'none' | 'warn' | 'restrict' | 'ban';
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

/**
 * Service for user management and safety features
 * Handles banning, restrictions, warnings, spam detection, and appeals
 */
export class UserManagementService {
  private userRepo: UserManagementRepository;
  private moderationRepo: ModerationRepository;

  constructor() {
    this.userRepo = new UserManagementRepository();
    this.moderationRepo = new ModerationRepository();
  }

  /**
   * Ban a user with optional duration
   */
  async banUser(
    ban: Omit<UserBan, 'id' | 'createdAt' | 'expiresAt'>
  ): Promise<UserBan> {
    try {
      // Check if user is already banned
      const existingBan = await this.userRepo.getActiveBan(ban.userId);
      if (existingBan) {
        throw new Error('User is already banned');
      }

      // Calculate expiration date if duration is provided
      const expiresAt = ban.duration
        ? new Date(Date.now() + ban.duration * 60 * 60 * 1000)
        : undefined;

      const newBan = await this.userRepo.createBan({
        ...ban,
        expiresAt,
      });

      // Log the ban action
      await this.moderationRepo.logModerationAction({
        action: 'ban_user',
        targetType: 'user',
        targetId: ban.userId,
        moderatorId: ban.moderatorId,
        reason: ban.reason,
        duration: ban.duration,
        metadata: { banId: newBan.id, permanent: !ban.duration },
      });

      return newBan;
    } catch (error) {
      console.error('Failed to ban user:', error);
      throw error;
    }
  }

  /**
   * Unban a user
   */
  async unbanUser(
    userId: number,
    moderatorId: number,
    reason: string
  ): Promise<boolean> {
    try {
      const activeBan = await this.userRepo.getActiveBan(userId);
      if (!activeBan) {
        throw new Error('User is not currently banned');
      }

      const success = await this.userRepo.deactivateBan(activeBan.id!);

      if (success) {
        // Log the unban action
        await this.moderationRepo.logModerationAction({
          action: 'unban_user',
          targetType: 'user',
          targetId: userId,
          moderatorId,
          reason,
          metadata: { originalBanId: activeBan.id },
        });
      }

      return success;
    } catch (error) {
      console.error('Failed to unban user:', error);
      throw error;
    }
  }

  /**
   * Add restriction to a user
   */
  async restrictUser(
    restriction: Omit<UserRestriction, 'id' | 'createdAt' | 'expiresAt'>
  ): Promise<UserRestriction> {
    try {
      // Calculate expiration date if duration is provided
      const expiresAt = restriction.duration
        ? new Date(Date.now() + restriction.duration * 60 * 60 * 1000)
        : undefined;

      const newRestriction = await this.userRepo.createRestriction({
        ...restriction,
        expiresAt,
      });

      // Log the restriction action
      await this.moderationRepo.logModerationAction({
        action: 'restrict_user',
        targetType: 'user',
        targetId: restriction.userId,
        moderatorId: restriction.moderatorId,
        reason: restriction.reason,
        duration: restriction.duration,
        metadata: {
          restrictionId: newRestriction.id,
          restrictionType: restriction.type,
          metadata: restriction.metadata,
        },
      });

      return newRestriction;
    } catch (error) {
      console.error('Failed to restrict user:', error);
      throw error;
    }
  }

  /**
   * Remove restriction from a user
   */
  async removeRestriction(
    restrictionId: number,
    moderatorId: number,
    reason: string
  ): Promise<boolean> {
    try {
      const restriction = await this.userRepo.getRestrictionById(restrictionId);
      if (!restriction) {
        throw new Error('Restriction not found');
      }

      const success = await this.userRepo.deactivateRestriction(restrictionId);

      if (success) {
        // Log the removal action
        await this.moderationRepo.logModerationAction({
          action: 'remove_restriction',
          targetType: 'user',
          targetId: restriction.userId,
          moderatorId,
          reason,
          metadata: { originalRestrictionId: restrictionId },
        });
      }

      return success;
    } catch (error) {
      console.error('Failed to remove restriction:', error);
      throw error;
    }
  }

  /**
   * Issue warning to a user
   */
  async warnUser(
    warning: Omit<UserWarning, 'id' | 'createdAt'>
  ): Promise<UserWarning> {
    try {
      const newWarning = await this.userRepo.createWarning(warning);

      // Log the warning action
      await this.moderationRepo.logModerationAction({
        action: 'warn_user',
        targetType: 'user',
        targetId: warning.userId,
        moderatorId: warning.moderatorId,
        reason: warning.reason,
        metadata: {
          warningId: newWarning.id,
          severity: warning.severity,
        },
      });

      // Check if user has too many warnings and suggest escalation
      const warningCount = await this.userRepo.getActiveWarningCount(
        warning.userId
      );
      if (warningCount >= 3) {
        console.warn(
          `User ${warning.userId} has ${warningCount} active warnings - consider restrictions`
        );
      }

      return newWarning;
    } catch (error) {
      console.error('Failed to warn user:', error);
      throw error;
    }
  }

  /**
   * Detect spam behavior patterns
   */
  async detectSpam(
    userId: number,
    content?: string
  ): Promise<SpamDetectionResult> {
    try {
      const result: SpamDetectionResult = {
        isSpam: false,
        confidence: 0,
        reasons: [],
        suggestedAction: 'none',
      };

      // Get user's recent activity
      const recentActivity = await this.userRepo.getUserRecentActivity(
        userId,
        24
      ); // Last 24 hours

      // Check posting frequency
      if (recentActivity.postCount > 50) {
        result.reasons.push('Excessive posting frequency');
        result.confidence += 0.3;
      }

      // Check for repeated content
      if (recentActivity.duplicateContentCount > 5) {
        result.reasons.push('Repeated content detected');
        result.confidence += 0.4;
      }

      // Check for link spam
      if (recentActivity.linkCount > 10) {
        result.reasons.push('Excessive link posting');
        result.confidence += 0.3;
      }

      // Check content if provided
      if (content) {
        const contentSpamScore = this.analyzeContentForSpam(content);
        result.confidence += contentSpamScore;
        if (contentSpamScore > 0.2) {
          result.reasons.push('Content matches spam patterns');
        }
      }

      // Check user account age and activity ratio
      const userStats = await this.userRepo.getUserStats(userId);
      if (userStats.accountAgeHours < 24 && recentActivity.postCount > 10) {
        result.reasons.push('New account with high activity');
        result.confidence += 0.2;
      }

      // Determine if it's spam and suggest action
      if (result.confidence > 0.7) {
        result.isSpam = true;
        result.suggestedAction = 'ban';
      } else if (result.confidence > 0.5) {
        result.isSpam = true;
        result.suggestedAction = 'restrict';
      } else if (result.confidence > 0.3) {
        result.isSpam = true;
        result.suggestedAction = 'warn';
      }

      return result;
    } catch (error) {
      console.error('Spam detection failed:', error);
      // Return safe default
      return {
        isSpam: false,
        confidence: 0,
        reasons: [],
        suggestedAction: 'none',
      };
    }
  }

  /**
   * Submit appeal for moderation action
   */
  async submitAppeal(
    appeal: Omit<UserAppeal, 'id' | 'createdAt' | 'status'>
  ): Promise<UserAppeal> {
    try {
      // Check if there's already a pending appeal for this action
      const existingAppeal = await this.userRepo.findExistingAppeal(
        appeal.userId,
        appeal.actionType,
        appeal.actionId
      );

      if (existingAppeal && existingAppeal.status === 'pending') {
        throw new Error('An appeal for this action is already pending');
      }

      const newAppeal = await this.userRepo.createAppeal({
        ...appeal,
        status: 'pending',
      });

      // Log the appeal submission
      await this.moderationRepo.logModerationAction({
        action: 'submit_appeal',
        targetType: 'user',
        targetId: appeal.userId,
        moderatorId: 0, // System action
        reason: `Appeal submitted for ${appeal.actionType}`,
        metadata: {
          appealId: newAppeal.id,
          originalActionId: appeal.actionId,
        },
      });

      return newAppeal;
    } catch (error) {
      console.error('Failed to submit appeal:', error);
      throw error;
    }
  }

  /**
   * Process appeal (approve or deny)
   */
  async processAppeal(
    appealId: number,
    moderatorId: number,
    decision: 'approved' | 'denied',
    response: string
  ): Promise<UserAppeal> {
    try {
      const appeal = await this.userRepo.getAppealById(appealId);
      if (!appeal) {
        throw new Error('Appeal not found');
      }

      if (appeal.status !== 'pending') {
        throw new Error('Appeal has already been processed');
      }

      const updatedAppeal = await this.userRepo.updateAppeal(appealId, {
        status: decision,
        moderatorId,
        moderatorResponse: response,
        resolvedAt: new Date(),
      });

      // If appeal is approved, reverse the original action
      if (decision === 'approved') {
        await this.reverseAction(appeal);
      }

      // Log the appeal decision
      await this.moderationRepo.logModerationAction({
        action: `appeal_${decision}`,
        targetType: 'user',
        targetId: appeal.userId,
        moderatorId,
        reason: `Appeal ${decision}: ${response}`,
        metadata: {
          appealId,
          originalActionType: appeal.actionType,
          originalActionId: appeal.actionId,
        },
      });

      return updatedAppeal;
    } catch (error) {
      console.error('Failed to process appeal:', error);
      throw error;
    }
  }

  /**
   * Get user's moderation history
   */
  async getUserModerationHistory(userId: number): Promise<{
    bans: UserBan[];
    restrictions: UserRestriction[];
    warnings: UserWarning[];
    appeals: UserAppeal[];
  }> {
    try {
      const [bans, restrictions, warnings, appeals] = await Promise.all([
        this.userRepo.getUserBans(userId),
        this.userRepo.getUserRestrictions(userId),
        this.userRepo.getUserWarnings(userId),
        this.userRepo.getUserAppeals(userId),
      ]);

      return { bans, restrictions, warnings, appeals };
    } catch (error) {
      console.error('Failed to get user moderation history:', error);
      throw error;
    }
  }

  /**
   * Check if user can perform action based on restrictions
   */
  async canUserPerformAction(
    userId: number,
    action: string
  ): Promise<{
    allowed: boolean;
    reason?: string;
    restriction?: UserRestriction;
  }> {
    try {
      // Check if user is banned
      const activeBan = await this.userRepo.getActiveBan(userId);
      if (activeBan) {
        return {
          allowed: false,
          reason: `User is banned: ${activeBan.reason}`,
        };
      }

      // Check for relevant restrictions
      const restrictions = await this.userRepo.getActiveRestrictions(userId);

      for (const restriction of restrictions) {
        if (this.doesRestrictionApply(restriction, action)) {
          return {
            allowed: false,
            reason: `Action restricted: ${restriction.reason}`,
            restriction,
          };
        }
      }

      return { allowed: true };
    } catch (error) {
      console.error('Failed to check user permissions:', error);
      // Fail safe - allow action if check fails
      return { allowed: true };
    }
  }

  // Private helper methods

  private analyzeContentForSpam(content: string): number {
    let spamScore = 0;

    // Check for excessive caps
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (capsRatio > 0.5) spamScore += 0.2;

    // Check for excessive punctuation
    const punctuationRatio = (content.match(/[!?]{2,}/g) || []).length;
    if (punctuationRatio > 2) spamScore += 0.1;

    // Check for promotional keywords
    const promoKeywords = [
      'buy now',
      'click here',
      'limited time',
      'act fast',
      'free money',
    ];
    const foundPromo = promoKeywords.filter(keyword =>
      content.toLowerCase().includes(keyword)
    ).length;
    spamScore += foundPromo * 0.1;

    // Check for excessive links
    const linkCount = (content.match(/https?:\/\/[^\s]+/g) || []).length;
    if (linkCount > 3) spamScore += 0.2;

    return Math.min(spamScore, 1); // Cap at 1.0
  }

  private async reverseAction(appeal: UserAppeal): Promise<void> {
    switch (appeal.actionType) {
      case 'ban':
        await this.userRepo.deactivateBan(appeal.actionId);
        break;
      case 'restriction':
        await this.userRepo.deactivateRestriction(appeal.actionId);
        break;
      case 'warning':
        await this.userRepo.deactivateWarning(appeal.actionId);
        break;
    }
  }

  private doesRestrictionApply(
    restriction: UserRestriction,
    action: string
  ): boolean {
    switch (restriction.type) {
      case 'post_limit':
        return action === 'create_post';
      case 'thread_limit':
        return action === 'create_thread';
      case 'no_images':
        return action === 'upload_image';
      case 'no_links':
        return action === 'post_link';
      case 'shadow_ban':
        return ['create_post', 'create_thread', 'reply'].includes(action);
      default:
        return false;
    }
  }
}
