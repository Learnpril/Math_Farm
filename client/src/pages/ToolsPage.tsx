import React from "react";
import { Link } from "wouter";
import { ArrowLeft, Calculator, TrendingUp, Grid3x3, Zap } from "lucide-react";

export function ToolsPage() {
  const tools = [
    {
      id: "calculator",
      title: "Advanced Calculator",
      description:
        "Perform complex mathematical calculations with step-by-step solutions",
      icon: Calculator,
      category: "computation",
      comingSoon: true,
    },
    {
      id: "graphing",
      title: "Function Grapher",
      description:
        "Visualize mathematical functions and explore their properties",
      icon: TrendingUp,
      category: "visualization",
      comingSoon: true,
    },
    {
      id: "matrix",
      title: "Matrix Calculator",
      description:
        "Work with matrices, solve systems of equations, and perform linear algebra operations",
      icon: Grid3x3,
      category: "linear-algebra",
      comingSoon: true,
    },
    {
      id: "solver",
      title: "Equation Solver",
      description:
        "Solve algebraic equations, derivatives, and integrals symbolically",
      icon: Zap,
      category: "symbolic",
      comingSoon: true,
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "computation":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "visualization":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "linear-algebra":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "symbolic":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Mathematical Tools
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Interactive tools to help you solve problems, visualize concepts, and
          explore mathematics.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool) => {
          const IconComponent = tool.icon;

          return (
            <div
              key={tool.id}
              className="bg-card border rounded-lg p-6 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <IconComponent className="w-6 h-6 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">
                      {tool.title}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                        tool.category
                      )}`}
                    >
                      {tool.category.replace("-", " ")}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    {tool.description}
                  </p>

                  {tool.comingSoon ? (
                    <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
                      Coming Soon
                    </div>
                  ) : (
                    <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md">
                      Open Tool →
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Coming Soon Notice */}
      <div className="mt-12 p-6 bg-muted/50 rounded-lg text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          More Tools Coming Soon
        </h2>
        <p className="text-muted-foreground">
          We're working on adding more interactive mathematical tools to help
          with your learning journey. These tools will be implemented in future
          development phases.
        </p>
      </div>
    </div>
  );
}
