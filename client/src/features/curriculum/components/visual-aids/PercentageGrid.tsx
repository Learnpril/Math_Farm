import { useState } from 'react';

interface PercentageGridProps {
  percentage?: number;
  interactive?: boolean;
  className?: string;
}

export function PercentageGrid({
  percentage = 25,
  interactive = false,
  className = '',
}: PercentageGridProps) {
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  const [selectedPercentage, setSelectedPercentage] = useState(percentage);

  const filledCells = Math.round(selectedPercentage);

  const handleCellClick = (cellIndex: number) => {
    if (interactive) {
      setSelectedPercentage(cellIndex + 1);
    }
  };

  const renderGrid = () => {
    const cells = [];
    for (let i = 0; i < 100; i++) {
      const isFilled = i < filledCells;
      const isHovered = hoveredCell !== null && i <= hoveredCell;

      cells.push(
        <div
          key={i}
          className={`
            w-4 h-4 border border-gray-300 dark:border-gray-600 cursor-pointer
            transition-colors duration-150
            ${
              isFilled
                ? 'bg-purple-500 border-purple-600'
                : isHovered && interactive
                  ? 'bg-purple-200 dark:bg-purple-800'
                  : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
            }
          `}
          onClick={() => handleCellClick(i)}
          onMouseEnter={() => interactive && setHoveredCell(i)}
          onMouseLeave={() => interactive && setHoveredCell(null)}
        />
      );
    }
    return cells;
  };

  const fraction = selectedPercentage / 100;
  const decimal = (selectedPercentage / 100).toFixed(2);

  return (
    <div
      className={`percentage-grid bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      <h4 className='text-lg font-semibold mb-4 text-center text-gray-800 dark:text-gray-200'>
        Percentage Grid: {selectedPercentage}%
      </h4>

      <div className='space-y-6'>
        {/* 10x10 Grid */}
        <div className='flex justify-center'>
          <div className='grid grid-cols-10 gap-0 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
            {renderGrid()}
          </div>
        </div>

        {/* Percentage Information */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Percentage */}
          <div className='bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 text-center'>
            <div className='text-2xl font-bold text-purple-700 dark:text-purple-300'>
              {selectedPercentage}%
            </div>
            <div className='text-sm text-purple-600 dark:text-purple-400'>
              Percentage
            </div>
          </div>

          {/* Fraction */}
          <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center'>
            <div className='text-2xl font-bold text-blue-700 dark:text-blue-300'>
              {selectedPercentage}/100
            </div>
            <div className='text-sm text-blue-600 dark:text-blue-400'>
              Fraction
            </div>
          </div>

          {/* Decimal */}
          <div className='bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center'>
            <div className='text-2xl font-bold text-green-700 dark:text-green-300'>
              {decimal}
            </div>
            <div className='text-sm text-green-600 dark:text-green-400'>
              Decimal
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className='bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4'>
          <h5 className='font-medium text-yellow-800 dark:text-yellow-200 mb-2'>
            Understanding Percentages:
          </h5>
          <div className='space-y-2 text-sm text-yellow-700 dark:text-yellow-300'>
            <div>• The grid has 100 squares (10 × 10)</div>
            <div>
              • {selectedPercentage} squares are filled out of 100 total
            </div>
            <div>
              • This represents {selectedPercentage}% or "{selectedPercentage}{' '}
              per hundred"
            </div>
            <div>
              • As a fraction: {selectedPercentage}/100
              {selectedPercentage % 25 === 0 && selectedPercentage !== 0 && (
                <span className='ml-2 text-yellow-600 dark:text-yellow-400'>
                  = {selectedPercentage / 25}/{100 / 25}
                </span>
              )}
            </div>
            <div>• As a decimal: {decimal}</div>
          </div>
        </div>

        {/* Common Percentages */}
        {interactive && (
          <div className='space-y-3'>
            <h5 className='font-medium text-gray-700 dark:text-gray-300'>
              Try Common Percentages:
            </h5>
            <div className='flex flex-wrap gap-2'>
              {[10, 25, 50, 75, 100].map(pct => (
                <button
                  key={pct}
                  onClick={() => setSelectedPercentage(pct)}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      selectedPercentage === pct
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
        )}

        {interactive && (
          <p className='text-xs text-gray-500 dark:text-gray-400 text-center'>
            Click on the grid squares to change the percentage
          </p>
        )}
      </div>
    </div>
  );
}
