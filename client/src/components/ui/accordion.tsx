import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

interface AccordionContextValue {
  openItems: Set<string>;
  toggleItem: (value: string) => void;
  type?: "single" | "multiple";
}

const AccordionContext = React.createContext<AccordionContextValue | null>(
  null
);
const AccordionItemContext = React.createContext<{ value: string } | null>(
  null
);

interface AccordionProps {
  type?: "single" | "multiple";
  defaultValue?: string | string[];
  className?: string;
  children: React.ReactNode;
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ type = "single", defaultValue, className, children, ...props }, ref) => {
    const [openItems, setOpenItems] = React.useState<Set<string>>(() => {
      if (defaultValue) {
        return new Set(
          Array.isArray(defaultValue) ? defaultValue : [defaultValue]
        );
      }
      return new Set();
    });

    const toggleItem = React.useCallback(
      (value: string) => {
        setOpenItems((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(value)) {
            newSet.delete(value);
          } else {
            if (type === "single") {
              newSet.clear();
            }
            newSet.add(value);
          }
          return newSet;
        });
      },
      [type]
    );

    return (
      <AccordionContext.Provider value={{ openItems, toggleItem, type }}>
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      </AccordionContext.Provider>
    );
  }
);
Accordion.displayName = "Accordion";

interface AccordionItemProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, value, children, ...props }, ref) => (
    <AccordionItemContext.Provider value={{ value }}>
      <div
        ref={ref}
        className={cn("border-b", className)}
        data-value={value}
        {...props}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  )
);
AccordionItem.displayName = "AccordionItem";

interface AccordionTriggerProps {
  className?: string;
  children: React.ReactNode;
}

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  AccordionTriggerProps
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(AccordionContext);
  const itemElement = React.useContext(AccordionItemContext);

  if (!context) {
    throw new Error("AccordionTrigger must be used within an Accordion");
  }

  if (!itemElement) {
    throw new Error("AccordionTrigger must be used within an AccordionItem");
  }

  const isOpen = context.openItems.has(itemElement.value);

  return (
    <div className="flex">
      <button
        ref={ref}
        className={cn(
          "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        onClick={() => context.toggleItem(itemElement.value)}
        aria-expanded={isOpen}
        {...props}
      >
        {children}
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
    </div>
  );
});
AccordionTrigger.displayName = "AccordionTrigger";

interface AccordionContentProps {
  className?: string;
  children: React.ReactNode;
}

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  AccordionContentProps
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(AccordionContext);
  const itemElement = React.useContext(AccordionItemContext);

  if (!context) {
    throw new Error("AccordionContent must be used within an Accordion");
  }

  if (!itemElement) {
    throw new Error("AccordionContent must be used within an AccordionItem");
  }

  const isOpen = context.openItems.has(itemElement.value);

  return (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden text-sm transition-all duration-200",
        !isOpen && "h-0 opacity-0"
      )}
      {...props}
    >
      {isOpen && <div className={cn("pb-4 pt-0", className)}>{children}</div>}
    </div>
  );
});
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
