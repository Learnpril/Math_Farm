/**
 * Forum-related TypeScript interfaces and types
 */

export interface ForumCategory {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  sortOrder: number;
  threadCount: number;
  postCount: number;
  createdAt: Date;
  updatedAt: Date;
  lastActivity?: {
    threadTitle: string;
    authorName: string;
    timestamp: Date;
  };
  children?: ForumCategory[];
}

export interface ForumThread {
  id: number;
  title: string;
  categoryId: number;
  categoryName?: string;
  authorId: number;
  authorName: string;
  isPinned: boolean;
  isLocked: boolean;
  postCount: number;
  lastPostAt?: Date;
  lastPostAuthor?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ForumPost {
  id: number;
  threadId: number;
  authorId: number;
  authorName: string;
  parentPostId?: number;
  content: string;
  mathExpressions?: MathExpression[];
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  likeCount?: number;
  isLiked?: boolean;
  replies?: ForumPost[];
}

export interface MathExpression {
  type: 'latex' | 'mathml' | 'asciimath';
  content: string;
  displayMode?: boolean;
}

export interface ForumUser {
  id: number;
  username: string;
  email: string;
  role: 'member' | 'moderator' | 'admin';
  avatar?: AvatarConfig;
  postCount: number;
  likeCount: number;
  joinedAt: Date;
  lastActiveAt?: Date;
}

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

export interface AvatarLayer {
  itemId: string;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  color?: string;
  opacity?: number;
  visible: boolean;
}

export interface ForumReport {
  id: number;
  postId: number;
  reporterId: number;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  moderatorId?: number;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

// API response types
export interface ForumApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Sort and filter types
export type ThreadSortBy = 'recent' | 'popular' | 'oldest' | 'title';
export type PostSortBy = 'chronological' | 'popular';

// Forum permissions
export type ForumPermission =
  | 'read_posts'
  | 'create_posts'
  | 'edit_own_posts'
  | 'delete_own_posts'
  | 'moderate_posts'
  | 'manage_categories'
  | 'ban_users';

export interface UserPermissions {
  userId: number;
  permissions: ForumPermission[];
}
// Re-export avatar types for convenience
export type {
  AvatarItemCategory,
  AvatarItemRarity,
  AvatarUnlockCondition,
  AvatarItem,
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
} from './types/avatar';
