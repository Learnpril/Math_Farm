/**
 * Bundle performance monitoring component
 * Tracks loading times, bundle sizes, and optimization metrics
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import {
  Activity,
  Download,
  Zap,
  Clock,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { cn } from '../lib/utils';

interface BundleMetrics {
  totalSize: number;
  gzippedSize: number;
  loadTime: number;
  chunks: Array<{
    name: string;
    size: number;
    loadTime: number;
    cached: boolean;
  }>;
  coreWebVitals: {
    LCP: number;
    FID: number;
    CLS: number;
  };
  resourceTiming: PerformanceResourceTiming[];
}

interface LoadingStage {
  name: string;
  startTime: number;
  endTime?: number;
  status: 'pending' | 'loading' | 'complete' | 'error';
}

export interface BundlePerformanceMonitorProps {
  className?: string;
  showDetails?: boolean;
  autoStart?: boolean;
}

export const BundlePerformanceMonitor: React.FC<
  BundlePerformanceMonitorProps
> = ({ className, showDetails = false, autoStart = true }) => {
  const [metrics, setMetrics] = useState<BundleMetrics | null>(null);
  const [loadingStages, setLoadingStages] = useState<LoadingStage[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [showDetailedView, setShowDetailedView] = useState(showDetails);

  // Initialize monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    setLoadingStages([
      {
        name: 'Initial Bundle',
        startTime: performance.now(),
        status: 'loading',
      },
      { name: 'Math Libraries', startTime: 0, status: 'pending' },
      { name: 'UI Components', startTime: 0, status: 'pending' },
      { name: 'Interactive Tools', startTime: 0, status: 'pending' },
    ]);

    // Collect performance metrics
    collectMetrics();
  }, []);

  // Collect performance metrics
  const collectMetrics = useCallback(() => {
    // Get resource timing data
    const resourceEntries = performance.getEntriesByType(
      'resource'
    ) as PerformanceResourceTiming[];

    // Filter for JavaScript bundles
    const jsResources = resourceEntries.filter(
      entry =>
        entry.name.includes('.js') && !entry.name.includes('node_modules')
    );

    // Calculate bundle metrics
    const totalSize = jsResources.reduce(
      (sum, entry) => sum + (entry.transferSize || 0),
      0
    );
    const loadTime = jsResources.reduce(
      (max, entry) => Math.max(max, entry.responseEnd - entry.startTime),
      0
    );

    // Get Core Web Vitals (mock values for demo)
    const coreWebVitals = {
      LCP: performance.now(), // Largest Contentful Paint
      FID: Math.random() * 100, // First Input Delay
      CLS: Math.random() * 0.1, // Cumulative Layout Shift
    };

    // Create chunks data
    const chunks = jsResources.map(entry => ({
      name:
        entry.name
          .split('/')
          .pop()
          ?.replace(/\.[^/.]+$/, '') || 'unknown',
      size: entry.transferSize || 0,
      loadTime: entry.responseEnd - entry.startTime,
      cached: entry.transferSize === 0,
    }));

    setMetrics({
      totalSize,
      gzippedSize: Math.round(totalSize * 0.7), // Estimate
      loadTime,
      chunks,
      coreWebVitals,
      resourceTiming: jsResources,
    });

    // Update loading stages
    setLoadingStages(prev =>
      prev.map((stage, index) => {
        if (index === 0) {
          return { ...stage, endTime: performance.now(), status: 'complete' };
        }
        return stage;
      })
    );
  }, []);

  // Simulate loading stages for demo
  useEffect(() => {
    if (!isMonitoring) return;

    const timers: NodeJS.Timeout[] = [];

    // Simulate math libraries loading
    timers.push(
      setTimeout(() => {
        setLoadingStages(prev =>
          prev.map((stage, index) =>
            index === 1
              ? { ...stage, startTime: performance.now(), status: 'loading' }
              : stage
          )
        );
      }, 500)
    );

    timers.push(
      setTimeout(() => {
        setLoadingStages(prev =>
          prev.map((stage, index) =>
            index === 1
              ? { ...stage, endTime: performance.now(), status: 'complete' }
              : index === 2
                ? { ...stage, startTime: performance.now(), status: 'loading' }
                : stage
          )
        );
      }, 1200)
    );

    // Simulate UI components loading
    timers.push(
      setTimeout(() => {
        setLoadingStages(prev =>
          prev.map((stage, index) =>
            index === 2
              ? { ...stage, endTime: performance.now(), status: 'complete' }
              : index === 3
                ? { ...stage, startTime: performance.now(), status: 'loading' }
                : stage
          )
        );
      }, 1800)
    );

    // Simulate interactive tools loading
    timers.push(
      setTimeout(() => {
        setLoadingStages(prev =>
          prev.map((stage, index) =>
            index === 3
              ? { ...stage, endTime: performance.now(), status: 'complete' }
              : stage
          )
        );
        setIsMonitoring(false);
      }, 2500)
    );

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [isMonitoring]);

  // Auto-start monitoring
  useEffect(() => {
    if (autoStart) {
      startMonitoring();
    }
  }, [autoStart, startMonitoring]);

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format time
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Get performance score
  const getPerformanceScore = () => {
    if (!metrics) return 0;

    let score = 100;

    // Penalize large bundle size
    if (metrics.totalSize > 1000000) score -= 20; // > 1MB
    if (metrics.totalSize > 2000000) score -= 30; // > 2MB

    // Penalize slow load time
    if (metrics.loadTime > 2000) score -= 20; // > 2s
    if (metrics.loadTime > 5000) score -= 30; // > 5s

    // Penalize poor Core Web Vitals
    if (metrics.coreWebVitals.LCP > 2500) score -= 15;
    if (metrics.coreWebVitals.FID > 100) score -= 10;
    if (metrics.coreWebVitals.CLS > 0.1) score -= 10;

    return Math.max(0, score);
  };

  const performanceScore = getPerformanceScore();

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Activity className='h-5 w-5 text-primary' />
          <h3 className='text-lg font-semibold'>Bundle Performance</h3>
        </div>
        <div className='flex items-center gap-2'>
          {metrics && (
            <Badge
              variant={
                performanceScore >= 80
                  ? 'default'
                  : performanceScore >= 60
                    ? 'secondary'
                    : 'destructive'
              }
              className='flex items-center gap-1'
            >
              {performanceScore >= 80 ? (
                <CheckCircle className='h-3 w-3' />
              ) : (
                <AlertTriangle className='h-3 w-3' />
              )}
              Score: {performanceScore}
            </Badge>
          )}
          <Button
            variant='outline'
            size='sm'
            onClick={() => setShowDetailedView(!showDetailedView)}
          >
            {showDetailedView ? 'Hide' : 'Show'} Details
          </Button>
        </div>
      </div>

      {/* Loading Stages */}
      {isMonitoring && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Clock className='h-4 w-4' />
              Loading Progress
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            {loadingStages.map((stage, index) => (
              <div key={stage.name} className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>{stage.name}</span>
                  <span className='text-xs text-muted-foreground'>
                    {stage.status === 'complete' && stage.endTime
                      ? formatTime(stage.endTime - stage.startTime)
                      : stage.status === 'loading'
                        ? 'Loading...'
                        : 'Pending'}
                  </span>
                </div>
                <Progress
                  value={
                    stage.status === 'complete'
                      ? 100
                      : stage.status === 'loading'
                        ? 60
                        : 0
                  }
                  className='h-2'
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Metrics Overview */}
      {metrics && (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium flex items-center gap-2'>
                <Download className='h-4 w-4' />
                Bundle Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {formatSize(metrics.totalSize)}
              </div>
              <p className='text-xs text-muted-foreground'>
                Gzipped: {formatSize(metrics.gzippedSize)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium flex items-center gap-2'>
                <Zap className='h-4 w-4' />
                Load Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {formatTime(metrics.loadTime)}
              </div>
              <p className='text-xs text-muted-foreground'>
                Total loading time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium flex items-center gap-2'>
                <TrendingUp className='h-4 w-4' />
                Core Web Vitals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-1'>
                <div className='flex justify-between text-xs'>
                  <span>LCP:</span>
                  <span
                    className={
                      metrics.coreWebVitals.LCP > 2500
                        ? 'text-red-500'
                        : 'text-green-500'
                    }
                  >
                    {formatTime(metrics.coreWebVitals.LCP)}
                  </span>
                </div>
                <div className='flex justify-between text-xs'>
                  <span>FID:</span>
                  <span
                    className={
                      metrics.coreWebVitals.FID > 100
                        ? 'text-red-500'
                        : 'text-green-500'
                    }
                  >
                    {formatTime(metrics.coreWebVitals.FID)}
                  </span>
                </div>
                <div className='flex justify-between text-xs'>
                  <span>CLS:</span>
                  <span
                    className={
                      metrics.coreWebVitals.CLS > 0.1
                        ? 'text-red-500'
                        : 'text-green-500'
                    }
                  >
                    {metrics.coreWebVitals.CLS.toFixed(3)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed View */}
      {showDetailedView && metrics && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <FileText className='h-4 w-4' />
              Chunk Analysis
            </CardTitle>
            <CardDescription>
              Detailed breakdown of loaded JavaScript chunks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {metrics.chunks.map((chunk, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between p-3 border rounded-lg'
                >
                  <div className='flex items-center gap-3'>
                    <div className='text-sm font-medium'>{chunk.name}</div>
                    {chunk.cached && (
                      <Badge variant='secondary' className='text-xs'>
                        Cached
                      </Badge>
                    )}
                  </div>
                  <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                    <span>{formatSize(chunk.size)}</span>
                    <span>{formatTime(chunk.loadTime)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className='flex gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={startMonitoring}
          disabled={isMonitoring}
        >
          {isMonitoring ? 'Monitoring...' : 'Start Monitoring'}
        </Button>
        {metrics && (
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              const data = JSON.stringify(metrics, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'bundle-metrics.json';
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export Metrics
          </Button>
        )}
      </div>
    </div>
  );
};
