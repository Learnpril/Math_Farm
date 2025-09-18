import { useState } from 'react';

interface Base10BlocksProps {
  number?: number;
  interactive?: boolean;
  className?: string;
}

export function Base10Blocks({
  number = 1234,
  interactive = false,
  className = '',
}: Base10BlocksProps) {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  // Break down the number into place values
  const thousands = Math.floor(number / 1000);
  const hundreds = Math.floor((number % 1000) / 100);
  const tens = Math.floor((number % 100) / 10);
  const ones = number % 10;

  const handleBlockClick = (blockType: string) => {
    if (interactive) {
      setSelectedBlock(selectedBlock === blockType ? null : blockType);
    }
  };

  const BlockUnit = ({
    type,
    count,
    label,
    value,
  }: {
    type: string;
    count: number;
    label: string;
    value: number;
  }) => {
    const isSelected = selectedBlock === type;

    return (
      <div className='text-center'>
        <div className='mb-2'>
          <h5
            className={`text-sm font-medium ${isSelected ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'}`}
          >
            {label} ({count})
          </h5>
        </div>

        <div
          className={`
            p-4 rounded-lg border-2 cursor-pointer transition-all
            ${
              isSelected
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
            }
            ${interactive ? 'hover:border-purple-400 hover:bg-purple-25 dark:hover:bg-purple-900/20' : ''}
          `}
          onClick={() => handleBlockClick(type)}
        >
          {type === 'thousands' && (
            <div
              className='grid gap-1'
              style={{
                gridTemplateColumns: `repeat(${Math.min(count, 3)}, 1fr)`,
              }}
            >
              {Array.from({ length: count }, (_, i) => (
                <div
                  key={i}
                  className='w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded border border-blue-700 dark:border-blue-400'
                ></div>
              ))}
            </div>
          )}

          {type === 'hundreds' && (
            <div
              className='grid gap-1'
              style={{
                gridTemplateColumns: `repeat(${Math.min(count, 3)}, 1fr)`,
              }}
            >
              {Array.from({ length: count }, (_, i) => (
                <div
                  key={i}
                  className='w-6 h-6 bg-green-600 dark:bg-green-500 grid grid-cols-10 gap-px p-px rounded'
                >
                  {Array.from({ length: 100 }, (_, j) => (
                    <div
                      key={j}
                      className='bg-green-300 dark:bg-green-700 rounded-sm'
                    ></div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {type === 'tens' && (
            <div
              className='grid gap-1'
              style={{
                gridTemplateColumns: `repeat(${Math.min(count, 5)}, 1fr)`,
              }}
            >
              {Array.from({ length: count }, (_, i) => (
                <div key={i} className='flex flex-col gap-px'>
                  {Array.from({ length: 10 }, (_, j) => (
                    <div
                      key={j}
                      className='w-2 h-2 bg-yellow-600 dark:bg-yellow-500 rounded-sm'
                    ></div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {type === 'ones' && (
            <div
              className='grid gap-1'
              style={{
                gridTemplateColumns: `repeat(${Math.min(count, 5)}, 1fr)`,
              }}
            >
              {Array.from({ length: count }, (_, i) => (
                <div
                  key={i}
                  className='w-3 h-3 bg-red-600 dark:bg-red-500 rounded'
                ></div>
              ))}
            </div>
          )}
        </div>

        <div className='mt-2'>
          <p
            className={`text-xs ${isSelected ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-gray-500 dark:text-gray-400'}`}
          >
            Value: {value.toLocaleString()}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`base-10-blocks bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      <h4 className='text-lg font-semibold mb-4 text-center text-gray-800 dark:text-gray-200'>
        Base-10 Blocks for {number.toLocaleString()}
      </h4>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
        {thousands > 0 && (
          <BlockUnit
            type='thousands'
            count={thousands}
            label='Thousands'
            value={thousands * 1000}
          />
        )}

        {hundreds > 0 && (
          <BlockUnit
            type='hundreds'
            count={hundreds}
            label='Hundreds'
            value={hundreds * 100}
          />
        )}

        {tens > 0 && (
          <BlockUnit type='tens' count={tens} label='Tens' value={tens * 10} />
        )}

        {ones > 0 && (
          <BlockUnit type='ones' count={ones} label='Ones' value={ones} />
        )}
      </div>

      {selectedBlock && (
        <div className='mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg'>
          <p className='text-sm text-purple-800 dark:text-purple-200'>
            <strong>
              {selectedBlock.charAt(0).toUpperCase() + selectedBlock.slice(1)}
            </strong>{' '}
            blocks represent groups of{' '}
            {selectedBlock === 'thousands'
              ? '1,000'
              : selectedBlock === 'hundreds'
                ? '100'
                : selectedBlock === 'tens'
                  ? '10'
                  : '1'}
            .
          </p>
        </div>
      )}

      <div className='mt-4 text-center'>
        <p className='text-sm text-gray-600 dark:text-gray-400'>
          Total: {thousands * 1000} + {hundreds * 100} + {tens * 10} + {ones} ={' '}
          <strong>{number.toLocaleString()}</strong>
        </p>
      </div>

      {interactive && (
        <p className='text-xs text-gray-500 dark:text-gray-400 mt-2 text-center'>
          Click on any block type to learn more
        </p>
      )}
    </div>
  );
}
