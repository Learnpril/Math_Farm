/**
 * Image optimization utilities for better loading performance
 * Handles lazy loading, format optimization, and responsive images
 */

import React from 'react';

// Image format detection and optimization
export const getOptimizedImageSrc = (
  src: string,
  options: {
    width?: number;
    height?: number;
    format?: 'webp' | 'avif' | 'auto';
    quality?: number;
  } = {}
) => {
  const { width, height, format = 'auto', quality = 85 } = options;

  // For now, return original src since we're not using a CDN
  // In production, this could integrate with image optimization services
  let optimizedSrc = src;

  // Add query parameters for potential future optimization
  const params = new URLSearchParams();
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  if (format !== 'auto') params.set('f', format);
  if (quality !== 85) params.set('q', quality.toString());

  if (params.toString()) {
    optimizedSrc += `?${params.toString()}`;
  }

  return optimizedSrc;
};

// Generate srcset for responsive images
export const generateSrcSet = (
  baseSrc: string,
  sizes: number[] = [320, 640, 768, 1024, 1280, 1536]
) => {
  return sizes
    .map(size => `${getOptimizedImageSrc(baseSrc, { width: size })} ${size}w`)
    .join(', ');
};

// Lazy loading intersection observer
export class ImageLazyLoader {
  private observer: IntersectionObserver | null = null;
  private images = new Set<HTMLImageElement>();

  constructor(options: IntersectionObserverInit = {}) {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        {
          rootMargin: '50px 0px',
          threshold: 0.01,
          ...options,
        }
      );
    }
  }

  private handleIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        this.loadImage(img);
        this.observer?.unobserve(img);
        this.images.delete(img);
      }
    });
  }

  private loadImage(img: HTMLImageElement) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;

    if (src) {
      img.src = src;
    }
    if (srcset) {
      img.srcset = srcset;
    }

    img.classList.remove('lazy');
    img.classList.add('loaded');

    // Trigger load event for any listeners
    img.dispatchEvent(new Event('lazyload'));
  }

  observe(img: HTMLImageElement) {
    if (this.observer) {
      this.observer.observe(img);
      this.images.add(img);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage(img);
    }
  }

  unobserve(img: HTMLImageElement) {
    if (this.observer) {
      this.observer.unobserve(img);
      this.images.delete(img);
    }
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.images.clear();
    }
  }
}

// Global lazy loader instance
let globalLazyLoader: ImageLazyLoader | null = null;

export const getGlobalLazyLoader = () => {
  if (!globalLazyLoader) {
    globalLazyLoader = new ImageLazyLoader();
  }
  return globalLazyLoader;
};

// React hook for lazy loading images
export const useLazyImage = (
  src: string,
  options: {
    width?: number;
    height?: number;
    format?: 'webp' | 'avif' | 'auto';
    quality?: number;
    sizes?: string;
  } = {}
) => {
  const { width, height, format, quality, sizes } = options;

  const optimizedSrc = getOptimizedImageSrc(src, {
    width,
    height,
    format,
    quality,
  });
  const srcSet = sizes ? generateSrcSet(src) : undefined;

  return {
    src: optimizedSrc,
    srcSet,
    sizes,
    loading: 'lazy' as const,
    onLoad: (event: React.SyntheticEvent<HTMLImageElement>) => {
      event.currentTarget.classList.add('loaded');
    },
  };
};

// Preload critical images
export const preloadImage = (
  src: string,
  options: {
    as?: 'image';
    crossorigin?: 'anonymous' | 'use-credentials';
    fetchpriority?: 'high' | 'low' | 'auto';
  } = {}
) => {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = src;
  link.as = options.as || 'image';

  if (options.crossorigin) {
    link.crossOrigin = options.crossorigin;
  }

  if (options.fetchpriority) {
    link.setAttribute('fetchpriority', options.fetchpriority);
  }

  document.head.appendChild(link);
};

// Image placeholder generator
export const generatePlaceholder = (
  width: number,
  height: number,
  color = '#f3f4f6'
) => {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="system-ui" font-size="14">
        ${width}×${height}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Blur placeholder for smooth loading
export const generateBlurPlaceholder = (
  width: number,
  height: number,
  color = '#f3f4f6'
) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
  }

  return canvas.toDataURL('image/jpeg', 0.1);
};

// Image loading state management
export interface ImageLoadingState {
  loading: boolean;
  loaded: boolean;
  error: boolean;
}

export const useImageLoadingState = (src: string) => {
  const [state, setState] = React.useState<ImageLoadingState>({
    loading: true,
    loaded: false,
    error: false,
  });

  React.useEffect(() => {
    if (!src) return;

    setState({ loading: true, loaded: false, error: false });

    const img = new Image();

    img.onload = () => {
      setState({ loading: false, loaded: true, error: false });
    };

    img.onerror = () => {
      setState({ loading: false, loaded: false, error: true });
    };

    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return state;
};

// Critical image detection
export const isCriticalImage = (img: HTMLImageElement) => {
  const rect = img.getBoundingClientRect();
  const viewportHeight = window.innerHeight;

  // Consider images in the first viewport as critical
  return rect.top < viewportHeight;
};

// Batch image loading
export const batchLoadImages = async (srcs: string[], batchSize = 3) => {
  const results: Array<{ src: string; loaded: boolean; error?: string }> = [];

  for (let i = 0; i < srcs.length; i += batchSize) {
    const batch = srcs.slice(i, i + batchSize);

    const batchPromises = batch.map(
      src =>
        new Promise<{ src: string; loaded: boolean; error?: string }>(
          resolve => {
            const img = new Image();

            img.onload = () => resolve({ src, loaded: true });
            img.onerror = () =>
              resolve({ src, loaded: false, error: 'Failed to load' });

            img.src = src;
          }
        )
    );

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  return results;
};
