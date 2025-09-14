/**
 * Scroll Area Component
 * Math Farm - Custom scrollable area component
 */

import * as React from 'react';
import { cn } from '../../lib/utils';

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  orientation?: 'vertical' | 'horizontal' | 'both';
  scrollHideDelay?: number;
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, orientation = 'vertical', ...props }, ref) => {
    const [isScrolling, setIsScrolling] = React.useState(false);
    const scrollTimeoutRef = React.useRef<NodeJS.Timeout>();

    const handleScroll = React.useCallback(() => {
      setIsScrolling(true);

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 1000);
    }, []);

    React.useEffect(() => {
      return () => {
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }, []);

    const getScrollbarClasses = () => {
      const baseClasses = 'scrollbar-thin scrollbar-track-transparent';

      if (orientation === 'horizontal') {
        return `${baseClasses} overflow-x-auto overflow-y-hidden scrollbar-horizontal`;
      } else if (orientation === 'both') {
        return `${baseClasses} overflow-auto`;
      }

      return `${baseClasses} overflow-y-auto overflow-x-hidden`;
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative',
          getScrollbarClasses(),
          'scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40',
          'scrollbar-track-rounded-full scrollbar-thumb-rounded-full',
          isScrolling && 'scrollbar-thumb-muted-foreground/60',
          className
        )}
        onScroll={handleScroll}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ScrollArea.displayName = 'ScrollArea';

const ScrollBar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: 'vertical' | 'horizontal';
  }
>(({ className, orientation = 'vertical', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex touch-none select-none transition-colors',
      orientation === 'vertical' &&
        'h-full w-2.5 border-l border-l-transparent p-[1px]',
      orientation === 'horizontal' &&
        'h-2.5 w-full border-t border-t-transparent p-[1px]',
      className
    )}
    {...props}
  />
));
ScrollBar.displayName = 'ScrollBar';

export { ScrollArea, ScrollBar };
