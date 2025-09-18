import { useState } from 'react';
import { ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import { WorkedExample } from '../types';

interface WorkedExamplesProps {
  examples: WorkedExample[];
}

export function WorkedExamples({ examples }: WorkedExamplesProps) {
  const [expandedExample, setExpandedExample] = useState<number | null>(0);

  const toggleExample = (index: number) => {
    setExpandedExample(expandedExample === index ? null : index);
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
                <div className='mt-2 text-center font-mono text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded'>
                  {example.latex}
                  <div className='text-xs text-gray-500 mt-1'>
                    (LaTeX rendering will be added in next phase)
                  </div>
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

                <div className='space-y-3'>
                  <h6 className='font-medium text-gray-900 dark:text-white'>
                    Step-by-step:
                  </h6>
                  <ol className='list-decimal list-inside space-y-2'>
                    {example.steps.map((step, stepIndex) => (
                      <li
                        key={stepIndex}
                        className='text-gray-700 dark:text-gray-300'
                      >
                        {step}
                      </li>
                    ))}
                  </ol>
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
        <p className='text-blue-700 dark:text-blue-300 text-sm'>
          Try to solve each problem yourself before looking at the solution. If
          you get stuck, reveal one step at a time rather than the entire
          solution.
        </p>
      </div>
    </div>
  );
}
