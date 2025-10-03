import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PowersOfTenChartProps {
  className?: string;
}

export const PowersOfTenChart: React.FC<PowersOfTenChartProps> = ({
  className,
}) => {
  const [highlightedPower, setHighlightedPower] = useState<number | null>(null);

  const powers = [
    { exponent: 0, value: 1, name: 'ones', description: '1' },
    { exponent: 1, value: 10, name: 'tens', description: '10' },
    { exponent: 2, value: 100, name: 'hundreds', description: '100' },
    { exponent: 3, value: 1000, name: 'thousands', description: '1,000' },
    { exponent: 4, value: 10000, name: 'ten thousands', description: '10,000' },
    {
      exponent: 5,
      value: 100000,
      name: 'hundred thousands',
      description: '100,000',
    },
    { exponent: 6, value: 1000000, name: 'millions', description: '1,000,000' },
  ];

  const formatWithCommas = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className='text-lg'>Powers of Ten Chart</CardTitle>
        <p className='text-sm text-muted-foreground'>
          See how powers of 10 connect to place value
        </p>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Pattern Explanation */}
        <div className='p-3 bg-primary/5 rounded-lg'>
          <div className='text-sm font-medium mb-2'>Pattern Rule:</div>
          <div className='text-sm text-muted-foreground'>
            10<sup>n</sup> = 1 followed by <em>n</em> zeros
          </div>
        </div>

        {/* Powers Table */}
        <div className='space-y-2'>
          {powers.map(power => (
            <div
              key={power.exponent}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                highlightedPower === power.exponent
                  ? 'bg-primary/10 border-primary/30'
                  : 'bg-muted/20 border-muted hover:bg-muted/30'
              }`}
              onClick={() =>
                setHighlightedPower(
                  highlightedPower === power.exponent ? null : power.exponent
                )
              }
            >
              <div className='flex items-center gap-4'>
                <div className='text-lg font-mono'>
                  10<sup>{power.exponent}</sup>
                </div>
                <div className='text-sm text-muted-foreground'>=</div>
                <div className='font-medium'>{power.description}</div>
              </div>
              <div className='text-sm text-muted-foreground capitalize'>
                {power.name} place
              </div>
            </div>
          ))}
        </div>

        {/* Detailed View */}
        {highlightedPower !== null && (
          <div className='p-4 bg-primary/5 rounded-lg border border-primary/20'>
            <div className='text-sm font-medium mb-2'>
              10<sup>{highlightedPower}</sup> breakdown:
            </div>
            <div className='space-y-2'>
              <div className='text-sm'>
                <span className='text-muted-foreground'>
                  Repeated multiplication:
                </span>{' '}
                {highlightedPower === 0
                  ? 'No multiplications (special case = 1)'
                  : Array(highlightedPower).fill('10').join(' × ')}
              </div>
              <div className='text-sm'>
                <span className='text-muted-foreground'>Result:</span>{' '}
                {formatWithCommas(Math.pow(10, highlightedPower))}
              </div>
              <div className='text-sm'>
                <span className='text-muted-foreground'>Place value:</span>{' '}
                {powers.find(p => p.exponent === highlightedPower)?.name} place
              </div>
              <div className='text-sm'>
                <span className='text-muted-foreground'>Pattern:</span> 1
                followed by {highlightedPower} zero
                {highlightedPower !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        )}

        {/* Interactive Challenge */}
        <div className='p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
          <div className='text-sm font-medium text-yellow-800 mb-2'>
            Quick Challenge:
          </div>
          <div className='text-sm text-yellow-700'>
            Click on any power above to see its breakdown and connection to
            place value!
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
