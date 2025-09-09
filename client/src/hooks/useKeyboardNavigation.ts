import { useEffect, useCallback, useRef } from "react";

export interface KeyboardNavigationOptions {
  /** Enable arrow key navigation */
  enableArrowKeys?: boolean;
  /** Enable home/end navigation */
  enableHomeEnd?: boolean;
  /** Enable tab navigation */
  enableTabNavigation?: boolean;
  /** Enable escape key handling */
  enableEscape?: boolean;
  /** Enable enter key handling */
  enableEnter?: boolean;
  /** Custom key handlers */
  customHandlers?: Record<string, (event: KeyboardEvent) => void>;
  /** Selector for focusable elements */
  focusableSelector?: string;
  /** Whether to wrap around when reaching the end */
  wrapAround?: boolean;
  /** Whether to prevent default behavior */
  preventDefault?: boolean;
}

export interface KeyboardNavigationState {
  currentIndex: number;
  elements: HTMLElement[];
  focusElement: (index: number) => void;
  focusNext: () => void;
  focusPrevious: () => void;
  focusFirst: () => void;
  focusLast: () => void;
  reset: () => void;
}

/**
 * Hook for comprehensive keyboard navigation support
 * Provides arrow key navigation, focus management, and keyboard shortcuts
 */
export function useKeyboardNavigation(
  containerRef: React.RefObject<HTMLElement>,
  options: KeyboardNavigationOptions = {}
): KeyboardNavigationState {
  const {
    enableArrowKeys = true,
    enableHomeEnd = true,
    enableTabNavigation = false,
    enableEscape = false,
    enableEnter = false,
    customHandlers = {},
    focusableSelector = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [role="button"]:not([disabled])',
    wrapAround = true,
    preventDefault = true,
  } = options;

  const currentIndexRef = useRef(-1);
  const elementsRef = useRef<HTMLElement[]>([]);

  // Update focusable elements
  const updateElements = useCallback(() => {
    if (!containerRef.current) return;

    const elements = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(focusableSelector)
    ).filter((el) => {
      // Filter out hidden elements
      const style = window.getComputedStyle(el);
      return style.display !== "none" && style.visibility !== "hidden";
    });

    elementsRef.current = elements;
  }, [containerRef, focusableSelector]);

  // Focus element at specific index
  const focusElement = useCallback(
    (index: number) => {
      updateElements();
      const elements = elementsRef.current;

      if (elements.length === 0) return;

      let targetIndex = index;

      if (wrapAround) {
        if (targetIndex < 0) targetIndex = elements.length - 1;
        if (targetIndex >= elements.length) targetIndex = 0;
      } else {
        targetIndex = Math.max(0, Math.min(targetIndex, elements.length - 1));
      }

      currentIndexRef.current = targetIndex;
      elements[targetIndex]?.focus();
    },
    [updateElements, wrapAround]
  );

  // Navigation functions
  const focusNext = useCallback(() => {
    focusElement(currentIndexRef.current + 1);
  }, [focusElement]);

  const focusPrevious = useCallback(() => {
    focusElement(currentIndexRef.current - 1);
  }, [focusElement]);

  const focusFirst = useCallback(() => {
    focusElement(0);
  }, [focusElement]);

  const focusLast = useCallback(() => {
    updateElements();
    focusElement(elementsRef.current.length - 1);
  }, [focusElement, updateElements]);

  const reset = useCallback(() => {
    currentIndexRef.current = -1;
  }, []);

  // Keyboard event handler
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const { key, ctrlKey, metaKey, altKey, shiftKey } = event;

      // Handle custom key combinations
      const keyCombo = [
        ctrlKey && "Ctrl",
        metaKey && "Meta",
        altKey && "Alt",
        shiftKey && "Shift",
        key,
      ]
        .filter(Boolean)
        .join("+");

      // Also try lowercase version for letter keys
      const keyComboLower = [
        ctrlKey && "Ctrl",
        metaKey && "Meta",
        altKey && "Alt",
        shiftKey && "Shift",
        key.toLowerCase(),
      ]
        .filter(Boolean)
        .join("+");

      if (customHandlers[keyCombo]) {
        customHandlers[keyCombo](event);
        if (preventDefault) event.preventDefault();
        return;
      }

      // Try lowercase version if original didn't match
      if (keyCombo !== keyComboLower && customHandlers[keyComboLower]) {
        customHandlers[keyComboLower](event);
        if (preventDefault) event.preventDefault();
        return;
      }

      // Debug: log unhandled key combinations (only in development) - disabled to reduce console noise
      if (
        false &&
        process.env.NODE_ENV === "development" &&
        (ctrlKey || altKey || metaKey) &&
        Object.keys(customHandlers).length > 0
      ) {
        console.log(
          "Unhandled local keyboard shortcut:",
          keyCombo,
          "Available shortcuts:",
          Object.keys(customHandlers)
        );
      }

      // Handle standard navigation keys
      switch (key) {
        case "ArrowDown":
        case "ArrowRight":
          if (enableArrowKeys) {
            focusNext();
            if (preventDefault) event.preventDefault();
          }
          break;

        case "ArrowUp":
        case "ArrowLeft":
          if (enableArrowKeys) {
            focusPrevious();
            if (preventDefault) event.preventDefault();
          }
          break;

        case "Home":
          if (enableHomeEnd) {
            focusFirst();
            if (preventDefault) event.preventDefault();
          }
          break;

        case "End":
          if (enableHomeEnd) {
            focusLast();
            if (preventDefault) event.preventDefault();
          }
          break;

        case "Tab":
          if (enableTabNavigation) {
            if (shiftKey) {
              focusPrevious();
            } else {
              focusNext();
            }
            if (preventDefault) event.preventDefault();
          }
          break;

        case "Escape":
          if (enableEscape && customHandlers["Escape"]) {
            customHandlers["Escape"](event);
            if (preventDefault) event.preventDefault();
          }
          break;

        case "Enter":
        case " ":
          if (enableEnter && customHandlers["Enter"]) {
            customHandlers["Enter"](event);
            if (preventDefault) event.preventDefault();
          }
          break;
      }
    },
    [
      enableArrowKeys,
      enableHomeEnd,
      enableTabNavigation,
      enableEscape,
      enableEnter,
      customHandlers,
      preventDefault,
      focusNext,
      focusPrevious,
      focusFirst,
      focusLast,
    ]
  );

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    updateElements();
    container.addEventListener("keydown", handleKeyDown);

    // Update elements when DOM changes
    const observer = new MutationObserver(updateElements);
    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["disabled", "tabindex", "hidden"],
    });

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
      observer.disconnect();
    };
  }, [containerRef, handleKeyDown, updateElements]);

  // Track current focus to update index
  useEffect(() => {
    const handleFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      const index = elementsRef.current.indexOf(target);
      if (index !== -1) {
        currentIndexRef.current = index;
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("focusin", handleFocus);
      return () => container.removeEventListener("focusin", handleFocus);
    }
  }, [containerRef]);

  return {
    currentIndex: currentIndexRef.current,
    elements: elementsRef.current,
    focusElement,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    reset,
  };
}

/**
 * Hook for global keyboard shortcuts
 */
export function useGlobalKeyboardShortcuts(
  shortcuts: Record<string, () => void>
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, ctrlKey, metaKey, altKey, shiftKey } = event;

      // Create key combination string
      const keyCombo = [
        ctrlKey && "Ctrl",
        metaKey && "Meta",
        altKey && "Alt",
        shiftKey && "Shift",
        key,
      ]
        .filter(Boolean)
        .join("+");

      // Also try lowercase version for letter keys
      const keyComboLower = [
        ctrlKey && "Ctrl",
        metaKey && "Meta",
        altKey && "Alt",
        shiftKey && "Shift",
        key.toLowerCase(),
      ]
        .filter(Boolean)
        .join("+");

      if (shortcuts[keyCombo]) {
        event.preventDefault();
        shortcuts[keyCombo]();
      } else if (keyCombo !== keyComboLower && shortcuts[keyComboLower]) {
        event.preventDefault();
        shortcuts[keyComboLower]();
      } else {
        // Debug: log unhandled key combinations (only in development)
        if (
          false &&
          process.env.NODE_ENV === "development" &&
          (ctrlKey || altKey || metaKey)
        ) {
          console.log(
            "Unhandled keyboard shortcut:",
            keyCombo,
            "Available shortcuts:",
            Object.keys(shortcuts)
          );
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}

/**
 * Hook for focus management in modals and overlays
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement>,
  isActive: boolean = true
) {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus first focusable element
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
      // Restore previous focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [containerRef, isActive]);
}
