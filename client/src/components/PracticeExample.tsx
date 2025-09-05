import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Lightbulb,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { MathExpression } from "./MathExpression";

interface PracticeStep {
  id: string;
  description: string;
  expression?: string;
  explanation: string;
}

interface PracticeQuestion {
  id: string;
  question: string;
  expression?: string;
  steps: PracticeStep[];
  correctAnswer: string;
  hints: string[];
  difficulty: 1 | 2 | 3;
  topic: string;
}

interface PracticeExampleProps {
  question: PracticeQuestion;
  onComplete?: (correct: boolean, attempts: number) => void;
  className?: string;
}

/**
 * PracticeExample component with interactive problem solving
 * Provides step-by-step solutions with immediate feedback
 */
export function PracticeExample({
  question,
  onComplete,
  className = "",
}: PracticeExampleProps) {
  const [userAnswer, setUserAnswer] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showSteps, setShowSteps] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);

  // Reset state when question changes
  useEffect(() => {
    setUserAnswer("");
    setIsSubmitted(false);
    setIsCorrect(false);
    setAttempts(0);
    setShowSteps(false);
    setCurrentStep(0);
    setShowHint(false);
    setHintIndex(0);
  }, [question.id]);

  const handleSubmit = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setIsSubmitted(true);

    // Simple answer checking (normalize whitespace and case)
    const normalizedUser = userAnswer.trim().toLowerCase();
    const normalizedCorrect = question.correctAnswer.trim().toLowerCase();
    const correct = normalizedUser === normalizedCorrect;

    setIsCorrect(correct);

    if (correct) {
      onComplete?.(true, newAttempts);
    } else if (newAttempts >= 3) {
      // Show solution after 3 attempts
      setShowSteps(true);
      onComplete?.(false, newAttempts);
    }
  };

  const handleReset = () => {
    setUserAnswer("");
    setIsSubmitted(false);
    setIsCorrect(false);
    setShowSteps(false);
    setCurrentStep(0);
    setShowHint(false);
    setHintIndex(0);
  };

  const showNextHint = () => {
    if (hintIndex < question.hints.length - 1) {
      setHintIndex(hintIndex + 1);
    }
    setShowHint(true);
  };

  const showSolution = () => {
    setShowSteps(true);
  };

  const nextStep = () => {
    if (currentStep < question.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return "text-green-600 dark:text-green-400";
      case 2:
        return "text-yellow-600 dark:text-yellow-400";
      case 3:
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getDifficultyLabel = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return "Easy";
      case 2:
        return "Medium";
      case 3:
        return "Hard";
      default:
        return "Unknown";
    }
  };

  return (
    <div
      className={`bg-card border border-border rounded-lg p-6 space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-foreground">
              Practice Problem
            </h3>
            <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
              {question.topic}
            </span>
            <span
              className={`text-xs font-medium ${getDifficultyColor(
                question.difficulty
              )}`}
            >
              {getDifficultyLabel(question.difficulty)}
            </span>
          </div>
        </div>

        {(isSubmitted || showSteps) && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Reset problem"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        )}
      </div>

      {/* Question */}
      <div className="space-y-4">
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-foreground font-medium mb-2">
            {question.question}
          </p>
          {question.expression && (
            <div className="mt-3">
              <MathExpression
                expression={question.expression}
                className="text-center"
              />
            </div>
          )}
        </div>

        {/* Answer Input */}
        {!showSteps && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Enter your answer..."
                className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isSubmitted && isCorrect}
                onKeyDown={(e) =>
                  e.key === "Enter" && !isSubmitted && handleSubmit()
                }
              />
              <button
                onClick={handleSubmit}
                disabled={!userAnswer.trim() || (isSubmitted && isCorrect)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Submit
              </button>
            </div>

            {/* Feedback */}
            {isSubmitted && (
              <div
                className={`flex items-center gap-2 p-3 rounded-md ${
                  isCorrect
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                    : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                }`}
              >
                {isCorrect ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Correct!</span>
                    <span className="text-sm">
                      {attempts === 1
                        ? "Perfect on first try!"
                        : `Solved in ${attempts} attempts.`}
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">Not quite right.</span>
                    <span className="text-sm">
                      {attempts < 3 ? "Try again!" : "Let's see the solution."}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Help Options */}
            {!isCorrect && !showSteps && (
              <div className="flex gap-2">
                {question.hints.length > 0 && (
                  <button
                    onClick={showNextHint}
                    disabled={
                      hintIndex >= question.hints.length - 1 && showHint
                    }
                    className="inline-flex items-center gap-2 px-3 py-1 text-sm text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-muted/50 transition-colors disabled:opacity-50"
                  >
                    <Lightbulb className="w-4 h-4" />
                    {showHint ? "Next Hint" : "Show Hint"}
                  </button>
                )}

                {attempts >= 2 && (
                  <button
                    onClick={showSolution}
                    className="inline-flex items-center gap-2 px-3 py-1 text-sm text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-muted/50 transition-colors"
                  >
                    Show Solution
                  </button>
                )}
              </div>
            )}

            {/* Hint Display */}
            {showHint && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Hint {hintIndex + 1}:
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {question.hints[hintIndex]}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step-by-Step Solution */}
        {showSteps && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-foreground">
                Step-by-Step Solution
              </h4>
              <span className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {question.steps.length}
              </span>
            </div>

            {/* Current Step */}
            <div className="p-4 border border-border rounded-lg space-y-3">
              <p className="font-medium text-foreground">
                {question.steps[currentStep].description}
              </p>

              {question.steps[currentStep].expression && (
                <div className="bg-muted/50 p-3 rounded-md">
                  <MathExpression
                    expression={question.steps[currentStep].expression}
                    className="text-center"
                  />
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                {question.steps[currentStep].explanation}
              </p>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <div className="flex gap-1">
                {question.steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index <= currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>

              {currentStep < question.steps.length - 1 && (
                <button
                  onClick={nextStep}
                  className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Next Step
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Final Answer */}
            {currentStep === question.steps.length - 1 && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Final Answer: {question.correctAnswer}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
