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
  const currentCurve = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [equation, setEquation] = useState("x^2");
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Safe function evaluator
  const evaluateFunction = useCallback((func: string, x: number): number => {
    try {
      // Handle common mathematical functions safely
      const expr = func
        .toLowerCase()
        .replace(/\^/g, "**")
        .replace(/sin\(/g, "Math.sin(")
        .replace(/cos\(/g, "Math.cos(")
        .replace(/tan\(/g, "Math.tan(")
        .replace(/log\(/g, "Math.log10(")
        .replace(/ln\(/g, "Math.log(")
        .replace(/sqrt\(/g, "Math.sqrt(")
        .replace(/abs\(/g, "Math.abs(")
        .replace(/exp\(/g, "Math.exp(")
        .replace(/pi/g, "Math.PI")
        .replace(/e(?![a-z])/g, "Math.E")
        .replace(/x/g, `(${x})`);

      // Use Function constructor instead of eval for better security
      const fn = new Function("Math", `return ${expr}`);
      const result = fn(Math);

      return typeof result === "number" && !isNaN(result) ? result : NaN;
    } catch {
      return NaN;
    }
  }, []);

  // Plot function
  const plotFunction = useCallback(
    (func: string) => {
      if (!boardInstance.current || !window.JXG) return;

      try {
        // Remove the previous curve if it exists
        if (currentCurve.current) {
          try {
            boardInstance.current.removeObject(currentCurve.current);
            currentCurve.current = null;
          } catch (e) {
            console.warn("Error removing previous curve:", e);
          }
        }

        // Create new function curve
        const curve = boardInstance.current.create(
          "functiongraph",
          [(x: number) => evaluateFunction(func, x)],
          {
            strokeColor: "hsl(262, 65%, 45%)",
            strokeWidth: 2,
            name: `f(x) = ${func}`,
            withLabel: false,
          }
        );

        // Store reference to the new curve
        currentCurve.current = curve;

        boardInstance.current.update();
      } catch (err) {
        console.warn("Error plotting function:", err);
        setError(`Error plotting function: ${func}`);
      }
    },
    [evaluateFunction]
  );

  // Initialize the board
  const initializeBoard = useCallback(() => {
    if (
      !boardRef.current ||
      !window.JXG ||
      !window.JXG.JSXGraph ||
      boardInstance.current
    )
      return;

    try {
      // Clear any existing board and curve reference
      if (boardInstance.current) {
        try {
          window.JXG.JSXGraph.freeBoard(boardInstance.current);
        } catch (e) {
          console.warn("Error freeing existing board:", e);
        }
      }

      // Clear the current curve reference
      currentCurve.current = null;

      // Ensure the container is ready
      if (!boardRef.current.offsetWidth || !boardRef.current.offsetHeight) {
        // Retry after a short delay if container isn't ready
        setTimeout(() => initializeBoard(), 100);
        return;
      }

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
        resize: {
          enabled: true,
        },
      });

      if (board) {
        boardInstance.current = board;
        plotFunction(equation);
      } else {
        setError("Failed to create graphing board");
      }
    } catch (err) {
      console.error("Board initialization error:", err);
      setError(
        "Failed to initialize graphing board. Please try refreshing the page."
      );
    }
  }, [plotFunction, equation]);

  // Load JSXGraph library
  const loadJSXGraph = useCallback(async () => {
    try {
      if (window.JXG) {
        setIsLoaded(true);
        setIsLoading(false);
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="jsxgraph"]');
      if (existingScript) {
        // Wait for existing script to load
        existingScript.addEventListener("load", () => {
          if (window.JXG) {
            setIsLoaded(true);
            setError(null);
          } else {
            setError("JSXGraph failed to initialize");
          }
          setIsLoading(false);
        });
        return;
      }

      // Dynamically import JSXGraph
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/jsxgraph@1.10.0/distrib/jsxgraphcore.js";
      script.async = true;
      script.crossOrigin = "anonymous";

      const loadPromise = new Promise<void>((resolve, reject) => {
        script.onload = () => {
          console.log("JSXGraph script loaded, checking initialization...");
          // Add a small delay to ensure JSXGraph is fully initialized
          setTimeout(() => {
            if (window.JXG && window.JXG.JSXGraph) {
              console.log("JSXGraph successfully initialized");
              setIsLoaded(true);
              setError(null);
              resolve();
            } else {
              console.error("JSXGraph object not found after script load");
              setError("JSXGraph failed to initialize properly");
              reject(new Error("JSXGraph initialization failed"));
            }
            setIsLoading(false);
          }, 100);
        };

        script.onerror = () => {
          setError(
            "Failed to load JSXGraph library. Please check your internet connection."
          );
          setIsLoading(false);
          reject(new Error("Script loading failed"));
        };
      });

      document.head.appendChild(script);
      await loadPromise;
    } catch (err) {
      console.error("Error loading JSXGraph:", err);
      setError(
        "Error loading graphing library. Please refresh the page to try again."
      );
      setIsLoading(false);
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

  // Retry loading JSXGraph
  const retryLoading = useCallback(() => {
    setError(null);
    setIsLoading(true);
    setRetryCount((prev) => prev + 1);
    loadJSXGraph();
  }, [loadJSXGraph]);

  // Load JSXGraph on mount
  useEffect(() => {
    loadJSXGraph();
  }, [loadJSXGraph]);

  // Initialize board when loaded
  useEffect(() => {
    if (isLoaded && !error) {
      console.log("Initializing JSXGraph board...");
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
      // Clear curve reference
      currentCurve.current = null;
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
      {error && (
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={retryLoading} variant="outline" disabled={isLoading}>
            {isLoading ? "Retrying..." : "Retry Loading"}
          </Button>
          {retryCount > 0 && (
            <p className="text-xs text-muted-foreground">
              Retry attempt: {retryCount}
            </p>
          )}
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Troubleshooting tips:</strong>
            </p>
            <ul className="text-xs text-muted-foreground mt-2 space-y-1 text-left">
              <li>• Check your internet connection</li>
              <li>• Disable ad blockers or script blockers</li>
              <li>• Try refreshing the page</li>
              <li>• Ensure JavaScript is enabled</li>
            </ul>
          </div>
        </div>
      )}
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
                  onChange={(e) => {
                    setEquation(e.target.value);
                    // Clear any previous error when user starts typing
                    if (error && error.includes("Error plotting function")) {
                      setError(null);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleEquationChange(equation);
                    }
                  }}
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
            style={{
              minHeight: "384px",
              minWidth: "100%",
              position: "relative",
              overflow: "hidden",
            }}
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
