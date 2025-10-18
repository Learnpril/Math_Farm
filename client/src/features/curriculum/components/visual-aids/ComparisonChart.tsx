import { useState } from 'react';

interface ComparisonChartProps {
  numbers?: number[];
  interactive?: boolean;
  className?: string;
}

export function ComparisonChart({
  numbers = [1234, 1243],
  interactive = true,
  className = '',
}: ComparisonChartProps) {
  const [comparisonStep, setComparisonStep] = useState<number>(0);
  const [showResult, setShowResult] = useState<boolean>(false);

  // Ensure we have exactly 2 numbers for comparison
  const [num1, num2] = numbers.slice(0, 2);

  // Handle case where numbers might be undefined
  if (num1 === undefined || num2 === undefined) {
    return (
      <div
        className={`comparison-chart bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
      >
        <p className='text-center text-gray-500 dark:text-gray-400'>
          Please provide two numbers to compare.
        </p>
      </div>
    );
  }

  // Pad numbers to same length for comparison
  const maxLength = Math.max(num1.toString().length, num2.toString().length);
  const digits1 = num1
    .toString()
    .padStart(maxLength, '0')
    .split('')
    .map(Number);
  const digits2 = num2
    .toString()
    .padStart(maxLength, '0')
    .split('')
    .map(Number);

  const placeNames = [
    'millions',
    'hundred thousands',
    'ten thousands',
    'thousands',
    'hundreds',
    'tens',
    'ones',
  ];
  const relevantPlaces = placeNames.slice(-maxLength);

  // Find the first position where digits differ
  let firstDifferentIndex = -1;
  for (let i = 0; i < digits1.length; i++) {
    if (digits1[i] !== digits2[i]) {
      firstDifferentIndex = i;
      break;
    }
  }

  const result = num1 > num2 ? 'greater' : num1 < num2 ? 'less' : 'equal';

  const handleStepClick = (step: number) => {
    if (interactive) {
      setComparisonStep(step);
      if (step >= digits1.length || firstDifferentIndex === step) {
        setShowResult(true);
      } else {
        setShowResult(false);
      }
    }
  };

  const resetComparison = () => {
    setComparisonStep(0);
    setShowResult(false);
  };

  return (
    <div
      className={`comparison-chart bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      <h4 className='text-lg font-semibold mb-6 text-center text-gray-800 dark:text-gray-200'>
        Comparing {num1.toLocaleString()} and {num2.toLocaleString()}
      </h4>

      {/* Numbers display */}
      <div className='mb-6'>
        <div className='grid grid-cols-2 gap-4 mb-4'>
          <div className='text-center'>
            <h5 className='text-sm font-medium text-gray-600 dark:text-gray-400 mb-2'>
              First Number
            </h5>
            <div className='text-3xl font-bold text-blue-600 dark:text-blue-400'>
              {num1.toLocaleString()}
            </div>
          </div>
          <div className='text-center'>
            <h5 className='text-sm font-medium text-gray-600 dark:text-gray-400 mb-2'>
              Second Number
            </h5>
            <div className='text-3xl font-bold text-green-600 dark:text-green-400'>
              {num2.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-step comparison */}
      <div className='mb-6'>
        <h5 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
          Step-by-step Comparison:
        </h5>

        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr>
                {relevantPlaces.map((place, index) => (
                  <th
                    key={index}
                    className={`
                      border border-gray-300 dark:border-gray-600 p-2 text-xs font-medium relative
                      ${
                        comparisonStep === index
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                          : comparisonStep > index &&
                              firstDifferentIndex === index
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200'
                            : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }
                    `}
                  >
                    {place}
                    {comparisonStep === index && (
                      <div className='absolute -top-2 left-1/2 transform -translate-x-1/2'>
                        <div className='w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-yellow-500'></div>
                      </div>
                    )}
                    {comparisonStep > index &&
                      firstDifferentIndex === index && (
                        <div className='absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-purple-600 text-xs'>
                          ⭐
                        </div>
                      )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {digits1.map((digit, index) => (
                  <td
                    key={`num1-${index}`}
                    className={`
                      border border-gray-300 dark:border-gray-600 p-3 text-center text-xl font-bold
                      ${
                        comparisonStep === index
                          ? 'bg-yellow-100 dark:bg-yellow-900/30'
                          : comparisonStep > index &&
                              firstDifferentIndex === index
                            ? (digits1[index] ?? 0) > (digits2[index] ?? 0)
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                            : 'bg-blue-50 dark:bg-blue-900/20'
                      } text-blue-700 dark:text-blue-300
                    `}
                  >
                    {digit}
                  </td>
                ))}
              </tr>
              <tr>
                {digits2.map((digit, index) => (
                  <td
                    key={`num2-${index}`}
                    className={`
                      border border-gray-300 dark:border-gray-600 p-3 text-center text-xl font-bold
                      ${
                        comparisonStep === index
                          ? 'bg-yellow-100 dark:bg-yellow-900/30'
                          : comparisonStep > index &&
                              firstDifferentIndex === index
                            ? (digits2[index] ?? 0) > (digits1[index] ?? 0)
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                            : 'bg-green-50 dark:bg-green-900/20'
                      } text-green-700 dark:text-green-300
                    `}
                  >
                    {digit}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Progress indicator */}
      <div className='mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'>
        <div className='flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2'>
          <span>Comparison Progress</span>
          <span>
            {comparisonStep + 1} of {digits1.length} steps
          </span>
        </div>
        <div className='w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2'>
          <div
            className='bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300'
            style={{
              width: `${((comparisonStep + 1) / digits1.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Interactive controls */}
      {interactive && (
        <div className='mb-6 flex flex-wrap gap-2 justify-center'>
          {digits1.map((_, index) => (
            <button
              key={index}
              className={`
                px-3 py-2 rounded text-sm font-medium transition-all relative
                ${
                  comparisonStep === index
                    ? 'bg-yellow-500 text-white shadow-lg scale-105'
                    : comparisonStep > index
                      ? firstDifferentIndex === index
                        ? 'bg-purple-500 text-white'
                        : 'bg-green-400 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                }
              `}
              onClick={() => handleStepClick(index)}
            >
              {comparisonStep > index && firstDifferentIndex === index && '⭐ '}
              {comparisonStep > index && firstDifferentIndex !== index && '✓ '}
              Step {index + 1}
              <div className='text-xs opacity-75 mt-1'>
                {relevantPlaces[index] || `place ${index + 1}`}
              </div>
            </button>
          ))}
          <button
            className='px-4 py-2 rounded text-sm font-medium bg-purple-500 text-white hover:bg-purple-600 transition-all'
            onClick={resetComparison}
          >
            🔄 Reset
          </button>
        </div>
      )}

      {/* Current step explanation */}
      {comparisonStep < digits1.length && !showResult && (
        <div className='mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-400'>
          <div className='flex items-start space-x-3'>
            <div className='flex-shrink-0 w-8 h-8 bg-yellow-400 text-yellow-900 rounded-full flex items-center justify-center text-sm font-bold'>
              {comparisonStep + 1}
            </div>
            <div className='flex-1'>
              <p className='text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2'>
                Step {comparisonStep + 1}: Compare the{' '}
                {relevantPlaces[comparisonStep] || 'current'} place
              </p>
              <div className='text-sm text-yellow-700 dark:text-yellow-300'>
                <p className='mb-2'>
                  <strong>Looking at:</strong> {digits1[comparisonStep] || '0'}{' '}
                  (first number) vs {digits2[comparisonStep] || '0'} (second
                  number)
                </p>
                {digits1[comparisonStep] === digits2[comparisonStep] ? (
                  <div className='space-y-1'>
                    <p>
                      ✅ Both digits are the same ({digits1[comparisonStep]})
                    </p>
                    <p>
                      ➡️ Continue to the next place value to find a difference
                    </p>
                  </div>
                ) : (
                  <div className='space-y-1'>
                    <p>
                      🎯 Found a difference! {digits1[comparisonStep] ?? 0}{' '}
                      {(digits1[comparisonStep] ?? 0) >
                      (digits2[comparisonStep] ?? 0)
                        ? '>'
                        : '<'}{' '}
                      {digits2[comparisonStep] ?? 0}
                    </p>
                    <p className='font-semibold'>
                      📝 Therefore: {num1.toLocaleString()}{' '}
                      {(digits1[comparisonStep] ?? 0) >
                      (digits2[comparisonStep] ?? 0)
                        ? '>'
                        : '<'}{' '}
                      {num2.toLocaleString()}
                    </p>
                    <p className='text-xs opacity-75'>
                      The digit in the{' '}
                      {relevantPlaces[comparisonStep] || 'current'} place
                      determines which number is larger.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Strategy Guide */}
      <div className='mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
        <h5 className='text-sm font-bold text-blue-800 dark:text-blue-200 mb-3'>
          🎯 How to Compare Numbers:
        </h5>
        <div className='text-xs text-blue-700 dark:text-blue-300 space-y-1'>
          <p>
            <strong>Step 1:</strong> Start from the leftmost digit (highest
            place value)
          </p>
          <p>
            <strong>Step 2:</strong> Compare digits in the same place value
            position
          </p>
          <p>
            <strong>Step 3:</strong> If digits are equal, move to the next place
            value
          </p>
          <p>
            <strong>Step 4:</strong> The first different digit determines which
            number is larger
          </p>
        </div>
      </div>

      {/* Inequality Symbols Reference */}
      <div className='mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg'>
        <h5 className='text-sm font-bold text-purple-800 dark:text-purple-200 mb-3'>
          📚 Comparison Symbols:
        </h5>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs'>
          <div className='flex items-center space-x-2'>
            <span className='text-2xl font-bold text-green-600'>&gt;</span>
            <span className='text-purple-700 dark:text-purple-300'>
              Greater than
            </span>
          </div>
          <div className='flex items-center space-x-2'>
            <span className='text-2xl font-bold text-red-600'>&lt;</span>
            <span className='text-purple-700 dark:text-purple-300'>
              Less than
            </span>
          </div>
          <div className='flex items-center space-x-2'>
            <span className='text-2xl font-bold text-blue-600'>=</span>
            <span className='text-purple-700 dark:text-purple-300'>
              Equal to
            </span>
          </div>
          <div className='flex items-center space-x-2'>
            <span className='text-2xl font-bold text-green-600'>≥</span>
            <span className='text-purple-700 dark:text-purple-300'>
              Greater than or equal
            </span>
          </div>
          <div className='flex items-center space-x-2'>
            <span className='text-2xl font-bold text-red-600'>≤</span>
            <span className='text-purple-700 dark:text-purple-300'>
              Less than or equal
            </span>
          </div>
          <div className='flex items-center space-x-2'>
            <span className='text-2xl font-bold text-gray-600'>≠</span>
            <span className='text-purple-700 dark:text-purple-300'>
              Not equal to
            </span>
          </div>
        </div>
        <div className='mt-3 p-2 bg-purple-100 dark:bg-purple-800/30 rounded text-xs text-purple-800 dark:text-purple-200'>
          <strong>Memory Tip:</strong> The symbol always "points" to the smaller
          number! Think of it like a hungry alligator that wants to eat the
          bigger number: 5 &gt; 3 (alligator eats 5)
        </div>
      </div>

      {/* Final result */}
      {showResult && (
        <div
          className={`
          p-4 rounded-lg text-center
          ${
            result === 'greater'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
              : result === 'less'
                ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                : 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
          }
        `}
        >
          <p className='text-2xl font-bold mb-2'>
            {num1.toLocaleString()}{' '}
            <span
              className={`
              ${result === 'greater' ? 'text-green-600' : result === 'less' ? 'text-red-600' : 'text-blue-600'}
            `}
            >
              {result === 'greater' ? '>' : result === 'less' ? '<' : '='}
            </span>{' '}
            {num2.toLocaleString()}
          </p>
          <p className='text-sm'>
            {result === 'equal'
              ? 'The numbers are equal!'
              : `${num1.toLocaleString()} is ${result} than ${num2.toLocaleString()}`}
          </p>
          {result !== 'equal' && (
            <p className='text-xs mt-2 opacity-75'>
              We found the difference in the{' '}
              {relevantPlaces[firstDifferentIndex] || 'identified'} place:{' '}
              {digits1[firstDifferentIndex]} {result === 'greater' ? '>' : '<'}{' '}
              {digits2[firstDifferentIndex]}
            </p>
          )}
        </div>
      )}

      {interactive && (
        <p className='text-xs text-gray-500 dark:text-gray-400 mt-4 text-center'>
          Click the step buttons to see the comparison process
        </p>
      )}
    </div>
  );
}
