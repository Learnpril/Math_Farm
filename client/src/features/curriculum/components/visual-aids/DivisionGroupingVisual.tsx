import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, RotateCcw, Minus } from 'lucide-react';

interface DivisionGroupingVisualProps {
  dividend?: number;
  divisor?: number;
  interactive?: boolean;
}

export const DivisionGroupingVisual: React.FC<DivisionGroupingVisualProps> = ({
  dividend = 12,
  divisor = 3,
  interactive = true,
}) => {
  const [currentDividend, setCurrentDividend] = useState(dividend);
  const [currentDivisor, setCurrentDivisor] = useState(divisor);
  const [animationStep, setAnimationStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const quotient = Math.floor(currentDividend / currentDivisor);
  const remainder = currentDividend % currentDivisor;

  const startAnimation = () => {
    setIsAnimating(true);
    setAnimationStep(0);
    setShowResult(false);

    const interval = setInterval(() => {
      setAnimationStep(prev => {
        if (prev >= quotient) {
          setIsAnimating(false);
          setShowResult(true);
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
    setShowResult(false);
  };

  const renderObjects = () => {
    const objects = [];
    for (let i = 0; i < currentDividend; i++) {
      objects.push(
        <div
          key={i}
          className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
            i < animationStep * currentDivisor
              ? 'bg-primary border-primary'
              : 'bg-muted border-border'
          }`}
        />
      );
    }
    return objects;
  };

  const renderGroups = () => {
    const groups = [];

    // Complete groups
    for (let group = 0; group < quotient; group++) {
      const isActive = animationStep > group;
      const groupObjects = [];

      for (let i = 0; i < currentDivisor; i++) {
        groupObjects.push(
          <div
            key={i}
            className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
              isActive ? 'bg-primary border-primary' : 'bg-muted border-border'
            }`}
          />
        );
      }

      groups.push(
        <div key={group} className='flex flex-col items-center space-y-2'>
          <div
            className={`p-3 rounded-lg border-2 transition-all duration-300 ${
              isActive
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card'
            }`}
          >
            <div className='flex flex-wrap gap-1 justify-center max-w-24'>
              {groupObjects}
            </div>
          </div>
          <div
            className={`text-sm font-medium transition-colors duration-300 ${
              isActive ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Group {group + 1}
          </div>
        </div>
      );
    }

    // Remainder group if exists
    if (remainder > 0 && showResult) {
      const remainderObjects = [];
      for (let i = 0; i < remainder; i++) {
        remainderObjects.push(
          <div
            key={i}
            className='w-6 h-6 rounded-full border-2 bg-accent border-accent'
          />
        );
      }

      groups.push(
        <div key='remainder' className='flex flex-col items-center space-y-2'>
          <div className='p-3 rounded-lg border-2 border-accent bg-accent/10'>
            <div className='flex flex-wrap gap-1 justify-center max-w-24'>
              {remainderObjects}
            </div>
          </div>
          <div className='text-sm font-medium text-accent'>Remainder</div>
        </div>
      );
    }

    return groups;
  };

  return (
    <Card className='w-full max-w-4xl mx-auto'>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <Minus className='w-5 h-5 text-primary' />
          <CardTitle className='text-lg'>Division as Equal Groups</CardTitle>
        </div>
        <p className='text-sm text-muted-foreground'>
          See how division splits objects into equal groups
        </p>
      </CardHeader>

      <CardContent>
        <div className='space-y-6'>
          {/* Controls */}
          {interactive && (
            <div className='flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-lg'>
              <div className='flex items-center gap-2'>
                <label className='text-sm font-medium'>Total objects:</label>
                <input
                  type='range'
                  min='4'
                  max='24'
                  value={currentDividend}
                  onChange={e => {
                    setCurrentDividend(parseInt(e.target.value));
                    resetAnimation();
                  }}
                  className='w-20'
                />
                <span className='text-sm font-semibold w-6'>
                  {currentDividend}
                </span>
              </div>

              <div className='flex items-center gap-2'>
                <label className='text-sm font-medium'>
                  Objects per group:
                </label>
                <input
                  type='range'
                  min='2'
                  max='8'
                  value={currentDivisor}
                  onChange={e => {
                    setCurrentDivisor(parseInt(e.target.value));
                    resetAnimation();
                  }}
                  className='w-20'
                />
                <span className='text-sm font-semibold w-6'>
                  {currentDivisor}
                </span>
              </div>
            </div>
          )}

          {/* Problem Statement */}
          <div className='text-center p-4 bg-primary/10 rounded-lg border border-primary/20'>
            <div className='text-2xl font-bold text-primary mb-2'>
              {currentDividend} ÷ {currentDivisor} = ?
            </div>
            <div className='text-sm text-primary font-medium'>
              "Split {currentDividend} objects into groups of {currentDivisor}"
            </div>
          </div>

          {/* Visual Groups */}
          <div className='p-6 bg-card rounded-lg border-2 border-border'>
            <div className='flex flex-wrap justify-center gap-6'>
              {renderGroups()}
            </div>
          </div>

          {/* Animation Controls */}
          <div className='flex justify-center gap-3'>
            <Button
              onClick={startAnimation}
              disabled={isAnimating}
              className='flex items-center gap-2'
            >
              <Play className='w-4 h-4' />
              Show Grouping
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

          {/* Result Display */}
          {showResult && (
            <div className='text-center p-4 bg-primary/10 rounded-lg border border-primary/20'>
              <div className='text-lg font-semibold text-primary mb-2'>
                Result: {quotient} {remainder > 0 && `R${remainder}`}
              </div>
              <div className='text-sm text-muted-foreground'>
                {quotient} complete groups of {currentDivisor}
                {remainder > 0 && ` with ${remainder} objects remaining`}
              </div>
            </div>
          )}

          {/* Educational Notes */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='p-4 bg-secondary rounded-lg border border-border'>
              <h4 className='font-semibold text-foreground mb-2'>
                💡 Division Concept
              </h4>
              <p className='text-sm text-muted-foreground'>
                Division asks: "How many equal groups can we make?"
                {currentDividend} ÷ {currentDivisor} means splitting{' '}
                {currentDividend} objects into groups of {currentDivisor} each.
              </p>
            </div>

            <div className='p-4 bg-accent/10 rounded-lg border border-accent/20'>
              <h4 className='font-semibold text-accent mb-2'>
                🔄 Inverse Operation
              </h4>
              <p className='text-sm text-muted-foreground'>
                Division is the opposite of multiplication:
                {quotient} × {currentDivisor} = {quotient * currentDivisor}
                {remainder > 0 && ` + ${remainder}`} = {currentDividend}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
