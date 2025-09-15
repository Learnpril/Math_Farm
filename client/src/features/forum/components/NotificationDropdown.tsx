import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuHeader,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu.js';
import { Button } from '../../../components/ui/button.js';
import { ScrollArea } from '../../../components/ui/scroll-area.js';
import { Bell, Settings, CheckCheck, Filter, ExternalLink } from 'lucide-react';
import { cn } from '../../../lib/utils.js';
import { NotificationBadge } from './NotificationBadge.js';
import { NotificationItem } from './NotificationItem.js';
import { useNotifications } from '../hooks/useNotifications.js';
import { ForumNotification } from '../types/notifications.js';

interface NotificationDropdownProps {
  token?: string;
  onNotificationClick?: (notification: ForumNotification) => void;
  onSettingsClick?: () => void;
  className?: string;
}

export function NotificationDropdown({
  token,
  onNotificationClick,
  onSettingsClick,
  className,
}: NotificationDropdownProps) {
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications({ token });

  const displayedNotifications = showUnreadOnly
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const handleNotificationClick = (notification: ForumNotification) => {
    onNotificationClick?.(notification);
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleToggleFilter = () => {
    setShowUnreadOnly(!showUnreadOnly);
  };

  const handleRefresh = () => {
    fetchNotifications();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='sm' className={cn('relative', className)}>
          <NotificationBadge count={unreadCount} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end' className='w-80 p-0' sideOffset={5}>
        {/* Header */}
        <DropdownMenuHeader className='flex items-center justify-between p-4 border-b'>
          <div className='flex items-center gap-2'>
            <Bell className='w-4 h-4' />
            <span className='font-semibold'>Notifications</span>
            {unreadCount > 0 && (
              <span className='text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full'>
                {unreadCount}
              </span>
            )}
          </div>

          <div className='flex items-center gap-1'>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleToggleFilter}
              className={cn(
                'h-6 w-6 p-0',
                showUnreadOnly && 'bg-primary text-primary-foreground'
              )}
              title={showUnreadOnly ? 'Show all' : 'Show unread only'}
            >
              <Filter className='w-3 h-3' />
            </Button>

            {onSettingsClick && (
              <Button
                variant='ghost'
                size='sm'
                onClick={onSettingsClick}
                className='h-6 w-6 p-0'
                title='Notification settings'
              >
                <Settings className='w-3 h-3' />
              </Button>
            )}
          </div>
        </DropdownMenuHeader>

        {/* Actions */}
        {unreadCount > 0 && (
          <div className='p-2 border-b'>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleMarkAllAsRead}
              className='w-full justify-start h-8'
            >
              <CheckCheck className='w-4 h-4 mr-2' />
              Mark all as read
            </Button>
          </div>
        )}

        {/* Notifications List */}
        <ScrollArea className='max-h-96'>
          {isLoading && (
            <div className='p-8 text-center text-muted-foreground'>
              <div className='animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2' />
              Loading notifications...
            </div>
          )}

          {error && (
            <div className='p-4 text-center text-destructive'>
              <p className='text-sm'>{error}</p>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleRefresh}
                className='mt-2'
              >
                Try again
              </Button>
            </div>
          )}

          {!isLoading && !error && displayedNotifications.length === 0 && (
            <div className='p-8 text-center text-muted-foreground'>
              <Bell className='w-12 h-12 mx-auto mb-4 opacity-50' />
              <p className='text-sm'>
                {showUnreadOnly
                  ? 'No unread notifications'
                  : 'No notifications yet'}
              </p>
            </div>
          )}

          {!isLoading && !error && displayedNotifications.length > 0 && (
            <div className='divide-y'>
              {displayedNotifications.slice(0, 10).map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                  onClick={handleNotificationClick}
                  className='border-b-0'
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {displayedNotifications.length > 10 && (
          <div className='p-2 border-t'>
            <Button
              variant='ghost'
              size='sm'
              className='w-full justify-center h-8'
              onClick={() => {
                // Navigate to full notifications page
                setIsOpen(false);
              }}
            >
              <ExternalLink className='w-4 h-4 mr-2' />
              View all notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
