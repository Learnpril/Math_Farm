// Shared types for Math Farm application

export interface Topic {
  id: string;
  title: string;
  description: string;
  level: string;
  estimatedTime: number;
  difficulty: number;
  prerequisites?: string[];
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
