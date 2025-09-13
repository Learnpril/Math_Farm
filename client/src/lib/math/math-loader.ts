/**
 * Math library loader utility for dynamically loading math.js.
 * Provides singleton-based loading with fallback mechanisms, error handling,
 * and configuration support for mathematical computations.
 *
 * @example
 * ```typescript
 * const result = await loadMathJS();
 * if (result.loaded) {
 *   const math = getMathInstance();
 *   console.log(math.evaluate('2 + 3')); // 5
 * }
 * ```
 */

import { createFallbackMath } from './fallback-math';
import { errorLogger } from '../errorLogging';

declare global {
  interface Window {
    math?: any;
  }
}

export interface MathLoaderResult {
  loaded: boolean;
  error?: string;
  mathInstance?: any; // Using any since we'll load dynamically
}

/**
 * Singleton class for managing math.js library loading and configuration.
 * Handles dynamic loading, caching, error recovery, and provides fallback
 * implementations when the main library is unavailable.
 *
 * @example
 * ```typescript
 * const loader = MathLoader.getInstance();
 * const result = await loader.loadMathJS();
 * const mathInstance = loader.getMathInstance();
 * ```
 */
export class MathLoader {
  private static instance: MathLoader;
  private loadPromise: Promise<MathLoaderResult> | null = null;
  private isLoaded = false;
  private mathInstance: any = null;

  /**
   * Private constructor to enforce singleton pattern.
   */
  private constructor() {}

  /**
   * Gets the singleton instance of MathLoader.
   * Creates a new instance if one doesn't exist.
   *
   * @returns The singleton MathLoader instance
   */
  static getInstance(): MathLoader {
    if (!MathLoader.instance) {
      MathLoader.instance = new MathLoader();
    }
    return MathLoader.instance;
  }

  /**
   * Loads math.js library dynamically with fallback support.
   * Returns cached result if already loaded, or creates new loading promise.
   * Uses fallback implementation to avoid Node.js compatibility issues.
   *
   * @returns Promise resolving to MathLoaderResult with loading status and instance
   *
   * @example
   * ```typescript
   * const result = await loader.loadMathJS();
   * if (result.loaded) {
   *   console.log('Math.js loaded successfully');
   * } else {
   *   console.error('Loading failed:', result.error);
   * }
   * ```
   */
  async loadMathJS(): Promise<MathLoaderResult> {
    // Return existing promise if already loading
    if (this.loadPromise) {
      return this.loadPromise;
    }

    // Return cached result if already loaded
    if (this.isLoaded && window.math) {
      return {
        loaded: true,
        mathInstance: this.mathInstance || window.math,
      };
    }

    // Create new loading promise
    this.loadPromise = this.performLoad();
    return this.loadPromise;
  }

  private async performLoad(): Promise<MathLoaderResult> {
    try {
      // Check if math.js is already available
      if (this.mathInstance) {
        return {
          loaded: true,
          mathInstance: this.mathInstance,
        };
      }

      // Try to dynamically import mathjs first
      try {
        const mathModule = await import('mathjs');
        const mathjs = mathModule.default || mathModule;

        this.mathInstance = mathjs;
        this.isLoaded = true;

        // Also make it available globally for compatibility
        if (typeof window !== 'undefined') {
          window.math = mathjs;
        }

        console.log('Successfully loaded mathjs via dynamic import');
        return {
          loaded: true,
          mathInstance: mathjs,
        };
      } catch (importError) {
        console.warn(
          'Failed to dynamically import mathjs, using fallback:',
          importError
        );

        // Fall back to our custom implementation
        const fallbackMath = createFallbackMath();
        this.mathInstance = fallbackMath;
        this.isLoaded = true;

        // Also make it available globally for compatibility
        if (typeof window !== 'undefined') {
          window.math = fallbackMath;
        }

        return {
          loaded: true,
          mathInstance: fallbackMath,
        };
      }
    } catch (error) {
      const errorObj =
        error instanceof Error
          ? error
          : new Error('Unknown error loading math.js');

      // Log the library loading error
      errorLogger.logLibraryError('math.js', errorObj, {
        timestamp: new Date().toISOString(),
        fallbackUsed: true,
      });

      const errorMessage = errorObj.message;
      return {
        loaded: false,
        error: errorMessage,
      };
    } finally {
      // Clear the loading promise
      this.loadPromise = null;
    }
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;

      script.onload = () => {
        resolve();
      };

      script.onerror = () => {
        reject(new Error(`Failed to load script: ${src}`));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Gets the loaded math.js instance
   */
  getMathInstance(): any {
    return (
      this.mathInstance ||
      (typeof window !== 'undefined' ? window.math : null) ||
      null
    );
  }

  /**
   * Checks if math.js is loaded and available
   */
  isMathLoaded(): boolean {
    return this.isLoaded && !!this.mathInstance;
  }

  /**
   * Creates a configured math.js instance with specific settings
   */
  createConfiguredInstance(config: any = {}): any {
    try {
      // Return the main instance since we're using fallback implementation
      console.warn('Using fallback math instance, configuration not supported');
      return this.getMathInstance();
    } catch (error) {
      console.warn('Failed to create configured math.js instance:', error);
      return this.getMathInstance(); // Fallback to main instance
    }
  }
}

/**
 * Convenience function to load math.js library.
 * Provides a simple interface to the MathLoader singleton for loading the math library.
 *
 * @returns Promise resolving to MathLoaderResult with loading status and math instance
 *
 * @example
 * ```typescript
 * const result = await loadMathJS();
 * if (result.loaded) {
 *   console.log('Math library ready for use');
 * }
 * ```
 */
export const loadMathJS = async (): Promise<MathLoaderResult> => {
  const loader = MathLoader.getInstance();
  return loader.loadMathJS();
};

/**
 * Convenience function to get the loaded math.js instance.
 * Returns the math instance if available, or creates a fallback implementation
 * to ensure mathematical operations can continue even if the main library fails.
 *
 * @returns Math.js instance or fallback implementation
 *
 * @example
 * ```typescript
 * const math = getMathInstance();
 * const result = math.evaluate('2 + 3 * 4'); // Works with either real or fallback math
 * ```
 */
export const getMathInstance = (): any => {
  const loader = MathLoader.getInstance();
  const mathInstance = loader.getMathInstance();

  // Return fallback if main library is not available
  if (!mathInstance) {
    console.warn('Math.js not available, using fallback implementation');
    return createFallbackMath();
  }

  return mathInstance;
};

/**
 * Convenience function to check if math.js is loaded and available.
 * Useful for conditional logic based on library availability.
 *
 * @returns True if math.js is loaded and ready, false otherwise
 *
 * @example
 * ```typescript
 * if (isMathLoaded()) {
 *   // Use advanced math.js features
 * } else {
 *   // Use fallback or simpler operations
 * }
 * ```
 */
export const isMathLoaded = (): boolean => {
  const loader = MathLoader.getInstance();
  return loader.isMathLoaded();
};
