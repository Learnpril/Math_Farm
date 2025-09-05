import { ReactNode } from "react";
import { Header } from "./Header";
import { SkipNavigation } from "../accessibility/SkipNavigation";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * Main layout component with semantic HTML structure and ARIA landmarks
 * Provides consistent page structure across the application
 */
export function Layout({ children, className = "" }: LayoutProps) {
  return (
    <div className={`min-h-screen bg-background text-foreground ${className}`}>
      {/* Skip navigation for accessibility */}
      <SkipNavigation />

      {/* Main header */}
      <Header />

      {/* Main content area */}
      <main
        id="main-content"
        className="flex-1"
        role="main"
        aria-label="Main content"
      >
        {children}
      </main>

      {/* Footer */}
      <footer
        className="border-t border-border bg-muted/50"
        role="contentinfo"
        aria-label="Site footer"
      >
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* About section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">About Math Farm</h3>
              <p className="text-sm text-muted-foreground">
                A comprehensive mathematics learning platform designed for
                independent learners. Self-hosted, open-source, and completely
                free.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <nav aria-label="Footer navigation">
                <ul className="space-y-2 text-sm">
                  <li>
                    <button
                      onClick={() => {
                        const element = document.getElementById("topics");
                        element?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      Topics
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        const element = document.getElementById("practice");
                        element?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      Practice
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        // Find the features section by looking for the FeaturesSection component
                        const element = document.querySelector(
                          '[aria-labelledby="features-heading"]'
                        );
                        element?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      Features
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        const element = document.getElementById("about");
                        element?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      About
                    </button>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Contact/Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Open Source</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Math Farm is free and open-source software.
              </p>
              <p className="text-sm text-muted-foreground">
                Self-hosted • Privacy-focused • No tracking
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} Math Farm. Open source mathematics
              learning platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * Page wrapper component for consistent spacing and structure
 */
export function PageContainer({
  children,
  className = "",
  maxWidth = "container",
}: {
  children: ReactNode;
  className?: string;
  maxWidth?: "container" | "full" | "prose";
}) {
  const maxWidthClasses = {
    container: "container mx-auto",
    full: "w-full",
    prose: "max-w-4xl mx-auto",
  };

  return (
    <div className={`${maxWidthClasses[maxWidth]} px-4 py-8 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Section wrapper with proper ARIA landmarks
 */
export function Section({
  children,
  id,
  ariaLabel,
  className = "",
}: {
  children: ReactNode;
  id?: string;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <section id={id} className={`py-12 ${className}`} aria-label={ariaLabel}>
      {children}
    </section>
  );
}
