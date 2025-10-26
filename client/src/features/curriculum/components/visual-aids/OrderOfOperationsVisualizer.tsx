/**
 * OrderOfOperationsVisualizer - Interactive PEMDAS demonstration
 * Specifically designed for Pre-Algebra Chapter 2: Order of Operations and Expressions
 */

import React, { useState } from 'react';

interface OrderOfOperationsVisualizerProps {
  className?: string;
  expression?: string;
  showSteps?: boolean;
}

interface Step {
  step: number;
  description: string;
  expression: string;
  highlight: string;
  result: string;
}

export const OrderOfOperationsVisualizer: React.FC<
  OrderOfOperationsVisualizerProps
> = ({
  className = '',
  expression = '2 + 3 × 4² - (5 - 2)',
  showSteps = true,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [customExpression, setCustomExpression] = useState(expression);
  const [isAnimating, setIsAnimating] = useState(false);

  // PEMDAS order
  const pemdas = [
    {
      letter: 'P',
      name: 'Parentheses',
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900/20',
    },
    {
      letter: 'E',
      name: 'Exponents',
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-100 dark:bg-orange-900/20',
    },
    {
      letter: 'M',
      name: 'Multiplication',
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
    {
      letter: 'D',
      name: 'Division',
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
    {
      letter: 'A',
      name: 'Addition',
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      letter: 'S',
      name: 'Subtraction',
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/20',
    },
  ];

  // Example steps for the default expression
  const exampleSteps: Step[] = [
    {
      step: 0,
      description: 'Original Expression',
      expression: '2 + 3 × 4² - (5 - 2)',
      highlight: '',
      result: '',
    },
    {
      step: 1,
      description: 'Step 1: Parentheses first',
      expression: '2 + 3 × 4² - (5 - 2)',
      highlight: '(5 - 2)',
      result: '2 + 3 × 4² - 3',
    },
    {
      step: 2,
      description: 'Step 2: Exponents',
      expression: '2 + 3 × 4² - 3',
      highlight: '4²',
      result: '2 + 3 × 16 - 3',
    },
    {
      step: 3,
      description: 'Step 3: Multiplication',
      expression: '2 + 3 × 16 - 3',
      highlight: '3 × 16',
      result: '2 + 48 - 3',
    },
    {
      step: 4,
      description: 'Step 4: Addition (left to right)',
      expression: '2 + 48 - 3',
      highlight: '2 + 48',
      result: '50 - 3',
    },
    {
      step: 5,
      description: 'Step 5: Subtraction',
      expression: '50 - 3',
      highlight: '50 - 3',
      result: '47',
    },
  ];

  const [steps, setSteps] = useState<Step[]>(exampleSteps);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const resetSteps = () => {
    setCurrentStep(0);
  };

  const renderExpression = (expr: string, highlight: string) => {
    if (!highlight) return expr;

    const parts = expr.split(highlight);
    if (parts.length === 1) return expr;

    return (
      <>
        {parts[0]}
        <span className='px-1 py-0.5 bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 rounded font-bold'>
          {highlight}
        </span>
        {parts[1]}
      </>
    );
  };

  return (
    <div
      className={`p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
          Order of Operations (PEMDAS)
        </h3>
        <p className='text-sm text-gray-600 dark:text-gray-300'>
          Follow the steps to see how PEMDAS determines the correct order for
          evaluating expressions.
        </p>
      </div>

      {/* PEMDAS Reference */}
      <div className='mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
        <h4 className='text-md font-medium text-gray-900 dark:text-white mb-3'>
          PEMDAS Order:
        </h4>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2'>
          {pemdas.map((item, index) => (
            <div
              key={item.letter}
              className={`p-2 rounded-lg border-2 border-transparent transition-all duration-300 ${item.bg}`}
            >
              <div className={`text-lg font-bold ${item.color}`}>
                {item.letter}
              </div>
              <div className='text-xs text-gray-600 dark:text-gray-300'>
                {item.name}
              </div>
            </div>
          ))}
        </div>
        <div className='mt-2 text-xs text-gray-500 dark:text-gray-400'>
          Note: Multiplication & Division have equal priority (left to right).
          Addition & Subtraction have equal priority (left to right).
        </div>
      </div>

      {/* Expression Input */}
      <div className='mb-6'>
        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
          Expression to Evaluate:
        </label>
        <div className='flex gap-2'>
          <input
            type='text'
            value={customExpression}
            onChange={e => setCustomExpression(e.target.value)}
            className='flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
            placeholder='Enter expression (e.g., 2 + 3 × 4² - (5 - 2))'
          />
          <button
            onClick={() => {
              // For demo purposes, we'll use the example steps
              // In a real implementation, you'd parse the expression
              resetSteps();
            }}
            className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
          >
            Evaluate
          </button>
        </div>
      </div>

      {/* Step-by-Step Visualization */}
      {showSteps && (
        <div className='mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <h4 className='text-md font-medium text-gray-900 dark:text-white'>
              Step-by-Step Solution:
            </h4>
            <div className='text-sm text-gray-500 dark:text-gray-400'>
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>

          {/* Current Step Display */}
          <div
            className={`p-4 border-2 border-blue-200 dark:border-blue-800 rounded-lg transition-all duration-300 ${
              isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
            }`}
          >
            <div className='mb-2'>
              <span className='text-sm font-medium text-blue-600 dark:text-blue-400'>
                {steps[currentStep].description}
              </span>
            </div>

            <div className='text-xl font-mono text-gray-900 dark:text-white mb-2'>
              {renderExpression(
                steps[currentStep].expression,
                steps[currentStep].highlight
              )}
            </div>

            {steps[currentStep].result && (
              <div className='text-lg font-mono text-green-600 dark:text-green-400'>
                = {steps[currentStep].result}
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className='flex justify-center gap-2 mt-4'>
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className='px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg transition-colors'
            >
              Previous
            </button>
            <button
              onClick={resetSteps}
              className='px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors'
            >
              Reset
            </button>
            <button
              onClick={nextStep}
              disabled={currentStep === steps.length - 1}
              className='px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors'
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      <div className='mb-4'>
        <div className='flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1'>
          <span>Progress</span>
          <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
        </div>
        <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
          <div
            className='bg-blue-600 h-2 rounded-full transition-all duration-300'
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Tips */}
      <div className='p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg'>
        <div className='text-sm text-yellow-800 dark:text-yellow-200'>
          <div className='font-medium mb-1'>💡 PEMDAS Tips:</div>
          <ul className='list-disc list-inside space-y-1 text-xs'>
            <li>
              Always work inside parentheses first, from innermost to outermost
            </li>
            <li>Handle exponents before any other operations</li>
            <li>
              Multiplication and division have equal priority - work left to
              right
            </li>
            <li>
              Addition and subtraction have equal priority - work left to right
            </li>
            <li>
              When in doubt, use parentheses to make your intentions clear
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
