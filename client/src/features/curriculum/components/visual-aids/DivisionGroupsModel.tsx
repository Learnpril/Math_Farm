import { useState } from 'react';

interface DivisionGroupsModelProps {
  dividend?: number;
  divisor?: number;
  interactive?: boolean;
  className?: string;
}

export function DivisionGroupsModel({
  dividend = 24,
  divisor = 6,
  interactive = false,
  className = '',
}: DivisionGroupsModelProps) {
  const [showRemainder, setShowRemainder] = useState(false);

  const quotient = Math.floor(dividend / divisor);
  const remainder = dividend % divisor;

  const renderGroups = () => {
    const groups = [];
    let itemsUsed = 0;

    // Create complete groups
    for (let g = 0; g < quotient; g++) {
      const groupItems = [];
      for (let i = 0; i < divisor; i++) {
        groupItems.push(
          <div key={`${g}-${i}`} className='w-4 h-4 bg-blue-500 rounded-full' />
        );
        itemsUsed++;
      }

      groups.push(
        <div
          key={g}
          className='flex flex-wrap gap-1 p-3 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg bg-blue-50 dark:bg-blue-900/20'
        >
          {groupItems}
        </div>
      );
    }

    return { groups, itemsUsed };
  };

  const renderRemainder = () => {
    if (remainder === 0) return null;

    const remainderItems = [];
    for (let i = 0; i < remainder; i++) {
      remainderItems.push(
        <div
          key={`remainder-${i}`}
          className='w-4 h-4 bg-red-500 rounded-full'
        />
      );
    }

    return (
      <div className='flex flex-wrap gap-1 p-3 border-2 border-dashed border-red-300 dark:border-red-600 rounded-lg bg-red-50 dark:bg-red-900/20'>
        <div className='w-full text-xs text-red-700 dark:text-red-300 font-medium mb-1'>
          Remainder: {remainder}
        </div>
        {remainderItems}
      </div>
    );
  };

  const { groups } = renderGroups();

  return (
    <div
      className={`division-groups bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      <h4 className='text-lg font-semibold mb-4 text-center text-gray-800 dark:text-gray-200'>
        Division as Equal Groups: {dividend} ÷ {divisor}
      </h4>

      <div className='space-y-6'>
        {/* Problem Statement */}
        <div className='text-center bg-gray-50 dark:bg-gray-700 rounded-lg p-4'>
          <div className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
            How many groups of {divisor} can we make from {dividend} items?
          </div>
          <div className='text-xl font-bold text-purple-700 dark:text-purple-300'>
            {dividend} ÷ {divisor} = {quotient}
            {remainder > 0 ? ` R${remainder}` : ''}
          </div>
        </div>

        {/* Visual Groups */}
        <div className='space-y-4'>
          <h5 className='font-medium text-gray-700 dark:text-gray-300'>
            Groups of {divisor}:
          </h5>

          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {groups}
          </div>

          {/* Remainder Section */}
          {remainder > 0 && (
            <div className='space-y-2'>
              <h5 className='font-medium text-gray-700 dark:text-gray-300'>
                Items that don't fit in a complete group:
              </h5>
              {renderRemainder()}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className='bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4'>
          <h5 className='font-medium text-green-800 dark:text-green-200 mb-2'>
            Summary:
          </h5>
          <div className='space-y-1 text-sm text-green-700 dark:text-green-300'>
            <div>
              • We can make {quotient} complete groups of {divisor}
            </div>
            <div>• Each group has exactly {divisor} items</div>
            {remainder > 0 && (
              <div>• {remainder} items are left over (remainder)</div>
            )}
            <div className='font-medium mt-2'>
              Check: {quotient} × {divisor}
              {remainder > 0 ? ` + ${remainder}` : ''} ={' '}
              {quotient * divisor + remainder}
            </div>
          </div>
        </div>

        {/* Interactive Controls */}
        {interactive && (
          <div className='flex justify-center'>
            <button
              onClick={() => setShowRemainder(!showRemainder)}
              className='px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors'
            >
              {showRemainder ? 'Hide' : 'Show'} Remainder Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
