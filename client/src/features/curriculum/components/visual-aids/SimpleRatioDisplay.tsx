/**
 * SimpleRatioDisplay - A simplified visual showing basic ratio concepts
 * Shows ratios in different forms without complex calculations
 */
import React from 'react';

interface SimpleRatioDisplayProps {
  className?: string;
}

export const SimpleRatioDisplay: React.FC<SimpleRatioDisplayProps> = ({
  className = '',
}) => {
  return (
    <div
      className={`p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
          Understanding Ratios
        </h3>
        <p className='text-sm text-gray-600 dark:text-gray-300'>
          Ratios compare quantities and can be written in different ways
        </p>
      </div>

      {/* Example ratio */}
      <div className='mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
        <div className='text-center mb-4'>
          <div className='text-sm text-blue-600 dark:text-blue-400 mb-2'>
            Example: 3 red circles to 2 blue circles
          </div>
          <div className='flex justify-center items-center space-x-2 mb-4'>
            <div className='flex space-x-1'>
              <div className='w-6 h-6 bg-red-500 rounded-full'></div>
              <div className='w-6 h-6 bg-red-500 rounded-full'></div>
              <div className='w-6 h-6 bg-red-500 rounded-full'></div>
            </div>
            <div className='text-gray-500 mx-2'>to</div>
            <div className='flex space-x-1'>
              <div className='w-6 h-6 bg-blue-500 rounded-full'></div>
              <div className='w-6 h-6 bg-blue-500 rounded-full'></div>
            </div>
          </div>
        </div>
      </div>

      {/* Different ways to write ratios */}
      <div className='mb-6'>
        <h4 className='text-md font-medium text-gray-900 dark:text-white mb-4'>
          Three Ways to Write the Same Ratio:
        </h4>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Colon notation */}
          <div className='p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800'>
            <div className='text-center'>
              <div className='text-sm text-green-600 dark:text-green-400 mb-2'>
                Colon Notation
              </div>
              <div className='text-2xl font-bold text-green-700 dark:text-green-300'>
                3 : 2
              </div>
              <div className='text-xs text-green-600 dark:text-green-400 mt-1'>
                Read as "3 to 2"
              </div>
            </div>
          </div>

          {/* Fraction notation */}
          <div className='p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800'>
            <div className='text-center'>
              <div className='text-sm text-purple-600 dark:text-purple-400 mb-2'>
                Fraction Notation
              </div>
              <div className='text-2xl font-bold text-purple-700 dark:text-purple-300'>
                ³⁄₂
              </div>
              <div className='text-xs text-purple-600 dark:text-purple-400 mt-1'>
                Read as "3 to 2"
              </div>
            </div>
          </div>

          {/* Word form */}
          <div className='p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800'>
            <div className='text-center'>
              <div className='text-sm text-orange-600 dark:text-orange-400 mb-2'>
                Word Form
              </div>
              <div className='text-lg font-bold text-orange-700 dark:text-orange-300'>
                3 to 2
              </div>
              <div className='text-xs text-orange-600 dark:text-orange-400 mt-1'>
                Written in words
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Types of ratios */}
      <div className='mb-6'>
        <h4 className='text-md font-medium text-gray-900 dark:text-white mb-4'>
          Types of Ratios:
        </h4>
        <div className='space-y-3'>
          <div className='p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'>
            <div className='flex justify-between items-center'>
              <div>
                <div className='font-medium text-gray-900 dark:text-white'>
                  Part-to-Part
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-400'>
                  Compares different parts
                </div>
              </div>
              <div className='text-lg font-mono text-gray-900 dark:text-white'>
                3 : 2
              </div>
            </div>
          </div>

          <div className='p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'>
            <div className='flex justify-between items-center'>
              <div>
                <div className='font-medium text-gray-900 dark:text-white'>
                  Part-to-Whole
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-400'>
                  Compares part to total
                </div>
              </div>
              <div className='text-lg font-mono text-gray-900 dark:text-white'>
                3 : 5
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key concept */}
      <div className='p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg'>
        <div className='text-sm text-yellow-800 dark:text-yellow-200 text-center'>
          <strong>Key Idea:</strong> Ratios show the relationship between
          quantities. They tell us "how many times" one quantity compares to
          another.
        </div>
      </div>
    </div>
  );
};
