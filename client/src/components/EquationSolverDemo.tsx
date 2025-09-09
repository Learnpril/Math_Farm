import React, { useState, useCallback, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import ToolDemo from "./ToolDemo";
import { MathExpression } from "./MathExpression";
import { Zap, BookOpen, Calculator } from "lucide-react";

// Math.js types
declare global {
  interface Window {
    math?: any;
  }
}

interface SolutionStep {
  step: string;
  explanation: string;
  result: string;
  latex?: string;
}

export interface EquationSolverDemoProps {
  className?: string;
}

export const EquationSolverDemo: React.FC<EquationSolverDemoProps> = ({
  className = "",
}) => {
  const [equation, setEquation] = useState("x^2 + 4*x + 4");
  const [variable, setVariable] = useState("x");
  const [solverType, setSolverType] = useState<
    "solve" | "derivative" | "simplify"
  >("solve");
  const [result, setResult] = useState("");
  const [resultLatex, setResultLatex] = useState("");
  const [steps, setSteps] = useState<SolutionStep[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Convert mathematical expressions to LaTeX format
  const toLatex = useCallback((expression: string): string => {
    let latex = expression;

    // Replace common mathematical notation
    latex = latex.replace(/\*\*/g, "^"); // ** to ^

    // Handle coefficient multiplication (number * variable) - remove multiplication symbol
    latex = latex.replace(/(\d+)\s*\*\s*([a-zA-Z])/g, "$1$2"); // 4*x -> 4x
    latex = latex.replace(/(\d+)\s*\*\s*\(/g, "$1("); // 4*(x+1) -> 4(x+1)

    // Handle variable * variable or function * function - keep multiplication symbol
    latex = latex.replace(/([a-zA-Z])\s*\*\s*([a-zA-Z])/g, "$1 \\cdot $2"); // x*y -> x·y
    latex = latex.replace(/\)\s*\*\s*\(/g, ") \\cdot ("); // (x+1)*(x-1) -> (x+1)·(x-1)
    latex = latex.replace(/\)\s*\*\s*([a-zA-Z])/g, ") \\cdot $1"); // (x+1)*y -> (x+1)·y
    latex = latex.replace(/([a-zA-Z])\s*\*\s*\(/g, "$1 \\cdot ("); // x*(y+1) -> x·(y+1)

    // Handle any remaining * as multiplication
    latex = latex.replace(/\*/g, " \\cdot ");
    latex = latex.replace(/\^(\w+)/g, "^{$1}"); // x^2 to x^{2}
    latex = latex.replace(/\^(\d+)/g, "^{$1}"); // x^2 to x^{2}
    latex = latex.replace(/sqrt\(([^)]+)\)/g, "\\sqrt{$1}"); // sqrt() to \sqrt{}
    latex = latex.replace(/sin\(([^)]+)\)/g, "\\sin($1)"); // sin() to \sin()
    latex = latex.replace(/cos\(([^)]+)\)/g, "\\cos($1)"); // cos() to \cos()
    latex = latex.replace(/tan\(([^)]+)\)/g, "\\tan($1)"); // tan() to \tan()
    latex = latex.replace(/log\(([^)]+)\)/g, "\\log($1)"); // log() to \log()
    latex = latex.replace(/ln\(([^)]+)\)/g, "\\ln($1)"); // ln() to \ln()
    latex = latex.replace(/exp\(([^)]+)\)/g, "e^{$1}"); // exp() to e^{}
    latex = latex.replace(/pi/g, "\\pi"); // pi to \pi
    latex = latex.replace(/infinity/g, "\\infty"); // infinity to \infty

    // Handle fractions (simple cases)
    latex = latex.replace(/(\w+)\/(\w+)/g, "\\frac{$1}{$2}");
    latex = latex.replace(/\(([^)]+)\)\/\(([^)]+)\)/g, "\\frac{$1}{$2}");

    // Handle subscripts for roots like x₁, x₂
    latex = latex.replace(/x₁/g, "x_1");
    latex = latex.replace(/x₂/g, "x_2");
    latex = latex.replace(/x₃/g, "x_3");
    latex = latex.replace(/x₄/g, "x_4");

    // Handle discriminant symbol
    latex = latex.replace(/Δ/g, "\\Delta");

    // Handle equals signs in results
    latex = latex.replace(
      /x₁ = ([^,]+), x₂ = ([^,]+)/g,
      "x_1 = $1, \\quad x_2 = $2"
    );

    // Clean up extra spaces
    latex = latex.replace(/\s+/g, " ").trim();

    return latex;
  }, []);

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
      setError("Error loading equation solver library");
      setIsLoading(false);
    }
  }, []);

  // Solve quadratic equation with steps
  const solveQuadratic = useCallback((eq: string): SolutionStep[] => {
    const steps: SolutionStep[] = [];

    try {
      // Parse quadratic equation of form ax^2 + bx + c = 0
      const normalized = eq.replace(/\s/g, "").replace(/-/g, "+-");
      const terms = normalized.split("+").filter((t) => t);

      let a = 0,
        b = 0,
        c = 0;

      for (const term of terms) {
        if (term.includes("x^2")) {
          const coeff = term.replace("x^2", "") || "1";
          a =
            coeff === "" || coeff === "+"
              ? 1
              : coeff === "-"
              ? -1
              : parseFloat(coeff);
        } else if (term.includes("x") && !term.includes("x^2")) {
          const coeff = term.replace("x", "") || "1";
          b =
            coeff === "" || coeff === "+"
              ? 1
              : coeff === "-"
              ? -1
              : parseFloat(coeff);
        } else if (term && !term.includes("x")) {
          c = parseFloat(term);
        }
      }

      steps.push({
        step: "1",
        explanation: "Identify coefficients in ax² + bx + c = 0",
        result: `a = ${a}, b = ${b}, c = ${c}`,
        latex: `a = ${a}, \\quad b = ${b}, \\quad c = ${c}`,
      });

      const discriminant = b * b - 4 * a * c;

      steps.push({
        step: "2",
        explanation: "Calculate discriminant: b² - 4ac",
        result: `Δ = ${b}² - 4(${a})(${c}) = ${discriminant}`,
        latex: `\\Delta = ${b}^2 - 4(${a})(${c}) = ${discriminant}`,
      });

      if (discriminant < 0) {
        steps.push({
          step: "3",
          explanation: "Since discriminant < 0, there are no real roots",
          result: "No real solutions",
          latex: "\\text{No real solutions}",
        });
        return steps;
      } else if (discriminant === 0) {
        const root = -b / (2 * a);
        steps.push({
          step: "3",
          explanation:
            "Since discriminant = 0, there is one repeated root: x = -b/(2a)",
          result: `x = ${root}`,
          latex: `x = ${root}`,
        });
        return steps;
      } else {
        const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);

        steps.push({
          step: "3",
          explanation: "Apply quadratic formula: x = (-b ± √Δ)/(2a)",
          result: `x₁ = ${root1.toFixed(4)}, x₂ = ${root2.toFixed(4)}`,
          latex: `x_1 = ${root1.toFixed(4)}, \\quad x_2 = ${root2.toFixed(4)}`,
        });
        return steps;
      }
    } catch (err) {
      steps.push({
        step: "Error",
        explanation: "Could not parse quadratic equation",
        result: "Please check equation format",
      });
      return steps;
    }
  }, []);

  // Solve equation based on type
  const solveEquation = useCallback(() => {
    if (!window.math || !equation.trim()) return;

    setError(null);
    setResult("");
    setResultLatex("");
    setSteps([]);

    try {
      let solution: any;
      let solutionSteps: SolutionStep[] = [];

      switch (solverType) {
        case "solve":
          // For quadratic equations, provide step-by-step solution
          if (equation.includes("x^2") && !equation.includes("x^3")) {
            solutionSteps = solveQuadratic(equation);
            const lastStep = solutionSteps[solutionSteps.length - 1];
            solution = lastStep.result;
          } else {
            // For other equations, try simple evaluation
            solutionSteps.push({
              step: "1",
              explanation: "Attempting to find roots numerically",
              result: "Checking common values...",
            });

            // Simple root finding for basic equations
            const roots: number[] = [];
            for (let i = -5; i <= 5; i++) {
              try {
                const expr = equation.replace(/x/g, i.toString());
                const result = window.math.evaluate(expr);
                if (Math.abs(result) < 0.0001) {
                  roots.push(i);
                }
              } catch (err) {
                // Continue checking
              }
            }

            solution =
              roots.length > 0
                ? `x = ${roots.join(", ")}`
                : "No simple roots found";
            solutionSteps.push({
              step: "2",
              explanation: "Found roots by testing integer values",
              result: solution,
            });
          }
          break;

        case "derivative":
          try {
            const expr = window.math.parse(equation);
            const derivative_result = window.math.derivative(expr, variable);
            solution = derivative_result.toString();
            solutionSteps.push({
              step: "1",
              explanation: `Taking the derivative of ${equation} with respect to ${variable}`,
              result: solution,
              latex: toLatex(solution),
            });
          } catch (err) {
            throw new Error("Could not compute derivative");
          }
          break;

        case "simplify":
          try {
            const expr = window.math.parse(equation);
            const simplified = window.math.simplify(expr);
            solution = simplified.toString();
            solutionSteps.push({
              step: "1",
              explanation: `Simplifying ${equation}`,
              result: solution,
              latex: toLatex(solution),
            });
          } catch (err) {
            throw new Error("Could not simplify expression");
          }
          break;
      }

      setSteps(solutionSteps);
      const resultStr = solution?.toString() || "";
      setResult(resultStr);
      setResultLatex(toLatex(resultStr));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Solving failed";
      setError(errorMsg);
    }
  }, [equation, variable, solverType, solveQuadratic]);

  // Handle equation change with auto-solve for simple cases
  const handleEquationChange = useCallback(
    (value: string) => {
      setEquation(value);

      // Auto-solve for simple quadratic equations
      if (value.includes("x^2") && value.length > 3 && window.math) {
        setTimeout(() => {
          try {
            const steps = solveQuadratic(value);
            setSteps(steps);
            const lastStep = steps[steps.length - 1];
            setResult(lastStep.result);
            setResultLatex(lastStep.latex || toLatex(lastStep.result));
          } catch (err) {
            // Ignore auto-solve errors
          }
        }, 500);
      }
    },
    [solveQuadratic]
  );

  // Preset examples
  const examples = [
    { type: "solve", equation: "x^2 - 4", description: "Simple quadratic" },
    {
      type: "solve",
      equation: "x^2 + 2*x - 3",
      description: "Quadratic with linear term",
    },
    {
      type: "derivative",
      equation: "x^3 + 2*x^2 + x",
      description: "Polynomial derivative",
    },
    {
      type: "derivative",
      equation: "sin(x)",
      description: "Trigonometric derivative",
    },
    {
      type: "simplify",
      equation: "(x + 2)^2",
      description: "Expand expression",
    },
    {
      type: "simplify",
      equation: "x^2 + 4*x + 4",
      description: "Factor expression",
    },
  ];

  // Load math.js on mount
  useEffect(() => {
    loadMathJS();
  }, [loadMathJS]);

  return (
    <ToolDemo
      title="Equation Solver"
      description="Solve algebraic equations, find derivatives, and simplify expressions with step-by-step solutions."
      demoType="equation-solver"
      interactive={true}
      error={error}
      isLoading={isLoading}
      className={className}
    >
      {isLoaded && !error && (
        <div className="space-y-6">
          {/* Solver Type Selection */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
            <Label className="text-base font-semibold mb-3 block text-purple-700 dark:text-purple-300">
              Solver Type
            </Label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "solve", label: "Solve Equation", icon: Calculator },
                { key: "derivative", label: "Find Derivative", icon: Zap },
                { key: "simplify", label: "Simplify", icon: BookOpen },
              ].map((type) => {
                const IconComponent = type.icon;
                return (
                  <Button
                    key={type.key}
                    variant={solverType === type.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSolverType(type.key as any)}
                    className={`flex items-center gap-2 transition-all ${
                      solverType === type.key
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "hover:bg-primary/10 hover:border-primary/50"
                    }`}
                    aria-pressed={solverType === type.key}
                  >
                    <IconComponent className="h-4 w-4" />
                    {type.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Input Interface */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl p-6 border shadow-inner">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label
                    htmlFor="equation-input"
                    className="text-sm font-medium mb-2 block"
                  >
                    {solverType === "solve"
                      ? "Equation (set equal to 0)"
                      : "Expression"}
                  </Label>
                  <Input
                    id="equation-input"
                    value={equation}
                    onChange={(e) => handleEquationChange(e.target.value)}
                    placeholder="e.g., x^2 - 4, sin(x), (x+1)^2"
                    className="font-mono text-lg bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        solveEquation();
                      }
                    }}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="variable-input"
                    className="text-sm font-medium mb-2 block"
                  >
                    Variable
                  </Label>
                  <Input
                    id="variable-input"
                    value={variable}
                    onChange={(e) => setVariable(e.target.value)}
                    placeholder="x"
                    className="font-mono text-lg bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3"
                  />
                </div>
              </div>

              {/* LaTeX Preview */}
              {equation.trim() && (
                <div className="p-4 bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-700 rounded-lg">
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                    Preview
                  </Label>
                  <div className="text-center p-2 bg-slate-50 dark:bg-slate-900 rounded border">
                    <MathExpression
                      expression={toLatex(equation)}
                      fallback={equation}
                      inline={false}
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={solveEquation}
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-md hover:shadow-lg transition-all"
              >
                <Zap className="mr-2 h-5 w-5" />
                {solverType === "solve"
                  ? "Solve Equation"
                  : solverType === "derivative"
                  ? "Find Derivative"
                  : "Simplify Expression"}
              </Button>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700">
              <h3 className="font-semibold mb-3 text-green-700 dark:text-green-300 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Result
              </h3>

              {/* LaTeX Rendered Result */}
              {resultLatex && (
                <div className="mb-4">
                  <Label className="text-sm font-medium text-green-600 dark:text-green-400 mb-2 block">
                    Formatted Result
                  </Label>
                  <div className="p-4 bg-white dark:bg-slate-900 border border-green-200 dark:border-green-600 rounded-lg text-center">
                    <MathExpression
                      expression={resultLatex}
                      fallback={result}
                    />
                  </div>
                </div>
              )}

              {/* Plain Text Result */}
              <div>
                <Label className="text-sm font-medium text-green-600 dark:text-green-400 mb-2 block">
                  Plain Text
                </Label>
                <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-600 rounded-lg">
                  <code className="text-xl font-mono font-bold text-green-700 dark:text-green-300">
                    {result}
                  </code>
                </div>
              </div>
            </div>
          )}

          {/* Step-by-step solution */}
          {steps.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
              <h3 className="font-semibold mb-4 text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Step-by-step Solution
              </h3>
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-blue-400 pl-4 bg-white dark:bg-slate-900 p-4 rounded-r-lg shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <Badge
                        variant="outline"
                        className="text-xs bg-blue-100 dark:bg-blue-900/50 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300"
                      >
                        Step {step.step}
                      </Badge>
                      <div className="flex-1 space-y-3">
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                          {step.explanation}
                        </p>

                        {/* LaTeX Rendered Step */}
                        {step.latex && (
                          <div className="p-3 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-600 rounded-lg text-center">
                            <MathExpression
                              expression={step.latex}
                              fallback={step.result}
                            />
                          </div>
                        )}

                        {/* Plain Text Step */}
                        <code className="text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-2 rounded block font-mono">
                          {step.result}
                        </code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Examples */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-700">
            <h3 className="font-semibold mb-4 text-amber-700 dark:text-amber-300 flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Try these examples:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setEquation(example.equation);
                    setSolverType(example.type as any);
                    // Auto-solve after a short delay
                    setTimeout(() => solveEquation(), 100);
                  }}
                  className="p-4 text-left bg-white dark:bg-slate-900 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-all border border-amber-200 dark:border-amber-600 shadow-sm hover:shadow-md hover:scale-105"
                  aria-label={`Try example: ${example.description}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Badge
                      variant="outline"
                      className="text-xs bg-amber-100 dark:bg-amber-900/50 border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-300"
                    >
                      {example.type}
                    </Badge>
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      {example.description}
                    </span>
                  </div>

                  {/* LaTeX Preview */}
                  <div className="mb-2 p-2 bg-amber-50 dark:bg-amber-900/30 rounded border border-amber-200 dark:border-amber-600 text-center">
                    <MathExpression
                      expression={toLatex(example.equation)}
                      fallback={example.equation}
                      inline={true}
                    />
                  </div>

                  {/* Plain Text */}
                  <code className="text-xs text-amber-600 dark:text-amber-400 font-mono block">
                    {example.equation}
                  </code>
                </button>
              ))}
            </div>
          </div>

          {/* Help Text */}
          <div className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
              Quick Reference
            </h4>
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  Equation Syntax:
                </p>
                <p>• Use ^ for exponents: x^2, x^3</p>
                <p>• Use * for multiplication: 2*x, x*y</p>
                <p>• Functions: sin(x), cos(x), sqrt(x)</p>
                <p>• Constants: pi, e</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  Solver Types:
                </p>
                <p>• Solve: Find roots of equations</p>
                <p>• Derivative: Find rate of change</p>
                <p>• Simplify: Reduce expressions</p>
                <p>• Best for quadratic equations</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  Display Features:
                </p>
                <p>• LaTeX rendering for beautiful math</p>
                <p>• Plain text fallback available</p>
                <p>• Live preview as you type</p>
                <p>• Step-by-step formatted solutions</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </ToolDemo>
  );
};

export default EquationSolverDemo;
