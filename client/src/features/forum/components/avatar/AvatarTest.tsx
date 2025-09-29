/**
 * Simple test component to verify avatar loading
 */
import React from 'react';

export function AvatarTest() {
  const [imageStatus, setImageStatus] = React.useState<
    'loading' | 'loaded' | 'error'
  >('loading');

  const handleLoad = () => {
    console.log('Avatar image loaded successfully');
    setImageStatus('loaded');
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('Avatar image failed to load:', e.currentTarget.src);
    setImageStatus('error');
  };

  return (
    <div className='p-4 border rounded'>
      <h3 className='text-lg font-semibold mb-4'>Avatar Loading Test</h3>

      <div className='space-y-4'>
        <div>
          <p className='text-sm text-muted-foreground mb-2'>
            Status: {imageStatus}
          </p>
          <img
            src='/assets/avatar/base/chibi-default.png'
            alt='Test Avatar'
            className='w-16 h-16 rounded-full border'
            onLoad={handleLoad}
            onError={handleError}
          />
        </div>

        <div>
          <p className='text-sm text-muted-foreground mb-2'>
            Direct path test:
          </p>
          <img
            src='/assets/avatar/base/chibi-default.png'
            alt='Direct Test'
            className='w-8 h-8 rounded border'
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
      </div>
    </div>
  );
}
