import { useState, useEffect, useRef } from "react";
import {
  Award,
  Star,
  Flame,
  Target,
  Clock,
  Trophy,
  Zap,
  BookOpen,
  X,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

export interface GameBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "exploration" | "practice" | "streak" | "achievement" | "time";
  earnedAt?: Date;
  progress?: number;
  maxProgress?: number;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface BadgeSystemProps {
  userProgress: any;
  topicId?: string;
  onBadgeEarned?: (badge: GameBadge) => void;
  showBadgeModal?: boolean;
}

// Define all available badges
const AVAILABLE_BADGES: GameBadge[] = [
  // Exploration Badges
  {
    id: "first-steps",
    name: "First Steps",
    description: "Complete your first lesson section",
    icon: "BookOpen",
    category: "exploration",
    rarity: "common",
    maxProgress: 1,
  },
  {
    id: "topic-explorer",
    name: "Topic Explorer",
    description: "Visit 5 different topics",
    icon: "Star",
    category: "exploration",
    rarity: "common",
    maxProgress: 5,
  },
  {
    id: "knowledge-seeker",
    name: "Knowledge Seeker",
    description: "Complete 10 lesson sections",
    icon: "BookOpen",
    category: "exploration",
    rarity: "rare",
    maxProgress: 10,
  },

  // Practice Badges
  {
    id: "problem-solver",
    name: "Problem Solver",
    description: "Solve your first practice problem",
    icon: "Target",
    category: "practice",
    rarity: "common",
    maxProgress: 1,
  },
  {
    id: "math-warrior",
    name: "Math Warrior",
    description: "Solve 25 practice problems",
    icon: "Trophy",
    category: "practice",
    rarity: "rare",
    maxProgress: 25,
  },
  {
    id: "calculation-master",
    name: "Calculation Master",
    description: "Solve 100 practice problems",
    icon: "Zap",
    category: "practice",
    rarity: "epic",
    maxProgress: 100,
  },

  // Streak Badges
  {
    id: "daily-learner",
    name: "Daily Learner",
    description: "Maintain a 3-day learning streak",
    icon: "Flame",
    category: "streak",
    rarity: "common",
    maxProgress: 3,
  },
  {
    id: "dedicated-student",
    name: "Dedicated Student",
    description: "Maintain a 7-day learning streak",
    icon: "Flame",
    category: "streak",
    rarity: "rare",
    maxProgress: 7,
  },
  {
    id: "unstoppable",
    name: "Unstoppable",
    description: "Maintain a 30-day learning streak",
    icon: "Flame",
    category: "streak",
    rarity: "legendary",
    maxProgress: 30,
  },

  // Time-based Badges
  {
    id: "speed-demon",
    name: "Speed Demon",
    description: "Complete a topic faster than estimated time",
    icon: "Zap",
    category: "time",
    rarity: "rare",
    maxProgress: 1,
  },
  {
    id: "marathon-learner",
    name: "Marathon Learner",
    description: "Spend 10+ hours learning",
    icon: "Clock",
    category: "time",
    rarity: "epic",
    maxProgress: 36000, // 10 hours in seconds
  },

  // Achievement Badges
  {
    id: "topic-master",
    name: "Topic Master",
    description: "Complete an entire topic",
    icon: "Award",
    category: "achievement",
    rarity: "rare",
    maxProgress: 1,
  },
  {
    id: "perfectionist",
    name: "Perfectionist",
    description: "Get 10 problems correct on first try",
    icon: "Star",
    category: "achievement",
    rarity: "epic",
    maxProgress: 10,
  },
];

const getBadgeIcon = (iconName: string) => {
  const icons = {
    Award,
    Star,
    Flame,
    Target,
    Clock,
    Trophy,
    Zap,
    BookOpen,
  };
  const IconComponent = icons[iconName as keyof typeof icons] || Award;
  return IconComponent;
};

const getRarityColor = (rarity: GameBadge["rarity"]) => {
  switch (rarity) {
    case "common":
      return "text-gray-600 border-gray-300 bg-gray-50";
    case "rare":
      return "text-blue-600 border-blue-300 bg-blue-50";
    case "epic":
      return "text-purple-600 border-purple-300 bg-purple-50";
    case "legendary":
      return "text-yellow-600 border-yellow-300 bg-yellow-50";
    default:
      return "text-gray-600 border-gray-300 bg-gray-50";
  }
};

export function BadgeSystem({
  userProgress,
  topicId,
  onBadgeEarned,
  showBadgeModal = false,
}: BadgeSystemProps) {
  const [earnedBadges, setEarnedBadges] = useState<GameBadge[]>([]);
  const [newlyEarnedBadges, setNewlyEarnedBadges] = useState<GameBadge[]>([]);
  const [showBadgeAnimation, setShowBadgeAnimation] = useState(false);
  const isCheckingBadges = useRef(false);

  // Handle keyboard events for modal dismissal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showBadgeAnimation) {
        setShowBadgeAnimation(false);
        setNewlyEarnedBadges([]);
      }
    };

    if (showBadgeAnimation) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [showBadgeAnimation]);

  // Check for newly earned badges (with error handling and throttling)
  useEffect(() => {
    const checkBadges = () => {
      // Prevent concurrent badge checking
      if (isCheckingBadges.current) return;
      isCheckingBadges.current = true;

      try {
        const newBadges: GameBadge[] = [];

        AVAILABLE_BADGES.forEach((badge) => {
          const alreadyEarned = earnedBadges.some(
            (earned) => earned.id === badge.id
          );
          if (alreadyEarned) return;

          let shouldEarn = false;
          let currentProgress = 0;

          switch (badge.id) {
            case "first-steps":
              currentProgress = Object.values(
                userProgress.topicProgress || {}
              ).reduce(
                (total: number, progress: any) =>
                  total + (progress.lessonSectionsCompleted?.length || 0),
                0
              );
              shouldEarn = currentProgress >= 1;
              break;

            case "topic-explorer":
              currentProgress = Object.keys(
                userProgress.topicProgress || {}
              ).length;
              shouldEarn = currentProgress >= 5;
              break;

            case "knowledge-seeker":
              currentProgress = Object.values(
                userProgress.topicProgress || {}
              ).reduce(
                (total: number, progress: any) =>
                  total + (progress.lessonSectionsCompleted?.length || 0),
                0
              );
              shouldEarn = currentProgress >= 10;
              break;

            case "problem-solver":
              currentProgress = Object.values(
                userProgress.topicProgress || {}
              ).reduce(
                (total: number, progress: any) =>
                  total + (progress.practiceProblemsCompleted?.length || 0),
                0
              );
              shouldEarn = currentProgress >= 1;
              break;

            case "math-warrior":
              currentProgress = Object.values(
                userProgress.topicProgress || {}
              ).reduce(
                (total: number, progress: any) =>
                  total + (progress.practiceProblemsCompleted?.length || 0),
                0
              );
              shouldEarn = currentProgress >= 25;
              break;

            case "calculation-master":
              currentProgress = Object.values(
                userProgress.topicProgress || {}
              ).reduce(
                (total: number, progress: any) =>
                  total + (progress.practiceProblemsCompleted?.length || 0),
                0
              );
              shouldEarn = currentProgress >= 100;
              break;

            case "daily-learner":
              currentProgress = userProgress.streak || 0;
              shouldEarn = currentProgress >= 3;
              break;

            case "dedicated-student":
              currentProgress = userProgress.streak || 0;
              shouldEarn = currentProgress >= 7;
              break;

            case "unstoppable":
              currentProgress = userProgress.streak || 0;
              shouldEarn = currentProgress >= 30;
              break;

            case "marathon-learner":
              currentProgress = userProgress.totalTimeSpent || 0;
              shouldEarn = currentProgress >= 36000; // 10 hours
              break;

            case "topic-master":
              currentProgress = userProgress.completedTopics?.length || 0;
              shouldEarn = currentProgress >= 1;
              break;

            default:
              break;
          }

          if (shouldEarn) {
            const earnedBadge = {
              ...badge,
              earnedAt: new Date(),
              progress: currentProgress,
            };
            newBadges.push(earnedBadge);
          }
        });

        if (newBadges.length > 0) {
          setEarnedBadges((prev) => [...prev, ...newBadges]);
          setNewlyEarnedBadges(newBadges);

          // Only show modal if explicitly requested
          if (showBadgeModal) {
            setShowBadgeAnimation(true);
            // Hide animation after 5 seconds
            setTimeout(() => {
              setShowBadgeAnimation(false);
              setNewlyEarnedBadges([]);
            }, 5000);
          }

          // Call callback for each new badge
          newBadges.forEach((badge) => {
            onBadgeEarned?.(badge);
          });
        }
      } catch (error) {
        console.error("Error checking badges:", error);
      } finally {
        isCheckingBadges.current = false;
      }
    };

    // Throttle badge checking to prevent excessive calls
    const timer = setTimeout(checkBadges, 200);
    return () => clearTimeout(timer);
  }, [userProgress, onBadgeEarned]); // Removed earnedBadges from dependencies to prevent infinite loop

  const getBadgeProgress = (badge: GameBadge) => {
    let currentProgress = 0;

    switch (badge.id) {
      case "first-steps":
      case "knowledge-seeker":
        currentProgress = Object.values(
          userProgress.topicProgress || {}
        ).reduce(
          (total: number, progress: any) =>
            total + (progress.lessonSectionsCompleted?.length || 0),
          0
        );
        break;

      case "topic-explorer":
        currentProgress = Object.keys(userProgress.topicProgress || {}).length;
        break;

      case "problem-solver":
      case "math-warrior":
      case "calculation-master":
        currentProgress = Object.values(
          userProgress.topicProgress || {}
        ).reduce(
          (total: number, progress: any) =>
            total + (progress.practiceProblemsCompleted?.length || 0),
          0
        );
        break;

      case "daily-learner":
      case "dedicated-student":
      case "unstoppable":
        currentProgress = userProgress.streak || 0;
        break;

      case "marathon-learner":
        currentProgress = userProgress.totalTimeSpent || 0;
        break;

      case "topic-master":
        currentProgress = userProgress.completedTopics?.length || 0;
        break;

      default:
        break;
    }

    return Math.min(currentProgress, badge.maxProgress || 1);
  };

  return (
    <>
      {/* Badge Display */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Award className="w-5 h-5" />
              Badges ({earnedBadges.length})
            </h3>
          </div>

          {/* Earned Badges */}
          {earnedBadges.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">
                Earned Badges
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {earnedBadges.map((badge) => {
                  const IconComponent = getBadgeIcon(badge.icon);
                  return (
                    <div
                      key={badge.id}
                      className={cn(
                        "p-3 rounded-lg border-2 text-center transition-all hover:scale-105",
                        getRarityColor(badge.rarity)
                      )}
                      title={`${badge.name}: ${badge.description}`}
                    >
                      <IconComponent className="w-6 h-6 mx-auto mb-2" />
                      <div className="text-xs font-medium">{badge.name}</div>
                      <div className="text-xs opacity-75">
                        {badge.earnedAt?.toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Progress Towards Next Badges */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">
              Progress Towards Badges
            </h4>
            <div className="space-y-3">
              {AVAILABLE_BADGES.filter(
                (badge) =>
                  !earnedBadges.some((earned) => earned.id === badge.id)
              )
                .slice(0, 3)
                .map((badge) => {
                  const IconComponent = getBadgeIcon(badge.icon);
                  const progress = getBadgeProgress(badge);
                  const percentage =
                    (progress / (badge.maxProgress || 1)) * 100;

                  return (
                    <div
                      key={badge.id}
                      className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                    >
                      <IconComponent className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">
                            {badge.name}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {badge.rarity}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          {badge.description}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-background rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {progress}/{badge.maxProgress}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {earnedBadges.length === 0 && (
            <div className="text-center py-6">
              <Award className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Start learning to earn your first badge!
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Badge Earned Animation */}
      {false &&
        showBadgeModal &&
        showBadgeAnimation &&
        newlyEarnedBadges.length > 0 && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={(e) => {
              // Close modal when clicking on backdrop
              if (e.target === e.currentTarget) {
                setShowBadgeAnimation(false);
                setNewlyEarnedBadges([]);
              }
            }}
          >
            <div className="bg-card border rounded-lg p-8 text-center space-y-4 animate-in fade-in zoom-in duration-500 max-w-md mx-4 relative">
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowBadgeAnimation(false);
                  setNewlyEarnedBadges([]);
                }}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
                aria-label="Close badge notification"
              >
                <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </button>

              <div className="text-6xl">🎉</div>
              <h3 className="text-2xl font-bold text-foreground">
                Badge Earned!
              </h3>
              {newlyEarnedBadges.map((badge) => {
                const IconComponent = getBadgeIcon(badge.icon);
                return (
                  <div key={badge.id} className="space-y-2">
                    <div
                      className={cn(
                        "w-16 h-16 rounded-full border-4 flex items-center justify-center mx-auto",
                        getRarityColor(badge.rarity)
                      )}
                    >
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-semibold text-foreground">
                      {badge.name}
                    </h4>
                    <p className="text-muted-foreground">{badge.description}</p>
                    <Badge variant="outline" className="mx-auto">
                      {badge.rarity.charAt(0).toUpperCase() +
                        badge.rarity.slice(1)}
                    </Badge>
                  </div>
                );
              })}
              <div className="flex gap-2 justify-center mt-6">
                <Button
                  onClick={() => {
                    setShowBadgeAnimation(false);
                    setNewlyEarnedBadges([]);
                  }}
                  className="flex-1"
                >
                  Continue Learning
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                Press Escape or click outside to close
              </p>
            </div>
          </div>
        )}
    </>
  );
}
