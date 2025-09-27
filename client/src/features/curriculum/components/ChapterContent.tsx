import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  PenTool,
  RotateCcw,
} from 'lucide-react';
import {
  ChapterContent as ChapterContentType,
  ChapterProgress,
} from '../types';
import { TheorySection } from './TheorySection';
import { WorkedExamples } from './WorkedExamples';
import { PracticeProblems } from './PracticeProblems';
import { useCurriculumProgress } from '../hooks/useCurriculumProgress';

interface ChapterContentProps {
  chapter: ChapterContentType;
  progress?: ChapterProgress | undefined;
  onNext: () => void;
  onPrevious: () => void;
  currentChapter: number;
  totalChapters: number;
}

type SectionType = 'theory' | 'examples' | 'practice';

export function ChapterContent({
  chapter,
  progress,
  onNext,
  onPrevious,
  currentChapter,
  totalChapters,
}: ChapterContentProps) {
  const [activeSection, setActiveSection] = useState<SectionType>('theory');
  const {
    getCurrentMasteryLevel,
    progress: fullProgress,
    resetChapterProgress,
  } = useCurriculumProgress();

  // Get real-time mastery level
  const totalProblems = chapter.practice?.length || 8;

  // Force re-render when progress changes by accessing the progress state
  const chapterProgress = fullProgress.chapterProgress[chapter.id];

  // Use the stored mastery level directly from the chapter progress
  // Also force a re-calculation based on practice scores as a fallback
  const storedMasteryLevel = chapterProgress?.masteryLevel || 0;
  const calculatedMasteryLevel = chapterProgress?.practiceScores
    ? Object.values(chapterProgress.practiceScores).filter(score => score === 1)
        .length / totalProblems
    : 0;

  // Calculate final mastery level - use the higher of stored or calculated
  const finalMasteryLevel = chapterProgress
    ? Math.max(storedMasteryLevel, calculatedMasteryLevel)
    : 0;

  // Controlled re-render trigger when mastery level changes
  const [renderKey, setRenderKey] = useState(0);
  const [lastMasteryLevel, setLastMasteryLevel] = useState(0);

  useEffect(() => {
    const currentMastery = finalMasteryLevel;
    if (Math.abs(currentMastery - lastMasteryLevel) > 0.001) {
      // Use small threshold for floating point comparison
      setLastMasteryLevel(currentMastery);
      setRenderKey(prev => prev + 1);
    }
  }, [finalMasteryLevel, lastMasteryLevel]);

  const sections = [
    { id: 'theory' as SectionType, label: 'Reading', icon: BookOpen },
    { id: 'examples' as SectionType, label: 'Examples', icon: PenTool },
    { id: 'practice' as SectionType, label: 'Practice', icon: PenTool },
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'theory':
        return (
          <TheorySection
            concepts={chapter.theory.concepts}
            chapterNumber={currentChapter}
          />
        );

      case 'examples':
        return (
          <WorkedExamples
            key={`examples-${chapter.id}`}
            examples={chapter.examples}
          />
        );

      case 'practice':
        return (
          <PracticeProblems
            problems={chapter.practice}
            chapterId={chapter.id}
            progress={progress}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div
      key={`chapter-${chapter.id}-${renderKey}`}
      className='bg-white dark:bg-gray-800 rounded-lg shadow-sm'
    >
      {/* Chapter Header */}
      <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
              {chapter.title}
            </h2>
          </div>

          <div className='text-right'>
            <div className='text-sm text-gray-600 dark:text-gray-400'>
              Mastery Level
            </div>
            <div className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
              {Math.round(finalMasteryLevel * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className='border-b border-gray-200 dark:border-gray-700'>
        <nav className='flex justify-between items-center px-6'>
          <div className='flex space-x-8'>
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`
                  flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeSection === id
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                <Icon className='w-4 h-4' />
                <span>{label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              resetChapterProgress(chapter.id);
              setRenderKey(prev => prev + 1); // Force re-render
            }}
            className='flex items-center space-x-1 px-3 py-1 text-sm bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors'
            title='Reset chapter progress'
          >
            <RotateCcw className='w-4 h-4' />
            <span>Reset</span>
          </button>
        </nav>
      </div>

      {/* Section Content */}
      <div className='p-6'>{renderSectionContent()}</div>

      {/* Navigation Footer */}
      <div className='p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between'>
        <button
          onClick={onPrevious}
          disabled={currentChapter <= 1}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            currentChapter <= 1
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <ChevronLeft className='w-4 h-4' />
          <span>Previous Chapter</span>
        </button>

        <button
          onClick={onNext}
          disabled={currentChapter >= totalChapters}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            currentChapter >= totalChapters
              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-purple-500 text-white hover:bg-purple-600'
          }`}
        >
          <span>Next Chapter</span>
          <ChevronRight className='w-4 h-4' />
        </button>
      </div>
    </div>
  );
}
