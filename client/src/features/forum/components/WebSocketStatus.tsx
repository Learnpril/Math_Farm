import React from 'react';
import { Wifi, WifiOff, AlertCircle, RotateCcw } from 'lucide-react';
import { cn } from '../../../lib/utils.js';
import { Button } from '../../../components/ui/button.js';

interface WebSocketStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
  onReconnect?: () => void;
  className?: string;
}

export function WebSocketStatus({
  isConnected,
  isConnecting,
  error,
  reconnectAttempts,
  onReconnect,
  className,
}: WebSocketStatusProps) {
  if (isConnected) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 text-sm text-green-600 dark:text-green-400',
          className
        )}
      >
        <Wifi className='w-4 h-4' />
        <span>Connected</span>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400',
          className
        )}
      >
        <RotateCcw className='w-4 h-4 animate-spin' />
        <span>Connecting...</span>
        {reconnectAttempts > 0 && (
          <span className='text-xs text-muted-foreground'>
            (Attempt {reconnectAttempts})
          </span>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 text-sm text-red-600 dark:text-red-400',
          className
        )}
      >
        <AlertCircle className='w-4 h-4' />
        <span>Connection error</span>
        {onReconnect && (
          <Button
            variant='ghost'
            size='sm'
            onClick={onReconnect}
            className='h-6 px-2 text-xs'
          >
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn('flex items-center gap-2 text-sm text-gray-500', className)}
    >
      <WifiOff className='w-4 h-4' />
      <span>Disconnected</span>
      {onReconnect && (
        <Button
          variant='ghost'
          size='sm'
          onClick={onReconnect}
          className='h-6 px-2 text-xs'
        >
          Connect
        </Button>
      )}
    </div>
  );
}
