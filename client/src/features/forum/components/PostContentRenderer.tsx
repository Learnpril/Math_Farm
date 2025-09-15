import React from 'react';
import { MathJaxPreview } from './MathJaxPreview';
import { EmbeddedMathResult } from './EmbeddedMathResult';
import { Button } from '../../../components/ui/button';
import { ExternalLink } from 'lucide-react';
import {
  parsePostContent,
  EmbeddedMathContent,
  sanitizeEmbeddedContent,
} from '../lib/math-content-parser';

interface PostContentRendererProps {
  content: string;
  className?: string;
  showEmbeddedContent?: boolean;
  compactEmbeds?: boolean;
}

export function PostContentRenderer({
  content,
  className = '',
  showEmbeddedContent = true,
  compactEmbeds = false,
}: PostContentRendererProps) {
  // Sanitize and parse content
  const sanitizedContent = sanitizeEmbeddedContent(content);
  const parsedContent = parsePostContent(sanitizedContent);

  const renderEmbeddedContent = (item: EmbeddedMathContent) => {
    switch (item.type) {
      case 'math-result':
      case 'graph-embed':
        if (item.toolResult) {
          return (
            <EmbeddedMathResult
              key={item.id}
              toolResult={item.toolResult}
              compact={compactEmbeds}
              className='my-4'
            />
          );
        }
        return null;

      case 'math-link':
        if (item.deepLink) {
          return (
            <div key={item.id} className='my-4'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => window.open(item.deepLink, '_blank')}
                className='flex items-center gap-2'
              >
                <ExternalLink className='h-3 w-3' />
                Open in Math Tool
              </Button>
            </div>
          );
        }
        return null;

      default:
        return null;
    }
  };

  // Split content into segments and insert embedded content
  const renderContent = () => {
    if (!showEmbeddedContent || parsedContent.embeddedContent.length === 0) {
      return <MathJaxPreview content={parsedContent.text} />;
    }

    const segments: React.ReactNode[] = [];
    let lastIndex = 0;

    // Sort embedded content by original position
    const sortedEmbeds = [...parsedContent.embeddedContent].sort(
      (a, b) => a.position.start - b.position.start
    );

    sortedEmbeds.forEach((item, index) => {
      // Add text before this embedded content
      if (item.position.start > lastIndex) {
        const textSegment = sanitizedContent.slice(
          lastIndex,
          item.position.start
        );
        if (textSegment.trim()) {
          segments.push(
            <MathJaxPreview key={`text-${index}`} content={textSegment} />
          );
        }
      }

      // Add embedded content
      segments.push(renderEmbeddedContent(item));

      lastIndex = item.position.end;
    });

    // Add remaining text after last embedded content
    if (lastIndex < sanitizedContent.length) {
      const remainingText = sanitizedContent.slice(lastIndex);
      if (remainingText.trim()) {
        segments.push(
          <MathJaxPreview key='text-final' content={remainingText} />
        );
      }
    }

    return segments;
  };

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      {renderContent()}
    </div>
  );
}
