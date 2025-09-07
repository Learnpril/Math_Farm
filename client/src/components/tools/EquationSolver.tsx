import { useState } from "react";
import { evaluate, parse, derivative, simplify } from "mathjs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { SaveShareButtons } from "./SaveShareButtons";
import { ToolResult } from "../../lib/toolUtils";

interface SolutionStep {
  step: string;
  explanation: string;
  result: string;
}

export function EquationSolver() {
  const [equation, setEquation] = useState("x^2 - 4");
  const [variable, setVariable] = useState("x");
  const [solverType, setSolverType] = useState<
    "solve" | "derivative" | "simplify" | "evaluate"
  >("solve");
  const [result, setResult] = useState<string>("");
  const [steps, setSteps] = useState<SolutionStep[]>([]);
  const [error, setError] = useState<string>("");
  const [lastSolution, setLastSolution] = useState<ToolResult | null>(null);

  const solveEquation = () => {
    setError("");
    setResult("");
    setSteps([]);

    try {
      let solution: any;
      let solutionSteps: SolutionStep[] = [];

      switch (solverType) {
        case "solve":
          // For simple quadratic equations, provide step-by-step solution
          if (equation.includes("x^2") && !equation.includes("x^3")) {
            solutionSteps = solveQuadratic(equation);
          } else {
            // For other equations, try to evaluate at different points
            solutionSteps.push({
              step: "1",
              explanation: "Attempting to find roots numerically",
              result: "Checking various values...",
            });

            // Simple root finding for basic equations
            const roots = findRootsNumerically(equation, variable);
            solution =
              roots.length > 0 ? roots.join(", ") : "No real roots found";
          }
          break;

        case "derivative":
          try {
            const expr = parse(equation);
            const derivative_result = derivative(expr, variable);
            solution = derivative_result.toString();
            solutionSteps.push({
              step: "1",
              explanation: `Taking the derivative of ${equation} with respect to ${variable}`,
              result: solution,
            });
          } catch (err) {
            throw new Error("Could not compute derivative");
          }
          break;

        case "simplify":
          try {
            const expr = parse(equation);
            const simplified = simplify(expr);
            solution = simplified.toString();
            solutionSteps.push({
              step: "1",
              explanation: `Simplifying ${equation}`,
              result: solution,
            });
          } catch (err) {
            throw new Error("Could not simplify expression");
          }
          break;

        case "evaluate":
          try {
            // Replace variable with a default value for evaluation
            const valueToUse = variable === "x" ? 1 : 0;
            const expr = equation.replace(
              new RegExp(variable, "g"),
              valueToUse.toString()
            );
            solution = evaluate(expr);
            solutionSteps.push({
              step: "1",
              explanation: `Evaluating ${equation} with ${variable} = ${valueToUse}`,
              result: solution.toString(),
            });
          } catch (err) {
            throw new Error("Could not evaluate expression");
          }
          break;
      }

      setSteps(solutionSteps);
      if (solution !== undefined) {
        const resultStr = solution.toString();
        setResult(resultStr);

        // Create tool result for saving/sharing
        const toolResult: ToolResult = {
          toolId: "solver",
          toolName: "Equation Solver",
          input: {
            equation,
            variable,
            solverType,
          },
          output: {
            result: resultStr,
          },
          timestamp: new Date(),
          steps: solutionSteps,
        };

        setLastSolution(toolResult);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while solving");
    }
  };

  const solveQuadratic = (eq: string): SolutionStep[] => {
    const steps: SolutionStep[] = [];

    try {
      // Parse quadratic equation of form ax^2 + bx + c = 0
      // This is a simplified parser for demonstration
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
      });

      const discriminant = b * b - 4 * a * c;

      steps.push({
        step: "2",
        explanation: "Calculate discriminant: b² - 4ac",
        result: `Δ = ${b}² - 4(${a})(${c}) = ${discriminant}`,
      });

      if (discriminant < 0) {
        steps.push({
          step: "3",
          explanation: "Since discriminant < 0, there are no real roots",
          result: "No real solutions",
        });
        setResult("No real solutions");
      } else if (discriminant === 0) {
        const root = -b / (2 * a);
        steps.push({
          step: "3",
          explanation:
            "Since discriminant = 0, there is one repeated root: x = -b/(2a)",
          result: `x = ${root}`,
        });
        setResult(root.toString());
      } else {
        const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);

        steps.push({
          step: "3",
          explanation: "Apply quadratic formula: x = (-b ± √Δ)/(2a)",
          result: `x₁ = ${root1.toFixed(4)}, x₂ = ${root2.toFixed(4)}`,
        });
        setResult(`x₁ = ${root1.toFixed(4)}, x₂ = ${root2.toFixed(4)}`);
      }
    } catch (err) {
      steps.push({
        step: "Error",
        explanation: "Could not parse quadratic equation",
        result: "Please check equation format",
      });
    }

    return steps;
  };

  const findRootsNumerically = (eq: string, variable: string): number[] => {
    const roots: number[] = [];

    // Simple numerical method - check integer values from -10 to 10
    for (let i = -10; i <= 10; i++) {
      try {
        const expr = eq.replace(new RegExp(variable, "g"), i.toString());
        const result = evaluate(expr);
        if (Math.abs(result) < 0.0001) {
          // Close to zero
          roots.push(i);
        }
      } catch (err) {
        // Continue checking other values
      }
    }

    return roots;
  };

  const examples = [
    { type: "solve", equation: "x^2 - 4", description: "Quadratic equation" },
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
      equation: "x^2 + 2*x + 1",
      description: "Factor expression",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Solver Type Selection */}
      <Card className="p-4">
        <Label className="text-base font-semibold mb-3 block">
          Solver Type
        </Label>
        <div className="flex flex-wrap gap-2">
          {[
            { key: "solve", label: "Solve Equation" },
            { key: "derivative", label: "Find Derivative" },
            { key: "simplify", label: "Simplify" },
            { key: "evaluate", label: "Evaluate" },
          ].map((type) => (
            <Badge
              key={type.key}
              variant={solverType === type.key ? "default" : "outline"}
              className="cursor-pointer px-3 py-1"
              onClick={() => setSolverType(type.key as any)}
            >
              {type.label}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Input Interface */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="equation">
                {solverType === "solve"
                  ? "Equation (set equal to 0)"
                  : "Expression"}
              </Label>
              <Input
                id="equation"
                value={equation}
                onChange={(e) => setEquation(e.target.value)}
                placeholder="e.g., x^2 - 4, sin(x), (x+1)^2"
                className="font-mono"
              />
            </div>
            <div>
              <Label htmlFor="variable">Variable</Label>
              <Input
                id="variable"
                value={variable}
                onChange={(e) => setVariable(e.target.value)}
                placeholder="x"
                className="font-mono"
              />
            </div>
          </div>

          <Button onClick={solveEquation} className="w-full">
            {solverType === "solve"
              ? "Solve"
              : solverType === "derivative"
              ? "Find Derivative"
              : solverType === "simplify"
              ? "Simplify"
              : "Evaluate"}
          </Button>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Results */}
      {result && (
        <Card className="p-6">
          <h3 className="font-semibold mb-3">Result</h3>
          <div className="p-4 bg-muted rounded-lg">
            <code className="text-lg">{result}</code>
          </div>
        </Card>
      )}

      {/* Step-by-step solution */}
      {steps.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-3">Step-by-step Solution</h3>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={index} className="border-l-2 border-primary pl-4">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs">
                    Step {step.step}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">
                      {step.explanation}
                    </p>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {step.result}
                    </code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Examples */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Examples</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => {
                setEquation(example.equation);
                setSolverType(example.type as any);
              }}
              className="p-3 text-left bg-muted/50 hover:bg-muted rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {example.type}
                </Badge>
                <span className="text-sm font-medium">
                  {example.description}
                </span>
              </div>
              <code className="text-xs text-muted-foreground">
                {example.equation}
              </code>
            </button>
          ))}
        </div>
      </Card>

      {/* Save/Share Section */}
      {lastSolution && result && !error && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Solution</h3>
              <p className="text-sm text-muted-foreground">
                {solverType === "solve"
                  ? "Equation solved"
                  : solverType === "derivative"
                  ? "Derivative computed"
                  : solverType === "simplify"
                  ? "Expression simplified"
                  : "Expression evaluated"}
              </p>
            </div>
            <SaveShareButtons result={lastSolution} />
          </div>
        </Card>
      )}
    </div>
  );
}
