/**
 * SimpleInequalityGraph - A focused visualization for inequality solutions in worked examples
 * Shows a clean number line with the solution clearly marked
 */

import React from 'react';

interface SimpleInequalityGraphProps {
  inequality?: string;
  endpoint?: number;
  operator?: '<' | '>' | '≤' | '≥';
  range?: number;
  className?: string;
}

export const SimpleInequalityGraph: React.FC<SimpleInequalityGraphProps> = ({
  inequality = 'x ≤ 5',
  endpoint = 5,
  operator = '≤',
  range = 8,
  className = '',
}) => {
  // Generate number line points centered around the endpoint
  const start = endpoint - Math.floor(range / 2);
  const end = endpoint + Math.ceil(range / 2);
  const points = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const scale = 40; // Distance between points
  const lineWidth = scale * (points.length - 1);
  const svgWidth = lineWidth + 80; // Extra space for arrows and labels

  const getPointPosition = (value: number) => {
    const index = value - start;
    return 40 + index * scale;
  };

  const isInclusive = operator === '≤' || operator === '≥';
  const isGreater = operator === '>' || operator === '≥';
  const boundaryX = getPointPosition(endpoint);

  const renderSolutionRegion = () => {
    return (
      <g>
        {/* Solution region shading */}
        <rect
          x={isGreater ? boundaryX : 40}
          y='45'
          width={isGreater ? lineWidth + 40 - boundaryX : boundaryX - 40}
          height='30'
          fill='rgba(59, 130, 246, 0.15)'
          stroke='rgba(59, 130, 246, 0.3)'
          strokeWidth='1'
          rx='2'
        />

        {/* Boundary point */}
        <circle
          cx={boundaryX}
          cy='60'
          r='6'
          fill={isInclusive ? '#3b82f6' : 'white'}
          stroke='#3b82f6'
          strokeWidth='3'
        />

        {/* Arrow indicating direction */}
        {isGreater ? (
          <g>
            <line
              x1={boundaryX + 10}
              y1='60'
              x2={lineWidth + 30}
              y2='60'
              stroke='#3b82f6'
              strokeWidth='3'
              markerEnd='url(#arrowRight)'
            />
            <polygon
              points={`${lineWidth + 35},60 ${lineWidth + 25},55 ${lineWidth + 25},65`}
              fill='#3b82f6'
            />
          </g>
        ) : (
          <g>
            <line
              x1='50'
              y1='60'
              x2={boundaryX - 10}
              y2='60'
              stroke='#3b82f6'
              strokeWidth='3'
            />
            <polygon points='45,60 55,55 55,65' fill='#3b82f6' />
          </g>
        )}
      </g>
    );
  };

  const getDescription = () => {
    switch (operator) {
      case '<':
        return `All values less than ${endpoint}`;
      case '>':
        return `All values greater than ${endpoint}`;
      case '≤':
        return `All values less than or equal to ${endpoint}`;
      case '≥':
        return `All values greater than or equal to ${endpoint}`;
      default:
        return '';
    }
  };

  const getCircleDescription = () => {
    return isInclusive
      ? `Closed circle (●) because ${endpoint} IS included`
      : `Open circle (○) because ${endpoint} is NOT included`;
  };

  return (
    <div
      className={`p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Header */}
      <div className='mb-4 text-center'>
        <div className='text-lg font-semibold text-gray-900 dark:text-white mb-1'>
          Solution: {inequality}
        </div>
        <div className='text-sm text-gray-600 dark:text-gray-400'>
          {getDescription()}
        </div>
      </div>

      {/* Number Line */}
      <div className='flex justify-center mb-4'>
        <svg width={svgWidth} height='120' className='overflow-visible'>
          {/* Main line */}
          <line
            x1='40'
            y1='60'
            x2={lineWidth + 40}
            y2='60'
            stroke='currentColor'
            strokeWidth='2'
            className='text-gray-400 dark:text-gray-500'
          />

          {/* Solution region */}
          {renderSolutionRegion()}

          {/* Number points and labels */}
          {points.map(num => {
            const x = getPointPosition(num);
            const isBoundary = num === endpoint;
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

                {/* Number label */}
                <text
                  x={x}
                  y={isZero ? '95' : '85'}
                  textAnchor='middle'
                  className={`text-sm font-medium ${
                    isBoundary
                      ? 'text-blue-600 dark:text-blue-400 font-bold'
                      : isZero
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {num}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Explanation */}
      <div className='space-y-3'>
        <div className='p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
          <div className='text-sm'>
            <div className='font-medium text-blue-800 dark:text-blue-200 mb-2'>
              📍 Key Elements:
            </div>
            <ul className='space-y-1 text-blue-700 dark:text-blue-300'>
              <li>
                • <strong>{getCircleDescription()}</strong>
              </li>
              <li>
                • <strong>Blue shaded region:</strong> Shows all values that
                satisfy {inequality}
              </li>
              <li>
                • <strong>Arrow direction:</strong> Points toward{' '}
                {isGreater ? 'larger' : 'smaller'} values
              </li>
            </ul>
          </div>
        </div>

        <div className='p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'>
          <div className='text-sm text-gray-700 dark:text-gray-300'>
            <div className='font-medium mb-1'>💡 Remember:</div>
            <div>
              {isInclusive ? '≤ and ≥' : '< and >'} use{' '}
              {isInclusive ? 'closed' : 'open'} circles because the boundary
              value is {isInclusive ? '' : 'NOT '}included in the solution.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
