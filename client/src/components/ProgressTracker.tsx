import {
  Clock,
  CheckCircle,
  TrendingUp,
  Target,
  Calendar,
  Award,
} from "lucide-react";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import type { ProgressStats, TopicProgress } from "../hooks/useProgressTracker";

interface ProgressTrackerProps {
  topicId: string;
  topicProgress: TopicProgress | null;
  totalLessonSections: number;
  totalPracticeProblems: number;
  completionPercentage: number;
  isCompleted: boolean;
  stats?: ProgressStats;
}

export function ProgressTracker({
  topicId,
  topicProgress,
  totalLessonSections,
  totalPracticeProblems,
  completionPercentage,
  isCompleted,
  stats,
}: ProgressTrackerProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Target className="w-5 h-5" />
            Your Progress
          </h3>
          {isCompleted && (
            <Badge
              variant="default"
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>

        {/* Overall Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Overall Progress
            </span>
            <span className="text-sm font-bold text-foreground">
              {completionPercentage}%
            </span>
          </div>
          <Progress value={completionPercentage} className="h-3" />
        </div>

        {/* Detailed Progress Sections */}
        {topicProgress && (
          <div className="space-y-4">
            {/* Lesson Sections Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Lesson Sections
                </span>
                <span className="text-xs font-medium">
                  {topicProgress.lessonSectionsCompleted.length}/
                  {totalLessonSections}
                </span>
              </div>
              <Progress
                value={
                  totalLessonSections > 0
                    ? (topicProgress.lessonSectionsCompleted.length /
                        totalLessonSections) *
                      100
                    : 0
                }
                className="h-2"
              />
            </div>

            {/* Practice Problems Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Practice Problems
                </span>
                <span className="text-xs font-medium">
                  {topicProgress.practiceProblemsCompleted.length}/
                  {totalPracticeProblems}
                </span>
              </div>
              <Progress
                value={
                  totalPracticeProblems > 0
                    ? (topicProgress.practiceProblemsCompleted.length /
                        totalPracticeProblems) *
                      100
                    : 0
                }
                className="h-2"
              />
            </div>

            {/* Time and Date Information */}
            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Time Spent
                </span>
                <span className="text-xs font-medium">
                  {formatTime(topicProgress.timeSpent)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Started
                </span>
                <span className="text-xs font-medium">
                  {formatDate(topicProgress.startedAt)}
                </span>
              </div>

              {topicProgress.completedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Completed
                  </span>
                  <span className="text-xs font-medium">
                    {formatDate(topicProgress.completedAt)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Last Visited
                </span>
                <span className="text-xs font-medium">
                  {formatDate(topicProgress.lastVisited)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Global Stats (if provided) */}
        {stats && (
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-1">
              <Award className="w-4 h-4" />
              Overall Statistics
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-bold text-foreground">
                  {stats.totalTopicsCompleted}
                </div>
                <div className="text-muted-foreground">Completed</div>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-bold text-foreground">
                  {stats.currentStreak}
                </div>
                <div className="text-muted-foreground">Day Streak</div>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-bold text-foreground">
                  {formatTime(stats.totalTimeSpent)}
                </div>
                <div className="text-muted-foreground">Total Time</div>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-bold text-foreground">
                  {Math.round(stats.completionRate)}%
                </div>
                <div className="text-muted-foreground">Completion</div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Indicators for Sections */}
        {topicProgress &&
          (totalLessonSections > 0 || totalPracticeProblems > 0) && (
            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-medium text-foreground mb-3">
                Section Completion
              </h4>
              <div className="space-y-2">
                {/* Lesson Section Checkboxes */}
                {totalLessonSections > 0 && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">
                      Lesson Sections
                    </div>
                    <div className="grid grid-cols-5 gap-1">
                      {Array.from({ length: totalLessonSections }, (_, i) => {
                        const sectionId = `section-${i + 1}`;
                        const isCompleted =
                          topicProgress.lessonSectionsCompleted.includes(
                            sectionId
                          );
                        return (
                          <div
                            key={sectionId}
                            className={`w-6 h-6 rounded border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                              isCompleted
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-muted-foreground/30 text-muted-foreground"
                            }`}
                          >
                            {isCompleted ? "✓" : i + 1}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Practice Problem Checkboxes */}
                {totalPracticeProblems > 0 && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">
                      Practice Problems
                    </div>
                    <div className="grid grid-cols-5 gap-1">
                      {Array.from({ length: totalPracticeProblems }, (_, i) => {
                        const problemId = `problem-${i + 1}`;
                        const isCompleted =
                          topicProgress.practiceProblemsCompleted.includes(
                            problemId
                          );
                        return (
                          <div
                            key={problemId}
                            className={`w-6 h-6 rounded border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                              isCompleted
                                ? "bg-green-600 border-green-600 text-white"
                                : "border-muted-foreground/30 text-muted-foreground"
                            }`}
                          >
                            {isCompleted ? "✓" : i + 1}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        {/* No Progress State */}
        {!topicProgress && (
          <div className="text-center py-4">
            <div className="text-muted-foreground text-sm">
              Start exploring this topic to track your progress!
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
