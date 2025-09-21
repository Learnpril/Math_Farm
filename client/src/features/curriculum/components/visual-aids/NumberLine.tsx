import { useState } from 'react';

interface NumberLineProps {
  min?: number;
  max?: number;
  step?: number;
  highlightNumbers?: number[];
  interactive?: boolean;
  className?: string;
}

export function NumberLine({
  min = 0,
  max = 100,
  step = 10,
  highlightNumbers = [],
  interactive = false,
  className = '',
}: NumberLineProps) {
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);

  // Generate tick marks
  const ticks = [];
  for (let i = min; i <= max; i += step) {
    ticks.push(i);
  }

  const handleTickClick = (number: number) => {
    if (interactive) {
      setSelectedNumber(selectedNumber === number ? null : number);
    }
  };

  const getTickPosition = (number: number) => {
    return ((number - min) / (max - min)) * 100;
  };

  return (
    <div
      className={`number-line bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      <h4 className='text-lg font-semibold mb-4 text-center text-gray-800 dark:text-gray-200'>
        Number Line ({min} to {max})
      </h4>

      <div className='relative h-20 mb-4'>
        {/* Main line */}
        <div className='absolute top-6 left-0 right-0 h-1 bg-gray-400 dark:bg-gray-600 rounded'></div>

        {/* Tick marks and labels */}
        {ticks.map(tick => {
          const position = getTickPosition(tick);
          const isHighlighted = highlightNumbers.includes(tick);
          const isSelected = selectedNumber === tick;

          return (
            <div
              key={tick}
              className='absolute'
              style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
            >
              {/* Tick mark */}
              <div
                className={`
                  w-1 h-4 top-4 relative mx-auto cursor-pointer
                  ${
                    isHighlighted || isSelected
                      ? 'bg-purple-600 dark:bg-purple-400'
                      : 'bg-gray-600 dark:bg-gray-400'
                  }
                  ${interactive ? 'hover:bg-purple-500 dark:hover:bg-purple-300' : ''}
                `}
                onClick={() => handleTickClick(tick)}
              />

              {/* Label positioned well below the line */}
              <div
                className={`
                  text-sm text-center mt-4 font-medium cursor-pointer
                  ${
                    isHighlighted || isSelected
                      ? 'text-purple-700 dark:text-purple-300 font-bold'
                      : 'text-gray-600 dark:text-gray-400'
                  }
                  ${interactive ? 'hover:text-purple-600 dark:hover:text-purple-200' : ''}
                `}
                onClick={() => handleTickClick(tick)}
              >
                {tick}
              </div>
            </div>
          );
        })}

        {/* Highlighted numbers with dots */}
        {highlightNumbers.map(number => {
          const position = getTickPosition(number);
          return (
            <div
              key={`highlight-${number}`}
              className='absolute top-5'
              style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
            >
              <div className='w-3 h-3 bg-purple-600 dark:bg-purple-400 rounded-full border-2 border-white dark:border-gray-800'></div>
            </div>
          );
        })}
      </div>

      {selectedNumber !== null && (
        <div className='mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg'>
          <p className='text-sm text-purple-800 dark:text-purple-200'>
            Selected number: <strong>{selectedNumber}</strong>
          </p>
        </div>
      )}

      {interactive && (
        <p className='text-xs text-gray-500 dark:text-gray-400 mt-2 text-center'>
          Click on any number to select it
        </p>
      )}
    </div>
  );
}
