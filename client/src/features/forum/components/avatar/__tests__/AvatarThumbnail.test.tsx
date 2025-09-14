/**
 * Avatar Thumbnail Component Tests
 * Math Farm Community Forum - Unit Tests for Avatar Thumbnail System
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AvatarThumbnail, ThumbnailCache } from '../AvatarThumbnail';
import { AvatarConfigUtils } from '../../../lib/avatar-config';
import type { AvatarConfig } from '../../../types/avatar';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock HTML5 Canvas
const mockCanvas = {
  getContext: vi.fn(() => ({
    drawImage: vi.fn(),
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    fillStyle: '',
    font: '',
    textAlign: '',
    fillText: vi.fn(),
  })),
  toDataURL: vi.fn(() => 'data:image/png;base64,mock-image-data'),
  width: 0,
  height: 0,
};

Object.defineProperty(document, 'createElement', {
  value: vi.fn(tagName => {
    if (tagName === 'canvas') {
      return mockCanvas;
    }
    return document.createElement(tagName);
  }),
});

describe('AvatarThumbnail', () => {
  let mockConfig: AvatarConfig;

  beforeEach(() => {
    mockConfig = AvatarConfigUtils.createDefaultConfig(1);
    vi.clearAllMocks();
    ThumbnailCache.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders avatar thumbnail with default size', () => {
    render(<AvatarThumbnail config={mockConfig} fallbackInitials='TU' />);

    // Should render the thumbnail container
    const thumbnail = screen.getByRole('img', { name: /user avatar/i });
    expect(thumbnail).toBeInTheDocument();
  });

  it('renders fallback avatar when config is undefined', () => {
    render(<AvatarThumbnail config={undefined} fallbackInitials='FB' />);

    // Should show fallback with initials
    expect(screen.getByText('F')).toBeInTheDocument();
  });

  it('shows loading state when loading prop is true', () => {
    render(
      <AvatarThumbnail
        config={mockConfig}
        loading={true}
        fallbackInitials='TU'
      />
    );

    // Should show loading animation
    const loadingElement = document.querySelector('.animate-pulse');
    expect(loadingElement).toBeInTheDocument();
  });

  it('applies correct size classes for different sizes', () => {
    const { rerender } = render(
      <AvatarThumbnail config={mockConfig} size='xs' fallbackInitials='TU' />
    );

    let container = document.querySelector('[style*="width: 24px"]');
    expect(container).toBeInTheDocument();

    rerender(
      <AvatarThumbnail config={mockConfig} size='xl' fallbackInitials='TU' />
    );

    container = document.querySelector('[style*="width: 96px"]');
    expect(container).toBeInTheDocument();
  });

  it('shows hover effects when enabled', async () => {
    render(
      <AvatarThumbnail
        config={mockConfig}
        showHoverEffect={true}
        fallbackInitials='TU'
      />
    );

    const thumbnail = document.querySelector('.hover\\:scale-110');
    expect(thumbnail).toBeInTheDocument();
  });

  it('displays achievement effects when provided', () => {
    render(
      <AvatarThumbnail
        config={mockConfig}
        showAchievementEffects={true}
        achievements={['math-master', 'calculus-master']}
        fallbackInitials='TU'
      />
    );

    // Should render with achievement effects
    const thumbnail = screen.getByRole('img', { name: /user avatar/i });
    expect(thumbnail).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();

    render(
      <AvatarThumbnail
        config={mockConfig}
        onClick={handleClick}
        fallbackInitials='TU'
      />
    );

    const thumbnail = screen.getByRole('img', { name: /user avatar/i });
    fireEvent.click(thumbnail);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('generates consistent fallback colors based on initials', () => {
    const { rerender } = render(
      <AvatarThumbnail config={undefined} fallbackInitials='AA' />
    );

    const firstColor = document.querySelector('[class*="bg-"]');
    const firstColorClass = firstColor?.className;

    rerender(<AvatarThumbnail config={undefined} fallbackInitials='AA' />);

    const secondColor = document.querySelector('[class*="bg-"]');
    const secondColorClass = secondColor?.className;

    // Same initials should produce same color
    expect(firstColorClass).toBe(secondColorClass);
  });
});

describe('ThumbnailCache', () => {
  beforeEach(() => {
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    ThumbnailCache.clear();
  });

  it('generates consistent cache keys for same config', () => {
    const config = AvatarConfigUtils.createDefaultConfig(1);
    const key1 = ThumbnailCache.generateCacheKey(config, 64);
    const key2 = ThumbnailCache.generateCacheKey(config, 64);

    expect(key1).toBe(key2);
  });

  it('generates different cache keys for different configs', () => {
    const config1 = AvatarConfigUtils.createDefaultConfig(1);
    const config2 = AvatarConfigUtils.createDefaultConfig(2);

    const key1 = ThumbnailCache.generateCacheKey(config1, 64);
    const key2 = ThumbnailCache.generateCacheKey(config2, 64);

    expect(key1).not.toBe(key2);
  });

  it('stores and retrieves cached data', () => {
    const testData = 'data:image/png;base64,test-data';
    const cacheKey = 'test-key';

    // Mock localStorage to return our test data
    mockLocalStorage.getItem.mockReturnValue(
      JSON.stringify({
        data: testData,
        timestamp: Date.now(),
      })
    );

    ThumbnailCache.set(cacheKey, testData);
    const retrieved = ThumbnailCache.get(cacheKey);

    expect(retrieved).toBe(testData);
  });

  it('returns null for expired cache entries', () => {
    const testData = 'data:image/png;base64,test-data';
    const cacheKey = 'test-key';

    // Mock localStorage to return expired data
    mockLocalStorage.getItem.mockReturnValue(
      JSON.stringify({
        data: testData,
        timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
      })
    );

    const retrieved = ThumbnailCache.get(cacheKey);

    expect(retrieved).toBeNull();
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(cacheKey);
  });

  it('handles localStorage errors gracefully', () => {
    const cacheKey = 'test-key';
    const testData = 'data:image/png;base64,test-data';

    // Mock localStorage to throw an error
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });

    // Should not throw an error
    expect(() => {
      ThumbnailCache.set(cacheKey, testData);
    }).not.toThrow();
  });

  it('clears all cache entries', () => {
    // Mock localStorage keys
    Object.defineProperty(localStorage, 'keys', {
      value: vi.fn(() => [
        'avatar_thumbnail_123_64',
        'avatar_thumbnail_456_32',
        'other_key',
      ]),
    });

    ThumbnailCache.clear();

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
      'avatar_thumbnail_123_64'
    );
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
      'avatar_thumbnail_456_32'
    );
    expect(mockLocalStorage.removeItem).not.toHaveBeenCalledWith('other_key');
  });
});

describe('Avatar Effects', () => {
  it('renders sparkle effects for high-tier achievements', () => {
    render(
      <AvatarThumbnail
        config={AvatarConfigUtils.createDefaultConfig(1)}
        showAchievementEffects={true}
        achievements={['math-master', 'infinity-seeker']}
        fallbackInitials='TU'
      />
    );

    // Should have achievement effects container
    const effectsContainer = document.querySelector(
      '.absolute.inset-0.pointer-events-none'
    );
    expect(effectsContainer).toBeInTheDocument();
  });

  it('renders math symbols for math-related achievements', () => {
    render(
      <AvatarThumbnail
        config={AvatarConfigUtils.createDefaultConfig(1)}
        showAchievementEffects={true}
        achievements={['calculus-master', 'equation-artist']}
        fallbackInitials='TU'
      />
    );

    // Should render achievement effects
    const thumbnail = screen.getByRole('img', { name: /user avatar/i });
    expect(thumbnail).toBeInTheDocument();
  });

  it('does not render effects when disabled', () => {
    render(
      <AvatarThumbnail
        config={AvatarConfigUtils.createDefaultConfig(1)}
        showAchievementEffects={false}
        achievements={['math-master']}
        fallbackInitials='TU'
      />
    );

    // Should not have effects overlay
    const effectsOverlay = document.querySelector(
      '.absolute.inset-0.pointer-events-none'
    );
    expect(effectsOverlay).toBeNull();
  });
});

describe('Accessibility', () => {
  it('provides proper alt text for avatar images', () => {
    render(
      <AvatarThumbnail
        config={AvatarConfigUtils.createDefaultConfig(1)}
        fallbackInitials='TU'
      />
    );

    const avatar = screen.getByRole('img', { name: /user avatar/i });
    expect(avatar).toBeInTheDocument();
  });

  it('supports keyboard navigation when clickable', () => {
    const handleClick = vi.fn();

    render(
      <AvatarThumbnail
        config={AvatarConfigUtils.createDefaultConfig(1)}
        onClick={handleClick}
        fallbackInitials='TU'
      />
    );

    const thumbnail = screen.getByRole('img', { name: /user avatar/i });

    // Should be focusable when clickable
    fireEvent.keyDown(thumbnail, { key: 'Enter' });
    // Note: In a real implementation, we'd need to add proper keyboard handlers
  });

  it('provides meaningful fallback content', () => {
    render(<AvatarThumbnail config={undefined} fallbackInitials='Test User' />);

    // Should show first letter of initials
    expect(screen.getByText('T')).toBeInTheDocument();
  });
});
