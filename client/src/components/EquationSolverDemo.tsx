import React, { useState, useCallback, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import ToolDemo from './ToolDemo';
import { MathExpression } from './MathExpression';
import { Zap, BookOpen, Calculator } from 'lucide-react';
import {
  equationSolver,
  loadMathJS,
  SolutionStep,
  SolverType,
} from '../lib/math';

export interface EquationSolverDemoProps {
  className?: string;
}

export const EquationSolverDemo: React.FC<EquationSolverDemoProps> = ({
  className = '',
}) => {
  const [equation, setEquation] = useState('x^2 + 4*x + 4');
  const [variable, setVariable] = useState('x');
  const [solverType, setSolverType] = useState<SolverType>('solve');
  const [result, setResult] = useState('');
  const [resultLatex, setResultLatex] = useState('');
  const [steps, setSteps] = useState<SolutionStep[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use utility function for LaTeX conversion
  const toLatex = useCallback((expression: string): string => {
    return equationSolver.toLatex(expression);
  }, []);

  // Load math.js library using utility
  const loadMathLibrary = useCallback(async () => {
    try {
      const result = await loadMathJS();
      if (result.loaded) {
        setIsLoaded(true);
        setError(null);
        console.log('Math.js loaded successfully for equation solver');

        // Test basic math functionality
        try {
          const testResult = result.mathInstance.evaluate('2 + 2');
          console.log('Math.js test calculation: 2 + 2 =', testResult);
        } catch (testErr) {
          console.warn('Math.js test failed:', testErr);
        }
      } else {
        setError(result.error || 'Failed to load math library');
        console.error('Failed to load math.js:', result.error);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Error loading equation solver library: ${errorMsg}`);
      console.error('Math library loading error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Use utility function for quadratic solving
  const solveQuadratic = useCallback(
    (eq: string): SolutionStep[] => {
      const result = equationSolver.solveQuadratic(eq, variable);
      return result.steps;
    },
    [variable]
  );

  // Solve equation using utility
  const solveEquation = useCallback(() => {
    if (!equation.trim()) return;

    // Check if math library is loaded
    if (!isLoaded) {
      setError('Math library is still loading. Please wait and try again.');
      return;
    }

    setError(null);
    setResult('');
    setResultLatex('');
    setSteps([]);

    try {
      const mathResult = equationSolver.solve(equation, variable, solverType);

      if (mathResult.error) {
        setError(mathResult.error);
        return;
      }

      const resultStr = mathResult.result.toString();
      setResult(resultStr);
      setResultLatex(toLatex(resultStr));

      // Extract detailed steps from metadata
      if (mathResult.metadata?.detailedSteps) {
        setSteps(mathResult.metadata.detailedSteps);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(`Equation solving failed: ${errorMsg}`);
      console.error('Equation solver error:', error);
    }
  }, [equation, variable, solverType, toLatex, isLoaded]);

  // Handle equation change with auto-solve for simple cases
  const handleEquationChange = useCallback(
    (value: string) => {
      setEquation(value);

      // Auto-solve for simple quadratic equations using utility
      if (value.includes('x^2') && value.length > 3 && isLoaded) {
        setTimeout(() => {
          try {
            const steps = solveQuadratic(value);
            setSteps(steps);
            const lastStep = steps[steps.length - 1];
            setResult(lastStep.result);
            setResultLatex(lastStep.latex || toLatex(lastStep.result));
          } catch (err) {
            // Ignore auto-solve errors
            console.warn('Auto-solve error:', err);
          }
        }, 500);
      }
    },
    [solveQuadratic, toLatex, isLoaded]
  );

  // Preset examples from utility
  const examples = equationSolver.getExamples();

  // Load math.js on mount
  useEffect(() => {
    loadMathLibrary();
  }, [loadMathLibrary]);

  return (
    <ToolDemo
      title='Equation Solver'
      description='Solve algebraic equations, find derivatives, and simplify expressions with step-by-step solutions.'
      demoType='equation-solver'
      interactive={true}
      error={error}
      isLoading={isLoading}
      className={className}
    >
      {isLoaded && !error && (
        <div className='space-y-6'>
          {/* Solver Type Selection */}
          <div className='bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700'>
            <Label className='text-base font-semibold mb-3 block text-purple-700 dark:text-purple-300'>
              Solver Type
            </Label>
            <div className='flex flex-wrap gap-2'>
              {[
                { key: 'solve', label: 'Solve Equation', icon: Calculator },
                { key: 'derivative', label: 'Find Derivative', icon: Zap },
                { key: 'simplify', label: 'Simplify', icon: BookOpen },
              ].map(type => {
                const IconComponent = type.icon;
                return (
                  <Button
                    key={type.key}
                    variant={solverType === type.key ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setSolverType(type.key as any)}
                    className={`flex items-center gap-2 transition-all ${
                      solverType === type.key
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'hover:bg-primary/10 hover:border-primary/50'
                    }`}
                    aria-pressed={solverType === type.key}
                  >
                    <IconComponent className='h-4 w-4' />
                    {type.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Input Interface */}
          <div className='bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl p-6 border shadow-inner'>
            <div className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='md:col-span-2'>
                  <Label
                    htmlFor='equation-input'
                    className='text-sm font-medium mb-2 block'
                  >
                    {solverType === 'solve'
                      ? 'Equation (set equal to 0)'
                      : 'Expression'}
                  </Label>
                  <Input
                    id='equation-input'
                    value={equation}
                    onChange={e => handleEquationChange(e.target.value)}
                    placeholder='e.g., x^2 - 4, sin(x), (x+1)^2'
                    className='font-mono text-lg bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3'
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        solveEquation();
                      }
                    }}
                  />
                </div>
                <div>
                  <Label
                    htmlFor='variable-input'
                    className='text-sm font-medium mb-2 block'
                  >
                    Variable
                  </Label>
                  <Input
                    id='variable-input'
                    value={variable}
                    onChange={e => setVariable(e.target.value)}
                    placeholder='x'
                    className='font-mono text-lg bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3'
                  />
                </div>
              </div>

              {/* LaTeX Preview */}
              {equation.trim() && (
                <div className='p-4 bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-700 rounded-lg'>
                  <Label className='text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block'>
                    Preview
                  </Label>
                  <div className='text-center p-2 bg-slate-50 dark:bg-slate-900 rounded border'>
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
                className='w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-md hover:shadow-lg transition-all'
              >
                <Zap className='mr-2 h-5 w-5' />
                {solverType === 'solve'
                  ? 'Solve Equation'
                  : solverType === 'derivative'
                    ? 'Find Derivative'
                    : 'Simplify Expression'}
              </Button>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className='bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700'>
              <h3 className='font-semibold mb-3 text-green-700 dark:text-green-300 flex items-center gap-2'>
                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                Result
              </h3>

              {/* LaTeX Rendered Result */}
              {resultLatex && (
                <div className='mb-4'>
                  <Label className='text-sm font-medium text-green-600 dark:text-green-400 mb-2 block'>
                    Formatted Result
                  </Label>
                  <div className='p-4 bg-white dark:bg-slate-900 border border-green-200 dark:border-green-600 rounded-lg text-center'>
                    <MathExpression
                      expression={resultLatex}
                      fallback={result}
                    />
                  </div>
                </div>
              )}

              {/* Plain Text Result */}
              <div>
                <Label className='text-sm font-medium text-green-600 dark:text-green-400 mb-2 block'>
                  Plain Text
                </Label>
                <div className='p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-600 rounded-lg'>
                  <code className='text-xl font-mono font-bold text-green-700 dark:text-green-300'>
                    {result}
                  </code>
                </div>
              </div>
            </div>
          )}

          {/* Step-by-step solution */}
          {steps.length > 0 && (
            <div className='bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700'>
              <h3 className='font-semibold mb-4 text-blue-700 dark:text-blue-300 flex items-center gap-2'>
                <BookOpen className='h-5 w-5' />
                Step-by-step Solution
              </h3>
              <div className='space-y-4'>
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className='border-l-4 border-blue-400 pl-4 bg-white dark:bg-slate-900 p-4 rounded-r-lg shadow-sm'
                  >
                    <div className='flex items-start gap-3'>
                      <Badge
                        variant='outline'
                        className='text-xs bg-blue-100 dark:bg-blue-900/50 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                      >
                        Step {step.step}
                      </Badge>
                      <div className='flex-1 space-y-3'>
                        <p className='text-sm text-blue-600 dark:text-blue-400 font-medium'>
                          {step.explanation}
                        </p>

                        {/* LaTeX Rendered Step */}
                        {step.latex && (
                          <div className='p-3 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-600 rounded-lg text-center'>
                            <MathExpression
                              expression={step.latex}
                              fallback={step.result}
                            />
                          </div>
                        )}

                        {/* Plain Text Step */}
                        <code className='text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-2 rounded block font-mono'>
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
          <div className='bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-700'>
            <h3 className='font-semibold mb-4 text-amber-700 dark:text-amber-300 flex items-center gap-2'>
              <Calculator className='h-5 w-5' />
              Try these examples:
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              {examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setEquation(example.equation);
                    setSolverType(example.type as any);
                    // Auto-solve after a short delay
                    setTimeout(() => solveEquation(), 100);
                  }}
                  className='p-4 text-left bg-white dark:bg-slate-900 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-all border border-amber-200 dark:border-amber-600 shadow-sm hover:shadow-md hover:scale-105'
                  aria-label={`Try example: ${example.description}`}
                >
                  <div className='flex items-center gap-2 mb-3'>
                    <Badge
                      variant='outline'
                      className='text-xs bg-amber-100 dark:bg-amber-900/50 border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-300'
                    >
                      {example.type}
                    </Badge>
                    <span className='text-sm font-medium text-amber-700 dark:text-amber-300'>
                      {example.description}
                    </span>
                  </div>

                  {/* LaTeX Preview */}
                  <div className='mb-2 p-2 bg-amber-50 dark:bg-amber-900/30 rounded border border-amber-200 dark:border-amber-600 text-center'>
                    <MathExpression
                      expression={toLatex(example.equation)}
                      fallback={example.equation}
                      inline={true}
                    />
                  </div>

                  {/* Plain Text */}
                  <code className='text-xs text-amber-600 dark:text-amber-400 font-mono block'>
                    {example.equation}
                  </code>
                </button>
              ))}
            </div>
          </div>

          {/* Help Text */}
          <div className='p-4 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 rounded-lg border border-slate-200 dark:border-slate-700'>
            <h4 className='text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2'>
              <div className='w-2 h-2 bg-slate-500 rounded-full'></div>
              Quick Reference
            </h4>
            <div className='text-xs text-slate-600 dark:text-slate-400 space-y-2 grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='space-y-1'>
                <p className='font-medium text-slate-700 dark:text-slate-300'>
                  Equation Syntax:
                </p>
                <p>• Use ^ for exponents: x^2, x^3</p>
                <p>• Use * for multiplication: 2*x, x*y</p>
                <p>• Functions: sin(x), cos(x), sqrt(x)</p>
                <p>• Constants: pi, e</p>
              </div>
              <div className='space-y-1'>
                <p className='font-medium text-slate-700 dark:text-slate-300'>
                  Solver Types:
                </p>
                <p>• Solve: Find roots of equations</p>
                <p>• Derivative: Find rate of change</p>
                <p>• Simplify: Reduce expressions</p>
                <p>• Best for quadratic equations</p>
              </div>
              <div className='space-y-1'>
                <p className='font-medium text-slate-700 dark:text-slate-300'>
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
