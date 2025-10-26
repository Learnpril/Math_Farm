/**
 * DirectInverseComparison - Simple visual showing direct vs inverse relationships
 * Shows the key differences between direct and inverse proportional relationships
 */
import React from 'react';

interface DirectInverseComparisonProps {
  className?: string;
}

export const DirectInverseComparison: React.FC<
  DirectInverseComparisonProps
> = ({ className = '' }) => {
  return (
    <div
      className={`p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
          Direct vs Inverse Relationships
        </h3>
        <p className='text-sm text-gray-600 dark:text-gray-300'>
          Understanding how quantities change in relation to each other
        </p>
      </div>

      {/* Comparison grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
        {/* Direct Proportion */}
        <div className='p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800'>
          <div className='text-center mb-4'>
            <h4 className='text-lg font-bold text-green-700 dark:text-green-300 mb-2'>
              Direct Proportion
            </h4>
            <div className='text-sm text-green-600 dark:text-green-400 mb-3'>
              Both quantities change in the <strong>same direction</strong>
            </div>
          </div>

          {/* Visual representation */}
          <div className='mb-4'>
            <div className='flex items-center justify-center space-x-2 mb-2'>
              <div className='text-sm text-green-600 dark:text-green-400'>
                When one ↑
              </div>
              <div className='text-lg'>→</div>
              <div className='text-sm text-green-600 dark:text-green-400'>
                other ↑
              </div>
            </div>
            <div className='flex items-center justify-center space-x-2'>
              <div className='text-sm text-green-600 dark:text-green-400'>
                When one ↓
              </div>
              <div className='text-lg'>→</div>
              <div className='text-sm text-green-600 dark:text-green-400'>
                other ↓
              </div>
            </div>
          </div>

          {/* Formula */}
          <div className='text-center mb-3'>
            <div className='text-lg font-mono bg-white dark:bg-gray-700 p-2 rounded border'>
              y = kx
            </div>
            <div className='text-xs text-green-600 dark:text-green-400 mt-1'>
              k is constant
            </div>
          </div>

          {/* Example */}
          <div className='text-sm text-green-700 dark:text-green-300'>
            <div className='font-medium mb-1'>Example:</div>
            <div>More hours worked → More pay</div>
            <div>More distance → More time</div>
          </div>
        </div>

        {/* Inverse Proportion */}
        <div className='p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800'>
          <div className='text-center mb-4'>
            <h4 className='text-lg font-bold text-red-700 dark:text-red-300 mb-2'>
              Inverse Proportion
            </h4>
            <div className='text-sm text-red-600 dark:text-red-400 mb-3'>
              Quantities change in <strong>opposite directions</strong>
            </div>
          </div>

          {/* Visual representation */}
          <div className='mb-4'>
            <div className='flex items-center justify-center space-x-2 mb-2'>
              <div className='text-sm text-red-600 dark:text-red-400'>
                When one ↑
              </div>
              <div className='text-lg'>→</div>
              <div className='text-sm text-red-600 dark:text-red-400'>
                other ↓
              </div>
            </div>
            <div className='flex items-center justify-center space-x-2'>
              <div className='text-sm text-red-600 dark:text-red-400'>
                When one ↓
              </div>
              <div className='text-lg'>→</div>
              <div className='text-sm text-red-600 dark:text-red-400'>
                other ↑
              </div>
            </div>
          </div>

          {/* Formula */}
          <div className='text-center mb-3'>
            <div className='text-lg font-mono bg-white dark:bg-gray-700 p-2 rounded border'>
              xy = k
            </div>
            <div className='text-xs text-red-600 dark:text-red-400 mt-1'>
              k is constant
            </div>
          </div>

          {/* Example */}
          <div className='text-sm text-red-700 dark:text-red-300'>
            <div className='font-medium mb-1'>Example:</div>
            <div>More workers → Less time</div>
            <div>Higher speed → Less time</div>
          </div>
        </div>
      </div>

      {/* Quick identification guide */}
      <div className='mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
        <h4 className='text-md font-medium text-blue-900 dark:text-blue-100 mb-3'>
          How to Identify the Relationship:
        </h4>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
          <div>
            <div className='font-medium text-green-700 dark:text-green-300 mb-1'>
              Direct Proportion:
            </div>
            <div className='text-blue-700 dark:text-blue-300'>
              "More of A means more of B"
              <br />
              "Less of A means less of B"
            </div>
          </div>
          <div>
            <div className='font-medium text-red-700 dark:text-red-300 mb-1'>
              Inverse Proportion:
            </div>
            <div className='text-blue-700 dark:text-blue-300'>
              "More of A means less of B"
              <br />
              "Less of A means more of B"
            </div>
          </div>
        </div>
      </div>

      {/* Key concept */}
      <div className='p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg'>
        <div className='text-sm text-yellow-800 dark:text-yellow-200 text-center'>
          <strong>Key Idea:</strong> In direct relationships, quantities move
          together. In inverse relationships, quantities move in opposite
          directions.
        </div>
      </div>
    </div>
  );
};
