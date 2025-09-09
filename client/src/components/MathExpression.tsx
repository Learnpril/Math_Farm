import React, { useEffect, useRef, useState, useMemo } from "react";
import { generateMathDescription } from "../lib/accessibility";
import { typesetMath, isMathJaxReady, loadMathJax } from "../lib/mathJaxLoader";

interface MathExpressionProps {
  expression: string;
  className?: string;
  fallback?: string;
  inline?: boolean;
  ariaLabel?: string;
  priority?: "high" | "normal" | "low";
}

export const MathExpression: React.FC<MathExpressionProps> = ({
  expression,
  className = "",
  fallback,
  inline = false,
  ariaLabel,
  priority = "normal",
}) => {
  const mathRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Generate accessible description for screen readers
  const accessibleDescription = useMemo(() => {
    return (
      ariaLabel ||
      generateMathDescription(expression) ||
      fallback ||
      "Mathematical expression"
    );
  }, [expression, ariaLabel, fallback]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!mathRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "50px", // Start loading 50px before element is visible
        threshold: 0.1,
      }
    );

    observer.observe(mathRef.current);

    return () => observer.disconnect();
  }, []);

  // Optimized math rendering with priority-based loading
  useEffect(() => {
    if (!isVisible && priority !== "high") return;
    if (!mathRef.current) return;

    let isCancelled = false;

    const renderMath = async () => {
      try {
        // Ensure MathJax is loaded
        if (!isMathJaxReady()) {
          await loadMathJax();
        }

        if (isCancelled || !mathRef.current) return;

        // Set content with proper delimiters
        const mathContent = inline
          ? `\\(${expression}\\)`
          : `\\[${expression}\\]`;
        mathRef.current.innerHTML = mathContent;

        // Render the math with optimized typesetting
        await typesetMath(mathRef.current);

        if (isCancelled) return;

        setIsLoaded(true);
        setHasError(false);

        // Add accessibility attributes after rendering - batch DOM operations to reduce reflows
        if (mathRef.current) {
          // Use requestAnimationFrame to batch DOM operations
          requestAnimationFrame(() => {
            if (!mathRef.current) return;

            const mathElement =
              mathRef.current.querySelector("[data-mathml]") ||
              mathRef.current.querySelector("mjx-container") ||
              mathRef.current;

            if (mathElement) {
              // Batch attribute updates
              const attributes = [
                ["aria-label", accessibleDescription],
                ["role", "img"],
              ];

              attributes.forEach(([attr, value]) => {
                mathElement.setAttribute(attr, value);
              });

              // Try to enable MathML output for better screen reader support
              const mathmlElement = mathRef.current.querySelector("math");
              if (mathmlElement) {
                const mathmlAttributes = [
                  ["aria-label", accessibleDescription],
                  ["role", "math"],
                  ["alttext", accessibleDescription],
                ];

                mathmlAttributes.forEach(([attr, value]) => {
                  mathmlElement.setAttribute(attr, value);
                });
              }

              // Add semantic information if available
              const mjxContainer =
                mathRef.current.querySelector("mjx-container");
              if (mjxContainer) {
                mjxContainer.setAttribute(
                  "aria-describedby",
                  `math-desc-${Math.random().toString(36).substr(2, 9)}`
                );
              }
            }
          });
        }
      } catch (error) {
        if (!isCancelled) {
          console.warn("MathJax rendering error:", error);
          setHasError(true);
        }
      }
    };

    // Priority-based delay
    const delay = priority === "high" ? 0 : priority === "normal" ? 50 : 200;
    const timeoutId = setTimeout(renderMath, delay);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [expression, inline, accessibleDescription, isVisible, priority]);

  // Error fallback
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
      } ${!isVisible && priority !== "high" ? "min-h-[1.5em]" : ""}`}
      aria-label={accessibleDescription}
      role="img"
      title={accessibleDescription}
    >
      {/* Loading state */}
      {!isLoaded && (
        <>
          <span className="sr-only">{accessibleDescription}</span>
          <span aria-hidden="true" className="text-muted-foreground">
            {inline ? `\\(${expression}\\)` : `\\[${expression}\\]`}
          </span>
        </>
      )}
    </Element>
  );
};
