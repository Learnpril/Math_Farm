import { ReadingSection } from './TheorySection';
import { MathJaxProvider } from './MathExpression';
import { TheoryConcept } from '../types/curriculum';

const sampleConcepts: TheoryConcept[] = [
  {
    title: 'The Base-10 Number System',
    content:
      'Our number system is based on groups of 10. Each position in a number represents a different power of 10. Moving from right to left, each position is 10 times larger than the previous one.',
    latex:
      '1,234 = 1 \\times 10^3 + 2 \\times 10^2 + 3 \\times 10^1 + 4 \\times 10^0',
    visuals: ['place-value-chart', 'base-10-blocks'],
  },
  {
    title: 'Place Value Positions',
    content:
      'Each digit in a number has a specific place value: ones, tens, hundreds, thousands, ten thousands, hundred thousands, and millions. The value of a digit depends on its position.',
    latex:
      '\\text{Millions} \\quad \\text{Hundred Thousands} \\quad \\text{Ten Thousands} \\quad \\text{Thousands} \\quad \\text{Hundreds} \\quad \\text{Tens} \\quad \\text{Ones}',
    visuals: ['place-value-chart', 'number-line'],
  },
  {
    title: 'Expanded Form',
    content:
      'Expanded form shows the value of each digit in a number. It helps us understand what each digit contributes to the total value of the number.',
    latex: '45,678 = 40,000 + 5,000 + 600 + 70 + 8',
    visuals: ['expanded-form-diagram'],
  },
  {
    title: 'Comparing Numbers',
    content:
      'To compare numbers, start from the leftmost digit and compare place by place. The first position where digits differ determines which number is larger.',
    visuals: ['comparison-chart', 'number-line'],
  },
];

export function ReadingSectionDemo() {
  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-8'>
      <div className='max-w-4xl mx-auto px-4'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
            Enhanced Reading Section Demo
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Demonstrating the enhanced Reading section component with interactive
            visual aids and MathJax support.
          </p>
        </div>

        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6'>
          <MathJaxProvider>
            <ReadingSection concepts={sampleConcepts} chapterNumber={1} />
          </MathJaxProvider>
        </div>

        <div className='mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
          <h3 className='font-semibold text-blue-900 dark:text-blue-100 mb-2'>
            Features Demonstrated:
          </h3>
          <ul className='text-sm text-blue-800 dark:text-blue-200 space-y-1'>
            <li>• Enhanced visual design with gradients and better spacing</li>
            <li>• Interactive visual aids that expand/collapse on click</li>
            <li>• MathJax integration for mathematical expressions</li>
            <li>• Responsive design that works on all screen sizes</li>
            <li>• Accessibility features with proper ARIA labels</li>
            <li>• Dark mode support throughout</li>
            <li>• Progressive disclosure of complex visual content</li>
            <li>• Context-aware sample data based on chapter number</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
