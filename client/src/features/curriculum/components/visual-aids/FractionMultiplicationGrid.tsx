import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '../../../../components/ui/slider';

interface FractionMultiplicationGridProps {
  title?: string;
  description?: string;
  className?: string;
}

export function FractionMultiplicationGrid({
  title = 'Fraction Multiplication Grid',
  description = 'Visualize fraction multiplication as area of a rectangle',
  className = '',
}: FractionMultiplicationGridProps) {
  const [frac1, setFrac1] = useState({ num: 2, den: 3 });
  const [frac2, setFrac2] = useState({ num: 3, den: 4 });

  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };

  const createGrid = (
    rows: number,
    cols: number,
    shadedRows: number,
    shadedCols: number
  ) => {
    const cells = [];
    const cellWidth = 240 / cols;
    const cellHeight = 180 / rows;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * cellWidth;
        const y = row * cellHeight;

        const isRowShaded = row < shadedRows;
        const isColShaded = col < shadedCols;
        const isBothShaded = isRowShaded && isColShaded;

        let fillColor: string;
        let fillClass: string;

        if (isBothShaded) {
          fillColor = '#8b5cf6'; // Purple for intersection
          fillClass = '';
        } else if (isRowShaded) {
          fillColor = '#ddd6fe'; // Light purple for row shading
          fillClass = '';
        } else if (isColShaded) {
          fillColor = '#e0e7ff'; // Light blue for column shading
          fillClass = '';
        } else {
          fillColor = 'currentColor';
          fillClass = 'text-gray-200 dark:text-gray-800';
        }

        cells.push(
          <rect
            key={`${row}-${col}`}
            x={x}
            y={y}
            width={cellWidth}
            height={cellHeight}
            fill={fillColor}
            className={`stroke-gray-700 dark:stroke-gray-300 ${fillClass}`}
            strokeWidth='1'
          />
        );
      }
    }

    return cells;
  };

  const product = { num: frac1.num * frac2.num, den: frac1.den * frac2.den };
  const productGcd = gcd(product.num, product.den);
  const simplifiedProduct = {
    num: product.num / productGcd,
    den: product.den / productGcd,
  };

  const decimal1 = (frac1.num / frac1.den).toFixed(3);
  const decimal2 = (frac2.num / frac2.den).toFixed(3);
  const decimalProduct = (product.num / product.den).toFixed(3);

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
            {frac1.num}/{frac1.den} × {frac2.num}/{frac2.den} ={' '}
            {simplifiedProduct.num}/{simplifiedProduct.den}
          </div>
          <div className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
            {decimal1} × {decimal2} = {decimalProduct}
          </div>
        </div>

        <div className='flex flex-col lg:flex-row items-center gap-6'>
          <div className='flex-shrink-0'>
            <div className='text-center mb-2'>
              <div className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                {frac1.num}/{frac1.den} of {frac2.num}/{frac2.den}
              </div>
            </div>
            <svg
              width='260'
              height='200'
              viewBox='0 0 260 200'
              className='border rounded'
            >
              <g transform='translate(10, 10)'>
                {createGrid(frac1.den, frac2.den, frac1.num, frac2.num)}
              </g>
            </svg>
            <div className='text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-xs'>
              Grid: {frac2.den} columns × {frac1.den} rows
              <br />
              Purple area: {frac1.num * frac2.num} out of{' '}
              {frac1.den * frac2.den} squares
            </div>
          </div>

          <div className='flex-1 space-y-4'>
            <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-lg'>
              <h4 className='font-medium mb-3 text-gray-900 dark:text-gray-100'>
                Step-by-step:
              </h4>
              <div className='space-y-2 text-sm'>
                <div>
                  1. Create a {frac2.den} × {frac1.den} grid
                </div>
                <div>2. Shade {frac2.num} columns (light blue)</div>
                <div>3. Shade {frac1.num} rows (light purple)</div>
                <div>
                  4. Count overlap (dark purple): {frac1.num * frac2.num}{' '}
                  squares
                </div>
                <div>5. Total squares: {frac1.den * frac2.den}</div>
                <div>
                  6. Result: {frac1.num * frac2.num}/{frac1.den * frac2.den}
                  {simplifiedProduct.num !== product.num && (
                    <span>
                      {' '}
                      = {simplifiedProduct.num}/{simplifiedProduct.den}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100'>
                  First fraction: {frac1.num}/{frac1.den}
                </label>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <span className='w-8 text-xs text-gray-700 dark:text-gray-300'>
                      Num:
                    </span>
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
                    <span className='w-8 text-xs text-gray-700 dark:text-gray-300'>
                      {frac1.num}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='w-8 text-xs text-gray-700 dark:text-gray-300'>
                      Den:
                    </span>
                    <Slider
                      value={[frac1.den]}
                      onValueChange={(value: number[]) =>
                        setFrac1(prev => ({
                          num: Math.min(prev.num, value[0] || 1),
                          den: value[0] || 1,
                        }))
                      }
                      max={8}
                      min={2}
                      step={1}
                      className='flex-1'
                    />
                    <span className='w-8 text-xs text-gray-700 dark:text-gray-300'>
                      {frac1.den}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100'>
                  Second fraction: {frac2.num}/{frac2.den}
                </label>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <span className='w-8 text-xs text-gray-700 dark:text-gray-300'>
                      Num:
                    </span>
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
                    <span className='w-8 text-xs text-gray-700 dark:text-gray-300'>
                      {frac2.num}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='w-8 text-xs text-gray-700 dark:text-gray-300'>
                      Den:
                    </span>
                    <Slider
                      value={[frac2.den]}
                      onValueChange={(value: number[]) =>
                        setFrac2(prev => ({
                          num: Math.min(prev.num, value[0] || 1),
                          den: value[0] || 1,
                        }))
                      }
                      max={8}
                      min={2}
                      step={1}
                      className='flex-1'
                    />
                    <span className='w-8 text-xs text-gray-700 dark:text-gray-300'>
                      {frac2.den}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              setFrac1({ num: 1, den: 2 });
              setFrac2({ num: 1, den: 3 });
            }}
          >
            1/2 × 1/3
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              setFrac1({ num: 2, den: 3 });
              setFrac2({ num: 3, den: 4 });
            }}
          >
            2/3 × 3/4
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              setFrac1({ num: 3, den: 5 });
              setFrac2({ num: 2, den: 3 });
            }}
          >
            3/5 × 2/3
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              setFrac1({ num: 1, den: 4 });
              setFrac2({ num: 2, den: 5 });
            }}
          >
            1/4 × 2/5
          </Button>
        </div>

        <div className='text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-950 p-3 rounded'>
          <strong>Understanding:</strong> Multiplying fractions means finding "a
          fraction of a fraction." The grid shows {frac1.num}/{frac1.den} of{' '}
          {frac2.num}/{frac2.den} as the overlapping purple area. The algorithm
          is simple: multiply numerators ({frac1.num} × {frac2.num} ={' '}
          {product.num}) and multiply denominators ({frac1.den} × {frac2.den} ={' '}
          {product.den}).
        </div>
      </CardContent>
    </Card>
  );
}
