import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, RotateCcw, AlertCircle } from 'lucide-react';

interface DivisionRemainderVisualProps {
  dividend?: number;
  divisor?: number;
  interactive?: boolean;
}

export const DivisionRemainderVisual: React.FC<
  DivisionRemainderVisualProps
> = ({ dividend = 17, divisor = 5, interactive = true }) => {
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
        if (prev >= quotient + 1) {
          setIsAnimating(false);
          setShowResult(true);
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const resetAnimation = () => {
    setIsAnimating(false);
    setAnimationStep(0);
    setShowResult(false);
  };

  const renderDivisionProcess = () => {
    const steps = [];

    // Step 1: Show all objects
    if (animationStep >= 1) {
      steps.push(
        <div
          key='step1'
          className='text-center p-4 bg-card rounded-lg border border-border'
        >
          <h4 className='font-semibold text-foreground mb-3'>
            Step 1: Start with {currentDividend} objects
          </h4>
          <div className='flex flex-wrap justify-center gap-1 max-w-md mx-auto'>
            {Array.from({ length: currentDividend }, (_, i) => (
              <div
                key={i}
                className='w-6 h-6 rounded-full bg-muted border-2 border-border'
              />
            ))}
          </div>
        </div>
      );
    }

    // Step 2: Show complete groups
    if (animationStep >= 2) {
      const completeGroups = [];
      for (let group = 0; group < quotient; group++) {
        const groupObjects = [];
        for (let i = 0; i < currentDivisor; i++) {
          groupObjects.push(
            <div
              key={i}
              className='w-6 h-6 rounded-full bg-primary border-2 border-primary'
            />
          );
        }

        completeGroups.push(
          <div key={group} className='flex flex-col items-center space-y-2'>
            <div className='p-3 rounded-lg border-2 border-primary bg-primary/10'>
              <div className='flex flex-wrap gap-1 justify-center'>
                {groupObjects}
              </div>
            </div>
            <div className='text-sm font-medium text-primary'>
              Group {group + 1}
            </div>
          </div>
        );
      }

      steps.push(
        <div
          key='step2'
          className='text-center p-4 bg-card rounded-lg border border-border'
        >
          <h4 className='font-semibold text-foreground mb-3'>
            Step 2: Make {quotient} complete groups of {currentDivisor}
          </h4>
          <div className='flex flex-wrap justify-center gap-4'>
            {completeGroups}
          </div>
          <div className='mt-3 text-sm text-muted-foreground'>
            Used: {quotient} × {currentDivisor} = {quotient * currentDivisor}{' '}
            objects
          </div>
        </div>
      );
    }

    // Step 3: Show remainder
    if (animationStep >= 3 && remainder > 0) {
      const remainderObjects = [];
      for (let i = 0; i < remainder; i++) {
        remainderObjects.push(
          <div
            key={i}
            className='w-6 h-6 rounded-full bg-accent border-2 border-accent'
          />
        );
      }

      steps.push(
        <div
          key='step3'
          className='text-center p-4 bg-accent/10 rounded-lg border border-accent/20'
        >
          <h4 className='font-semibold text-accent mb-3 flex items-center justify-center gap-2'>
            <AlertCircle className='w-4 h-4' />
            Step 3: {remainder} objects left over (Remainder)
          </h4>
          <div className='flex justify-center gap-1'>{remainderObjects}</div>
          <div className='mt-3 text-sm text-muted-foreground'>
            These {remainder} objects cannot form another complete group of{' '}
            {currentDivisor}
          </div>
        </div>
      );
    }

    return steps;
  };

  const renderEquation = () => {
    if (!showResult) return null;

    return (
      <div className='text-center p-6 bg-primary/10 rounded-lg border border-primary/20'>
        <div className='text-3xl font-bold text-primary mb-4'>
          {currentDividend} ÷ {currentDivisor} = {quotient}{' '}
          {remainder > 0 && `R${remainder}`}
        </div>
        <div className='text-lg text-muted-foreground mb-2'>
          Check: {quotient} × {currentDivisor}{' '}
          {remainder > 0 && `+ ${remainder}`} = {currentDividend}
        </div>
        {remainder > 0 && (
          <div className='text-sm text-accent font-medium'>
            Remainder {remainder} is less than divisor {currentDivisor} ✓
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className='w-full max-w-4xl mx-auto'>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <AlertCircle className='w-5 h-5 text-accent' />
          <CardTitle className='text-lg'>Division with Remainders</CardTitle>
        </div>
        <p className='text-sm text-muted-foreground'>
          Understand what happens when numbers don't divide evenly
        </p>
      </CardHeader>

      <CardContent>
        <div className='space-y-6'>
          {/* Controls */}
          {interactive && (
            <div className='flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-lg'>
              <div className='flex items-center gap-2'>
                <label className='text-sm font-medium'>Dividend:</label>
                <input
                  type='number'
                  min='5'
                  max='30'
                  value={currentDividend}
                  onChange={e => {
                    setCurrentDividend(parseInt(e.target.value) || 5);
                    resetAnimation();
                  }}
                  className='w-16 px-3 py-2 bg-card border border-border rounded text-center text-card-foreground font-medium'
                />
              </div>

              <div className='flex items-center gap-2'>
                <label className='text-sm font-medium'>Divisor:</label>
                <input
                  type='number'
                  min='2'
                  max='8'
                  value={currentDivisor}
                  onChange={e => {
                    setCurrentDivisor(parseInt(e.target.value) || 2);
                    resetAnimation();
                  }}
                  className='w-16 px-3 py-2 bg-card border border-border rounded text-center text-card-foreground font-medium'
                />
              </div>
            </div>
          )}

          {/* Problem Statement */}
          <div className='text-center p-4 bg-primary/10 rounded-lg border border-primary/20'>
            <div className='text-2xl font-bold text-primary mb-2'>
              {currentDividend} ÷ {currentDivisor} = ?
            </div>
            <div className='text-sm text-primary font-medium'>
              "How many groups of {currentDivisor} can we make from{' '}
              {currentDividend} objects?"
            </div>
          </div>

          {/* Animation Steps */}
          <div className='space-y-4'>{renderDivisionProcess()}</div>

          {/* Final Equation */}
          {renderEquation()}

          {/* Animation Controls */}
          <div className='flex justify-center gap-3'>
            <Button
              onClick={startAnimation}
              disabled={isAnimating}
              className='flex items-center gap-2'
            >
              <Play className='w-4 h-4' />
              Show Division
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

          {/* Educational Notes */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='p-4 bg-secondary rounded-lg border border-border'>
              <h4 className='font-semibold text-foreground mb-2'>
                📏 Remainder Rules
              </h4>
              <p className='text-sm text-muted-foreground'>
                The remainder must always be smaller than the divisor. If
                remainder ≥ divisor, we can make another complete group!
              </p>
            </div>

            <div className='p-4 bg-accent/10 rounded-lg border border-accent/20'>
              <h4 className='font-semibold text-accent mb-2'>🌍 Real World</h4>
              <p className='text-sm text-muted-foreground'>
                Remainders appear everywhere: leftover pizza slices, extra
                minutes, change from purchases. Context determines how we
                interpret them.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
