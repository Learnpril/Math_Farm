import { useEffect, useRef, useState } from "react";
import { announceToScreenReader } from "../../lib/accessibility";

interface AnnouncementProps {
  message: string;
  priority?: "polite" | "assertive";
  delay?: number;
  clearAfter?: number;
}

/**
 * Component for making announcements to screen readers
 */
export function ScreenReaderAnnouncement({
  message,
  priority = "polite",
  delay = 0,
  clearAfter = 1000,
}: AnnouncementProps) {
  useEffect(() => {
    if (!message) return;

    const timeoutId = setTimeout(() => {
      announceToScreenReader(message, priority);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [message, priority, delay]);

  return null;
}

/**
 * Hook for managing screen reader announcements
 */
export function useScreenReaderAnnouncements() {
  const [announcements, setAnnouncements] = useState<
    Array<{
      id: string;
      message: string;
      priority: "polite" | "assertive";
      timestamp: number;
    }>
  >([]);

  const announce = (
    message: string,
    priority: "polite" | "assertive" = "polite"
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const announcement = {
      id,
      message,
      priority,
      timestamp: Date.now(),
    };

    setAnnouncements((prev) => [...prev, announcement]);
    announceToScreenReader(message, priority);

    // Clean up after 5 seconds
    setTimeout(() => {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    }, 5000);
  };

  const clear = () => {
    setAnnouncements([]);
  };

  return {
    announce,
    clear,
    announcements,
  };
}

/**
 * Live region component for dynamic content updates
 */
export function LiveRegion({
  children,
  priority = "polite",
  atomic = false,
  relevant = "additions text",
  className = "",
}: {
  children: React.ReactNode;
  priority?: "polite" | "assertive" | "off";
  atomic?: boolean;
  relevant?: string;
  className?: string;
}) {
  return (
    <div
      aria-live={priority}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className={`sr-only ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Status announcer for form validation and interactions
 */
export function StatusAnnouncer({
  status,
  success,
  error,
  loading,
  className = "",
}: {
  status?: string;
  success?: string;
  error?: string;
  loading?: string;
  className?: string;
}) {
  const currentMessage = error || success || loading || status;
  const priority = error ? "assertive" : "polite";

  return (
    <LiveRegion priority={priority} atomic={true} className={className}>
      {currentMessage}
    </LiveRegion>
  );
}

/**
 * Progress announcer for long-running operations
 */
export function ProgressAnnouncer({
  progress,
  total,
  label = "Progress",
  announceEvery = 10,
  className = "",
}: {
  progress: number;
  total: number;
  label?: string;
  announceEvery?: number;
  className?: string;
}) {
  const percentage = Math.round((progress / total) * 100);
  const shouldAnnounce = percentage % announceEvery === 0;

  const message = shouldAnnounce
    ? `${label}: ${percentage}% complete. ${progress} of ${total} items.`
    : "";

  return (
    <LiveRegion priority="polite" className={className}>
      {message}
    </LiveRegion>
  );
}

/**
 * Navigation announcer for route changes
 */
export function NavigationAnnouncer({
  currentPage,
  previousPage,
  className = "",
}: {
  currentPage: string;
  previousPage?: string;
  className?: string;
}) {
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    if (currentPage && currentPage !== previousPage) {
      const message = `Navigated to ${currentPage}`;
      setAnnouncement(message);

      // Clear announcement after it's been read
      const timer = setTimeout(() => setAnnouncement(""), 1000);
      return () => clearTimeout(timer);
    }
  }, [currentPage, previousPage]);

  return (
    <LiveRegion priority="assertive" className={className}>
      {announcement}
    </LiveRegion>
  );
}

/**
 * Interactive element announcer for dynamic UI changes
 */
export function InteractionAnnouncer({
  action,
  target,
  result,
  className = "",
}: {
  action?: string;
  target?: string;
  result?: string;
  className?: string;
}) {
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    if (action && target) {
      let message = `${action} ${target}`;
      if (result) {
        message += `. ${result}`;
      }

      setAnnouncement(message);

      // Clear after announcement
      const timer = setTimeout(() => setAnnouncement(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [action, target, result]);

  return (
    <LiveRegion priority="polite" atomic={true} className={className}>
      {announcement}
    </LiveRegion>
  );
}

/**
 * Math content announcer with enhanced descriptions
 */
export function MathContentAnnouncer({
  expression,
  description,
  context,
  className = "",
}: {
  expression: string;
  description?: string;
  context?: string;
  className?: string;
}) {
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    if (expression) {
      let message = description || `Mathematical expression: ${expression}`;
      if (context) {
        message = `${context}. ${message}`;
      }

      setAnnouncement(message);

      // Clear after announcement
      const timer = setTimeout(() => setAnnouncement(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [expression, description, context]);

  return (
    <LiveRegion priority="polite" className={className}>
      {announcement}
    </LiveRegion>
  );
}

/**
 * Comprehensive announcer for practice problems
 */
export function PracticeAnnouncer({
  problemNumber,
  totalProblems,
  isCorrect,
  attempts,
  hint,
  solution,
  className = "",
}: {
  problemNumber?: number;
  totalProblems?: number;
  isCorrect?: boolean;
  attempts?: number;
  hint?: string;
  solution?: string;
  className?: string;
}) {
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    let message = "";

    if (problemNumber && totalProblems) {
      message = `Problem ${problemNumber} of ${totalProblems}`;
    }

    if (isCorrect !== undefined) {
      const result = isCorrect ? "Correct!" : "Incorrect.";
      message += message ? `. ${result}` : result;

      if (attempts && attempts > 1) {
        message += ` Solved in ${attempts} attempts.`;
      }
    }

    if (hint) {
      message += message ? `. Hint: ${hint}` : `Hint: ${hint}`;
    }

    if (solution) {
      message += message ? `. Solution: ${solution}` : `Solution: ${solution}`;
    }

    if (message) {
      setAnnouncement(message);

      // Clear after announcement
      const timer = setTimeout(() => setAnnouncement(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [problemNumber, totalProblems, isCorrect, attempts, hint, solution]);

  return (
    <LiveRegion
      priority={isCorrect !== undefined ? "assertive" : "polite"}
      className={className}
    >
      {announcement}
    </LiveRegion>
  );
}

/**
 * Gamification announcer for badges, streaks, and achievements
 */
export function GamificationAnnouncer({
  badge,
  streak,
  achievement,
  points,
  className = "",
}: {
  badge?: string;
  streak?: number;
  achievement?: string;
  points?: number;
  className?: string;
}) {
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    let message = "";

    if (badge) {
      message = `Badge earned: ${badge}!`;
    }

    if (streak) {
      message += message ? ` ${streak} day streak!` : `${streak} day streak!`;
    }

    if (achievement) {
      message += message
        ? ` Achievement unlocked: ${achievement}`
        : `Achievement unlocked: ${achievement}`;
    }

    if (points) {
      message += message
        ? ` ${points} points earned.`
        : `${points} points earned.`;
    }

    if (message) {
      setAnnouncement(message);

      // Clear after announcement
      const timer = setTimeout(() => setAnnouncement(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [badge, streak, achievement, points]);

  return (
    <LiveRegion priority="assertive" className={className}>
      {announcement}
    </LiveRegion>
  );
}
