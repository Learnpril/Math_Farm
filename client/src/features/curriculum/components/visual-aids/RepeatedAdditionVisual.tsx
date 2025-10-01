import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, RotateCcw, Plus } from 'lucide-react';

interface RepeatedAdditionVisualProps {
  multiplier?: number;
  multiplicand?: number;
  interactive?: boolean;
}

export const RepeatedAdditionVisual: React.FC<RepeatedAdditionVisualProps> = ({
  multiplier = 4,
  multiplicand = 3,
  interactive = true,
}) => {
  const [currentMultiplier, setCurrentMultiplier] = useState(multiplier);
  const [currentMultiplicand, setCurrentMultiplicand] = useState(multiplicand);
  const [animationStep, setAnimationStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showTotal, setShowTotal] = useState(false);

  const total = currentMultiplier * currentMultiplicand;

  const startAnimation = () => {
    setIsAnimating(true);
    setAnimationStep(0);
    setShowTotal(false);

    const interval = setInterval(() => {
      setAnimationStep(prev => {
        if (prev >= currentMultiplier) {
          setIsAnimating(false);
          setShowTotal(true);
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 800);
  };

  const resetAnimation = () => {
    setIsAnimating(false);
    setAnimationStep(0);
    setShowTotal(false);
  };

  const renderGroups = () => {
    const groups = [];
    for (let i = 0; i < currentMultiplier; i++) {
      const isActive = animationStep > i;
      const dots = [];

      for (let j = 0; j < currentMultiplicand; j++) {
        dots.push(
          <div
            key={j}
            className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
              isActive
                ? 'bg-primary border-primary scale-110'
                : 'bg-muted border-border'
            }`}
          />
        );
      }

      groups.push(
        <div key={i} className='flex flex-col items-center space-y-2'>
          <div className='flex space-x-1'>{dots}</div>
          <div
            className={`text-sm font-medium transition-colors duration-300 ${
              isActive ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Group {i + 1}
          </div>
        </div>
      );
    }
    return groups;
  };

  const renderAdditionEquation = () => {
    const parts = [];
    for (let i = 0; i < currentMultiplier; i++) {
      const isActive = animationStep > i;
      parts.push(
        <span
          key={i}
          className={`text-2xl font-bold transition-colors duration-300 ${
            isActive ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          {currentMultiplicand}
        </span>
      );

      if (i < currentMultiplier - 1) {
        parts.push(
          <span
            key={`plus-${i}`}
            className={`text-2xl font-bold mx-2 transition-colors duration-300 ${
              animationStep > i ? 'text-accent' : 'text-muted-foreground'
            }`}
          >
            +
          </span>
        );
      }
    }

    if (showTotal) {
      parts.push(
        <span key='equals' className='text-2xl font-bold mx-2 text-primary'>
          =
        </span>
      );
      parts.push(
        <span key='total' className='text-3xl font-bold text-primary'>
          {total}
        </span>
      );
    }

    return parts;
  };

  const getCurrentSum = () => {
    return animationStep * currentMultiplicand;
  };

  return (
    <Card className='w-full max-w-4xl mx-auto'>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <Plus className='w-5 h-5 text-accent' />
          <CardTitle className='text-lg'>
            Multiplication as Repeated Addition
          </CardTitle>
        </div>
        <p className='text-sm text-muted-foreground'>
          See how multiplication is just adding the same number multiple times
        </p>
      </CardHeader>

      <CardContent>
        <div className='space-y-6'>
          {/* Controls */}
          {interactive && (
            <div className='flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-lg'>
              <div className='flex items-center gap-2'>
                <label className='text-sm font-medium'>How many groups:</label>
                <input
                  type='range'
                  min='2'
                  max='8'
                  value={currentMultiplier}
                  onChange={e => {
                    setCurrentMultiplier(parseInt(e.target.value));
                    resetAnimation();
                  }}
                  className='w-20'
                />
                <span className='text-sm font-semibold w-6'>
                  {currentMultiplier}
                </span>
              </div>

              <div className='flex items-center gap-2'>
                <label className='text-sm font-medium'>
                  Objects per group:
                </label>
                <input
                  type='range'
                  min='1'
                  max='6'
                  value={currentMultiplicand}
                  onChange={e => {
                    setCurrentMultiplicand(parseInt(e.target.value));
                    resetAnimation();
                  }}
                  className='w-20'
                />
                <span className='text-sm font-semibold w-6'>
                  {currentMultiplicand}
                </span>
              </div>
            </div>
          )}

          {/* Problem Statement */}
          <div className='text-center p-4 bg-primary/10 rounded-lg border border-primary/20'>
            <div className='text-2xl font-bold text-primary mb-2'>
              {currentMultiplier} × {currentMultiplicand} = ?
            </div>
            <div className='text-sm text-primary font-medium'>
              "{currentMultiplier} groups of {currentMultiplicand} objects each"
            </div>
          </div>

          {/* Visual Groups */}
          <div className='p-6 bg-card rounded-lg border-2 border-border'>
            <div className='flex flex-wrap justify-center gap-8'>
              {renderGroups()}
            </div>
          </div>

          {/* Addition Equation */}
          <div className='text-center p-4 bg-accent/10 rounded-lg border border-accent/20'>
            <div className='text-sm font-medium text-accent mb-2'>
              As Repeated Addition:
            </div>
            <div className='flex flex-wrap justify-center items-center'>
              {renderAdditionEquation()}
            </div>
            {animationStep > 0 && !showTotal && (
              <div className='text-sm text-accent font-medium mt-2'>
                So far: {getCurrentSum()}
              </div>
            )}
          </div>

          {/* Animation Controls */}
          <div className='flex justify-center gap-3'>
            <Button
              onClick={startAnimation}
              disabled={isAnimating}
              className='flex items-center gap-2'
            >
              <Play className='w-4 h-4' />
              Show Addition
            </Button>

            <Button
              variant='outline'
              onClick={resetAnimation}
              className='flex items-center gap-2'
            >
              <RotateCcw className='w-4 h-4' />
              Reset
            </Button>
          </div>

          {/* Running Total */}
          {(animationStep > 0 || showTotal) && (
            <div className='text-center p-4 bg-primary/10 rounded-lg border border-primary/20'>
              <div className='text-lg font-semibold text-primary'>
                Current Total: {showTotal ? total : getCurrentSum()}
              </div>
              {showTotal && (
                <div className='text-sm text-primary font-medium mt-1'>
                  ✓ Complete! {currentMultiplier} × {currentMultiplicand} ={' '}
                  {total}
                </div>
              )}
            </div>
          )}

          {/* Educational Notes */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='p-4 bg-secondary rounded-lg border border-border'>
              <h4 className='font-semibold text-foreground mb-2'>
                💡 Key Concept
              </h4>
              <p className='text-sm text-muted-foreground'>
                Multiplication is a shortcut for repeated addition. Instead of
                adding {currentMultiplicand} + {currentMultiplicand} + ...{' '}
                {currentMultiplier} times, we can just multiply{' '}
                {currentMultiplier} × {currentMultiplicand} = {total}.
              </p>
            </div>

            <div className='p-4 bg-secondary rounded-lg border border-border'>
              <h4 className='font-semibold text-foreground mb-2'>
                🔄 Both Ways Work
              </h4>
              <p className='text-sm text-muted-foreground'>
                {currentMultiplier} × {currentMultiplicand} = {total} and{' '}
                {currentMultiplicand} × {currentMultiplier} = {total}. This is
                called the commutative property - order doesn't matter!
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
