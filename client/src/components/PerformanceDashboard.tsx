import { useState, useEffect } from "react";
import {
  usePerformanceMonitor,
  useCoreWebVitals,
} from "../hooks/usePerformanceMonitor";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  Activity,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  X,
  BarChart3,
  HardDrive,
} from "lucide-react";

interface PerformanceDashboardProps {
  componentName?: string;
  showInProduction?: boolean;
}

export function PerformanceDashboard({
  componentName = "App",
  showInProduction = false,
}: PerformanceDashboardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);

  // Only show in development unless explicitly enabled for production
  const shouldShow = process.env.NODE_ENV === "development" || showInProduction;

  const { metrics, getOptimizationSuggestions, updateComponentCounts } =
    usePerformanceMonitor(componentName, {
      trackMemory: true,
      trackRender: true,
      onMetricsUpdate: (newMetrics) => {
        // Log performance issues in development
        if (process.env.NODE_ENV === "development") {
          if (newMetrics.loadTime > 3000) {
            console.warn(`Slow load time detected: ${newMetrics.loadTime}ms`);
          }
          if (newMetrics.renderTime > 16) {
            console.warn(`Slow render detected: ${newMetrics.renderTime}ms`);
          }
        }
      },
    });

  const { vitals, scores } = useCoreWebVitals();
  const suggestions = getOptimizationSuggestions();

  // Auto-update component counts
  useEffect(() => {
    const interval = setInterval(updateComponentCounts, 2000);
    return () => clearInterval(interval);
  }, [updateComponentCounts]);

  // Keyboard shortcut to toggle dashboard
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "P") {
        setIsVisible((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  if (!shouldShow) return null;

  const getScoreColor = (score: string) => {
    switch (score) {
      case "good":
        return "text-green-600 bg-green-100";
      case "needs-improvement":
        return "text-yellow-600 bg-yellow-100";
      case "poor":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getScoreIcon = (score: string) => {
    switch (score) {
      case "good":
        return <CheckCircle className="w-3 h-3" />;
      case "needs-improvement":
        return <AlertTriangle className="w-3 h-3" />;
      case "poor":
        return <X className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <>
      {/* Toggle Button */}
      {!isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          className="fixed bottom-4 right-4 z-50 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors"
          title="Show Performance Dashboard (Ctrl+Shift+P)"
        >
          <Activity className="w-4 h-4" />
        </button>
      )}

      {/* Performance Dashboard */}
      {isVisible && (
        <div className="fixed bottom-4 right-4 z-50 w-80 bg-background border rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">Performance</span>
              <Badge variant="outline" className="text-xs">
                {componentName}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0"
              >
                {isMinimized ? "+" : "−"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Content */}
          {!isMinimized && (
            <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
              {/* Basic Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <Clock className="w-3 h-3 text-blue-600" />
                  <div>
                    <div className="font-medium">Load Time</div>
                    <div className="text-muted-foreground">
                      {metrics.loadTime}ms
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <Zap className="w-3 h-3 text-green-600" />
                  <div>
                    <div className="font-medium">Render Time</div>
                    <div className="text-muted-foreground">
                      {metrics.renderTime.toFixed(1)}ms
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <Activity className="w-3 h-3 text-purple-600" />
                  <div>
                    <div className="font-medium">Components</div>
                    <div className="text-muted-foreground">
                      {metrics.componentCount}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <HardDrive className="w-3 h-3 text-orange-600" />
                  <div>
                    <div className="font-medium">Math Exprs</div>
                    <div className="text-muted-foreground">
                      {metrics.mathExpressionCount}
                    </div>
                  </div>
                </div>
              </div>

              {/* Memory Usage */}
              {metrics.memoryUsage && (
                <div className="p-2 bg-muted/50 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <HardDrive className="w-3 h-3 text-red-600" />
                    <span className="font-medium text-xs">Memory Usage</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {metrics.memoryUsage.toFixed(1)} MB
                  </div>
                </div>
              )}

              {/* Core Web Vitals */}
              <div className="space-y-2">
                <h4 className="font-medium text-xs">Core Web Vitals</h4>
                <div className="space-y-1">
                  {Object.entries(scores).map(([metric, score]) => (
                    <div
                      key={metric}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="uppercase font-medium">{metric}</span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getScoreColor(score)}`}
                      >
                        {getScoreIcon(score)}
                        <span className="ml-1">{score}</span>
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optimization Suggestions */}
              {suggestions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-xs flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-yellow-600" />
                    Suggestions
                  </h4>
                  <div className="space-y-1">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="text-xs p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800"
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={updateComponentCounts}
                  className="text-xs h-7"
                >
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log("Performance Metrics:", metrics);
                    console.log("Core Web Vitals:", vitals);
                    console.log("Suggestions:", suggestions);
                  }}
                  className="text-xs h-7"
                >
                  Log Data
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
