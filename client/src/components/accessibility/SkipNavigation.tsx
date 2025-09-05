import React from "react";

interface SkipLink {
  href: string;
  label: string;
}

interface SkipNavigationProps {
  links?: SkipLink[];
  className?: string;
}

/**
 * Skip navigation component for keyboard accessibility
 * Provides quick navigation to main content areas
 */
export function SkipNavigation({
  links = [
    { href: "#main-content", label: "Skip to main content" },
    { href: "#topics", label: "Skip to topics" },
    { href: "#practice", label: "Skip to practice" },
    { href: "#about", label: "Skip to about" },
  ],
  className = "",
}: SkipNavigationProps) {
  const handleSkipClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    event.preventDefault();

    const targetId = href.replace("#", "");
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      // Set focus to the target element
      targetElement.setAttribute("tabindex", "-1");
      targetElement.focus();

      // Scroll to the element
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // Remove tabindex after focus
      setTimeout(() => {
        targetElement.removeAttribute("tabindex");
      }, 100);
    }
  };

  return (
    <nav
      className={`skip-navigation ${className}`}
      aria-label="Skip navigation"
    >
      {links.map((link, index) => (
        <a
          key={index}
          href={link.href}
          onClick={(e) => handleSkipClick(e, link.href)}
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200"
          style={{ left: `${4 + index * 180}px` }}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}

/**
 * Individual skip link component
 */
export function SkipLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    const targetId = href.replace("#", "");
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      targetElement.setAttribute("tabindex", "-1");
      targetElement.focus();
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      setTimeout(() => {
        targetElement.removeAttribute("tabindex");
      }, 100);
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={`sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200 ${className}`}
    >
      {children}
    </a>
  );
}
