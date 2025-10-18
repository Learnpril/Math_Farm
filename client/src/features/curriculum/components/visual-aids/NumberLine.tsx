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
  max = 10,
  step = 1,
  highlightNumbers = [],
  interactive = true,
  className = '',
}: NumberLineProps) {
  // Auto-adjust range for negative numbers if highlights include negatives
  const hasNegativeHighlights = highlightNumbers.some(num => num < 0);
  const adjustedMin = hasNegativeHighlights && min >= 0 ? -10 : min;
  const adjustedMax = hasNegativeHighlights && max <= 10 ? 10 : max;
  const adjustedStep = hasNegativeHighlights && step > 2 ? 1 : step;
  const [selectedNumber, setSelectedNumber] = useState<number | null>(() => {
    if (highlightNumbers.length > 0) {
      return highlightNumbers[0] ?? 0;
    }
    return Math.floor((adjustedMin + adjustedMax) / 2);
  });
  const [isDragging, setIsDragging] = useState(false);
  const lineRef = useRef<HTMLDivElement>(null);

  // Use adjusted values for calculations
  const finalMin = adjustedMin;
  const finalMax = adjustedMax;
  const finalStep = adjustedStep;

  // Generate tick marks
  const ticks = [];
  for (let i = finalMin; i <= finalMax; i += finalStep) {
    ticks.push(i);
  }

  // Mobile optimization is always enabled to prevent overflow

  const handleTickClick = (number: number) => {
    if (interactive) {
      setSelectedNumber(number);
    }
  };

  const getTickPosition = (number: number) => {
    return ((number - finalMin) / (finalMax - finalMin)) * 100;
  };

  const getNumberFromPosition = useCallback(
    (clientX: number) => {
      if (!lineRef.current) return finalMin;

      const rect = lineRef.current.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, relativeX / rect.width));
      const rawNumber = finalMin + percentage * (finalMax - finalMin);

      // Snap to nearest step
      const snappedNumber = Math.round(rawNumber / finalStep) * finalStep;
      return Math.max(finalMin, Math.min(finalMax, snappedNumber));
    },
    [finalMin, finalMax, finalStep]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!interactive) return;
      e.preventDefault();
      setIsDragging(true);
      const newNumber = getNumberFromPosition(e.clientX);
      setSelectedNumber(newNumber);
    },
    [interactive, getNumberFromPosition]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!interactive) return;
      e.preventDefault();
      setIsDragging(true);
      const touch = e.touches[0];
      if (touch) {
        const newNumber = getNumberFromPosition(touch.clientX);
        setSelectedNumber(newNumber);
      }
    },
    [interactive, getNumberFromPosition]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !interactive) return;
      e.preventDefault();
      const newNumber = getNumberFromPosition(e.clientX);
      setSelectedNumber(newNumber);
    },
    [isDragging, interactive, getNumberFromPosition]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || !interactive) return;
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) {
        const newNumber = getNumberFromPosition(touch.clientX);
        setSelectedNumber(newNumber);
      }
    },
    [isDragging, interactive, getNumberFromPosition]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse and touch event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, {
        passive: false,
      });
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
    return undefined;
  }, [
    isDragging,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
  ]);

  return (
    <div
      className={`number-line bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 md:p-6 ${className}`}
    >
      <h4 className='text-base md:text-lg font-semibold mb-4 text-center text-gray-800 dark:text-gray-200'>
        Number Line ({finalMin} to {finalMax})
      </h4>

      {/* Mobile-friendly container */}
      <div className='overflow-x-auto pb-2 sm:overflow-x-visible'>
        <div className='relative h-20 mb-4 min-w-[320px] sm:min-w-0 px-4'>
          {/* Main line */}
          <div
            ref={lineRef}
            className={`absolute top-6 left-0 right-0 h-1 bg-gray-400 dark:bg-gray-600 rounded ${
              interactive ? 'cursor-pointer' : ''
            }`}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
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
                    text-xs md:text-sm text-center mt-4 font-medium cursor-pointer whitespace-nowrap
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
                className={`w-5 h-5 sm:w-4 sm:h-4 bg-purple-600 dark:bg-purple-400 rounded-full border-2 border-white dark:border-gray-800 shadow-lg ${
                  interactive
                    ? 'cursor-grab active:cursor-grabbing hover:scale-110 touch-manipulation'
                    : ''
                } transition-transform duration-150`}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
              ></div>
            </div>
          )}
        </div>
      </div>

      {selectedNumber !== null && (
        <div className='mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg'>
          <p className='text-sm text-purple-800 dark:text-purple-200'>
            Selected number: <strong>{selectedNumber}</strong>
          </p>
        </div>
      )}

      <div className='mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
        <p className='text-xs md:text-sm text-blue-800 dark:text-blue-200 text-center'>
          💡 <strong>Remember:</strong> Moving right (→) is addition, moving
          left (←) is subtraction
        </p>
      </div>

      {interactive && (
        <p className='text-xs text-gray-500 dark:text-gray-400 mt-2 text-center'>
          Click on any number or drag the purple dot to explore the number line
        </p>
      )}
    </div>
  );
}
