import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  EquationSolver as EquationSolverLib,
  getMathInstance,
} from '../../../lib/math';
import { Label } from '../../../components/ui/label';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { SaveShareButtons } from './SaveShareButtons';
import { ToolResult } from '../../../lib/toolUtils';
import { MathExpression } from '../../../components/MathExpression';
import { useEquationSolver } from '../../../hooks/useMathWorker';
import { Loader2 } from 'lucide-react';

interface SolutionStep {
  step: string;
  explanation: string;
  result: string;
  latex?: string;
}

export function EquationSolver() {
  const [equation, setEquation] = useState('x^2 - 4');
  const [variable, setVariable] = useState('x');
  const [solverType, setSolverType] = useState<
    'solve' | 'derivative' | 'simplify' | 'evaluate'
  >('solve');
  const [result, setResult] = useState<string>('');
  const [resultLatex, setResultLatex] = useState<string>('');
  const [steps, setSteps] = useState<SolutionStep[]>([]);
  const [error, setError] = useState<string>('');
  const [lastSolution, setLastSolution] = useState<ToolResult | null>(null);

  // Use Web Worker hook for equation solving
  const {
    solve: solveWithWorker,
    isLoading,
    error: workerError,
    isUsingWorkers,
  } = useEquationSolver();

  // Convert mathematical expressions to LaTeX format
  const toLatex = (expression: string): string => {
    let latex = expression;

    // Replace common mathematical notation
    latex = latex.replace(/\*\*/g, '^'); // ** to ^
    latex = latex.replace(/\*/g, ' \\cdot '); // * to \cdot
    latex = latex.replace(/\^(\w+)/g, '^{$1}'); // x^2 to x^{2}
    latex = latex.replace(/\^(\d+)/g, '^{$1}'); // x^2 to x^{2}
    latex = latex.replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}'); // sqrt() to \sqrt{}
    latex = latex.replace(/sin\(([^)]+)\)/g, '\\sin($1)'); // sin() to \sin()
    latex = latex.replace(/cos\(([^)]+)\)/g, '\\cos($1)'); // cos() to \cos()
    latex = latex.replace(/tan\(([^)]+)\)/g, '\\tan($1)'); // tan() to \tan()
    latex = latex.replace(/log\(([^)]+)\)/g, '\\log($1)'); // log() to \log()
    latex = latex.replace(/ln\(([^)]+)\)/g, '\\ln($1)'); // ln() to \ln()
    latex = latex.replace(/exp\(([^)]+)\)/g, 'e^{$1}'); // exp() to e^{}
    latex = latex.replace(/pi/g, '\\pi'); // pi to \pi
    latex = latex.replace(/infinity/g, '\\infty'); // infinity to \infty

    // Handle fractions (simple cases)
    latex = latex.replace(/(\w+)\/(\w+)/g, '\\frac{$1}{$2}');
    latex = latex.replace(/\(([^)]+)\)\/\(([^)]+)\)/g, '\\frac{$1}{$2}');

    // Handle subscripts for roots like x₁, x₂
    latex = latex.replace(/x₁/g, 'x_1');
    latex = latex.replace(/x₂/g, 'x_2');
    latex = latex.replace(/x₃/g, 'x_3');
    latex = latex.replace(/x₄/g, 'x_4');

    // Handle discriminant symbol
    latex = latex.replace(/Δ/g, '\\Delta');

    return latex;
  };

  const solveEquation = async () => {
    setError('');
    setResult('');
    setSteps([]);

    // Basic input validation
    if (!equation.trim()) {
      setError('Please enter an equation');
      return;
    }

    try {
      // Use Web Worker for computation if available, otherwise fallback to main thread
      const workerResult = await solveWithWorker(
        equation,
        variable,
        solverType as 'solve' | 'derivative' | 'simplify'
      );

      if (workerResult.error) {
        setError(workerResult.error);
        return;
      }

      // Process the result from worker
      const solution = workerResult.result;
      const solutionSteps: SolutionStep[] =
        workerResult.steps?.map((step, index) => ({
          step: (index + 1).toString(),
          explanation: step,
          result:
            index === (workerResult.steps?.length || 1) - 1
              ? solution.toString()
              : step,
          latex: toLatex(
            index === (workerResult.steps?.length || 1) - 1
              ? solution.toString()
              : step
          ),
        })) || [];

      // Handle evaluate case separately (not supported by worker yet)
      if (solverType === 'evaluate') {
        try {
          const valueToUse = variable === 'x' ? 1 : 0;
          const expr = equation.replace(
            new RegExp(variable, 'g'),
            valueToUse.toString()
          );
          const mathInstance = await getMathInstance();
          if (!mathInstance.loaded) {
            throw new Error('Math library not loaded');
          }
          const evalResult = mathInstance.math.evaluate(expr);

          setSteps([
            {
              step: '1',
              explanation: `Evaluating ${equation} with ${variable} = ${valueToUse}`,
              result: evalResult.toString(),
              latex: evalResult.toString(),
            },
          ]);

          const resultStr = evalResult.toString();
          const resultLatexStr = toLatex(resultStr);
          setResult(resultStr);
          setResultLatex(resultLatexStr);

          const toolResult: ToolResult = {
            toolId: 'solver',
            toolName: 'Equation Solver',
            input: { equation, variable, solverType },
            output: { result: resultStr, latex: resultLatexStr },
            timestamp: new Date(),
            steps: [
              {
                step: '1',
                explanation: `Evaluating ${equation} with ${variable} = ${valueToUse}`,
                result: resultStr,
                latex: resultLatexStr,
              },
            ],
          };
          setLastSolution(toolResult);
          return;
        } catch (err) {
          throw new Error('Could not evaluate expression');
        }
      }

      setSteps(solutionSteps);
      if (solution !== undefined) {
        const resultStr = solution.toString();
        const resultLatexStr = toLatex(resultStr);
        setResult(resultStr);
        setResultLatex(resultLatexStr);

        // Create tool result for saving/sharing
        const toolResult: ToolResult = {
          toolId: 'solver',
          toolName: 'Equation Solver',
          input: {
            equation,
            variable,
            solverType,
          },
          output: {
            result: resultStr,
            latex: resultLatexStr,
          },
          timestamp: new Date(),
          steps: solutionSteps,
        };

        setLastSolution(toolResult);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while solving');
    }
  };

  const solveQuadratic = (eq: string): SolutionStep[] => {
    const steps: SolutionStep[] = [];

    try {
      // Parse quadratic equation of form ax^2 + bx + c = 0
      // This is a simplified parser for demonstration
      const normalized = eq.replace(/\s/g, '').replace(/-/g, '+-');
      const terms = normalized.split('+').filter(t => t);

      let a = 0,
        b = 0,
        c = 0;

      for (const term of terms) {
        if (term.includes('x^2')) {
          const coeff = term.replace('x^2', '') || '1';
          a =
            coeff === '' || coeff === '+'
              ? 1
              : coeff === '-'
                ? -1
                : parseFloat(coeff);
        } else if (term.includes('x') && !term.includes('x^2')) {
          const coeff = term.replace('x', '') || '1';
          b =
            coeff === '' || coeff === '+'
              ? 1
              : coeff === '-'
                ? -1
                : parseFloat(coeff);
        } else if (term && !term.includes('x')) {
          c = parseFloat(term);
        }
      }

      steps.push({
        step: '1',
        explanation: 'Identify coefficients in ax² + bx + c = 0',
        result: `a = ${a}, b = ${b}, c = ${c}`,
        latex: `a = ${a}, b = ${b}, c = ${c}`,
      });

      const discriminant = b * b - 4 * a * c;

      steps.push({
        step: '2',
        explanation: 'Calculate discriminant: b² - 4ac',
        result: `Δ = ${b}² - 4(${a})(${c}) = ${discriminant}`,
        latex: `\\Delta = ${b}^2 - 4(${a})(${c}) = ${discriminant}`,
      });

      if (discriminant < 0) {
        steps.push({
          step: '3',
          explanation: 'Since discriminant < 0, there are no real roots',
          result: 'No real solutions',
          latex: '\\text{No real solutions}',
        });
        setResult('No real solutions');
        setResultLatex('\\text{No real solutions}');
      } else if (discriminant === 0) {
        const root = -b / (2 * a);
        steps.push({
          step: '3',
          explanation:
            'Since discriminant = 0, there is one repeated root: x = -b/(2a)',
          result: `x = ${root}`,
          latex: `x = ${root}`,
        });
        setResult(root.toString());
        setResultLatex(root.toString());
      } else {
        const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);

        steps.push({
          step: '3',
          explanation: 'Apply quadratic formula: x = (-b ± √Δ)/(2a)',
          result: `x₁ = ${root1.toFixed(4)}, x₂ = ${root2.toFixed(4)}`,
          latex: `x_1 = ${root1.toFixed(4)}, x_2 = ${root2.toFixed(4)}`,
        });
        const resultStr = `x₁ = ${root1.toFixed(4)}, x₂ = ${root2.toFixed(4)}`;
        setResult(resultStr);
        setResultLatex(`x_1 = ${root1.toFixed(4)}, x_2 = ${root2.toFixed(4)}`);
      }
    } catch (err) {
      steps.push({
        step: 'Error',
        explanation: 'Could not parse quadratic equation',
        result: 'Please check equation format',
      });
    }

    return steps;
  };

  const findRootsNumerically = async (
    eq: string,
    variable: string
  ): Promise<number[]> => {
    const roots: number[] = [];

    try {
      const mathInstance = await getMathInstance();
      if (!mathInstance.loaded) {
        return roots;
      }

      // Simple numerical method - check integer values from -10 to 10
      for (let i = -10; i <= 10; i++) {
        try {
          const expr = eq.replace(new RegExp(variable, 'g'), i.toString());
          const result = mathInstance.math.evaluate(expr);
          if (Math.abs(result) < 0.0001) {
            // Close to zero
            roots.push(i);
          }
        } catch (err) {
          // Continue checking other values
        }
      }
    } catch (err) {
      console.error('Error in numerical root finding:', err);
    }

    return roots;
  };

  const examples = [
    { type: 'solve', equation: 'x^2 - 4', description: 'Quadratic equation' },
    {
      type: 'solve',
      equation: 'x^2 + 2*x - 3',
      description: 'Quadratic with linear term',
    },
    {
      type: 'derivative',
      equation: 'x^3 + 2*x^2 + x',
      description: 'Polynomial derivative',
    },
    {
      type: 'derivative',
      equation: 'sin(x)',
      description: 'Trigonometric derivative',
    },
    {
      type: 'simplify',
      equation: '(x + 2)^2',
      description: 'Expand expression',
    },
    {
      type: 'simplify',
      equation: 'x^2 + 2*x + 1',
      description: 'Factor expression',
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Solver Type Selection */}
      <Card className='p-4'>
        <Label
          className='text-base font-semibold mb-3 block'
          data-testid='equation-solver-type-label'
        >
          Solver Type
        </Label>
        <div className='flex flex-wrap gap-2'>
          {[
            { key: 'solve', label: 'Solve Equation' },
            { key: 'derivative', label: 'Find Derivative' },
            { key: 'simplify', label: 'Simplify' },
            { key: 'evaluate', label: 'Evaluate' },
          ].map(type => (
            <Badge
              key={type.key}
              variant={solverType === type.key ? 'default' : 'outline'}
              className='cursor-pointer px-3 py-1'
              onClick={() => setSolverType(type.key as any)}
            >
              {type.label}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Input Interface */}
      <Card className='p-6'>
        <div className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='md:col-span-2'>
              <Label htmlFor='equation'>
                {solverType === 'solve'
                  ? 'Equation (set equal to 0)'
                  : 'Expression'}
              </Label>
              <Input
                id='equation'
                value={equation}
                onChange={e => setEquation(e.target.value)}
                placeholder='e.g., x^2 - 4, sin(x), (x+1)^2'
                className='font-mono'
              />
            </div>
            <div>
              <Label htmlFor='variable'>Variable</Label>
              <Input
                id='variable'
                value={variable}
                onChange={e => setVariable(e.target.value)}
                placeholder='x'
                className='font-mono'
              />
            </div>
          </div>

          <Button
            onClick={solveEquation}
            className='w-full'
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                {isUsingWorkers ? 'Computing (Web Worker)...' : 'Computing...'}
              </>
            ) : (
              <>
                {solverType === 'solve'
                  ? 'Solve'
                  : solverType === 'derivative'
                    ? 'Find Derivative'
                    : solverType === 'simplify'
                      ? 'Simplify'
                      : 'Evaluate'}
              </>
            )}
          </Button>

          {(error || workerError) && (
            <div className='p-3 bg-destructive/10 border border-destructive/20 rounded-md'>
              <p className='text-destructive text-sm'>{error || workerError}</p>
            </div>
          )}

          {/* Performance indicator */}
          {isUsingWorkers && (
            <div className='p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md'>
              <p className='text-green-700 dark:text-green-300 text-xs flex items-center gap-1'>
                <span className='w-2 h-2 bg-green-500 rounded-full'></span>
                Using Web Workers for enhanced performance
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Results */}
      {result && (
        <Card className='p-6'>
          <h3
            className='font-semibold mb-3'
            data-testid='equation-solver-result-heading'
          >
            Result
          </h3>

          {/* LaTeX Rendered Result */}
          <div className='mb-4'>
            <Label
              className='text-sm font-medium text-muted-foreground mb-2 block'
              data-testid='equation-solver-formatted-label'
            >
              Formatted Result
            </Label>
            <div className='p-4 bg-background border rounded-lg text-center'>
              <MathExpression expression={resultLatex || result} />
            </div>
          </div>

          {/* Plain Text Result */}
          <div>
            <Label
              className='text-sm font-medium text-muted-foreground mb-2 block'
              data-testid='equation-solver-plaintext-label'
            >
              Plain Text
            </Label>
            <div className='p-4 bg-muted rounded-lg'>
              <code className='text-lg'>{result}</code>
            </div>
          </div>
        </Card>
      )}

      {/* Step-by-step solution */}
      {steps.length > 0 && (
        <Card className='p-6'>
          <h3 className='font-semibold mb-3'>Step-by-step Solution</h3>
          <div className='space-y-4'>
            {steps.map((step, index) => (
              <div key={index} className='border-l-2 border-primary pl-4'>
                <div className='flex items-start gap-2'>
                  <Badge variant='outline' className='text-xs'>
                    Step {step.step}
                  </Badge>
                  <div className='flex-1 space-y-2'>
                    <p className='text-sm text-muted-foreground'>
                      {step.explanation}
                    </p>

                    {/* LaTeX Rendered Step */}
                    {step.latex && (
                      <div className='p-3 bg-background border rounded-lg text-center'>
                        <MathExpression expression={step.latex} />
                      </div>
                    )}

                    {/* Plain Text Step */}
                    <code className='text-sm bg-muted px-2 py-1 rounded block'>
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
      <Card className='p-4'>
        <h3 className='font-semibold mb-3'>Examples</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => {
                setEquation(example.equation);
                setSolverType(example.type as any);
              }}
              className='p-3 text-left bg-muted/50 hover:bg-muted rounded-lg transition-colors'
            >
              <div className='flex items-center gap-2 mb-1'>
                <Badge variant='outline' className='text-xs'>
                  {example.type}
                </Badge>
                <span className='text-sm font-medium'>
                  {example.description}
                </span>
              </div>
              <code className='text-xs text-muted-foreground'>
                {example.equation}
              </code>
            </button>
          ))}
        </div>
      </Card>

      {/* Save/Share Section */}
      {lastSolution && result && !error && (
        <Card className='p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='font-semibold'>Solution</h3>
              <p className='text-sm text-muted-foreground'>
                {solverType === 'solve'
                  ? 'Equation solved'
                  : solverType === 'derivative'
                    ? 'Derivative computed'
                    : solverType === 'simplify'
                      ? 'Expression simplified'
                      : 'Expression evaluated'}
              </p>
            </div>
            <SaveShareButtons result={lastSolution} />
          </div>
        </Card>
      )}
    </div>
  );
}
