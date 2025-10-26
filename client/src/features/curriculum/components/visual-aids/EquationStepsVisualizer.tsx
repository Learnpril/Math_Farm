/**
 * EquationStepsVisualizer - Simple step-by-step equation solving demonstration
 * Shows the balance concept through clear equation transformations
 */

import React, { useState } from 'react';

interface EquationStepsVisualizerProps {
  className?: string;
}

interface EquationStep {
  step: number;
  title: string;
  equation: string;
  operation: string;
  explanation: string;
}

export const EquationStepsVisualizer: React.FC<
  EquationStepsVisualizerProps
> = ({ className = '' }) => {
  const [currentExample, setCurrentExample] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const examples = [
    {
      title: 'Solving: x + 5 = 12',
      steps: [
        {
          step: 0,
          title: 'Original Equation',
          equation: 'x + 5 = 12',
          operation: '',
          explanation:
            'We need to find the value of x that makes this equation true.',
        },
        {
          step: 1,
          title: 'Subtract 5 from both sides',
          equation: 'x + 5 - 5 = 12 - 5',
          operation: '- 5',
          explanation:
            'To isolate x, we subtract 5 from both sides to maintain balance.',
        },
        {
          step: 2,
          title: 'Simplify',
          equation: 'x = 7',
          operation: '',
          explanation: 'The equation is solved! x = 7 is our answer.',
        },
        {
          step: 3,
          title: 'Check the solution',
          equation: '7 + 5 = 12 ✓',
          operation: '',
          explanation:
            'Substitute x = 7 back into the original equation to verify.',
        },
      ],
    },
    {
      title: 'Solving: 3x = 15',
      steps: [
        {
          step: 0,
          title: 'Original Equation',
          equation: '3x = 15',
          operation: '',
          explanation:
            'We need to find the value of x that makes this equation true.',
        },
        {
          step: 1,
          title: 'Divide both sides by 3',
          equation: '3x ÷ 3 = 15 ÷ 3',
          operation: '÷ 3',
          explanation:
            'To isolate x, we divide both sides by 3 to maintain balance.',
        },
        {
          step: 2,
          title: 'Simplify',
          equation: 'x = 5',
          operation: '',
          explanation: 'The equation is solved! x = 5 is our answer.',
        },
        {
          step: 3,
          title: 'Check the solution',
          equation: '3(5) = 15 ✓',
          operation: '',
          explanation:
            'Substitute x = 5 back into the original equation to verify.',
        },
      ],
    },
    {
      title: 'Solving: 2x + 3 = 11',
      steps: [
        {
          step: 0,
          title: 'Original Equation',
          equation: '2x + 3 = 11',
          operation: '',
          explanation:
            "This is a two-step equation. We'll solve it step by step.",
        },
        {
          step: 1,
          title: 'Subtract 3 from both sides',
          equation: '2x + 3 - 3 = 11 - 3',
          operation: '- 3',
          explanation:
            'First, we eliminate the constant term by subtracting 3 from both sides.',
        },
        {
          step: 2,
          title: 'Simplify',
          equation: '2x = 8',
          operation: '',
          explanation:
            'Now we have a simpler equation with just the variable term.',
        },
        {
          step: 3,
          title: 'Divide both sides by 2',
          equation: '2x ÷ 2 = 8 ÷ 2',
          operation: '÷ 2',
          explanation: 'Next, we divide both sides by 2 to isolate x.',
        },
        {
          step: 4,
          title: 'Simplify',
          equation: 'x = 4',
          operation: '',
          explanation: 'The equation is solved! x = 4 is our answer.',
        },
        {
          step: 5,
          title: 'Check the solution',
          equation: '2(4) + 3 = 8 + 3 = 11 ✓',
          operation: '',
          explanation:
            'Substitute x = 4 back into the original equation to verify.',
        },
      ],
    },
  ];

  const currentExampleData = examples[currentExample];
  const currentStepData = currentExampleData.steps[currentStep];

  const nextStep = () => {
    if (currentStep < currentExampleData.steps.length - 1) {
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
  };

  const changeExample = (exampleIndex: number) => {
    setCurrentExample(exampleIndex);
    setCurrentStep(0);
  };

  return (
    <div
      className={`p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
          Equation Solving: Step by Step
        </h3>
        <p className='text-sm text-gray-600 dark:text-gray-300'>
          Watch how we maintain balance by doing the same operation to both
          sides of an equation.
        </p>
      </div>

      {/* Example selector */}
      <div className='mb-6'>
        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
          Choose an example:
        </label>
        <div className='flex flex-wrap gap-2'>
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => changeExample(index)}
              className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 text-sm ${
                currentExample === index
                  ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-bold'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-500'
              }`}
            >
              {example.title}
            </button>
          ))}
        </div>
      </div>

      {/* Current step display */}
      <div className='mb-6'>
        <div className='flex items-center justify-between mb-4'>
          <h4 className='text-md font-medium text-gray-900 dark:text-white'>
            {currentStepData.title}
          </h4>
          <div className='text-sm text-gray-500 dark:text-gray-400'>
            Step {currentStep + 1} of {currentExampleData.steps.length}
          </div>
        </div>

        {/* Equation display */}
        <div className='p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-blue-200 dark:border-blue-800 mb-4'>
          <div className='text-center'>
            <div className='text-2xl font-mono text-gray-900 dark:text-white mb-2'>
              {currentStepData.equation}
            </div>
            {currentStepData.operation && (
              <div className='text-lg text-blue-600 dark:text-blue-400 font-medium'>
                Apply: {currentStepData.operation} to both sides
              </div>
            )}
          </div>
        </div>

        {/* Explanation */}
        <div className='p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
          <p className='text-sm text-blue-800 dark:text-blue-200'>
            {currentStepData.explanation}
          </p>
        </div>
      </div>

      {/* Navigation controls */}
      <div className='flex justify-center gap-2 mb-6'>
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
          disabled={currentStep === currentExampleData.steps.length - 1}
          className='px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors'
        >
          Next
        </button>
      </div>

      {/* Progress indicator */}
      <div className='mb-4'>
        <div className='flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1'>
          <span>Progress</span>
          <span>
            {Math.round(
              ((currentStep + 1) / currentExampleData.steps.length) * 100
            )}
            %
          </span>
        </div>
        <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
          <div
            className='bg-blue-600 h-2 rounded-full transition-all duration-300'
            style={{
              width: `${((currentStep + 1) / currentExampleData.steps.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Key concepts */}
      <div className='p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg'>
        <div className='text-sm text-green-800 dark:text-green-200'>
          <div className='font-medium mb-2'>🎯 Key Balance Principle:</div>
          <ul className='list-disc list-inside space-y-1 text-xs'>
            <li>Whatever you do to one side, you must do to the other side</li>
            <li>This keeps the equation "balanced" and maintains equality</li>
            <li>Use inverse operations to isolate the variable</li>
            <li>
              Always check your answer by substituting back into the original
              equation
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
