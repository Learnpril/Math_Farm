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

  // Fallback to a simple colored avatar if image fails
  React.useEffect(() => {
    if (imageError) {
      console.warn('Avatar image failed to load, using fallback');
    }
  }, [imageError]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
    console.warn(
      'Failed to load chibi avatar image from:',
      '/assets/avatar/base/chibi-default.png'
    );
  };

  // Enhanced anime-style fallback avatar
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
      <div className='relative inline-block'>
        <div
          className={cn(
            'rounded-full flex items-center justify-center text-white font-bold shadow-lg relative overflow-hidden',
            bgGradient,
            showBorder && 'border-2 border-border',
            className
          )}
          style={{ width: size, height: size }}
        >
          {/* Main character initial */}
          <span
            className='relative z-10 font-bold text-white drop-shadow-sm'
            style={{ fontSize: size * 0.35 }}
          >
            {fallbackInitials.charAt(0).toUpperCase()}
          </span>

          {/* Cute sparkle effects */}
          <div
            className='absolute bg-white rounded-full opacity-80'
            style={{
              width: size * 0.08,
              height: size * 0.08,
              top: size * 0.15,
              right: size * 0.15,
            }}
          />
          <div
            className='absolute bg-white rounded-full opacity-60'
            style={{
              width: size * 0.06,
              height: size * 0.06,
              bottom: size * 0.2,
              left: size * 0.15,
            }}
          />

          {/* Subtle inner glow */}
          <div
            className='absolute rounded-full bg-white/10'
            style={{
              width: size * 0.85,
              height: size * 0.85,
              top: size * 0.075,
              left: size * 0.075,
            }}
          />
        </div>
      </div>
    );
  };

  // Temporarily disable image loading until server static file serving is fixed
  if (false && shouldShowChibi && !imageError) {
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
          loading='lazy'
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
