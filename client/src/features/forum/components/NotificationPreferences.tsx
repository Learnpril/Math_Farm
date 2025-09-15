import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card.js';
import { Label } from '../../../components/ui/label.js';
import { Switch } from '../../../components/ui/switch.js';
import { Button } from '../../../components/ui/button.js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select.js';
import {
  Bell,
  AtSign,
  MessageSquare,
  Heart,
  Trophy,
  Lock,
  Mail,
  Save,
  RefreshCw,
} from 'lucide-react';
import { cn } from '../../../lib/utils.js';
import { useNotifications } from '../hooks/useNotifications.js';
import { NotificationPreferences } from '../types/notifications.js';

interface NotificationPreferencesProps {
  token?: string;
  className?: string;
}

interface PreferenceItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

function PreferenceItem({
  icon,
  title,
  description,
  checked,
  onCheckedChange,
  disabled = false,
}: PreferenceItemProps) {
  return (
    <div className='flex items-center justify-between space-x-4 py-4'>
      <div className='flex items-start space-x-3 flex-1'>
        <div className='flex-shrink-0 mt-1'>{icon}</div>
        <div className='flex-1 min-w-0'>
          <Label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
            {title}
          </Label>
          <p className='text-sm text-muted-foreground mt-1'>{description}</p>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}

export function NotificationPreferencesComponent({
  token,
  className,
}: NotificationPreferencesProps) {
  const { preferences, isLoading, error, updatePreferences } = useNotifications(
    { token }
  );

  const [localPreferences, setLocalPreferences] = React.useState<
    Partial<NotificationPreferences>
  >({});
  const [isSaving, setIsSaving] = React.useState(false);

  // Update local preferences when server preferences change
  React.useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  const handlePreferenceChange = (
    key: keyof NotificationPreferences,
    value: any
  ) => {
    setLocalPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    if (!preferences) return;

    try {
      setIsSaving(true);
      await updatePreferences(localPreferences);
    } catch (err) {
      console.error('Error saving preferences:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  };

  const hasChanges =
    preferences &&
    JSON.stringify(localPreferences) !== JSON.stringify(preferences);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className='p-8 text-center'>
          <div className='animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2' />
          <p className='text-muted-foreground'>Loading preferences...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className='p-8 text-center'>
          <p className='text-destructive mb-4'>{error}</p>
          <Button variant='outline' onClick={() => window.location.reload()}>
            <RefreshCw className='w-4 h-4 mr-2' />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!preferences || !localPreferences) {
    return null;
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* In-App Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Bell className='w-5 h-5' />
            In-App Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-0 divide-y'>
          <PreferenceItem
            icon={<AtSign className='w-4 h-4 text-blue-500' />}
            title='Mentions'
            description='Get notified when someone mentions you in a post'
            checked={localPreferences.mentionsEnabled ?? true}
            onCheckedChange={checked =>
              handlePreferenceChange('mentionsEnabled', checked)
            }
          />

          <PreferenceItem
            icon={<MessageSquare className='w-4 h-4 text-green-500' />}
            title='Replies to your posts'
            description='Get notified when someone replies to your posts'
            checked={localPreferences.repliesEnabled ?? true}
            onCheckedChange={checked =>
              handlePreferenceChange('repliesEnabled', checked)
            }
          />

          <PreferenceItem
            icon={<MessageSquare className='w-4 h-4 text-purple-500' />}
            title='Thread replies'
            description="Get notified about new replies in threads you're subscribed to"
            checked={localPreferences.threadRepliesEnabled ?? true}
            onCheckedChange={checked =>
              handlePreferenceChange('threadRepliesEnabled', checked)
            }
          />

          <PreferenceItem
            icon={<Lock className='w-4 h-4 text-orange-500' />}
            title='Thread updates'
            description='Get notified when threads are locked, pinned, or updated'
            checked={localPreferences.threadUpdatesEnabled ?? true}
            onCheckedChange={checked =>
              handlePreferenceChange('threadUpdatesEnabled', checked)
            }
          />

          <PreferenceItem
            icon={<Heart className='w-4 h-4 text-red-500' />}
            title='Post likes'
            description='Get notified when someone likes your posts'
            checked={localPreferences.likesEnabled ?? true}
            onCheckedChange={checked =>
              handlePreferenceChange('likesEnabled', checked)
            }
          />

          <PreferenceItem
            icon={<Trophy className='w-4 h-4 text-yellow-500' />}
            title='Achievements'
            description='Get notified when you unlock new achievements'
            checked={localPreferences.achievementsEnabled ?? true}
            onCheckedChange={checked =>
              handlePreferenceChange('achievementsEnabled', checked)
            }
          />
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Mail className='w-5 h-5' />
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <PreferenceItem
            icon={<Mail className='w-4 h-4 text-blue-500' />}
            title='Email notifications'
            description='Receive email notifications for important updates'
            checked={localPreferences.emailNotifications ?? false}
            onCheckedChange={checked =>
              handlePreferenceChange('emailNotifications', checked)
            }
          />

          <div className='space-y-2'>
            <Label htmlFor='digest-frequency'>Digest frequency</Label>
            <Select
              value={localPreferences.digestFrequency ?? 'none'}
              onValueChange={value =>
                handlePreferenceChange('digestFrequency', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Select frequency' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='none'>No digest</SelectItem>
                <SelectItem value='daily'>Daily digest</SelectItem>
                <SelectItem value='weekly'>Weekly digest</SelectItem>
              </SelectContent>
            </Select>
            <p className='text-sm text-muted-foreground'>
              Receive a summary of forum activity via email
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Actions */}
      {hasChanges && (
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <p className='text-sm text-muted-foreground'>
                You have unsaved changes
              </p>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleReset}
                  disabled={isSaving}
                >
                  Reset
                </Button>
                <Button size='sm' onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <RefreshCw className='w-4 h-4 mr-2 animate-spin' />
                  ) : (
                    <Save className='w-4 h-4 mr-2' />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
