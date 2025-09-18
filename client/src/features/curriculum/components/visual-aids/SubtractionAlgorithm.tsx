import { useState } from 'react';

interface SubtractionAlgorithmProps {
  number1?: number;
  number2?: number;
  interactive?: boolean;
  className?: string;
}

export function SubtractionAlgorithm({
  number1 = 524,
  number2 = 187,
  interactive = false,
  className = '',
}: SubtractionAlgorithmProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showBorrows, setShowBorrows] = useState(true);

  // Convert numbers to digit arrays (pad to same length)
  const str1 = number1.toString().padStart(3, '0');
  const str2 = number2.toString().padStart(3, '0');
  let digits1 = str1.split('').map(Number);
  const digits2 = str2.split('').map(Number);

  // Calculate step by step with borrowing
  const steps = [];
  const workingDigits = [...digits1]; // Copy for modifications
  const result = [];

  for (let i = digits1.length - 1; i >= 0; i--) {
    let topDigit = workingDigits[i];
    const bottomDigit = digits2[i];
    let borrowed = false;
    let borrowedFrom = -1;

    // Check if we need to borrow
    if (topDigit < bottomDigit) {
      // Find the next non-zero digit to borrow from
      for (let j = i - 1; j >= 0; j--) {
        if (workingDigits[j] > 0) {
          workingDigits[j]--;
          borrowedFrom = j;

          // Add 10 to all digits between borrower and current
          for (let k = j + 1; k <= i; k++) {
            workingDigits[k] += 10;
          }

          topDigit = workingDigits[i];
          borrowed = true;
          break;
        }
      }
    }

    const difference = topDigit - bottomDigit;
    result.unshift(difference);

    steps.push({
      position: i,
      originalTop: digits1[i],
      modifiedTop: topDigit,
      bottom: bottomDigit,
      difference: difference,
      borrowed: borrowed,
      borrowedFrom: borrowedFrom,
      placeValue: ['Hundreds', 'Tens', 'Ones'][i],
      workingDigits: [...workingDigits],
    });
  }

  const finalAnswer = result.join('').replace(/^0+/, '') || '0';

  const renderProblem = () => {
    const currentWorkingDigits =
      currentStep < steps.length
        ? steps[currentStep].workingDigits
        : workingDigits;

    return (
      <div className='font-mono text-center'>
        {/* Borrowed amounts row */}
        {showBorrows && (
          <div className='flex justify-center mb-1'>
            <div className='grid grid-cols-4 gap-2 text-sm text-red-600 dark:text-red-400'>
              <div></div> {/* Empty space for alignment */}
              {currentWorkingDigits.map((digit, index) => (
                <div key={index} className='w-12 text-center'>
                  {digit !== digits1[index] &&
                  (currentStep > 2 - index || !interactive) ? (
                    <span className='text-xs bg-red-100 dark:bg-red-900/30 px-1 rounded'>
                      {digit}
                    </span>
                  ) : (
                    <span className='text-xs opacity-30'>·</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* First number (minuend) */}
        <div className='flex justify-center mb-1'>
          <div className='grid grid-cols-4 gap-2 text-2xl'>
            <div className='w-12 text-right'>-</div>
            {digits1.map((digit, index) => (
              <div
                key={index}
                className={`w-12 text-center border-b-2 relative ${
                  currentStep === 2 - index && interactive
                    ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <span
                  className={
                    currentWorkingDigits[index] !== digit
                      ? 'line-through opacity-50'
                      : ''
                  }
                >
                  {digit}
                </span>
                {currentWorkingDigits[index] !== digit && (
                  <span className='absolute -top-2 left-1/2 transform -translate-x-1/2 text-sm text-red-600 dark:text-red-400'>
                    {currentWorkingDigits[index]}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Second number (subtrahend) */}
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
      return `Complete! ${number1} - ${number2} = ${finalAnswer}`;
    }

    const step = steps[currentStep];

    if (step.borrowed) {
      return `${step.placeValue} place: ${step.originalTop} < ${step.bottom}, so borrow 1 from ${step.placeValue === 'Ones' ? 'tens' : step.placeValue === 'Tens' ? 'hundreds' : 'thousands'}. ${step.modifiedTop} - ${step.bottom} = ${step.difference}`;
    } else {
      return `${step.placeValue} place: ${step.modifiedTop} - ${step.bottom} = ${step.difference}`;
    }
  };

  return (
    <div
      className={`subtraction-algorithm bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      <h4 className='text-lg font-semibold mb-4 text-center text-gray-800 dark:text-gray-200'>
        Subtraction Algorithm: {number1} - {number2}
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
              onClick={() => setShowBorrows(!showBorrows)}
              className='px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50'
            >
              {showBorrows ? 'Hide' : 'Show'} Borrowing
            </button>
          </div>
        )}

        {/* Key Concepts */}
        <div className='bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4'>
          <h5 className='font-medium text-yellow-800 dark:text-yellow-200 mb-2'>
            Key Concepts:
          </h5>
          <div className='space-y-1 text-sm text-yellow-700 dark:text-yellow-300'>
            <div>• Subtract from right to left (ones, tens, hundreds)</div>
            <div>
              • When top digit &lt; bottom digit, borrow 1 from the next column
            </div>
            <div>
              • Borrowing adds 10 to the current column and subtracts 1 from the
              next
            </div>
            <div>
              • Check your answer by adding: result + subtrahend = minuend
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
