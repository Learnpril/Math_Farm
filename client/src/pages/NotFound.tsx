// React 19 - no need to import React
import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { Home, Search, BookOpen, ArrowRight, Lightbulb } from "lucide-react";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import topicsData from "../data/topicsData.json";
import type { Topic } from "../../../shared/types";

export function NotFound() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Extract potential topic name from URL for smart suggestions
  const extractTopicFromUrl = (url: string): string => {
    const segments = url.split("/").filter(Boolean);
    if (segments.length > 1 && segments[0] === "topic") {
      return segments[1].replace(/-/g, " ").toLowerCase();
    }
    return "";
  };

  const urlTopicName = extractTopicFromUrl(location);

  // Smart topic suggestions based on URL or search
  const getSuggestedTopics = useMemo(() => {
    const query = searchQuery.toLowerCase() || urlTopicName;

    if (!query) {
      // Return random topics if no query
      const shuffled = [...topicsData].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 6);
    }

    // Find topics that match the query
    const matches = topicsData.filter(
      (topic) =>
        topic.title.toLowerCase().includes(query) ||
        topic.description.toLowerCase().includes(query) ||
        topic.id.toLowerCase().includes(query) ||
        topic.level.toLowerCase().includes(query)
    );

    // If we have matches, return them, otherwise return similar topics
    if (matches.length > 0) {
      return matches.slice(0, 6);
    }

    // Fuzzy matching for similar topics
    const similarTopics = topicsData.filter((topic) => {
      const titleWords = topic.title.toLowerCase().split(" ");
      const queryWords = query.split(" ");

      return queryWords.some((queryWord) =>
        titleWords.some(
          (titleWord) =>
            titleWord.includes(queryWord) || queryWord.includes(titleWord)
        )
      );
    });

    return similarTopics.length > 0
      ? similarTopics.slice(0, 6)
      : topicsData.slice(0, 6); // Fallback to first 6 topics
  }, [searchQuery, urlTopicName]);

  const suggestedTopics = getSuggestedTopics;

  // Determine error context
  const getErrorContext = () => {
    if (location.includes("/topic/")) {
      return {
        title: "Topic Not Found",
        message: urlTopicName
          ? `We couldn't find a topic matching "${urlTopicName.replace(
              /[-_]/g,
              " "
            )}".`
          : "The topic you're looking for doesn't exist.",
        suggestion: "Try searching for a similar topic below:",
      };
    } else if (location.includes("/tools/")) {
      return {
        title: "Tool Not Found",
        message: "The mathematical tool you're looking for doesn't exist.",
        suggestion: "Check out our available tools:",
      };
    } else {
      return {
        title: "Page Not Found",
        message: "The page you're looking for doesn't exist or has been moved.",
        suggestion: "Explore our topics to find what you need:",
      };
    }
  };

  const errorContext = getErrorContext();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Header */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-3xl font-semibold text-foreground mb-4">
            {errorContext.title}
          </h2>
          <p className="text-lg text-muted-foreground mb-4">
            {errorContext.message}
          </p>
          {urlTopicName && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-700 dark:text-amber-300">
              <Lightbulb className="w-4 h-4" />
              <span className="text-sm">
                Looking for:{" "}
                <strong>"{urlTopicName.replace(/[-_]/g, " ")}"</strong>
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>

          <Link
            href="/tools"
            className="inline-flex items-center gap-2 px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Search className="w-4 h-4" />
            Browse Tools
          </Link>
        </div>

        {/* Search Functionality */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-4 text-center">
            {errorContext.suggestion}
          </h3>

          <div className="max-w-md mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search for topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full"
              />
            </div>
          </div>
        </div>

        {/* Topic Suggestions */}
        <div className="text-left">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-medium text-foreground">
              {searchQuery
                ? "Search Results"
                : urlTopicName
                ? "Similar Topics"
                : "Popular Topics"}
            </h4>
            {suggestedTopics.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {suggestedTopics.length} found
              </Badge>
            )}
          </div>

          {suggestedTopics.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No topics found matching "{searchQuery}"
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="text-primary hover:text-primary/80 font-medium"
              >
                Clear search to see all topics
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {suggestedTopics.map((topic) => (
                <Link
                  key={topic.id}
                  href={`/topic/${topic.id}`}
                  className="group block p-4 bg-card border rounded-lg hover:bg-muted/50 hover:border-primary/20 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {topic.title}
                        </h4>
                        <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all opacity-0 group-hover:opacity-100" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 overflow-hidden">
                        {topic.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="outline" className="text-xs">
                          {topic.level}
                        </Badge>
                        <span className="text-muted-foreground">
                          {topic.estimatedTime} min
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">
                          Difficulty: {topic.difficulty}/5
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/#topics"
            className="p-4 bg-card border rounded-lg hover:bg-muted/50 transition-colors text-center"
          >
            <BookOpen className="w-6 h-6 text-primary mx-auto mb-2" />
            <h5 className="font-medium text-foreground mb-1">All Topics</h5>
            <p className="text-xs text-muted-foreground">
              Browse all math topics
            </p>
          </Link>

          <Link
            href="/tools"
            className="p-4 bg-card border rounded-lg hover:bg-muted/50 transition-colors text-center"
          >
            <Search className="w-6 h-6 text-primary mx-auto mb-2" />
            <h5 className="font-medium text-foreground mb-1">Math Tools</h5>
            <p className="text-xs text-muted-foreground">
              Calculators & utilities
            </p>
          </Link>

          <Link
            href="/latex-guide"
            className="p-4 bg-card border rounded-lg hover:bg-muted/50 transition-colors text-center"
          >
            <BookOpen className="w-6 h-6 text-primary mx-auto mb-2" />
            <h5 className="font-medium text-foreground mb-1">LaTeX Guide</h5>
            <p className="text-xs text-muted-foreground">Learn LaTeX syntax</p>
          </Link>

          <Link
            href="/matlab-guide"
            className="p-4 bg-card border rounded-lg hover:bg-muted/50 transition-colors text-center"
          >
            <BookOpen className="w-6 h-6 text-primary mx-auto mb-2" />
            <h5 className="font-medium text-foreground mb-1">MATLAB Guide</h5>
            <p className="text-xs text-muted-foreground">MATLAB tutorials</p>
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            Still can't find what you're looking for? Try checking the URL for
            typos or
            <Link
              href="/"
              className="text-primary hover:text-primary/80 font-medium ml-1"
            >
              start from the home page
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
