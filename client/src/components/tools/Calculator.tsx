import { useState, useCallback, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import { SaveShareButtons } from "./SaveShareButtons";
import { ToolResult } from "../../lib/toolUtils";
import { Calculator as CalculatorIcon, History, Trash2 } from "lucide-react";

// Math.js types
declare global {
  interface Window {
    math?: any;
  }
}

interface CalculationHistory {
  expression: string;
  result: string;
  timestamp: number;
}

export function Calculator() {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("");
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [memory, setMemory] = useState(0);
  const [showScientific, setShowScientific] = useState(false);
  const [angleMode, setAngleMode] = useState<"deg" | "rad">("deg");
  const [lastCalculation, setLastCalculation] = useState<ToolResult | null>(
    null
  );

  // Load math.js library
  const loadMathJS = useCallback(async () => {
    try {
      if (window.math) {
        setIsLoaded(true);
        setIsLoading(false);
        return;
      }

      // Dynamically import math.js
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/mathjs@12.4.0/lib/browser/math.min.js";
      script.async = true;

      script.onload = () => {
        if (window.math) {
          setIsLoaded(true);
          setError(null);
        } else {
          setError("Math.js failed to initialize");
        }
        setIsLoading(false);
      };

      script.onerror = () => {
        setError("Failed to load Math.js library");
        setIsLoading(false);
      };

      document.head.appendChild(script);
    } catch (err) {
      setError("Error loading calculator library");
      setIsLoading(false);
    }
  }, []);

  // Calculate expression with angle mode support
  const calculate = useCallback(
    (expr: string) => {
      if (!window.math || !expr.trim()) return;

      try {
        let result;

        // Try to configure angle mode if math.js supports it
        if (window.math.create && typeof window.math.create === "function") {
          const math = window.math.create();
          math.config({
            angleUnit: angleMode,
          });
          result = math.evaluate(expr);
        } else {
          // Fallback for basic math.js or mocked version
          result = window.math.evaluate(expr);
        }
        const resultStr =
          typeof result === "number"
            ? Number.isInteger(result)
              ? result.toString()
              : result.toFixed(8).replace(/\.?0+$/, "")
            : result.toString();

        setResult(resultStr);

        // Add to history
        const newEntry: CalculationHistory = {
          expression: expr,
          result: resultStr,
          timestamp: Date.now(),
        };

        setHistory((prev) => [newEntry, ...prev.slice(0, 19)]); // Keep last 20 entries

        // Create tool result for saving/sharing
        const toolResult: ToolResult = {
          toolId: "calculator",
          toolName: "Advanced Calculator",
          input: { expression: expr, angleMode },
          output: { result: resultStr },
          timestamp: new Date(),
        };

        setLastCalculation(toolResult);

        return resultStr;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Invalid expression";
        setResult(`Error: ${errorMsg}`);
        setLastCalculation(null);
        return null;
      }
    },
    [angleMode]
  );

  // Memory functions
  const memoryAdd = useCallback(() => {
    const currentResult = parseFloat(result);
    if (!isNaN(currentResult)) {
      setMemory((prev) => prev + currentResult);
    }
  }, [result]);

  const memorySubtract = useCallback(() => {
    const currentResult = parseFloat(result);
    if (!isNaN(currentResult)) {
      setMemory((prev) => prev - currentResult);
    }
  }, [result]);

  const memoryRecall = useCallback(() => {
    setExpression(memory.toString());
    setResult(memory.toString());
  }, [memory]);

  const memoryClear = useCallback(() => {
    setMemory(0);
  }, []);

  // Handle expression change with real-time calculation
  const handleExpressionChange = useCallback((value: string) => {
    setExpression(value);

    // Real-time calculation for simple expressions
    if (value.trim() && window.math) {
      try {
        // Only calculate if expression looks complete (no trailing operators)
        if (!/[+\-*/^(]$/.test(value.trim())) {
          const result = window.math.evaluate(value);
          const resultStr =
            typeof result === "number"
              ? Number.isInteger(result)
                ? result.toString()
                : result.toFixed(6).replace(/\.?0+$/, "")
              : result.toString();
          setResult(resultStr);
        }
      } catch {
        // Ignore errors during real-time calculation
        setResult("");
      }
    } else {
      setResult("");
    }
  }, []);

  // Handle button input
  const handleButtonInput = useCallback(
    (value: string) => {
      if (value === "=") {
        calculate(expression);
      } else if (value === "C") {
        setExpression("");
        setResult("");
      } else if (value === "⌫") {
        setExpression((prev) => prev.slice(0, -1));
      } else if (value === "M+") {
        memoryAdd();
      } else if (value === "M-") {
        memorySubtract();
      } else if (value === "MR") {
        memoryRecall();
      } else if (value === "MC") {
        memoryClear();
      } else if (value === "π") {
        setExpression((prev) => prev + "pi");
      } else if (value === "e") {
        setExpression((prev) => prev + "e");
      } else if (value === "x²") {
        setExpression((prev) => prev + "^2");
      } else if (value === "x³") {
        setExpression((prev) => prev + "^3");
      } else if (value === "√") {
        setExpression((prev) => prev + "sqrt(");
      } else if (value === "∛") {
        setExpression((prev) => prev + "cbrt(");
      } else if (value === "x!") {
        setExpression((prev) => prev + "!");
      } else if (value === "1/x") {
        setExpression((prev) => prev + "1/(");
      } else if (value === "ln") {
        setExpression((prev) => prev + "log(");
      } else if (value === "log") {
        setExpression((prev) => prev + "log10(");
      } else if (value === "sin") {
        setExpression((prev) => prev + "sin(");
      } else if (value === "cos") {
        setExpression((prev) => prev + "cos(");
      } else if (value === "tan") {
        setExpression((prev) => prev + "tan(");
      } else if (value === "sin⁻¹") {
        setExpression((prev) => prev + "asin(");
      } else if (value === "cos⁻¹") {
        setExpression((prev) => prev + "acos(");
      } else if (value === "tan⁻¹") {
        setExpression((prev) => prev + "atan(");
      } else if (value === "sinh") {
        setExpression((prev) => prev + "sinh(");
      } else if (value === "cosh") {
        setExpression((prev) => prev + "cosh(");
      } else if (value === "tanh") {
        setExpression((prev) => prev + "tanh(");
      } else if (value === "x^y") {
        setExpression((prev) => prev + "^");
      } else if (value === "EXP") {
        setExpression((prev) => prev + "e^");
      } else if (value === "Ans") {
        setExpression((prev) => prev + result);
      } else {
        setExpression((prev) => prev + value);
      }
    },
    [
      expression,
      calculate,
      memoryAdd,
      memorySubtract,
      memoryRecall,
      memoryClear,
      result,
    ]
  );

  // Handle history item click
  const handleHistoryClick = useCallback((item: CalculationHistory) => {
    setExpression(item.expression);
    setResult(item.result);
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // Preset examples
  const examples = [
    "sqrt(16)",
    "sin(pi/2)",
    "2^8",
    "log10(100)",
    "factorial(5)",
    "gcd(48, 18)",
    "cbrt(27)",
    "sinh(1)",
    "asin(0.5)",
    "e^2",
    "abs(-5)",
    "round(3.14159, 2)",
  ];

  // Load math.js on mount
  useEffect(() => {
    loadMathJS();
  }, [loadMathJS]);

  // Basic calculator buttons
  const basicButtons = [
    ["C", "⌫", "(", ")"],
    ["1", "2", "3", "/"],
    ["4", "5", "6", "*"],
    ["7", "8", "9", "-"],
    ["0", ".", "=", "+"],
  ];

  // Scientific calculator buttons
  const scientificButtons = [
    ["sin", "cos", "tan", "π"],
    ["sin⁻¹", "cos⁻¹", "tan⁻¹", "e"],
    ["sinh", "cosh", "tanh", "x²"],
    ["ln", "log", "√", "x³"],
    ["x^y", "1/x", "x!", "∛"],
  ];

  // Memory buttons
  const memoryButtons = ["MC", "MR", "M+", "M-"];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading calculator...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={loadMathJS} variant="outline">
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calculator Display */}
      <Card className="p-6">
        <div className="space-y-3">
          <Label htmlFor="calc-input" className="sr-only">
            Mathematical expression
          </Label>
          <Input
            id="calc-input"
            type="text"
            value={expression}
            onChange={(e) => handleExpressionChange(e.target.value)}
            placeholder="Enter expression..."
            className="font-mono text-xl bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            aria-label="Calculator input"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                calculate(expression);
              }
            }}
          />

          {result && (
            <div
              className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg font-mono text-2xl font-bold text-right text-primary dark:text-white shadow-sm"
              role="status"
              aria-live="polite"
              aria-label={`Result: ${result}`}
            >
              = {result}
            </div>
          )}
        </div>
      </Card>

      {/* Mode Controls */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={angleMode === "deg" ? "default" : "outline"}
              size="sm"
              onClick={() => setAngleMode("deg")}
              aria-label="Set angle mode to degrees"
            >
              DEG
            </Button>
            <Button
              variant={angleMode === "rad" ? "default" : "outline"}
              size="sm"
              onClick={() => setAngleMode("rad")}
              aria-label="Set angle mode to radians"
            >
              RAD
            </Button>
          </div>
          <div className="flex gap-3 items-center">
            <Button
              variant={showScientific ? "default" : "outline"}
              size="sm"
              onClick={() => setShowScientific(!showScientific)}
              aria-label="Toggle scientific functions"
            >
              SCI
            </Button>
            <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-800 rounded-md border">
              <span className="text-xs font-medium text-muted-foreground">
                Memory:
              </span>
              <span className="text-sm font-mono font-semibold text-primary">
                {memory !== 0 ? memory.toFixed(4).replace(/\.?0+$/, "") : "0"}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Memory Buttons */}
      <Card className="p-4">
        <div className="grid grid-cols-4 gap-2">
          {memoryButtons.map((btn) => (
            <Button
              key={btn}
              variant="outline"
              size="sm"
              onClick={() => handleButtonInput(btn)}
              className="h-14 text-2xl font-mono font-bold"
              aria-label={`Memory ${btn}`}
            >
              {btn}
            </Button>
          ))}
        </div>
      </Card>

      {/* Scientific Functions (if enabled) */}
      {showScientific && (
        <Card className="p-4">
          <h4 className="text-sm font-semibold text-muted-foreground mb-3">
            Scientific Functions
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {scientificButtons.flat().map((btn) => (
              <Button
                key={btn}
                variant="outline"
                size="sm"
                onClick={() => handleButtonInput(btn)}
                className="h-14 text-2xl font-mono font-bold"
                aria-label={`Scientific function ${btn}`}
              >
                {btn}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Basic Calculator Buttons */}
      <Card className="p-4">
        <div className="grid grid-cols-4 gap-3">
          {basicButtons.flat().map((btn) => {
            const isEquals = btn === "=";
            const isClear = btn === "C" || btn === "⌫";
            const isOperator = ["+", "-", "*", "/"].includes(btn);

            return (
              <Button
                key={btn}
                variant={
                  isEquals ? "default" : isClear ? "destructive" : "outline"
                }
                onClick={() => handleButtonInput(btn)}
                className="h-14 text-4xl font-bold transition-all shadow-sm hover:shadow-md hover:scale-105"
                aria-label={
                  btn === "="
                    ? "Calculate"
                    : btn === "C"
                    ? "Clear"
                    : btn === "⌫"
                    ? "Backspace"
                    : `Input ${btn}`
                }
              >
                {btn}
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Examples */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <CalculatorIcon className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-primary">
            Try these examples:
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {examples.map((example) => (
            <Button
              key={example}
              variant="outline"
              size="sm"
              onClick={() => handleExpressionChange(example)}
              className="text-xs font-mono"
              aria-label={`Try example: ${example}`}
            >
              {example}
            </Button>
          ))}
        </div>
      </Card>

      {/* History */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2"
            aria-expanded={showHistory}
            aria-controls="calculation-history"
          >
            <History className="h-4 w-4" />
            History ({history.length})
          </Button>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="flex items-center gap-1 text-destructive"
              aria-label="Clear calculation history"
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </Button>
          )}
        </div>

        {showHistory && history.length > 0 && (
          <div
            id="calculation-history"
            className="max-h-40 overflow-y-auto space-y-2 p-3 bg-background rounded-lg border shadow-inner"
            role="log"
            aria-label="Calculation history"
          >
            {history.map((item) => (
              <button
                key={item.timestamp}
                onClick={() => handleHistoryClick(item)}
                className="w-full text-left p-3 hover:bg-muted rounded-lg text-sm font-mono transition-all border border-transparent hover:border-primary/20 shadow-sm hover:shadow-md"
                aria-label={`Reuse calculation: ${item.expression} equals ${item.result}`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground truncate flex-1 mr-2">
                    {item.expression}
                  </span>
                  <span className="font-bold text-primary flex-shrink-0">
                    = {item.result}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Save/Share Section */}
      {lastCalculation && result && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Calculation Result</h3>
              <p className="text-sm text-muted-foreground">
                Mathematical calculation completed
              </p>
            </div>
            <SaveShareButtons result={lastCalculation} />
          </div>
        </Card>
      )}
    </div>
  );
}
