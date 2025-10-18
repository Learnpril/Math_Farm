import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface CommonCoreStrategiesProps {
  problem?: string;
  operation?: 'addition' | 'subtraction';
}

export const CommonCoreStrategies: React.FC<CommonCoreStrategiesProps> = ({
  problem = '8 + 5',
  operation = 'addition',
}) => {
  const [showQuickCheck, setShowQuickCheck] = useState(false);
  const [quickCheckAnswers, setQuickCheckAnswers] = useState<{
    [key: string]: string;
  }>({});
  const [quickCheckResults, setQuickCheckResults] = useState<{
    [key: string]: boolean;
  }>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [currentStrategy, setCurrentStrategy] = useState(0);

  // Parse the problem
  const [num1, operator, num2] = problem.split(' ');
  const a = parseInt(num1 || '0');
  const b = parseInt(num2 || '0');
  const result = operator === '+' ? a + b : a - b;

  const strategies =
    operation === 'addition'
      ? [
          {
            name: 'Making Ten Strategy',
            description: 'Break numbers to make 10 first, then add the rest',
            steps: [
              { text: `Start with ${a} + ${b}`, visual: 'problem' },
              {
                text: `Break ${b} into parts to make 10 with ${a}`,
                visual: 'break',
              },
              { text: `${a} + ${10 - a} = 10`, visual: 'make10' },
              { text: `10 + ${b - (10 - a)} = ${result}`, visual: 'final' },
            ],
          },
          {
            name: 'Decomposition Strategy',
            description: 'Break numbers into place values and add separately',
            steps: [
              { text: `Start with ${a} + ${b}`, visual: 'problem' },
              { text: `Break into place values`, visual: 'decompose' },
              { text: `Add tens and ones separately`, visual: 'addParts' },
              { text: `Combine results: ${result}`, visual: 'combine' },
            ],
          },
          {
            name: 'Number Line Jumping',
            description:
              'Use a number line to visualize addition as jumps forward',
            steps: [
              { text: `Start at ${a} on the number line`, visual: 'start' },
              { text: `Jump forward ${b} spaces`, visual: 'jump' },
              { text: `Land on ${result}`, visual: 'land' },
            ],
          },
        ]
      : [
          {
            name: 'Adding Up Strategy',
            description:
              "Think of subtraction as 'how much to add up to reach the target'",
            steps: [
              { text: `${a} - ${b} = ?`, visual: 'problem' },
              { text: `Think: ${b} + ? = ${a}`, visual: 'addUp' },
              { text: `Count up from ${b} to ${a}`, visual: 'count' },
              { text: `The difference is ${result}`, visual: 'result' },
            ],
          },
          {
            name: 'Decomposition Strategy',
            description: 'Break the subtrahend into friendly parts',
            steps: [
              { text: `${a} - ${b} = ?`, visual: 'problem' },
              { text: `Break ${b} into parts`, visual: 'break' },
              { text: `Subtract parts step by step`, visual: 'subtractParts' },
              { text: `Final result: ${result}`, visual: 'final' },
            ],
          },
        ];

  const currentStrat = strategies[currentStrategy];
  const maxSteps = currentStrat?.steps.length || 0;

  const nextStep = () => {
    if (currentStep < maxSteps - 1) {
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

  const switchStrategy = (index: number) => {
    setCurrentStrategy(index);
    setCurrentStep(0);
  };

  // Quick Check questions based on Common Core strategies
  const quickCheckQuestions = [
    {
      id: 'making-ten',
      question:
        'Using the "making ten" strategy, what would you add to 7 to make 10?',
      options: ['2', '3', '4', '5'],
      correct: '3',
      explanation: 'To make 10 from 7, you need to add 3 because 7 + 3 = 10.',
    },
    {
      id: 'decompose-add',
      question:
        'To solve 6 + 8 using decomposition, you could break 8 into which parts?',
      options: ['3 + 5', '4 + 4', '2 + 6', '1 + 7'],
      correct: '4 + 4',
      explanation: 'Breaking 8 into 4 + 4 helps: 6 + 4 = 10, then 10 + 4 = 14.',
    },
    {
      id: 'number-line',
      question:
        'On a number line, if you start at 5 and jump 6 spaces forward, where do you land?',
      options: ['10', '11', '12', '13'],
      correct: '11',
      explanation: 'Starting at 5 and jumping 6 spaces: 5 + 6 = 11.',
    },
    {
      id: 'adding-up',
      question:
        'For 12 - 8, using the "adding up" strategy, what do you add to 8 to reach 12?',
      options: ['3', '4', '5', '6'],
      correct: '4',
      explanation: 'To go from 8 to 12, you add 4 because 8 + 4 = 12.',
    },
  ];

  const handleQuickCheckAnswer = (questionId: string, answer: string) => {
    const question = quickCheckQuestions.find(q => q.id === questionId);
    const isCorrect = question ? answer === question.correct : false;

    setQuickCheckAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));

    setQuickCheckResults(prev => ({
      ...prev,
      [questionId]: isCorrect,
    }));
  };

  const resetQuickCheck = () => {
    setQuickCheckAnswers({});
    setQuickCheckResults({});
  };

  const renderVisual = () => {
    if (!currentStrat) return null;
    const step = currentStrat.steps[currentStep];
    if (!step) return null;

    if (operation === 'addition' && currentStrategy === 0) {
      // Making Ten Strategy Visual
      if (step.visual === 'problem') {
        return (
          <div className='flex items-center justify-center space-x-2 sm:space-x-4 p-4 min-w-fit'>
            <div className='flex space-x-1 flex-shrink-0'>
              {Array.from({ length: a }, (_, i) => (
                <div
                  key={i}
                  className='w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0'
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <span className='text-xl sm:text-2xl font-bold text-primary flex-shrink-0'>+</span>
            <div className='flex space-x-1 flex-shrink-0'>
              {Array.from({ length: b }, (_, i) => (
                <div
                  key={i}
                  className='w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0'
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        );
      } else if (step.visual === 'break') {
        const needed = Math.max(0, 10 - a);
        const remaining = Math.max(0, b - needed);
        return (
          <div className='flex flex-col items-center space-y-4 p-4 min-w-fit'>
            <div className='flex items-center space-x-2 sm:space-x-4'>
              <div className='flex space-x-1 flex-shrink-0'>
                {Array.from({ length: a }, (_, i) => (
                  <div
                    key={i}
                    className='w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0'
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
              <span className='text-lg flex-shrink-0'>+</span>
              <div className='flex space-x-1 flex-shrink-0'>
                {Array.from({ length: Math.min(needed, b) }, (_, i) => (
                  <div
                    key={i}
                    className='w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0'
                  >
                    {i + 1}
                  </div>
                ))}
                {remaining > 0 &&
                  Array.from({ length: remaining }, (_, i) => (
                    <div
                      key={i + needed}
                      className='w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0'
                    >
                      {i + 1}
                    </div>
                  ))}
              </div>
            </div>
            <div className='text-sm text-muted-foreground text-center'>
              Break {b} into {Math.min(needed, b)} (to make 10) + {remaining}
            </div>
          </div>
        );
      } else if (step.visual === 'make10') {
        const needed = Math.max(0, 10 - a);
        return (
          <div className='flex flex-col items-center space-y-4 p-4 min-w-fit'>
            <div className='flex items-center space-x-2'>
              <div className='flex space-x-1 p-2 border-2 border-primary rounded-lg flex-shrink-0'>
                {Array.from({ length: 10 }, (_, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 ${
                      i < a ? 'bg-blue-500' : 'bg-yellow-500'
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
            <div className='text-lg font-semibold text-primary'>Makes 10!</div>
          </div>
        );
      } else if (step.visual === 'final') {
        const remaining = Math.max(0, b - Math.max(0, 10 - a));
        return (
          <div className='flex flex-col items-center space-y-4 p-4 min-w-fit'>
            <div className='flex items-center space-x-2 sm:space-x-4'>
              <div className='flex space-x-1 p-2 border-2 border-primary rounded-lg flex-shrink-0'>
                <div className='w-12 h-6 bg-primary rounded flex items-center justify-center text-white text-sm font-bold'>
                  10
                </div>
              </div>
              <span className='text-lg flex-shrink-0'>+</span>
              <div className='flex space-x-1 flex-shrink-0'>
                {Array.from({ length: remaining }, (_, i) => (
                  <div
                    key={i}
                    className='w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0'
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
              <span className='text-lg flex-shrink-0'>=</span>
              <div className='text-xl sm:text-2xl font-bold text-primary flex-shrink-0'>{result}</div>
            </div>
          </div>
        );
      }
    } else if (operation === 'addition' && currentStrategy === 2) {
      // Number Line Visual
      const lineStart = Math.max(0, a - 2);
      const lineEnd = result + 2;
      const positions = Array.from(
        { length: lineEnd - lineStart + 1 },
        (_, i) => lineStart + i
      );

      return (
        <div className='flex flex-col items-center space-y-4 p-4 min-w-fit'>
          <div className='flex items-center space-x-1'>
            {positions.map(pos => (
              <div key={pos} className='flex flex-col items-center flex-shrink-0'>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    pos === a && step.visual === 'start'
                      ? 'bg-blue-500 text-white'
                      : pos === result && step.visual === 'land'
                        ? 'bg-green-500 text-white'
                        : pos >= a && pos <= result && step.visual === 'jump'
                          ? 'bg-yellow-200'
                          : 'bg-gray-200'
                  }`}
                >
                  {pos}
                </div>
                {step.visual === 'jump' && pos > a && pos <= result && (
                  <div className='text-xs text-primary mt-1'>↑</div>
                )}
              </div>
            ))}
          </div>
          {step.visual === 'jump' && (
            <div className='text-sm text-muted-foreground text-center'>
              Jump {b} spaces forward
            </div>
          )}
        </div>
      );
    }

    // Default simple visual
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-4xl font-bold text-primary'>
          {problem} = {result}
        </div>
      </div>
    );
  };

  return (
    <div className='space-y-6'>
      <Card className='w-full max-w-4xl mx-auto'>
        <CardHeader>
          <CardTitle className='text-center'>Common Core Strategies</CardTitle>
          <div className='flex flex-wrap justify-center gap-2 mt-4'>
            {strategies.map((strategy, index) => (
              <Button
                key={index}
                variant={currentStrategy === index ? 'default' : 'outline'}
                size='sm'
                onClick={() => switchStrategy(index)}
                className='text-xs'
              >
                {strategy.name}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            <div className='text-center'>
              <h3 className='text-lg font-semibold text-primary mb-2'>
                {currentStrat?.name}
              </h3>
              <p className='text-sm text-muted-foreground mb-4'>
                {currentStrat?.description}
              </p>
            </div>

            <div className='bg-muted/30 rounded-lg p-6 min-h-[200px] flex items-center justify-center overflow-x-auto'>
              <div className='min-w-fit'>
                {renderVisual()}
              </div>
            </div>
            
            {/* Mobile scroll hint */}
            <div className='sm:hidden mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg'>
              <p className='text-xs text-yellow-800 dark:text-yellow-200 text-center'>
                📱 <strong>Tip:</strong> Scroll horizontally to see the full strategy visualization
              </p>
            </div>

            <div className='text-center'>
              <div className='bg-background border rounded-lg p-4 mb-4'>
                <p className='text-lg font-medium'>
                  Step {currentStep + 1}: {currentStrat?.steps[currentStep]?.text}
                </p>
              </div>

              <div className='flex items-center justify-center space-x-4'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className='w-4 h-4 mr-1' />
                  Previous
                </Button>

                <Button variant='outline' size='sm' onClick={reset}>
                  <RotateCcw className='w-4 h-4 mr-1' />
                  Reset
                </Button>

                <Button
                  variant='outline'
                  size='sm'
                  onClick={nextStep}
                  disabled={currentStep === maxSteps - 1}
                >
                  Next
                  <ChevronRight className='w-4 h-4 ml-1' />
                </Button>
              </div>

              <div className='flex justify-center mt-4'>
                <div className='flex space-x-1'>
                  {currentStrat?.steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentStep ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Check Section */}
      <Card className='w-full max-w-4xl mx-auto mt-6'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <CheckCircle className='w-5 h-5 text-green-600' />
              <CardTitle className='text-lg'>
                Quick Check: Common Core Strategies
              </CardTitle>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowQuickCheck(!showQuickCheck)}
            >
              {showQuickCheck ? 'Hide' : 'Show'} Quick Check
            </Button>
          </div>
        </CardHeader>

        {showQuickCheck && (
          <CardContent>
            <div className='space-y-6'>
              <p className='text-sm text-muted-foreground mb-4'>
                Test your understanding of Common Core strategies with these
                questions:
              </p>

              {quickCheckQuestions.map((question, index) => (
                <div key={question.id} className='border rounded-lg p-4'>
                  <h4 className='font-medium mb-3'>
                    {index + 1}. {question.question}
                  </h4>

                  <div className='grid grid-cols-2 gap-2 mb-3'>
                    {question.options.map(option => (
                      <Button
                        key={option}
                        variant={
                          quickCheckAnswers[question.id] === option
                            ? 'default'
                            : 'outline'
                        }
                        size='sm'
                        onClick={() =>
                          handleQuickCheckAnswer(question.id, option)
                        }
                        className={`justify-start ${
                          quickCheckAnswers[question.id] === option
                            ? quickCheckResults[question.id]
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-red-600 hover:bg-red-700'
                            : ''
                        }`}
                      >
                        {quickCheckAnswers[question.id] === option &&
                          (quickCheckResults[question.id] ? (
                            <CheckCircle className='w-4 h-4 mr-2' />
                          ) : (
                            <XCircle className='w-4 h-4 mr-2' />
                          ))}
                        {option}
                      </Button>
                    ))}
                  </div>

                  {quickCheckAnswers[question.id] && (
                    <div
                      className={`text-sm p-3 rounded-md ${
                        quickCheckResults[question.id]
                          ? 'bg-green-50 text-green-800 border border-green-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      <div className='flex items-start gap-2'>
                        {quickCheckResults[question.id] ? (
                          <CheckCircle className='w-4 h-4 mt-0.5 text-green-600' />
                        ) : (
                          <XCircle className='w-4 h-4 mt-0.5 text-red-600' />
                        )}
                        <div>
                          <p className='font-medium'>
                            {quickCheckResults[question.id]
                              ? 'Correct!'
                              : 'Not quite right.'}
                          </p>
                          <p>{question.explanation}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div className='flex justify-center pt-4'>
                <Button
                  variant='outline'
                  onClick={resetQuickCheck}
                  className='flex items-center gap-2'
                >
                  <RotateCcw className='w-4 h-4' />
                  Reset Quick Check
                </Button>
              </div>

              {Object.keys(quickCheckAnswers).length ===
                quickCheckQuestions.length && (
                <div className='text-center p-4 bg-blue-50 rounded-lg border border-blue-200'>
                  <p className='text-blue-800 font-medium'>
                    Great job completing the Quick Check!
                    {
                      Object.values(quickCheckResults).filter(Boolean).length
                    }{' '}
                    out of {quickCheckQuestions.length} correct.
                  </p>
                  <p className='text-sm text-blue-600 mt-1'>
                    These Common Core strategies help build number sense and
                    flexible thinking.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
