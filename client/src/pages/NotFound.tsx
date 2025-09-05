import React from "react";
import { Link } from "wouter";
import { Home, Search, BookOpen } from "lucide-react";
import topicsData from "../data/topicsData.json";
import type { Topic } from "../../../shared/types";

export function NotFound() {
  // Get a few random topic suggestions
  const getRandomTopics = (count: number = 3) => {
    const shuffled = [...topicsData].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const suggestedTopics = getRandomTopics();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Header */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-3xl font-semibold text-foreground mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
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
            href="/#topics"
            className="inline-flex items-center gap-2 px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Search className="w-4 h-4" />
            Browse Topics
          </Link>
        </div>

        {/* Topic Suggestions */}
        <div className="text-left">
          <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
            Or explore these topics:
          </h3>

          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
            {suggestedTopics.map((topic: Topic) => (
              <Link
                key={topic.id}
                href={`/topic/${topic.id}`}
                className="block p-4 bg-card border rounded-lg hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground mb-1">
                      {topic.title}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {topic.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span className="capitalize">{topic.level}</span>
                      <span>•</span>
                      <span>{topic.estimatedTime} min</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-12 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            If you believe this is an error, please check the URL or try
            navigating from the home page.
          </p>
        </div>
      </div>
    </div>
  );
}
