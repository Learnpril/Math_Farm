/**
 * ProportionCrossMultiply - Interactive visualization for cross-multiplication in proportions
 * Specifically designed for Pre-Algebra Chapter 4: Algebraic Proportions
 */

import React, { useState } from 'react';

interface ProportionCrossMultiplyProps {
  className?: string;
  showSteps?: boolean;
}

interface Proportion {
  a: number | string;
  b: number | string;
  c: number | string;
  d: number | string;
}

export const ProportionCrossMultiply: React.FC<
  ProportionCrossMultiplyProps
> = ({ className = '', showSteps = true }) => {
  const [proportion, setProportion] = useState<Proportion>({
    a: 3,
    b: 4,
    c: 'x',
    d: 8,
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [solution, setSolution] = useState<number | null>(null);

  const solveProportion = () => {
    // Find which value is the variable
    let variable: 'a' | 'b' | 'c' | 'd' | null = null;
    let varValue: string = '';

    Object.entries(proportion).forEach(([key, value]) => {
      if (typeof value === 'string' && isNaN(Number(value))) {
        variable = key as 'a' | 'b' | 'c' | 'd';
        varValue = value;
      }
    });

    if (!variable) return;

    // Get numeric values
    const a =
      typeof proportion.a === 'number'
        ? proportion.a
        : proportion.a === varValue
          ? 0
          : Number(proportion.a);
    const b =
      typeof proportion.b === 'number'
        ? proportion.b
        : proportion.b === varValue
          ? 0
          : Number(proportion.b);
    const c =
      typeof proportion.c === 'number'
        ? proportion.c
        : proportion.c === varValue
          ? 0
          : Number(proportion.c);
    const d =
      typeof proportion.d === 'number'
        ? proportion.d
        : proportion.d === varValue
          ? 0
          : Number(proportion.d);

    // Solve using cross multiplication: a*d = b*c
    let result: number;
    switch (variable) {
      case 'a':
        result = (b * c) / d;
        break;
      case 'b':
        result = (a * d) / c;
        break;
      case 'c':
        result = (a * d) / b;
        break;
      case 'd':
        result = (b * c) / a;
        break;
      default:
        return;
    }

    setSolution(result);
  };

  const updateProportion = (position: 'a' | 'b' | 'c' | 'd', value: string) => {
    const numValue = isNaN(Number(value)) ? value : Number(value);
    setProportion({ ...proportion, [position]: numValue });
    setSolution(null);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetSteps = () => {
    setCurrentStep(0);
    setSolution(null);
  };

  const renderFraction = (
    numerator: number | string,
    denominator: number | string,
    highlight: boolean = false
  ) => {
    return (
      <div
        className={`flex flex-col items-center ${highlight ? 'bg-yellow-200 dark:bg-yellow-800 rounded p-2' : ''}`}
      >
        <div className={`text-2xl font-mono ${highlight ? 'font-bold' : ''}`}>
          {numerator}
        </div>
        <div className='w-8 h-0.5 bg-gray-600 dark:bg-gray-400 my-1'></div>
        <div className={`text-2xl font-mono ${highlight ? 'font-bold' : ''}`}>
          {denominator}
        </div>
      </div>
    );
  };

  const renderCrossMultiplication = () => {
    const steps = [
      {
        title: 'Original Proportion',
        description: 'Start with the proportion a/b = c/d',
        highlight: null,
      },
      {
        title: 'Cross Multiply',
        description: 'Multiply diagonally: a × d and b × c',
        highlight: 'cross',
      },
      {
        title: 'Set Up Equation',
        description: 'The cross products are equal: a × d = b × c',
        highlight: 'equation',
      },
      {
        title: 'Solve for Variable',
        description: 'Isolate the variable using division',
        highlight: 'solve',
      },
      {
        title: 'Check Solution',
        description: 'Verify by substituting back into original proportion',
        highlight: 'check',
      },
    ];

    return (
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h4 className='text-md font-medium text-gray-900 dark:text-white'>
            Step {currentStep + 1}: {steps[currentStep].title}
          </h4>
          <div className='text-sm text-gray-500 dark:text-gray-400'>
            {currentStep + 1} of {steps.length}
          </div>
        </div>

        <div className='p-4 border-2 border-blue-200 dark:border-blue-800 rounded-lg'>
          <div className='text-sm text-blue-600 dark:text-blue-400 mb-3'>
            {steps[currentStep].description}
          </div>

          {/* Visual representation based on current step */}
          {currentStep === 0 && (
            <div className='flex items-center justify-center gap-4'>
              {renderFraction(proportion.a, proportion.b)}
              <div className='text-2xl font-bold text-gray-600 dark:text-gray-400'>
                =
              </div>
              {renderFraction(proportion.c, proportion.d)}
            </div>
          )}

          {currentStep === 1 && (
            <div className='relative'>
              <div className='flex items-center justify-center gap-4'>
                {renderFraction(proportion.a, proportion.b, true)}
                <div className='text-2xl font-bold text-gray-600 dark:text-gray-400'>
                  =
                </div>
                {renderFraction(proportion.c, proportion.d, true)}
              </div>

              {/* Cross multiplication arrows */}
              <svg
                className='absolute inset-0 w-full h-full pointer-events-none'
                style={{ zIndex: 10 }}
              >
                <defs>
                  <marker
                    id='arrowhead'
                    markerWidth='10'
                    markerHeight='7'
                    refX='9'
                    refY='3.5'
                    orient='auto'
                  >
                    <polygon points='0 0, 10 3.5, 0 7' fill='#ef4444' />
                  </marker>
                </defs>

                {/* Cross arrows */}
                <line
                  x1='25%'
                  y1='30%'
                  x2='75%'
                  y2='70%'
                  stroke='#ef4444'
                  strokeWidth='3'
                  markerEnd='url(#arrowhead)'
                />
                <line
                  x1='75%'
                  y1='30%'
                  x2='25%'
                  y2='70%'
                  stroke='#ef4444'
                  strokeWidth='3'
                  markerEnd='url(#arrowhead)'
                />
              </svg>
            </div>
          )}

          {currentStep === 2 && (
            <div className='text-center'>
              <div className='text-xl font-mono text-gray-900 dark:text-white'>
                {proportion.a} × {proportion.d} = {proportion.b} ×{' '}
                {proportion.c}
              </div>
            </div>
          )}

          {currentStep >= 3 && solution !== null && (
            <div className='text-center space-y-2'>
              <div className='text-xl font-mono text-gray-900 dark:text-white'>
                Solution:{' '}
                {typeof proportion.c === 'string' && isNaN(Number(proportion.c))
                  ? proportion.c
                  : 'x'}{' '}
                = {solution}
              </div>
              {currentStep === 4 && (
                <div className='text-sm text-green-600 dark:text-green-400'>
                  Check: {proportion.a}/{proportion.b} = {solution}/
                  {proportion.d} ✓
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className='flex justify-center gap-2'>
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className='px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded transition-colors'
          >
            Previous
          </button>
          <button
            onClick={resetSteps}
            className='px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors'
          >
            Reset
          </button>
          <button
            onClick={nextStep}
            disabled={currentStep === 4}
            className='px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded transition-colors'
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
          Cross-Multiplication in Proportions
        </h3>
        <p className='text-sm text-gray-600 dark:text-gray-300'>
          Learn how to solve proportions using cross-multiplication. Enter your
          own values to practice!
        </p>
      </div>

      {/* Proportion Input */}
      <div className='mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
        <h4 className='text-md font-medium text-gray-900 dark:text-white mb-3'>
          Enter Proportion:
        </h4>

        <div className='flex items-center justify-center gap-4 mb-4'>
          {/* First fraction */}
          <div className='flex flex-col items-center'>
            <input
              type='text'
              value={proportion.a}
              onChange={e => updateProportion('a', e.target.value)}
              className='w-16 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
              placeholder='a'
            />
            <div className='w-8 h-0.5 bg-gray-600 dark:bg-gray-400 my-2'></div>
            <input
              type='text'
              value={proportion.b}
              onChange={e => updateProportion('b', e.target.value)}
              className='w-16 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
              placeholder='b'
            />
          </div>

          <div className='text-2xl font-bold text-gray-600 dark:text-gray-400'>
            =
          </div>

          {/* Second fraction */}
          <div className='flex flex-col items-center'>
            <input
              type='text'
              value={proportion.c}
              onChange={e => updateProportion('c', e.target.value)}
              className='w-16 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
              placeholder='c'
            />
            <div className='w-8 h-0.5 bg-gray-600 dark:bg-gray-400 my-2'></div>
            <input
              type='text'
              value={proportion.d}
              onChange={e => updateProportion('d', e.target.value)}
              className='w-16 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
              placeholder='d'
            />
          </div>
        </div>

        <div className='flex justify-center'>
          <button
            onClick={solveProportion}
            className='px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors'
          >
            Solve Proportion
          </button>
        </div>
      </div>

      {/* Step-by-step solution */}
      {showSteps && <div className='mb-6'>{renderCrossMultiplication()}</div>}

      {/* Quick Examples */}
      <div className='mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
        <h4 className='text-md font-medium text-blue-800 dark:text-blue-200 mb-3'>
          Try These Examples:
        </h4>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-2'>
          <button
            onClick={() => {
              setProportion({ a: 2, b: 3, c: 'x', d: 9 });
              resetSteps();
            }}
            className='p-2 bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 text-blue-800 dark:text-blue-200 rounded transition-colors text-sm'
          >
            2/3 = x/9
          </button>
          <button
            onClick={() => {
              setProportion({ a: 5, b: 'y', c: 15, d: 12 });
              resetSteps();
            }}
            className='p-2 bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 text-blue-800 dark:text-blue-200 rounded transition-colors text-sm'
          >
            5/y = 15/12
          </button>
          <button
            onClick={() => {
              setProportion({ a: 'a', b: 4, c: 6, d: 8 });
              resetSteps();
            }}
            className='p-2 bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 text-blue-800 dark:text-blue-200 rounded transition-colors text-sm'
          >
            a/4 = 6/8
          </button>
        </div>
      </div>

      {/* Key Concepts */}
      <div className='p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg'>
        <div className='text-sm text-green-800 dark:text-green-200'>
          <div className='font-medium mb-1'>🎯 Cross-Multiplication Rules:</div>
          <ul className='list-disc list-inside space-y-1 text-xs'>
            <li>
              In the proportion a/b = c/d, cross-multiply to get: a × d = b × c
            </li>
            <li>The cross products (diagonal products) are always equal</li>
            <li>This method works because we multiply both sides by b × d</li>
            <li>
              Use cross-multiplication to solve for any unknown value in a
              proportion
            </li>
            <li>
              Always check your answer by substituting back into the original
              proportion
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
