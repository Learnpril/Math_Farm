import { useState } from 'react';

interface DecimalPlaceValueChartProps {
  number?: string;
  interactive?: boolean;
  className?: string;
}

export function DecimalPlaceValueChart({
  number = '123.456',
  interactive = false,
  className = '',
}: DecimalPlaceValueChartProps) {
  const [highlightedPlace, setHighlightedPlace] = useState<number | null>(null);

  // Split number into whole and decimal parts
  const [wholePart, decimalPart] = number.split('.');
  const wholeDigits = wholePart.padStart(3, '0').split('');
  const decimalDigits = (decimalPart || '')
    .padEnd(3, '0')
    .split('')
    .slice(0, 3);

  const placeNames = [
    'Hundreds',
    'Tens',
    'Ones',
    'Decimal Point',
    'Tenths',
    'Hundredths',
    'Thousandths',
  ];

  const placeValues = [100, 10, 1, null, 0.1, 0.01, 0.001];
  const allDigits = [...wholeDigits, '.', ...decimalDigits];

  const handlePlaceClick = (index: number) => {
    if (interactive && index !== 3) {
      // Don't highlight decimal point
      setHighlightedPlace(highlightedPlace === index ? null : index);
    }
  };

  const getDigitValue = (digit: string, placeValue: number | null) => {
    if (placeValue === null) return null;
    return parseFloat(digit) * placeValue;
  };

  return (
    <div
      className={`decimal-place-value bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      <h4 className='text-lg font-semibold mb-4 text-center text-gray-800 dark:text-gray-200'>
        Decimal Place Value Chart
      </h4>

      <div className='space-y-6'>
        {/* Place Value Chart */}
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr>
                {placeNames.map((name, index) => (
                  <th
                    key={index}
                    className={`
                      border border-gray-300 dark:border-gray-600 p-2 text-xs font-medium
                      ${index === 3 ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''}
                      ${
                        highlightedPlace === index
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200'
                          : index === 3
                            ? 'text-yellow-800 dark:text-yellow-200'
                            : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }
                      ${interactive && index !== 3 ? 'cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20' : ''}
                    `}
                    onClick={() => handlePlaceClick(index)}
                  >
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Digits Row */}
              <tr>
                {allDigits.map((digit, index) => (
                  <td
                    key={index}
                    className={`
                      border border-gray-300 dark:border-gray-600 p-4 text-center text-2xl font-bold
                      ${index === 3 ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200' : ''}
                      ${
                        highlightedPlace === index
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200'
                          : index === 3
                            ? ''
                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                      }
                      ${interactive && index !== 3 ? 'cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20' : ''}
                    `}
                    onClick={() => handlePlaceClick(index)}
                  >
                    {digit}
                  </td>
                ))}
              </tr>
              {/* Place Values Row */}
              <tr>
                {placeValues.map((value, index) => (
                  <td
                    key={index}
                    className={`
                      border border-gray-300 dark:border-gray-600 p-2 text-center text-xs
                      ${index === 3 ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''}
                      ${
                        highlightedPlace === index
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200'
                          : index === 3
                            ? 'text-yellow-800 dark:text-yellow-200'
                            : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }
                      ${interactive && index !== 3 ? 'cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20' : ''}
                    `}
                    onClick={() => handlePlaceClick(index)}
                  >
                    {value === null
                      ? '•'
                      : value >= 1
                        ? value.toString()
                        : `1/${1 / value}`}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Expanded Form */}
        <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4'>
          <h5 className='font-medium text-blue-800 dark:text-blue-200 mb-2'>
            Expanded Form:
          </h5>
          <div className='text-sm text-blue-700 dark:text-blue-300 space-y-1'>
            <div className='font-mono'>
              {number} ={' '}
              {wholeDigits
                .map((digit, i) => {
                  const value = getDigitValue(digit, placeValues[i]);
                  return value && value > 0 ? `${value}` : null;
                })
                .filter(Boolean)
                .join(' + ')}
              {decimalDigits.some(d => d !== '0') && ' + '}
              {decimalDigits
                .map((digit, i) => {
                  const value = getDigitValue(digit, placeValues[i + 4]);
                  return value && value > 0 ? `${value}` : null;
                })
                .filter(Boolean)
                .join(' + ')}
            </div>
          </div>
        </div>

        {/* Highlighted Place Information */}
        {highlightedPlace !== null && highlightedPlace !== 3 && (
          <div className='bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4'>
            <h5 className='font-medium text-purple-800 dark:text-purple-200 mb-2'>
              Selected Place:
            </h5>
            <div className='text-sm text-purple-700 dark:text-purple-300'>
              <div>
                <strong>{allDigits[highlightedPlace]}</strong> in the{' '}
                <strong>{placeNames[highlightedPlace]}</strong> place
              </div>
              <div>
                Value:{' '}
                <strong>
                  {getDigitValue(
                    allDigits[highlightedPlace],
                    placeValues[highlightedPlace]
                  )}
                </strong>
              </div>
              <div className='text-xs mt-1 text-purple-600 dark:text-purple-400'>
                {placeValues[highlightedPlace]! >= 1
                  ? `Each unit in this place is worth ${placeValues[highlightedPlace]}`
                  : `Each unit in this place is worth ${placeValues[highlightedPlace]} (or 1/${1 / placeValues[highlightedPlace]!})`}
              </div>
            </div>
          </div>
        )}

        {interactive && (
          <p className='text-xs text-gray-500 dark:text-gray-400 text-center'>
            Click on any digit to see its place value
          </p>
        )}
      </div>
    </div>
  );
}
