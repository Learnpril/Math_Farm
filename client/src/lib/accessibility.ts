/**
 * Accessibility utilities and helpers for Math Farm
 * Provides functions for ARIA management, focus handling, and screen reader support
 */

/**
 * Announces text to screen readers using ARIA live regions
 */
export function announceToScreenReader(
  message: string,
  priority: "polite" | "assertive" = "polite"
) {
  const announcement = document.createElement("div");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement with proper error handling
  setTimeout(() => {
    try {
      // Check if the element is still a child before removing
      if (announcement.parentNode === document.body) {
        document.body.removeChild(announcement);
      }
    } catch (error) {
      // Silently handle the case where element was already removed
      console.debug("Announcement element already removed:", error);
    }
  }, 1000);
}

/**
 * Manages focus for modal dialogs and overlays
 */
export class FocusManager {
  private previousFocus: HTMLElement | null = null;
  private focusableElements: HTMLElement[] = [];

  /**
   * Trap focus within a container element
   */
  trapFocus(container: HTMLElement) {
    this.previousFocus = document.activeElement as HTMLElement;
    this.focusableElements = this.getFocusableElements(container);

    if (this.focusableElements.length > 0) {
      this.focusableElements[0].focus();
    }

    container.addEventListener("keydown", this.handleKeyDown);
  }

  /**
   * Release focus trap and restore previous focus
   */
  releaseFocus(container: HTMLElement) {
    container.removeEventListener("keydown", this.handleKeyDown);

    if (this.previousFocus) {
      this.previousFocus.focus();
    }

    this.previousFocus = null;
    this.focusableElements = [];
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Tab") return;

    const firstElement = this.focusableElements[0];
    const lastElement =
      this.focusableElements[this.focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };

  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "a[href]",
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(", ");

    return Array.from(container.querySelectorAll(focusableSelectors));
  }
}

/**
 * Skip link component for keyboard navigation
 */
export function createSkipLink(targetId: string, text: string): HTMLElement {
  const skipLink = document.createElement("a");
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className =
    "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  return skipLink;
}

/**
 * Generates accessible descriptions for mathematical expressions
 */
export function generateMathDescription(expression: string): string {
  // Enhanced LaTeX to text conversion for screen readers
  const conversions: Record<string, string> = {
    // Fractions
    "\\frac{([^}]+)}{([^}]+)}": "fraction with numerator $1 and denominator $2",
    "\\dfrac{([^}]+)}{([^}]+)}":
      "fraction with numerator $1 and denominator $2",
    "\\tfrac{([^}]+)}{([^}]+)}":
      "fraction with numerator $1 and denominator $2",

    // Roots
    "\\sqrt{([^}]+)}": "square root of $1",
    "\\sqrt\\[([^\\]]+)\\]{([^}]+)}": "$1th root of $2",
    "\\cbrt{([^}]+)}": "cube root of $1",

    // Calculus
    "\\sum": "summation",
    "\\sum_{([^}]+)}^{([^}]+)}": "summation from $1 to $2",
    "\\int": "integral",
    "\\int_{([^}]+)}^{([^}]+)}": "integral from $1 to $2",
    "\\lim": "limit",
    "\\lim_{([^}]+)}": "limit as $1",
    "\\partial": "partial derivative",
    "\\nabla": "nabla operator",

    // Trigonometry
    "\\sin": "sine",
    "\\cos": "cosine",
    "\\tan": "tangent",
    "\\cot": "cotangent",
    "\\sec": "secant",
    "\\csc": "cosecant",
    "\\arcsin": "arcsine",
    "\\arccos": "arccosine",
    "\\arctan": "arctangent",

    // Logarithms
    "\\log": "logarithm",
    "\\ln": "natural logarithm",
    "\\log_{([^}]+)}": "logarithm base $1",

    // Constants and symbols
    "\\infty": "infinity",
    "\\e": "e",
    "\\emptyset": "empty set",
    "\\varnothing": "empty set",

    // Greek letters
    "\\alpha": "alpha",
    "\\beta": "beta",
    "\\gamma": "gamma",
    "\\Gamma": "capital gamma",
    "\\delta": "delta",
    "\\Delta": "capital delta",
    "\\epsilon": "epsilon",
    "\\varepsilon": "epsilon",
    "\\zeta": "zeta",
    "\\eta": "eta",
    "\\theta": "theta",
    "\\Theta": "capital theta",
    "\\vartheta": "theta",
    "\\iota": "iota",
    "\\kappa": "kappa",
    "\\lambda": "lambda",
    "\\Lambda": "capital lambda",
    "\\mu": "mu",
    "\\nu": "nu",
    "\\xi": "xi",
    "\\Xi": "capital xi",
    "\\omicron": "omicron",
    "\\pi": "pi",
    "\\Pi": "capital pi",
    "\\rho": "rho",
    "\\varrho": "rho",
    "\\sigma": "sigma",
    "\\Sigma": "capital sigma",
    "\\varsigma": "sigma",
    "\\tau": "tau",
    "\\upsilon": "upsilon",
    "\\Upsilon": "capital upsilon",
    "\\phi": "phi",
    "\\Phi": "capital phi",
    "\\varphi": "phi",
    "\\chi": "chi",
    "\\psi": "psi",
    "\\Psi": "capital psi",
    "\\omega": "omega",
    "\\Omega": "capital omega",

    // Relations
    "\\leq": "less than or equal to",
    "\\le": "less than or equal to",
    "\\geq": "greater than or equal to",
    "\\ge": "greater than or equal to",
    "\\neq": "not equal to",
    "\\ne": "not equal to",
    "\\approx": "approximately equal to",
    "\\equiv": "equivalent to",
    "\\sim": "similar to",
    "\\simeq": "similar or equal to",
    "\\cong": "congruent to",
    "\\propto": "proportional to",
    "\\parallel": "parallel to",
    "\\perp": "perpendicular to",

    // Operations
    "\\pm": "plus or minus",
    "\\mp": "minus or plus",
    "\\times": "times",
    "\\div": "divided by",
    "\\cdot": "dot",
    "\\ast": "asterisk",
    "\\star": "star",
    "\\circ": "circle",
    "\\bullet": "bullet",
    "\\oplus": "plus in circle",
    "\\ominus": "minus in circle",
    "\\otimes": "times in circle",
    "\\oslash": "slash in circle",

    // Set theory
    "\\in": "element of",
    "\\notin": "not element of",
    "\\subset": "subset of",
    "\\subseteq": "subset or equal to",
    "\\supset": "superset of",
    "\\supseteq": "superset or equal to",
    "\\cup": "union",
    "\\cap": "intersection",
    "\\setminus": "set minus",
    "\\backslash": "backslash",

    // Logic
    "\\land": "and",
    "\\lor": "or",
    "\\lnot": "not",
    "\\neg": "not",
    "\\implies": "implies",
    "\\iff": "if and only if",
    "\\forall": "for all",
    "\\exists": "there exists",
    "\\nexists": "there does not exist",

    // Arrows
    "\\rightarrow": "right arrow",
    "\\leftarrow": "left arrow",
    "\\leftrightarrow": "left right arrow",
    "\\Rightarrow": "right double arrow",
    "\\Leftarrow": "left double arrow",
    "\\Leftrightarrow": "left right double arrow",
    "\\uparrow": "up arrow",
    "\\downarrow": "down arrow",
    "\\updownarrow": "up down arrow",

    // Superscripts and subscripts
    "\\^{([^}]+)}": "to the power of $1",
    "\\^{2}": "squared",
    "\\^{3}": "cubed",
    "\\^{-1}": "inverse",
    "_{([^}]+)}": "subscript $1",

    // Brackets and delimiters
    "\\left\\(": "left parenthesis",
    "\\right\\)": "right parenthesis",
    "\\left\\[": "left bracket",
    "\\right\\]": "right bracket",
    "\\left\\{": "left brace",
    "\\right\\}": "right brace",
    "\\left|": "left vertical bar",
    "\\right|": "right vertical bar",
    "\\langle": "left angle bracket",
    "\\rangle": "right angle bracket",

    // Matrices
    "\\begin{matrix}": "matrix with elements",
    "\\end{matrix}": "end matrix",
    "\\begin{pmatrix}": "matrix in parentheses with elements",
    "\\end{pmatrix}": "end matrix",
    "\\begin{bmatrix}": "matrix in brackets with elements",
    "\\end{bmatrix}": "end matrix",
    "\\begin{vmatrix}": "determinant with elements",
    "\\end{vmatrix}": "end determinant",

    // Clean up delimiters
    "\\{": "left brace",
    "\\}": "right brace",
    "\\[": "",
    "\\]": "",
    "\\(": "",
    "\\)": "",
  };

  let description = expression;

  // Helper function to escape regex special characters when needed
  const escapeRegexSpecialChars = (str: string): string => {
    // Only escape if the string contains unescaped special characters
    // that would cause regex errors
    return str.replace(/([.*+?^${}()|[\]\\])/g, "\\$1");
  };

  // Apply conversions in order of complexity (more specific patterns first)
  const sortedPatterns = Object.keys(conversions).sort(
    (a, b) => b.length - a.length
  );

  for (const pattern of sortedPatterns) {
    const replacement = conversions[pattern];
    try {
      // For LaTeX patterns, we want to keep the backslashes as they are
      // but escape other special regex characters if needed
      let regexPattern = pattern;

      // Special handling for patterns that are meant to be literal strings
      if (
        pattern.startsWith("\\") &&
        !pattern.includes("(") &&
        !pattern.includes("[")
      ) {
        // This is likely a LaTeX command, treat as literal
        regexPattern = escapeRegexSpecialChars(pattern);
      }

      const regex = new RegExp(regexPattern, "g");
      description = description.replace(regex, replacement);
    } catch (error) {
      // Skip invalid regex patterns and try with escaped version
      try {
        const escapedPattern = escapeRegexSpecialChars(pattern);
        const regex = new RegExp(escapedPattern, "g");
        description = description.replace(regex, replacement);
      } catch (secondError) {
        console.warn(`Could not process pattern: ${pattern}`, secondError);
      }
    }
  }

  // Post-process to improve readability
  description = description
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/\s*,\s*/g, ", ") // Fix comma spacing
    .replace(/\s*\.\s*/g, ". ") // Fix period spacing
    .replace(/\s*;\s*/g, "; ") // Fix semicolon spacing
    .replace(/\s*:\s*/g, ": ") // Fix colon spacing
    .replace(/\s*=\s*/g, " equals ") // Replace equals sign
    .replace(/\s*<\s*/g, " less than ") // Replace less than
    .replace(/\s*>\s*/g, " greater than ") // Replace greater than
    .replace(/\s*\+\s*/g, " plus ") // Replace plus
    .replace(/\s*-\s*/g, " minus ") // Replace minus
    .replace(/\s*\*\s*/g, " times ") // Replace asterisk
    .replace(/\s*\/\s*/g, " divided by ") // Replace slash
    .trim();

  // Add context if the description is still mostly symbols
  if (description.length < 3 || /^[^a-zA-Z]*$/.test(description)) {
    description = `Mathematical expression: ${description || expression}`;
  }

  return description || "Mathematical expression";
}

/**
 * Generate description for JSXGraph visualizations
 */
export function generateGraphDescription(
  graphType: string,
  elements: Array<{ type: string; properties?: any }> = []
): string {
  let description = `Interactive ${graphType} graph`;

  if (elements.length > 0) {
    const elementCounts = elements.reduce((acc, el) => {
      acc[el.type] = (acc[el.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const elementDescriptions = Object.entries(elementCounts).map(
      ([type, count]) => {
        const plural = count > 1 ? "s" : "";
        return `${count} ${type}${plural}`;
      }
    );

    description += ` containing ${elementDescriptions.join(", ")}`;
  }

  description += ". Use arrow keys to navigate interactive elements.";

  return description;
}

/**
 * Checks if an element meets WCAG color contrast requirements
 */
export function checkColorContrast(
  foreground: string,
  background: string
): {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
} {
  // Convert HSL to RGB for contrast calculation
  const fgRgb = hslToRgb(foreground);
  const bgRgb = hslToRgb(background);

  const ratio = getContrastRatio(fgRgb, bgRgb);

  return {
    ratio,
    passesAA: ratio >= 4.5,
    passesAAA: ratio >= 7,
  };
}

/**
 * Convert HSL color to RGB
 */
function hslToRgb(hsl: string): [number, number, number] {
  // Parse HSL string like "255 25% 15%"
  const matches = hsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
  if (!matches) return [0, 0, 0];

  const h = parseInt(matches[1]) / 360;
  const s = parseInt(matches[2]) / 100;
  const l = parseInt(matches[3]) / 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Calculate contrast ratio between two RGB colors
 */
function getContrastRatio(
  rgb1: [number, number, number],
  rgb2: [number, number, number]
): number {
  const getLuminance = (rgb: [number, number, number]) => {
    const [r, g, b] = rgb.map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Keyboard navigation helper
 */
export class KeyboardNavigation {
  private elements: HTMLElement[] = [];
  private currentIndex = -1;

  constructor(
    container: HTMLElement,
    selector: string = 'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) {
    this.elements = Array.from(container.querySelectorAll(selector));
  }

  handleKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        event.preventDefault();
        this.focusNext();
        break;
      case "ArrowUp":
      case "ArrowLeft":
        event.preventDefault();
        this.focusPrevious();
        break;
      case "Home":
        event.preventDefault();
        this.focusFirst();
        break;
      case "End":
        event.preventDefault();
        this.focusLast();
        break;
    }
  }

  private focusNext() {
    this.currentIndex = (this.currentIndex + 1) % this.elements.length;
    this.elements[this.currentIndex]?.focus();
  }

  private focusPrevious() {
    this.currentIndex =
      this.currentIndex <= 0 ? this.elements.length - 1 : this.currentIndex - 1;
    this.elements[this.currentIndex]?.focus();
  }

  private focusFirst() {
    this.currentIndex = 0;
    this.elements[this.currentIndex]?.focus();
  }

  private focusLast() {
    this.currentIndex = this.elements.length - 1;
    this.elements[this.currentIndex]?.focus();
  }
}

/**
 * High contrast mode detection and management
 */
export class HighContrastManager {
  private static instance: HighContrastManager;
  private isHighContrast = false;
  private callbacks: Array<(isHighContrast: boolean) => void> = [];

  static getInstance(): HighContrastManager {
    if (!HighContrastManager.instance) {
      HighContrastManager.instance = new HighContrastManager();
    }
    return HighContrastManager.instance;
  }

  constructor() {
    this.detectSystemHighContrast();
    this.loadUserPreference();
  }

  private detectSystemHighContrast() {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-contrast: high)");
      this.isHighContrast = mediaQuery.matches;

      mediaQuery.addEventListener("change", (e) => {
        this.setHighContrast(e.matches);
      });
    }
  }

  private loadUserPreference() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("high-contrast");
      if (saved !== null) {
        this.setHighContrast(saved === "true");
      }
    }
  }

  setHighContrast(enabled: boolean) {
    this.isHighContrast = enabled;

    if (typeof document !== "undefined") {
      if (enabled) {
        document.documentElement.classList.add("high-contrast");
      } else {
        document.documentElement.classList.remove("high-contrast");
      }
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("high-contrast", enabled.toString());
    }

    this.callbacks.forEach((callback) => callback(enabled));
  }

  getHighContrast(): boolean {
    return this.isHighContrast;
  }

  toggleHighContrast() {
    this.setHighContrast(!this.isHighContrast);
  }

  onHighContrastChange(callback: (isHighContrast: boolean) => void) {
    this.callbacks.push(callback);

    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }
}
