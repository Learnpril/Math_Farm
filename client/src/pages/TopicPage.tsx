// React 19 - no need to import React
import { useParams, Link } from "wouter";
import { useEffect, useRef, useState } from "react";
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
} from "lucide-react";
import { MathExpression } from "../components/MathExpression";
import { Badge } from "../components/ui/badge";
import { LessonContent } from "../components/LessonContent";
import { TopicPracticeSection } from "../components/TopicPracticeSection";
import { ProgressTracker } from "../components/ProgressTracker";
import { BadgeSystem } from "../components/BadgeSystem";
import { TimeChallengeMode } from "../components/TimeChallengeMode";
import { SuccessAnimation } from "../components/SuccessAnimation";
import { RelatedTopicsSuggestions } from "../components/RelatedTopicsSuggestions";
import { ErrorBoundary } from "../components/ErrorBoundary";
// JSXGraph demos temporarily disabled to prevent DOM manipulation errors
// import {
//   JSXGraphDemo,
//   demoInitializers,
//   demoConfigs,
// } from "../components/JSXGraphDemo";
import { useProgressTracker } from "../hooks/useProgressTracker";
import topicsData from "../data/topicsData.json";
import { lessonContentData } from "../data/lessonContent";
import { practiceProblemsData } from "../data/practiceProblems";
import type { Topic } from "../../../shared/types";

export function TopicPage() {
  const params = useParams();
  const topicId = params.id;
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gamification states
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successAnimationType, setSuccessAnimationType] = useState<
    "problem" | "section" | "topic" | "badge" | "streak"
  >("problem");
  const [successMessage, setSuccessMessage] = useState("");
  const [isChallengeMode, setIsChallengeMode] = useState(false);
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
  const topic = topicsData.find((t) => t.id === topicId) as Topic | undefined;

  // Get lesson and practice data for progress calculations
  const lessonContent = lessonContentData[topicId || ""];
  const practiceProblems = practiceProblemsData[topicId || ""];
  const totalLessonSections = lessonContent?.sections.length || 0;
  const totalPracticeProblems = practiceProblems?.length || 0;

  // Helper functions for progress tracking
  const getPrerequisiteProgress = (prereqId: string) => {
    return getTopicProgress(prereqId);
  };

  // Gamification handlers
  const handleBadgeEarned = (badge: any) => {
    // Don't show success animation for badges, let BadgeSystem handle it
    console.log("Badge earned:", badge.name);
  };

  const handleChallengeComplete = (success: boolean, timeSpent: number) => {
    if (success) {
      setSuccessAnimationType("streak");
      setSuccessMessage("Time Challenge Completed!");
      setShowSuccessAnimation(true);
    }
  };

  const handleSectionComplete = (sectionId: string) => {
    markLessonSectionCompleted(topicId || "", sectionId);
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
        console.error("Error completing problem:", error);
      }
    }
  };

  // Focus management on page load for accessibility
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.focus();
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
      <div className="container mx-auto px-4 py-16">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
          <div className="h-12 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-muted rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="h-64 bg-muted rounded"></div>
            </div>
            <div className="lg:col-span-1">
              <div className="h-48 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state - topic not found
  if (error || !topic) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Topic Not Found
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            {error || `The topic "${topicId}" could not be found.`}
          </p>
          <div className="space-y-4">
            <Link
              href="/#topics"
              className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Topics
            </Link>
            <div className="text-sm text-muted-foreground">
              <p>Suggested topics:</p>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {topicsData.slice(0, 3).map((suggestedTopic) => (
                  <Link
                    key={suggestedTopic.id}
                    href={`/topic/${suggestedTopic.id}`}
                    className="px-3 py-1 bg-muted hover:bg-muted/80 rounded text-xs transition-colors"
                  >
                    {suggestedTopic.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          href="/#topics"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Topics
        </Link>
      </div>

      {/* Responsive Layout with Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content Area */}
        <div
          className="lg:col-span-3 space-y-8"
          ref={mainContentRef}
          tabIndex={-1}
          aria-label={`${topic.title} topic content`}
        >
          {/* Topic Header */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              <div className="flex-1">
                {/* Title and Level Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                  <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                    {topic.title}
                  </h1>
                  <Badge variant={topic.level as any} className="w-fit">
                    {topic.level.charAt(0).toUpperCase() + topic.level.slice(1)}
                  </Badge>
                </div>

                <p className="text-lg text-muted-foreground mb-6">
                  {topic.description}
                </p>

                {/* Enhanced Topic Metadata */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  {/* Estimated Time */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {topic.estimatedTime} min
                    </span>
                  </div>

                  {/* Difficulty Badge with Visual Indicators */}
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <Badge
                      variant={`difficulty${topic.difficulty}` as any}
                      className="flex items-center gap-1"
                    >
                      <span>Difficulty {topic.difficulty}/5</span>
                      <div className="flex gap-0.5 ml-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`w-1.5 h-1.5 rounded-full ${
                              level <= topic.difficulty
                                ? level <= 2
                                  ? "bg-green-500"
                                  : level <= 3
                                  ? "bg-yellow-500"
                                  : level <= 4
                                  ? "bg-orange-500"
                                  : "bg-red-500"
                                : "bg-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                    </Badge>
                  </div>

                  {/* Level Badge */}
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <Badge variant="outline" className="text-xs">
                      {topic.level.charAt(0).toUpperCase() +
                        topic.level.slice(1)}{" "}
                      Level
                    </Badge>
                  </div>

                  {/* Challenge Mode Toggle */}
                  <button
                    onClick={() => setIsChallengeMode(!isChallengeMode)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isChallengeMode
                        ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                        : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    {isChallengeMode ? "Challenge Active" : "Start Challenge"}
                  </button>
                </div>

                {/* Prerequisites Section */}
                {topic.prerequisites.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Prerequisites
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {topic.prerequisites.map((prereqId) => {
                        const prereqTopic = topicsData.find(
                          (t) => t.id === prereqId
                        ) as Topic | undefined;
                        const isCompleted = isTopicCompleted(prereqId);
                        const progress = getPrerequisiteProgress(prereqId);

                        return prereqTopic ? (
                          <Link
                            key={prereqId}
                            href={`/topic/${prereqId}`}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-card border rounded-lg hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <span className="text-sm font-medium">
                              {prereqTopic.title}
                            </span>
                            {isCompleted ? (
                              <CheckCircle className="w-3 h-3 text-green-600" />
                            ) : progress ? (
                              <Circle className="w-3 h-3 text-yellow-600" />
                            ) : (
                              <Circle className="w-3 h-3 text-muted-foreground" />
                            )}
                          </Link>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Math Expression Display */}
              <div className="sm:w-80">
                <div className="bg-card border rounded-lg p-6 text-center">
                  <h3 className="text-sm font-medium text-muted-foreground mb-4">
                    Key Formula
                  </h3>
                  <div className="text-lg">
                    <MathExpression expression={topic.mathExpression} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lesson Content System */}
          <ErrorBoundary>
            <LessonContentSection
              topicId={topic.id}
              handleSectionComplete={handleSectionComplete}
              handleProblemComplete={handleProblemComplete}
              getTopicProgress={getTopicProgress}
            />
          </ErrorBoundary>
        </div>

        {/* Sidebar - Progress and Related Topics */}
        <div className="lg:col-span-1 space-y-6">
          {/* Time Challenge Mode */}
          <TimeChallengeMode
            estimatedTime={topic.estimatedTime}
            topicId={topic.id}
            onChallengeComplete={handleChallengeComplete}
            isActive={isChallengeMode}
          />

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
              topicId={topic.id}
              onBadgeEarned={handleBadgeEarned}
              showBadgeModal={false}
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
    <div className="space-y-8">
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
      {topicId === "geometry" && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-foreground">
            Interactive Demonstrations
          </h3>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-card border rounded-lg p-6">
              <h4 className="font-medium text-foreground mb-2">
                Circle Area Calculator
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Interactive circle area demonstration will be available soon.
              </p>
              <div className="w-full h-48 border rounded-lg bg-muted/20 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Interactive demo coming soon
                </p>
              </div>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <h4 className="font-medium text-foreground mb-2">
                Triangle Area Calculator
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Interactive triangle area demonstration will be available soon.
              </p>
              <div className="w-full h-48 border rounded-lg bg-muted/20 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Interactive demo coming soon
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {topicId === "algebra" && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-foreground">
            Interactive Function Explorer
          </h3>

          <div className="bg-card border rounded-lg p-6">
            <h4 className="font-medium text-foreground mb-2">
              Quadratic Function Explorer
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Interactive quadratic function demonstration will be available
              soon.
            </p>
            <div className="w-full h-64 border rounded-lg bg-muted/20 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Interactive demo coming soon
              </p>
            </div>
          </div>
        </div>
      )}

      {topicId === "trigonometry" && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-foreground">
            Interactive Trigonometry
          </h3>

          <div className="bg-card border rounded-lg p-6">
            <h4 className="font-medium text-foreground mb-2">
              Unit Circle and Trigonometric Functions
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Interactive trigonometry demonstration will be available soon.
            </p>
            <div className="w-full h-64 border rounded-lg bg-muted/20 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Interactive demo coming soon
              </p>
            </div>
          </div>
        </div>
      )}

      {topicId === "calculus" && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-foreground">
            Interactive Calculus
          </h3>

          <div className="bg-card border rounded-lg p-6">
            <h4 className="font-medium text-foreground mb-2">
              Derivative Visualization
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Interactive calculus demonstration will be available soon.
            </p>
            <div className="w-full h-64 border rounded-lg bg-muted/20 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Interactive demo coming soon
              </p>
            </div>
          </div>
        </div>
      )}

      {topicId === "linear-algebra" && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-foreground">
            Interactive Vector Operations
          </h3>

          <div className="bg-card border rounded-lg p-6">
            <h4 className="font-medium text-foreground mb-2">
              Vector Addition and Operations
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Interactive vector operations demonstration will be available
              soon.
            </p>
            <div className="w-full h-64 border rounded-lg bg-muted/20 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Interactive demo coming soon
              </p>
            </div>
          </div>
        </div>
      )}

      {topicId === "statistics" && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-foreground">
            Interactive Statistics
          </h3>

          <div className="bg-card border rounded-lg p-6">
            <h4 className="font-medium text-foreground mb-2">
              Normal Distribution Explorer
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Interactive statistics demonstration will be available soon.
            </p>
            <div className="w-full h-64 border rounded-lg bg-muted/20 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Interactive demo coming soon
              </p>
            </div>
          </div>
        </div>
      )}

      {(topicId === "differential-equations" ||
        topicId === "game-design-math") && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-foreground">
            Advanced Mathematical Concepts
          </h3>

          <div className="bg-card border rounded-lg p-6">
            <p className="text-muted-foreground">
              Interactive demonstrations for{" "}
              {topicId === "differential-equations"
                ? "Differential Equations"
                : "Game Design Math"}
              will be available in future updates. The lesson content above
              provides comprehensive coverage of the key concepts.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
