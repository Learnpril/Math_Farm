/**
 * SimpleInverseOperations - A simplified visual showing inverse operations
 * Shows just the basic concept that operations "undo" each other
 */
import React from 'react';

interface SimpleInverseOperationsProps {
  className?: string;
}

export const SimpleInverseOperations: React.FC<
  SimpleInverseOperationsProps
> = ({ className = '' }) => {
  return (
    <div
      className={`p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
          Inverse Operations
        </h3>
        <p className='text-sm text-gray-600 dark:text-gray-300'>
          Operations that "undo" each other
        </p>
      </div>

      {/* Main inverse pairs display */}
      <div className='space-y-6'>
        {/* Addition and Subtraction */}
        <div className='flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
          <div className='flex items-center space-x-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1'>
                +
              </div>
              <div className='text-sm text-blue-700 dark:text-blue-300'>
                Addition
              </div>
            </div>
            <div className='text-2xl text-gray-500'>⟷</div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1'>
                −
              </div>
              <div className='text-sm text-blue-700 dark:text-blue-300'>
                Subtraction
              </div>
            </div>
          </div>
        </div>

        {/* Multiplication and Division */}
        <div className='flex items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg'>
          <div className='flex items-center space-x-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600 dark:text-green-400 mb-1'>
                ×
              </div>
              <div className='text-sm text-green-700 dark:text-green-300'>
                Multiplication
              </div>
            </div>
            <div className='text-2xl text-gray-500'>⟷</div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600 dark:text-green-400 mb-1'>
                ÷
              </div>
              <div className='text-sm text-green-700 dark:text-green-300'>
                Division
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simple example */}
      <div className='mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
        <div className='text-center'>
          <div className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
            Example:
          </div>
          <div className='text-lg font-mono text-gray-900 dark:text-white'>
            x + 5 = 12
          </div>
          <div className='text-sm text-gray-600 dark:text-gray-400 mt-2'>
            To solve: subtract 5 from both sides
          </div>
          <div className='text-lg font-mono text-gray-900 dark:text-white mt-1'>
            x = 7
          </div>
        </div>
      </div>

      {/* Key concept */}
      <div className='mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg'>
        <div className='text-sm text-yellow-800 dark:text-yellow-200 text-center'>
          <strong>Key Idea:</strong> To isolate a variable, use the inverse of
          whatever operation is being done to it.
        </div>
      </div>
    </div>
  );
};
