// Shared types for Math Farm application

export interface Topic {
  id: string;
  title: string;
  description: string;
  level: string;
  estimatedTime: number;
  difficulty: number;
  prerequisites?: string[];
  icon?: string;
  mathExpression?: string;
}

export interface SuggestedTopic {
  id: string;
  title: string;
  description: string;
  level: string;
  estimatedTime: number;
  difficulty: number;
  prerequisites?: string[];
}

// Base User interface (to be extended by forum)
export interface User {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  // Forum-specific fields (added by forum schema)
  forumRole?: 'guest' | 'member' | 'moderator' | 'admin';
  forumPostCount?: number;
  forumBannedUntil?: Date;
  forumBanReason?: string;
}
