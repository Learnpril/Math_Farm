/**
 * Simple Avatar Display Component
 * Math Farm Community Forum - Direct image display for chibi avatars
 */
import React from 'react';
import { cn } from '../../../../lib/utils';
import type { AvatarConfig } from '../../types/avatar';

interface SimpleAvatarDisplayProps {
  config?: AvatarConfig;
  size?: number;
  className?: string;
  fallbackInitials?: string;
  showBorder?: boolean;
}

/**
 * Simple avatar display that directly shows the chibi base image
 */
export function SimpleAvatarDisplay({
  config,
  size = 64,
  className = '',
  fallbackInitials = '?',
  showBorder = true,
}: SimpleAvatarDisplayProps) {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  // Check if we should show the chibi base
  const shouldShowChibi =
    config?.layers?.some(
      layer => layer.itemId === 'chibi-base-default' && layer.visible
    ) || true; // Always show chibi for now

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
    console.warn('Failed to load chibi avatar image');
  };

  // Fallback avatar with gradient background
  const renderFallback = () => {
    const gradients = [
      'bg-gradient-to-br from-purple-400 to-pink-500',
      'bg-gradient-to-br from-blue-400 to-cyan-500',
      'bg-gradient-to-br from-green-400 to-blue-500',
      'bg-gradient-to-br from-yellow-400 to-orange-500',
      'bg-gradient-to-br from-pink-400 to-red-500',
      'bg-gradient-to-br from-indigo-400 to-purple-500',
    ];
    const colorIndex = fallbackInitials.charCodeAt(0) % gradients.length;
    const bgGradient = gradients[colorIndex];

    return (
      <div
        className={cn(
          'rounded-full flex items-center justify-center text-white font-semibold shadow-lg',
          bgGradient,
          showBorder && 'border-2 border-border',
          className
        )}
        style={{ width: size, height: size }}
      >
        <span style={{ fontSize: size * 0.4 }}>
          {fallbackInitials.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };

  // Show chibi image if available and should be displayed
  if (shouldShowChibi && !imageError) {
    return (
      <div className='relative inline-block'>
        <img
          src='/assets/avatar/base/chibi-default.png'
          alt='Chibi Avatar'
          className={cn(
            'rounded-full object-cover',
            showBorder && 'border-2 border-border',
            !imageLoaded && 'opacity-0',
            'transition-opacity duration-300',
            className
          )}
          style={{
            width: size,
            height: size,
            imageRendering: 'pixelated', // Preserve pixel art quality
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        {/* Loading state */}
        {!imageLoaded && !imageError && (
          <div
            className={cn(
              'absolute inset-0 rounded-full bg-muted animate-pulse',
              showBorder && 'border-2 border-border'
            )}
            style={{ width: size, height: size }}
          />
        )}
      </div>
    );
  }

  // Show fallback for other configurations or errors
  return renderFallback();
}

export default SimpleAvatarDisplay;
