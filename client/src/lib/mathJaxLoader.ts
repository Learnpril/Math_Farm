// Optimized MathJax loader with performance improvements
let mathJaxPromise: Promise<void> | null = null;
let isLoaded = false;

interface MathJaxConfig {
  tex: {
    inlineMath: string[][];
    displayMath: string[][];
    processEscapes: boolean;
    processEnvironments: boolean;
    packages: string[];
  };
  svg: {
    fontCache: string;
    scale: number;
    minScale: number;
    matchFontHeight: boolean;
  };
  options: {
    menuOptions: {
      settings: {
        assistiveMml: boolean;
        collapsible: boolean;
        autocollapse: boolean;
      };
    };
    renderActions: {
      addMenu: number[];
    };
  };
  loader: {
    load: string[];
  };
  startup: {
    ready: () => void;
    typeset: boolean;
  };
}

// Optimized MathJax configuration for performance
const mathJaxConfig: MathJaxConfig = {
  tex: {
    inlineMath: [["\\(", "\\)"]],
    displayMath: [["\\[", "\\]"]],
    processEscapes: true,
    processEnvironments: true,
    packages: ["base", "ams"],
  },
  svg: {
    fontCache: "local",
    scale: 1,
    minScale: 0.5,
  },
  options: {
    menuOptions: {
      settings: {
        assistiveMml: true,
        collapsible: false,
        autocollapse: false,
      },
    },
    renderActions: {
      addMenu: [0, "", ""],
    },
  },
  loader: {
    load: ["[tex]/ams"],
  },
  startup: {
    ready: () => {
      const MathJax = (window as any).MathJax;
      MathJax.startup.defaultReady();
      isLoaded = true;
    },
    typeset: false, // Don't auto-typeset, we'll do it manually for better control
  },
};

// Load MathJax with optimizations
export function loadMathJax(): Promise<void> {
  if (mathJaxPromise) {
    return mathJaxPromise;
  }

  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  mathJaxPromise = new Promise((resolve, reject) => {
    // Check if MathJax is already loaded
    if ((window as any).MathJax && isLoaded) {
      resolve();
      return;
    }

    // Set configuration before loading
    (window as any).MathJax = mathJaxConfig;

    // Create script element with optimizations
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/mathjax@4.0.0-beta.6/tex-svg.js";
    script.async = true;
    script.defer = true;

    // Add performance optimizations
    script.onload = () => {
      // Wait for MathJax to be fully ready
      const checkReady = () => {
        if ((window as any).MathJax?.startup?.promise) {
          (window as any).MathJax.startup.promise
            .then(() => {
              isLoaded = true;
              resolve();
            })
            .catch(reject);
        } else {
          setTimeout(checkReady, 50);
        }
      };
      checkReady();
    };

    script.onerror = () => {
      reject(new Error("Failed to load MathJax"));
    };

    // Add to head with high priority
    document.head.appendChild(script);
  });

  return mathJaxPromise;
}

// Check if MathJax is ready
export function isMathJaxReady(): boolean {
  return isLoaded && !!(window as any).MathJax?.startup?.promise;
}

// Optimized typeset function with batching
let typesetQueue: HTMLElement[] = [];
let typesetTimeout: NodeJS.Timeout | null = null;

export async function typesetMath(
  elements: HTMLElement | HTMLElement[]
): Promise<void> {
  if (!isMathJaxReady()) {
    await loadMathJax();
  }

  const elementsArray = Array.isArray(elements) ? elements : [elements];

  // Add to queue for batching
  typesetQueue.push(...elementsArray);

  // Clear existing timeout
  if (typesetTimeout) {
    clearTimeout(typesetTimeout);
  }

  // Batch typeset operations for better performance
  typesetTimeout = setTimeout(async () => {
    if (typesetQueue.length === 0) return;

    try {
      const MathJax = (window as any).MathJax;
      if (MathJax?.typesetPromise) {
        await MathJax.typesetPromise(typesetQueue);
      }
    } catch (error) {
      console.warn("MathJax typeset error:", error);
    } finally {
      typesetQueue = [];
      typesetTimeout = null;
    }
  }, 16); // ~60fps batching
}

// Progressive loading for large documents
export async function progressiveTypesetMath(
  elements: HTMLElement[],
  batchSize: number = 5,
  onProgress?: (completed: number, total: number) => void
): Promise<void> {
  if (!isMathJaxReady()) {
    await loadMathJax();
  }

  const total = elements.length;
  let completed = 0;

  for (let i = 0; i < elements.length; i += batchSize) {
    const batch = elements.slice(i, i + batchSize);

    try {
      await typesetMath(batch);
      completed += batch.length;

      if (onProgress) {
        onProgress(completed, total);
      }

      // Small delay to prevent blocking the main thread
      if (i + batchSize < elements.length) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    } catch (error) {
      console.warn("Progressive typeset error:", error);
    }
  }
}

// Preload MathJax when user is likely to need it
export function preloadMathJax(): void {
  // Use requestIdleCallback for non-blocking preload
  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => {
      loadMathJax().catch(console.warn);
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      loadMathJax().catch(console.warn);
    }, 1000);
  }
}

// Clear MathJax cache for memory management
export function clearMathJaxCache(): void {
  try {
    const MathJax = (window as any).MathJax;
    if (MathJax?.startup?.document?.clear) {
      MathJax.startup.document.clear();
    }
  } catch (error) {
    console.warn("Error clearing MathJax cache:", error);
  }
}
