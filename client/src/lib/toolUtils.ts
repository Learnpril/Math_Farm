/**
 * Utility functions for mathematical tools
 */

export interface ToolResult {
  toolId: string;
  toolName: string;
  input: any;
  output: any;
  timestamp: Date;
  steps?: Array<{ step: string; explanation: string; result: string }>;
}

/**
 * Save tool result to localStorage
 */
export function saveToolResult(result: ToolResult): void {
  try {
    const savedResults = getSavedResults();
    const newResults = [result, ...savedResults.slice(0, 49)]; // Keep last 50 results
    localStorage.setItem("mathfarm_tool_results", JSON.stringify(newResults));
  } catch (error) {
    console.warn("Failed to save tool result:", error);
  }
}

/**
 * Get saved tool results from localStorage
 */
export function getSavedResults(): ToolResult[] {
  try {
    const saved = localStorage.getItem("mathfarm_tool_results");
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.warn("Failed to load saved results:", error);
    return [];
  }
}

/**
 * Clear all saved results
 */
export function clearSavedResults(): void {
  try {
    localStorage.removeItem("mathfarm_tool_results");
  } catch (error) {
    console.warn("Failed to clear saved results:", error);
  }
}

/**
 * Export tool result as text
 */
export function exportResultAsText(result: ToolResult): string {
  let output = `Math Farm - ${result.toolName}\n`;
  output += `Generated: ${result.timestamp.toLocaleString()}\n`;
  output += `${"=".repeat(50)}\n\n`;

  output += `Input:\n${JSON.stringify(result.input, null, 2)}\n\n`;
  output += `Result:\n${JSON.stringify(result.output, null, 2)}\n\n`;

  if (result.steps && result.steps.length > 0) {
    output += `Step-by-step Solution:\n`;
    result.steps.forEach((step, index) => {
      output += `${index + 1}. ${step.explanation}\n`;
      output += `   ${step.result}\n\n`;
    });
  }

  return output;
}

/**
 * Download tool result as a text file
 */
export function downloadResult(result: ToolResult): void {
  try {
    const content = exportResultAsText(result);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `mathfarm_${result.toolId}_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();

    // Safe removal with error handling
    try {
      if (link.parentNode === document.body) {
        document.body.removeChild(link);
      }
    } catch (error) {
      console.debug("Link element already removed:", error);
    }

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to download result:", error);
  }
}

/**
 * Share tool result via Web Share API or clipboard
 */
export async function shareResult(result: ToolResult): Promise<boolean> {
  const shareText = exportResultAsText(result);

  // Try Web Share API first (mobile/modern browsers)
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Math Farm - ${result.toolName}`,
        text: shareText,
      });
      return true;
    } catch (error) {
      // User cancelled or error occurred, fall back to clipboard
    }
  }

  // Fall back to clipboard API
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(shareText);
      return true;
    } catch (error) {
      console.warn("Failed to copy to clipboard:", error);
    }
  }

  // Final fallback: create a temporary textarea
  try {
    const textarea = document.createElement("textarea");
    textarea.value = shareText;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");

    // Safe removal with error handling
    try {
      if (textarea.parentNode === document.body) {
        document.body.removeChild(textarea);
      }
    } catch (error) {
      console.debug("Textarea element already removed:", error);
    }
    return true;
  } catch (error) {
    console.error("All share methods failed:", error);
    return false;
  }
}

/**
 * Format number for display
 */
export function formatNumber(num: number, precision: number = 6): string {
  if (isNaN(num) || !isFinite(num)) {
    return "Invalid";
  }

  // For very large or very small numbers, use scientific notation
  if (Math.abs(num) >= 1e6 || (Math.abs(num) < 1e-3 && num !== 0)) {
    return num.toExponential(precision);
  }

  // For normal numbers, use fixed precision and remove trailing zeros
  return parseFloat(num.toFixed(precision)).toString();
}

/**
 * Validate mathematical expression
 */
export function validateExpression(expr: string): {
  valid: boolean;
  error?: string;
} {
  try {
    // Basic validation - check for balanced parentheses
    let parenCount = 0;
    for (const char of expr) {
      if (char === "(") parenCount++;
      if (char === ")") parenCount--;
      if (parenCount < 0) {
        return { valid: false, error: "Unmatched closing parenthesis" };
      }
    }

    if (parenCount > 0) {
      return { valid: false, error: "Unmatched opening parenthesis" };
    }

    // Check for invalid characters (basic check)
    const validChars = /^[0-9+\-*/^().\s\w,]+$/;
    if (!validChars.test(expr)) {
      return { valid: false, error: "Invalid characters in expression" };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: "Invalid expression" };
  }
}
