import { useEffect, useRef, useState } from "react";
import { generateGraphDescription } from "../../lib/accessibility";
import { LiveRegion } from "./ScreenReaderAnnouncements";

interface JSXGraphAccessibleProps {
  /** Unique identifier for the graph */
  id: string;
  /** Graph type description */
  graphType: string;
  /** Width of the graph container */
  width?: number;
  /** Height of the graph container */
  height?: number;
  /** Initialization function for JSXGraph */
  initFunction: (board: any) => any[];
  /** Configuration options for JSXGraph */
  config?: any;
  /** Additional accessibility description */
  description?: string;
  /** Callback when graph elements change */
  onElementsChange?: (elements: any[]) => void;
  /** Custom keyboard handlers */
  keyboardHandlers?: Record<string, (event: KeyboardEvent) => void>;
  className?: string;
}

/**
 * Accessible wrapper for JSXGraph components
 * Provides screen reader support and keyboard navigation
 */
export function JSXGraphAccessible({
  id,
  graphType,
  width = 400,
  height = 300,
  initFunction,
  config = {},
  description,
  onElementsChange,
  keyboardHandlers = {},
  className = "",
}: JSXGraphAccessibleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<any>(null);
  const [elements, setElements] = useState<any[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Default JSXGraph configuration with accessibility enhancements
  const defaultConfig = {
    boundingbox: [-5, 5, 5, -5],
    axis: true,
    showCopyright: false,
    showNavigation: false,
    zoom: {
      factorX: 1.25,
      factorY: 1.25,
      wheel: true,
      needshift: false,
      eps: 0.1,
    },
    pan: {
      enabled: true,
      needTwoFingers: false,
      needshift: false,
    },
    // Accessibility-specific options
    keyboard: {
      enabled: true,
      dy: 10,
      dx: 10,
      panShift: true,
      panCtrl: false,
    },
    ...config,
  };

  // Initialize JSXGraph
  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return;

    const initGraph = async () => {
      try {
        // Wait for JSXGraph to be available
        if (!(window as any).JXG) {
          setTimeout(initGraph, 100);
          return;
        }

        const JXG = (window as any).JXG;

        // Create the board
        const board = JXG.JSXGraph.initBoard(id, defaultConfig);
        boardRef.current = board;

        // Initialize elements
        const createdElements = initFunction(board);
        setElements(createdElements || []);
        setIsLoaded(true);

        // Add accessibility attributes to the SVG
        const svg = containerRef.current?.querySelector("svg");
        if (svg) {
          svg.setAttribute("role", "img");
          svg.setAttribute("aria-label", generateAccessibleDescription());
          svg.setAttribute("tabindex", "0");

          // Add keyboard event listeners
          svg.addEventListener("keydown", handleKeyDown);
          svg.addEventListener("focus", handleFocus);
          svg.addEventListener("blur", handleBlur);
        }

        // Notify parent of elements
        if (onElementsChange) {
          onElementsChange(createdElements || []);
        }

        // Announce graph creation
        setAnnouncement(
          `${graphType} graph loaded with interactive elements. Use arrow keys to navigate.`
        );
      } catch (error) {
        console.error("JSXGraph initialization error:", error);
        setAnnouncement(
          `Error loading ${graphType} graph. Please try refreshing the page.`
        );
      }
    };

    initGraph();

    return () => {
      if (boardRef.current) {
        try {
          boardRef.current.suspendUpdate();
          // Clean up event listeners
          const svg = containerRef.current?.querySelector("svg");
          if (svg) {
            svg.removeEventListener("keydown", handleKeyDown);
            svg.removeEventListener("focus", handleFocus);
            svg.removeEventListener("blur", handleBlur);
          }
        } catch (error) {
          console.warn("JSXGraph cleanup error:", error);
        }
      }
    };
  }, [id, initFunction]);

  const generateAccessibleDescription = () => {
    if (description) return description;

    const elementTypes = elements.map((el) => {
      if (el.elType) return el.elType;
      if (el.type) return el.type;
      return "element";
    });

    return generateGraphDescription(
      graphType,
      elementTypes.map((type) => ({ type }))
    );
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const { key, ctrlKey, altKey, shiftKey } = event;

    // Handle custom keyboard shortcuts
    const keyCombo = [
      ctrlKey && "Ctrl",
      altKey && "Alt",
      shiftKey && "Shift",
      key,
    ]
      .filter(Boolean)
      .join("+");

    if (keyboardHandlers[keyCombo]) {
      event.preventDefault();
      keyboardHandlers[keyCombo](event);
      return;
    }

    // Default navigation
    switch (key) {
      case "ArrowUp":
        event.preventDefault();
        panGraph(0, 10);
        setAnnouncement("Moved up");
        break;
      case "ArrowDown":
        event.preventDefault();
        panGraph(0, -10);
        setAnnouncement("Moved down");
        break;
      case "ArrowLeft":
        event.preventDefault();
        panGraph(-10, 0);
        setAnnouncement("Moved left");
        break;
      case "ArrowRight":
        event.preventDefault();
        panGraph(10, 0);
        setAnnouncement("Moved right");
        break;
      case "+":
      case "=":
        event.preventDefault();
        zoomGraph(1.25);
        setAnnouncement("Zoomed in");
        break;
      case "-":
        event.preventDefault();
        zoomGraph(0.8);
        setAnnouncement("Zoomed out");
        break;
      case "Home":
        event.preventDefault();
        resetView();
        setAnnouncement("Reset to default view");
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        announceCurrentState();
        break;
    }
  };

  const handleFocus = () => {
    setAnnouncement(
      `Focused on ${graphType} graph. Use arrow keys to pan, plus and minus to zoom, Home to reset view, Enter for current state.`
    );
  };

  const handleBlur = () => {
    setAnnouncement("");
  };

  const panGraph = (dx: number, dy: number) => {
    if (!boardRef.current) return;

    const board = boardRef.current;
    const bbox = board.getBoundingBox();
    const newBbox = [
      bbox[0] - dx * 0.1,
      bbox[1] + dy * 0.1,
      bbox[2] - dx * 0.1,
      bbox[3] + dy * 0.1,
    ];
    board.setBoundingBox(newBbox, false);
  };

  const zoomGraph = (factor: number) => {
    if (!boardRef.current) return;

    const board = boardRef.current;
    board.zoomAllPoints(factor);
  };

  const resetView = () => {
    if (!boardRef.current) return;

    const board = boardRef.current;
    board.setBoundingBox(defaultConfig.boundingbox, false);
  };

  const announceCurrentState = () => {
    if (!boardRef.current) return;

    const board = boardRef.current;
    const bbox = board.getBoundingBox();
    const description = `Current view: x from ${bbox[0].toFixed(
      1
    )} to ${bbox[2].toFixed(1)}, y from ${bbox[3].toFixed(
      1
    )} to ${bbox[1].toFixed(1)}`;
    setAnnouncement(description);
  };

  return (
    <div className={`jsxgraph-accessible ${className}`}>
      {/* Screen reader announcements */}
      <LiveRegion priority="polite">{announcement}</LiveRegion>

      {/* Graph container */}
      <div
        ref={containerRef}
        id={id}
        style={{ width: `${width}px`, height: `${height}px` }}
        className="jsxgraph-container border border-border rounded-lg bg-background"
        role="application"
        aria-label={generateAccessibleDescription()}
      >
        {!isLoaded && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p>Loading {graphType} graph...</p>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard shortcuts help */}
      <div className="mt-2 text-xs text-muted-foreground">
        <details>
          <summary className="cursor-pointer hover:text-foreground">
            Keyboard shortcuts
          </summary>
          <div className="mt-1 space-y-1">
            <div>Arrow keys: Pan the graph</div>
            <div>+/-: Zoom in/out</div>
            <div>Home: Reset view</div>
            <div>Enter: Announce current state</div>
          </div>
        </details>
      </div>

      {/* Alternative text description */}
      <div className="sr-only">
        {generateAccessibleDescription()}
        {elements.length > 0 && (
          <div>
            Graph contains {elements.length} interactive elements. Use keyboard
            navigation to explore the graph.
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Hook for managing JSXGraph accessibility
 */
export function useJSXGraphAccessibility(boardRef: React.RefObject<any>) {
  const [elements, setElements] = useState<any[]>([]);
  const [announcement, setAnnouncement] = useState("");

  const announceElement = (element: any, action: string = "selected") => {
    if (!element) return;

    let description = "";

    if (element.elType === "point") {
      const coords = element.coords?.usrCoords;
      if (coords) {
        description = `Point at coordinates (${coords[1].toFixed(
          2
        )}, ${coords[2].toFixed(2)})`;
      } else {
        description = "Point";
      }
    } else if (element.elType === "line") {
      description = "Line";
    } else if (element.elType === "circle") {
      description = "Circle";
    } else if (element.elType === "polygon") {
      description = "Polygon";
    } else {
      description = element.elType || "Graph element";
    }

    setAnnouncement(`${action} ${description}`);
  };

  const announceCoordinates = (x: number, y: number) => {
    setAnnouncement(`Coordinates: (${x.toFixed(2)}, ${y.toFixed(2)})`);
  };

  const announceGraphState = (state: string) => {
    setAnnouncement(state);
  };

  return {
    elements,
    setElements,
    announcement,
    announceElement,
    announceCoordinates,
    announceGraphState,
  };
}
