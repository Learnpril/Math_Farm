import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ExponentComparisonProps {
  className?: string;
}

export const ExponentComparison: React.FC<ExponentComparisonProps> = ({
  className,
}) => {
  const [leftBase, setLeftBase] = useState(3);
  const [leftExp, setLeftExp] = useState(4);
  const [rightBase, setRightBase] = useState(4);
  const [rightExp, setRightExp] = useState(3);

  const leftValue = Math.pow(leftBase, leftExp);
  const rightValue = Math.pow(rightBase, rightExp);

  const getComparison = () => {
    if (leftValue > rightValue)
      return {
        symbol: '>',
        winner: 'left',
        difference: leftValue - rightValue,
      };
    if (leftValue < rightValue)
      return {
        symbol: '<',
        winner: 'right',
        difference: rightValue - leftValue,
      };
    return { symbol: '=', winner: 'tie', difference: 0 };
  };

  const comparison = getComparison();

  const renderExponentBreakdown = (
    base: number,
    exp: number,
    value: number,
    side: 'left' | 'right'
  ) => {
    const isWinner = comparison.winner === side;
    const isTie = comparison.winner === 'tie';

    return (
      <div
        className={`p-4 rounded-lg border-2 transition-all ${
          isWinner
            ? 'border-green-300 bg-green-50'
            : isTie
              ? 'border-blue-300 bg-blue-50'
              : 'border-gray-200 bg-gray-50'
        }`}
      >
        <div className='text-center space-y-3'>
          {/* Expression */}
          <div className='text-2xl font-bold'>
            {base}
            <sup>{exp}</sup>
          </div>

          {/* Breakdown */}
          <div className='text-sm text-muted-foreground'>
            = {Array(exp).fill(base).join(' × ')}
          </div>

          {/* Step-by-step calculation for small numbers */}
          {exp <= 4 && (
            <div className='text-xs space-y-1'>
              {Array.from({ length: exp }, (_, i) => {
                const stepValue = Math.pow(base, i + 1);
                const stepCalc =
                  i === 0
                    ? base.toString()
                    : `${Math.pow(base, i)} × ${base} = ${stepValue}`;
                return (
                  <div key={i} className='text-muted-foreground'>
                    Step {i + 1}: {stepCalc}
                  </div>
                );
              })}
            </div>
          )}

          {/* Final result */}
          <div className='text-xl font-bold text-primary'>
            = {value.toLocaleString()}
          </div>

          {/* Winner indicator */}
          {isWinner && (
            <div className='text-sm font-medium text-green-700'>
              🏆 Larger by {comparison.difference.toLocaleString()}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className='text-lg'>Exponent Comparison Tool</CardTitle>
        <p className='text-sm text-muted-foreground'>
          Compare different exponential expressions to see which is larger
        </p>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Controls */}
        <div className='grid grid-cols-2 gap-6'>
          <div className='space-y-3'>
            <div className='text-sm font-medium text-center'>
              Left Expression
            </div>
            <div className='flex items-center justify-center gap-2'>
              <select
                value={leftBase}
                onChange={e => setLeftBase(Number(e.target.value))}
                className='px-2 py-1 border rounded text-sm bg-background text-foreground border-border'
              >
                {[2, 3, 4, 5, 6].map(n => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span className='text-sm'>^</span>
              <select
                value={leftExp}
                onChange={e => setLeftExp(Number(e.target.value))}
                className='px-2 py-1 border rounded text-sm bg-background text-foreground border-border'
              >
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className='space-y-3'>
            <div className='text-sm font-medium text-center'>
              Right Expression
            </div>
            <div className='flex items-center justify-center gap-2'>
              <select
                value={rightBase}
                onChange={e => setRightBase(Number(e.target.value))}
                className='px-2 py-1 border rounded text-sm bg-background text-foreground border-border'
              >
                {[2, 3, 4, 5, 6].map(n => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span className='text-sm'>^</span>
              <select
                value={rightExp}
                onChange={e => setRightExp(Number(e.target.value))}
                className='px-2 py-1 border rounded text-sm bg-background text-foreground border-border'
              >
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Comparison Display */}
        <div className='grid grid-cols-3 gap-4 items-center'>
          {/* Left Expression */}
          <div>
            {renderExponentBreakdown(leftBase, leftExp, leftValue, 'left')}
          </div>

          {/* Comparison Symbol */}
          <div className='text-center'>
            <div
              className={`text-4xl font-bold p-4 rounded-full ${
                comparison.winner === 'tie'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-primary/10 text-primary'
              }`}
            >
              {comparison.symbol}
            </div>
          </div>

          {/* Right Expression */}
          <div>
            {renderExponentBreakdown(rightBase, rightExp, rightValue, 'right')}
          </div>
        </div>

        {/* Insights */}
        <div className='space-y-3'>
          <div className='text-sm font-medium'>Key Insights:</div>

          {leftBase === rightBase && leftExp !== rightExp && (
            <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg'>
              <div className='text-sm text-blue-800'>
                <strong>Same base, different exponents:</strong> Higher exponent
                wins.
                {leftBase}^{Math.max(leftExp, rightExp)} is{' '}
                {Math.abs(leftValue - rightValue).toLocaleString()} times larger
                than {leftBase}^{Math.min(leftExp, rightExp)}.
              </div>
            </div>
          )}

          {leftExp === rightExp && leftBase !== rightBase && (
            <div className='p-3 bg-purple-50 border border-purple-200 rounded-lg'>
              <div className='text-sm text-purple-800'>
                <strong>Same exponent, different bases:</strong> Larger base
                wins. The difference grows as the exponent increases!
              </div>
            </div>
          )}

          {leftBase !== rightBase && leftExp !== rightExp && (
            <div className='p-3 bg-orange-50 border border-orange-200 rounded-lg'>
              <div className='text-sm text-orange-800'>
                <strong>Different bases and exponents:</strong> Sometimes a
                smaller base with higher exponent wins! This shows why exponents
                grow so quickly.
              </div>
            </div>
          )}

          {comparison.winner === 'tie' && (
            <div className='p-3 bg-green-50 border border-green-200 rounded-lg'>
              <div className='text-sm text-green-800'>
                <strong>Equal values:</strong> Different combinations can give
                the same result! For example, 2^4 = 4^2 = 16.
              </div>
            </div>
          )}
        </div>

        {/* Common Misconception Alert */}
        <div className='p-3 bg-red-50 border border-red-200 rounded-lg'>
          <div className='text-sm font-medium text-red-800 mb-1'>
            ⚠️ Common Mistake:
          </div>
          <div className='text-sm text-red-700'>
            Don't confuse exponents with multiplication! {leftBase}^{leftExp} ≠{' '}
            {leftBase} × {leftExp} = {leftBase * leftExp}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
