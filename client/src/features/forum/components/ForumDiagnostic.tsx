/**
 * Forum Diagnostic Component
 * Helps identify issues with forum functionality
 */
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { SimpleAvatarDisplay } from './avatar/SimpleAvatarDisplay';
import { useForumApi } from '../hooks/useForumApi';

export function ForumDiagnostic() {
  const [diagnostics, setDiagnostics] = React.useState<Record<string, any>>({});
  const { apiCall } = useForumApi();

  const runDiagnostics = async () => {
    const results: Record<string, any> = {};

    // Test 1: Avatar image loading
    try {
      const img = new Image();
      const avatarLoadPromise = new Promise((resolve, reject) => {
        img.onload = () => resolve('success');
        img.onerror = () => reject('failed');
        img.src = '/assets/avatar/base/chibi-default.png';
      });

      results.avatarImage = await avatarLoadPromise;
    } catch (error) {
      results.avatarImage = 'failed';
    }

    // Test 2: API call functionality
    try {
      if (apiCall) {
        const response = await apiCall('/api/health');
        results.apiCall = response.success ? 'success' : 'failed';
      } else {
        results.apiCall = 'apiCall function not available';
      }
    } catch (error) {
      results.apiCall = 'failed';
    }

    // Test 3: Static file serving
    try {
      const response = await fetch('/manifest.json');
      results.staticFiles = response.ok ? 'success' : 'failed';
    } catch (error) {
      results.staticFiles = 'failed';
    }

    // Test 4: Performance API
    results.performanceAPI =
      typeof performance !== 'undefined' ? 'available' : 'not available';

    // Test 5: WebSocket support
    results.webSocketSupport =
      typeof WebSocket !== 'undefined' ? 'available' : 'not available';

    setDiagnostics(results);
  };

  const getStatusBadge = (status: string) => {
    if (status === 'success' || status === 'available') {
      return (
        <Badge variant='default' className='bg-green-500'>
          ✓ {status}
        </Badge>
      );
    } else if (status === 'failed' || status === 'not available') {
      return <Badge variant='destructive'>✗ {status}</Badge>;
    } else {
      return <Badge variant='secondary'>{status}</Badge>;
    }
  };

  return (
    <Card className='w-full max-w-2xl mx-auto'>
      <CardHeader>
        <CardTitle>Forum Diagnostic Tool</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <Button onClick={runDiagnostics} className='w-full'>
          Run Diagnostics
        </Button>

        {Object.keys(diagnostics).length > 0 && (
          <div className='space-y-3'>
            <h3 className='font-semibold'>Diagnostic Results:</h3>

            <div className='grid grid-cols-1 gap-2'>
              <div className='flex justify-between items-center'>
                <span>Avatar Image Loading:</span>
                {getStatusBadge(diagnostics.avatarImage)}
              </div>

              <div className='flex justify-between items-center'>
                <span>API Call Function:</span>
                {getStatusBadge(diagnostics.apiCall)}
              </div>

              <div className='flex justify-between items-center'>
                <span>Static File Serving:</span>
                {getStatusBadge(diagnostics.staticFiles)}
              </div>

              <div className='flex justify-between items-center'>
                <span>Performance API:</span>
                {getStatusBadge(diagnostics.performanceAPI)}
              </div>

              <div className='flex justify-between items-center'>
                <span>WebSocket Support:</span>
                {getStatusBadge(diagnostics.webSocketSupport)}
              </div>
            </div>
          </div>
        )}

        <div className='border-t pt-4'>
          <h3 className='font-semibold mb-2'>Avatar Test:</h3>
          <div className='flex items-center gap-4'>
            <SimpleAvatarDisplay size={48} fallbackInitials='T' />
            <span className='text-sm text-muted-foreground'>
              If you see a colorful circle instead of a chibi character, the
              avatar image failed to load.
            </span>
          </div>
        </div>

        <div className='border-t pt-4'>
          <h3 className='font-semibold mb-2'>Browser Info:</h3>
          <div className='text-sm space-y-1'>
            <div>User Agent: {navigator.userAgent}</div>
            <div>URL: {window.location.href}</div>
            <div>Protocol: {window.location.protocol}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
