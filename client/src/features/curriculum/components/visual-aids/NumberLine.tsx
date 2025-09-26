import { useState, useRef, useCallback, useEffect } from 'react';

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
  const [selectedNumber, setSelectedNumber] = useState<number | null>(
    highlightNumbers.length > 0
      ? highlightNumbers[0]
      : Math.floor((min + max) / 2)
  );
  const [isDragging, setIsDragging] = useState(false);
  const lineRef = useRef<HTMLDivElement>(null);

  // Generate tick marks
  const ticks = [];
  for (let i = min; i <= max; i += step) {
    ticks.push(i);
  }

  const handleTickClick = (number: number) => {
    if (interactive) {
      setSelectedNumber(number);
    }
  };

  const getTickPosition = (number: number) => {
    return ((number - min) / (max - min)) * 100;
  };

  const getNumberFromPosition = useCallback(
    (clientX: number) => {
      if (!lineRef.current) return min;

      const rect = lineRef.current.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, relativeX / rect.width));
      const rawNumber = min + percentage * (max - min);

      // Snap to nearest integer (1s place)
      const snappedNumber = Math.round(rawNumber);
      return Math.max(min, Math.min(max, snappedNumber));
    },
    [min, max]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!interactive) return;
      setIsDragging(true);
      const newNumber = getNumberFromPosition(e.clientX);
      setSelectedNumber(newNumber);
    },
    [interactive, getNumberFromPosition]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !interactive) return;
      const newNumber = getNumberFromPosition(e.clientX);
      setSelectedNumber(newNumber);
    },
    [isDragging, interactive, getNumberFromPosition]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      className={`number-line bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      <h4 className='text-lg font-semibold mb-4 text-center text-gray-800 dark:text-gray-200'>
        Number Line ({min} to {max})
      </h4>

      <div className='relative h-20 mb-4'>
        {/* Main line */}
        <div
          ref={lineRef}
          className={`absolute top-6 left-0 right-0 h-1 bg-gray-400 dark:bg-gray-600 rounded ${
            interactive ? 'cursor-pointer' : ''
          }`}
          onMouseDown={handleMouseDown}
        ></div>

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

        {/* Draggable dot for selected number */}
        {selectedNumber !== null && (
          <div
            className='absolute top-4'
            style={{
              left: `${getTickPosition(selectedNumber)}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div
              className={`w-4 h-4 bg-purple-600 dark:bg-purple-400 rounded-full border-2 border-white dark:border-gray-800 shadow-lg ${
                interactive
                  ? 'cursor-grab active:cursor-grabbing hover:scale-110'
                  : ''
              } transition-transform duration-150`}
              onMouseDown={handleMouseDown}
            ></div>
          </div>
        )}
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
          Click on any number or drag the purple dot to explore the number line
        </p>
      )}
    </div>
  );
}
