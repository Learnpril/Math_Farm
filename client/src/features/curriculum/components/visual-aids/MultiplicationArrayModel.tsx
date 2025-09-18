import { useState } from 'react';

interface MultiplicationArrayModelProps {
  rows?: number;
  cols?: number;
  interactive?: boolean;
  className?: string;
}

export function MultiplicationArrayModel({
  rows = 4,
  cols = 6,
  interactive = false,
  className = '',
}: MultiplicationArrayModelProps) {
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [showCalculation, setShowCalculation] = useState(false);

  const handleCellClick = (row: number, col: number) => {
    if (interactive) {
      setSelectedCell({ row, col });
      setShowCalculation(true);
    }
  };

  const renderGrid = () => {
    const cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        cells.push(
          <div
            key={`${r}-${c}`}
            className={`
              w-8 h-8 border border-purple-300 dark:border-purple-600 
              flex items-center justify-center cursor-pointer
              transition-colors duration-200
              ${
                selectedCell?.row === r && selectedCell?.col === c
                  ? 'bg-purple-200 dark:bg-purple-800'
                  : 'bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40'
              }
            `}
            onClick={() => handleCellClick(r, c)}
          >
            <div className='w-3 h-3 bg-purple-500 rounded-full'></div>
          </div>
        );
      }
    }
    return cells;
  };

  return (
    <div
      className={`multiplication-array bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      <h4 className='text-lg font-semibold mb-4 text-center text-gray-800 dark:text-gray-200'>
        Array Model: {rows} × {cols}
      </h4>

      <div className='flex flex-col items-center space-y-4'>
        {/* Array Grid */}
        <div
          className='grid gap-1 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {renderGrid()}
        </div>

        {/* Row and Column Labels */}
        <div className='flex items-center space-x-8 text-sm text-gray-600 dark:text-gray-400'>
          <div className='flex items-center space-x-2'>
            <span className='font-medium'>Rows:</span>
            <span className='px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded'>
              {rows}
            </span>
          </div>
          <div className='flex items-center space-x-2'>
            <span className='font-medium'>Columns:</span>
            <span className='px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded'>
              {cols}
            </span>
          </div>
        </div>

        {/* Calculation Display */}
        <div className='text-center space-y-2'>
          <div className='text-xl font-bold text-purple-700 dark:text-purple-300'>
            {rows} × {cols} = {rows * cols}
          </div>
          <div className='text-sm text-gray-600 dark:text-gray-400'>
            {rows} rows of {cols} dots each = {rows * cols} total dots
          </div>
        </div>

        {/* Repeated Addition Explanation */}
        <div className='bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 max-w-md'>
          <h5 className='font-medium text-yellow-800 dark:text-yellow-200 mb-2'>
            As Repeated Addition:
          </h5>
          <div className='text-sm text-yellow-700 dark:text-yellow-300'>
            {Array.from({ length: rows }, (_, i) => cols).join(' + ')} ={' '}
            {rows * cols}
          </div>
          <div className='text-xs text-yellow-600 dark:text-yellow-400 mt-1'>
            Adding {cols} a total of {rows} times
          </div>
        </div>

        {interactive && (
          <p className='text-xs text-gray-500 dark:text-gray-400 text-center'>
            Click on any dot to explore the array structure
          </p>
        )}
      </div>
    </div>
  );
}
