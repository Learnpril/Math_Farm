import { useEffect, useRef, useState } from 'react';
import { MathJax, MathJaxContext } from 'better-react-mathjax';

interface MathExpressionProps {
  children: string;
  inline?: boolean;
  className?: string;
}

// MathJax configuration optimized for arithmetic expressions
const mathJaxConfig = {
  loader: { load: ['[tex]/ams', '[tex]/color'] },
  tex: {
    inlineMath: [
      ['$', '$'],
      ['\\(', '\\)'],
    ],
    displayMath: [
      ['$$', '$$'],
      ['\\[', '\\]'],
    ],
    processEscapes: true,
    processEnvironments: true,
    packages: { '[+]': ['ams', 'color'] },
    // Arithmetic-specific macros
    macros: {
      // Fractions
      frac: ['\\frac{#1}{#2}', 2],
      dfrac: ['\\displaystyle\\frac{#1}{#2}', 2],
      // Place value
      placevalue: ['\\text{#1}', 1],
      // Operations
      add: ['+'],
      sub: ['-'],
      mul: ['\\times'],
      div: ['\\div'],
      // Decimal notation
      decimal: ['\\text{#1}', 1],
      // Percentage
      percent: ['\\%'],
      // Currency
      dollar: ['\\$'],
      // Highlighting for step-by-step solutions
      highlight: ['\\colorbox{yellow}{#1}', 1],
      step: ['\\boxed{#1}', 1],
    },
  },
  svg: {
    fontCache: 'local',
    scale: 1.2, // Increased from 1 to 1.2 for bigger font
    minScale: 0.8, // Increased from 0.5 to 0.8
    matchFontHeight: false,
  },
  options: {
    menuOptions: {
      settings: {
        assistiveMml: true,
        collapsible: false,
        autocollapse: false,
      },
    },
  },
  startup: {
    typeset: false, // We'll control typesetting manually
  },
};

/**
 * MathExpression component for rendering LaTeX expressions in the arithmetic curriculum
 * Optimized for arithmetic operations, fractions, decimals, and place value concepts
 */
export function MathExpression({
  children,
  inline = false,
  className = '',
}: MathExpressionProps) {
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Clean and prepare the LaTeX expression
  const prepareExpression = (expr: string): string => {
    // Remove any existing delimiters and clean the expression
    let cleaned = expr.trim();

    // Remove outer delimiters if they exist
    if (
      (cleaned.startsWith('$') && cleaned.endsWith('$')) ||
      (cleaned.startsWith('\\(') && cleaned.endsWith('\\)')) ||
      (cleaned.startsWith('\\[') && cleaned.endsWith('\\]'))
    ) {
      // Extract content between delimiters
      if (cleaned.startsWith('$$') && cleaned.endsWith('$$')) {
        cleaned = cleaned.slice(2, -2);
      } else if (cleaned.startsWith('$') && cleaned.endsWith('$')) {
        cleaned = cleaned.slice(1, -1);
      } else if (cleaned.startsWith('\\(') && cleaned.endsWith('\\)')) {
        cleaned = cleaned.slice(2, -2);
      } else if (cleaned.startsWith('\\[') && cleaned.endsWith('\\]')) {
        cleaned = cleaned.slice(2, -2);
      }
    }

    // Add appropriate delimiters based on inline/display mode
    if (inline) {
      return `\\(${cleaned}\\)`;
    } else {
      return `\\[${cleaned}\\]`;
    }
  };

  const processedExpression = prepareExpression(children);

  // Handle rendering errors
  const handleError = (error: any) => {
    console.warn('MathJax rendering error:', error);
    setError('Failed to render mathematical expression');
  };

  // Reset error when expression changes
  useEffect(() => {
    setError(null);
  }, [children]);

  // Fallback for when MathJax fails
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

  return (
    <div
      ref={containerRef}
      className={`math-expression ${inline ? 'inline-math' : 'display-math'} ${className}`}
      style={{
        display: inline ? 'inline-block' : 'block',
        textAlign: inline ? 'inherit' : 'center',
        margin: inline ? '0 2px' : '1rem 0',
        fontSize: inline ? '1.1em' : '1.25em', // Bigger font sizes
        lineHeight: inline ? '1.4' : '1.5',
      }}
    >
      <MathJax onError={handleError} hideUntilTypeset='first'>
        {processedExpression}
      </MathJax>
    </div>
  );
}

/**
 * MathJaxProvider component that wraps the curriculum with MathJax context
 * Should be used at the top level of the curriculum components
 */
export function MathJaxProvider({ children }: { children: React.ReactNode }) {
  return (
    <MathJaxContext
      config={mathJaxConfig}
      onStartup={mathJax => {
        console.log('MathJax loaded for arithmetic curriculum');
      }}
      onError={error => {
        console.error('MathJax initialization error:', error);
      }}
    >
      {children}
    </MathJaxContext>
  );
}

/**
 * Hook for checking if MathJax is ready
 */
export function useMathJaxReady() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if MathJax is available
    const checkMathJax = () => {
      if (typeof window !== 'undefined' && (window as any).MathJax) {
        setIsReady(true);
      } else {
        // Retry after a short delay
        setTimeout(checkMathJax, 100);
      }
    };

    checkMathJax();
  }, []);

  return isReady;
}
