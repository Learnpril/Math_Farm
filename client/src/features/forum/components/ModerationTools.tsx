import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import {
  Shield,
  Trash2,
  Lock,
  Unlock,
  Pin,
  PinOff,
  Flag,
  Eye,
  EyeOff,
  AlertTriangle,
  MessageSquare,
  User,
  Clock,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { ForumPost, ForumThread, ForumReport } from '../types';

export interface ModerationAction {
  type:
    | 'delete'
    | 'hide'
    | 'lock'
    | 'unlock'
    | 'pin'
    | 'unpin'
    | 'warn'
    | 'ban';
  reason: string;
  duration?: number; // For temporary actions (in hours)
  targetId: number;
  targetType: 'post' | 'thread' | 'user';
}

export interface ModerationToolsProps {
  post?: ForumPost;
  thread?: ForumThread;
  reports?: ForumReport[];
  userRole: 'member' | 'moderator' | 'admin';
  onModerationAction: (action: ModerationAction) => Promise<void>;
  onResolveReport: (
    reportId: number,
    action: 'resolved' | 'dismissed'
  ) => Promise<void>;
  className?: string;
}

/**
 * Moderation tools for content and user management
 * Provides interface for moderators to manage posts, threads, and reports
 */
export function ModerationTools({
  post,
  thread,
  reports = [],
  userRole,
  onModerationAction,
  onResolveReport,
  className,
}: ModerationToolsProps) {
  const [selectedAction, setSelectedAction] = useState<
    ModerationAction['type'] | null
  >(null);
  const [actionReason, setActionReason] = useState('');
  const [actionDuration, setActionDuration] = useState<number>(24);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user has moderation permissions
  const canModerate = userRole === 'moderator' || userRole === 'admin';
  const canAdmin = userRole === 'admin';

  if (!canModerate) {
    return null;
  }

  // Handle moderation action
  const handleModerationAction = async (
    actionType: ModerationAction['type']
  ) => {
    if (!actionReason.trim()) {
      alert('Please provide a reason for this action');
      return;
    }

    setIsSubmitting(true);

    try {
      const action: ModerationAction = {
        type: actionType,
        reason: actionReason.trim(),
        duration: ['ban', 'lock'].includes(actionType)
          ? actionDuration
          : undefined,
        targetId: post?.id || thread?.id || 0,
        targetType: post ? 'post' : 'thread',
      };

      await onModerationAction(action);

      // Reset form
      setSelectedAction(null);
      setActionReason('');
      setActionDuration(24);
    } catch (error) {
      console.error('Moderation action failed:', error);
      alert('Failed to perform moderation action');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle report resolution
  const handleResolveReport = async (
    reportId: number,
    action: 'resolved' | 'dismissed'
  ) => {
    try {
      await onResolveReport(reportId, action);
    } catch (error) {
      console.error('Failed to resolve report:', error);
      alert('Failed to resolve report');
    }
  };

  const pendingReports = reports.filter(r => r.status === 'pending');

  return (
    <Card
      className={cn(
        'border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20',
        className
      )}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-center gap-2'>
          <Shield className='w-5 h-5 text-orange-600' />
          <CardTitle className='text-lg text-orange-800 dark:text-orange-200'>
            Moderation Tools
          </CardTitle>
          <Badge variant='outline' className='text-xs'>
            {userRole}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue='actions' className='w-full'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='actions'>Actions</TabsTrigger>
            <TabsTrigger value='reports'>
              Reports
              {pendingReports.length > 0 && (
                <Badge variant='destructive' className='ml-2 text-xs'>
                  {pendingReports.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value='actions' className='space-y-4'>
            {/* Post Actions */}
            {post && (
              <div className='space-y-3'>
                <h4 className='font-medium text-sm'>Post Actions</h4>
                <div className='grid grid-cols-2 gap-2'>
                  <ModerationButton
                    icon={<Trash2 className='w-4 h-4' />}
                    label='Delete Post'
                    variant='destructive'
                    onClick={() => setSelectedAction('delete')}
                  />
                  <ModerationButton
                    icon={
                      post.content ? (
                        <EyeOff className='w-4 h-4' />
                      ) : (
                        <Eye className='w-4 h-4' />
                      )
                    }
                    label={post.content ? 'Hide Post' : 'Show Post'}
                    onClick={() => setSelectedAction('hide')}
                  />
                </div>
              </div>
            )}

            {/* Thread Actions */}
            {thread && (
              <div className='space-y-3'>
                <h4 className='font-medium text-sm'>Thread Actions</h4>
                <div className='grid grid-cols-2 gap-2'>
                  <ModerationButton
                    icon={
                      thread.isLocked ? (
                        <Unlock className='w-4 h-4' />
                      ) : (
                        <Lock className='w-4 h-4' />
                      )
                    }
                    label={thread.isLocked ? 'Unlock Thread' : 'Lock Thread'}
                    onClick={() =>
                      setSelectedAction(thread.isLocked ? 'unlock' : 'lock')
                    }
                  />
                  <ModerationButton
                    icon={
                      thread.isPinned ? (
                        <PinOff className='w-4 h-4' />
                      ) : (
                        <Pin className='w-4 h-4' />
                      )
                    }
                    label={thread.isPinned ? 'Unpin Thread' : 'Pin Thread'}
                    onClick={() =>
                      setSelectedAction(thread.isPinned ? 'unpin' : 'pin')
                    }
                  />
                  <ModerationButton
                    icon={<Trash2 className='w-4 h-4' />}
                    label='Delete Thread'
                    variant='destructive'
                    onClick={() => setSelectedAction('delete')}
                  />
                </div>
              </div>
            )}

            {/* User Actions (Admin only) */}
            {canAdmin && (post || thread) && (
              <div className='space-y-3'>
                <h4 className='font-medium text-sm'>User Actions</h4>
                <div className='grid grid-cols-2 gap-2'>
                  <ModerationButton
                    icon={<AlertTriangle className='w-4 h-4' />}
                    label='Warn User'
                    variant='outline'
                    onClick={() => setSelectedAction('warn')}
                  />
                  <ModerationButton
                    icon={<User className='w-4 h-4' />}
                    label='Ban User'
                    variant='destructive'
                    onClick={() => setSelectedAction('ban')}
                  />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value='reports' className='space-y-4'>
            {pendingReports.length === 0 ? (
              <p className='text-muted-foreground text-sm text-center py-4'>
                No pending reports
              </p>
            ) : (
              <div className='space-y-3'>
                {pendingReports.map(report => (
                  <ReportItem
                    key={report.id}
                    report={report}
                    onResolve={handleResolveReport}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Action Dialog */}
        {selectedAction && (
          <Dialog
            open={!!selectedAction}
            onOpenChange={() => setSelectedAction(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Confirm{' '}
                  {selectedAction.charAt(0).toUpperCase() +
                    selectedAction.slice(1)}{' '}
                  Action
                </DialogTitle>
              </DialogHeader>

              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='action-reason'>Reason *</Label>
                  <Textarea
                    id='action-reason'
                    value={actionReason}
                    onChange={e => setActionReason(e.target.value)}
                    placeholder='Explain why this action is being taken...'
                    className='min-h-[80px]'
                  />
                </div>

                {['ban', 'lock'].includes(selectedAction) && (
                  <div className='space-y-2'>
                    <Label htmlFor='action-duration'>Duration (hours)</Label>
                    <input
                      id='action-duration'
                      type='number'
                      value={actionDuration}
                      onChange={e => setActionDuration(Number(e.target.value))}
                      min='1'
                      max='8760'
                      className='w-full px-3 py-2 border rounded-md'
                    />
                    <p className='text-xs text-muted-foreground'>
                      Leave blank for permanent action
                    </p>
                  </div>
                )}

                <div className='flex justify-end gap-2'>
                  <Button
                    variant='outline'
                    onClick={() => setSelectedAction(null)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant={
                      selectedAction === 'delete' || selectedAction === 'ban'
                        ? 'destructive'
                        : 'default'
                    }
                    onClick={() => handleModerationAction(selectedAction)}
                    disabled={isSubmitting || !actionReason.trim()}
                  >
                    {isSubmitting ? 'Processing...' : 'Confirm'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}

interface ModerationButtonProps {
  icon: React.ReactNode;
  label: string;
  variant?: 'default' | 'destructive' | 'outline';
  onClick: () => void;
}

function ModerationButton({
  icon,
  label,
  variant = 'default',
  onClick,
}: ModerationButtonProps) {
  return (
    <Button
      variant={variant}
      size='sm'
      onClick={onClick}
      className='justify-start gap-2 h-auto py-2'
    >
      {icon}
      <span className='text-xs'>{label}</span>
    </Button>
  );
}

interface ReportItemProps {
  report: ForumReport;
  onResolve: (
    reportId: number,
    action: 'resolved' | 'dismissed'
  ) => Promise<void>;
}

function ReportItem({ report, onResolve }: ReportItemProps) {
  const [isResolving, setIsResolving] = useState(false);

  const handleResolve = async (action: 'resolved' | 'dismissed') => {
    setIsResolving(true);
    try {
      await onResolve(report.id, action);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className='border rounded-lg p-3 space-y-2'>
      <div className='flex items-start justify-between'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <Flag className='w-4 h-4 text-red-500' />
            <span className='font-medium text-sm'>Report #{report.id}</span>
            <Badge variant='outline' className='text-xs'>
              {report.status}
            </Badge>
          </div>
          <p className='text-sm text-muted-foreground'>{report.reason}</p>
          <div className='flex items-center gap-4 text-xs text-muted-foreground'>
            <span>Post #{report.postId}</span>
            <span>Reporter #{report.reporterId}</span>
            <span>{new Date(report.createdAt).toLocaleString()}</span>
          </div>
        </div>

        <div className='flex gap-1'>
          <Button
            size='sm'
            variant='outline'
            onClick={() => handleResolve('resolved')}
            disabled={isResolving}
          >
            Resolve
          </Button>
          <Button
            size='sm'
            variant='ghost'
            onClick={() => handleResolve('dismissed')}
            disabled={isResolving}
          >
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}
