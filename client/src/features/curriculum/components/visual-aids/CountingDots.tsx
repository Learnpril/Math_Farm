import React, { useState } from 'react';

interface CountingDotsProps {
  problem?: string;
  operation?: 'addition' | 'subtraction';
  firstNumber?: number;
  secondNumber?: number;
  showAnswer?: boolean;
}

export const CountingDots: React.FC<CountingDotsProps> = ({
  problem = '7 + 5',
  operation = 'addition',
  firstNumber = 7,
  secondNumber = 5,
  showAnswer = false,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const maxSteps = operation === 'addition' ? 3 : 3;

  const renderDots = (count: number, color: string, startIndex: number = 0) => {
    return Array.from({ length: count }, (_, i) => (
      <div
        key={startIndex + i}
        className={`w-4 h-4 rounded-full ${color} border-2 border-gray-400 m-1 flex items-center justify-center text-xs font-bold text-white`}
        style={{
          animationDelay: `${(startIndex + i) * 100}ms`,
          animation:
            currentStep > 0 ? 'fadeIn 0.3s ease-in-out forwards' : 'none',
        }}
      >
        {startIndex + i + 1}
      </div>
    ));
  };

  const renderAddition = () => {
    const result = firstNumber + secondNumber;

    return (
      <div className='space-y-4'>
        <div className='text-center'>
          <h3 className='text-lg font-semibold mb-2 text-black dark:text-white'>
            {problem}
          </h3>
          <p className='text-sm text-gray-600 dark:text-gray-300'>
            {currentStep === 1 && `Start with ${firstNumber} dots (blue)`}
            {currentStep === 2 && `Add ${secondNumber} more dots (green)`}
            {currentStep === 3 && `Count all dots together = ${result}`}
          </p>
        </div>

        <div className='flex flex-col items-center space-y-4'>
          {/* First number dots */}
          {currentStep >= 1 && (
            <div className='flex flex-wrap justify-center max-w-xs'>
              <div className='text-sm font-medium text-blue-600 w-full text-center mb-2'>
                First number: {firstNumber}
              </div>
              {renderDots(firstNumber, 'bg-blue-500')}
            </div>
          )}

          {/* Plus sign */}
          {currentStep >= 2 && (
            <div className='text-2xl font-bold text-gray-700'>+</div>
          )}

          {/* Second number dots */}
          {currentStep >= 2 && (
            <div className='flex flex-wrap justify-center max-w-xs'>
              <div className='text-sm font-medium text-green-600 w-full text-center mb-2'>
                Second number: {secondNumber}
              </div>
              {renderDots(secondNumber, 'bg-green-500', firstNumber)}
            </div>
          )}

          {/* Result */}
          {currentStep >= 3 && (
            <div className='border-t-2 border-gray-400 pt-4'>
              <div className='text-sm font-medium text-purple-600 text-center mb-2'>
                Total: {result}
              </div>
              <div className='flex flex-wrap justify-center max-w-xs'>
                {renderDots(result, 'bg-purple-500')}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSubtraction = () => {
    const result = firstNumber - secondNumber;

    return (
      <div className='space-y-4'>
        <div className='text-center'>
          <h3 className='text-lg font-semibold mb-2 text-black dark:text-white'>
            {problem}
          </h3>
          <p className='text-sm text-gray-600 dark:text-gray-300'>
            {currentStep === 1 && `Start with ${firstNumber} dots (blue)`}
            {currentStep === 2 && `Cross out ${secondNumber} dots (red X)`}
            {currentStep === 3 && `Count remaining dots = ${result}`}
          </p>
        </div>

        <div className='flex flex-col items-center space-y-4'>
          {/* Starting dots */}
          {currentStep >= 1 && (
            <div className='flex flex-wrap justify-center max-w-xs'>
              <div className='text-sm font-medium text-blue-600 w-full text-center mb-2'>
                Starting with: {firstNumber}
              </div>
              {Array.from({ length: firstNumber }, (_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border-2 border-gray-400 m-1 flex items-center justify-center text-xs font-bold relative
                    ${currentStep >= 2 && i >= result ? 'bg-red-200' : 'bg-blue-500 text-white'}
                  `}
                >
                  {i + 1}
                  {currentStep >= 2 && i >= result && (
                    <div className='absolute inset-0 flex items-center justify-center'>
                      <span className='text-red-600 font-bold text-lg'>×</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Minus sign */}
          {currentStep >= 2 && (
            <div className='text-2xl font-bold text-gray-700'>−</div>
          )}

          {/* Crossed out amount */}
          {currentStep >= 2 && (
            <div className='text-sm font-medium text-red-600 text-center'>
              Taking away: {secondNumber}
            </div>
          )}

          {/* Result */}
          {currentStep >= 3 && (
            <div className='border-t-2 border-gray-400 pt-4'>
              <div className='text-sm font-medium text-purple-600 text-center mb-2'>
                Remaining: {result}
              </div>
              <div className='flex flex-wrap justify-center max-w-xs'>
                {renderDots(result, 'bg-purple-500')}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className='bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm'>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      {operation === 'addition' ? renderAddition() : renderSubtraction()}

      <div className='flex justify-center space-x-2 mt-6'>
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className='px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600'
        >
          Previous Step
        </button>
        <button
          onClick={() => setCurrentStep(Math.min(maxSteps, currentStep + 1))}
          disabled={currentStep === maxSteps}
          className='px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600'
        >
          Next Step
        </button>
        <button
          onClick={() => setCurrentStep(1)}
          className='px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400'
        >
          Reset
        </button>
      </div>

      <div className='text-center mt-4'>
        <div className='text-sm text-gray-500 dark:text-gray-400'>
          Step {currentStep} of {maxSteps}
        </div>
      </div>
    </div>
  );
};

export default CountingDots;
