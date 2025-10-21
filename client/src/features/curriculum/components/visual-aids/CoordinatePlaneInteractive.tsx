/**
 * CoordinatePlaneInteractive - Interactive coordinate plane for plotting points and understanding coordinates
 * Specifically designed for Pre-Algebra Chapter 6: Coordinate Plane and Graphing
 */

import React, { useState } from 'react';

interface CoordinatePlaneInteractiveProps {
  className?: string;
  gridSize?: number;
  showQuadrants?: boolean;
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
> = ({ className = '', gridSize = 10, showQuadrants = true }) => {
  const [points, setPoints] = useState<Point[]>([
    { id: '1', x: 3, y: 2, label: 'A', color: '#ef4444' },
    { id: '2', x: -2, y: 4, label: 'B', color: '#22c55e' },
    { id: '3', x: -4, y: -3, label: 'C', color: '#3b82f6' },
    { id: '4', x: 1, y: -2, label: 'D', color: '#a855f7' },
  ]);

  const [newPoint, setNewPoint] = useState({ x: 0, y: 0, label: 'E' });
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [showCoordinates, setShowCoordinates] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  const scale = 20; // pixels per unit
  const centerX = 250;
  const centerY = 250;
  const svgSize = 500;

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
    if (newPoint.label && !points.find(p => p.label === newPoint.label)) {
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
          x: newPoint.x,
          y: newPoint.y,
          label: newPoint.label,
          color: colors[points.length % colors.length],
        },
      ]);
      setNewPoint({
        x: 0,
        y: 0,
        label: String.fromCharCode(65 + points.length),
      });
    }
  };

  const removePoint = (id: string) => {
    setPoints(points.filter(p => p.id !== id));
    if (selectedPoint === id) {
      setSelectedPoint(null);
    }
  };

  const updatePoint = (id: string, x: number, y: number) => {
    setPoints(points.map(p => (p.id === id ? { ...p, x, y } : p)));
  };

  const handleSvgClick = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const svgX = event.clientX - rect.left;
    const svgY = event.clientY - rect.top;
    const coord = svgToCoord(svgX, svgY);

    // Check if coordinates are within bounds
    if (Math.abs(coord.x) <= gridSize && Math.abs(coord.y) <= gridSize) {
      setNewPoint({ ...newPoint, x: coord.x, y: coord.y });
    }
  };

  const getQuadrant = (x: number, y: number) => {
    if (x > 0 && y > 0) return 'I';
    if (x < 0 && y > 0) return 'II';
    if (x < 0 && y < 0) return 'III';
    if (x > 0 && y < 0) return 'IV';
    return 'Origin/Axis';
  };

  const renderGridLines = () => {
    const lines = [];

    // Vertical lines
    for (let i = -gridSize; i <= gridSize; i++) {
      const x = centerX + i * scale;
      lines.push(
        <line
          key={`v${i}`}
          x1={x}
          y1={centerY - gridSize * scale}
          x2={x}
          y2={centerY + gridSize * scale}
          stroke={i === 0 ? '#374151' : '#e5e7eb'}
          strokeWidth={i === 0 ? '2' : '1'}
          className={
            i === 0
              ? 'text-gray-700 dark:text-gray-300'
              : 'text-gray-200 dark:text-gray-700'
          }
        />
      );
    }

    // Horizontal lines
    for (let i = -gridSize; i <= gridSize; i++) {
      const y = centerY - i * scale;
      lines.push(
        <line
          key={`h${i}`}
          x1={centerX - gridSize * scale}
          y1={y}
          x2={centerX + gridSize * scale}
          y2={y}
          stroke={i === 0 ? '#374151' : '#e5e7eb'}
          strokeWidth={i === 0 ? '2' : '1'}
          className={
            i === 0
              ? 'text-gray-700 dark:text-gray-300'
              : 'text-gray-200 dark:text-gray-700'
          }
        />
      );
    }

    return lines;
  };

  const renderAxisLabels = () => {
    const labels = [];

    // X-axis labels
    for (let i = -gridSize; i <= gridSize; i += 2) {
      if (i !== 0) {
        const x = centerX + i * scale;
        labels.push(
          <text
            key={`x${i}`}
            x={x}
            y={centerY + 15}
            textAnchor='middle'
            className='text-xs fill-current text-gray-600 dark:text-gray-400'
          >
            {i}
          </text>
        );
      }
    }

    // Y-axis labels
    for (let i = -gridSize; i <= gridSize; i += 2) {
      if (i !== 0) {
        const y = centerY - i * scale;
        labels.push(
          <text
            key={`y${i}`}
            x={centerX - 15}
            y={y + 4}
            textAnchor='middle'
            className='text-xs fill-current text-gray-600 dark:text-gray-400'
          >
            {i}
          </text>
        );
      }
    }

    return labels;
  };

  const renderQuadrantLabels = () => {
    if (!showQuadrants) return null;

    const offset = scale * 1.5;
    return (
      <g>
        <text
          x={centerX + offset}
          y={centerY - offset}
          textAnchor='middle'
          className='text-lg font-bold fill-current text-blue-600 dark:text-blue-400'
        >
          I
        </text>
        <text
          x={centerX - offset}
          y={centerY - offset}
          textAnchor='middle'
          className='text-lg font-bold fill-current text-green-600 dark:text-green-400'
        >
          II
        </text>
        <text
          x={centerX - offset}
          y={centerY + offset}
          textAnchor='middle'
          className='text-lg font-bold fill-current text-red-600 dark:text-red-400'
        >
          III
        </text>
        <text
          x={centerX + offset}
          y={centerY + offset}
          textAnchor='middle'
          className='text-lg font-bold fill-current text-purple-600 dark:text-purple-400'
        >
          IV
        </text>
      </g>
    );
  };

  return (
    <div
      className={`p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
          Interactive Coordinate Plane
        </h3>
        <p className='text-sm text-gray-600 dark:text-gray-300'>
          Click on the grid to place points, or use the controls below. Explore
          how coordinates work in all four quadrants.
        </p>
      </div>

      <div className='grid lg:grid-cols-3 gap-6'>
        {/* Coordinate Plane */}
        <div className='lg:col-span-2'>
          <div className='flex justify-center mb-4'>
            <svg
              width={svgSize}
              height={svgSize}
              className='border border-gray-300 dark:border-gray-600 rounded cursor-crosshair'
              onClick={handleSvgClick}
            >
              {/* Grid lines */}
              {showGrid && renderGridLines()}

              {/* Axis labels */}
              {renderAxisLabels()}

              {/* Quadrant labels */}
              {renderQuadrantLabels()}

              {/* Origin label */}
              <text
                x={centerX + 10}
                y={centerY - 10}
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
                    fill='currentColor'
                    className='text-gray-700 dark:text-gray-300'
                  />
                </marker>
              </defs>

              {/* X-axis arrow */}
              <line
                x1={centerX + gridSize * scale - 10}
                y1={centerY}
                x2={centerX + gridSize * scale + 10}
                y2={centerY}
                stroke='currentColor'
                strokeWidth='2'
                markerEnd='url(#arrowhead)'
                className='text-gray-700 dark:text-gray-300'
              />
              <text
                x={centerX + gridSize * scale + 20}
                y={centerY + 5}
                className='text-sm font-bold fill-current text-gray-700 dark:text-gray-300'
              >
                x
              </text>

              {/* Y-axis arrow */}
              <line
                x1={centerX}
                y1={centerY - gridSize * scale + 10}
                x2={centerX}
                y2={centerY - gridSize * scale - 10}
                stroke='currentColor'
                strokeWidth='2'
                markerEnd='url(#arrowhead)'
                className='text-gray-700 dark:text-gray-300'
              />
              <text
                x={centerX + 10}
                y={centerY - gridSize * scale - 10}
                className='text-sm font-bold fill-current text-gray-700 dark:text-gray-300'
              >
                y
              </text>

              {/* Points */}
              {points.map(point => {
                const svgPos = coordToSvg(point.x, point.y);
                const isSelected = selectedPoint === point.id;

                return (
                  <g key={point.id}>
                    <circle
                      cx={svgPos.x}
                      cy={svgPos.y}
                      r={isSelected ? '8' : '6'}
                      fill={point.color}
                      stroke='white'
                      strokeWidth='2'
                      className='cursor-pointer'
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedPoint(point.id);
                      }}
                    />
                    <text
                      x={svgPos.x + 12}
                      y={svgPos.y - 8}
                      className='text-sm font-bold fill-current text-gray-700 dark:text-gray-300'
                    >
                      {point.label}
                    </text>
                    {showCoordinates && (
                      <text
                        x={svgPos.x + 12}
                        y={svgPos.y + 6}
                        className='text-xs fill-current text-gray-600 dark:text-gray-400'
                      >
                        ({point.x}, {point.y})
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Preview point */}
              {newPoint.x !== undefined && newPoint.y !== undefined && (
                <circle
                  cx={coordToSvg(newPoint.x, newPoint.y).x}
                  cy={coordToSvg(newPoint.x, newPoint.y).y}
                  r='4'
                  fill='rgba(156, 163, 175, 0.5)'
                  stroke='#9ca3af'
                  strokeWidth='1'
                  strokeDasharray='3,3'
                />
              )}
            </svg>
          </div>

          {/* Display Options */}
          <div className='flex flex-wrap gap-4 justify-center'>
            <label className='flex items-center gap-2'>
              <input
                type='checkbox'
                checked={showGrid}
                onChange={e => setShowGrid(e.target.checked)}
                className='rounded'
              />
              <span className='text-sm text-gray-700 dark:text-gray-300'>
                Show Grid
              </span>
            </label>
            <label className='flex items-center gap-2'>
              <input
                type='checkbox'
                checked={showCoordinates}
                onChange={e => setShowCoordinates(e.target.checked)}
                className='rounded'
              />
              <span className='text-sm text-gray-700 dark:text-gray-300'>
                Show Coordinates
              </span>
            </label>
            <label className='flex items-center gap-2'>
              <input
                type='checkbox'
                checked={showQuadrants}
                onChange={e => setShowQuadrants(e.target.checked)}
                className='rounded'
              />
              <span className='text-sm text-gray-700 dark:text-gray-300'>
                Show Quadrants
              </span>
            </label>
          </div>
        </div>

        {/* Controls */}
        <div>
          <h4 className='text-md font-medium text-gray-900 dark:text-white mb-3'>
            Add Point:
          </h4>

          <div className='space-y-3 mb-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                X-coordinate:
              </label>
              <input
                type='number'
                value={newPoint.x}
                onChange={e =>
                  setNewPoint({ ...newPoint, x: Number(e.target.value) })
                }
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
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
                value={newPoint.y}
                onChange={e =>
                  setNewPoint({ ...newPoint, y: Number(e.target.value) })
                }
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                min={-gridSize}
                max={gridSize}
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Label:
              </label>
              <input
                type='text'
                value={newPoint.label}
                onChange={e =>
                  setNewPoint({ ...newPoint, label: e.target.value })
                }
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                maxLength={2}
              />
            </div>

            <button
              onClick={addPoint}
              className='w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors'
            >
              Add Point ({newPoint.x}, {newPoint.y})
            </button>
          </div>

          {/* Points List */}
          <h4 className='text-md font-medium text-gray-900 dark:text-white mb-3'>
            Current Points:
          </h4>

          <div className='space-y-2 mb-6'>
            {points.map(point => (
              <div
                key={point.id}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedPoint === point.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
                onClick={() => setSelectedPoint(point.id)}
              >
                <div className='flex items-center justify-between'>
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
                    onClick={e => {
                      e.stopPropagation();
                      removePoint(point.id);
                    }}
                    className='text-red-600 hover:text-red-700 text-sm'
                  >
                    Remove
                  </button>
                </div>
                <div className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                  Quadrant {getQuadrant(point.x, point.y)}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Examples */}
          <div className='p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'>
            <h5 className='text-sm font-medium text-gray-900 dark:text-white mb-2'>
              Quick Examples:
            </h5>
            <div className='grid grid-cols-2 gap-1 text-xs'>
              <button
                onClick={() => setNewPoint({ x: 4, y: 3, label: 'P' })}
                className='p-1 bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 text-blue-800 dark:text-blue-200 rounded'
              >
                (4, 3)
              </button>
              <button
                onClick={() => setNewPoint({ x: -3, y: 2, label: 'Q' })}
                className='p-1 bg-green-100 dark:bg-green-800 hover:bg-green-200 dark:hover:bg-green-700 text-green-800 dark:text-green-200 rounded'
              >
                (-3, 2)
              </button>
              <button
                onClick={() => setNewPoint({ x: -2, y: -4, label: 'R' })}
                className='p-1 bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 text-red-800 dark:text-red-200 rounded'
              >
                (-2, -4)
              </button>
              <button
                onClick={() => setNewPoint({ x: 5, y: -1, label: 'S' })}
                className='p-1 bg-purple-100 dark:bg-purple-800 hover:bg-purple-200 dark:hover:bg-purple-700 text-purple-800 dark:text-purple-200 rounded'
              >
                (5, -1)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quadrant Information */}
      <div className='mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
        <h5 className='text-sm font-medium text-blue-800 dark:text-blue-200 mb-2'>
          📍 Quadrant Guide:
        </h5>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-blue-700 dark:text-blue-300'>
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
        <div className='mt-2 text-xs text-blue-600 dark:text-blue-400'>
          <strong>Remember:</strong> The first number is x (horizontal), the
          second is y (vertical).
        </div>
      </div>
    </div>
  );
};
