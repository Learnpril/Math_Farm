import { Printer, RefreshCw, Plus, Minus, FileCheck } from 'lucide-react';
import { useDrillContext } from '../contexts/DrillContext';
import type { DigitSelection } from '../types';
import './drill-styles.css';

export function DrillAnswersSection() {
  const {
    selectedOperation,
    selectedDigits,
    currentDrillSet,
    isGenerating,
    setSelectedOperation,
    setSelectedDigits,
    generateNewDrillSet,
  } = useDrillContext();

  const handleOperationChange = (operation: 'addition' | 'subtraction') => {
    setSelectedOperation(operation);
    generateNewDrillSet(operation, selectedDigits);
  };

  const handleDigitChange = (digits: DigitSelection) => {
    setSelectedDigits(digits);
    generateNewDrillSet(selectedOperation, digits);
  };

  const handlePrint = () => {
    if (!currentDrillSet) return;

    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    // Generate the HTML content for the answer key
    const answerHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Math Farm - ${currentDrillSet.title} - Answer Key</title>
          <style>
            @page {
              size: letter;
              margin: 0.5in;
              /* Remove browser headers and footers */
              @top-left { content: ""; }
              @top-center { content: ""; }
              @top-right { content: ""; }
              @bottom-left { content: ""; }
              @bottom-center { content: ""; }
              @bottom-right { content: ""; }
            }
            
            body {
              margin: 0;
              padding: 0.5in;
              font-family: Arial, sans-serif;
              background: white;
              color: black;
              width: 7.5in;
              height: 10in;
              box-sizing: border-box;
            }
            
            .drill-header {
              text-align: center;
              margin-bottom: 0.5rem;
            }
            
            .drill-header h1 {
              font-size: 24pt;
              color: #7c3aed;
              margin-bottom: 0.25rem;
            }
            
            .drill-header h2 {
              font-size: 16pt;
              color: black;
              margin-bottom: 1rem;
            }
            
            .student-info {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding-bottom: 0.25rem;
              margin-bottom: 0.25rem;
            }
            
            .student-info-left {
              display: flex;
              gap: 2rem;
            }
            
            .info-field {
              display: flex;
              align-items: center;
              gap: 0.5rem;
            }
            
            .info-line {
              border-bottom: 1px solid #9ca3af;
              height: 1.5rem;
              width: 3rem;
            }
            
            .name-line {
              width: 6rem;
            }
            
            .drill-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              grid-template-rows: repeat(5, 1fr);
              gap: 1rem 0.875rem;
              height: 7.25in;
            }
            
            .drill-problem {
              text-align: center;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              font-size: 12pt;
            }
            
            .problem-number {
              font-size: 12pt;
              font-weight: 600;
              margin-bottom: 0.375rem;
            }
            
            .problem-content {
              font-family: 'Courier New', monospace;
              font-size: 16pt;
              line-height: 1.1;
            }
            
            .operand {
              text-align: right;
              margin-bottom: 0.25rem;
            }
            
            .answer-line {
              border-top: 2px solid black;
              padding-top: 0.25rem;
              text-align: right;
              height: 1.5rem;
              width: 3rem;
              margin: 0 auto;
              color: #dc2626;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="drill-header">
            <h1>Math Farm</h1>
            <h2>${currentDrillSet.title} - Answer Key</h2>
          </div>
          
          <div class="student-info">
            <div class="student-info-left">
              <div class="info-field">
                <span>Name:</span>
                <div class="info-line name-line"></div>
              </div>
              <div class="info-field">
                <span>Date:</span>
                <div class="info-line"></div>
              </div>
            </div>
            <div class="info-field">
              <span>Score:</span>
              <div class="info-line"></div>
              <span>/20</span>
            </div>
          </div>
          
          <div class="drill-grid">
            ${currentDrillSet.problems
              .map(
                (problem, index) => `
              <div class="drill-problem">
                <div class="problem-number">${index + 1}.</div>
                <div class="problem-content">
                  <div class="operand">${problem.operand1}</div>
                  <div class="operand">${problem.operation === 'addition' ? '+' : '-'} ${problem.operand2}</div>
                  <div class="answer-line">${problem.answer}</div>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </body>
      </html>
    `;

    // Write the HTML to the new window
    printWindow.document.write(answerHTML);
    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const handleRegenerate = () => {
    generateNewDrillSet();
  };

  if (isGenerating) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='flex items-center space-x-3'>
          <RefreshCw className='w-6 h-6 animate-spin text-purple-600' />
          <span className='text-lg text-gray-600 dark:text-gray-400'>
            Generating answer key...
          </span>
        </div>
      </div>
    );
  }

  if (!currentDrillSet) {
    return (
      <div className='text-center py-12'>
        <p className='text-gray-600 dark:text-gray-400'>
          Unable to generate answer key. Please try again.
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

        {/* Info Banner */}
        <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4'>
          <div className='flex items-start space-x-3'>
            <FileCheck className='w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5' />
            <div>
              <h3 className='text-sm font-medium text-blue-900 dark:text-blue-100'>
                Answer Key
              </h3>
              <p className='text-sm text-blue-700 dark:text-blue-300 mt-1'>
                This sheet shows the exact same problems as the drill worksheet
                with answers provided. The problems are synchronized - when you
                generate new problems in the Drills section, this answer key
                will automatically update to match.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Answer Sheet */}
      <div className='drill-worksheet bg-white text-black'>
        {/* Header - Math Farm branding and student info */}
        <div className='drill-header mb-4'>
          <div className='text-center mb-6'>
            <h1 className='text-3xl font-bold text-purple-600 mb-2'>
              Math Farm
            </h1>
            <h2 className='text-xl font-semibold text-gray-800'>
              {currentDrillSet.title} - Answer Key
            </h2>
          </div>

          {/* Student Info Fields */}
          <div className='flex justify-between items-center pb-2'>
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
              <span>/20</span>
            </div>
          </div>
        </div>

        {/* Problems Grid with Answers */}
        <div className='drill-grid grid grid-cols-4 gap-x-8 gap-y-6'>
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
                  <div className='text-lg font-bold text-red-600'>
                    {problem.answer}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
