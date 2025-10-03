import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '../../../../components/ui/slider';

interface FractionBarsProps {
  title?: string;
  description?: string;
  className?: string;
}

export function FractionBars({
  title = 'Fraction Bars',
  description = 'Visualize fractions as parts of a bar',
  className = '',
}: FractionBarsProps) {
  const [numerator, setNumerator] = useState(3);
  const [denominator, setDenominator] = useState(5);

  const createBarSegments = (num: number, den: number) => {
    const segments = [];
    const segmentWidth = 240 / den; // Total bar width is 240px

    for (let i = 0; i < den; i++) {
      const x = i * segmentWidth;
      const isShaded = i < num;

      segments.push(
        <rect
          key={i}
          x={x}
          y={0}
          width={segmentWidth}
          height={40}
          fill={isShaded ? '#8b5cf6' : 'currentColor'}
          className={
            isShaded
              ? 'stroke-gray-700 dark:stroke-gray-300'
              : 'text-gray-200 dark:text-gray-600 stroke-gray-700 dark:stroke-gray-300'
          }
          strokeWidth='1'
        />
      );
    }

    return segments;
  };

  const decimal = (numerator / denominator).toFixed(3);
  const percentage = ((numerator / denominator) * 100).toFixed(1);

  return (
    <Card
      className={`w-full max-w-2xl mx-auto bg-white dark:bg-gray-900 ${className}`}
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
        <div className='flex flex-col items-center gap-6'>
          <div className='text-center'>
            <div className='text-3xl font-bold text-purple-700 dark:text-purple-300 mb-2'>
              {numerator}/{denominator}
            </div>
            <div className='text-sm text-gray-600 dark:text-gray-400'>
              = {decimal} = {percentage}%
            </div>
          </div>

          <div className='flex flex-col items-center gap-2'>
            <svg width='260' height='60' viewBox='0 0 260 60'>
              <g transform='translate(10, 10)'>
                {createBarSegments(numerator, denominator)}
              </g>
            </svg>
            <div className='text-xs text-gray-500 dark:text-gray-400'>
              {numerator} out of {denominator} parts shaded
            </div>
          </div>

          <div className='w-full space-y-4'>
            <div>
              <label className='block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100'>
                Numerator (shaded parts): {numerator}
              </label>
              <Slider
                value={[numerator]}
                onValueChange={(value: number[]) =>
                  setNumerator(Math.min(value[0] || 0, denominator))
                }
                max={denominator}
                min={0}
                step={1}
                className='w-full'
              />
            </div>

            <div>
              <label className='block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100'>
                Denominator (total parts): {denominator}
              </label>
              <Slider
                value={[denominator]}
                onValueChange={(value: number[]) => {
                  setDenominator(value[0] || 1);
                  setNumerator(Math.min(numerator, value[0] || 1));
                }}
                max={10}
                min={1}
                step={1}
                className='w-full'
              />
            </div>
          </div>
        </div>

        <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              setNumerator(1);
              setDenominator(2);
            }}
          >
            1/2
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              setNumerator(2);
              setDenominator(3);
            }}
          >
            2/3
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              setNumerator(3);
              setDenominator(4);
            }}
          >
            3/4
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              setNumerator(4);
              setDenominator(5);
            }}
          >
            4/5
          </Button>
        </div>

        <div className='text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-950 p-3 rounded'>
          <strong>Understanding:</strong> The bar is divided into {denominator}{' '}
          equal parts.
          {numerator} {numerator === 1 ? 'part is' : 'parts are'} shaded purple,
          representing the fraction {numerator}/{denominator}. This is the same
          as {decimal} in decimal form.
        </div>
      </CardContent>
    </Card>
  );
}
