import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import { SaveShareButtons } from "./SaveShareButtons";
import { ToolResult } from "../../lib/toolUtils";

// JSXGraph types
declare global {
  interface Window {
    JXG: any;
  }
}

export function GraphPlotter() {
  const boardRef = useRef<HTMLDivElement>(null);
  const [board, setBoard] = useState<any>(null);
  const [functionInput, setFunctionInput] = useState("x^2");
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [yMin, setYMin] = useState(-10);
  const [yMax, setYMax] = useState(10);
  const [functions, setFunctions] = useState<
    Array<{ id: string; expression: string; color: string }>
  >([]);
  const [lastPlot, setLastPlot] = useState<ToolResult | null>(null);

  // Initialize JSXGraph
  useEffect(() => {
    const loadJSXGraph = async () => {
      if (typeof window !== "undefined" && !window.JXG) {
        // Load JSXGraph dynamically
        const script = document.createElement("script");
        script.src =
          "https://cdn.jsdelivr.net/npm/jsxgraph@1.11.1/distrib/jsxgraphcore.js";
        script.onload = () => {
          initializeBoard();
        };
        document.head.appendChild(script);
      } else if (window.JXG) {
        initializeBoard();
      }
    };

    loadJSXGraph();

    return () => {
      if (board) {
        window.JXG.JSXGraph.freeBoard(board);
      }
    };
  }, []);

  const initializeBoard = () => {
    if (boardRef.current && window.JXG) {
      const newBoard = window.JXG.JSXGraph.initBoard(boardRef.current, {
        boundingbox: [xMin, yMax, xMax, yMin],
        axis: true,
        showCopyright: false,
        showNavigation: true,
        zoom: {
          factorX: 1.25,
          factorY: 1.25,
          wheel: true,
        },
        pan: {
          enabled: true,
          needTwoFingers: false,
        },
        grid: true,
      });

      setBoard(newBoard);
    }
  };

  const updateBounds = () => {
    if (board) {
      board.setBoundingBox([xMin, yMax, xMax, yMin]);
    }
  };

  const addFunction = () => {
    if (!board || !functionInput.trim()) return;

    try {
      const colors = [
        "#e74c3c",
        "#3498db",
        "#2ecc71",
        "#f39c12",
        "#9b59b6",
        "#1abc9c",
      ];
      const color = colors[functions.length % colors.length];
      const id = `func_${Date.now()}`;

      // Create the function curve
      const curve = board.create(
        "functiongraph",
        [
          (x: number) => {
            try {
              // Simple expression evaluator for basic functions
              const expr = functionInput
                .replace(/\^/g, "**")
                .replace(/sin/g, "Math.sin")
                .replace(/cos/g, "Math.cos")
                .replace(/tan/g, "Math.tan")
                .replace(/log/g, "Math.log")
                .replace(/sqrt/g, "Math.sqrt")
                .replace(/abs/g, "Math.abs")
                .replace(/exp/g, "Math.exp")
                .replace(/pi/g, "Math.PI")
                .replace(/e/g, "Math.E");

              // Replace x with the actual value
              const finalExpr = expr.replace(/x/g, `(${x})`);
              return eval(finalExpr);
            } catch (error) {
              return NaN;
            }
          },
          xMin,
          xMax,
        ],
        {
          strokeColor: color,
          strokeWidth: 2,
          name: functionInput,
          withLabel: true,
          label: {
            position: "top",
            offset: [10, 10],
          },
        }
      );

      const newFunctions = [
        ...functions,
        { id, expression: functionInput, color },
      ];
      setFunctions(newFunctions);

      // Create tool result for saving/sharing
      const toolResult: ToolResult = {
        toolId: "graphing",
        toolName: "Function Grapher",
        input: {
          functions: newFunctions.map((f) => f.expression),
          bounds: { xMin, xMax, yMin, yMax },
        },
        output: {
          plotted: functionInput,
          totalFunctions: newFunctions.length,
        },
        timestamp: new Date(),
      };

      setLastPlot(toolResult);
      setFunctionInput("");
    } catch (error) {
      console.error("Error adding function:", error);
    }
  };

  const clearAll = () => {
    if (board) {
      board.removeObject(
        board.objectsList.filter((obj: any) => obj.elType === "curve")
      );
      setFunctions([]);
    }
  };

  const removeFunction = (id: string) => {
    if (board) {
      const obj = board.objects[id];
      if (obj) {
        board.removeObject(obj);
      }
      setFunctions((prev) => prev.filter((f) => f.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="function-input">
                Function (use x as variable)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="function-input"
                  value={functionInput}
                  onChange={(e) => setFunctionInput(e.target.value)}
                  placeholder="e.g., x^2, sin(x), x^3 - 2*x + 1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addFunction();
                    }
                  }}
                />
                <Button onClick={addFunction}>Plot</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Supported: +, -, *, /, ^, sin, cos, tan, log, sqrt, abs, exp,
                pi, e
              </p>
            </div>

            <div className="space-y-2">
              <Label>View Range</Label>
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
              <Button onClick={updateBounds} size="sm" className="w-full">
                Update View
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={clearAll} variant="outline" size="sm">
              Clear All
            </Button>
          </div>
        </div>
      </Card>

      {/* Graph */}
      <Card className="p-4">
        <div
          ref={boardRef}
          className="w-full h-96 border rounded-lg bg-white"
          style={{ minHeight: "400px" }}
        />
      </Card>

      {/* Function List */}
      {functions.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Plotted Functions</h3>
          <div className="space-y-2">
            {functions.map((func) => (
              <div
                key={func.id}
                className="flex items-center justify-between p-2 bg-muted rounded"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: func.color }}
                  />
                  <code className="text-sm">{func.expression}</code>
                </div>
                <Button
                  onClick={() => removeFunction(func.id)}
                  variant="outline"
                  size="sm"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Save/Share Section */}
      {lastPlot && functions.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Current Plot</h3>
              <p className="text-sm text-muted-foreground">
                {functions.length} function{functions.length !== 1 ? "s" : ""}{" "}
                plotted
              </p>
            </div>
            <SaveShareButtons result={lastPlot} />
          </div>
        </Card>
      )}
    </div>
  );
}
