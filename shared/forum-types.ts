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
export interface SearchQuery {
  q: string;
  category?: string;
  author?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy: 'relevance' | 'date' | 'replies';
  page: number;
  limit: number;
  includeMath: boolean;
}

export interface SearchResult {
  id: number;
  type: 'post';
  title: string;
  content: string;
  excerpt: string;
  author: {
    id: number;
    username: string;
  };
  thread: {
    id: number;
    title: string;
    category: {
      id: number;
      name: string;
    };
  };
  createdAt: string;
  relevanceScore: number;
  mathContent?: MathExpression[] | null;
}

export interface SearchSuggestion {
  text: string;
  type: 'thread' | 'category' | 'term';
  count: number;
}

export interface SearchFilters {
  categories: Array<{
    id: number;
    name: string;
    postCount: number;
  }>;
  authors: Array<{
    id: number;
    username: string;
    postCount: number;
  }>;
  dateRanges: Array<{
    label: string;
    value: string;
  }>;
}

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

// Notification Types
export interface ForumNotification {
  id: number;
  userId: number;
  type:
    | 'mention'
    | 'reply'
    | 'thread_reply'
    | 'thread_locked'
    | 'post_liked'
    | 'achievement';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
  expiresAt?: Date;
}

export interface NotificationPreferences {
  id: number;
  userId: number;
  mentionsEnabled: boolean;
  repliesEnabled: boolean;
  threadRepliesEnabled: boolean;
  threadUpdatesEnabled: boolean;
  likesEnabled: boolean;
  achievementsEnabled: boolean;
  emailNotifications: boolean;
  digestFrequency: 'none' | 'daily' | 'weekly';
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationSubscription {
  id: number;
  userId: number;
  subscriptionType: 'thread' | 'category' | 'user';
  targetId: number;
  isActive: boolean;
  createdAt: Date;
}

// Discovery Types
export interface TrendingTopic {
  id: number;
  title: string;
  category: {
    id: number;
    name: string;
  };
  author: {
    id: number;
    username: string;
  };
  postCount: number;
  recentActivity: number;
  trendScore: number;
  tags: string[];
  createdAt: string;
  lastPostAt: string;
}

export interface PopularDiscussion {
  id: number;
  title: string;
  category: {
    id: number;
    name: string;
  };
  author: {
    id: number;
    username: string;
  };
  postCount: number;
  viewCount: number;
  likeCount: number;
  popularityScore: number;
  tags: string[];
  createdAt: string;
  lastPostAt: string;
}

export interface ActivityFeedItem {
  id: number;
  type: 'post' | 'thread';
  title: string;
  content: string;
  author: {
    id: number;
    username: string;
  };
  thread?: {
    id: number;
    title: string;
    category: {
      id: number;
      name: string;
    };
  };
  createdAt: string;
  isFollowing: boolean;
}

export interface RelatedThread {
  id: number;
  title: string;
  category: {
    id: number;
    name: string;
  };
  author: {
    id: number;
    username: string;
  };
  postCount: number;
  similarityScore: number;
  tags: string[];
  createdAt: string;
  lastPostAt: string;
}

export interface ForumTag {
  id: number;
  name: string;
  description?: string;
  color?: string;
  threadCount: number;
  postCount: number;
  createdAt: string;
}

export interface UserFollow {
  id: number;
  followerId: number;
  followingId: number;
  createdAt: string;
}
