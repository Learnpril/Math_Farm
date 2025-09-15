/**
 * Integration utilities for sharing math tool results to forum
 */

import { ToolResult } from '../../../lib/toolUtils';
import { PostContent, MathExpression } from '../types';

export interface MathToolShareData {
  toolResult: ToolResult;
  shareType: 'result' | 'problem' | 'solution' | 'graph';
  includeSteps?: boolean;
  customMessage?: string;
}

export interface ForumShareOptions {
  threadId?: string;
  categoryId?: number;
  title?: string;
  includeDeepLink?: boolean;
}

/**
 * Convert a math tool result to forum post content
 */
export function convertToolResultToPostContent(
  shareData: MathToolShareData
): PostContent {
  const {
    toolResult,
    shareType,
    includeSteps = true,
    customMessage,
  } = shareData;

  let content = '';
  const mathExpressions: MathExpression[] = [];

  // Add custom message if provided
  if (customMessage) {
    content += `${customMessage}\n\n`;
  }

  // Add tool information
  content += `**${toolResult.toolName} Result**\n\n`;

  // Add input information
  if (toolResult.input) {
    content += `**Input:**\n`;

    // Format input based on tool type
    if (toolResult.toolId === 'calculator') {
      content += `Expression: \`${toolResult.input.expression}\`\n`;
      if (toolResult.input.angleMode) {
        content += `Angle Mode: ${toolResult.input.angleMode.toUpperCase()}\n`;
      }
    } else if (toolResult.toolId === 'solver') {
      content += `Equation: \`${toolResult.input.equation}\`\n`;
      content += `Variable: \`${toolResult.input.variable}\`\n`;
      content += `Operation: ${toolResult.input.solverType}\n`;
    } else if (toolResult.toolId === 'graphing') {
      if (toolResult.input.functions) {
        content += `Functions: ${toolResult.input.functions.map((f: string) => `\`${f}\``).join(', ')}\n`;
      }
      if (toolResult.input.bounds) {
        const bounds = toolResult.input.bounds;
        content += `Range: x ∈ [${bounds.xMin}, ${bounds.xMax}], y ∈ [${bounds.yMin}, ${bounds.yMax}]\n`;
      }
    }
    content += '\n';
  }

  // Add result
  if (toolResult.output) {
    content += `**Result:**\n`;

    if (shareType === 'result' || shareType === 'solution') {
      // Add LaTeX math expression for the result
      if (toolResult.output.latex) {
        content += `\\[${toolResult.output.latex}\\]\n\n`;
        mathExpressions.push({
          type: 'latex',
          content: toolResult.output.latex,
          displayMode: true,
        });
      } else if (toolResult.output.result) {
        // Try to convert result to LaTeX if it contains math
        const resultStr = toolResult.output.result.toString();
        if (containsMathNotation(resultStr)) {
          const latexResult = convertToLatex(resultStr);
          content += `\\[${latexResult}\\]\n\n`;
          mathExpressions.push({
            type: 'latex',
            content: latexResult,
            displayMode: true,
          });
        } else {
          content += `\`${resultStr}\`\n\n`;
        }
      }
    }

    // Add additional output information
    if (toolResult.output.pointsGenerated) {
      content += `Points generated: ${toolResult.output.pointsGenerated}\n`;
    }
    if (toolResult.output.totalFunctions) {
      content += `Functions plotted: ${toolResult.output.totalFunctions}\n`;
    }
  }

  // Add step-by-step solution if available and requested
  if (includeSteps && toolResult.steps && toolResult.steps.length > 0) {
    content += `\n**Step-by-step Solution:**\n\n`;

    toolResult.steps.forEach((step, index) => {
      content += `**Step ${step.step}:** ${step.explanation}\n`;

      if (step.latex) {
        content += `\\[${step.latex}\\]\n\n`;
        mathExpressions.push({
          type: 'latex',
          content: step.latex,
          displayMode: true,
        });
      } else if (step.result) {
        content += `\`${step.result}\`\n\n`;
      }
    });
  }

  // Add timestamp
  content += `\n*Generated on ${toolResult.timestamp.toLocaleString()}*`;

  return {
    text: content,
    mathExpressions,
  };
}

/**
 * Create a deep link to a specific math tool with parameters
 */
export function createMathToolDeepLink(toolResult: ToolResult): string {
  const baseUrl = window.location.origin;

  switch (toolResult.toolId) {
    case 'calculator':
      const calcParams = new URLSearchParams();
      if (toolResult.input.expression) {
        calcParams.set('expr', toolResult.input.expression);
      }
      if (toolResult.input.angleMode) {
        calcParams.set('mode', toolResult.input.angleMode);
      }
      return `${baseUrl}/tools/calculator?${calcParams.toString()}`;

    case 'solver':
      const solverParams = new URLSearchParams();
      if (toolResult.input.equation) {
        solverParams.set('eq', toolResult.input.equation);
      }
      if (toolResult.input.variable) {
        solverParams.set('var', toolResult.input.variable);
      }
      if (toolResult.input.solverType) {
        solverParams.set('type', toolResult.input.solverType);
      }
      return `${baseUrl}/tools/solver?${solverParams.toString()}`;

    case 'graphing':
      const graphParams = new URLSearchParams();
      if (toolResult.input.functions && toolResult.input.functions.length > 0) {
        graphParams.set('fn', toolResult.input.functions[0]);
      }
      if (toolResult.input.bounds) {
        const bounds = toolResult.input.bounds;
        graphParams.set('xmin', bounds.xMin.toString());
        graphParams.set('xmax', bounds.xMax.toString());
        graphParams.set('ymin', bounds.yMin.toString());
        graphParams.set('ymax', bounds.yMax.toString());
      }
      return `${baseUrl}/tools/graphing?${graphParams.toString()}`;

    default:
      return `${baseUrl}/tools`;
  }
}

/**
 * Generate a suggested thread title based on tool result
 */
export function generateThreadTitle(
  toolResult: ToolResult,
  shareType: string
): string {
  const toolName = toolResult.toolName
    .replace(' Tool', '')
    .replace(' Calculator', '');

  switch (shareType) {
    case 'problem':
      return `Help with ${toolName} Problem`;
    case 'solution':
      return `${toolName} Solution`;
    case 'result':
      return `${toolName} Result`;
    case 'graph':
      return `Function Graph`;
    default:
      return `${toolName} Discussion`;
  }
}

/**
 * Suggest appropriate forum category based on tool type and content
 */
export function suggestForumCategory(
  toolResult: ToolResult
): number | undefined {
  // Map tool types to likely forum categories
  // These would correspond to category IDs in the database
  const categoryMapping: Record<string, number> = {
    calculator: 1, // General Math category
    solver: 2, // Algebra category
    graphing: 3, // Calculus/Functions category
  };

  // Try to determine category based on content
  if (toolResult.input) {
    const inputStr = JSON.stringify(toolResult.input).toLowerCase();

    // Check for specific math topics
    if (
      inputStr.includes('sin') ||
      inputStr.includes('cos') ||
      inputStr.includes('tan')
    ) {
      return 4; // Trigonometry category
    }
    if (inputStr.includes('derivative') || inputStr.includes('integral')) {
      return 3; // Calculus category
    }
    if (inputStr.includes('matrix') || inputStr.includes('vector')) {
      return 5; // Linear Algebra category
    }
  }

  return categoryMapping[toolResult.toolId];
}

/**
 * Check if a string contains mathematical notation
 */
function containsMathNotation(str: string): boolean {
  const mathPatterns = [
    /\^/, // Exponents
    /\+|\-|\*|\//, // Basic operations
    /sin|cos|tan|log|ln|sqrt/, // Functions
    /\d+\/\d+/, // Fractions
    /[α-ωΑ-Ω]/, // Greek letters
    /∑|∏|∫|∂/, // Mathematical symbols
  ];

  return mathPatterns.some(pattern => pattern.test(str));
}

/**
 * Convert mathematical expressions to LaTeX format
 */
function convertToLatex(expression: string): string {
  let latex = expression;

  // Replace common mathematical notation
  latex = latex.replace(/\*\*/g, '^'); // ** to ^
  latex = latex.replace(/\*/g, ' \\cdot '); // * to \cdot
  latex = latex.replace(/\^(\w+)/g, '^{$1}'); // x^2 to x^{2}
  latex = latex.replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}'); // sqrt() to \sqrt{}
  latex = latex.replace(/sin\(([^)]+)\)/g, '\\sin($1)'); // sin() to \sin()
  latex = latex.replace(/cos\(([^)]+)\)/g, '\\cos($1)'); // cos() to \cos()
  latex = latex.replace(/tan\(([^)]+)\)/g, '\\tan($1)'); // tan() to \tan()
  latex = latex.replace(/log\(([^)]+)\)/g, '\\log($1)'); // log() to \log()
  latex = latex.replace(/ln\(([^)]+)\)/g, '\\ln($1)'); // ln() to \ln()
  latex = latex.replace(/pi/g, '\\pi'); // pi to \pi
  latex = latex.replace(/infinity/g, '\\infty'); // infinity to \infty

  // Handle fractions (simple cases)
  latex = latex.replace(/(\w+)\/(\w+)/g, '\\frac{$1}{$2}');
  latex = latex.replace(/\(([^)]+)\)\/\(([^)]+)\)/g, '\\frac{$1}{$2}');

  return latex;
}

/**
 * Create a forum post with embedded math tool result
 */
export function createForumPostWithMathTool(
  shareData: MathToolShareData,
  options: ForumShareOptions = {}
): {
  content: PostContent;
  title?: string;
  categoryId?: number;
  deepLink?: string;
} {
  const content = convertToolResultToPostContent(shareData);

  let result: any = { content };

  if (options.title || !options.threadId) {
    result.title =
      options.title ||
      generateThreadTitle(shareData.toolResult, shareData.shareType);
  }

  if (options.categoryId) {
    result.categoryId = options.categoryId;
  } else {
    const suggestedCategory = suggestForumCategory(shareData.toolResult);
    if (suggestedCategory) {
      result.categoryId = suggestedCategory;
    }
  }

  if (options.includeDeepLink !== false) {
    result.deepLink = createMathToolDeepLink(shareData.toolResult);
  }

  return result;
}
