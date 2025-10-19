// React 19 - no need to import React
import { useParams, Link } from 'wouter';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
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
import { MathExpression } from '../components/MathExpression';
import { Badge } from '../components/ui/badge';
import { LessonContent } from '../components/LessonContent';
import { TopicPracticeSection } from '../features/practice/components/TopicPracticeSection';
import { ProgressTracker } from '../features/practice/components';
import { BadgeSystem } from '../components/BadgeSystem';
import { SuccessAnimation } from '../components/SuccessAnimation';
import { RelatedTopicsSuggestions } from '../components/RelatedTopicsSuggestions';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { TopicForumSection } from '../features/forum/components/TopicForumSection';
// JSXGraph demos temporarily disabled to prevent DOM manipulation errors
// import {
//   JSXGraphDemo,
//   demoInitializers,
//   demoConfigs,
// } from "../components/JSXGraphDemo";
import { useProgressTracker } from '../hooks/useProgressTracker';
import topicsData from '../data/topicsData.json';
import { lessonContentData } from '../data/lessonContent';
import { practiceProblemsData } from '../data/practiceProblems';
import type { Topic } from '../../../shared/types';

export function TopicPage() {
  const params = useParams();
  const topicId = params.id;
  const mainContentRef = useRef<HTMLDivElement>(null);
  const navigationRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [focusAnnouncement, setFocusAnnouncement] = useState('');

  // Gamification states
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successAnimationType, setSuccessAnimationType] = useState<
    'problem' | 'section' | 'topic' | 'badge' | 'streak'
  >('problem');
  const [successMessage, setSuccessMessage] = useState('');

  const sessionInitialized = useRef(false);

  // Use the new progress tracking hook
  const {
    userProgress,
    startTopicSession,
    endTopicSession,
    markLessonSectionCompleted,
    markPracticeCompleted,
    markTopicCompleted,
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

  // Helper functions for progress tracking
  const getPrerequisiteProgress = (prereqId: string) => {
    return getTopicProgress(prereqId);
  };

  // Gamification handlers
  const handleBadgeEarned = (badge: any) => {
    // Don't show success animation for badges, let BadgeSystem handle it
  };

  const handleSectionComplete = (sectionId: string) => {
    markLessonSectionCompleted(topicId || '', sectionId);
    // Temporarily disabled success animation to fix modal issues
    // setSuccessAnimationType("section");
    // setSuccessMessage("Section Completed!");
    // setShowSuccessAnimation(true);
  };

  const handleProblemComplete = (problemId: string, isCorrect: boolean) => {
    if (isCorrect && topicId) {
      try {
        markPracticeCompleted(topicId, problemId);
        // Temporarily disabled success animation to fix modal issues
        // setSuccessAnimationType("problem");
        // setSuccessMessage("Problem Solved!");
        // setShowSuccessAnimation(true);
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
        // Toggle hint in current practice problem
        const hintButton = document.querySelector(
          '[data-action="toggle-hint"]'
        ) as HTMLElement;
        hintButton?.click();
      },
      'Ctrl+s': () => {
        // Toggle solution in current practice problem
        const solutionButton = document.querySelector(
          '[data-action="toggle-solution"]'
        ) as HTMLElement;
        solutionButton?.click();
      },
      'Ctrl+Enter': () => {
        // Submit current practice problem
        const submitButton = document.querySelector(
          '[data-action="submit-answer"]'
        ) as HTMLElement;
        submitButton?.click();
      },
      'Ctrl+r': () => {
        // Reset current practice problem
        const resetButton = document.querySelector(
          '[data-action="reset-problem"]'
        ) as HTMLElement;
        resetButton?.click();
      },
    },
  });

  // Global keyboard shortcuts for topic pages
  useGlobalKeyboardShortcuts({
    'Alt+l': () => {
      // Focus lesson content
      const lessonContent = document.getElementById('lesson-content');
      if (lessonContent) {
        lessonContent.focus();
        setFocusAnnouncement('Focused on lesson content');
      }
    },
    'Alt+p': () => {
      // Focus practice problems
      const practiceProblems = document.getElementById('practice-problems');
      if (practiceProblems) {
        practiceProblems.focus();
        setFocusAnnouncement('Focused on practice problems');
      }
    },
    'Alt+b': () => {
      // Go back to topics
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

  // Auto-redirect to curriculum for topics that have structured curricula
  useEffect(() => {
    if (topic && !isLoading) {
      if (topic.id === 'arithmetic' || topic.id === 'pre-algebra') {
        // Redirect to curriculum page
        window.location.href = `/topic/${topic.id}/curriculum/1`;
      }
    }
  }, [topic, isLoading]);

  // Track topic visit and update streak
  useEffect(() => {
    if (topic && !isLoading && topicId && !sessionInitialized.current) {
      sessionInitialized.current = true;
      startTopicSession(topicId);
      updateStreak();
    }

    // Cleanup session tracking when leaving the page
    return () => {
      if (sessionInitialized.current) {
        endTopicSession();
        sessionInitialized.current = false;
      }
    };
  }, [topic, isLoading, topicId]); // Removed function dependencies to prevent infinite loop

  // Loading state
  if (isLoading) {
    return (
      <div className='container mx-auto px-4 py-16'>
        <div className='animate-pulse'>
          <div className='h-8 bg-muted rounded w-1/4 mb-6'></div>
          <div className='h-12 bg-muted rounded w-3/4 mb-4'></div>
          <div className='h-6 bg-muted rounded w-1/2 mb-8'></div>
          <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
            <div className='lg:col-span-3'>
              <div className='h-64 bg-muted rounded'></div>
            </div>
            <div className='lg:col-span-1'>
              <div className='h-48 bg-muted rounded'></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced error state with smart suggestions
  if (error || !topic) {
    // Find similar topics based on the requested topic ID
    const getSimilarTopics = () => {
      if (!topicId) return topicsData.slice(0, 6);

      const searchTerm = topicId.replace(/-/g, ' ').toLowerCase();

      // Find topics with similar names or content
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

      // If no similar topics found, return popular topics
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

          {topicId && (
            <div className='inline-flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-700 dark:text-amber-300 mb-8'>
              <AlertCircle className='w-4 h-4' />
              <span className='text-sm'>
                Looking for: <strong>"{topicId.replace(/-/g, ' ')}"</strong>
              </span>
            </div>
          )}

          <div className='flex flex-col sm:flex-row gap-4 justify-center mb-12'>
            <Link
              href='/#topics'
              className='inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            >
              <ArrowLeft className='w-4 h-4' />
              Back to Topics
            </Link>

            <Link
              href='/tools'
              className='inline-flex items-center gap-2 px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            >
              <Zap className='w-4 h-4' />
              Try Math Tools
            </Link>
          </div>

          <div className='text-left'>
            <h3 className='text-xl font-semibold text-foreground mb-6 text-center'>
              {topicId ? 'Similar Topics' : 'Popular Topics'}
            </h3>

            <div className='grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
              {similarTopics.map(suggestedTopic => (
                <Link
                  key={suggestedTopic.id}
                  href={`/topic/${suggestedTopic.id}`}
                  className='group block p-4 bg-card border rounded-lg hover:bg-muted/50 hover:border-primary/20 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                >
                  <div className='flex items-start gap-3'>
                    <div className='flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors'>
                      <BookOpen className='w-4 h-4 text-primary' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2 mb-1'>
                        <h4 className='font-medium text-foreground group-hover:text-primary transition-colors'>
                          {suggestedTopic.title}
                        </h4>
                        <TrendingUp className='w-3 h-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all opacity-0 group-hover:opacity-100' />
                      </div>
                      <p className='text-sm text-muted-foreground mb-2 overflow-hidden'>
                        {suggestedTopic.description}
                      </p>
                      <div className='flex items-center gap-2 text-xs'>
                        <Badge variant='outline' className='text-xs'>
                          {suggestedTopic.level}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className='mt-8 p-4 bg-muted/50 rounded-lg'>
            <p className='text-sm text-muted-foreground'>
              Can't find the topic you're looking for? Try browsing by
              <Link
                href='/#topics'
                className='text-primary hover:text-primary/80 font-medium mx-1'
              >
                learning approach
              </Link>
              or check out our
              <Link
                href='/tools'
                className='text-primary hover:text-primary/80 font-medium mx-1'
              >
                interactive tools
              </Link>
              .
            </p>
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
            aria-describedby='topic-shortcuts-help'
          >
            {/* Keyboard shortcuts help */}
            <div id='topic-shortcuts-help' className='sr-only'>
              Use Alt+l to focus lesson content, Alt+p to focus practice
              problems, Ctrl+h to toggle hints, Ctrl+s to toggle solutions,
              Ctrl+Enter to submit answers.
            </div>
            {/* Topic Header */}
            <div className='space-y-6'>
              <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6'>
                <div className='flex-1'>
                  {/* Title and Level Badge */}
                  <div className='flex flex-col sm:flex-row sm:items-center gap-3 mb-4'>
                    <h1
                      className='text-3xl sm:text-4xl font-bold text-foreground'
                      data-testid='topic-page-title'
                    >
                      {topic.title}
                    </h1>
                    <Badge variant={topic.level as any} className='w-fit'>
                      {topic.level.charAt(0).toUpperCase() +
                        topic.level.slice(1)}
                    </Badge>
                  </div>

                  <p
                    className='text-lg text-muted-foreground mb-6'
                    data-testid='topic-page-description'
                  >
                    {topic.description}
                  </p>

                  {/* Enhanced Topic Metadata */}
                  <div className='flex flex-wrap items-center gap-4 mb-6'>
                    {/* Level Badge */}
                    <div className='flex items-center gap-2'>
                      <BookOpen className='w-4 h-4 text-muted-foreground' />
                      <Badge variant='outline' className='text-xs'>
                        {topic.level.charAt(0).toUpperCase() +
                          topic.level.slice(1)}{' '}
                        Level
                      </Badge>
                    </div>

                    {/* Curriculum Links for Arithmetic and Pre-Algebra */}
                    {topic.id === 'arithmetic' && (
                      <Link
                        href={`/topic/arithmetic/curriculum/1`}
                        className='flex items-center gap-2 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg text-sm font-medium transition-colors border border-purple-200'
                      >
                        <BookOpen className='w-4 h-4' />
                        Start Curriculum
                      </Link>
                    )}
                    {topic.id === 'pre-algebra' && (
                      <Link
                        href={`/topic/pre-algebra/curriculum/1`}
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
                      <MathExpression expression={topic.mathExpression} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lesson Content System */}
            <ErrorBoundary>
              <div
                id='lesson-content'
                tabIndex={-1}
                aria-label='Lesson content section'
              >
                <LessonContentSection
                  topicId={topic.id}
                  handleSectionComplete={handleSectionComplete}
                  handleProblemComplete={handleProblemComplete}
                  getTopicProgress={getTopicProgress}
                />
              </div>
            </ErrorBoundary>
          </div>

          {/* Sidebar - Progress and Related Topics */}
          <div className='lg:col-span-1 space-y-6'>
            {/* Enhanced Progress Section */}
            <ProgressTracker
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

            {/* Badge System - Temporarily disabled to prevent crashes */}
            {false && (
              <BadgeSystem
                userProgress={userProgress}
                topicId={topic?.id || ''}
                onBadgeEarned={handleBadgeEarned}
                showBadgeModal={false}
              />
            )}

            {/* Topic Forum Integration */}
            {topic && (
              <TopicForumSection
                topicId={topic.id}
                topicTitle={topic.title}
                userProgress={[]} // TODO: Convert userProgress to CurriculumProgress format
                className='mb-8'
              />
            )}

            {/* Enhanced Related Topics */}
            {topic && topicsData && (
              <RelatedTopicsSuggestions
                currentTopic={topic}
                allTopics={topicsData as Topic[]}
                userProgress={userProgress}
                getTopicProgress={getTopicProgress}
                isTopicCompleted={isTopicCompleted}
                getTopicCompletionPercentage={getTopicCompletionPercentage}
              />
            )}
          </div>
        </div>

        {/* Success Animation - Temporarily disabled to fix modal issues */}
        {false && (
          <SuccessAnimation
            show={showSuccessAnimation}
            type={successAnimationType}
            message={successMessage}
            onComplete={() => setShowSuccessAnimation(false)}
            duration={2000}
          />
        )}
      </div>
    </FocusManager>
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
        <LessonContent
          lessonContent={lessonContent}
          onSectionComplete={handleSectionComplete}
          completedSections={completedSections}
        />
      )}

      {/* Enhanced Practice Problems Section with Gamification */}
      <TopicPracticeSection
        topicId={topicId}
        onProblemComplete={handleProblemComplete}
        completedProblems={completedProblems}
      />

      {/* Interactive Demos Section */}
      {topicId === 'geometry' && (
        <div className='space-y-6'>
          <h3 className='text-xl font-semibold text-foreground'>
            Interactive Demonstrations
          </h3>

          <div className='grid gap-6 md:grid-cols-2'>
            <div className='bg-card border rounded-lg p-6'>
              <h4 className='font-medium text-foreground mb-2'>
                Circle Area Calculator
              </h4>
              <p className='text-sm text-muted-foreground mb-4'>
                Interactive circle area demonstration will be available soon.
              </p>
              <div className='w-full h-48 border rounded-lg bg-muted/20 flex items-center justify-center'>
                <p className='text-sm text-muted-foreground'>
                  Interactive demo coming soon
                </p>
              </div>
            </div>

            <div className='bg-card border rounded-lg p-6'>
              <h4 className='font-medium text-foreground mb-2'>
                Triangle Area Calculator
              </h4>
              <p className='text-sm text-muted-foreground mb-4'>
                Interactive triangle area demonstration will be available soon.
              </p>
              <div className='w-full h-48 border rounded-lg bg-muted/20 flex items-center justify-center'>
                <p className='text-sm text-muted-foreground'>
                  Interactive demo coming soon
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {topicId === 'algebra' && (
        <div className='space-y-6'>
          <h3 className='text-xl font-semibold text-foreground'>
            Interactive Function Explorer
          </h3>

          <div className='bg-card border rounded-lg p-6'>
            <h4 className='font-medium text-foreground mb-2'>
              Quadratic Function Explorer
            </h4>
            <p className='text-sm text-muted-foreground mb-4'>
              Interactive quadratic function demonstration will be available
              soon.
            </p>
            <div className='w-full h-64 border rounded-lg bg-muted/20 flex items-center justify-center'>
              <p className='text-sm text-muted-foreground'>
                Interactive demo coming soon
              </p>
            </div>
          </div>
        </div>
      )}

      {topicId === 'trigonometry' && (
        <div className='space-y-6'>
          <h3 className='text-xl font-semibold text-foreground'>
            Interactive Trigonometry
          </h3>

          <div className='bg-card border rounded-lg p-6'>
            <h4 className='font-medium text-foreground mb-2'>
              Unit Circle and Trigonometric Functions
            </h4>
            <p className='text-sm text-muted-foreground mb-4'>
              Interactive trigonometry demonstration will be available soon.
            </p>
            <div className='w-full h-64 border rounded-lg bg-muted/20 flex items-center justify-center'>
              <p className='text-sm text-muted-foreground'>
                Interactive demo coming soon
              </p>
            </div>
          </div>
        </div>
      )}

      {topicId === 'calculus' && (
        <div className='space-y-6'>
          <h3 className='text-xl font-semibold text-foreground'>
            Interactive Calculus
          </h3>

          <div className='bg-card border rounded-lg p-6'>
            <h4 className='font-medium text-foreground mb-2'>
              Derivative Visualization
            </h4>
            <p className='text-sm text-muted-foreground mb-4'>
              Interactive calculus demonstration will be available soon.
            </p>
            <div className='w-full h-64 border rounded-lg bg-muted/20 flex items-center justify-center'>
              <p className='text-sm text-muted-foreground'>
                Interactive demo coming soon
              </p>
            </div>
          </div>
        </div>
      )}

      {topicId === 'linear-algebra' && (
        <div className='space-y-6'>
          <h3 className='text-xl font-semibold text-foreground'>
            Interactive Vector Operations
          </h3>

          <div className='bg-card border rounded-lg p-6'>
            <h4 className='font-medium text-foreground mb-2'>
              Vector Addition and Operations
            </h4>
            <p className='text-sm text-muted-foreground mb-4'>
              Interactive vector operations demonstration will be available
              soon.
            </p>
            <div className='w-full h-64 border rounded-lg bg-muted/20 flex items-center justify-center'>
              <p className='text-sm text-muted-foreground'>
                Interactive demo coming soon
              </p>
            </div>
          </div>
        </div>
      )}

      {topicId === 'statistics' && (
        <div className='space-y-6'>
          <h3 className='text-xl font-semibold text-foreground'>
            Interactive Statistics
          </h3>

          <div className='bg-card border rounded-lg p-6'>
            <h4 className='font-medium text-foreground mb-2'>
              Normal Distribution Explorer
            </h4>
            <p className='text-sm text-muted-foreground mb-4'>
              Interactive statistics demonstration will be available soon.
            </p>
            <div className='w-full h-64 border rounded-lg bg-muted/20 flex items-center justify-center'>
              <p className='text-sm text-muted-foreground'>
                Interactive demo coming soon
              </p>
            </div>
          </div>
        </div>
      )}

      {(topicId === 'differential-equations' ||
        topicId === 'game-design-math') && (
        <div className='space-y-6'>
          <h3 className='text-xl font-semibold text-foreground'>
            Advanced Mathematical Concepts
          </h3>

          <div className='bg-card border rounded-lg p-6'>
            <p className='text-muted-foreground'>
              Interactive demonstrations for{' '}
              {topicId === 'differential-equations'
                ? 'Differential Equations'
                : 'Game Design Math'}
              will be available in future updates. The lesson content above
              provides comprehensive coverage of the key concepts.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
