import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, RotateCcw, Calculator } from 'lucide-react';

interface DistributivePropertyDemoProps {
  number1?: number;
  number2?: number;
  interactive?: boolean;
}

export const DistributivePropertyDemo: React.FC<
  DistributivePropertyDemoProps
> = ({ number1 = 23, number2 = 4, interactive = true }) => {
  const [currentNum1, setCurrentNum1] = useState(number1);
  const [currentNum2, setCurrentNum2] = useState(number2);
  const [currentStep, setCurrentStep] = useState(0);

  // Break down the first number into tens and ones
  const tens = Math.floor(currentNum1 / 10) * 10;
  const ones = currentNum1 % 10;
  const tensResult = tens * currentNum2;
  const onesResult = ones * currentNum2;
  const finalResult = tensResult + onesResult;

  const steps = [
    {
      title: 'Original Problem',
      content: `${currentNum1} × ${currentNum2}`,
      explanation: 'We want to multiply these two numbers',
    },
    {
      title: 'Break Apart the First Number',
      content: `${currentNum1} = ${tens} + ${ones}`,
      explanation: 'Split the larger number into tens and ones',
    },
    {
      title: 'Apply Distributive Property',
      content: `(${tens} + ${ones}) × ${currentNum2}`,
      explanation: 'Now we can distribute the multiplication',
    },
    {
      title: 'Multiply Each Part',
      content: `${tens} × ${currentNum2} + ${ones} × ${currentNum2}`,
      explanation: 'Multiply each part separately',
    },
    {
      title: 'Calculate Each Product',
      content: `${tensResult} + ${onesResult}`,
      explanation: `${tens} × ${currentNum2} = ${tensResult} and ${ones} × ${currentNum2} = ${onesResult}`,
    },
    {
      title: 'Add the Results',
      content: `${finalResult}`,
      explanation: `${tensResult} + ${onesResult} = ${finalResult}`,
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const reset = () => {
    setCurrentStep(0);
  };

  const renderVisualBreakdown = () => {
    if (currentStep < 1) return null;

    return (
      <div className='mt-6 p-4 bg-card rounded-lg border border-border'>
        <h4 className='font-semibold text-foreground mb-3'>Visual Breakdown</h4>

        {/* Number breakdown */}
        {currentStep >= 1 && (
          <div className='flex items-center justify-center gap-4 mb-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-primary'>
                {currentNum1}
              </div>
              <div className='text-sm text-primary font-medium'>Original</div>
            </div>
            <div className='text-2xl text-primary'>=</div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-accent'>{tens}</div>
              <div className='text-sm text-accent font-medium'>Tens</div>
            </div>
            <div className='text-2xl text-primary'>+</div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-secondary-foreground'>
                {ones}
              </div>
              <div className='text-sm text-secondary-foreground font-medium'>
                Ones
              </div>
            </div>
          </div>
        )}

        {/* Multiplication breakdown */}
        {currentStep >= 3 && (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
            <div className='p-3 bg-accent/20 rounded-lg border border-accent/30'>
              <div className='text-center'>
                <div className='text-lg font-bold text-foreground'>
                  {tens} × {currentNum2}
                </div>
                {currentStep >= 4 && (
                  <div className='text-2xl font-bold text-accent mt-2'>
                    = {tensResult}
                  </div>
                )}
              </div>
            </div>

            <div className='p-3 bg-secondary rounded-lg border border-border'>
              <div className='text-center'>
                <div className='text-lg font-bold text-foreground'>
                  {ones} × {currentNum2}
                </div>
                {currentStep >= 4 && (
                  <div className='text-2xl font-bold text-secondary-foreground mt-2'>
                    = {onesResult}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Final addition */}
        {currentStep >= 5 && (
          <div className='mt-4 p-3 bg-primary/20 rounded-lg border border-primary/30'>
            <div className='text-center'>
              <div className='text-lg font-bold text-foreground'>
                {tensResult} + {onesResult} = {finalResult}
              </div>
              <div className='text-sm text-primary font-medium mt-1'>
                Final Answer
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className='w-full max-w-4xl mx-auto'>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <Calculator className='w-5 h-5 text-primary' />
          <CardTitle className='text-lg'>Distributive Property</CardTitle>
        </div>
        <p className='text-sm text-muted-foreground'>
          Break apart numbers to make multiplication easier
        </p>
      </CardHeader>

      <CardContent>
        <div className='space-y-6'>
          {/* Input Controls */}
          {interactive && (
            <div className='flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-lg'>
              <div className='flex items-center gap-2'>
                <label className='text-sm font-medium'>First Number:</label>
                <input
                  type='number'
                  min='10'
                  max='99'
                  value={currentNum1}
                  onChange={e => {
                    setCurrentNum1(parseInt(e.target.value) || 10);
                    reset();
                  }}
                  className='w-16 px-3 py-2 bg-card border border-border rounded text-center text-card-foreground font-medium'
                />
              </div>

              <div className='flex items-center gap-2'>
                <label className='text-sm font-medium'>Second Number:</label>
                <input
                  type='number'
                  min='1'
                  max='9'
                  value={currentNum2}
                  onChange={e => {
                    setCurrentNum2(parseInt(e.target.value) || 1);
                    reset();
                  }}
                  className='w-16 px-3 py-2 bg-card border border-border rounded text-center text-card-foreground font-medium'
                />
              </div>
            </div>
          )}

          {/* Current Step Display */}
          <div className='text-center p-6 bg-primary/10 rounded-lg border border-primary/20'>
            <div className='text-sm font-medium text-muted-foreground mb-2'>
              Step {currentStep + 1} of {steps.length}:{' '}
              {steps[currentStep]?.title}
            </div>
            <div className='text-3xl font-bold text-primary mb-2'>
              {steps[currentStep]?.content}
            </div>
            <div className='text-sm text-muted-foreground'>
              {steps[currentStep]?.explanation}
            </div>
          </div>

          {/* Visual Breakdown */}
          {renderVisualBreakdown()}

          {/* Navigation Controls */}
          <div className='flex justify-center gap-3'>
            <Button
              variant='outline'
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              Previous
            </Button>

            <Button variant='outline' onClick={reset}>
              <RotateCcw className='w-4 h-4 mr-1' />
              Reset
            </Button>

            <Button
              onClick={nextStep}
              disabled={currentStep === steps.length - 1}
            >
              Next
              <ChevronRight className='w-4 h-4 ml-1' />
            </Button>
          </div>

          {/* Progress Indicator */}
          <div className='flex justify-center'>
            <div className='flex space-x-1'>
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep
                      ? 'bg-primary'
                      : index < currentStep
                        ? 'bg-accent'
                        : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Key Insight */}
          <div className='p-4 bg-secondary rounded-lg border border-border'>
            <h4 className='font-semibold text-foreground mb-2'>
              💡 Key Insight
            </h4>
            <p className='text-sm text-muted-foreground'>
              The distributive property lets us break big multiplication
              problems into smaller, easier pieces. Instead of {currentNum1} ×{' '}
              {currentNum2}, we can do {tens} × {currentNum2} + {ones} ×{' '}
              {currentNum2}, which uses easier multiplication facts!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
