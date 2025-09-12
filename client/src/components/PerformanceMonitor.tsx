/**
 * Performance monitoring component for Web Workers
 * Shows performance metrics and worker status
 */

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useMathWorkerPerformance } from '../hooks/useMathWorker';
import { Activity, Cpu, Zap, AlertCircle } from 'lucide-react';

interface PerformanceMetrics {
  operationCount: number;
  averageTime: number;
  workerOperations: number;
  fallbackOperations: number;
}

export function PerformanceMonitor() {
  const performanceInfo = useMathWorkerPerformance();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    operationCount: 0,
    averageTime: 0,
    workerOperations: 0,
    fallbackOperations: 0,
  });
  const [isVisible, setIsVisible] = useState(false);

  // Simulate performance tracking (in a real app, this would come from actual measurements)
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        operationCount: prev.operationCount + Math.floor(Math.random() * 3),
        averageTime: 50 + Math.random() * 100,
        workerOperations:
          prev.workerOperations +
          (performanceInfo.workersAvailable
            ? Math.floor(Math.random() * 2)
            : 0),
        fallbackOperations:
          prev.fallbackOperations + Math.floor(Math.random() * 1),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [performanceInfo.workersAvailable]);

  if (!isVisible) {
    return (
      <div className='fixed bottom-4 right-4 z-50'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setIsVisible(true)}
          className='bg-background/80 backdrop-blur-sm border-primary/20'
        >
          <Activity className='h-4 w-4 mr-2' />
          Performance
        </Button>
      </div>
    );
  }

  return (
    <div className='fixed bottom-4 right-4 z-50 w-80'>
      <Card className='p-4 bg-background/95 backdrop-blur-sm border-primary/20 shadow-lg'>
        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center gap-2'>
            <Activity className='h-4 w-4 text-primary' />
            <span className='font-semibold text-sm'>Performance Monitor</span>
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setIsVisible(false)}
            className='h-6 w-6 p-0'
          >
            ×
          </Button>
        </div>

        <div className='space-y-3'>
          {/* Worker Status */}
          <div className='flex items-center justify-between'>
            <span className='text-xs text-muted-foreground'>Web Workers</span>
            <div className='flex items-center gap-2'>
              {performanceInfo.workersSupported ? (
                performanceInfo.workersAvailable ? (
                  <Badge variant='default' className='text-xs bg-green-500'>
                    <Zap className='h-3 w-3 mr-1' />
                    Active
                  </Badge>
                ) : (
                  <Badge variant='secondary' className='text-xs'>
                    <Cpu className='h-3 w-3 mr-1' />
                    Loading
                  </Badge>
                )
              ) : (
                <Badge variant='destructive' className='text-xs'>
                  <AlertCircle className='h-3 w-3 mr-1' />
                  Not Supported
                </Badge>
              )}
            </div>
          </div>

          {/* Operation Metrics */}
          <div className='grid grid-cols-2 gap-2 text-xs'>
            <div className='bg-muted/50 rounded p-2'>
              <div className='text-muted-foreground'>Total Operations</div>
              <div className='font-semibold'>{metrics.operationCount}</div>
            </div>
            <div className='bg-muted/50 rounded p-2'>
              <div className='text-muted-foreground'>Avg Time</div>
              <div className='font-semibold'>
                {metrics.averageTime.toFixed(0)}ms
              </div>
            </div>
          </div>

          {/* Worker vs Fallback */}
          <div className='space-y-1'>
            <div className='flex justify-between text-xs'>
              <span className='text-muted-foreground'>Worker Operations</span>
              <span className='font-semibold text-green-600'>
                {metrics.workerOperations}
              </span>
            </div>
            <div className='flex justify-between text-xs'>
              <span className='text-muted-foreground'>Fallback Operations</span>
              <span className='font-semibold text-orange-600'>
                {metrics.fallbackOperations}
              </span>
            </div>
          </div>

          {/* Performance Benefits */}
          {performanceInfo.workersAvailable && (
            <div className='bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-2'>
              <div className='text-green-700 dark:text-green-300 text-xs'>
                <div className='font-semibold mb-1'>Performance Benefits:</div>
                <ul className='space-y-0.5 text-xs'>
                  <li>• Non-blocking UI during calculations</li>
                  <li>• Parallel processing for complex operations</li>
                  <li>• Improved responsiveness</li>
                </ul>
              </div>
            </div>
          )}

          {/* Fallback Notice */}
          {!performanceInfo.workersAvailable &&
            performanceInfo.workersSupported && (
              <div className='bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded p-2'>
                <div className='text-orange-700 dark:text-orange-300 text-xs'>
                  <div className='font-semibold mb-1'>Fallback Mode:</div>
                  <div>
                    Using main thread for calculations. Performance may be
                    reduced for complex operations.
                  </div>
                </div>
              </div>
            )}

          {/* Not Supported Notice */}
          {!performanceInfo.workersSupported && (
            <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2'>
              <div className='text-red-700 dark:text-red-300 text-xs'>
                <div className='font-semibold mb-1'>
                  Web Workers Not Supported:
                </div>
                <div>
                  Your browser doesn't support Web Workers. All calculations run
                  on the main thread.
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default PerformanceMonitor;
