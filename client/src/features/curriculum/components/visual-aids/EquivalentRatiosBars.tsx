import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '../../../../components/ui/slider';

interface EquivalentRatiosBarsProps {
  title?: string;
  description?: string;
  className?: string;
}

export function EquivalentRatiosBars({
  title = 'Equivalent Ratios Visualization',
  description = 'See how ratios stay equivalent when scaled up or down',
  className = '',
}: EquivalentRatiosBarsProps) {
  const [baseRatio, setBaseRatio] = useState({ a: 2, b: 3 });
  const [multiplier, setMultiplier] = useState(2);

  const scaledRatio = {
    a: baseRatio.a * multiplier,
    b: baseRatio.b * multiplier,
  };

  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };

  const simplifyRatio = (a: number, b: number) => {
    const divisor = gcd(a, b);
    return { a: a / divisor, b: b / divisor };
  };

  const simplified = simplifyRatio(scaledRatio.a, scaledRatio.b);

  const createBars = (a: number, b: number, color1: string, color2: string) => {
    const total = a + b;
    const width1 = (a / total) * 100;
    const width2 = (b / total) * 100;

    return (
      <div className='space-y-2'>
        <div className='flex h-12 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600'>
          <div
            className={`${color1} flex items-center justify-center text-white text-sm font-medium`}
            style={{ width: `${width1}%` }}
          >
            {a}
          </div>
          <div
            className={`${color2} flex items-center justify-center text-white text-sm font-medium`}
            style={{ width: `${width2}%` }}
          >
            {b}
          </div>
        </div>
        <div className='text-center text-sm font-medium text-gray-700 dark:text-gray-300'>
          {a}:{b}
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
            {baseRatio.a}:{baseRatio.b} = {scaledRatio.a}:{scaledRatio.b}
          </div>
          <div className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
            Both ratios are equivalent
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Original Ratio */}
          <div className='space-y-3'>
            <h4 className='font-medium text-gray-900 dark:text-gray-100'>
              Original Ratio: {baseRatio.a}:{baseRatio.b}
            </h4>
            {createBars(baseRatio.a, baseRatio.b, 'bg-blue-500', 'bg-red-500')}
          </div>

          {/* Scaled Ratio */}
          <div className='space-y-3'>
            <h4 className='font-medium text-gray-900 dark:text-gray-100'>
              Scaled Ratio: {scaledRatio.a}:{scaledRatio.b}
            </h4>
            {createBars(
              scaledRatio.a,
              scaledRatio.b,
              'bg-blue-600',
              'bg-red-600'
            )}
          </div>
        </div>

        {/* Explanation */}
        <div className='bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg'>
          <h4 className='font-medium mb-3 text-blue-800 dark:text-blue-200'>
            How Equivalent Ratios Work:
          </h4>
          <div className='space-y-2 text-sm text-blue-700 dark:text-blue-300'>
            <div>
              1. Start with ratio {baseRatio.a}:{baseRatio.b}
            </div>
            <div>
              2. Multiply both parts by {multiplier}: ({baseRatio.a} ×{' '}
              {multiplier}):(
              {baseRatio.b} × {multiplier}) = {scaledRatio.a}:{scaledRatio.b}
            </div>
            <div>
              3. The proportions stay the same - both bars have identical
              shapes!
            </div>
            {simplified.a !== scaledRatio.a && (
              <div>
                4. Simplified form: {simplified.a}:{simplified.b}
              </div>
            )}
          </div>
        </div>

        {/* Interactive Controls */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100'>
              Base Ratio: {baseRatio.a}:{baseRatio.b}
            </label>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <span className='w-8 text-xs text-gray-700 dark:text-gray-300'>
                  A:
                </span>
                <Slider
                  value={[baseRatio.a]}
                  onValueChange={(value: number[]) =>
                    setBaseRatio(prev => ({ ...prev, a: value[0] || 1 }))
                  }
                  max={8}
                  min={1}
                  step={1}
                  className='flex-1'
                />
                <span className='w-8 text-xs text-gray-700 dark:text-gray-300'>
                  {baseRatio.a}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='w-8 text-xs text-gray-700 dark:text-gray-300'>
                  B:
                </span>
                <Slider
                  value={[baseRatio.b]}
                  onValueChange={(value: number[]) =>
                    setBaseRatio(prev => ({ ...prev, b: value[0] || 1 }))
                  }
                  max={8}
                  min={1}
                  step={1}
                  className='flex-1'
                />
                <span className='w-8 text-xs text-gray-700 dark:text-gray-300'>
                  {baseRatio.b}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100'>
              Multiplier: {multiplier}
            </label>
            <div className='flex items-center gap-2'>
              <span className='w-8 text-xs text-gray-700 dark:text-gray-300'>
                ×
              </span>
              <Slider
                value={[multiplier]}
                onValueChange={(value: number[]) =>
                  setMultiplier(value[0] || 1)
                }
                max={6}
                min={1}
                step={1}
                className='flex-1'
              />
              <span className='w-8 text-xs text-gray-700 dark:text-gray-300'>
                {multiplier}
              </span>
            </div>
          </div>
        </div>

        <div className='text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-950 p-3 rounded'>
          <strong>Key Insight:</strong> Equivalent ratios represent the same
          relationship at different scales. When you multiply or divide both
          parts of a ratio by the same number, you get an equivalent ratio. The
          visual bars maintain the same proportions, showing that {baseRatio.a}:
          {baseRatio.b} and {scaledRatio.a}:{scaledRatio.b} represent the same
          relationship.
        </div>
      </CardContent>
    </Card>
  );
}
