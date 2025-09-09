import React from "react";
import { LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";
import { Topic } from "../../../shared/types";
import { MathExpression } from "./MathExpression";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "./ui/tooltip";
import topicsData from "../data/topicsData.json";

interface TopicCardProps {
  topic: Topic;
  onClick: (id: string) => void;
  className?: string;
  tabIndex?: number;
  role?: string;
  "aria-posinset"?: number;
  "aria-setsize"?: number;
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
  tabIndex,
  role,
  "aria-posinset": ariaPosinset,
  "aria-setsize": ariaSetsize,
}) => {
  // Get the icon component dynamically
  const IconComponent = (Icons as any)[topic.icon] as LucideIcon;

  // Create a lookup for topic titles from prerequisites
  const topics = topicsData as Topic[];
  const topicLookup = React.useMemo(() => {
    return topics.reduce((acc, t) => {
      acc[t.id] = t.title;
      return acc;
    }, {} as Record<string, string>);
  }, []);

  const handleClick = () => {
    onClick(topic.id);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick(topic.id);
    }
  };

  // Generate comprehensive aria-label with improved accessibility
  const prerequisiteNames = topic.prerequisites
    .map((id) => topicLookup[id] || id)
    .join(", ");
  const ariaLabel = `Learn ${topic.title}. ${topic.description}. ${
    levelLabels[topic.level]
  } level, difficulty ${topic.difficulty} out of 5. Estimated time: ${
    topic.estimatedTime
  } minutes. ${
    topic.prerequisites.length > 0
      ? `Prerequisites: ${prerequisiteNames}`
      : "No prerequisites required"
  }.`;

  return (
    <article
      className={`
        topic-card group relative overflow-hidden rounded-xl border border-border bg-card p-4 
        shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02]
        focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
        cursor-pointer h-full flex flex-col ${className}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={tabIndex ?? 0}
      role={role ?? "button"}
      aria-label={ariaLabel}
      aria-describedby={`topic-${topic.id}-description`}
      aria-posinset={ariaPosinset}
      aria-setsize={ariaSetsize}
    >
      {/* Gradient overlay for visual appeal */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header with icon and title */}
        <div className="flex items-start space-x-2 mb-4">
          {IconComponent && (
            <div className="flex-shrink-0 p-1.5 rounded-lg bg-primary/10 text-primary">
              <IconComponent size={20} aria-hidden="true" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {topic.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p
          id={`topic-${topic.id}-description`}
          className="text-xs text-muted-foreground mb-4 line-clamp-3 flex-grow"
        >
          {topic.description}
        </p>

        {/* Math expression */}
        <div className="mb-4 p-2 rounded-lg bg-muted/50 border border-border/50 flex-shrink-0 overflow-hidden">
          <div className="text-center w-full">
            <MathExpression
              expression={topic.mathExpression}
              className="text-xs max-w-full"
              fallback={topic.mathExpression}
              ariaLabel={`Sample mathematical expression for ${topic.title}`}
              inline={true}
            />
          </div>
        </div>

        {/* Bottom metadata section - centered */}
        <div className="mt-auto space-y-2">
          {/* Level badge - centered */}
          <div className="flex justify-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
              {levelLabels[topic.level]}
            </span>
          </div>

          {/* Time and Difficulty - centered on separate lines */}
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground">
              <Icons.Clock size={10} aria-hidden="true" />
              <span>{topic.estimatedTime} min</span>
            </div>

            <div className="flex justify-center">
              <span
                className={`
                  inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                  ${difficultyColors[topic.difficulty]}
                `}
                aria-label={`Difficulty level ${topic.difficulty} out of 5`}
              >
                Difficulty: {topic.difficulty}/5
              </span>
            </div>
          </div>

          {/* Prerequisites - if any */}
          {topic.prerequisites.length > 0 && (
            <div className="flex justify-center pt-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center space-x-1 cursor-help text-xs text-muted-foreground">
                      <Icons.BookOpen size={10} aria-hidden="true" />
                      <span>
                        {topic.prerequisites.length} prerequisite
                        {topic.prerequisites.length !== 1 ? "s" : ""}
                      </span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-sm max-w-48">
                      <p className="font-medium mb-1">Prerequisites:</p>
                      <ul className="space-y-1">
                        {topic.prerequisites.map((prereqId) => (
                          <li key={prereqId} className="text-xs">
                            • {topicLookup[prereqId] || prereqId}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </div>

      {/* Hover indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
    </article>
  );
};
