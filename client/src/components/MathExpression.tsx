import React, { useEffect, useRef } from "react";
import { generateMathDescription } from "../lib/accessibility";

interface MathExpressionProps {
  expression: string;
  className?: string;
  fallback?: string;
  inline?: boolean;
  ariaLabel?: string;
}

export const MathExpression: React.FC<MathExpressionProps> = ({
  expression,
  className = "",
  fallback,
  inline = false,
  ariaLabel,
}) => {
  const mathRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  // Generate accessible description for screen readers
  const accessibleDescription = React.useMemo(() => {
    return (
      ariaLabel ||
      generateMathDescription(expression) ||
      fallback ||
      "Mathematical expression"
    );
  }, [expression, ariaLabel, fallback]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const renderMath = async () => {
      if (!mathRef.current) return;

      try {
        // Check if MathJax is available and ready
        if (
          typeof window !== "undefined" &&
          (window as any).MathJax &&
          (window as any).MathJax.startup
        ) {
          const MathJax = (window as any).MathJax;

          // Wait for MathJax to be ready
          await MathJax.startup.promise;

          if (mathRef.current) {
            // Set content with proper delimiters
            const mathContent = inline
              ? `\\(${expression}\\)`
              : `\\[${expression}\\]`;
            mathRef.current.innerHTML = mathContent;

            // Render the math
            if (MathJax.typesetPromise) {
              await MathJax.typesetPromise([mathRef.current]);
              setIsLoaded(true);
              setHasError(false);

              // Add accessibility attributes after rendering
              if (mathRef.current) {
                const mathElement =
                  mathRef.current.querySelector("[data-mathml]") ||
                  mathRef.current;
                mathElement.setAttribute("aria-label", accessibleDescription);
                mathElement.setAttribute("role", "img");
              }
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
        console.warn("MathJax rendering error:", error);
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
  }, [expression, inline, accessibleDescription]);

  if (hasError) {
    return (
      <span
        className={`font-mono text-sm bg-muted/50 px-2 py-1 rounded border-l-2 border-destructive ${className}`}
        title="Mathematical expression (fallback)"
        aria-label={accessibleDescription}
        role="img"
      >
        {fallback || expression}
        <span className="sr-only"> (mathematical expression)</span>
      </span>
    );
  }

  const Element = inline ? "span" : "div";

  return (
    <Element
      ref={mathRef}
      className={`math-expression ${className} ${
        !isLoaded ? "opacity-50" : ""
      }`}
      aria-label={accessibleDescription}
      role="img"
      title={accessibleDescription}
    >
      {/* Hidden text for screen readers when MathJax is loading */}
      <span className="sr-only">{accessibleDescription}</span>

      {/* Initial content before MathJax processes it */}
      <span aria-hidden="true">
        {inline ? `\\(${expression}\\)` : `\\[${expression}\\]`}
      </span>
    </Element>
  );
};
