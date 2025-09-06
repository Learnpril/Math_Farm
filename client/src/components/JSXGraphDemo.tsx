import { useEffect, useRef } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { RotateCcw, Play } from "lucide-react";

// JSXGraph will be loaded dynamically
declare global {
  interface Window {
    JXG?: any;
  }
}

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

  const defaultConfig = {
    boundingbox: [-5, 5, 5, -5],
    axis: true,
    showNavigation: false,
    grid: true,
    ...config,
  };

  const initializeBoard = () => {
    if (!boardRef.current || !window.JXG) return;

    // Clear existing board
    if (boardInstanceRef.current) {
      window.JXG.JSXGraph.freeBoard(boardInstanceRef.current);
    }

    // Create new board
    boardInstanceRef.current = window.JXG.JSXGraph.initBoard(
      boardRef.current,
      defaultConfig
    );

    // Call custom initialization if provided
    if (onInit && boardInstanceRef.current) {
      onInit(boardInstanceRef.current);
    }
  };

  const resetBoard = () => {
    initializeBoard();
  };

  useEffect(() => {
    // Load JSXGraph dynamically if not already loaded
    if (!window.JXG) {
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/jsxgraph@1.11.1/distrib/jsxgraphcore.js";
      script.async = true;
      script.onload = () => {
        // Also load CSS
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href =
          "https://cdn.jsdelivr.net/npm/jsxgraph@1.11.1/distrib/jsxgraph.css";
        document.head.appendChild(link);

        // Initialize board after JSXGraph loads
        setTimeout(initializeBoard, 100);
      };
      document.head.appendChild(script);
    } else {
      initializeBoard();
    }

    return () => {
      if (boardInstanceRef.current) {
        window.JXG.JSXGraph.freeBoard(boardInstanceRef.current);
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
        className="w-full h-64 border rounded-lg bg-white"
        style={{ minHeight: "256px" }}
      />

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
};
