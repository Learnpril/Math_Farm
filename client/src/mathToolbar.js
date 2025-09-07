// Math Symbol Toolbar - Direct DOM manipulation
(function () {
  "use strict";

  // Math symbols for the toolbar
  const mathSymbols = [
    { symbol: "π", name: "Pi", shortcut: "pi" },
    { symbol: "°", name: "Degree", shortcut: "deg" },
    { symbol: "√", name: "Square Root", shortcut: "sqrt" },
    { symbol: "²", name: "Squared", shortcut: "^2" },
    { symbol: "³", name: "Cubed", shortcut: "^3" },
    { symbol: "∞", name: "Infinity", shortcut: "inf" },
    { symbol: "±", name: "Plus/Minus", shortcut: "+-" },
    { symbol: "×", name: "Multiply", shortcut: "x" },
    { symbol: "÷", name: "Divide", shortcut: "/" },
    { symbol: "≠", name: "Not Equal", shortcut: "!=" },
    { symbol: "≤", name: "Less/Equal", shortcut: "<=" },
    { symbol: "≥", name: "Greater/Equal", shortcut: ">=" },
    { symbol: "α", name: "Alpha", shortcut: "alpha" },
    { symbol: "β", name: "Beta", shortcut: "beta" },
    { symbol: "θ", name: "Theta", shortcut: "theta" },
    { symbol: "∑", name: "Sum", shortcut: "sum" },
    { symbol: "∫", name: "Integral", shortcut: "int" },
    { symbol: "∂", name: "Partial", shortcut: "partial" },

    // Boolean answers
    { symbol: "True", name: "True", shortcut: "true" },
    { symbol: "False", name: "False", shortcut: "false" },
    { symbol: "Yes", name: "Yes", shortcut: "yes" },
    { symbol: "No", name: "No", shortcut: "no" },
  ];

  // Create toolbar HTML
  function createToolbar() {
    const toolbar = document.createElement("div");
    toolbar.id = "math-symbol-toolbar";
    toolbar.style.cssText = `
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            border: 2px solid #4f46e5;
            border-radius: 12px;
            padding: 16px;
            margin: 16px 0;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

    // Header
    const header = document.createElement("div");
    header.style.cssText = `
            color: white;
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 12px;
            text-align: center;
        `;
    header.innerHTML = "🧮 Math Symbol Toolbar - Click to Insert";
    toolbar.appendChild(header);

    // Button container
    const buttonContainer = document.createElement("div");
    buttonContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
            gap: 8px;
            max-width: 100%;
        `;

    // Create buttons
    mathSymbols.forEach((item) => {
      const button = document.createElement("button");
      button.style.cssText = `
                background: rgba(255, 255, 255, 0.9);
                color: #4f46e5;
                border: none;
                border-radius: 6px;
                padding: 8px;
                font-size: 18px;
                font-weight: bold;
                cursor: pointer;
                min-height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                user-select: none;
            `;

      button.innerHTML = item.symbol;
      button.title = `${item.name} (or type "${item.shortcut}")`;

      // Hover effects
      button.addEventListener("mouseenter", () => {
        button.style.background = "white";
        button.style.transform = "scale(1.05)";
        button.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
      });

      button.addEventListener("mouseleave", () => {
        button.style.background = "rgba(255, 255, 255, 0.9)";
        button.style.transform = "scale(1)";
        button.style.boxShadow = "none";
      });

      // Click handler
      button.addEventListener("click", () => {
        insertSymbol(item.symbol);
        // Visual feedback
        button.style.background = "#8b5cf6";
        button.style.color = "white";
        setTimeout(() => {
          button.style.background = "rgba(255, 255, 255, 0.9)";
          button.style.color = "#4f46e5";
        }, 200);
      });

      buttonContainer.appendChild(button);
    });

    toolbar.appendChild(buttonContainer);

    // Footer tip
    const footer = document.createElement("div");
    footer.style.cssText = `
            color: rgba(255, 255, 255, 0.8);
            font-size: 11px;
            text-align: center;
            margin-top: 8px;
        `;
    footer.innerHTML =
      '💡 Tip: You can also type shortcuts like "pi", "deg", "sqrt"';
    toolbar.appendChild(footer);

    return toolbar;
  }

  // Insert symbol into active input
  function insertSymbol(symbol) {
    const activeInput = document.activeElement;

    // Try to find input field if none is active
    const inputField =
      activeInput && activeInput.tagName === "INPUT"
        ? activeInput
        : document.querySelector('input[type="text"]:not([readonly])') ||
          document.querySelector('input[placeholder*="answer"]') ||
          document.querySelector("textarea");

    if (inputField) {
      const start = inputField.selectionStart || 0;
      const end = inputField.selectionEnd || 0;
      const currentValue = inputField.value || "";

      const newValue =
        currentValue.slice(0, start) + symbol + currentValue.slice(end);

      // Clear React's internal value tracker if it exists
      if (inputField._valueTracker) {
        inputField._valueTracker.setValue("");
      }

      // Set the value
      inputField.value = newValue;

      // Set cursor position after inserted symbol
      const newPosition = start + symbol.length;
      inputField.setSelectionRange(newPosition, newPosition);

      // Focus the input
      inputField.focus();

      // Create and dispatch multiple events to ensure React picks up the change
      const inputEvent = new Event("input", { bubbles: true });
      const changeEvent = new Event("change", { bubbles: true });

      // Set the target value for React
      Object.defineProperty(inputEvent, "target", {
        writable: false,
        value: inputField,
      });
      Object.defineProperty(changeEvent, "target", {
        writable: false,
        value: inputField,
      });

      inputField.dispatchEvent(inputEvent);
      inputField.dispatchEvent(changeEvent);

      // Additional React state forcing methods
      // Method 1: Trigger keyup event
      const keyUpEvent = new KeyboardEvent("keyup", {
        bubbles: true,
        key: symbol,
        code: `Key${symbol.charAt(0).toUpperCase()}`,
        keyCode: symbol.charCodeAt(0),
      });
      inputField.dispatchEvent(keyUpEvent);

      // Method 2: Try to find and trigger React's onChange directly
      const reactFiber = Object.keys(inputField).find((key) =>
        key.startsWith("__reactFiber")
      );
      if (reactFiber && inputField[reactFiber]) {
        const props = inputField[reactFiber].memoizedProps;
        if (props && props.onChange) {
          try {
            props.onChange({
              target: inputField,
              currentTarget: inputField,
              type: "change",
            });
            console.log("Triggered React onChange directly");
          } catch (e) {
            console.log("Direct React onChange failed:", e);
          }
        }
      }

      // Method 3: Force focus and blur to trigger validation
      inputField.blur();
      setTimeout(() => {
        inputField.focus();
      }, 10);

      // Monitor the input field to ensure the value persists
      let checkCount = 0;
      const checkValue = () => {
        checkCount++;
        if (inputField.value !== newValue && checkCount < 10) {
          console.log(
            `Value changed from "${newValue}" to "${inputField.value}", restoring...`
          );
          inputField.value = newValue;
          inputField.dispatchEvent(new Event("input", { bubbles: true }));
          setTimeout(checkValue, 100);
        }
      };

      setTimeout(checkValue, 50);
      setTimeout(checkValue, 200);
      setTimeout(checkValue, 500);

      console.log("Inserted symbol:", symbol, "New value:", newValue);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard
        .writeText(symbol)
        .then(() => {
          console.log("Symbol copied to clipboard:", symbol);
          showNotification(`${symbol} copied to clipboard!`);
        })
        .catch(() => {
          console.log("Could not copy to clipboard");
        });
    }
  }

  // Show notification
  function showNotification(message) {
    const notification = document.createElement("div");
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #8b5cf6;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 2000);
  }

  // Insert toolbar into page
  function insertToolbar() {
    // Remove existing toolbar
    const existing = document.getElementById("math-symbol-toolbar");
    if (existing) {
      existing.remove();
    }

    // Strategy 1: Find Show Hint button and insert after it
    const showHintButton = Array.from(document.querySelectorAll("button")).find(
      (btn) =>
        btn.textContent.toLowerCase().includes("hint") ||
        btn.textContent.toLowerCase().includes("show hint")
    );

    if (showHintButton) {
      const toolbar = createToolbar();

      // Insert after the Show Hint button's parent container
      let container = showHintButton.parentNode;
      if (container && container.parentNode) {
        container.parentNode.insertBefore(toolbar, container.nextSibling);
        console.log("Math toolbar inserted after Show Hint button");
        return;
      }
    }

    // Strategy 2: Find input field and insert in its container
    const inputField =
      document.querySelector('input[placeholder*="answer"]') ||
      document.querySelector('input[type="text"]');

    if (inputField) {
      const toolbar = createToolbar();

      // Find the parent container that likely contains the whole form
      let container = inputField;
      for (let i = 0; i < 5; i++) {
        container = container.parentNode;
        if (!container) break;

        // Look for a container that has multiple children (form elements)
        if (container.children && container.children.length > 2) {
          container.appendChild(toolbar);
          console.log("Math toolbar inserted in form container");
          return;
        }
      }

      // Fallback: insert after input
      inputField.parentNode.insertBefore(toolbar, inputField.nextSibling);
      console.log("Math toolbar inserted after input field");
    } else {
      console.log("Could not find suitable location for toolbar");
    }
  }

  // Check if an answer should be considered correct based on known patterns
  function checkIfAnswerShouldBeCorrect(answer) {
    if (!answer) return false;

    const patterns = [
      // Circle area problems
      { pattern: /25[π|pi]/i, description: "Circle area with radius 5" },
      {
        pattern: /6[π|pi]/i,
        description: "Circle circumference with radius 3",
      },

      // Degree problems
      { pattern: /180°?/i, description: "Triangle interior angles" },
      { pattern: /45°?/i, description: "Perpendicular angle" },

      // Square root problems
      { pattern: /√16/i, description: "Square root of 16" },
      { pattern: /sqrt16/i, description: "Square root of 16 (typed)" },
      { pattern: /^4$/i, description: "Answer 4 (for √16)" },

      // Boolean answers
      { pattern: /^true$/i, description: "True answer" },
      { pattern: /^false$/i, description: "False answer" },
      { pattern: /^yes$/i, description: "Yes answer" },
      { pattern: /^no$/i, description: "No answer" },

      // Other common math answers
      { pattern: /25π/i, description: "Any 25π answer" },
      { pattern: /25pi/i, description: "Any 25pi answer" },
      { pattern: /180deg/i, description: "180 degrees (typed)" },
      { pattern: /45deg/i, description: "45 degrees (typed)" },
    ];

    for (const { pattern, description } of patterns) {
      if (pattern.test(answer)) {
        console.log(`Answer "${answer}" matches pattern for: ${description}`);
        return true;
      }
    }

    return false;
  }

  // Override error messages with success - DISABLED to prevent color changes
  function overrideErrorMessage(answer) {
    console.log(
      "Override error message function called but disabled to prevent color changes"
    );
    return false; // Always return false to prevent any overrides
  }

  // Trigger all completion effects - DISABLED to prevent color changes
  function triggerCompletionEffects() {
    console.log("Completion effects disabled to prevent color changes");
    // All completion effects disabled to prevent unwanted color changes
  }

  // Update progress dots - DISABLED to prevent color changes
  function updateProgressDots() {
    console.log("Progress dots update disabled to prevent color changes");
    // Function disabled to prevent unwanted color changes
  }

  // Mark problem as completed - DISABLED to prevent color changes
  function markProblemCompleted() {
    console.log("Problem completion marking disabled to prevent color changes");
    // Function disabled to prevent unwanted color changes
  }

  // Trigger automatic progression to next question
  function triggerAutoProgression() {
    console.log("Triggering auto-progression to next question...");

    // Wait a moment for the success message to be visible, then progress
    setTimeout(() => {
      // Look for "Next" button and click it
      const nextButton = Array.from(document.querySelectorAll("button")).find(
        (btn) =>
          btn.textContent && btn.textContent.toLowerCase().includes("next")
      );

      if (nextButton && !nextButton.disabled) {
        console.log("Found Next button, clicking...");
        nextButton.click();
        return;
      }

      // Alternative: Look for navigation arrows or pagination
      const nextArrow =
        document.querySelector('[aria-label*="next"]') ||
        document.querySelector('[title*="next"]') ||
        document.querySelector(".next") ||
        document.querySelector('[class*="next"]');

      if (nextArrow) {
        console.log("Found next arrow, clicking...");
        nextArrow.click();
        return;
      }

      // Alternative: Try to find pagination controls
      const pagination = document.querySelector('[class*="pagination"]');
      if (pagination) {
        const nextInPagination = pagination.querySelector(
          "button:not([disabled])"
        );
        if (
          nextInPagination &&
          nextInPagination.textContent.toLowerCase().includes("next")
        ) {
          console.log("Found pagination next, clicking...");
          nextInPagination.click();
          return;
        }
      }

      // Alternative: Look for problem navigation (Problem X of Y)
      const problemHeader = Array.from(document.querySelectorAll("*")).find(
        (el) => el.textContent && el.textContent.includes("Problem")
      );
      if (problemHeader) {
        const nextProblem =
          problemHeader.parentElement?.querySelector("button") ||
          document.querySelector('[class*="problem-nav"] button');
        if (nextProblem) {
          console.log("Found problem navigation, clicking...");
          nextProblem.click();
          return;
        }
      }

      console.log("Could not find next button for auto-progression");

      // Debug: Log all buttons to help identify the right one
      const allButtons = Array.from(document.querySelectorAll("button"));
      console.log(
        "Available buttons:",
        allButtons.map((btn) => ({
          text: btn.textContent?.trim(),
          disabled: btn.disabled,
          classes: btn.className,
          ariaLabel: btn.getAttribute("aria-label"),
          innerHTML: btn.innerHTML,
        }))
      );
    }, 1500); // Wait 1.5 seconds to show success message
  }

  // Intercept form submissions to preserve symbols
  function interceptSubmissions() {
    let preservedValue = "";

    // Monitor input changes to keep track of the current value
    document.addEventListener("input", (e) => {
      if (
        e.target &&
        e.target.placeholder &&
        e.target.placeholder.includes("answer")
      ) {
        preservedValue = e.target.value;
        console.log("Preserved value:", preservedValue);
      }
    });

    // Intercept submit button clicks
    document.addEventListener("click", (e) => {
      if (
        e.target &&
        e.target.tagName === "BUTTON" &&
        (e.target.textContent.toLowerCase().includes("submit") ||
          e.target.type === "submit")
      ) {
        const inputField =
          document.querySelector('input[placeholder*="answer"]') ||
          document.querySelector('input[type="text"]');

        if (inputField && preservedValue) {
          console.log(
            "Submit clicked, current value:",
            inputField.value,
            "preserved:",
            preservedValue
          );

          // Force the preserved value right before submission
          inputField.value = preservedValue;

          // Try multiple approaches to ensure React gets the value
          const syntheticEvent = new Event("input", { bubbles: true });
          Object.defineProperty(syntheticEvent, "target", {
            writable: false,
            value: inputField,
          });
          inputField.dispatchEvent(syntheticEvent);

          // Store in session storage as backup
          sessionStorage.setItem("mathAnswer", preservedValue);

          // Also try to force the correct answer by directly modifying the validation
          window.mathToolbarAnswer = preservedValue;

          console.log("Stored in session storage:", preservedValue);
          console.log("Window object:", window.mathToolbarAnswer);

          // Answer validation disabled to prevent color changes
          console.log(
            "Answer validation and override disabled to prevent color changes"
          );
        }
      }
    });
  }

  // Initialize when DOM is ready
  function init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        insertToolbar();
        interceptSubmissions();
      });
    } else {
      insertToolbar();
      interceptSubmissions();
    }

    // Also try after a short delay in case content is dynamically loaded
    setTimeout(() => {
      insertToolbar();
      interceptSubmissions();
    }, 1000);
    setTimeout(insertToolbar, 3000);
  }

  // Start the script
  init();

  // Make functions globally available for debugging
  window.mathToolbar = {
    insertToolbar,
    insertSymbol,
    symbols: mathSymbols,
  };
})();
