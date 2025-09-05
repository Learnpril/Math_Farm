import { Badge } from "../../shared/types";
import { Star, Trophy, Target, Flame, Compass, Wrench } from "lucide-react";

interface GamificationBadgeProps {
  badge: Badge;
  size?: "sm" | "md" | "lg";
  showDescription?: boolean;
  className?: string;
}

/**
 * GamificationBadge component for displaying earned badges
 * Shows badge icon, name, and optional description with proper styling
 */
export function GamificationBadge({
  badge,
  size = "md",
  showDescription = false,
  className = "",
}: GamificationBadgeProps) {
  // Icon mapping for different badge types
  const getIcon = (badgeId: string) => {
    switch (badgeId) {
      case "first-visit":
        return Star;
      case "topic-explorer":
        return Compass;
      case "tool-user":
        return Wrench;
      case "practice-starter":
        return Target;
      case "streak-keeper":
        return Flame;
      case "dedicated-learner":
        return Trophy;
      default:
        return Star;
    }
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      container: "w-12 h-12",
      icon: "w-6 h-6",
      text: "text-xs",
      padding: "p-2",
    },
    md: {
      container: "w-16 h-16",
      icon: "w-8 h-8",
      text: "text-sm",
      padding: "p-3",
    },
    lg: {
      container: "w-20 h-20",
      icon: "w-10 h-10",
      text: "text-base",
      padding: "p-4",
    },
  };

  // Category-based styling
  const getCategoryStyle = (category: string) => {
    switch (category) {
      case "exploration":
        return "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300";
      case "practice":
        return "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-600 text-green-700 dark:text-green-300";
      case "streak":
        return "bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-600 text-orange-700 dark:text-orange-300";
      case "achievement":
        return "bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300";
    }
  };

  const IconComponent = getIcon(badge.id);
  const config = sizeConfig[size];
  const categoryStyle = getCategoryStyle(badge.category);

  return (
    <div className={`inline-flex flex-col items-center gap-2 ${className}`}>
      {/* Badge Icon */}
      <div
        className={`
          ${config.container} ${config.padding}
          ${categoryStyle}
          rounded-full border-2 
          flex items-center justify-center
          transition-all duration-200
          hover:scale-105 hover:shadow-lg
          cursor-pointer
          group
        `}
        title={badge.description}
        role="img"
        aria-label={`${badge.name} badge: ${badge.description}`}
      >
        <IconComponent
          className={`${config.icon} transition-transform group-hover:scale-110`}
          aria-hidden="true"
        />
      </div>

      {/* Badge Name */}
      <div className="text-center">
        <p className={`font-semibold text-foreground ${config.text}`}>
          {badge.name}
        </p>

        {/* Earned Date */}
        <p className="text-xs text-muted-foreground">
          {badge.earnedAt.toLocaleDateString()}
        </p>

        {/* Optional Description */}
        {showDescription && (
          <p className="text-xs text-muted-foreground mt-1 max-w-24 break-words">
            {badge.description}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * BadgeGrid component for displaying multiple badges in a grid layout
 */
interface BadgeGridProps {
  badges: Badge[];
  maxDisplay?: number;
  size?: "sm" | "md" | "lg";
  showDescription?: boolean;
  className?: string;
}

export function BadgeGrid({
  badges,
  maxDisplay = 6,
  size = "md",
  showDescription = false,
  className = "",
}: BadgeGridProps) {
  const displayBadges = badges.slice(0, maxDisplay);
  const remainingCount = badges.length - maxDisplay;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Badge Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 justify-items-center">
        {displayBadges.map((badge) => (
          <GamificationBadge
            key={badge.id}
            badge={badge}
            size={size}
            showDescription={showDescription}
          />
        ))}
      </div>

      {/* Show remaining count if there are more badges */}
      {remainingCount > 0 && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            +{remainingCount} more badge{remainingCount > 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Empty state */}
      {badges.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Trophy className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No badges earned yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Start exploring to earn your first badge!
          </p>
        </div>
      )}
    </div>
  );
}
