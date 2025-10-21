/**
 * PythagoreanTheoremVisualizer - Interactive visualization of the Pythagorean theorem
 * Specifically designed for Pre-Algebra Chapter 5: Geometry Basics
 */

import React, { useState } from 'react';

interface PythagoreanTheoremVisualizerProps {
  className?: string;
  showProof?: boolean;
}

export const PythagoreanTheoremVisualizer: React.FC<
  PythagoreanTheoremVisualizerProps
> = ({ className = '', showProof = true }) => {
  const [sideA, setSideA] = useState(3);
  const [sideB, setSideB] = useState(4);
  const [sideC, setSideC] = useState(5);
  const [findingSide, setFindingSide] = useState<'a' | 'b' | 'c'>('c');
  const [showSquares, setShowSquares] = useState(true);

  // Calculate the missing side based on which one we're finding
  const calculateMissingSide = () => {
    switch (findingSide) {
      case 'c':
        return Math.sqrt(sideA * sideA + sideB * sideB);
      case 'a':
        return Math.sqrt(sideC * sideC - sideB * sideB);
      case 'b':
        return Math.sqrt(sideC * sideC - sideA * sideA);
      default:
        return 0;
    }
  };

  const calculatedSide = calculateMissingSide();

  // Check if current values form a valid right triangle
  const isValidTriangle = () => {
    const tolerance = 0.01;
    return Math.abs(sideA * sideA + sideB * sideB - sideC * sideC) < tolerance;
  };

  // Scale factor for visualization
  const scale = 15;
  const maxSide = Math.max(sideA, sideB, sideC);
  const adjustedScale = Math.min(scale, 200 / maxSide);

  // Calculate triangle coordinates
  const triangleWidth = sideA * adjustedScale;
  const triangleHeight = sideB * adjustedScale;
  const hypotenuse = sideC * adjustedScale;

  // Famous Pythagorean triples
  const famousTriples = [
    [3, 4, 5],
    [5, 12, 13],
    [8, 15, 17],
    [7, 24, 25],
    [20, 21, 29],
    [9, 40, 41],
  ];

  const loadTriple = (triple: number[]) => {
    setSideA(triple[0]);
    setSideB(triple[1]);
    setSideC(triple[2]);
    setFindingSide('c');
  };

  const updateSide = (side: 'a' | 'b' | 'c', value: number) => {
    switch (side) {
      case 'a':
        setSideA(value);
        break;
      case 'b':
        setSideB(value);
        break;
      case 'c':
        setSideC(value);
        break;
    }
  };

  return (
    <div
      className={`p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
          Pythagorean Theorem Visualizer
        </h3>
        <p className='text-sm text-gray-600 dark:text-gray-300'>
          Explore the relationship a² + b² = c² in right triangles. Adjust the
          sides to see how they relate.
        </p>
      </div>

      {/* Theorem Display */}
      <div className='mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
        <div className='text-center'>
          <div className='text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2'>
            a² + b² = c²
          </div>
          <div className='text-sm text-blue-700 dark:text-blue-300'>
            {sideA}² + {sideB}² = {sideC}²
          </div>
          <div className='text-sm text-blue-600 dark:text-blue-400'>
            {sideA * sideA} + {sideB * sideB} = {sideC * sideC}
          </div>
          <div
            className={`text-sm font-medium mt-1 ${
              isValidTriangle()
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {isValidTriangle()
              ? '✓ Valid right triangle'
              : '⚠ Not a right triangle'}
          </div>
        </div>
      </div>

      <div className='grid lg:grid-cols-2 gap-6'>
        {/* Controls */}
        <div>
          <h4 className='text-md font-medium text-gray-900 dark:text-white mb-3'>
            Triangle Dimensions:
          </h4>

          <div className='space-y-4'>
            {/* Side inputs */}
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <label className='w-16 text-sm font-medium text-red-600 dark:text-red-400'>
                  Side a:
                </label>
                <input
                  type='number'
                  value={
                    findingSide === 'a' ? calculatedSide.toFixed(2) : sideA
                  }
                  onChange={e => updateSide('a', Number(e.target.value))}
                  disabled={findingSide === 'a'}
                  className='flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700'
                  min='0.1'
                  step='0.1'
                />
                <button
                  onClick={() => setFindingSide('a')}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    findingSide === 'a'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                  }`}
                >
                  Find
                </button>
              </div>

              <div className='flex items-center gap-3'>
                <label className='w-16 text-sm font-medium text-green-600 dark:text-green-400'>
                  Side b:
                </label>
                <input
                  type='number'
                  value={
                    findingSide === 'b' ? calculatedSide.toFixed(2) : sideB
                  }
                  onChange={e => updateSide('b', Number(e.target.value))}
                  disabled={findingSide === 'b'}
                  className='flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700'
                  min='0.1'
                  step='0.1'
                />
                <button
                  onClick={() => setFindingSide('b')}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    findingSide === 'b'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                  }`}
                >
                  Find
                </button>
              </div>

              <div className='flex items-center gap-3'>
                <label className='w-16 text-sm font-medium text-blue-600 dark:text-blue-400'>
                  Side c:
                </label>
                <input
                  type='number'
                  value={
                    findingSide === 'c' ? calculatedSide.toFixed(2) : sideC
                  }
                  onChange={e => updateSide('c', Number(e.target.value))}
                  disabled={findingSide === 'c'}
                  className='flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700'
                  min='0.1'
                  step='0.1'
                />
                <button
                  onClick={() => setFindingSide('c')}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    findingSide === 'c'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                  }`}
                >
                  Find
                </button>
              </div>
            </div>

            {/* Calculation display */}
            {findingSide && (
              <div className='p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'>
                <div className='text-sm font-medium text-gray-900 dark:text-white mb-1'>
                  Calculation:
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-300 font-mono'>
                  {findingSide === 'c' &&
                    `c = √(${sideA}² + ${sideB}²) = √(${sideA * sideA} + ${sideB * sideB}) = √${sideA * sideA + sideB * sideB} = ${calculatedSide.toFixed(2)}`}
                  {findingSide === 'a' &&
                    `a = √(${sideC}² - ${sideB}²) = √(${sideC * sideC} - ${sideB * sideB}) = √${sideC * sideC - sideB * sideB} = ${calculatedSide.toFixed(2)}`}
                  {findingSide === 'b' &&
                    `b = √(${sideC}² - ${sideA}²) = √(${sideC * sideC} - ${sideA * sideA}) = √${sideC * sideC - sideA * sideA} = ${calculatedSide.toFixed(2)}`}
                </div>
              </div>
            )}

            {/* Display options */}
            <div className='flex items-center gap-3'>
              <label className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  checked={showSquares}
                  onChange={e => setShowSquares(e.target.checked)}
                  className='rounded'
                />
                <span className='text-sm text-gray-700 dark:text-gray-300'>
                  Show squares
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div>
          <h4 className='text-md font-medium text-gray-900 dark:text-white mb-3'>
            Visual Representation:
          </h4>

          <div className='flex justify-center'>
            <svg
              width='400'
              height='300'
              className='border border-gray-300 dark:border-gray-600 rounded'
            >
              {/* Right triangle */}
              <g transform='translate(50, 200)'>
                {/* Triangle */}
                <polygon
                  points={`0,0 ${triangleWidth},0 0,-${triangleHeight}`}
                  fill='rgba(156, 163, 175, 0.3)'
                  stroke='#374151'
                  strokeWidth='2'
                />

                {/* Right angle indicator */}
                <path
                  d={`M 15,0 L 15,-15 L 0,-15`}
                  fill='none'
                  stroke='#374151'
                  strokeWidth='1'
                />

                {/* Side labels */}
                <text
                  x={triangleWidth / 2}
                  y='20'
                  textAnchor='middle'
                  className='text-sm font-medium fill-current text-red-600 dark:text-red-400'
                >
                  a = {findingSide === 'a' ? calculatedSide.toFixed(1) : sideA}
                </text>

                <text
                  x='-25'
                  y={-triangleHeight / 2}
                  textAnchor='middle'
                  className='text-sm font-medium fill-current text-green-600 dark:text-green-400'
                  transform={`rotate(-90, -25, ${-triangleHeight / 2})`}
                >
                  b = {findingSide === 'b' ? calculatedSide.toFixed(1) : sideB}
                </text>

                <text
                  x={triangleWidth / 2 - 10}
                  y={-triangleHeight / 2 - 10}
                  textAnchor='middle'
                  className='text-sm font-medium fill-current text-blue-600 dark:text-blue-400'
                  transform={`rotate(-${(Math.atan(triangleHeight / triangleWidth) * 180) / Math.PI}, ${triangleWidth / 2 - 10}, ${-triangleHeight / 2 - 10})`}
                >
                  c = {findingSide === 'c' ? calculatedSide.toFixed(1) : sideC}
                </text>
              </g>

              {/* Squares on sides (if enabled) */}
              {showSquares && (
                <g>
                  {/* Square on side a */}
                  <g transform='translate(50, 210)'>
                    <rect
                      width={triangleWidth}
                      height={triangleWidth}
                      fill='rgba(239, 68, 68, 0.2)'
                      stroke='#ef4444'
                      strokeWidth='1'
                    />
                    <text
                      x={triangleWidth / 2}
                      y={triangleWidth / 2}
                      textAnchor='middle'
                      className='text-xs font-medium fill-current text-red-700 dark:text-red-300'
                    >
                      a² ={' '}
                      {(findingSide === 'a'
                        ? calculatedSide * calculatedSide
                        : sideA * sideA
                      ).toFixed(0)}
                    </text>
                  </g>

                  {/* Square on side b */}
                  <g
                    transform={`translate(${50 - triangleHeight}, ${200 - triangleHeight})`}
                  >
                    <rect
                      width={triangleHeight}
                      height={triangleHeight}
                      fill='rgba(34, 197, 94, 0.2)'
                      stroke='#22c55e'
                      strokeWidth='1'
                    />
                    <text
                      x={triangleHeight / 2}
                      y={triangleHeight / 2}
                      textAnchor='middle'
                      className='text-xs font-medium fill-current text-green-700 dark:text-green-300'
                    >
                      b² ={' '}
                      {(findingSide === 'b'
                        ? calculatedSide * calculatedSide
                        : sideB * sideB
                      ).toFixed(0)}
                    </text>
                  </g>

                  {/* Square on hypotenuse */}
                  <g transform={`translate(${250}, 50)`}>
                    <rect
                      width={hypotenuse * 0.7}
                      height={hypotenuse * 0.7}
                      fill='rgba(59, 130, 246, 0.2)'
                      stroke='#3b82f6'
                      strokeWidth='1'
                    />
                    <text
                      x={hypotenuse * 0.35}
                      y={hypotenuse * 0.35}
                      textAnchor='middle'
                      className='text-xs font-medium fill-current text-blue-700 dark:text-blue-300'
                    >
                      c² ={' '}
                      {(findingSide === 'c'
                        ? calculatedSide * calculatedSide
                        : sideC * sideC
                      ).toFixed(0)}
                    </text>
                  </g>
                </g>
              )}
            </svg>
          </div>
        </div>
      </div>

      {/* Famous Pythagorean Triples */}
      <div className='mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg'>
        <h5 className='text-sm font-medium text-purple-800 dark:text-purple-200 mb-3'>
          🎯 Famous Pythagorean Triples:
        </h5>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2'>
          {famousTriples.map((triple, index) => (
            <button
              key={index}
              onClick={() => loadTriple(triple)}
              className='p-2 bg-purple-100 dark:bg-purple-800 hover:bg-purple-200 dark:hover:bg-purple-700 text-purple-800 dark:text-purple-200 rounded transition-colors text-sm'
            >
              {triple[0]}, {triple[1]}, {triple[2]}
            </button>
          ))}
        </div>
      </div>

      {/* Real-world Applications */}
      <div className='mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg'>
        <div className='text-sm text-green-800 dark:text-green-200'>
          <div className='font-medium mb-1'>🏗️ Real-World Uses:</div>
          <ul className='list-disc list-inside space-y-1 text-xs'>
            <li>Construction: Ensuring corners are square (3-4-5 method)</li>
            <li>Navigation: Finding direct distances</li>
            <li>Ladder safety: Proper placement angles</li>
            <li>Screen sizes: Diagonal measurements</li>
            <li>Architecture: Roof design and structural analysis</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
