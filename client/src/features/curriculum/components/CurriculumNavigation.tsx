import { ChevronRight, CheckCircle, Circle } from 'lucide-react';
import { CurriculumMetadata, CurriculumProgress } from '../types';

interface CurriculumNavigationProps {
  metadata: CurriculumMetadata;
  progress: CurriculumProgress;
  currentChapter: number;
  onChapterSelect: (chapterNumber: number) => void;
  className?: string;
}

export function CurriculumNavigation({
  metadata,
  progress,
  currentChapter,
  onChapterSelect,
  className = '',
}: CurriculumNavigationProps) {
  const getChapterStatus = (chapterNumber: number) => {
    if (progress.completedChapters.includes(chapterNumber)) {
      return 'completed';
    }
    return 'available'; // All chapters are always available
  };

  const getChapterIcon = (chapterNumber: number) => {
    const status = getChapterStatus(chapterNumber);

    switch (status) {
      case 'completed':
        return <CheckCircle className='w-5 h-5 text-green-500' />;
      case 'available':
      default:
        return <Circle className='w-5 h-5 text-purple-500' />;
    }
  };

  const getChapterTitle = (chapterNumber: number): string => {
    const titles = [
      'Numbers and Place Value',
      'Addition and Subtraction',
      'Multiplication Basics',
      'Division Basics',
      'Fractions',
      'Decimals',
      'Percentages and Ratios',
      'Problem Solving and Applications',
    ];

    return titles[chapterNumber - 1] || `Chapter ${chapterNumber}`;
  };

  const getMasteryLevel = (chapterNumber: number): number => {
    const chapterId = `chapter-${chapterNumber.toString().padStart(2, '0')}`;
    const chapterProgress = progress.chapterProgress[chapterId];

    if (!chapterProgress) return 0;

    const scores = Object.values(chapterProgress.practiceScores);
    if (scores.length === 0) return 0;

    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  };

  return (
    <nav
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className='p-4 border-b border-gray-200 dark:border-gray-700'>
        <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
          {metadata.title}
        </h2>
        <div className='mt-2'>
          <div className='flex items-center justify-between text-sm text-gray-600 dark:text-gray-400'>
            <span>Progress</span>
            <span>
              {progress.completedChapters.length}/{metadata.chapters} chapters
            </span>
          </div>
          <div className='mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
            <div
              className='bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300'
              style={{
                width: `${(progress.completedChapters.length / metadata.chapters) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className='p-2'>
        {Array.from({ length: metadata.chapters }, (_, i) => i + 1).map(
          chapterNumber => {
            const status = getChapterStatus(chapterNumber);
            const isActive = chapterNumber === currentChapter;
            const masteryLevel = getMasteryLevel(chapterNumber);

            return (
              <button
                key={chapterNumber}
                onClick={() => onChapterSelect(chapterNumber)}
                className={`
                w-full flex items-center p-3 rounded-lg transition-all duration-200 cursor-pointer
                ${
                  isActive
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }
              `}
              >
                <div className='flex items-center flex-1'>
                  {getChapterIcon(chapterNumber)}

                  <div className='ml-3 flex-1 text-left'>
                    <div className='flex items-center justify-between'>
                      <span
                        className={`text-sm font-medium ${
                          isActive
                            ? 'text-purple-700 dark:text-purple-300'
                            : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        Chapter {chapterNumber}
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 ${
                          isActive ? 'text-purple-500' : 'text-gray-400'
                        }`}
                      />
                    </div>

                    <p
                      className={`text-xs mt-1 ${
                        isActive
                          ? 'text-purple-600 dark:text-purple-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {getChapterTitle(chapterNumber)}
                    </p>

                    {status === 'completed' && masteryLevel > 0 && (
                      <div className='mt-2'>
                        <div className='flex items-center justify-between text-xs text-gray-500'>
                          <span>Mastery</span>
                          <span>{Math.round(masteryLevel * 100)}%</span>
                        </div>
                        <div className='mt-1 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1'>
                          <div
                            className='bg-green-500 h-1 rounded-full transition-all duration-300'
                            style={{ width: `${masteryLevel * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          }
        )}
      </div>

      <div className='p-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400'>
        <div className='flex justify-between'>
          <span>
            Time spent: {Math.round(progress.totalTimeSpent / 60)}h{' '}
            {progress.totalTimeSpent % 60}m
          </span>
          <span>
            Last accessed:{' '}
            {new Date(progress.lastAccessed).toLocaleDateString()}
          </span>
        </div>
      </div>
    </nav>
  );
}
