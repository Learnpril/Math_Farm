/**
 * Avatar Editor Demo Page
 * Math Farm Community Forum - Avatar Editor Demonstration
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { AvatarEditor } from '../components/avatar';
import type { AvatarConfig } from '../types/avatar';
import { AvatarConfigUtils } from '../lib/avatar-config';

export const AvatarEditorDemo: React.FC = () => {
  const [currentAvatar, setCurrentAvatar] = useState<
    AvatarConfig | undefined
  >();
  const [showEditor, setShowEditor] = useState(false);
  const [savedAvatars, setSavedAvatars] = useState<AvatarConfig[]>([]);

  // Mock user data
  const userId = 1;
  const unlockedItems = [
    // Basic items (always unlocked)
    'bg-chalkboard',
    'bg-graph-paper',
    'body-default',
    'hair-messy-brown',
    'eyes-curious',
    'expression-happy',
    'expression-thinking',
    'shirt-basic-tee',
    'pose-standing',

    // Some unlocked items
    'body-mathematician',
    'hair-pi-buns',
    'eyes-calculator',
    'expression-eureka',
    'shirt-equation-print',
    'glasses-round',
    'calculator-handheld',
    'protractor-compass',
    'hat-thinking-cap',
    'pose-teaching',

    // Advanced items (partially unlocked)
    'hoodie-calculus',
    'graphing-tablet',
    'badge-pi-day',
  ];

  const handleSaveAvatar = async (config: AvatarConfig) => {
    try {
      // In a real app, this would save to the server
      console.log('Saving avatar configuration:', config);

      const savedConfig = {
        ...config,
        id: `avatar-${Date.now()}`,
        updatedAt: new Date(),
      };

      setCurrentAvatar(savedConfig);
      setSavedAvatars(prev => [...prev, savedConfig]);
      setShowEditor(false);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Failed to save avatar:', error);
      throw error;
    }
  };

  const handleCreateNew = () => {
    setCurrentAvatar(undefined);
    setShowEditor(true);
  };

  const handleEditCurrent = () => {
    setShowEditor(true);
  };

  const handleLoadAvatar = (avatar: AvatarConfig) => {
    setCurrentAvatar(avatar);
    setShowEditor(false);
  };

  if (showEditor) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4'>
        <div className='max-w-7xl mx-auto'>
          <div className='mb-6'>
            <h1 className='text-3xl font-bold text-center mb-2'>
              Avatar Editor Demo
            </h1>
            <p className='text-muted-foreground text-center'>
              Create and customize your chibi math avatar
            </p>
          </div>

          <AvatarEditor
            userId={userId}
            currentAvatar={currentAvatar}
            unlockedItems={unlockedItems}
            onSave={handleSaveAvatar}
            onCancel={() => setShowEditor(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4'>
      <div className='max-w-4xl mx-auto space-y-6'>
        {/* Header */}
        <div className='text-center'>
          <h1 className='text-3xl font-bold mb-2'>Avatar Editor Demo</h1>
          <p className='text-muted-foreground'>
            Showcase of the chibi avatar customization system
          </p>
        </div>

        {/* Current Avatar Display */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <span>Current Avatar</span>
              <div className='flex gap-2'>
                <Button onClick={handleCreateNew} variant='outline'>
                  Create New
                </Button>
                {currentAvatar && (
                  <Button onClick={handleEditCurrent}>Edit Current</Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentAvatar ? (
              <div className='flex items-center gap-6'>
                <div className='w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg flex items-center justify-center'>
                  {/* Placeholder for avatar preview */}
                  <div className='text-4xl'>👤</div>
                </div>
                <div className='flex-1 space-y-2'>
                  <div>
                    <strong>Avatar ID:</strong> {currentAvatar.id}
                  </div>
                  <div>
                    <strong>Layers:</strong> {currentAvatar.layers.length}
                  </div>
                  <div>
                    <strong>Size:</strong> {currentAvatar.size}
                  </div>
                  <div>
                    <strong>Background:</strong>
                    <span
                      className='inline-block w-4 h-4 rounded ml-2 border'
                      style={{ backgroundColor: currentAvatar.backgroundColor }}
                    />
                  </div>
                  <div>
                    <strong>Last Updated:</strong>{' '}
                    {currentAvatar.updatedAt?.toLocaleString()}
                  </div>
                </div>
              </div>
            ) : (
              <div className='text-center py-8 text-muted-foreground'>
                <div className='text-6xl mb-4'>🎨</div>
                <div className='text-lg mb-2'>No avatar created yet</div>
                <div className='text-sm'>
                  Click "Create New" to start customizing your avatar
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Card>
            <CardContent className='p-4 text-center'>
              <div className='text-2xl font-bold text-purple-600'>
                {unlockedItems.length}
              </div>
              <div className='text-sm text-muted-foreground'>
                Items Unlocked
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4 text-center'>
              <div className='text-2xl font-bold text-blue-600'>
                {savedAvatars.length}
              </div>
              <div className='text-sm text-muted-foreground'>
                Avatars Created
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4 text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {currentAvatar?.layers.length || 0}
              </div>
              <div className='text-sm text-muted-foreground'>Active Layers</div>
            </CardContent>
          </Card>
        </div>

        {/* Saved Avatars */}
        {savedAvatars.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Saved Avatars</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {savedAvatars.map(avatar => (
                  <Card
                    key={avatar.id}
                    className='cursor-pointer hover:shadow-md transition-shadow'
                  >
                    <CardContent className='p-4'>
                      <div className='flex items-center gap-3'>
                        <div className='w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg flex items-center justify-center'>
                          <div className='text-2xl'>👤</div>
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='font-medium text-sm truncate'>
                            {avatar.id}
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            {avatar.layers.length} layers
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            {avatar.updatedAt?.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className='mt-3 flex gap-2'>
                        <Button
                          size='sm'
                          variant='outline'
                          className='flex-1'
                          onClick={() => handleLoadAvatar(avatar)}
                        >
                          Load
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => {
                            setCurrentAvatar(avatar);
                            setShowEditor(true);
                          }}
                        >
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Feature Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Avatar Editor Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <Badge variant='secondary'>✨</Badge>
                  <span className='text-sm'>Real-time canvas preview</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge variant='secondary'>🎨</Badge>
                  <span className='text-sm'>Color customization</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge variant='secondary'>📐</Badge>
                  <span className='text-sm'>Math-themed accessories</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge variant='secondary'>🔄</Badge>
                  <span className='text-sm'>Undo/Redo support</span>
                </div>
              </div>
              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <Badge variant='secondary'>🎭</Badge>
                  <span className='text-sm'>Poses and expressions</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge variant='secondary'>⭐</Badge>
                  <span className='text-sm'>Rarity-based items</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge variant='secondary'>🎯</Badge>
                  <span className='text-sm'>Preset configurations</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge variant='secondary'>💾</Badge>
                  <span className='text-sm'>Export as PNG</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2 text-sm text-muted-foreground'>
            <div>
              1. Click "Create New" or "Edit Current" to open the avatar editor
            </div>
            <div>
              2. Use the category tabs to browse different types of items
            </div>
            <div>3. Click on items to add them to your avatar</div>
            <div>4. Use the color picker to customize colorizable items</div>
            <div>5. Try preset configurations for quick setups</div>
            <div>6. Save your avatar when you're happy with the result</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AvatarEditorDemo;
