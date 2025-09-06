// React 19 - no need to import React
import * as React from "react";
import { cn } from "../../lib/utils";

interface RadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

interface RadioGroupItemProps {
  value: string;
  id?: string;
  disabled?: boolean;
  className?: string;
}

const RadioGroupContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}>({});

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, disabled, children, ...props }, ref) => {
    return (
      <RadioGroupContext.Provider value={{ value, onValueChange, disabled }}>
        <div
          ref={ref}
          className={cn("grid gap-2", className)}
          role="radiogroup"
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  }
);
RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, id, disabled: itemDisabled, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext);
    const disabled = itemDisabled || context.disabled;
    const isChecked = context.value === value;

    const handleChange = () => {
      if (!disabled && context.onValueChange) {
        context.onValueChange(value);
      }
    };

    return (
      <div className="flex items-center">
        <input
          ref={ref}
          type="radio"
          id={id}
          value={value}
          checked={isChecked}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            "h-4 w-4 rounded-full border border-primary text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
