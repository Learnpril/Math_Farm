/**
 * Demo page showcasing bundle optimization features
 * Demonstrates dynamic imports, lazy loading, virtualization, and performance monitoring
 */

import React, { useState, Suspense } from 'react';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { LazyWrapper } from '../components/ui/LoadingStates';
import {
  VirtualizedMathResults,
  useSampleMathResults,
} from '../components/VirtualizedMathResults';
import { BundlePerformanceMonitor } from '../components/BundlePerformanceMonitor';
import {
  OptimizedImage,
  ResponsiveImage,
} from '../components/ui/OptimizedImage';
import {
  LazyCalculatorDemo,
  LazyEquationSolverDemo,
  preloadMathLibraries,
  preloadOnHover,
  loadMathJS,
} from '../lib/dynamic-imports';
import {
  Download,
  Zap,
  Image as ImageIcon,
  Activity,
  List,
} from 'lucide-react';

export const BundleOptimizationDemo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [mathLibraryLoaded, setMathLibraryLoaded] = useState(false);
  const [showVirtualization, setShowVirtualization] = useState(false);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);

  // Generate sample data for virtualization demo
  const sampleResults = useSampleMathResults(5000);

  // Preload hover handlers
  const calculatorPreloader = preloadOnHover(
    () => import('../features/math-tools/components/CalculatorDemo')
  );
  const equationPreloader = preloadOnHover(
    () => import('../features/math-tools/components/EquationSolverDemo')
  );

  const handleLoadMathLibrary = async () => {
    const result = await loadMathJS();
    setMathLibraryLoaded(result.loaded);
  };

  const handlePreloadLibraries = async () => {
    await preloadMathLibraries();
    console.log('Math libraries preloaded');
  };

  return (
    <div className='container mx-auto p-6 space-y-8'>
      <div className='text-center space-y-4'>
        <h1 className='text-4xl font-bold text-primary'>
          Bundle Optimization Demo
        </h1>
        <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
          Explore advanced performance optimizations including dynamic imports,
          lazy loading, virtualization, and image optimization.
        </p>
      </div>

      {/* Performance Monitor */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Activity className='h-5 w-5' />
            Performance Monitoring
          </CardTitle>
          <CardDescription>
            Real-time bundle performance tracking and optimization metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <Button
              onClick={() => setShowPerformanceMonitor(!showPerformanceMonitor)}
              variant='outline'
            >
              {showPerformanceMonitor ? 'Hide' : 'Show'} Performance Monitor
            </Button>

            {showPerformanceMonitor && (
              <BundlePerformanceMonitor showDetails={true} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Imports */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Download className='h-5 w-5' />
            Dynamic Imports & Lazy Loading
          </CardTitle>
          <CardDescription>
            Load heavy math libraries and components only when needed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-3'>
              <h4 className='font-semibold'>Math Library Loading</h4>
              <div className='flex gap-2'>
                <Button
                  onClick={handleLoadMathLibrary}
                  variant='outline'
                  size='sm'
                >
                  Load Math.js
                </Button>
                <Button
                  onClick={handlePreloadLibraries}
                  variant='outline'
                  size='sm'
                >
                  Preload Libraries
                </Button>
              </div>
              {mathLibraryLoaded && (
                <p className='text-sm text-green-600'>
                  ✓ Math library loaded successfully
                </p>
              )}
            </div>

            <div className='space-y-3'>
              <h4 className='font-semibold'>Component Lazy Loading</h4>
              <div className='flex gap-2'>
                <Button
                  onClick={() => setActiveDemo('calculator')}
                  variant='outline'
                  size='sm'
                  {...calculatorPreloader}
                >
                  Load Calculator
                </Button>
                <Button
                  onClick={() => setActiveDemo('equation')}
                  variant='outline'
                  size='sm'
                  {...equationPreloader}
                >
                  Load Equation Solver
                </Button>
              </div>
            </div>
          </div>

          {/* Lazy loaded components */}
          {activeDemo === 'calculator' && (
            <div className='mt-6'>
              <LazyWrapper>
                <LazyCalculatorDemo />
              </LazyWrapper>
            </div>
          )}

          {activeDemo === 'equation' && (
            <div className='mt-6'>
              <LazyWrapper>
                <LazyEquationSolverDemo />
              </LazyWrapper>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Virtualization */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <List className='h-5 w-5' />
            Large Dataset Virtualization
          </CardTitle>
          <CardDescription>
            Efficiently render thousands of math results with virtual scrolling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <p className='text-sm text-muted-foreground'>
                Demo with {sampleResults.length.toLocaleString()} math results
              </p>
              <Button
                onClick={() => setShowVirtualization(!showVirtualization)}
                variant='outline'
              >
                {showVirtualization ? 'Hide' : 'Show'} Virtualized List
              </Button>
            </div>

            {showVirtualization && (
              <VirtualizedMathResults
                results={sampleResults}
                onResultClick={result => console.log('Clicked result:', result)}
                onExport={results =>
                  console.log('Exporting:', results.length, 'results')
                }
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Image Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <ImageIcon className='h-5 w-5' />
            Image Optimization
          </CardTitle>
          <CardDescription>
            Lazy loading, responsive images, and format optimization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-3'>
              <h4 className='font-semibold'>Optimized Image</h4>
              <OptimizedImage
                src='/MathfarmGirl.png'
                alt='Math Farm mascot'
                width={200}
                height={200}
                className='rounded-lg border'
                placeholder='skeleton'
              />
              <p className='text-xs text-muted-foreground'>
                Lazy loaded with skeleton placeholder
              </p>
            </div>

            <div className='space-y-3'>
              <h4 className='font-semibold'>Responsive Image</h4>
              <ResponsiveImage
                src='/MathfarmGirl.png'
                alt='Math Farm mascot responsive'
                width={200}
                height={200}
                className='rounded-lg border'
                breakpoints={{ sm: 150, md: 200, lg: 250, xl: 300 }}
              />
              <p className='text-xs text-muted-foreground'>
                Responsive with multiple breakpoints
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Zap className='h-5 w-5' />
            Optimization Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            <div className='p-4 border rounded-lg'>
              <h4 className='font-semibold mb-2'>Dynamic Imports</h4>
              <p className='text-sm text-muted-foreground'>
                Math libraries loaded on-demand to reduce initial bundle size
              </p>
            </div>

            <div className='p-4 border rounded-lg'>
              <h4 className='font-semibold mb-2'>Code Splitting</h4>
              <p className='text-sm text-muted-foreground'>
                Components split into separate chunks for faster loading
              </p>
            </div>

            <div className='p-4 border rounded-lg'>
              <h4 className='font-semibold mb-2'>Lazy Loading</h4>
              <p className='text-sm text-muted-foreground'>
                Images and components loaded when they enter the viewport
              </p>
            </div>

            <div className='p-4 border rounded-lg'>
              <h4 className='font-semibold mb-2'>Virtualization</h4>
              <p className='text-sm text-muted-foreground'>
                Large lists render only visible items for better performance
              </p>
            </div>

            <div className='p-4 border rounded-lg'>
              <h4 className='font-semibold mb-2'>Asset Optimization</h4>
              <p className='text-sm text-muted-foreground'>
                Images optimized with modern formats and responsive sizing
              </p>
            </div>

            <div className='p-4 border rounded-lg'>
              <h4 className='font-semibold mb-2'>Performance Monitoring</h4>
              <p className='text-sm text-muted-foreground'>
                Real-time tracking of bundle size and loading performance
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
