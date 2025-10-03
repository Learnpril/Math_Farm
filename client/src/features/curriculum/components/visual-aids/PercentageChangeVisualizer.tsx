import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '../../../../components/ui/slider';

interface PercentageChangeVisualizerProps {
  title?: string;
  description?: string;
  className?: string;
}

export function PercentageChangeVisualizer({
  title = 'Percentage Change Calculator',
  description = 'See how values change with percentage increases and decreases',
  className = '',
}: PercentageChangeVisualizerProps) {
  const [originalValue, setOriginalValue] = useState(100);
  const [changePercent, setChangePercent] = useState(20);
  const [isIncrease, setIsIncrease] = useState(true);

  const changeAmount = (originalValue * Math.abs(changePercent)) / 100;
  const newValue = isIncrease
    ? originalValue + changeAmount
    : originalValue - changeAmount;

  const actualChangePercent = isIncrease ? changePercent : -changePercent;

  const createBar = (
    value: number,
    maxValue: number,
    color: string,
    label: string
  ) => {
    const width = Math.min((value / maxValue) * 100, 100);

    return (
      <div className='space-y-2'>
        <div className='flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300'>
          <span>{label}</span>
          <span>{value.toFixed(1)}</span>
        </div>
        <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden'>
          <div
            className={`h-full ${color} flex items-center justify-center text-white text-sm font-medium transition-all duration-300`}
            style={{ width: `${width}%` }}
          >
            {value.toFixed(1)}
          </div>
        </div>
      </div>
    );
  };

  const maxValue = Math.max(originalValue, newValue) * 1.1;

  return (
    <Card
      className={`w-full max-w-3xl mx-auto bg-white dark:bg-gray-900 ${className}`}
    >
      <CardHeader>
        <CardTitle className='text-lg font-semibold text-purple-700 dark:text-purple-300'>
          {title}
        </CardTitle>
        <p className='text-sm text-gray-600 dark:text-gray-400'>
          {description}
        </p>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='text-center'>
          <div className='text-2xl font-bold text-purple-700 dark:text-purple-300'>
            {originalValue} → {newValue.toFixed(1)}
          </div>
          <div className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
            {actualChangePercent > 0 ? '+' : ''}
            {actualChangePercent}% change
          </div>
        </div>

        {/* Visual Bars */}
        <div className='space-y-4'>
          {createBar(originalValue, maxValue, 'bg-blue-500', 'Original Value')}
          {createBar(
            newValue,
            maxValue,
            isIncrease ? 'bg-green-500' : 'bg-red-500',
            'New Value'
          )}
        </div>

        {/* Change Visualization */}
        <div
          className={`p-4 rounded-lg ${
            isIncrease
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}
        >
          <h4
            className={`font-medium mb-3 ${
              isIncrease
                ? 'text-green-800 dark:text-green-200'
                : 'text-red-800 dark:text-red-200'
            }`}
          >
            {isIncrease ? 'Percentage Increase' : 'Percentage Decrease'}:
          </h4>
          <div
            className={`space-y-2 text-sm ${
              isIncrease
                ? 'text-green-700 dark:text-green-300'
                : 'text-red-700 dark:text-red-300'
            }`}
          >
            <div>1. Original value: {originalValue}</div>
            <div>
              2. Change amount: {changePercent}% of {originalValue} ={' '}
              {changeAmount.toFixed(1)}
            </div>
            <div>
              3. New value: {originalValue} {isIncrease ? '+' : '-'}{' '}
              {changeAmount.toFixed(1)} = {newValue.toFixed(1)}
            </div>
            <div className='font-medium pt-1 border-t border-current border-opacity-30'>
              Formula: New Value = Original × (1 {isIncrease ? '+' : '-'}{' '}
              {changePercent / 100})
            </div>
          </div>
        </div>

        {/* Interactive Controls */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100'>
              Original Value: {originalValue}
            </label>
            <Slider
              value={[originalValue]}
              onValueChange={(value: number[]) =>
                setOriginalValue(value[0] || 1)
              }
              max={200}
              min={10}
              step={5}
              className='w-full'
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100'>
              Change Percentage: {changePercent}%
            </label>
            <Slider
              value={[changePercent]}
              onValueChange={(value: number[]) =>
                setChangePercent(value[0] || 0)
              }
              max={100}
              min={0}
              step={5}
              className='w-full'
            />
          </div>
        </div>

        {/* Increase/Decrease Toggle */}
        <div className='flex justify-center'>
          <div className='flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1'>
            <button
              onClick={() => setIsIncrease(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isIncrease
                  ? 'bg-green-500 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Increase
            </button>
            <button
              onClick={() => setIsIncrease(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !isIncrease
                  ? 'bg-red-500 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Decrease
            </button>
          </div>
        </div>

        {/* Common Examples */}
        <div className='space-y-3'>
          <h5 className='font-medium text-gray-700 dark:text-gray-300'>
            Try Common Scenarios:
          </h5>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
            {[
              { label: '20% off sale', value: 50, change: 20, increase: false },
              { label: '5% tax', value: 100, change: 5, increase: true },
              { label: '15% tip', value: 40, change: 15, increase: true },
              { label: '30% discount', value: 80, change: 30, increase: false },
            ].map((scenario, index) => (
              <button
                key={index}
                onClick={() => {
                  setOriginalValue(scenario.value);
                  setChangePercent(scenario.change);
                  setIsIncrease(scenario.increase);
                }}
                className='px-3 py-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
              >
                {scenario.label}
              </button>
            ))}
          </div>
        </div>

        <div className='text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-950 p-3 rounded'>
          <strong>Important:</strong> Percentage changes are always calculated
          based on the original value. A 50% increase followed by a 50% decrease
          doesn't return to the original value! Try: 100 → +50% = 150 → -50% =
          75 (not 100).
        </div>
      </CardContent>
    </Card>
  );
}
