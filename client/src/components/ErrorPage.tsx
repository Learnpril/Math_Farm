// React 19 - no need to import React
import { Link } from "wouter";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  ArrowLeft,
  BookOpen,
  Wrench,
  Wifi,
  Server,
  Bug,
} from "lucide-react";
import { Badge } from "./ui/badge";

export type ErrorType =
  | "not-found"
  | "network"
  | "server"
  | "permission"
  | "timeout"
  | "generic"
  | "library-load"
  | "calculation";

interface ErrorPageProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  details?: string;
  onRetry?: () => void;
  showRetry?: boolean;
  showHome?: boolean;
  showBack?: boolean;
  suggestions?: Array<{
    title: string;
    description: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
  }>;
  className?: string;
}

const errorConfigs: Record<
  ErrorType,
  {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    message: string;
    color: string;
  }
> = {
  "not-found": {
    icon: AlertTriangle,
    title: "Page Not Found",
    message: "The page you're looking for doesn't exist or has been moved.",
    color: "text-amber-500",
  },
  network: {
    icon: Wifi,
    title: "Connection Error",
    message:
      "Unable to connect to the server. Please check your internet connection.",
    color: "text-red-500",
  },
  server: {
    icon: Server,
    title: "Server Error",
    message: "Something went wrong on our end. Please try again later.",
    color: "text-red-500",
  },
  permission: {
    icon: AlertTriangle,
    title: "Access Denied",
    message: "You don't have permission to access this resource.",
    color: "text-orange-500",
  },
  timeout: {
    icon: AlertTriangle,
    title: "Request Timeout",
    message: "The request took too long to complete. Please try again.",
    color: "text-yellow-500",
  },
  "library-load": {
    icon: Bug,
    title: "Library Loading Error",
    message:
      "Failed to load required mathematical libraries. This might be due to network issues or browser restrictions.",
    color: "text-purple-500",
  },
  calculation: {
    icon: AlertTriangle,
    title: "Calculation Error",
    message:
      "An error occurred during the mathematical calculation. Please check your input and try again.",
    color: "text-blue-500",
  },
  generic: {
    icon: AlertTriangle,
    title: "Something Went Wrong",
    message: "An unexpected error occurred. Please try again.",
    color: "text-gray-500",
  },
};

export function ErrorPage({
  type = "generic",
  title,
  message,
  details,
  onRetry,
  showRetry = true,
  showHome = true,
  showBack = true,
  suggestions = [],
  className = "",
}: ErrorPageProps) {
  const config = errorConfigs[type];
  const IconComponent = config.icon;

  const defaultSuggestions = [
    {
      title: "Browse Topics",
      description: "Explore our mathematics topics",
      href: "/#topics",
      icon: BookOpen,
    },
    {
      title: "Math Tools",
      description: "Try our interactive calculators",
      href: "/tools",
      icon: Wrench,
    },
    {
      title: "LaTeX Guide",
      description: "Learn LaTeX syntax",
      href: "/latex-guide",
      icon: BookOpen,
    },
  ];

  const displaySuggestions =
    suggestions.length > 0 ? suggestions : defaultSuggestions;

  return (
    <div className={`container mx-auto px-4 py-16 ${className}`}>
      <div className="max-w-2xl mx-auto text-center">
        {/* Error Icon and Header */}
        <div className="mb-8">
          <IconComponent className={`w-16 h-16 mx-auto mb-4 ${config.color}`} />
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {title || config.title}
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            {message || config.message}
          </p>

          {details && (
            <div className="inline-block p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
              {details}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}

          {showBack && (
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          )}

          {showHome && (
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
          )}
        </div>

        {/* Suggestions */}
        {displaySuggestions.length > 0 && (
          <div className="text-left">
            <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
              What would you like to do instead?
            </h3>

            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
              {displaySuggestions.map((suggestion, index) => {
                const SuggestionIcon = suggestion.icon || BookOpen;
                return (
                  <Link
                    key={index}
                    href={suggestion.href}
                    className="group block p-4 bg-card border rounded-lg hover:bg-muted/50 hover:border-primary/20 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <SuggestionIcon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors mb-1">
                          {suggestion.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {suggestion.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Error Type Badge (Development) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 flex justify-center">
            <Badge variant="outline" className="text-xs">
              Error Type: {type}
            </Badge>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            If this problem persists, try refreshing the page or clearing your
            browser cache.
          </p>
        </div>
      </div>
    </div>
  );
}

// Convenience components for common error types
export function NetworkErrorPage(props: Omit<ErrorPageProps, "type">) {
  return <ErrorPage type="network" {...props} />;
}

export function ServerErrorPage(props: Omit<ErrorPageProps, "type">) {
  return <ErrorPage type="server" {...props} />;
}

export function LibraryLoadErrorPage(props: Omit<ErrorPageProps, "type">) {
  return <ErrorPage type="library-load" {...props} />;
}

export function CalculationErrorPage(props: Omit<ErrorPageProps, "type">) {
  return <ErrorPage type="calculation" {...props} />;
}
