/**
 * Forum Avatar Display Component
 * Math Farm Community Forum - Avatar Display for Posts and Profiles
 */

import React, { useState } from 'react';
import { AvatarThumbnail } from './AvatarThumbnail';
import { AvatarRenderer } from './AvatarRenderer';
import { SimpleAvatarDisplay } from './SimpleAvatarDisplay';
import type { AvatarConfig } from '../../types/avatar';
import { cn } from '../../../../lib/utils';
import { Badge } from '../../../../components/ui/badge';
import { Card, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { User, Crown, Star, Award } from 'lucide-react';

// Size mappings for different avatar sizes
const SIZE_MAP = {
  xs: 32,
  sm: 48,
  md: 64,
  lg: 96,
  xl: 128,
} as const;

interface ForumAvatarDisplayProps {
  config?: AvatarConfig;
  username: string;
  userId: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showUsername?: boolean;
  showAchievements?: boolean;
  showHoverCard?: boolean;
  achievements?: string[];
  userStats?: {
    posts: number;
    likes: number;
    helpfulAnswers: number;
    joinDate: Date;
    lastActive: Date;
  };
  className?: string;
  onClick?: () => void;
}

/**
 * Avatar display component for forum posts and user profiles
 * Includes hover cards with user information and achievement indicators
 */
export function ForumAvatarDisplay({
  config,
  username,
  userId,
  size = 'xl',
  showUsername = false,
  showAchievements = true,
  showHoverCard = true,
  achievements = [],
  userStats,
  className = '',
  onClick,
}: ForumAvatarDisplayProps) {
  const [showHover, setShowHover] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  // Get user's highest achievement tier for badge display
  const getAchievementTier = () => {
    if (
      achievements.includes('community-champion') ||
      achievements.includes('math-master')
    ) {
      return 'legendary';
    }
    if (
      achievements.includes('calculus-master') ||
      achievements.includes('infinity-seeker')
    ) {
      return 'expert';
    }
    if (
      achievements.includes('helpful-member') ||
      achievements.includes('geometry-explorer')
    ) {
      return 'advanced';
    }
    return 'member';
  };

  const achievementTier = getAchievementTier();

  // Get tier-specific styling
  const getTierStyles = () => {
    switch (achievementTier) {
      case 'legendary':
        return {
          borderColor: 'border-yellow-400',
          badgeColor: 'bg-gradient-to-r from-yellow-400 to-orange-500',
          icon: Crown,
        };
      case 'expert':
        return {
          borderColor: 'border-purple-400',
          badgeColor: 'bg-gradient-to-r from-purple-400 to-pink-500',
          icon: Star,
        };
      case 'advanced':
        return {
          borderColor: 'border-blue-400',
          badgeColor: 'bg-gradient-to-r from-blue-400 to-cyan-500',
          icon: Award,
        };
      default:
        return {
          borderColor: 'border-gray-300',
          badgeColor: 'bg-gray-500',
          icon: User,
        };
    }
  };

  const tierStyles = getTierStyles();
  const TierIcon = tierStyles.icon;

  // Handle hover events with delay
  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    const timeout = setTimeout(() => setShowHover(true), 500);
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    const timeout = setTimeout(() => setShowHover(false), 200);
    setHoverTimeout(timeout);
  };

  // Format user stats for display
  const formatUserStats = () => {
    if (!userStats) return null;

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
      }).format(date);
    };

    const formatLastActive = (date: Date) => {
      const now = new Date();
      const diffInHours = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60)
      );

      if (diffInHours < 1) return 'Active now';
      if (diffInHours < 24) return `Active ${diffInHours}h ago`;
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `Active ${diffInDays}d ago`;
      return `Active ${formatDate(date)}`;
    };

    return {
      posts: userStats.posts.toLocaleString(),
      likes: userStats.likes.toLocaleString(),
      helpfulAnswers: userStats.helpfulAnswers.toLocaleString(),
      joinDate: formatDate(userStats.joinDate),
      lastActive: formatLastActive(userStats.lastActive),
    };
  };

  const formattedStats = formatUserStats();

  return (
    <div
      className={cn('relative inline-block', className)}
      onMouseEnter={showHoverCard ? handleMouseEnter : undefined}
      onMouseLeave={showHoverCard ? handleMouseLeave : undefined}
    >
      {/* Avatar with achievement border */}
      <div className='relative'>
        <div
          className={cn(
            'rounded-full p-0.5',
            showAchievements &&
              achievementTier !== 'member' &&
              tierStyles.borderColor,
            showAchievements && achievementTier !== 'member' && 'border-2'
          )}
        >
          {config ? (
            <AvatarThumbnail
              config={config}
              size={size}
              showHoverEffect={true}
              showAchievementEffects={showAchievements}
              achievements={achievements}
              fallbackInitials={username}
              onClick={onClick}
              className='transition-transform duration-200'
            />
          ) : (
            <SimpleAvatarDisplay
              config={config}
              size={SIZE_MAP[size]}
              fallbackInitials={username}
              showBorder={false}
              className='transition-transform duration-200'
            />
          )}
        </div>

        {/* Achievement tier badge */}
        {showAchievements && achievementTier !== 'member' && (
          <div className='absolute -bottom-1 -right-1'>
            <div
              className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center text-white text-xs',
                tierStyles.badgeColor
              )}
            >
              <TierIcon className='w-3 h-3' />
            </div>
          </div>
        )}

        {/* Online status indicator */}
        {userStats && (
          <div className='absolute -bottom-0.5 -right-0.5'>
            <div
              className={cn(
                'w-3 h-3 rounded-full border-2 border-background',
                new Date().getTime() - userStats.lastActive.getTime() <
                  5 * 60 * 1000
                  ? 'bg-green-500' // Online (active within 5 minutes)
                  : new Date().getTime() - userStats.lastActive.getTime() <
                      60 * 60 * 1000
                    ? 'bg-yellow-500' // Away (active within 1 hour)
                    : 'bg-gray-400' // Offline
              )}
            />
          </div>
        )}
      </div>

      {/* Username display */}
      {showUsername && (
        <div className='mt-1 text-center'>
          <span className='text-sm font-medium text-foreground truncate block'>
            {username}
          </span>
          {showAchievements && achievementTier !== 'member' && (
            <Badge variant='secondary' className='text-xs mt-0.5'>
              {achievementTier}
            </Badge>
          )}
        </div>
      )}

      {/* Hover card with user information */}
      {showHoverCard && showHover && (
        <div className='absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2'>
          <Card className='w-64 shadow-lg border'>
            <CardContent className='p-4'>
              {/* User header */}
              <div className='flex items-center gap-3 mb-3'>
                <div className='relative'>
                  <AvatarThumbnail
                    config={config}
                    size='lg'
                    showHoverEffect={false}
                    showAchievementEffects={false}
                    fallbackInitials={username}
                    className='border-2 border-muted'
                  />
                  {showAchievements && achievementTier !== 'member' && (
                    <div className='absolute -bottom-1 -right-1'>
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-white',
                          tierStyles.badgeColor
                        )}
                      >
                        <TierIcon className='w-4 h-4' />
                      </div>
                    </div>
                  )}
                </div>

                <div className='flex-1 min-w-0'>
                  <h4 className='font-semibold text-foreground truncate'>
                    {username}
                  </h4>
                  <p className='text-sm text-muted-foreground capitalize'>
                    {achievementTier} Member
                  </p>
                  {formattedStats && (
                    <p className='text-xs text-muted-foreground'>
                      {formattedStats.lastActive}
                    </p>
                  )}
                </div>
              </div>

              {/* User statistics */}
              {formattedStats && (
                <div className='space-y-2 mb-3'>
                  <div className='grid grid-cols-2 gap-2 text-sm'>
                    <div>
                      <span className='text-muted-foreground'>Posts:</span>
                      <span className='ml-1 font-medium'>
                        {formattedStats.posts}
                      </span>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>Likes:</span>
                      <span className='ml-1 font-medium'>
                        {formattedStats.likes}
                      </span>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>Helpful:</span>
                      <span className='ml-1 font-medium'>
                        {formattedStats.helpfulAnswers}
                      </span>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>Joined:</span>
                      <span className='ml-1 font-medium'>
                        {formattedStats.joinDate}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent achievements */}
              {showAchievements && achievements.length > 0 && (
                <div className='mb-3'>
                  <h5 className='text-xs font-medium text-muted-foreground mb-2'>
                    Recent Achievements
                  </h5>
                  <div className='flex flex-wrap gap-1'>
                    {achievements.slice(0, 3).map(achievement => (
                      <Badge
                        key={achievement}
                        variant='outline'
                        className='text-xs'
                      >
                        {achievement.replace(/-/g, ' ')}
                      </Badge>
                    ))}
                    {achievements.length > 3 && (
                      <Badge variant='outline' className='text-xs'>
                        +{achievements.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className='flex gap-2'>
                <Button
                  size='sm'
                  variant='outline'
                  className='flex-1 text-xs'
                  onClick={() => {
                    // Navigate to user profile
                    window.location.href = `/forum/user/${userId}`;
                  }}
                >
                  View Profile
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  className='flex-1 text-xs'
                  onClick={() => {
                    // Start private message
                    console.log('Start PM with user:', userId);
                  }}
                >
                  Message
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Arrow pointing to avatar */}
          <div className='absolute top-full left-1/2 transform -translate-x-1/2'>
            <div className='w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-border' />
            <div className='w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-background -mt-px' />
          </div>
        </div>
      )}
    </div>
  );
}

export default ForumAvatarDisplay;
