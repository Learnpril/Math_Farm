// Optimized TopicPage with lazy loading and performance improvements
import { useParams, Link } from 'wouter';
import { useEffect, useRef, useState, Suspense, lazy } from 'react';
import {
  ArrowLeft,
  Clock,
  Star,
  BookOpen,
  CheckCircle,
  Circle,
  AlertCircle,
  TrendingUp,
  Zap,
} from 'lucide-react';
import {
  useKeyboardNavigation,
  useGlobalKeyboardShortcuts,
} from '../hooks/useKeyboardNavigation';
import {
  FocusManager,
  FocusAnnouncer,
} from '../components/accessibility/FocusManager';
import { KeyboardShortcutHint } from '../components/accessibility/KeyboardShortcuts';
import {
  NavigationAnnouncer,
  ProgressAnnouncer,
} from '../components/accessibility/ScreenReaderAnnouncements';
import { Badge } from '../components/ui/badge';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useProgressTracker } from '../hooks/useProgressTracker';
import { ProgressiveLoader } from '../components/ProgressiveLoader';
import { LazyWrapper } from '../components/LazyWrapper';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { preloadMathJax } from '../lib/mathJaxLoader';
import topicsData from '../data/topicsData.json';
import { lessonContentData } from '../data/lessonContent';
import { practiceProblemsData } from '../data/practiceProblems';
import type { Topic } from '../../../shared/types';

// Lazy load heavy components
const LazyMathExpression = lazy(() =>
  import('../components/MathExpression').then(module => ({
    default: module.MathExpression,
  }))
);

const LazyLessonContent = lazy(() =>
  import('../components/LessonContent').then(module => ({
    default: module.LessonContent,
  }))
);

const LazyTopicPracticeSection = lazy(() =>
  import('../features/practice/components/TopicPracticeSection').then(
    module => ({
      default: module.TopicPracticeSection,
    })
  )
);

const LazyProgressTracker = lazy(() =>
  import('../features/practice/components/ProgressTracker').then(module => ({
    default: module.ProgressTracker,
  }))
);

const LazyTimeChallengeMode = lazy(() =>
  import('../features/practice/components/TimeChallengeMode').then(module => ({
    default: module.TimeChallengeMode,
  }))
);

const LazyRelatedTopicsSuggestions = lazy(() =>
  import('../components/RelatedTopicsSuggestions').then(module => ({
    default: module.RelatedTopicsSuggestions,
  }))
);

export function OptimizedTopicPage() {
  const params = useParams();
  const topicId = params.id;
  const mainContentRef = useRef<HTMLDivElement>(null);
  const navigationRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [focusAnnouncement, setFocusAnnouncement] = useState('');
  const [isChallengeMode, setIsChallengeMode] = useState(false);
  const sessionInitialized = useRef(false);

  // Use the progress tracking hook
  const {
    userProgress,
    startTopicSession,
    endTopicSession,
    markLessonSectionCompleted,
    markPracticeCompleted,
    getProgressStats,
    getTopicProgress,
    isTopicCompleted,
    getTopicCompletionPercentage,
    updateStreak,
  } = useProgressTracker();

  // Find the topic data with error handling
  const topic = topicsData.find(t => t.id === topicId) as Topic | undefined;

  // Get lesson and practice data for progress calculations
  const lessonContent = lessonContentData[topicId || ''];
  const practiceProblems = practiceProblemsData[topicId || ''];
  const totalLessonSections = lessonContent?.sections.length || 0;
  const totalPracticeProblems = practiceProblems?.length || 0;

  // Preload MathJax when topic loads
  useEffect(() => {
    if (topic) {
      preloadMathJax();
    }
  }, [topic]);

  // Helper functions for progress tracking
  const getPrerequisiteProgress = (prereqId: string) => {
    return getTopicProgress(prereqId);
  };

  // Gamification handlers
  const handleChallengeComplete = (success: boolean, timeSpent: number) => {
    if (success) {
      console.log('Challenge completed successfully!');
    }
  };

  const handleSectionComplete = (sectionId: string) => {
    markLessonSectionCompleted(topicId || '', sectionId);
  };

  const handleProblemComplete = (problemId: string, isCorrect: boolean) => {
    if (isCorrect && topicId) {
      try {
        markPracticeCompleted(topicId, problemId);
      } catch (error) {
        console.error('Error completing problem:', error);
      }
    }
  };

  // Keyboard navigation setup
  const keyboardNav = useKeyboardNavigation(mainContentRef, {
    enableArrowKeys: true,
    enableHomeEnd: true,
    enableEscape: true,
    customHandlers: {
      'Ctrl+h': () => {
        const hintButton = document.querySelector(
          '[data-action="toggle-hint"]'
        ) as HTMLElement;
        hintButton?.click();
      },
      'Ctrl+s': () => {
        const solutionButton = document.querySelector(
          '[data-action="toggle-solution"]'
        ) as HTMLElement;
        solutionButton?.click();
      },
      'Ctrl+Enter': () => {
        const submitButton = document.querySelector(
          '[data-action="submit-answer"]'
        ) as HTMLElement;
        submitButton?.click();
      },
    },
  });

  // Global keyboard shortcuts for topic pages
  useGlobalKeyboardShortcuts({
    'Alt+l': () => {
      const lessonContent = document.getElementById('lesson-content');
      if (lessonContent) {
        lessonContent.focus();
        setFocusAnnouncement('Focused on lesson content');
      }
    },
    'Alt+p': () => {
      const practiceProblems = document.getElementById('practice-problems');
      if (practiceProblems) {
        practiceProblems.focus();
        setFocusAnnouncement('Focused on practice problems');
      }
    },
    'Alt+b': () => {
      window.location.href = '/#topics';
    },
  });

  // Focus management on page load for accessibility
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.focus();
      if (topic) {
        setFocusAnnouncement(
          `Loaded ${topic.title} topic page. Use Alt+L for lesson content, Alt+P for practice problems.`
        );
      }
    }

    // Simulate loading state for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (!topic) {
        setError(`Topic "${topicId}" not found`);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [topic, topicId]);

  // Track topic visit and update streak
  useEffect(() => {
    if (topic && !isLoading && topicId && !sessionInitialized.current) {
      sessionInitialized.current = true;
      startTopicSession(topicId);
      updateStreak();
    }

    return () => {
      if (sessionInitialized.current) {
        endTopicSession();
        sessionInitialized.current = false;
      }
    };
  }, [topic, isLoading, topicId]);

  // Loading state with skeleton
  if (isLoading) {
    return <SkeletonLoader variant='topic' />;
  }

  // Enhanced error state with smart suggestions
  if (error || !topic) {
    const getSimilarTopics = () => {
      if (!topicId) return topicsData.slice(0, 6);

      const searchTerm = topicId.replace(/-/g, ' ').toLowerCase();
      const similarTopics = topicsData.filter(
        t =>
          t.title.toLowerCase().includes(searchTerm) ||
          t.id.toLowerCase().includes(searchTerm) ||
          t.description.toLowerCase().includes(searchTerm) ||
          searchTerm
            .split(' ')
            .some(
              word =>
                t.title.toLowerCase().includes(word) ||
                t.id.toLowerCase().includes(word)
            )
      );

      return similarTopics.length > 0
        ? similarTopics.slice(0, 6)
        : topicsData.slice(0, 6);
    };

    const similarTopics = getSimilarTopics();

    return (
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-2xl mx-auto text-center'>
          <AlertCircle className='w-16 h-16 text-destructive mx-auto mb-4' />
          <h1 className='text-3xl font-bold text-foreground mb-4'>
            Topic Not Found
          </h1>
          <p className='text-lg text-muted-foreground mb-2'>
            {error || `The topic "${topicId}" could not be found.`}
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center mb-12'>
            <Link
              href='/#topics'
              className='inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            >
              <ArrowLeft className='w-4 h-4' />
              Back to Topics
            </Link>
          </div>

          <div className='text-left'>
            <h3 className='text-xl font-semibold text-foreground mb-6 text-center'>
              Similar Topics
            </h3>

            <div className='grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
              {similarTopics.map(suggestedTopic => (
                <Link
                  key={suggestedTopic.id}
                  href={`/topic/${suggestedTopic.id}`}
                  className='group block p-4 bg-card border rounded-lg hover:bg-muted/50 hover:border-primary/20 transition-all duration-200'
                >
                  <div className='flex items-start gap-3'>
                    <div className='flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center'>
                      <BookOpen className='w-4 h-4 text-primary' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h4 className='font-medium text-foreground group-hover:text-primary transition-colors'>
                        {suggestedTopic.title}
                      </h4>
                      <p className='text-sm text-muted-foreground mb-2'>
                        {suggestedTopic.description}
                      </p>
                      <div className='flex items-center gap-2 text-xs'>
                        <Badge variant='outline' className='text-xs'>
                          {suggestedTopic.level}
                        </Badge>
                        <span className='text-muted-foreground'>
                          {suggestedTopic.estimatedTime} min
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <FocusManager
      isActive={!isLoading && !error}
      announcement={focusAnnouncement}
      autoFocus={false}
    >
      <div className='container mx-auto px-4 py-8'>
        {/* Focus announcements */}
        <FocusAnnouncer message={focusAnnouncement} />

        {/* Navigation announcements */}
        <NavigationAnnouncer
          currentPage={topic ? `${topic.title} topic page` : 'Topic page'}
        />

        {/* Back Navigation */}
        <div className='mb-6' ref={navigationRef}>
          <Link
            href='/#topics'
            className='inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md'
            aria-label='Go back to topics section'
          >
            <ArrowLeft className='w-4 h-4' aria-hidden='true' />
            Back to Topics
          </Link>
          <KeyboardShortcutHint
            keys={['Alt', 'b']}
            description='Quick shortcut'
            className='ml-4 hidden sm:inline-flex'
          />
        </div>

        {/* Responsive Layout with Sidebar */}
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
          {/* Main Content Area */}
          <div
            className='lg:col-span-3 space-y-8'
            ref={mainContentRef}
            tabIndex={-1}
            aria-label={`${topic.title} topic content`}
            role='main'
          >
            {/* Topic Header */}
            <ProgressiveLoader priority='high'>
              <TopicHeader
                topic={topic}
                isChallengeMode={isChallengeMode}
                setIsChallengeMode={setIsChallengeMode}
                getPrerequisiteProgress={getPrerequisiteProgress}
                isTopicCompleted={isTopicCompleted}
              />
            </ProgressiveLoader>

            {/* Lesson Content System */}
            <ErrorBoundary>
              <div
                id='lesson-content'
                tabIndex={-1}
                aria-label='Lesson content section'
              >
                <LazyWrapper
                  fallback='skeleton'
                  skeletonVariant='card'
                  loadingText='Loading lesson content...'
                >
                  <LessonContentSection
                    topicId={topic.id}
                    handleSectionComplete={handleSectionComplete}
                    handleProblemComplete={handleProblemComplete}
                    getTopicProgress={getTopicProgress}
                  />
                </LazyWrapper>
              </div>
            </ErrorBoundary>
          </div>

          {/* Sidebar - Progress and Related Topics */}
          <div className='lg:col-span-1 space-y-6'>
            {/* Time Challenge Mode */}
            <ProgressiveLoader priority='normal' delay={200}>
              <LazyWrapper fallback='skeleton' skeletonVariant='card'>
                <LazyTimeChallengeMode
                  estimatedTime={topic.estimatedTime}
                  topicId={topic.id}
                  onChallengeComplete={handleChallengeComplete}
                  isActive={isChallengeMode}
                />
              </LazyWrapper>
            </ProgressiveLoader>

            {/* Enhanced Progress Section */}
            <ProgressiveLoader priority='normal' delay={300}>
              <LazyWrapper fallback='skeleton' skeletonVariant='card'>
                <LazyProgressTracker
                  topicId={topic.id}
                  topicProgress={getTopicProgress(topic.id)}
                  totalLessonSections={totalLessonSections}
                  totalPracticeProblems={totalPracticeProblems}
                  completionPercentage={getTopicCompletionPercentage(
                    topic.id,
                    totalLessonSections,
                    totalPracticeProblems
                  )}
                  isCompleted={isTopicCompleted(topic.id)}
                  stats={getProgressStats()}
                />
              </LazyWrapper>
            </ProgressiveLoader>

            {/* Enhanced Related Topics */}
            <ProgressiveLoader priority='low' delay={500}>
              <LazyWrapper fallback='skeleton' skeletonVariant='card'>
                <LazyRelatedTopicsSuggestions
                  currentTopic={topic}
                  allTopics={topicsData as Topic[]}
                  userProgress={userProgress}
                  getTopicProgress={getTopicProgress}
                  isTopicCompleted={isTopicCompleted}
                  getTopicCompletionPercentage={getTopicCompletionPercentage}
                />
              </LazyWrapper>
            </ProgressiveLoader>
          </div>
        </div>
      </div>
    </FocusManager>
  );
}

// Optimized Topic Header Component
interface TopicHeaderProps {
  topic: Topic;
  isChallengeMode: boolean;
  setIsChallengeMode: (mode: boolean) => void;
  getPrerequisiteProgress: (prereqId: string) => any;
  isTopicCompleted: (topicId: string) => boolean;
}

function TopicHeader({
  topic,
  isChallengeMode,
  setIsChallengeMode,
  getPrerequisiteProgress,
  isTopicCompleted,
}: TopicHeaderProps) {
  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6'>
        <div className='flex-1'>
          {/* Title and Level Badge */}
          <div className='flex flex-col sm:flex-row sm:items-center gap-3 mb-4'>
            <h1 className='text-3xl sm:text-4xl font-bold text-foreground'>
              {topic.title}
            </h1>
            <Badge variant={topic.level as any} className='w-fit'>
              {topic.level.charAt(0).toUpperCase() + topic.level.slice(1)}
            </Badge>
          </div>

          <p className='text-lg text-muted-foreground mb-6'>
            {topic.description}
          </p>

          {/* Enhanced Topic Metadata */}
          <div className='flex flex-wrap items-center gap-4 mb-6'>
            {/* Estimated Time */}
            <div className='flex items-center gap-2 px-3 py-2 bg-muted rounded-lg'>
              <Clock className='w-4 h-4 text-muted-foreground' />
              <span className='text-sm font-medium'>
                {topic.estimatedTime} min
              </span>
            </div>

            {/* Difficulty Badge */}
            <div className='flex items-center gap-2'>
              <TrendingUp className='w-4 h-4 text-muted-foreground' />
              <Badge
                variant={`difficulty${topic.difficulty}` as any}
                className='flex items-center gap-1'
              >
                <span>Difficulty {topic.difficulty}/5</span>
                <div className='flex gap-0.5 ml-1'>
                  {[1, 2, 3, 4, 5].map(level => (
                    <div
                      key={level}
                      className={`w-1.5 h-1.5 rounded-full ${
                        level <= topic.difficulty
                          ? level <= 2
                            ? 'bg-green-500'
                            : level <= 3
                              ? 'bg-yellow-500'
                              : level <= 4
                                ? 'bg-orange-500'
                                : 'bg-red-500'
                          : 'bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
              </Badge>
            </div>

            {/* Challenge Mode Toggle */}
            <button
              onClick={() => setIsChallengeMode(!isChallengeMode)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isChallengeMode
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
              }`}
            >
              <Zap className='w-4 h-4' />
              {isChallengeMode ? 'Challenge Active' : 'Start Challenge'}
            </button>

            {/* Curriculum Link for Arithmetic */}
            {topic.id === 'arithmetic' && (
              <Link
                href={`/topic/arithmetic/curriculum/1`}
                className='flex items-center gap-2 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg text-sm font-medium transition-colors border border-purple-200'
              >
                <BookOpen className='w-4 h-4' />
                Start Curriculum
              </Link>
            )}
          </div>

          {/* Prerequisites Section */}
          {topic.prerequisites.length > 0 && (
            <div className='mb-6'>
              <h3 className='text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2'>
                <BookOpen className='w-4 h-4' />
                Prerequisites
              </h3>
              <div className='flex flex-wrap gap-2'>
                {topic.prerequisites.map(prereqId => {
                  const prereqTopic = topicsData.find(
                    t => t.id === prereqId
                  ) as Topic | undefined;
                  const isCompleted = isTopicCompleted(prereqId);
                  const progress = getPrerequisiteProgress(prereqId);

                  return prereqTopic ? (
                    <Link
                      key={prereqId}
                      href={`/topic/${prereqId}`}
                      className='inline-flex items-center gap-2 px-3 py-2 bg-card border rounded-lg hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                    >
                      <span className='text-sm font-medium'>
                        {prereqTopic.title}
                      </span>
                      {isCompleted ? (
                        <CheckCircle className='w-3 h-3 text-green-600' />
                      ) : progress ? (
                        <Circle className='w-3 h-3 text-yellow-600' />
                      ) : (
                        <Circle className='w-3 h-3 text-muted-foreground' />
                      )}
                    </Link>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>

        {/* Math Expression Display */}
        <div className='sm:w-80'>
          <div className='bg-card border rounded-lg p-6 text-center'>
            <h3 className='text-sm font-medium text-muted-foreground mb-4'>
              Key Formula
            </h3>
            <div className='text-lg'>
              <LazyWrapper fallback='skeleton' skeletonVariant='math'>
                <LazyMathExpression
                  expression={topic.mathExpression}
                  priority='high'
                />
              </LazyWrapper>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Lesson Content Section Component
interface LessonContentSectionProps {
  topicId: string;
  handleSectionComplete: (sectionId: string) => void;
  handleProblemComplete: (problemId: string, isCorrect: boolean) => void;
  getTopicProgress: (topicId: string) => any;
}

function LessonContentSection({
  topicId,
  handleSectionComplete,
  handleProblemComplete,
  getTopicProgress,
}: LessonContentSectionProps) {
  const lessonContent = lessonContentData[topicId];
  const topicProgress = getTopicProgress(topicId);

  const completedSections = topicProgress?.lessonSectionsCompleted || [];
  const completedProblems = topicProgress?.practiceProblemsCompleted || [];

  return (
    <div className='space-y-8'>
      {lessonContent && (
        <ProgressiveLoader priority='normal' delay={100}>
          <LazyWrapper fallback='skeleton' skeletonVariant='card'>
            <LazyLessonContent
              lessonContent={lessonContent}
              onSectionComplete={handleSectionComplete}
              completedSections={completedSections}
            />
          </LazyWrapper>
        </ProgressiveLoader>
      )}

      {/* Enhanced Practice Problems Section */}
      <ProgressiveLoader priority='normal' delay={200}>
        <LazyWrapper fallback='skeleton' skeletonVariant='card'>
          <LazyTopicPracticeSection
            topicId={topicId}
            onProblemComplete={handleProblemComplete}
            completedProblems={completedProblems}
          />
        </LazyWrapper>
      </ProgressiveLoader>
    </div>
  );
}

// Export the optimized component
export { OptimizedTopicPage as TopicPage };
