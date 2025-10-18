import { useState } from 'react';

interface PlaceValueChartProps {
  number?: string;
  interactive?: boolean;
  className?: string;
}

export function PlaceValueChart({
  number = '3,847,205',
  interactive = true,
  className = '',
}: PlaceValueChartProps) {
  const [highlightedPlace, setHighlightedPlace] = useState<number | null>(null);

  const placeNames = [
    'Millions',
    'Hundred Thousands',
    'Ten Thousands',
    'Thousands',
    'Hundreds',
    'Tens',
    'Ones',
  ];

  const placeValues = [1000000, 100000, 10000, 1000, 100, 10, 1];

  // Remove commas and pad number with leading zeros to show all places
  const cleanNumber = number.replace(/,/g, '');
  const paddedNumber = cleanNumber.padStart(7, '0');
  const digits = paddedNumber.split('');

  // Format the number for display
  const formattedNumber = parseInt(cleanNumber).toLocaleString();

  const handlePlaceClick = (index: number) => {
    if (interactive) {
      setHighlightedPlace(highlightedPlace === index ? null : index);
    }
  };

  return (
    <div
      className={`place-value-chart bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}
    >
      <h4 className='text-lg font-semibold mb-6 text-center text-gray-800 dark:text-gray-200'>
        Place Value Chart
      </h4>

      {/* Number Format Explanation */}
      <div className='mb-6 space-y-4'>
        <div className='p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
          <h5 className='text-sm font-bold text-blue-800 dark:text-blue-200 mb-3'>
            📝 How We Write This Number:
          </h5>
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-blue-700 dark:text-blue-300'>
                Standard Form:
              </span>
              <span className='text-xl font-bold text-blue-800 dark:text-blue-200'>
                {formattedNumber}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-blue-700 dark:text-blue-300'>
                Word Form:
              </span>
              <span className='text-sm font-medium text-blue-800 dark:text-blue-200'>
                {cleanNumber === '3847205'
                  ? 'Three million, eight hundred forty-seven thousand, two hundred five'
                  : 'Number in words'}
              </span>
            </div>
          </div>
        </div>

        <div className='p-4 bg-green-50 dark:bg-green-900/20 rounded-lg'>
          <h5 className='text-sm font-bold text-green-800 dark:text-green-200 mb-3'>
            🎯 What the Place Value Chart Shows:
          </h5>
          <div className='text-sm text-green-700 dark:text-green-300 space-y-1'>
            <p>
              • Each digit has a specific <strong>position</strong> that
              determines its value
            </p>
            <p>
              • The same digit (like "3") can have different values depending on
              its position
            </p>
            <p>
              • Moving left makes each position 10 times larger than the
              previous one
            </p>
            <p>• This is why we call it the "base-10" or "decimal" system</p>
          </div>
        </div>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full border-collapse'>
          <thead>
            <tr>
              {placeNames.map((name, index) => (
                <th
                  key={index}
                  className={`
                    border border-gray-300 dark:border-gray-600 p-2 text-xs font-medium
                    ${
                      highlightedPlace === index
                        ? 'bg-purple-600 dark:bg-purple-900/30 text-white dark:text-purple-200'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }
                    ${interactive ? 'cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20' : ''}
                  `}
                  onClick={() => handlePlaceClick(index)}
                >
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {digits.map((digit, index) => (
                <td
                  key={index}
                  className={`
                    border border-gray-300 dark:border-gray-600 p-4 text-center text-2xl font-bold
                    ${
                      highlightedPlace === index
                        ? 'bg-purple-600 dark:bg-purple-900/30 text-white dark:text-purple-200'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                    }
                    ${interactive ? 'cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20' : ''}
                  `}
                  onClick={() => handlePlaceClick(index)}
                >
                  {digit}
                </td>
              ))}
            </tr>
            <tr>
              {placeValues.map((value, index) => (
                <td
                  key={index}
                  className={`
                    border border-gray-300 dark:border-gray-600 p-2 text-center text-xs
                    ${
                      highlightedPlace === index
                        ? 'bg-purple-600 dark:bg-purple-900/30 text-white dark:text-purple-200'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }
                    ${interactive ? 'cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20' : ''}
                  `}
                  onClick={() => handlePlaceClick(index)}
                >
                  {value.toLocaleString()}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {highlightedPlace !== null && (
        <div className='mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-400'>
          <div className='space-y-2'>
            <p className='text-sm font-bold text-purple-800 dark:text-purple-200'>
              🔍 Analyzing the {placeNames[highlightedPlace]} Place:
            </p>
            <div className='text-sm text-purple-700 dark:text-purple-300 space-y-1'>
              <p>
                • <strong>Digit:</strong> {digits[highlightedPlace]}
              </p>
              <p>
                • <strong>Position:</strong>{' '}
                {placeNames[highlightedPlace] || 'Unknown'} place
              </p>
              <p>
                • <strong>Place Value:</strong>{' '}
                {placeValues[highlightedPlace]?.toLocaleString() || '0'}
              </p>
              <p>
                • <strong>Actual Value:</strong>{' '}
                {digits[highlightedPlace] || '0'} ×{' '}
                {placeValues[highlightedPlace]?.toLocaleString() || '0'} ={' '}
                <strong>
                  {(
                    parseInt(digits[highlightedPlace] || '0') *
                    (placeValues[highlightedPlace] || 0)
                  ).toLocaleString()}
                </strong>
              </p>
            </div>
            <div className='mt-2 p-2 bg-purple-100 dark:bg-purple-800/30 rounded text-xs text-purple-800 dark:text-purple-200'>
              💡 <strong>Remember:</strong> The digit{' '}
              {digits[highlightedPlace] || '0'} by itself is just{' '}
              {digits[highlightedPlace] || '0'}, but in the{' '}
              {placeNames[highlightedPlace]?.toLowerCase() || 'current'} place,
              it represents{' '}
              {(
                parseInt(digits[highlightedPlace] || '0') *
                (placeValues[highlightedPlace] || 0)
              ).toLocaleString()}
              !
            </div>
          </div>
        </div>
      )}

      {/* Complete Number Breakdown */}
      <div className='mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg'>
        <h5 className='text-sm font-bold text-yellow-800 dark:text-yellow-200 mb-3'>
          🧮 Complete Number Breakdown:
        </h5>
        <div className='space-y-2'>
          <div className='text-sm text-yellow-700 dark:text-yellow-300'>
            <p className='font-medium mb-2'>Breaking down {formattedNumber}:</p>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs'>
              {digits
                .map((digit, index) => {
                  const value = parseInt(digit) * (placeValues[index] || 0);
                  if (value === 0) return null;
                  return (
                    <div
                      key={index}
                      className='flex justify-between items-center bg-yellow-100 dark:bg-yellow-800/30 px-2 py-1 rounded'
                    >
                      <span>
                        {digit} × {placeValues[index]?.toLocaleString() || '0'}
                      </span>
                      <span className='font-bold'>
                        {value.toLocaleString()}
                      </span>
                    </div>
                  );
                })
                .filter(Boolean)}
            </div>
          </div>
          <div className='mt-3 pt-2 border-t border-yellow-300 dark:border-yellow-600'>
            <p className='text-sm font-bold text-yellow-800 dark:text-yellow-200'>
              Total:{' '}
              {digits
                .map(
                  (digit, index) => parseInt(digit) * (placeValues[index] || 0)
                )
                .filter(val => val > 0)
                .map(val => val.toLocaleString())
                .join(' + ')}{' '}
              = {formattedNumber}
            </p>
          </div>
        </div>
      </div>

      {/* Position Matters Example */}
      <div className='mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg'>
        <h5 className='text-sm font-bold text-red-800 dark:text-red-200 mb-3'>
          ⚡ Why Position Matters:
        </h5>
        <div className='text-sm text-red-700 dark:text-red-300 space-y-2'>
          <p>
            Notice how the digit <strong>"3"</strong> appears in our number{' '}
            {formattedNumber}:
          </p>
          <div className='bg-red-100 dark:bg-red-800/30 p-3 rounded'>
            <p>
              • In the <strong>millions</strong> place: 3 ={' '}
              <strong>3,000,000</strong> (three million)
            </p>
            <p>
              • If it were in the <strong>hundreds</strong> place: 3 ={' '}
              <strong>300</strong> (three hundred)
            </p>
            <p>
              • If it were in the <strong>ones</strong> place: 3 ={' '}
              <strong>3</strong> (three)
            </p>
          </div>
          <p className='font-medium'>
            The same digit has completely different values depending on its
            position!
          </p>
        </div>
      </div>

      {interactive && (
        <div className='mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center'>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            💡 <strong>Interactive:</strong> Click on any place in the chart
            above to explore its value
          </p>
        </div>
      )}
    </div>
  );
}
