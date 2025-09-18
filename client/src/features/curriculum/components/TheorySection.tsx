import { TheoryConcept } from '../types';
import { MathExpression } from './MathExpression';

interface TheorySectionProps {
  concepts: TheoryConcept[];
}

export function TheorySection({ concepts }: TheorySectionProps) {
  return (
    <div className='space-y-8'>
      <div className='prose prose-purple max-w-none dark:prose-invert'>
        <h3 className='text-xl font-semibold mb-6'>Core Concepts</h3>

        {concepts.map((concept, index) => (
          <div
            key={index}
            className='mb-8 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg'
          >
            <h4 className='text-lg font-medium mb-4 text-purple-700 dark:text-purple-300'>
              {concept.title}
            </h4>

            <p className='text-gray-700 dark:text-gray-300 mb-4'>
              {concept.content}
            </p>

            {concept.latex && (
              <div className='bg-white dark:bg-gray-800 p-4 rounded border-l-4 border-purple-500 mb-4'>
                <MathExpression inline={false} className='text-xl'>
                  {concept.latex}
                </MathExpression>
              </div>
            )}

            {concept.visuals.length > 0 && (
              <div className='mt-4'>
                <h5 className='font-medium mb-2'>Visual Aids:</h5>
                <div className='flex flex-wrap gap-2'>
                  {concept.visuals.map((visual, vIndex) => (
                    <span
                      key={vIndex}
                      className='px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm'
                    >
                      {visual}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className='bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4'>
        <h4 className='font-medium text-yellow-800 dark:text-yellow-200 mb-2'>
          📝 Take Your Time
        </h4>
        <p className='text-yellow-700 dark:text-yellow-300 text-sm'>
          Don't rush through the theory. Make sure you understand each concept
          before moving on to examples. Use the interactive tools to explore and
          experiment with the ideas.
        </p>
      </div>
    </div>
  );
}
