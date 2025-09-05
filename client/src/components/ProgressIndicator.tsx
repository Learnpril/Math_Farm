import { ProgressData } from "../../shared/types";
import { calculateCompletionStats } from "../lib/progressUtils";
import { TrendingUp, BookOpen, Wrench, Trophy } from "lucide-react";

interface ProgressIndicatorProps {
  progress: ProgressData;
  showDetails?: boolean;
  className?: string;
}

/**
 * ProgressIndicator component for visual progress representation
 * Shows completion percentages and streak information
 */
export function ProgressIndicator({
  progress,
  showDetails = true,
  className = "",
}: ProgressIndicatorProps) {
  const stats = calculateCompletionStats(progress);

  // Progress bar component
  const ProgressBar = ({
    label,
    percentage,
    color = "primary",
    icon: Icon,
  }: {
    label: string;
    percentage: number;
    color?: string;
    icon: React.ComponentType<{ className?: string }>;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-primary to-primary/80`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label} progress: ${Math.round(percentage)}%`}
        />
      </div>
    </div>
  );

  return (
    <div
      className={`bg-card border border-border rounded-lg p-6 space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Learning Progress
        </h3>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">
            {Math.round(stats.overall)}% Complete
          </span>
        </div>
      </div>

      {/* Overall Progress Circle */}
      <div className="flex items-center justify-center">
        <div className="relative w-24 h-24">
          {/* Background circle */}
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-muted"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${
                2 * Math.PI * 40 * (1 - stats.overall / 100)
              }`}
              className="text-primary transition-all duration-1000 ease-out"
              strokeLinecap="round"
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-foreground">
              {Math.round(stats.overall)}%
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Progress Bars */}
      {showDetails && (
        <div className="space-y-4">
          <ProgressBar
            label="Sections Visited"
            percentage={stats.sectionsVisited}
            icon={BookOpen}
          />
          <ProgressBar
            label="Topics Explored"
            percentage={stats.topicsExplored}
            icon={BookOpen}
          />
          <ProgressBar
            label="Tools Used"
            percentage={stats.toolsUsed}
            icon={Wrench}
          />
          <ProgressBar
            label="Badges Earned"
            percentage={stats.badgesEarned}
            icon={Trophy}
          />
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{progress.streak}</p>
          <p className="text-sm text-muted-foreground">Day Streak</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">
            {progress.badges.length}
          </p>
          <p className="text-sm text-muted-foreground">Badges Earned</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact progress indicator for smaller spaces
 */
interface CompactProgressProps {
  progress: ProgressData;
  className?: string;
}

export function CompactProgress({
  progress,
  className = "",
}: CompactProgressProps) {
  const stats = calculateCompletionStats(progress);

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Mini progress circle */}
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-muted"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - stats.overall / 100)}`}
            className="text-primary transition-all duration-500"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-foreground">
            {Math.round(stats.overall)}%
          </span>
        </div>
      </div>

      {/* Quick stats */}
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Progress</span>
          <span className="text-sm font-medium text-foreground">
            {Math.round(stats.overall)}%
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{progress.streak} day streak</span>
          <span>{progress.badges.length} badges</span>
        </div>
      </div>
    </div>
  );
}
