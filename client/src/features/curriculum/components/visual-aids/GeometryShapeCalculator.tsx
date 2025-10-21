/**
 * GeometryShapeCalculator - Interactive calculator for basic geometric shapes
 * Specifically designed for Pre-Algebra Chapter 5: Geometry Basics
 */

import React, { useState } from 'react';

interface GeometryShapeCalculatorProps {
  className?: string;
  showFormulas?: boolean;
}

type ShapeType =
  | 'rectangle'
  | 'square'
  | 'triangle'
  | 'circle'
  | 'parallelogram'
  | 'trapezoid';

interface ShapeData {
  type: ShapeType;
  dimensions: { [key: string]: number };
  perimeter?: number;
  area?: number;
}

export const GeometryShapeCalculator: React.FC<
  GeometryShapeCalculatorProps
> = ({ className = '', showFormulas = true }) => {
  const [selectedShape, setSelectedShape] = useState<ShapeType>('rectangle');
  const [shapeData, setShapeData] = useState<ShapeData>({
    type: 'rectangle',
    dimensions: { length: 8, width: 5 },
  });

  const shapes = {
    rectangle: {
      name: 'Rectangle',
      dimensions: ['length', 'width'],
      perimeterFormula: 'P = 2(l + w)',
      areaFormula: 'A = l × w',
      icon: '▭',
    },
    square: {
      name: 'Square',
      dimensions: ['side'],
      perimeterFormula: 'P = 4s',
      areaFormula: 'A = s²',
      icon: '□',
    },
    triangle: {
      name: 'Triangle',
      dimensions: ['base', 'height', 'side1', 'side2'],
      perimeterFormula: 'P = a + b + c',
      areaFormula: 'A = ½bh',
      icon: '△',
    },
    circle: {
      name: 'Circle',
      dimensions: ['radius'],
      perimeterFormula: 'C = 2πr',
      areaFormula: 'A = πr²',
      icon: '○',
    },
    parallelogram: {
      name: 'Parallelogram',
      dimensions: ['base', 'height', 'side'],
      perimeterFormula: 'P = 2(a + b)',
      areaFormula: 'A = bh',
      icon: '▱',
    },
    trapezoid: {
      name: 'Trapezoid',
      dimensions: ['base1', 'base2', 'height', 'side1', 'side2'],
      perimeterFormula: 'P = a + b₁ + b₂ + c',
      areaFormula: 'A = ½(b₁ + b₂)h',
      icon: '⏢',
    },
  };

  const calculatePerimeter = (
    shape: ShapeType,
    dimensions: { [key: string]: number }
  ): number => {
    switch (shape) {
      case 'rectangle':
        return 2 * (dimensions.length + dimensions.width);
      case 'square':
        return 4 * dimensions.side;
      case 'triangle':
        return (
          (dimensions.side1 || 0) +
          (dimensions.side2 || 0) +
          (dimensions.base || 0)
        );
      case 'circle':
        return 2 * Math.PI * dimensions.radius;
      case 'parallelogram':
        return 2 * ((dimensions.base || 0) + (dimensions.side || 0));
      case 'trapezoid':
        return (
          (dimensions.base1 || 0) +
          (dimensions.base2 || 0) +
          (dimensions.side1 || 0) +
          (dimensions.side2 || 0)
        );
      default:
        return 0;
    }
  };

  const calculateArea = (
    shape: ShapeType,
    dimensions: { [key: string]: number }
  ): number => {
    switch (shape) {
      case 'rectangle':
        return dimensions.length * dimensions.width;
      case 'square':
        return dimensions.side * dimensions.side;
      case 'triangle':
        return 0.5 * dimensions.base * dimensions.height;
      case 'circle':
        return Math.PI * dimensions.radius * dimensions.radius;
      case 'parallelogram':
        return dimensions.base * dimensions.height;
      case 'trapezoid':
        return 0.5 * (dimensions.base1 + dimensions.base2) * dimensions.height;
      default:
        return 0;
    }
  };

  const updateDimension = (key: string, value: number) => {
    const newDimensions = { ...shapeData.dimensions, [key]: value };
    const newShapeData = {
      ...shapeData,
      dimensions: newDimensions,
      perimeter: calculatePerimeter(selectedShape, newDimensions),
      area: calculateArea(selectedShape, newDimensions),
    };
    setShapeData(newShapeData);
  };

  const changeShape = (shape: ShapeType) => {
    setSelectedShape(shape);
    const defaultDimensions: { [key: string]: { [key: string]: number } } = {
      rectangle: { length: 8, width: 5 },
      square: { side: 6 },
      triangle: { base: 8, height: 6, side1: 8, side2: 10 },
      circle: { radius: 4 },
      parallelogram: { base: 10, height: 6, side: 8 },
      trapezoid: { base1: 8, base2: 12, height: 5, side1: 6, side2: 7 },
    };

    const newDimensions = defaultDimensions[shape];
    const newShapeData = {
      type: shape,
      dimensions: newDimensions,
      perimeter: calculatePerimeter(shape, newDimensions),
      area: calculateArea(shape, newDimensions),
    };
    setShapeData(newShapeData);
  };

  const renderShapeVisualization = () => {
    const { dimensions } = shapeData;

    switch (selectedShape) {
      case 'rectangle':
        return (
          <svg
            width='200'
            height='120'
            className='border border-gray-300 dark:border-gray-600 rounded'
          >
            <rect
              x='20'
              y='20'
              width={Math.min(160, dimensions.length * 10)}
              height={Math.min(80, dimensions.width * 10)}
              fill='rgba(59, 130, 246, 0.3)'
              stroke='#3b82f6'
              strokeWidth='2'
            />
            <text
              x='100'
              y='65'
              textAnchor='middle'
              className='text-sm fill-current text-gray-700 dark:text-gray-300'
            >
              {dimensions.length} × {dimensions.width}
            </text>
          </svg>
        );

      case 'square':
        const sideLength = Math.min(80, dimensions.side * 8);
        return (
          <svg
            width='200'
            height='120'
            className='border border-gray-300 dark:border-600 rounded'
          >
            <rect
              x={100 - sideLength / 2}
              y={60 - sideLength / 2}
              width={sideLength}
              height={sideLength}
              fill='rgba(34, 197, 94, 0.3)'
              stroke='#22c55e'
              strokeWidth='2'
            />
            <text
              x='100'
              y='65'
              textAnchor='middle'
              className='text-sm fill-current text-gray-700 dark:text-gray-300'
            >
              {dimensions.side}
            </text>
          </svg>
        );

      case 'triangle':
        return (
          <svg
            width='200'
            height='120'
            className='border border-gray-300 dark:border-gray-600 rounded'
          >
            <polygon
              points={`100,20 50,90 150,90`}
              fill='rgba(168, 85, 247, 0.3)'
              stroke='#a855f7'
              strokeWidth='2'
            />
            <text
              x='100'
              y='70'
              textAnchor='middle'
              className='text-sm fill-current text-gray-700 dark:text-gray-300'
            >
              b={dimensions.base}, h={dimensions.height}
            </text>
          </svg>
        );

      case 'circle':
        const radius = Math.min(40, dimensions.radius * 8);
        return (
          <svg
            width='200'
            height='120'
            className='border border-gray-300 dark:border-gray-600 rounded'
          >
            <circle
              cx='100'
              cy='60'
              r={radius}
              fill='rgba(239, 68, 68, 0.3)'
              stroke='#ef4444'
              strokeWidth='2'
            />
            <line
              x1='100'
              y1='60'
              x2={100 + radius}
              y2='60'
              stroke='#ef4444'
              strokeWidth='1'
              strokeDasharray='2,2'
            />
            <text
              x='100'
              y='65'
              textAnchor='middle'
              className='text-sm fill-current text-gray-700 dark:text-gray-300'
            >
              r={dimensions.radius}
            </text>
          </svg>
        );

      default:
        return (
          <div className='w-48 h-28 border border-gray-300 dark:border-gray-600 rounded flex items-center justify-center bg-gray-50 dark:bg-gray-700'>
            <span className='text-4xl'>{shapes[selectedShape].icon}</span>
          </div>
        );
    }
  };

  return (
    <div
      className={`p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
          Geometry Shape Calculator
        </h3>
        <p className='text-sm text-gray-600 dark:text-gray-300'>
          Calculate perimeter and area for different geometric shapes. Change
          dimensions to see how they affect the results.
        </p>
      </div>

      {/* Shape Selection */}
      <div className='mb-6'>
        <h4 className='text-md font-medium text-gray-900 dark:text-white mb-3'>
          Select Shape:
        </h4>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2'>
          {Object.entries(shapes).map(([key, shape]) => (
            <button
              key={key}
              onClick={() => changeShape(key as ShapeType)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedShape === key
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <div className='text-2xl mb-1'>{shape.icon}</div>
              <div className='text-xs font-medium'>{shape.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div className='grid md:grid-cols-2 gap-6'>
        {/* Input Section */}
        <div>
          <h4 className='text-md font-medium text-gray-900 dark:text-white mb-3'>
            Dimensions:
          </h4>

          <div className='space-y-3'>
            {shapes[selectedShape].dimensions.map(dimension => (
              <div key={dimension} className='flex items-center gap-3'>
                <label className='w-20 text-sm font-medium text-gray-700 dark:text-gray-300 capitalize'>
                  {dimension}:
                </label>
                <input
                  type='number'
                  value={shapeData.dimensions[dimension] || ''}
                  onChange={e =>
                    updateDimension(dimension, Number(e.target.value))
                  }
                  className='flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                  min='0'
                  step='0.1'
                />
                <span className='text-sm text-gray-500 dark:text-gray-400'>
                  units
                </span>
              </div>
            ))}
          </div>

          {/* Formulas */}
          {showFormulas && (
            <div className='mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
              <h5 className='text-sm font-medium text-gray-900 dark:text-white mb-2'>
                Formulas:
              </h5>
              <div className='space-y-1 text-sm text-gray-600 dark:text-gray-300'>
                <div>
                  <strong>Perimeter:</strong>{' '}
                  {shapes[selectedShape].perimeterFormula}
                </div>
                <div>
                  <strong>Area:</strong> {shapes[selectedShape].areaFormula}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Visualization and Results */}
        <div>
          <h4 className='text-md font-medium text-gray-900 dark:text-white mb-3'>
            Visualization:
          </h4>

          <div className='flex justify-center mb-6'>
            {renderShapeVisualization()}
          </div>

          {/* Results */}
          <div className='space-y-4'>
            <div className='p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
              <div className='text-sm font-medium text-blue-700 dark:text-blue-300 mb-1'>
                Perimeter {selectedShape === 'circle' ? '(Circumference)' : ''}:
              </div>
              <div className='text-2xl font-bold text-blue-900 dark:text-blue-100'>
                {shapeData.perimeter?.toFixed(2)} units
              </div>
            </div>

            <div className='p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg'>
              <div className='text-sm font-medium text-green-700 dark:text-green-300 mb-1'>
                Area:
              </div>
              <div className='text-2xl font-bold text-green-900 dark:text-green-100'>
                {shapeData.area?.toFixed(2)} square units
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-world Applications */}
      <div className='mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg'>
        <h5 className='text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2'>
          💡 Real-World Applications:
        </h5>
        <div className='text-xs text-yellow-700 dark:text-yellow-300 space-y-1'>
          <div>
            <strong>Perimeter:</strong> Fencing a yard, picture frame molding,
            running track distance
          </div>
          <div>
            <strong>Area:</strong> Paint coverage, carpet needed, garden space,
            land measurement
          </div>
          <div>
            <strong>Circle:</strong> Pizza size, wheel circumference, circular
            garden beds
          </div>
        </div>
      </div>

      {/* Quick Examples */}
      <div className='mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg'>
        <div className='text-sm text-purple-800 dark:text-purple-200'>
          <div className='font-medium mb-1'>🎯 Try These Examples:</div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-2 text-xs'>
            <div>• Rectangle room: 12 ft × 10 ft</div>
            <div>• Square tile: 6 in × 6 in</div>
            <div>• Circular pizza: radius 8 in</div>
            <div>• Triangular garden: base 15 ft, height 10 ft</div>
          </div>
        </div>
      </div>
    </div>
  );
};
