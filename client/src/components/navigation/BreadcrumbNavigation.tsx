import React, { useRef } from "react";
import { useLocation } from "wouter";
import { Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbNavigationProps {
  items?: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb navigation component that automatically generates breadcrumbs
 * based on the current route or accepts custom items
 */
export function BreadcrumbNavigation({
  items,
  className = "",
}: BreadcrumbNavigationProps) {
  const [location] = useLocation();
  const breadcrumbRef = useRef<HTMLDivElement>(null);

  // Generate breadcrumbs automatically if no items provided
  const breadcrumbItems = items || generateBreadcrumbs(location);

  // Don't show breadcrumbs on home page
  if (location === "/" || breadcrumbItems.length <= 1) {
    return null;
  }

  // Handle keyboard navigation within breadcrumbs
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!breadcrumbRef.current) return;

    const links = breadcrumbRef.current.querySelectorAll("a[href]");
    const currentIndex = Array.from(links).findIndex(
      (link) => link === event.target
    );

    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        if (currentIndex > 0) {
          (links[currentIndex - 1] as HTMLElement).focus();
        }
        break;
      case "ArrowRight":
        event.preventDefault();
        if (currentIndex < links.length - 1) {
          (links[currentIndex + 1] as HTMLElement).focus();
        }
        break;
      case "Home":
        event.preventDefault();
        (links[0] as HTMLElement).focus();
        break;
      case "End":
        event.preventDefault();
        (links[links.length - 1] as HTMLElement).focus();
        break;
    }
  };

  return (
    <div
      ref={breadcrumbRef}
      className={`py-4 ${className}`}
      onKeyDown={handleKeyDown}
      role="navigation"
      aria-label="Breadcrumb navigation"
    >
      <Breadcrumb>
        <BreadcrumbList>
          {/* Always start with Home */}
          <BreadcrumbItem>
            <BreadcrumbLink href="/" aria-label="Go to home page" tabIndex={0}>
              <Home className="h-4 w-4" />
              <span className="sr-only">Home</span>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;

            return (
              <React.Fragment key={`${item.href || item.label}-${index}`}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast || !item.href ? (
                    <BreadcrumbPage aria-current="page">
                      {item.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      href={item.href}
                      tabIndex={0}
                      aria-label={`Go to ${item.label}`}
                    >
                      {item.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

/**
 * Generate breadcrumb items based on the current location
 */
function generateBreadcrumbs(location: string): BreadcrumbItem[] {
  const segments = location.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  // Handle specific routes
  if (segments[0] === "topic" && segments[1]) {
    breadcrumbs.push(
      { label: "Topics", href: "/#topics" },
      { label: getTopicTitle(segments[1]), isActive: true }
    );
  } else if (segments[0] === "tools") {
    if (segments[1]) {
      breadcrumbs.push(
        { label: "Tools", href: "/tools" },
        { label: getToolTitle(segments[1]), isActive: true }
      );
    } else {
      breadcrumbs.push({ label: "Tools", isActive: true });
    }
  } else if (location === "/latex-guide") {
    breadcrumbs.push({ label: "LaTeX Guide", isActive: true });
  } else if (location === "/matlab-guide") {
    breadcrumbs.push({ label: "MATLAB Guide", isActive: true });
  } else if (location === "/math-symbols") {
    breadcrumbs.push({ label: "Math Symbols", isActive: true });
  } else if (location === "/community") {
    breadcrumbs.push({ label: "Community", isActive: true });
  } else {
    // Generic breadcrumb generation for other routes
    let currentPath = "";
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;

      breadcrumbs.push({
        label: formatSegmentLabel(segment),
        href: isLast ? undefined : currentPath,
        isActive: isLast,
      });
    });
  }

  return breadcrumbs;
}

/**
 * Get topic title from topic ID
 */
function getTopicTitle(topicId: string): string {
  const topicTitles: Record<string, string> = {
    arithmetic: "Arithmetic",
    algebra: "Algebra",
    geometry: "Geometry",
    calculus: "Calculus",
    statistics: "Statistics",
    trigonometry: "Trigonometry",
    "linear-algebra": "Linear Algebra",
    "differential-equations": "Differential Equations",
    "game-design-math": "Game Design Math",
  };

  return topicTitles[topicId] || formatSegmentLabel(topicId);
}

/**
 * Get tool title from tool ID
 */
function getToolTitle(toolId: string): string {
  const toolTitles: Record<string, string> = {
    calculator: "Calculator",
    graphing: "Graphing Tool",
    solver: "Equation Solver",
    matrix: "Matrix Calculator",
    derivative: "Derivative Calculator",
    integral: "Integral Calculator",
  };

  return toolTitles[toolId] || formatSegmentLabel(toolId);
}

/**
 * Format URL segment into readable label
 */
function formatSegmentLabel(segment: string): string {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
