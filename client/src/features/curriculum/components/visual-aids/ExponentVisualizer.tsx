import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ExponentVisualizerProps {
  className?: string;
}

export const ExponentVisualizer: React.FC<ExponentVisualizerProps> = ({
  className,
}) => {
  const [base, setBase] = useState(2);
  const [exponent, setExponent] = useState(3);
  const [showSteps, setShowSteps] = useState(false);

  const calculateSteps = () => {
    const steps = [];
    let result = 1;

    for (let i = 0; i < exponent; i++) {
      result *= base;
      steps.push({
        step: i + 1,
        calculation: `${base}${i === 0 ? '' : ` × ${Array(i).fill(base).join(' × ')}`} × ${base}`,
        result: result,
      });
    }

    return steps;
  };

  const steps = calculateSteps();
  const finalResult = Math.pow(base, exponent);

  const renderBlocks = () => {
    if (base > 5 || exponent > 4) return null;

    const blocks = [];
    for (let i = 0; i < exponent; i++) {
      blocks.push(
        <div key={i} className='flex items-center gap-1'>
          <span className='text-sm text-muted-foreground'>×</span>
          <div className='flex gap-1'>
            {Array(base)
              .fill(0)
              .map((_, j) => (
                <div
                  key={j}
                  className='w-4 h-4 bg-primary/20 border border-primary/40 rounded-sm'
                />
              ))}
          </div>
        </div>
      );
    }

    return (
      <div className='flex flex-wrap items-center gap-2 p-4 bg-muted/30 rounded-lg'>
        <div className='flex gap-1'>
          {Array(base)
            .fill(0)
            .map((_, j) => (
              <div
                key={j}
                className='w-4 h-4 bg-primary/40 border border-primary/60 rounded-sm'
              />
            ))}
        </div>
        {blocks}
        <span className='text-sm font-medium ml-2'>= {finalResult} blocks</span>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className='text-lg'>Exponent Visualizer</CardTitle>
        <p className='text-sm text-muted-foreground'>
          See how exponents represent repeated multiplication
        </p>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Controls */}
        <div className='flex gap-4 items-center'>
          <div className='flex items-center gap-2'>
            <label className='text-sm font-medium'>Base:</label>
            <select
              value={base}
              onChange={e => setBase(Number(e.target.value))}
              className='px-2 py-1 border rounded text-sm bg-background text-foreground border-border'
            >
              {[2, 3, 4, 5].map(n => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className='flex items-center gap-2'>
            <label className='text-sm font-medium'>Exponent:</label>
            <select
              value={exponent}
              onChange={e => setExponent(Number(e.target.value))}
              className='px-2 py-1 border rounded text-sm bg-background text-foreground border-border'
            >
              {[1, 2, 3, 4].map(n => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Expression Display */}
        <div className='text-center p-4 bg-primary/5 rounded-lg'>
          <div className='text-2xl font-bold mb-2'>
            {base}
            <sup>{exponent}</sup> = {Array(exponent).fill(base).join(' × ')} ={' '}
            {finalResult}
          </div>
          <div className='text-sm text-muted-foreground'>
            "{base} multiplied by itself {exponent} time
            {exponent !== 1 ? 's' : ''}"
          </div>
        </div>

        {/* Visual Blocks (for small numbers) */}
        {renderBlocks()}

        {/* Step-by-step calculation */}
        <div className='space-y-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setShowSteps(!showSteps)}
          >
            {showSteps ? 'Hide' : 'Show'} Step-by-Step
          </Button>

          {showSteps && (
            <div className='space-y-2 p-3 bg-muted/20 rounded-lg'>
              <div className='text-sm font-medium'>
                Step-by-step calculation:
              </div>
              {steps.map((step, index) => (
                <div key={index} className='text-sm'>
                  <span className='text-muted-foreground'>
                    Step {step.step}:
                  </span>{' '}
                  {step.calculation} = {step.result}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Special Cases */}
        {exponent === 0 && (
          <div className='p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg'>
            <div className='text-sm font-medium text-yellow-800 dark:text-yellow-200'>
              Special Case:
            </div>
            <div className='text-sm text-yellow-700 dark:text-yellow-300'>
              Any non-zero number to the power of 0 equals 1. This represents
              "no multiplications."
            </div>
          </div>
        )}

        {exponent === 1 && (
          <div className='p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
            <div className='text-sm font-medium text-blue-800 dark:text-blue-200'>
              Special Case:
            </div>
            <div className='text-sm text-blue-700 dark:text-blue-300'>
              Any number to the power of 1 equals itself. This represents
              "multiply once."
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
