/**
 * Nerdamer library loader utility for symbolic math operations
 */

import { errorLogger } from '../errorLogging';

export interface NerdamerLoaderResult {
  loaded: boolean;
  error?: string;
  nerdamerInstance?: any;
}

export class NerdamerLoader {
  private static instance: NerdamerLoader;
  private loadPromise: Promise<NerdamerLoaderResult> | null = null;
  private isLoaded = false;
  private nerdamerInstance: any | null = null;

  private constructor() {}

  static getInstance(): NerdamerLoader {
    if (!NerdamerLoader.instance) {
      NerdamerLoader.instance = new NerdamerLoader();
    }
    return NerdamerLoader.instance;
  }

  /**
   * Loads nerdamer library
   */
  async loadNerdamer(): Promise<NerdamerLoaderResult> {
    // Return existing promise if already loading
    if (this.loadPromise) {
      return this.loadPromise;
    }

    // Return cached result if already loaded
    if (this.isLoaded && this.nerdamerInstance) {
      return {
        loaded: true,
        nerdamerInstance: this.nerdamerInstance,
      };
    }

    // Create new loading promise
    this.loadPromise = this.performLoad();
    return this.loadPromise;
  }

  private async performLoad(): Promise<NerdamerLoaderResult> {
    try {
      // Check if nerdamer is already available
      if (this.nerdamerInstance) {
        return {
          loaded: true,
          nerdamerInstance: this.nerdamerInstance,
        };
      }

      // Try to dynamically import nerdamer
      try {
        const nerdamerModule = await import('nerdamer');
        // nerdamer is the entire module
        const nerdamer = nerdamerModule;

        this.nerdamerInstance = nerdamer;
        this.isLoaded = true;

        // Also make it available globally for compatibility
        if (typeof window !== 'undefined') {
          (window as any).nerdamer = nerdamer;
        }

        console.log('Successfully loaded nerdamer via dynamic import');
        return {
          loaded: true,
          nerdamerInstance: nerdamer,
        };
      } catch (importError) {
        console.warn(
          'Failed to dynamically import nerdamer, skipping:',
          importError
        );

        return {
          loaded: false,
          error: 'Nerdamer not available in browser environment',
        };
      }
    } catch (error) {
      const errorObj =
        error instanceof Error
          ? error
          : new Error('Unknown error loading nerdamer');

      // Log the library loading error
      errorLogger.logLibraryError('nerdamer', errorObj, {
        timestamp: new Date().toISOString(),
        fallbackUsed: false,
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

  /**
   * Gets the loaded nerdamer instance
   */
  getNerdamerInstance(): any | null {
    return (
      this.nerdamerInstance ||
      (typeof window !== 'undefined' ? window.nerdamer : null) ||
      null
    );
  }

  /**
   * Checks if nerdamer is loaded and available
   */
  isNerdamerLoaded(): boolean {
    return this.isLoaded && !!this.nerdamerInstance;
  }
}

/**
 * Convenience function to load nerdamer
 */
export const loadNerdamer = async (): Promise<NerdamerLoaderResult> => {
  const loader = NerdamerLoader.getInstance();
  return loader.loadNerdamer();
};

/**
 * Convenience function to get nerdamer instance
 */
export const getNerdamerInstance = (): any | null => {
  const loader = NerdamerLoader.getInstance();
  return loader.getNerdamerInstance();
};

/**
 * Convenience function to check if nerdamer is loaded
 */
export const isNerdamerLoaded = (): boolean => {
  const loader = NerdamerLoader.getInstance();
  return loader.isNerdamerLoaded();
};
