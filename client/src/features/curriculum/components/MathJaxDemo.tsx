import { MathExpression, MathJaxProvider } from './MathExpression';

/**
 * Demo component to test MathJax integration with arithmetic expressions
 * This can be used to verify that MathJax is working correctly
 */
export function MathJaxDemo() {
  return (
    <MathJaxProvider>
      <div className='p-8 space-y-6 bg-white dark:bg-gray-800'>
        <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
          MathJax Integration Demo
        </h2>

        <div className='space-y-4'>
          <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200'>
            Inline Math Examples:
          </h3>

          <p className='text-gray-700 dark:text-gray-300'>
            Simple addition:{' '}
            <MathExpression inline={true}>2 + 3 = 5</MathExpression>
          </p>

          <p className='text-gray-700 dark:text-gray-300'>
            Fractions:{' '}
            <MathExpression inline={true}>
              \frac{1}
              {2} + \frac{1}
              {3} = \frac{5}
              {6}
            </MathExpression>
          </p>

          <p className='text-gray-700 dark:text-gray-300'>
            Multiplication:{' '}
            <MathExpression inline={true}>4 \times 7 = 28</MathExpression>
          </p>
        </div>

        <div className='space-y-4'>
          <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200'>
            Display Math Examples:
          </h3>

          <div className='bg-gray-50 dark:bg-gray-700 p-4 rounded'>
            <p className='text-gray-600 dark:text-gray-400 mb-2'>
              Place Value Expansion:
            </p>
            <MathExpression inline={false}>
              1,234 = 1 \times 10^3 + 2 \times 10^2 + 3 \times 10^1 + 4 \times
              10^0
            </MathExpression>
          </div>

          <div className='bg-gray-50 dark:bg-gray-700 p-4 rounded'>
            <p className='text-gray-600 dark:text-gray-400 mb-2'>
              Fraction Addition:
            </p>
            <MathExpression inline={false}>
              \frac{2}
              {5} + \frac{1}
              {5} = \frac{2 + 1}
              {5} = \frac{3}
              {5}
            </MathExpression>
          </div>

          <div className='bg-gray-50 dark:bg-gray-700 p-4 rounded'>
            <p className='text-gray-600 dark:text-gray-400 mb-2'>
              Decimal Operations:
            </p>
            <MathExpression inline={false}>12.34 + 5.67 = 18.01</MathExpression>
          </div>

          <div className='bg-gray-50 dark:bg-gray-700 p-4 rounded'>
            <p className='text-gray-600 dark:text-gray-400 mb-2'>Percentage:</p>
            <MathExpression inline={false}>
              25\% = \frac{25}
              {100} = 0.25
            </MathExpression>
          </div>

          <div className='bg-gray-50 dark:bg-gray-700 p-4 rounded'>
            <p className='text-gray-600 dark:text-gray-400 mb-2'>
              Long Division:
            </p>
            <MathExpression inline={false}>144 \div 12 = 12</MathExpression>
          </div>
        </div>

        <div className='space-y-4'>
          <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200'>
            Arithmetic-Specific Examples:
          </h3>

          <div className='bg-blue-50 dark:bg-blue-900/20 p-4 rounded'>
            <p className='text-blue-600 dark:text-blue-400 mb-2'>
              Step-by-step Solution:
            </p>
            <MathExpression inline={false}>
              {`\\begin{align}
              47 + 38 &= (40 + 7) + (30 + 8) \\\\
              &= (40 + 30) + (7 + 8) \\\\
              &= 70 + 15 \\\\
              &= 85
              \\end{align}`}
            </MathExpression>
          </div>

          <div className='bg-green-50 dark:bg-green-900/20 p-4 rounded'>
            <p className='text-green-600 dark:text-green-400 mb-2'>
              Place Value Chart:
            </p>
            <MathExpression inline={false}>
              {`\\begin{array}{|c|c|c|c|}
              \\hline
              \\text{Thousands} & \\text{Hundreds} & \\text{Tens} & \\text{Ones} \\\\
              \\hline
              5 & 4 & 3 & 2 \\\\
              \\hline
              \\end{array}`}
            </MathExpression>
          </div>
        </div>

        <div className='mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded'>
          <p className='text-yellow-800 dark:text-yellow-200 text-sm'>
            <strong>Note:</strong> If you see LaTeX code instead of rendered
            math, MathJax may still be loading or there might be a configuration
            issue.
          </p>
        </div>
      </div>
    </MathJaxProvider>
  );
}
