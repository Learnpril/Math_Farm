/**
 * IntegerNumberLine - Interactive visualization for integer operations and concepts
 * Specifically designed for Pre-Algebra Chapter 1: Integers and Operations
 */

import React, { useState } from 'react';

interface IntegerNumberLineProps {
  className?: string;
  range?: number;
  showOperations?: boolean;
  highlightPoints?: number[];
  showAbsoluteValue?: boolean;
}

export const IntegerNumberLine: React.FC<IntegerNumberLineProps> = ({
  className = '',
  range = 10,
  showOperations = true,
  highlightPoints = [],
  showAbsoluteValue = false,
}) => {
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [operation, setOperation] = useState<'add' | 'subtract' | 'none'>(
    'none'
  );
  const [operationValue, setOperationValue] = useState<number>(0);

  // Generate number line points
  const points = Array.from({ length: range * 2 + 1 }, (_, i) => i - range);

  // Calculate scale for responsive design
  const scale = Math.min(600 / (range * 2 + 1), 30);
  const lineWidth = scale * (range * 2 + 1);

  const handlePointClick = (value: number) => {
    setSelectedPoint(value);
  };

  const performOperation = () => {
    if (selectedPoint !== null && operation !== 'none') {
      const result =
        operation === 'add'
          ? selectedPoint + operationValue
          : selectedPoint - operationValue;
      setSelectedPoint(result);
    }
  };

  return (
    <div
      className={`p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className='mb-4'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
          Integer Number Line
        </h3>
        <p className='text-sm text-gray-600 dark:text-gray-300'>
          Click on numbers to explore integer concepts. Use operations to see
          how integers combine.
        </p>
      </div>

      {/* Number Line Visualization */}
      <div className='flex justify-center mb-6'>
        <svg width={lineWidth + 40} height='120' className='overflow-visible'>
          {/* Main line */}
          <line
            x1='20'
            y1='60'
            x2={lineWidth + 20}
            y2='60'
            stroke='currentColor'
            strokeWidth='2'
            className='text-gray-400 dark:text-gray-500'
          />

          {/* Arrow */}
          <polygon
            points={`${lineWidth + 20},60 ${lineWidth + 15},55 ${lineWidth + 15},65`}
            fill='currentColor'
            className='text-gray-400 dark:text-gray-500'
          />

          {/* Number points and labels */}
          {points.map((num, index) => {
            const x = 20 + index * scale;
            const isHighlighted = highlightPoints.includes(num);
            const isSelected = selectedPoint === num;
            const isZero = num === 0;

            return (
              <g key={num}>
                {/* Tick mark */}
                <line
                  x1={x}
                  y1={isZero ? '45' : '55'}
                  x2={x}
                  y2={isZero ? '75' : '65'}
                  stroke='currentColor'
                  strokeWidth={isZero ? '3' : '1'}
                  className={
                    isZero ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'
                  }
                />

                {/* Point circle */}
                <circle
                  cx={x}
                  cy='60'
                  r={isSelected ? '8' : isHighlighted ? '6' : '4'}
                  fill={
                    isSelected
                      ? '#3b82f6'
                      : isHighlighted
                        ? '#10b981'
                        : isZero
                          ? '#ef4444'
                          : 'transparent'
                  }
                  stroke='currentColor'
                  strokeWidth='2'
                  className={`cursor-pointer transition-all duration-200 ${
                    isZero
                      ? 'text-red-500'
                      : 'text-gray-400 dark:text-gray-500 hover:text-blue-500'
                  }`}
                  onClick={() => handlePointClick(num)}
                />

                {/* Number label */}
                <text
                  x={x}
                  y={isZero ? '95' : '85'}
                  textAnchor='middle'
                  className={`text-sm font-medium cursor-pointer ${
                    isSelected
                      ? 'text-blue-600 dark:text-blue-400'
                      : isHighlighted
                        ? 'text-green-600 dark:text-green-400'
                        : isZero
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => handlePointClick(num)}
                >
                  {num}
                </text>

                {/* Absolute value indicator */}
                {showAbsoluteValue && num !== 0 && (
                  <text
                    x={x}
                    y='35'
                    textAnchor='middle'
                    className='text-xs text-purple-600 dark:text-purple-400'
                  >
                    |{num}| = {Math.abs(num)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Interactive Controls */}
      {showOperations && (
        <div className='space-y-4'>
          <div className='flex flex-wrap items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
            <div className='flex items-center gap-2'>
              <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Selected:
              </label>
              <span className='px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded'>
                {selectedPoint !== null ? selectedPoint : 'None'}
              </span>
            </div>

            <div className='flex items-center gap-2'>
              <select
                value={operation}
                onChange={e =>
                  setOperation(e.target.value as 'add' | 'subtract' | 'none')
                }
                className='px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
              >
                <option value='none'>Choose operation</option>
                <option value='add'>Add (+)</option>
                <option value='subtract'>Subtract (-)</option>
              </select>
            </div>

            <div className='flex items-center gap-2'>
              <input
                type='number'
                value={operationValue}
                onChange={e => setOperationValue(Number(e.target.value))}
                className='w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                placeholder='Value'
              />
            </div>

            <button
              onClick={performOperation}
              disabled={selectedPoint === null || operation === 'none'}
              className='px-4 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded transition-colors'
            >
              Calculate
            </button>
          </div>

          {/* Result Display */}
          {selectedPoint !== null &&
            operation !== 'none' &&
            operationValue !== 0 && (
              <div className='p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg'>
                <div className='text-sm text-green-800 dark:text-green-200'>
                  <strong>Calculation:</strong> {selectedPoint}{' '}
                  {operation === 'add' ? '+' : '-'} {operationValue} ={' '}
                  {operation === 'add'
                    ? selectedPoint + operationValue
                    : selectedPoint - operationValue}
                </div>
              </div>
            )}
        </div>
      )}

      {/* Information Panel */}
      <div className='mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
        <div className='text-sm text-blue-800 dark:text-blue-200'>
          <div className='font-medium mb-1'>Integer Number Line Concepts:</div>
          <ul className='list-disc list-inside space-y-1 text-xs'>
            <li>
              <span className='text-red-600 dark:text-red-400'>Zero (0)</span>{' '}
              is the center point - neither positive nor negative
            </li>
            <li>
              <span className='text-green-600 dark:text-green-400'>
                Positive integers
              </span>{' '}
              are to the right of zero
            </li>
            <li>
              <span className='text-blue-600 dark:text-blue-400'>
                Negative integers
              </span>{' '}
              are to the left of zero
            </li>
            <li>
              Distance from zero represents <strong>absolute value</strong>
            </li>
            <li>Moving right means adding, moving left means subtracting</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
