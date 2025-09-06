// React 19 - no need to import React
import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Lightbulb,
  RotateCcw,
  Trophy,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { MathExpression } from "./MathExpression";
import {
  practiceProblemsData,
  type PracticeProblem,
} from "../data/practiceProblems";

interface PracticeProblemsProps {
  topicId: string;
  onProblemComplete: (problemId: string, isCorrect: boolean) => void;
  completedProblems: string[];
}

interface ProblemState {
  [problemId: string]: {
    userAnswer: string;
    isSubmitted: boolean;
    isCorrect: boolean;
    showSolution: boolean;
    showHint: boolean;
    attempts: number;
  };
}

export function PracticeProblems({
  topicId,
  onProblemComplete,
  completedProblems,
}: PracticeProblemsProps) {
  const problems = practiceProblemsData[topicId] || [];
  const [problemStates, setProblemStates] = useState<ProblemState>({});

  // Initialize problem states
  useEffect(() => {
    const initialStates: ProblemState = {};
    problems.forEach((problem) => {
      initialStates[problem.id] = {
        userAnswer: "",
        isSubmitted: false,
        isCorrect: completedProblems.includes(problem.id),
        showSolution: false,
        showHint: false,
        attempts: 0,
      };
    });
    setProblemStates(initialStates);
  }, [problems, completedProblems]);

  const handleAnswerChange = (problemId: string, answer: string) => {
    setProblemStates((prev) => ({
      ...prev,
      [problemId]: {
        ...prev[problemId],
        userAnswer: answer,
      },
    }));
  };

  const handleSubmit = (problem: PracticeProblem) => {
    const state = problemStates[problem.id];
    if (!state || state.isSubmitted) return;

    const userAnswer = state.userAnswer.trim();
    const correctAnswer = String(problem.correctAnswer).trim();

    // Normalize answers for comparison
    const isCorrect =
      normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);

    setProblemStates((prev) => ({
      ...prev,
      [problem.id]: {
        ...prev[problem.id],
        isSubmitted: true,
        isCorrect,
        attempts: prev[problem.id].attempts + 1,
      },
    }));

    // Notify parent component
    onProblemComplete(problem.id, isCorrect);
  };

  const handleReset = (problemId: string) => {
    setProblemStates((prev) => ({
      ...prev,
      [problemId]: {
        ...prev[problemId],
        userAnswer: "",
        isSubmitted: false,
        showSolution: false,
        showHint: false,
      },
    }));
  };

  const toggleSolution = (problemId: string) => {
    setProblemStates((prev) => ({
      ...prev,
      [problemId]: {
        ...prev[problemId],
        showSolution: !prev[problemId].showSolution,
      },
    }));
  };

  const toggleHint = (problemId: string) => {
    setProblemStates((prev) => ({
      ...prev,
      [problemId]: {
        ...prev[problemId],
        showHint: !prev[problemId].showHint,
      },
    }));
  };

  // Normalize answers for comparison (handle different formats)
  const normalizeAnswer = (answer: string): string => {
    return answer
      .toLowerCase()
      .replace(/\s+/g, "") // Remove spaces
      .replace(/\*+/g, "") // Remove multiplication symbols
      .replace(/\(|\)/g, "") // Remove parentheses for simple cases
      .replace(/\[|\]/g, "") // Remove brackets
      .replace(/true/g, "true")
      .replace(/false/g, "false");
  };

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return "bg-green-100 text-green-800 border-green-200";
      case 2:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 3:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 4:
        return "bg-orange-100 text-orange-800 border-orange-200";
      case 5:
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCompletionStats = () => {
    const completed = problems.filter((p) =>
      completedProblems.includes(p.id)
    ).length;
    const total = problems.length;
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  };

  if (problems.length === 0) {
    return (
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
    );
  }

  const stats = getCompletionStats();

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">
            Practice Problems
          </h2>
          <p className="text-muted-foreground">
            Test your understanding with interactive problems
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Progress: {stats.completed}/{stats.total} ({stats.percentage}%)
          </div>
          <div className="w-24 bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Problems Grid */}
      <div className="grid gap-6">
        {problems.map((problem, index) => {
          const state = problemStates[problem.id] || {
            userAnswer: "",
            isSubmitted: false,
            isCorrect: false,
            showSolution: false,
            showHint: false,
            attempts: 0,
          };

          return (
            <Card key={problem.id} className="relative">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-3">
                      <span className="text-muted-foreground">
                        #{index + 1}
                      </span>
                      <span>{problem.question}</span>
                      {state.isCorrect && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </CardTitle>

                    {problem.mathExpression && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <MathExpression expression={problem.mathExpression} />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={getDifficultyColor(problem.difficulty)}
                    >
                      Level {problem.difficulty}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Answer Input */}
                <div className="space-y-3">
                  {problem.type === "multiple-choice" ||
                  problem.type === "true-false" ? (
                    <RadioGroup
                      value={state.userAnswer}
                      onValueChange={(value) =>
                        handleAnswerChange(problem.id, value)
                      }
                      disabled={state.isSubmitted}
                    >
                      {problem.options?.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={option}
                            id={`${problem.id}-option-${optionIndex}`}
                          />
                          <Label
                            htmlFor={`${problem.id}-option-${optionIndex}`}
                            className="cursor-pointer"
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <Input
                      type={problem.type === "numeric" ? "text" : "text"}
                      placeholder={
                        problem.type === "numeric"
                          ? "Enter your numerical answer..."
                          : "Enter your answer..."
                      }
                      value={state.userAnswer}
                      onChange={(e) =>
                        handleAnswerChange(problem.id, e.target.value)
                      }
                      disabled={state.isSubmitted}
                      className={
                        state.isSubmitted
                          ? state.isCorrect
                            ? "border-green-500 bg-green-50"
                            : "border-red-500 bg-red-50"
                          : ""
                      }
                    />
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {!state.isSubmitted ? (
                    <Button
                      onClick={() => handleSubmit(problem)}
                      disabled={!state.userAnswer.trim()}
                      className="flex items-center gap-2"
                    >
                      Submit Answer
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleReset(problem.id)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Try Again
                    </Button>
                  )}

                  {problem.hint && (
                    <Button
                      onClick={() => toggleHint(problem.id)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Lightbulb className="w-4 h-4" />
                      {state.showHint ? "Hide Hint" : "Show Hint"}
                    </Button>
                  )}

                  <Button
                    onClick={() => toggleSolution(problem.id)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {state.showSolution ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                    {state.showSolution ? "Hide Solution" : "Show Solution"}
                  </Button>
                </div>

                {/* Feedback */}
                {state.isSubmitted && (
                  <div
                    className={`p-3 rounded-lg border ${
                      state.isCorrect
                        ? "bg-green-50 border-green-200 text-green-800"
                        : "bg-red-50 border-red-200 text-red-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-medium">
                      {state.isCorrect ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Correct!
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          Incorrect
                        </>
                      )}
                    </div>
                    <p className="mt-1 text-sm">{problem.explanation}</p>
                  </div>
                )}

                {/* Hint */}
                {state.showHint && problem.hint && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-800 font-medium mb-1">
                      <Lightbulb className="w-4 h-4" />
                      Hint
                    </div>
                    <p className="text-sm text-blue-700">{problem.hint}</p>
                  </div>
                )}

                {/* Solution Steps */}
                {state.showSolution && problem.solutionSteps && (
                  <div className="p-4 bg-muted border rounded-lg">
                    <h4 className="font-medium text-foreground mb-3">
                      Step-by-Step Solution:
                    </h4>
                    <ol className="space-y-2">
                      {problem.solutionSteps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                            {stepIndex + 1}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {step}
                          </span>
                        </li>
                      ))}
                    </ol>
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-sm font-medium text-foreground">
                        Final Answer:{" "}
                        <span className="text-primary">
                          {problem.correctAnswer}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Attempts Counter */}
                {state.attempts > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Attempts: {state.attempts}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Completion Message */}
      {stats.completed === stats.total && stats.total > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <Trophy className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Congratulations! 🎉
          </h3>
          <p className="text-green-700">
            You've completed all practice problems for this topic. Great job!
          </p>
        </div>
      )}
    </div>
  );
}
