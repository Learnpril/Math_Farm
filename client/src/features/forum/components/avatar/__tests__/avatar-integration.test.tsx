/**
 * Avatar System Integration Tests
 * Math Farm Community Forum - Integration tests for the complete avatar system
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AvatarConfigUtils } from '../../../lib/avatar-config';
import { getItemById } from '../../../data/avatar-items';
import type { AvatarConfig } from '../../../types/avatar';

// Mock Canvas API for testing
const mockCanvas = {
  getContext: vi.fn(() => ({
    drawImage: vi.fn(),
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    fillStyle: '',
    font: '',
    textAlign: '',
    fillText: vi.fn(),
    strokeStyle: '',
    lineWidth: 0,
    setLineDash: vi.fn(),
    strokeRect: vi.fn(),
    globalCompositeOperation: '',
    globalAlpha: 1,
  })),
  toDataURL: vi.fn(() => 'data:image/png;base64,mock-image-data'),
  width: 256,
  height: 256,
};

// Mock document.createElement for canvas
const originalCreateElement = document.createElement;
document.createElement = vi.fn((tagName: string) => {
  if (tagName === 'canvas') {
    return mockCanvas as any;
  }
  return originalCreateElement.call(document, tagName);
});

describe('Avatar System Integration', () => {
  let testConfig: AvatarConfig;

  beforeEach(() => {
    testConfig = AvatarConfigUtils.createDefaultConfig(1);
    vi.clearAllMocks();
  });

  describe('Avatar Configuration', () => {
    it('creates valid default configuration', () => {
      expect(testConfig).toBeDefined();
      expect(testConfig.userId).toBe(1);
      expect(testConfig.layers).toBeInstanceOf(Array);
      expect(testConfig.layers.length).toBeGreaterThan(0);
      expect(testConfig.backgroundColor).toBeDefined();
      expect(testConfig.size).toBe('medium');
    });

    it('validates configuration correctly', () => {
      const { AvatarConfigValidator } = require('../../../lib/avatar-config');
      const unlockedItems = [
        'body-default',
        'hair-messy-brown',
        'eyes-curious',
        'expression-happy',
      ];

      const result = AvatarConfigValidator.validateConfig(
        testConfig,
        unlockedItems
      );

      expect(result).toBeDefined();
      expect(result.isValid).toBe(true);
      expect(result.errors).toBeInstanceOf(Array);
      expect(result.warnings).toBeInstanceOf(Array);
    });

    it('clones configuration correctly', () => {
      const cloned = AvatarConfigUtils.cloneConfig(testConfig);

      expect(cloned).not.toBe(testConfig);
      expect(cloned.userId).toBe(testConfig.userId);
      expect(cloned.layers).not.toBe(testConfig.layers);
      expect(cloned.layers.length).toBe(testConfig.layers.length);
    });

    it('sorts layers by z-index correctly', () => {
      const sortedLayers = AvatarConfigUtils.getLayersByZIndex(testConfig);

      expect(sortedLayers).toBeInstanceOf(Array);

      // Check that layers are sorted by z-index
      for (let i = 1; i < sortedLayers.length; i++) {
        const prevItem = getItemById(sortedLayers[i - 1].itemId);
        const currentItem = getItemById(sortedLayers[i].itemId);

        if (prevItem && currentItem) {
          expect(prevItem.zIndex).toBeLessThanOrEqual(currentItem.zIndex);
        }
      }
    });
  });

  describe('Avatar Items', () => {
    it('retrieves items by ID correctly', () => {
      const item = getItemById('body-default');

      expect(item).toBeDefined();
      expect(item?.id).toBe('body-default');
      expect(item?.category).toBe('body');
      expect(item?.rarity).toBeDefined();
    });

    it('returns undefined for non-existent items', () => {
      const item = getItemById('non-existent-item');
      expect(item).toBeUndefined();
    });

    it('has consistent item structure', () => {
      const { ALL_AVATAR_ITEMS } = require('../../../data/avatar-items');

      ALL_AVATAR_ITEMS.forEach((item: any) => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('category');
        expect(item).toHaveProperty('rarity');
        expect(item).toHaveProperty('svgPath');
        expect(item).toHaveProperty('zIndex');
        expect(item).toHaveProperty('unlockCondition');
        expect(item).toHaveProperty('mathThemed');
        expect(item).toHaveProperty('tags');

        expect(typeof item.id).toBe('string');
        expect(typeof item.name).toBe('string');
        expect(typeof item.zIndex).toBe('number');
        expect(typeof item.mathThemed).toBe('boolean');
        expect(Array.isArray(item.tags)).toBe(true);
      });
    });
  });

  describe('Achievement System', () => {
    it('has valid achievement definitions', () => {
      const { ALL_ACHIEVEMENTS } = require('../../../data/avatar-achievements');

      expect(ALL_ACHIEVEMENTS).toBeInstanceOf(Array);
      expect(ALL_ACHIEVEMENTS.length).toBeGreaterThan(0);

      ALL_ACHIEVEMENTS.forEach((achievement: any) => {
        expect(achievement).toHaveProperty('id');
        expect(achievement).toHaveProperty('name');
        expect(achievement).toHaveProperty('description');
        expect(achievement).toHaveProperty('icon');
        expect(achievement).toHaveProperty('unlockedAt');

        expect(typeof achievement.id).toBe('string');
        expect(typeof achievement.name).toBe('string');
        expect(typeof achievement.description).toBe('string');
        expect(typeof achievement.icon).toBe('string');
      });
    });

    it('maps achievement effects correctly', () => {
      const { ACHIEVEMENT_EFFECTS } = require('../AvatarAnimations');

      expect(ACHIEVEMENT_EFFECTS).toBeDefined();
      expect(typeof ACHIEVEMENT_EFFECTS).toBe('object');

      Object.entries(ACHIEVEMENT_EFFECTS).forEach(
        ([achievementId, effects]: [string, any]) => {
          expect(typeof achievementId).toBe('string');
          expect(Array.isArray(effects)).toBe(true);

          effects.forEach((effect: any) => {
            expect(effect).toHaveProperty('type');
            expect(effect).toHaveProperty('intensity');
            expect(effect).toHaveProperty('trigger');

            expect(typeof effect.intensity).toBe('number');
            expect(effect.intensity).toBeGreaterThan(0);
            expect(effect.intensity).toBeLessThanOrEqual(1);
          });
        }
      );
    });
  });

  describe('Canvas Rendering', () => {
    it('creates canvas context successfully', () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      expect(ctx).toBeDefined();
      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
    });

    it('generates image data from canvas', () => {
      const canvas = document.createElement('canvas');
      const imageData = canvas.toDataURL('image/png', 1.0);

      expect(imageData).toBe('data:image/png;base64,mock-image-data');
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png', 1.0);
    });
  });

  describe('Error Handling', () => {
    it('handles missing avatar configuration gracefully', () => {
      const { AvatarConfigValidator } = require('../../../lib/avatar-config');

      // Test with invalid config
      const invalidConfig = { layers: null } as any;
      const result = AvatarConfigValidator.validateConfig(invalidConfig, []);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('handles missing items in configuration', () => {
      const { AvatarConfigValidator } = require('../../../lib/avatar-config');

      // Create config with non-existent item
      const configWithMissingItem = {
        ...testConfig,
        layers: [
          {
            itemId: 'non-existent-item',
            position: { x: 50, y: 50 },
            scale: 1,
            rotation: 0,
            visible: true,
          },
        ],
      };

      const result = AvatarConfigValidator.validateConfig(
        configWithMissingItem,
        []
      );

      expect(result.isValid).toBe(false);
      expect(
        result.errors.some(error => error.includes('does not exist'))
      ).toBe(true);
    });
  });

  describe('Performance Considerations', () => {
    it('optimizes configuration for storage', () => {
      // Add some default values that should be removed
      const unoptimizedConfig = {
        ...testConfig,
        layers: [
          ...testConfig.layers,
          {
            itemId: 'test-item',
            position: { x: 50, y: 50 }, // Default position
            scale: 1, // Default scale
            rotation: 0, // Default rotation
            visible: false, // Should be filtered out
          },
        ],
      };

      const optimized = AvatarConfigUtils.optimizeForStorage(unoptimizedConfig);

      expect(optimized.layers.length).toBeLessThan(
        unoptimizedConfig.layers.length
      );
      expect(optimized.layers.every(layer => layer.visible !== false)).toBe(
        true
      );
    });

    it('calculates configuration size', () => {
      const size = AvatarConfigUtils.getConfigSize(testConfig);

      expect(typeof size).toBe('number');
      expect(size).toBeGreaterThan(0);
    });
  });
});

describe('Type Safety', () => {
  it('enforces correct avatar item categories', () => {
    const { getItemsByCategory } = require('../../../data/avatar-items');

    const bodyItems = getItemsByCategory('body');
    const hairItems = getItemsByCategory('hair');

    expect(Array.isArray(bodyItems)).toBe(true);
    expect(Array.isArray(hairItems)).toBe(true);

    bodyItems.forEach((item: any) => {
      expect(item.category).toBe('body');
    });

    hairItems.forEach((item: any) => {
      expect(item.category).toBe('hair');
    });
  });

  it('enforces correct rarity levels', () => {
    const { getItemsByRarity } = require('../../../data/avatar-items');

    const commonItems = getItemsByRarity('common');
    const rareItems = getItemsByRarity('rare');

    expect(Array.isArray(commonItems)).toBe(true);
    expect(Array.isArray(rareItems)).toBe(true);

    commonItems.forEach((item: any) => {
      expect(item.rarity).toBe('common');
    });

    rareItems.forEach((item: any) => {
      expect(item.rarity).toBe('rare');
    });
  });
});
