import { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Play,
  RotateCcw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { WorkedExample } from '../types';
import { MathExpression } from './MathExpression';

interface WorkedExamplesProps {
  examples: WorkedExample[];
}

interface StepRevealState {
  revealedSteps: number;
  isRevealing: boolean;
  showAllSteps: boolean;
}

export function WorkedExamples({ examples }: WorkedExamplesProps) {
  const [expandedExample, setExpandedExample] = useState<number | null>(0);
  const [stepRevealStates, setStepRevealStates] = useState<
    Record<number, StepRevealState>
  >({});

  const toggleExample = (index: number) => {
    setExpandedExample(expandedExample === index ? null : index);
    // Reset step reveal state when collapsing
    if (expandedExample === index) {
      setStepRevealStates(prev => ({
        ...prev,
        [index]: { revealedSteps: 0, isRevealing: false, showAllSteps: false },
      }));
    }
  };

  const getStepRevealState = (exampleIndex: number): StepRevealState => {
    return (
      stepRevealStates[exampleIndex] || {
        revealedSteps: 0,
        isRevealing: false,
        showAllSteps: false,
      }
    );
  };

  const updateStepRevealState = (
    exampleIndex: number,
    updates: Partial<StepRevealState>
  ) => {
    setStepRevealStates(prev => ({
      ...prev,
      [exampleIndex]: { ...getStepRevealState(exampleIndex), ...updates },
    }));
  };

  const revealNextStep = (exampleIndex: number) => {
    const currentState = getStepRevealState(exampleIndex);
    const example = examples[exampleIndex];

    if (currentState.revealedSteps < example.steps.length) {
      updateStepRevealState(exampleIndex, {
        revealedSteps: currentState.revealedSteps + 1,
        isRevealing: true,
      });

      // Reset revealing state after animation
      setTimeout(() => {
        updateStepRevealState(exampleIndex, { isRevealing: false });
      }, 300);
    }
  };

  const revealAllSteps = (exampleIndex: number) => {
    const example = examples[exampleIndex];
    updateStepRevealState(exampleIndex, {
      revealedSteps: example.steps.length,
      showAllSteps: true,
      isRevealing: false,
    });
  };

  const hideAllSteps = (exampleIndex: number) => {
    updateStepRevealState(exampleIndex, {
      revealedSteps: 0,
      showAllSteps: false,
      isRevealing: false,
    });
  };

  const replaySteps = (exampleIndex: number) => {
    updateStepRevealState(exampleIndex, {
      revealedSteps: 0,
      showAllSteps: false,
      isRevealing: false,
    });
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

      {examples.map((example, index) => (
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
                      {(() => {
                        const state = getStepRevealState(index);
                        const hasSteps = example.steps.length > 0;
                        const allRevealed =
                          state.revealedSteps >= example.steps.length;

                        return (
                          <>
                            {hasSteps && !state.showAllSteps && (
                              <button
                                onClick={() => revealNextStep(index)}
                                disabled={allRevealed}
                                className='flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                              >
                                <Play className='w-3 h-3' />
                                <span>
                                  {state.revealedSteps === 0
                                    ? 'Start'
                                    : 'Next Step'}
                                </span>
                              </button>
                            )}

                            {hasSteps &&
                              state.revealedSteps > 0 &&
                              !state.showAllSteps && (
                                <button
                                  onClick={() => revealAllSteps(index)}
                                  className='flex items-center space-x-1 px-3 py-1 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors'
                                >
                                  <Eye className='w-3 h-3' />
                                  <span>Show All</span>
                                </button>
                              )}

                            {hasSteps && state.showAllSteps && (
                              <button
                                onClick={() => hideAllSteps(index)}
                                className='flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
                              >
                                <EyeOff className='w-3 h-3' />
                                <span>Hide All</span>
                              </button>
                            )}

                            {hasSteps &&
                              (state.revealedSteps > 0 ||
                                state.showAllSteps) && (
                                <button
                                  onClick={() => replaySteps(index)}
                                  className='flex items-center space-x-1 px-3 py-1 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors'
                                >
                                  <RotateCcw className='w-3 h-3' />
                                  <span>Replay</span>
                                </button>
                              )}
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <div className='space-y-2'>
                    {(() => {
                      const state = getStepRevealState(index);
                      const stepsToShow = state.showAllSteps
                        ? example.steps
                        : example.steps.slice(0, state.revealedSteps);

                      return (
                        <ol className='list-decimal list-inside space-y-3'>
                          {stepsToShow.map((step, stepIndex) => (
                            <li
                              key={stepIndex}
                              className={`text-gray-700 dark:text-gray-300 p-3 rounded-lg border-l-4 transition-all duration-300 ${
                                state.isRevealing &&
                                stepIndex === stepsToShow.length - 1
                                  ? 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20 animate-pulse'
                                  : 'border-l-gray-300 dark:border-l-gray-600 bg-gray-50 dark:bg-gray-700/30'
                              }`}
                              style={{
                                animationDelay: `${stepIndex * 100}ms`,
                                opacity: state.showAllSteps
                                  ? 1
                                  : stepIndex < state.revealedSteps
                                    ? 1
                                    : 0,
                                transform: state.showAllSteps
                                  ? 'translateY(0)'
                                  : stepIndex < state.revealedSteps
                                    ? 'translateY(0)'
                                    : 'translateY(-10px)',
                                transition:
                                  'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
                              }}
                            >
                              <span className='font-medium text-gray-900 dark:text-white'>
                                Step {stepIndex + 1}:
                              </span>{' '}
                              {step}
                            </li>
                          ))}

                          {!state.showAllSteps &&
                            state.revealedSteps < example.steps.length &&
                            state.revealedSteps > 0 && (
                              <li className='text-gray-500 dark:text-gray-400 italic p-3 rounded-lg border-l-4 border-l-gray-200 dark:border-l-gray-700 bg-gray-100 dark:bg-gray-800/50'>
                                <span className='font-medium'>
                                  {example.steps.length - state.revealedSteps}{' '}
                                  more step
                                  {example.steps.length -
                                    state.revealedSteps !==
                                  1
                                    ? 's'
                                    : ''}{' '}
                                  remaining...
                                </span>
                              </li>
                            )}
                        </ol>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {example.commonErrors.length > 0 && (
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
      ))}

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
