import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UserManagementService } from '../user-management-service';
import { UserManagementRepository } from '../../database/user-management-repository';
import { ModerationRepository } from '../../database/moderation-repository';

// Mock the repositories
vi.mock('../../database/user-management-repository');
vi.mock('../../database/moderation-repository');

describe('UserManagementService', () => {
  let userManagementService: UserManagementService;
  let mockUserRepo: any;
  let mockModerationRepo: any;

  beforeEach(() => {
    mockUserRepo = {
      getActiveBan: vi.fn(),
      createBan: vi.fn(),
      deactivateBan: vi.fn(),
      createRestriction: vi.fn(),
      getRestrictionById: vi.fn(),
      deactivateRestriction: vi.fn(),
      getActiveRestrictions: vi.fn(),
      createWarning: vi.fn(),
      getActiveWarningCount: vi.fn(),
      createAppeal: vi.fn(),
      findExistingAppeal: vi.fn(),
      getAppealById: vi.fn(),
      updateAppeal: vi.fn(),
      getUserBans: vi.fn(),
      getUserRestrictions: vi.fn(),
      getUserWarnings: vi.fn(),
      getUserAppeals: vi.fn(),
      getUserRecentActivity: vi.fn(),
      getUserStats: vi.fn(),
    };

    mockModerationRepo = {
      logModerationAction: vi.fn(),
    };

    // Mock the constructors
    (UserManagementRepository as any).mockImplementation(() => mockUserRepo);
    (ModerationRepository as any).mockImplementation(() => mockModerationRepo);

    userManagementService = new UserManagementService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('banUser', () => {
    it('should ban user successfully', async () => {
      const mockBan = {
        id: 1,
        userId: 123,
        moderatorId: 456,
        reason: 'Spam posting',
        duration: 24,
        isActive: true,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      mockUserRepo.getActiveBan.mockResolvedValue(null);
      mockUserRepo.createBan.mockResolvedValue(mockBan);
      mockModerationRepo.logModerationAction.mockResolvedValue(1);

      const banData = {
        userId: 123,
        moderatorId: 456,
        reason: 'Spam posting',
        duration: 24,
        isActive: true,
      };

      const result = await userManagementService.banUser(banData);

      expect(mockUserRepo.getActiveBan).toHaveBeenCalledWith(123);
      expect(mockUserRepo.createBan).toHaveBeenCalledWith({
        ...banData,
        expiresAt: expect.any(Date),
      });
      expect(mockModerationRepo.logModerationAction).toHaveBeenCalledWith({
        action: 'ban_user',
        targetType: 'user',
        targetId: 123,
        moderatorId: 456,
        reason: 'Spam posting',
        duration: 24,
        metadata: { banId: 1, permanent: false },
      });
      expect(result).toEqual(mockBan);
    });

    it('should throw error if user is already banned', async () => {
      const existingBan = { id: 1, userId: 123, isActive: true };
      mockUserRepo.getActiveBan.mockResolvedValue(existingBan);

      const banData = {
        userId: 123,
        moderatorId: 456,
        reason: 'Test reason',
        isActive: true,
      };

      await expect(userManagementService.banUser(banData)).rejects.toThrow(
        'User is already banned'
      );
    });

    it('should create permanent ban when no duration specified', async () => {
      const mockBan = { id: 1, userId: 123, isActive: true };
      mockUserRepo.getActiveBan.mockResolvedValue(null);
      mockUserRepo.createBan.mockResolvedValue(mockBan);
      mockModerationRepo.logModerationAction.mockResolvedValue(1);

      const banData = {
        userId: 123,
        moderatorId: 456,
        reason: 'Permanent ban',
        isActive: true,
      };

      await userManagementService.banUser(banData);

      expect(mockUserRepo.createBan).toHaveBeenCalledWith({
        ...banData,
        expiresAt: undefined,
      });
      expect(mockModerationRepo.logModerationAction).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: { banId: 1, permanent: true },
        })
      );
    });
  });

  describe('unbanUser', () => {
    it('should unban user successfully', async () => {
      const activeBan = { id: 1, userId: 123, isActive: true };
      mockUserRepo.getActiveBan.mockResolvedValue(activeBan);
      mockUserRepo.deactivateBan.mockResolvedValue(true);
      mockModerationRepo.logModerationAction.mockResolvedValue(1);

      const result = await userManagementService.unbanUser(
        123,
        456,
        'Appeal approved'
      );

      expect(mockUserRepo.getActiveBan).toHaveBeenCalledWith(123);
      expect(mockUserRepo.deactivateBan).toHaveBeenCalledWith(1);
      expect(mockModerationRepo.logModerationAction).toHaveBeenCalledWith({
        action: 'unban_user',
        targetType: 'user',
        targetId: 123,
        moderatorId: 456,
        reason: 'Appeal approved',
        metadata: { originalBanId: 1 },
      });
      expect(result).toBe(true);
    });

    it('should throw error if user is not banned', async () => {
      mockUserRepo.getActiveBan.mockResolvedValue(null);

      await expect(
        userManagementService.unbanUser(123, 456, 'Test')
      ).rejects.toThrow('User is not currently banned');
    });
  });

  describe('restrictUser', () => {
    it('should restrict user successfully', async () => {
      const mockRestriction = {
        id: 1,
        userId: 123,
        moderatorId: 456,
        type: 'post_limit',
        reason: 'Excessive posting',
        duration: 48,
        isActive: true,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      };

      mockUserRepo.createRestriction.mockResolvedValue(mockRestriction);
      mockModerationRepo.logModerationAction.mockResolvedValue(1);

      const restrictionData = {
        userId: 123,
        moderatorId: 456,
        type: 'post_limit' as const,
        reason: 'Excessive posting',
        duration: 48,
        isActive: true,
      };

      const result = await userManagementService.restrictUser(restrictionData);

      expect(mockUserRepo.createRestriction).toHaveBeenCalledWith({
        ...restrictionData,
        expiresAt: expect.any(Date),
      });
      expect(mockModerationRepo.logModerationAction).toHaveBeenCalledWith({
        action: 'restrict_user',
        targetType: 'user',
        targetId: 123,
        moderatorId: 456,
        reason: 'Excessive posting',
        duration: 48,
        metadata: {
          restrictionId: 1,
          restrictionType: 'post_limit',
          metadata: undefined,
        },
      });
      expect(result).toEqual(mockRestriction);
    });
  });

  describe('warnUser', () => {
    it('should warn user successfully', async () => {
      const mockWarning = {
        id: 1,
        userId: 123,
        moderatorId: 456,
        reason: 'Inappropriate language',
        severity: 'medium' as const,
        isActive: true,
        createdAt: new Date(),
      };

      mockUserRepo.createWarning.mockResolvedValue(mockWarning);
      mockUserRepo.getActiveWarningCount.mockResolvedValue(1);
      mockModerationRepo.logModerationAction.mockResolvedValue(1);

      const warningData = {
        userId: 123,
        moderatorId: 456,
        reason: 'Inappropriate language',
        severity: 'medium' as const,
        isActive: true,
      };

      const result = await userManagementService.warnUser(warningData);

      expect(mockUserRepo.createWarning).toHaveBeenCalledWith(warningData);
      expect(mockUserRepo.getActiveWarningCount).toHaveBeenCalledWith(123);
      expect(mockModerationRepo.logModerationAction).toHaveBeenCalledWith({
        action: 'warn_user',
        targetType: 'user',
        targetId: 123,
        moderatorId: 456,
        reason: 'Inappropriate language',
        metadata: {
          warningId: 1,
          severity: 'medium',
        },
      });
      expect(result).toEqual(mockWarning);
    });

    it('should log warning when user has too many warnings', async () => {
      const mockWarning = { id: 1, userId: 123 };
      mockUserRepo.createWarning.mockResolvedValue(mockWarning);
      mockUserRepo.getActiveWarningCount.mockResolvedValue(3);
      mockModerationRepo.logModerationAction.mockResolvedValue(1);

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await userManagementService.warnUser({
        userId: 123,
        moderatorId: 456,
        reason: 'Test',
        severity: 'low',
        isActive: true,
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'User 123 has 3 active warnings - consider restrictions'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('detectSpam', () => {
    it('should detect spam based on activity patterns', async () => {
      const recentActivity = {
        postCount: 60, // Excessive
        threadCount: 5,
        linkCount: 15, // Excessive
        duplicateContentCount: 8, // Excessive
      };

      const userStats = {
        accountAgeHours: 2, // New account
        totalPosts: 60,
        totalThreads: 5,
        warningCount: 0,
        banCount: 0,
      };

      mockUserRepo.getUserRecentActivity.mockResolvedValue(recentActivity);
      mockUserRepo.getUserStats.mockResolvedValue(userStats);

      const result = await userManagementService.detectSpam(
        123,
        'BUY NOW! CLICK HERE!'
      );

      expect(result.isSpam).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.suggestedAction).toBe('ban');
      expect(result.reasons).toContain('Excessive posting frequency');
      expect(result.reasons).toContain('Repeated content detected');
      expect(result.reasons).toContain('Excessive link posting');
      expect(result.reasons).toContain('Content matches spam patterns');
      expect(result.reasons).toContain('New account with high activity');
    });

    it('should return clean result for normal activity', async () => {
      const recentActivity = {
        postCount: 5,
        threadCount: 1,
        linkCount: 1,
        duplicateContentCount: 0,
      };

      const userStats = {
        accountAgeHours: 720, // 30 days
        totalPosts: 50,
        totalThreads: 10,
        warningCount: 0,
        banCount: 0,
      };

      mockUserRepo.getUserRecentActivity.mockResolvedValue(recentActivity);
      mockUserRepo.getUserStats.mockResolvedValue(userStats);

      const result = await userManagementService.detectSpam(
        123,
        'This is a normal math question'
      );

      expect(result.isSpam).toBe(false);
      expect(result.confidence).toBeLessThan(0.3);
      expect(result.suggestedAction).toBe('none');
      expect(result.reasons).toHaveLength(0);
    });

    it('should handle errors gracefully', async () => {
      mockUserRepo.getUserRecentActivity.mockRejectedValue(
        new Error('Database error')
      );

      const result = await userManagementService.detectSpam(123);

      expect(result.isSpam).toBe(false);
      expect(result.confidence).toBe(0);
      expect(result.suggestedAction).toBe('none');
      expect(result.reasons).toHaveLength(0);
    });
  });

  describe('submitAppeal', () => {
    it('should submit appeal successfully', async () => {
      const mockAppeal = {
        id: 1,
        userId: 123,
        actionType: 'ban' as const,
        actionId: 456,
        reason: 'I was wrongly banned',
        status: 'pending' as const,
        createdAt: new Date(),
      };

      mockUserRepo.findExistingAppeal.mockResolvedValue(null);
      mockUserRepo.createAppeal.mockResolvedValue(mockAppeal);
      mockModerationRepo.logModerationAction.mockResolvedValue(1);

      const appealData = {
        userId: 123,
        actionType: 'ban' as const,
        actionId: 456,
        reason: 'I was wrongly banned',
      };

      const result = await userManagementService.submitAppeal(appealData);

      expect(mockUserRepo.findExistingAppeal).toHaveBeenCalledWith(
        123,
        'ban',
        456
      );
      expect(mockUserRepo.createAppeal).toHaveBeenCalledWith({
        ...appealData,
        status: 'pending',
      });
      expect(mockModerationRepo.logModerationAction).toHaveBeenCalledWith({
        action: 'submit_appeal',
        targetType: 'user',
        targetId: 123,
        moderatorId: 0,
        reason: 'Appeal submitted for ban',
        metadata: {
          appealId: 1,
          originalActionId: 456,
        },
      });
      expect(result).toEqual(mockAppeal);
    });

    it('should throw error if appeal already exists', async () => {
      const existingAppeal = { id: 1, status: 'pending' };
      mockUserRepo.findExistingAppeal.mockResolvedValue(existingAppeal);

      const appealData = {
        userId: 123,
        actionType: 'ban' as const,
        actionId: 456,
        reason: 'Test appeal',
      };

      await expect(
        userManagementService.submitAppeal(appealData)
      ).rejects.toThrow('An appeal for this action is already pending');
    });
  });

  describe('processAppeal', () => {
    it('should approve appeal and reverse action', async () => {
      const mockAppeal = {
        id: 1,
        userId: 123,
        actionType: 'ban' as const,
        actionId: 456,
        status: 'pending' as const,
      };

      const updatedAppeal = {
        ...mockAppeal,
        status: 'approved' as const,
        moderatorId: 789,
        moderatorResponse: 'Appeal approved',
        resolvedAt: new Date(),
      };

      mockUserRepo.getAppealById.mockResolvedValue(mockAppeal);
      mockUserRepo.updateAppeal.mockResolvedValue(updatedAppeal);
      mockUserRepo.deactivateBan.mockResolvedValue(true);
      mockModerationRepo.logModerationAction.mockResolvedValue(1);

      const result = await userManagementService.processAppeal(
        1,
        789,
        'approved',
        'Appeal approved'
      );

      expect(mockUserRepo.getAppealById).toHaveBeenCalledWith(1);
      expect(mockUserRepo.updateAppeal).toHaveBeenCalledWith(1, {
        status: 'approved',
        moderatorId: 789,
        moderatorResponse: 'Appeal approved',
        resolvedAt: expect.any(Date),
      });
      expect(mockUserRepo.deactivateBan).toHaveBeenCalledWith(456);
      expect(mockModerationRepo.logModerationAction).toHaveBeenCalledWith({
        action: 'appeal_approved',
        targetType: 'user',
        targetId: 123,
        moderatorId: 789,
        reason: 'Appeal approved: Appeal approved',
        metadata: {
          appealId: 1,
          originalActionType: 'ban',
          originalActionId: 456,
        },
      });
      expect(result).toEqual(updatedAppeal);
    });

    it('should deny appeal without reversing action', async () => {
      const mockAppeal = {
        id: 1,
        userId: 123,
        actionType: 'ban' as const,
        actionId: 456,
        status: 'pending' as const,
      };

      const updatedAppeal = {
        ...mockAppeal,
        status: 'denied' as const,
        moderatorId: 789,
        moderatorResponse: 'Appeal denied',
        resolvedAt: new Date(),
      };

      mockUserRepo.getAppealById.mockResolvedValue(mockAppeal);
      mockUserRepo.updateAppeal.mockResolvedValue(updatedAppeal);
      mockModerationRepo.logModerationAction.mockResolvedValue(1);

      const result = await userManagementService.processAppeal(
        1,
        789,
        'denied',
        'Appeal denied'
      );

      expect(mockUserRepo.deactivateBan).not.toHaveBeenCalled();
      expect(result).toEqual(updatedAppeal);
    });

    it('should throw error if appeal not found', async () => {
      mockUserRepo.getAppealById.mockResolvedValue(null);

      await expect(
        userManagementService.processAppeal(999, 789, 'approved', 'Test')
      ).rejects.toThrow('Appeal not found');
    });

    it('should throw error if appeal already processed', async () => {
      const processedAppeal = { id: 1, status: 'approved' };
      mockUserRepo.getAppealById.mockResolvedValue(processedAppeal);

      await expect(
        userManagementService.processAppeal(1, 789, 'denied', 'Test')
      ).rejects.toThrow('Appeal has already been processed');
    });
  });

  describe('canUserPerformAction', () => {
    it('should deny action for banned user', async () => {
      const activeBan = { id: 1, reason: 'Spam posting' };
      mockUserRepo.getActiveBan.mockResolvedValue(activeBan);

      const result = await userManagementService.canUserPerformAction(
        123,
        'create_post'
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('User is banned: Spam posting');
    });

    it('should deny action for restricted user', async () => {
      const restrictions = [
        {
          id: 1,
          type: 'post_limit',
          reason: 'Excessive posting',
        },
      ];

      mockUserRepo.getActiveBan.mockResolvedValue(null);
      mockUserRepo.getActiveRestrictions.mockResolvedValue(restrictions);

      const result = await userManagementService.canUserPerformAction(
        123,
        'create_post'
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Action restricted: Excessive posting');
      expect(result.restriction).toEqual(restrictions[0]);
    });

    it('should allow action for unrestricted user', async () => {
      mockUserRepo.getActiveBan.mockResolvedValue(null);
      mockUserRepo.getActiveRestrictions.mockResolvedValue([]);

      const result = await userManagementService.canUserPerformAction(
        123,
        'create_post'
      );

      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should handle errors gracefully', async () => {
      mockUserRepo.getActiveBan.mockRejectedValue(new Error('Database error'));

      const result = await userManagementService.canUserPerformAction(
        123,
        'create_post'
      );

      expect(result.allowed).toBe(true); // Fail safe
    });
  });

  describe('getUserModerationHistory', () => {
    it('should return complete user history', async () => {
      const mockBans = [{ id: 1, reason: 'Spam' }];
      const mockRestrictions = [{ id: 1, type: 'post_limit' }];
      const mockWarnings = [{ id: 1, severity: 'medium' }];
      const mockAppeals = [{ id: 1, status: 'pending' }];

      mockUserRepo.getUserBans.mockResolvedValue(mockBans);
      mockUserRepo.getUserRestrictions.mockResolvedValue(mockRestrictions);
      mockUserRepo.getUserWarnings.mockResolvedValue(mockWarnings);
      mockUserRepo.getUserAppeals.mockResolvedValue(mockAppeals);

      const result = await userManagementService.getUserModerationHistory(123);

      expect(result).toEqual({
        bans: mockBans,
        restrictions: mockRestrictions,
        warnings: mockWarnings,
        appeals: mockAppeals,
      });
    });
  });
});
