/**
 * Virtualized component for displaying large sets of mathematical results
 * Efficiently handles thousands of calculations or data points
 */

import React, { useMemo, useState, useCallback } from 'react';
import { VirtualizedList, VirtualizedGrid } from './ui/VirtualizedList';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Search, Filter, Download, Grid, List } from 'lucide-react';
import { cn } from '../lib/utils';

export interface MathResult {
  id: string;
  expression: string;
  result: number | string;
  timestamp: Date;
  type: 'calculation' | 'equation' | 'graph_point' | 'matrix_element';
  metadata?: Record<string, any>;
}

export interface VirtualizedMathResultsProps {
  results: MathResult[];
  className?: string;
  onResultClick?: (result: MathResult) => void;
  onExport?: (results: MathResult[]) => void;
  searchable?: boolean;
  filterable?: boolean;
  viewMode?: 'list' | 'grid';
}

export const VirtualizedMathResults: React.FC<VirtualizedMathResultsProps> = ({
  results,
  className,
  onResultClick,
  onExport,
  searchable = true,
  filterable = true,
  viewMode: initialViewMode = 'list',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState(initialViewMode);

  // Filter and search results
  const filteredResults = useMemo(() => {
    let filtered = results;

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(result => result.type === filterType);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        result =>
          result.expression.toLowerCase().includes(term) ||
          result.result.toString().toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [results, searchTerm, filterType]);

  // Get unique types for filter dropdown
  const availableTypes = useMemo(() => {
    const types = new Set(results.map(result => result.type));
    return Array.from(types);
  }, [results]);

  // Render individual result item
  const renderResultItem = useCallback(
    (result: MathResult, index: number) => {
      const handleClick = () => onResultClick?.(result);

      return (
        <div
          className={cn(
            'flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer',
            onResultClick && 'hover:bg-primary/5'
          )}
          onClick={handleClick}
          role='button'
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick();
            }
          }}
          aria-label={`Math result: ${result.expression} equals ${result.result}`}
        >
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2 mb-1'>
              <span className='text-sm font-mono text-slate-600 dark:text-slate-400 truncate'>
                {result.expression}
              </span>
              <span
                className={cn(
                  'px-2 py-1 text-xs rounded-full',
                  result.type === 'calculation' &&
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
                  result.type === 'equation' &&
                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
                  result.type === 'graph_point' &&
                    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
                  result.type === 'matrix_element' &&
                    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                )}
              >
                {result.type.replace('_', ' ')}
              </span>
            </div>
            <div className='text-lg font-semibold text-slate-900 dark:text-slate-100 font-mono'>
              = {result.result}
            </div>
            <div className='text-xs text-slate-500 dark:text-slate-400'>
              {result.timestamp.toLocaleString()}
            </div>
          </div>
          <div className='flex-shrink-0 ml-4'>
            <div className='text-sm text-slate-400 dark:text-slate-500'>
              #{index + 1}
            </div>
          </div>
        </div>
      );
    },
    [onResultClick]
  );

  // Render grid item
  const renderGridItem = useCallback(
    (result: MathResult, index: number) => {
      const handleClick = () => onResultClick?.(result);

      return (
        <div
          className={cn(
            'p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-primary/50 transition-colors cursor-pointer bg-white dark:bg-slate-800',
            onResultClick && 'hover:shadow-md'
          )}
          onClick={handleClick}
          role='button'
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick();
            }
          }}
          aria-label={`Math result: ${result.expression} equals ${result.result}`}
        >
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <span
                className={cn(
                  'px-2 py-1 text-xs rounded-full',
                  result.type === 'calculation' &&
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
                  result.type === 'equation' &&
                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
                  result.type === 'graph_point' &&
                    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
                  result.type === 'matrix_element' &&
                    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                )}
              >
                {result.type.replace('_', ' ')}
              </span>
              <span className='text-xs text-slate-400 dark:text-slate-500'>
                #{index + 1}
              </span>
            </div>
            <div className='text-sm font-mono text-slate-600 dark:text-slate-400 truncate'>
              {result.expression}
            </div>
            <div className='text-lg font-semibold text-slate-900 dark:text-slate-100 font-mono'>
              = {result.result}
            </div>
            <div className='text-xs text-slate-500 dark:text-slate-400'>
              {result.timestamp.toLocaleString()}
            </div>
          </div>
        </div>
      );
    },
    [onResultClick]
  );

  const handleExport = () => {
    onExport?.(filteredResults);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Controls */}
      <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
        <div className='flex flex-col sm:flex-row gap-3 flex-1'>
          {/* Search */}
          {searchable && (
            <div className='relative flex-1 max-w-sm'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400' />
              <Input
                type='text'
                placeholder='Search expressions or results...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='pl-10'
                aria-label='Search math results'
              />
            </div>
          )}

          {/* Filter */}
          {filterable && (
            <div className='flex items-center gap-2'>
              <Label
                htmlFor='type-filter'
                className='text-sm font-medium whitespace-nowrap'
              >
                Type:
              </Label>
              <select
                id='type-filter'
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className='px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-sm'
                aria-label='Filter by result type'
              >
                <option value='all'>All Types</option>
                {availableTypes.map(type => (
                  <option key={type} value={type}>
                    {type
                      .replace('_', ' ')
                      .replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* View controls */}
        <div className='flex items-center gap-2'>
          <div className='flex border border-slate-200 dark:border-slate-700 rounded-md'>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('list')}
              className='rounded-r-none'
              aria-label='List view'
            >
              <List className='h-4 w-4' />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('grid')}
              className='rounded-l-none'
              aria-label='Grid view'
            >
              <Grid className='h-4 w-4' />
            </Button>
          </div>

          {onExport && (
            <Button
              variant='outline'
              size='sm'
              onClick={handleExport}
              className='flex items-center gap-2'
              aria-label='Export results'
            >
              <Download className='h-4 w-4' />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className='text-sm text-slate-600 dark:text-slate-400'>
        Showing {filteredResults.length} of {results.length} results
      </div>

      {/* Virtualized results */}
      <div className='border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden'>
        {filteredResults.length === 0 ? (
          <div className='p-8 text-center text-slate-500 dark:text-slate-400'>
            No results found matching your criteria.
          </div>
        ) : viewMode === 'list' ? (
          <VirtualizedList
            items={filteredResults}
            itemHeight={80}
            containerHeight={400}
            renderItem={renderResultItem}
            getItemKey={result => result.id}
            className='bg-white dark:bg-slate-900'
          />
        ) : (
          <VirtualizedGrid
            items={filteredResults}
            itemWidth={280}
            itemHeight={140}
            containerWidth={800}
            containerHeight={400}
            renderItem={renderGridItem}
            getItemKey={result => result.id}
            gap={16}
            className='bg-slate-50 dark:bg-slate-900 p-4'
          />
        )}
      </div>
    </div>
  );
};

// Hook for generating sample math results for testing
export const useSampleMathResults = (count: number = 1000): MathResult[] => {
  return useMemo(() => {
    const results: MathResult[] = [];
    const types: MathResult['type'][] = [
      'calculation',
      'equation',
      'graph_point',
      'matrix_element',
    ];

    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      let expression: string;
      let result: number | string;

      switch (type) {
        case 'calculation':
          const a = Math.floor(Math.random() * 100);
          const b = Math.floor(Math.random() * 100);
          const op = ['+', '-', '*', '/'][Math.floor(Math.random() * 4)];
          expression = `${a} ${op} ${b}`;
          result = eval(expression);
          if (typeof result === 'number') {
            result = Math.round(result * 1000) / 1000;
          }
          break;

        case 'equation':
          const x = Math.floor(Math.random() * 10) + 1;
          expression = `x^2 + ${x}x - ${x * 2} = 0`;
          result = `x = ${x}, x = ${-x * 2}`;
          break;

        case 'graph_point':
          const xVal = Math.round((Math.random() * 20 - 10) * 100) / 100;
          const yVal = Math.round(Math.sin(xVal) * 100) / 100;
          expression = `sin(${xVal})`;
          result = yVal;
          break;

        case 'matrix_element':
          const row = Math.floor(Math.random() * 3) + 1;
          const col = Math.floor(Math.random() * 3) + 1;
          const value = Math.round(Math.random() * 100) / 10;
          expression = `M[${row},${col}]`;
          result = value;
          break;

        default:
          expression = '2 + 2';
          result = 4;
      }

      results.push({
        id: `result-${i}`,
        expression,
        result,
        type,
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 30), // Random date within last 30 days
        metadata: {
          index: i,
          category: type,
        },
      });
    }

    return results.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }, [count]);
};
