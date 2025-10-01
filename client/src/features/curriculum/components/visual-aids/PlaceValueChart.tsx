import { useState } from 'react';

interface PlaceValueChartProps {
  number?: string;
  interactive?: boolean;
  className?: string;
}

export function PlaceValueChart({
  number = '1234567',
  interactive = false,
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

  // Pad number with leading zeros to show all places
  const paddedNumber = number.padStart(7, '0');
  const digits = paddedNumber.split('');

  const handlePlaceClick = (index: number) => {
    if (interactive) {
      setHighlightedPlace(highlightedPlace === index ? null : index);
    }
  };

  return (
    <div
      className={`place-value-chart bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}
    >
      <h4 className='text-lg font-semibold mb-4 text-center text-gray-800 dark:text-gray-200'>
        Place Value Chart
      </h4>

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
        <div className='mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg'>
          <p className='text-sm text-purple-800 dark:text-purple-200'>
            <strong>{digits[highlightedPlace]}</strong> in the{' '}
            <strong>{placeNames[highlightedPlace]}</strong> place has a value of{' '}
            <strong>
              {(
                parseInt(digits[highlightedPlace]) *
                placeValues[highlightedPlace]
              ).toLocaleString()}
            </strong>
          </p>
        </div>
      )}

      {interactive && (
        <p className='text-xs text-gray-500 dark:text-gray-400 mt-2 text-center'>
          Click on any place to see its value
        </p>
      )}
    </div>
  );
}
