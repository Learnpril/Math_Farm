import { useState, useEffect } from "react";
import { Keyboard, X, HelpCircle } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { useGlobalKeyboardShortcuts } from "../../hooks/useKeyboardNavigation";
import { showShortcutToast } from "./ShortcutToast";

interface KeyboardShortcut {
  keys: string[];
  description: string;
  category: string;
  action?: () => void;
}

const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  // Navigation shortcuts
  {
    keys: ["Alt", "h"],
    description: "Go to home page",
    category: "Navigation",
    action: () => {
      showShortcutToast("Navigating to home page");
      window.location.href = "/";
    },
  },
  {
    keys: ["Alt", "t"],
    description: "Go to topics section",
    category: "Navigation",
    action: () => {
      const element = document.getElementById("topics");
      if (element) {
        showShortcutToast("Scrolling to topics section");
        element.scrollIntoView({ behavior: "smooth" });
      } else {
        showShortcutToast("Navigating to topics");
        window.location.href = "/#topics";
      }
    },
  },
  {
    keys: ["Alt", "p"],
    description: "Go to practice section",
    category: "Navigation",
    action: () => {
      const element = document.getElementById("practice");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else {
        // If not on home page, navigate there first
        window.location.href = "/#practice";
      }
    },
  },
  {
    keys: ["Alt", "a"],
    description: "Go to about section",
    category: "Navigation",
    action: () => {
      const element = document.getElementById("about");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else {
        // If not on home page, navigate there first
        window.location.href = "/#about";
      }
    },
  },
  {
    keys: ["Ctrl", "k"],
    description: "Open search (if available)",
    category: "Navigation",
  },
  {
    keys: ["Escape"],
    description: "Close modal or go back",
    category: "Navigation",
    action: () => {
      // Close any open modals or go back
      const closeButtons = document.querySelectorAll(
        '[aria-label*="close"], [data-close-modal]'
      );
      if (closeButtons.length > 0) {
        (closeButtons[0] as HTMLElement).click();
      } else {
        window.history.back();
      }
    },
  },

  // Content shortcuts
  {
    keys: ["Tab"],
    description: "Navigate to next interactive element",
    category: "Content",
  },
  {
    keys: ["Shift", "Tab"],
    description: "Navigate to previous interactive element",
    category: "Content",
  },
  {
    keys: ["Enter"],
    description: "Activate focused element",
    category: "Content",
  },
  {
    keys: ["Space"],
    description: "Activate button or scroll page",
    category: "Content",
  },
  {
    keys: ["Arrow Keys"],
    description: "Navigate within components",
    category: "Content",
  },
  {
    keys: ["Home"],
    description: "Go to first element in group",
    category: "Content",
  },
  {
    keys: ["End"],
    description: "Go to last element in group",
    category: "Content",
  },

  // Practice shortcuts
  {
    keys: ["Ctrl", "Enter"],
    description: "Submit answer in practice problems",
    category: "Practice",
  },
  {
    keys: ["Ctrl", "h"],
    description: "Show/hide hint in practice problems",
    category: "Practice",
  },
  {
    keys: ["Ctrl", "s"],
    description: "Show/hide solution in practice problems",
    category: "Practice",
  },
  {
    keys: ["Ctrl", "r"],
    description: "Reset current problem",
    category: "Practice",
  },
  {
    keys: ["Ctrl", "n"],
    description: "Go to next problem",
    category: "Practice",
  },
  {
    keys: ["Ctrl", "p"],
    description: "Go to previous problem",
    category: "Practice",
  },

  // Accessibility shortcuts
  {
    keys: ["Alt", "c"],
    description: "Toggle high contrast mode",
    category: "Accessibility",
    action: () => {
      // Find and click the high contrast toggle
      const contrastButton = document.querySelector(
        "#high-contrast"
      ) as HTMLElement;
      if (contrastButton) {
        contrastButton.click();
      }
    },
  },
  {
    keys: ["Alt", "m"],
    description: "Toggle reduced motion",
    category: "Accessibility",
    action: () => {
      // Find and click the reduced motion toggle
      const motionButton = document.querySelector(
        "#reduced-motion"
      ) as HTMLElement;
      if (motionButton) {
        motionButton.click();
      }
    },
  },
  {
    keys: ["Alt", "s"],
    description: "Toggle sound effects",
    category: "Accessibility",
    action: () => {
      // Find and click the sound toggle
      const soundButton = document.querySelector(
        "#sound-enabled"
      ) as HTMLElement;
      if (soundButton) {
        soundButton.click();
      }
    },
  },
  {
    keys: ["Ctrl", "Plus"],
    description: "Increase font size",
    category: "Accessibility",
  },
  {
    keys: ["Ctrl", "Minus"],
    description: "Decrease font size",
    category: "Accessibility",
  },
  {
    keys: ["F1"],
    description: "Show keyboard shortcuts help",
    category: "Accessibility",
  },

  // Tools shortcuts
  {
    keys: ["Alt", "l"],
    description: "Go to tools page",
    category: "Tools",
  },
  {
    keys: ["Ctrl", "d"],
    description: "Clear calculator/input",
    category: "Tools",
  },
  {
    keys: ["Ctrl", "c"],
    description: "Copy result (in tools)",
    category: "Tools",
  },
];

interface KeyboardShortcutsProps {
  className?: string;
}

/**
 * Keyboard shortcuts help component and global shortcut handler
 */
export function KeyboardShortcuts({ className = "" }: KeyboardShortcutsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Set up global keyboard shortcuts
  const shortcuts = KEYBOARD_SHORTCUTS.reduce((acc, shortcut) => {
    if (shortcut.action) {
      const keyCombo = shortcut.keys.join("+");
      acc[keyCombo] = shortcut.action;
    }
    return acc;
  }, {} as Record<string, () => void>);

  // Add help shortcut
  shortcuts["F1"] = () => setIsOpen(true);
  shortcuts["?"] = () => setIsOpen(true);

  useGlobalKeyboardShortcuts(shortcuts);

  // Filter shortcuts based on search
  const filteredShortcuts = KEYBOARD_SHORTCUTS.filter(
    (shortcut) =>
      shortcut.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shortcut.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shortcut.keys.some((key) =>
        key.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // Group shortcuts by category
  const groupedShortcuts = filteredShortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  const formatKeys = (keys: string[]) => {
    return keys.map((key, index) => (
      <span key={index} className="inline-flex items-center">
        <Badge variant="outline" className="text-xs font-mono px-2 py-1">
          {key}
        </Badge>
        {index < keys.length - 1 && (
          <span className="mx-1 text-muted-foreground">+</span>
        )}
      </span>
    ));
  };

  return (
    <div className={className}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            aria-label="Show keyboard shortcuts"
          >
            <Keyboard className="w-4 h-4" />
            <span className="hidden sm:inline">Shortcuts</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search shortcuts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label="Search keyboard shortcuts"
              />
            </div>

            {/* Shortcuts list */}
            <div className="flex-1 overflow-y-auto space-y-6">
              {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-foreground mb-3 sticky top-0 bg-background/95 backdrop-blur-sm py-1">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {shortcuts.map((shortcut, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {shortcut.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                          {formatKeys(shortcut.keys)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-primary mb-1">Tips:</p>
                  <ul className="text-primary/80 space-y-1">
                    <li>
                      • Press{" "}
                      <Badge variant="outline" className="text-xs">
                        F1
                      </Badge>{" "}
                      or{" "}
                      <Badge variant="outline" className="text-xs">
                        ?
                      </Badge>{" "}
                      anytime to open this help
                    </li>
                    <li>
                      • Use{" "}
                      <Badge variant="outline" className="text-xs">
                        Tab
                      </Badge>{" "}
                      to navigate between interactive elements
                    </li>
                    <li>
                      • Press{" "}
                      <Badge variant="outline" className="text-xs">
                        Escape
                      </Badge>{" "}
                      to close dialogs or go back
                    </li>
                    <li>
                      • Arrow keys work within most components for navigation
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Floating keyboard shortcut hint
 */
export function KeyboardShortcutHint({
  keys,
  description,
  className = "",
}: {
  keys: string[];
  description: string;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 text-xs text-muted-foreground ${className}`}
    >
      <span>{description}:</span>
      <div className="flex items-center gap-1">
        {keys.map((key, index) => (
          <span key={index} className="inline-flex items-center">
            <Badge variant="outline" className="text-xs font-mono px-1 py-0.5">
              {key}
            </Badge>
            {index < keys.length - 1 && <span className="mx-0.5">+</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Hook to announce keyboard shortcuts to screen readers
 */
export function useKeyboardShortcutAnnouncement() {
  useEffect(() => {
    const announceShortcut = (event: KeyboardEvent) => {
      // Only announce on specific key combinations
      if (
        event.key === "F1" ||
        (event.key === "?" && !event.ctrlKey && !event.metaKey)
      ) {
        const announcement = document.createElement("div");
        announcement.setAttribute("aria-live", "polite");
        announcement.setAttribute("aria-atomic", "true");
        announcement.className = "sr-only";
        announcement.textContent =
          "Keyboard shortcuts help opened. Use Tab to navigate through available shortcuts.";

        document.body.appendChild(announcement);

        setTimeout(() => {
          try {
            if (announcement.parentNode === document.body) {
              document.body.removeChild(announcement);
            }
          } catch (error) {
            console.debug("Announcement element already removed:", error);
          }
        }, 1000);
      }
    };

    document.addEventListener("keydown", announceShortcut);
    return () => document.removeEventListener("keydown", announceShortcut);
  }, []);
}
