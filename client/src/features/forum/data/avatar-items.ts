/**
 * Chibi Avatar Items Database
 * Math Farm Community Forum - Avatar Item Definitions
 */

import type {
  AvatarItem,
  AvatarItemCategory,
  AvatarItemRarity,
} from '../types/avatar';

// Base chibi character templates
export const CHIBI_BASE_TEMPLATES: AvatarItem[] = [
  {
    id: 'chibi-base-default',
    name: 'Default Chibi Character',
    category: 'body',
    rarity: 'common',
    description: 'Adorable chibi character base with tank top and shorts',
    svgPath: '/assets/avatar/base/chibi-default.png',
    zIndex: 1,
    unlockCondition: {
      type: 'posts',
      threshold: 0,
      description: 'Available from the start',
    },
    colorCustomizable: false,
    mathThemed: false,
    tags: ['basic', 'starter', 'chibi', 'cute'],
  },
  {
    id: 'body-default',
    name: 'Default Chibi Body',
    category: 'body',
    rarity: 'common',
    description: 'Basic chibi character body with cute proportions',
    svgPath: '/assets/avatar/body/default.svg',
    zIndex: 1,
    unlockCondition: {
      type: 'posts',
      threshold: 0,
      description: 'Available from the start',
    },
    colorCustomizable: true,
    defaultColor: '#FFE4C4',
    mathThemed: false,
    tags: ['basic', 'starter', 'chibi'],
  },
  {
    id: 'body-mathematician',
    name: 'Mathematician Body',
    category: 'body',
    rarity: 'uncommon',
    description: 'Slightly taller chibi body for serious math discussions',
    svgPath: '/assets/avatar/body/mathematician.svg',
    zIndex: 1,
    unlockCondition: {
      type: 'posts',
      threshold: 25,
      description: 'Unlock after 25 forum posts',
    },
    colorCustomizable: true,
    defaultColor: '#FFE4C4',
    mathThemed: true,
    tags: ['academic', 'serious', 'chibi'],
  },
];

// Hair styles with math themes
export const CHIBI_HAIR_STYLES: AvatarItem[] = [
  {
    id: 'hair-messy-brown',
    name: 'Messy Scholar Hair',
    category: 'hair',
    rarity: 'common',
    description: 'Tousled brown hair of a dedicated math student',
    svgPath: '/assets/avatar/hair/messy-brown.svg',
    zIndex: 10,
    unlockCondition: {
      type: 'posts',
      threshold: 0,
      description: 'Available from the start',
    },
    colorCustomizable: true,
    defaultColor: '#8B4513',
    mathThemed: false,
    tags: ['casual', 'student', 'brown'],
  },
  {
    id: 'hair-pi-buns',
    name: 'Pi Symbol Buns',
    category: 'hair',
    rarity: 'rare',
    description: 'Twin buns styled to look like the π symbol',
    svgPath: '/assets/avatar/hair/pi-buns.svg',
    zIndex: 10,
    unlockCondition: {
      type: 'achievement',
      threshold: 1,
      description: 'Solve 10 calculus problems',
    },
    colorCustomizable: true,
    defaultColor: '#4A4A4A',
    mathThemed: true,
    tags: ['pi', 'mathematical', 'cute', 'twin-buns'],
  },
  {
    id: 'hair-equation-streaks',
    name: 'Equation Highlight Streaks',
    category: 'hair',
    rarity: 'epic',
    description: 'Hair with colorful streaks that form mathematical equations',
    svgPath: '/assets/avatar/hair/equation-streaks.svg',
    zIndex: 10,
    unlockCondition: {
      type: 'math-streak',
      threshold: 50,
      description: 'Maintain a 50-day math problem solving streak',
    },
    colorCustomizable: true,
    defaultColor: '#FF6B6B',
    mathThemed: true,
    tags: ['equations', 'colorful', 'advanced', 'streaks'],
  },
];

// Eyes with mathematical expressions
export const CHIBI_EYES: AvatarItem[] = [
  {
    id: 'eyes-curious',
    name: 'Curious Eyes',
    category: 'eyes',
    rarity: 'common',
    description: 'Wide, curious eyes perfect for learning',
    svgPath: '/assets/avatar/eyes/curious.svg',
    zIndex: 5,
    unlockCondition: {
      type: 'posts',
      threshold: 0,
      description: 'Available from the start',
    },
    colorCustomizable: true,
    defaultColor: '#4A90E2',
    mathThemed: false,
    tags: ['basic', 'curious', 'learning'],
  },
  {
    id: 'eyes-calculator',
    name: 'Calculator Display Eyes',
    category: 'eyes',
    rarity: 'uncommon',
    description: 'Eyes that display digital numbers like a calculator',
    svgPath: '/assets/avatar/eyes/calculator.svg',
    zIndex: 5,
    unlockCondition: {
      type: 'posts',
      threshold: 15,
      description: 'Make 15 posts with calculations',
    },
    colorCustomizable: false,
    defaultColor: '#00FF00',
    mathThemed: true,
    tags: ['calculator', 'digital', 'numbers'],
  },
  {
    id: 'eyes-infinity',
    name: 'Infinity Symbol Eyes',
    category: 'eyes',
    rarity: 'legendary',
    description:
      'Eyes shaped like infinity symbols, showing endless mathematical curiosity',
    svgPath: '/assets/avatar/eyes/infinity.svg',
    zIndex: 5,
    unlockCondition: {
      type: 'achievement',
      threshold: 1,
      description: 'Complete advanced calculus topics',
    },
    colorCustomizable: true,
    defaultColor: '#9B59B6',
    mathThemed: true,
    tags: ['infinity', 'advanced', 'calculus', 'legendary'],
  },
];

// Math-themed clothing
export const CHIBI_CLOTHING: AvatarItem[] = [
  {
    id: 'shirt-basic-tee',
    name: 'Basic T-Shirt',
    category: 'clothing',
    rarity: 'common',
    description: 'Simple, comfortable t-shirt for everyday math learning',
    svgPath: '/assets/avatar/clothing/basic-tee.svg',
    zIndex: 3,
    unlockCondition: {
      type: 'posts',
      threshold: 0,
      description: 'Available from the start',
    },
    colorCustomizable: true,
    defaultColor: '#FFFFFF',
    mathThemed: false,
    tags: ['basic', 'casual', 'comfortable'],
  },
  {
    id: 'shirt-equation-print',
    name: 'Equation Print Shirt',
    category: 'clothing',
    rarity: 'uncommon',
    description: 'T-shirt with beautiful mathematical equations printed on it',
    svgPath: '/assets/avatar/clothing/equation-print.svg',
    zIndex: 3,
    unlockCondition: {
      type: 'posts',
      threshold: 20,
      description: 'Share 20 mathematical solutions',
    },
    colorCustomizable: true,
    defaultColor: '#E8F4FD',
    mathThemed: true,
    tags: ['equations', 'mathematical', 'educational'],
  },
  {
    id: 'hoodie-calculus',
    name: 'Calculus Hoodie',
    category: 'clothing',
    rarity: 'rare',
    description: 'Cozy hoodie with integral and derivative symbols',
    svgPath: '/assets/avatar/clothing/calculus-hoodie.svg',
    zIndex: 3,
    unlockCondition: {
      type: 'achievement',
      threshold: 1,
      description: 'Master calculus fundamentals',
    },
    colorCustomizable: true,
    defaultColor: '#7B68EE',
    mathThemed: true,
    tags: ['calculus', 'cozy', 'advanced', 'hoodie'],
  },
  {
    id: 'lab-coat-professor',
    name: 'Professor Lab Coat',
    category: 'clothing',
    rarity: 'epic',
    description: 'Professional lab coat for the most dedicated mathematicians',
    svgPath: '/assets/avatar/clothing/lab-coat.svg',
    zIndex: 3,
    unlockCondition: {
      type: 'forum-activity',
      threshold: 100,
      description: 'Help 100 other users with math problems',
    },
    colorCustomizable: false,
    defaultColor: '#FFFFFF',
    mathThemed: true,
    tags: ['professional', 'professor', 'academic', 'lab-coat'],
  },
];

// Math tool accessories
export const CHIBI_MATH_TOOLS: AvatarItem[] = [
  {
    id: 'calculator-handheld',
    name: 'Handheld Calculator',
    category: 'math-tools',
    rarity: 'common',
    description: 'Classic scientific calculator for quick calculations',
    svgPath: '/assets/avatar/tools/calculator.svg',
    zIndex: 15,
    unlockCondition: {
      type: 'posts',
      threshold: 5,
      description: 'Make 5 posts using calculations',
    },
    colorCustomizable: false,
    mathThemed: true,
    tags: ['calculator', 'scientific', 'basic'],
  },
  {
    id: 'protractor-compass',
    name: 'Geometry Set',
    category: 'math-tools',
    rarity: 'uncommon',
    description: 'Protractor and compass for geometric constructions',
    svgPath: '/assets/avatar/tools/geometry-set.svg',
    zIndex: 15,
    unlockCondition: {
      type: 'achievement',
      threshold: 1,
      description: 'Complete geometry fundamentals',
    },
    colorCustomizable: false,
    mathThemed: true,
    tags: ['geometry', 'protractor', 'compass', 'construction'],
  },
  {
    id: 'graphing-tablet',
    name: 'Digital Graphing Tablet',
    category: 'math-tools',
    rarity: 'rare',
    description:
      'Advanced tablet for creating mathematical graphs and visualizations',
    svgPath: '/assets/avatar/tools/graphing-tablet.svg',
    zIndex: 15,
    unlockCondition: {
      type: 'posts',
      threshold: 50,
      description: 'Create 50 mathematical graphs or visualizations',
    },
    colorCustomizable: false,
    mathThemed: true,
    tags: ['graphing', 'digital', 'visualization', 'advanced'],
  },
  {
    id: 'holographic-equations',
    name: 'Holographic Equation Display',
    category: 'math-tools',
    rarity: 'legendary',
    description: 'Futuristic holographic display showing floating equations',
    svgPath: '/assets/avatar/tools/holographic-display.svg',
    zIndex: 20,
    unlockCondition: {
      type: 'math-streak',
      threshold: 100,
      description: 'Maintain a 100-day problem solving streak',
    },
    colorCustomizable: true,
    defaultColor: '#00FFFF',
    mathThemed: true,
    tags: ['holographic', 'futuristic', 'equations', 'legendary'],
  },
];

// Accessories and props
export const CHIBI_ACCESSORIES: AvatarItem[] = [
  {
    id: 'glasses-round',
    name: 'Round Study Glasses',
    category: 'accessories',
    rarity: 'common',
    description: 'Classic round glasses for focused studying',
    svgPath: '/assets/avatar/accessories/glasses-round.svg',
    zIndex: 12,
    unlockCondition: {
      type: 'posts',
      threshold: 10,
      description: 'Make 10 thoughtful forum posts',
    },
    colorCustomizable: true,
    defaultColor: '#2C3E50',
    mathThemed: false,
    tags: ['glasses', 'studious', 'classic'],
  },
  {
    id: 'hat-thinking-cap',
    name: 'Mathematical Thinking Cap',
    category: 'accessories',
    rarity: 'uncommon',
    description:
      'Special cap that enhances mathematical thinking (or so they say!)',
    svgPath: '/assets/avatar/accessories/thinking-cap.svg',
    zIndex: 11,
    unlockCondition: {
      type: 'achievement',
      threshold: 1,
      description: 'Solve a particularly challenging problem',
    },
    colorCustomizable: true,
    defaultColor: '#9B59B6',
    mathThemed: true,
    tags: ['hat', 'thinking', 'problem-solving'],
  },
  {
    id: 'badge-pi-day',
    name: 'Pi Day Celebration Badge',
    category: 'accessories',
    rarity: 'rare',
    description: 'Special badge commemorating Pi Day participation',
    svgPath: '/assets/avatar/accessories/pi-day-badge.svg',
    zIndex: 14,
    unlockCondition: {
      type: 'achievement',
      threshold: 1,
      description: 'Participate in Pi Day forum events',
    },
    colorCustomizable: false,
    mathThemed: true,
    tags: ['pi-day', 'badge', 'celebration', 'special-event'],
  },
  {
    id: 'crown-math-master',
    name: 'Math Master Crown',
    category: 'accessories',
    rarity: 'math-master',
    description: 'Legendary crown for true masters of mathematics',
    svgPath: '/assets/avatar/accessories/math-crown.svg',
    zIndex: 25,
    unlockCondition: {
      type: 'achievement',
      threshold: 1,
      description: 'Achieve Math Master status in the forum',
    },
    colorCustomizable: true,
    defaultColor: '#FFD700',
    mathThemed: true,
    tags: ['crown', 'master', 'legendary', 'achievement'],
  },
];

// Facial expressions
export const CHIBI_EXPRESSIONS: AvatarItem[] = [
  {
    id: 'expression-happy',
    name: 'Happy Expression',
    category: 'expressions',
    rarity: 'common',
    description: 'Cheerful smile perfect for celebrating solved problems',
    svgPath: '/assets/avatar/expressions/happy.svg',
    zIndex: 6,
    unlockCondition: {
      type: 'posts',
      threshold: 0,
      description: 'Available from the start',
    },
    colorCustomizable: false,
    mathThemed: false,
    tags: ['happy', 'smile', 'positive'],
  },
  {
    id: 'expression-thinking',
    name: 'Deep Thinking',
    category: 'expressions',
    rarity: 'common',
    description: 'Concentrated expression for tackling difficult problems',
    svgPath: '/assets/avatar/expressions/thinking.svg',
    zIndex: 6,
    unlockCondition: {
      type: 'posts',
      threshold: 3,
      description: 'Ask 3 thoughtful questions',
    },
    colorCustomizable: false,
    mathThemed: true,
    tags: ['thinking', 'concentrated', 'problem-solving'],
  },
  {
    id: 'expression-eureka',
    name: 'Eureka Moment',
    category: 'expressions',
    rarity: 'uncommon',
    description: 'The classic "Aha!" expression when understanding clicks',
    svgPath: '/assets/avatar/expressions/eureka.svg',
    zIndex: 6,
    unlockCondition: {
      type: 'achievement',
      threshold: 1,
      description: 'Have your solution marked as "Best Answer" 5 times',
    },
    colorCustomizable: false,
    mathThemed: true,
    tags: ['eureka', 'understanding', 'breakthrough'],
  },
];

// Character poses
export const CHIBI_POSES: AvatarItem[] = [
  {
    id: 'pose-standing',
    name: 'Standing Pose',
    category: 'poses',
    rarity: 'common',
    description: 'Classic standing pose for general forum use',
    svgPath: '/assets/avatar/poses/standing.svg',
    zIndex: 2,
    unlockCondition: {
      type: 'posts',
      threshold: 0,
      description: 'Available from the start',
    },
    colorCustomizable: false,
    mathThemed: false,
    tags: ['standing', 'basic', 'neutral'],
  },
  {
    id: 'pose-teaching',
    name: 'Teaching Pose',
    category: 'poses',
    rarity: 'uncommon',
    description: 'Pointing gesture perfect for explaining concepts',
    svgPath: '/assets/avatar/poses/teaching.svg',
    zIndex: 2,
    unlockCondition: {
      type: 'forum-activity',
      threshold: 25,
      description: 'Help 25 users with their math questions',
    },
    colorCustomizable: false,
    mathThemed: true,
    tags: ['teaching', 'explaining', 'helpful'],
  },
  {
    id: 'pose-celebrating',
    name: 'Victory Celebration',
    category: 'poses',
    rarity: 'rare',
    description: 'Arms raised in triumph after solving a difficult problem',
    svgPath: '/assets/avatar/poses/celebrating.svg',
    zIndex: 2,
    unlockCondition: {
      type: 'achievement',
      threshold: 1,
      description: 'Solve 10 "Expert Level" problems',
    },
    colorCustomizable: false,
    mathThemed: true,
    tags: ['celebrating', 'victory', 'achievement'],
  },
];

// Background themes
export const CHIBI_BACKGROUNDS: AvatarItem[] = [
  {
    id: 'bg-transparent',
    name: 'Transparent Background',
    category: 'background',
    rarity: 'common',
    description: 'Clean transparent background for focus on the character',
    svgPath: '/assets/avatar/backgrounds/transparent.svg',
    zIndex: 0,
    unlockCondition: {
      type: 'posts',
      threshold: 0,
      description: 'Available from the start',
    },
    colorCustomizable: false,
    mathThemed: false,
    tags: ['transparent', 'clean', 'minimal'],
  },
  {
    id: 'bg-chalkboard',
    name: 'Chalkboard Background',
    category: 'background',
    rarity: 'common',
    description: 'Classic classroom chalkboard with faint equation traces',
    svgPath: '/assets/avatar/backgrounds/chalkboard.svg',
    zIndex: 0,
    unlockCondition: {
      type: 'posts',
      threshold: 0,
      description: 'Available from the start',
    },
    colorCustomizable: true,
    defaultColor: '#2F4F2F',
    mathThemed: true,
    tags: ['chalkboard', 'classroom', 'classic'],
  },
  {
    id: 'bg-graph-paper',
    name: 'Graph Paper Background',
    category: 'background',
    rarity: 'common',
    description: 'Clean graph paper perfect for mathematical work',
    svgPath: '/assets/avatar/backgrounds/graph-paper.svg',
    zIndex: 0,
    unlockCondition: {
      type: 'posts',
      threshold: 5,
      description: 'Create 5 posts with graphs or charts',
    },
    colorCustomizable: true,
    defaultColor: '#F8F8FF',
    mathThemed: true,
    tags: ['graph-paper', 'grid', 'mathematical'],
  },
  {
    id: 'bg-starfield',
    name: 'Mathematical Starfield',
    category: 'background',
    rarity: 'epic',
    description:
      'Cosmic background with stars arranged in mathematical patterns',
    svgPath: '/assets/avatar/backgrounds/starfield.svg',
    zIndex: 0,
    unlockCondition: {
      type: 'achievement',
      threshold: 1,
      description: 'Complete advanced mathematics topics',
    },
    colorCustomizable: true,
    defaultColor: '#191970',
    mathThemed: true,
    tags: ['cosmic', 'stars', 'advanced', 'patterns'],
  },
];

// Combine all avatar items
export const ALL_AVATAR_ITEMS: AvatarItem[] = [
  ...CHIBI_BASE_TEMPLATES,
  ...CHIBI_HAIR_STYLES,
  ...CHIBI_EYES,
  ...CHIBI_CLOTHING,
  ...CHIBI_MATH_TOOLS,
  ...CHIBI_ACCESSORIES,
  ...CHIBI_EXPRESSIONS,
  ...CHIBI_POSES,
  ...CHIBI_BACKGROUNDS,
];

// Helper functions for item management
export const getItemsByCategory = (
  category: AvatarItemCategory
): AvatarItem[] => {
  return ALL_AVATAR_ITEMS.filter(item => item.category === category);
};

export const getItemsByRarity = (rarity: AvatarItemRarity): AvatarItem[] => {
  return ALL_AVATAR_ITEMS.filter(item => item.rarity === rarity);
};

export const getMathThemedItems = (): AvatarItem[] => {
  return ALL_AVATAR_ITEMS.filter(item => item.mathThemed);
};

export const getItemById = (id: string): AvatarItem | undefined => {
  return ALL_AVATAR_ITEMS.find(item => item.id === id);
};

export const getUnlockableItems = (userStats: {
  posts: number;
  achievements: string[];
  streak: number;
  helpCount: number;
}): AvatarItem[] => {
  return ALL_AVATAR_ITEMS.filter(item => {
    const condition = item.unlockCondition;
    switch (condition.type) {
      case 'posts':
        return userStats.posts >= condition.threshold;
      case 'achievement':
        return userStats.achievements.length >= condition.threshold;
      case 'math-streak':
        return userStats.streak >= condition.threshold;
      case 'forum-activity':
        return userStats.helpCount >= condition.threshold;
      default:
        return false;
    }
  });
};
