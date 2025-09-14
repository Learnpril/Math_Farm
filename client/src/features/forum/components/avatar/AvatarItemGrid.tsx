/**
 * Avatar Item Grid Component
 * Math Farm Community Forum - Item Selection Grid with Category-based Display
 */

import React, { useMemo } from 'react';
import { Card, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../../components/ui/tooltip';
import {
  Eye,
  EyeOff,
  Trash2,
  Palette,
  Lock,
  Star,
  Sparkles,
  Crown,
  Calculator,
} from 'lucide-react';

import type {
  AvatarItem,
  AvatarLayer,
  AvatarItemRarity,
} from '../../types/avatar';

interface AvatarItemGridProps {
  items: AvatarItem[];
  unlockedItems: string[];
  selectedItem?: AvatarItem;
  currentLayers: AvatarLayer[];
  onItemSelect: (item: AvatarItem) => void;
  onLayerVisibilityToggle: (itemId: string) => void;
  onLayerRemove: (itemId: string) => void;
  onColorChange: (itemId: string) => void;
}

// Rarity styling configuration
const RARITY_STYLES: Record<
  AvatarItemRarity,
  {
    border: string;
    bg: string;
    text: string;
    icon: React.ReactNode;
    glow?: string;
  }
> = {
  common: {
    border: 'border-gray-300 dark:border-gray-600',
    bg: 'bg-gray-50 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-300',
    icon: <div className='w-3 h-3 rounded-full bg-gray-400' />,
  },
  uncommon: {
    border: 'border-green-300 dark:border-green-600',
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-300',
    icon: <div className='w-3 h-3 rounded-full bg-green-500' />,
  },
  rare: {
    border: 'border-blue-300 dark:border-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-300',
    icon: <Star className='w-3 h-3 text-blue-500' />,
  },
  epic: {
    border: 'border-purple-300 dark:border-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    text: 'text-purple-700 dark:text-purple-300',
    icon: <Sparkles className='w-3 h-3 text-purple-500' />,
    glow: 'shadow-purple-200 dark:shadow-purple-800',
  },
  legendary: {
    border: 'border-orange-300 dark:border-orange-600',
    bg: 'bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20',
    text: 'text-orange-700 dark:text-orange-300',
    icon: <Crown className='w-3 h-3 text-orange-500' />,
    glow: 'shadow-lg shadow-orange-200 dark:shadow-orange-800',
  },
  'math-master': {
    border: 'border-gradient-to-r from-purple-500 to-pink-500',
    bg: 'bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-purple-900/30',
    text: 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600',
    icon: <Calculator className='w-3 h-3 text-purple-500' />,
    glow: 'shadow-xl shadow-purple-300 dark:shadow-purple-700',
  },
};

// Item placeholder component for locked/missing items
const ItemPlaceholder: React.FC<{
  item: AvatarItem;
  isLocked: boolean;
}> = ({ item, isLocked }) => {
  const rarityStyle = RARITY_STYLES[item.rarity];

  return (
    <div
      className={`
      relative aspect-square rounded-lg border-2 p-2 flex flex-col items-center justify-center
      ${rarityStyle.border} ${rarityStyle.bg}
      ${isLocked ? 'opacity-50' : ''}
      ${rarityStyle.glow ? rarityStyle.glow : ''}
    `}
    >
      {/* Placeholder visual */}
      <div className='w-8 h-8 rounded bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center mb-1'>
        {isLocked ? (
          <Lock className='w-4 h-4 text-gray-500' />
        ) : (
          <div className='w-4 h-4 bg-gray-400 rounded' />
        )}
      </div>

      {/* Item name */}
      <div className='text-xs text-center font-medium line-clamp-2'>
        {item.name}
      </div>

      {/* Rarity indicator */}
      <div className='absolute top-1 right-1'>{rarityStyle.icon}</div>

      {/* Math themed indicator */}
      {item.mathThemed && (
        <div className='absolute top-1 left-1'>
          <Calculator className='w-3 h-3 text-purple-500' />
        </div>
      )}

      {/* Lock overlay */}
      {isLocked && (
        <div className='absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center'>
          <Lock className='w-6 h-6 text-gray-600' />
        </div>
      )}
    </div>
  );
};

// Individual item card component
const ItemCard: React.FC<{
  item: AvatarItem;
  isSelected: boolean;
  isActive: boolean;
  isVisible: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onRemove: () => void;
  onColorChange: () => void;
}> = ({
  item,
  isSelected,
  isActive,
  isVisible,
  onSelect,
  onToggleVisibility,
  onRemove,
  onColorChange,
}) => {
  const rarityStyle = RARITY_STYLES[item.rarity];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className={`
            relative cursor-pointer transition-all duration-200 hover:scale-105
            ${isSelected ? 'ring-2 ring-purple-500' : ''}
            ${isActive ? 'ring-2 ring-green-500' : ''}
            ${rarityStyle.glow ? rarityStyle.glow : ''}
          `}
          >
            <CardContent
              className={`
              p-2 aspect-square flex flex-col items-center justify-center
              ${rarityStyle.bg}
            `}
            >
              {/* Item preview */}
              <div
                className='w-12 h-12 rounded bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center mb-2'
                onClick={onSelect}
              >
                {/* Placeholder for actual item image */}
                <div className='text-xs font-mono text-gray-600 dark:text-gray-400 text-center'>
                  {item.id.split('-').pop()?.slice(0, 4)}
                </div>
              </div>

              {/* Item name */}
              <div className='text-xs text-center font-medium line-clamp-2 mb-1'>
                {item.name}
              </div>

              {/* Action buttons for active items */}
              {isActive && (
                <div className='flex gap-1 mt-1'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-6 w-6 p-0'
                    onClick={e => {
                      e.stopPropagation();
                      onToggleVisibility();
                    }}
                    title={isVisible ? 'Hide layer' : 'Show layer'}
                  >
                    {isVisible ? (
                      <Eye className='w-3 h-3' />
                    ) : (
                      <EyeOff className='w-3 h-3' />
                    )}
                  </Button>

                  {item.colorCustomizable && (
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-6 w-6 p-0'
                      onClick={e => {
                        e.stopPropagation();
                        onColorChange();
                      }}
                      title='Change color'
                    >
                      <Palette className='w-3 h-3' />
                    </Button>
                  )}

                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-6 w-6 p-0 text-red-500 hover:text-red-700'
                    onClick={e => {
                      e.stopPropagation();
                      onRemove();
                    }}
                    title='Remove layer'
                  >
                    <Trash2 className='w-3 h-3' />
                  </Button>
                </div>
              )}

              {/* Rarity indicator */}
              <div className='absolute top-1 right-1'>{rarityStyle.icon}</div>

              {/* Math themed indicator */}
              {item.mathThemed && (
                <div className='absolute top-1 left-1'>
                  <Calculator className='w-3 h-3 text-purple-500' />
                </div>
              )}

              {/* Selection indicator */}
              {isSelected && (
                <div className='absolute inset-0 bg-purple-500/10 rounded-lg border-2 border-purple-500' />
              )}
            </CardContent>
          </Card>
        </TooltipTrigger>

        <TooltipContent side='bottom' className='max-w-xs'>
          <div className='space-y-1'>
            <div className='font-semibold'>{item.name}</div>
            <div className='text-sm text-muted-foreground'>
              {item.description}
            </div>
            <div className='flex items-center gap-2 text-xs'>
              <Badge variant='secondary' className={rarityStyle.text}>
                {item.rarity}
              </Badge>
              {item.mathThemed && <Badge variant='outline'>Math Themed</Badge>}
              {item.colorCustomizable && (
                <Badge variant='outline'>Colorizable</Badge>
              )}
            </div>
            <div className='text-xs text-muted-foreground'>
              {item.unlockCondition.description}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const AvatarItemGrid: React.FC<AvatarItemGridProps> = ({
  items,
  unlockedItems,
  selectedItem,
  currentLayers,
  onItemSelect,
  onLayerVisibilityToggle,
  onLayerRemove,
  onColorChange,
}) => {
  // Group items by rarity for better organization
  const itemsByRarity = useMemo(() => {
    const groups: Record<AvatarItemRarity, AvatarItem[]> = {
      common: [],
      uncommon: [],
      rare: [],
      epic: [],
      legendary: [],
      'math-master': [],
    };

    items.forEach(item => {
      groups[item.rarity].push(item);
    });

    return groups;
  }, [items]);

  // Get active layers for this category
  const activeLayers = useMemo(() => {
    return currentLayers.filter(layer => {
      const item = items.find(i => i.id === layer.itemId);
      return item !== undefined;
    });
  }, [currentLayers, items]);

  // Render items in rarity order
  const renderItemsByRarity = () => {
    const rarityOrder: AvatarItemRarity[] = [
      'math-master',
      'legendary',
      'epic',
      'rare',
      'uncommon',
      'common',
    ];

    return rarityOrder
      .map(rarity => {
        const rarityItems = itemsByRarity[rarity];
        if (rarityItems.length === 0) return null;

        const rarityStyle = RARITY_STYLES[rarity];

        return (
          <div key={rarity} className='space-y-2'>
            <div className='flex items-center gap-2'>
              {rarityStyle.icon}
              <h4 className={`font-semibold capitalize ${rarityStyle.text}`}>
                {rarity.replace('-', ' ')} ({rarityItems.length})
              </h4>
            </div>

            <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2'>
              {rarityItems.map(item => {
                const isUnlocked = unlockedItems.includes(item.id);
                const isSelected = selectedItem?.id === item.id;
                const activeLayer = activeLayers.find(
                  l => l.itemId === item.id
                );
                const isActive = !!activeLayer;
                const isVisible = activeLayer?.visible ?? false;

                if (!isUnlocked) {
                  return (
                    <ItemPlaceholder
                      key={item.id}
                      item={item}
                      isLocked={true}
                    />
                  );
                }

                return (
                  <ItemCard
                    key={item.id}
                    item={item}
                    isSelected={isSelected}
                    isActive={isActive}
                    isVisible={isVisible}
                    onSelect={() => onItemSelect(item)}
                    onToggleVisibility={() => onLayerVisibilityToggle(item.id)}
                    onRemove={() => onLayerRemove(item.id)}
                    onColorChange={() => onColorChange(item.id)}
                  />
                );
              })}
            </div>
          </div>
        );
      })
      .filter(Boolean);
  };

  if (items.length === 0) {
    return (
      <div className='text-center py-8 text-muted-foreground'>
        <div className='text-4xl mb-2'>🎨</div>
        <div>No items available in this category</div>
      </div>
    );
  }

  const unlockedCount = items.filter(item =>
    unlockedItems.includes(item.id)
  ).length;
  const activeCount = activeLayers.length;

  return (
    <div className='space-y-6'>
      {/* Category stats */}
      <div className='flex items-center justify-between text-sm text-muted-foreground'>
        <div>
          {unlockedCount} of {items.length} items unlocked
        </div>
        <div>
          {activeCount} active layer{activeCount !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Items grid organized by rarity */}
      <div className='space-y-6'>{renderItemsByRarity()}</div>

      {/* Help text */}
      <div className='text-xs text-muted-foreground text-center space-y-1'>
        <div>Click items to add them to your avatar</div>
        <div>
          Use the eye, palette, and trash icons to control active layers
        </div>
        {items.some(item => !unlockedItems.includes(item.id)) && (
          <div>
            🔒 Locked items can be unlocked by meeting their requirements
          </div>
        )}
      </div>
    </div>
  );
};

export default AvatarItemGrid;
