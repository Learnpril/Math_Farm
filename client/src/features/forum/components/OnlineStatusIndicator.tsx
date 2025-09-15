import React from 'react';
import { cn } from '../../../lib/utils.js';

interface OnlineStatusIndicatorProps {
  isOnline: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function OnlineStatusIndicator({
  isOnline,
  size = 'md',
  showText = false,
  className,
}: OnlineStatusIndicatorProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div
        className={cn(
          'rounded-full border-2 border-background',
          sizeClasses[size],
          isOnline
            ? 'bg-green-500 shadow-green-500/50 shadow-sm'
            : 'bg-gray-400'
        )}
        title={isOnline ? 'Online' : 'Offline'}
      />
      {showText && (
        <span
          className={cn(
            'font-medium',
            textSizeClasses[size],
            isOnline ? 'text-green-600 dark:text-green-400' : 'text-gray-500'
          )}
        >
          {isOnline ? 'Online' : 'Offline'}
        </span>
      )}
    </div>
  );
}
