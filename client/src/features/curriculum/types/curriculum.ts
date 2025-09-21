/**
 * TypeScript interfaces for curriculum data structure
 * Based on the arithmetic curriculum JSON schema
 */

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

export interface ChapterIntroduction {
  context: string;
  connection: string;
}

export interface TheoryConcept {
  title: string;
  content: string;
  latex?: string | undefined;
  visuals?: string[] | undefined;
}

export interface TheorySection {
  concepts: TheoryConcept[];
}

export interface WorkedExample {
  problem: string;
  solution: string;
  steps: string[];
  commonErrors?: string[] | undefined;
  latex?: string | undefined;
}

export interface PracticeQuestion {
  id: string;
  type: 'multiple-choice' | 'fill-in' | 'step-by-step' | 'drag-drop';
  problem: string;
  options?: string[] | undefined;
  correct: string | number;
  hints: string[];
  explanation: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
}

export interface ChapterAssessment {
  masteryThreshold: number; // 0-1 scale
  requiredProblems: number;
}

export interface ChapterData {
  id: string;
  title: string;
  objectives: string[];
  prerequisites: string[];
  introduction: ChapterIntroduction;
  theory: TheorySection;
  examples: WorkedExample[];
  practice: PracticeQuestion[];
  tools: string[];
  assessment: ChapterAssessment;
}

export interface CurriculumValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: CurriculumValidationError[];
}
