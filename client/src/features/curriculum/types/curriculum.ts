/**
 * TypeScript interfaces for curriculum data structure
 * Based on the arithmetic curriculum JSON schema
 */

export interface CurriculumMetadata {
  topic: string;
  title: string;
  difficulty:
    | 'elementary'
    | 'middle-school'
    | 'high-school'
    | 'advanced'
    | 'specialized';
  prerequisites: string[];
  objectives: string[];
  estimatedHours: number;
  chapters: number;
  tools: string[];
  chapterFiles: string[];
}

export interface ChapterIntroduction {
  context: string;
  connection: string;
}

export interface TheoryConcept {
  title: string;
  content: string;
  latex?: string;
  visuals?: string[];
}

export interface TheorySection {
  concepts: TheoryConcept[];
}

export interface WorkedExample {
  problem: string;
  solution: string;
  steps: string[];
  commonErrors?: string[];
  latex?: string;
}

export interface PracticeQuestion {
  id: string;
  type: 'multiple-choice' | 'fill-in' | 'true-false' | 'drag-drop';
  problem: string;
  options?: string[];
  correct: string | number;
  hints: string[];
  explanation: string;
  difficulty: number; // 1-5 scale
}

export interface ChapterAssessment {
  masteryThreshold: number; // 0-1 scale
  requiredProblems: number;
}

export interface ChapterData {
  id: string;
  title: string;
  duration: number; // hours
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
