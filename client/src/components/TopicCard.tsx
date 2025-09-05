import React from "react";
import { LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";
import { Topic } from "../../../shared/types";
import { MathExpression } from "./MathExpression";

interface TopicCardProps {
  topic: Topic;
  onClick: (id: string) => void;
  className?: string;
}

const difficultyColors = {
  1: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  2: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  3: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  4: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
  5: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
} as const;

const levelLabels = {
  elementary: "Elementary",
  middle: "Middle School",
  high: "High School",
  advanced: "Advanced",
  specialized: "Specialized",
} as const;

export const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  onClick,
  className = "",
}) => {
  // Get the icon component dynamically
  const IconComponent = (Icons as any)[topic.icon] as LucideIcon;

  const handleClick = () => {
    onClick(topic.id);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick(topic.id);
    }
  };

  // Generate comprehensive aria-label
  const ariaLabel = `${topic.title}, ${
    levelLabels[topic.level]
  } level, difficulty ${topic.difficulty} out of 5. ${
    topic.description
  }. Estimated time: ${topic.estimatedTime} minutes. ${
    topic.prerequisites.length > 0
      ? `Prerequisites: ${topic.prerequisites.length}`
      : "No prerequisites"
  }.`;

  return (
    <article
      className={`
        group relative overflow-hidden rounded-xl border border-border bg-card p-6 
        shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02]
        focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
        cursor-pointer ${className}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={ariaLabel}
      aria-describedby={`topic-${topic.id}-description`}
    >
      {/* Gradient overlay for visual appeal */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header with icon and level */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {IconComponent && (
              <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10 text-primary">
                <IconComponent size={24} aria-hidden="true" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {topic.title}
              </h3>
              <span className="text-sm text-muted-foreground">
                {levelLabels[topic.level]}
              </span>
            </div>
          </div>

          {/* Difficulty badge */}
          <span
            className={`
              inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
              ${difficultyColors[topic.difficulty]}
            `}
            aria-label={`Difficulty level ${topic.difficulty} out of 5`}
          >
            {topic.difficulty}/5
          </span>
        </div>

        {/* Description */}
        <p
          id={`topic-${topic.id}-description`}
          className="text-sm text-muted-foreground mb-4 line-clamp-2"
        >
          {topic.description}
        </p>

        {/* Math expression */}
        <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-border/50">
          <div className="text-center">
            <MathExpression
              expression={topic.mathExpression}
              className="text-sm"
              fallback={topic.mathExpression}
              ariaLabel={`Sample mathematical expression for ${topic.title}`}
            />
          </div>
        </div>

        {/* Footer with estimated time and prerequisites */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center space-x-1">
            <Icons.Clock size={12} aria-hidden="true" />
            <span>{topic.estimatedTime} min</span>
          </span>

          {topic.prerequisites.length > 0 && (
            <span className="flex items-center space-x-1">
              <Icons.BookOpen size={12} aria-hidden="true" />
              <span>
                {topic.prerequisites.length} prereq
                {topic.prerequisites.length !== 1 ? "s" : ""}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Hover indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
    </article>
  );
};
