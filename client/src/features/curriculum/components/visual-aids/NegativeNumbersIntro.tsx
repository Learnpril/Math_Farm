import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface NegativeNumbersIntroProps {
  className?: string;
}

export const NegativeNumbersIntro: React.FC<NegativeNumbersIntroProps> = ({
  className,
}) => {
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [showRealWorld, setShowRealWorld] = useState(false);

  const numbers = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];

  const getRealWorldExample = (num: number) => {
    if (num > 0) {
      return {
        temperature: `${num}°C above freezing`,
        money: `$${num} in your account`,
        elevation: `${num} meters above sea level`,
        color: 'text-green-700 dark:text-green-300',
      };
    } else if (num < 0) {
      return {
        temperature: `${Math.abs(num)}°C below freezing`,
        money: `$${Math.abs(num)} debt/owed`,
        elevation: `${Math.abs(num)} meters below sea level`,
        color: 'text-red-700 dark:text-red-300',
      };
    } else {
      return {
        temperature: `0°C (freezing point)`,
        money: `$0 (no money, no debt)`,
        elevation: `Sea level (reference point)`,
        color: 'text-blue-700 dark:text-blue-300',
      };
    }
  };

  const getNumberDescription = (num: number) => {
    if (num > 0) return `${num} is a positive number`;
    if (num < 0) return `${num} is a negative number`;
    return `${num} is neither positive nor negative`;
  };

  const getPositionDescription = (num: number) => {
    if (num > 0) return `${num} is ${num} steps to the right of zero`;
    if (num < 0) return `${num} is ${Math.abs(num)} steps to the left of zero`;
    return `${num} is the starting point on the number line`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className='text-lg'>Interactive Number Line</CardTitle>
        <p className='text-sm text-muted-foreground'>
          Explore positive and negative numbers on the number line
        </p>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Number Line */}
        <div className='space-y-4'>
          <div className='text-sm font-medium text-center'>
            Click on any number to explore it!
          </div>

          {/* The Number Line */}
          <div className='relative overflow-x-auto pb-2'>
            <div className='relative min-w-[500px]'>
              {/* Line */}
              <div className='absolute top-1/2 left-4 right-4 h-0.5 bg-gray-300 dark:bg-gray-600 transform -translate-y-1/2'></div>

              {/* Arrow */}
              <div className='absolute top-1/2 right-4 transform -translate-y-1/2'>
                <div className='w-0 h-0 border-l-[8px] border-l-gray-300 dark:border-l-gray-600 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent'></div>
              </div>

              {/* Numbers */}
              <div className='flex justify-between items-center py-8 px-4'>
                {numbers.map(num => (
                  <div key={num} className='flex flex-col items-center flex-shrink-0'>
                    <button
                      onClick={() => setSelectedNumber(num)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all hover:scale-110 ${
                        selectedNumber === num
                          ? 'bg-primary text-primary-foreground border-primary'
                          : num === 0
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700'
                            : num > 0
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700'
                              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700'
                      }`}
                    >
                      {num}
                    </button>
                    <div className='text-xs text-muted-foreground mt-1 whitespace-nowrap'>
                      {num === 0 ? 'zero' : num > 0 ? 'positive' : 'negative'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile scroll hint */}
          <div className='sm:hidden mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg'>
            <p className='text-xs text-yellow-800 dark:text-yellow-200 text-center'>
              📱 <strong>Tip:</strong> Scroll horizontally to see all numbers
            </p>
          </div>

          {/* Direction Labels */}
          <div className='flex justify-between text-sm text-muted-foreground'>
            <div className='flex items-center gap-1'>
              <span>←</span>
              <span>Smaller (More Negative)</span>
            </div>
            <div className='flex items-center gap-1'>
              <span>Larger (More Positive)</span>
              <span>→</span>
            </div>
          </div>
        </div>

        {/* Selected Number Information */}
        {selectedNumber !== null && (
          <div className='p-4 bg-primary/5 rounded-lg border border-primary/20'>
            <div className='space-y-3'>
              <div className='text-lg font-semibold text-center'>
                You selected: {selectedNumber}
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <div className='text-sm font-medium'>Number Properties:</div>
                  <div className='text-sm'>
                    {getNumberDescription(selectedNumber)}
                  </div>
                  <div className='text-sm'>
                    {getPositionDescription(selectedNumber)}
                  </div>
                </div>

                <div className='space-y-2'>
                  <div className='text-sm font-medium'>Comparison:</div>
                  <div className='text-sm'>
                    {selectedNumber > 0 &&
                      `${selectedNumber} > 0 (greater than zero)`}
                    {selectedNumber < 0 &&
                      `${selectedNumber} < 0 (less than zero)`}
                    {selectedNumber === 0 &&
                      `${selectedNumber} = 0 (equal to zero)`}
                  </div>
                  {selectedNumber !== 0 && (
                    <div className='text-sm'>
                      Distance from zero: {Math.abs(selectedNumber)} units
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Real World Examples Toggle */}
        <div className='space-y-3'>
          <Button
            variant='outline'
            onClick={() => setShowRealWorld(!showRealWorld)}
            className='w-full'
          >
            {showRealWorld ? 'Hide' : 'Show'} Real-World Examples
          </Button>

          {showRealWorld && selectedNumber !== null && (
            <div className='p-4 bg-muted/30 rounded-lg'>
              <div className='text-sm font-medium mb-3'>
                Real-world examples for {selectedNumber}:
              </div>
              <div
                className={`space-y-2 ${getRealWorldExample(selectedNumber).color}`}
              >
                <div className='flex items-center gap-2'>
                  <span className='text-lg'>🌡️</span>
                  <span className='text-sm'>
                    {getRealWorldExample(selectedNumber).temperature}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-lg'>💰</span>
                  <span className='text-sm'>
                    {getRealWorldExample(selectedNumber).money}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-lg'>🏔️</span>
                  <span className='text-sm'>
                    {getRealWorldExample(selectedNumber).elevation}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Key Concepts */}
        <div className='space-y-3'>
          <div className='text-sm font-medium'>Key Concepts:</div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
            <div className='p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'>
              <div className='text-sm font-medium text-red-800 dark:text-red-200 mb-1'>
                Negative Numbers
              </div>
              <div className='text-xs text-red-700 dark:text-red-300'>
                Less than zero, written with minus sign (-)
              </div>
            </div>
            <div className='p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
              <div className='text-sm font-medium text-blue-800 dark:text-blue-200 mb-1'>
                Zero
              </div>
              <div className='text-xs text-blue-700 dark:text-blue-300'>
                Neither positive nor negative, the dividing point
              </div>
            </div>
            <div className='p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg'>
              <div className='text-sm font-medium text-green-800 dark:text-green-200 mb-1'>
                Positive Numbers
              </div>
              <div className='text-xs text-green-700 dark:text-green-300'>
                Greater than zero, can be written with or without + sign
              </div>
            </div>
          </div>
        </div>

        {/* Ordering Challenge */}
        <div className='p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg'>
          <div className='text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2'>
            💡 Remember: Ordering Rule
          </div>
          <div className='text-sm text-yellow-700 dark:text-yellow-300'>
            On the number line, numbers get larger as you move right and smaller
            as you move left. So -5 &lt; -2 &lt; 0 &lt; 3 &lt; 5
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
