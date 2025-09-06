// React 19 - no need to import React
import { useParams, Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Clock,
  Star,
  BookOpen,
  CheckCircle,
  Circle,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { MathExpression } from "../components/MathExpression";
import { Badge } from "../components/ui/badge";
import { LessonContent } from "../components/LessonContent";
import {
  JSXGraphDemo,
  demoInitializers,
  demoConfigs,
} from "../components/JSXGraphDemo";
import topicsData from "../data/topicsData.json";
import { lessonContentData } from "../data/lessonContent";
import type { Topic } from "../../../shared/types";

interface TopicProgress {
  startedAt: Date;
  completedAt?: Date;
  sectionsCompleted: string[];
  lessonSectionsCompleted: string[];
  timeSpent: number;
}

interface UserProgress {
  completedTopics: string[];
  topicProgress: Record<string, TopicProgress>;
}

export function TopicPage() {
  const params = useParams();
  const topicId = params.id;
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    // Load progress from localStorage
    const saved = localStorage.getItem("mathfarm-progress");
    return saved
      ? JSON.parse(saved)
      : { completedTopics: [], topicProgress: {} };
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Find the topic data with error handling
  const topic = topicsData.find((t) => t.id === topicId) as Topic | undefined;

  // Helper functions for progress tracking
  const isTopicCompleted = (topicId: string) => {
    return userProgress.completedTopics.includes(topicId);
  };

  const getPrerequisiteProgress = (prereqId: string) => {
    return userProgress.topicProgress[prereqId];
  };

  // Focus management on page load for accessibility
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.focus();
    }

    // Simulate loading state for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (!topic) {
        setError(`Topic "${topicId}" not found`);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [topic, topicId]);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("mathfarm-progress", JSON.stringify(userProgress));
  }, [userProgress]);

  // Track topic visit
  useEffect(() => {
    if (topic && !isLoading) {
      setUserProgress((prev) => ({
        ...prev,
        topicProgress: {
          ...prev.topicProgress,
          [topic.id]: {
            startedAt: prev.topicProgress[topic.id]?.startedAt || new Date(),
            sectionsCompleted:
              prev.topicProgress[topic.id]?.sectionsCompleted || [],
            lessonSectionsCompleted:
              prev.topicProgress[topic.id]?.lessonSectionsCompleted || [],
            timeSpent: prev.topicProgress[topic.id]?.timeSpent || 0,
            ...prev.topicProgress[topic.id],
          },
        },
      }));
    }
  }, [topic, isLoading]);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
          <div className="h-12 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-muted rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="h-64 bg-muted rounded"></div>
            </div>
            <div className="lg:col-span-1">
              <div className="h-48 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state - topic not found
  if (error || !topic) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Topic Not Found
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            {error || `The topic "${topicId}" could not be found.`}
          </p>
          <div className="space-y-4">
            <Link
              href="/#topics"
              className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Topics
            </Link>
            <div className="text-sm text-muted-foreground">
              <p>Suggested topics:</p>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {topicsData.slice(0, 3).map((suggestedTopic) => (
                  <Link
                    key={suggestedTopic.id}
                    href={`/topic/${suggestedTopic.id}`}
                    className="px-3 py-1 bg-muted hover:bg-muted/80 rounded text-xs transition-colors"
                  >
                    {suggestedTopic.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

      {/* Responsive Layout with Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content Area */}
        <div
          className="lg:col-span-3 space-y-8"
          ref={mainContentRef}
          tabIndex={-1}
          aria-label={`${topic.title} topic content`}
        >
          {/* Topic Header */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              <div className="flex-1">
                {/* Title and Level Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                  <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                    {topic.title}
                  </h1>
                  <Badge variant={topic.level as any} className="w-fit">
                    {topic.level.charAt(0).toUpperCase() + topic.level.slice(1)}
                  </Badge>
                </div>

                <p className="text-lg text-muted-foreground mb-6">
                  {topic.description}
                </p>

                {/* Enhanced Topic Metadata */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  {/* Estimated Time */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {topic.estimatedTime} min
                    </span>
                  </div>

                  {/* Difficulty Badge with Visual Indicators */}
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <Badge
                      variant={`difficulty${topic.difficulty}` as any}
                      className="flex items-center gap-1"
                    >
                      <span>Difficulty {topic.difficulty}/5</span>
                      <div className="flex gap-0.5 ml-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`w-1.5 h-1.5 rounded-full ${
                              level <= topic.difficulty
                                ? level <= 2
                                  ? "bg-green-500"
                                  : level <= 3
                                  ? "bg-yellow-500"
                                  : level <= 4
                                  ? "bg-orange-500"
                                  : "bg-red-500"
                                : "bg-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                    </Badge>
                  </div>

                  {/* Level Badge */}
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <Badge variant="outline" className="text-xs">
                      {topic.level.charAt(0).toUpperCase() +
                        topic.level.slice(1)}{" "}
                      Level
                    </Badge>
                  </div>
                </div>

                {/* Prerequisites Section */}
                {topic.prerequisites.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Prerequisites
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {topic.prerequisites.map((prereqId) => {
                        const prereqTopic = topicsData.find(
                          (t) => t.id === prereqId
                        ) as Topic | undefined;
                        const isCompleted = isTopicCompleted(prereqId);
                        const progress = getPrerequisiteProgress(prereqId);

                        return prereqTopic ? (
                          <Link
                            key={prereqId}
                            href={`/topic/${prereqId}`}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-card border rounded-lg hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <span className="text-sm font-medium">
                              {prereqTopic.title}
                            </span>
                            {isCompleted ? (
                              <CheckCircle className="w-3 h-3 text-green-600" />
                            ) : progress ? (
                              <Circle className="w-3 h-3 text-yellow-600" />
                            ) : (
                              <Circle className="w-3 h-3 text-muted-foreground" />
                            )}
                          </Link>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Math Expression Display */}
              <div className="sm:w-80">
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

          {/* Lesson Content System */}
          <LessonContentSection
            topicId={topic.id}
            userProgress={userProgress}
            setUserProgress={setUserProgress}
          />
        </div>

        {/* Sidebar - Progress and Related Topics */}
        <div className="lg:col-span-1 space-y-6">
          {/* Progress Section */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Star className="w-5 h-5" />
              Your Progress
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span
                  className={`text-sm font-medium ${
                    isTopicCompleted(topic.id)
                      ? "text-green-600"
                      : userProgress.topicProgress[topic.id]
                      ? "text-yellow-600"
                      : "text-muted-foreground"
                  }`}
                >
                  {isTopicCompleted(topic.id)
                    ? "Completed"
                    : userProgress.topicProgress[topic.id]
                    ? "In Progress"
                    : "Not Started"}
                </span>
              </div>

              {userProgress.topicProgress[topic.id] && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Time Spent
                    </span>
                    <span className="text-sm font-medium">
                      {Math.round(
                        userProgress.topicProgress[topic.id].timeSpent / 60
                      )}{" "}
                      min
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Started
                    </span>
                    <span className="text-sm font-medium">
                      {new Date(
                        userProgress.topicProgress[topic.id].startedAt
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Lesson Progress */}
              <div className="pt-4 border-t border-border">
                {(() => {
                  const lessonContent = lessonContentData[topic.id];
                  const completedSections =
                    userProgress.topicProgress[topic.id]
                      ?.lessonSectionsCompleted || [];
                  const totalSections = lessonContent?.sections.length || 0;
                  const progressPercentage =
                    totalSections > 0
                      ? (completedSections.length / totalSections) * 100
                      : 0;

                  return (
                    <>
                      <div className="text-xs text-muted-foreground mb-2">
                        Lesson Sections ({completedSections.length}/
                        {totalSections})
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      {totalSections === 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Lesson content coming soon
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Related Topics */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Related Topics
            </h3>
            <div className="space-y-2">
              {topicsData
                .filter(
                  (t) =>
                    t.id !== topic.id &&
                    (t.prerequisites.includes(topic.id) ||
                      topic.prerequisites.some((prereq) =>
                        t.prerequisites.includes(prereq)
                      ))
                )
                .slice(0, 3)
                .map((relatedTopic) => (
                  <Link
                    key={relatedTopic.id}
                    href={`/topic/${relatedTopic.id}`}
                    className="block p-2 text-sm hover:bg-muted rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {relatedTopic.title}
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Lesson Content Section Component
interface LessonContentSectionProps {
  topicId: string;
  userProgress: UserProgress;
  setUserProgress: React.Dispatch<React.SetStateAction<UserProgress>>;
}

function LessonContentSection({
  topicId,
  userProgress,
  setUserProgress,
}: LessonContentSectionProps) {
  const lessonContent = lessonContentData[topicId];

  // If no lesson content available, show placeholder
  if (!lessonContent) {
    return (
      <div className="bg-card border rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          Lesson Content Coming Soon
        </h2>
        <p className="text-muted-foreground mb-6">
          Detailed lessons, interactive examples, and practice problems for this
          topic will be available in the next development phase.
        </p>
        <div className="text-sm text-muted-foreground">
          This content will include:
        </div>
        <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
          <li>Interactive lesson sections with MathJax integration</li>
          <li>Step-by-step explanations and examples</li>
          <li>Practice problems with instant feedback</li>
          <li>Progress tracking and completion indicators</li>
        </ul>
      </div>
    );
  }

  const completedSections =
    userProgress.topicProgress[topicId]?.lessonSectionsCompleted || [];

  const handleSectionComplete = (sectionId: string) => {
    setUserProgress((prev) => ({
      ...prev,
      topicProgress: {
        ...prev.topicProgress,
        [topicId]: {
          ...prev.topicProgress[topicId],
          startedAt: prev.topicProgress[topicId]?.startedAt || new Date(),
          sectionsCompleted:
            prev.topicProgress[topicId]?.sectionsCompleted || [],
          lessonSectionsCompleted: [
            ...(prev.topicProgress[topicId]?.lessonSectionsCompleted || []),
            sectionId,
          ].filter((id, index, arr) => arr.indexOf(id) === index), // Remove duplicates
          timeSpent: prev.topicProgress[topicId]?.timeSpent || 0,
        },
      },
    }));
  };

  return (
    <div className="space-y-8">
      <LessonContent
        lessonContent={lessonContent}
        onSectionComplete={handleSectionComplete}
        completedSections={completedSections}
      />

      {/* Interactive Demos Section */}
      {topicId === "geometry" && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-foreground">
            Interactive Demonstrations
          </h3>

          <div className="grid gap-6 md:grid-cols-2">
            <JSXGraphDemo
              id="circle-area-demo"
              config={demoConfigs.geometryShapes}
              onInit={demoInitializers.circleArea}
              title="Circle Area Calculator"
              description="Drag the radius point to see how the area changes"
            />

            <JSXGraphDemo
              id="triangle-area-demo"
              config={demoConfigs.geometryShapes}
              onInit={demoInitializers.triangleArea}
              title="Triangle Area Calculator"
              description="Move the vertices to explore triangle area calculation"
            />
          </div>
        </div>
      )}

      {topicId === "algebra" && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-foreground">
            Interactive Function Explorer
          </h3>

          <JSXGraphDemo
            id="quadratic-function-demo"
            config={demoConfigs.functionPlotter}
            onInit={demoInitializers.quadraticFunction}
            title="Quadratic Function Explorer"
            description="Adjust the sliders to see how coefficients affect the parabola"
          />
        </div>
      )}
    </div>
  );
}
