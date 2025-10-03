// Curriculum type definitions for Math Farm
export interface CurriculumMetadata {
  topic: string;
  title: string;
  prerequisites: string[];
  objectives: string[];
  chapters: number;
  tools: string[];
  chapterFiles: string[];
  estimatedHours?: number | undefined;
  difficulty?: string | undefined;
}

export interface CommonPitfall {
  misconception: string;
  example: string;
  explanation: string;
  correction: string;
}

export interface CommonPitfalls {
  title: string;
  pitfalls: CommonPitfall[];
  preventionStrategies: string[];
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
  commonPitfalls?: CommonPitfalls | undefined;
  assessment: {
    masteryThreshold: number;
    requiredProblems: number;
  };
}

export interface TheoryConcept {
  title: string;
  content: string;
  latex?: string | undefined;
  visuals?: string[] | undefined;
}

export interface WorkedExample {
  problem: string;
  solution: string;
  steps: string[];
  commonErrors?: string[] | undefined;
  latex?: string | undefined;
}

export interface PracticeProblem {
  id: string;
  type: 'multiple-choice' | 'fill-in' | 'step-by-step' | 'drag-drop';
  problem: string;
  options?: string[] | undefined;
  correct: number | string;
  hints: string[];
  explanation: string;
  latex?: string | undefined;
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

// Drill types for printable math worksheets
export interface DrillProblem {
  id: string;
  operand1: number;
  operand2?: number;
  operation:
    | 'addition'
    | 'subtraction'
    | 'multiplication'
    | 'division'
    | 'ratio-simplify'
    | 'percentage-convert'
    | 'percentage-of'
    | 'percentage-change';
  answer: number | string;
  difficulty: 'easy' | 'medium' | 'hard';
  problem?: string; // For complex problems that need custom formatting
  solution?: string; // For showing work/steps
}

export interface DrillSet {
  id: string;
  title: string;
  operation:
    | 'addition'
    | 'subtraction'
    | 'multiplication'
    | 'division'
    | 'ratio-simplify'
    | 'percentage-convert'
    | 'percentage-of'
    | 'percentage-change';
  problems: DrillProblem[];
  generatedAt: Date;
  chapterLevel: number;
}

export type DigitSelection = 'one' | 'two' | 'three' | 'mixed';

export interface DrillConfiguration {
  problemCount: number;
  gridColumns: number;
  gridRows: number;
  numberRange: {
    min: number;
    max: number;
  };
  allowNegativeResults: boolean;
  mixedDifficulty: boolean;
  digitSelection?: DigitSelection;
}
