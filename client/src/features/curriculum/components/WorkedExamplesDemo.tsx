import { WorkedExamples } from './WorkedExamples';
import { WorkedExample } from '../types';

const demoExamples: WorkedExample[] = [
  {
    problem: 'Write 4,567 in expanded form',
    solution: '4,567 = 4,000 + 500 + 60 + 7',
    steps: [
      'Identify the place value of each digit',
      '4 is in the thousands place: 4 × 1,000 = 4,000',
      '5 is in the hundreds place: 5 × 100 = 500',
      '6 is in the tens place: 6 × 10 = 60',
      '7 is in the ones place: 7 × 1 = 7',
      'Add all the place values together',
    ],
    commonErrors: [
      'Forgetting to include zeros in place values',
      'Misidentifying which place value a digit occupies',
      'Writing 4567 instead of 4,567 (missing comma)',
    ],
    latex:
      '4,567 = 4 \\times 1000 + 5 \\times 100 + 6 \\times 10 + 7 \\times 1',
  },
  {
    problem: 'Compare 12,345 and 12,354. Which is larger?',
    solution: '12,354 is larger than 12,345',
    steps: [
      'Line up the numbers by place value',
      'Compare from left to right: ten thousands place - both have 1',
      'Thousands place - both have 2',
      'Hundreds place - both have 3',
      'Tens place - first number has 4, second has 5',
      'Since 5 > 4 in the tens place, 12,354 > 12,345',
    ],
    commonErrors: [
      'Comparing from right to left instead of left to right',
      'Not aligning numbers properly by place value',
      'Confusing the inequality symbols < and >',
    ],
  },
  {
    problem: 'Solve: 2x + 5 = 13',
    solution: 'x = 4',
    steps: [
      'Subtract 5 from both sides: 2x + 5 - 5 = 13 - 5',
      'Simplify: 2x = 8',
      'Divide both sides by 2: 2x ÷ 2 = 8 ÷ 2',
      'Simplify: x = 4',
      'Check: 2(4) + 5 = 8 + 5 = 13 ✓',
    ],
    commonErrors: [
      'Forgetting to perform the same operation on both sides',
      'Making arithmetic errors during simplification',
      'Not checking the answer by substituting back',
    ],
    latex: '2x + 5 = 13',
  },
];

export function WorkedExamplesDemo() {
  return (
    <div className='max-w-4xl mx-auto p-6'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-4'>
          WorkedExamples Component Demo
        </h1>
        <p className='text-gray-600 dark:text-gray-400'>
          This demo shows the enhanced WorkedExamples component with
          step-by-step reveal functionality.
        </p>
      </div>

      <WorkedExamples examples={demoExamples} />

      <div className='mt-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg'>
        <h3 className='font-medium text-green-800 dark:text-green-200 mb-2'>
          ✅ Features Implemented
        </h3>
        <ul className='list-disc list-inside space-y-1 text-green-700 dark:text-green-300 text-sm'>
          <li>
            <strong>Step-by-step reveal:</strong> Click "Start" then "Next Step"
            to reveal one step at a time
          </li>
          <li>
            <strong>Show All:</strong> Reveal all steps at once when you need
            the complete solution
          </li>
          <li>
            <strong>Hide All:</strong> Hide all steps to test yourself
          </li>
          <li>
            <strong>Replay:</strong> Reset the reveal process to practice again
          </li>
          <li>
            <strong>Smooth animations:</strong> Steps appear with fade-in and
            slide animations
          </li>
          <li>
            <strong>Progress indication:</strong> Shows remaining steps count
          </li>
          <li>
            <strong>Visual feedback:</strong> Highlighting and pulse animation
            for newly revealed steps
          </li>
          <li>
            <strong>State management:</strong> Each example maintains its own
            reveal state
          </li>
        </ul>
      </div>
    </div>
  );
}
