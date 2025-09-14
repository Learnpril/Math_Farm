// Forum-specific types for Math Farm Community Forum

export interface ForumCategory {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ForumThread {
  id: number;
  title: string;
  categoryId: number;
  authorId: number;
  isPinned: boolean;
  isLocked: boolean;
  postCount: number;
  lastPostAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ForumPost {
  id: number;
  threadId: number;
  authorId: number;
  parentPostId?: number;
  content: string;
  mathExpressions?: MathExpression[];
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAvatar {
  id: number;
  userId: number;
  config: AvatarConfig;
  unlockedItems: string[];
  createdAt: Date;
  updatedAt: Date;
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

// Avatar System Types
export interface AvatarItem {
  id: string;
  name: string;
  category: 'background' | 'body' | 'clothing' | 'accessories' | 'math-tools';
  svgPath: string;
  unlockCondition: {
    type: 'posts' | 'likes' | 'tenure' | 'achievement';
    threshold: number;
  };
  zIndex: number;
}

export interface AvatarLayer {
  itemId: string;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  color?: string;
}

export interface AvatarConfig {
  layers: AvatarLayer[];
  backgroundColor: string;
  size: 'small' | 'medium' | 'large';
}

// Math Expression Types
export interface MathExpression {
  id: string;
  latex: string;
  position: { start: number; end: number };
  rendered?: string;
}

// API Response Types
export interface ForumApiError {
  code:
    | 'THREAD_NOT_FOUND'
    | 'INSUFFICIENT_PERMISSIONS'
    | 'CONTENT_MODERATED'
    | 'VALIDATION_ERROR';
  message: string;
  details?: Record<string, any>;
}

// User Role Types
export type UserRole = 'guest' | 'member' | 'moderator' | 'admin';

export interface PublicUserProfile {
  id: number;
  username: string;
  avatar?: AvatarConfig;
  role: UserRole;
  joinedAt: Date;
  postCount?: number;
}

// Forum Statistics
export interface ForumStats {
  totalThreads: number;
  totalPosts: number;
  totalUsers: number;
  activeUsers: number;
}

// Search Types
export interface ForumSearchResult {
  type: 'thread' | 'post';
  id: number;
  title: string;
  content: string;
  author: PublicUserProfile;
  createdAt: Date;
  threadId?: number; // For post results
  highlights?: string[];
}

export interface ForumSearchFilters {
  query: string;
  author?: string;
  category?: number;
  dateFrom?: Date;
  dateTo?: Date;
  hasMath?: boolean;
}
