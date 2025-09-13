/**
 * Optimized image component with lazy loading, format optimization, and responsive features
 */

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import {
  useLazyImage,
  generatePlaceholder,
  useImageLoadingState,
  getGlobalLazyLoader,
} from '../../lib/image-optimization';
import { Skeleton } from './LoadingStates';

export interface OptimizedImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'auto';
  lazy?: boolean;
  placeholder?: 'blur' | 'skeleton' | 'none';
  placeholderColor?: string;
  responsive?: boolean;
  sizes?: string;
  priority?: boolean;
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  className?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  quality = 85,
  format = 'auto',
  lazy = true,
  placeholder = 'skeleton',
  placeholderColor = '#f3f4f6',
  responsive = true,
  sizes,
  priority = false,
  onLoad,
  onError,
  className,
  ...props
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(!lazy || priority);

  // Get optimized image properties
  const imageProps = useLazyImage(src, {
    width,
    height,
    format,
    quality,
    sizes: responsive ? sizes : undefined,
  });

  // Track loading state
  const loadingState = useImageLoadingState(
    isIntersecting ? imageProps.src : ''
  );

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || !imgRef.current) return;

    const lazyLoader = getGlobalLazyLoader();
    const img = imgRef.current;

    // Set up data attributes for lazy loading
    img.dataset.src = imageProps.src;
    if (imageProps.srcSet) {
      img.dataset.srcset = imageProps.srcSet;
    }

    lazyLoader.observe(img);

    // Listen for lazy load event
    const handleLazyLoad = () => setIsIntersecting(true);
    img.addEventListener('lazyload', handleLazyLoad);

    return () => {
      lazyLoader.unobserve(img);
      img.removeEventListener('lazyload', handleLazyLoad);
    };
  }, [lazy, priority, imageProps.src, imageProps.srcSet]);

  // Handle load event
  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.classList.add('loaded');
    onLoad?.(event);
  };

  // Handle error event
  const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.classList.add('error');
    onError?.(event);
  };

  // Generate placeholder
  const placeholderSrc =
    width && height
      ? generatePlaceholder(width, height, placeholderColor)
      : undefined;

  // Determine what to show
  const shouldShowPlaceholder = lazy && !isIntersecting;
  const shouldShowSkeleton =
    placeholder === 'skeleton' &&
    (shouldShowPlaceholder || loadingState.loading);
  const shouldShowImage = !shouldShowPlaceholder && !loadingState.error;

  // Image styles for smooth transitions
  const imageStyles: React.CSSProperties = {
    transition: 'opacity 0.3s ease-in-out',
    opacity: loadingState.loaded ? 1 : 0,
    ...props.style,
  };

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{ width, height }}
    >
      {/* Skeleton placeholder */}
      {shouldShowSkeleton && (
        <Skeleton
          className={cn(
            'absolute inset-0 w-full h-full',
            loadingState.loaded && 'opacity-0'
          )}
          style={{ width, height }}
        />
      )}

      {/* Blur placeholder */}
      {placeholder === 'blur' && shouldShowPlaceholder && placeholderSrc && (
        <img
          src={placeholderSrc}
          alt=''
          className='absolute inset-0 w-full h-full object-cover filter blur-sm'
          style={{ width, height }}
          aria-hidden='true'
        />
      )}

      {/* Main image */}
      {shouldShowImage && (
        <img
          ref={imgRef}
          src={lazy && !isIntersecting ? placeholderSrc : imageProps.src}
          srcSet={lazy && !isIntersecting ? undefined : imageProps.srcSet}
          sizes={imageProps.sizes}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : imageProps.loading}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            lazy && 'lazy',
            loadingState.loaded && 'loaded',
            loadingState.error && 'error'
          )}
          style={imageStyles}
          {...props}
        />
      )}

      {/* Error state */}
      {loadingState.error && (
        <div className='absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'>
          <div className='text-center'>
            <div className='text-2xl mb-2'>📷</div>
            <div className='text-sm'>Failed to load image</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Responsive image component with predefined breakpoints
export interface ResponsiveImageProps
  extends Omit<OptimizedImageProps, 'sizes' | 'responsive'> {
  breakpoints?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  breakpoints = { sm: 640, md: 768, lg: 1024, xl: 1280 },
  ...props
}) => {
  const sizes = `
    (max-width: ${breakpoints.sm}px) ${breakpoints.sm}px,
    (max-width: ${breakpoints.md}px) ${breakpoints.md}px,
    (max-width: ${breakpoints.lg}px) ${breakpoints.lg}px,
    ${breakpoints.xl}px
  `
    .replace(/\s+/g, ' ')
    .trim();

  return <OptimizedImage {...props} sizes={sizes} responsive={true} />;
};

// Avatar component with optimized loading
export interface AvatarImageProps
  extends Omit<OptimizedImageProps, 'placeholder'> {
  size?: number;
  fallback?: string;
}

export const AvatarImage: React.FC<AvatarImageProps> = ({
  size = 40,
  fallback,
  className,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    props.onError?.(event);
  };

  if (hasError && fallback) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-full',
          className
        )}
        style={{ width: size, height: size }}
      >
        {fallback}
      </div>
    );
  }

  return (
    <OptimizedImage
      {...props}
      width={size}
      height={size}
      className={cn('rounded-full', className)}
      placeholder='skeleton'
      onError={handleError}
    />
  );
};

// Hero image component with priority loading
export interface HeroImageProps extends OptimizedImageProps {
  overlay?: boolean;
  overlayColor?: string;
}

export const HeroImage: React.FC<HeroImageProps> = ({
  overlay = false,
  overlayColor = 'rgba(0, 0, 0, 0.3)',
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('relative', className)}>
      <OptimizedImage
        {...props}
        priority={true}
        lazy={false}
        className='w-full h-full object-cover'
      />

      {overlay && (
        <div
          className='absolute inset-0'
          style={{ backgroundColor: overlayColor }}
        />
      )}

      {children && (
        <div className='absolute inset-0 flex items-center justify-center'>
          {children}
        </div>
      )}
    </div>
  );
};
