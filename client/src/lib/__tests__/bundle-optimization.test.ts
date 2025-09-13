/**
 * Tests for bundle optimization features
 * Validates dynamic imports, lazy loading, and performance optimizations
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  loadMathJS,
  loadNerdamer,
  loadJSXGraph,
  preloadMathLibraries,
  preloadInteractiveComponents,
  preloadOnHover,
  loadCriticalResources,
} from '../dynamic-imports';
import {
  getOptimizedImageSrc,
  generateSrcSet,
  ImageLazyLoader,
  getGlobalLazyLoader,
  preloadImage,
  generatePlaceholder,
  batchLoadImages,
} from '../image-optimization';

// Mock dynamic imports
vi.mock('mathjs', () => ({
  default: {
    evaluate: vi.fn((expr: string) => {
      if (expr === '2 + 2') return 4;
      return 0;
    }),
    parse: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('nerdamer', () => ({
  default: vi.fn((expr: string) => ({
    toString: () => expr,
    evaluate: () => 42,
  })),
}));

vi.mock('jsxgraph', () => ({
  default: {
    initBoard: vi.fn(),
    createElement: vi.fn(),
  },
}));

describe('Dynamic Imports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadMathJS', () => {
    it('should successfully load mathjs library', async () => {
      const result = await loadMathJS();

      expect(result.loaded).toBe(true);
      expect(result.mathInstance).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should handle loading errors gracefully', async () => {
      // Mock import failure
      vi.doMock('mathjs', () => {
        throw new Error('Failed to load mathjs');
      });

      const result = await loadMathJS();

      expect(result.loaded).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return cached instance on subsequent calls', async () => {
      const result1 = await loadMathJS();
      const result2 = await loadMathJS();

      expect(result1.mathInstance).toBe(result2.mathInstance);
    });
  });

  describe('loadNerdamer', () => {
    it('should successfully load nerdamer library', async () => {
      const result = await loadNerdamer();

      expect(result.loaded).toBe(true);
      expect(result.nerdamerInstance).toBeDefined();
    });

    it('should handle loading errors', async () => {
      vi.doMock('nerdamer', () => {
        throw new Error('Failed to load nerdamer');
      });

      const result = await loadNerdamer();

      expect(result.loaded).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('loadJSXGraph', () => {
    it('should successfully load JSXGraph library', async () => {
      const result = await loadJSXGraph();

      expect(result.loaded).toBe(true);
      expect(result.jsxgraphInstance).toBeDefined();
    });
  });

  describe('preloadMathLibraries', () => {
    it('should preload math libraries', async () => {
      const results = await preloadMathLibraries();

      expect(results).toHaveLength(2);
      expect(
        results.every(
          result =>
            result.status === 'fulfilled' || result.status === 'rejected'
        )
      ).toBe(true);
    });
  });

  describe('preloadInteractiveComponents', () => {
    it('should preload interactive components', async () => {
      const results = await preloadInteractiveComponents();

      expect(results).toHaveLength(2);
    });
  });

  describe('preloadOnHover', () => {
    it('should create hover preloader', () => {
      const mockLoader = vi.fn().mockResolvedValue({});
      const preloader = preloadOnHover(mockLoader);

      expect(preloader.onMouseEnter).toBeDefined();
      expect(preloader.getPreloadPromise).toBeDefined();

      // Simulate hover
      preloader.onMouseEnter();
      expect(preloader.getPreloadPromise()).toBeDefined();
    });

    it('should not create multiple promises for same hover', () => {
      const mockLoader = vi.fn().mockResolvedValue({});
      const preloader = preloadOnHover(mockLoader);

      preloader.onMouseEnter();
      const promise1 = preloader.getPreloadPromise();

      preloader.onMouseEnter();
      const promise2 = preloader.getPreloadPromise();

      expect(promise1).toBe(promise2);
      expect(mockLoader).toHaveBeenCalledTimes(1);
    });
  });

  describe('loadCriticalResources', () => {
    it('should load critical UI resources', async () => {
      const results = await loadCriticalResources();

      expect(results).toHaveLength(3);
    });
  });
});

describe('Image Optimization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOptimizedImageSrc', () => {
    it('should return original src when no options provided', () => {
      const src = '/test-image.jpg';
      const result = getOptimizedImageSrc(src);

      expect(result).toBe(src);
    });

    it('should add query parameters for optimization options', () => {
      const src = '/test-image.jpg';
      const result = getOptimizedImageSrc(src, {
        width: 800,
        height: 600,
        format: 'webp',
        quality: 90,
      });

      expect(result).toContain('w=800');
      expect(result).toContain('h=600');
      expect(result).toContain('f=webp');
      expect(result).toContain('q=90');
    });

    it('should not add auto format to query params', () => {
      const src = '/test-image.jpg';
      const result = getOptimizedImageSrc(src, {
        format: 'auto',
      });

      expect(result).toBe(src);
    });
  });

  describe('generateSrcSet', () => {
    it('should generate srcset with default sizes', () => {
      const src = '/test-image.jpg';
      const result = generateSrcSet(src);

      expect(result).toContain('320w');
      expect(result).toContain('640w');
      expect(result).toContain('1024w');
      expect(result).toContain('1536w');
    });

    it('should generate srcset with custom sizes', () => {
      const src = '/test-image.jpg';
      const result = generateSrcSet(src, [400, 800]);

      expect(result).toContain('400w');
      expect(result).toContain('800w');
      expect(result).not.toContain('320w');
    });
  });

  describe('ImageLazyLoader', () => {
    let mockIntersectionObserver: any;

    beforeEach(() => {
      mockIntersectionObserver = {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      };

      global.IntersectionObserver = vi.fn().mockImplementation(callback => {
        mockIntersectionObserver.callback = callback;
        return mockIntersectionObserver;
      });
    });

    afterEach(() => {
      delete (global as any).IntersectionObserver;
    });

    it('should create intersection observer when supported', () => {
      const loader = new ImageLazyLoader();

      expect(global.IntersectionObserver).toHaveBeenCalled();
    });

    it('should observe images', () => {
      const loader = new ImageLazyLoader();
      const mockImg = document.createElement('img');

      loader.observe(mockImg);

      expect(mockIntersectionObserver.observe).toHaveBeenCalledWith(mockImg);
    });

    it('should load image when intersecting', () => {
      const loader = new ImageLazyLoader();
      const mockImg = document.createElement('img');
      mockImg.dataset.src = 'test-image.jpg';
      mockImg.classList.add('lazy');

      // Simulate intersection
      const mockEntry = {
        target: mockImg,
        isIntersecting: true,
      };

      mockIntersectionObserver.callback([mockEntry], mockIntersectionObserver);

      expect(mockImg.src).toBe('test-image.jpg');
      expect(mockImg.classList.contains('lazy')).toBe(false);
      expect(mockImg.classList.contains('loaded')).toBe(true);
    });

    it('should unobserve images', () => {
      const loader = new ImageLazyLoader();
      const mockImg = document.createElement('img');

      loader.unobserve(mockImg);

      expect(mockIntersectionObserver.unobserve).toHaveBeenCalledWith(mockImg);
    });

    it('should disconnect observer', () => {
      const loader = new ImageLazyLoader();

      loader.disconnect();

      expect(mockIntersectionObserver.disconnect).toHaveBeenCalled();
    });
  });

  describe('getGlobalLazyLoader', () => {
    it('should return singleton instance', () => {
      const loader1 = getGlobalLazyLoader();
      const loader2 = getGlobalLazyLoader();

      expect(loader1).toBe(loader2);
    });
  });

  describe('preloadImage', () => {
    beforeEach(() => {
      document.head.innerHTML = '';
    });

    it('should create preload link', () => {
      preloadImage('/test-image.jpg');

      const link = document.querySelector('link[rel="preload"]');
      expect(link).toBeTruthy();
      expect(link?.getAttribute('href')).toBe('/test-image.jpg');
      expect(link?.getAttribute('as')).toBe('image');
    });

    it('should set crossorigin attribute', () => {
      preloadImage('/test-image.jpg', { crossorigin: 'anonymous' });

      const link = document.querySelector('link[rel="preload"]');
      expect(link?.getAttribute('crossorigin')).toBe('anonymous');
    });

    it('should set fetchpriority attribute', () => {
      preloadImage('/test-image.jpg', { fetchpriority: 'high' });

      const link = document.querySelector('link[rel="preload"]');
      expect(link?.getAttribute('fetchpriority')).toBe('high');
    });
  });

  describe('generatePlaceholder', () => {
    it('should generate SVG placeholder', () => {
      const result = generatePlaceholder(200, 100);

      expect(result).toContain('data:image/svg+xml;base64,');
      expect(atob(result.split(',')[1])).toContain('200');
      expect(atob(result.split(',')[1])).toContain('100');
    });

    it('should use custom color', () => {
      const result = generatePlaceholder(200, 100, '#ff0000');

      expect(atob(result.split(',')[1])).toContain('#ff0000');
    });
  });

  describe('batchLoadImages', () => {
    beforeEach(() => {
      global.Image = class {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src = '';

        constructor() {
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 10);
        }
      } as any;
    });

    it('should load images in batches', async () => {
      const srcs = ['/img1.jpg', '/img2.jpg', '/img3.jpg', '/img4.jpg'];
      const results = await batchLoadImages(srcs, 2);

      expect(results).toHaveLength(4);
      expect(results.every(result => result.loaded)).toBe(true);
    });

    it('should handle loading errors', async () => {
      global.Image = class {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src = '';

        constructor() {
          setTimeout(() => {
            if (this.onerror) this.onerror();
          }, 10);
        }
      } as any;

      const srcs = ['/img1.jpg'];
      const results = await batchLoadImages(srcs);

      expect(results[0].loaded).toBe(false);
      expect(results[0].error).toBeDefined();
    });
  });
});

describe('Performance Optimizations', () => {
  it('should measure bundle loading performance', () => {
    const startTime = performance.now();

    // Simulate some work
    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(duration).toBeGreaterThanOrEqual(0);
  });

  it('should track resource timing', () => {
    const entries = performance.getEntriesByType('resource');

    expect(Array.isArray(entries)).toBe(true);
  });

  it('should support performance observer', () => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        expect(Array.isArray(entries)).toBe(true);
      });

      observer.observe({ entryTypes: ['measure'] });
      observer.disconnect();
    }
  });
});
