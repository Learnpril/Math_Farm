import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, RotateCcw, Grid3X3 } from 'lucide-react';

interface MultiplicationGridProps {
  rows?: number;
  cols?: number;
  interactive?: boolean;
  showAnimation?: boolean;
}

export const MultiplicationGrid: React.FC<MultiplicationGridProps> = ({
  rows = 4,
  cols = 6,
  interactive = true,
  showAnimation = true,
}) => {
  const [currentRows, setCurrentRows] = useState(rows);
  const [currentCols, setCurrentCols] = useState(cols);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [showTotal, setShowTotal] = useState(false);

  const total = currentRows * currentCols;

  const startAnimation = () => {
    setIsAnimating(true);
    setAnimationStep(0);
    setShowTotal(false);

    const interval = setInterval(() => {
      setAnimationStep(prev => {
        if (prev >= currentRows * currentCols) {
          setIsAnimating(false);
          setShowTotal(true);
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 200);
  };

  const resetAnimation = () => {
    setIsAnimating(false);
    setAnimationStep(0);
    setShowTotal(false);
  };

  const renderGrid = () => {
    const cells = [];
    for (let row = 0; row < currentRows; row++) {
      for (let col = 0; col < currentCols; col++) {
        const cellIndex = row * currentCols + col;
        const isHighlighted = isAnimating && cellIndex < animationStep;
        const isVisible = !isAnimating || cellIndex < animationStep;

        cells.push(
          <div
            key={`${row}-${col}`}
            className={`w-8 h-8 border-2 border-primary/30 rounded-sm flex items-center justify-center text-xs font-semibold transition-all duration-200 ${
              isHighlighted
                ? 'bg-primary text-primary-foreground scale-110'
                : isVisible
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
            }`}
            style={{
              gridColumn: col + 1,
              gridRow: row + 1,
            }}
          >
            {isVisible ? cellIndex + 1 : ''}
          </div>
        );
      }
    }
    return cells;
  };

  return (
    <Card className='w-full max-w-4xl mx-auto'>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <Grid3X3 className='w-5 h-5 text-primary' />
          <CardTitle className='text-lg'>Multiplication Grid</CardTitle>
        </div>
        <p className='text-sm text-muted-foreground'>
          Visualize multiplication as arrays of objects arranged in rows and
          columns
        </p>
      </CardHeader>

      <CardContent>
        <div className='space-y-6'>
          {/* Controls */}
          {interactive && (
            <div className='flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-lg'>
              <div className='flex items-center gap-2'>
                <label className='text-sm font-medium'>Rows:</label>
                <input
                  type='range'
                  min='1'
                  max='8'
                  value={currentRows}
                  onChange={e => {
                    setCurrentRows(parseInt(e.target.value));
                    resetAnimation();
                  }}
                  className='w-20'
                />
                <span className='text-sm font-semibold w-6'>{currentRows}</span>
              </div>

              <div className='flex items-center gap-2'>
                <label className='text-sm font-medium'>Columns:</label>
                <input
                  type='range'
                  min='1'
                  max='8'
                  value={currentCols}
                  onChange={e => {
                    setCurrentCols(parseInt(e.target.value));
                    resetAnimation();
                  }}
                  className='w-20'
                />
                <span className='text-sm font-semibold w-6'>{currentCols}</span>
              </div>
            </div>
          )}

          {/* Equation Display */}
          <div className='text-center p-4 bg-primary/10 rounded-lg border border-primary/20'>
            <div className='text-2xl font-bold text-primary mb-2'>
              {currentRows} × {currentCols} = {showTotal ? total : '?'}
            </div>
            <div className='text-sm text-primary font-medium'>
              {currentRows} rows of {currentCols} objects each
            </div>
          </div>

          {/* Grid Visualization */}
          <div className='flex justify-center p-6'>
            <div
              className='grid gap-1 p-4 bg-card rounded-lg border-2 border-border'
              style={{
                gridTemplateColumns: `repeat(${currentCols}, 1fr)`,
                gridTemplateRows: `repeat(${currentRows}, 1fr)`,
              }}
            >
              {renderGrid()}
            </div>
          </div>

          {/* Animation Controls */}
          {showAnimation && (
            <div className='flex justify-center gap-3'>
              <Button
                onClick={startAnimation}
                disabled={isAnimating}
                className='flex items-center gap-2'
              >
                <Play className='w-4 h-4' />
                Count Objects
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
          )}

          {/* Explanation */}
          <div className='p-4 bg-accent/10 rounded-lg border border-accent/20'>
            <h4 className='font-semibold text-accent mb-2'>
              Understanding Arrays
            </h4>
            <div className='text-sm text-muted-foreground space-y-1'>
              <p>
                • Arrays help us visualize multiplication as organized groups
              </p>
              <p>• Each row has the same number of objects</p>
              <p>• Total objects = number of rows × objects per row</p>
              <p>
                • This is why {currentRows} × {currentCols} = {total}
              </p>
            </div>
          </div>

          {/* Real-world Connection */}
          <div className='p-4 bg-secondary rounded-lg border border-border'>
            <h4 className='font-semibold text-foreground mb-2'>
              Real-World Examples
            </h4>
            <div className='text-sm text-muted-foreground space-y-1'>
              <p>
                • Egg cartons: {currentRows} rows of {currentCols} eggs ={' '}
                {total} eggs
              </p>
              <p>
                • Garden plots: {currentRows} rows of {currentCols} plants ={' '}
                {total} plants
              </p>
              <p>
                • Classroom seating: {currentRows} rows of {currentCols} desks ={' '}
                {total} desks
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
