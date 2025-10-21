/**
 * InequalityNumberLine - Interactive visualization for inequalities and their solutions
 * Specifically designed for Pre-Algebra Chapter 3: Equations and Inequalities
 */

import React, { useState } from 'react';

interface InequalityNumberLineProps {
  className?: string;
  range?: number;
  showSolution?: boolean;
}

interface Inequality {
  variable: string;
  operator: '<' | '>' | '≤' | '≥';
  value: number;
  solution: number[];
}

export const InequalityNumberLine: React.FC<InequalityNumberLineProps> = ({
  className = '',
  range = 10,
  showSolution = true,
}) => {
  const [inequality, setInequality] = useState<Inequality>({
    variable: 'x',
    operator: '≤',
    value: 3,
    solution: [],
  });

  const [customInequality, setCustomInequality] = useState({
    coefficient: 1,
    constant: 0,
    operator: '≤' as '<' | '>' | '≤' | '≥',
    rightSide: 5,
  });

  // Generate number line points
  const points = Array.from({ length: range * 2 + 1 }, (_, i) => i - range);
  const scale = Math.min(600 / (range * 2 + 1), 30);
  const lineWidth = scale * (range * 2 + 1);

  const checkSolution = (x: number): boolean => {
    switch (inequality.operator) {
      case '<':
        return x < inequality.value;
      case '>':
        return x > inequality.value;
      case '≤':
        return x <= inequality.value;
      case '≥':
        return x >= inequality.value;
      default:
        return false;
    }
  };

  const solveCustomInequality = () => {
    // Solve ax + b ≤ c format
    const { coefficient, constant, operator, rightSide } = customInequality;

    // ax + b ≤ c becomes ax ≤ c - b, then x ≤ (c - b) / a
    const rightValue = rightSide - constant;
    let solutionValue = rightValue / coefficient;
    let solutionOperator = operator;

    // If we divide by negative, flip the inequality
    if (coefficient < 0) {
      if (operator === '<') solutionOperator = '>';
      else if (operator === '>') solutionOperator = '<';
      else if (operator === '≤') solutionOperator = '≥';
      else if (operator === '≥') solutionOperator = '≤';
    }

    setInequality({
      variable: 'x',
      operator: solutionOperator,
      value: solutionValue,
      solution: [],
    });
  };

  const getPointPosition = (value: number) => {
    const index = value + range;
    return 20 + index * scale;
  };

  const renderSolutionRegion = () => {
    const boundaryX = getPointPosition(inequality.value);
    const isInclusive =
      inequality.operator === '≤' || inequality.operator === '≥';
    const isGreater =
      inequality.operator === '>' || inequality.operator === '≥';

    return (
      <g>
        {/* Solution region shading */}
        <rect
          x={isGreater ? boundaryX : 20}
          y='45'
          width={isGreater ? lineWidth + 20 - boundaryX : boundaryX - 20}
          height='30'
          fill='rgba(59, 130, 246, 0.2)'
          className='text-blue-500'
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
          <polygon
            points={`${lineWidth + 15},60 ${lineWidth + 10},55 ${lineWidth + 10},65`}
            fill='#3b82f6'
          />
        ) : (
          <polygon points={`25,60 30,55 30,65`} fill='#3b82f6' />
        )}
      </g>
    );
  };

  const getInequalityDescription = () => {
    const { operator, value } = inequality;
    switch (operator) {
      case '<':
        return `x is less than ${value}`;
      case '>':
        return `x is greater than ${value}`;
      case '≤':
        return `x is less than or equal to ${value}`;
      case '≥':
        return `x is greater than or equal to ${value}`;
      default:
        return '';
    }
  };

  return (
    <div
      className={`p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
          Inequality Number Line
        </h3>
        <p className='text-sm text-gray-600 dark:text-gray-300'>
          Visualize inequality solutions on a number line. See how different
          operators affect the solution set.
        </p>
      </div>

      {/* Custom Inequality Builder */}
      <div className='mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
        <h4 className='text-md font-medium text-gray-900 dark:text-white mb-3'>
          Build an Inequality:
        </h4>
        <div className='flex flex-wrap items-center gap-2 mb-3'>
          <input
            type='number'
            value={customInequality.coefficient}
            onChange={e =>
              setCustomInequality({
                ...customInequality,
                coefficient: Number(e.target.value),
              })
            }
            className='w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
          />
          <span className='text-gray-900 dark:text-white'>x</span>

          <select
            value={customInequality.constant >= 0 ? '+' : '-'}
            onChange={e =>
              setCustomInequality({
                ...customInequality,
                constant:
                  e.target.value === '+'
                    ? Math.abs(customInequality.constant)
                    : -Math.abs(customInequality.constant),
              })
            }
            className='px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
          >
            <option value='+'>+</option>
            <option value='-'>-</option>
          </select>

          <input
            type='number'
            value={Math.abs(customInequality.constant)}
            onChange={e =>
              setCustomInequality({
                ...customInequality,
                constant:
                  customInequality.constant >= 0
                    ? Number(e.target.value)
                    : -Number(e.target.value),
              })
            }
            className='w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
          />

          <select
            value={customInequality.operator}
            onChange={e =>
              setCustomInequality({
                ...customInequality,
                operator: e.target.value as '<' | '>' | '≤' | '≥',
              })
            }
            className='px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
          >
            <option value='<'>&lt;</option>
            <option value='>'>&gt;</option>
            <option value='≤'>≤</option>
            <option value='≥'>≥</option>
          </select>

          <input
            type='number'
            value={customInequality.rightSide}
            onChange={e =>
              setCustomInequality({
                ...customInequality,
                rightSide: Number(e.target.value),
              })
            }
            className='w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
          />

          <button
            onClick={solveCustomInequality}
            className='px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors'
          >
            Solve
          </button>
        </div>

        <div className='text-sm text-gray-600 dark:text-gray-300'>
          Current inequality: {customInequality.coefficient}x{' '}
          {customInequality.constant >= 0 ? '+' : ''}{' '}
          {customInequality.constant} {customInequality.operator}{' '}
          {customInequality.rightSide}
        </div>
      </div>

      {/* Current Inequality Display */}
      <div className='mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
        <div className='text-sm font-medium text-blue-700 dark:text-blue-300 mb-2'>
          Solution:
        </div>
        <div className='text-xl font-mono text-blue-900 dark:text-blue-100'>
          x {inequality.operator} {inequality.value}
        </div>
        <div className='text-sm text-blue-600 dark:text-blue-400 mt-1'>
          {getInequalityDescription()}
        </div>
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

          {/* Solution region */}
          {showSolution && renderSolutionRegion()}

          {/* Number points and labels */}
          {points.map((num, index) => {
            const x = 20 + index * scale;
            const isSolution = checkSolution(num);
            const isBoundary = num === inequality.value;
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

                {/* Point circle (only if not the boundary point) */}
                {!isBoundary && (
                  <circle
                    cx={x}
                    cy='60'
                    r='3'
                    fill={isSolution ? '#10b981' : 'transparent'}
                    stroke='currentColor'
                    strokeWidth='1'
                    className={
                      isZero
                        ? 'text-red-500'
                        : 'text-gray-400 dark:text-gray-500'
                    }
                  />
                )}

                {/* Number label */}
                <text
                  x={x}
                  y={isZero ? '95' : '85'}
                  textAnchor='middle'
                  className={`text-sm font-medium ${
                    isBoundary
                      ? 'text-blue-600 dark:text-blue-400 font-bold'
                      : isSolution
                        ? 'text-green-600 dark:text-green-400'
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

      {/* Interactive Test Values */}
      <div className='mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
        <h4 className='text-md font-medium text-gray-900 dark:text-white mb-3'>
          Test Values:
        </h4>
        <div className='grid grid-cols-3 md:grid-cols-6 gap-2'>
          {[-2, -1, 0, 1, 2, 4, 5, 6].map(testValue => (
            <div
              key={testValue}
              className={`p-2 rounded text-center text-sm font-medium border-2 ${
                checkSolution(testValue)
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700'
                  : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700'
              }`}
            >
              <div>x = {testValue}</div>
              <div className='text-xs'>
                {checkSolution(testValue) ? '✓ True' : '✗ False'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Symbol Legend */}
      <div className='p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg'>
        <div className='text-sm text-purple-800 dark:text-purple-200'>
          <div className='font-medium mb-2'>📚 Inequality Symbols:</div>
          <div className='grid grid-cols-2 gap-2 text-xs'>
            <div>
              <strong>&lt;</strong> less than (open circle ○)
            </div>
            <div>
              <strong>&gt;</strong> greater than (open circle ○)
            </div>
            <div>
              <strong>≤</strong> less than or equal to (closed circle ●)
            </div>
            <div>
              <strong>≥</strong> greater than or equal to (closed circle ●)
            </div>
          </div>
          <div className='mt-2 text-xs'>
            <strong>Shaded region</strong> shows all values that make the
            inequality true.
          </div>
        </div>
      </div>
    </div>
  );
};
