import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useLocation } from 'wouter';
import { AlertCircle, BookOpen, Clock } from 'lucide-react';
import { CurriculumNavigation } from './CurriculumNavigation';
import { ChapterContent } from './ChapterContent';
import { MathJaxProvider } from './MathExpression';
import { useCurriculumProgress } from '../hooks/useCurriculumProgress';
import {
  loadCurriculumMetadata,
  loadChapterData,
} from '../lib/curriculum-data-loader';
import type { ChapterData, CurriculumMetadata } from '../types/curriculum';
import type { ChapterContent as ChapterContentType } from '../types';

export function PreAlgebraCurriculumPage() {
  const { chapter: chapterParam } = useParams<{ chapter?: string }>();
  const [, setLocation] = useLocation();

  const [metadata, setMetadata] = useState<CurriculumMetadata | null>(null);
  const [currentChapter, setCurrentChapter] =
    useState<ChapterContentType | null>(null);
  const [chapterTitles, setChapterTitles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentChapterNumber = chapterParam ? parseInt(chapterParam) : 1;
  const { progress, loading: progressLoading } = useCurriculumProgress();

  // Convert ChapterData to ChapterContentType
  const convertChapterData = (data: ChapterData): ChapterContentType => {
    return {
      id: data.id,
      title: data.title,
      objectives: data.objectives,
      prerequisites: data.prerequisites,
      introduction: data.introduction,
      theory: {
        concepts: data.theory.concepts.map(concept => ({
          title: concept.title,
          content: concept.content,
          latex: concept.latex || undefined,
          visuals: concept.visuals || undefined,
        })),
      },
      examples: data.examples.map(example => ({
        problem: example.problem,
        solution: example.solution,
        steps: example.steps,
        commonErrors: example.commonErrors || undefined,
        latex: example.latex || undefined,
      })),
      practice: data.practice.map(question => ({
        id: question.id,
        type: question.type as
          | 'multiple-choice'
          | 'fill-in'
          | 'step-by-step'
          | 'drag-drop',
        problem: question.problem,
        options: question.options || undefined,
        correct: question.correct,
        hints: question.hints,
        explanation: question.explanation,
        latex: undefined, // PracticeQuestion doesn't have latex property
        difficulty: question.difficulty as 1 | 2 | 3 | 4 | 5,
      })),
      tools: data.tools,
      commonPitfalls: data.commonPitfalls || undefined,
      assessment: data.assessment,
    };
  };

  // Load curriculum metadata and chapter titles on mount
  useEffect(() => {
    async function loadMetadataAndTitles() {
      try {
        setLoading(true);
        const data = await loadCurriculumMetadata('pre-algebra');
        setMetadata(data);

        // Load all chapter titles
        const titles: string[] = [];
        for (let i = 1; i <= data.chapters; i++) {
          const chapterId = `chapter-${i.toString().padStart(2, '0')}`;
          try {
            const chapterData = await loadChapterData('pre-algebra', chapterId);
            titles.push(chapterData.title);
          } catch (err) {
            titles.push(`Chapter ${i}`);
          }
        }
        setChapterTitles(titles);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load curriculum'
        );
      } finally {
        setLoading(false);
      }
    }

    loadMetadataAndTitles();
  }, []);

  // Load chapter content when chapter changes
  useEffect(() => {
    async function loadChapter() {
      if (
        !metadata ||
        currentChapterNumber < 1 ||
        currentChapterNumber > metadata.chapters
      ) {
        return;
      }

      try {
        setLoading(true);
        const chapterId = `chapter-${currentChapterNumber.toString().padStart(2, '0')}`;
        const chapterData = await loadChapterData('pre-algebra', chapterId);
        const convertedChapter = convertChapterData(chapterData);
        setCurrentChapter(convertedChapter);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chapter');
      } finally {
        setLoading(false);
      }
    }

    loadChapter();
  }, [metadata, currentChapterNumber]);

  const handleChapterSelect = (chapterNumber: number) => {
    if (chapterNumber === currentChapterNumber) return;

    setLocation(`/topic/pre-algebra/curriculum/${chapterNumber}`);
  };

  if (loading || progressLoading) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto'></div>
          <p className='mt-4 text-gray-600 dark:text-gray-400'>
            Loading curriculum...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-center max-w-md'>
          <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
            Failed to Load Curriculum
          </h2>
          <p className='text-gray-600 dark:text-gray-400 mb-4'>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className='px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors'
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!metadata) {
    return null;
  }

  return (
    <MathJaxProvider>
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
        {/* Header */}
        <header className='bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <BookOpen className='w-8 h-8 text-purple-500' />
                <div>
                  <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {metadata.title}
                  </h1>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    Chapter {currentChapterNumber}:{' '}
                    {currentChapter?.title || 'Loading...'}
                  </p>
                </div>
              </div>

              <div className='flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400'>
                <div className='flex items-center space-x-1'>
                  <Clock className='w-4 h-4' />
                  <span>{metadata.estimatedHours}h total</span>
                </div>
                <div className='px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium'>
                  {metadata.difficulty}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
            {/* Navigation Sidebar */}
            <div className='lg:col-span-1'>
              <div className='sticky top-6'>
                <CurriculumNavigation
                  metadata={metadata}
                  progress={progress}
                  currentChapter={currentChapterNumber}
                  onChapterSelect={handleChapterSelect}
                  chapterTitles={chapterTitles}
                />
              </div>
            </div>

            {/* Chapter Content */}
            <div className='lg:col-span-3'>
              {currentChapter ? (
                <ChapterContent
                  chapter={currentChapter}
                  progress={progress.chapterProgress[currentChapter.id]}
                  currentChapter={currentChapterNumber}
                  totalChapters={metadata.chapters}
                  curriculum='pre-algebra'
                  onNext={() => {
                    if (currentChapterNumber < metadata.chapters) {
                      handleChapterSelect(currentChapterNumber + 1);
                    }
                  }}
                  onPrevious={() => {
                    if (currentChapterNumber > 1) {
                      handleChapterSelect(currentChapterNumber - 1);
                    }
                  }}
                />
              ) : (
                <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center'>
                  <div className='animate-pulse'>
                    <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-4'></div>
                    <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto mb-8'></div>
                    <div className='space-y-3'>
                      <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded'></div>
                      <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6'></div>
                      <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6'></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MathJaxProvider>
  );
}
