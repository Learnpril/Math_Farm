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

export function AlgebraCurriculumPage() {
  const { chapter: chapterParam } = useParams<{ chapter?: string }>();
  const [, setLocation] = useLocation();

  const [metadata, setMetadata] = useState<CurriculumMetadata | null>(null);
  const [currentChapter, setCurrentChapter] =
    useState<ChapterContentType | null>(null);
  const [chapterTitles, setChapterTitles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentChapterNumber = chapterParam ? parseInt(chapterParam) : 1;
  const { progress, loading: progressLoading } =
    useCurriculumProgress('algebra');

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

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load metadata
        const metadataResult = await loadCurriculumMetadata('algebra');
        setMetadata(metadataResult);

        // Load all chapter titles
        const titles: string[] = [];
        for (let i = 1; i <= metadataResult.chapters; i++) {
          const chapterId = `chapter-${i.toString().padStart(2, '0')}`;
          try {
            const chapterData = await loadChapterData('algebra', chapterId);
            titles.push(chapterData.title);
          } catch (err) {
            titles.push(`Chapter ${i}`);
          }
        }

        setChapterTitles(titles);

        // Load current chapter data
        const chapterId = `chapter-${currentChapterNumber.toString().padStart(2, '0')}`;
        const chapterData = await loadChapterData('algebra', chapterId);
        const convertedChapter = convertChapterData(chapterData);
        setCurrentChapter(convertedChapter);
      } catch (err) {
        console.error('❌ Failed to load algebra curriculum:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load curriculum data'
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentChapterNumber]);

  const handleChapterChange = (chapterNumber: number) => {
    setLocation(`/topic/algebra/curriculum/${chapterNumber}`);
  };

  if (loading || progressLoading) {
    return (
      <MathJaxProvider>
        <div className='min-h-screen bg-gradient-to-br from-background to-muted/20'>
          <div className='container mx-auto px-4 py-8'>
            <div className='flex items-center justify-center min-h-[400px]'>
              <div className='flex items-center gap-3 text-muted-foreground'>
                <Clock className='h-5 w-5 animate-spin' />
                <span>Loading Algebra curriculum...</span>
              </div>
            </div>
          </div>
        </div>
      </MathJaxProvider>
    );
  }

  if (error) {
    return (
      <MathJaxProvider>
        <div className='min-h-screen bg-gradient-to-br from-background to-muted/20'>
          <div className='container mx-auto px-4 py-8'>
            <div className='flex items-center justify-center min-h-[400px]'>
              <div className='flex items-center gap-3 text-destructive'>
                <AlertCircle className='h-5 w-5' />
                <span>{error}</span>
              </div>
            </div>
          </div>
        </div>
      </MathJaxProvider>
    );
  }

  if (!metadata || !currentChapter) {
    console.log(
      '📭 Showing no data state - metadata:',
      !!metadata,
      'currentChapter:',
      !!currentChapter
    );
    return (
      <MathJaxProvider>
        <div className='min-h-screen bg-gradient-to-br from-background to-muted/20'>
          <div className='container mx-auto px-4 py-8'>
            <div className='flex items-center justify-center min-h-[400px]'>
              <div className='flex items-center gap-3 text-muted-foreground'>
                <BookOpen className='h-5 w-5' />
                <span>No curriculum data available</span>
              </div>
            </div>
          </div>
        </div>
      </MathJaxProvider>
    );
  }

  return (
    <MathJaxProvider>
      <div className='min-h-screen bg-gradient-to-br from-background to-muted/20'>
        <div className='container mx-auto px-4 py-8'>
          <div className='mb-8'>
            <h1 className='text-4xl font-bold text-foreground mb-2'>
              {metadata.title}
            </h1>
            <p className='text-lg text-muted-foreground'>
              Master the fundamentals of algebraic thinking, from linear
              equations to quadratic functions
            </p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
            <div className='lg:col-span-1'>
              <CurriculumNavigation
                metadata={metadata}
                currentChapter={currentChapterNumber}
                onChapterSelect={handleChapterChange}
                progress={progress}
                chapterTitles={chapterTitles}
              />
            </div>

            <div className='lg:col-span-3'>
              <ChapterContent
                chapter={currentChapter}
                currentChapter={currentChapterNumber}
                totalChapters={metadata.chapters}
                curriculum='algebra'
                onNext={() => {
                  if (currentChapterNumber < metadata.chapters) {
                    setLocation(
                      `/topic/algebra/curriculum/${currentChapterNumber + 1}`
                    );
                  }
                }}
                onPrevious={() => {
                  if (currentChapterNumber > 1) {
                    setLocation(
                      `/topic/algebra/curriculum/${currentChapterNumber - 1}`
                    );
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </MathJaxProvider>
  );
}
