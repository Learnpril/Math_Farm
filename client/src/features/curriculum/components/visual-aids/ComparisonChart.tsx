import { useState } from 'react';

interface ComparisonChartProps {
  numbers?: number[];
  interactive?: boolean;
  className?: string;
}

export function ComparisonChart({
  numbers = [1234, 1243],
  interactive = false,
  className = '',
}: ComparisonChartProps) {
  const [comparisonStep, setComparisonStep] = useState<number>(0);
  const [showResult, setShowResult] = useState<boolean>(false);

  // Ensure we have exactly 2 numbers for comparison
  const [num1, num2] = numbers.slice(0, 2);

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
                      border border-gray-300 dark:border-gray-600 p-2 text-xs font-medium
                      ${
                        comparisonStep === index
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                          : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }
                    `}
                  >
                    {place}
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
                            ? digits1[index] > digits2[index]
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
                            ? digits2[index] > digits1[index]
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

      {/* Interactive controls */}
      {interactive && (
        <div className='mb-6 flex flex-wrap gap-2 justify-center'>
          {digits1.map((_, index) => (
            <button
              key={index}
              className={`
                px-3 py-1 rounded text-sm font-medium transition-all
                ${
                  comparisonStep === index
                    ? 'bg-yellow-500 text-white'
                    : comparisonStep > index
                      ? 'bg-gray-400 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                }
              `}
              onClick={() => handleStepClick(index)}
            >
              Step {index + 1}
            </button>
          ))}
          <button
            className='px-3 py-1 rounded text-sm font-medium bg-purple-500 text-white hover:bg-purple-600'
            onClick={resetComparison}
          >
            Reset
          </button>
        </div>
      )}

      {/* Current step explanation */}
      {comparisonStep < digits1.length && !showResult && (
        <div className='mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg'>
          <p className='text-sm text-yellow-800 dark:text-yellow-200'>
            <strong>Step {comparisonStep + 1}:</strong> Compare the{' '}
            {relevantPlaces[comparisonStep]} place.
            {digits1[comparisonStep] === digits2[comparisonStep]
              ? ` Both numbers have ${digits1[comparisonStep]} in this place, so we continue to the next place.`
              : ` ${digits1[comparisonStep]} ${digits1[comparisonStep] > digits2[comparisonStep] ? '>' : '<'} ${digits2[comparisonStep]}, so ${num1.toLocaleString()} is ${digits1[comparisonStep] > digits2[comparisonStep] ? 'greater than' : 'less than'} ${num2.toLocaleString()}.`}
          </p>
        </div>
      )}

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
          <p className='text-lg font-bold'>
            {num1.toLocaleString()}{' '}
            {result === 'greater' ? '>' : result === 'less' ? '<' : '='}{' '}
            {num2.toLocaleString()}
          </p>
          <p className='text-sm mt-2'>
            {result === 'equal'
              ? 'The numbers are equal!'
              : `${num1.toLocaleString()} is ${result} than ${num2.toLocaleString()}`}
          </p>
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
