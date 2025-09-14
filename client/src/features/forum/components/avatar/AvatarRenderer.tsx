/**
 * Chibi Avatar Renderer Component
 * Math Farm Community Forum - Real-time Avatar Rendering with HTML5 Canvas
 */

import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useState,
  useCallback,
} from 'react';
import type {
  AvatarConfig,
  AvatarLayer,
  AvatarRenderOptions,
} from '../../types/avatar';
import { getItemById } from '../../data/avatar-items';
import { AvatarConfigUtils } from '../../lib/avatar-config';

interface AvatarRendererProps {
  config: AvatarConfig;
  size?: number;
  showControls?: boolean;
  interactive?: boolean;
  onLayerSelect?: (itemId: string) => void;
  onLayerTransform?: (
    itemId: string,
    transform: Partial<Pick<AvatarLayer, 'position' | 'scale' | 'rotation'>>
  ) => void;
  className?: string;
}

export interface AvatarRendererRef {
  exportAsImage: (format?: 'png' | 'jpeg', quality?: number) => string;
  getCanvas: () => HTMLCanvasElement | null;
  generateThumbnail: (size: number) => Promise<string>;
  clearCache: () => void;
}

// Cache for loaded SVG images
const imageCache = new Map<string, HTMLImageElement>();

// Load image (SVG or PNG) with caching
const loadAvatarImage = async (
  imagePath: string
): Promise<HTMLImageElement> => {
  if (imageCache.has(imagePath)) {
    return imageCache.get(imagePath)!;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      imageCache.set(imagePath, img);
      resolve(img);
    };

    img.onerror = () => {
      console.warn(`Failed to load avatar asset: ${imagePath}`);
      // Create a fallback placeholder image
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;

      // Draw a simple placeholder
      ctx.fillStyle = '#E5E7EB';
      ctx.fillRect(0, 0, 64, 64);
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('?', 32, 36);

      canvas.toBlob(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const fallbackImg = new Image();
          fallbackImg.onload = () => {
            URL.revokeObjectURL(url);
            imageCache.set(imagePath, fallbackImg);
            resolve(fallbackImg);
          };
          fallbackImg.src = url;
        } else {
          reject(new Error('Failed to create fallback image'));
        }
      });
    };

    // For development, use placeholder paths
    if (imagePath.startsWith('/assets/avatar/')) {
      // Create a colored rectangle as placeholder for development
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;

      // Generate a color based on the path
      const hash = imagePath.split('').reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0);

      const hue = Math.abs(hash) % 360;
      ctx.fillStyle = `hsl(${hue}, 70%, 80%)`;
      ctx.fillRect(0, 0, 64, 64);

      // Add some identifying text
      ctx.fillStyle = '#333';
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'center';
      const filename =
        imagePath
          .split('/')
          .pop()
          ?.replace(/\.(svg|png|jpg)$/, '') || '?';
      ctx.fillText(filename.slice(0, 8), 32, 32);

      canvas.toBlob(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          img.src = url;
        }
      });
    } else {
      img.src = imagePath;
    }
  });
};

export const AvatarRenderer = forwardRef<
  AvatarRendererRef,
  AvatarRendererProps
>(
  (
    {
      config,
      size = 256,
      showControls = false,
      interactive = false,
      onLayerSelect,
      onLayerTransform,
      className = '',
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadedImages, setLoadedImages] = useState<
      Map<string, HTMLImageElement>
    >(new Map());
    const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
      null
    );

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      exportAsImage: (format = 'png', quality = 1.0) => {
        if (canvasRef.current) {
          return canvasRef.current.toDataURL(`image/${format}`, quality);
        }
        return '';
      },
      getCanvas: () => canvasRef.current,
      generateThumbnail: async (thumbnailSize: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return '';

        // Create a temporary canvas for thumbnail generation
        const thumbCanvas = document.createElement('canvas');
        thumbCanvas.width = thumbnailSize;
        thumbCanvas.height = thumbnailSize;
        const thumbCtx = thumbCanvas.getContext('2d');
        if (!thumbCtx) return '';

        // Draw the main canvas scaled down to thumbnail size
        thumbCtx.drawImage(canvas, 0, 0, thumbnailSize, thumbnailSize);
        return thumbCanvas.toDataURL('image/png', 0.8);
      },
      clearCache: () => {
        imageCache.clear();
      },
    }));

    // Load all required images
    useEffect(() => {
      const loadImages = async () => {
        setIsLoading(true);
        const imagePromises = new Map<string, Promise<HTMLImageElement>>();

        // Get all visible layers sorted by z-index
        const visibleLayers = AvatarConfigUtils.getLayersByZIndex(config);

        for (const layer of visibleLayers) {
          const item = getItemById(layer.itemId);
          if (item && !imagePromises.has(item.svgPath)) {
            imagePromises.set(item.svgPath, loadAvatarImage(item.svgPath));
          }
        }

        try {
          const imageEntries = await Promise.allSettled(
            Array.from(imagePromises.entries()).map(
              async ([path, promise]) => [path, await promise] as const
            )
          );

          const newLoadedImages = new Map<string, HTMLImageElement>();
          imageEntries.forEach(result => {
            if (result.status === 'fulfilled') {
              const [path, image] = result.value;
              newLoadedImages.set(path, image);
            }
          });

          setLoadedImages(newLoadedImages);
        } catch (error) {
          console.error('Failed to load avatar images:', error);
        } finally {
          setIsLoading(false);
        }
      };

      loadImages();
    }, [config]);

    // Render avatar to canvas
    const renderAvatar = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      canvas.width = size;
      canvas.height = size;

      // Clear canvas
      ctx.clearRect(0, 0, size, size);

      // Set background
      if (config.backgroundColor) {
        ctx.fillStyle = config.backgroundColor;
        ctx.fillRect(0, 0, size, size);
      }

      // Get layers sorted by z-index
      const visibleLayers = AvatarConfigUtils.getLayersByZIndex(config);

      // Render each layer
      visibleLayers.forEach(layer => {
        const item = getItemById(layer.itemId);
        if (!item) return;

        const image = loadedImages.get(item.svgPath);
        if (!image) return;

        ctx.save();

        // Calculate position (convert from percentage to pixels)
        const x = (layer.position.x / 100) * size;
        const y = (layer.position.y / 100) * size;

        // Apply transformations
        ctx.translate(x, y);
        ctx.rotate((layer.rotation * Math.PI) / 180);
        ctx.scale(layer.scale, layer.scale);

        // Apply color tinting if specified
        if (layer.color && item.colorCustomizable) {
          ctx.globalCompositeOperation = 'multiply';
          ctx.fillStyle = layer.color;
          ctx.fillRect(
            -image.width / 2,
            -image.height / 2,
            image.width,
            image.height
          );
          ctx.globalCompositeOperation = 'destination-atop';
        }

        // Apply opacity
        if (layer.opacity !== undefined) {
          ctx.globalAlpha = layer.opacity;
        }

        // Draw the image centered
        ctx.drawImage(
          image,
          -image.width / 2,
          -image.height / 2,
          image.width,
          image.height
        );

        // Draw selection indicator if this layer is selected
        if (showControls && selectedLayer === layer.itemId) {
          ctx.globalCompositeOperation = 'source-over';
          ctx.globalAlpha = 1;
          ctx.strokeStyle = '#8B5CF6';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(
            -image.width / 2 - 2,
            -image.height / 2 - 2,
            image.width + 4,
            image.height + 4
          );
          ctx.setLineDash([]);
        }

        ctx.restore();
      });

      // Draw loading indicator
      if (isLoading) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Loading...', size / 2, size / 2);
      }
    }, [config, size, loadedImages, isLoading, showControls, selectedLayer]);

    // Re-render when dependencies change
    useEffect(() => {
      renderAvatar();
    }, [renderAvatar]);

    // Handle mouse interactions for layer selection and manipulation
    const handleMouseDown = useCallback(
      (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!interactive || !showControls) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // Find the topmost layer at this position
        const visibleLayers =
          AvatarConfigUtils.getLayersByZIndex(config).reverse();

        for (const layer of visibleLayers) {
          const item = getItemById(layer.itemId);
          if (!item) continue;

          // Simple hit detection (could be improved with actual image bounds)
          const layerX = layer.position.x;
          const layerY = layer.position.y;
          const hitRadius = 20; // Adjust based on typical item size

          if (
            Math.abs(x - layerX) < hitRadius &&
            Math.abs(y - layerY) < hitRadius
          ) {
            setSelectedLayer(layer.itemId);
            setIsDragging(true);
            setDragStart({ x, y });
            onLayerSelect?.(layer.itemId);
            break;
          }
        }
      },
      [interactive, showControls, config, onLayerSelect]
    );

    const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDragging || !dragStart || !selectedLayer) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const deltaX = x - dragStart.x;
        const deltaY = y - dragStart.y;

        const currentLayer = config.layers.find(
          l => l.itemId === selectedLayer
        );
        if (currentLayer) {
          onLayerTransform?.(selectedLayer, {
            position: {
              x: Math.max(0, Math.min(100, currentLayer.position.x + deltaX)),
              y: Math.max(0, Math.min(100, currentLayer.position.y + deltaY)),
            },
          });
        }

        setDragStart({ x, y });
      },
      [isDragging, dragStart, selectedLayer, config.layers, onLayerTransform]
    );

    const handleMouseUp = useCallback(() => {
      setIsDragging(false);
      setDragStart(null);
    }, []);

    // Handle wheel events for scaling
    const handleWheel = useCallback(
      (e: React.WheelEvent<HTMLCanvasElement>) => {
        if (!interactive || !selectedLayer) return;

        e.preventDefault();
        const scaleDelta = e.deltaY > 0 ? -0.1 : 0.1;
        const currentLayer = config.layers.find(
          l => l.itemId === selectedLayer
        );

        if (currentLayer) {
          const newScale = Math.max(
            0.1,
            Math.min(3, currentLayer.scale + scaleDelta)
          );
          onLayerTransform?.(selectedLayer, { scale: newScale });
        }
      },
      [interactive, selectedLayer, config.layers, onLayerTransform]
    );

    return (
      <div className={`avatar-renderer ${className}`}>
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className={`
          border border-gray-200 dark:border-gray-700 rounded-lg
          ${interactive ? 'cursor-pointer' : ''}
          ${isDragging ? 'cursor-grabbing' : ''}
        `}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{
            maxWidth: '100%',
            height: 'auto',
          }}
        />

        {showControls && selectedLayer && (
          <div className='mt-2 text-sm text-muted-foreground text-center'>
            Selected: {getItemById(selectedLayer)?.name || 'Unknown'}
            {interactive && (
              <div className='text-xs mt-1'>
                Click and drag to move • Scroll to scale
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

AvatarRenderer.displayName = 'AvatarRenderer';

export default AvatarRenderer;
