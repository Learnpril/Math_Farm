/**
 * Avatar Inventory Management System
 * Math Farm Community Forum - Item Unlocking and Inventory Management
 */

import type {
  AvatarInventory,
  AvatarItem,
  AvatarItemRarity,
  AvatarItemCategory,
  AvatarAchievement,
} from '../types/avatar';
import {
  ALL_AVATAR_ITEMS,
  getItemById,
  getUnlockableItems,
} from '../data/avatar-items';
import {
  ALL_ACHIEVEMENTS,
  checkAchievementUnlock,
} from '../data/avatar-achievements';

// User statistics interface for inventory calculations
export interface UserForumStats {
  userId: number;
  posts: number;
  bestAnswers: number;
  helpCount: number;
  streak: number;
  calculations: number;
  eventParticipation: number;
  joinedAt: Date;
  achievements: string[];
}

// Inventory management class
export class AvatarInventoryManager {
  private inventory: AvatarInventory;
  private userStats: UserForumStats;

  constructor(inventory: AvatarInventory, userStats: UserForumStats) {
    this.inventory = inventory;
    this.userStats = userStats;
  }

  // Get all unlocked items for the user
  getUnlockedItems(): AvatarItem[] {
    return this.inventory.unlockedItems
      .map(itemId => getItemById(itemId))
      .filter((item): item is AvatarItem => item !== undefined);
  }

  // Get items by category that are unlocked
  getUnlockedItemsByCategory(category: AvatarItemCategory): AvatarItem[] {
    return this.getUnlockedItems().filter(item => item.category === category);
  }

  // Get items by rarity that are unlocked
  getUnlockedItemsByRarity(rarity: AvatarItemRarity): AvatarItem[] {
    return this.getUnlockedItems().filter(item => item.rarity === rarity);
  }

  // Check if a specific item is unlocked
  isItemUnlocked(itemId: string): boolean {
    return this.inventory.unlockedItems.includes(itemId);
  }

  // Get items that can be unlocked based on current user stats
  getAvailableToUnlock(): AvatarItem[] {
    const currentlyUnlocked = new Set(this.inventory.unlockedItems);
    return getUnlockableItems(this.userStats).filter(
      item => !currentlyUnlocked.has(item.id)
    );
  }

  // Unlock new items based on current user progress
  unlockNewItems(): string[] {
    const availableItems = this.getAvailableToUnlock();
    const newlyUnlocked: string[] = [];

    availableItems.forEach(item => {
      if (this.checkUnlockCondition(item)) {
        this.inventory.unlockedItems.push(item.id);
        newlyUnlocked.push(item.id);
      }
    });

    // Update inventory statistics
    this.updateInventoryStats();

    return newlyUnlocked;
  }

  // Check if an item's unlock condition is met
  private checkUnlockCondition(item: AvatarItem): boolean {
    const condition = item.unlockCondition;

    switch (condition.type) {
      case 'posts':
        return this.userStats.posts >= condition.threshold;
      case 'likes':
        return this.userStats.bestAnswers >= condition.threshold;
      case 'tenure':
        const daysSinceJoined = Math.floor(
          (Date.now() - this.userStats.joinedAt.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return daysSinceJoined >= condition.threshold;
      case 'achievement':
        return this.userStats.achievements.length >= condition.threshold;
      case 'math-streak':
        return this.userStats.streak >= condition.threshold;
      case 'forum-activity':
        return this.userStats.helpCount >= condition.threshold;
      default:
        return false;
    }
  }

  // Add item to favorites
  addToFavorites(itemId: string): boolean {
    if (
      this.isItemUnlocked(itemId) &&
      !this.inventory.favoriteItems.includes(itemId)
    ) {
      this.inventory.favoriteItems.push(itemId);
      return true;
    }
    return false;
  }

  // Remove item from favorites
  removeFromFavorites(itemId: string): boolean {
    const index = this.inventory.favoriteItems.indexOf(itemId);
    if (index > -1) {
      this.inventory.favoriteItems.splice(index, 1);
      return true;
    }
    return false;
  }

  // Check if item is in favorites
  isFavorite(itemId: string): boolean {
    return this.inventory.favoriteItems.includes(itemId);
  }

  // Get favorite items
  getFavoriteItems(): AvatarItem[] {
    return this.inventory.favoriteItems
      .map(itemId => getItemById(itemId))
      .filter((item): item is AvatarItem => item !== undefined);
  }

  // Update inventory statistics
  private updateInventoryStats(): void {
    const unlockedItems = this.getUnlockedItems();

    this.inventory.totalItemsUnlocked = unlockedItems.length;

    // Reset rarity progress
    this.inventory.rarityProgress = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
      'math-master': 0,
    };

    // Count items by rarity
    unlockedItems.forEach(item => {
      this.inventory.rarityProgress[item.rarity]++;
    });

    this.inventory.updatedAt = new Date();
  }

  // Get completion percentage for each category
  getCategoryCompletion(): Record<
    AvatarItemCategory,
    { unlocked: number; total: number; percentage: number }
  > {
    const categories: AvatarItemCategory[] = [
      'background',
      'body',
      'hair',
      'eyes',
      'clothing',
      'accessories',
      'math-tools',
      'expressions',
      'poses',
    ];

    const completion: Record<
      string,
      { unlocked: number; total: number; percentage: number }
    > = {};

    categories.forEach(category => {
      const totalItems = ALL_AVATAR_ITEMS.filter(
        item => item.category === category
      ).length;
      const unlockedItems = this.getUnlockedItemsByCategory(category).length;
      const percentage =
        totalItems > 0 ? Math.round((unlockedItems / totalItems) * 100) : 0;

      completion[category] = {
        unlocked: unlockedItems,
        total: totalItems,
        percentage,
      };
    });

    return completion as Record<
      AvatarItemCategory,
      { unlocked: number; total: number; percentage: number }
    >;
  }

  // Get rarity completion statistics
  getRarityCompletion(): Record<
    AvatarItemRarity,
    { unlocked: number; total: number; percentage: number }
  > {
    const rarities: AvatarItemRarity[] = [
      'common',
      'uncommon',
      'rare',
      'epic',
      'legendary',
      'math-master',
    ];
    const completion: Record<
      string,
      { unlocked: number; total: number; percentage: number }
    > = {};

    rarities.forEach(rarity => {
      const totalItems = ALL_AVATAR_ITEMS.filter(
        item => item.rarity === rarity
      ).length;
      const unlockedItems = this.getUnlockedItemsByRarity(rarity).length;
      const percentage =
        totalItems > 0 ? Math.round((unlockedItems / totalItems) * 100) : 0;

      completion[rarity] = {
        unlocked: unlockedItems,
        total: totalItems,
        percentage,
      };
    });

    return completion as Record<
      AvatarItemRarity,
      { unlocked: number; total: number; percentage: number }
    >;
  }

  // Get next items to unlock (sorted by proximity to unlock)
  getNextToUnlock(
    limit: number = 5
  ): Array<{ item: AvatarItem; progress: number }> {
    const availableItems = this.getAvailableToUnlock();

    return availableItems
      .map(item => ({
        item,
        progress: this.calculateUnlockProgress(item),
      }))
      .sort((a, b) => b.progress - a.progress)
      .slice(0, limit);
  }

  // Calculate progress towards unlocking an item (0-1)
  private calculateUnlockProgress(item: AvatarItem): number {
    const condition = item.unlockCondition;

    switch (condition.type) {
      case 'posts':
        return Math.min(this.userStats.posts / condition.threshold, 1);
      case 'likes':
        return Math.min(this.userStats.bestAnswers / condition.threshold, 1);
      case 'tenure':
        const daysSinceJoined = Math.floor(
          (Date.now() - this.userStats.joinedAt.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return Math.min(daysSinceJoined / condition.threshold, 1);
      case 'achievement':
        return Math.min(
          this.userStats.achievements.length / condition.threshold,
          1
        );
      case 'math-streak':
        return Math.min(this.userStats.streak / condition.threshold, 1);
      case 'forum-activity':
        return Math.min(this.userStats.helpCount / condition.threshold, 1);
      default:
        return 0;
    }
  }

  // Check for new achievements and unlock reward items
  checkAndUnlockAchievements(): AvatarAchievement[] {
    const newAchievements: AvatarAchievement[] = [];

    ALL_ACHIEVEMENTS.forEach(achievement => {
      if (!this.userStats.achievements.includes(achievement.id)) {
        if (checkAchievementUnlock(achievement.id, this.userStats)) {
          // Unlock achievement
          this.userStats.achievements.push(achievement.id);
          this.inventory.achievements.push({
            ...achievement,
            unlockedAt: new Date(),
          });

          // Unlock reward items
          if (achievement.rewardItems) {
            achievement.rewardItems.forEach(itemId => {
              if (!this.inventory.unlockedItems.includes(itemId)) {
                this.inventory.unlockedItems.push(itemId);
              }
            });
          }

          newAchievements.push(achievement);
        }
      }
    });

    if (newAchievements.length > 0) {
      this.updateInventoryStats();
    }

    return newAchievements;
  }

  // Get inventory summary
  getInventorySummary() {
    return {
      totalItems: ALL_AVATAR_ITEMS.length,
      unlockedItems: this.inventory.totalItemsUnlocked,
      favoriteItems: this.inventory.favoriteItems.length,
      achievements: this.inventory.achievements.length,
      completionPercentage: Math.round(
        (this.inventory.totalItemsUnlocked / ALL_AVATAR_ITEMS.length) * 100
      ),
      rarityProgress: this.inventory.rarityProgress,
      categoryCompletion: this.getCategoryCompletion(),
      rarityCompletion: this.getRarityCompletion(),
    };
  }

  // Export inventory data
  exportInventory(): AvatarInventory {
    return { ...this.inventory };
  }
}

// Factory function to create inventory manager
export const createInventoryManager = (
  inventory: AvatarInventory,
  userStats: UserForumStats
): AvatarInventoryManager => {
  return new AvatarInventoryManager(inventory, userStats);
};

// Helper function to create default inventory for new users
export const createDefaultInventory = (userId: number): AvatarInventory => {
  // Start with basic items unlocked
  const defaultUnlockedItems = ALL_AVATAR_ITEMS.filter(
    item => item.unlockCondition.threshold === 0
  ).map(item => item.id);

  return {
    userId,
    unlockedItems: defaultUnlockedItems,
    favoriteItems: [],
    achievements: [],
    totalItemsUnlocked: defaultUnlockedItems.length,
    rarityProgress: {
      common: defaultUnlockedItems.filter(id => {
        const item = getItemById(id);
        return item?.rarity === 'common';
      }).length,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
      'math-master': 0,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};
