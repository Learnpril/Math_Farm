import { useState } from 'react';

interface RatioVisualizerProps {
  ratio1?: number;
  ratio2?: number;
  total?: number;
  interactive?: boolean;
  className?: string;
}

export function RatioVisualizer({
  ratio1 = 3,
  ratio2 = 5,
  total = 40,
  interactive = false,
  className = '',
}: RatioVisualizerProps) {
  const [selectedRatio, setSelectedRatio] = useState({ ratio1, ratio2 });
  const [selectedTotal, setSelectedTotal] = useState(total);

  const totalParts = selectedRatio.ratio1 + selectedRatio.ratio2;
  const valuePerPart = selectedTotal / totalParts;
  const amount1 = Math.round(selectedRatio.ratio1 * valuePerPart);
  const amount2 = Math.round(selectedRatio.ratio2 * valuePerPart);

  const renderBars = () => {
    const bar1Width = (amount1 / selectedTotal) * 100;
    const bar2Width = (amount2 / selectedTotal) * 100;

    return (
      <div className='space-y-4'>
        {/* Combined Bar */}
        <div className='space-y-2'>
          <div className='text-sm font-medium text-gray-700 dark:text-gray-300'>
            Total: {selectedTotal}
          </div>
          <div className='flex h-12 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600'>
            <div
              className='bg-blue-500 flex items-center justify-center text-white text-sm font-medium'
              style={{ width: `${bar1Width}%` }}
            >
              {amount1}
            </div>
            <div
              className='bg-red-500 flex items-center justify-center text-white text-sm font-medium'
              style={{ width: `${bar2Width}%` }}
            >
              {amount2}
            </div>
          </div>
        </div>

        {/* Individual Bars */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <div className='text-sm font-medium text-blue-700 dark:text-blue-300'>
              Part 1: {selectedRatio.ratio1} parts
            </div>
            <div className='h-8 bg-blue-500 rounded flex items-center justify-center text-white text-sm font-medium'>
              {amount1}
            </div>
          </div>
          <div className='space-y-2'>
            <div className='text-sm font-medium text-red-700 dark:text-red-300'>
              Part 2: {selectedRatio.ratio2} parts
            </div>
            <div className='h-8 bg-red-500 rounded flex items-center justify-center text-white text-sm font-medium'>
              {amount2}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDots = () => {
    const dots1 = Array.from({ length: amount1 }, (_, i) => (
      <div key={`blue-${i}`} className='w-3 h-3 bg-blue-500 rounded-full' />
    ));

    const dots2 = Array.from({ length: amount2 }, (_, i) => (
      <div key={`red-${i}`} className='w-3 h-3 bg-red-500 rounded-full' />
    ));

    return (
      <div className='grid grid-cols-2 gap-6'>
        <div className='space-y-2'>
          <div className='text-sm font-medium text-blue-700 dark:text-blue-300'>
            Group 1: {amount1} items
          </div>
          <div className='flex flex-wrap gap-1 p-3 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg bg-blue-50 dark:bg-blue-900/20 min-h-[60px]'>
            {dots1}
          </div>
        </div>
        <div className='space-y-2'>
          <div className='text-sm font-medium text-red-700 dark:text-red-300'>
            Group 2: {amount2} items
          </div>
          <div className='flex flex-wrap gap-1 p-3 border-2 border-dashed border-red-300 dark:border-red-600 rounded-lg bg-red-50 dark:bg-red-900/20 min-h-[60px]'>
            {dots2}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`ratio-visualizer bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      <h4 className='text-lg font-semibold mb-4 text-center text-gray-800 dark:text-gray-200'>
        Ratio Visualizer: {selectedRatio.ratio1}:{selectedRatio.ratio2}
      </h4>

      <div className='space-y-6'>
        {/* Ratio Information */}
        <div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-4'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-center'>
            <div>
              <div className='text-2xl font-bold text-purple-700 dark:text-purple-300'>
                {selectedRatio.ratio1}:{selectedRatio.ratio2}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                Ratio
              </div>
            </div>
            <div>
              <div className='text-2xl font-bold text-blue-700 dark:text-blue-300'>
                {totalParts}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                Total Parts
              </div>
            </div>
            <div>
              <div className='text-2xl font-bold text-green-700 dark:text-green-300'>
                {valuePerPart.toFixed(1)}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                Per Part
              </div>
            </div>
            <div>
              <div className='text-2xl font-bold text-orange-700 dark:text-orange-300'>
                {selectedTotal}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                Total
              </div>
            </div>
          </div>
        </div>

        {/* Bar Visualization */}
        <div className='space-y-3'>
          <h5 className='font-medium text-gray-700 dark:text-gray-300'>
            Bar Model:
          </h5>
          {renderBars()}
        </div>

        {/* Dot Visualization */}
        <div className='space-y-3'>
          <h5 className='font-medium text-gray-700 dark:text-gray-300'>
            Group Model:
          </h5>
          {renderDots()}
        </div>

        {/* Calculation Breakdown */}
        <div className='bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4'>
          <h5 className='font-medium text-yellow-800 dark:text-yellow-200 mb-2'>
            Calculation:
          </h5>
          <div className='space-y-1 text-sm text-yellow-700 dark:text-yellow-300'>
            <div>
              1. Total parts in ratio: {selectedRatio.ratio1} +{' '}
              {selectedRatio.ratio2} = {totalParts}
            </div>
            <div>
              2. Value per part: {selectedTotal} ÷ {totalParts} ={' '}
              {valuePerPart.toFixed(1)}
            </div>
            <div>
              3. Part 1: {selectedRatio.ratio1} × {valuePerPart.toFixed(1)} ={' '}
              {amount1}
            </div>
            <div>
              4. Part 2: {selectedRatio.ratio2} × {valuePerPart.toFixed(1)} ={' '}
              {amount2}
            </div>
            <div className='font-medium pt-1 border-t border-yellow-300 dark:border-yellow-700'>
              Check: {amount1} + {amount2} = {amount1 + amount2}
            </div>
          </div>
        </div>

        {/* Interactive Controls */}
        {interactive && (
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Ratio (a:b)
                </label>
                <div className='flex gap-2'>
                  <input
                    type='number'
                    min='1'
                    max='20'
                    value={selectedRatio.ratio1}
                    onChange={e =>
                      setSelectedRatio(prev => ({
                        ...prev,
                        ratio1: parseInt(e.target.value) || 1,
                      }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  />
                  <span className='flex items-center text-gray-500'>:</span>
                  <input
                    type='number'
                    min='1'
                    max='20'
                    value={selectedRatio.ratio2}
                    onChange={e =>
                      setSelectedRatio(prev => ({
                        ...prev,
                        ratio2: parseInt(e.target.value) || 1,
                      }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  />
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Total Amount
                </label>
                <input
                  type='number'
                  min='1'
                  max='100'
                  value={selectedTotal}
                  onChange={e =>
                    setSelectedTotal(parseInt(e.target.value) || 1)
                  }
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
