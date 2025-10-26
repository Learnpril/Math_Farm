import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Badge } from '../../../../components/ui/badge';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface LinearEquationSolverProps {
  className?: string;
}

interface EquationStep {
  equation: string;
  description: string;
  operation: string;
}

export function LinearEquationSolver({
  className = '',
}: LinearEquationSolverProps) {
  const [a, setA] = useState(3);
  const [b, setB] = useState(-8);
  const [c, setC] = useState(19);
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showSolution, setShowSolution] = useState(false);

  // Calculate the solution
  const solution = (c - b) / a;

  // Generate solution steps
  const generateSteps = (): EquationStep[] => {
    const steps: EquationStep[] = [
      {
        equation: `${a}x ${b >= 0 ? '+' : ''}${b} = ${c}`,
        description: 'Original equation',
        operation: 'Start',
      },
    ];

    if (b !== 0) {
      const newC = c - b;
      steps.push({
        equation: `${a}x ${b >= 0 ? '+' : ''}${b} ${b >= 0 ? '-' : '+'} ${Math.abs(b)} = ${c} ${b >= 0 ? '-' : '+'} ${Math.abs(b)}`,
        description: `${b >= 0 ? 'Subtract' : 'Add'} ${Math.abs(b)} from both sides`,
        operation: b >= 0 ? `Subtract ${b}` : `Add ${Math.abs(b)}`,
      });

      steps.push({
        equation: `${a}x = ${newC}`,
        description: 'Simplified',
        operation: 'Simplify',
      });
    }

    if (a !== 1) {
      steps.push({
        equation: `${a}x ÷ ${a} = ${c - b} ÷ ${a}`,
        description: `Divide both sides by ${a}`,
        operation: `Divide by ${a}`,
      });

      steps.push({
        equation: `x = ${solution}`,
        description: 'Solution',
        operation: 'Final Answer',
      });
    }

    return steps;
  };

  const steps = generateSteps();

  const checkAnswer = () => {
    const userValue = parseFloat(userAnswer);
    return Math.abs(userValue - solution) < 0.001;
  };

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
    setUserAnswer('');
    setShowSolution(false);
  };

  const generateNewProblem = () => {
    setA(Math.floor(Math.random() * 5) + 2);
    setB(Math.floor(Math.random() * 21) - 10);
    setC(Math.floor(Math.random() * 31) - 15);
    reset();
  };

  return (
    <Card className={`w-full max-w-4xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <span>Linear Equation Solver</span>
          <div className='flex gap-2'>
            <Button onClick={generateNewProblem} variant='outline' size='sm'>
              New Problem
            </Button>
            <Button onClick={reset} variant='outline' size='sm'>
              <RotateCcw className='h-4 w-4' />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Current Step Display */}
        <div className='bg-muted/50 p-6 rounded-lg'>
          <div className='text-center'>
            <div className='text-2xl font-mono mb-2'>
              {steps[currentStep]?.equation}
            </div>
            <Badge variant='secondary' className='mb-4'>
              Step {currentStep + 1} of {steps.length}:{' '}
              {steps[currentStep]?.description}
            </Badge>
          </div>
        </div>

        {/* Step Navigation */}
        <div className='flex justify-center gap-4'>
          <Button
            onClick={prevStep}
            disabled={currentStep === 0}
            variant='outline'
          >
            Previous Step
          </Button>
          <Button
            onClick={nextStep}
            disabled={currentStep === steps.length - 1}
            variant='outline'
          >
            Next Step
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className='flex justify-center'>
          <div className='flex gap-2'>
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index <= currentStep ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Answer Input */}
        {currentStep === steps.length - 1 && (
          <div className='bg-background border rounded-lg p-4'>
            <div className='flex items-center gap-4'>
              <label className='font-medium'>Your answer: x =</label>
              <Input
                type='number'
                step='0.1'
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                className='w-32'
                placeholder='Enter answer'
              />
              <Button
                onClick={() => setShowSolution(true)}
                disabled={!userAnswer}
              >
                Check Answer
              </Button>
            </div>

            {showSolution && userAnswer && (
              <div className='mt-4 flex items-center gap-2'>
                {checkAnswer() ? (
                  <>
                    <CheckCircle className='h-5 w-5 text-green-600' />
                    <span className='text-green-600 font-medium'>Correct!</span>
                  </>
                ) : (
                  <>
                    <XCircle className='h-5 w-5 text-red-600' />
                    <span className='text-red-600 font-medium'>
                      Incorrect. The correct answer is x = {solution}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* All Steps Summary */}
        <div className='border-t pt-4'>
          <h4 className='font-medium mb-3'>Solution Steps:</h4>
          <div className='space-y-2'>
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 p-2 rounded ${
                  index === currentStep
                    ? 'bg-primary/10 border border-primary/20'
                    : index < currentStep
                      ? 'bg-muted/30'
                      : 'text-muted-foreground'
                }`}
              >
                <Badge
                  variant={index <= currentStep ? 'default' : 'outline'}
                  className='min-w-fit'
                >
                  {index + 1}
                </Badge>
                <div className='font-mono text-sm flex-1'>{step.equation}</div>
                <div className='text-sm text-muted-foreground'>
                  {step.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
