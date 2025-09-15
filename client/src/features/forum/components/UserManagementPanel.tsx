import React, { useState, useEffect } from 'react';
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
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../../components/ui/alert-dialog';
import {
  User,
  Ban,
  Shield,
  AlertTriangle,
  Clock,
  FileText,
  Search,
  RefreshCw,
  UserX,
  UserCheck,
  MessageSquareWarning,
  Scale,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface UserBan {
  id: number;
  userId: number;
  moderatorId: number;
  reason: string;
  duration?: number;
  isActive: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface UserRestriction {
  id: number;
  userId: number;
  moderatorId: number;
  type: 'post_limit' | 'thread_limit' | 'no_images' | 'no_links' | 'shadow_ban';
  reason: string;
  duration?: number;
  metadata?: any;
  isActive: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface UserWarning {
  id: number;
  userId: number;
  moderatorId: number;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  isActive: boolean;
  createdAt: Date;
}

export interface UserAppeal {
  id: number;
  userId: number;
  actionType: 'ban' | 'restriction' | 'warning';
  actionId: number;
  reason: string;
  status: 'pending' | 'approved' | 'denied';
  moderatorId?: number;
  moderatorResponse?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface SpamDetectionResult {
  isSpam: boolean;
  confidence: number;
  reasons: string[];
  suggestedAction: 'none' | 'warn' | 'restrict' | 'ban';
}

export interface UserManagementPanelProps {
  userId?: number;
  userRole: 'member' | 'moderator' | 'admin';
  className?: string;
}

/**
 * User management panel for moderation actions
 * Provides tools for banning, restricting, warning users and handling appeals
 */
export function UserManagementPanel({
  userId,
  userRole,
  className,
}: UserManagementPanelProps) {
  const [userHistory, setUserHistory] = useState<{
    bans: UserBan[];
    restrictions: UserRestriction[];
    warnings: UserWarning[];
    appeals: UserAppeal[];
  } | null>(null);
  const [spamResult, setSpamResult] = useState<SpamDetectionResult | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [searchUserId, setSearchUserId] = useState(userId?.toString() || '');
  const [activeTab, setActiveTab] = useState('history');

  // Check if user has moderation permissions
  const canModerate = userRole === 'moderator' || userRole === 'admin';
  const canBan = userRole === 'admin';

  if (!canModerate) {
    return (
      <Card className={cn('border-red-200 bg-red-50/50', className)}>
        <CardContent className='p-6 text-center'>
          <Shield className='w-12 h-12 text-red-400 mx-auto mb-4' />
          <h3 className='text-lg font-semibold text-red-800 mb-2'>
            Access Denied
          </h3>
          <p className='text-red-600'>
            You don't have permission to access user management tools.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Load user data
  const loadUserData = async (targetUserId: number) => {
    setIsLoading(true);
    try {
      // Load user moderation history
      const historyResponse = await fetch(
        `/api/forum/user-management/users/${targetUserId}/history`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setUserHistory(historyData.data);
      }

      // Run spam check
      const spamResponse = await fetch(
        '/api/forum/user-management/spam-check',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify({ userId: targetUserId }),
        }
      );

      if (spamResponse.ok) {
        const spamData = await spamResponse.json();
        setSpamResult(spamData.data);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    const targetUserId = parseInt(searchUserId);
    if (targetUserId && targetUserId > 0) {
      loadUserData(targetUserId);
    }
  };

  // Load initial data
  useEffect(() => {
    if (userId) {
      loadUserData(userId);
    }
  }, [userId]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRestrictionTypeLabel = (type: string) => {
    switch (type) {
      case 'post_limit':
        return 'Post Limit';
      case 'thread_limit':
        return 'Thread Limit';
      case 'no_images':
        return 'No Images';
      case 'no_links':
        return 'No Links';
      case 'shadow_ban':
        return 'Shadow Ban';
      default:
        return type;
    }
  };

  return (
    <Card className={cn('border-blue-200 bg-blue-50/50', className)}>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <User className='w-6 h-6 text-blue-600' />
            <CardTitle className='text-xl text-blue-800'>
              User Management
            </CardTitle>
            <Badge variant='outline' className='text-xs'>
              {userRole}
            </Badge>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => userId && loadUserData(userId)}
            disabled={isLoading || !userId}
          >
            <RefreshCw
              className={cn('w-4 h-4 mr-2', isLoading && 'animate-spin')}
            />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* User Search */}
        <div className='flex gap-2 mb-6'>
          <div className='flex-1'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground' />
              <Input
                placeholder='Enter User ID...'
                value={searchUserId}
                onChange={e => setSearchUserId(e.target.value)}
                className='pl-10'
                type='number'
              />
            </div>
          </div>
          <Button onClick={handleSearch} disabled={!searchUserId || isLoading}>
            Search
          </Button>
        </div>

        {/* User Actions */}
        {userId && (
          <div className='flex gap-2 mb-6'>
            <BanUserDialog
              userId={userId}
              onSuccess={() => loadUserData(userId)}
              canBan={canBan}
            />
            <RestrictUserDialog
              userId={userId}
              onSuccess={() => loadUserData(userId)}
            />
            <WarnUserDialog
              userId={userId}
              onSuccess={() => loadUserData(userId)}
            />
          </div>
        )}

        {/* Spam Detection Results */}
        {spamResult && (
          <Card className='mb-6 border-orange-200 bg-orange-50/50'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg flex items-center gap-2'>
                <AlertTriangle className='w-5 h-5 text-orange-600' />
                Spam Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <Badge
                    variant={spamResult.isSpam ? 'destructive' : 'outline'}
                  >
                    {spamResult.isSpam ? 'Spam Detected' : 'Clean'}
                  </Badge>
                  <span className='text-sm text-muted-foreground'>
                    Confidence: {Math.round(spamResult.confidence * 100)}%
                  </span>
                  {spamResult.suggestedAction !== 'none' && (
                    <Badge className='bg-yellow-100 text-yellow-800'>
                      Suggested: {spamResult.suggestedAction}
                    </Badge>
                  )}
                </div>
                {spamResult.reasons.length > 0 && (
                  <div>
                    <p className='text-sm font-medium mb-1'>Reasons:</p>
                    <ul className='text-sm text-muted-foreground list-disc list-inside'>
                      {spamResult.reasons.map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* User History Tabs */}
        {userHistory && (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='w-full'
          >
            <TabsList className='grid w-full grid-cols-4'>
              <TabsTrigger value='history'>
                History
                {userHistory.bans.length +
                  userHistory.restrictions.length +
                  userHistory.warnings.length >
                  0 && (
                  <Badge variant='outline' className='ml-2 text-xs'>
                    {userHistory.bans.length +
                      userHistory.restrictions.length +
                      userHistory.warnings.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value='bans'>
                Bans
                {userHistory.bans.length > 0 && (
                  <Badge variant='destructive' className='ml-2 text-xs'>
                    {userHistory.bans.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value='restrictions'>
                Restrictions
                {userHistory.restrictions.length > 0 && (
                  <Badge variant='outline' className='ml-2 text-xs'>
                    {userHistory.restrictions.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value='appeals'>
                Appeals
                {userHistory.appeals.length > 0 && (
                  <Badge variant='outline' className='ml-2 text-xs'>
                    {userHistory.appeals.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value='history' className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <Card>
                  <CardContent className='p-4 text-center'>
                    <Ban className='w-8 h-8 text-red-500 mx-auto mb-2' />
                    <p className='text-2xl font-bold'>
                      {userHistory.bans.length}
                    </p>
                    <p className='text-sm text-muted-foreground'>Total Bans</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className='p-4 text-center'>
                    <Shield className='w-8 h-8 text-orange-500 mx-auto mb-2' />
                    <p className='text-2xl font-bold'>
                      {userHistory.restrictions.length}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      Restrictions
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className='p-4 text-center'>
                    <AlertTriangle className='w-8 h-8 text-yellow-500 mx-auto mb-2' />
                    <p className='text-2xl font-bold'>
                      {userHistory.warnings.length}
                    </p>
                    <p className='text-sm text-muted-foreground'>Warnings</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value='bans' className='space-y-3'>
              {userHistory.bans.length === 0 ? (
                <p className='text-center text-muted-foreground py-8'>
                  No bans found
                </p>
              ) : (
                userHistory.bans.map(ban => (
                  <Card
                    key={ban.id}
                    className={cn(
                      'border-l-4',
                      ban.isActive ? 'border-l-red-400' : 'border-l-gray-400'
                    )}
                  >
                    <CardContent className='p-4'>
                      <div className='flex items-start justify-between'>
                        <div className='space-y-2 flex-1'>
                          <div className='flex items-center gap-2'>
                            <Ban className='w-4 h-4 text-red-500' />
                            <span className='font-medium text-sm'>
                              Ban #{ban.id}
                            </span>
                            <Badge
                              variant={ban.isActive ? 'destructive' : 'outline'}
                              className='text-xs'
                            >
                              {ban.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {ban.duration && (
                              <Badge variant='outline' className='text-xs'>
                                {ban.duration}h
                              </Badge>
                            )}
                          </div>
                          <p className='text-sm text-muted-foreground'>
                            {ban.reason}
                          </p>
                          <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                            <span>Moderator #{ban.moderatorId}</span>
                            <span>
                              {new Date(ban.createdAt).toLocaleString()}
                            </span>
                            {ban.expiresAt && (
                              <span>
                                Expires:{' '}
                                {new Date(ban.expiresAt).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        {ban.isActive && canBan && (
                          <UnbanUserDialog
                            userId={userId!}
                            banId={ban.id}
                            onSuccess={() => loadUserData(userId!)}
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value='restrictions' className='space-y-3'>
              {userHistory.restrictions.length === 0 ? (
                <p className='text-center text-muted-foreground py-8'>
                  No restrictions found
                </p>
              ) : (
                userHistory.restrictions.map(restriction => (
                  <Card
                    key={restriction.id}
                    className={cn(
                      'border-l-4',
                      restriction.isActive
                        ? 'border-l-orange-400'
                        : 'border-l-gray-400'
                    )}
                  >
                    <CardContent className='p-4'>
                      <div className='flex items-start justify-between'>
                        <div className='space-y-2 flex-1'>
                          <div className='flex items-center gap-2'>
                            <Shield className='w-4 h-4 text-orange-500' />
                            <span className='font-medium text-sm'>
                              Restriction #{restriction.id}
                            </span>
                            <Badge variant='outline' className='text-xs'>
                              {getRestrictionTypeLabel(restriction.type)}
                            </Badge>
                            <Badge
                              variant={
                                restriction.isActive ? 'destructive' : 'outline'
                              }
                              className='text-xs'
                            >
                              {restriction.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className='text-sm text-muted-foreground'>
                            {restriction.reason}
                          </p>
                          <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                            <span>Moderator #{restriction.moderatorId}</span>
                            <span>
                              {new Date(restriction.createdAt).toLocaleString()}
                            </span>
                            {restriction.expiresAt && (
                              <span>
                                Expires:{' '}
                                {new Date(
                                  restriction.expiresAt
                                ).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        {restriction.isActive && (
                          <RemoveRestrictionDialog
                            restrictionId={restriction.id}
                            onSuccess={() => loadUserData(userId!)}
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value='appeals' className='space-y-3'>
              {userHistory.appeals.length === 0 ? (
                <p className='text-center text-muted-foreground py-8'>
                  No appeals found
                </p>
              ) : (
                userHistory.appeals.map(appeal => (
                  <Card key={appeal.id}>
                    <CardContent className='p-4'>
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          <Scale className='w-4 h-4 text-blue-500' />
                          <span className='font-medium text-sm'>
                            Appeal #{appeal.id}
                          </span>
                          <Badge variant='outline' className='text-xs'>
                            {appeal.actionType}
                          </Badge>
                          <Badge
                            variant={
                              appeal.status === 'approved'
                                ? 'default'
                                : appeal.status === 'denied'
                                  ? 'destructive'
                                  : 'outline'
                            }
                            className='text-xs'
                          >
                            {appeal.status}
                          </Badge>
                        </div>
                        <p className='text-sm text-muted-foreground'>
                          {appeal.reason}
                        </p>
                        {appeal.moderatorResponse && (
                          <div className='bg-muted/50 p-2 rounded text-sm'>
                            <p className='font-medium'>Moderator Response:</p>
                            <p>{appeal.moderatorResponse}</p>
                          </div>
                        )}
                        <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                          <span>Action #{appeal.actionId}</span>
                          <span>
                            {new Date(appeal.createdAt).toLocaleString()}
                          </span>
                          {appeal.resolvedAt && (
                            <span>
                              Resolved:{' '}
                              {new Date(appeal.resolvedAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        )}

        {isLoading && (
          <div className='text-center py-8'>
            <RefreshCw className='w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground' />
            <p className='text-muted-foreground'>Loading user data...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Dialog Components

interface BanUserDialogProps {
  userId: number;
  onSuccess: () => void;
  canBan: boolean;
}

function BanUserDialog({ userId, onSuccess, canBan }: BanUserDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!canBan) return null;

  const handleSubmit = async () => {
    if (!reason.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/forum/user-management/ban', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          userId,
          reason: reason.trim(),
          duration: duration ? parseInt(duration) : undefined,
        }),
      });

      if (response.ok) {
        setReason('');
        setDuration('');
        setIsOpen(false);
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to ban user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant='destructive' size='sm'>
          <Ban className='w-4 h-4 mr-2' />
          Ban User
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ban User #{userId}</AlertDialogTitle>
          <AlertDialogDescription>
            This action will prevent the user from accessing the forum. Provide
            a clear reason for the ban.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='ban-reason'>Reason *</Label>
            <Textarea
              id='ban-reason'
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder='Explain why this user is being banned...'
              className='min-h-[80px]'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='ban-duration'>
              Duration (hours, leave empty for permanent)
            </Label>
            <Input
              id='ban-duration'
              type='number'
              value={duration}
              onChange={e => setDuration(e.target.value)}
              placeholder='24'
              min='1'
              max='8760'
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={isSubmitting || !reason.trim()}
            className='bg-red-600 hover:bg-red-700'
          >
            {isSubmitting ? 'Banning...' : 'Ban User'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface UnbanUserDialogProps {
  userId: number;
  banId: number;
  onSuccess: () => void;
}

function UnbanUserDialog({ userId, banId, onSuccess }: UnbanUserDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/forum/user-management/unban', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          userId,
          reason: reason.trim(),
        }),
      });

      if (response.ok) {
        setReason('');
        setIsOpen(false);
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to unban user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant='outline' size='sm'>
          <UserCheck className='w-4 h-4 mr-2' />
          Unban
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unban User #{userId}</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove the ban and allow the user to access the forum
            again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className='space-y-2'>
          <Label htmlFor='unban-reason'>Reason *</Label>
          <Textarea
            id='unban-reason'
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder='Explain why this ban is being lifted...'
            className='min-h-[80px]'
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={isSubmitting || !reason.trim()}
          >
            {isSubmitting ? 'Unbanning...' : 'Unban User'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface RestrictUserDialogProps {
  userId: number;
  onSuccess: () => void;
}

function RestrictUserDialog({ userId, onSuccess }: RestrictUserDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<
    'post_limit' | 'thread_limit' | 'no_images' | 'no_links' | 'shadow_ban'
  >('post_limit');
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/forum/user-management/restrict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          userId,
          type,
          reason: reason.trim(),
          duration: duration ? parseInt(duration) : undefined,
        }),
      });

      if (response.ok) {
        setReason('');
        setDuration('');
        setIsOpen(false);
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to restrict user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          <Shield className='w-4 h-4 mr-2' />
          Restrict User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Restrict User #{userId}</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label>Restriction Type</Label>
            <Select value={type} onValueChange={setType as any}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='post_limit'>Post Limit</SelectItem>
                <SelectItem value='thread_limit'>Thread Limit</SelectItem>
                <SelectItem value='no_images'>No Images</SelectItem>
                <SelectItem value='no_links'>No Links</SelectItem>
                <SelectItem value='shadow_ban'>Shadow Ban</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='restrict-reason'>Reason *</Label>
            <Textarea
              id='restrict-reason'
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder='Explain why this restriction is being applied...'
              className='min-h-[80px]'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='restrict-duration'>
              Duration (hours, leave empty for permanent)
            </Label>
            <Input
              id='restrict-duration'
              type='number'
              value={duration}
              onChange={e => setDuration(e.target.value)}
              placeholder='24'
              min='1'
              max='8760'
            />
          </div>
        </div>
        <div className='flex justify-end gap-2'>
          <Button variant='outline' onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !reason.trim()}
          >
            {isSubmitting ? 'Restricting...' : 'Apply Restriction'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface RemoveRestrictionDialogProps {
  restrictionId: number;
  onSuccess: () => void;
}

function RemoveRestrictionDialog({
  restrictionId,
  onSuccess,
}: RemoveRestrictionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/forum/user-management/restrictions/${restrictionId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify({
            reason: reason.trim(),
          }),
        }
      );

      if (response.ok) {
        setReason('');
        setIsOpen(false);
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to remove restriction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant='outline' size='sm'>
          <UserCheck className='w-4 h-4 mr-2' />
          Remove
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Restriction</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove the restriction and restore the user's normal
            permissions.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className='space-y-2'>
          <Label htmlFor='remove-reason'>Reason *</Label>
          <Textarea
            id='remove-reason'
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder='Explain why this restriction is being removed...'
            className='min-h-[80px]'
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={isSubmitting || !reason.trim()}
          >
            {isSubmitting ? 'Removing...' : 'Remove Restriction'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface WarnUserDialogProps {
  userId: number;
  onSuccess: () => void;
}

function WarnUserDialog({ userId, onSuccess }: WarnUserDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/forum/user-management/warn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          userId,
          reason: reason.trim(),
          severity,
        }),
      });

      if (response.ok) {
        setReason('');
        setSeverity('medium');
        setIsOpen(false);
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to warn user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          <MessageSquareWarning className='w-4 h-4 mr-2' />
          Warn User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Warn User #{userId}</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label>Severity</Label>
            <Select value={severity} onValueChange={setSeverity as any}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='low'>Low</SelectItem>
                <SelectItem value='medium'>Medium</SelectItem>
                <SelectItem value='high'>High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='warn-reason'>Reason *</Label>
            <Textarea
              id='warn-reason'
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder='Explain what behavior needs to be corrected...'
              className='min-h-[80px]'
            />
          </div>
        </div>
        <div className='flex justify-end gap-2'>
          <Button variant='outline' onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !reason.trim()}
          >
            {isSubmitting ? 'Warning...' : 'Issue Warning'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
