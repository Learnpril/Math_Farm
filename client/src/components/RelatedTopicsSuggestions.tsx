import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Link } from "wouter";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { cn } from "../lib/utils";
import type { Topic } from "../../shared/types";

interface RelatedTopicsSuggestionsProps {
  currentTopic: Topic;
  allTopics: Topic[];
  userProgress: any;
  getTopicProgress: (topicId: string) => any;
  isTopicCompleted: (topicId: string) => boolean;
  getTopicCompletionPercentage: (
    topicId: string,
    lessonSections: number,
    practiceProblems: number
  ) => number;
}

interface SuggestedTopic extends Topic {
  suggestionReason: "prerequisite" | "next-step" | "related" | "similar-level";
  completionPercentage: number;
  isCompleted: boolean;
  hasStarted: boolean;
}

export function RelatedTopicsSuggestions({
  currentTopic,
  allTopics,
  userProgress,
  getTopicProgress,
  isTopicCompleted,
  getTopicCompletionPercentage,
}: RelatedTopicsSuggestionsProps) {
  // Early return if required props are not available
  if (
    !currentTopic ||
    !allTopics ||
    !getTopicProgress ||
    !isTopicCompleted ||
    !getTopicCompletionPercentage
  ) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Related Topics
        </h3>
        <div className="text-center py-6">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Loading related topics...</p>
        </div>
      </Card>
    );
  }
  const getSuggestedTopics = (): SuggestedTopic[] => {
    const suggestions: SuggestedTopic[] = [];

    // Safety checks for required data
    if (!allTopics || !Array.isArray(allTopics) || !currentTopic) {
      return suggestions;
    }

    allTopics.forEach((topic) => {
      if (!topic || topic.id === currentTopic.id) return;

      const progress = getTopicProgress(topic.id);
      const completed = isTopicCompleted(topic.id);
      const completionPercentage = getTopicCompletionPercentage(
        topic.id,
        5,
        10
      ); // Assuming 5 lessons, 10 problems

      let suggestionReason: SuggestedTopic["suggestionReason"] | null = null;

      // Ensure prerequisites arrays exist
      const topicPrereqs = topic.prerequisites || [];
      const currentTopicPrereqs = currentTopic.prerequisites || [];

      // Check if this topic builds on the current topic (current topic is a prerequisite)
      if (topicPrereqs.includes(currentTopic.id)) {
        suggestionReason = "next-step";
      }
      // Check if this topic shares prerequisites with current topic
      else if (
        topicPrereqs.some((prereq) => currentTopicPrereqs.includes(prereq))
      ) {
        suggestionReason = "related";
      }
      // Check if this topic is a prerequisite for the current topic
      else if (currentTopicPrereqs.includes(topic.id)) {
        suggestionReason = "prerequisite";
      }
      // Check if topics are at similar level and difficulty
      else if (
        topic.level === currentTopic.level &&
        Math.abs((topic.difficulty || 0) - (currentTopic.difficulty || 0)) <= 1
      ) {
        suggestionReason = "similar-level";
      }

      if (suggestionReason) {
        suggestions.push({
          ...topic,
          suggestionReason,
          completionPercentage,
          isCompleted: completed,
          hasStarted: !!progress,
        });
      }
    });

    // Sort suggestions by priority and completion status
    return suggestions
      .sort((a, b) => {
        // Prioritize next-step topics
        if (
          a.suggestionReason === "next-step" &&
          b.suggestionReason !== "next-step"
        )
          return -1;
        if (
          b.suggestionReason === "next-step" &&
          a.suggestionReason !== "next-step"
        )
          return 1;

        // Then prerequisites
        if (
          a.suggestionReason === "prerequisite" &&
          b.suggestionReason !== "prerequisite"
        )
          return -1;
        if (
          b.suggestionReason === "prerequisite" &&
          a.suggestionReason !== "prerequisite"
        )
          return 1;

        // Then by completion status (incomplete first)
        if (!a.isCompleted && b.isCompleted) return -1;
        if (a.isCompleted && !b.isCompleted) return 1;

        // Finally by difficulty
        return (a.difficulty || 0) - (b.difficulty || 0);
      })
      .slice(0, 6); // Limit to 6 suggestions
  };

  const getSuggestionReasonText = (
    reason: SuggestedTopic["suggestionReason"]
  ) => {
    switch (reason) {
      case "next-step":
        return "Next recommended topic";
      case "prerequisite":
        return "Recommended prerequisite";
      case "related":
        return "Related topic";
      case "similar-level":
        return "Similar difficulty level";
      default:
        return "Suggested topic";
    }
  };

  const getSuggestionReasonColor = (
    reason: SuggestedTopic["suggestionReason"]
  ) => {
    switch (reason) {
      case "next-step":
        return "bg-green-100 text-green-800 border-green-200";
      case "prerequisite":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "related":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "similar-level":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const suggestedTopics = getSuggestedTopics();

  if (suggestedTopics.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Related Topics
        </h3>
        <div className="text-center py-6">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            No related topics found. Explore the topics section to discover
            more!
          </p>
          <Link href="/#topics">
            <Button variant="outline" className="mt-4">
              Browse All Topics
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Related Topics
          </h3>
          <Badge variant="outline" className="text-xs">
            {suggestedTopics.length} suggestions
          </Badge>
        </div>

        <div className="space-y-3">
          {suggestedTopics.map((topic) => (
            <Link key={topic.id} href={`/topic/${topic.id}`}>
              <div className="group p-4 border rounded-lg hover:bg-muted/50 transition-all duration-200 cursor-pointer">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {topic.title}
                        </h4>
                        {topic.isCompleted && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {topic.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
                  </div>

                  {/* Suggestion Reason */}
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs border",
                        getSuggestionReasonColor(topic.suggestionReason)
                      )}
                    >
                      {getSuggestionReasonText(topic.suggestionReason)}
                    </Badge>

                    <Badge variant="outline" className="text-xs">
                      {topic.level}
                    </Badge>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {topic.estimatedTime}min
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <TrendingUp className="w-3 h-3" />
                      Level {topic.difficulty}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {topic.hasStarted && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {topic.completionPercentage}%
                        </span>
                      </div>
                      <Progress
                        value={topic.completionPercentage}
                        className="h-1.5"
                      />
                    </div>
                  )}

                  {/* Prerequisites Check */}
                  {topic.prerequisites && topic.prerequisites.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <span>Prerequisites: </span>
                      {(topic.prerequisites || []).map((prereqId, index) => {
                        const prereqTopic = allTopics?.find(
                          (t) => t && t.id === prereqId
                        );
                        const prereqCompleted = isTopicCompleted(prereqId);

                        return (
                          <span key={prereqId}>
                            <span
                              className={
                                prereqCompleted
                                  ? "text-green-600"
                                  : "text-orange-600"
                              }
                            >
                              {prereqTopic?.title || prereqId}
                            </span>
                            {index < (topic.prerequisites || []).length - 1 &&
                              ", "}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Call to Action */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Continue your learning journey
            </div>
            <Link href="/#topics">
              <Button variant="ghost" size="sm" className="text-xs">
                View All Topics
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
