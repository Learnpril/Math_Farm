import React, { useState, useCallback, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import ToolDemo from "./ToolDemo";
import { Calculator, History, Trash2 } from "lucide-react";

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

export interface CalculatorDemoProps {
  className?: string;
}

export const CalculatorDemo: React.FC<CalculatorDemoProps> = ({
  className = "",
}) => {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("");
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

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

  // Calculate expression
  const calculate = useCallback((expr: string) => {
    if (!window.math || !expr.trim()) return;

    try {
      const result = window.math.evaluate(expr);
      const resultStr =
        typeof result === "number"
          ? Number.isInteger(result)
            ? result.toString()
            : result.toFixed(6).replace(/\.?0+$/, "")
          : result.toString();

      setResult(resultStr);

      // Add to history
      const newEntry: CalculationHistory = {
        expression: expr,
        result: resultStr,
        timestamp: Date.now(),
      };

      setHistory((prev) => [newEntry, ...prev.slice(0, 9)]); // Keep last 10 entries

      return resultStr;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Invalid expression";
      setResult(`Error: ${errorMsg}`);
      return null;
    }
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
      } else {
        setExpression((prev) => prev + value);
      }
    },
    [expression, calculate]
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
    "log(100, 10)",
    "factorial(5)",
    "gcd(48, 18)",
  ];

  // Load math.js on mount
  useEffect(() => {
    loadMathJS();
  }, [loadMathJS]);

  // Calculator buttons
  const buttons = [
    ["C", "⌫", "(", ")"],
    ["7", "8", "9", "/"],
    ["4", "5", "6", "*"],
    ["1", "2", "3", "-"],
    ["0", ".", "=", "+"],
  ];

  return (
    <ToolDemo
      title="Advanced Calculator"
      description="Perform complex mathematical calculations with support for functions, constants, and more."
      demoType="calculator"
      interactive={true}
      error={error}
      isLoading={isLoading}
      className={className}
    >
      {isLoaded && !error && (
        <div className="space-y-4">
          {/* Input and Display */}
          <div className="space-y-2">
            <Label htmlFor="calc-input" className="sr-only">
              Mathematical expression
            </Label>
            <Input
              id="calc-input"
              type="text"
              value={expression}
              onChange={(e) => handleExpressionChange(e.target.value)}
              placeholder="Enter expression (e.g., 2 + 3 * 4, sqrt(16), sin(pi/2))"
              className="font-mono text-lg"
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
                className="p-3 bg-muted rounded-md font-mono text-lg font-semibold text-right"
                role="status"
                aria-live="polite"
                aria-label={`Result: ${result}`}
              >
                = {result}
              </div>
            )}
          </div>

          {/* Calculator Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {buttons.flat().map((btn) => (
              <Button
                key={btn}
                variant={
                  btn === "="
                    ? "default"
                    : btn === "C" || btn === "⌫"
                    ? "destructive"
                    : "outline"
                }
                onClick={() => handleButtonInput(btn)}
                className="h-12 text-lg font-mono"
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
            ))}
          </div>

          {/* Examples */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              <span className="text-sm font-medium">Try these examples:</span>
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
          </div>

          {/* History */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
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
                  className="flex items-center gap-1 text-destructive hover:text-destructive"
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
                className="max-h-32 overflow-y-auto space-y-1 p-2 bg-muted/50 rounded-md"
                role="log"
                aria-label="Calculation history"
              >
                {history.map((item) => (
                  <button
                    key={item.timestamp}
                    onClick={() => handleHistoryClick(item)}
                    className="w-full text-left p-2 hover:bg-background rounded text-sm font-mono transition-colors"
                    aria-label={`Reuse calculation: ${item.expression} equals ${item.result}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        {item.expression}
                      </span>
                      <span className="font-semibold">= {item.result}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Help Text */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              • Supports advanced functions: sqrt(), sin(), cos(), tan(), log(),
              factorial()
            </p>
            <p>• Constants available: pi, e, phi (golden ratio)</p>
            <p>• Use ^ for exponents, * for multiplication</p>
            <p>• Results update in real-time as you type</p>
          </div>
        </div>
      )}
    </ToolDemo>
  );
};

export default CalculatorDemo;
