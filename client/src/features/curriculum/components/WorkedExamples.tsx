import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Play,
  Eye,
  EyeOff,
} from 'lucide-react';
import { WorkedExample } from '../types';
import { MathExpression } from './MathExpression';

interface WorkedExamplesProps {
  examples: WorkedExample[];
}

export function WorkedExamples({ examples }: WorkedExamplesProps) {
  const [expandedExample, setExpandedExample] = useState<number | null>(0);
  const [revealedSteps, setRevealedSteps] = useState<Record<number, number>>(
    {}
  );

  const toggleExample = (index: number) => {
    setExpandedExample(expandedExample === index ? null : index);
    // Reset revealed steps when collapsing
    if (expandedExample === index) {
      setRevealedSteps(prev => ({ ...prev, [index]: 0 }));
    }
  };

  const revealNextStep = (exampleIndex: number) => {
    const example = examples[exampleIndex];
    const currentRevealed = revealedSteps[exampleIndex] || 0;

    if (example && currentRevealed < example.steps.length) {
      setRevealedSteps(prev => ({
        ...prev,
        [exampleIndex]: currentRevealed + 1,
      }));
    }
  };

  const revealAllSteps = (exampleIndex: number) => {
    const example = examples[exampleIndex];
    if (example) {
      setRevealedSteps(prev => ({
        ...prev,
        [exampleIndex]: example.steps.length,
      }));
    }
  };

  const hideAllSteps = (exampleIndex: number) => {
    setRevealedSteps(prev => ({
      ...prev,
      [exampleIndex]: 0,
    }));
  };

  const replaySteps = (exampleIndex: number) => {
    setRevealedSteps(prev => ({
      ...prev,
      [exampleIndex]: 0,
    }));
  };

  return (
    <div className='space-y-6'>
      <div className='prose prose-purple max-w-none dark:prose-invert'>
        <h3 className='text-xl font-semibold mb-6'>Worked Examples</h3>
        <p className='text-gray-600 dark:text-gray-400 mb-6'>
          Study these step-by-step solutions to understand the problem-solving
          process.
        </p>
      </div>

      {examples.map((example, index) => {
        const currentRevealed = revealedSteps[index] || 0;
        const hasSteps = example.steps.length > 0;
        const allRevealed = currentRevealed >= example.steps.length;

        return (
          <div
            key={index}
            className='border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden'
          >
            <button
              onClick={() => toggleExample(index)}
              className='w-full p-4 text-left bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between'
            >
              <div className='flex-1'>
                <h4 className='font-medium text-gray-900 dark:text-white'>
                  Example {index + 1}
                </h4>
                <p className='text-gray-600 dark:text-gray-400 mt-1'>
                  {example.problem}
                </p>
                {example.latex && (
                  <div className='mt-2 bg-gray-100 dark:bg-gray-700 p-2 rounded'>
                    <MathExpression inline={false} className='text-lg'>
                      {example.latex}
                    </MathExpression>
                  </div>
                )}
              </div>
              {expandedExample === index ? (
                <ChevronDown className='w-5 h-5 text-gray-500' />
              ) : (
                <ChevronRight className='w-5 h-5 text-gray-500' />
              )}
            </button>

            {expandedExample === index && (
              <div className='p-6 bg-white dark:bg-gray-800'>
                <div className='mb-6'>
                  <h5 className='font-medium text-green-700 dark:text-green-300 mb-3'>
                    Solution: {example.solution}
                  </h5>

                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <h6 className='font-medium text-gray-900 dark:text-white'>
                        Step-by-step Solution:
                      </h6>
                      <div className='flex items-center space-x-2'>
                        {hasSteps && (
                          <>
                            {currentRevealed > 0 && (
                              <button
                                onClick={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  replaySteps(index);
                                }}
                                className='flex items-center space-x-1 px-3 py-1 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors'
                              >
                                <Play className='w-3 h-3' />
                                <span>Replay</span>
                              </button>
                            )}

                            {currentRevealed > 0 && !allRevealed && (
                              <button
                                onClick={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  revealAllSteps(index);
                                }}
                                className='flex items-center space-x-1 px-3 py-1 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors'
                              >
                                <Eye className='w-3 h-3' />
                                <span>Show All</span>
                              </button>
                            )}

                            {currentRevealed > 0 && (
                              <button
                                onClick={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  hideAllSteps(index);
                                }}
                                className='flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
                              >
                                <EyeOff className='w-3 h-3' />
                                <span>Hide All</span>
                              </button>
                            )}

                            <button
                              onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                revealNextStep(index);
                              }}
                              disabled={allRevealed}
                              className='flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                            >
                              <Play className='w-3 h-3' />
                              <span>
                                {currentRevealed === 0 ? 'Start' : 'Next Step'}
                              </span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <ol className='list-decimal list-inside space-y-3'>
                        {example.steps
                          .slice(0, currentRevealed)
                          .map((step, stepIndex) => (
                            <li
                              key={stepIndex}
                              className='text-gray-700 dark:text-gray-300 p-3 rounded-lg border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            >
                              <span className='font-medium text-gray-900 dark:text-white'>
                                Step {stepIndex + 1}:
                              </span>{' '}
                              {step}
                            </li>
                          ))}

                        {currentRevealed < example.steps.length &&
                          currentRevealed > 0 && (
                            <li className='text-gray-500 dark:text-gray-400 italic p-3 rounded-lg border-l-4 border-l-gray-200 dark:border-l-gray-700 bg-gray-100 dark:bg-gray-800/50'>
                              <span className='font-medium'>
                                {example.steps.length - currentRevealed} more
                                step
                                {example.steps.length - currentRevealed !== 1
                                  ? 's'
                                  : ''}{' '}
                                remaining...
                              </span>
                            </li>
                          )}
                      </ol>
                    </div>
                  </div>
                </div>

                {example.commonErrors && example.commonErrors.length > 0 && (
                  <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4'>
                    <div className='flex items-start space-x-2'>
                      <AlertTriangle className='w-5 h-5 text-red-500 mt-0.5 flex-shrink-0' />
                      <div>
                        <h6 className='font-medium text-red-800 dark:text-red-200 mb-2'>
                          Common Mistakes to Avoid:
                        </h6>
                        <ul className='list-disc list-inside space-y-1 text-red-700 dark:text-red-300 text-sm'>
                          {example.commonErrors.map((error, errorIndex) => (
                            <li key={errorIndex}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4'>
        <h4 className='font-medium text-blue-800 dark:text-blue-200 mb-2'>
          💡 Study Strategy
        </h4>
        <div className='text-blue-700 dark:text-blue-300 text-sm space-y-2'>
          <p>
            Try to solve each problem yourself before looking at the solution.
            Use the step-by-step reveal to:
          </p>
          <ul className='list-disc list-inside space-y-1 ml-4'>
            <li>
              <strong>Start/Next Step:</strong> Reveal one step at a time to
              check your work
            </li>
            <li>
              <strong>Show All:</strong> See the complete solution when you need
              the full picture
            </li>
            <li>
              <strong>Replay:</strong> Reset and practice the problem-solving
              process again
            </li>
            <li>
              <strong>Hide All:</strong> Test yourself by hiding the solution
              and trying again
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
