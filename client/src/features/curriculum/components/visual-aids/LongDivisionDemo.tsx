import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, ChevronLeft, RotateCcw, Calculator } from 'lucide-react';
import { MathExpression } from '../MathExpression';

interface LongDivisionDemoProps {
  dividend?: number;
  divisor?: number;
  interactive?: boolean;
}

interface DivisionStep {
  title: string;
  workingNumber: number;
  quotientDigit: number;
  subtractAmount: number;
  remainder: number;
  quotientSoFar: string;
  position: number;
  explanation: string;
  isSetup?: boolean;
  stepType:
    | 'setup'
    | 'divide'
    | 'multiply'
    | 'subtract'
    | 'bringdown'
    | 'check';
}

export const LongDivisionDemo: React.FC<LongDivisionDemoProps> = ({
  dividend = 456,
  divisor = 4,
  interactive = true,
}) => {
  const [currentDividend, setCurrentDividend] = useState(dividend);
  const [currentDivisor, setCurrentDivisor] = useState(divisor);
  const [currentStep, setCurrentStep] = useState(0);

  const calculateSteps = () => {
    const dividendStr = currentDividend.toString();
    const steps = [];

    // Step 0: Setup the problem
    steps.push({
      title: `Set up the problem`,
      workingNumber: 0,
      quotientDigit: 0,
      subtractAmount: 0,
      remainder: 0,
      quotientSoFar: '',
      position: -1,
      explanation: `Write ${currentDividend} ÷ ${currentDivisor} in long division format`,
      isSetup: true,
      stepType: 'setup',
    });

    let workingNumber = 0;
    let quotientSoFar = '';
    let position = 0;
    let stepCount = 1;

    while (position < dividendStr.length) {
      // Bring down next digit
      const digitChar = dividendStr[position];
      if (!digitChar) break;

      const digit = parseInt(digitChar);
      workingNumber = workingNumber * 10 + digit;

      // Calculate how many times divisor goes into working number
      const quotientDigit = Math.floor(workingNumber / currentDivisor);
      const subtractAmount = quotientDigit * currentDivisor;
      const remainder = workingNumber - subtractAmount;

      // Add Divide step
      steps.push({
        title: `Divide`,
        workingNumber,
        quotientDigit,
        subtractAmount,
        remainder,
        quotientSoFar: quotientSoFar + quotientDigit.toString(),
        position,
        explanation: `Dividing ${workingNumber} by ${currentDivisor}, we get ${quotientDigit}${remainder > 0 ? ' with some extra' : ' exactly'}.`,
        isSetup: false,
        stepType: 'divide',
      });

      // Add Multiply step
      steps.push({
        title: `Multiply`,
        workingNumber,
        quotientDigit,
        subtractAmount,
        remainder,
        quotientSoFar: quotientSoFar + quotientDigit.toString(),
        position,
        explanation: `${quotientDigit} × ${currentDivisor} = ${subtractAmount}`,
        isSetup: false,
        stepType: 'multiply',
      });

      // Add Subtract step
      steps.push({
        title: `Subtract`,
        workingNumber,
        quotientDigit,
        subtractAmount,
        remainder,
        quotientSoFar: quotientSoFar + quotientDigit.toString(),
        position,
        explanation: `Subtracting ${subtractAmount} from ${workingNumber}`,
        isSetup: false,
        stepType: 'subtract',
      });

      quotientSoFar += quotientDigit.toString();

      // Add Bring down step (if not the last digit)
      if (position < dividendStr.length - 1) {
        steps.push({
          title: `Bring down`,
          workingNumber: remainder,
          quotientDigit,
          subtractAmount,
          remainder,
          quotientSoFar,
          position,
          explanation: `Bring down the next digit`,
          isSetup: false,
          stepType: 'bringdown',
        });
      }

      workingNumber = remainder;
      position++;
      stepCount++;
    }

    // Add final check step
    const finalQuotient = Math.floor(currentDividend / currentDivisor);
    const finalRemainder = currentDividend % currentDivisor;

    steps.push({
      title: `Check`,
      workingNumber: 0,
      quotientDigit: 0,
      subtractAmount: 0,
      remainder: finalRemainder,
      quotientSoFar: finalQuotient.toString(),
      position: dividendStr.length,
      explanation: `Check your answer: Dividend = Divisor × Quotient + Remainder`,
      isSetup: false,
      stepType: 'check',
    });

    return steps;
  };

  const steps = calculateSteps();
  const finalQuotient = Math.floor(currentDividend / currentDivisor);
  const finalRemainder = currentDividend % currentDivisor;

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

  const renderLongDivision = () => {
    const currentStepData = steps[currentStep];
    const dividendStr = currentDividend.toString();

    return (
      <div className='bg-card p-8 rounded-lg border-2 border-border'>
        <div className='space-y-6'>
          {/* Long Division using LaTeX array for better compatibility */}
          <div className='flex justify-center'>
            <MathExpression className='text-2xl'>
              {(() => {
                // For setup step, show empty quotient line
                if (currentStepData?.isSetup) {
                  return `\\begin{array}{r}
                    \\phantom{${currentDividend.toString().split('').join('\\phantom{0}')}} \\\\[-2pt]
                    ${currentDivisor} \\enclose{longdiv}{${currentDividend}} \\\\
                  \\end{array}`;
                }

                // For working steps, show the quotient and work with proper alignment
                const quotient = currentStepData?.quotientSoFar || '';
                const showRemainder =
                  currentStep === steps.length - 1 && finalRemainder > 0;
                const quotientDisplay =
                  quotient +
                  (showRemainder ? `\\text{ R}${finalRemainder}` : '');
                const dividendStr = currentDividend.toString();

                // Build work lines progressively
                const workLines = [];

                // Go through all steps up to current step and build the work
                for (let stepIndex = 0; stepIndex <= currentStep; stepIndex++) {
                  const step = steps[stepIndex];
                  if (!step || step.isSetup) continue;

                  // Show subtraction work only after subtract step is complete
                  if (step.stepType === 'subtract') {
                    const position = step.position;
                    const digitsBefore = position;
                    const digitsAfter = dividendStr.length - position - 1;

                    // Create phantom spacing for alignment
                    const beforePhantom =
                      digitsBefore > 0
                        ? `\\phantom{${'0'.repeat(digitsBefore)}}`
                        : '';
                    const afterPhantom =
                      digitsAfter > 0
                        ? `\\phantom{${'0'.repeat(digitsAfter)}}`
                        : '';

                    // Add the subtraction line (underlined)
                    workLines.push(
                      `\\underline{${beforePhantom}${step.subtractAmount}${afterPhantom}}`
                    );

                    // Add the remainder
                    workLines.push(
                      `${beforePhantom}${step.remainder}${afterPhantom}`
                    );
                  }

                  // Show bring-down step: combine remainder with next digit
                  if (step.stepType === 'bringdown') {
                    const position = step.position;
                    const nextDigit = dividendStr[position + 1];
                    const digitsBefore = position;
                    const digitsAfter = dividendStr.length - position - 2; // -2 because we're showing remainder + next digit

                    // Create phantom spacing for alignment
                    const beforePhantom =
                      digitsBefore > 0
                        ? `\\phantom{${'0'.repeat(digitsBefore)}}`
                        : '';
                    const afterPhantom =
                      digitsAfter > 0
                        ? `\\phantom{${'0'.repeat(digitsAfter)}}`
                        : '';

                    // Show the remainder with the brought-down digit
                    const combinedNumber =
                      step.remainder.toString() + nextDigit;
                    workLines.push(
                      `${beforePhantom}${combinedNumber}${afterPhantom}`
                    );
                  }
                }

                const workSection =
                  workLines.length > 0 ? workLines.join(' \\\\[-2pt] ') : '';

                return `\\begin{array}{r}
                  \\underline{${quotientDisplay}} \\\\[-2pt]
                  ${currentDivisor} \\enclose{longdiv}{${currentDividend}} \\\\
                  ${workSection}
                \\end{array}`;
              })()}
            </MathExpression>
          </div>

          {/* Step-by-step work display */}
          <div className='flex justify-center'>
            <div className='relative'>
              {/* Show the step-by-step work with colors */}
              {currentStepData && !currentStepData.isSetup && (
                <div className='space-y-4 text-center'>
                  <div className='text-lg text-muted-foreground'>
                    <strong>Step {currentStep + 1}:</strong> Working with{' '}
                    {currentStepData.workingNumber}
                  </div>

                  {/* Show the multiplication step */}
                  <div className='p-3 bg-primary/10 rounded-lg border border-primary/20'>
                    <div className='text-lg text-primary font-semibold'>
                      {currentStepData.quotientDigit} × {currentDivisor} ={' '}
                      {currentStepData.subtractAmount}
                    </div>
                  </div>

                  {/* Show the subtraction step */}
                  <div className='p-3 bg-accent/10 rounded-lg border border-accent/20'>
                    <div className='text-lg text-accent font-semibold'>
                      {currentStepData.workingNumber} -{' '}
                      {currentStepData.subtractAmount} ={' '}
                      {currentStepData.remainder}
                    </div>
                  </div>

                  {/* Show bring down arrow if not the last step */}
                  {currentStep < steps.length - 1 && (
                    <div className='flex justify-center items-center space-x-2'>
                      <div className='text-secondary-foreground'>
                        Bring down next digit
                      </div>
                      <div className='text-2xl text-secondary-foreground'>
                        ↓
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStepExplanation = () => {
    if (currentStep >= steps.length) return null;

    const step = steps[currentStep];
    if (!step) return null;

    const getStepDetails = () => {
      switch (step.stepType) {
        case 'setup':
          return {
            color: 'bg-secondary',
            content: `Place the dividend (${currentDividend}) inside the division bracket and the divisor (${currentDivisor}) outside. Draw a line above for the quotient.`,
          };
        case 'divide':
          return {
            color: 'bg-primary/10',
            content: `How many times does ${currentDivisor} go into ${step.workingNumber}? Answer: ${step.quotientDigit} time${step.quotientDigit !== 1 ? 's' : ''}${step.remainder > 0 ? ' with some extra' : ' exactly'}.`,
          };
        case 'multiply':
          return {
            color: 'bg-accent/10',
            content: `Multiply the quotient digit by the divisor: ${step.quotientDigit} × ${currentDivisor} = ${step.subtractAmount}`,
          };
        case 'subtract':
          return {
            color: 'bg-destructive/10',
            content: `Subtract the product from the working number: ${step.workingNumber} - ${step.subtractAmount} = ${step.remainder}`,
          };
        case 'bringdown':
          return {
            color: 'bg-muted',
            content: `Bring down the next digit to continue the division process.`,
          };
        case 'check':
          return {
            color: 'bg-success/10',
            content: `Verify: ${currentDivisor} × ${Math.floor(currentDividend / currentDivisor)} + ${currentDividend % currentDivisor} = ${currentDividend}`,
          };
        default:
          return {
            color: 'bg-secondary',
            content: step.explanation,
          };
      }
    };

    const stepDetails = getStepDetails();

    return (
      <div className='mt-6 p-6 bg-primary/10 rounded-lg border border-primary/20'>
        <h4 className='font-semibold text-primary mb-3'>{step.title}</h4>
        <p className='text-foreground font-medium mb-2'>{step.explanation}</p>
        <div
          className={`text-sm text-muted-foreground ${stepDetails.color} p-2 rounded`}
        >
          <strong>{step.stepType === 'setup' ? 'Setup:' : 'Process:'}</strong>{' '}
          {stepDetails.content}
        </div>
      </div>
    );
  };

  return (
    <Card className='w-full max-w-4xl mx-auto'>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <Calculator className='w-5 h-5 text-primary' />
          <CardTitle className='text-lg'>Long Division Algorithm</CardTitle>
        </div>
        <p className='text-sm text-muted-foreground'>
          Step-by-step long division process
        </p>
      </CardHeader>

      <CardContent>
        <div className='space-y-6'>
          {/* Input Controls */}
          {interactive && (
            <div className='flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-lg'>
              <div className='flex items-center gap-2'>
                <label className='text-sm font-medium text-foreground'>
                  Dividend:
                </label>
                <input
                  type='number'
                  min='100'
                  max='999'
                  value={currentDividend}
                  onChange={e => {
                    setCurrentDividend(parseInt(e.target.value) || 456);
                    reset();
                  }}
                  className='w-20 px-3 py-2 bg-card border border-border rounded text-center text-card-foreground font-medium'
                />
              </div>

              <div className='flex items-center gap-2'>
                <label className='text-sm font-medium text-foreground'>
                  Divisor:
                </label>
                <input
                  type='number'
                  min='2'
                  max='12'
                  value={currentDivisor}
                  onChange={e => {
                    setCurrentDivisor(parseInt(e.target.value) || 4);
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
              Step {currentStep + 1} of {steps.length}
            </div>
            <div className='text-3xl font-bold text-primary mb-2'>
              {currentDividend} ÷ {currentDivisor} = {finalQuotient}{' '}
              {finalRemainder > 0 && `R${finalRemainder}`}
            </div>
            <div className='text-lg text-primary font-semibold mb-1'>
              {steps[currentStep]?.title || 'Long Division Process'}
            </div>
            <div className='text-sm text-muted-foreground font-medium'>
              {steps[currentStep]?.stepType === 'setup'
                ? 'Set up the long division format'
                : steps[currentStep]?.stepType === 'divide'
                  ? 'Find how many times the divisor goes into the working number'
                  : steps[currentStep]?.stepType === 'multiply'
                    ? 'Multiply quotient digit by divisor'
                    : steps[currentStep]?.stepType === 'subtract'
                      ? 'Subtract to find remainder'
                      : steps[currentStep]?.stepType === 'bringdown'
                        ? 'Bring down the next digit'
                        : steps[currentStep]?.stepType === 'check'
                          ? 'Verify the answer'
                          : 'Long Division Process'}
            </div>
          </div>

          {/* Long Division Visualization */}
          <div className='flex justify-center'>{renderLongDivision()}</div>

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
                📝 DMBS Method
              </h4>
              <p className='text-sm text-muted-foreground'>
                Remember: <strong>D</strong>ivide, <strong>M</strong>ultiply,
                <strong>S</strong>ubtract, <strong>B</strong>ring down. Repeat
                until all digits are used.
              </p>
            </div>

            <div className='p-4 bg-accent/10 rounded-lg border border-accent/20'>
              <h4 className='font-semibold text-accent mb-2'>
                ✓ Check Your Work
              </h4>
              <p className='text-sm text-muted-foreground'>
                Always verify: quotient × divisor + remainder = dividend. For
                this problem: {finalQuotient} × {currentDivisor}{' '}
                {finalRemainder > 0 && `+ ${finalRemainder}`} ={' '}
                {currentDividend}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
