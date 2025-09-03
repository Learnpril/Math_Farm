import React, { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import ToolDemo from "./ToolDemo";

// JSXGraph types
declare global {
  interface Window {
    JXG?: any;
  }
}

export interface GraphingDemoProps {
  className?: string;
}

export const GraphingDemo: React.FC<GraphingDemoProps> = ({
  className = "",
}) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const boardInstance = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [equation, setEquation] = useState("x^2");
  const [isLoading, setIsLoading] = useState(true);

  // Load JSXGraph library
  const loadJSXGraph = useCallback(async () => {
    try {
      if (window.JXG) {
        setIsLoaded(true);
        setIsLoading(false);
        return;
      }

      // Dynamically import JSXGraph
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/jsxgraph@1.10.0/distrib/jsxgraphcore.js";
      script.async = true;

      script.onload = () => {
        if (window.JXG) {
          setIsLoaded(true);
          setError(null);
        } else {
          setError("JSXGraph failed to initialize");
        }
        setIsLoading(false);
      };

      script.onerror = () => {
        setError("Failed to load JSXGraph library");
        setIsLoading(false);
      };

      document.head.appendChild(script);
    } catch (err) {
      setError("Error loading graphing library");
      setIsLoading(false);
    }
  }, []);

  // Initialize the board
  const initializeBoard = useCallback(() => {
    if (!boardRef.current || !window.JXG || boardInstance.current) return;

    try {
      const board = window.JXG.JSXGraph.initBoard(boardRef.current, {
        boundingbox: [-10, 10, 10, -10],
        axis: true,
        showCopyright: false,
        showNavigation: true,
        zoom: {
          factorX: 1.25,
          factorY: 1.25,
          wheel: true,
          needshift: false,
          eps: 0.1,
        },
        pan: {
          enabled: true,
          needTwoFingers: false,
          needshift: false,
        },
        grid: {
          strokeColor: "#e0e0e0",
          strokeWidth: 1,
        },
      });

      boardInstance.current = board;
      plotFunction(equation);
    } catch (err) {
      setError("Failed to initialize graphing board");
    }
  }, [equation]);

  // Plot function
  const plotFunction = useCallback((func: string) => {
    if (!boardInstance.current || !window.JXG) return;

    try {
      // Clear previous functions
      boardInstance.current.removeObject(
        boardInstance.current.objectsList.filter(
          (obj: any) => obj.elType === "functiongraph"
        )
      );

      // Create new function
      boardInstance.current.create(
        "functiongraph",
        [
          (x: number) => {
            try {
              // Simple expression evaluator for demo purposes
              const expr = func.replace(/\^/g, "**").replace(/x/g, `(${x})`);
              return eval(expr);
            } catch {
              return NaN;
            }
          },
        ],
        {
          strokeColor: "hsl(262, 65%, 45%)",
          strokeWidth: 2,
          name: `f(x) = ${func}`,
        }
      );

      boardInstance.current.update();
    } catch (err) {
      console.warn("Error plotting function:", err);
    }
  }, []);

  // Handle equation change
  const handleEquationChange = useCallback(
    (newEquation: string) => {
      setEquation(newEquation);
      if (boardInstance.current) {
        plotFunction(newEquation);
      }
    },
    [plotFunction]
  );

  // Handle preset functions
  const handlePreset = useCallback(
    (preset: string) => {
      setEquation(preset);
      handleEquationChange(preset);
    },
    [handleEquationChange]
  );

  // Load JSXGraph on mount
  useEffect(() => {
    loadJSXGraph();
  }, [loadJSXGraph]);

  // Initialize board when loaded
  useEffect(() => {
    if (isLoaded && !error) {
      initializeBoard();
    }
  }, [isLoaded, error, initializeBoard]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (boardInstance.current) {
        try {
          window.JXG?.JSXGraph.freeBoard(boardInstance.current);
          boardInstance.current = null;
        } catch (err) {
          console.warn("Error cleaning up JSXGraph board:", err);
        }
      }
    };
  }, []);

  return (
    <ToolDemo
      title="Interactive Graphing Tool"
      description="Plot mathematical functions and explore their behavior with this interactive graphing calculator."
      demoType="graphing"
      interactive={true}
      error={error}
      isLoading={isLoading}
      className={className}
    >
      {isLoaded && !error && (
        <>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Label htmlFor="equation-input" className="sr-only">
                  Function equation
                </Label>
                <Input
                  id="equation-input"
                  type="text"
                  value={equation}
                  onChange={(e) => setEquation(e.target.value)}
                  placeholder="Enter function (e.g., x^2, sin(x), x^3-2*x)"
                  className="font-mono"
                  aria-label="Function equation input"
                />
              </div>
              <Button
                onClick={() => handleEquationChange(equation)}
                className="whitespace-nowrap"
                aria-label="Plot the entered function"
              >
                Plot Function
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">
                Quick examples:
              </span>
              {["x^2", "sin(x)", "cos(x)", "x^3-2*x", "1/x"].map((preset) => (
                <Button
                  key={preset}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreset(preset)}
                  className="text-xs font-mono"
                  aria-label={`Plot ${preset}`}
                >
                  {preset}
                </Button>
              ))}
            </div>
          </div>

          <div
            ref={boardRef}
            className="w-full h-96 border border-border rounded-md bg-background"
            role="img"
            aria-label={`Graph of function f(x) = ${equation}`}
            tabIndex={0}
            onKeyDown={(e) => {
              // Basic keyboard navigation for accessibility
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleEquationChange(equation);
              }
            }}
          />

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Use mouse wheel or pinch to zoom</p>
            <p>• Click and drag to pan around the graph</p>
            <p>
              • Try functions like: x^2, sin(x), cos(x), tan(x), log(x), sqrt(x)
            </p>
          </div>
        </>
      )}
    </ToolDemo>
  );
};

export default GraphingDemo;
