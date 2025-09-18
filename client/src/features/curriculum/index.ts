// Curriculum feature exports
export { ArithmeticCurriculumPage } from './components/ArithmeticCurriculumPage';
export { CurriculumNavigation } from './components/CurriculumNavigation';
export { ChapterContent } from './components/ChapterContent';
export { TheorySection } from './components/TheorySection';
export { WorkedExamples } from './components/WorkedExamples';
export { PracticeProblems } from './components/PracticeProblems';

export { useCurriculumProgress } from './hooks/useCurriculumProgress';

export {
  loadCurriculumMetadata,
  loadChapterContent,
  preloadCurriculum,
} from './lib/curriculum-data-loader';

export type {
  CurriculumMetadata,
  ChapterContent,
  TheoryConcept,
  WorkedExample,
  PracticeProblem,
  CurriculumProgress,
  ChapterProgress,
  CurriculumState,
} from './types';
