import React, { useState, useEffect } from "react";
import {
  Settings,
  Eye,
  EyeOff,
  Contrast,
  Volume2,
  VolumeX,
} from "lucide-react";
import { HighContrastManager } from "../../lib/accessibility";

interface AccessibilitySettingsProps {
  className?: string;
}

/**
 * Accessibility settings component for user preferences
 * Provides controls for high contrast, reduced motion, and other accessibility features
 */
export function AccessibilitySettings({
  className = "",
}: AccessibilitySettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [fontSize, setFontSize] = useState("medium");

  const highContrastManager = HighContrastManager.getInstance();

  useEffect(() => {
    // Initialize settings from localStorage and system preferences
    setHighContrast(highContrastManager.getHighContrast());

    const savedReducedMotion = localStorage.getItem("reduced-motion");
    const systemReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    setReducedMotion(
      savedReducedMotion ? savedReducedMotion === "true" : systemReducedMotion
    );

    const savedSoundEnabled = localStorage.getItem("sound-enabled");
    setSoundEnabled(savedSoundEnabled ? savedSoundEnabled === "true" : true);

    const savedFontSize = localStorage.getItem("font-size");
    setFontSize(savedFontSize || "medium");

    // Listen for high contrast changes
    const unsubscribe =
      highContrastManager.onHighContrastChange(setHighContrast);

    return unsubscribe;
  }, [highContrastManager]);

  const toggleHighContrast = () => {
    highContrastManager.toggleHighContrast();
  };

  const toggleReducedMotion = () => {
    const newValue = !reducedMotion;
    setReducedMotion(newValue);
    localStorage.setItem("reduced-motion", newValue.toString());

    // Apply reduced motion class to document
    if (newValue) {
      document.documentElement.classList.add("reduce-motion");
    } else {
      document.documentElement.classList.remove("reduce-motion");
    }
  };

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem("sound-enabled", newValue.toString());

    // Dispatch custom event for other components to listen to
    window.dispatchEvent(
      new CustomEvent("soundToggle", { detail: { enabled: newValue } })
    );
  };

  const changeFontSize = (size: string) => {
    setFontSize(size);
    localStorage.setItem("font-size", size);

    // Apply font size class to document
    document.documentElement.classList.remove(
      "font-small",
      "font-medium",
      "font-large",
      "font-extra-large"
    );
    document.documentElement.classList.add(`font-${size}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Accessibility settings"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Settings className="h-5 w-5" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          className="absolute top-full right-0 mt-2 w-80 bg-background border border-border rounded-md shadow-lg z-50 p-4"
          role="dialog"
          aria-label="Accessibility Settings"
          onKeyDown={handleKeyDown}
        >
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            Accessibility Settings
          </h3>

          <div className="space-y-4">
            {/* High Contrast Toggle */}
            <div className="flex items-center justify-between">
              <label
                htmlFor="high-contrast"
                className="flex items-center space-x-2 text-sm font-medium text-foreground"
              >
                <Contrast className="h-4 w-4" aria-hidden="true" />
                <span>High Contrast</span>
              </label>
              <button
                id="high-contrast"
                type="button"
                onClick={toggleHighContrast}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  highContrast ? "bg-primary" : "bg-muted"
                }`}
                role="switch"
                aria-checked={highContrast}
                aria-label="Toggle high contrast mode"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                    highContrast ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Reduced Motion Toggle */}
            <div className="flex items-center justify-between">
              <label
                htmlFor="reduced-motion"
                className="flex items-center space-x-2 text-sm font-medium text-foreground"
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
                <span>Reduce Motion</span>
              </label>
              <button
                id="reduced-motion"
                type="button"
                onClick={toggleReducedMotion}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  reducedMotion ? "bg-primary" : "bg-muted"
                }`}
                role="switch"
                aria-checked={reducedMotion}
                aria-label="Toggle reduced motion"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                    reducedMotion ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between">
              <label
                htmlFor="sound-enabled"
                className="flex items-center space-x-2 text-sm font-medium text-foreground"
              >
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <VolumeX className="h-4 w-4" aria-hidden="true" />
                )}
                <span>Sound Effects</span>
              </label>
              <button
                id="sound-enabled"
                type="button"
                onClick={toggleSound}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  soundEnabled ? "bg-primary" : "bg-muted"
                }`}
                role="switch"
                aria-checked={soundEnabled}
                aria-label="Toggle sound effects"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                    soundEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Font Size Selector */}
            <div>
              <label
                htmlFor="font-size"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Font Size
              </label>
              <select
                id="font-size"
                value={fontSize}
                onChange={(e) => changeFontSize(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Select font size"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="extra-large">Extra Large</option>
              </select>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Close Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact accessibility toggle for quick access
 */
export function AccessibilityToggle({
  className = "",
}: {
  className?: string;
}) {
  const [highContrast, setHighContrast] = useState(false);
  const highContrastManager = HighContrastManager.getInstance();

  useEffect(() => {
    setHighContrast(highContrastManager.getHighContrast());
    const unsubscribe =
      highContrastManager.onHighContrastChange(setHighContrast);
    return unsubscribe;
  }, [highContrastManager]);

  const toggleHighContrast = () => {
    highContrastManager.toggleHighContrast();
  };

  return (
    <button
      type="button"
      onClick={toggleHighContrast}
      className={`inline-flex items-center justify-center rounded-md p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        highContrast
          ? "text-primary bg-primary/10 hover:bg-primary/20"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      } ${className}`}
      aria-label={
        highContrast ? "Disable high contrast" : "Enable high contrast"
      }
      title={highContrast ? "Disable high contrast" : "Enable high contrast"}
    >
      <Contrast className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
