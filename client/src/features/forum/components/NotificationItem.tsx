import React from 'react';
import {
  MessageSquare,
  Heart,
  Lock,
  Trophy,
  AtSign,
  X,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../../../components/ui/button.js';
import { cn } from '../../../lib/utils.js';
import { ForumNotification } from '../types/notifications.js';

interface NotificationItemProps {
  notification: ForumNotification;
  onMarkAsRead?: (id: number) => void;
  onDelete?: (id: number) => void;
  onClick?: (notification: ForumNotification) => void;
  className?: string;
}

const getNotificationIcon = (type: ForumNotification['type']) => {
  switch (type) {
    case 'mention':
      return <AtSign className='w-4 h-4 text-blue-500' />;
    case 'reply':
      return <MessageSquare className='w-4 h-4 text-green-500' />;
    case 'thread_reply':
      return <MessageSquare className='w-4 h-4 text-purple-500' />;
    case 'thread_locked':
      return <Lock className='w-4 h-4 text-orange-500' />;
    case 'post_liked':
      return <Heart className='w-4 h-4 text-red-500' />;
    case 'achievement':
      return <Trophy className='w-4 h-4 text-yellow-500' />;
    default:
      return <MessageSquare className='w-4 h-4 text-gray-500' />;
  }
};

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
  className,
}: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    onClick?.(notification);
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead?.(notification.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(notification.id);
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer',
        !notification.isRead && 'bg-primary/5 border-l-4 border-l-primary',
        className
      )}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className='flex-shrink-0 mt-1'>
        {getNotificationIcon(notification.type)}
      </div>

      {/* Content */}
      <div className='flex-1 min-w-0'>
        <div className='flex items-start justify-between gap-2'>
          <div className='flex-1'>
            <h4
              className={cn(
                'text-sm font-medium text-foreground',
                !notification.isRead && 'font-semibold'
              )}
            >
              {notification.title}
            </h4>
            <p className='text-sm text-muted-foreground mt-1 line-clamp-2'>
              {notification.message}
            </p>
          </div>

          {/* Actions */}
          <div className='flex items-center gap-1 flex-shrink-0'>
            {!notification.isRead && (
              <Button
                variant='ghost'
                size='sm'
                onClick={handleMarkAsRead}
                className='h-6 w-6 p-0'
                title='Mark as read'
              >
                <div className='w-2 h-2 bg-primary rounded-full' />
              </Button>
            )}

            {onClick && (
              <Button
                variant='ghost'
                size='sm'
                className='h-6 w-6 p-0'
                title='Open'
              >
                <ExternalLink className='w-3 h-3' />
              </Button>
            )}

            <Button
              variant='ghost'
              size='sm'
              onClick={handleDelete}
              className='h-6 w-6 p-0 text-muted-foreground hover:text-destructive'
              title='Delete notification'
            >
              <X className='w-3 h-3' />
            </Button>
          </div>
        </div>

        {/* Timestamp */}
        <div className='flex items-center gap-1 mt-2 text-xs text-muted-foreground'>
          <Clock className='w-3 h-3' />
          <span>{formatTimeAgo(notification.createdAt)}</span>
          {notification.readAt && (
            <span className='ml-2 text-green-600'>• Read</span>
          )}
        </div>
      </div>
    </div>
  );
}
