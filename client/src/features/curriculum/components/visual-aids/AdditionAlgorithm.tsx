import { useState } from 'react';

interface AdditionAlgorithmProps {
  number1?: number;
  number2?: number;
  interactive?: boolean;
  className?: string;
}

export function AdditionAlgorithm({
  number1 = 156,
  number2 = 287,
  interactive = false,
  className = '',
}: AdditionAlgorithmProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showCarries, setShowCarries] = useState(true);

  // Convert numbers to digit arrays (pad to same length)
  const str1 = number1.toString().padStart(3, '0');
  const str2 = number2.toString().padStart(3, '0');
  const digits1 = str1.split('').map(Number);
  const digits2 = str2.split('').map(Number);

  // Calculate step by step
  const steps = [];
  let carry = 0;
  const result = [];

  for (let i = digits1.length - 1; i >= 0; i--) {
    const sum = digits1[i] + digits2[i] + carry;
    const digit = sum % 10;
    const newCarry = Math.floor(sum / 10);

    steps.push({
      position: i,
      digit1: digits1[i],
      digit2: digits2[i],
      carry: carry,
      sum: sum,
      resultDigit: digit,
      newCarry: newCarry,
      placeValue: ['Hundreds', 'Tens', 'Ones'][i],
    });

    result.unshift(digit);
    carry = newCarry;
  }

  if (carry > 0) {
    result.unshift(carry);
  }

  const finalAnswer = result.join('');

  const renderProblem = () => {
    return (
      <div className='font-mono text-center'>
        {/* Carry row */}
        {showCarries && (
          <div className='flex justify-center mb-1'>
            <div className='grid grid-cols-4 gap-2 text-sm text-red-600 dark:text-red-400'>
              <div></div> {/* Empty space for alignment */}
              {steps.map((step, index) => (
                <div key={index} className='w-12 text-center'>
                  {step.newCarry > 0 &&
                  (currentStep > index || !interactive) ? (
                    <span className='text-xs bg-red-100 dark:bg-red-900/30 px-1 rounded'>
                      {step.newCarry}
                    </span>
                  ) : (
                    <span className='text-xs opacity-30'>·</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* First number */}
        <div className='flex justify-center mb-1'>
          <div className='grid grid-cols-4 gap-2 text-2xl'>
            <div className='w-12 text-right'>+</div>
            {digits1.map((digit, index) => (
              <div
                key={index}
                className={`w-12 text-center border-b-2 ${
                  currentStep === 2 - index && interactive
                    ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {digit}
              </div>
            ))}
          </div>
        </div>

        {/* Second number */}
        <div className='flex justify-center mb-1'>
          <div className='grid grid-cols-4 gap-2 text-2xl'>
            <div className='w-12'></div>
            {digits2.map((digit, index) => (
              <div
                key={index}
                className={`w-12 text-center border-b-2 ${
                  currentStep === 2 - index && interactive
                    ? 'bg-green-100 dark:bg-green-900/30 border-green-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {digit}
              </div>
            ))}
          </div>
        </div>

        {/* Result */}
        <div className='flex justify-center mt-2'>
          <div className='grid grid-cols-4 gap-2 text-2xl font-bold'>
            <div className='w-12'></div>
            {result.map((digit, index) => (
              <div
                key={index}
                className={`w-12 text-center ${
                  !interactive || currentStep >= result.length - 1 - index
                    ? 'text-purple-700 dark:text-purple-300'
                    : 'text-transparent'
                }`}
              >
                {digit}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const getCurrentStepExplanation = () => {
    if (currentStep >= steps.length) {
      return `Complete! ${number1} + ${number2} = ${finalAnswer}`;
    }

    const step = steps[currentStep];
    const carryText = step.carry > 0 ? ` + ${step.carry} (carried)` : '';

    return `${step.placeValue} place: ${step.digit1} + ${step.digit2}${carryText} = ${step.sum}. Write ${step.resultDigit}${step.newCarry > 0 ? `, carry ${step.newCarry}` : ''}`;
  };

  return (
    <div
      className={`addition-algorithm bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      <h4 className='text-lg font-semibold mb-4 text-center text-gray-800 dark:text-gray-200'>
        Addition Algorithm: {number1} + {number2}
      </h4>

      <div className='space-y-6'>
        {/* Visual Problem */}
        <div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-6'>
          {renderProblem()}
        </div>

        {/* Step Explanation */}
        <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4'>
          <h5 className='font-medium text-blue-800 dark:text-blue-200 mb-2'>
            {interactive ? `Step ${currentStep + 1}:` : 'Solution:'}
          </h5>
          <div className='text-sm text-blue-700 dark:text-blue-300'>
            {getCurrentStepExplanation()}
          </div>
        </div>

        {/* Interactive Controls */}
        {interactive && (
          <div className='flex justify-center space-x-4'>
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className='px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Previous Step
            </button>
            <button
              onClick={() =>
                setCurrentStep(Math.min(steps.length, currentStep + 1))
              }
              disabled={currentStep >= steps.length}
              className='px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Next Step
            </button>
            <button
              onClick={() => setShowCarries(!showCarries)}
              className='px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50'
            >
              {showCarries ? 'Hide' : 'Show'} Carries
            </button>
          </div>
        )}

        {/* Key Concepts */}
        <div className='bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4'>
          <h5 className='font-medium text-yellow-800 dark:text-yellow-200 mb-2'>
            Key Concepts:
          </h5>
          <div className='space-y-1 text-sm text-yellow-700 dark:text-yellow-300'>
            <div>• Add from right to left (ones, tens, hundreds)</div>
            <div>
              • When a column sum ≥ 10, write the ones digit and carry the tens
              digit
            </div>
            <div>
              • Don't forget to add any carried amount to the next column
            </div>
            <div>• Check your answer by adding in reverse order</div>
          </div>
        </div>
      </div>
    </div>
  );
}
