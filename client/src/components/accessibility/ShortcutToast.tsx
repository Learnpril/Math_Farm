import { useState, useEffect } from "react";
import { Keyboard } from "lucide-react";

interface ToastMessage {
  id: string;
  message: string;
  timestamp: number;
}

let toastQueue: ToastMessage[] = [];
let setToastMessages: ((messages: ToastMessage[]) => void) | null = null;

/**
 * Show a toast notification for keyboard shortcuts
 */
export function showShortcutToast(message: string) {
  const toast: ToastMessage = {
    id: Math.random().toString(36).substr(2, 9),
    message,
    timestamp: Date.now(),
  };

  toastQueue.push(toast);

  if (setToastMessages) {
    setToastMessages([...toastQueue]);
  }

  // Auto-remove after 3 seconds
  setTimeout(() => {
    toastQueue = toastQueue.filter((t) => t.id !== toast.id);
    if (setToastMessages) {
      setToastMessages([...toastQueue]);
    }
  }, 3000);
}

/**
 * Toast container component for keyboard shortcut notifications
 */
export function ShortcutToastContainer() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  useEffect(() => {
    setToastMessages = setMessages;
    setMessages([...toastQueue]);

    return () => {
      setToastMessages = null;
    };
  }, []);

  if (messages.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {messages.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg animate-in slide-in-from-right-full duration-300"
          role="status"
          aria-live="polite"
        >
          <Keyboard className="w-4 h-4" />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
