/**
 * Math library loader utility for dynamically loading math.js
 */

import { create, all, MathJsStatic } from 'mathjs';
import { createFallbackMath } from './fallback-math';
import { errorLogger } from '../errorLogging';

declare global {
  interface Window {
    math?: MathJsStatic;
  }
}

export interface MathLoaderResult {
  loaded: boolean;
  error?: string;
  mathInstance?: MathJsStatic;
}

export class MathLoader {
  private static instance: MathLoader;
  private loadPromise: Promise<MathLoaderResult> | null = null;
  private isLoaded = false;
  private mathInstance: MathJsStatic | null = null;

  private constructor() {}

  static getInstance(): MathLoader {
    if (!MathLoader.instance) {
      MathLoader.instance = new MathLoader();
    }
    return MathLoader.instance;
  }

  /**
   * Loads math.js library dynamically
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

      // Create a new math.js instance with all functions
      const mathInstance = create(all, {
        // Configure for better performance and safety
        number: 'BigNumber',
        precision: 64,
        predictable: true,
      });

      // Store the instance
      this.mathInstance = mathInstance;
      this.isLoaded = true;

      // Also make it available globally for compatibility
      if (typeof window !== 'undefined') {
        window.math = mathInstance;
      }

      return {
        loaded: true,
        mathInstance: mathInstance,
      };
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
  getMathInstance(): MathJsStatic | null {
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
  createConfiguredInstance(config: any = {}): MathJsStatic | null {
    try {
      // Create a new instance with custom configuration
      const instance = create(all, {
        // Default configuration
        number: 'BigNumber',
        precision: 64,
        predictable: true,
        // Merge with custom config
        ...config,
      });
      return instance;
    } catch (error) {
      console.warn('Failed to create configured math.js instance:', error);
      return this.getMathInstance(); // Fallback to main instance
    }
  }
}

/**
 * Convenience function to load math.js
 */
export const loadMathJS = async (): Promise<MathLoaderResult> => {
  const loader = MathLoader.getInstance();
  return loader.loadMathJS();
};

/**
 * Convenience function to get math.js instance
 */
export const getMathInstance = (): MathJsStatic | any => {
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
 * Convenience function to check if math.js is loaded
 */
export const isMathLoaded = (): boolean => {
  const loader = MathLoader.getInstance();
  return loader.isMathLoaded();
};
