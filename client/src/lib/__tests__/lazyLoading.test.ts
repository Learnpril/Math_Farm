import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  loadMathJax,
  loadJSXGraph,
  loadMathJS,
  preloadCriticalResources,
  createImageLazyLoader
} from '../lazyLoading';

// Mock DOM methods
const mockAppendChild = vi.fn();
const mockQuerySelector = vi.fn();
const mockAddEventListener = vi.fn();
const mockCreateElement = vi.fn();

// Mock document
const mockDocument = {
  createElement: mockCreateElement,
  head: {
    appendChild: mockAppendChild,
  },
  querySelector: mockQuerySelector,
};

// Mock window
const mockWindow = {
  MathJax: null as any,
  JXG: null as any,
  IntersectionObserver: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  
  // Reset window mocks
  mockWindow.MathJax = null;
  mockWindow.JXG = null;
  
  // Setup global mocks
  Object.defineProperty(global, 'window', {
    value: mockWindow,
    writable: true,
  });
  
  Object.defineProperty(global, 'document', {
    value: mockDocument,
    writable: true,
  });
  
  // Mock script element
  const mockScript = {
    addEventListener: mockAddEventListener,
    src: '',
    async: false,
    crossOrigin: '',
    onload: null as any,
    onerror: null as any,
  };
  
  mockCreateElement.mockReturnValue(mockScript);
  mockQuerySelector.mockReturnValue(null);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('Lazy Loading Utilities', () => {
  describe('loadMathJax', () => {
    it('should return existing MathJax if already loaded', async () => {
      const mockMathJax = { startup: { promise: Promise.resolve() } };
      mockWindow.MathJax = mockMathJax;
      
      const result = await loadMathJax();
      expect(result.instance).toBe(mockMathJax);
    });

    it('should load MathJax dynamically if not available', async () => {
      // Mock dynamic import
      const mockMathJaxModule = {
        MathJaxContext: vi.fn(),
        MathJax: vi.fn(),
      };
      
      vi.doMock('better-react-mathjax', () => mockMathJaxModule);
      
      const loadPromise = loadMathJax();
      
      // Simulate MathJax becoming available
      mockWindow.MathJax = { startup: { promise: Promise.resolve() } };
      
      const result = await loadPromise;
      expect(result.MathJaxContext).toBe(mockMathJaxModule.MathJaxContext);
      expect(result.MathJax).toBe(mockMathJaxModule.MathJax);
    });

    it('should handle loading errors gracefully', async () => {
      vi.doMock('better-react-mathjax', () => {
        throw new Error('Failed to load');
      });
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await expect(loadMathJax()).rejects.toThrow('Failed to load');
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load MathJax:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should cache loading promise to avoid duplicate loads', async () => {
      const mockMathJaxModule = {
        MathJaxContext: vi.fn(),
        MathJax: vi.fn(),
      };
      
      vi.doMock('better-react-mathjax', () => mockMathJaxModule);
      
      // Start two loads simultaneously
      const promise1 = loadMathJax();
      const promise2 = loadMathJax();
      
      // They should be the same promise
      expect(promise1).toBe(promise2);
    });
  });

  describe('loadJSXGraph', () => {
    it('should return existing JSXGraph if already loaded', async () => {
      const mockJXG = { JSXGraph: {} };
      mockWindow.JXG = mockJXG;
      
      const result = await loadJSXGraph();
      expect(result).toBe(mockJXG);
    });

    it('should create and load script if JSXGraph not available', async () => {
      const loadPromise = loadJSXGraph();
      
      // Get the created script element
      expect(mockCreateElement).toHaveBeenCalledWith('script');
      const script = mockCreateElement.mock.results[0].value;
      
      expect(script.src).toBe('https://cdn.jsdelivr.net/npm/jsxgraph@1.10.0/distrib/jsxgraphcore.js');
      expect(script.async).toBe(true);
      expect(script.crossOrigin).toBe('anonymous');
      expect(mockAppendChild).toHaveBeenCalledWith(script);
      
      // Simulate successful load
      mockWindow.JXG = { JSXGraph: {} };
      script.onload();
      
      const result = await loadPromise;
      expect(result).toBe(mockWindow.JXG);
    });

    it('should handle script loading errors', async () => {
      const loadPromise = loadJSXGraph();
      
      const script = mockCreateElement.mock.results[0].value;
      
      // Simulate script error
      script.onerror();
      
      await expect(loadPromise).rejects.toThrow('Failed to load JSXGraph library');
    });

    it('should handle existing script loading', async () => {
      const mockExistingScript = {
        addEventListener: mockAddEventListener,
      };
      
      mockQuerySelector.mockReturnValue(mockExistingScript);
      
      const loadPromise = loadJSXGraph();
      
      expect(mockAddEventListener).toHaveBeenCalledWith('load', expect.any(Function));
      expect(mockAddEventListener).toHaveBeenCalledWith('error', expect.any(Function));
      
      // Simulate successful load of existing script
      mockWindow.JXG = { JSXGraph: {} };
      const loadCallback = mockAddEventListener.mock.calls.find(call => call[0] === 'load')[1];
      loadCallback();
      
      const result = await loadPromise;
      expect(result).toBe(mockWindow.JXG);
    });
  });

  describe('loadMathJS', () => {
    it('should load math.js dynamically', async () => {
      const mockMathJS = { evaluate: vi.fn() };
      
      vi.doMock('mathjs', () => mockMathJS);
      
      const result = await loadMathJS();
      expect(result).toBe(mockMathJS);
    });

    it('should handle loading errors', async () => {
      vi.doMock('mathjs', () => {
        throw new Error('Failed to load math.js');
      });
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await expect(loadMathJS()).rejects.toThrow('Failed to load math.js');
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load math.js:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('preloadCriticalResources', () => {
    it('should create preload links for critical resources', () => {
      preloadCriticalResources();
      
      expect(mockCreateElement).toHaveBeenCalledWith('link');
      expect(mockAppendChild).toHaveBeenCalled();
      
      // Check that preload links were created
      const createdElements = mockCreateElement.mock.results.map(result => result.value);
      const preloadLinks = createdElements.filter(el => el.rel === 'preload' || el.rel === 'dns-prefetch');
      
      expect(preloadLinks.length).toBeGreaterThan(0);
    });

    it('should handle undefined window gracefully', () => {
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
      });
      
      expect(() => preloadCriticalResources()).not.toThrow();
    });
  });

  describe('createImageLazyLoader', () => {
    it('should create IntersectionObserver when supported', () => {
      const mockObserver = {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      };
      
      mockWindow.IntersectionObserver.mockImplementation((callback, options) => {
        expect(options.rootMargin).toBe('50px 0px');
        expect(options.threshold).toBe(0.01);
        return mockObserver;
      });
      
      const observer = createImageLazyLoader();
      
      expect(observer).toBe(mockObserver);
      expect(mockWindow.IntersectionObserver).toHaveBeenCalled();
    });

    it('should return null when IntersectionObserver not supported', () => {
      delete (mockWindow as any).IntersectionObserver;
      
      const observer = createImageLazyLoader();
      expect(observer).toBeNull();
    });

    it('should handle image loading when intersecting', () => {
      const mockObserver = {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      };
      
      let observerCallback: any;
      
      mockWindow.IntersectionObserver.mockImplementation((callback) => {
        observerCallback = callback;
        return mockObserver;
      });
      
      const observer = createImageLazyLoader();
      
      // Simulate intersection
      const mockImg = {
        dataset: { src: 'test-image.jpg' },
        src: '',
        classList: { remove: vi.fn() },
      };
      
      const mockEntry = {
        isIntersecting: true,
        target: mockImg,
      };
      
      observerCallback([mockEntry], observer);
      
      expect(mockImg.src).toBe('test-image.jpg');
      expect(mockImg.classList.remove).toHaveBeenCalledWith('lazy');
      expect(mockObserver.unobserve).toHaveBeenCalledWith(mockImg);
    });
  });
});