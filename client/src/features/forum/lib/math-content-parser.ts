/**
 * Parser for embedded math content in forum posts
 */

import { ToolResult } from '../../../lib/toolUtils';

export interface EmbeddedMathContent {
  type: 'math-result' | 'math-link' | 'graph-embed';
  id: string;
  toolResult?: ToolResult;
  deepLink?: string;
  position: {
    start: number;
    end: number;
  };
}

export interface ParsedPostContent {
  text: string;
  embeddedContent: EmbeddedMathContent[];
}

/**
 * Parse forum post content to extract embedded math results
 */
export function parsePostContent(content: string): ParsedPostContent {
  const embeddedContent: EmbeddedMathContent[] = [];
  let processedContent = content;

  // Pattern to match embedded math results
  // Format: [math-result:toolId:base64EncodedData]
  const mathResultPattern = /\[math-result:([^:]+):([^\]]+)\]/g;

  // Pattern to match math tool deep links
  // Format: [math-link:url:title]
  const mathLinkPattern = /\[math-link:([^:]+):([^\]]+)\]/g;

  // Pattern to match graph embeds
  // Format: [graph-embed:functionExpression:bounds]
  const graphEmbedPattern = /\[graph-embed:([^:]+):([^\]]+)\]/g;

  let match;

  // Parse math results
  while ((match = mathResultPattern.exec(content)) !== null) {
    try {
      const toolId = match[1];
      const encodedData = match[2];
      const toolResult = JSON.parse(atob(encodedData)) as ToolResult;

      embeddedContent.push({
        type: 'math-result',
        id: `math-result-${Date.now()}-${Math.random()}`,
        toolResult,
        position: {
          start: match.index,
          end: match.index + match[0].length,
        },
      });
    } catch (error) {
      console.warn('Failed to parse embedded math result:', error);
    }
  }

  // Parse math links
  mathLinkPattern.lastIndex = 0; // Reset regex
  while ((match = mathLinkPattern.exec(content)) !== null) {
    const url = decodeURIComponent(match[1]);
    const title = decodeURIComponent(match[2]);

    embeddedContent.push({
      type: 'math-link',
      id: `math-link-${Date.now()}-${Math.random()}`,
      deepLink: url,
      position: {
        start: match.index,
        end: match.index + match[0].length,
      },
    });
  }

  // Parse graph embeds
  graphEmbedPattern.lastIndex = 0; // Reset regex
  while ((match = graphEmbedPattern.exec(content)) !== null) {
    const functionExpr = decodeURIComponent(match[1]);
    const bounds = JSON.parse(decodeURIComponent(match[2]));

    // Create a mock tool result for graph embedding
    const graphToolResult: ToolResult = {
      toolId: 'graphing',
      toolName: 'Function Grapher',
      input: {
        functions: [functionExpr],
        bounds,
      },
      output: {
        plotted: functionExpr,
        totalFunctions: 1,
      },
      timestamp: new Date(),
    };

    embeddedContent.push({
      type: 'graph-embed',
      id: `graph-embed-${Date.now()}-${Math.random()}`,
      toolResult: graphToolResult,
      position: {
        start: match.index,
        end: match.index + match[0].length,
      },
    });
  }

  // Sort embedded content by position (reverse order for safe removal)
  embeddedContent.sort((a, b) => b.position.start - a.position.start);

  // Remove embedded content markers from text
  embeddedContent.forEach(item => {
    processedContent =
      processedContent.slice(0, item.position.start) +
      processedContent.slice(item.position.end);
  });

  // Re-sort by original position for rendering
  embeddedContent.sort((a, b) => a.position.start - b.position.start);

  return {
    text: processedContent,
    embeddedContent,
  };
}

/**
 * Create embedded math result markup for forum posts
 */
export function createMathResultEmbed(toolResult: ToolResult): string {
  try {
    const encodedData = btoa(JSON.stringify(toolResult));
    return `[math-result:${toolResult.toolId}:${encodedData}]`;
  } catch (error) {
    console.error('Failed to create math result embed:', error);
    return '';
  }
}

/**
 * Create math tool deep link markup for forum posts
 */
export function createMathLinkEmbed(url: string, title: string): string {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  return `[math-link:${encodedUrl}:${encodedTitle}]`;
}

/**
 * Create graph embed markup for forum posts
 */
export function createGraphEmbed(
  functionExpression: string,
  bounds: any
): string {
  const encodedFunction = encodeURIComponent(functionExpression);
  const encodedBounds = encodeURIComponent(JSON.stringify(bounds));
  return `[graph-embed:${encodedFunction}:${encodedBounds}]`;
}

/**
 * Extract math expressions from tool results for search indexing
 */
export function extractMathExpressions(toolResult: ToolResult): string[] {
  const expressions: string[] = [];

  // Extract from input
  if (toolResult.input) {
    if (toolResult.input.expression) {
      expressions.push(toolResult.input.expression);
    }
    if (toolResult.input.equation) {
      expressions.push(toolResult.input.equation);
    }
    if (toolResult.input.functions) {
      expressions.push(...toolResult.input.functions);
    }
  }

  // Extract from output
  if (toolResult.output) {
    if (toolResult.output.result) {
      expressions.push(toolResult.output.result.toString());
    }
    if (toolResult.output.latex) {
      expressions.push(toolResult.output.latex);
    }
  }

  // Extract from steps
  if (toolResult.steps) {
    toolResult.steps.forEach(step => {
      if (step.result) {
        expressions.push(step.result);
      }
      if (step.latex) {
        expressions.push(step.latex);
      }
    });
  }

  return expressions.filter(expr => expr && expr.trim().length > 0);
}

/**
 * Validate embedded math content
 */
export function validateEmbeddedContent(content: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  try {
    const parsed = parsePostContent(content);

    // Check for malformed embeds
    const malformedPatterns = [
      /\[math-result:[^\]]*$/g, // Unclosed math-result
      /\[math-link:[^\]]*$/g, // Unclosed math-link
      /\[graph-embed:[^\]]*$/g, // Unclosed graph-embed
    ];

    malformedPatterns.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        const types = ['math-result', 'math-link', 'graph-embed'];
        errors.push(`Malformed ${types[index]} embed found`);
      }
    });

    // Validate embedded tool results
    parsed.embeddedContent.forEach(item => {
      if (item.type === 'math-result' && !item.toolResult) {
        errors.push('Invalid math result data');
      }
      if (item.type === 'math-link' && !item.deepLink) {
        errors.push('Invalid math link URL');
      }
    });
  } catch (error) {
    errors.push('Failed to parse embedded content');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize embedded math content for security
 */
export function sanitizeEmbeddedContent(content: string): string {
  // Remove any potentially dangerous content
  let sanitized = content;

  // Remove script tags and javascript: URLs
  sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');

  // Validate and sanitize embedded content
  const validation = validateEmbeddedContent(sanitized);
  if (!validation.isValid) {
    console.warn('Invalid embedded content detected:', validation.errors);
    // Remove all embedded content if validation fails
    sanitized = sanitized.replace(
      /\[math-result:[^\]]+\]/g,
      '[Invalid math result]'
    );
    sanitized = sanitized.replace(
      /\[math-link:[^\]]+\]/g,
      '[Invalid math link]'
    );
    sanitized = sanitized.replace(
      /\[graph-embed:[^\]]+\]/g,
      '[Invalid graph embed]'
    );
  }

  return sanitized;
}
