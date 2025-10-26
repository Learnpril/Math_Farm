/**
 * CoordinatePlaneInteractive - Simplified interactive coordinate plane for plotting points
 * Specifically designed for Pre-Algebra Chapter 6: Coordinate Plane and Graphing
 */

import React, { useState } from 'react';

interface CoordinatePlaneInteractiveProps {
  className?: string;
}

interface Point {
  id: string;
  x: number;
  y: number;
  label: string;
  color: string;
}

export const CoordinatePlaneInteractive: React.FC<
  CoordinatePlaneInteractiveProps
> = ({ className = '' }) => {
  const [points, setPoints] = useState<Point[]>([
    { id: '1', x: -4, y: -3, label: 'C', color: '#3b82f6' },
    { id: '2', x: 1, y: -2, label: 'D', color: '#a855f7' },
  ]);

  const [inputX, setInputX] = useState<string>('2');
  const [inputY, setInputY] = useState<string>('-1');
  const [nextLabel, setNextLabel] = useState('E');

  const gridSize = 6; // Show -6 to +6 range
  const scale = 30; // Larger scale for easier clicking
  const centerX = 210;
  const centerY = 210;
  const svgSize = 420;

  // Convert coordinate to SVG position
  const coordToSvg = (x: number, y: number) => ({
    x: centerX + x * scale,
    y: centerY - y * scale, // Flip Y axis
  });

  // Convert SVG position to coordinate
  const svgToCoord = (svgX: number, svgY: number) => ({
    x: Math.round((svgX - centerX) / scale),
    y: Math.round((centerY - svgY) / scale),
  });

  const addPoint = () => {
    const x = parseInt(inputX);
    const y = parseInt(inputY);

    // Validate inputs
    if (isNaN(x) || isNaN(y)) return;
    if (Math.abs(x) > gridSize || Math.abs(y) > gridSize) return;
    if (points.find(p => p.x === x && p.y === y)) return; // Don't add duplicate points

    const colors = [
      '#ef4444',
      '#22c55e',
      '#3b82f6',
      '#a855f7',
      '#f59e0b',
      '#ec4899',
    ];
    const newId = Date.now().toString();

    setPoints([
      ...points,
      {
        id: newId,
        x,
        y,
        label: nextLabel,
        color: colors[points.length % colors.length],
      },
    ]);

    // Auto-increment label
    setNextLabel(String.fromCharCode(nextLabel.charCodeAt(0) + 1));
  };

  const removePoint = (id: string) => {
    setPoints(points.filter(p => p.id !== id));
  };

  const handleSvgClick = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const svgX = event.clientX - rect.left;
    const svgY = event.clientY - rect.top;
    const coord = svgToCoord(svgX, svgY);

    // Check if coordinates are within bounds
    if (Math.abs(coord.x) <= gridSize && Math.abs(coord.y) <= gridSize) {
      setInputX(coord.x.toString());
      setInputY(coord.y.toString());
    }
  };

  const getQuadrant = (x: number, y: number) => {
    if (x === 0 || y === 0) return 'On axis';
    if (x > 0 && y > 0) return 'I';
    if (x < 0 && y > 0) return 'II';
    if (x < 0 && y < 0) return 'III';
    if (x > 0 && y < 0) return 'IV';
    return '';
  };

  const renderGridLines = () => {
    const lines = [];

    // Vertical lines
    for (let i = -gridSize; i <= gridSize; i++) {
      const x = centerX + i * scale;
      const isAxis = i === 0;
      lines.push(
        <line
          key={`v${i}`}
          x1={x}
          y1={centerY - gridSize * scale}
          x2={x}
          y2={centerY + gridSize * scale}
          stroke={isAxis ? '#374151' : '#e5e7eb'}
          strokeWidth={isAxis ? '3' : '1'}
          className={isAxis ? 'dark:stroke-gray-300' : 'dark:stroke-gray-600'}
        />
      );
    }

    // Horizontal lines
    for (let i = -gridSize; i <= gridSize; i++) {
      const y = centerY - i * scale;
      const isAxis = i === 0;
      lines.push(
        <line
          key={`h${i}`}
          x1={centerX - gridSize * scale}
          y1={y}
          x2={centerX + gridSize * scale}
          y2={y}
          stroke={isAxis ? '#374151' : '#e5e7eb'}
          strokeWidth={isAxis ? '3' : '1'}
          className={isAxis ? 'dark:stroke-gray-300' : 'dark:stroke-gray-600'}
        />
      );
    }

    return lines;
  };

  const renderAxisLabels = () => {
    const labels = [];

    // X-axis labels (every unit)
    for (let i = -gridSize; i <= gridSize; i++) {
      if (i !== 0) {
        const x = centerX + i * scale;
        labels.push(
          <text
            key={`x${i}`}
            x={x}
            y={centerY + 18}
            textAnchor='middle'
            className='text-sm font-medium fill-current text-gray-700 dark:text-gray-300'
          >
            {i}
          </text>
        );
      }
    }

    // Y-axis labels (every unit)
    for (let i = -gridSize; i <= gridSize; i++) {
      if (i !== 0) {
        const y = centerY - i * scale;
        labels.push(
          <text
            key={`y${i}`}
            x={centerX - 18}
            y={y + 5}
            textAnchor='middle'
            className='text-sm font-medium fill-current text-gray-700 dark:text-gray-300'
          >
            {i}
          </text>
        );
      }
    }

    return labels;
  };

  const renderQuadrantLabels = () => {
    const offset = scale * 2.5;
    return (
      <g>
        <text
          x={centerX + offset}
          y={centerY - offset}
          textAnchor='middle'
          className='text-2xl font-bold fill-current text-blue-600 dark:text-blue-400 opacity-30'
        >
          I
        </text>
        <text
          x={centerX - offset}
          y={centerY - offset}
          textAnchor='middle'
          className='text-2xl font-bold fill-current text-green-600 dark:text-green-400 opacity-30'
        >
          II
        </text>
        <text
          x={centerX - offset}
          y={centerY + offset}
          textAnchor='middle'
          className='text-2xl font-bold fill-current text-red-600 dark:text-red-400 opacity-30'
        >
          III
        </text>
        <text
          x={centerX + offset}
          y={centerY + offset}
          textAnchor='middle'
          className='text-2xl font-bold fill-current text-purple-600 dark:text-purple-400 opacity-30'
        >
          IV
        </text>
      </g>
    );
  };

  return (
    <div
      className={`p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className='mb-4'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
          Interactive Coordinate Plane
        </h3>
        <p className='text-sm text-gray-600 dark:text-gray-300'>
          Click on the grid to set coordinates, then add the point. Each point
          shows its quadrant location.
        </p>
      </div>

      <div className='flex flex-col lg:flex-row gap-6'>
        {/* Coordinate Plane */}
        <div className='flex-1'>
          <div className='flex justify-center mb-4'>
            <svg
              width={svgSize}
              height={svgSize}
              className='border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-crosshair bg-white dark:bg-gray-900'
              onClick={handleSvgClick}
              viewBox={`0 0 ${svgSize} ${svgSize}`}
            >
              {/* Grid lines */}
              {renderGridLines()}

              {/* Axis labels */}
              {renderAxisLabels()}

              {/* Quadrant labels */}
              {renderQuadrantLabels()}

              {/* Origin label */}
              <text
                x={centerX + 12}
                y={centerY - 12}
                className='text-sm font-bold fill-current text-gray-700 dark:text-gray-300'
              >
                (0, 0)
              </text>

              {/* Axis arrows */}
              <defs>
                <marker
                  id='arrowhead'
                  markerWidth='10'
                  markerHeight='7'
                  refX='9'
                  refY='3.5'
                  orient='auto'
                >
                  <polygon
                    points='0 0, 10 3.5, 0 7'
                    fill='#374151'
                    className='dark:fill-gray-300'
                  />
                </marker>
              </defs>

              {/* X-axis arrow */}
              <line
                x1={centerX + gridSize * scale - 15}
                y1={centerY}
                x2={centerX + gridSize * scale + 15}
                y2={centerY}
                stroke='#374151'
                strokeWidth='3'
                markerEnd='url(#arrowhead)'
                className='dark:stroke-gray-300'
              />
              <text
                x={centerX + gridSize * scale + 25}
                y={centerY + 6}
                className='text-lg font-bold fill-current text-gray-700 dark:text-gray-300'
              >
                x
              </text>

              {/* Y-axis arrow */}
              <line
                x1={centerX}
                y1={centerY - gridSize * scale + 15}
                x2={centerX}
                y2={centerY - gridSize * scale - 15}
                stroke='#374151'
                strokeWidth='3'
                markerEnd='url(#arrowhead)'
                className='dark:stroke-gray-300'
              />
              <text
                x={centerX + 15}
                y={centerY - gridSize * scale - 15}
                className='text-lg font-bold fill-current text-gray-700 dark:text-gray-300'
              >
                y
              </text>

              {/* Points */}
              {points.map(point => {
                const svgPos = coordToSvg(point.x, point.y);

                return (
                  <g key={point.id}>
                    <circle
                      cx={svgPos.x}
                      cy={svgPos.y}
                      r='8'
                      fill={point.color}
                      stroke='white'
                      strokeWidth='3'
                      className='cursor-pointer hover:r-10 transition-all'
                    />
                    <text
                      x={svgPos.x + 15}
                      y={svgPos.y - 10}
                      className='text-lg font-bold fill-current text-gray-700 dark:text-gray-300'
                    >
                      {point.label}
                    </text>
                    <text
                      x={svgPos.x + 15}
                      y={svgPos.y + 8}
                      className='text-sm fill-current text-gray-600 dark:text-gray-400'
                    >
                      ({point.x}, {point.y})
                    </text>
                  </g>
                );
              })}

              {/* Preview point */}
              {inputX &&
                inputY &&
                !isNaN(parseInt(inputX)) &&
                !isNaN(parseInt(inputY)) && (
                  <circle
                    cx={coordToSvg(parseInt(inputX), parseInt(inputY)).x}
                    cy={coordToSvg(parseInt(inputX), parseInt(inputY)).y}
                    r='6'
                    fill='rgba(59, 130, 246, 0.5)'
                    stroke='#3b82f6'
                    strokeWidth='2'
                    strokeDasharray='4,4'
                  />
                )}
            </svg>
          </div>
        </div>

        {/* Simple Controls */}
        <div className='w-full lg:w-80'>
          <div className='bg-gray-50 dark:bg-gray-700 p-4 rounded-lg'>
            <h4 className='text-md font-medium text-gray-900 dark:text-white mb-4'>
              Add Point:
            </h4>

            <div className='space-y-3 mb-4'>
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    X-coordinate:
                  </label>
                  <input
                    type='number'
                    value={inputX}
                    onChange={e => setInputX(e.target.value)}
                    className='w-full px-3 py-2 text-lg text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                    min={-gridSize}
                    max={gridSize}
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Y-coordinate:
                  </label>
                  <input
                    type='number'
                    value={inputY}
                    onChange={e => setInputY(e.target.value)}
                    className='w-full px-3 py-2 text-lg text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                    min={-gridSize}
                    max={gridSize}
                  />
                </div>
              </div>

              <button
                onClick={addPoint}
                disabled={isNaN(parseInt(inputX)) || isNaN(parseInt(inputY))}
                className='w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors'
              >
                Add Point {nextLabel} ({inputX}, {inputY})
              </button>
            </div>

            {/* Current Points */}
            {points.length > 0 && (
              <div>
                <h4 className='text-md font-medium text-gray-900 dark:text-white mb-3'>
                  Current Points:
                </h4>

                <div className='space-y-2'>
                  {points.map(point => (
                    <div
                      key={point.id}
                      className='flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border'
                    >
                      <div className='flex items-center gap-2'>
                        <div
                          className='w-4 h-4 rounded-full border-2 border-white'
                          style={{ backgroundColor: point.color }}
                        ></div>
                        <span className='font-medium text-gray-900 dark:text-white'>
                          {point.label}: ({point.x}, {point.y})
                        </span>
                      </div>
                      <button
                        onClick={() => removePoint(point.id)}
                        className='text-red-600 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20'
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Examples */}
            <div className='mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
              <h5 className='text-sm font-medium text-blue-800 dark:text-blue-200 mb-2'>
                Quick Examples:
              </h5>
              <div className='grid grid-cols-2 gap-2 text-xs'>
                <button
                  onClick={() => {
                    setInputX('4');
                    setInputY('3');
                  }}
                  className='p-2 bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 text-blue-800 dark:text-blue-200 rounded'
                >
                  (4, 3)
                </button>
                <button
                  onClick={() => {
                    setInputX('-3');
                    setInputY('2');
                  }}
                  className='p-2 bg-green-100 dark:bg-green-800 hover:bg-green-200 dark:hover:bg-green-700 text-green-800 dark:text-green-200 rounded'
                >
                  (-3, 2)
                </button>
                <button
                  onClick={() => {
                    setInputX('-2');
                    setInputY('-4');
                  }}
                  className='p-2 bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 text-red-800 dark:text-red-200 rounded'
                >
                  (-2, -4)
                </button>
                <button
                  onClick={() => {
                    setInputX('5');
                    setInputY('-1');
                  }}
                  className='p-2 bg-purple-100 dark:bg-purple-800 hover:bg-purple-200 dark:hover:bg-purple-700 text-purple-800 dark:text-purple-200 rounded'
                >
                  (5, -1)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quadrant Information */}
      <div className='mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
        <h5 className='text-sm font-medium text-blue-800 dark:text-blue-200 mb-2'>
          📍 Quadrant Guide:
        </h5>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-blue-700 dark:text-blue-300'>
          <div>
            <strong>Quadrant I:</strong> (+, +)
          </div>
          <div>
            <strong>Quadrant II:</strong> (-, +)
          </div>
          <div>
            <strong>Quadrant III:</strong> (-, -)
          </div>
          <div>
            <strong>Quadrant IV:</strong> (+, -)
          </div>
        </div>
        <div className='mt-2 text-sm text-blue-600 dark:text-blue-400'>
          <strong>Tip:</strong> Click anywhere on the grid to set coordinates,
          then click "Add Point" to place it!
        </div>
      </div>
    </div>
  );
};
