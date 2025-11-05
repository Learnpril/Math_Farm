/**
 * JSON Schema validation for curriculum data
 * Validates curriculum metadata and chapter data against TypeScript interfaces
 */

import type {
  ChapterData,
  ValidationResult,
  CurriculumValidationError,
  PracticeQuestion,
  WorkedExample,
  TheoryConcept,
  CurriculumMetadata,
} from '../types/curriculum';

/**
 * Validates curriculum metadata structure
 */
export function validateCurriculumMetadata(data: any): ValidationResult {
  const errors: CurriculumValidationError[] = [];

  // Required string fields
  const requiredStringFields = ['topic', 'title'];
  for (const field of requiredStringFields) {
    if (!data[field] || typeof data[field] !== 'string') {
      errors.push({
        field,
        message: `${field} is required and must be a string`,
        value: data[field],
      });
    }
  }

  // Required array fields
  const requiredArrayFields = [
    'prerequisites',
    'objectives',
    'tools',
    'chapterFiles',
  ];
  for (const field of requiredArrayFields) {
    if (!Array.isArray(data[field])) {
      errors.push({
        field,
        message: `${field} is required and must be an array`,
        value: data[field],
      });
    }
  }

  // Required number fields
  const requiredNumberFields = ['chapters'];
  for (const field of requiredNumberFields) {
    if (typeof data[field] !== 'number' || data[field] <= 0) {
      errors.push({
        field,
        message: `${field} is required and must be a positive number`,
        value: data[field],
      });
    }
  }

  // Validate chapter count matches chapter files
  if (Array.isArray(data.chapterFiles) && typeof data.chapters === 'number') {
    if (data.chapterFiles.length !== data.chapters) {
      errors.push({
        field: 'chapters',
        message: `chapters count (${data.chapters}) must match chapterFiles length (${data.chapterFiles.length})`,
        value: data.chapters,
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a theory concept structure
 */
function validateTheoryConcept(
  concept: any,
  index: number
): CurriculumValidationError[] {
  const errors: CurriculumValidationError[] = [];
  const prefix = `theory.concepts[${index}]`;

  if (!concept.title || typeof concept.title !== 'string') {
    errors.push({
      field: `${prefix}.title`,
      message: 'title is required and must be a string',
      value: concept.title,
    });
  }

  if (!concept.content || typeof concept.content !== 'string') {
    errors.push({
      field: `${prefix}.content`,
      message: 'content is required and must be a string',
      value: concept.content,
    });
  }

  if (concept.latex && typeof concept.latex !== 'string') {
    errors.push({
      field: `${prefix}.latex`,
      message: 'latex must be a string if provided',
      value: concept.latex,
    });
  }

  if (concept.visuals && !Array.isArray(concept.visuals)) {
    errors.push({
      field: `${prefix}.visuals`,
      message: 'visuals must be an array if provided',
      value: concept.visuals,
    });
  }

  return errors;
}

/**
 * Validates a worked example structure
 */
function validateWorkedExample(
  example: any,
  index: number
): CurriculumValidationError[] {
  const errors: CurriculumValidationError[] = [];
  const prefix = `examples[${index}]`;

  const requiredStringFields = ['problem', 'solution'];
  for (const field of requiredStringFields) {
    if (!example[field] || typeof example[field] !== 'string') {
      errors.push({
        field: `${prefix}.${field}`,
        message: `${field} is required and must be a string`,
        value: example[field],
      });
    }
  }

  if (!Array.isArray(example.steps)) {
    errors.push({
      field: `${prefix}.steps`,
      message: 'steps is required and must be an array',
      value: example.steps,
    });
  }

  if (example.commonErrors && !Array.isArray(example.commonErrors)) {
    errors.push({
      field: `${prefix}.commonErrors`,
      message: 'commonErrors must be an array if provided',
      value: example.commonErrors,
    });
  }

  if (example.latex && typeof example.latex !== 'string') {
    errors.push({
      field: `${prefix}.latex`,
      message: 'latex must be a string if provided',
      value: example.latex,
    });
  }

  // Validate visual property if provided
  if (example.visual) {
    if (typeof example.visual !== 'object') {
      errors.push({
        field: `${prefix}.visual`,
        message: 'visual must be an object if provided',
        value: example.visual,
      });
    } else {
      if (!example.visual.type || typeof example.visual.type !== 'string') {
        errors.push({
          field: `${prefix}.visual.type`,
          message: 'visual.type is required and must be a string',
          value: example.visual.type,
        });
      }

      if (example.visual.config && typeof example.visual.config !== 'object') {
        errors.push({
          field: `${prefix}.visual.config`,
          message: 'visual.config must be an object if provided',
          value: example.visual.config,
        });
      }
    }
  }

  return errors;
}

/**
 * Validates a practice question structure
 */
function validatePracticeQuestion(
  question: any,
  index: number
): CurriculumValidationError[] {
  const errors: CurriculumValidationError[] = [];
  const prefix = `practice[${index}]`;

  // Required fields
  if (!question.id || typeof question.id !== 'string') {
    errors.push({
      field: `${prefix}.id`,
      message: 'id is required and must be a string',
      value: question.id,
    });
  }

  const validTypes = [
    'multiple-choice',
    'fill-in',
    'true-false',
    'drag-drop',
    'step-by-step',
  ];
  if (!question.type || !validTypes.includes(question.type)) {
    errors.push({
      field: `${prefix}.type`,
      message: `type must be one of: ${validTypes.join(', ')}`,
      value: question.type,
    });
  }

  if (!question.problem || typeof question.problem !== 'string') {
    errors.push({
      field: `${prefix}.problem`,
      message: 'problem is required and must be a string',
      value: question.problem,
    });
  }

  if (!question.explanation || typeof question.explanation !== 'string') {
    errors.push({
      field: `${prefix}.explanation`,
      message: 'explanation is required and must be a string',
      value: question.explanation,
    });
  }

  if (!Array.isArray(question.hints)) {
    errors.push({
      field: `${prefix}.hints`,
      message: 'hints is required and must be an array',
      value: question.hints,
    });
  }

  if (
    typeof question.difficulty !== 'number' ||
    question.difficulty < 1 ||
    question.difficulty > 5
  ) {
    errors.push({
      field: `${prefix}.difficulty`,
      message: 'difficulty is required and must be a number between 1 and 5',
      value: question.difficulty,
    });
  }

  // Type-specific validation
  if (question.type === 'multiple-choice') {
    if (!Array.isArray(question.options) || question.options.length < 2) {
      errors.push({
        field: `${prefix}.options`,
        message:
          'options is required for multiple-choice questions and must have at least 2 items',
        value: question.options,
      });
    }

    if (
      typeof question.correct !== 'number' ||
      question.correct < 0 ||
      (Array.isArray(question.options) &&
        question.correct >= question.options.length)
    ) {
      errors.push({
        field: `${prefix}.correct`,
        message: 'correct must be a valid index for the options array',
        value: question.correct,
      });
    }
  } else {
    if (typeof question.correct !== 'string') {
      errors.push({
        field: `${prefix}.correct`,
        message: 'correct must be a string for non-multiple-choice questions',
        value: question.correct,
      });
    }
  }

  return errors;
}

/**
 * Validates chapter data structure
 */
export function validateChapterData(data: any): ValidationResult {
  const errors: CurriculumValidationError[] = [];

  // Required string fields
  const requiredStringFields = ['id', 'title'];
  for (const field of requiredStringFields) {
    if (!data[field] || typeof data[field] !== 'string') {
      errors.push({
        field,
        message: `${field} is required and must be a string`,
        value: data[field],
      });
    }
  }

  // Required array fields
  const requiredArrayFields = ['objectives', 'prerequisites', 'tools'];
  for (const field of requiredArrayFields) {
    if (!Array.isArray(data[field])) {
      errors.push({
        field,
        message: `${field} is required and must be an array`,
        value: data[field],
      });
    }
  }

  // Validate introduction
  if (!data.introduction || typeof data.introduction !== 'object') {
    errors.push({
      field: 'introduction',
      message: 'introduction is required and must be an object',
      value: data.introduction,
    });
  } else {
    if (
      !data.introduction.context ||
      typeof data.introduction.context !== 'string'
    ) {
      errors.push({
        field: 'introduction.context',
        message: 'introduction.context is required and must be a string',
        value: data.introduction.context,
      });
    }
    if (
      !data.introduction.connection ||
      typeof data.introduction.connection !== 'string'
    ) {
      errors.push({
        field: 'introduction.connection',
        message: 'introduction.connection is required and must be a string',
        value: data.introduction.connection,
      });
    }
  }

  // Validate theory section
  if (!data.theory || typeof data.theory !== 'object') {
    errors.push({
      field: 'theory',
      message: 'theory is required and must be an object',
      value: data.theory,
    });
  } else {
    if (!Array.isArray(data.theory.concepts)) {
      errors.push({
        field: 'theory.concepts',
        message: 'theory.concepts is required and must be an array',
        value: data.theory.concepts,
      });
    } else {
      data.theory.concepts.forEach((concept: any, index: number) => {
        errors.push(...validateTheoryConcept(concept, index));
      });
    }
  }

  // Validate examples
  if (!Array.isArray(data.examples)) {
    errors.push({
      field: 'examples',
      message: 'examples is required and must be an array',
      value: data.examples,
    });
  } else {
    data.examples.forEach((example: any, index: number) => {
      errors.push(...validateWorkedExample(example, index));
    });
  }

  // Validate practice questions
  if (!Array.isArray(data.practice)) {
    errors.push({
      field: 'practice',
      message: 'practice is required and must be an array',
      value: data.practice,
    });
  } else {
    data.practice.forEach((question: any, index: number) => {
      errors.push(...validatePracticeQuestion(question, index));
    });
  }

  // Validate assessment
  if (!data.assessment || typeof data.assessment !== 'object') {
    errors.push({
      field: 'assessment',
      message: 'assessment is required and must be an object',
      value: data.assessment,
    });
  } else {
    if (
      typeof data.assessment.masteryThreshold !== 'number' ||
      data.assessment.masteryThreshold < 0 ||
      data.assessment.masteryThreshold > 1
    ) {
      errors.push({
        field: 'assessment.masteryThreshold',
        message: 'assessment.masteryThreshold must be a number between 0 and 1',
        value: data.assessment.masteryThreshold,
      });
    }

    if (
      typeof data.assessment.requiredProblems !== 'number' ||
      data.assessment.requiredProblems <= 0
    ) {
      errors.push({
        field: 'assessment.requiredProblems',
        message: 'assessment.requiredProblems must be a positive number',
        value: data.assessment.requiredProblems,
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates that practice question IDs are unique within a chapter
 */
export function validateUniqueQuestionIds(
  questions: PracticeQuestion[]
): ValidationResult {
  const errors: CurriculumValidationError[] = [];
  const seenIds = new Set<string>();

  questions.forEach((question, index) => {
    if (seenIds.has(question.id)) {
      errors.push({
        field: `practice[${index}].id`,
        message: `Duplicate question ID: ${question.id}`,
        value: question.id,
      });
    }
    seenIds.add(question.id);
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates that chapter prerequisites exist in the curriculum
 */
export function validateChapterPrerequisites(
  chapterData: ChapterData,
  availableChapters: string[]
): ValidationResult {
  const errors: CurriculumValidationError[] = [];

  chapterData.prerequisites.forEach((prereq, index) => {
    if (!availableChapters.includes(prereq)) {
      errors.push({
        field: `prerequisites[${index}]`,
        message: `Prerequisite chapter '${prereq}' not found in available chapters`,
        value: prereq,
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
