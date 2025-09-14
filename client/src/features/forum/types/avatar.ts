/**
 * Chibi Avatar System Types and Interfaces
 * Math Farm Community Forum - Avatar Customization
 */

// Base avatar item categories
export type AvatarItemCategory =
  | 'background'
  | 'body'
  | 'hair'
  | 'eyes'
  | 'clothing'
  | 'accessories'
  | 'math-tools'
  | 'expressions'
  | 'poses';

// Rarity levels for avatar items
export type AvatarItemRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'math-master';

// Unlock conditions for avatar items
export interface AvatarUnlockCondition {
  type:
    | 'posts'
    | 'likes'
    | 'tenure'
    | 'achievement'
    | 'math-streak'
    | 'forum-activity';
  threshold: number;
  description: string;
}

// Individual avatar item definition
export interface AvatarItem {
  id: string;
  name: string;
  category: AvatarItemCategory;
  rarity: AvatarItemRarity;
  description: string;
  svgPath: string;
  zIndex: number;
  unlockCondition: AvatarUnlockCondition;
  colorCustomizable: boolean;
  defaultColor?: string;
  mathThemed: boolean;
  tags: string[];
}

// Avatar layer configuration for rendering
export interface AvatarLayer {
  itemId: string;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  color?: string;
  opacity?: number;
  visible: boolean;
}

// Complete avatar configuration
export interface AvatarConfig {
  id?: string;
  userId: number;
  name?: string;
  layers: AvatarLayer[];
  backgroundColor: string;
  size: 'small' | 'medium' | 'large';
  pose: string;
  expression: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// User's avatar inventory and progress
export interface AvatarInventory {
  userId: number;
  unlockedItems: string[];
  favoriteItems: string[];
  achievements: AvatarAchievement[];
  totalItemsUnlocked: number;
  rarityProgress: Record<AvatarItemRarity, number>;
  createdAt: Date;
  updatedAt: Date;
}

// Avatar-related achievements
export interface AvatarAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  rewardItems?: string[];
}

// Avatar preset configurations
export interface AvatarPreset {
  id: string;
  name: string;
  description: string;
  config: Omit<AvatarConfig, 'id' | 'userId'>;
  requiredItems: string[];
  mathTheme?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

// Avatar rendering options
export interface AvatarRenderOptions {
  size: number;
  format: 'canvas' | 'svg' | 'png';
  quality?: number;
  background?: boolean;
  animation?: boolean;
  effects?: AvatarEffect[];
}

// Special effects for avatars
export interface AvatarEffect {
  type: 'sparkle' | 'glow' | 'math-symbols' | 'particles' | 'rainbow';
  intensity: number;
  duration?: number;
  trigger?: 'hover' | 'click' | 'achievement' | 'always';
}

// Avatar editor state
export interface AvatarEditorState {
  currentConfig: AvatarConfig;
  selectedCategory: AvatarItemCategory;
  selectedItem?: AvatarItem;
  previewMode: boolean;
  unsavedChanges: boolean;
  history: AvatarConfig[];
  historyIndex: number;
}

// Avatar item collection for organization
export interface AvatarItemCollection {
  category: AvatarItemCategory;
  items: AvatarItem[];
  totalItems: number;
  unlockedCount: number;
  rarityDistribution: Record<AvatarItemRarity, number>;
}

// Avatar statistics and analytics
export interface AvatarStats {
  userId: number;
  totalCustomizations: number;
  favoriteCategory: AvatarItemCategory;
  mostUsedItems: string[];
  timeSpentCustomizing: number;
  presetsCreated: number;
  achievementsEarned: number;
}

// API response types for avatar system
export interface AvatarApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

// Avatar validation result
export interface AvatarValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingItems: string[];
}

// Export all avatar-related types
export type {
  AvatarItemCategory,
  AvatarItemRarity,
  AvatarUnlockCondition,
  AvatarItem,
  AvatarLayer,
  AvatarConfig,
  AvatarInventory,
  AvatarAchievement,
  AvatarPreset,
  AvatarRenderOptions,
  AvatarEffect,
  AvatarEditorState,
  AvatarItemCollection,
  AvatarStats,
  AvatarApiResponse,
  AvatarValidationResult,
};
