import { AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import { CommonPitfalls } from '../types';

interface CommonPitfallsSectionProps {
  pitfalls: CommonPitfalls;
}

export function CommonPitfallsSection({
  pitfalls,
}: CommonPitfallsSectionProps) {
  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-2 mb-6'>
        <AlertTriangle className='h-6 w-6 text-amber-600' />
        <h2 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
          {pitfalls.title}
        </h2>
      </div>

      <div className='space-y-6'>
        {pitfalls.pitfalls.map((pitfall, index) => (
          <div
            key={index}
            className='bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6'
          >
            <div className='flex items-start gap-3'>
              <AlertTriangle className='h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0' />
              <div className='space-y-4 flex-1'>
                <div>
                  <h3 className='font-semibold text-amber-900 dark:text-amber-100 mb-2'>
                    Common Mistake #{index + 1}
                  </h3>
                  <p className='text-amber-800 dark:text-amber-200 font-medium'>
                    {pitfall.misconception}
                  </p>
                </div>

                <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3'>
                  <p className='text-sm font-medium text-red-800 dark:text-red-200 mb-1'>
                    ❌ Incorrect Example:
                  </p>
                  <p className='text-red-700 dark:text-red-300 font-mono text-sm'>
                    {pitfall.example}
                  </p>
                </div>

                <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3'>
                  <p className='text-sm font-medium text-blue-800 dark:text-blue-200 mb-1'>
                    💡 Why This Happens:
                  </p>
                  <p className='text-blue-700 dark:text-blue-300 text-sm'>
                    {pitfall.explanation}
                  </p>
                </div>

                <div className='bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3'>
                  <div className='flex items-start gap-2'>
                    <CheckCircle className='h-4 w-4 text-green-600 mt-0.5 flex-shrink-0' />
                    <div>
                      <p className='text-sm font-medium text-green-800 dark:text-green-200 mb-1'>
                        ✅ How to Fix It:
                      </p>
                      <p className='text-green-700 dark:text-green-300 text-sm'>
                        {pitfall.correction}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pitfalls.preventionStrategies.length > 0 && (
        <div className='bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6'>
          <div className='flex items-center gap-2 mb-4'>
            <Lightbulb className='h-5 w-5 text-purple-600' />
            <h3 className='font-semibold text-purple-900 dark:text-purple-100'>
              Prevention Strategies
            </h3>
          </div>
          <ul className='space-y-2'>
            {pitfalls.preventionStrategies.map((strategy, index) => (
              <li
                key={index}
                className='flex items-start gap-2 text-purple-800 dark:text-purple-200'
              >
                <span className='text-purple-600 font-bold mt-0.5'>•</span>
                <span className='text-sm'>{strategy}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
