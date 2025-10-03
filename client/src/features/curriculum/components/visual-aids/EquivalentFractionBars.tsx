import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EquivalentFractionBarsProps {
  title?: string;
  description?: string;
  className?: string;
}

export function EquivalentFractionBars({
  title = 'Equivalent Fraction Bars',
  description = 'See how different fractions can represent the same amount',
  className = '',
}: EquivalentFractionBarsProps) {
  const [baseFraction, setBaseFraction] = useState({ num: 1, den: 2 });

  const createBarSegments = (
    num: number,
    den: number,
    barHeight: number = 30
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
          fill={isShaded ? '#8b5cf6' : 'currentColor'}
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

  const generateEquivalents = (num: number, den: number) => {
    const equivalents = [];
    for (let multiplier = 1; multiplier <= 4; multiplier++) {
      equivalents.push({
        num: num * multiplier,
        den: den * multiplier,
        multiplier,
      });
    }
    return equivalents;
  };

  const equivalents = generateEquivalents(baseFraction.num, baseFraction.den);
  const decimal = (baseFraction.num / baseFraction.den).toFixed(3);

  const commonFractions = [
    { num: 1, den: 2 },
    { num: 1, den: 3 },
    { num: 1, den: 4 },
    { num: 2, den: 3 },
    { num: 3, den: 4 },
    { num: 2, den: 5 },
  ];

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
          <div className='text-2xl font-bold text-purple-700 dark:text-purple-300 mb-2'>
            All these fractions equal {decimal}
          </div>
        </div>

        <div className='space-y-4'>
          {equivalents.map((equiv, index) => (
            <div key={index} className='flex items-center gap-4'>
              <div className='w-16 text-right font-medium'>
                {equiv.num}/{equiv.den}
              </div>
              <div className='flex-1'>
                <svg width='260' height='40' viewBox='0 0 260 40'>
                  <g transform='translate(10, 5)'>
                    {createBarSegments(equiv.num, equiv.den)}
                  </g>
                </svg>
              </div>
              <div className='w-20 text-sm text-gray-500 dark:text-gray-400'>
                ×{equiv.multiplier}
              </div>
            </div>
          ))}
        </div>

        <div className='border-t pt-4'>
          <h4 className='font-medium mb-3'>Try different fractions:</h4>
          <div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
            {commonFractions.map((frac, index) => (
              <Button
                key={index}
                variant={
                  baseFraction.num === frac.num && baseFraction.den === frac.den
                    ? 'default'
                    : 'outline'
                }
                size='sm'
                onClick={() => setBaseFraction(frac)}
              >
                {frac.num}/{frac.den}
              </Button>
            ))}
          </div>
        </div>

        <div className='text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-950 p-3 rounded'>
          <strong>Key Insight:</strong> Equivalent fractions are created by
          multiplying both the numerator and denominator by the same number.
          Notice how all the bars show the same amount shaded, even though
          they're divided into different numbers of parts. This is why{' '}
          {baseFraction.num}/{baseFraction.den} = {equivalents[1].num}/
          {equivalents[1].den} = {equivalents[2].num}/{equivalents[2].den} ={' '}
          {equivalents[3].num}/{equivalents[3].den}.
        </div>
      </CardContent>
    </Card>
  );
}
