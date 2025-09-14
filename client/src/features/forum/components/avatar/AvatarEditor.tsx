/**
 * Chibi Avatar Editor Component
 * Math Farm Community Forum - Avatar Customization Interface
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../components/ui/tabs';
import { Badge } from '../../../../components/ui/badge';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { Separator } from '../../../../components/ui/separator';
import {
  Palette,
  RotateCcw,
  Save,
  Download,
  Upload,
  Undo,
  Redo,
  Eye,
  EyeOff,
  Trash2,
  Star,
} from 'lucide-react';

import type {
  AvatarConfig,
  AvatarEditorState,
  AvatarItem,
  AvatarItemCategory,
  AvatarLayer,
  AvatarPreset,
} from '../../types/avatar';

import { AvatarRenderer } from './AvatarRenderer';
import { AvatarColorPicker } from './AvatarColorPicker';
import { AvatarItemGrid } from './AvatarItemGrid';
import { AvatarPresetSelector } from './AvatarPresetSelector';

import {
  getItemsByCategory,
  getItemById,
  ALL_AVATAR_ITEMS,
} from '../../data/avatar-items';
import {
  AvatarConfigUtils,
  AvatarConfigValidator,
  DEFAULT_AVATAR_CONFIG,
} from '../../lib/avatar-config';

interface AvatarEditorProps {
  userId: number;
  currentAvatar?: AvatarConfig;
  unlockedItems: string[];
  onSave: (config: AvatarConfig) => Promise<void>;
  onCancel?: () => void;
  className?: string;
}

const AVATAR_CATEGORIES: {
  id: AvatarItemCategory;
  label: string;
  icon: string;
}[] = [
  { id: 'background', label: 'Background', icon: '🎨' },
  { id: 'body', label: 'Body', icon: '👤' },
  { id: 'hair', label: 'Hair', icon: '💇' },
  { id: 'eyes', label: 'Eyes', icon: '👀' },
  { id: 'expressions', label: 'Expression', icon: '😊' },
  { id: 'clothing', label: 'Clothing', icon: '👕' },
  { id: 'accessories', label: 'Accessories', icon: '👓' },
  { id: 'math-tools', label: 'Math Tools', icon: '🧮' },
  { id: 'poses', label: 'Poses', icon: '🤸' },
];

export const AvatarEditor: React.FC<AvatarEditorProps> = ({
  userId,
  currentAvatar,
  unlockedItems,
  onSave,
  onCancel,
  className = '',
}) => {
  // Initialize editor state
  const [editorState, setEditorState] = useState<AvatarEditorState>(() => {
    const initialConfig =
      currentAvatar || AvatarConfigUtils.createDefaultConfig(userId);
    return {
      currentConfig: initialConfig,
      selectedCategory: 'hair',
      selectedItem: undefined,
      previewMode: false,
      unsavedChanges: false,
      history: [initialConfig],
      historyIndex: 0,
    };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedLayerForColor, setSelectedLayerForColor] = useState<
    string | null
  >(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Get available items for current category
  const availableItems = getItemsByCategory(editorState.selectedCategory);
  const unlockedCategoryItems = availableItems.filter(item =>
    unlockedItems.includes(item.id)
  );

  // History management
  const canUndo = editorState.historyIndex > 0;
  const canRedo = editorState.historyIndex < editorState.history.length - 1;

  // Add configuration to history
  const addToHistory = useCallback((config: AvatarConfig) => {
    setEditorState(prev => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(config);

      // Limit history size
      if (newHistory.length > 50) {
        newHistory.shift();
      }

      return {
        ...prev,
        currentConfig: config,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        unsavedChanges: true,
      };
    });
  }, []);

  // Undo/Redo functionality
  const undo = useCallback(() => {
    if (canUndo) {
      setEditorState(prev => ({
        ...prev,
        currentConfig: prev.history[prev.historyIndex - 1],
        historyIndex: prev.historyIndex - 1,
        unsavedChanges: true,
      }));
    }
  }, [canUndo]);

  const redo = useCallback(() => {
    if (canRedo) {
      setEditorState(prev => ({
        ...prev,
        currentConfig: prev.history[prev.historyIndex + 1],
        historyIndex: prev.historyIndex + 1,
        unsavedChanges: true,
      }));
    }
  }, [canRedo]);

  // Handle item selection and application
  const handleItemSelect = useCallback(
    (item: AvatarItem) => {
      const newConfig = AvatarConfigUtils.setItemLayer(
        editorState.currentConfig,
        item.id
      );
      addToHistory(newConfig);

      setEditorState(prev => ({
        ...prev,
        selectedItem: item,
      }));
    },
    [editorState.currentConfig, addToHistory]
  );

  // Handle layer visibility toggle
  const handleLayerVisibilityToggle = useCallback(
    (itemId: string) => {
      const layer = editorState.currentConfig.layers.find(
        l => l.itemId === itemId
      );
      if (layer) {
        const newConfig = AvatarConfigUtils.updateLayer(
          editorState.currentConfig,
          itemId,
          { visible: !layer.visible }
        );
        addToHistory(newConfig);
      }
    },
    [editorState.currentConfig, addToHistory]
  );

  // Handle layer removal
  const handleLayerRemove = useCallback(
    (itemId: string) => {
      const newConfig = {
        ...editorState.currentConfig,
        layers: editorState.currentConfig.layers.filter(
          l => l.itemId !== itemId
        ),
        updatedAt: new Date(),
      };
      addToHistory(newConfig);
    },
    [editorState.currentConfig, addToHistory]
  );

  // Handle color change
  const handleColorChange = useCallback(
    (itemId: string, color: string) => {
      const newConfig = AvatarConfigUtils.updateLayer(
        editorState.currentConfig,
        itemId,
        { color }
      );
      addToHistory(newConfig);
    },
    [editorState.currentConfig, addToHistory]
  );

  // Handle layer position/scale/rotation changes
  const handleLayerTransform = useCallback(
    (
      itemId: string,
      transform: Partial<Pick<AvatarLayer, 'position' | 'scale' | 'rotation'>>
    ) => {
      const newConfig = AvatarConfigUtils.updateLayer(
        editorState.currentConfig,
        itemId,
        transform
      );
      addToHistory(newConfig);
    },
    [editorState.currentConfig, addToHistory]
  );

  // Handle preset application
  const handlePresetApply = useCallback(
    (preset: AvatarPreset) => {
      const newConfig = AvatarConfigUtils.mergeConfigs(
        editorState.currentConfig,
        { ...preset.config, userId }
      );
      addToHistory(newConfig);
    },
    [editorState.currentConfig, userId, addToHistory]
  );

  // Reset to default configuration
  const handleReset = useCallback(() => {
    const defaultConfig = AvatarConfigUtils.createDefaultConfig(userId);
    addToHistory(defaultConfig);
  }, [userId, addToHistory]);

  // Save configuration
  const handleSave = useCallback(async () => {
    setIsLoading(true);
    try {
      // Validate configuration before saving
      const validation = AvatarConfigValidator.validateConfig(
        editorState.currentConfig,
        unlockedItems
      );

      if (!validation.isValid) {
        console.error(
          'Avatar configuration validation failed:',
          validation.errors
        );
        // You might want to show these errors to the user
        return;
      }

      await onSave(editorState.currentConfig);

      setEditorState(prev => ({
        ...prev,
        unsavedChanges: false,
      }));
    } catch (error) {
      console.error('Failed to save avatar configuration:', error);
    } finally {
      setIsLoading(false);
    }
  }, [editorState.currentConfig, unlockedItems, onSave]);

  // Export avatar as image
  const handleExport = useCallback(async () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const link = document.createElement('a');
      link.download = `avatar-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 's':
            e.preventDefault();
            handleSave();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, handleSave]);

  return (
    <div className={`avatar-editor ${className}`}>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 h-full'>
        {/* Left Panel - Avatar Preview */}
        <div className='lg:col-span-1'>
          <Card className='h-full'>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                <span>Avatar Preview</span>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      setEditorState(prev => ({
                        ...prev,
                        previewMode: !prev.previewMode,
                      }))
                    }
                  >
                    {editorState.previewMode ? (
                      <EyeOff className='w-4 h-4' />
                    ) : (
                      <Eye className='w-4 h-4' />
                    )}
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleExport}
                    title='Export as PNG'
                  >
                    <Download className='w-4 h-4' />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col items-center space-y-4'>
              {/* Avatar Canvas */}
              <div className='relative bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4'>
                <AvatarRenderer
                  config={editorState.currentConfig}
                  size={256}
                  ref={canvasRef}
                  showControls={!editorState.previewMode}
                  onLayerSelect={itemId => {
                    const item = getItemById(itemId);
                    if (item) {
                      setEditorState(prev => ({ ...prev, selectedItem: item }));
                    }
                  }}
                  onLayerTransform={handleLayerTransform}
                />
              </div>

              {/* Quick Actions */}
              <div className='flex gap-2 w-full'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={undo}
                  disabled={!canUndo}
                  title='Undo (Ctrl+Z)'
                >
                  <Undo className='w-4 h-4' />
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={redo}
                  disabled={!canRedo}
                  title='Redo (Ctrl+Shift+Z)'
                >
                  <Redo className='w-4 h-4' />
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleReset}
                  title='Reset to Default'
                >
                  <RotateCcw className='w-4 h-4' />
                </Button>
              </div>

              {/* Save/Cancel Actions */}
              <div className='flex gap-2 w-full'>
                <Button
                  onClick={handleSave}
                  disabled={isLoading || !editorState.unsavedChanges}
                  className='flex-1'
                >
                  <Save className='w-4 h-4 mr-2' />
                  {isLoading ? 'Saving...' : 'Save Avatar'}
                </Button>
                {onCancel && (
                  <Button
                    variant='outline'
                    onClick={onCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                )}
              </div>

              {editorState.unsavedChanges && (
                <p className='text-sm text-muted-foreground'>
                  You have unsaved changes
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Customization Options */}
        <div className='lg:col-span-2'>
          <Card className='h-full'>
            <CardHeader>
              <CardTitle>Customize Your Avatar</CardTitle>
            </CardHeader>
            <CardContent className='p-0'>
              <Tabs
                value={editorState.selectedCategory}
                onValueChange={value =>
                  setEditorState(prev => ({
                    ...prev,
                    selectedCategory: value as AvatarItemCategory,
                  }))
                }
                className='h-full'
              >
                {/* Category Tabs */}
                <div className='px-6 pt-2'>
                  <ScrollArea className='w-full'>
                    <TabsList className='grid w-full grid-cols-4 lg:grid-cols-9 gap-1'>
                      {AVATAR_CATEGORIES.map(category => (
                        <TabsTrigger
                          key={category.id}
                          value={category.id}
                          className='flex flex-col items-center gap-1 text-xs'
                        >
                          <span className='text-lg'>{category.icon}</span>
                          <span className='hidden sm:inline'>
                            {category.label}
                          </span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </ScrollArea>
                </div>

                {/* Category Content */}
                <div className='px-6 pb-6'>
                  {AVATAR_CATEGORIES.map(category => (
                    <TabsContent
                      key={category.id}
                      value={category.id}
                      className='mt-4'
                    >
                      <div className='space-y-4'>
                        {/* Category Header */}
                        <div className='flex items-center justify-between'>
                          <h3 className='text-lg font-semibold flex items-center gap-2'>
                            <span className='text-2xl'>{category.icon}</span>
                            {category.label}
                          </h3>
                          <Badge variant='secondary'>
                            {unlockedCategoryItems.length} /{' '}
                            {availableItems.length} unlocked
                          </Badge>
                        </div>

                        {/* Items Grid */}
                        <AvatarItemGrid
                          items={availableItems}
                          unlockedItems={unlockedItems}
                          selectedItem={editorState.selectedItem}
                          currentLayers={editorState.currentConfig.layers}
                          onItemSelect={handleItemSelect}
                          onLayerVisibilityToggle={handleLayerVisibilityToggle}
                          onLayerRemove={handleLayerRemove}
                          onColorChange={itemId => {
                            setSelectedLayerForColor(itemId);
                            setShowColorPicker(true);
                          }}
                        />

                        {/* Preset Selector for certain categories */}
                        {(category.id === 'hair' ||
                          category.id === 'clothing') && (
                          <>
                            <Separator />
                            <AvatarPresetSelector
                              category={category.id}
                              onPresetApply={handlePresetApply}
                            />
                          </>
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Color Picker Modal */}
      {showColorPicker && selectedLayerForColor && (
        <AvatarColorPicker
          itemId={selectedLayerForColor}
          currentColor={
            editorState.currentConfig.layers.find(
              l => l.itemId === selectedLayerForColor
            )?.color || '#000000'
          }
          onColorChange={color =>
            handleColorChange(selectedLayerForColor, color)
          }
          onClose={() => {
            setShowColorPicker(false);
            setSelectedLayerForColor(null);
          }}
        />
      )}
    </div>
  );
};

export default AvatarEditor;
