/**
 * Optimized image component specifically for forum content
 * Extends the base OptimizedImage with forum-specific features
 */

import React, { useState, useCallback } from 'react';
import {
  OptimizedImage,
  OptimizedImageProps,
} from '../../../components/ui/OptimizedImage';
import { Button } from '../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '../../../components/ui/dialog';
import { ZoomIn, Download, ExternalLink } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface OptimizedForumImageProps extends OptimizedImageProps {
  enableLightbox?: boolean;
  enableDownload?: boolean;
  maxDisplayWidth?: number;
  maxDisplayHeight?: number;
  showImageInfo?: boolean;
  onImageClick?: () => void;
}

/**
 * Forum-optimized image component with lightbox and download features
 */
export function OptimizedForumImage({
  enableLightbox = true,
  enableDownload = false,
  maxDisplayWidth = 600,
  maxDisplayHeight = 400,
  showImageInfo = false,
  onImageClick,
  className,
  ...props
}: OptimizedForumImageProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [imageInfo, setImageInfo] = useState<{
    naturalWidth?: number;
    naturalHeight?: number;
    fileSize?: string;
  }>({});

  const handleImageLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      const img = event.currentTarget;
      setImageInfo({
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      });
      props.onLoad?.(event);
    },
    [props.onLoad]
  );

  const handleImageClick = useCallback(() => {
    if (onImageClick) {
      onImageClick();
    } else if (enableLightbox) {
      setIsLightboxOpen(true);
    }
  }, [onImageClick, enableLightbox]);

  const handleDownload = useCallback(async () => {
    try {
      const response = await fetch(props.src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `forum-image-${Date.now()}.${blob.type.split('/')[1] || 'jpg'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  }, [props.src]);

  // Calculate display dimensions while maintaining aspect ratio
  const displayDimensions = React.useMemo(() => {
    if (!props.width || !props.height) {
      return { width: maxDisplayWidth, height: maxDisplayHeight };
    }

    const aspectRatio = props.width / props.height;
    let displayWidth = Math.min(props.width, maxDisplayWidth);
    let displayHeight = displayWidth / aspectRatio;

    if (displayHeight > maxDisplayHeight) {
      displayHeight = maxDisplayHeight;
      displayWidth = displayHeight * aspectRatio;
    }

    return { width: displayWidth, height: displayHeight };
  }, [props.width, props.height, maxDisplayWidth, maxDisplayHeight]);

  const ImageComponent = (
    <div className='relative group'>
      <OptimizedImage
        {...props}
        width={displayDimensions.width}
        height={displayDimensions.height}
        onLoad={handleImageLoad}
        className={cn(
          'rounded-lg border border-border',
          (enableLightbox || onImageClick) &&
            'cursor-pointer hover:opacity-90 transition-opacity',
          className
        )}
        onClick={handleImageClick}
      />

      {/* Image overlay with controls */}
      {(enableLightbox || enableDownload) && (
        <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2'>
          {enableLightbox && (
            <Button
              variant='secondary'
              size='sm'
              onClick={e => {
                e.stopPropagation();
                setIsLightboxOpen(true);
              }}
            >
              <ZoomIn className='h-4 w-4' />
            </Button>
          )}
          {enableDownload && (
            <Button
              variant='secondary'
              size='sm'
              onClick={e => {
                e.stopPropagation();
                handleDownload();
              }}
            >
              <Download className='h-4 w-4' />
            </Button>
          )}
        </div>
      )}

      {/* Image info */}
      {showImageInfo && imageInfo.naturalWidth && (
        <div className='absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded'>
          {imageInfo.naturalWidth} × {imageInfo.naturalHeight}
        </div>
      )}
    </div>
  );

  if (!enableLightbox) {
    return ImageComponent;
  }

  return (
    <>
      {ImageComponent}

      {/* Lightbox dialog */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className='max-w-[90vw] max-h-[90vh] p-0'>
          <div className='relative'>
            <OptimizedImage
              {...props}
              className='w-full h-full object-contain'
              priority={true}
              lazy={false}
            />

            {/* Lightbox controls */}
            <div className='absolute top-4 right-4 flex gap-2'>
              {enableDownload && (
                <Button variant='secondary' size='sm' onClick={handleDownload}>
                  <Download className='h-4 w-4 mr-2' />
                  Download
                </Button>
              )}
              <Button
                variant='secondary'
                size='sm'
                onClick={() => window.open(props.src, '_blank')}
              >
                <ExternalLink className='h-4 w-4 mr-2' />
                Open
              </Button>
            </div>

            {/* Image info in lightbox */}
            {imageInfo.naturalWidth && (
              <div className='absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded'>
                <div className='text-sm font-medium'>{props.alt}</div>
                <div className='text-xs opacity-80'>
                  {imageInfo.naturalWidth} × {imageInfo.naturalHeight}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Avatar image component optimized for forum posts
 */
interface ForumAvatarImageProps extends OptimizedImageProps {
  username: string;
  userId: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showOnlineStatus?: boolean;
  isOnline?: boolean;
  onClick?: () => void;
}

export function ForumAvatarImage({
  username,
  userId,
  size = 'md',
  showOnlineStatus = false,
  isOnline = false,
  onClick,
  className,
  ...props
}: ForumAvatarImageProps) {
  const sizeMap = {
    sm: 24,
    md: 32,
    lg: 40,
    xl: 48,
  };

  const avatarSize = sizeMap[size];

  return (
    <div className='relative'>
      <OptimizedImage
        {...props}
        width={avatarSize}
        height={avatarSize}
        alt={`${username}'s avatar`}
        className={cn(
          'rounded-full border-2 border-border',
          onClick && 'cursor-pointer hover:border-primary/50 transition-colors',
          className
        )}
        onClick={onClick}
        placeholder='skeleton'
        lazy={true}
      />

      {/* Online status indicator */}
      {showOnlineStatus && (
        <div
          className={cn(
            'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background',
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          )}
          aria-label={isOnline ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
}

/**
 * Attachment image component for forum posts
 */
interface ForumAttachmentImageProps extends OptimizedImageProps {
  filename?: string;
  fileSize?: string;
  uploadedAt?: Date;
  onRemove?: () => void;
}

export function ForumAttachmentImage({
  filename,
  fileSize,
  uploadedAt,
  onRemove,
  className,
  ...props
}: ForumAttachmentImageProps) {
  return (
    <div className='relative group'>
      <OptimizedForumImage
        {...props}
        enableLightbox={true}
        enableDownload={true}
        showImageInfo={true}
        className={cn('max-w-sm', className)}
      />

      {/* Attachment info */}
      <div className='mt-2 text-xs text-muted-foreground'>
        {filename && <div className='font-medium truncate'>{filename}</div>}
        <div className='flex items-center gap-2'>
          {fileSize && <span>{fileSize}</span>}
          {uploadedAt && (
            <>
              <span>•</span>
              <span>{uploadedAt.toLocaleDateString()}</span>
            </>
          )}
        </div>
      </div>

      {/* Remove button */}
      {onRemove && (
        <Button
          variant='destructive'
          size='sm'
          className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'
          onClick={onRemove}
        >
          ×
        </Button>
      )}
    </div>
  );
}
