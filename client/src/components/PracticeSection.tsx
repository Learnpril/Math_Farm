import { useState, useEffect } from "react";
import { PracticeExample } from "./PracticeExample";
import { ProgressIndicator } from "./ProgressIndicator";
import { BadgeGrid } from "./GamificationBadge";
import { useLocalProgress } from "../hooks/useLocalProgress";
import { Flame, Trophy, Target, RefreshCw } from "lucide-react";
import practiceProblemsData from "../data/practiceProblems.json";

interface PracticeQuestion {
  id: string;
  question: string;
  expression?: string;
  steps: Array<{
    id: string;
    description: string;
    expression?: string;
    explanation: string;
  }>;
  correctAnswer: string;
  hints: string[];
  difficulty: 1 | 2 | 3;
  topic: string;
}

interface PracticeSectionProps {
  className?: string;
}

/**
 * PracticeSection component integrating practice examples with gamification
 * Shows visual streak indicators, badge displays, and sample problems
 */
export function PracticeSection({ className = "" }: PracticeSectionProps) {
  const { progress, completePractice, visitSection, isLoading, error } =
    useLocalProgress();

  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [completedProblems, setCompletedProblems] = useState<Set<string>>(
    new Set()
  );
  const [showProgress, setShowProgress] = useState(false);

  // Cast the imported data to the correct type
  const practiceProblems = practiceProblemsData as PracticeQuestion[];

  // Visit section on mount
  useEffect(() => {
    visitSection("practice");
  }, [visitSection]);

  const currentProblem = practiceProblems[currentProblemIndex];

  const handleProblemComplete = (correct: boolean, attempts: number) => {
    if (correct) {
      // Mark problem as completed
      setCompletedProblems((prev) => new Set([...prev, currentProblem.id]));

      // Update progress tracking
      completePractice();

      // Show progress indicator briefly
      setShowProgress(true);
      setTimeout(() => setShowProgress(false), 3000);
    }
  };

  const nextProblem = () => {
    const nextIndex = (currentProblemIndex + 1) % practiceProblems.length;
    setCurrentProblemIndex(nextIndex);
  };

  const previousProblem = () => {
    const prevIndex =
      currentProblemIndex === 0
        ? practiceProblems.length - 1
        : currentProblemIndex - 1;
    setCurrentProblemIndex(prevIndex);
  };

  const resetProgress = () => {
    setCompletedProblems(new Set());
    setCurrentProblemIndex(0);
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

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header with Gamification Stats */}
      <div className="text-center space-y-6">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Practice & Learn
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Engage with interactive practice problems and track your progress with
          gamified learning experiences.
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
            <Target className="w-5 h-5 text-green-500" />
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {progress.practiceCompleted}
              </p>
              <p className="text-xs text-muted-foreground">Problems Solved</p>
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
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Practice Problem (Main Content) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Problem Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-semibold text-foreground">
                Problem {currentProblemIndex + 1} of {practiceProblems.length}
              </h3>
              {completedProblems.has(currentProblem.id) && (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">
                  <Trophy className="w-3 h-3" />
                  Completed
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={previousProblem}
                className="px-3 py-1 text-sm border border-border rounded-md hover:bg-muted/50 transition-colors"
                aria-label="Previous problem"
              >
                Previous
              </button>
              <button
                onClick={nextProblem}
                className="px-3 py-1 text-sm border border-border rounded-md hover:bg-muted/50 transition-colors"
                aria-label="Next problem"
              >
                Next
              </button>
            </div>
          </div>

          {/* Practice Problem Component */}
          <PracticeExample
            question={currentProblem}
            onComplete={handleProblemComplete}
          />

          {/* Problem Progress Indicator */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex gap-1">
              {practiceProblems.map((problem, index) => (
                <div
                  key={problem.id}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    completedProblems.has(problem.id)
                      ? "bg-green-500"
                      : index === currentProblemIndex
                      ? "bg-primary"
                      : "bg-muted"
                  }`}
                  title={`Problem ${index + 1}: ${
                    completedProblems.has(problem.id)
                      ? "Completed"
                      : "Not completed"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={resetProgress}
              className="flex items-center gap-1 text-xs hover:text-foreground transition-colors"
              title="Reset practice progress"
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

          {/* Motivational Message */}
          <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-foreground mb-2">
              Keep Going! 🚀
            </h4>
            <p className="text-sm text-muted-foreground">
              {progress.practiceCompleted === 0
                ? "Complete your first practice problem to earn a badge!"
                : progress.practiceCompleted < 5
                ? `${
                    5 - progress.practiceCompleted
                  } more problems until your next milestone!`
                : progress.practiceCompleted < 10
                ? `${
                    10 - progress.practiceCompleted
                  } more problems to become a Dedicated Learner!`
                : "You're doing amazing! Keep up the great work!"}
            </p>
          </div>

          {/* High Contrast Mode Toggle for Accessibility */}
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
                    // Toggle high contrast mode for color-blind users
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

      {/* Success Animation Overlay */}
      {showProgress && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-8 text-center space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <Trophy className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">
              Great Job! 🎉
            </h3>
            <p className="text-muted-foreground">
              You've completed another practice problem!
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
