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
  const [memory, setMemory] = useState(0);
  const [showScientific, setShowScientific] = useState(false);
  const [angleMode, setAngleMode] = useState<"deg" | "rad">("deg");

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

        return resultStr;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Invalid expression";
        setResult(`Error: ${errorMsg}`);
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
    ["7", "8", "9", "/"],
    ["4", "5", "6", "*"],
    ["1", "2", "3", "-"],
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
        <div className="space-y-6">
          {/* Calculator Display */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl p-6 border shadow-inner">
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
                  className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg font-mono text-2xl font-bold text-right text-primary dark:text-primary-foreground shadow-sm"
                  role="status"
                  aria-live="polite"
                  aria-label={`Result: ${result}`}
                >
                  = {result}
                </div>
              )}
            </div>
          </div>

          {/* Mode Controls */}
          <div className="flex flex-wrap gap-3 items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border">
            <div className="flex gap-2">
              <Button
                variant={angleMode === "deg" ? "default" : "outline"}
                size="sm"
                onClick={() => setAngleMode("deg")}
                aria-label="Set angle mode to degrees"
                className={`font-semibold transition-all ${
                  angleMode === "deg"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "hover:bg-primary/10 hover:border-primary/50"
                }`}
              >
                DEG
              </Button>
              <Button
                variant={angleMode === "rad" ? "default" : "outline"}
                size="sm"
                onClick={() => setAngleMode("rad")}
                aria-label="Set angle mode to radians"
                className={`font-semibold transition-all ${
                  angleMode === "rad"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "hover:bg-primary/10 hover:border-primary/50"
                }`}
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
                className={`font-semibold transition-all ${
                  showScientific
                    ? "bg-accent text-accent-foreground shadow-md"
                    : "hover:bg-accent/10 hover:border-accent/50"
                }`}
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

          {/* Memory Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {memoryButtons.map((btn) => (
              <Button
                key={btn}
                variant="outline"
                size="sm"
                onClick={() => handleButtonInput(btn)}
                className="h-14 text-base font-mono font-bold bg-gradient-to-b from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-800/30 dark:hover:to-orange-700/30 hover:border-orange-300 dark:hover:border-orange-600 transition-all shadow-sm hover:shadow-md"
                aria-label={`Memory ${btn}`}
              >
                {btn}
              </Button>
            ))}
          </div>

          {/* Scientific Functions (if enabled) */}
          {showScientific && (
            <div className="space-y-3 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
              <h4 className="text-sm font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Scientific Functions
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {scientificButtons.flat().map((btn) => (
                  <Button
                    key={btn}
                    variant="outline"
                    size="sm"
                    onClick={() => handleButtonInput(btn)}
                    className="h-14 text-base font-mono font-bold bg-gradient-to-b from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border-purple-200 dark:border-purple-600 text-purple-700 dark:text-purple-300 hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-800/40 dark:hover:to-purple-700/40 hover:border-purple-300 dark:hover:border-purple-500 transition-all shadow-sm hover:shadow-md hover:scale-105"
                    aria-label={`Scientific function ${btn}`}
                  >
                    {btn}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Basic Calculator Buttons */}
          <div className="grid grid-cols-4 gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border shadow-sm">
            {basicButtons.flat().map((btn) => {
              const isEquals = btn === "=";
              const isClear = btn === "C" || btn === "⌫";
              const isOperator = ["+", "-", "*", "/"].includes(btn);
              const isNumber = /^\d$/.test(btn) || btn === ".";

              return (
                <Button
                  key={btn}
                  variant={
                    isEquals ? "default" : isClear ? "destructive" : "outline"
                  }
                  onClick={() => handleButtonInput(btn)}
                  className={`h-14 text-xl font-bold transition-all shadow-sm hover:shadow-md hover:scale-105 ${
                    isEquals
                      ? "bg-gradient-to-b from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary/80 col-span-1"
                      : isClear
                      ? "bg-gradient-to-b from-red-500 to-red-600 text-white hover:from-red-400 hover:to-red-500"
                      : isOperator
                      ? "bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/40 dark:hover:to-blue-700/40"
                      : isNumber
                      ? "bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:from-slate-100 hover:to-slate-200 dark:hover:from-slate-700 dark:hover:to-slate-600"
                      : "bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:from-slate-100 hover:to-slate-200 dark:hover:from-slate-700 dark:hover:to-slate-600"
                  }`}
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

          {/* Examples */}
          <div className="space-y-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-semibold text-green-700 dark:text-green-300">
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
                  className="h-10 text-sm font-mono font-semibold bg-gradient-to-b from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-green-200 dark:border-green-600 text-green-700 dark:text-green-300 hover:from-green-100 hover:to-green-200 dark:hover:from-green-800/40 dark:hover:to-green-700/40 hover:border-green-300 dark:hover:border-green-500 transition-all shadow-sm hover:shadow-md hover:scale-105"
                  aria-label={`Try example: ${example}`}
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>

          {/* History */}
          <div className="space-y-3 p-4 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-800/30 font-medium"
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
                  className="flex items-center gap-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium"
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
                className="max-h-40 overflow-y-auto space-y-2 p-3 bg-white dark:bg-slate-900 rounded-lg border shadow-inner"
                role="log"
                aria-label="Calculation history"
              >
                {history.map((item) => (
                  <button
                    key={item.timestamp}
                    onClick={() => handleHistoryClick(item)}
                    className="w-full text-left p-3 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg text-sm font-mono transition-all border border-transparent hover:border-amber-200 dark:hover:border-amber-700 shadow-sm hover:shadow-md"
                    aria-label={`Reuse calculation: ${item.expression} equals ${item.result}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400 truncate flex-1 mr-2">
                        {item.expression}
                      </span>
                      <span className="font-bold text-amber-700 dark:text-amber-300 flex-shrink-0">
                        = {item.result}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Help Text */}
          <div className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
              Quick Reference
            </h4>
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2 grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="space-y-1">
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  Functions:
                </p>
                <p>• sqrt(), cbrt(), sin(), cos(), tan()</p>
                <p>• asin(), acos(), atan(), sinh(), cosh(), tanh()</p>
                <p>• log() (natural), log10() (base 10)</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  Features:
                </p>
                <p>• Constants: pi (π), e</p>
                <p>• Memory: MC, MR, M+, M-</p>
                <p>• Modes: DEG/RAD, SCI panel</p>
                <p>• Operators: ^, !, *, +, -, /</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </ToolDemo>
  );
};

export default CalculatorDemo;
