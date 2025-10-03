import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '../../../../components/ui/slider';

interface FractionDivisionBarsProps {
  title?: string;
  description?: string;
  className?: string;
}

export function FractionDivisionBars({
  title = 'Fraction Division with Bars',
  description = "Visualize fraction division as 'how many groups fit?'",
  className = '',
}: FractionDivisionBarsProps) {
  const [dividend, setDividend] = useState({ num: 3, den: 4 });
  const [divisor, setDivisor] = useState({ num: 1, den: 8 });

  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };

  // Calculate division: dividend ÷ divisor = dividend × (reciprocal of divisor)
  const reciprocal = { num: divisor.den, den: divisor.num };
  const quotient = {
    num: dividend.num * reciprocal.num,
    den: dividend.den * reciprocal.den,
  };
  const quotientGcd = gcd(quotient.num, quotient.den);
  const simplifiedQuotient = {
    num: quotient.num / quotientGcd,
    den: quotient.den / quotientGcd,
  };

  const createDividendBar = () => {
    const segments = [];
    const segmentWidth = 240 / dividend.den;

    for (let i = 0; i < dividend.den; i++) {
      const x = i * segmentWidth;
      const isShaded = i < dividend.num;

      segments.push(
        <rect
          key={i}
          x={x}
          y={0}
          width={segmentWidth}
          height={30}
          fill={isShaded ? '#3b82f6' : 'currentColor'}
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

  const createDivisorBar = () => {
    const segments = [];
    const segmentWidth = 240 / divisor.den;

    for (let i = 0; i < divisor.den; i++) {
      const x = i * segmentWidth;
      const isShaded = i < divisor.num;

      segments.push(
        <rect
          key={i}
          x={x}
          y={0}
          width={segmentWidth}
          height={20}
          fill={isShaded ? '#10b981' : 'currentColor'}
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

  // Create visualization showing how many divisor pieces fit into dividend
  const createDivisionVisualization = () => {
    const dividendDecimal = dividend.num / dividend.den;
    const divisorDecimal = divisor.num / divisor.den;
    const result = dividendDecimal / divisorDecimal;

    const wholeParts = Math.floor(result);
    const fractionalPart = result - wholeParts;

    const groups = [];
    const groupWidth = 60;
    const maxGroups = Math.min(8, Math.ceil(result));

    for (let i = 0; i < maxGroups; i++) {
      const x = i * (groupWidth + 10);
      const isComplete = i < wholeParts;
      const isPartial = i === wholeParts && fractionalPart > 0;

      let fillColor: string;
      let fillClass: string;

      if (isComplete) {
        fillColor = '#10b981';
        fillClass = '';
      } else if (isPartial) {
        fillColor = '#86efac';
        fillClass = '';
      } else {
        fillColor = 'currentColor';
        fillClass = 'text-gray-200 dark:text-gray-800';
      }

      groups.push(
        <rect
          key={i}
          x={x}
          y={0}
          width={groupWidth}
          height={20}
          fill={fillColor}
          className={`stroke-gray-700 dark:stroke-gray-300 ${fillClass}`}
          strokeWidth='1'
          rx='3'
        />
      );

      groups.push(
        <text
          key={`text-${i}`}
          x={x + groupWidth / 2}
          y={15}
          textAnchor='middle'
          fontSize='10'
          className='fill-gray-700 dark:fill-gray-300'
        >
          {divisor.num}/{divisor.den}
        </text>
      );
    }

    return groups;
  };

  const decimalDividend = (dividend.num / dividend.den).toFixed(3);
  const decimalDivisor = (divisor.num / divisor.den).toFixed(3);
  const decimalQuotient = (quotient.num / quotient.den).toFixed(3);

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
            {dividend.num}/{dividend.den} ÷ {divisor.num}/{divisor.den} ={' '}
            {simplifiedQuotient.num}/{simplifiedQuotient.den}
          </div>
          <div className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
            {decimalDividend} ÷ {decimalDivisor} = {decimalQuotient}
          </div>
        </div>

        <div className='space-y-6'>
          {/* Question visualization */}
          <div className='bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg'>
            <h4 className='font-medium mb-3 text-blue-800 dark:text-blue-200'>
              Question: How many {divisor.num}/{divisor.den} pieces fit into{' '}
              {dividend.num}/{dividend.den}?
            </h4>

            <div className='space-y-3'>
              <div>
                <div className='text-sm font-medium mb-1 text-gray-900 dark:text-gray-100'>
                  Dividend: {dividend.num}/{dividend.den}
                </div>
                <svg width='260' height='40' viewBox='0 0 260 40'>
                  <g transform='translate(10, 5)'>{createDividendBar()}</g>
                </svg>
              </div>

              <div>
                <div className='text-sm font-medium mb-1 text-gray-900 dark:text-gray-100'>
                  Divisor: {divisor.num}/{divisor.den}
                </div>
                <svg width='260' height='30' viewBox='0 0 260 30'>
                  <g transform='translate(10, 5)'>{createDivisorBar()}</g>
                </svg>
              </div>
            </div>
          </div>

          {/* Method: Invert and multiply */}
          <div className='bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg'>
            <h4 className='font-medium mb-3 text-purple-800 dark:text-purple-200'>
              Method: Invert and Multiply
            </h4>
            <div className='space-y-2 text-sm'>
              <div>
                1. Keep the first fraction: {dividend.num}/{dividend.den}
              </div>
              <div>
                2. Invert the second fraction: {divisor.num}/{divisor.den} →{' '}
                {reciprocal.num}/{reciprocal.den}
              </div>
              <div>
                3. Multiply: {dividend.num}/{dividend.den} × {reciprocal.num}/
                {reciprocal.den}
              </div>
              <div>
                4. Calculate: ({dividend.num} × {reciprocal.num}) / (
                {dividend.den} × {reciprocal.den}) = {quotient.num}/
                {quotient.den}
              </div>
              {simplifiedQuotient.num !== quotient.num && (
                <div>
                  5. Simplify: {quotient.num}/{quotient.den} ={' '}
                  {simplifiedQuotient.num}/{simplifiedQuotient.den}
                </div>
              )}
            </div>
          </div>

          {/* Visual answer */}
          <div className='bg-green-50 dark:bg-green-900/20 p-4 rounded-lg'>
            <h4 className='font-medium mb-3 text-green-800 dark:text-green-200'>
              Answer: {decimalQuotient} groups (or {simplifiedQuotient.num}/
              {simplifiedQuotient.den})
            </h4>
            <div className='text-sm mb-2'>
              Each green box represents one {divisor.num}/{divisor.den} piece:
            </div>
            <svg
              width='600'
              height='40'
              viewBox='0 0 600 40'
              className='overflow-x-auto'
            >
              <g transform='translate(10, 10)'>
                {createDivisionVisualization()}
              </g>
            </svg>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100'>
              Dividend (being divided)
            </label>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <span className='w-8 text-xs'>Num:</span>
                <Slider
                  value={[dividend.num]}
                  onValueChange={(value: number[]) =>
                    setDividend(prev => ({
                      ...prev,
                      num: Math.min(value[0] || 1, prev.den),
                    }))
                  }
                  max={dividend.den}
                  min={1}
                  step={1}
                  className='flex-1'
                />
                <span className='w-8 text-xs'>{dividend.num}</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='w-8 text-xs'>Den:</span>
                <Slider
                  value={[dividend.den]}
                  onValueChange={(value: number[]) =>
                    setDividend(prev => ({
                      num: Math.min(prev.num, value[0] || 1),
                      den: value[0] || 1,
                    }))
                  }
                  max={8}
                  min={2}
                  step={1}
                  className='flex-1'
                />
                <span className='w-8 text-xs'>{dividend.den}</span>
              </div>
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100'>
              Divisor (dividing by)
            </label>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <span className='w-8 text-xs'>Num:</span>
                <Slider
                  value={[divisor.num]}
                  onValueChange={(value: number[]) =>
                    setDivisor(prev => ({
                      ...prev,
                      num: Math.min(value[0] || 1, prev.den),
                    }))
                  }
                  max={divisor.den}
                  min={1}
                  step={1}
                  className='flex-1'
                />
                <span className='w-8 text-xs'>{divisor.num}</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='w-8 text-xs'>Den:</span>
                <Slider
                  value={[divisor.den]}
                  onValueChange={(value: number[]) =>
                    setDivisor(prev => ({
                      num: Math.min(prev.num, value[0] || 1),
                      den: value[0] || 1,
                    }))
                  }
                  max={8}
                  min={2}
                  step={1}
                  className='flex-1'
                />
                <span className='w-8 text-xs'>{divisor.den}</span>
              </div>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              setDividend({ num: 1, den: 2 });
              setDivisor({ num: 1, den: 4 });
            }}
          >
            1/2 ÷ 1/4
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              setDividend({ num: 3, den: 4 });
              setDivisor({ num: 1, den: 8 });
            }}
          >
            3/4 ÷ 1/8
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              setDividend({ num: 2, den: 3 });
              setDivisor({ num: 1, den: 6 });
            }}
          >
            2/3 ÷ 1/6
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              setDividend({ num: 5, den: 6 });
              setDivisor({ num: 1, den: 3 });
            }}
          >
            5/6 ÷ 1/3
          </Button>
        </div>

        <div className='text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-950 p-3 rounded'>
          <strong>Key Insight:</strong> Dividing by a fraction is the same as
          multiplying by its reciprocal. When you divide {dividend.num}/
          {dividend.den} by {divisor.num}/{divisor.den}, you're asking "how many{' '}
          {divisor.num}/{divisor.den} pieces fit into {dividend.num}/
          {dividend.den}?" The answer is {decimalQuotient}, which means{' '}
          {Math.floor(parseFloat(decimalQuotient))} complete pieces plus a
          partial piece.
        </div>
      </CardContent>
    </Card>
  );
}
