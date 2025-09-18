import { MathExpression, MathJaxProvider } from './MathExpression';

export function MathJaxTest() {
  const testExpressions = [
    '456 \\div 4 = 114 \\text{ (exactly)}',
    '17 \\div 5 = 3 \\text{ R } 2 \\text{ because } 3 \\times 5 + 2 = 17',
    '5 \\times 6 = 5 + 5 + 5 + 5 + 5 + 5 = 30',
    '0.25 = \\frac{2}{10} + \\frac{5}{100} = \\frac{25}{100} = \\frac{1}{4}',
  ];

  return (
    <MathJaxProvider>
      <div className='p-8 space-y-6'>
        <h2 className='text-2xl font-bold'>MathJax Test</h2>

        {testExpressions.map((expr, index) => (
          <div key={index} className='border p-4 rounded'>
            <h3 className='font-semibold mb-2'>Expression {index + 1}:</h3>
            <div className='mb-2 text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded'>
              {expr}
            </div>
            <div className='border-t pt-2'>
              <MathExpression>{expr}</MathExpression>
            </div>
          </div>
        ))}
      </div>
    </MathJaxProvider>
  );
}
