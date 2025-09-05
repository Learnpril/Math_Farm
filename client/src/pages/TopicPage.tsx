import React from "react";
import { useParams, Link } from "wouter";
import { ArrowLeft, Clock, Star, BookOpen } from "lucide-react";
import { MathExpression } from "../components/MathExpression";
import topicsData from "../data/topicsData.json";
import type { Topic } from "../../../shared/types";

export function TopicPage() {
  const params = useParams();
  const topicId = params.id;

  // Find the topic data
  const topic = topicsData.find((t: Topic) => t.id === topicId);

  if (!topic) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Topic Not Found
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          The topic "{topicId}" could not be found.
        </p>
        <Link
          href="/#topics"
          className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Topics
        </Link>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return "text-green-600 dark:text-green-400";
      case 2:
        return "text-blue-600 dark:text-blue-400";
      case 3:
        return "text-yellow-600 dark:text-yellow-400";
      case 4:
        return "text-orange-600 dark:text-orange-400";
      case 5:
        return "text-red-600 dark:text-red-400";
      default:
        return "text-muted-foreground";
    }
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case "elementary":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "middle":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "high":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "advanced":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "specialized":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          href="/#topics"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Topics
        </Link>
      </div>

      {/* Topic Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-4xl font-bold text-foreground">
                {topic.title}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelBadgeColor(
                  topic.level
                )}`}
              >
                {topic.level}
              </span>
            </div>

            <p className="text-lg text-muted-foreground mb-6">
              {topic.description}
            </p>

            {/* Topic Metadata */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{topic.estimatedTime} minutes</span>
              </div>

              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span className={getDifficultyColor(topic.difficulty)}>
                  Difficulty: {topic.difficulty}/5
                </span>
              </div>

              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>Level: {topic.level}</span>
              </div>
            </div>
          </div>

          {/* Math Expression Display */}
          <div className="lg:w-80">
            <div className="bg-card border rounded-lg p-6 text-center">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Key Formula
              </h3>
              <div className="text-lg">
                <MathExpression expression={topic.mathExpression} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prerequisites Section */}
      {topic.prerequisites.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Prerequisites
          </h2>
          <div className="flex flex-wrap gap-3">
            {topic.prerequisites.map((prereqId) => {
              const prereqTopic = topicsData.find(
                (t: Topic) => t.id === prereqId
              );
              return prereqTopic ? (
                <Link
                  key={prereqId}
                  href={`/topic/${prereqId}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {prereqTopic.title}
                </Link>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Content Placeholder */}
      <div className="bg-card border rounded-lg p-8 text-center">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          Coming Soon
        </h2>
        <p className="text-muted-foreground mb-6">
          Detailed lessons, interactive examples, and practice problems for{" "}
          {topic.title} will be available soon.
        </p>
        <div className="text-sm text-muted-foreground">
          This content will be implemented in future development phases.
        </div>
      </div>
    </div>
  );
}
