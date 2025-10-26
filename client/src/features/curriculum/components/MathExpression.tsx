import { useEffect, useRef, useState } from 'react';

interface MathExpressionProps {
  children: string;
  inline?: boolean;
  className?: string;
}

/**
 * Direct MathJax implementation without wrapper library
 */
export function MathExpression({
  children,
  inline = false,
  className = '',
}: MathExpressionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize MathJax if not already loaded
  useEffect(() => {
    const initMathJax = async () => {
      try {
        // Check if MathJax is already loaded
        if (window.MathJax) {
          setIsReady(true);
          return;
        }

        // Configure MathJax before loading
        window.MathJax = {
          tex: {
            inlineMath: [
              ['\\(', '\\)'],
              ['$', '$'],
            ],
            displayMath: [
              ['\\[', '\\]'],
              ['$$', '$$'],
            ],
            processEscapes: true,
            processEnvironments: true,
          },
          svg: {
            fontCache: 'local',
            scale: 1.55,
          },
          startup: {
            ready: () => {
              window.MathJax.startup.defaultReady();
              setIsReady(true);
            },
          },
        };

        // Load MathJax script
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
        script.async = true;

        script.onerror = () => {
          setError('Failed to load MathJax');
        };

        document.head.appendChild(script);
      } catch (err) {
        setError('MathJax initialization failed');
      }
    };

    initMathJax();
  }, []);

  // Render math when ready and content changes
  useEffect(() => {
    if (!isReady || !containerRef.current || !window.MathJax) return;

    const renderMath = async () => {
      try {
        const container = containerRef.current;
        if (!container) return;

        // Prepare the expression with proper delimiters
        const expression = inline ? `\\(${children}\\)` : `\\[${children}\\]`;

        // Set the content
        container.innerHTML = expression;

        // Typeset the math
        await window.MathJax.typesetPromise([container]);
        setError(null);
      } catch (err) {
        console.warn('MathJax rendering error:', err);
        setError('Failed to render math expression');
      }
    };

    renderMath();
  }, [children, inline, isReady]);

  // Show error fallback
  if (error) {
    return (
      <span
        className={`inline-block px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded text-sm font-mono ${className}`}
        title='Mathematical expression failed to render'
      >
        {children}
      </span>
    );
  }

  // Show loading state
  if (!isReady) {
    return (
      <span
        className={`inline-block px-2 py-1 bg-gray-50 dark:bg-gray-900/20 text-gray-500 dark:text-gray-400 rounded text-sm ${className}`}
      >
        Loading math...
      </span>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`math-expression ${inline ? 'inline-math' : 'display-math'} ${className}`}
      style={{
        display: inline ? 'inline-block' : 'block',
        textAlign: inline ? 'inherit' : 'center',
        margin: inline ? '0 2px' : '1rem 0',
        // Only set fontSize if no text size class is provided in className
        fontSize: className.includes('text-')
          ? 'inherit'
          : inline
            ? '1.25em'
            : '1.4em',
        lineHeight: inline ? '1.4' : '1.5',
      }}
    />
  );
}

/**
 * Simple provider that doesn't conflict with direct MathJax usage
 */
export function MathJaxProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

/**
 * Hook for checking if MathJax is ready
 */
export function useMathJaxReady() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkMathJax = () => {
      if (
        window.MathJax &&
        window.MathJax.startup &&
        window.MathJax.startup.document
      ) {
        setIsReady(true);
      } else {
        setTimeout(checkMathJax, 100);
      }
    };

    checkMathJax();
  }, []);

  return isReady;
}
