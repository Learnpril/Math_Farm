import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ExponentGrowthChartProps {
  className?: string;
}

export const ExponentGrowthChart: React.FC<ExponentGrowthChartProps> = ({
  className,
}) => {
  const [selectedBase, setSelectedBase] = useState(2);
  const [maxExponent, setMaxExponent] = useState(6);

  const generateData = () => {
    const data = [];
    for (let exp = 0; exp <= maxExponent; exp++) {
      const value = Math.pow(selectedBase, exp);
      data.push({
        exponent: exp,
        value: value,
        expression: `${selectedBase}^${exp}`,
        height: Math.min(
          (value / Math.pow(selectedBase, maxExponent)) * 200,
          200
        ),
      });
    }
    return data;
  };

  const data = generateData();
  const maxValue = Math.pow(selectedBase, maxExponent);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className='text-lg'>
          Exponential Growth Visualization
        </CardTitle>
        <p className='text-sm text-muted-foreground'>
          See how quickly numbers grow with exponents
        </p>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Controls */}
        <div className='flex gap-4 items-center'>
          <div className='flex items-center gap-2'>
            <label className='text-sm font-medium'>Base:</label>
            <select
              value={selectedBase}
              onChange={e => setSelectedBase(Number(e.target.value))}
              className='px-2 py-1 border rounded text-sm bg-background text-foreground border-border'
            >
              {[2, 3, 4, 5].map(n => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className='flex items-center gap-2'>
            <label className='text-sm font-medium'>Max Exponent:</label>
            <select
              value={maxExponent}
              onChange={e => setMaxExponent(Number(e.target.value))}
              className='px-2 py-1 border rounded text-sm bg-background text-foreground border-border'
            >
              {[4, 5, 6, 7].map(n => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Growth Pattern Explanation */}
        <div className='p-3 bg-primary/5 rounded-lg'>
          <div className='text-sm font-medium mb-1'>Growth Pattern:</div>
          <div className='text-sm text-muted-foreground'>
            Each step multiplies by {selectedBase}, so growth accelerates
            rapidly!
          </div>
        </div>

        {/* Bar Chart */}
        <div className='space-y-3'>
          <div className='text-sm font-medium'>Visual Growth Comparison:</div>
          <div className='flex items-end gap-2 h-48 p-4 bg-muted/20 rounded-lg'>
            {data.map((item, index) => (
              <div
                key={index}
                className='flex flex-col items-center gap-1 flex-1'
              >
                <div className='text-xs font-medium text-center min-h-[2rem] flex items-end'>
                  {item.value.toLocaleString()}
                </div>
                <div
                  className='bg-gradient-to-t from-primary to-primary/60 rounded-t-sm transition-all duration-500 w-full min-w-[20px]'
                  style={{ height: `${item.height}px` }}
                />
                <div className='text-xs text-center font-mono'>
                  {item.expression}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className='space-y-2'>
          <div className='text-sm font-medium'>Exact Values:</div>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2'>
            {data.map((item, index) => (
              <div key={index} className='p-2 bg-muted/30 rounded text-center'>
                <div className='font-mono text-sm'>{item.expression}</div>
                <div className='text-xs text-muted-foreground'>=</div>
                <div className='font-medium'>{item.value.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-world Context */}
        <div className='p-3 bg-green-50 border border-green-200 rounded-lg'>
          <div className='text-sm font-medium text-green-800 mb-2'>
            Real-world Example:
          </div>
          <div className='text-sm text-green-700'>
            {selectedBase === 2 &&
              'If bacteria double every hour, this shows population growth over time.'}
            {selectedBase === 3 &&
              'If an investment triples each period, this shows wealth accumulation.'}
            {selectedBase === 4 &&
              'If a rumor spreads to 4 people each round, this shows information spread.'}
            {selectedBase === 5 &&
              'If a chain letter asks for 5 responses, this shows exponential expansion.'}
          </div>
        </div>

        {/* Growth Rate Comparison */}
        <div className='p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
          <div className='text-sm font-medium text-yellow-800 mb-2'>
            Growth Speed:
          </div>
          <div className='text-sm text-yellow-700'>
            From {selectedBase}^0 to {selectedBase}^{maxExponent}: grew by{' '}
            {(maxValue - 1).toLocaleString()}x in just {maxExponent} steps!
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
