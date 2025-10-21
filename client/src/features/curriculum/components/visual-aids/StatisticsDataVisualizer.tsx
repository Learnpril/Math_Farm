/**
 * StatisticsDataVisualizer - Interactive tool for exploring basic statistics concepts
 * Specifically designed for Pre-Algebra Chapter 7: Data and Statistics Basics
 */

import React, { useState } from 'react';

interface StatisticsDataVisualizerProps {
  className?: string;
  showCalculations?: boolean;
}

interface DataSet {
  values: number[];
  mean: number;
  median: number;
  mode: number[];
  range: number;
}

export const StatisticsDataVisualizer: React.FC<
  StatisticsDataVisualizerProps
> = ({ className = '', showCalculations = true }) => {
  const [dataInput, setDataInput] = useState('2, 4, 4, 6, 8, 8, 8, 10, 12');
  const [dataSet, setDataSet] = useState<DataSet>({
    values: [2, 4, 4, 6, 8, 8, 8, 10, 12],
    mean: 6.89,
    median: 8,
    mode: [8],
    range: 10,
  });

  const [chartType, setChartType] = useState<'bar' | 'dot' | 'histogram'>(
    'bar'
  );

  const calculateStatistics = (values: number[]): DataSet => {
    if (values.length === 0) {
      return { values: [], mean: 0, median: 0, mode: [], range: 0 };
    }

    // Sort values
    const sorted = [...values].sort((a, b) => a - b);

    // Mean
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;

    // Median
    let median: number;
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      median = (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
      median = sorted[mid];
    }

    // Mode
    const frequency: { [key: number]: number } = {};
    values.forEach(val => {
      frequency[val] = (frequency[val] || 0) + 1;
    });

    const maxFreq = Math.max(...Object.values(frequency));
    const mode = Object.keys(frequency)
      .filter(key => frequency[Number(key)] === maxFreq)
      .map(Number);

    // Range
    const range = sorted[sorted.length - 1] - sorted[0];

    return { values: sorted, mean, median, mode, range };
  };

  const updateData = (input: string) => {
    setDataInput(input);
    try {
      const values = input
        .split(',')
        .map(s => s.trim())
        .filter(s => s !== '')
        .map(Number)
        .filter(n => !isNaN(n));

      if (values.length > 0) {
        setDataSet(calculateStatistics(values));
      }
    } catch (error) {
      console.error('Error parsing data:', error);
    }
  };

  const getFrequency = () => {
    const frequency: { [key: number]: number } = {};
    dataSet.values.forEach(val => {
      frequency[val] = (frequency[val] || 0) + 1;
    });
    return frequency;
  };

  const renderBarChart = () => {
    const frequency = getFrequency();
    const maxFreq = Math.max(...Object.values(frequency));
    const values = Object.keys(frequency)
      .map(Number)
      .sort((a, b) => a - b);

    const barWidth = Math.min(40, 300 / values.length);
    const chartHeight = 200;
    const chartWidth = values.length * (barWidth + 10) + 20;

    return (
      <svg
        width={Math.max(chartWidth, 300)}
        height={chartHeight + 60}
        className='border border-gray-300 dark:border-gray-600 rounded'
      >
        {values.map((value, index) => {
          const freq = frequency[value];
          const barHeight = (freq / maxFreq) * (chartHeight - 40);
          const x = 20 + index * (barWidth + 10);
          const y = chartHeight - barHeight - 20;

          return (
            <g key={value}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill='#3b82f6'
                className='hover:fill-blue-600'
              />
              <text
                x={x + barWidth / 2}
                y={chartHeight - 5}
                textAnchor='middle'
                className='text-xs fill-current text-gray-700 dark:text-gray-300'
              >
                {value}
              </text>
              <text
                x={x + barWidth / 2}
                y={y - 5}
                textAnchor='middle'
                className='text-xs fill-current text-gray-700 dark:text-gray-300'
              >
                {freq}
              </text>
            </g>
          );
        })}

        {/* Y-axis label */}
        <text
          x='10'
          y='20'
          className='text-xs fill-current text-gray-600 dark:text-gray-400'
        >
          Frequency
        </text>

        {/* X-axis label */}
        <text
          x={chartWidth / 2}
          y={chartHeight + 40}
          textAnchor='middle'
          className='text-xs fill-current text-gray-600 dark:text-gray-400'
        >
          Values
        </text>
      </svg>
    );
  };

  const renderDotPlot = () => {
    const frequency = getFrequency();
    const values = Object.keys(frequency)
      .map(Number)
      .sort((a, b) => a - b);
    const maxFreq = Math.max(...Object.values(frequency));

    const dotSize = 8;
    const spacing = 25;
    const chartWidth = values.length * spacing + 40;
    const chartHeight = maxFreq * (dotSize + 2) + 60;

    return (
      <svg
        width={Math.max(chartWidth, 300)}
        height={chartHeight}
        className='border border-gray-300 dark:border-gray-600 rounded'
      >
        {values.map((value, valueIndex) => {
          const freq = frequency[value];
          const x = 20 + valueIndex * spacing;

          return (
            <g key={value}>
              {/* Draw dots stacked vertically */}
              {Array.from({ length: freq }, (_, dotIndex) => (
                <circle
                  key={dotIndex}
                  cx={x}
                  cy={chartHeight - 30 - dotIndex * (dotSize + 2)}
                  r={dotSize / 2}
                  fill='#22c55e'
                  className='hover:fill-green-600'
                />
              ))}

              {/* Value label */}
              <text
                x={x}
                y={chartHeight - 10}
                textAnchor='middle'
                className='text-xs fill-current text-gray-700 dark:text-gray-300'
              >
                {value}
              </text>
            </g>
          );
        })}

        {/* X-axis label */}
        <text
          x={chartWidth / 2}
          y={chartHeight - 5}
          textAnchor='middle'
          className='text-xs fill-current text-gray-600 dark:text-gray-400'
        >
          Values
        </text>
      </svg>
    );
  };

  const renderHistogram = () => {
    // Group data into bins
    const min = Math.min(...dataSet.values);
    const max = Math.max(...dataSet.values);
    const binCount = Math.min(
      8,
      Math.max(3, Math.ceil(Math.sqrt(dataSet.values.length)))
    );
    const binWidth = (max - min) / binCount;

    const bins = Array.from({ length: binCount }, (_, i) => ({
      start: min + i * binWidth,
      end: min + (i + 1) * binWidth,
      count: 0,
    }));

    dataSet.values.forEach(value => {
      const binIndex = Math.min(
        Math.floor((value - min) / binWidth),
        binCount - 1
      );
      bins[binIndex].count++;
    });

    const maxCount = Math.max(...bins.map(bin => bin.count));
    const chartHeight = 200;
    const chartWidth = 400;
    const barWidth = (chartWidth - 40) / binCount;

    return (
      <svg
        width={chartWidth}
        height={chartHeight + 60}
        className='border border-gray-300 dark:border-gray-600 rounded'
      >
        {bins.map((bin, index) => {
          const barHeight = (bin.count / maxCount) * (chartHeight - 40);
          const x = 20 + index * barWidth;
          const y = chartHeight - barHeight - 20;

          return (
            <g key={index}>
              <rect
                x={x}
                y={y}
                width={barWidth - 2}
                height={barHeight}
                fill='#a855f7'
                stroke='#ffffff'
                strokeWidth='1'
                className='hover:fill-purple-600'
              />
              <text
                x={x + barWidth / 2}
                y={chartHeight - 5}
                textAnchor='middle'
                className='text-xs fill-current text-gray-700 dark:text-gray-300'
              >
                {bin.start.toFixed(1)}
              </text>
              <text
                x={x + barWidth / 2}
                y={y - 5}
                textAnchor='middle'
                className='text-xs fill-current text-gray-700 dark:text-gray-300'
              >
                {bin.count}
              </text>
            </g>
          );
        })}

        {/* Labels */}
        <text
          x='10'
          y='20'
          className='text-xs fill-current text-gray-600 dark:text-gray-400'
        >
          Frequency
        </text>
        <text
          x={chartWidth / 2}
          y={chartHeight + 40}
          textAnchor='middle'
          className='text-xs fill-current text-gray-600 dark:text-gray-400'
        >
          Value Ranges
        </text>
      </svg>
    );
  };

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return renderBarChart();
      case 'dot':
        return renderDotPlot();
      case 'histogram':
        return renderHistogram();
      default:
        return renderBarChart();
    }
  };

  const exampleDataSets = [
    { name: 'Test Scores', data: '85, 92, 78, 95, 88, 82, 90, 87, 93, 79' },
    { name: 'Heights (inches)', data: '60, 62, 64, 64, 66, 68, 68, 70, 72' },
    {
      name: 'Daily Temperature',
      data: '72, 75, 73, 78, 80, 77, 74, 76, 79, 81',
    },
    { name: 'Simple Dataset', data: '1, 2, 2, 3, 3, 3, 4, 4, 5' },
  ];

  return (
    <div
      className={`p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
          Statistics Data Visualizer
        </h3>
        <p className='text-sm text-gray-600 dark:text-gray-300'>
          Enter your data to calculate mean, median, mode, and range. Visualize
          the data with different chart types.
        </p>
      </div>

      {/* Data Input */}
      <div className='mb-6'>
        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
          Enter Data (comma-separated numbers):
        </label>
        <textarea
          value={dataInput}
          onChange={e => updateData(e.target.value)}
          className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
          rows={2}
          placeholder='2, 4, 6, 8, 10, 12'
        />

        {/* Example datasets */}
        <div className='mt-2 flex flex-wrap gap-2'>
          {exampleDataSets.map((example, index) => (
            <button
              key={index}
              onClick={() => updateData(example.data)}
              className='px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors'
            >
              {example.name}
            </button>
          ))}
        </div>
      </div>

      <div className='grid lg:grid-cols-2 gap-6'>
        {/* Statistics Results */}
        <div>
          <h4 className='text-md font-medium text-gray-900 dark:text-white mb-4'>
            Statistical Measures:
          </h4>

          <div className='space-y-4'>
            {/* Mean */}
            <div className='p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
              <div className='flex justify-between items-center'>
                <div>
                  <div className='text-sm font-medium text-blue-700 dark:text-blue-300'>
                    Mean (Average)
                  </div>
                  <div className='text-2xl font-bold text-blue-900 dark:text-blue-100'>
                    {dataSet.mean.toFixed(2)}
                  </div>
                </div>
                <div className='text-blue-600 dark:text-blue-400 text-2xl'>
                  📊
                </div>
              </div>
              {showCalculations && (
                <div className='mt-2 text-xs text-blue-600 dark:text-blue-400'>
                  Sum: {dataSet.values.reduce((sum, val) => sum + val, 0)} ÷
                  Count: {dataSet.values.length}
                </div>
              )}
            </div>

            {/* Median */}
            <div className='p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg'>
              <div className='flex justify-between items-center'>
                <div>
                  <div className='text-sm font-medium text-green-700 dark:text-green-300'>
                    Median (Middle)
                  </div>
                  <div className='text-2xl font-bold text-green-900 dark:text-green-100'>
                    {dataSet.median}
                  </div>
                </div>
                <div className='text-green-600 dark:text-green-400 text-2xl'>
                  📍
                </div>
              </div>
              {showCalculations && (
                <div className='mt-2 text-xs text-green-600 dark:text-green-400'>
                  Sorted: [{dataSet.values.join(', ')}]
                </div>
              )}
            </div>

            {/* Mode */}
            <div className='p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg'>
              <div className='flex justify-between items-center'>
                <div>
                  <div className='text-sm font-medium text-purple-700 dark:text-purple-300'>
                    Mode (Most Frequent)
                  </div>
                  <div className='text-2xl font-bold text-purple-900 dark:text-purple-100'>
                    {dataSet.mode.length === dataSet.values.length
                      ? 'No mode'
                      : dataSet.mode.join(', ')}
                  </div>
                </div>
                <div className='text-purple-600 dark:text-purple-400 text-2xl'>
                  🎯
                </div>
              </div>
            </div>

            {/* Range */}
            <div className='p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg'>
              <div className='flex justify-between items-center'>
                <div>
                  <div className='text-sm font-medium text-orange-700 dark:text-orange-300'>
                    Range (Spread)
                  </div>
                  <div className='text-2xl font-bold text-orange-900 dark:text-orange-100'>
                    {dataSet.range}
                  </div>
                </div>
                <div className='text-orange-600 dark:text-orange-400 text-2xl'>
                  📏
                </div>
              </div>
              {showCalculations && (
                <div className='mt-2 text-xs text-orange-600 dark:text-orange-400'>
                  Max: {Math.max(...dataSet.values)} - Min:{' '}
                  {Math.min(...dataSet.values)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Data Visualization */}
        <div>
          <div className='flex justify-between items-center mb-4'>
            <h4 className='text-md font-medium text-gray-900 dark:text-white'>
              Data Visualization:
            </h4>
            <select
              value={chartType}
              onChange={e =>
                setChartType(e.target.value as 'bar' | 'dot' | 'histogram')
              }
              className='px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm'
            >
              <option value='bar'>Bar Chart</option>
              <option value='dot'>Dot Plot</option>
              <option value='histogram'>Histogram</option>
            </select>
          </div>

          <div className='flex justify-center'>{renderChart()}</div>

          <div className='mt-3 text-xs text-gray-500 dark:text-gray-400 text-center'>
            {chartType === 'bar' && 'Bar Chart: Shows frequency of each value'}
            {chartType === 'dot' &&
              'Dot Plot: Each dot represents one data point'}
            {chartType === 'histogram' &&
              'Histogram: Shows distribution across value ranges'}
          </div>
        </div>
      </div>

      {/* Key Concepts */}
      <div className='mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg'>
        <h5 className='text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2'>
          📚 Statistical Measures Explained:
        </h5>
        <div className='grid md:grid-cols-2 gap-4 text-xs text-yellow-700 dark:text-yellow-300'>
          <div>
            <strong>Mean:</strong> Add all values and divide by count. Affected
            by outliers.
          </div>
          <div>
            <strong>Median:</strong> Middle value when data is ordered. Not
            affected by outliers.
          </div>
          <div>
            <strong>Mode:</strong> Most frequently occurring value(s). Can have
            multiple modes.
          </div>
          <div>
            <strong>Range:</strong> Difference between highest and lowest
            values. Shows spread.
          </div>
        </div>
      </div>
    </div>
  );
};
