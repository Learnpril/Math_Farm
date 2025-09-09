import { useState } from "react";
import {
  Calculator,
  TrendingUp,
  RotateCcw,
  Zap,
  ArrowLeft,
} from "lucide-react";
import { Link } from "wouter";
import { ToolsBreadcrumb } from "../components/ToolsBreadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import {
  LazyCalculator,
  LazyGraphPlotter,
  LazyUnitConverter,
  LazyEquationSolver,
} from "../components/LazyComponents";
import { LazyWrapper } from "../components/LazyWrapper";
import { ToolErrorBoundary } from "../components/ToolErrorBoundary";

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  component: React.ComponentType;
  preview: string;
}

export function ToolsPage() {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  const tools: Tool[] = [
    {
      id: "calculator",
      title: "Advanced Calculator",
      description:
        "Perform complex mathematical calculations with step-by-step solutions",
      icon: Calculator,
      category: "computation",
      component: LazyCalculator,
      preview:
        "Scientific calculator with advanced functions, memory operations, and expression evaluation.",
    },
    {
      id: "graphing",
      title: "Function Grapher",
      description:
        "Visualize mathematical functions and explore their properties",
      icon: TrendingUp,
      category: "visualization",
      component: LazyGraphPlotter,
      preview:
        "Interactive graph plotter supporting polynomials, trigonometric, and logarithmic functions.",
    },
    {
      id: "converter",
      title: "Unit Converter",
      description: "Convert between different units of measurement",
      icon: RotateCcw,
      category: "conversion",
      component: LazyUnitConverter,
      preview:
        "Convert length, area, volume, mass, temperature, and angle units with precision.",
    },
    {
      id: "solver",
      title: "Equation Solver",
      description:
        "Solve algebraic equations, derivatives, and integrals symbolically",
      icon: Zap,
      category: "symbolic",
      component: LazyEquationSolver,
      preview:
        "Solve equations, find derivatives, simplify expressions with step-by-step solutions.",
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "computation":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "visualization":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "conversion":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "symbolic":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const handleToolClick = (tool: Tool) => {
    setSelectedTool(tool);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <ToolsBreadcrumb currentTool={selectedTool?.title} />

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
          explore mathematics. Click on any tool to open it in a modal
          interface.
        </p>
      </div>

      {/* Tools Grid - Responsive: 1 column mobile, 2 tablet, 3 desktop */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool) => {
          const IconComponent = tool.icon;
          const ToolComponent = tool.component;

          return (
            <Dialog key={tool.id}>
              <DialogTrigger asChild>
                <div
                  className="bg-card border rounded-lg p-6 hover:bg-muted/50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={() => handleToolClick(tool)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleToolClick(tool);
                    }
                  }}
                  aria-label={`Open ${tool.title} tool`}
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
                        <Badge
                          variant="secondary"
                          className={getCategoryColor(tool.category)}
                        >
                          {tool.category.replace("-", " ")}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">
                        {tool.description}
                      </p>

                      <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                        {tool.preview}
                      </p>

                      <div className="mt-3">
                        <span className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                          Open Tool →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogTrigger>

              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <IconComponent className="w-5 h-5 text-primary" />
                    {tool.title}
                  </DialogTitle>
                  <DialogDescription>{tool.description}</DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                  <ToolErrorBoundary toolName={tool.title}>
                    <LazyWrapper
                      fallback="skeleton"
                      skeletonVariant="tool"
                      loadingText={`Loading ${tool.title}...`}
                    >
                      <ToolComponent />
                    </LazyWrapper>
                  </ToolErrorBoundary>
                </div>
              </DialogContent>
            </Dialog>
          );
        })}
      </div>

      {/* Features Section */}
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 bg-muted/50 rounded-lg">
          <h3 className="font-semibold mb-2">Real-time Calculations</h3>
          <p className="text-sm text-muted-foreground">
            All tools provide instant feedback and real-time calculations as you
            type.
          </p>
        </div>
        <div className="p-6 bg-muted/50 rounded-lg">
          <h3 className="font-semibold mb-2">Step-by-step Solutions</h3>
          <p className="text-sm text-muted-foreground">
            Get detailed explanations and step-by-step breakdowns for complex
            problems.
          </p>
        </div>
        <div className="p-6 bg-muted/50 rounded-lg">
          <h3 className="font-semibold mb-2">Export & Share</h3>
          <p className="text-sm text-muted-foreground">
            Save your work and share results with others (coming soon).
          </p>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="mt-12 p-6 bg-primary/5 border border-primary/20 rounded-lg">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Usage Tips
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-medium mb-2">Keyboard Shortcuts</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                • Press{" "}
                <kbd className="px-1 py-0.5 bg-muted rounded text-xs">
                  Enter
                </kbd>{" "}
                to calculate
              </li>
              <li>
                • Press{" "}
                <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Esc</kbd>{" "}
                to clear
              </li>
              <li>• Use arrow keys for navigation</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Function Syntax</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                • Use <code>^</code> for exponents: <code>x^2</code>
              </li>
              <li>
                • Functions: <code>sin(x)</code>, <code>cos(x)</code>,{" "}
                <code>log(x)</code>
              </li>
              <li>
                • Constants: <code>pi</code>, <code>e</code>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
