import React from 'react';
import { cn } from '../../../lib/utils.js';

interface TypingIndicatorProps {
  userNames: string[];
  className?: string;
}

export function TypingIndicator({
  userNames,
  className,
}: TypingIndicatorProps) {
  if (userNames.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (userNames.length === 1) {
      return `${userNames[0]} is typing...`;
    } else if (userNames.length === 2) {
      return `${userNames[0]} and ${userNames[1]} are typing...`;
    } else if (userNames.length === 3) {
      return `${userNames[0]}, ${userNames[1]}, and ${userNames[2]} are typing...`;
    } else {
      return `${userNames[0]}, ${userNames[1]}, and ${userNames.length - 2} others are typing...`;
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground bg-muted/50 rounded-lg',
        className
      )}
    >
      <div className='flex gap-1'>
        <div className='w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]' />
        <div className='w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]' />
        <div className='w-2 h-2 bg-primary rounded-full animate-bounce' />
      </div>
      <span className='italic'>{getTypingText()}</span>
    </div>
  );
}
