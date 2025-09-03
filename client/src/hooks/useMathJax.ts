import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseMathJaxReturn {
  isLoaded: boolean;
  renderMath: (expression: string, element: HTMLElement) => Promise<void>;
  error: string | null;
  isLoading: boolean;
}

interface MathJaxConfig {
  tex: {
    inlineMath: string[][];
    displayMath: string[][];
    processEscapes: boolean;
    processEnvironments: boolean;
  };
  svg: {
    fontCache: string;
  };
  startup: {
    ready: () => void;
  };
}

declare global {
  interface Window {
    MathJax?: {
      typesetPromise?: (elements?: HTMLElement[]) => Promise<void>;
      tex2svgPromise?: (expression: string, options?: any) => Promise<any>;
      startup?: {
        promise: Promise<void>;
      };
      config?: MathJaxConfig;
    };
  }
}

/**
 * Custom hook for MathJax integration with lazy loading and error handling
 * Provides methods to load MathJax library and render mathematical expressions
 */
export function useMathJax(): UseMathJaxReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingPromiseRef = useRef<Promise<void> | null>(null);

  // Configure MathJax before loading
  const configureMathJax = useCallback(() => {
    if (typeof window === 'undefined') return;

    window.MathJax = {
      tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true,
        processEnvironments: true,
      },
      svg: {
        fontCache: 'global',
      },
      startup: {
        ready: () => {
          if (window.MathJax?.startup) {
            window.MathJax.startup.promise.then(() => {
              setIsLoaded(true);
              setIsLoading(false);
              setError(null);
            }).catch((err) => {
              setError(`MathJax startup failed: ${err.message}`);
              setIsLoading(false);
            });
          }
        },
      },
    };
  }, []);

  // Load MathJax library dynamically
  const loadMathJax = useCallback(async (): Promise<void> => {
    if (typeof window === 'undefined') {
      throw new Error('MathJax can only be loaded in browser environment');
    }

    if (isLoaded || loadingPromiseRef.current) {
      return loadingPromiseRef.current || Promise.resolve();
    }

    setIsLoading(true);
    setError(null);

    loadingPromiseRef.current = new Promise((resolve, reject) => {
      try {
        // Configure MathJax before loading
        configureMathJax();

        // Create script element for MathJax
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mathjax@4.0.0-beta.6/tex-svg.js';
        script.async = true;
        script.id = 'mathjax-script';

        script.onload = () => {
          // MathJax will call the ready function in config
          resolve();
        };

        script.onerror = () => {
          const errorMsg = 'Failed to load MathJax library';
          setError(errorMsg);
          setIsLoading(false);
          reject(new Error(errorMsg));
        };

        // Check if script already exists
        const existingScript = document.getElementById('mathjax-script');
        if (existingScript) {
          existingScript.remove();
        }

        document.head.appendChild(script);
      } catch (err) {
        const errorMsg = `MathJax loading error: ${err instanceof Error ? err.message : 'Unknown error'}`;
        setError(errorMsg);
        setIsLoading(false);
        reject(new Error(errorMsg));
      }
    });

    return loadingPromiseRef.current;
  }, [isLoaded, configureMathJax]);

  // Render mathematical expression in a specific element
  const renderMath = useCallback(async (expression: string, element: HTMLElement): Promise<void> => {
    try {
      // Ensure MathJax is loaded
      if (!isLoaded) {
        await loadMathJax();
      }

      if (!window.MathJax?.typesetPromise) {
        throw new Error('MathJax typeset function not available');
      }

      // Clear previous content and set new expression
      element.innerHTML = `$$${expression}$$`;

      // Typeset the element
      await window.MathJax.typesetPromise([element]);
    } catch (err) {
      const errorMsg = `Math rendering failed: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMsg);
      
      // Fallback to plain text
      element.innerHTML = `[Math Expression: ${expression}]`;
      throw new Error(errorMsg);
    }
  }, [isLoaded, loadMathJax]);

  // Auto-load MathJax on mount if not already loaded
  useEffect(() => {
    if (!isLoaded && !isLoading && !loadingPromiseRef.current) {
      loadMathJax().catch((err) => {
        console.error('Failed to auto-load MathJax:', err);
      });
    }
  }, [isLoaded, isLoading, loadMathJax]);

  return {
    isLoaded,
    renderMath,
    error,
    isLoading,
  };
}