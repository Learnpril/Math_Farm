import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '../../../../components/ui/slider';

interface FractionCirclesProps {
  title?: string;
  description?: string;
  className?: string;
}

export function FractionCircles({
  title = 'Fraction Circles',
  description = 'Visualize fractions as parts of a circle',
  className = '',
}: FractionCirclesProps) {
  const [numerator, setNumerator] = useState(1);
  const [denominator, setDenominator] = useState(4);

  const createCircleSegments = (num: number, den: number) => {
    const segments = [];
    const anglePerSegment = 360 / den;

    for (let i = 0; i < den; i++) {
      const startAngle = i * anglePerSegment - 90; // Start from top
      const endAngle = (i + 1) * anglePerSegment - 90;
      const isShaded = i < num;

      // Convert to radians for path calculation
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      const x1 = 50 + 40 * Math.cos(startRad);
      const y1 = 50 + 40 * Math.sin(startRad);
      const x2 = 50 + 40 * Math.cos(endRad);
      const y2 = 50 + 40 * Math.sin(endRad);

      const largeArcFlag = anglePerSegment > 180 ? 1 : 0;

      const pathData = [
        `M 50 50`,
        `L ${x1} ${y1}`,
        `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `Z`,
      ].join(' ');

      segments.push(
        <path
          key={i}
          d={pathData}
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
        <div className='flex flex-col sm:flex-row items-center gap-6'>
          <div className='flex-shrink-0'>
            <svg
              width='120'
              height='120'
              viewBox='0 0 100 100'
              className='border rounded-full'
            >
              {createCircleSegments(numerator, denominator)}
              <circle
                cx='50'
                cy='50'
                r='40'
                fill='none'
                className='stroke-gray-700 dark:stroke-gray-300'
                strokeWidth='2'
              />
            </svg>
          </div>

          <div className='flex-1 space-y-4'>
            <div className='text-center'>
              <div className='text-3xl font-bold text-purple-700 dark:text-purple-300 mb-2'>
                {numerator}/{denominator}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                = {decimal} = {percentage}%
              </div>
            </div>

            <div className='space-y-3'>
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
                  max={12}
                  min={1}
                  step={1}
                  className='w-full'
                />
              </div>
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
              setNumerator(1);
              setDenominator(3);
            }}
          >
            1/3
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              setNumerator(1);
              setDenominator(4);
            }}
          >
            1/4
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
        </div>

        <div className='text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-950 p-3 rounded'>
          <strong>Understanding:</strong> The circle is divided into{' '}
          {denominator} equal parts.
          {numerator} {numerator === 1 ? 'part is' : 'parts are'} shaded,
          representing the fraction {numerator}/{denominator}.
        </div>
      </CardContent>
    </Card>
  );
}
