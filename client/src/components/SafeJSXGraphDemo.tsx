import { useState, useEffect } from "react";
import { JSXGraphDemo } from "./JSXGraphDemo";

interface SafeJSXGraphDemoProps {
  id: string;
  config: any;
  onInit?: (board: any) => void;
  title?: string;
  description?: string;
}

/**
 * A wrapper around JSXGraphDemo that delays rendering until the page is stable
 * This helps prevent DOM manipulation conflicts during page transitions
 */
export function SafeJSXGraphDemo(props: SafeJSXGraphDemoProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Delay rendering to ensure the page is stable
    const timer = setTimeout(() => {
      setShouldRender(true);
    }, 300);

    return () => {
      clearTimeout(timer);
      setShouldRender(false);
    };
  }, []);

  if (!shouldRender) {
    return (
      <div className="w-full h-64 border rounded-lg bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">
            Preparing interactive demo...
          </p>
        </div>
      </div>
    );
  }

  return <JSXGraphDemo {...props} />;
}
