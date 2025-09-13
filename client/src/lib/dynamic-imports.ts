/**
 * Dynamic import utilities for lazy loading heavy libraries and components
 * Reduces initial bundle size by loading resources only when needed
 */

import { lazy } from 'react';

// Math library dynamic imports
export const loadMathJS = async () => {
  try {
    const mathjs = await import('mathjs');
    return { loaded: true, mathInstance: mathjs.default || mathjs };
  } catch (error) {
    console.error('Failed to load mathjs:', error);
    return {
      loaded: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const loadNerdamer = async () => {
  try {
    const nerdamer = await import('nerdamer');
    return { loaded: true, nerdamerInstance: nerdamer.default || nerdamer };
  } catch (error) {
    console.error('Failed to load nerdamer:', error);
    return {
      loaded: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const loadJSXGraph = async () => {
  try {
    const jsxgraph = await import('jsxgraph');
    return { loaded: true, jsxgraphInstance: jsxgraph.default || jsxgraph };
  } catch (error) {
    console.error('Failed to load JSXGraph:', error);
    return {
      loaded: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const loadMathJax = async () => {
  try {
    const mathjax = await import('mathjax');
    return { loaded: true, mathjaxInstance: mathjax.default || mathjax };
  } catch (error) {
    console.error('Failed to load MathJax:', error);
    return {
      loaded: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Component lazy loading
export const LazyCalculatorDemo = lazy(() =>
  import('../features/math-tools/components/CalculatorDemo').then(module => ({
    default: module.CalculatorDemo,
  }))
);

export const LazyEquationSolverDemo = lazy(() =>
  import('../features/math-tools/components/EquationSolverDemo').then(
    module => ({
      default: module.EquationSolverDemo,
    })
  )
);

export const LazyFunctionGrapherDemo = lazy(() =>
  import('../features/math-tools/components/FunctionGrapherDemo').then(
    module => ({
      default: module.FunctionGrapherDemo,
    })
  )
);

export const LazyUnitConverterDemo = lazy(() =>
  import('../features/math-tools/components/UnitConverterDemo').then(
    module => ({
      default: module.UnitConverterDemo,
    })
  )
);

export const LazyMATLABGuidePage = lazy(() =>
  import('../features/guides/components/MATLABGuidePage').then(module => ({
    default: module.MATLABGuidePage,
  }))
);

export const LazyLaTeXGuidePage = lazy(() =>
  import('../features/guides/components/LaTeXGuidePage').then(module => ({
    default: module.LaTeXGuidePage,
  }))
);

// Preload functions for critical resources
export const preloadMathLibraries = () => {
  // Preload math libraries when user is likely to need them
  const preloadPromises = [import('mathjs'), import('better-react-mathjax')];

  return Promise.allSettled(preloadPromises);
};

export const preloadInteractiveComponents = () => {
  // Preload interactive components
  const preloadPromises = [
    import('../features/math-tools/components/CalculatorDemo'),
    import('../features/math-tools/components/EquationSolverDemo'),
  ];

  return Promise.allSettled(preloadPromises);
};

// Resource hints for browser optimization
export const addResourceHints = () => {
  if (typeof document === 'undefined') return;

  // Preconnect to external resources
  const preconnectLinks = [
    'https://cdn.jsdelivr.net', // For potential CDN resources
  ];

  preconnectLinks.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    document.head.appendChild(link);
  });

  // DNS prefetch for external domains
  const dnsPrefetchLinks = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ];

  dnsPrefetchLinks.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = href;
    document.head.appendChild(link);
  });
};

// Module preloading based on user interaction
export const preloadOnHover = (moduleLoader: () => Promise<any>) => {
  let preloadPromise: Promise<any> | null = null;

  return {
    onMouseEnter: () => {
      if (!preloadPromise) {
        preloadPromise = moduleLoader();
      }
    },
    getPreloadPromise: () => preloadPromise,
  };
};

// Critical resource loading
export const loadCriticalResources = async () => {
  const criticalResources = [
    import('../components/ui/button'),
    import('../components/ui/input'),
    import('../components/ui/label'),
  ];

  return Promise.allSettled(criticalResources);
};
