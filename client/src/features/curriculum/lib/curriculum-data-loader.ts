/**
 * Curriculum data loader with validation
 * Loads and validates curriculum metadata and chapter data
 */

import type {
  CurriculumMetadata,
  ChapterData,
  ValidationResult,
} from '../types/curriculum';
import {
  validateCurriculumMetadata,
  validateChapterData,
  validateUniqueQuestionIds,
  validateChapterPrerequisites,
} from './curriculum-validator';

/**
 * Error thrown when curriculum data fails validation
 */
export class CurriculumValidationError extends Error {
  constructor(
    public validationResult: ValidationResult,
    message: string = 'Curriculum data validation failed'
  ) {
    super(message);
    this.name = 'CurriculumValidationError';
  }
}

/**
 * Loads and validates curriculum metadata
 */
export async function loadCurriculumMetadata(
  topic: string
): Promise<CurriculumMetadata> {
  try {
    const response = await fetch(`/src/data/curriculum/${topic}/metadata.json`);
    if (!response.ok) {
      throw new Error(
        `Failed to load curriculum metadata for ${topic}: ${response.statusText}`
      );
    }

    const data = await response.json();
    const validation = validateCurriculumMetadata(data);

    if (!validation.isValid) {
      throw new CurriculumValidationError(
        validation,
        `Invalid curriculum metadata for ${topic}`
      );
    }

    return data as CurriculumMetadata;
  } catch (error) {
    if (error instanceof CurriculumValidationError) {
      throw error;
    }
    throw new Error(
      `Failed to load curriculum metadata: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Loads and validates a single chapter
 */
export async function loadChapterData(
  topic: string,
  chapterId: string
): Promise<ChapterData> {
  try {
    const response = await fetch(
      `/src/data/curriculum/${topic}/${chapterId}.json`
    );
    if (!response.ok) {
      throw new Error(
        `Failed to load chapter ${chapterId}: ${response.statusText}`
      );
    }

    const data = await response.json();
    const validation = validateChapterData(data);

    if (!validation.isValid) {
      throw new CurriculumValidationError(
        validation,
        `Invalid chapter data for ${chapterId}`
      );
    }

    // Additional validation for unique question IDs
    const uniqueIdValidation = validateUniqueQuestionIds(data.practice);
    if (!uniqueIdValidation.isValid) {
      throw new CurriculumValidationError(
        uniqueIdValidation,
        `Duplicate question IDs in chapter ${chapterId}`
      );
    }

    return data as ChapterData;
  } catch (error) {
    if (error instanceof CurriculumValidationError) {
      throw error;
    }
    throw new Error(
      `Failed to load chapter data: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Loads all chapters for a curriculum with cross-chapter validation
 */
export async function loadAllChapters(topic: string): Promise<ChapterData[]> {
  try {
    const metadata = await loadCurriculumMetadata(topic);
    const chapters: ChapterData[] = [];

    // Load all chapters
    for (const chapterFile of metadata.chapterFiles) {
      const chapterId = chapterFile.replace('.json', '');
      const chapterData = await loadChapterData(topic, chapterId);
      chapters.push(chapterData);
    }

    // Validate prerequisites across chapters
    const availableChapterIds = chapters.map(ch => ch.id);
    for (const chapter of chapters) {
      const prereqValidation = validateChapterPrerequisites(
        chapter,
        availableChapterIds
      );
      if (!prereqValidation.isValid) {
        throw new CurriculumValidationError(
          prereqValidation,
          `Invalid prerequisites in chapter ${chapter.id}`
        );
      }
    }

    return chapters;
  } catch (error) {
    if (error instanceof CurriculumValidationError) {
      throw error;
    }
    throw new Error(
      `Failed to load curriculum chapters: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Validates existing curriculum data without loading from files
 * Useful for testing or when data is already in memory
 */
export function validateCurriculumData(
  metadata: CurriculumMetadata,
  chapters: ChapterData[]
): ValidationResult {
  const errors: any[] = [];

  // Validate metadata
  const metadataValidation = validateCurriculumMetadata(metadata);
  if (!metadataValidation.isValid) {
    errors.push(...metadataValidation.errors);
  }

  // Validate each chapter
  const availableChapterIds = chapters.map(ch => ch.id);
  for (const chapter of chapters) {
    const chapterValidation = validateChapterData(chapter);
    if (!chapterValidation.isValid) {
      errors.push(...chapterValidation.errors);
    }

    const uniqueIdValidation = validateUniqueQuestionIds(chapter.practice);
    if (!uniqueIdValidation.isValid) {
      errors.push(...uniqueIdValidation.errors);
    }

    const prereqValidation = validateChapterPrerequisites(
      chapter,
      availableChapterIds
    );
    if (!prereqValidation.isValid) {
      errors.push(...prereqValidation.errors);
    }
  }

  // Validate chapter count matches metadata
  if (chapters.length !== metadata.chapters) {
    errors.push({
      field: 'chapters',
      message: `Metadata specifies ${metadata.chapters} chapters but ${chapters.length} were provided`,
      value: chapters.length,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Gets a formatted error message from validation results
 */
export function formatValidationErrors(validation: ValidationResult): string {
  if (validation.isValid) {
    return 'No validation errors';
  }

  return validation.errors
    .map(error => `${error.field}: ${error.message}`)
    .join('\n');
}
