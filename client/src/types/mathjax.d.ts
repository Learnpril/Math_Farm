/**
 * Centralized MathJax type declarations for Math Farm
 * This file consolidates all MathJax-related type definitions to prevent conflicts
 */

declare global {
  interface Window {
    MathJax?: {
      tex?: {
        inlineMath?: string[][];
        displayMath?: string[][];
        processEscapes?: boolean;
        processEnvironments?: boolean;
        packages?: string[];
      };
      svg?: {
        fontCache?: string;
        scale?: number;
        minScale?: number;
        matchFontHeight?: boolean;
      };
      options?: {
        menuOptions?: {
          settings?: {
            assistiveMml?: boolean;
            collapsible?: boolean;
            autocollapse?: boolean;
          };
        };
        renderActions?: {
          addMenu?: (number | string)[];
        };
      };
      loader?: {
        load?: string[];
      };
      startup?: {
        ready?: () => void;
        typeset?: boolean;
        promise?: Promise<void>;
        defaultReady?: () => void;
        document?: {
          clear?: () => void;
        };
      };
      typesetPromise?: (elements?: HTMLElement[]) => Promise<void>;
    };
    mathJaxReady?: boolean;
  }
}

export interface MathJaxConfig {
  tex: {
    inlineMath: string[][];
    displayMath: string[][];
    processEscapes: boolean;
    processEnvironments: boolean;
    packages?: string[];
  };
  svg: {
    fontCache: string;
    scale: number;
    minScale?: number;
    matchFontHeight?: boolean;
  };
  options?: {
    menuOptions?: {
      settings?: {
        assistiveMml?: boolean;
        collapsible?: boolean;
        autocollapse?: boolean;
      };
    };
    renderActions?: {
      addMenu?: (number | string)[];
    };
  };
  loader?: {
    load?: string[];
  };
  startup: {
    ready: () => void;
    typeset?: boolean;
  };
}

export interface UseMathJaxReturn {
  isLoaded: boolean;
  renderMath: (expression: string, element: HTMLElement) => Promise<void>;
  error: string | null;
  isLoading: boolean;
}

export interface MathJaxPreviewProps {
  content: string;
  className?: string;
}

// Re-export for backward compatibility
export {};
