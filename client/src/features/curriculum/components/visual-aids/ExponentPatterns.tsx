import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ExponentPatternsProps {
  className?: string;
}

export const ExponentPatterns: React.FC<ExponentPatternsProps> = ({
  className,
}) => {
  const [selectedPattern, setSelectedPattern] = useState<
    'powers-of-2' | 'powers-of-10' | 'squares' | 'cubes'
  >('powers-of-2');
  const [showSteps, setShowSteps] = useState(false);

  const patterns = {
    'powers-of-2': {
      title: 'Powers of 2',
      description: 'Each step doubles the previous value',
      base: 2,
      sequence: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      realWorld: 'Computer memory, cell division, tournament brackets',
      pattern: 'Each value = previous × 2',
    },
    'powers-of-10': {
      title: 'Powers of 10',
      description: 'Place value system foundation',
      base: 10,
      sequence: [0, 1, 2, 3, 4, 5, 6],
      realWorld: 'Money, metric system, scientific notation',
      pattern: 'Each value adds one zero',
    },
    squares: {
      title: 'Perfect Squares',
      description: 'Numbers multiplied by themselves',
      base: 'n',
      sequence: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      realWorld: 'Area calculations, quadratic growth',
      pattern: 'n² = n × n',
    },
    cubes: {
      title: 'Perfect Cubes',
      description: 'Numbers multiplied by themselves three times',
      base: 'n',
      sequence: [1, 2, 3, 4, 5, 6, 7, 8],
      realWorld: 'Volume calculations, cubic growth',
      pattern: 'n³ = n × n × n',
    },
  };

  const currentPattern = patterns[selectedPattern];

  const calculateValue = (index: number) => {
    switch (selectedPattern) {
      case 'powers-of-2':
        return Math.pow(2, index);
      case 'powers-of-10':
        return Math.pow(10, index);
      case 'squares':
        return Math.pow(index, 2);
      case 'cubes':
        return Math.pow(index, 3);
      default:
        return 0;
    }
  };

  const getExpression = (index: number) => {
    switch (selectedPattern) {
      case 'powers-of-2':
        return `2^${index}`;
      case 'powers-of-10':
        return `10^${index}`;
      case 'squares':
        return `${index}^2`;
      case 'cubes':
        return `${index}^3`;
      default:
        return '';
    }
  };

  const getMultiplicationForm = (index: number) => {
    switch (selectedPattern) {
      case 'powers-of-2':
        return index === 0 ? '1' : Array(index).fill('2').join(' × ');
      case 'powers-of-10':
        return index === 0 ? '1' : Array(index).fill('10').join(' × ');
      case 'squares':
        return `${index} × ${index}`;
      case 'cubes':
        return `${index} × ${index} × ${index}`;
      default:
        return '';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className='text-lg'>Exponent Patterns Explorer</CardTitle>
        <p className='text-sm text-muted-foreground'>
          Discover patterns in different types of exponential sequences
        </p>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Pattern Selection */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
          {Object.entries(patterns).map(([key, pattern]) => (
            <Button
              key={key}
              variant={selectedPattern === key ? 'default' : 'outline'}
              size='sm'
              onClick={() => setSelectedPattern(key as any)}
              className='text-xs'
            >
              {pattern.title}
            </Button>
          ))}
        </div>

        {/* Pattern Info */}
        <div className='p-4 bg-primary/5 rounded-lg'>
          <div className='text-lg font-semibold mb-2'>
            {currentPattern.title}
          </div>
          <div className='text-sm text-muted-foreground mb-2'>
            {currentPattern.description}
          </div>
          <div className='text-sm'>
            <strong>Pattern:</strong> {currentPattern.pattern}
          </div>
          <div className='text-sm'>
            <strong>Real-world uses:</strong> {currentPattern.realWorld}
          </div>
        </div>

        {/* Sequence Display */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='text-sm font-medium'>Sequence Values:</div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowSteps(!showSteps)}
            >
              {showSteps ? 'Hide' : 'Show'} Steps
            </Button>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
            {currentPattern.sequence.map((n, index) => {
              const value = calculateValue(n);
              const expression = getExpression(n);
              const multiplication = getMultiplicationForm(n);

              return (
                <div
                  key={index}
                  className='p-3 bg-muted/30 rounded-lg text-center space-y-2'
                >
                  <div className='font-mono text-lg font-bold text-primary'>
                    {expression}
                  </div>
                  {showSteps && (
                    <div className='text-xs text-muted-foreground'>
                      = {multiplication}
                    </div>
                  )}
                  <div className='text-sm font-medium'>
                    = {value.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pattern Analysis */}
        <div className='space-y-3'>
          <div className='text-sm font-medium'>Pattern Analysis:</div>

          {selectedPattern === 'powers-of-2' && (
            <div className='space-y-2'>
              <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                <div className='text-sm text-blue-800'>
                  <strong>Doubling Pattern:</strong> Each value is exactly
                  double the previous one. Notice: 2^10 = 1,024 ≈ 1,000 (that's
                  why 1 KB ≈ 1,000 bytes in computing!)
                </div>
              </div>
              <div className='p-3 bg-green-50 border border-green-200 rounded-lg'>
                <div className='text-sm text-green-800'>
                  <strong>Growth Speed:</strong> From 2^0 to 2^10, we go from 1
                  to over 1,000 in just 10 steps!
                </div>
              </div>
            </div>
          )}

          {selectedPattern === 'powers-of-10' && (
            <div className='space-y-2'>
              <div className='p-3 bg-purple-50 border border-purple-200 rounded-lg'>
                <div className='text-sm text-purple-800'>
                  <strong>Place Value Connection:</strong> Each power of 10
                  represents a place value position. 10^2 = 100 (hundreds
                  place), 10^3 = 1,000 (thousands place).
                </div>
              </div>
              <div className='p-3 bg-orange-50 border border-orange-200 rounded-lg'>
                <div className='text-sm text-orange-800'>
                  <strong>Zero Pattern:</strong> The exponent tells you how many
                  zeros follow the 1. 10^4 = 10,000 (four zeros).
                </div>
              </div>
            </div>
          )}

          {selectedPattern === 'squares' && (
            <div className='space-y-2'>
              <div className='p-3 bg-red-50 border border-red-200 rounded-lg'>
                <div className='text-sm text-red-800'>
                  <strong>Square Numbers:</strong> These form the areas of
                  squares with side length n. A 5×5 square has area 25.
                </div>
              </div>
              <div className='p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
                <div className='text-sm text-yellow-800'>
                  <strong>Odd Differences:</strong> The differences between
                  consecutive squares are odd numbers: 4-1=3, 9-4=5, 16-9=7,
                  25-16=9...
                </div>
              </div>
            </div>
          )}

          {selectedPattern === 'cubes' && (
            <div className='space-y-2'>
              <div className='p-3 bg-indigo-50 border border-indigo-200 rounded-lg'>
                <div className='text-sm text-indigo-800'>
                  <strong>Cube Numbers:</strong> These represent volumes of
                  cubes with side length n. A 3×3×3 cube has volume 27.
                </div>
              </div>
              <div className='p-3 bg-pink-50 border border-pink-200 rounded-lg'>
                <div className='text-sm text-pink-800'>
                  <strong>Rapid Growth:</strong> Cubes grow much faster than
                  squares. Compare: 10^2 = 100, but 10^3 = 1,000!
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Memory Tips */}
        <div className='p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
          <div className='text-sm font-medium text-yellow-800 mb-2'>
            💡 Memory Tips:
          </div>
          <div className='text-sm text-yellow-700 space-y-1'>
            {selectedPattern === 'powers-of-2' && (
              <>
                <div>• 2^10 = 1,024 (remember: "kilo" in computing)</div>
                <div>
                  • Each step doubles: 1, 2, 4, 8, 16, 32, 64, 128, 256, 512,
                  1024
                </div>
              </>
            )}
            {selectedPattern === 'powers-of-10' && (
              <>
                <div>• Count the zeros: 10^n has n zeros after the 1</div>
                <div>
                  • Links to place value: 10^2 = hundreds, 10^3 = thousands
                </div>
              </>
            )}
            {selectedPattern === 'squares' && (
              <>
                <div>
                  • Perfect squares: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100
                </div>
                <div>• Think of square tiles: n^2 tiles make an n×n square</div>
              </>
            )}
            {selectedPattern === 'cubes' && (
              <>
                <div>• Perfect cubes: 1, 8, 27, 64, 125, 216, 343, 512</div>
                <div>• Think of dice: n^3 unit cubes make an n×n×n cube</div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
