/**
 * Avatar Manager Component
 * Math Farm Community Forum - Comprehensive Avatar Management System
 */

import React, { useState, useRef, useCallback } from 'react';
import { AvatarRenderer, AvatarRendererRef } from './AvatarRenderer';
import { AvatarThumbnail, ThumbnailCache } from './AvatarThumbnail';
import { ForumAvatarDisplay } from './ForumAvatarDisplay';
import { AvatarAnimations, getAchievementEffects } from './AvatarAnimations';
import { AvatarEditor } from './AvatarEditor';
import type { AvatarConfig, AvatarEffect } from '../../types/avatar';
import {
  AvatarConfigUtils,
  AvatarConfigValidator,
} from '../../lib/avatar-config';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../components/ui/tabs';
import { Alert, AlertDescription } from '../../../../components/ui/alert';
import {
  Download,
  Upload,
  RefreshCw,
  Save,
  Eye,
  Settings,
  Sparkles,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface AvatarManagerProps {
  userId: number;
  initialConfig?: AvatarConfig;
  achievements?: string[];
  unlockedItems?: string[];
  onSave?: (config: AvatarConfig) => Promise<void>;
  onExport?: (imageData: string) => void;
  className?: string;
  mode?: 'editor' | 'display' | 'preview';
}

/**
 * Comprehensive avatar management component that handles editing, display, and effects
 */
export function AvatarManager({
  userId,
  initialConfig,
  achievements = [],
  unlockedItems = [],
  onSave,
  onExport,
  className = '',
  mode = 'editor',
}: AvatarManagerProps) {
  const [currentConfig, setCurrentConfig] = useState<AvatarConfig>(
    initialConfig || AvatarConfigUtils.createDefaultConfig(userId)
  );
  const [previewMode, setPreviewMode] = useState<
    'static' | 'animated' | 'forum'
  >('static');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showEffects, setShowEffects] = useState(true);
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg'>('png');

  const rendererRef = useRef<AvatarRendererRef>(null);

  // Validate configuration whenever it changes
  React.useEffect(() => {
    const result = AvatarConfigValidator.validateConfig(
      currentConfig,
      unlockedItems
    );
    setValidationResult(result);
  }, [currentConfig, unlockedItems]);

  // Get achievement effects for the user
  const achievementEffects = React.useMemo(
    () => getAchievementEffects(achievements),
    [achievements]
  );

  // Handle configuration updates from editor
  const handleConfigUpdate = useCallback((newConfig: AvatarConfig) => {
    setCurrentConfig(newConfig);
  }, []);

  // Save avatar configuration
  const handleSave = async () => {
    if (!validationResult?.isValid) {
      alert('Please fix validation errors before saving.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave?.(currentConfig);
      // Clear thumbnail cache to force regeneration
      ThumbnailCache.clear();
    } catch (error) {
      console.error('Failed to save avatar:', error);
      alert('Failed to save avatar. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Export avatar as image
  const handleExport = async () => {
    if (!rendererRef.current) return;

    try {
      const imageData = rendererRef.current.exportAsImage(exportFormat, 1.0);
      onExport?.(imageData);

      // Also trigger download
      const link = document.createElement('a');
      link.download = `avatar-${userId}.${exportFormat}`;
      link.href = imageData;
      link.click();
    } catch (error) {
      console.error('Failed to export avatar:', error);
      alert('Failed to export avatar. Please try again.');
    }
  };

  // Reset to default configuration
  const handleReset = () => {
    if (confirm('Are you sure you want to reset your avatar to default?')) {
      const defaultConfig = AvatarConfigUtils.createDefaultConfig(userId);
      setCurrentConfig(defaultConfig);
    }
  };

  // Clear all caches
  const handleClearCache = () => {
    ThumbnailCache.clear();
    rendererRef.current?.clearCache();
    alert('Cache cleared successfully!');
  };

  // Render validation status
  const renderValidationStatus = () => {
    if (!validationResult) return null;

    return (
      <div className='space-y-2'>
        {validationResult.isValid ? (
          <Alert>
            <CheckCircle className='h-4 w-4' />
            <AlertDescription>
              Avatar configuration is valid and ready to save.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant='destructive'>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>
              <div className='space-y-1'>
                <p>Please fix the following issues:</p>
                <ul className='list-disc list-inside text-sm'>
                  {validationResult.errors.map(
                    (error: string, index: number) => (
                      <li key={index}>{error}</li>
                    )
                  )}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {validationResult.warnings.length > 0 && (
          <Alert>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>
              <div className='space-y-1'>
                <p>Warnings:</p>
                <ul className='list-disc list-inside text-sm'>
                  {validationResult.warnings.map(
                    (warning: string, index: number) => (
                      <li key={index}>{warning}</li>
                    )
                  )}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  // Render preview modes
  const renderPreview = () => {
    switch (previewMode) {
      case 'static':
        return (
          <AvatarRenderer
            ref={rendererRef}
            config={currentConfig}
            size={256}
            showControls={false}
            interactive={false}
          />
        );

      case 'animated':
        return (
          <AvatarAnimations
            effects={showEffects ? achievementEffects : []}
            size={256}
          >
            <AvatarRenderer
              config={currentConfig}
              size={256}
              showControls={false}
              interactive={false}
            />
          </AvatarAnimations>
        );

      case 'forum':
        return (
          <div className='space-y-4'>
            <div className='flex items-center gap-4'>
              <ForumAvatarDisplay
                config={currentConfig}
                username='Preview User'
                userId={userId}
                size='lg'
                showUsername={true}
                showAchievements={true}
                showHoverCard={false}
                achievements={achievements}
              />
              <div>
                <h4 className='font-semibold'>Forum Post Preview</h4>
                <p className='text-sm text-muted-foreground'>
                  How your avatar will appear in forum posts
                </p>
              </div>
            </div>

            <div className='grid grid-cols-4 gap-4'>
              {(['xs', 'sm', 'md', 'lg'] as const).map(size => (
                <div key={size} className='text-center'>
                  <AvatarThumbnail
                    config={currentConfig}
                    size={size}
                    showAchievementEffects={showEffects}
                    achievements={achievements}
                    fallbackInitials='PU'
                  />
                  <p className='text-xs text-muted-foreground mt-1 capitalize'>
                    {size}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (mode === 'display') {
    return (
      <ForumAvatarDisplay
        config={currentConfig}
        username='User'
        userId={userId}
        achievements={achievements}
        className={className}
      />
    );
  }

  if (mode === 'preview') {
    return <div className={cn('space-y-4', className)}>{renderPreview()}</div>;
  }

  return (
    <div className={cn('space-y-6', className)}>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Sparkles className='h-5 w-5' />
            Avatar Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue='editor' className='space-y-4'>
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='editor'>Editor</TabsTrigger>
              <TabsTrigger value='preview'>Preview</TabsTrigger>
              <TabsTrigger value='settings'>Settings</TabsTrigger>
            </TabsList>

            <TabsContent value='editor' className='space-y-4'>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* Avatar Editor */}
                <div>
                  <AvatarEditor
                    userId={userId}
                    initialConfig={currentConfig}
                    unlockedItems={unlockedItems}
                    onConfigChange={handleConfigUpdate}
                  />
                </div>

                {/* Live Preview */}
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-lg font-semibold'>Live Preview</h3>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setShowEffects(!showEffects)}
                      >
                        <Sparkles className='h-4 w-4 mr-1' />
                        Effects
                      </Button>
                    </div>
                  </div>

                  <div className='flex justify-center p-4 bg-muted rounded-lg'>
                    {renderPreview()}
                  </div>

                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setPreviewMode('static')}
                      className={previewMode === 'static' ? 'bg-accent' : ''}
                    >
                      Static
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setPreviewMode('animated')}
                      className={previewMode === 'animated' ? 'bg-accent' : ''}
                    >
                      Animated
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setPreviewMode('forum')}
                      className={previewMode === 'forum' ? 'bg-accent' : ''}
                    >
                      Forum
                    </Button>
                  </div>
                </div>
              </div>

              {/* Validation Status */}
              {renderValidationStatus()}

              {/* Action Buttons */}
              <div className='flex items-center justify-between pt-4 border-t'>
                <div className='flex gap-2'>
                  <Button variant='outline' onClick={handleReset}>
                    <RefreshCw className='h-4 w-4 mr-1' />
                    Reset
                  </Button>
                  <Button variant='outline' onClick={handleExport}>
                    <Download className='h-4 w-4 mr-1' />
                    Export
                  </Button>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={!validationResult?.isValid || isSaving}
                >
                  <Save className='h-4 w-4 mr-1' />
                  {isSaving ? 'Saving...' : 'Save Avatar'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value='preview' className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <Card>
                  <CardHeader>
                    <CardTitle className='text-base'>Static Preview</CardTitle>
                  </CardHeader>
                  <CardContent className='flex justify-center'>
                    <AvatarRenderer
                      config={currentConfig}
                      size={200}
                      showControls={false}
                      interactive={false}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-base'>With Effects</CardTitle>
                  </CardHeader>
                  <CardContent className='flex justify-center'>
                    <AvatarAnimations effects={achievementEffects} size={200}>
                      <AvatarRenderer
                        config={currentConfig}
                        size={200}
                        showControls={false}
                        interactive={false}
                      />
                    </AvatarAnimations>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-base'>Forum Display</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <ForumAvatarDisplay
                      config={currentConfig}
                      username='Your Username'
                      userId={userId}
                      size='lg'
                      showUsername={true}
                      showAchievements={true}
                      achievements={achievements}
                    />

                    <div className='text-sm text-muted-foreground'>
                      <p>Achievements: {achievements.length}</p>
                      <p>Effects: {achievementEffects.length}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value='settings' className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <Card>
                  <CardHeader>
                    <CardTitle className='text-base'>Export Settings</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div>
                      <label className='text-sm font-medium'>Format</label>
                      <div className='flex gap-2 mt-1'>
                        <Button
                          variant={
                            exportFormat === 'png' ? 'default' : 'outline'
                          }
                          size='sm'
                          onClick={() => setExportFormat('png')}
                        >
                          PNG
                        </Button>
                        <Button
                          variant={
                            exportFormat === 'jpeg' ? 'default' : 'outline'
                          }
                          size='sm'
                          onClick={() => setExportFormat('jpeg')}
                        >
                          JPEG
                        </Button>
                      </div>
                    </div>

                    <Button onClick={handleExport} className='w-full'>
                      <Download className='h-4 w-4 mr-1' />
                      Export Avatar
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-base'>
                      Cache Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <p className='text-sm text-muted-foreground'>
                      Clear cached avatar thumbnails and images to free up
                      storage space.
                    </p>

                    <Button
                      variant='outline'
                      onClick={handleClearCache}
                      className='w-full'
                    >
                      <RefreshCw className='h-4 w-4 mr-1' />
                      Clear Cache
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Configuration Info */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>
                    Configuration Info
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                    <div>
                      <span className='text-muted-foreground'>Layers:</span>
                      <span className='ml-2 font-medium'>
                        {currentConfig.layers.filter(l => l.visible).length}
                      </span>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>Size:</span>
                      <span className='ml-2 font-medium capitalize'>
                        {currentConfig.size}
                      </span>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>
                        Config Size:
                      </span>
                      <span className='ml-2 font-medium'>
                        {AvatarConfigUtils.getConfigSize(currentConfig)} bytes
                      </span>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>Valid:</span>
                      <Badge
                        variant={
                          validationResult?.isValid ? 'default' : 'destructive'
                        }
                      >
                        {validationResult?.isValid ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default AvatarManager;
