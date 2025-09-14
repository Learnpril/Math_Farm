/**
 * Avatar System Demo Page
 * Math Farm Community Forum - Demonstration of Avatar Rendering and Display System
 */

import React, { useState } from 'react';
import { AvatarManager } from '../components/avatar/AvatarManager';
import { ForumAvatarDisplay } from '../components/avatar/ForumAvatarDisplay';
import { AvatarThumbnail } from '../components/avatar/AvatarThumbnail';
import {
  AvatarAnimations,
  ACHIEVEMENT_EFFECTS,
} from '../components/avatar/AvatarAnimations';
import { AvatarRenderer } from '../components/avatar/AvatarRenderer';
import { SimpleAvatarDisplay } from '../components/avatar/SimpleAvatarDisplay';
import { PostItem } from '../components/PostItem';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs';
import { AvatarConfigUtils } from '../lib/avatar-config';
import type { AvatarConfig } from '../types/avatar';

/**
 * Demo page showcasing the complete avatar rendering and display system
 */
export function AvatarSystemDemo() {
  const [selectedUser, setSelectedUser] = useState(1);

  // Mock user data for demonstration
  const mockUsers = [
    {
      id: 1,
      name: 'MathWizard42',
      achievements: ['calculus-master', 'helpful-member', 'math-mentor'],
      stats: {
        posts: 156,
        likes: 342,
        helpfulAnswers: 89,
        joinDate: new Date('2023-03-15'),
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
    },
    {
      id: 2,
      name: 'GeometryGuru',
      achievements: [
        'geometry-explorer',
        'community-champion',
        'pi-day-participant',
      ],
      stats: {
        posts: 89,
        likes: 234,
        helpfulAnswers: 45,
        joinDate: new Date('2023-01-20'),
        lastActive: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      },
    },
    {
      id: 3,
      name: 'AlgebraAce',
      achievements: ['equation-artist', 'infinity-seeker', 'daily-learner'],
      stats: {
        posts: 67,
        likes: 178,
        helpfulAnswers: 23,
        joinDate: new Date('2023-05-10'),
        lastActive: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      },
    },
  ];

  // Generate mock avatar configs
  const generateMockConfig = (
    userId: number,
    achievements: string[]
  ): AvatarConfig => {
    const baseConfig = AvatarConfigUtils.createDefaultConfig(userId);

    // Customize based on achievements
    if (achievements.includes('calculus-master')) {
      baseConfig.layers.push({
        itemId: 'hoodie-calculus',
        position: { x: 50, y: 65 },
        scale: 1,
        rotation: 0,
        color: '#7B68EE',
        visible: true,
      });
    }

    if (achievements.includes('geometry-explorer')) {
      baseConfig.layers.push({
        itemId: 'protractor-compass',
        position: { x: 70, y: 70 },
        scale: 0.8,
        rotation: 0,
        visible: true,
      });
    }

    if (achievements.includes('community-champion')) {
      baseConfig.layers.push({
        itemId: 'crown-math-master',
        position: { x: 50, y: 20 },
        scale: 0.9,
        rotation: 0,
        color: '#FFD700',
        visible: true,
      });
    }

    if (achievements.includes('helpful-member')) {
      baseConfig.layers.push({
        itemId: 'glasses-round',
        position: { x: 50, y: 45 },
        scale: 1,
        rotation: 0,
        color: '#2C3E50',
        visible: true,
      });
    }

    return baseConfig;
  };

  const currentUser = mockUsers.find(u => u.id === selectedUser)!;
  const currentConfig = generateMockConfig(
    currentUser.id,
    currentUser.achievements
  );

  // Mock forum post for demonstration
  const mockPost = {
    id: 1,
    threadId: 1,
    authorId: currentUser.id,
    authorName: currentUser.name,
    content: `Here's a solution to the quadratic equation problem:

Using the quadratic formula: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$

For the equation $2x^2 + 5x - 3 = 0$:
- $a = 2$, $b = 5$, $c = -3$

$x = \\frac{-5 \\pm \\sqrt{25 + 24}}{4} = \\frac{-5 \\pm 7}{4}$

Therefore: $x_1 = \\frac{1}{2}$ and $x_2 = -3$`,
    mathExpressions: [],
    isEdited: false,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    likeCount: 15,
    isLiked: false,
    authorAvatar: currentConfig,
    authorAchievements: currentUser.achievements,
    authorStats: currentUser.stats,
  };

  return (
    <div className='container mx-auto px-4 py-8 space-y-8'>
      <div className='text-center space-y-2'>
        <h1 className='text-3xl font-bold'>Avatar System Demo</h1>
        <p className='text-muted-foreground'>
          Demonstration of the Math Farm Community Forum avatar rendering and
          display system
        </p>
      </div>

      {/* User Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Demo User</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex gap-4'>
            {mockUsers.map(user => (
              <Button
                key={user.id}
                variant={selectedUser === user.id ? 'default' : 'outline'}
                onClick={() => setSelectedUser(user.id)}
                className='flex items-center gap-2'
              >
                <ForumAvatarDisplay
                  config={generateMockConfig(user.id, user.achievements)}
                  username={user.name}
                  userId={user.id}
                  size='xs'
                  showUsername={false}
                  showHoverCard={false}
                />
                {user.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue='chibi' className='space-y-6'>
        <TabsList className='grid w-full grid-cols-6'>
          <TabsTrigger value='chibi'>Your Chibi</TabsTrigger>
          <TabsTrigger value='display'>Display</TabsTrigger>
          <TabsTrigger value='thumbnails'>Thumbnails</TabsTrigger>
          <TabsTrigger value='animations'>Animations</TabsTrigger>
          <TabsTrigger value='forum'>Forum Integration</TabsTrigger>
          <TabsTrigger value='manager'>Full Manager</TabsTrigger>
        </TabsList>

        {/* Your Chibi Avatar Showcase */}
        <TabsContent value='chibi' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='text-xl'>
                🎭 Your Custom Chibi Avatar
              </CardTitle>
              <p className='text-muted-foreground'>
                This is your adorable chibi character that serves as the base
                for all forum avatars!
              </p>
            </CardHeader>
            <CardContent>
              <div className='flex flex-col items-center space-y-6'>
                {/* Large display of the chibi */}
                <div className='relative'>
                  <SimpleAvatarDisplay
                    config={currentConfig}
                    size={256}
                    fallbackInitials={currentUser.name}
                    showBorder={true}
                    className='shadow-2xl'
                  />
                  <div className='absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold'>
                    ✨ Custom
                  </div>
                </div>
                {/* Size variations */}
                <div className='space-y-4'>
                  <h3 className='text-lg font-semibold text-center'>
                    Available Sizes
                  </h3>
                  <div className='flex items-center justify-center gap-6'>
                    <div className='text-center'>
                      <SimpleAvatarDisplay
                        config={currentConfig}
                        size={32}
                        fallbackInitials={currentUser.name}
                      />
                      <p className='text-xs mt-1 text-muted-foreground'>
                        XS (32px)
                      </p>
                    </div>
                    <div className='text-center'>
                      <SimpleAvatarDisplay
                        config={currentConfig}
                        size={48}
                        fallbackInitials={currentUser.name}
                      />
                      <p className='text-xs mt-1 text-muted-foreground'>
                        Small (48px)
                      </p>
                    </div>
                    <div className='text-center'>
                      <SimpleAvatarDisplay
                        config={currentConfig}
                        size={64}
                        fallbackInitials={currentUser.name}
                      />
                      <p className='text-xs mt-1 text-muted-foreground'>
                        Medium (64px)
                      </p>
                    </div>
                    <div className='text-center'>
                      <SimpleAvatarDisplay
                        config={currentConfig}
                        size={96}
                        fallbackInitials={currentUser.name}
                      />
                      <p className='text-xs mt-1 text-muted-foreground'>
                        Large (96px)
                      </p>
                    </div>
                    <div className='text-center'>
                      <SimpleAvatarDisplay
                        config={currentConfig}
                        size={128}
                        fallbackInitials={currentUser.name}
                      />
                      <p className='text-xs mt-1 text-muted-foreground'>
                        XL (128px)
                      </p>
                    </div>
                  </div>
                </div>
                {/* Usage info */}
                <div className='bg-muted p-4 rounded-lg max-w-md text-center'>
                  <h4 className='font-semibold mb-2'>🎨 How It Works</h4>
                  <p className='text-sm text-muted-foreground'>
                    This chibi character is your default avatar base. Users can
                    customize it with accessories, clothing, and special effects
                    earned through forum participation!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Avatar Display Demo */}
        <TabsContent value='display' className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Your Chibi Avatar</CardTitle>
              </CardHeader>
              <CardContent className='flex justify-center'>
                <SimpleAvatarDisplay
                  config={currentConfig}
                  size={128}
                  fallbackInitials={currentUser.name}
                  showBorder={true}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Basic Display</CardTitle>
              </CardHeader>
              <CardContent className='flex justify-center'>
                <ForumAvatarDisplay
                  config={currentConfig}
                  username={currentUser.name}
                  userId={currentUser.id}
                  size='lg'
                  showUsername={true}
                  showAchievements={true}
                  showHoverCard={false}
                  achievements={currentUser.achievements}
                  userStats={currentUser.stats}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-base'>With Hover Card</CardTitle>
              </CardHeader>
              <CardContent className='flex justify-center'>
                <ForumAvatarDisplay
                  config={currentConfig}
                  username={currentUser.name}
                  userId={currentUser.id}
                  size='lg'
                  showUsername={true}
                  showAchievements={true}
                  showHoverCard={true}
                  achievements={currentUser.achievements}
                  userStats={currentUser.stats}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Different Sizes</CardTitle>
              </CardHeader>
              <CardContent className='flex justify-center items-center gap-4'>
                <SimpleAvatarDisplay
                  config={currentConfig}
                  size={32}
                  fallbackInitials={currentUser.name}
                />
                <SimpleAvatarDisplay
                  config={currentConfig}
                  size={48}
                  fallbackInitials={currentUser.name}
                />
                <SimpleAvatarDisplay
                  config={currentConfig}
                  size={64}
                  fallbackInitials={currentUser.name}
                />
                <SimpleAvatarDisplay
                  config={currentConfig}
                  size={96}
                  fallbackInitials={currentUser.name}
                />
              </CardContent>
            </Card>
          </div>

          {/* Achievement Badges */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>User Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex flex-wrap gap-2'>
                {currentUser.achievements.map(achievement => (
                  <Badge key={achievement} variant='secondary'>
                    {achievement.replace(/-/g, ' ')}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Thumbnail Demo */}
        <TabsContent value='thumbnails' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Thumbnail Sizes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-8 text-center'>
                {(['xs', 'sm', 'md', 'lg'] as const).map(size => (
                  <div key={size} className='space-y-2'>
                    <AvatarThumbnail
                      config={currentConfig}
                      size={size}
                      showAchievementEffects={true}
                      achievements={currentUser.achievements}
                      fallbackInitials={currentUser.name}
                    />
                    <p className='text-sm font-medium capitalize'>{size}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Fallback Avatars</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-3 gap-4 text-center'>
                <div className='space-y-2'>
                  <AvatarThumbnail
                    config={undefined}
                    size='md'
                    fallbackInitials='MW'
                  />
                  <p className='text-sm'>No Config</p>
                </div>
                <div className='space-y-2'>
                  <AvatarThumbnail
                    config={undefined}
                    size='md'
                    fallbackInitials='GG'
                  />
                  <p className='text-sm'>Loading Error</p>
                </div>
                <div className='space-y-2'>
                  <AvatarThumbnail
                    config={undefined}
                    size='md'
                    fallbackInitials='AA'
                  />
                  <p className='text-sm'>Default</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Animation Demo */}
        <TabsContent value='animations' className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {Object.entries(ACHIEVEMENT_EFFECTS).map(
              ([achievement, effects]) => (
                <Card key={achievement}>
                  <CardHeader>
                    <CardTitle className='text-base capitalize'>
                      {achievement.replace(/-/g, ' ')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='flex justify-center'>
                    <AvatarAnimations effects={effects} size={128}>
                      <AvatarRenderer
                        config={currentConfig}
                        size={128}
                        showControls={false}
                        interactive={false}
                      />
                    </AvatarAnimations>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </TabsContent>

        {/* Forum Integration Demo */}
        <TabsContent value='forum' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Forum Post Example</CardTitle>
            </CardHeader>
            <CardContent>
              <PostItem
                post={mockPost}
                currentUserId={999} // Different user to show non-author view
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>User List Example</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {mockUsers.map(user => (
                  <div
                    key={user.id}
                    className='flex items-center gap-4 p-3 border rounded-lg'
                  >
                    <ForumAvatarDisplay
                      config={generateMockConfig(user.id, user.achievements)}
                      username={user.name}
                      userId={user.id}
                      size='md'
                      showUsername={false}
                      showAchievements={true}
                      showHoverCard={true}
                      achievements={user.achievements}
                      userStats={user.stats}
                    />
                    <div className='flex-1'>
                      <h4 className='font-semibold'>{user.name}</h4>
                      <p className='text-sm text-muted-foreground'>
                        {user.stats.posts} posts • {user.achievements.length}{' '}
                        achievements
                      </p>
                    </div>
                    <div className='flex flex-wrap gap-1'>
                      {user.achievements.slice(0, 2).map(achievement => (
                        <Badge
                          key={achievement}
                          variant='outline'
                          className='text-xs'
                        >
                          {achievement.split('-')[0]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Full Manager Demo */}
        <TabsContent value='manager' className='space-y-6'>
          <AvatarManager
            userId={currentUser.id}
            initialConfig={currentConfig}
            achievements={currentUser.achievements}
            unlockedItems={[
              'body-default',
              'hair-messy-brown',
              'eyes-curious',
              'expression-happy',
              'shirt-basic-tee',
              'glasses-round',
              'hoodie-calculus',
              'protractor-compass',
              'crown-math-master',
              'bg-chalkboard',
            ]}
            onSave={async config => {
              console.log('Saving avatar config:', config);
              await new Promise(resolve => setTimeout(resolve, 1000));
              alert('Avatar saved successfully!');
            }}
            onExport={imageData => {
              console.log('Exporting avatar:', imageData.slice(0, 50) + '...');
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AvatarSystemDemo;
