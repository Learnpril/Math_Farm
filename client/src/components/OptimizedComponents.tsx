/**
 * Optimized components with React.memo for better performance
 * These components are memoized to prevent unnecessary re-renders
 */

import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { cn } from '../lib/utils';

// Memoized calculator button
export const CalculatorButton = React.memo<{
  value: string;
  onClick: (value: string) => void;
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  className?: string;
  'aria-label'?: string;
}>(function CalculatorButton({
  value,
  onClick,
  variant = 'outline',
  className,
  ...props
}) {
  const handleClick = React.useCallback(() => {
    onClick(value);
  }, [onClick, value]);

  return (
    <Button
      variant={variant}
      onClick={handleClick}
      className={cn(
        'h-14 text-2xl font-mono font-bold transition-all shadow-sm hover:shadow-md hover:scale-105',
        className
      )}
      {...props}
    >
      {value}
    </Button>
  );
});

// Memoized solver type badge
export const SolverTypeBadge = React.memo<{
  type: string;
  label: string;
  isActive: boolean;
  onClick: (type: string) => void;
}>(function SolverTypeBadge({ type, label, isActive, onClick }) {
  const handleClick = React.useCallback(() => {
    onClick(type);
  }, [onClick, type]);

  return (
    <Badge
      variant={isActive ? 'default' : 'outline'}
      className='cursor-pointer px-3 py-1'
      onClick={handleClick}
    >
      {label}
    </Badge>
  );
});

// Memoized example button
export const ExampleButton = React.memo<{
  example: string;
  description?: string;
  onClick: (example: string) => void;
  className?: string;
}>(function ExampleButton({ example, description, onClick, className }) {
  const handleClick = React.useCallback(() => {
    onClick(example);
  }, [onClick, example]);

  return (
    <Button
      variant='outline'
      size='sm'
      onClick={handleClick}
      className={cn('text-xs font-mono', className)}
      aria-label={
        description ? `Try example: ${description}` : `Try example: ${example}`
      }
    >
      {example}
    </Button>
  );
});

// Memoized history item
export const HistoryItem = React.memo<{
  expression: string;
  result: string;
  timestamp: number;
  onClick: (expression: string, result: string) => void;
}>(function HistoryItem({ expression, result, timestamp, onClick }) {
  const handleClick = React.useCallback(() => {
    onClick(expression, result);
  }, [onClick, expression, result]);

  return (
    <button
      onClick={handleClick}
      className='w-full text-left p-3 hover:bg-muted rounded-lg text-sm font-mono transition-all border border-transparent hover:border-primary/20 shadow-sm hover:shadow-md'
      aria-label={`Reuse calculation: ${expression} equals ${result}`}
    >
      <div className='flex justify-between items-center'>
        <span className='text-muted-foreground truncate flex-1 mr-2'>
          {expression}
        </span>
        <span className='font-bold text-primary flex-shrink-0'>= {result}</span>
      </div>
    </button>
  );
});

// Memoized performance metric display
export const PerformanceMetric = React.memo<{
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  className?: string;
}>(function PerformanceMetric({ label, value, unit, trend, className }) {
  return (
    <div className={cn('p-2 bg-muted/50 rounded', className)}>
      <div className='text-muted-foreground text-xs'>{label}</div>
      <div className='font-semibold text-lg flex items-center gap-1'>
        {value}
        {unit && <span className='text-xs text-muted-foreground'>{unit}</span>}
        {trend && (
          <span
            className={cn(
              'text-xs',
              trend === 'up' && 'text-green-500',
              trend === 'down' && 'text-red-500',
              trend === 'stable' && 'text-gray-500'
            )}
          >
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
          </span>
        )}
      </div>
    </div>
  );
});

// Memoized operation status indicator
export const OperationStatus = React.memo<{
  operation: string;
  duration: number;
  success: boolean;
  error?: string;
  component?: string;
}>(function OperationStatus({
  operation,
  duration,
  success,
  error,
  component,
}) {
  const formatDuration = (ms: number): string => {
    if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`;
    if (ms < 1000) return `${ms.toFixed(1)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className='flex items-center justify-between p-2 bg-muted/30 rounded text-xs'>
      <div className='flex items-center gap-2'>
        <div
          className={cn(
            'w-2 h-2 rounded-full',
            success ? 'bg-green-500' : 'bg-red-500'
          )}
        />
        <span className='capitalize'>{operation}</span>
        {component && (
          <Badge variant='outline' className='text-xs px-1 py-0'>
            {component}
          </Badge>
        )}
      </div>
      <div className='flex items-center gap-2'>
        <span className='font-mono'>{formatDuration(duration)}</span>
        {!success && error && (
          <span
            className='text-red-500 text-xs truncate max-w-20'
            title={error}
          >
            {error}
          </span>
        )}
      </div>
    </div>
  );
});

// Memoized memory usage bar
export const MemoryUsageBar = React.memo<{
  current: number;
  peak: number;
  limit?: number;
  className?: string;
}>(function MemoryUsageBar({ current, peak, limit, className }) {
  const formatMemory = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const percentage = limit ? (current / limit) * 100 : 0;

  return (
    <div className={cn('space-y-2', className)}>
      <div className='flex justify-between text-xs'>
        <span className='text-muted-foreground'>Memory Usage</span>
        <span className='font-mono'>{formatMemory(current)}</span>
      </div>
      {limit && (
        <div className='w-full bg-muted rounded-full h-2'>
          <div
            className={cn(
              'h-2 rounded-full transition-all',
              percentage > 80
                ? 'bg-red-500'
                : percentage > 60
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
      <div className='flex justify-between text-xs text-muted-foreground'>
        <span>Peak: {formatMemory(peak)}</span>
        {limit && <span>Limit: {formatMemory(limit)}</span>}
      </div>
    </div>
  );
});

// Memoized component render metric
export const ComponentRenderMetric = React.memo<{
  componentName: string;
  renderCount: number;
  averageRenderTime: number;
  lastRenderTime: number;
  propsChanges: number;
}>(function ComponentRenderMetric({
  componentName,
  renderCount,
  averageRenderTime,
  lastRenderTime,
  propsChanges,
}) {
  const formatDuration = (ms: number): string => {
    if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`;
    if (ms < 1000) return `${ms.toFixed(1)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const isSlowRender = averageRenderTime > 16; // 60fps threshold

  return (
    <Card
      className={cn(
        'p-3 transition-colors',
        isSlowRender &&
          'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
      )}
    >
      <div className='flex items-center justify-between mb-2'>
        <span className='text-sm font-medium'>{componentName}</span>
        <div className='flex items-center gap-2'>
          <Badge variant='outline' className='text-xs'>
            {renderCount} renders
          </Badge>
          {isSlowRender && (
            <Badge variant='destructive' className='text-xs'>
              Slow
            </Badge>
          )}
        </div>
      </div>
      <div className='grid grid-cols-2 gap-2 text-xs text-muted-foreground'>
        <div>Avg: {formatDuration(averageRenderTime)}</div>
        <div>Last: {formatDuration(lastRenderTime)}</div>
        <div>Props changes: {propsChanges}</div>
        <div>
          Efficiency:{' '}
          {propsChanges > 0 ? (renderCount / propsChanges).toFixed(1) : 'N/A'}
        </div>
      </div>
    </Card>
  );
});
