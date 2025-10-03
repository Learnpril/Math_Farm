import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '../../../../components/ui/slider';

interface RatioToPercentageConverterProps {
  title?: string;
  description?: string;
  className?: string;
}

export function RatioToPercentageConverter({
  title = 'Ratio to Percentage Converter',
  description = 'Convert ratios to percentages and see the relationship',
  className = '',
}: RatioToPercentageConverterProps) {
  const [ratio, setRatio] = useState({ a: 3, b: 2 });

  const totalParts = ratio.a + ratio.b;
  const percentageA = (ratio.a / totalParts) * 100;
  const percentageB = (ratio.b / totalParts) * 100;

  const createPieChart = () => {
    const radius = 80;
    const centerX = 100;
    const centerY = 100;

    // Calculate angles
    const angleA = (percentageA / 100) * 360;
    const angleB = (percentageB / 100) * 360;

    // Convert to radians for calculations
    const radA = (angleA * Math.PI) / 180;

    // Calculate path for first segment
    const x1 = centerX + radius * Math.cos(-Math.PI / 2);
    const y1 = centerY + radius * Math.sin(-Math.PI / 2);
    const x2 = centerX + radius * Math.cos(-Math.PI / 2 + radA);
    const y2 = centerY + radius * Math.sin(-Math.PI / 2 + radA);

    const largeArcFlag = angleA > 180 ? 1 : 0;

    const pathA = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    const pathB = `M ${centerX} ${centerY} L ${x2} ${y2} A ${radius} ${radius} 0 ${angleB > 180 ? 1 : 0} 1 ${x1} ${y1} Z`;

    return (
      <svg width='200' height='200' viewBox='0 0 200 200' className='mx-auto'>
        <path d={pathA} fill='#3b82f6' stroke='white' strokeWidth='2' />
        <path d={pathB} fill='#ef4444' stroke='white' strokeWidth='2' />

        {/* Labels */}
        <text
          x={centerX - 30}
          y={centerY - 10}
          fill='white'
          fontSize='14'
          fontWeight='bold'
          textAnchor='middle'
        >
          {percentageA.toFixed(1)}%
        </text>
        <text
          x={centerX + 30}
          y={centerY + 10}
          fill='white'
          fontSize='14'
          fontWeight='bold'
          textAnchor='middle'
        >
          {percentageB.toFixed(1)}%
        </text>
      </svg>
    );
  };

  const createBars = () => {
    return (
      <div className='space-y-4'>
        {/* Combined Bar */}
        <div className='space-y-2'>
          <div className='text-sm font-medium text-gray-700 dark:text-gray-300'>
            Combined: {ratio.a}:{ratio.b}
          </div>
          <div className='flex h-12 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600'>
            <div
              className='bg-blue-500 flex items-center justify-center text-white text-sm font-medium'
              style={{ width: `${percentageA}%` }}
            >
              {percentageA.toFixed(1)}%
            </div>
            <div
              className='bg-red-500 flex items-center justify-center text-white text-sm font-medium'
              style={{ width: `${percentageB}%` }}
            >
              {percentageB.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Individual Bars */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <div className='text-sm font-medium text-blue-700 dark:text-blue-300'>
              Part A: {ratio.a} parts
            </div>
            <div className='h-8 bg-blue-500 rounded flex items-center justify-center text-white text-sm font-medium'>
              {percentageA.toFixed(1)}%
            </div>
          </div>
          <div className='space-y-2'>
            <div className='text-sm font-medium text-red-700 dark:text-red-300'>
              Part B: {ratio.b} parts
            </div>
            <div className='h-8 bg-red-500 rounded flex items-center justify-center text-white text-sm font-medium'>
              {percentageB.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    );
  };

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
            {ratio.a}:{ratio.b} = {percentageA.toFixed(1)}% :{' '}
            {percentageB.toFixed(1)}%
          </div>
          <div className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
            Total: {totalParts} parts = 100%
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Pie Chart */}
          <div className='space-y-3'>
            <h4 className='font-medium text-gray-900 dark:text-gray-100 text-center'>
              Pie Chart View
            </h4>
            <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-lg'>
              {createPieChart()}
            </div>
          </div>

          {/* Bar Chart */}
          <div className='space-y-3'>
            <h4 className='font-medium text-gray-900 dark:text-gray-100'>
              Bar Chart View
            </h4>
            <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-lg'>
              {createBars()}
            </div>
          </div>
        </div>

        {/* Conversion Steps */}
        <div className='bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg'>
          <h4 className='font-medium mb-3 text-blue-800 dark:text-blue-200'>
            Conversion Steps:
          </h4>
          <div className='space-y-2 text-sm text-blue-700 dark:text-blue-300'>
            <div>
              1. Start with ratio {ratio.a}:{ratio.b}
            </div>
            <div>
              2. Find total parts: {ratio.a} + {ratio.b} = {totalParts}
            </div>
            <div>3. Convert each part to percentage:</div>
            <div className='ml-4'>
              • Part A: ({ratio.a} ÷ {totalParts}) × 100% ={' '}
              {percentageA.toFixed(1)}%
            </div>
            <div className='ml-4'>
              • Part B: ({ratio.b} ÷ {totalParts}) × 100% ={' '}
              {percentageB.toFixed(1)}%
            </div>
            <div>
              4. Check: {percentageA.toFixed(1)}% + {percentageB.toFixed(1)}% ={' '}
              {(percentageA + percentageB).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Interactive Controls */}
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100'>
              Part A: {ratio.a}
            </label>
            <Slider
              value={[ratio.a]}
              onValueChange={(value: number[]) =>
                setRatio(prev => ({ ...prev, a: value[0] || 1 }))
              }
              max={10}
              min={1}
              step={1}
              className='w-full'
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100'>
              Part B: {ratio.b}
            </label>
            <Slider
              value={[ratio.b]}
              onValueChange={(value: number[]) =>
                setRatio(prev => ({ ...prev, b: value[0] || 1 }))
              }
              max={10}
              min={1}
              step={1}
              className='w-full'
            />
          </div>
        </div>

        {/* Common Ratios */}
        <div className='space-y-3'>
          <h5 className='font-medium text-gray-700 dark:text-gray-300'>
            Try Common Ratios:
          </h5>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
            {[
              { label: '1:1', a: 1, b: 1 },
              { label: '1:2', a: 1, b: 2 },
              { label: '3:2', a: 3, b: 2 },
              { label: '2:3', a: 2, b: 3 },
              { label: '1:3', a: 1, b: 3 },
              { label: '4:1', a: 4, b: 1 },
              { label: '3:7', a: 3, b: 7 },
              { label: '5:3', a: 5, b: 3 },
            ].map(preset => (
              <button
                key={preset.label}
                onClick={() => setRatio({ a: preset.a, b: preset.b })}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  ratio.a === preset.a && ratio.b === preset.b
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className='text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-950 p-3 rounded'>
          <strong>Key Insight:</strong> When converting ratios to percentages,
          each part becomes a fraction of the total, then multiply by 100%. The
          percentages always add up to 100% because they represent all parts of
          the whole. This makes ratios easier to compare and understand in
          real-world contexts.
        </div>
      </CardContent>
    </Card>
  );
}
