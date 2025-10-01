import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, ChevronLeft, RotateCcw, Calculator } from 'lucide-react';

interface TwoDigitMultiplicationDemoProps {
  number1?: number;
  number2?: number;
  interactive?: boolean;
}

export const TwoDigitMultiplicationDemo: React.FC<
  TwoDigitMultiplicationDemoProps
> = ({ number1 = 23, number2 = 45, interactive = true }) => {
  const [currentNum1, setCurrentNum1] = useState(number1);
  const [currentNum2, setCurrentNum2] = useState(number2);
  const [currentStep, setCurrentStep] = useState(0);

  // Calculate dynamic steps based on current numbers
  const calculateSteps = () => {
    const ones1 = currentNum1 % 10;
    const tens1 = Math.floor(currentNum1 / 10);
    const ones2 = currentNum2 % 10;
    const tens2 = Math.floor(currentNum2 / 10);

    // First partial product (ones digit multiplication)
    const firstProduct = currentNum1 * ones2;

    // Second partial product (tens digit multiplication, shifted)
    const secondProduct = currentNum1 * tens2 * 10;

    // Final answer
    const finalAnswer = currentNum1 * currentNum2;

    return [
      {
        title: `Multiply ${ones1} × ${ones2}`,
        content: `${ones1} × ${ones2} = ${ones1 * ones2}`,
        explanation:
          ones1 * ones2 >= 10
            ? `Write ${(ones1 * ones2) % 10} in ones place, carry the ${Math.floor((ones1 * ones2) / 10)}`
            : `Write ${ones1 * ones2} in ones place`,
        highlight: 'step1',
      },
      {
        title: `Complete First Partial Product`,
        content: `${ones2} × ${tens1} = ${ones2 * tens1}${ones1 * ones2 >= 10 ? `, plus ${Math.floor((ones1 * ones2) / 10)} = ${ones2 * tens1 + Math.floor((ones1 * ones2) / 10)}` : ''}`,
        explanation: `Complete first partial product: ${firstProduct}`,
        highlight: 'step2',
      },
      {
        title: 'Show Addition Format',
        content: `Display ${firstProduct} in addition format`,
        explanation: 'Show first partial product ready for addition',
        highlight: 'step3',
      },
      {
        title: 'Start New Row with Zero',
        content: 'Place 0 in ones column',
        explanation: 'New row for tens digit multiplication',
        highlight: 'step4',
      },
      {
        title: `Complete Second Partial Product`,
        content: `${tens2} × ${currentNum1} = ${secondProduct}`,
        explanation: `Complete second partial product: ${secondProduct}`,
        highlight: 'step5',
      },
      {
        title: 'Set Up Addition',
        content: `${firstProduct} + ${secondProduct}`,
        explanation: 'Set up addition of both partial products',
        highlight: 'step6',
      },
      {
        title: 'Final Answer',
        content: `${firstProduct} + ${secondProduct} = ${finalAnswer}`,
        explanation: 'Add both partial products to get final answer',
        highlight: 'step7',
      },
    ];
  };

  const steps = calculateSteps();

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

  const renderMultiplication = () => {
    const ones1 = currentNum1 % 10;
    const tens1 = Math.floor(currentNum1 / 10);
    const ones2 = currentNum2 % 10;
    const tens2 = Math.floor(currentNum2 / 10);

    const firstProduct = currentNum1 * ones2;
    const secondProduct = currentNum1 * tens2 * 10;
    const finalAnswer = currentNum1 * currentNum2;

    // Calculate carries
    const firstCarry = Math.floor((ones1 * ones2) / 10);
    const secondCarry = Math.floor((tens2 * ones1) / 10);

    return (
      <div className='bg-card p-8 rounded-lg border-2 border-border font-mono'>
        <div className='text-center space-y-3'>
          {/* Carry indicators */}
          <div className='text-right text-sm space-y-1'>
            {/* First carry (step 1) */}
            {currentStep >= 1 && firstCarry > 0 && (
              <div className='text-destructive font-bold'>
                <span className='mr-12'>{firstCarry}</span>
              </div>
            )}
            {/* Second carry (step 4) */}
            {currentStep >= 4 && secondCarry > 0 && (
              <div className='text-destructive font-bold'>
                <span className='mr-16'>{secondCarry}</span>
              </div>
            )}
          </div>

          {/* Original problem */}
          <div className='text-right space-y-1'>
            <div className='text-3xl font-bold text-foreground'>
              <span
                className={currentStep >= 2 ? 'bg-primary/20 px-1 rounded' : ''}
              >
                {tens1}
              </span>
              <span
                className={currentStep >= 1 ? 'bg-accent/20 px-1 rounded' : ''}
              >
                {ones1}
              </span>
            </div>
            <div className='text-3xl font-bold text-foreground'>
              ×{' '}
              <span
                className={currentStep >= 4 ? 'bg-secondary px-1 rounded' : ''}
              >
                {tens2}
              </span>
              <span
                className={
                  currentStep >= 1
                    ? 'bg-primary text-primary-foreground px-1 rounded'
                    : ''
                }
              >
                {ones2}
              </span>
            </div>
            <div className='border-b-2 border-foreground w-20 ml-auto'></div>
          </div>

          {/* Step-by-Step Visual Display - 7 Steps */}
          {currentStep === 1 && (
            <div className='text-right'>
              <div className='text-2xl font-bold text-foreground'>
                {(ones1 * ones2) % 10}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className='text-right'>
              <div className='text-2xl font-bold text-foreground'>
                {firstProduct}
              </div>
            </div>
          )}

          {/* Addition Format - Starting from Step 3 */}
          {currentStep >= 3 && (
            <div className='text-right space-y-2 mt-4'>
              <div className='text-2xl font-bold text-foreground'>
                {firstProduct}
              </div>
              <div className='text-2xl font-bold text-foreground'>
                +{' '}
                {currentStep === 4
                  ? '0'
                  : currentStep >= 5
                    ? secondProduct
                    : ''}
              </div>
              <div className='border-b-2 border-foreground w-20 ml-auto'></div>
              {currentStep >= 6 && (
                <div className='text-2xl font-bold text-primary-foreground bg-primary px-3 py-2 rounded-lg border-2 border-primary/30'>
                  {finalAnswer}
                </div>
              )}
            </div>
          )}

          {/* Step-specific explanations */}
          {currentStep >= 1 && currentStep <= 7 && (
            <div className='text-right mt-2'>
              {currentStep === 1 && (
                <div className='text-sm text-muted-foreground'>
                  ← {ones1} × {ones2} = {ones1 * ones2}{' '}
                  {firstCarry > 0
                    ? `(write ${(ones1 * ones2) % 10}, carry ${firstCarry})`
                    : ''}
                </div>
              )}
              {currentStep === 2 && (
                <div className='text-sm text-muted-foreground'>
                  ← {ones2} × {tens1} {firstCarry > 0 ? `+ ${firstCarry}` : ''}{' '}
                  = {firstProduct}
                </div>
              )}
              {currentStep === 3 && (
                <div className='text-sm text-muted-foreground'>
                  ← Show {firstProduct} in addition format
                </div>
              )}
              {currentStep === 4 && (
                <div className='text-sm text-muted-foreground'>
                  ← Start new row with 0 for tens multiplication
                </div>
              )}
              {currentStep === 5 && (
                <div className='text-sm text-muted-foreground'>
                  ← Complete second partial product: {secondProduct}
                </div>
              )}
              {currentStep === 6 && (
                <div className='text-sm text-muted-foreground'>
                  ← Set up addition: {firstProduct} + {secondProduct}
                </div>
              )}
              {currentStep === 7 && (
                <div className='text-sm text-muted-foreground'>
                  ← Final answer: {finalAnswer}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStepExplanation = () => {
    const ones1 = currentNum1 % 10;
    const tens1 = Math.floor(currentNum1 / 10);
    const ones2 = currentNum2 % 10;
    const tens2 = Math.floor(currentNum2 / 10);

    const firstProduct = currentNum1 * ones2;
    const secondProduct = currentNum1 * tens2 * 10;
    const finalAnswer = currentNum1 * currentNum2;

    const explanations = [
      {
        title: `Step 1: ${ones1} × ${ones2} = ${ones1 * ones2}`,
        content: `Multiply the ones digits: ${ones1} × ${ones2} = ${ones1 * ones2}. ${ones1 * ones2 >= 10 ? `Write down ${(ones1 * ones2) % 10} in the ones place and carry the ${Math.floor((ones1 * ones2) / 10)} to the tens column.` : `Write down ${ones1 * ones2} in the ones place.`}`,
        calculation: `${ones1} × ${ones2} = ${ones1 * ones2}${ones1 * ones2 >= 10 ? ` → Write ${(ones1 * ones2) % 10}, carry ${Math.floor((ones1 * ones2) / 10)}` : ''}`,
      },
      {
        title: `Step 2: ${ones2} × ${tens1}${Math.floor((ones1 * ones2) / 10) > 0 ? ` + ${Math.floor((ones1 * ones2) / 10)}` : ''} = ${firstProduct}`,
        content: `Multiply ${ones2} × ${tens1} = ${ones2 * tens1}${Math.floor((ones1 * ones2) / 10) > 0 ? `, then add the carried ${Math.floor((ones1 * ones2) / 10)} to get ${ones2 * tens1 + Math.floor((ones1 * ones2) / 10)}` : ''}. Complete the first partial product: ${firstProduct}.`,
        calculation: `${ones2} × ${tens1} = ${ones2 * tens1}${Math.floor((ones1 * ones2) / 10) > 0 ? `, plus carried ${Math.floor((ones1 * ones2) / 10)} = ${firstProduct}` : ''}`,
      },
      {
        title: 'Step 3: New row with 0',
        content: `Start a new row for multiplying by the tens digit (${tens2}). Place a 0 in the ones column because we're working with tens.`,
        calculation: 'Place 0 in ones column for tens multiplication',
      },
      {
        title: `Step 4: ${tens2} × ${ones1} = ${tens2 * ones1}`,
        content: `Multiply ${tens2} × ${ones1} = ${tens2 * ones1}. ${tens2 * ones1 >= 10 ? `Write down ${(tens2 * ones1) % 10} in the tens place and carry the ${Math.floor((tens2 * ones1) / 10)} to the hundreds column.` : `Write down ${tens2 * ones1} in the tens place.`}`,
        calculation: `${tens2} × ${ones1} = ${tens2 * ones1}${tens2 * ones1 >= 10 ? ` → Write ${(tens2 * ones1) % 10}, carry ${Math.floor((tens2 * ones1) / 10)}` : ''}`,
      },
      {
        title: `Step 5: ${tens2} × ${tens1}${Math.floor((tens2 * ones1) / 10) > 0 ? ` + ${Math.floor((tens2 * ones1) / 10)}` : ''} = ${secondProduct}`,
        content: `Multiply ${tens2} × ${tens1} = ${tens2 * tens1}${Math.floor((tens2 * ones1) / 10) > 0 ? `, then add the carried ${Math.floor((tens2 * ones1) / 10)} to get ${tens2 * tens1 + Math.floor((tens2 * ones1) / 10)}` : ''}. Complete the second partial product: ${secondProduct}.`,
        calculation: `${tens2} × ${tens1} = ${tens2 * tens1}${Math.floor((tens2 * ones1) / 10) > 0 ? `, plus carried ${Math.floor((tens2 * ones1) / 10)} = ${secondProduct}` : ''}`,
      },
      {
        title: `Step 6: Add ${firstProduct} + ${secondProduct} = ${finalAnswer}`,
        content: `Add the two partial products together: ${firstProduct} + ${secondProduct} = ${finalAnswer}. This is our final answer.`,
        calculation: `${firstProduct} + ${secondProduct} = ${finalAnswer}`,
      },
    ];

    if (currentStep < explanations.length) {
      const current = explanations[currentStep];
      return (
        <div className='mt-6 p-6 bg-primary/10 rounded-lg border border-primary/20'>
          <h4 className='font-semibold text-primary mb-3'>{current.title}</h4>
          <p className='text-foreground font-medium mb-2'>{current.content}</p>
          <div className='text-sm text-muted-foreground bg-secondary p-2 rounded'>
            <strong>Calculation:</strong> {current.calculation}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className='w-full max-w-4xl mx-auto'>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <Calculator className='w-5 h-5 text-primary' />
          <CardTitle className='text-lg'>
            Classic Long Multiplication with Carries
          </CardTitle>
        </div>
        <p className='text-sm text-muted-foreground'>
          Step-by-step multiplication showing exactly how to handle carries
        </p>
      </CardHeader>

      <CardContent>
        <div className='space-y-6'>
          {/* Input Controls */}
          {interactive && (
            <div className='flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-lg'>
              <div className='flex items-center gap-2'>
                <label className='text-sm font-medium text-foreground'>
                  First Number:
                </label>
                <input
                  type='number'
                  min='10'
                  max='99'
                  value={currentNum1}
                  onChange={e => {
                    setCurrentNum1(parseInt(e.target.value) || 23);
                    reset();
                  }}
                  className='w-16 px-3 py-2 bg-card border border-border rounded text-center text-card-foreground font-medium'
                />
              </div>

              <div className='flex items-center gap-2'>
                <label className='text-sm font-medium text-foreground'>
                  Second Number:
                </label>
                <input
                  type='number'
                  min='10'
                  max='99'
                  value={currentNum2}
                  onChange={e => {
                    setCurrentNum2(parseInt(e.target.value) || 45);
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
            <div className='text-sm text-muted-foreground font-medium'>
              {steps[currentStep]?.explanation}
            </div>
          </div>

          {/* Multiplication Visualization */}
          <div className='flex justify-center'>{renderMultiplication()}</div>

          {/* Step-by-step explanation */}
          {renderStepExplanation()}

          {/* Navigation Controls */}
          <div className='flex justify-center gap-3'>
            <Button
              variant='outline'
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ChevronLeft className='w-4 h-4 mr-1' />
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

          {/* Educational Notes */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='p-4 bg-secondary rounded-lg border border-border'>
              <h4 className='font-semibold text-foreground mb-2'>
                📚 The Carry Method
              </h4>
              <p className='text-sm text-muted-foreground'>
                This shows the traditional method with carries written above the
                problem. Each step builds the partial products that we add
                together at the end.
              </p>
            </div>

            <div className='p-4 bg-accent/10 rounded-lg border border-accent/20'>
              <h4 className='font-semibold text-accent mb-2'>🎯 Key Points</h4>
              <p className='text-sm text-muted-foreground'>
                Always start with the ones digit, show your carries clearly, and
                remember to place the zero when starting the second row.
              </p>
            </div>
          </div>

          {/* Final Summary */}
          <div className='p-4 bg-primary/10 rounded-lg border border-primary/20'>
            <h4 className='font-semibold text-primary mb-2'>
              🌟 Complete Process
            </h4>
            <p className='text-sm text-muted-foreground'>
              23 × 45: First row (×5) gives 115, second row (×40) gives 920, and
              115 + 920 = 1035. The zero placement shows we're multiplying by
              tens!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
