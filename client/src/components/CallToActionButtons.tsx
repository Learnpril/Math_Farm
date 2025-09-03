import { ArrowRight, Zap } from 'lucide-react';

interface CallToActionButtonsProps {
  onStartLearning: () => void;
  onExploreTools: () => void;
  className?: string;
}

/**
 * Call-to-action buttons component with accessibility and keyboard navigation support
 * Features primary and secondary button styles with proper ARIA labels
 */
export function CallToActionButtons({ 
  onStartLearning, 
  onExploreTools, 
  className = '' 
}: CallToActionButtonsProps) {
  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center ${className}`}>
      {/* Primary CTA - Start Learning */}
      <button
        onClick={onStartLearning}
        onKeyDown={(e) => handleKeyDown(e, onStartLearning)}
        className="group inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold text-lg hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
        aria-label="Start learning mathematics topics"
        role="button"
        tabIndex={0}
      >
        <Zap 
          className="w-5 h-5 mr-2 transition-transform group-hover:scale-110" 
          aria-hidden="true"
        />
        Start Learning
        <ArrowRight 
          className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" 
          aria-hidden="true"
        />
      </button>

      {/* Secondary CTA - Explore Tools */}
      <button
        onClick={onExploreTools}
        onKeyDown={(e) => handleKeyDown(e, onExploreTools)}
        className="group inline-flex items-center justify-center px-8 py-4 border-2 border-border bg-background text-foreground rounded-lg font-semibold text-lg hover:bg-accent hover:text-accent-foreground hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
        aria-label="Explore interactive mathematical tools"
        role="button"
        tabIndex={0}
      >
        Explore Tools
        <ArrowRight 
          className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" 
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

/**
 * Compact version of CTA buttons for smaller spaces
 */
export function CompactCallToActionButtons({ 
  onStartLearning, 
  onExploreTools, 
  className = '' 
}: CallToActionButtonsProps) {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 justify-center items-center ${className}`}>
      <button
        onClick={onStartLearning}
        className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
        aria-label="Start learning"
      >
        <Zap className="w-4 h-4 mr-2" aria-hidden="true" />
        Start Learning
      </button>

      <button
        onClick={onExploreTools}
        className="inline-flex items-center justify-center px-6 py-3 border border-border bg-background text-foreground rounded-md font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
        aria-label="Explore tools"
      >
        Explore Tools
        <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
      </button>
    </div>
  );
}