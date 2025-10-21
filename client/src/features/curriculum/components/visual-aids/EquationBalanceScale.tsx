/**
 * EquationBalanceScale - Interactive balance scale for understanding equation solving
 * Specifically designed for Pre-Algebra Chapter 3: Equations and Inequalities
 */

import React, { useState, useEffect } from 'react';

interface EquationBalanceScaleProps {
  className?: string;
  initialEquation?: string;
  showSteps?: boolean;
}

interface ScaleItem {
  id: string;
  type: 'variable' | 'number' | 'operation';
  value: number | string;
  coefficient?: number;
}

export const EquationBalanceScale: React.FC<EquationBalanceScaleProps> = ({
  className = '',
  initialEquation = '2x + 3 = 11',
  showSteps = true,
}) => {
  const [leftSide, setLeftSide] = useState<ScaleItem[]>([
    { id: '1', type: 'variable', value: 'x', coefficient: 2 },
    { id: '2', type: 'number', value: 3 },
  ]);

  const [rightSide, setRightSide] = useState<ScaleItem[]>([
    { id: '3', type: 'number', value: 11 },
  ]);

  const [currentStep, setCurrentStep] = useState(0);
  const [isBalanced, setIsBalanced] = useState(true);
  const [solution, setSolution] = useState<number | null>(null);

  // Calculate the visual balance of the scale
  const calculateBalance = () => {
    // For visualization purposes, we'll assume x = 4 to show balance
    const leftValue = leftSide.reduce((sum, item) => {
      if (item.type === 'variable') {
        return sum + (item.coefficient || 1) * 4; // Assuming x = 4
      }
      return sum + (typeof item.value === 'number' ? item.value : 0);
    }, 0);

    const rightValue = rightSide.reduce((sum, item) => {
      return sum + (typeof item.value === 'number' ? item.value : 0);
    }, 0);

    return leftValue - rightValue;
  };

  const balance = calculateBalance();

  const addToSide = (side: 'left' | 'right', item: ScaleItem) => {
    const newItem = { ...item, id: Date.now().toString() };
    if (side === 'left') {
      setLeftSide([...leftSide, newItem]);
    } else {
      setRightSide([...rightSide, newItem]);
    }
  };

  const removeFromSide = (side: 'left' | 'right', id: string) => {
    if (side === 'left') {
      setLeftSide(leftSide.filter(item => item.id !== id));
    } else {
      setRightSide(rightSide.filter(item => item.id !== id));
    }
  };

  const performOperation = (
    operation: 'add' | 'subtract' | 'multiply' | 'divide',
    value: number
  ) => {
    if (operation === 'add') {
      addToSide('left', { id: Date.now().toString(), type: 'number', value });
      addToSide('right', {
        id: (Date.now() + 1).toString(),
        type: 'number',
        value,
      });
    } else if (operation === 'subtract') {
      addToSide('left', {
        id: Date.now().toString(),
        type: 'number',
        value: -value,
      });
      addToSide('right', {
        id: (Date.now() + 1).toString(),
        type: 'number',
        value: -value,
      });
    }
    // Multiply and divide would require more complex logic
  };

  const renderScaleItem = (item: ScaleItem) => {
    let display = '';
    let bgColor =
      'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200';

    if (item.type === 'variable') {
      display =
        item.coefficient && item.coefficient !== 1
          ? `${item.coefficient}${item.value}`
          : item.value.toString();
      bgColor =
        'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200';
    } else if (item.type === 'number') {
      display = item.value.toString();
      bgColor =
        item.value < 0
          ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
          : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200';
    }

    return (
      <div
        key={item.id}
        className={`px-3 py-2 rounded-lg font-mono font-bold ${bgColor} border border-current`}
      >
        {display}
      </div>
    );
  };

  const getScaleRotation = () => {
    const maxTilt = 15; // Maximum tilt in degrees
    const tilt = Math.max(-maxTilt, Math.min(maxTilt, balance * 2));
    return tilt;
  };

  const renderEquation = () => {
    const leftExpression = leftSide
      .map(item => {
        if (item.type === 'variable') {
          return item.coefficient && item.coefficient !== 1
            ? `${item.coefficient}${item.value}`
            : item.value.toString();
        }
        return item.value.toString();
      })
      .join(' + ')
      .replace(/\+ -/g, ' - ');

    const rightExpression = rightSide
      .map(item => item.value.toString())
      .join(' + ')
      .replace(/\+ -/g, ' - ');

    return `${leftExpression} = ${rightExpression}`;
  };

  return (
    <div
      className={`p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
          Equation Balance Scale
        </h3>
        <p className='text-sm text-gray-600 dark:text-gray-300'>
          Visualize equations as a balance scale. Whatever you do to one side,
          you must do to the other to keep it balanced.
        </p>
      </div>

      {/* Current Equation Display */}
      <div className='mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
        <div className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
          Current Equation:
        </div>
        <div className='text-xl font-mono text-gray-900 dark:text-white'>
          {renderEquation()}
        </div>
      </div>

      {/* Balance Scale Visualization */}
      <div className='mb-8 flex justify-center'>
        <div className='relative'>
          {/* Scale Base */}
          <div className='w-8 h-32 bg-gray-600 dark:bg-gray-400 mx-auto'></div>

          {/* Scale Beam */}
          <div
            className='absolute top-8 left-1/2 transform -translate-x-1/2 transition-transform duration-500'
            style={{
              transform: `translateX(-50%) rotate(${getScaleRotation()}deg)`,
            }}
          >
            <div className='w-80 h-2 bg-gray-600 dark:bg-gray-400 relative'>
              {/* Fulcrum */}
              <div className='absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-4 h-4 bg-gray-800 dark:bg-gray-200 rotate-45'></div>

              {/* Left Pan */}
              <div className='absolute -top-4 left-8 w-24 h-16 bg-gray-300 dark:bg-gray-600 rounded-lg border-2 border-gray-400 dark:border-gray-500'>
                <div className='p-2 flex flex-wrap gap-1 justify-center items-center h-full'>
                  {leftSide.map(renderScaleItem)}
                </div>
              </div>

              {/* Right Pan */}
              <div className='absolute -top-4 right-8 w-24 h-16 bg-gray-300 dark:bg-gray-600 rounded-lg border-2 border-gray-400 dark:border-gray-500'>
                <div className='p-2 flex flex-wrap gap-1 justify-center items-center h-full'>
                  {rightSide.map(renderScaleItem)}
                </div>
              </div>
            </div>
          </div>

          {/* Balance Status */}
          <div className='mt-20 text-center'>
            <div
              className={`text-lg font-bold ${
                Math.abs(balance) < 0.1
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {Math.abs(balance) < 0.1 ? '⚖️ Balanced' : '⚠️ Unbalanced'}
            </div>
          </div>
        </div>
      </div>

      {/* Operation Controls */}
      <div className='mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
        <h4 className='text-md font-medium text-gray-900 dark:text-white mb-3'>
          Perform Operations (applies to both sides):
        </h4>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
          <button
            onClick={() => performOperation('subtract', 3)}
            className='px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors text-sm'
          >
            Subtract 3
          </button>
          <button
            onClick={() => performOperation('add', 5)}
            className='px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-sm'
          >
            Add 5
          </button>
          <button
            onClick={() => {
              // Divide by 2 (simplified for demo)
              setLeftSide(
                leftSide.map(item =>
                  item.type === 'variable' && item.coefficient
                    ? { ...item, coefficient: item.coefficient / 2 }
                    : item.type === 'number'
                      ? { ...item, value: (item.value as number) / 2 }
                      : item
                )
              );
              setRightSide(
                rightSide.map(item => ({
                  ...item,
                  value: (item.value as number) / 2,
                }))
              );
            }}
            className='px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors text-sm'
          >
            Divide by 2
          </button>
          <button
            onClick={() => {
              setLeftSide([
                { id: '1', type: 'variable', value: 'x', coefficient: 2 },
                { id: '2', type: 'number', value: 3 },
              ]);
              setRightSide([{ id: '3', type: 'number', value: 11 }]);
            }}
            className='px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors text-sm'
          >
            Reset
          </button>
        </div>
      </div>

      {/* Solution Steps */}
      {showSteps && (
        <div className='mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
          <h4 className='text-md font-medium text-blue-800 dark:text-blue-200 mb-3'>
            Solving Steps for 2x + 3 = 11:
          </h4>
          <div className='space-y-2 text-sm text-blue-700 dark:text-blue-300'>
            <div>1. Start: 2x + 3 = 11</div>
            <div>2. Subtract 3 from both sides: 2x + 3 - 3 = 11 - 3</div>
            <div>3. Simplify: 2x = 8</div>
            <div>4. Divide both sides by 2: 2x ÷ 2 = 8 ÷ 2</div>
            <div>5. Solution: x = 4</div>
          </div>
        </div>
      )}

      {/* Key Concepts */}
      <div className='p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg'>
        <div className='text-sm text-yellow-800 dark:text-yellow-200'>
          <div className='font-medium mb-1'>🔑 Balance Scale Principles:</div>
          <ul className='list-disc list-inside space-y-1 text-xs'>
            <li>
              An equation is like a balanced scale - both sides must be equal
            </li>
            <li>Whatever you do to one side, you must do to the other side</li>
            <li>The goal is to isolate the variable on one side</li>
            <li>Use inverse operations to "undo" operations on the variable</li>
            <li>
              Check your solution by substituting back into the original
              equation
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
