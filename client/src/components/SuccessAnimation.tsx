import { useState, useEffect } from "react";
import { CheckCircle, Star, Zap, Trophy, Target, Sparkles } from "lucide-react";
import { cn } from "../lib/utils";

interface SuccessAnimationProps {
  show: boolean;
  type?: "problem" | "section" | "topic" | "badge" | "streak";
  message?: string;
  subMessage?: string;
  onComplete?: () => void;
  duration?: number;
}

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  velocity: { x: number; y: number };
}

export function SuccessAnimation({
  show,
  type = "problem",
  message,
  subMessage,
  onComplete,
  duration = 3000,
}: SuccessAnimationProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const handleClose = () => {
    setIsVisible(false);
    onComplete?.();
  };

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      generateConfetti();

      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);

  // Handle keyboard events for modal dismissal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isVisible) {
        handleClose();
      }
    };

    if (isVisible) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isVisible]);

  const generateConfetti = () => {
    const pieces: ConfettiPiece[] = [];
    const colors = [
      "#3b82f6",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#06b6d4",
    ];

    for (let i = 0; i < 50; i++) {
      pieces.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -10,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        velocity: {
          x: (Math.random() - 0.5) * 4,
          y: Math.random() * 3 + 2,
        },
      });
    }

    setConfetti(pieces);

    // Animate confetti
    const animateConfetti = () => {
      setConfetti((prev) =>
        prev
          .map((piece) => ({
            ...piece,
            x: piece.x + piece.velocity.x,
            y: piece.y + piece.velocity.y,
            rotation: piece.rotation + 5,
            velocity: {
              ...piece.velocity,
              y: piece.velocity.y + 0.1, // gravity
            },
          }))
          .filter((piece) => piece.y < window.innerHeight + 20)
      );
    };

    const interval = setInterval(animateConfetti, 16);
    setTimeout(() => clearInterval(interval), duration);
  };

  const getAnimationConfig = () => {
    switch (type) {
      case "problem":
        return {
          icon: CheckCircle,
          iconColor: "text-green-500",
          bgColor: "bg-green-50 border-green-200",
          title: message || "Problem Solved!",
          subtitle: subMessage || "Great work on that solution!",
          emoji: "✅",
        };
      case "section":
        return {
          icon: Star,
          iconColor: "text-blue-500",
          bgColor: "bg-blue-50 border-blue-200",
          title: message || "Section Complete!",
          subtitle: subMessage || "You're making excellent progress!",
          emoji: "⭐",
        };
      case "topic":
        return {
          icon: Trophy,
          iconColor: "text-yellow-500",
          bgColor: "bg-yellow-50 border-yellow-200",
          title: message || "Topic Mastered!",
          subtitle: subMessage || "Outstanding achievement!",
          emoji: "🏆",
        };
      case "badge":
        return {
          icon: Target,
          iconColor: "text-purple-500",
          bgColor: "bg-purple-50 border-purple-200",
          title: message || "Badge Earned!",
          subtitle: subMessage || "You've unlocked a new achievement!",
          emoji: "🎖️",
        };
      case "streak":
        return {
          icon: Zap,
          iconColor: "text-orange-500",
          bgColor: "bg-orange-50 border-orange-200",
          title: message || "Streak Extended!",
          subtitle: subMessage || "Keep up the momentum!",
          emoji: "🔥",
        };
      default:
        return {
          icon: Sparkles,
          iconColor: "text-primary",
          bgColor: "bg-primary/10 border-primary/20",
          title: message || "Success!",
          subtitle: subMessage || "Well done!",
          emoji: "✨",
        };
    }
  };

  if (!isVisible) return null;

  const config = getAnimationConfig();
  const IconComponent = config.icon;

  return (
    <>
      {/* Confetti Layer */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {confetti.map((piece) => (
          <div
            key={piece.id}
            className="absolute"
            style={{
              left: piece.x,
              top: piece.y,
              transform: `rotate(${piece.rotation}deg)`,
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              borderRadius: "2px",
            }}
          />
        ))}
      </div>

      {/* Success Modal */}
      <div
        className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 animate-in fade-in duration-300"
        onClick={(e) => {
          // Close modal when clicking on backdrop
          if (e.target === e.currentTarget) {
            handleClose();
          }
        }}
      >
        <div
          className={cn(
            "bg-card border-2 rounded-xl p-8 text-center space-y-6 animate-in zoom-in slide-in-from-bottom-4 duration-500 max-w-sm mx-4 shadow-2xl cursor-pointer",
            config.bgColor
          )}
          onClick={handleClose}
        >
          {/* Animated Icon */}
          <div className="relative">
            <div className="text-6xl animate-bounce">{config.emoji}</div>
            <div className="absolute -top-2 -right-2">
              <IconComponent
                className={cn("w-8 h-8 animate-pulse", config.iconColor)}
              />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-foreground animate-in slide-in-from-bottom-2 duration-700">
              {config.title}
            </h3>
            <p className="text-muted-foreground animate-in slide-in-from-bottom-2 duration-700 delay-100">
              {config.subtitle}
            </p>
          </div>

          {/* Animated Progress Rings */}
          <div className="flex justify-center space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-3 h-3 rounded-full animate-pulse",
                  config.iconColor.replace("text-", "bg-")
                )}
                style={{
                  animationDelay: `${i * 200}ms`,
                  animationDuration: "1s",
                }}
              />
            ))}
          </div>

          {/* Sparkle Effects */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <Sparkles
                key={i}
                className={cn(
                  "absolute w-4 h-4 animate-ping",
                  config.iconColor,
                  i % 2 === 0 ? "top-4 right-4" : "bottom-4 left-4"
                )}
                style={{
                  animationDelay: `${i * 300}ms`,
                  animationDuration: "2s",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// Preset animations for common use cases
export const ProblemSolvedAnimation = (
  props: Omit<SuccessAnimationProps, "type">
) => <SuccessAnimation {...props} type="problem" />;

export const SectionCompleteAnimation = (
  props: Omit<SuccessAnimationProps, "type">
) => <SuccessAnimation {...props} type="section" />;

export const TopicMasteredAnimation = (
  props: Omit<SuccessAnimationProps, "type">
) => <SuccessAnimation {...props} type="topic" />;

export const BadgeEarnedAnimation = (
  props: Omit<SuccessAnimationProps, "type">
) => <SuccessAnimation {...props} type="badge" />;

export const StreakExtendedAnimation = (
  props: Omit<SuccessAnimationProps, "type">
) => <SuccessAnimation {...props} type="streak" />;
