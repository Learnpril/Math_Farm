import React, { useEffect, useRef, useState } from 'react';
import { useMathJax } from '../hooks/useMathJax';
import { cn } from '../lib/utils';

export interface MathExpressionProps {
  /** LaTeX expression to render */
  expression: string;
  /** Display mode: inline or block */
  display?: 'inline' | 'block';
  /** Additional CSS classes */
  className?: string;
  /** Fallback text when rendering fails */
  fallback?: string;
  /** Callback when rendering completes successfully */
  onRenderSuccess?: () => void;
  /** Callback when rendering fails */
  onRenderError?: (error: string) => void;
  /** ARIA label for accessibility */
  ariaLabel?: string;
}

/**
 * MathExpression component for rendering LaTeX mathematical expressions
 * Uses MathJax for rendering with fallback support and accessibility features
 */
export function MathExpression({
  expression,
  display = 'inline',
  className,
  fallback,
  onRenderSuccess,
  onRenderError,
  ariaLabel,
}: MathExpressionProps) {
  const mathRef = useRef<HTMLSpanElement>(null);
  const [renderState, setRenderState] = useState<'idle' | 'rendering' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { renderMath, isLoaded, error: mathJaxError } = useMathJax();

  // Effect to render math expression when component mounts or expression changes
  useEffect(() => {
    const renderExpression = async () => {
      if (!mathRef.current || !expression.trim()) {
        return;
      }

      setRenderState('rendering');
      setErrorMessage('');

      try {
        await renderMath(expression, mathRef.current);
        setRenderState('success');
        onRenderSuccess?.();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown rendering error';
        setErrorMessage(errorMsg);
        setRenderState('error');
        onRenderError?.(errorMsg);
      }
    };

    if (isLoaded) {
      renderExpression();
    }
  }, [expression, isLoaded, renderMath, onRenderSuccess, onRenderError]);

  // Handle MathJax loading errors
  useEffect(() => {
    if (mathJaxError) {
      setRenderState('error');
      setErrorMessage(mathJaxError);
      onRenderError?.(mathJaxError);
    }
  }, [mathJaxError, onRenderError]);

  // Determine fallback text
  const getFallbackText = () => {
    if (fallback) return fallback;
    if (renderState === 'error') return `[Math Error: ${expression}]`;
    if (renderState === 'rendering') return `[Loading: ${expression}]`;
    return `[Math: ${expression}]`;
  };

  // Determine ARIA label
  const getAriaLabel = () => {
    if (ariaLabel) return ariaLabel;
    if (renderState === 'error') return `Mathematical expression with error: ${expression}`;
    if (renderState === 'rendering') return `Loading mathematical expression: ${expression}`;
    return `Mathematical expression: ${expression}`;
  };

  return (
    <span
      ref={mathRef}
      className={cn(
        'math-expression',
        display === 'block' && 'block text-center my-4',
        display === 'inline' && 'inline-block',
        renderState === 'rendering' && 'opacity-70 animate-pulse',
        renderState === 'error' && 'text-red-600 dark:text-red-400',
        className
      )}
      role="img"
      aria-label={getAriaLabel()}
      title={expression}
    >
      {renderState === 'idle' || renderState === 'rendering' || renderState === 'error' 
        ? getFallbackText() 
        : null}
    </span>
  );
}

// Utility component for inline math expressions
export function InlineMath({ expression, ...props }: Omit<MathExpressionProps, 'display'>) {
  return <MathExpression expression={expression} display="inline" {...props} />;
}

// Utility component for block math expressions
export function BlockMath({ expression, ...props }: Omit<MathExpressionProps, 'display'>) {
  return <MathExpression expression={expression} display="block" {...props} />;
}