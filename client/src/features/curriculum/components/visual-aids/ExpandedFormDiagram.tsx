import { useState } from 'react';
import { MathExpression } from '../MathExpression';

interface ExpandedFormDiagramProps {
  number?: number;
  interactive?: boolean;
  className?: string;
}

export function ExpandedFormDiagram({
  number = 45678,
  interactive = false,
  className = '',
}: ExpandedFormDiagramProps) {
  const [selectedPart, setSelectedPart] = useState<number | null>(null);

  // Break down the number into place values
  const numberStr = number.toString();
  const digits = numberStr.split('').map(Number);
  const placeValues = [];

  for (let i = 0; i < digits.length; i++) {
    const placeValue = Math.pow(10, digits.length - 1 - i);
    const value = digits[i] * placeValue;
    if (value > 0) {
      placeValues.push({
        digit: digits[i],
        place: placeValue,
        value: value,
        index: i,
      });
    }
  }

  const handlePartClick = (index: number) => {
    if (interactive) {
      setSelectedPart(selectedPart === index ? null : index);
    }
  };

  const getPlaceName = (place: number): string => {
    switch (place) {
      case 1:
        return 'ones';
      case 10:
        return 'tens';
      case 100:
        return 'hundreds';
      case 1000:
        return 'thousands';
      case 10000:
        return 'ten thousands';
      case 100000:
        return 'hundred thousands';
      case 1000000:
        return 'millions';
      default:
        return `${place}s`;
    }
  };

  return (
    <div
      className={`expanded-form-diagram bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      <h4 className='text-lg font-semibold mb-6 text-center text-gray-800 dark:text-gray-200'>
        Expanded Form of {number.toLocaleString()}
      </h4>

      {/* Visual breakdown */}
      <div className='mb-6'>
        <div className='flex flex-wrap items-center justify-center gap-2 text-2xl font-bold'>
          {placeValues.map((part, index) => (
            <div key={index} className='flex items-center'>
              <button
                className={`
                  px-4 py-2 rounded-lg border-2 transition-all
                  ${
                    selectedPart === index
                      ? 'border-purple-500 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }
                  ${interactive ? 'hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer' : ''}
                `}
                onClick={() => handlePartClick(index)}
                disabled={!interactive}
              >
                {part.value.toLocaleString()}
              </button>
              {index < placeValues.length - 1 && (
                <span className='mx-2 text-gray-600 dark:text-gray-400'>+</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mathematical expression */}
      <div className='mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
        <div className='text-center'>
          <MathExpression inline={false}>
            {`${number.toLocaleString()} = ${placeValues.map(part => part.value.toLocaleString()).join(' + ')}`}
          </MathExpression>
        </div>
      </div>

      {/* Detailed breakdown */}
      <div className='grid gap-3'>
        {placeValues.map((part, index) => (
          <div
            key={index}
            className={`
              p-3 rounded-lg border transition-all
              ${
                selectedPart === index
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
              }
              ${interactive ? 'cursor-pointer hover:border-purple-400' : ''}
            `}
            onClick={() => handlePartClick(index)}
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                <div
                  className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold
                  ${
                    selectedPart === index
                      ? 'bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
                  }
                `}
                >
                  {part.digit}
                </div>
                <div>
                  <p
                    className={`font-medium ${selectedPart === index ? 'text-purple-800 dark:text-purple-200' : 'text-gray-800 dark:text-gray-200'}`}
                  >
                    {part.digit} in the {getPlaceName(part.place)} place
                  </p>
                  <p
                    className={`text-sm ${selectedPart === index ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'}`}
                  >
                    {part.digit} × {part.place.toLocaleString()} ={' '}
                    {part.value.toLocaleString()}
                  </p>
                </div>
              </div>
              <div
                className={`
                text-2xl font-bold
                ${selectedPart === index ? 'text-purple-800 dark:text-purple-200' : 'text-gray-800 dark:text-gray-200'}
              `}
              >
                {part.value.toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedPart !== null && (
        <div className='mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg'>
          <p className='text-sm text-purple-800 dark:text-purple-200'>
            The digit <strong>{placeValues[selectedPart].digit}</strong> is in
            the <strong>{getPlaceName(placeValues[selectedPart].place)}</strong>{' '}
            place, so its value is{' '}
            <strong>
              {placeValues[selectedPart].digit} ×{' '}
              {placeValues[selectedPart].place.toLocaleString()} ={' '}
              {placeValues[selectedPart].value.toLocaleString()}
            </strong>
          </p>
        </div>
      )}

      {interactive && (
        <p className='text-xs text-gray-500 dark:text-gray-400 mt-4 text-center'>
          Click on any part to see detailed explanation
        </p>
      )}
    </div>
  );
}
