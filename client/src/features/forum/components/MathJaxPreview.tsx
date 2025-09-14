import React, { useEffect, useRef, useCallback } from 'react';
import { useMathJax } from '../../../hooks/useMathJax';
import { cn } from '../../../lib/utils';
import DOMPurify from 'dompurify';

export interface MathJaxPreviewProps {
  content: string;
  className?: string;
  onRenderComplete?: () => void;
  onRenderError?: (error: Error) => void;
}

/**
 * Component for rendering content with MathJax expressions
 * Handles sanitization and real-time math rendering
 */
export function MathJaxPreview({
  content,
  className,
  onRenderComplete,
  onRenderError,
}: MathJaxPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const {
    isLoaded: mathJaxLoaded,
    renderMath,
    error: mathJaxError,
  } = useMathJax();

  // Process content for safe rendering
  const processContent = useCallback((text: string): string => {
    if (!text.trim()) return '';

    // Sanitize HTML first
    const sanitized = DOMPurify.sanitize(text, {
      ALLOWED_TAGS: [
        'p',
        'br',
        'strong',
        'em',
        'code',
        'pre',
        'blockquote',
        'ul',
        'ol',
        'li',
      ],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    });

    // Convert line breaks to HTML
    return sanitized.replace(/\n/g, '<br>');
  }, []);

  // Render content with MathJax
  useEffect(() => {
    if (!previewRef.current || !content.trim()) return;

    const processedContent = processContent(content);
    previewRef.current.innerHTML = processedContent;

    if (mathJaxLoaded) {
      renderMath('', previewRef.current)
        .then(() => {
          onRenderComplete?.();
        })
        .catch(error => {
          console.warn('MathJax render error:', error);
          onRenderError?.(error);
        });
    }
  }, [
    content,
    mathJaxLoaded,
    renderMath,
    processContent,
    onRenderComplete,
    onRenderError,
  ]);

  // Handle MathJax errors
  useEffect(() => {
    if (mathJaxError) {
      onRenderError?.(new Error(mathJaxError));
    }
  }, [mathJaxError, onRenderError]);

  if (!content.trim()) {
    return (
      <div className={cn('text-muted-foreground italic', className)}>
        Nothing to preview
      </div>
    );
  }

  if (!mathJaxLoaded) {
    return (
      <div className={cn('text-muted-foreground', className)}>
        Loading MathJax...
      </div>
    );
  }

  return (
    <div
      ref={previewRef}
      className={cn(
        'prose prose-sm max-w-none',
        'prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground',
        'prose-code:text-foreground prose-pre:bg-muted prose-pre:text-foreground',
        'prose-blockquote:text-muted-foreground prose-blockquote:border-border',
        className
      )}
    />
  );
}
