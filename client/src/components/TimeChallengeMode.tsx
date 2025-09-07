import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  Zap,
  Trophy,
  Target,
  Play,
  Pause,
  RotateCcw,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { cn } from "../lib/utils";

interface TimeChallengeProps {
  estimatedTime: number; // in minutes
  topicId: string;
  onChallengeComplete: (success: boolean, timeSpent: number) => void;
  isActive?: boolean;
}

interface ChallengeState {
  isRunning: boolean;
  isPaused: boolean;
  timeElapsed: number; // in seconds
  targetTime: number; // in seconds
  startTime: Date | null;
  pausedTime: number;
}

export function TimeChallengeMode({
  estimatedTime,
  topicId,
  onChallengeComplete,
  isActive = false,
}: TimeChallengeProps) {
  const [challengeState, setChallengeState] = useState<ChallengeState>({
    isRunning: false,
    isPaused: false,
    timeElapsed: 0,
    targetTime: estimatedTime * 60, // Convert to seconds
    startTime: null,
    pausedTime: 0,
  });

  const [showResults, setShowResults] = useState(false);
  const [challengeResult, setChallengeResult] = useState<{
    success: boolean;
    timeSpent: number;
    percentageOfTarget: number;
  } | null>(null);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (
      challengeState.isRunning &&
      !challengeState.isPaused &&
      challengeState.startTime
    ) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor(
          (now -
            challengeState.startTime!.getTime() -
            challengeState.pausedTime) /
            1000
        );

        setChallengeState((prev) => ({
          ...prev,
          timeElapsed: elapsed,
        }));
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [
    challengeState.isRunning,
    challengeState.isPaused,
    challengeState.startTime,
    challengeState.pausedTime,
  ]);

  const startChallenge = useCallback(() => {
    setChallengeState((prev) => ({
      ...prev,
      isRunning: true,
      isPaused: false,
      startTime: new Date(),
      timeElapsed: 0,
      pausedTime: 0,
    }));
    setShowResults(false);
    setChallengeResult(null);
  }, []);

  const pauseChallenge = useCallback(() => {
    setChallengeState((prev) => ({
      ...prev,
      isPaused: !prev.isPaused,
      pausedTime: prev.isPaused
        ? prev.pausedTime
        : prev.pausedTime + (Date.now() - (prev.startTime?.getTime() || 0)),
    }));
  }, []);

  const stopChallenge = useCallback(() => {
    const success = challengeState.timeElapsed <= challengeState.targetTime;
    const percentageOfTarget =
      (challengeState.timeElapsed / challengeState.targetTime) * 100;

    setChallengeResult({
      success,
      timeSpent: challengeState.timeElapsed,
      percentageOfTarget,
    });

    setChallengeState((prev) => ({
      ...prev,
      isRunning: false,
      isPaused: false,
    }));

    setShowResults(true);
    onChallengeComplete(success, challengeState.timeElapsed);
  }, [
    challengeState.timeElapsed,
    challengeState.targetTime,
    onChallengeComplete,
  ]);

  const resetChallenge = useCallback(() => {
    setChallengeState({
      isRunning: false,
      isPaused: false,
      timeElapsed: 0,
      targetTime: estimatedTime * 60,
      startTime: null,
      pausedTime: 0,
    });
    setShowResults(false);
    setChallengeResult(null);
  }, [estimatedTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgressPercentage = () => {
    return Math.min(
      (challengeState.timeElapsed / challengeState.targetTime) * 100,
      100
    );
  };

  const getTimeStatus = () => {
    const percentage = getProgressPercentage();
    if (percentage <= 50) return "excellent";
    if (percentage <= 75) return "good";
    if (percentage <= 100) return "okay";
    return "overtime";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-green-600 bg-green-50 border-green-200";
      case "good":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "okay":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "overtime":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  if (!isActive) {
    return (
      <Card className="p-4 border-dashed">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Clock className="w-5 h-5" />
            <span className="text-sm">Time Challenge Available</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Try to complete this topic in {estimatedTime} minutes or less!
          </p>
          <Button
            onClick={startChallenge}
            size="sm"
            className="flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Start Challenge
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold text-foreground">Time Challenge</h3>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Target className="w-3 h-3" />
          Beat {estimatedTime}min
        </Badge>
      </div>

      {/* Timer Display */}
      <div className="text-center space-y-3">
        <div className="text-4xl font-mono font-bold text-foreground">
          {formatTime(challengeState.timeElapsed)}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Target: {formatTime(challengeState.targetTime)}
            </span>
            <span
              className={cn(
                "font-medium px-2 py-1 rounded text-xs border",
                getStatusColor(getTimeStatus())
              )}
            >
              {getTimeStatus().charAt(0).toUpperCase() +
                getTimeStatus().slice(1)}
            </span>
          </div>

          <Progress
            value={getProgressPercentage()}
            className={cn(
              "h-3 transition-all duration-300",
              challengeState.timeElapsed > challengeState.targetTime &&
                "bg-red-100"
            )}
          />

          <div className="text-xs text-muted-foreground">
            {Math.round(getProgressPercentage())}% of target time used
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-2">
        {!challengeState.isRunning ? (
          <Button onClick={startChallenge} className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Start Challenge
          </Button>
        ) : (
          <>
            <Button
              onClick={pauseChallenge}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Pause className="w-4 h-4" />
              {challengeState.isPaused ? "Resume" : "Pause"}
            </Button>

            <Button
              onClick={stopChallenge}
              variant="default"
              size="sm"
              className="flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              Finish
            </Button>
          </>
        )}

        <Button
          onClick={resetChallenge}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>

      {/* Challenge Status */}
      {challengeState.isRunning && (
        <div className="text-center">
          <div
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium",
              challengeState.isPaused
                ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                : "bg-green-100 text-green-800 border border-green-200"
            )}
          >
            {challengeState.isPaused ? (
              <>
                <Pause className="w-3 h-3" />
                Challenge Paused
              </>
            ) : (
              <>
                <Zap className="w-3 h-3" />
                Challenge Active
              </>
            )}
          </div>
        </div>
      )}

      {/* Results Modal */}
      {showResults && challengeResult && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            // Close modal when clicking on backdrop
            if (e.target === e.currentTarget) {
              setShowResults(false);
            }
          }}
        >
          <div className="bg-card border rounded-lg p-8 text-center space-y-6 animate-in fade-in zoom-in duration-300 max-w-md mx-4 relative">
            {/* Close Button */}
            <button
              onClick={() => setShowResults(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
              aria-label="Close results"
            >
              <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
            </button>
            <div className="space-y-2">
              {challengeResult.success ? (
                <>
                  <div className="text-6xl">🎉</div>
                  <h3 className="text-2xl font-bold text-green-600">
                    Challenge Completed!
                  </h3>
                  <p className="text-muted-foreground">
                    You beat the estimated time!
                  </p>
                </>
              ) : (
                <>
                  <div className="text-6xl">⏰</div>
                  <h3 className="text-2xl font-bold text-orange-600">
                    Time's Up!
                  </h3>
                  <p className="text-muted-foreground">
                    You went over the target time, but great effort!
                  </p>
                </>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-foreground">
                    {formatTime(challengeResult.timeSpent)}
                  </div>
                  <div className="text-xs text-muted-foreground">Your Time</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-foreground">
                    {formatTime(challengeState.targetTime)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Target Time
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-lg font-semibold text-foreground">
                  {Math.round(challengeResult.percentageOfTarget)}% of target
                  time
                </div>
                <Progress
                  value={Math.min(challengeResult.percentageOfTarget, 100)}
                  className="mt-2"
                />
              </div>

              {challengeResult.success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800 font-medium">
                    <Trophy className="w-4 h-4" />
                    Speed Bonus Earned!
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    You've earned extra points for completing this topic
                    quickly!
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setShowResults(false)}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  resetChallenge();
                  setShowResults(false);
                }}
                className="flex-1"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
