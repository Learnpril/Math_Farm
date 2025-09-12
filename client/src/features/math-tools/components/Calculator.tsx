import { useState, useCallback, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card } from '../../../components/ui/card';
import { SaveShareButtons } from './SaveShareButtons';
import { ToolResult } from '../../../lib/toolUtils';
import {
  Calculator as CalculatorIcon,
  History,
  Trash2,
  Loader2,
} from 'lucide-react';
import {
  calculatorUtils,
  loadMathJS,
  CalculationHistory,
  AngleMode,
} from '../../../lib/math';
import { useCalculatorWorker } from '../../../hooks/useMathWorker';
import { useToolErrorHandler } from './ToolErrorBoundary';
import { ErrorMessage, MathErrorMessage } from '../../../lib';

export function Calculator() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [memory, setMemory] = useState(0);

  // Enhanced error handling
  const {
    error,
    errorMetadata,
    handleMathError,
    handleValidationError,
    resetError,
    canRetry,
  } = useToolErrorHandler('Calculator');
  const [showScientific, setShowScientific] = useState(false);
  const [angleMode, setAngleMode] = useState<AngleMode>('deg');
  const [lastCalculation, setLastCalculation] = useState<ToolResult | null>(
    null
  );

  // Use Web Worker hook for calculator operations
  const {
    evaluate: evaluateWithWorker,
    isLoading: workerLoading,
    error: workerError,
    isUsingWorkers,
  } = useCalculatorWorker();

  // Load math.js library using utility
  const loadMathLibrary = useCallback(async () => {
    try {
      const result = await loadMathJS();
      if (result.loaded) {
        setIsLoaded(true);
        setError(null);
      } else {
        setError(result.error || 'Failed to load math library');
      }
    } catch (err) {
      if (err instanceof Error) {
        handleMathError(err, 'library_load', 'calculator initialization');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calculate expression with angle mode support using Web Worker
  const calculate = useCallback(
    async (expr: string) => {
      if (!expr.trim()) return;

      try {
        // Reset any previous errors
        resetError();

        // Use Web Worker for computation if available, otherwise fallback to main thread
        const workerResult = await evaluateWithWorker(expr, angleMode);

        if (workerResult.error) {
          const error = new Error(workerResult.error);
          const errorResult = handleMathError(error, 'evaluate', expr);
          setResult(`Error: ${errorResult.error || workerResult.error}`);
          setLastCalculation(null);
          return null;
        }

        const resultStr = workerResult.result;
        setResult(resultStr);

        // Add to history using utility
        setHistory(prev =>
          calculatorUtils.history.addToHistory(expr, resultStr, prev)
        );

        // Create tool result for saving/sharing
        const toolResult: ToolResult = {
          toolId: 'calculator',
          toolName: 'Advanced Calculator',
          input: { expression: expr, angleMode },
          output: { result: resultStr },
          timestamp: new Date(),
        };

        setLastCalculation(toolResult);

        return resultStr;
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error('Calculation failed');
        const errorResult = handleMathError(errorObj, 'calculate', expr);
        setResult(`Error: ${errorResult.error || errorObj.message}`);
        setLastCalculation(null);
        return null;
      }
    },
    [angleMode, evaluateWithWorker]
  );

  // Memory functions using utilities
  const memoryAdd = useCallback(() => {
    const currentResult = parseFloat(result);
    if (!isNaN(currentResult)) {
      const newMemory = calculatorUtils.memory.add(currentResult);
      setMemory(newMemory);
    }
  }, [result]);

  const memorySubtract = useCallback(() => {
    const currentResult = parseFloat(result);
    if (!isNaN(currentResult)) {
      const newMemory = calculatorUtils.memory.subtract(currentResult);
      setMemory(newMemory);
    }
  }, [result]);

  const memoryRecall = useCallback(() => {
    const memoryValue = calculatorUtils.memory.recall();
    setExpression(memoryValue.toString());
    setResult(memoryValue.toString());
    setMemory(memoryValue);
  }, []);

  const memoryClear = useCallback(() => {
    const newMemory = calculatorUtils.memory.clear();
    setMemory(newMemory);
  }, []);

  // Handle expression change with real-time calculation
  const handleExpressionChange = useCallback(
    async (value: string) => {
      setExpression(value);

      // For real-time calculation, use main thread to avoid worker overhead
      // Only calculate if expression looks complete (no trailing operators)
      if (!/[+\-*/^(]$/.test(value.trim()) && value.trim()) {
        try {
          const realTimeResult = calculatorUtils.evaluate(value, angleMode);
          if (realTimeResult.result && !realTimeResult.error) {
            setResult(realTimeResult.result.toString());
          } else {
            setResult('');
          }
        } catch (error) {
          setResult('');
        }
      } else {
        setResult('');
      }
    },
    [angleMode]
  );

  // Handle button input
  const handleButtonInput = useCallback(
    (value: string) => {
      if (value === '=') {
        calculate(expression);
      } else if (value === 'C') {
        setExpression('');
        setResult('');
      } else if (value === '⌫') {
        setExpression(prev => prev.slice(0, -1));
      } else if (value === 'M+') {
        memoryAdd();
      } else if (value === 'M-') {
        memorySubtract();
      } else if (value === 'MR') {
        memoryRecall();
      } else if (value === 'MC') {
        memoryClear();
      } else if (value === 'π') {
        setExpression(prev => prev + 'pi');
      } else if (value === 'e') {
        setExpression(prev => prev + 'e');
      } else if (value === 'x²') {
        setExpression(prev => prev + '^2');
      } else if (value === 'x³') {
        setExpression(prev => prev + '^3');
      } else if (value === '√') {
        setExpression(prev => prev + 'sqrt(');
      } else if (value === '∛') {
        setExpression(prev => prev + 'cbrt(');
      } else if (value === 'x!') {
        setExpression(prev => prev + '!');
      } else if (value === '1/x') {
        setExpression(prev => prev + '1/(');
      } else if (value === 'ln') {
        setExpression(prev => prev + 'log(');
      } else if (value === 'log') {
        setExpression(prev => prev + 'log10(');
      } else if (value === 'sin') {
        setExpression(prev => prev + 'sin(');
      } else if (value === 'cos') {
        setExpression(prev => prev + 'cos(');
      } else if (value === 'tan') {
        setExpression(prev => prev + 'tan(');
      } else if (value === 'sin⁻¹') {
        setExpression(prev => prev + 'asin(');
      } else if (value === 'cos⁻¹') {
        setExpression(prev => prev + 'acos(');
      } else if (value === 'tan⁻¹') {
        setExpression(prev => prev + 'atan(');
      } else if (value === 'sinh') {
        setExpression(prev => prev + 'sinh(');
      } else if (value === 'cosh') {
        setExpression(prev => prev + 'cosh(');
      } else if (value === 'tanh') {
        setExpression(prev => prev + 'tanh(');
      } else if (value === 'x^y') {
        setExpression(prev => prev + '^');
      } else if (value === 'EXP') {
        setExpression(prev => prev + 'e^');
      } else if (value === 'Ans') {
        setExpression(prev => prev + result);
      } else {
        setExpression(prev => prev + value);
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

  // Preset examples from utility
  const examples = calculatorUtils.getExamples();

  // Load math.js on mount
  useEffect(() => {
    loadMathLibrary();
  }, [loadMathLibrary]);

  // Basic calculator buttons
  const basicButtons = [
    ['C', '⌫', '(', ')'],
    ['1', '2', '3', '/'],
    ['4', '5', '6', '*'],
    ['7', '8', '9', '-'],
    ['0', '.', '=', '+'],
  ];

  // Scientific calculator buttons
  const scientificButtons = [
    ['sin', 'cos', 'tan', 'π'],
    ['sin⁻¹', 'cos⁻¹', 'tan⁻¹', 'e'],
    ['sinh', 'cosh', 'tanh', 'x²'],
    ['ln', 'log', '√', 'x³'],
    ['x^y', '1/x', 'x!', '∛'],
  ];

  // Memory buttons
  const memoryButtons = ['MC', 'MR', 'M+', 'M-'];

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <Card className='p-6'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
            <p className='text-muted-foreground'>Loading calculator...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className='space-y-6'>
        <Card className='p-6'>
          <div className='text-center'>
            <p className='text-destructive mb-4'>{error}</p>
            <Button onClick={loadMathJS} variant='outline'>
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Calculator Display */}
      <Card className='p-6'>
        <div className='space-y-3'>
          <Label htmlFor='calc-input' className='sr-only'>
            Mathematical expression
          </Label>
          <Input
            id='calc-input'
            type='text'
            value={expression}
            onChange={e => handleExpressionChange(e.target.value)}
            placeholder='Enter expression...'
            className='font-mono text-xl bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all'
            aria-label='Calculator input'
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                calculate(expression);
              }
            }}
          />

          {result && (
            <div
              className='p-4 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg font-mono text-2xl font-bold text-right text-primary dark:text-white shadow-sm'
              role='status'
              aria-live='polite'
              aria-label={`Result: ${result}`}
            >
              {workerLoading ? (
                <div className='flex items-center justify-end gap-2'>
                  <Loader2 className='h-5 w-5 animate-spin' />
                  <span className='text-lg'>Computing...</span>
                </div>
              ) : (
                `= ${result}`
              )}
            </div>
          )}

          {/* Enhanced Error display */}
          {error && (
            <MathErrorMessage
              operation='calculation'
              input={expression}
              error={errorMetadata?.userFriendlyMessage || error.message}
              fallbackResult={errorMetadata?.fallbackResult}
              onRetry={canRetry ? () => calculate(expression) : undefined}
              onDismiss={resetError}
              compact
            />
          )}

          {/* Worker Error display */}
          {workerError && !error && (
            <ErrorMessage
              message={workerError}
              title='Worker Error'
              suggestedActions={[
                'Try refreshing the page',
                'Use simpler calculations',
              ]}
              onDismiss={() => {
                /* Worker error handling */
              }}
              compact
            />
          )}

          {/* Performance indicator */}
          {isUsingWorkers && (
            <div className='p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md'>
              <p className='text-green-700 dark:text-green-300 text-xs flex items-center gap-1'>
                <span className='w-2 h-2 bg-green-500 rounded-full'></span>
                Using Web Workers for complex calculations
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Mode Controls */}
      <Card className='p-4'>
        <div className='flex flex-wrap gap-3 items-center justify-between'>
          <div className='flex gap-2'>
            <Button
              variant={angleMode === 'deg' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setAngleMode('deg')}
              aria-label='Set angle mode to degrees'
            >
              DEG
            </Button>
            <Button
              variant={angleMode === 'rad' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setAngleMode('rad')}
              aria-label='Set angle mode to radians'
            >
              RAD
            </Button>
          </div>
          <div className='flex gap-3 items-center'>
            <Button
              variant={showScientific ? 'default' : 'outline'}
              size='sm'
              onClick={() => setShowScientific(!showScientific)}
              aria-label='Toggle scientific functions'
            >
              SCI
            </Button>
            <div className='flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-800 rounded-md border'>
              <span className='text-xs font-medium text-muted-foreground'>
                Memory:
              </span>
              <span className='text-sm font-mono font-semibold text-primary'>
                {memory !== 0 ? memory.toFixed(4).replace(/\.?0+$/, '') : '0'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Memory Buttons */}
      <Card className='p-4'>
        <div className='grid grid-cols-4 gap-2'>
          {memoryButtons.map(btn => (
            <Button
              key={btn}
              variant='outline'
              size='sm'
              onClick={() => handleButtonInput(btn)}
              className='h-14 text-2xl font-mono font-bold'
              aria-label={`Memory ${btn}`}
            >
              {btn}
            </Button>
          ))}
        </div>
      </Card>

      {/* Scientific Functions (if enabled) */}
      {showScientific && (
        <Card className='p-4'>
          <h4 className='text-sm font-semibold text-muted-foreground mb-3'>
            Scientific Functions
          </h4>
          <div className='grid grid-cols-4 gap-2'>
            {scientificButtons.flat().map(btn => (
              <Button
                key={btn}
                variant='outline'
                size='sm'
                onClick={() => handleButtonInput(btn)}
                className='h-14 text-2xl font-mono font-bold'
                aria-label={`Scientific function ${btn}`}
              >
                {btn}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Basic Calculator Buttons */}
      <Card className='p-4'>
        <div className='grid grid-cols-4 gap-3'>
          {basicButtons.flat().map(btn => {
            const isEquals = btn === '=';
            const isClear = btn === 'C' || btn === '⌫';
            const isOperator = ['+', '-', '*', '/'].includes(btn);

            return (
              <Button
                key={btn}
                variant={
                  isEquals ? 'default' : isClear ? 'destructive' : 'outline'
                }
                onClick={() => handleButtonInput(btn)}
                className='h-14 text-4xl font-bold transition-all shadow-sm hover:shadow-md hover:scale-105'
                aria-label={
                  btn === '='
                    ? 'Calculate'
                    : btn === 'C'
                      ? 'Clear'
                      : btn === '⌫'
                        ? 'Backspace'
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
      <Card className='p-4'>
        <div className='flex items-center gap-2 mb-3'>
          <CalculatorIcon className='h-4 w-4 text-primary' />
          <span className='text-sm font-semibold text-primary'>
            Try these examples:
          </span>
        </div>
        <div className='flex flex-wrap gap-2'>
          {examples.map(example => (
            <Button
              key={example}
              variant='outline'
              size='sm'
              onClick={() => handleExpressionChange(example)}
              className='text-xs font-mono'
              aria-label={`Try example: ${example}`}
            >
              {example}
            </Button>
          ))}
        </div>
      </Card>

      {/* History */}
      <Card className='p-4'>
        <div className='flex items-center justify-between mb-3'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setShowHistory(!showHistory)}
            className='flex items-center gap-2'
            aria-expanded={showHistory}
            aria-controls='calculation-history'
          >
            <History className='h-4 w-4' />
            History ({history.length})
          </Button>
          {history.length > 0 && (
            <Button
              variant='ghost'
              size='sm'
              onClick={clearHistory}
              className='flex items-center gap-1 text-destructive'
              aria-label='Clear calculation history'
            >
              <Trash2 className='h-3 w-3' />
              Clear
            </Button>
          )}
        </div>

        {showHistory && history.length > 0 && (
          <div
            id='calculation-history'
            className='max-h-40 overflow-y-auto space-y-2 p-3 bg-background rounded-lg border shadow-inner'
            role='log'
            aria-label='Calculation history'
          >
            {history.map(item => (
              <button
                key={item.timestamp}
                onClick={() => handleHistoryClick(item)}
                className='w-full text-left p-3 hover:bg-muted rounded-lg text-sm font-mono transition-all border border-transparent hover:border-primary/20 shadow-sm hover:shadow-md'
                aria-label={`Reuse calculation: ${item.expression} equals ${item.result}`}
              >
                <div className='flex justify-between items-center'>
                  <span className='text-muted-foreground truncate flex-1 mr-2'>
                    {item.expression}
                  </span>
                  <span className='font-bold text-primary flex-shrink-0'>
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
        <Card className='p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='font-semibold'>Calculation Result</h3>
              <p className='text-sm text-muted-foreground'>
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
