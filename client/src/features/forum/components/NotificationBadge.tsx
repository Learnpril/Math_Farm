import React from 'react';
import { Bell } from 'lucide-react';
import { cn } from '../../../lib/utils.js';

interface NotificationBadgeProps {
  count: number;
  className?: string;
  showZero?: boolean;
  maxCount?: number;
}

export function NotificationBadge({
  count,
  className,
  showZero = false,
  maxCount = 99,
}: NotificationBadgeProps) {
  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();
  const shouldShow = count > 0 || showZero;

  return (
    <div className={cn('relative inline-flex', className)}>
      <Bell className='w-5 h-5' />
      {shouldShow && (
        <span
          className={cn(
            'absolute -top-2 -right-2 flex items-center justify-center',
            'min-w-[1.25rem] h-5 px-1 text-xs font-medium text-white',
            'bg-red-500 rounded-full border-2 border-background',
            count > 0 ? 'animate-pulse' : ''
          )}
        >
          {displayCount}
        </span>
      )}
    </div>
  );
}
