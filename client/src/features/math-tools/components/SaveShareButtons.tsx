import { useState } from 'react';
import { Download, Share2, Save, Check } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  ToolResult,
  saveToolResult,
  downloadResult,
  shareResult,
} from '../../../lib/toolUtils';

interface SaveShareButtonsProps {
  result: ToolResult;
  disabled?: boolean;
  className?: string;
}

export function SaveShareButtons({
  result,
  disabled = false,
  className = '',
}: SaveShareButtonsProps) {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>(
    'idle'
  );
  const [shareStatus, setShareStatus] = useState<'idle' | 'sharing' | 'shared'>(
    'idle'
  );

  const handleSave = () => {
    if (disabled) return;

    setSaveStatus('saving');
    try {
      saveToolResult(result);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save result:', error);
      setSaveStatus('idle');
    }
  };

  const handleDownload = () => {
    if (disabled) return;

    try {
      downloadResult(result);
    } catch (error) {
      console.error('Failed to download result:', error);
    }
  };

  const handleShare = async () => {
    if (disabled) return;

    setShareStatus('sharing');
    try {
      const success = await shareResult(result);
      if (success) {
        setShareStatus('shared');
        setTimeout(() => setShareStatus('idle'), 2000);
      } else {
        setShareStatus('idle');
      }
    } catch (error) {
      console.error('Failed to share result:', error);
      setShareStatus('idle');
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        onClick={handleSave}
        disabled={disabled || saveStatus === 'saving'}
        variant='outline'
        size='sm'
        className='flex items-center gap-2'
      >
        {saveStatus === 'saved' ? (
          <Check className='h-4 w-4' />
        ) : (
          <Save className='h-4 w-4' />
        )}
        {saveStatus === 'saving'
          ? 'Saving...'
          : saveStatus === 'saved'
            ? 'Saved!'
            : 'Save'}
      </Button>

      <Button
        onClick={handleDownload}
        disabled={disabled}
        variant='outline'
        size='sm'
        className='flex items-center gap-2'
      >
        <Download className='h-4 w-4' />
        Download
      </Button>

      <Button
        onClick={handleShare}
        disabled={disabled || shareStatus === 'sharing'}
        variant='outline'
        size='sm'
        className='flex items-center gap-2'
      >
        {shareStatus === 'shared' ? (
          <Check className='h-4 w-4' />
        ) : (
          <Share2 className='h-4 w-4' />
        )}
        {shareStatus === 'sharing'
          ? 'Sharing...'
          : shareStatus === 'shared'
            ? 'Shared!'
            : 'Share'}
      </Button>
    </div>
  );
}
