import { useState, useEffect } from 'react';
import { Printer, RefreshCw, Plus, Minus } from 'lucide-react';
import { drillGenerator } from '../lib/drill-generator';
import type { DrillSet, DigitSelection } from '../types';
import './drill-styles.css';

interface DrillsSectionProps {
  chapterId: string;
  chapterTitle: string;
}

export function DrillsSection({ chapterId, chapterTitle }: DrillsSectionProps) {
  const [selectedOperation, setSelectedOperation] = useState<
    'addition' | 'subtraction'
  >('addition');
  const [selectedDigits, setSelectedDigits] = useState<DigitSelection>('one');
  const [currentDrillSet, setCurrentDrillSet] = useState<DrillSet | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate initial drill set
  useEffect(() => {
    generateNewDrillSet(selectedOperation, selectedDigits);
  }, [chapterId, selectedOperation, selectedDigits]);

  const generateNewDrillSet = async (
    operation: 'addition' | 'subtraction',
    digits: DigitSelection
  ) => {
    setIsGenerating(true);
    try {
      // Add small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));
      const drillSet = drillGenerator.generateDrillSet(
        chapterId,
        operation,
        chapterTitle,
        digits
      );
      setCurrentDrillSet(drillSet);
    } catch (error) {
      console.error('Error generating drill set:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOperationChange = (operation: 'addition' | 'subtraction') => {
    setSelectedOperation(operation);
  };

  const handleDigitChange = (digits: DigitSelection) => {
    setSelectedDigits(digits);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRegenerate = () => {
    generateNewDrillSet(selectedOperation, selectedDigits);
  };

  if (isGenerating) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='flex items-center space-x-3'>
          <RefreshCw className='w-6 h-6 animate-spin text-purple-600' />
          <span className='text-lg text-gray-600 dark:text-gray-400'>
            Generating drill problems...
          </span>
        </div>
      </div>
    );
  }

  if (!currentDrillSet) {
    return (
      <div className='text-center py-12'>
        <p className='text-gray-600 dark:text-gray-400'>
          Unable to generate drill problems. Please try again.
        </p>
        <button
          onClick={() => generateNewDrillSet(selectedOperation, selectedDigits)}
          className='mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors'
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Controls - Hidden when printing */}
      <div className='print:hidden space-y-4'>
        <div className='flex flex-col gap-4'>
          {/* First Row: Operation and Digit Selection */}
          <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
            {/* Operation Selection */}
            <div className='flex items-center space-x-4'>
              <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Operation:
              </span>
              <div className='flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1'>
                <button
                  onClick={() => handleOperationChange('addition')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedOperation === 'addition'
                      ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Plus className='w-4 h-4' />
                  <span>Addition</span>
                </button>
                <button
                  onClick={() => handleOperationChange('subtraction')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedOperation === 'subtraction'
                      ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Minus className='w-4 h-4' />
                  <span>Subtraction</span>
                </button>
              </div>
            </div>

            {/* Digit Selection */}
            <div className='flex items-center space-x-4'>
              <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Difficulty:
              </span>
              <div className='flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1'>
                <button
                  onClick={() => handleDigitChange('one')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedDigits === 'one'
                      ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  1-Digit
                </button>
                <button
                  onClick={() => handleDigitChange('two')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedDigits === 'two'
                      ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  2-Digit
                </button>
                <button
                  onClick={() => handleDigitChange('three')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedDigits === 'three'
                      ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  3-Digit
                </button>
                <button
                  onClick={() => handleDigitChange('mixed')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedDigits === 'mixed'
                      ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  Mixed
                </button>
              </div>
            </div>
          </div>

          {/* Second Row: Action Buttons */}
          <div className='flex items-center justify-end space-x-3'>
            <button
              onClick={handleRegenerate}
              className='flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
            >
              <RefreshCw className='w-4 h-4' />
              <span>New Problems</span>
            </button>
            <button
              onClick={handlePrint}
              className='flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors'
            >
              <Printer className='w-4 h-4' />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Drill Worksheet */}
      <div className='drill-worksheet bg-white text-black'>
        {/* Header - Math Farm branding and student info */}
        <div className='drill-header mb-8'>
          <div className='text-center mb-6'>
            <h1 className='text-3xl font-bold text-purple-600 mb-2'>
              Math Farm
            </h1>
            <h2 className='text-xl font-semibold text-gray-800'>
              {currentDrillSet.title}
            </h2>
          </div>

          {/* Student Info Fields */}
          <div className='flex justify-between items-center border-b-2 border-gray-300 pb-4'>
            <div className='flex items-center space-x-8'>
              <div className='flex items-center space-x-2'>
                <span className='font-medium'>Name:</span>
                <div className='border-b border-gray-400 w-48 h-6'></div>
              </div>
              <div className='flex items-center space-x-2'>
                <span className='font-medium'>Date:</span>
                <div className='border-b border-gray-400 w-32 h-6'></div>
              </div>
            </div>
            <div className='flex items-center space-x-2'>
              <span className='font-medium'>Score:</span>
              <div className='border-b border-gray-400 w-20 h-6'></div>
              <span>/40</span>
            </div>
          </div>
        </div>

        {/* Problems Grid */}
        <div className='drill-grid grid grid-cols-5 gap-x-8 gap-y-6'>
          {currentDrillSet.problems.map((problem, index) => (
            <div key={problem.id} className='drill-problem text-center'>
              <div className='text-lg font-medium mb-2'>{index + 1}.</div>
              <div className='text-xl font-mono space-y-1'>
                <div className='text-right'>{problem.operand1}</div>
                <div className='text-right'>
                  {problem.operation === 'addition' ? '+' : '-'}{' '}
                  {problem.operand2}
                </div>
                <div className='border-t-2 border-gray-800 text-right pt-1'>
                  <div className='w-16 h-6 border-b border-gray-400 ml-auto'></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className='mt-12 text-center text-sm text-gray-600'>
          <p>Solve each problem and write your answer in the space provided.</p>
          <p>Show your work if needed.</p>
        </div>
      </div>
    </div>
  );
}
