/**
 * Enhanced performance monitoring component
 * Shows comprehensive performance metrics, memory usage, and optimization insights
 */

import React, { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { useMathWorkerPerformance } from '../hooks/useMathWorker';
import {
  usePerformanceStats,
  useMemoryMonitor,
} from '../hooks/usePerformanceMonitor';
import {
  Activity,
  Cpu,
  Zap,
  AlertCircle,
  MemoryStick,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Trash2,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export function PerformanceMonitor() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const performanceInfo = useMathWorkerPerformance();
  const { stats, renderStats, clearStats } = usePerformanceStats();
  const memoryInfo = useMemoryMonitor();

  // Format memory values
  const formatMemory = (bytes?: number): string => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  // Format duration
  const formatDuration = (ms: number): string => {
    if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`;
    if (ms < 1000) return `${ms.toFixed(1)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Calculate performance score
  const performanceScore = useMemo(() => {
    const avgDuration = stats.averageDuration;
    const successRate = stats.successRate;
    const memoryEfficiency =
      memoryInfo.current && memoryInfo.limit
        ? 1 - memoryInfo.current / memoryInfo.limit
        : 0.8;

    // Score based on speed (lower is better), success rate, and memory efficiency
    const speedScore = Math.max(0, 1 - avgDuration / 1000); // Normalize to 1000ms
    const overallScore =
      (speedScore * 0.4 + successRate * 0.4 + memoryEfficiency * 0.2) * 100;

    return Math.round(Math.max(0, Math.min(100, overallScore)));
  }, [
    stats.averageDuration,
    stats.successRate,
    memoryInfo.current,
    memoryInfo.limit,
  ]);

  // Get performance status
  const getPerformanceStatus = (score: number) => {
    if (score >= 80)
      return {
        label: 'Excellent',
        color: 'text-green-600',
        bg: 'bg-green-100',
      };
    if (score >= 60)
      return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 40)
      return { label: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'Poor', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const status = getPerformanceStatus(performanceScore);

  if (!isVisible) {
    return (
      <div className='fixed bottom-4 right-4 z-50'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setIsVisible(true)}
          className='bg-background/80 backdrop-blur-sm border-primary/20 shadow-lg'
        >
          <Activity className='h-4 w-4 mr-2' />
          Performance
          {stats.totalOperations > 0 && (
            <Badge variant='secondary' className='ml-2 text-xs'>
              {stats.totalOperations}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className='fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-hidden'>
      <Card className='bg-background/95 backdrop-blur-sm border-primary/20 shadow-xl'>
        <div className='p-4 border-b'>
          <div className='flex items-center justify-between mb-2'>
            <div className='flex items-center gap-2'>
              <Activity className='h-5 w-5 text-primary' />
              <span className='font-semibold'>Performance Dashboard</span>
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                size='sm'
                onClick={clearStats}
                className='h-8 w-8 p-0'
                title='Clear statistics'
              >
                <Trash2 className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setIsVisible(false)}
                className='h-8 w-8 p-0'
              >
                ×
              </Button>
            </div>
          </div>

          {/* Performance Score */}
          <div className='flex items-center gap-3'>
            <div className='flex-1'>
              <div className='flex items-center justify-between text-sm mb-1'>
                <span className='text-muted-foreground'>Performance Score</span>
                <span className={`font-semibold ${status.color}`}>
                  {performanceScore}% {status.label}
                </span>
              </div>
              <Progress value={performanceScore} className='h-2' />
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='grid w-full grid-cols-3 mx-4 mt-2'>
            <TabsTrigger value='overview' className='text-xs'>
              Overview
            </TabsTrigger>
            <TabsTrigger value='operations' className='text-xs'>
              Operations
            </TabsTrigger>
            <TabsTrigger value='components' className='text-xs'>
              Components
            </TabsTrigger>
          </TabsList>

          <div className='max-h-96 overflow-y-auto'>
            <TabsContent value='overview' className='p-4 space-y-4'>
              {/* Worker Status */}
              <div className='space-y-2'>
                <h4 className='text-sm font-medium'>System Status</h4>
                <div className='grid grid-cols-2 gap-2 text-xs'>
                  <div className='flex items-center justify-between p-2 bg-muted/50 rounded'>
                    <span className='text-muted-foreground'>Web Workers</span>
                    {performanceInfo.workersSupported ? (
                      performanceInfo.workersAvailable ? (
                        <Badge
                          variant='default'
                          className='text-xs bg-green-500'
                        >
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
                        Unsupported
                      </Badge>
                    )}
                  </div>

                  <div className='flex items-center justify-between p-2 bg-muted/50 rounded'>
                    <span className='text-muted-foreground'>Memory API</span>
                    <Badge
                      variant={memoryInfo.supported ? 'default' : 'secondary'}
                      className='text-xs'
                    >
                      {memoryInfo.supported ? 'Available' : 'Limited'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className='space-y-2'>
                <h4 className='text-sm font-medium'>Key Metrics</h4>
                <div className='grid grid-cols-2 gap-2 text-xs'>
                  <div className='p-2 bg-muted/50 rounded'>
                    <div className='text-muted-foreground'>
                      Total Operations
                    </div>
                    <div className='font-semibold text-lg'>
                      {stats.totalOperations}
                    </div>
                  </div>
                  <div className='p-2 bg-muted/50 rounded'>
                    <div className='text-muted-foreground'>Avg Duration</div>
                    <div className='font-semibold text-lg'>
                      {formatDuration(stats.averageDuration)}
                    </div>
                  </div>
                  <div className='p-2 bg-muted/50 rounded'>
                    <div className='text-muted-foreground'>Success Rate</div>
                    <div className='font-semibold text-lg flex items-center gap-1'>
                      {(stats.successRate * 100).toFixed(1)}%
                      {stats.successRate > 0.95 ? (
                        <CheckCircle className='h-3 w-3 text-green-500' />
                      ) : (
                        <XCircle className='h-3 w-3 text-red-500' />
                      )}
                    </div>
                  </div>
                  <div className='p-2 bg-muted/50 rounded'>
                    <div className='text-muted-foreground'>Memory Usage</div>
                    <div className='font-semibold text-lg'>
                      {formatMemory(memoryInfo.current)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Memory Details */}
              {memoryInfo.supported && (
                <div className='space-y-2'>
                  <h4 className='text-sm font-medium flex items-center gap-2'>
                    <MemoryStick className='h-4 w-4' />
                    Memory Usage
                  </h4>
                  <div className='space-y-2'>
                    <div className='flex justify-between text-xs'>
                      <span className='text-muted-foreground'>Current</span>
                      <span className='font-mono'>
                        {formatMemory(memoryInfo.current)}
                      </span>
                    </div>
                    <div className='flex justify-between text-xs'>
                      <span className='text-muted-foreground'>Peak</span>
                      <span className='font-mono'>
                        {formatMemory(stats.memoryUsage.peak)}
                      </span>
                    </div>
                    <div className='flex justify-between text-xs'>
                      <span className='text-muted-foreground'>Average</span>
                      <span className='font-mono'>
                        {formatMemory(stats.memoryUsage.average)}
                      </span>
                    </div>
                    {memoryInfo.limit && (
                      <>
                        <div className='flex justify-between text-xs'>
                          <span className='text-muted-foreground'>Limit</span>
                          <span className='font-mono'>
                            {formatMemory(memoryInfo.limit)}
                          </span>
                        </div>
                        <Progress
                          value={
                            memoryInfo.current && memoryInfo.limit
                              ? (memoryInfo.current / memoryInfo.limit) * 100
                              : 0
                          }
                          className='h-2'
                        />
                      </>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value='operations' className='p-4 space-y-4'>
              {/* Operations by Type */}
              <div className='space-y-2'>
                <h4 className='text-sm font-medium flex items-center gap-2'>
                  <BarChart3 className='h-4 w-4' />
                  Operations by Type
                </h4>
                <div className='space-y-2'>
                  {Object.entries(stats.operationsByType).map(
                    ([operation, count]) => (
                      <div
                        key={operation}
                        className='flex items-center justify-between text-xs'
                      >
                        <span className='text-muted-foreground capitalize'>
                          {operation}
                        </span>
                        <div className='flex items-center gap-2'>
                          <div className='w-16 bg-muted rounded-full h-2'>
                            <div
                              className='bg-primary h-2 rounded-full'
                              style={{
                                width: `${(count / Math.max(...Object.values(stats.operationsByType))) * 100}%`,
                              }}
                            />
                          </div>
                          <span className='font-mono w-8 text-right'>
                            {count}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Recent Operations */}
              <div className='space-y-2'>
                <h4 className='text-sm font-medium flex items-center gap-2'>
                  <Clock className='h-4 w-4' />
                  Recent Operations
                </h4>
                <div className='space-y-1 max-h-40 overflow-y-auto'>
                  {stats.recentMetrics.slice(0, 10).map(metric => (
                    <div
                      key={metric.id}
                      className='flex items-center justify-between p-2 bg-muted/30 rounded text-xs'
                    >
                      <div className='flex items-center gap-2'>
                        {metric.success ? (
                          <CheckCircle className='h-3 w-3 text-green-500' />
                        ) : (
                          <XCircle className='h-3 w-3 text-red-500' />
                        )}
                        <span className='capitalize'>{metric.operation}</span>
                        {metric.component && (
                          <Badge
                            variant='outline'
                            className='text-xs px-1 py-0'
                          >
                            {metric.component}
                          </Badge>
                        )}
                      </div>
                      <span className='font-mono'>
                        {formatDuration(metric.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value='components' className='p-4 space-y-4'>
              {/* Component Render Performance */}
              <div className='space-y-2'>
                <h4 className='text-sm font-medium flex items-center gap-2'>
                  <RefreshCw className='h-4 w-4' />
                  Component Performance
                </h4>
                <div className='space-y-2 max-h-60 overflow-y-auto'>
                  {renderStats.map(component => (
                    <div
                      key={component.componentName}
                      className='p-2 bg-muted/30 rounded'
                    >
                      <div className='flex items-center justify-between mb-1'>
                        <span className='text-xs font-medium'>
                          {component.componentName}
                        </span>
                        <Badge variant='outline' className='text-xs'>
                          {component.renderCount} renders
                        </Badge>
                      </div>
                      <div className='grid grid-cols-2 gap-2 text-xs text-muted-foreground'>
                        <div>
                          Avg: {formatDuration(component.averageRenderTime)}
                        </div>
                        <div>
                          Last: {formatDuration(component.lastRenderTime)}
                        </div>
                        <div>
                          Total: {formatDuration(component.totalRenderTime)}
                        </div>
                        <div>Props changes: {component.propsChanges}</div>
                      </div>
                    </div>
                  ))}
                  {renderStats.length === 0 && (
                    <div className='text-center text-muted-foreground text-xs py-4'>
                      No component metrics available
                    </div>
                  )}
                </div>
              </div>

              {/* Performance Tips */}
              <div className='space-y-2'>
                <h4 className='text-sm font-medium'>Optimization Tips</h4>
                <div className='space-y-1 text-xs text-muted-foreground'>
                  {stats.averageDuration > 100 && (
                    <div className='flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded'>
                      <TrendingDown className='h-3 w-3 text-yellow-600' />
                      <span>
                        Consider using Web Workers for heavy calculations
                      </span>
                    </div>
                  )}
                  {stats.successRate < 0.9 && (
                    <div className='flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded'>
                      <AlertCircle className='h-3 w-3 text-red-600' />
                      <span>
                        High error rate detected - check input validation
                      </span>
                    </div>
                  )}
                  {memoryInfo.current &&
                    memoryInfo.limit &&
                    memoryInfo.current / memoryInfo.limit > 0.8 && (
                      <div className='flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded'>
                        <MemoryStick className='h-3 w-3 text-orange-600' />
                        <span>
                          High memory usage - consider clearing caches
                        </span>
                      </div>
                    )}
                  {renderStats.some(c => c.averageRenderTime > 16) && (
                    <div className='flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded'>
                      <TrendingUp className='h-3 w-3 text-blue-600' />
                      <span>
                        Some components render slowly - use React.memo
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}

export default React.memo(PerformanceMonitor);
