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
      let expr = func
        .toLowerCase()
        // First handle implicit multiplication (e.g., 3x -> 3*x, 2sin(x) -> 2*sin(x))
        .replace(/(\d+)([a-z])/g, "$1*$2")
        .replace(/(\d+)\(/g, "$1*(")
        .replace(/\)([a-z])/g, ")*$1")
        .replace(/\)(\d)/g, ")*$1")
        // Handle exponents
        .replace(/\^/g, "**")
        // Handle mathematical functions
        .replace(/sin\(/g, "Math.sin(")
        .replace(/cos\(/g, "Math.cos(")
        .replace(/tan\(/g, "Math.tan(")
        .replace(/log\(/g, "Math.log10(")
        .replace(/ln\(/g, "Math.log(")
        .replace(/sqrt\(/g, "Math.sqrt(")
        .replace(/abs\(/g, "Math.abs(")
        .replace(/exp\(/g, "Math.exp(")
        // Handle constants
        .replace(/pi/g, "Math.PI")
        .replace(/e(?![a-z])/g, "Math.E")
        // Finally replace x with the actual value
        .replace(/x/g, `(${x})`);

      // Use Function constructor instead of eval for better security
      const fn = new Function("Math", `return ${expr}`);
      const result = fn(Math);

      return typeof result === "number" && !isNaN(result) ? result : NaN;
    } catch {
      return NaN;
    }
  }, []);

  // Detect if equation is implicit (contains both x and y, and has = sign)
  const isImplicitEquation = useCallback((func: string): boolean => {
    const normalized = func.toLowerCase().trim();
    return (
      normalized.includes("=") &&
      normalized.includes("x") &&
      normalized.includes("y")
    );
  }, []);

  // Parse implicit equation and create implicit curve
  const plotImplicitEquation = useCallback((equation: string) => {
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

      // Detect dark mode for curve color
      const isDarkMode =
        document.documentElement.classList.contains("dark") ||
        window.matchMedia("(prefers-color-scheme: dark)").matches;

      // Split equation at = sign
      const [leftSide, rightSide] = equation.split("=").map((s) => s.trim());

      // Create implicit function: leftSide - rightSide = 0
      const implicitFunction = (x: number, y: number): number => {
        try {
          // Process left side
          let leftExpr = leftSide
            .toLowerCase()
            .replace(/(\d+)([xy])/g, "$1*$2")
            .replace(/(\d+)\(/g, "$1*(")
            .replace(/\)([xy])/g, ")*$1")
            .replace(/\)(\d)/g, ")*$1")
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
            .replace(/x/g, `(${x})`)
            .replace(/y/g, `(${y})`);

          // Process right side
          let rightExpr = rightSide
            .toLowerCase()
            .replace(/(\d+)([xy])/g, "$1*$2")
            .replace(/(\d+)\(/g, "$1*(")
            .replace(/\)([xy])/g, ")*$1")
            .replace(/\)(\d)/g, ")*$1")
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
            .replace(/x/g, `(${x})`)
            .replace(/y/g, `(${y})`);

          const leftFn = new Function("Math", `return ${leftExpr}`);
          const rightFn = new Function("Math", `return ${rightExpr}`);

          const leftResult = leftFn(Math);
          const rightResult = rightFn(Math);

          return leftResult - rightResult;
        } catch {
          return NaN;
        }
      };

      // Create implicit curve using JSXGraph's implicit plotting
      const curve = boardInstance.current.create(
        "implicitcurve",
        [implicitFunction],
        {
          strokeColor: isDarkMode ? "hsl(262, 65%, 65%)" : "hsl(262, 65%, 45%)",
          strokeWidth: 3,
          name: equation,
          withLabel: false,
          resolution_outer: 30,
          resolution_inner: 30,
        }
      );

      // Store reference to the new curve
      currentCurve.current = curve;
      boardInstance.current.update();
    } catch (err) {
      console.warn("Error plotting implicit equation:", err);
      setError(`Error plotting implicit equation: ${equation}`);
    }
  }, []);

  // Plot function (handles both explicit and implicit equations)
  const plotFunction = useCallback(
    (func: string) => {
      if (!boardInstance.current || !window.JXG) return;

      try {
        // Check if this is an implicit equation
        if (isImplicitEquation(func)) {
          plotImplicitEquation(func);
          return;
        }

        // Remove the previous curve if it exists
        if (currentCurve.current) {
          try {
            boardInstance.current.removeObject(currentCurve.current);
            currentCurve.current = null;
          } catch (e) {
            console.warn("Error removing previous curve:", e);
          }
        }

        // Detect dark mode for curve color
        const isDarkMode =
          document.documentElement.classList.contains("dark") ||
          window.matchMedia("(prefers-color-scheme: dark)").matches;

        // Create new function curve for explicit functions
        const curve = boardInstance.current.create(
          "functiongraph",
          [(x: number) => evaluateFunction(func, x)],
          {
            strokeColor: isDarkMode
              ? "hsl(262, 65%, 65%)"
              : "hsl(262, 65%, 45%)", // Lighter purple for dark mode
            strokeWidth: 3,
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
    [evaluateFunction, isImplicitEquation, plotImplicitEquation]
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

      // Detect dark mode
      const isDarkMode =
        document.documentElement.classList.contains("dark") ||
        window.matchMedia("(prefers-color-scheme: dark)").matches;

      const board = window.JXG.JSXGraph.initBoard(boardRef.current, {
        boundingbox: [-10, 10, 10, -10],
        keepAspectRatio: true, // Maintain 1:1 aspect ratio
        axis: {
          strokeColor: isDarkMode ? "#64748b" : "#374151", // slate-500 for dark, gray-700 for light
          strokeWidth: 2,
          ticks: {
            strokeColor: isDarkMode ? "#64748b" : "#374151",
            strokeWidth: 1,
            label: {
              fontSize: 12,
              color: isDarkMode ? "#94a3b8" : "#374151", // slate-400 for dark, gray-700 for light
            },
          },
        },
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
          strokeColor: isDarkMode ? "#334155" : "#e5e7eb", // slate-700 for dark, gray-200 for light
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
        <div className="space-y-6">
          {/* Function Input */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl p-6 border shadow-inner">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
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
                    className="font-mono text-lg bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    aria-label="Function equation input"
                  />
                </div>
                <Button
                  onClick={() => handleEquationChange(equation)}
                  className="whitespace-nowrap bg-gradient-to-b from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary/80 shadow-md hover:shadow-lg transition-all px-6 py-3 text-base font-semibold"
                  aria-label="Plot the entered function"
                >
                  Plot Function
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Examples */}
          <div className="space-y-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                Quick examples:
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                "x^2",
                "sin(x)",
                "cos(x)",
                "x^3-2*x",
                "1/x",
                "sqrt(x)",
                "log(x)",
                "abs(x)",
                "x^2 + y^2 = 4",
                "x^2/4 + y^2/9 = 1",
              ].map((preset) => (
                <Button
                  key={preset}
                  variant="outline"
                  onClick={() => handlePreset(preset)}
                  className="h-12 px-4 text-base font-mono font-bold bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/40 dark:hover:to-blue-700/40 hover:border-blue-300 dark:hover:border-blue-500 transition-all shadow-sm hover:shadow-md hover:scale-105"
                  aria-label={`Plot ${preset}`}
                >
                  {preset}
                </Button>
              ))}
            </div>
          </div>

          {/* Graph Container */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border shadow-sm">
            <div
              ref={boardRef}
              className="w-full h-96 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 shadow-inner"
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
          </div>

          {/* Help Text */}
          <div className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
              Interactive Controls
            </h4>
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2 grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="space-y-1">
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  Navigation:
                </p>
                <p>• Mouse wheel or pinch to zoom</p>
                <p>• Click and drag to pan around</p>
                <p>• Press Enter to plot function</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  Functions:
                </p>
                <p>• Basic: x^2, x^3, sqrt(x), abs(x)</p>
                <p>• Trig: sin(x), cos(x), tan(x)</p>
                <p>• Advanced: log(x), ln(x), exp(x)</p>
                <p>• Implicit: x^2 + y^2 = 4 (circles, ellipses)</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </ToolDemo>
  );
};

export default GraphingDemo;
