// Shared TypeScript types and interfaces

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  level: TopicLevel;
  icon: string;
  mathExpression: string;
  prerequisites: string[];
  estimatedTime: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
}

export type TopicLevel = "elementary" | "middle" | "high" | "advanced" | "specialized";

export interface ProgressData {
  sectionsVisited: string[];
  topicsExplored: string[];
  toolsUsed: string[];
  practiceCompleted: number;
  streak: number;
  badges: Badge[];
  lastVisit: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  category: "exploration" | "practice" | "streak" | "achievement";
}