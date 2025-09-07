// React 19 - no need to import React
import { useState, useEffect } from "react";
import {
  Flame,
  Trophy,
  Target,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { PracticeExample } from "./PracticeExample";
import { ProgressIndicator } from "./ProgressIndicator";
import { BadgeGrid } from "./GamificationBadge";
import { useLocalProgress } from "../hooks/useLocalProgress";
import {
  practiceProblemsData,
  type PracticeProblem,
} from "../data/practiceProblems";

interface TopicPracticeSectionProps {
  topicId: string;
  onProblemComplete: (problemId: string, isCorrect: boolean) => void;
  completedProblems: string[];
  className?: string;
}

// Convert our practice problems data to the format expected by PracticeExample
const convertToAdvancedFormat = (problem: PracticeProblem, topicId: string) => {
  return {
    id: problem.id,
    question: problem.question,
    expression: problem.mathExpression,
    steps:
      problem.solutionSteps?.map((step, index) => ({
        id: `step-${index + 1}`,
        description: step,
        expression: problem.mathExpression, // Use the main expression for now
        explanation: step,
      })) || [],
    correctAnswer: String(problem.correctAnswer),
    hints: problem.hint ? [problem.hint] : [],
    difficulty: problem.difficulty as 1 | 2 | 3,
    topic: topicId,
  };
};

export function TopicPracticeSection({
  topicId,
  onProblemComplete,
  completedProblems,
  className = "",
}: TopicPracticeSectionProps) {
  const { progress, completePractice, exploreTopic, isLoading, error } =
    useLocalProgress();
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [autoAdvanceTimer, setAutoAdvanceTimer] =
    useState<NodeJS.Timeout | null>(null);

  // Get problems for this specific topic
  const topicProblems = practiceProblemsData[topicId] || [];
  const advancedProblems = topicProblems.map((problem) =>
    convertToAdvancedFormat(problem, topicId)
  );

  // Track topic exploration
  useEffect(() => {
    exploreTopic(topicId);
  }, [topicId, exploreTopic]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer);
      }
    };
  }, [autoAdvanceTimer]);

  const currentProblem = advancedProblems[currentProblemIndex];

  const handleProblemComplete = (correct: boolean, attempts: number) => {
    // Clear any existing timer to prevent multiple timers
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
      setAutoAdvanceTimer(null);
    }

    if (correct) {
      // Update local topic progress
      onProblemComplete(currentProblem.id, true);

      // Update global gamification progress
      completePractice();

      // Auto-advance to next question after 1 second
      const timer = setTimeout(() => {
        nextProblem();
        setAutoAdvanceTimer(null);
      }, 1000);
      setAutoAdvanceTimer(timer);

      // Show progress indicator briefly - temporarily disabled
      // setShowProgress(true);
      // setTimeout(() => setShowProgress(false), 3000);
    } else {
      onProblemComplete(currentProblem.id, false);
    }
  };

  const nextProblem = () => {
    const nextIndex = (currentProblemIndex + 1) % advancedProblems.length;
    setCurrentProblemIndex(nextIndex);
  };

  const previousProblem = () => {
    const prevIndex =
      currentProblemIndex === 0
        ? advancedProblems.length - 1
        : currentProblemIndex - 1;
    setCurrentProblemIndex(prevIndex);
  };

  const resetProgress = () => {
    setCurrentProblemIndex(0);
  };

  const getCompletionStats = () => {
    const completed = topicProblems.filter((p) =>
      completedProblems.includes(p.id)
    ).length;
    const total = topicProblems.length;
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  };

  if (isLoading) {
    return (
      <div className={`space-y-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">
            Loading practice section...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-8 ${className}`}>
        <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300">
            Error loading practice section: {error}
          </p>
        </div>
      </div>
    );
  }

  if (advancedProblems.length === 0) {
    return (
      <div className={`space-y-8 ${className}`}>
        <div className="bg-card border rounded-lg p-8 text-center">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Practice Problems Coming Soon
          </h3>
          <p className="text-muted-foreground">
            Interactive practice problems for this topic are being developed and
            will be available soon.
          </p>
        </div>
      </div>
    );
  }

  const stats = getCompletionStats();

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header with Gamification Stats */}
      <div className="text-center space-y-6">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Practice & Learn
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Master {topicId} with interactive practice problems and track your
          progress with gamified learning.
        </p>

        {/* Quick Stats Bar */}
        <div className="flex items-center justify-center gap-8 p-4 bg-card border border-border rounded-lg max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {progress.streak}
              </p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </div>

          <div className="w-px h-8 bg-border"></div>

          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {progress.practiceCompleted}
              </p>
              <p className="text-xs text-muted-foreground">Total Solved</p>
            </div>
          </div>

          <div className="w-px h-8 bg-border"></div>

          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-500" />
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {progress.badges.length}
              </p>
              <p className="text-xs text-muted-foreground">Badges Earned</p>
            </div>
          </div>
        </div>

        {/* Topic-Specific Progress */}
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span>
            Topic Progress: {stats.completed}/{stats.total} ({stats.percentage}
            %)
          </span>
          <div className="w-32 bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Practice Problem (Main Content) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Problem Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-semibold text-foreground">
                Problem {currentProblemIndex + 1} of {advancedProblems.length}
              </h3>
              {completedProblems.includes(currentProblem.id) && (
                <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  <Trophy className="w-3 h-3" />
                  Completed
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={previousProblem}
                className="inline-flex items-center gap-1 px-3 py-1 text-sm border border-border rounded-md hover:bg-muted/50 transition-colors"
                aria-label="Previous problem"
              >
                <ArrowLeft className="w-3 h-3" />
                Previous
              </button>
              <button
                onClick={nextProblem}
                className="inline-flex items-center gap-1 px-3 py-1 text-sm border border-border rounded-md hover:bg-muted/50 transition-colors"
                aria-label="Next problem"
              >
                Next
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Advanced Practice Problem Component */}
          <PracticeExample
            question={currentProblem}
            onComplete={handleProblemComplete}
          />

          {/* Problem Progress Indicator */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex gap-1">
              {advancedProblems.map((problem, index) => (
                <div
                  key={problem.id}
                  className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                    completedProblems.includes(problem.id)
                      ? "bg-primary"
                      : index === currentProblemIndex
                      ? "bg-primary/60"
                      : "bg-muted"
                  }`}
                  title={`Problem ${index + 1}: ${
                    completedProblems.includes(problem.id)
                      ? "Completed"
                      : "Not completed"
                  }`}
                  onClick={() => setCurrentProblemIndex(index)}
                />
              ))}
            </div>

            <button
              onClick={resetProgress}
              className="flex items-center gap-1 text-xs hover:text-foreground transition-colors"
              title="Reset to first problem"
            >
              <RefreshCw className="w-3 h-3" />
              Reset
            </button>
          </div>
        </div>

        {/* Sidebar with Progress and Badges */}
        <div className="space-y-6">
          {/* Progress Indicator */}
          <ProgressIndicator progress={progress} showDetails={false} />

          {/* Recent Badges */}
          {progress.badges.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="text-lg font-semibold text-foreground mb-4">
                Recent Badges
              </h4>
              <BadgeGrid
                badges={progress.badges.slice(-3)} // Show last 3 badges
                maxDisplay={3}
                size="sm"
                showDescription={false}
              />
            </div>
          )}

          {/* Topic-Specific Motivational Message */}
          <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-foreground mb-2">
              Keep Going! 🚀
            </h4>
            <p className="text-sm text-muted-foreground">
              {stats.completed === 0
                ? `Start your ${topicId} journey by solving your first problem!`
                : stats.completed === stats.total
                ? `Amazing! You've mastered all ${topicId} problems! 🎉`
                : `${
                    stats.total - stats.completed
                  } more ${topicId} problems to complete this topic!`}
            </p>
          </div>

          {/* Accessibility Options */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h5 className="text-sm font-medium text-foreground mb-2">
              Accessibility Options
            </h5>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="rounded border-border"
                  onChange={(e) => {
                    if (e.target.checked) {
                      document.documentElement.classList.add("high-contrast");
                    } else {
                      document.documentElement.classList.remove(
                        "high-contrast"
                      );
                    }
                  }}
                />
                <span className="text-muted-foreground">
                  High contrast mode
                </span>
              </label>
              <p className="text-xs text-muted-foreground">
                Enhances color contrast for better visibility
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Animation Overlay - Temporarily disabled */}
      {false && showProgress && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-8 text-center space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">
              Great Job! 🎉
            </h3>
            <p className="text-muted-foreground">
              You've completed another {topicId} problem!
            </p>
            <div className="text-sm text-muted-foreground">
              Total completed: {progress.practiceCompleted}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
