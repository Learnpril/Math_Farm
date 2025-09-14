/**
 * Avatar Configuration Management and Validation
 * Math Farm Community Forum - Avatar Config Storage and Validation
 */

import type {
  AvatarConfig,
  AvatarLayer,
  AvatarValidationResult,
  AvatarItem,
  AvatarItemCategory,
} from '../types/avatar';
import { getItemById, ALL_AVATAR_ITEMS } from '../data/avatar-items';

// Default avatar configuration for new users
export const DEFAULT_AVATAR_CONFIG: Omit<AvatarConfig, 'id' | 'userId'> = {
  layers: [
    {
      itemId: 'bg-transparent',
      position: { x: 0, y: 0 },
      scale: 1,
      rotation: 0,
      visible: true,
    },
    {
      itemId: 'chibi-base-default',
      position: { x: 50, y: 50 },
      scale: 1,
      rotation: 0,
      visible: true,
    },
  ],
  backgroundColor: 'transparent',
  size: 'medium',
  pose: 'standing',
  expression: 'neutral',
};

// Avatar configuration validator
export class AvatarConfigValidator {
  // Validate complete avatar configuration
  static validateConfig(
    config: AvatarConfig,
    unlockedItems: string[]
  ): AvatarValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingItems: string[] = [];

    // Validate basic structure
    if (!config.layers || !Array.isArray(config.layers)) {
      errors.push('Avatar configuration must have a layers array');
      return { isValid: false, errors, warnings, missingItems };
    }

    if (!config.backgroundColor || typeof config.backgroundColor !== 'string') {
      errors.push('Avatar must have a valid background color');
    }

    if (!['small', 'medium', 'large'].includes(config.size)) {
      errors.push('Avatar size must be small, medium, or large');
    }

    // Validate layers
    const layerValidation = this.validateLayers(config.layers, unlockedItems);
    errors.push(...layerValidation.errors);
    warnings.push(...layerValidation.warnings);
    missingItems.push(...layerValidation.missingItems);

    // Check for required categories
    const requiredCategories: AvatarItemCategory[] = [
      'body',
      'hair',
      'eyes',
      'expressions',
    ];
    const presentCategories = new Set<AvatarItemCategory>();

    config.layers.forEach(layer => {
      const item = getItemById(layer.itemId);
      if (item) {
        presentCategories.add(item.category);
      }
    });

    requiredCategories.forEach(category => {
      if (!presentCategories.has(category)) {
        warnings.push(`Missing required category: ${category}`);
      }
    });

    // Check for layer conflicts (multiple items of same category where only one should exist)
    const conflictCategories: AvatarItemCategory[] = [
      'body',
      'hair',
      'expressions',
      'poses',
    ];
    conflictCategories.forEach(category => {
      const categoryLayers = config.layers.filter(layer => {
        const item = getItemById(layer.itemId);
        return item?.category === category && layer.visible;
      });

      if (categoryLayers.length > 1) {
        warnings.push(
          `Multiple ${category} items are visible, only one should be active`
        );
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      missingItems,
    };
  }

  // Validate individual layers
  private static validateLayers(
    layers: AvatarLayer[],
    unlockedItems: string[]
  ): AvatarValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingItems: string[] = [];

    layers.forEach((layer, index) => {
      // Validate layer structure
      if (!layer.itemId || typeof layer.itemId !== 'string') {
        errors.push(`Layer ${index}: Missing or invalid itemId`);
        return;
      }

      // Check if item exists
      const item = getItemById(layer.itemId);
      if (!item) {
        errors.push(`Layer ${index}: Item '${layer.itemId}' does not exist`);
        return;
      }

      // Check if item is unlocked
      if (!unlockedItems.includes(layer.itemId)) {
        missingItems.push(layer.itemId);
        warnings.push(`Layer ${index}: Item '${item.name}' is not unlocked`);
      }

      // Validate position
      if (
        !layer.position ||
        typeof layer.position.x !== 'number' ||
        typeof layer.position.y !== 'number'
      ) {
        errors.push(`Layer ${index}: Invalid position coordinates`);
      } else {
        if (layer.position.x < 0 || layer.position.x > 100) {
          warnings.push(
            `Layer ${index}: X position (${layer.position.x}) is outside normal range (0-100)`
          );
        }
        if (layer.position.y < 0 || layer.position.y > 100) {
          warnings.push(
            `Layer ${index}: Y position (${layer.position.y}) is outside normal range (0-100)`
          );
        }
      }

      // Validate scale
      if (typeof layer.scale !== 'number') {
        errors.push(`Layer ${index}: Scale must be a number`);
      } else if (layer.scale <= 0) {
        errors.push(`Layer ${index}: Scale must be greater than 0`);
      } else if (layer.scale > 3) {
        warnings.push(
          `Layer ${index}: Scale (${layer.scale}) is unusually large`
        );
      }

      // Validate rotation
      if (typeof layer.rotation !== 'number') {
        errors.push(`Layer ${index}: Rotation must be a number`);
      } else if (layer.rotation < -360 || layer.rotation > 360) {
        warnings.push(
          `Layer ${index}: Rotation (${layer.rotation}) is outside normal range (-360 to 360)`
        );
      }

      // Validate color (if present)
      if (layer.color && !this.isValidColor(layer.color)) {
        errors.push(`Layer ${index}: Invalid color format '${layer.color}'`);
      }

      // Validate opacity (if present)
      if (layer.opacity !== undefined) {
        if (
          typeof layer.opacity !== 'number' ||
          layer.opacity < 0 ||
          layer.opacity > 1
        ) {
          errors.push(
            `Layer ${index}: Opacity must be a number between 0 and 1`
          );
        }
      }

      // Validate visibility
      if (typeof layer.visible !== 'boolean') {
        errors.push(`Layer ${index}: Visible must be a boolean`);
      }
    });

    return { isValid: errors.length === 0, errors, warnings, missingItems };
  }

  // Validate color format (hex, rgb, hsl, named colors)
  private static isValidColor(color: string): boolean {
    // Hex colors
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
      return true;
    }

    // RGB/RGBA colors
    if (
      /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+)?\s*\)$/.test(color)
    ) {
      return true;
    }

    // HSL/HSLA colors
    if (
      /^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d.]+)?\s*\)$/.test(color)
    ) {
      return true;
    }

    // Named colors (basic check)
    const namedColors = [
      'red',
      'green',
      'blue',
      'yellow',
      'orange',
      'purple',
      'pink',
      'brown',
      'black',
      'white',
      'gray',
      'grey',
      'transparent',
    ];

    return namedColors.includes(color.toLowerCase());
  }
}

// Avatar configuration utilities
export class AvatarConfigUtils {
  // Create a new avatar configuration with default values
  static createDefaultConfig(userId: number): AvatarConfig {
    return {
      userId,
      ...DEFAULT_AVATAR_CONFIG,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Clone an avatar configuration
  static cloneConfig(config: AvatarConfig): AvatarConfig {
    return {
      ...config,
      layers: config.layers.map(layer => ({
        ...layer,
        position: { ...layer.position },
      })),
      updatedAt: new Date(),
    };
  }

  // Merge two configurations (useful for applying presets)
  static mergeConfigs(
    base: AvatarConfig,
    overlay: Partial<AvatarConfig>
  ): AvatarConfig {
    return {
      ...base,
      ...overlay,
      layers: overlay.layers || base.layers,
      updatedAt: new Date(),
    };
  }

  // Get layers sorted by z-index for proper rendering order
  static getLayersByZIndex(config: AvatarConfig): AvatarLayer[] {
    return config.layers
      .filter(layer => layer.visible)
      .sort((a, b) => {
        const itemA = getItemById(a.itemId);
        const itemB = getItemById(b.itemId);
        const zIndexA = itemA?.zIndex || 0;
        const zIndexB = itemB?.zIndex || 0;
        return zIndexA - zIndexB;
      });
  }

  // Remove layers for a specific category
  static removeCategoryLayers(
    config: AvatarConfig,
    category: AvatarItemCategory
  ): AvatarConfig {
    const filteredLayers = config.layers.filter(layer => {
      const item = getItemById(layer.itemId);
      return item?.category !== category;
    });

    return {
      ...config,
      layers: filteredLayers,
      updatedAt: new Date(),
    };
  }

  // Add or replace layer for a specific item
  static setItemLayer(
    config: AvatarConfig,
    itemId: string,
    layerData?: Partial<AvatarLayer>
  ): AvatarConfig {
    const item = getItemById(itemId);
    if (!item) {
      throw new Error(`Item '${itemId}' not found`);
    }

    // Remove existing layers of the same category (for single-item categories)
    const singleItemCategories: AvatarItemCategory[] = [
      'body',
      'hair',
      'expressions',
      'poses',
    ];
    let layers = config.layers;

    if (singleItemCategories.includes(item.category)) {
      layers = layers.filter(layer => {
        const layerItem = getItemById(layer.itemId);
        return layerItem?.category !== item.category;
      });
    }

    // Create new layer with default positioning
    const defaultPosition = this.getDefaultPosition(item.category);
    const newLayer: AvatarLayer = {
      itemId,
      position: defaultPosition,
      scale: 1,
      rotation: 0,
      visible: true,
      ...layerData,
    };

    // Add color if item is customizable
    if (item.colorCustomizable && item.defaultColor) {
      newLayer.color = item.defaultColor;
    }

    return {
      ...config,
      layers: [...layers, newLayer],
      updatedAt: new Date(),
    };
  }

  // Get default position for item category
  private static getDefaultPosition(category: AvatarItemCategory): {
    x: number;
    y: number;
  } {
    const positions: Record<AvatarItemCategory, { x: number; y: number }> = {
      background: { x: 0, y: 0 },
      body: { x: 50, y: 60 },
      hair: { x: 50, y: 30 },
      eyes: { x: 50, y: 45 },
      clothing: { x: 50, y: 65 },
      accessories: { x: 50, y: 40 },
      'math-tools': { x: 70, y: 70 },
      expressions: { x: 50, y: 50 },
      poses: { x: 50, y: 60 },
    };

    return positions[category] || { x: 50, y: 50 };
  }

  // Update layer properties
  static updateLayer(
    config: AvatarConfig,
    itemId: string,
    updates: Partial<AvatarLayer>
  ): AvatarConfig {
    const layers = config.layers.map(layer => {
      if (layer.itemId === itemId) {
        return { ...layer, ...updates };
      }
      return layer;
    });

    return {
      ...config,
      layers,
      updatedAt: new Date(),
    };
  }

  // Get configuration size in bytes (for storage optimization)
  static getConfigSize(config: AvatarConfig): number {
    return JSON.stringify(config).length;
  }

  // Optimize configuration for storage (remove unnecessary properties)
  static optimizeForStorage(config: AvatarConfig): AvatarConfig {
    const optimized = { ...config };

    // Remove layers that are not visible
    optimized.layers = optimized.layers.filter(layer => layer.visible);

    // Remove default values to reduce size
    optimized.layers = optimized.layers.map(layer => {
      const optimizedLayer: Partial<AvatarLayer> = { itemId: layer.itemId };

      if (layer.position.x !== 50 || layer.position.y !== 50) {
        optimizedLayer.position = layer.position;
      }
      if (layer.scale !== 1) optimizedLayer.scale = layer.scale;
      if (layer.rotation !== 0) optimizedLayer.rotation = layer.rotation;
      if (layer.color) optimizedLayer.color = layer.color;
      if (layer.opacity !== undefined && layer.opacity !== 1)
        optimizedLayer.opacity = layer.opacity;
      if (!layer.visible) optimizedLayer.visible = layer.visible;

      return optimizedLayer as AvatarLayer;
    });

    return optimized;
  }
}

// JSON Schema for avatar configuration validation
export const AVATAR_CONFIG_SCHEMA = {
  type: 'object',
  required: [
    'userId',
    'layers',
    'backgroundColor',
    'size',
    'pose',
    'expression',
  ],
  properties: {
    id: { type: 'string' },
    userId: { type: 'number' },
    name: { type: 'string' },
    layers: {
      type: 'array',
      items: {
        type: 'object',
        required: ['itemId', 'position', 'scale', 'rotation', 'visible'],
        properties: {
          itemId: { type: 'string' },
          position: {
            type: 'object',
            required: ['x', 'y'],
            properties: {
              x: { type: 'number', minimum: 0, maximum: 100 },
              y: { type: 'number', minimum: 0, maximum: 100 },
            },
          },
          scale: { type: 'number', minimum: 0.1, maximum: 5 },
          rotation: { type: 'number', minimum: -360, maximum: 360 },
          color: { type: 'string' },
          opacity: { type: 'number', minimum: 0, maximum: 1 },
          visible: { type: 'boolean' },
        },
      },
    },
    backgroundColor: { type: 'string' },
    size: { type: 'string', enum: ['small', 'medium', 'large'] },
    pose: { type: 'string' },
    expression: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};
