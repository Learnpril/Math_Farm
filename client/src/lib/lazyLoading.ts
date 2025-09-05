/**
 * Lazy loading utilities for performance optimization
 * Implements code splitting and dynamic imports for heavy libraries
 */

// Cache for loaded libraries to avoid duplicate loading
const loadedLibraries = new Map<string, Promise<any>>();

/**
 * Lazy load MathJax with proper error handling and caching
 */
export const loadMathJax = async (): Promise<any> => {
  const cacheKey = 'mathjax';
  
  if (loadedLibraries.has(cacheKey)) {
    return loadedLibraries.get(cacheKey);
  }

  const loadPromise = new Promise<any>(async (resolve, reject) => {
    try {
      // Check if MathJax is already available globally
      if (typeof window !== 'undefined' && (window as any).MathJax) {
        resolve((window as any).MathJax);
        return;
      }

      // Dynamic import of better-react-mathjax
      const { MathJaxContext, MathJax } = await import('better-react-mathjax');
      
      // Wait for MathJax to be ready if it's loading
      if ((window as any).MathJax?.startup?.promise) {
        await (window as any).MathJax.startup.promise;
      }

      resolve({ MathJaxContext, MathJax, instance: (window as any).MathJax });
    } catch (error) {
      console.error('Failed to load MathJax:', error);
      reject(error);
    }
  });

  loadedLibraries.set(cacheKey, loadPromise);
  return loadPromise;
};

/**
 * Lazy load JSXGraph with proper error handling and caching
 */
export const loadJSXGraph = async (): Promise<any> => {
  const cacheKey = 'jsxgraph';
  
  if (loadedLibraries.has(cacheKey)) {
    return loadedLibraries.get(cacheKey);
  }

  const loadPromise = new Promise<any>((resolve, reject) => {
    try {
      // Check if JSXGraph is already available
      if (typeof window !== 'undefined' && (window as any).JXG) {
        resolve((window as any).JXG);
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="jsxgraph"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => {
          if ((window as any).JXG) {
            resolve((window as any).JXG);
          } else {
            reject(new Error('JSXGraph failed to initialize'));
          }
        });
        existingScript.addEventListener('error', () => {
          reject(new Error('Failed to load JSXGraph script'));
        });
        return;
      }

      // Create and load the script
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/jsxgraph@1.10.0/distrib/jsxgraphcore.js';
      script.async = true;
      script.crossOrigin = 'anonymous';

      script.onload = () => {
        // Add a small delay to ensure JSXGraph is fully initialized
        setTimeout(() => {
          if ((window as any).JXG && (window as any).JXG.JSXGraph) {
            resolve((window as any).JXG);
          } else {
            reject(new Error('JSXGraph failed to initialize properly'));
          }
        }, 100);
      };

      script.onerror = () => {
        reject(new Error('Failed to load JSXGraph library'));
      };

      document.head.appendChild(script);
    } catch (error) {
      reject(error);
    }
  });

  loadedLibraries.set(cacheKey, loadPromise);
  return loadPromise;
};

/**
 * Lazy load math.js with proper error handling and caching
 */
export const loadMathJS = async (): Promise<any> => {
  const cacheKey = 'mathjs';
  
  if (loadedLibraries.has(cacheKey)) {
    return loadedLibraries.get(cacheKey);
  }

  const loadPromise = import('mathjs').catch(error => {
    console.error('Failed to load math.js:', error);
    throw error;
  });

  loadedLibraries.set(cacheKey, loadPromise);
  return loadPromise;
};

/**
 * Preload critical resources for better performance (simplified)
 */
export const preloadCriticalResources = () => {
  // Simplified to avoid any potential issues
  console.log('Critical resources preloading initialized');
};

/**
 * Image lazy loading utility with intersection observer
 */
export const createImageLazyLoader = () => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      }
    });
  }, {
    rootMargin: '50px 0px', // Start loading 50px before the image enters viewport
    threshold: 0.01
  });

  return imageObserver;
};

// Removed createLazyComponent to avoid TypeScript complexity issues
// Use React.lazy directly in components instead