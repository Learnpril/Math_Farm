/**
 * Avatar Preset Selector Component
 * Math Farm Community Forum - Preset Avatar Configurations
 */

import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sparkles,
  Star,
  Crown,
  Calculator,
  Palette,
  ChevronLeft,
  ChevronRight,
  Shuffle,
} from 'lucide-react';

import type { AvatarPreset, AvatarItemCategory } from '../../types/avatar';
import { AvatarRenderer } from './AvatarRenderer';

interface AvatarPresetSelectorProps {
  category: AvatarItemCategory;
  onPresetApply: (preset: AvatarPreset) => void;
  className?: string;
}

// Mock preset data - in a real app, this would come from the data layer
const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 'preset-math-student',
    name: 'Math Student',
    description: 'Perfect for the dedicated mathematics learner',
    config: {
      layers: [
        {
          itemId: 'bg-chalkboard',
          position: { x: 0, y: 0 },
          scale: 1,
          rotation: 0,
          visible: true,
        },
        {
          itemId: 'body-default',
          position: { x: 50, y: 60 },
          scale: 1,
          rotation: 0,
          color: '#FFE4C4',
          visible: true,
        },
        {
          itemId: 'hair-messy-brown',
          position: { x: 50, y: 30 },
          scale: 1,
          rotation: 0,
          color: '#8B4513',
          visible: true,
        },
        {
          itemId: 'eyes-curious',
          position: { x: 50, y: 45 },
          scale: 1,
          rotation: 0,
          color: '#4A90E2',
          visible: true,
        },
        {
          itemId: 'expression-thinking',
          position: { x: 50, y: 50 },
          scale: 1,
          rotation: 0,
          visible: true,
        },
        {
          itemId: 'shirt-equation-print',
          position: { x: 50, y: 65 },
          scale: 1,
          rotation: 0,
          color: '#E8F4FD',
          visible: true,
        },
        {
          itemId: 'glasses-round',
          position: { x: 50, y: 45 },
          scale: 1,
          rotation: 0,
          color: '#2C3E50',
          visible: true,
        },
        {
          itemId: 'calculator-handheld',
          position: { x: 70, y: 70 },
          scale: 0.8,
          rotation: 15,
          visible: true,
        },
      ],
      backgroundColor: '#F0F8FF',
      size: 'medium',
      pose: 'standing',
      expression: 'thinking',
    },
    requiredItems: [
      'body-default',
      'hair-messy-brown',
      'eyes-curious',
      'expression-thinking',
      'shirt-equation-print',
      'glasses-round',
      'calculator-handheld',
    ],
    mathTheme: 'algebra',
    difficulty: 'beginner',
  },
  {
    id: 'preset-calculus-master',
    name: 'Calculus Master',
    description:
      'For those who have conquered the world of derivatives and integrals',
    config: {
      layers: [
        {
          itemId: 'bg-starfield',
          position: { x: 0, y: 0 },
          scale: 1,
          rotation: 0,
          visible: true,
        },
        {
          itemId: 'body-mathematician',
          position: { x: 50, y: 60 },
          scale: 1,
          rotation: 0,
          color: '#FFE4C4',
          visible: true,
        },
        {
          itemId: 'hair-equation-streaks',
          position: { x: 50, y: 30 },
          scale: 1,
          rotation: 0,
          color: '#FF6B6B',
          visible: true,
        },
        {
          itemId: 'eyes-infinity',
          position: { x: 50, y: 45 },
          scale: 1,
          rotation: 0,
          color: '#9B59B6',
          visible: true,
        },
        {
          itemId: 'expression-eureka',
          position: { x: 50, y: 50 },
          scale: 1,
          rotation: 0,
          visible: true,
        },
        {
          itemId: 'hoodie-calculus',
          position: { x: 50, y: 65 },
          scale: 1,
          rotation: 0,
          color: '#7B68EE',
          visible: true,
        },
        {
          itemId: 'crown-math-master',
          position: { x: 50, y: 25 },
          scale: 1,
          rotation: 0,
          color: '#FFD700',
          visible: true,
        },
        {
          itemId: 'holographic-equations',
          position: { x: 75, y: 40 },
          scale: 0.7,
          rotation: -10,
          color: '#00FFFF',
          visible: true,
        },
      ],
      backgroundColor: '#191970',
      size: 'medium',
      pose: 'celebrating',
      expression: 'eureka',
    },
    requiredItems: [
      'body-mathematician',
      'hair-equation-streaks',
      'eyes-infinity',
      'expression-eureka',
      'hoodie-calculus',
      'crown-math-master',
      'holographic-equations',
    ],
    mathTheme: 'calculus',
    difficulty: 'expert',
  },
  {
    id: 'preset-geometry-explorer',
    name: 'Geometry Explorer',
    description:
      'Ready to explore the world of shapes and spatial relationships',
    config: {
      layers: [
        {
          itemId: 'bg-graph-paper',
          position: { x: 0, y: 0 },
          scale: 1,
          rotation: 0,
          visible: true,
        },
        {
          itemId: 'body-default',
          position: { x: 50, y: 60 },
          scale: 1,
          rotation: 0,
          color: '#FFE4C4',
          visible: true,
        },
        {
          itemId: 'hair-pi-buns',
          position: { x: 50, y: 30 },
          scale: 1,
          rotation: 0,
          color: '#4A4A4A',
          visible: true,
        },
        {
          itemId: 'eyes-curious',
          position: { x: 50, y: 45 },
          scale: 1,
          rotation: 0,
          color: '#4A90E2',
          visible: true,
        },
        {
          itemId: 'expression-happy',
          position: { x: 50, y: 50 },
          scale: 1,
          rotation: 0,
          visible: true,
        },
        {
          itemId: 'shirt-basic-tee',
          position: { x: 50, y: 65 },
          scale: 1,
          rotation: 0,
          color: '#98D8C8',
          visible: true,
        },
        {
          itemId: 'protractor-compass',
          position: { x: 30, y: 70 },
          scale: 0.9,
          rotation: -20,
          visible: true,
        },
        {
          itemId: 'hat-thinking-cap',
          position: { x: 50, y: 28 },
          scale: 1,
          rotation: 0,
          color: '#9B59B6',
          visible: true,
        },
      ],
      backgroundColor: '#F8F8FF',
      size: 'medium',
      pose: 'teaching',
      expression: 'happy',
    },
    requiredItems: [
      'body-default',
      'hair-pi-buns',
      'eyes-curious',
      'expression-happy',
      'shirt-basic-tee',
      'protractor-compass',
      'hat-thinking-cap',
    ],
    mathTheme: 'geometry',
    difficulty: 'intermediate',
  },
  {
    id: 'preset-professor',
    name: 'Math Professor',
    description:
      'The distinguished educator ready to share mathematical wisdom',
    config: {
      layers: [
        {
          itemId: 'bg-chalkboard',
          position: { x: 0, y: 0 },
          scale: 1,
          rotation: 0,
          visible: true,
        },
        {
          itemId: 'body-mathematician',
          position: { x: 50, y: 60 },
          scale: 1,
          rotation: 0,
          color: '#FFE4C4',
          visible: true,
        },
        {
          itemId: 'hair-messy-brown',
          position: { x: 50, y: 30 },
          scale: 1,
          rotation: 0,
          color: '#696969',
          visible: true,
        },
        {
          itemId: 'eyes-curious',
          position: { x: 50, y: 45 },
          scale: 1,
          rotation: 0,
          color: '#4A90E2',
          visible: true,
        },
        {
          itemId: 'expression-happy',
          position: { x: 50, y: 50 },
          scale: 1,
          rotation: 0,
          visible: true,
        },
        {
          itemId: 'lab-coat-professor',
          position: { x: 50, y: 65 },
          scale: 1,
          rotation: 0,
          visible: true,
        },
        {
          itemId: 'glasses-round',
          position: { x: 50, y: 45 },
          scale: 1,
          rotation: 0,
          color: '#2C3E50',
          visible: true,
        },
        {
          itemId: 'graphing-tablet',
          position: { x: 25, y: 75 },
          scale: 0.8,
          rotation: 10,
          visible: true,
        },
      ],
      backgroundColor: '#2F4F2F',
      size: 'medium',
      pose: 'teaching',
      expression: 'happy',
    },
    requiredItems: [
      'body-mathematician',
      'hair-messy-brown',
      'eyes-curious',
      'expression-happy',
      'lab-coat-professor',
      'glasses-round',
      'graphing-tablet',
    ],
    mathTheme: 'advanced',
    difficulty: 'expert',
  },
];

// Difficulty styling
const DIFFICULTY_STYLES = {
  beginner: {
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/20',
    icon: <Star className='w-3 h-3' />,
  },
  intermediate: {
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    icon: <Sparkles className='w-3 h-3' />,
  },
  advanced: {
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/20',
    icon: <Crown className='w-3 h-3' />,
  },
  expert: {
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-100 dark:bg-orange-900/20',
    icon: <Calculator className='w-3 h-3' />,
  },
};

export const AvatarPresetSelector: React.FC<AvatarPresetSelectorProps> = ({
  category,
  onPresetApply,
  className = '',
}) => {
  const [selectedPreset, setSelectedPreset] = useState<AvatarPreset | null>(
    null
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter presets relevant to the current category
  const relevantPresets = useMemo(() => {
    // For now, show all presets regardless of category
    // In the future, you could filter based on which items are most relevant
    return AVATAR_PRESETS;
  }, [category]);

  const handlePresetSelect = (preset: AvatarPreset) => {
    setSelectedPreset(preset);
  };

  const handleApplyPreset = () => {
    if (selectedPreset) {
      onPresetApply(selectedPreset);
      setSelectedPreset(null);
    }
  };

  const handleRandomPreset = () => {
    const randomIndex = Math.floor(Math.random() * relevantPresets.length);
    const randomPreset = relevantPresets[randomIndex];
    onPresetApply(randomPreset);
  };

  const nextPreset = () => {
    setCurrentIndex(prev => (prev + 1) % relevantPresets.length);
  };

  const prevPreset = () => {
    setCurrentIndex(
      prev => (prev - 1 + relevantPresets.length) % relevantPresets.length
    );
  };

  if (relevantPresets.length === 0) {
    return null;
  }

  const currentPreset = relevantPresets[currentIndex];
  const difficultyStyle = DIFFICULTY_STYLES[currentPreset.difficulty];

  return (
    <div className={`avatar-preset-selector ${className}`}>
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center justify-between text-lg'>
            <span className='flex items-center gap-2'>
              <Palette className='w-5 h-5' />
              Avatar Presets
            </span>
            <Button
              variant='outline'
              size='sm'
              onClick={handleRandomPreset}
              title='Apply random preset'
            >
              <Shuffle className='w-4 h-4' />
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className='space-y-4'>
          {/* Preset carousel */}
          <div className='relative'>
            <div className='flex items-center gap-4'>
              {/* Navigation */}
              <Button
                variant='outline'
                size='sm'
                onClick={prevPreset}
                disabled={relevantPresets.length <= 1}
              >
                <ChevronLeft className='w-4 h-4' />
              </Button>

              {/* Current preset display */}
              <div className='flex-1 min-w-0'>
                <Card
                  className={`
                    cursor-pointer transition-all duration-200 hover:shadow-md
                    ${selectedPreset?.id === currentPreset.id ? 'ring-2 ring-purple-500' : ''}
                  `}
                  onClick={() => handlePresetSelect(currentPreset)}
                >
                  <CardContent className='p-4'>
                    <div className='flex gap-4'>
                      {/* Preset preview */}
                      <div className='flex-shrink-0'>
                        <div className='w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg flex items-center justify-center'>
                          {/* Placeholder for preset preview */}
                          <div className='text-2xl'>
                            {currentPreset.mathTheme === 'calculus' && '∫'}
                            {currentPreset.mathTheme === 'geometry' && '△'}
                            {currentPreset.mathTheme === 'algebra' && 'x²'}
                            {currentPreset.mathTheme === 'advanced' && '∞'}
                            {!currentPreset.mathTheme && '🎨'}
                          </div>
                        </div>
                      </div>

                      {/* Preset info */}
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-start justify-between gap-2'>
                          <div>
                            <h4 className='font-semibold text-sm'>
                              {currentPreset.name}
                            </h4>
                            <p className='text-xs text-muted-foreground line-clamp-2 mt-1'>
                              {currentPreset.description}
                            </p>
                          </div>

                          <div className='flex flex-col items-end gap-1'>
                            <Badge
                              variant='secondary'
                              className={`${difficultyStyle.color} ${difficultyStyle.bg} text-xs`}
                            >
                              <span className='mr-1'>
                                {difficultyStyle.icon}
                              </span>
                              {currentPreset.difficulty}
                            </Badge>

                            {currentPreset.mathTheme && (
                              <Badge variant='outline' className='text-xs'>
                                {currentPreset.mathTheme}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Required items count */}
                        <div className='text-xs text-muted-foreground mt-2'>
                          {currentPreset.requiredItems.length} items required
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Navigation */}
              <Button
                variant='outline'
                size='sm'
                onClick={nextPreset}
                disabled={relevantPresets.length <= 1}
              >
                <ChevronRight className='w-4 h-4' />
              </Button>
            </div>

            {/* Preset counter */}
            <div className='text-center text-xs text-muted-foreground mt-2'>
              {currentIndex + 1} of {relevantPresets.length}
            </div>
          </div>

          {/* Apply button */}
          {selectedPreset && (
            <div className='flex gap-2'>
              <Button onClick={handleApplyPreset} className='flex-1'>
                Apply "{selectedPreset.name}"
              </Button>
              <Button variant='outline' onClick={() => setSelectedPreset(null)}>
                Cancel
              </Button>
            </div>
          )}

          {/* All presets grid (collapsed by default) */}
          <details className='group'>
            <summary className='cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors'>
              View All Presets ({relevantPresets.length})
            </summary>

            <div className='mt-3 space-y-2 max-h-60 overflow-y-auto'>
              {relevantPresets.map((preset, index) => {
                const style = DIFFICULTY_STYLES[preset.difficulty];
                return (
                  <TooltipProvider key={preset.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Card
                          className={`
                            cursor-pointer transition-all duration-200 hover:shadow-sm
                            ${selectedPreset?.id === preset.id ? 'ring-1 ring-purple-500' : ''}
                            ${index === currentIndex ? 'bg-purple-50 dark:bg-purple-900/10' : ''}
                          `}
                          onClick={() => {
                            setCurrentIndex(index);
                            handlePresetSelect(preset);
                          }}
                        >
                          <CardContent className='p-3'>
                            <div className='flex items-center gap-3'>
                              <div className='w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded flex items-center justify-center text-sm'>
                                {preset.mathTheme === 'calculus' && '∫'}
                                {preset.mathTheme === 'geometry' && '△'}
                                {preset.mathTheme === 'algebra' && 'x²'}
                                {preset.mathTheme === 'advanced' && '∞'}
                                {!preset.mathTheme && '🎨'}
                              </div>

                              <div className='flex-1 min-w-0'>
                                <div className='font-medium text-sm'>
                                  {preset.name}
                                </div>
                                <div className='text-xs text-muted-foreground'>
                                  {preset.requiredItems.length} items
                                </div>
                              </div>

                              <Badge
                                variant='secondary'
                                className={`${style.color} ${style.bg} text-xs`}
                              >
                                {preset.difficulty}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </TooltipTrigger>

                      <TooltipContent side='right'>
                        <div className='max-w-xs space-y-1'>
                          <div className='font-semibold'>{preset.name}</div>
                          <div className='text-sm'>{preset.description}</div>
                          <div className='text-xs text-muted-foreground'>
                            Click to preview and apply
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </details>

          {/* Help text */}
          <div className='text-xs text-muted-foreground text-center'>
            Presets are pre-configured avatar combinations that match different
            math themes
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvatarPresetSelector;
