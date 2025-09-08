import React, { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import ToolDemo from "./ToolDemo";
import { TrendingUp, Plus, Trash2, Eye, EyeOff } from "lucide-react";

export interface FunctionGrapherDemoProps {
  className?: string;
}

interface FunctionData {
  id: string;
  expression: string;
  color: string;
  visible: boolean;
}

export const FunctionGrapherDemo: React.FC<FunctionGrapherDemoProps> = ({
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [functions, setFunctions] = useState<FunctionData[]>([
    { id: "1", expression: "x^2", color: "#8b5cf6", visible: true },
    { id: "2", expression: "sin(x)", color: "#06b6d4", visible: true },
  ]);
  const [newFunction, setNewFunction] = useState("");
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [yMin, setYMin] = useState(-10);
  const [yMax, setYMax] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [mathLoaded, setMathLoaded] = useState(false);

  // Load math.js for function evaluation
  useEffect(() => {
    const loadMathJS = async () => {
      if (window.math) {
        setMathLoaded(true);
        setIsLoading(false);
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/mathjs@12.4.0/lib/browser/math.min.js";
      script.async = true;

      script.onload = () => {
        if (window.math) {
          setMathLoaded(true);
        }
        setIsLoading(false);
      };

      script.onerror = () => {
        setIsLoading(false);
      };

      document.head.appendChild(script);
    };

    loadMathJS();
  }, []);

  // Simple function evaluator
  const evaluateFunction = useCallback(
    (expression: string, x: number): number | null => {
      try {
        if (!window.math) return null;

        // Replace common mathematical notation
        let expr = expression
          .replace(/\^/g, "**")
          .replace(/sin/g, "Math.sin")
          .replace(/cos/g, "Math.cos")
          .replace(/tan/g, "Math.tan")
          .replace(/log/g, "Math.log")
          .replace(/sqrt/g, "Math.sqrt")
          .replace(/abs/g, "Math.abs")
          .replace(/pi/g, "Math.PI")
          .replace(/e/g, "Math.E");

        // Use math.js for evaluation
        const result = window.math.evaluate(expression, { x });
        return typeof result === "number" && isFinite(result) ? result : null;
      } catch {
        return null;
      }
    },
    []
  );

  // Draw the graph
  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mathLoaded) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set up coordinate system
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    const xScale = width / xRange;
    const yScale = height / yRange;

    // Convert graph coordinates to canvas coordinates
    const toCanvasX = (x: number) => ((x - xMin) / xRange) * width;
    const toCanvasY = (y: number) => height - ((y - yMin) / yRange) * height;

    // Draw grid
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;

    // Vertical grid lines
    for (let x = Math.ceil(xMin); x <= xMax; x++) {
      const canvasX = toCanvasX(x);
      ctx.beginPath();
      ctx.moveTo(canvasX, 0);
      ctx.lineTo(canvasX, height);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let y = Math.ceil(yMin); y <= yMax; y++) {
      const canvasY = toCanvasY(y);
      ctx.beginPath();
      ctx.moveTo(0, canvasY);
      ctx.lineTo(width, canvasY);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = "#6b7280";
    ctx.lineWidth = 2;

    // X-axis
    if (yMin <= 0 && yMax >= 0) {
      const y0 = toCanvasY(0);
      ctx.beginPath();
      ctx.moveTo(0, y0);
      ctx.lineTo(width, y0);
      ctx.stroke();
    }

    // Y-axis
    if (xMin <= 0 && xMax >= 0) {
      const x0 = toCanvasX(0);
      ctx.beginPath();
      ctx.moveTo(x0, 0);
      ctx.lineTo(x0, height);
      ctx.stroke();
    }

    // Draw functions
    functions.forEach((func) => {
      if (!func.visible) return;

      ctx.strokeStyle = func.color;
      ctx.lineWidth = 3;
      ctx.beginPath();

      let firstPoint = true;
      const step = xRange / (width * 2); // Higher resolution

      for (let x = xMin; x <= xMax; x += step) {
        const y = evaluateFunction(func.expression, x);
        if (y !== null && y >= yMin && y <= yMax) {
          const canvasX = toCanvasX(x);
          const canvasY = toCanvasY(y);

          if (firstPoint) {
            ctx.moveTo(canvasX, canvasY);
            firstPoint = false;
          } else {
            ctx.lineTo(canvasX, canvasY);
          }
        } else {
          firstPoint = true;
        }
      }

      ctx.stroke();
    });

    // Draw axis labels
    // Use white text in dark mode, black text in light mode for better visibility
    const isDarkMode = document.documentElement.classList.contains("dark");
    ctx.fillStyle = isDarkMode ? "#ffffff" : "#000000";
    ctx.font = "12px monospace";
    ctx.textAlign = "center";

    // X-axis labels
    for (let x = Math.ceil(xMin); x <= xMax; x++) {
      if (x !== 0) {
        const canvasX = toCanvasX(x);
        const canvasY = yMin <= 0 && yMax >= 0 ? toCanvasY(0) + 15 : height - 5;
        ctx.fillText(x.toString(), canvasX, canvasY);
      }
    }

    // Y-axis labels
    ctx.textAlign = "left";
    for (let y = Math.ceil(yMin); y <= yMax; y++) {
      if (y !== 0) {
        const canvasX = xMin <= 0 && xMax >= 0 ? toCanvasX(0) + 5 : 5;
        const canvasY = toCanvasY(y) + 4;
        ctx.fillText(y.toString(), canvasX, canvasY);
      }
    }
  }, [functions, xMin, xMax, yMin, yMax, mathLoaded, evaluateFunction]);

  // Redraw when dependencies change
  useEffect(() => {
    drawGraph();
  }, [drawGraph]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = 400;
        drawGraph();
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [drawGraph]);

  const addFunction = () => {
    if (!newFunction.trim()) return;

    const newFunc: FunctionData = {
      id: Date.now().toString(),
      expression: newFunction,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      visible: true,
    };

    setFunctions((prev) => [...prev, newFunc]);
    setNewFunction("");
  };

  const removeFunction = (id: string) => {
    setFunctions((prev) => prev.filter((f) => f.id !== id));
  };

  const toggleFunction = (id: string) => {
    setFunctions((prev) =>
      prev.map((f) => (f.id === id ? { ...f, visible: !f.visible } : f))
    );
  };

  const presetFunctions = [
    "x^2",
    "sin(x)",
    "cos(x)",
    "tan(x)",
    "log(x)",
    "sqrt(x)",
    "abs(x)",
    "x^3",
    "1/x",
    "e^x",
  ];

  if (isLoading) {
    return (
      <ToolDemo
        title="Function Grapher"
        description="Visualize mathematical functions with interactive graphs."
        demoType="graphing"
        interactive={true}
        isLoading={true}
        className={className}
      />
    );
  }

  return (
    <ToolDemo
      title="Function Grapher"
      description="Visualize mathematical functions with interactive graphs. Plot multiple functions and explore their behavior."
      demoType="graphing"
      interactive={true}
      className={className}
    >
      <div className="space-y-6">
        {/* Graph Canvas */}
        <div className="bg-white dark:bg-slate-900 border rounded-lg p-4">
          <canvas
            ref={canvasRef}
            className="w-full border rounded"
            style={{ height: "400px" }}
          />
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Add Function */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Add Function</Label>
            <div className="flex gap-2">
              <Input
                value={newFunction}
                onChange={(e) => setNewFunction(e.target.value)}
                placeholder="e.g., x^2, sin(x), log(x)"
                className="font-mono"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addFunction();
                  }
                }}
              />
              <Button onClick={addFunction} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Preset Functions */}
            <div className="flex flex-wrap gap-1">
              {presetFunctions.map((func) => (
                <Button
                  key={func}
                  variant="outline"
                  size="sm"
                  onClick={() => setNewFunction(func)}
                  className="text-xs font-mono h-7"
                >
                  {func}
                </Button>
              ))}
            </div>
          </div>

          {/* View Range */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">View Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="x-min" className="text-xs">
                  X Min
                </Label>
                <Input
                  id="x-min"
                  type="number"
                  value={xMin}
                  onChange={(e) => setXMin(Number(e.target.value))}
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="x-max" className="text-xs">
                  X Max
                </Label>
                <Input
                  id="x-max"
                  type="number"
                  value={xMax}
                  onChange={(e) => setXMax(Number(e.target.value))}
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="y-min" className="text-xs">
                  Y Min
                </Label>
                <Input
                  id="y-min"
                  type="number"
                  value={yMin}
                  onChange={(e) => setYMin(Number(e.target.value))}
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="y-max" className="text-xs">
                  Y Max
                </Label>
                <Input
                  id="y-max"
                  type="number"
                  value={yMax}
                  onChange={(e) => setYMax(Number(e.target.value))}
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Function List */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Functions</Label>
          <div className="space-y-2">
            {functions.map((func) => (
              <div
                key={func.id}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
              >
                <div
                  className="w-4 h-4 rounded-full border-2"
                  style={{
                    backgroundColor: func.visible ? func.color : "transparent",
                    borderColor: func.color,
                  }}
                />
                <code className="flex-1 font-mono text-sm">
                  {func.expression}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFunction(func.id)}
                  className="h-8 w-8 p-0"
                >
                  {func.visible ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFunction(func.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Help Text */}
        <div className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Supported Functions
          </h4>
          <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <p>
              • <strong>Basic:</strong> +, -, *, /, ^, sqrt(), abs()
            </p>
            <p>
              • <strong>Trigonometric:</strong> sin(), cos(), tan()
            </p>
            <p>
              • <strong>Logarithmic:</strong> log(), ln(), exp()
            </p>
            <p>
              • <strong>Constants:</strong> pi, e
            </p>
          </div>
        </div>
      </div>
    </ToolDemo>
  );
};

export default FunctionGrapherDemo;
