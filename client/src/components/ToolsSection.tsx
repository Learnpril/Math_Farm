import React, { Suspense, useState } from "react";
import { Link } from "wouter";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { GraphingDemo } from "./GraphingDemo";
import { CalculatorDemo } from "./CalculatorDemo";
import { ArrowRight, Calculator, TrendingUp, AlertCircle } from "lucide-react";

export interface ToolsSectionProps {
  className?: string;
}

// Error boundary for tools section
class ToolsSectionErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ToolsSection Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            className="flex items-center gap-2 p-6 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Tools Section Error</h3>
              <p className="text-sm">
                Unable to load interactive tools. Please refresh the page or try
                again later.
              </p>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Loading component for tools
const ToolLoadingFallback: React.FC<{ title: string }> = ({ title }) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>Loading interactive demonstration...</CardDescription>
    </CardHeader>
    <CardContent>
      <div
        className="flex items-center justify-center p-8"
        role="status"
        aria-label={`Loading ${title}`}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">Loading tool...</span>
      </div>
    </CardContent>
  </Card>
);

export const ToolsSection: React.FC<ToolsSectionProps> = ({
  className = "",
}) => {
  const [activeDemo, setActiveDemo] = useState<
    "graphing" | "calculator" | null
  >(null);

  return (
    <section
      className={`py-16 px-4 ${className}`}
      aria-labelledby="tools-section-title"
    >
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2
            id="tools-section-title"
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            Interactive Tools
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Experience our powerful mathematical tools with live demonstrations.
            Perform calculations, create graphs, and solve complex problems
            instantly.
          </p>
          <Link href="/tools">
            <Button
              size="lg"
              className="group"
              aria-label="Navigate to full tools page"
            >
              Explore All Tools
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Tool Selection */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
          <Button
            variant={activeDemo === "calculator" ? "default" : "outline"}
            onClick={() =>
              setActiveDemo(activeDemo === "calculator" ? null : "calculator")
            }
            className="flex items-center gap-2"
            aria-pressed={activeDemo === "calculator"}
            aria-label="Toggle calculator demonstration"
          >
            <Calculator className="h-4 w-4" />
            Calculator Demo
          </Button>
          <Button
            variant={activeDemo === "graphing" ? "default" : "outline"}
            onClick={() =>
              setActiveDemo(activeDemo === "graphing" ? null : "graphing")
            }
            className="flex items-center gap-2"
            aria-pressed={activeDemo === "graphing"}
            aria-label="Toggle graphing demonstration"
          >
            <TrendingUp className="h-4 w-4" />
            Graphing Demo
          </Button>
        </div>

        {/* Tool Demonstrations */}
        <ToolsSectionErrorBoundary>
          <div className="space-y-8">
            {/* Calculator Demo */}
            {activeDemo === "calculator" && (
              <div
                className="animate-in slide-in-from-top-4 duration-300"
                role="region"
                aria-labelledby="calculator-demo-title"
              >
                <Suspense
                  fallback={<ToolLoadingFallback title="Advanced Calculator" />}
                >
                  <CalculatorDemo />
                </Suspense>
              </div>
            )}

            {/* Graphing Demo */}
            {activeDemo === "graphing" && (
              <div
                className="animate-in slide-in-from-top-4 duration-300"
                role="region"
                aria-labelledby="graphing-demo-title"
              >
                <Suspense
                  fallback={
                    <ToolLoadingFallback title="Interactive Graphing Tool" />
                  }
                >
                  <GraphingDemo />
                </Suspense>
              </div>
            )}

            {/* Default state - show overview cards */}
            {!activeDemo && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Calculator Overview */}
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-primary" />
                      Advanced Calculator
                    </CardTitle>
                    <CardDescription>
                      Perform complex mathematical calculations with support for
                      functions, constants, and advanced operations.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <p>• Scientific functions (sin, cos, log, sqrt)</p>
                      <p>• Mathematical constants (π, e, φ)</p>
                      <p>• Real-time calculation results</p>
                      <p>• Calculation history tracking</p>
                    </div>
                    <Button
                      onClick={() => setActiveDemo("calculator")}
                      className="w-full"
                      aria-label="Try calculator demonstration"
                    >
                      Try Calculator
                    </Button>
                  </CardContent>
                </Card>

                {/* Graphing Overview */}
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Interactive Graphing
                    </CardTitle>
                    <CardDescription>
                      Visualize mathematical functions with interactive graphs
                      that you can zoom, pan, and explore in real-time.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <p>• Plot any mathematical function</p>
                      <p>• Interactive zoom and pan controls</p>
                      <p>• Multiple function support</p>
                      <p>• Touch-friendly mobile interface</p>
                    </div>
                    <Button
                      onClick={() => setActiveDemo("graphing")}
                      className="w-full"
                      aria-label="Try graphing demonstration"
                    >
                      Try Graphing
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </ToolsSectionErrorBoundary>

        {/* Call to Action */}
        <div className="text-center mt-12 p-6 bg-muted/50 rounded-lg">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Ready for More?
          </h3>
          <p className="text-muted-foreground mb-4">
            Access our complete suite of mathematical tools including equation
            solvers, matrix calculators, and specialized utilities.
          </p>
          <Link href="/tools">
            <Button
              variant="outline"
              size="lg"
              className="group"
              aria-label="Navigate to complete tools page"
            >
              View All Tools
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;
