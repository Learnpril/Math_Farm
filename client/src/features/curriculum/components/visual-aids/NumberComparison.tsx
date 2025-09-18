import { useState } from 'react';

interface NumberComparisonProps {
  number1?: number;
  number2?: number;
  interactive?: boolean;
  className?: string;
}

export function NumberComparison({
  number1 = 12345,
  number2 = 12354,
  interactive = false,
  className = '',
}: NumberComparisonProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedNumbers, setSelectedNumbers] = useState({
    num1: number1,
    num2: number2,
  });

  // Pad numbers to same length for comparison
  const maxLength = Math.max(
    selectedNumbers.num1.toString().length,
    selectedNumbers.num2.toString().length
  );

  const str1 = selectedNumbers.num1.toString().padStart(maxLength, '0');
  const str2 = selectedNumbers.num2.toString().padStart(maxLength, '0');
  const digits1 = str1.split('');
  const digits2 = str2.split('');

  // Find the first position where digits differ
  let firstDifferentPosition = -1;
  for (let i = 0; i < digits1.length; i++) {
    if (digits1[i] !== digits2[i]) {
      firstDifferentPosition = i;
      break;
    }
  }

  const comparison =
    selectedNumbers.num1 > selectedNumbers.num2
      ? 'greater'
      : selectedNumbers.num1 < selectedNumbers.num2
        ? 'less'
        : 'equal';

  const placeNames = ['Ten Thousands', 'Thousands', 'Hundreds', 'Tens', 'Ones'];
  const placeNamesForLength = placeNames.slice(-maxLength);

  const renderComparison = () => {
    return (
      <div className='space-y-4'>
        {/* Numbers aligned for comparison */}
        <div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-4'>
          <div className='space-y-2'>
            {/* Place value headers */}
            <div
              className='grid gap-2 text-xs text-gray-600 dark:text-gray-400 text-center font-medium'
              style={{ gridTemplateColumns: `repeat(${maxLength}, 1fr)` }}
            >
              {placeNamesForLength.map((name, index) => (
                <div key={index}>{name}</div>
              ))}
            </div>

            {/* First number */}
            <div
              className='grid gap-2 text-2xl font-mono text-center'
              style={{ gridTemplateColumns: `repeat(${maxLength}, 1fr)` }}
            >
              {digits1.map((digit, index) => (
                <div
                  key={index}
                  className={`p-2 border-2 rounded ${
                    index === firstDifferentPosition
                      ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/30'
                      : index < firstDifferentPosition ||
                          firstDifferentPosition === -1
                        ? 'border-gray-300 dark:border-gray-600'
                        : 'border-gray-200 dark:border-gray-700 opacity-50'
                  } ${currentStep > index || !interactive ? '' : 'opacity-30'}`}
                >
                  {digit}
                </div>
              ))}
            </div>

            {/* Comparison symbol */}
            <div className='text-center text-3xl font-bold text-purple-600 dark:text-purple-400'>
              {comparison === 'greater'
                ? '>'
                : comparison === 'less'
                  ? '<'
                  : '='}
            </div>

            {/* Second number */}
            <div
              className='grid gap-2 text-2xl font-mono text-center'
              style={{ gridTemplateColumns: `repeat(${maxLength}, 1fr)` }}
            >
              {digits2.map((digit, index) => (
                <div
                  key={index}
                  className={`p-2 border-2 rounded ${
                    index === firstDifferentPosition
                      ? 'border-red-500 bg-red-100 dark:bg-red-900/30'
                      : index < firstDifferentPosition ||
                          firstDifferentPosition === -1
                        ? 'border-gray-300 dark:border-gray-600'
                        : 'border-gray-200 dark:border-gray-700 opacity-50'
                  } ${currentStep > index || !interactive ? '' : 'opacity-30'}`}
                >
                  {digit}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step-by-step explanation */}
        <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4'>
          <h5 className='font-medium text-blue-800 dark:text-blue-200 mb-2'>
            Comparison Process:
          </h5>
          <div className='space-y-2 text-sm text-blue-700 dark:text-blue-300'>
            {digits1.map((digit1, index) => {
              const digit2 = digits2[index];
              const placeName = placeNamesForLength[index];

              if (index < firstDifferentPosition) {
                return (
                  <div
                    key={index}
                    className={
                      currentStep > index || !interactive ? '' : 'opacity-50'
                    }
                  >
                    {placeName}: {digit1} = {digit2} ✓ (same, continue)
                  </div>
                );
              } else if (index === firstDifferentPosition) {
                return (
                  <div
                    key={index}
                    className={`font-medium ${currentStep > index || !interactive ? '' : 'opacity-50'}`}
                  >
                    {placeName}: {digit1} {digit1 > digit2 ? '>' : '<'} {digit2}{' '}
                    → {selectedNumbers.num1}{' '}
                    {comparison === 'greater' ? '>' : '<'}{' '}
                    {selectedNumbers.num2}
                  </div>
                );
              } else {
                return (
                  <div key={index} className='opacity-50 text-xs'>
                    {placeName}: No need to compare (decision already made)
                  </div>
                );
              }
            })}

            {firstDifferentPosition === -1 && (
              <div className='font-medium'>
                All digits are the same → {selectedNumbers.num1} ={' '}
                {selectedNumbers.num2}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`number-comparison bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      <h4 className='text-lg font-semibold mb-4 text-center text-gray-800 dark:text-gray-200'>
        Number Comparison: {selectedNumbers.num1.toLocaleString()} vs{' '}
        {selectedNumbers.num2.toLocaleString()}
      </h4>

      <div className='space-y-6'>
        {renderComparison()}

        {/* Result Summary */}
        <div
          className={`rounded-lg p-4 border-2 ${
            comparison === 'greater'
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : comparison === 'less'
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
          }`}
        >
          <div
            className={`text-center font-bold text-xl ${
              comparison === 'greater'
                ? 'text-green-800 dark:text-green-200'
                : comparison === 'less'
                  ? 'text-red-800 dark:text-red-200'
                  : 'text-yellow-800 dark:text-yellow-200'
            }`}
          >
            {selectedNumbers.num1.toLocaleString()}{' '}
            {comparison === 'greater' ? '>' : comparison === 'less' ? '<' : '='}{' '}
            {selectedNumbers.num2.toLocaleString()}
          </div>
          <div
            className={`text-center text-sm mt-1 ${
              comparison === 'greater'
                ? 'text-green-700 dark:text-green-300'
                : comparison === 'less'
                  ? 'text-red-700 dark:text-red-300'
                  : 'text-yellow-700 dark:text-yellow-300'
            }`}
          >
            {comparison === 'greater'
              ? `${selectedNumbers.num1.toLocaleString()} is greater than ${selectedNumbers.num2.toLocaleString()}`
              : comparison === 'less'
                ? `${selectedNumbers.num1.toLocaleString()} is less than ${selectedNumbers.num2.toLocaleString()}`
                : `${selectedNumbers.num1.toLocaleString()} is equal to ${selectedNumbers.num2.toLocaleString()}`}
          </div>
        </div>

        {/* Interactive Controls */}
        {interactive && (
          <div className='space-y-4'>
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
                  setCurrentStep(Math.min(maxLength, currentStep + 1))
                }
                disabled={currentStep >= maxLength}
                className='px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Next Step
              </button>
            </div>

            {/* Try different numbers */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  First Number
                </label>
                <input
                  type='number'
                  min='1'
                  max='99999'
                  value={selectedNumbers.num1}
                  onChange={e => {
                    setSelectedNumbers(prev => ({
                      ...prev,
                      num1: parseInt(e.target.value) || 1,
                    }));
                    setCurrentStep(0);
                  }}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Second Number
                </label>
                <input
                  type='number'
                  min='1'
                  max='99999'
                  value={selectedNumbers.num2}
                  onChange={e => {
                    setSelectedNumbers(prev => ({
                      ...prev,
                      num2: parseInt(e.target.value) || 1,
                    }));
                    setCurrentStep(0);
                  }}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                />
              </div>
            </div>
          </div>
        )}

        {/* Key Concepts */}
        <div className='bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4'>
          <h5 className='font-medium text-yellow-800 dark:text-yellow-200 mb-2'>
            Key Concepts:
          </h5>
          <div className='space-y-1 text-sm text-yellow-700 dark:text-yellow-300'>
            <div>• Compare numbers digit by digit from left to right</div>
            <div>• Start with the highest place value (leftmost digit)</div>
            <div>
              • The first position where digits differ determines which number
              is larger
            </div>
            <div>• If all digits are the same, the numbers are equal</div>
            <div>
              • Use &gt; (greater than), &lt; (less than), or = (equal to)
              symbols
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
