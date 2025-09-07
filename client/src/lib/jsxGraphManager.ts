/**
 * JSXGraph Manager - Handles loading and initialization of JSXGraph library
 * Prevents multiple simultaneous loads and provides a centralized way to manage JSXGraph
 */

declare global {
  interface Window {
    JXG?: any;
  }
}

interface JSXGraphLoadState {
  loaded: boolean;
  loading: boolean;
  error: string | null;
  promise: Promise<void> | null;
}

class JSXGraphManager {
  private state: JSXGraphLoadState = {
    loaded: false,
    loading: false,
    error: null,
    promise: null,
  };

  private callbacks: Array<() => void> = [];
  private activeBoards: Map<string, any> = new Map();

  /**
   * Load JSXGraph library if not already loaded
   */
  async loadJSXGraph(): Promise<void> {
    // If already loaded, resolve immediately
    if (this.state.loaded && window.JXG) {
      return Promise.resolve();
    }

    // If currently loading, return the existing promise
    if (this.state.loading && this.state.promise) {
      return this.state.promise;
    }

    // Start loading
    this.state.loading = true;
    this.state.error = null;

    this.state.promise = new Promise((resolve, reject) => {
      try {
        // Check if JSXGraph is already available
        if (window.JXG) {
          this.state.loaded = true;
          this.state.loading = false;
          this.notifyCallbacks();
          resolve();
          return;
        }

        // Load JSXGraph script
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/jsxgraph@1.11.1/distrib/jsxgraphcore.js';
        script.async = true;

        script.onload = () => {
          // Load CSS
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://cdn.jsdelivr.net/npm/jsxgraph@1.11.1/distrib/jsxgraph.css';
          document.head.appendChild(link);

          this.state.loaded = true;
          this.state.loading = false;
          this.notifyCallbacks();
          resolve();
        };

        script.onerror = () => {
          this.state.loading = false;
          this.state.error = 'Failed to load JSXGraph library';
          reject(new Error(this.state.error));
        };

        document.head.appendChild(script);
      } catch (error) {
        this.state.loading = false;
        this.state.error = error instanceof Error ? error.message : 'Unknown error loading JSXGraph';
        reject(error);
      }
    });

    return this.state.promise;
  }

  /**
   * Check if JSXGraph is loaded and ready
   */
  isLoaded(): boolean {
    return this.state.loaded && !!window.JXG;
  }

  /**
   * Check if JSXGraph is currently loading
   */
  isLoading(): boolean {
    return this.state.loading;
  }

  /**
   * Get any loading error
   */
  getError(): string | null {
    return this.state.error;
  }

  /**
   * Register a callback to be called when JSXGraph is loaded
   */
  onLoad(callback: () => void): void {
    if (this.isLoaded()) {
      callback();
    } else {
      this.callbacks.push(callback);
    }
  }

  /**
   * Notify all registered callbacks
   */
  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.warn('Error in JSXGraph load callback:', error);
      }
    });
    this.callbacks = [];
  }

  /**
   * Create a JSXGraph board with safe error handling
   */
  createBoard(container: HTMLElement, config: any, boardId?: string): any {
    if (!this.isLoaded() || !window.JXG) {
      throw new Error('JSXGraph is not loaded');
    }

    if (!container || !container.offsetWidth || !container.offsetHeight) {
      throw new Error('Container is not ready for JSXGraph board');
    }

    // Check if container is still in the DOM
    if (!container.isConnected) {
      throw new Error('Container is not connected to DOM');
    }

    // If we have a board ID, check if it already exists
    if (boardId && this.activeBoards.has(boardId)) {
      const existingBoard = this.activeBoards.get(boardId);
      if (existingBoard && existingBoard.containerObj && existingBoard.containerObj.isConnected) {
        console.warn(`JSXGraph board with ID ${boardId} already exists, freeing it first`);
        this.freeBoard(existingBoard);
      }
      this.activeBoards.delete(boardId);
    }

    try {
      // Clear any existing content in the container safely
      try {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      } catch (error) {
        // If we can't clear the container, try innerHTML as fallback
        try {
          container.innerHTML = '';
        } catch (innerError) {
          console.warn('Could not clear container:', innerError);
        }
      }

      const board = window.JXG.JSXGraph.initBoard(container, {
        showCopyright: false,
        registerEvents: false, // Prevent scroll-blocking events
        pan: { enabled: false },
        zoom: { wheel: false, factorX: 1.25, factorY: 1.25 },
        ...config,
      });

      // Track the board if we have an ID
      if (boardId) {
        this.activeBoards.set(boardId, board);
      }

      return board;
    } catch (error) {
      console.error('Error creating JSXGraph board:', error);
      throw error;
    }
  }

  /**
   * Safely free a JSXGraph board
   */
  freeBoard(board: any, boardId?: string): void {
    if (!board || !window.JXG) return;

    try {
      // Remove from active boards tracking
      if (boardId && this.activeBoards.has(boardId)) {
        this.activeBoards.delete(boardId);
      } else {
        // Find and remove by board reference
        for (const [id, trackedBoard] of this.activeBoards.entries()) {
          if (trackedBoard === board) {
            this.activeBoards.delete(id);
            break;
          }
        }
      }

      // Check if the board still exists and has a container
      if (board.containerObj && board.containerObj.isConnected) {
        window.JXG.JSXGraph.freeBoard(board);
      } else {
        // Board container is already removed, just clear references
        console.warn('JSXGraph board container already removed from DOM');
      }
    } catch (error) {
      console.warn('Error freeing JSXGraph board:', error);
    }
  }
}

// Export singleton instance
export const jsxGraphManager = new JSXGraphManager();