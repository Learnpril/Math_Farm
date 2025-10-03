import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '../../../../components/ui/slider';

interface FractionAdditionBarsProps {
  title?: string;
  description?: string;
  className?: string;
}

export function FractionAdditionBars({
  title = 'Fraction Addition with Bars',
  description = 'Visualize adding fractions using bar models',
  className = '',
}: FractionAdditionBarsProps) {
  const [frac1, setFrac1] = useState({ num: 1, den: 4 });
  const [frac2, setFrac2] = useState({ num: 1, den: 3 });

  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };

  const lcm = (a: number, b: number): number => {
    return (a * b) / gcd(a, b);
  };

  const createBarSegments = (
    num: number,
    den: number,
    barHeight: number = 30,
    color: string = '#8b5cf6'
  ) => {
    const segments = [];
    const segmentWidth = 240 / den;

    for (let i = 0; i < den; i++) {
      const x = i * segmentWidth;
      const isShaded = i < num;

      segments.push(
        <rect
          key={i}
          x={x}
          y={0}
          width={segmentWidth}
          height={barHeight}
          fill={isShaded ? color : 'currentColor'}
          className={
            isShaded
              ? 'stroke-gray-700 dark:stroke-gray-300'
              : 'text-gray-200 dark:text-gray-800 stroke-gray-700 dark:stroke-gray-300'
          }
          strokeWidth='1'
        />
      );
    }

    return segments;
  };

  const commonDen = lcm(frac1.den, frac2.den);
  const equiv1 = { num: frac1.num * (commonDen / frac1.den), den: commonDen };
  const equiv2 = { num: frac2.num * (commonDen / frac2.den), den: commonDen };
  const sum = { num: equiv1.num + equiv2.num, den: commonDen };

  // Simplify the sum
  const sumGcd = gcd(sum.num, sum.den);
  const simplifiedSum = { num: sum.num / sumGcd, den: sum.den / sumGcd };

  const decimal1 = (frac1.num / frac1.den).toFixed(3);
  const decimal2 = (frac2.num / frac2.den).toFixed(3);
  const decimalSum = (sum.num / sum.den).toFixed(3);

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
            {frac1.num}/{frac1.den} + {frac2.num}/{frac2.den} ={' '}
            {simplifiedSum.num}/{simplifiedSum.den}
          </div>
          <div className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
            {decimal1} + {decimal2} = {decimalSum}
          </div>
        </div>

        <div className='space-y-6'>
          {/* Original fractions */}
          <div className='space-y-3'>
            <h4 className='font-medium text-sm'>Step 1: Original fractions</h4>
            <div className='flex items-center gap-4'>
              <div className='w-16 text-right font-medium text-blue-600'>
                {frac1.num}/{frac1.den}
              </div>
              <div className='flex-1'>
                <svg width='260' height='40' viewBox='0 0 260 40'>
                  <g transform='translate(10, 5)'>
                    {createBarSegments(frac1.num, frac1.den, 30, '#3b82f6')}
                  </g>
                </svg>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <div className='w-16 text-right font-medium text-green-600'>
                {frac2.num}/{frac2.den}
              </div>
              <div className='flex-1'>
                <svg width='260' height='40' viewBox='0 0 260 40'>
                  <g transform='translate(10, 5)'>
                    {createBarSegments(frac2.num, frac2.den, 30, '#10b981')}
                  </g>
                </svg>
              </div>
            </div>
          </div>

          {/* Equivalent fractions with common denominator */}
          <div className='space-y-3'>
            <h4 className='font-medium text-sm'>
              Step 2: Convert to common denominator ({commonDen})
            </h4>
            <div className='flex items-center gap-4'>
              <div className='w-16 text-right font-medium text-blue-600'>
                {equiv1.num}/{equiv1.den}
              </div>
              <div className='flex-1'>
                <svg width='260' height='40' viewBox='0 0 260 40'>
                  <g transform='translate(10, 5)'>
                    {createBarSegments(equiv1.num, equiv1.den, 30, '#3b82f6')}
                  </g>
                </svg>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <div className='w-16 text-right font-medium text-green-600'>
                {equiv2.num}/{equiv2.den}
              </div>
              <div className='flex-1'>
                <svg width='260' height='40' viewBox='0 0 260 40'>
                  <g transform='translate(10, 5)'>
                    {createBarSegments(equiv2.num, equiv2.den, 30, '#10b981')}
                  </g>
                </svg>
              </div>
            </div>
          </div>

          {/* Sum */}
          <div className='space-y-3'>
            <h4 className='font-medium text-sm'>Step 3: Add the numerators</h4>
            <div className='flex items-center gap-4'>
              <div className='w-16 text-right font-medium text-purple-600'>
                {sum.num}/{sum.den}
              </div>
              <div className='flex-1'>
                <svg width='260' height='40' viewBox='0 0 260 40'>
                  <g transform='translate(10, 5)'>
                    {createBarSegments(sum.num, sum.den, 30, '#8b5cf6')}
                  </g>
                </svg>
              </div>
              {simplifiedSum.num !== sum.num && (
                <div className='text-sm text-gray-500 dark:text-gray-400'>
                  = {simplifiedSum.num}/{simplifiedSum.den}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100'>
              First fraction
            </label>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <span className='w-8 text-sm'>Num:</span>
                <Slider
                  value={[frac1.num]}
                  onValueChange={(value: number[]) =>
                    setFrac1(prev => ({
                      ...prev,
                      num: Math.min(value[0] || 1, prev.den),
                    }))
                  }
                  max={frac1.den}
                  min={1}
                  step={1}
                  className='flex-1'
                />
                <span className='w-8 text-sm'>{frac1.num}</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='w-8 text-sm'>Den:</span>
                <Slider
                  value={[frac1.den]}
                  onValueChange={(value: number[]) =>
                    setFrac1(prev => ({
                      num: Math.min(prev.num, value[0] || 1),
                      den: value[0] || 1,
                    }))
                  }
                  max={12}
                  min={2}
                  step={1}
                  className='flex-1'
                />
                <span className='w-8 text-sm'>{frac1.den}</span>
              </div>
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100'>
              Second fraction
            </label>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <span className='w-8 text-sm'>Num:</span>
                <Slider
                  value={[frac2.num]}
                  onValueChange={(value: number[]) =>
                    setFrac2(prev => ({
                      ...prev,
                      num: Math.min(value[0] || 1, prev.den),
                    }))
                  }
                  max={frac2.den}
                  min={1}
                  step={1}
                  className='flex-1'
                />
                <span className='w-8 text-sm'>{frac2.num}</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='w-8 text-sm'>Den:</span>
                <Slider
                  value={[frac2.den]}
                  onValueChange={(value: number[]) =>
                    setFrac2(prev => ({
                      num: Math.min(prev.num, value[0] || 1),
                      den: value[0] || 1,
                    }))
                  }
                  max={12}
                  min={2}
                  step={1}
                  className='flex-1'
                />
                <span className='w-8 text-sm'>{frac2.den}</span>
              </div>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              setFrac1({ num: 1, den: 4 });
              setFrac2({ num: 1, den: 3 });
            }}
          >
            1/4 + 1/3
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              setFrac1({ num: 1, den: 2 });
              setFrac2({ num: 1, den: 4 });
            }}
          >
            1/2 + 1/4
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              setFrac1({ num: 2, den: 3 });
              setFrac2({ num: 1, den: 6 });
            }}
          >
            2/3 + 1/6
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              setFrac1({ num: 3, den: 5 });
              setFrac2({ num: 1, den: 10 });
            }}
          >
            3/5 + 1/10
          </Button>
        </div>

        <div className='text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-950 p-3 rounded'>
          <strong>Key Steps:</strong> To add fractions, first find a common
          denominator (LCD = {commonDen}). Convert each fraction: {frac1.num}/
          {frac1.den} = {equiv1.num}/{equiv1.den} and {frac2.num}/{frac2.den} ={' '}
          {equiv2.num}/{equiv2.den}. Then add the numerators: {equiv1.num} +{' '}
          {equiv2.num} = {sum.num}, keeping the same denominator.
        </div>
      </CardContent>
    </Card>
  );
}
