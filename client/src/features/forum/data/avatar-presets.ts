/**
 * Chibi Avatar Preset Configurations
 * Math Farm Community Forum - Pre-made Avatar Combinations
 */

import type { AvatarPreset, AvatarConfig } from '../types/avatar';

// Beginner-friendly presets
export const BEGINNER_PRESETS: AvatarPreset[] = [
  {
    id: 'curious-student',
    name: 'Curious Student',
    description: 'Perfect for new math learners with a thirst for knowledge',
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
          itemId: 'pose-standing',
          position: { x: 50, y: 60 },
          scale: 1,
          rotation: 0,
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
          color: '#87CEEB',
          visible: true,
        },
      ],
      backgroundColor: '#F0F8FF',
      size: 'medium',
      pose: 'standing',
      expression: 'happy',
    },
    requiredItems: [
      'body-default',
      'hair-messy-brown',
      'eyes-curious',
      'expression-happy',
      'shirt-basic-tee',
      'pose-standing',
      'bg-chalkboard',
    ],
    mathTheme: 'learning-basics',
    difficulty: 'beginner',
  },
  {
    id: 'friendly-helper',
    name: 'Friendly Helper',
    description: 'Approachable avatar for those who love helping others',
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
          itemId: 'pose-teaching',
          position: { x: 50, y: 60 },
          scale: 1,
          rotation: 0,
          visible: true,
        },
        {
          itemId: 'hair-messy-brown',
          position: { x: 50, y: 30 },
          scale: 1,
          rotation: 0,
          color: '#654321',
          visible: true,
        },
        {
          itemId: 'eyes-curious',
          position: { x: 50, y: 45 },
          scale: 1,
          rotation: 0,
          color: '#228B22',
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
      ],
      backgroundColor: '#F8F8FF',
      size: 'medium',
      pose: 'teaching',
      expression: 'happy',
    },
    requiredItems: [
      'body-default',
      'hair-messy-brown',
      'eyes-curious',
      'expression-happy',
      'shirt-equation-print',
      'glasses-round',
      'pose-teaching',
      'bg-graph-paper',
    ],
    mathTheme: 'helping-others',
    difficulty: 'beginner',
  },
];

// Intermediate presets
export const INTERMEDIATE_PRESETS: AvatarPreset[] = [
  {
    id: 'calculus-enthusiast',
    name: 'Calculus Enthusiast',
    description:
      'For those diving deep into the world of derivatives and integrals',
    config: {
      layers: [
        {
          itemId: 'bg-chalkboard',
          position: { x: 0, y: 0 },
          scale: 1,
          rotation: 0,
          color: '#2F4F2F',
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
          itemId: 'pose-thinking',
          position: { x: 50, y: 60 },
          scale: 1,
          rotation: 0,
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
          itemId: 'eyes-calculator',
          position: { x: 50, y: 45 },
          scale: 1,
          rotation: 0,
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
          itemId: 'hoodie-calculus',
          position: { x: 50, y: 65 },
          scale: 1,
          rotation: 0,
          color: '#7B68EE',
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
      backgroundColor: '#E6E6FA',
      size: 'medium',
      pose: 'thinking',
      expression: 'thinking',
    },
    requiredItems: [
      'body-mathematician',
      'hair-equation-streaks',
      'eyes-calculator',
      'expression-thinking',
      'hoodie-calculus',
      'calculator-handheld',
      'bg-chalkboard',
    ],
    mathTheme: 'calculus',
    difficulty: 'intermediate',
  },
  {
    id: 'geometry-master',
    name: 'Geometry Master',
    description: 'Specialized in shapes, angles, and geometric proofs',
    config: {
      layers: [
        {
          itemId: 'bg-graph-paper',
          position: { x: 0, y: 0 },
          scale: 1,
          rotation: 0,
          color: '#F0F8FF',
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
          itemId: 'pose-teaching',
          position: { x: 50, y: 60 },
          scale: 1,
          rotation: 0,
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
          itemId: 'shirt-equation-print',
          position: { x: 50, y: 65 },
          scale: 1,
          rotation: 0,
          color: '#E8F4FD',
          visible: true,
        },
        {
          itemId: 'protractor-compass',
          position: { x: 30, y: 70 },
          scale: 0.9,
          rotation: -10,
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
      ],
      backgroundColor: '#F5F5DC',
      size: 'medium',
      pose: 'teaching',
      expression: 'eureka',
    },
    requiredItems: [
      'body-mathematician',
      'hair-pi-buns',
      'eyes-curious',
      'expression-eureka',
      'shirt-equation-print',
      'protractor-compass',
      'glasses-round',
      'pose-teaching',
      'bg-graph-paper',
    ],
    mathTheme: 'geometry',
    difficulty: 'intermediate',
  },
];

// Advanced presets
export const ADVANCED_PRESETS: AvatarPreset[] = [
  {
    id: 'research-mathematician',
    name: 'Research Mathematician',
    description: 'Professional mathematician working on cutting-edge problems',
    config: {
      layers: [
        {
          itemId: 'bg-starfield',
          position: { x: 0, y: 0 },
          scale: 1,
          rotation: 0,
          color: '#191970',
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
          itemId: 'pose-standing',
          position: { x: 50, y: 60 },
          scale: 1,
          rotation: 0,
          visible: true,
        },
        {
          itemId: 'hair-equation-streaks',
          position: { x: 50, y: 30 },
          scale: 1,
          rotation: 0,
          color: '#9B59B6',
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
          itemId: 'expression-thinking',
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
          itemId: 'graphing-tablet',
          position: { x: 30, y: 75 },
          scale: 0.8,
          rotation: -5,
          visible: true,
        },
        {
          itemId: 'hat-thinking-cap',
          position: { x: 50, y: 25 },
          scale: 1,
          rotation: 0,
          color: '#9B59B6',
          visible: true,
        },
      ],
      backgroundColor: '#2F2F4F',
      size: 'medium',
      pose: 'standing',
      expression: 'thinking',
    },
    requiredItems: [
      'body-mathematician',
      'hair-equation-streaks',
      'eyes-infinity',
      'expression-thinking',
      'lab-coat-professor',
      'graphing-tablet',
      'hat-thinking-cap',
      'pose-standing',
      'bg-starfield',
    ],
    mathTheme: 'research',
    difficulty: 'advanced',
  },
];

// Expert/Master presets
export const EXPERT_PRESETS: AvatarPreset[] = [
  {
    id: 'math-master-supreme',
    name: 'Math Master Supreme',
    description: 'The ultimate mathematical avatar for true masters',
    config: {
      layers: [
        {
          itemId: 'bg-starfield',
          position: { x: 0, y: 0 },
          scale: 1,
          rotation: 0,
          color: '#191970',
          visible: true,
        },
        {
          itemId: 'body-mathematician',
          position: { x: 50, y: 60 },
          scale: 1.1,
          rotation: 0,
          color: '#FFE4C4',
          visible: true,
        },
        {
          itemId: 'pose-celebrating',
          position: { x: 50, y: 60 },
          scale: 1.1,
          rotation: 0,
          visible: true,
        },
        {
          itemId: 'hair-equation-streaks',
          position: { x: 50, y: 30 },
          scale: 1.1,
          rotation: 0,
          color: '#FFD700',
          visible: true,
        },
        {
          itemId: 'eyes-infinity',
          position: { x: 50, y: 45 },
          scale: 1.1,
          rotation: 0,
          color: '#FFD700',
          visible: true,
        },
        {
          itemId: 'expression-eureka',
          position: { x: 50, y: 50 },
          scale: 1.1,
          rotation: 0,
          visible: true,
        },
        {
          itemId: 'lab-coat-professor',
          position: { x: 50, y: 65 },
          scale: 1.1,
          rotation: 0,
          visible: true,
        },
        {
          itemId: 'holographic-equations',
          position: { x: 75, y: 40 },
          scale: 0.9,
          rotation: 10,
          color: '#00FFFF',
          visible: true,
        },
        {
          itemId: 'crown-math-master',
          position: { x: 50, y: 20 },
          scale: 1,
          rotation: 0,
          color: '#FFD700',
          visible: true,
        },
        {
          itemId: 'badge-pi-day',
          position: { x: 25, y: 65 },
          scale: 0.7,
          rotation: -15,
          visible: true,
        },
      ],
      backgroundColor: '#1E1E3F',
      size: 'large',
      pose: 'celebrating',
      expression: 'eureka',
    },
    requiredItems: [
      'body-mathematician',
      'hair-equation-streaks',
      'eyes-infinity',
      'expression-eureka',
      'lab-coat-professor',
      'holographic-equations',
      'crown-math-master',
      'badge-pi-day',
      'pose-celebrating',
      'bg-starfield',
    ],
    mathTheme: 'mastery',
    difficulty: 'expert',
  },
];

// Combine all presets
export const ALL_AVATAR_PRESETS: AvatarPreset[] = [
  ...BEGINNER_PRESETS,
  ...INTERMEDIATE_PRESETS,
  ...ADVANCED_PRESETS,
  ...EXPERT_PRESETS,
];

// Helper functions for preset management
export const getPresetsByDifficulty = (
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
): AvatarPreset[] => {
  return ALL_AVATAR_PRESETS.filter(preset => preset.difficulty === difficulty);
};

export const getPresetsByMathTheme = (theme: string): AvatarPreset[] => {
  return ALL_AVATAR_PRESETS.filter(preset => preset.mathTheme === theme);
};

export const getPresetById = (id: string): AvatarPreset | undefined => {
  return ALL_AVATAR_PRESETS.find(preset => preset.id === id);
};

export const getAvailablePresets = (
  unlockedItems: string[]
): AvatarPreset[] => {
  return ALL_AVATAR_PRESETS.filter(preset =>
    preset.requiredItems.every(itemId => unlockedItems.includes(itemId))
  );
};

export const getPresetRequirements = (presetId: string): string[] => {
  const preset = getPresetById(presetId);
  return preset ? preset.requiredItems : [];
};
