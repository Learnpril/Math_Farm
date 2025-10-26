/**
 * InverseOperationsDemonstrator - Interactive demonstration of inverse operations
 * Shows how operations "undo" each other in equation solving
 */
import React, { useState } from 'react';

interface InverseOperationsDemonstratorProps {
  className?: string;
}

interface OperationPair {
  operation: string;
  inverse: string;
  symbol: string;
  inverseSymbol: string;
  example: {
    equation: string;
    step1: string;
    step2: string;
    solution: string;
  };
}

export const InverseOperationsDemonstrator: React.FC<
  InverseOperationsDemonstratorProps
> = ({ className = '' }) => {
  const [selectedOperation, setSelectedOperation] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  const operationPairs: OperationPair[] = [
    {
      operation: 'Addition',
      inverse: 'Subtraction',
      symbol: '+',
      inverseSymbol: '−',
      example: {
        equation: 'x + 7 = 12',
        step1: 'x + 7 − 7 = 12 − 7',
        step2: 'x + 0 = 5',
        solution: 'x = 5',
      },
    },
    {
      operation: 'Subtraction',
      inverse: 'Addition',
      symbol: '−',
      inverseSymbol: '+',
      example: {
        equation: 'x − 4 = 9',
        step1: 'x − 4 + 4 = 9 + 4',
        step2: 'x + 0 = 13',
        solution: 'x = 13',
      },
    },
    {
      operation: 'Multiplication',
      inverse: 'Division',
      symbol: '×',
      inverseSymbol: '÷',
      example: {
        equation: '3x = 15',
        step1: '3x ÷ 3 = 15 ÷ 3',
        step2: '1x = 5',
        solution: 'x = 5',
      },
    },
    {
      operation: 'Division',
      inverse: 'Multiplication',
      symbol: '÷',
      inverseSymbol: '×',
      example: {
        equation: 'x ÷ 2 = 8',
        step1: 'x ÷ 2 × 2 = 8 × 2',
        step2: 'x × 1 = 16',
        solution: 'x = 16',
      },
    },
  ];

  const currentPair = operationPairs[selectedOperation];

  const resetDemo = () => {
    setShowSolution(false);
  };

  const nextStep = () => {
    setShowSolution(true);
  };

  return (
    <div
      className={`p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
          Inverse Operations: Operations That "Undo" Each Other
        </h3>
        <p className='text-sm text-gray-600 dark:text-gray-300'>
          Learn how inverse operations help us solve equations by canceling out
          unwanted terms.
        </p>
      </div>

      {/* Operation selector */}
      <div className='mb-6'>
        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
          Choose an operation to see its inverse:
        </label>
        <div className='grid grid-cols-2 gap-2 md:grid-cols-4'>
          {operationPairs.map((pair, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedOperation(index);
                setShowSolution(false);
              }}
              className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm ${
                selectedOperation === index
                  ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-bold'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-500'
              }`}
            >
              <div className='text-center'>
                <div className='font-medium'>{pair.operation}</div>
                <div className='text-2xl my-1'>{pair.symbol}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Inverse relationship display */}
      <div className='mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg'>
        <div className='flex items-center justify-center space-x-4'>
          <div className='text-center'>
            <div className='text-lg font-bold text-purple-700 dark:text-purple-300'>
              {currentPair.operation}
            </div>
            <div className='text-3xl text-purple-600 dark:text-purple-400 my-2'>
              {currentPair.symbol}
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            <div className='text-2xl text-gray-500'>⟷</div>
            <div className='text-sm text-gray-600 dark:text-gray-400 font-medium'>
              undoes
            </div>
          </div>
          <div className='text-center'>
            <div className='text-lg font-bold text-pink-700 dark:text-pink-300'>
              {currentPair.inverse}
            </div>
            <div className='text-3xl text-pink-600 dark:text-pink-400 my-2'>
              {currentPair.inverseSymbol}
            </div>
          </div>
        </div>
      </div>

      {/* Example equation solving */}
      <div className='mb-6'>
        <h4 className='text-md font-medium text-gray-900 dark:text-white mb-4'>
          Example: Solving with Inverse Operations
        </h4>
        <div className='space-y-4'>
          {/* Original equation */}
          <div className='p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-gray-200 dark:border-gray-600'>
            <div className='text-center'>
              <div className='text-sm text-gray-600 dark:text-gray-400 mb-1'>
                Original Equation:
              </div>
              <div className='text-2xl font-mono text-gray-900 dark:text-white'>
                {currentPair.example.equation}
              </div>
            </div>
          </div>

          {/* Solution steps */}
          {showSolution && (
            <>
              <div className='flex justify-center'>
                <div className='text-lg text-blue-600 dark:text-blue-400'>
                  ↓
                </div>
              </div>
              <div className='p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800'>
                <div className='text-center'>
                  <div className='text-sm text-blue-600 dark:text-blue-400 mb-1'>
                    Apply inverse operation ({currentPair.inverse.toLowerCase()}
                    ) to both sides:
                  </div>
                  <div className='text-xl font-mono text-blue-800 dark:text-blue-200'>
                    {currentPair.example.step1}
                  </div>
                </div>
              </div>
              <div className='flex justify-center'>
                <div className='text-lg text-green-600 dark:text-green-400'>
                  ↓
                </div>
              </div>
              <div className='p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800'>
                <div className='text-center'>
                  <div className='text-sm text-green-600 dark:text-green-400 mb-1'>
                    Simplify:
                  </div>
                  <div className='text-xl font-mono text-green-800 dark:text-green-200'>
                    {currentPair.example.step2}
                  </div>
                </div>
              </div>
              <div className='flex justify-center'>
                <div className='text-lg text-purple-600 dark:text-purple-400'>
                  ↓
                </div>
              </div>
              <div className='p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-800'>
                <div className='text-center'>
                  <div className='text-sm text-purple-600 dark:text-purple-400 mb-1'>
                    Solution:
                  </div>
                  <div className='text-2xl font-mono font-bold text-purple-800 dark:text-purple-200'>
                    {currentPair.example.solution}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className='flex justify-center gap-3 mb-6'>
        <button
          onClick={resetDemo}
          className='px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors'
        >
          Reset
        </button>
        <button
          onClick={nextStep}
          disabled={showSolution}
          className='px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors'
        >
          Show Solution Steps
        </button>
      </div>

      {/* Inverse operations reference */}
      <div className='p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg'>
        <div className='text-sm text-yellow-800 dark:text-yellow-200'>
          <div className='font-medium mb-2'>🔄 Inverse Operations Pairs:</div>
          <div className='grid grid-cols-2 gap-2 text-xs'>
            <div>• Addition ⟷ Subtraction</div>
            <div>• Multiplication ⟷ Division</div>
            <div>• Squaring ⟷ Square Root</div>
            <div>• Exponents ⟷ Logarithms</div>
          </div>
          <div className='mt-2 text-xs'>
            <strong>Key Rule:</strong> Whatever operation is done to the
            variable, use its inverse to "undo" it and isolate the variable.
          </div>
        </div>
      </div>
    </div>
  );
};
