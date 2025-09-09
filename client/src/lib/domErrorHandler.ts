// Global DOM error handler to catch and handle removeChild errors gracefully

let isHandlerInstalled = false;

export function installDOMErrorHandler() {
  if (isHandlerInstalled || typeof window === "undefined") return;

  // Override the native removeChild method to add error handling
  const originalRemoveChild = Node.prototype.removeChild;

  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    try {
      // Check if the child is actually a child of this node
      if (this.contains(child)) {
        return originalRemoveChild.call(this, child);
      } else {
        // Silently handle the case where the child is not actually a child
        console.debug(
          "Attempted to remove a node that is not a child of the parent"
        );
        return child;
      }
    } catch (error) {
      // Log the error for debugging but don't throw
      console.debug("DOM removeChild error handled:", error);
      return child;
    }
  };

  // Also handle appendChild errors
  const originalAppendChild = Node.prototype.appendChild;

  Node.prototype.appendChild = function <T extends Node>(child: T): T {
    try {
      return originalAppendChild.call(this, child);
    } catch (error) {
      console.debug("DOM appendChild error handled:", error);
      return child;
    }
  };

  isHandlerInstalled = true;
}

export function uninstallDOMErrorHandler() {
  // Note: In practice, we don't usually uninstall these handlers
  // as they're meant to be global for the entire application lifecycle
  isHandlerInstalled = false;
}
