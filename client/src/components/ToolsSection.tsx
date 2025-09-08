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
import { FunctionGrapherDemo } from "./FunctionGrapherDemo";
import { UnitConverterDemo } from "./UnitConverterDemo";
import { ToolDemoErrorBoundary } from "./ToolDemoErrorBoundary";
import {
  ArrowRight,
  Calculator,
  TrendingUp,
  BarChart3,
  ArrowLeftRight,
} from "lucide-react";

export interface ToolsSectionProps {
  className?: string;
}

// This error boundary has been replaced with the comprehensive ToolDemoErrorBoundary

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
    "graphing" | "calculator" | "function-grapher" | "unit-converter" | null
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
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
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
            Advanced Calculator
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
            Interactive Graphing
          </Button>
          <Button
            variant={activeDemo === "function-grapher" ? "default" : "outline"}
            onClick={() =>
              setActiveDemo(
                activeDemo === "function-grapher" ? null : "function-grapher"
              )
            }
            className="flex items-center gap-2"
            aria-pressed={activeDemo === "function-grapher"}
            aria-label="Toggle function grapher demonstration"
          >
            <BarChart3 className="h-4 w-4" />
            Function Grapher
          </Button>
          <Button
            variant={activeDemo === "unit-converter" ? "default" : "outline"}
            onClick={() =>
              setActiveDemo(
                activeDemo === "unit-converter" ? null : "unit-converter"
              )
            }
            className="flex items-center gap-2"
            aria-pressed={activeDemo === "unit-converter"}
            aria-label="Toggle unit converter demonstration"
          >
            <ArrowLeftRight className="h-4 w-4" />
            Unit Converter
          </Button>
        </div>

        {/* Tool Demonstrations */}
        <div className="space-y-8">
          {/* Calculator Demo */}
          {activeDemo === "calculator" && (
            <div
              className="animate-in slide-in-from-top-4 duration-300"
              role="region"
              aria-labelledby="calculator-demo-title"
            >
              <ToolDemoErrorBoundary
                toolName="Advanced Calculator"
                showErrorDetails={process.env.NODE_ENV === "development"}
              >
                <Suspense
                  fallback={<ToolLoadingFallback title="Advanced Calculator" />}
                >
                  <CalculatorDemo />
                </Suspense>
              </ToolDemoErrorBoundary>
            </div>
          )}

          {/* Graphing Demo */}
          {activeDemo === "graphing" && (
            <div
              className="animate-in slide-in-from-top-4 duration-300"
              role="region"
              aria-labelledby="graphing-demo-title"
            >
              <ToolDemoErrorBoundary
                toolName="Interactive Graphing Tool"
                showErrorDetails={process.env.NODE_ENV === "development"}
              >
                <Suspense
                  fallback={
                    <ToolLoadingFallback title="Interactive Graphing Tool" />
                  }
                >
                  <GraphingDemo />
                </Suspense>
              </ToolDemoErrorBoundary>
            </div>
          )}

          {/* Function Grapher Demo */}
          {activeDemo === "function-grapher" && (
            <div
              className="animate-in slide-in-from-top-4 duration-300"
              role="region"
              aria-labelledby="function-grapher-demo-title"
            >
              <ToolDemoErrorBoundary
                toolName="Function Grapher"
                showErrorDetails={process.env.NODE_ENV === "development"}
              >
                <Suspense
                  fallback={<ToolLoadingFallback title="Function Grapher" />}
                >
                  <FunctionGrapherDemo />
                </Suspense>
              </ToolDemoErrorBoundary>
            </div>
          )}

          {/* Unit Converter Demo */}
          {activeDemo === "unit-converter" && (
            <div
              className="animate-in slide-in-from-top-4 duration-300"
              role="region"
              aria-labelledby="unit-converter-demo-title"
            >
              <ToolDemoErrorBoundary
                toolName="Unit Converter"
                showErrorDetails={process.env.NODE_ENV === "development"}
              >
                <Suspense
                  fallback={<ToolLoadingFallback title="Unit Converter" />}
                >
                  <UnitConverterDemo />
                </Suspense>
              </ToolDemoErrorBoundary>
            </div>
          )}

          {/* Default state - show overview cards */}
          {!activeDemo && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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

              {/* Function Grapher Overview */}
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Function Grapher
                  </CardTitle>
                  <CardDescription>
                    Plot and visualize multiple mathematical functions
                    simultaneously with customizable viewing ranges.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <p>• Plot multiple functions at once</p>
                    <p>• Customizable X/Y axis ranges</p>
                    <p>• Function visibility controls</p>
                    <p>• Built-in function presets</p>
                  </div>
                  <Button
                    onClick={() => setActiveDemo("function-grapher")}
                    className="w-full"
                    aria-label="Try function grapher demonstration"
                  >
                    Try Function Grapher
                  </Button>
                </CardContent>
              </Card>

              {/* Unit Converter Overview */}
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowLeftRight className="h-5 w-5 text-primary" />
                    Unit Converter
                  </CardTitle>
                  <CardDescription>
                    Convert between different units of measurement including
                    length, weight, temperature, and more.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <p>• Length, weight, temperature units</p>
                    <p>• Real-time conversion results</p>
                    <p>• Quick conversion presets</p>
                    <p>• Precise calculation accuracy</p>
                  </div>
                  <Button
                    onClick={() => setActiveDemo("unit-converter")}
                    className="w-full"
                    aria-label="Try unit converter demonstration"
                  >
                    Try Unit Converter
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

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
