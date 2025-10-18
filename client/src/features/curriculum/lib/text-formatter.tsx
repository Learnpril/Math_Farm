import React from 'react';

/**
 * Simple text formatter that supports basic markdown-like syntax:
 * **bold** -> <strong>bold</strong>
 * *italic* -> <em>italic</em>
 * __underline__ -> <u>underline</u>
 *
 * Also preserves line breaks and bullet points
 */
export function formatText(text: string): React.ReactNode[] {
  const lines = text.split('\n');

  return lines.map((line, lineIndex) => {
    if (line.trim() === '') {
      return <br key={lineIndex} />;
    }

    // Check if it's a header (standalone line that doesn't start with bullet or lowercase)
    const isHeader =
      line.trim() &&
      !line.trim().startsWith('•') &&
      !line.trim().startsWith('-') &&
      !line.trim().startsWith('The ') &&
      !line.trim().startsWith('A ') &&
      !line.trim().startsWith('In ') &&
      !line.trim().startsWith('Beyond ') &&
      line.trim().length < 50 &&
      /^[A-Z]/.test(line.trim());

    const formattedContent = formatInlineText(line);

    if (isHeader) {
      return (
        <h4
          key={lineIndex}
          className='text-xl font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-3 first:mt-0'
        >
          {formattedContent}
        </h4>
      );
    }

    return (
      <p key={lineIndex} className='mb-3 text-lg leading-relaxed'>
        {formattedContent}
      </p>
    );
  });
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
