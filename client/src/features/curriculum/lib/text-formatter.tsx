import React from 'react';

/**
 * Enhanced text formatter that creates textbook-like readable content:
 * **bold** -> <strong>bold</strong>
 * *italic* -> <em>italic</em>
 * __underline__ -> <u>underline</u>
 *
 * Groups content into natural paragraphs for better readability
 */
export function formatText(text: string): React.ReactNode[] {
  // Split by double line breaks to identify natural paragraph breaks
  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);

  return paragraphs.map((paragraph, paragraphIndex) => {
    return formatParagraph(paragraph.trim(), paragraphIndex);
  });
}

function formatParagraph(
  paragraphText: string,
  paragraphIndex: number
): React.ReactNode {
  const lines = paragraphText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) {
    return null;
  }

  // Check if this is a header paragraph (single line, short, starts with capital, no period)
  if (lines.length === 1) {
    const line = lines[0];
    const isHeaderLine = line ? isHeader(line) : false;

    if (isHeaderLine) {
      return (
        <h4
          key={paragraphIndex}
          className='text-xl font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-4 first:mt-0'
        >
          {line ? formatInlineText(line) : ''}
        </h4>
      );
    }
  }

  // Check if this paragraph contains bullet points
  const hasBullets = lines.some(line => isBulletPoint(line));

  if (hasBullets) {
    // Split into bullet items and regular text
    const elements: React.ReactNode[] = [];
    let currentBullets: string[] = [];
    let currentText: string[] = [];

    const flushText = () => {
      if (currentText.length > 0) {
        elements.push(
          <p
            key={`text-${elements.length}`}
            className='mb-4 text-lg leading-relaxed text-gray-800 dark:text-gray-200'
          >
            {formatInlineText(currentText.join(' '))}
          </p>
        );
        currentText = [];
      }
    };

    const flushBullets = () => {
      if (currentBullets.length > 0) {
        elements.push(
          <ul
            key={`bullets-${elements.length}`}
            className='mb-4 ml-6 space-y-2'
          >
            {currentBullets.map((bullet, bulletIndex) => (
              <li
                key={bulletIndex}
                className='text-lg leading-relaxed text-gray-800 dark:text-gray-200 list-disc'
              >
                {formatInlineText(bullet.replace(/^[•\-]\s*/, ''))}
              </li>
            ))}
          </ul>
        );
        currentBullets = [];
      }
    };

    lines.forEach(line => {
      if (isBulletPoint(line)) {
        flushText();
        currentBullets.push(line);
      } else {
        flushBullets();
        currentText.push(line);
      }
    });

    // Flush any remaining content
    flushText();
    flushBullets();

    return (
      <div key={paragraphIndex} className='mb-6'>
        {elements}
      </div>
    );
  } else {
    // Regular paragraph - join all lines with spaces
    const combinedText = lines.join(' ');
    return (
      <p
        key={paragraphIndex}
        className='mb-4 text-lg leading-relaxed text-gray-800 dark:text-gray-200'
      >
        {formatInlineText(combinedText)}
      </p>
    );
  }
}

function isHeader(line: string): boolean {
  const trimmed = line.trim();
  return (
    trimmed.length > 0 &&
    !trimmed.startsWith('•') &&
    !trimmed.startsWith('-') &&
    !trimmed.startsWith('The ') &&
    !trimmed.startsWith('A ') &&
    !trimmed.startsWith('In ') &&
    !trimmed.startsWith('Beyond ') &&
    !trimmed.startsWith('Understanding ') &&
    !trimmed.startsWith('This ') &&
    trimmed.length < 60 &&
    /^[A-Z]/.test(trimmed) &&
    !trimmed.includes('.')
  );
}

function isBulletPoint(line: string): boolean {
  return line.trim().startsWith('•') || line.trim().startsWith('-');
}

function formatInlineText(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let currentIndex = 0;
  let partIndex = 0;

  // Regex patterns for different formatting
  const patterns = [
    {
      regex: /\*\*(.*?)\*\*/g,
      component: (content: string, key: number) => (
        <strong key={key}>{content}</strong>
      ),
    },
    {
      regex: /\*(.*?)\*/g,
      component: (content: string, key: number) => <em key={key}>{content}</em>,
    },
    {
      regex: /__(.*?)__/g,
      component: (content: string, key: number) => <u key={key}>{content}</u>,
    },
  ];

  // Find all matches for all patterns
  const allMatches: Array<{
    start: number;
    end: number;
    content: string;
    component: (content: string, key: number) => React.ReactNode;
  }> = [];

  patterns.forEach(pattern => {
    let match;
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);

    while ((match = regex.exec(text)) !== null) {
      allMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        content: match[1] || '',
        component: pattern.component,
      });
    }
  });

  // Sort matches by start position
  allMatches.sort((a, b) => a.start - b.start);

  // Remove overlapping matches (keep the first one)
  const validMatches = [];
  let lastEnd = 0;

  for (const match of allMatches) {
    if (match.start >= lastEnd) {
      validMatches.push(match);
      lastEnd = match.end;
    }
  }

  // Build the result with formatted parts
  for (const match of validMatches) {
    // Add text before the match
    if (match.start > currentIndex) {
      const beforeText = text.slice(currentIndex, match.start);
      if (beforeText) {
        parts.push(beforeText);
      }
    }

    // Add the formatted match
    parts.push(match.component(match.content, partIndex++));
    currentIndex = match.end;
  }

  // Add remaining text
  if (currentIndex < text.length) {
    const remainingText = text.slice(currentIndex);
    if (remainingText) {
      parts.push(remainingText);
    }
  }

  // If no formatting was found, return the original text
  if (parts.length === 0) {
    return [text];
  }

  return parts;
}
