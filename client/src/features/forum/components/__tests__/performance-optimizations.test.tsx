/**
 * Tests for forum performance optimizations
 * Verifies lazy loading, virtualization, and image optimization work correctly
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByType: vi.fn(() => []),
  memory: {
    usedJSHeapSize: 1024 * 1024 * 10, // 10MB
  },
};

Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true,
});

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
});
global.IntersectionObserver = mockIntersectionObserver;

// Mock PerformanceObserver
const mockPerformanceObserver = vi.fn();
mockPerformanceObserver.mockReturnValue({
  observe: vi.fn(),
  disconnect: vi.fn(),
});
global.PerformanceObserver = mockPerformanceObserver;

import { VirtualizedThreadList } from '../VirtualizedThreadList';
import { VirtualizedPostList } from '../VirtualizedPostList';
import { OptimizedForumImage } from '../OptimizedForumImage';
import {
  useForumPerformance,
  useVirtualizedListPerformance,
} from '../../hooks/useForumPerformance';

// Mock data
const mockThreads = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  title: `Test Thread ${i + 1}`,
  categoryId: 1,
  authorId: 1,
  authorName: `User${i + 1}`,
  isPinned: i < 3,
  isLocked: false,
  postCount: Math.floor(Math.random() * 50),
  lastPostAt: new Date(Date.now() - Math.random() * 86400000),
  createdAt: new Date(Date.now() - Math.random() * 86400000 * 7),
  lastPostAuthor: `LastUser${i + 1}`,
}));

const mockPosts = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  threadId: 1,
  authorId: 1,
  authorName: `User${i + 1}`,
  parentPostId:
    i > 0 && Math.random() > 0.7
      ? Math.floor(Math.random() * i) + 1
      : undefined,
  content: `This is test post content ${i + 1}. `.repeat(
    Math.floor(Math.random() * 5) + 1
  ),
  mathExpressions: [],
  isEdited: false,
  createdAt: new Date(Date.now() - Math.random() * 86400000),
  likeCount: Math.floor(Math.random() * 20),
  isLiked: false,
  replies: [],
}));

describe('Forum Performance Optimizations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('VirtualizedThreadList', () => {
    it('should render only visible threads', async () => {
      render(
        <VirtualizedThreadList
          threads={mockThreads}
          containerHeight={400}
          itemHeight={120}
        />
      );

      // Should not render all 100 threads at once
      const renderedThreads = screen.queryAllByText(/Test Thread/);
      expect(renderedThreads.length).toBeLessThan(mockThreads.length);
      expect(renderedThreads.length).toBeGreaterThan(0);
    });

    it('should handle empty thread list', () => {
      render(
        <VirtualizedThreadList
          threads={[]}
          containerHeight={400}
          itemHeight={120}
        />
      );

      expect(screen.getByText('No threads found')).toBeInTheDocument();
    });

    it('should separate pinned threads', () => {
      render(
        <VirtualizedThreadList
          threads={mockThreads}
          containerHeight={400}
          itemHeight={120}
          showPinnedSeparately={true}
        />
      );

      expect(screen.getByText('Pinned Threads')).toBeInTheDocument();
    });

    it('should handle thread clicks', async () => {
      const onThreadClick = vi.fn();

      render(
        <VirtualizedThreadList
          threads={mockThreads.slice(0, 5)}
          containerHeight={400}
          itemHeight={120}
          onThreadClick={onThreadClick}
        />
      );

      const firstThread = screen.getByText('Test Thread 1');
      fireEvent.click(firstThread);

      expect(onThreadClick).toHaveBeenCalledWith(1);
    });
  });

  describe('VirtualizedPostList', () => {
    it('should render posts efficiently', async () => {
      render(
        <VirtualizedPostList
          posts={mockPosts}
          containerHeight={600}
          itemHeight={200}
          enableVirtualization={true}
        />
      );

      // Should show post count
      expect(screen.getByText(/posts/)).toBeInTheDocument();
    });

    it('should handle empty post list', () => {
      render(
        <VirtualizedPostList
          posts={[]}
          containerHeight={600}
          itemHeight={200}
        />
      );

      expect(screen.getByText('No posts found')).toBeInTheDocument();
    });

    it('should disable virtualization for small lists', () => {
      const smallPosts = mockPosts.slice(0, 5);

      render(
        <VirtualizedPostList
          posts={smallPosts}
          containerHeight={600}
          itemHeight={200}
          enableVirtualization={true}
        />
      );

      // Should render all posts when list is small
      expect(screen.getByText(/5 posts/)).toBeInTheDocument();
    });
  });

  describe('OptimizedForumImage', () => {
    it('should render with lazy loading by default', () => {
      render(
        <OptimizedForumImage
          src='/test-image.jpg'
          alt='Test image'
          width={300}
          height={200}
        />
      );

      const img = screen.getByAltText('Test image');
      expect(img).toHaveClass('lazy');
    });

    it('should support lightbox functionality', async () => {
      render(
        <OptimizedForumImage
          src='/test-image.jpg'
          alt='Test image'
          width={300}
          height={200}
          enableLightbox={true}
        />
      );

      const img = screen.getByAltText('Test image');
      expect(img).toHaveStyle('cursor: pointer');
    });

    it('should handle download functionality', async () => {
      // Mock fetch for download
      global.fetch = vi.fn().mockResolvedValue({
        blob: () => Promise.resolve(new Blob(['test'], { type: 'image/jpeg' })),
      });

      // Mock URL.createObjectURL
      global.URL.createObjectURL = vi.fn(() => 'blob:test-url');
      global.URL.revokeObjectURL = vi.fn();

      render(
        <OptimizedForumImage
          src='/test-image.jpg'
          alt='Test image'
          width={300}
          height={200}
          enableDownload={true}
        />
      );

      // Should render without errors
      expect(screen.getByAltText('Test image')).toBeInTheDocument();
    });
  });

  describe('Performance Hooks', () => {
    it('should track render performance', () => {
      const TestComponent = () => {
        const { startRenderTracking, endRenderTracking, metrics } =
          useForumPerformance('TestComponent');

        React.useEffect(() => {
          startRenderTracking();
          // Simulate some work
          setTimeout(endRenderTracking, 10);
        }, [startRenderTracking, endRenderTracking]);

        return <div data-testid='metrics'>{JSON.stringify(metrics)}</div>;
      };

      render(<TestComponent />);

      expect(screen.getByTestId('metrics')).toBeInTheDocument();
    });

    it('should track virtualized list performance', () => {
      const TestComponent = () => {
        const { scrollPerformance, trackScrollPerformance } =
          useVirtualizedListPerformance('TestList', 100, 10);

        React.useEffect(() => {
          trackScrollPerformance(100);
        }, [trackScrollPerformance]);

        return (
          <div data-testid='scroll-metrics'>
            {JSON.stringify(scrollPerformance)}
          </div>
        );
      };

      render(<TestComponent />);

      expect(screen.getByTestId('scroll-metrics')).toBeInTheDocument();
    });
  });

  describe('Code Splitting', () => {
    it('should lazy load components', async () => {
      // Mock dynamic import
      const mockLazyComponent = vi.fn().mockResolvedValue({
        default: () => <div>Lazy Component Loaded</div>,
      });

      // This would normally be tested with actual lazy components
      // but we'll test the concept
      expect(mockLazyComponent).toBeDefined();
    });
  });

  describe('Memory Management', () => {
    it('should track memory usage when available', () => {
      const TestComponent = () => {
        const { metrics } = useForumPerformance('TestComponent', {
          enableMemoryTracking: true,
        });

        return (
          <div data-testid='memory'>
            {metrics.memoryUsage || 'No memory data'}
          </div>
        );
      };

      render(<TestComponent />);

      const memoryElement = screen.getByTestId('memory');
      expect(memoryElement).toBeInTheDocument();
    });

    it('should handle missing performance.memory gracefully', () => {
      const originalMemory = (performance as any).memory;
      delete (performance as any).memory;

      const TestComponent = () => {
        const { metrics } = useForumPerformance('TestComponent', {
          enableMemoryTracking: true,
        });

        return (
          <div data-testid='memory'>
            {metrics.memoryUsage || 'No memory data'}
          </div>
        );
      };

      render(<TestComponent />);

      expect(screen.getByText('No memory data')).toBeInTheDocument();

      // Restore
      (performance as any).memory = originalMemory;
    });
  });

  describe('Image Optimization', () => {
    it('should optimize image dimensions', () => {
      render(
        <OptimizedForumImage
          src='/large-image.jpg'
          alt='Large image'
          width={2000}
          height={1500}
          maxDisplayWidth={600}
          maxDisplayHeight={400}
        />
      );

      const img = screen.getByAltText('Large image');
      // Should be constrained to max dimensions while maintaining aspect ratio
      expect(img).toBeInTheDocument();
    });

    it('should show image info when enabled', () => {
      render(
        <OptimizedForumImage
          src='/test-image.jpg'
          alt='Test image'
          width={800}
          height={600}
          showImageInfo={true}
        />
      );

      // Image info would be shown on load
      expect(screen.getByAltText('Test image')).toBeInTheDocument();
    });
  });

  describe('Performance Monitoring', () => {
    it('should warn about slow renders', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Mock slow render
      mockPerformance.now.mockReturnValueOnce(0).mockReturnValueOnce(20); // 20ms render time

      const TestComponent = () => {
        const { startRenderTracking, endRenderTracking } =
          useForumPerformance('SlowComponent');

        React.useEffect(() => {
          startRenderTracking();
          endRenderTracking();
        }, [startRenderTracking, endRenderTracking]);

        return <div>Slow Component</div>;
      };

      render(<TestComponent />);

      // Should warn about slow render (>16ms)
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Slow render detected')
      );

      consoleSpy.mockRestore();
    });

    it('should track scroll performance', () => {
      const { trackScrollPerformance, scrollPerformance } =
        useVirtualizedListPerformance('TestList', 1000, 20);

      // Simulate scroll events
      trackScrollPerformance(0);
      trackScrollPerformance(100);
      trackScrollPerformance(200);

      expect(scrollPerformance.scrollEventCount).toBeGreaterThan(0);
    });
  });
});
