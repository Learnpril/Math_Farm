// Curriculum type definitions for Math Farm
export interface CurriculumMetadata {
  topic: string;
  title: string;
  prerequisites: string[];
  objectives: string[];
  chapters: number;
  tools: string[];
  chapterFiles: string[];
  estimatedHours?: number;
  difficulty?: string;
}

export interface ChapterContent {
  id: string;
  title: string;
  objectives: string[];
  prerequisites: string[];
  introduction: {
    context: string;
    connection: string;
  };
  theory: {
    concepts: TheoryConcept[];
  };
  examples: WorkedExample[];
  practice: PracticeProblem[];
  tools: string[];
  assessment: {
    masteryThreshold: number;
    requiredProblems: number;
  };
}

export interface TheoryConcept {
  title: string;
  content: string;
  latex?: string;
  visuals?: string[];
}

export interface WorkedExample {
  problem: string;
  solution: string;
  steps: string[];
  commonErrors?: string[];
  latex?: string;
}

export interface PracticeProblem {
  id: string;
  type: 'multiple-choice' | 'fill-in' | 'step-by-step' | 'drag-drop';
  problem: string;
  options?: string[];
  correct: number | string;
  hints: string[];
  explanation: string;
  latex?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
}

export interface CurriculumProgress {
  currentChapter: number;
  completedChapters: number[];
  chapterProgress: Record<string, ChapterProgress>;
  totalTimeSpent: number;
  achievements: string[];
  lastAccessed: string;
}

export interface ChapterProgress {
  completed: boolean;
  timeSpent: number;
  practiceScores: Record<string, number>;
  masteryLevel: number; // 0-1
  attemptsCount: number;
  hintsUsed: number;
}

export interface CurriculumState {
  metadata: CurriculumMetadata | null;
  currentChapter: ChapterContent | null;
  progress: CurriculumProgress;
  loading: boolean;
  error: string | null;
}
