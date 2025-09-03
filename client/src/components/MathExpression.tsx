import React, { useEffect, useRef } from 'react';

interface MathExpressionProps {
  expression: string;
  className?: string;
  fallback?: string;
  inline?: boolean;
}

export const MathExpression: React.FC<MathExpressionProps> = ({ 
  expression, 
  className = '', 
  fallback,
  inline = false 
}) => {
  const mathRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const renderMath = async () => {
      if (!mathRef.current) return;

      try {
        // Check if MathJax is available and ready
        if (typeof window !== 'undefined' && (window as any).MathJax && (window as any).MathJax.startup) {
          const MathJax = (window as any).MathJax;
          
          // Wait for MathJax to be ready
          await MathJax.startup.promise;
          
          if (mathRef.current) {
            // Set content with proper delimiters
            const mathContent = inline ? `\\(${expression}\\)` : `\\[${expression}\\]`;
            mathRef.current.innerHTML = mathContent;
            
            // Render the math
            if (MathJax.typesetPromise) {
              await MathJax.typesetPromise([mathRef.current]);
              setIsLoaded(true);
              setHasError(false);
            } else {
              setHasError(true);
            }
          }
        } else {
          // MathJax not ready yet, try again after a delay
          timeoutId = setTimeout(() => {
            renderMath();
          }, 500);
        }
      } catch (error) {
        console.warn('MathJax rendering error:', error);
        setHasError(true);
      }
    };

    // Start rendering after a small delay to ensure DOM is ready
    timeoutId = setTimeout(renderMath, 100);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [expression, inline]);

  if (hasError) {
    return (
      <span 
        className={`font-mono text-sm ${className}`}
        title="Mathematical expression"
        aria-label={`Math expression: ${fallback || expression}`}
      >
        {fallback || expression}
      </span>
    );
  }

  const Element = inline ? 'span' : 'div';
  
  return (
    <Element
      ref={mathRef}
      className={`math-expression ${className} ${!isLoaded ? 'opacity-50' : ''}`}
      aria-label={`Math expression: ${fallback || expression}`}
      role="img"
    >
      {/* Initial content before MathJax processes it */}
      {inline ? `\\(${expression}\\)` : `\\[${expression}\\]`}
    </Element>
  );
};