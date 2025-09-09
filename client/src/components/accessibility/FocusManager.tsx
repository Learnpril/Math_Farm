import { useEffect, useRef, useCallback } from "react";
import { announceToScreenReader } from "../../lib/accessibility";

interface FocusManagerProps {
  children: React.ReactNode;
  /** Whether focus management is active */
  isActive?: boolean;
  /** Restore focus when component unmounts */
  restoreFocus?: boolean;
  /** Focus the first element on mount */
  autoFocus?: boolean;
  /** Custom focus selector */
  focusSelector?: string;
  /** Announcement when focus is managed */
  announcement?: string;
}

/**
 * Focus management component for complex layouts and modals
 * Handles focus trapping, restoration, and announcements
 */
export function FocusManager({
  children,
  isActive = true,
  restoreFocus = true,
  autoFocus = true,
  focusSelector = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  announcement,
}: FocusManagerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(focusSelector)
    ).filter((el) => {
      const style = window.getComputedStyle(el);
      return style.display !== "none" && style.visibility !== "hidden";
    });
  }, [focusSelector]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isActive || event.key !== "Tab") return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    },
    [isActive, getFocusableElements]
  );

  useEffect(() => {
    if (!isActive) return;

    // Store previous focus
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus first element if autoFocus is enabled
    if (autoFocus) {
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }

    // Announce to screen readers
    if (announcement) {
      announceToScreenReader(announcement, "polite");
    }

    // Add event listener
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      // Restore focus
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [
    isActive,
    autoFocus,
    announcement,
    restoreFocus,
    handleKeyDown,
    getFocusableElements,
  ]);

  return (
    <div ref={containerRef} className="focus-manager">
      {children}
    </div>
  );
}

/**
 * Hook for managing focus within a specific container
 */
export function useFocusWithin(
  containerRef: React.RefObject<HTMLElement>,
  options: {
    onFocusEnter?: () => void;
    onFocusLeave?: () => void;
    restoreFocus?: boolean;
  } = {}
) {
  const { onFocusEnter, onFocusLeave, restoreFocus = false } = options;
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const hasFocusRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleFocusIn = (event: FocusEvent) => {
      if (!hasFocusRef.current) {
        hasFocusRef.current = true;
        if (restoreFocus) {
          previousFocusRef.current = event.relatedTarget as HTMLElement;
        }
        onFocusEnter?.();
      }
    };

    const handleFocusOut = (event: FocusEvent) => {
      // Check if focus is moving outside the container
      if (!container.contains(event.relatedTarget as Node)) {
        hasFocusRef.current = false;
        onFocusLeave?.();
      }
    };

    container.addEventListener("focusin", handleFocusIn);
    container.addEventListener("focusout", handleFocusOut);

    return () => {
      container.removeEventListener("focusin", handleFocusIn);
      container.removeEventListener("focusout", handleFocusOut);

      // Restore focus if needed
      if (restoreFocus && previousFocusRef.current && hasFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [containerRef, onFocusEnter, onFocusLeave, restoreFocus]);

  return {
    hasFocus: hasFocusRef.current,
    restorePreviousFocus: () => {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    },
  };
}

/**
 * Component for managing focus announcements
 */
export function FocusAnnouncer({
  message,
  priority = "polite",
}: {
  message: string;
  priority?: "polite" | "assertive";
}) {
  useEffect(() => {
    if (message) {
      announceToScreenReader(message, priority);
    }
  }, [message, priority]);

  return null;
}

/**
 * Hook for roving tabindex pattern (for grids, toolbars, etc.)
 */
export function useRovingTabIndex(
  containerRef: React.RefObject<HTMLElement>,
  itemSelector: string = '[role="gridcell"], [role="option"], [role="tab"], button, a'
) {
  const currentIndexRef = useRef(0);

  const updateTabIndices = useCallback(() => {
    if (!containerRef.current) return;

    const items = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(itemSelector)
    );

    items.forEach((item, index) => {
      if (index === currentIndexRef.current) {
        item.setAttribute("tabindex", "0");
      } else {
        item.setAttribute("tabindex", "-1");
      }
    });
  }, [containerRef, itemSelector]);

  const focusItem = useCallback(
    (index: number) => {
      if (!containerRef.current) return;

      const items = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>(itemSelector)
      );

      if (index >= 0 && index < items.length) {
        currentIndexRef.current = index;
        updateTabIndices();
        items[index].focus();
      }
    },
    [containerRef, itemSelector, updateTabIndices]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!containerRef.current) return;

      const items = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>(itemSelector)
      );

      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          event.preventDefault();
          focusItem((currentIndexRef.current + 1) % items.length);
          break;
        case "ArrowLeft":
        case "ArrowUp":
          event.preventDefault();
          focusItem(
            currentIndexRef.current === 0
              ? items.length - 1
              : currentIndexRef.current - 1
          );
          break;
        case "Home":
          event.preventDefault();
          focusItem(0);
          break;
        case "End":
          event.preventDefault();
          focusItem(items.length - 1);
          break;
      }
    },
    [containerRef, itemSelector, focusItem]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    updateTabIndices();
    container.addEventListener("keydown", handleKeyDown);

    // Handle focus events to update current index
    const handleFocus = (event: FocusEvent) => {
      const items = Array.from(
        container.querySelectorAll<HTMLElement>(itemSelector)
      );
      const index = items.indexOf(event.target as HTMLElement);
      if (index !== -1) {
        currentIndexRef.current = index;
        updateTabIndices();
      }
    };

    container.addEventListener("focusin", handleFocus);

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
      container.removeEventListener("focusin", handleFocus);
    };
  }, [containerRef, itemSelector, handleKeyDown, updateTabIndices]);

  return {
    focusItem,
    currentIndex: currentIndexRef.current,
  };
}
