/**
 * Loading states and skeleton components for better UX during async operations
 * Provides visual feedback while content is loading
 */

import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2, Calculator, Function, BarChart3 } from 'lucide-react';

// Base skeleton component
export interface SkeletonProps {
  className?: string;
  animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  animate = true,
}) => {
  return (
    <div
      className={cn(
        'bg-slate-200 dark:bg-slate-700 rounded-md',
        animate && 'animate-pulse',
        className
      )}
      role='status'
      aria-label='Loading content'
    />
  );
};

// Loading spinner component
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  text,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin', sizeClasses[size])} />
      {text && <span className='text-sm text-muted-foreground'>{text}</span>}
    </div>
  );
};

// Math tool loading skeleton
export const MathToolSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <div className={cn('space-y-4 p-6', className)}>
      {/* Header */}
      <div className='space-y-2'>
        <Skeleton className='h-6 w-48' />
        <Skeleton className='h-4 w-96' />
      </div>

      {/* Input area */}
      <div className='space-y-3'>
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-12 w-full' />
      </div>

      {/* Result area */}
      <div className='space-y-2'>
        <Skeleton className='h-4 w-16' />
        <Skeleton className='h-16 w-full' />
      </div>

      {/* Button group */}
      <div className='flex gap-2'>
        <Skeleton className='h-10 w-24' />
        <Skeleton className='h-10 w-24' />
        <Skeleton className='h-10 w-24' />
      </div>
    </div>
  );
};

// Calculator loading skeleton
export const CalculatorSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <div className={cn('space-y-4 p-6', className)}>
      {/* Display */}
      <div className='space-y-3'>
        <Skeleton className='h-12 w-full' />
        <Skeleton className='h-16 w-full' />
      </div>

      {/* Button grid */}
      <div className='grid grid-cols-4 gap-2'>
        {Array.from({ length: 20 }).map((_, i) => (
          <Skeleton key={i} className='h-14 w-full' />
        ))}
      </div>

      {/* Scientific functions */}
      <div className='grid grid-cols-4 gap-2'>
        {Array.from({ length: 16 }).map((_, i) => (
          <Skeleton key={i} className='h-12 w-full' />
        ))}
      </div>
    </div>
  );
};

// Graph loading skeleton
export const GraphSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <div className={cn('space-y-4 p-6', className)}>
      {/* Controls */}
      <div className='flex gap-4'>
        <Skeleton className='h-10 w-32' />
        <Skeleton className='h-10 w-32' />
        <Skeleton className='h-10 w-24' />
      </div>

      {/* Graph area */}
      <Skeleton className='h-96 w-full' />

      {/* Legend */}
      <div className='flex gap-4'>
        <Skeleton className='h-4 w-20' />
        <Skeleton className='h-4 w-20' />
        <Skeleton className='h-4 w-20' />
      </div>
    </div>
  );
};

// List loading skeleton
export const ListSkeleton: React.FC<{
  items?: number;
  className?: string;
}> = ({ items = 5, className }) => {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className='flex items-center space-x-3 p-3'>
          <Skeleton className='h-10 w-10 rounded-full' />
          <div className='space-y-2 flex-1'>
            <Skeleton className='h-4 w-3/4' />
            <Skeleton className='h-3 w-1/2' />
          </div>
        </div>
      ))}
    </div>
  );
};

// Card loading skeleton
export const CardSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <div className={cn('p-6 space-y-4', className)}>
      <div className='flex items-center space-x-3'>
        <Skeleton className='h-12 w-12 rounded-lg' />
        <div className='space-y-2 flex-1'>
          <Skeleton className='h-5 w-3/4' />
          <Skeleton className='h-4 w-1/2' />
        </div>
      </div>
      <Skeleton className='h-32 w-full' />
      <div className='flex gap-2'>
        <Skeleton className='h-8 w-16' />
        <Skeleton className='h-8 w-16' />
      </div>
    </div>
  );
};

// Loading state with icon and message
export interface LoadingStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  icon,
  title = 'Loading...',
  description,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center',
        className
      )}
    >
      <div className='mb-4'>{icon || <LoadingSpinner size='lg' />}</div>
      <h3 className='text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2'>
        {title}
      </h3>
      {description && (
        <p className='text-sm text-slate-600 dark:text-slate-400 max-w-sm'>
          {description}
        </p>
      )}
    </div>
  );
};

// Specific loading states for math tools
export const MathLibraryLoadingState: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <LoadingState
      icon={<Calculator className='h-12 w-12 text-primary animate-pulse' />}
      title='Loading Math Library'
      description='Preparing mathematical computation engine...'
      className={className}
    />
  );
};

export const GraphLoadingState: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <LoadingState
      icon={<BarChart3 className='h-12 w-12 text-primary animate-pulse' />}
      title='Initializing Graph'
      description='Setting up interactive graphing environment...'
      className={className}
    />
  );
};

export const EquationLoadingState: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <LoadingState
      icon={<Function className='h-12 w-12 text-primary animate-pulse' />}
      title='Loading Equation Solver'
      description='Preparing symbolic math capabilities...'
      className={className}
    />
  );
};

// Progressive loading component
export interface ProgressiveLoadingProps {
  stages: Array<{
    name: string;
    description?: string;
    duration?: number;
  }>;
  currentStage: number;
  className?: string;
}

export const ProgressiveLoading: React.FC<ProgressiveLoadingProps> = ({
  stages,
  currentStage,
  className,
}) => {
  return (
    <div className={cn('space-y-4 p-6', className)}>
      <div className='text-center mb-6'>
        <LoadingSpinner size='lg' />
        <h3 className='text-lg font-semibold mt-4'>
          {stages[currentStage]?.name || 'Loading...'}
        </h3>
        {stages[currentStage]?.description && (
          <p className='text-sm text-muted-foreground mt-2'>
            {stages[currentStage].description}
          </p>
        )}
      </div>

      {/* Progress indicators */}
      <div className='flex justify-center space-x-2'>
        {stages.map((_, index) => (
          <div
            key={index}
            className={cn(
              'h-2 w-8 rounded-full transition-colors',
              index <= currentStage
                ? 'bg-primary'
                : 'bg-slate-200 dark:bg-slate-700'
            )}
          />
        ))}
      </div>

      {/* Stage list */}
      <div className='space-y-2 max-w-sm mx-auto'>
        {stages.map((stage, index) => (
          <div
            key={index}
            className={cn(
              'flex items-center text-sm',
              index <= currentStage
                ? 'text-primary font-medium'
                : 'text-muted-foreground'
            )}
          >
            <div
              className={cn(
                'h-2 w-2 rounded-full mr-3',
                index <= currentStage
                  ? 'bg-primary'
                  : 'bg-slate-300 dark:bg-slate-600'
              )}
            />
            {stage.name}
          </div>
        ))}
      </div>
    </div>
  );
};

// Lazy loading wrapper with skeleton
export interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback,
  className,
}) => {
  return (
    <React.Suspense
      fallback={fallback || <MathToolSkeleton className={className} />}
    >
      {children}
    </React.Suspense>
  );
};
