/**
 * AbsoluteValueVisualizer - Simple visual demonstration of absolute value as distance from zero
 * Shows how absolute value represents distance on a number line
 */

import React, { useState } from 'react';

interface AbsoluteValueVisualizerProps {
  className?: string;
}

export const AbsoluteValueVisualizer: React.FC<
  AbsoluteValueVisualizerProps
> = ({ className = '' }) => {
  const [selectedNumber, setSelectedNumber] = useState(-5);

  // Generate number line from -10 to 10
  const numbers = Array.from({ length: 21 }, (_, i) => i - 10);

  const getAbsoluteValue = (num: number) => Math.abs(num);

  const renderNumberLine = () => {
    return (
      <div className='relative'>
        {/* Number line */}
        <div className='flex items-center justify-center mb-4'>
          <div className='relative w-full max-w-4xl'>
            {/* Main line */}
            <div className='absolute top-1/2 left-0 right-0 h-0.5 bg-gray-400 dark:bg-gray-500 transform -translate-y-1/2'></div>

            {/* Number markers - all numbers including zero */}
            <div className='flex justify-between items-center relative'>
              {numbers.map(num => {
                const isSelected = num === selectedNumber;
                const isZero = num === 0;

                return (
                  <div
                    key={num}
                    className='relative flex flex-col items-center'
                  >
                    {/* Tick mark */}
                    <div
                      className={`w-0.5 h-4 ${
                        isZero
                          ? 'bg-red-500 dark:bg-red-400 w-1 h-8'
                          : isSelected
                            ? 'bg-blue-600 dark:bg-blue-400'
                            : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    ></div>

                    {/* Number label */}
                    <div
                      className={`mt-1 text-xs ${
                        isZero
                          ? 'font-bold text-red-600 dark:text-red-400'
                          : isSelected
                            ? 'font-bold text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {num}
                    </div>

                    {/* Selected number indicator */}
                    {isSelected && !isZero && (
                      <>
                        <div className='absolute -top-2 w-3 h-3 bg-blue-600 dark:bg-blue-400 rounded-full'></div>
                        <div className='absolute top-8 text-xs font-bold text-blue-600 dark:text-blue-400'>
                          Selected
                        </div>
                      </>
                    )}

                    {/* Zero special indicator */}
                    {isZero && selectedNumber === 0 && (
                      <div className='absolute top-12 text-xs font-bold text-red-600 dark:text-red-400'>
                        Selected
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Distance visualization with arrows */}
            {selectedNumber !== 0 && (
              <div className='absolute top-12 left-1/2 transform -translate-x-1/2'>
                <div className='flex items-center justify-center'>
                  {/* Left arrow for negative numbers */}
                  {selectedNumber < 0 && (
                    <div className='flex items-center'>
                      <div className='text-green-600 dark:text-green-400 text-lg mr-1'>
                        ←
                      </div>
                      <div className='text-sm text-green-600 dark:text-green-400 font-medium'>
                        {getAbsoluteValue(selectedNumber)} units
                      </div>
                      <div className='text-green-600 dark:text-green-400 text-lg ml-1'>
                        →
                      </div>
                    </div>
                  )}

                  {/* Right arrow for positive numbers */}
                  {selectedNumber > 0 && (
                    <div className='flex items-center'>
                      <div className='text-green-600 dark:text-green-400 text-lg mr-1'>
                        ←
                      </div>
                      <div className='text-sm text-green-600 dark:text-green-400 font-medium'>
                        {getAbsoluteValue(selectedNumber)} units
                      </div>
                      <div className='text-green-600 dark:text-green-400 text-lg ml-1'>
                        →
                      </div>
                    </div>
                  )}
                </div>
                <div className='text-center mt-3 text-xs text-green-600 dark:text-green-400'>
                  Distance from zero
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
          Absolute Value: Distance from Zero
        </h3>
        <p className='text-sm text-gray-600 dark:text-gray-300'>
          Absolute value measures how far a number is from zero, regardless of
          direction.
        </p>
      </div>

      {/* Number selector */}
      <div className='mb-8'>
        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
          Choose a number to see its absolute value:
        </label>
        <div className='flex flex-wrap gap-2 justify-center'>
          {[-8, -5, -3, -1, 0, 1, 3, 5, 8].map(num => (
            <button
              key={num}
              onClick={() => setSelectedNumber(num)}
              className={`px-3 py-2 rounded-lg border-2 transition-all duration-200 ${
                selectedNumber === num
                  ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-bold'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-500'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Number line visualization */}
      <div className='mb-8'>{renderNumberLine()}</div>

      {/* Explanation */}
      <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4'>
        <div className='text-center'>
          <div className='text-lg font-mono text-gray-900 dark:text-white mb-2'>
            |{selectedNumber}| = {getAbsoluteValue(selectedNumber)}
          </div>
          <div className='text-sm text-gray-600 dark:text-gray-300'>
            {selectedNumber === 0
              ? 'Zero is exactly 0 units away from itself.'
              : selectedNumber > 0
                ? `${selectedNumber} is ${getAbsoluteValue(selectedNumber)} units to the right of zero.`
                : `${selectedNumber} is ${getAbsoluteValue(selectedNumber)} units to the left of zero.`}
          </div>
        </div>
      </div>

      {/* Key concepts */}
      <div className='mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg'>
        <div className='text-sm text-yellow-800 dark:text-yellow-200'>
          <div className='font-medium mb-2'>💡 Key Points:</div>
          <ul className='list-disc list-inside space-y-1 text-xs'>
            <li>Absolute value is always non-negative (positive or zero)</li>
            <li>|5| = 5 and |-5| = 5 because both are 5 units from zero</li>
            <li>Distance has no direction - it's always positive</li>
            <li>The absolute value bars | | mean "distance from zero"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
