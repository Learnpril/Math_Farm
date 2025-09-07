import { useEffect, useRef, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { RotateCcw, Play, AlertCircle } from "lucide-react";
import { jsxGraphManager } from "../lib/jsxGraphManager";

interface JSXGraphDemoProps {
  id: string;
  config: {
    boundingbox?: number[];
    axis?: boolean;
    showNavigation?: boolean;
    grid?: boolean;
    [key: string]: any;
  };
  onInit?: (board: any) => void;
  title?: string;
  description?: string;
}

export function JSXGraphDemo({
  id,
  config,
  onInit,
  title = "Interactive Demo",
  description,
}: JSXGraphDemoProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const boardInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const defaultConfig = {
    boundingbox: [-5, 5, 5, -5],
    axis: true,
    showNavigation: false,
    grid: true,
    ...config,
  };

  const initializeBoard = async () => {
    // Check if component is still mounted and container exists
    if (!boardRef.current || !boardRef.current.isConnected) {
      return;
    }

    try {
      setError(null);

      // Clear existing board safely
      if (boardInstanceRef.current) {
        try {
          jsxGraphManager.freeBoard(boardInstanceRef.current, id);
        } catch (error) {
          console.warn("Error freeing existing board:", error);
        }
        boardInstanceRef.current = null;
      }

      // Ensure the container is ready and still in DOM
      if (
        !boardRef.current.offsetWidth ||
        !boardRef.current.offsetHeight ||
        !boardRef.current.isConnected
      ) {
        // Container not ready or removed from DOM, try again later
        const retryTimeout = setTimeout(() => {
          if (boardRef.current && boardRef.current.isConnected) {
            initializeBoard();
          }
        }, 100);

        // Store timeout for cleanup
        return;
      }

      // Create new board using the manager with ID tracking
      boardInstanceRef.current = jsxGraphManager.createBoard(
        boardRef.current,
        defaultConfig,
        id
      );

      // Call custom initialization if provided
      if (onInit && boardInstanceRef.current) {
        try {
          onInit(boardInstanceRef.current);
        } catch (error) {
          console.warn("Error in JSXGraph initialization callback:", error);
          setError("Error initializing interactive demo");
          return;
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error initializing JSXGraph board:", error);
      setError(
        error instanceof Error ? error.message : "Failed to initialize demo"
      );
      setIsLoading(false);
    }
  };

  const resetBoard = () => {
    initializeBoard();
  };

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const loadAndInitialize = async () => {
      try {
        if (!mounted) return;

        setIsLoading(true);
        setError(null);

        // Load JSXGraph using the manager
        await jsxGraphManager.loadJSXGraph();

        if (!mounted) return;

        // Initialize board after a short delay to ensure DOM is ready
        timeoutId = setTimeout(() => {
          if (mounted && boardRef.current) {
            initializeBoard();
          }
        }, 100);
      } catch (error) {
        if (mounted) {
          console.error("Failed to load JSXGraph:", error);
          setError("Failed to load interactive demo");
          setIsLoading(false);
        }
      }
    };

    loadAndInitialize();

    return () => {
      mounted = false;

      // Clear any pending timeouts
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Clean up board safely
      if (boardInstanceRef.current) {
        try {
          jsxGraphManager.freeBoard(boardInstanceRef.current, id);
        } catch (error) {
          console.warn("Error during board cleanup:", error);
        }
        boardInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-medium text-foreground flex items-center gap-2">
            <Play className="w-4 h-4" />
            {title}
          </h4>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={resetBoard}
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>

      <div
        ref={boardRef}
        id={id}
        className="w-full h-64 border rounded-lg bg-white relative"
        style={{ minHeight: "256px" }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">
                Loading interactive demo...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
              <p className="text-sm text-destructive">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setError(null);
                  setIsLoading(true);
                  initializeBoard();
                }}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        <p>Interactive mathematical visualization powered by JSXGraph</p>
      </div>
    </Card>
  );
}

// Predefined demo configurations for common mathematical concepts
export const demoConfigs = {
  functionPlotter: {
    boundingbox: [-10, 10, 10, -10],
    axis: true,
    grid: true,
    showNavigation: true,
  },

  geometryShapes: {
    boundingbox: [-8, 8, 8, -8],
    axis: false,
    grid: false,
    showNavigation: false,
  },

  calculator: {
    boundingbox: [-5, 5, 5, -5],
    axis: true,
    grid: true,
    showNavigation: false,
  },
};

// Common demo initializers
export const demoInitializers = {
  quadraticFunction: (board: any) => {
    // Create a quadratic function demo
    const a = board.create(
      "slider",
      [
        [-8, 7],
        [8, 7],
        [-3, 1, 3],
      ],
      {
        name: "a",
        snapWidth: 0.1,
      }
    );

    const b = board.create(
      "slider",
      [
        [-8, 6],
        [8, 6],
        [-3, 0, 3],
      ],
      {
        name: "b",
        snapWidth: 0.1,
      }
    );

    const c = board.create(
      "slider",
      [
        [-8, 5],
        [8, 5],
        [-3, 0, 3],
      ],
      {
        name: "c",
        snapWidth: 0.1,
      }
    );

    const func = board.create(
      "functiongraph",
      [
        function (x: number) {
          return a.Value() * x * x + b.Value() * x + c.Value();
        },
      ],
      {
        strokeColor: "#7c3aed",
        strokeWidth: 2,
      }
    );

    // Add equation text
    board.create(
      "text",
      [
        -9,
        -8,
        function () {
          return `f(x) = ${a.Value().toFixed(1)}x² + ${b
            .Value()
            .toFixed(1)}x + ${c.Value().toFixed(1)}`;
        },
      ],
      {
        fontSize: 14,
        color: "#374151",
      }
    );
  },

  circleArea: (board: any) => {
    // Create a circle area demonstration
    const center = board.create("point", [0, 0], {
      name: "Center",
      fixed: true,
      color: "#7c3aed",
    });

    const radiusPoint = board.create("point", [2, 0], {
      name: "Radius",
      color: "#dc2626",
    });

    const circle = board.create("circle", [center, radiusPoint], {
      strokeColor: "#7c3aed",
      strokeWidth: 2,
      fillColor: "#7c3aed",
      fillOpacity: 0.1,
    });

    // Display radius and area
    board.create(
      "text",
      [
        -7,
        7,
        function () {
          const r = center.Dist(radiusPoint);
          return `Radius: ${r.toFixed(2)}`;
        },
      ],
      {
        fontSize: 14,
        color: "#374151",
      }
    );

    board.create(
      "text",
      [
        -7,
        6,
        function () {
          const r = center.Dist(radiusPoint);
          const area = Math.PI * r * r;
          return `Area: π × ${r.toFixed(2)}² = ${area.toFixed(2)}`;
        },
      ],
      {
        fontSize: 14,
        color: "#374151",
      }
    );
  },

  triangleArea: (board: any) => {
    // Create a triangle area demonstration
    const A = board.create("point", [-3, -2], { name: "A", color: "#7c3aed" });
    const B = board.create("point", [3, -2], { name: "B", color: "#7c3aed" });
    const C = board.create("point", [0, 3], { name: "C", color: "#7c3aed" });

    const triangle = board.create("polygon", [A, B, C], {
      fillColor: "#7c3aed",
      fillOpacity: 0.2,
      strokeColor: "#7c3aed",
      strokeWidth: 2,
    });

    // Show base and height
    const base = board.create("segment", [A, B], {
      strokeColor: "#dc2626",
      strokeWidth: 3,
      name: "base",
    });

    const height = board.create("segment", [C, [0, -2]], {
      strokeColor: "#059669",
      strokeWidth: 3,
      strokeDashArray: [5, 5],
      name: "height",
    });

    // Display measurements and area
    board.create(
      "text",
      [
        -7,
        6,
        function () {
          const baseLength = A.Dist(B);
          return `Base: ${baseLength.toFixed(2)}`;
        },
      ],
      {
        fontSize: 14,
        color: "#dc2626",
      }
    );

    board.create(
      "text",
      [
        -7,
        5,
        function () {
          const heightLength = Math.abs(C.Y() - A.Y());
          return `Height: ${heightLength.toFixed(2)}`;
        },
      ],
      {
        fontSize: 14,
        color: "#059669",
      }
    );

    board.create(
      "text",
      [
        -7,
        4,
        function () {
          const baseLength = A.Dist(B);
          const heightLength = Math.abs(C.Y() - A.Y());
          const area = 0.5 * baseLength * heightLength;
          return `Area: ½ × ${baseLength.toFixed(2)} × ${heightLength.toFixed(
            2
          )} = ${area.toFixed(2)}`;
        },
      ],
      {
        fontSize: 14,
        color: "#374151",
      }
    );
  },

  trigFunctions: (board: any) => {
    // Create trigonometric function demonstration
    const angleSlider = board.create(
      "slider",
      [
        [-8, 7],
        [8, 7],
        [0, Math.PI / 4, 2 * Math.PI],
      ],
      {
        name: "θ",
        snapWidth: 0.1,
      }
    );

    // Unit circle
    const circle = board.create("circle", [[0, 0], 1], {
      strokeColor: "#7c3aed",
      strokeWidth: 2,
    });

    // Angle line
    const angleLine = board.create(
      "line",
      [
        [0, 0],
        function () {
          return [Math.cos(angleSlider.Value()), Math.sin(angleSlider.Value())];
        },
      ],
      {
        strokeColor: "#dc2626",
        strokeWidth: 2,
      }
    );

    // Point on circle
    const circlePoint = board.create(
      "point",
      [
        function () {
          return Math.cos(angleSlider.Value());
        },
        function () {
          return Math.sin(angleSlider.Value());
        },
      ],
      {
        name: "P",
        color: "#dc2626",
      }
    );

    // Display values
    board.create(
      "text",
      [
        -9,
        -7,
        function () {
          const angle = angleSlider.Value();
          return `θ = ${((angle * 180) / Math.PI).toFixed(1)}°`;
        },
      ],
      {
        fontSize: 14,
        color: "#374151",
      }
    );

    board.create(
      "text",
      [
        -9,
        -8,
        function () {
          const angle = angleSlider.Value();
          return `sin(θ) = ${Math.sin(angle).toFixed(3)}`;
        },
      ],
      {
        fontSize: 14,
        color: "#059669",
      }
    );

    board.create(
      "text",
      [
        -9,
        -9,
        function () {
          const angle = angleSlider.Value();
          return `cos(θ) = ${Math.cos(angle).toFixed(3)}`;
        },
      ],
      {
        fontSize: 14,
        color: "#dc2626",
      }
    );
  },

  derivativeVisualization: (board: any) => {
    // Derivative visualization
    const aSlider = board.create(
      "slider",
      [
        [-8, 7],
        [8, 7],
        [-2, 1, 2],
      ],
      {
        name: "a",
        snapWidth: 0.1,
      }
    );

    const bSlider = board.create(
      "slider",
      [
        [-8, 6],
        [8, 6],
        [-2, 0, 2],
      ],
      {
        name: "b",
        snapWidth: 0.1,
      }
    );

    // Original function f(x) = ax² + bx
    const func = board.create(
      "functiongraph",
      [
        function (x: number) {
          return aSlider.Value() * x * x + bSlider.Value() * x;
        },
      ],
      {
        strokeColor: "#7c3aed",
        strokeWidth: 2,
        name: "f(x)",
      }
    );

    // Derivative function f'(x) = 2ax + b
    const derivative = board.create(
      "functiongraph",
      [
        function (x: number) {
          return 2 * aSlider.Value() * x + bSlider.Value();
        },
      ],
      {
        strokeColor: "#dc2626",
        strokeWidth: 2,
        strokeDashArray: [5, 5],
        name: "f'(x)",
      }
    );

    // Point on original function
    const xPoint = board.create("glider", [2, 0, board.defaultAxes.x], {
      name: "x",
    });

    const yPoint = board.create(
      "point",
      [
        function () {
          return xPoint.X();
        },
        function () {
          return (
            aSlider.Value() * xPoint.X() * xPoint.X() +
            bSlider.Value() * xPoint.X()
          );
        },
      ],
      {
        color: "#7c3aed",
        name: "P",
      }
    );

    // Tangent line
    const tangent = board.create(
      "line",
      [
        yPoint,
        function () {
          const x = xPoint.X();
          const slope = 2 * aSlider.Value() * x + bSlider.Value();
          return [x + 1, yPoint.Y() + slope];
        },
      ],
      {
        strokeColor: "#059669",
        strokeWidth: 1,
        strokeDashArray: [3, 3],
      }
    );

    // Display equations
    board.create(
      "text",
      [
        -9,
        -7,
        function () {
          return `f(x) = ${aSlider.Value().toFixed(1)}x² + ${bSlider
            .Value()
            .toFixed(1)}x`;
        },
      ],
      {
        fontSize: 14,
        color: "#7c3aed",
      }
    );

    board.create(
      "text",
      [
        -9,
        -8,
        function () {
          return `f'(x) = ${(2 * aSlider.Value()).toFixed(1)}x + ${bSlider
            .Value()
            .toFixed(1)}`;
        },
      ],
      {
        fontSize: 14,
        color: "#dc2626",
      }
    );

    board.create(
      "text",
      [
        -9,
        -9,
        function () {
          const slope = 2 * aSlider.Value() * xPoint.X() + bSlider.Value();
          return `Slope at x=${xPoint.X().toFixed(1)}: ${slope.toFixed(2)}`;
        },
      ],
      {
        fontSize: 14,
        color: "#059669",
      }
    );
  },

  vectorOperations: (board: any) => {
    // Vector operations demonstration
    const vectorA = board.create(
      "arrow",
      [
        [0, 0],
        [3, 2],
      ],
      {
        strokeColor: "#7c3aed",
        strokeWidth: 3,
        name: "A",
      }
    );

    const vectorB = board.create(
      "arrow",
      [
        [0, 0],
        [1, 3],
      ],
      {
        strokeColor: "#dc2626",
        strokeWidth: 3,
        name: "B",
      }
    );

    // Vector sum A + B
    const vectorSum = board.create(
      "arrow",
      [
        [0, 0],
        function () {
          return [
            vectorA.point2.X() + vectorB.point2.X(),
            vectorA.point2.Y() + vectorB.point2.Y(),
          ];
        },
      ],
      {
        strokeColor: "#059669",
        strokeWidth: 3,
        strokeDashArray: [5, 5],
        name: "A+B",
      }
    );

    // Make vectors draggable
    vectorA.point2.setAttribute({
      name: "A",
      color: "#7c3aed",
    });
    vectorB.point2.setAttribute({
      name: "B",
      color: "#dc2626",
    });

    // Display vector components and operations
    board.create(
      "text",
      [
        -9,
        7,
        function () {
          return `A = (${vectorA.point2.X().toFixed(1)}, ${vectorA.point2
            .Y()
            .toFixed(1)})`;
        },
      ],
      {
        fontSize: 14,
        color: "#7c3aed",
      }
    );

    board.create(
      "text",
      [
        -9,
        6,
        function () {
          return `B = (${vectorB.point2.X().toFixed(1)}, ${vectorB.point2
            .Y()
            .toFixed(1)})`;
        },
      ],
      {
        fontSize: 14,
        color: "#dc2626",
      }
    );

    board.create(
      "text",
      [
        -9,
        5,
        function () {
          const sumX = vectorA.point2.X() + vectorB.point2.X();
          const sumY = vectorA.point2.Y() + vectorB.point2.Y();
          return `A + B = (${sumX.toFixed(1)}, ${sumY.toFixed(1)})`;
        },
      ],
      {
        fontSize: 14,
        color: "#059669",
      }
    );

    board.create(
      "text",
      [
        -9,
        4,
        function () {
          const dotProduct =
            vectorA.point2.X() * vectorB.point2.X() +
            vectorA.point2.Y() * vectorB.point2.Y();
          return `A · B = ${dotProduct.toFixed(2)}`;
        },
      ],
      {
        fontSize: 14,
        color: "#374151",
      }
    );
  },

  statisticsVisualization: (board: any) => {
    // Statistics visualization with normal distribution
    const muSlider = board.create(
      "slider",
      [
        [-8, 7],
        [8, 7],
        [-3, 0, 3],
      ],
      {
        name: "μ",
        snapWidth: 0.1,
      }
    );

    const sigmaSlider = board.create(
      "slider",
      [
        [-8, 6],
        [8, 6],
        [0.1, 1, 3],
      ],
      {
        name: "σ",
        snapWidth: 0.1,
      }
    );

    // Normal distribution curve
    const normalCurve = board.create(
      "functiongraph",
      [
        function (x: number) {
          const mu = muSlider.Value();
          const sigma = sigmaSlider.Value();
          return (
            (1 / (sigma * Math.sqrt(2 * Math.PI))) *
            Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2))
          );
        },
      ],
      {
        strokeColor: "#7c3aed",
        strokeWidth: 2,
      }
    );

    // Mean line
    const meanLine = board.create(
      "line",
      [
        function () {
          return [muSlider.Value(), -1];
        },
        function () {
          return [muSlider.Value(), 1];
        },
      ],
      {
        strokeColor: "#dc2626",
        strokeWidth: 2,
        strokeDashArray: [5, 5],
      }
    );

    // Standard deviation markers
    const stdDev1Plus = board.create(
      "line",
      [
        function () {
          return [muSlider.Value() + sigmaSlider.Value(), -0.5];
        },
        function () {
          return [muSlider.Value() + sigmaSlider.Value(), 0.5];
        },
      ],
      {
        strokeColor: "#059669",
        strokeWidth: 1,
        strokeDashArray: [3, 3],
      }
    );

    const stdDev1Minus = board.create(
      "line",
      [
        function () {
          return [muSlider.Value() - sigmaSlider.Value(), -0.5];
        },
        function () {
          return [muSlider.Value() - sigmaSlider.Value(), 0.5];
        },
      ],
      {
        strokeColor: "#059669",
        strokeWidth: 1,
        strokeDashArray: [3, 3],
      }
    );

    // Display parameters
    board.create(
      "text",
      [
        -9,
        -7,
        function () {
          return `μ (mean) = ${muSlider.Value().toFixed(2)}`;
        },
      ],
      {
        fontSize: 14,
        color: "#dc2626",
      }
    );

    board.create(
      "text",
      [
        -9,
        -8,
        function () {
          return `σ (std dev) = ${sigmaSlider.Value().toFixed(2)}`;
        },
      ],
      {
        fontSize: 14,
        color: "#059669",
      }
    );

    board.create(
      "text",
      [
        -9,
        -9,
        function () {
          return `68% of data within μ ± σ`;
        },
      ],
      {
        fontSize: 12,
        color: "#374151",
      }
    );
  },
};
