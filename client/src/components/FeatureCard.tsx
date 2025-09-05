import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  children?: ReactNode;
}

/**
 * Feature card component for highlighting platform benefits
 * Displays an icon, title, and description with consistent styling
 */
export function FeatureCard({
  icon: Icon,
  title,
  description,
  className = "",
  children,
}: FeatureCardProps) {
  return (
    <div
      className={`group p-6 bg-card border border-border rounded-lg hover:shadow-lg transition-all duration-200 hover:border-primary/20 ${className}`}
      role="article"
      aria-labelledby={`feature-${title.toLowerCase().replace(/\s+/g, "-")}`}
    >
      {/* Icon */}
      <div className="flex items-center justify-center w-12 h-12 mb-4 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
        <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
      </div>

      {/* Title */}
      <h3
        id={`feature-${title.toLowerCase().replace(/\s+/g, "-")}`}
        className="text-lg font-semibold text-foreground mb-2"
      >
        {title}
      </h3>

      {/* Description */}
      <p className="text-muted-foreground text-sm leading-relaxed mb-4">
        {description}
      </p>

      {/* Optional children content */}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
