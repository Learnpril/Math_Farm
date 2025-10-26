/**
 * UnitRateComparison - Simple visual showing unit rate calculations and comparisons
 * Shows how to calculate and use unit rates for making decisions
 */
import React from 'react';

interface UnitRateComparisonProps {
  className?: string;
}

export const UnitRateComparison: React.FC<UnitRateComparisonProps> = ({
  className = '',
}) => {
  return (
    <div
      className={`p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
          Unit Rates: Comparing Options
        </h3>
        <p className='text-sm text-gray-600 dark:text-gray-300'>
          Unit rates help us compare different options by showing cost or value
          per single unit
        </p>
      </div>

      {/* What is a unit rate */}
      <div className='mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
        <h4 className='text-md font-medium text-blue-900 dark:text-blue-100 mb-3'>
          What is a Unit Rate?
        </h4>
        <div className='text-sm text-blue-700 dark:text-blue-300 mb-3'>
          A unit rate compares a quantity to <strong>exactly 1 unit</strong> of
          another quantity.
        </div>
        <div className='text-center p-3 bg-white dark:bg-gray-700 rounded border'>
          <div className='text-lg font-mono text-gray-900 dark:text-white'>
            Unit Rate ={' '}
            <span className='text-blue-600 dark:text-blue-400'>
              Total Quantity
            </span>{' '}
            ÷{' '}
            <span className='text-green-600 dark:text-green-400'>
              Number of Units
            </span>
          </div>
        </div>
      </div>

      {/* Shopping comparison example */}
      <div className='mb-6'>
        <h4 className='text-md font-medium text-gray-900 dark:text-white mb-4'>
          Example: Which is the Better Buy?
        </h4>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
          {/* Option A */}
          <div className='p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800'>
            <div className='text-center mb-3'>
              <div className='text-lg font-bold text-green-700 dark:text-green-300'>
                Option A
              </div>
              <div className='text-sm text-green-600 dark:text-green-400'>
                16 oz for $2.40
              </div>
            </div>

            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-green-700 dark:text-green-300'>
                  Total cost:
                </span>
                <span className='font-mono'>$2.40</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-green-700 dark:text-green-300'>
                  Total ounces:
                </span>
                <span className='font-mono'>16 oz</span>
              </div>
              <div className='border-t border-green-300 dark:border-green-700 pt-2'>
                <div className='flex justify-between font-bold'>
                  <span className='text-green-700 dark:text-green-300'>
                    Unit rate:
                  </span>
                  <span className='font-mono'>$2.40 ÷ 16 = $0.15/oz</span>
                </div>
              </div>
            </div>
          </div>

          {/* Option B */}
          <div className='p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800'>
            <div className='text-center mb-3'>
              <div className='text-lg font-bold text-red-700 dark:text-red-300'>
                Option B
              </div>
              <div className='text-sm text-red-600 dark:text-red-400'>
                20 oz for $2.80
              </div>
            </div>

            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-red-700 dark:text-red-300'>
                  Total cost:
                </span>
                <span className='font-mono'>$2.80</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-red-700 dark:text-red-300'>
                  Total ounces:
                </span>
                <span className='font-mono'>20 oz</span>
              </div>
              <div className='border-t border-red-300 dark:border-red-700 pt-2'>
                <div className='flex justify-between font-bold'>
                  <span className='text-red-700 dark:text-red-300'>
                    Unit rate:
                  </span>
                  <span className='font-mono'>$2.80 ÷ 20 = $0.14/oz</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Winner */}
        <div className='p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-center'>
          <div className='text-lg font-bold text-yellow-800 dark:text-yellow-200'>
            🏆 Option B is the better buy!
          </div>
          <div className='text-sm text-yellow-700 dark:text-yellow-300 mt-1'>
            $0.14 per ounce is less than $0.15 per ounce
          </div>
        </div>
      </div>

      {/* Common unit rates */}
      <div className='mb-6'>
        <h4 className='text-md font-medium text-gray-900 dark:text-white mb-3'>
          Common Unit Rates:
        </h4>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-3 text-sm'>
          <div className='p-2 bg-gray-50 dark:bg-gray-700 rounded text-center'>
            <div className='font-medium text-gray-900 dark:text-white'>
              Speed
            </div>
            <div className='text-gray-600 dark:text-gray-400'>miles/hour</div>
          </div>
          <div className='p-2 bg-gray-50 dark:bg-gray-700 rounded text-center'>
            <div className='font-medium text-gray-900 dark:text-white'>
              Price
            </div>
            <div className='text-gray-600 dark:text-gray-400'>$/pound</div>
          </div>
          <div className='p-2 bg-gray-50 dark:bg-gray-700 rounded text-center'>
            <div className='font-medium text-gray-900 dark:text-white'>
              Wages
            </div>
            <div className='text-gray-600 dark:text-gray-400'>$/hour</div>
          </div>
          <div className='p-2 bg-gray-50 dark:bg-gray-700 rounded text-center'>
            <div className='font-medium text-gray-900 dark:text-white'>
              Fuel
            </div>
            <div className='text-gray-600 dark:text-gray-400'>miles/gallon</div>
          </div>
        </div>
      </div>

      {/* Key steps */}
      <div className='p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg'>
        <h4 className='text-md font-medium text-purple-900 dark:text-purple-100 mb-3'>
          Steps to Compare Using Unit Rates:
        </h4>
        <div className='space-y-2 text-sm text-purple-700 dark:text-purple-300'>
          <div className='flex items-start space-x-2'>
            <div className='bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold'>
              1
            </div>
            <div>Calculate the unit rate for each option</div>
          </div>
          <div className='flex items-start space-x-2'>
            <div className='bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold'>
              2
            </div>
            <div>Compare the unit rates</div>
          </div>
          <div className='flex items-start space-x-2'>
            <div className='bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold'>
              3
            </div>
            <div>Choose the option with the better unit rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};
