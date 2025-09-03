import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, Calculator } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';

interface HeaderProps {
  className?: string;
}

/**
 * Main header component with navigation and theme toggle
 * Includes responsive mobile menu and accessibility features
 */
export function Header({ className = '' }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeMobileMenu();
    }
  };

  // Navigation items
  const navigationItems = [
    { href: '/#topics', label: 'Topics', isInternal: true },
    { href: '/tools', label: 'Tools', isInternal: false },
    { href: '/latex-guide', label: 'LaTeX Guide', isInternal: false },
    { href: '/matlab-guide', label: 'MATLAB Guide', isInternal: false },
    { href: '/#practice', label: 'Practice', isInternal: true },
    { href: '/community', label: 'Community', isInternal: false },
    { href: '/#about', label: 'About', isInternal: true },
  ];

  const handleInternalNavigation = (href: string) => {
    closeMobileMenu();
    
    if (href.includes('#')) {
      const targetId = href.split('#')[1];
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }
  };

  const isActiveLink = (href: string) => {
    if (href.includes('#')) {
      return location === '/';
    }
    return location === href;
  };

  return (
    <header 
      className={`sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}
      role="banner"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <Calculator 
              className="h-8 w-8 text-primary transition-transform group-hover:scale-110" 
              aria-hidden="true"
            />
            <span className="text-xl font-bold text-foreground">
              Math Farm
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav 
            className="hidden md:flex items-center space-x-6"
            role="navigation"
            aria-label="Main navigation"
          >
            {navigationItems.map((item) => (
              item.isInternal ? (
                <button
                  key={item.href}
                  onClick={() => handleInternalNavigation(item.href)}
                  className={`text-sm font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    isActiveLink(item.href) 
                      ? 'text-primary' 
                      : 'text-muted-foreground'
                  }`}
                  aria-current={isActiveLink(item.href) ? 'page' : undefined}
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    isActiveLink(item.href) 
                      ? 'text-primary' 
                      : 'text-muted-foreground'
                  }`}
                  aria-current={isActiveLink(item.href) ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              )
            ))}
          </nav>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle size="sm" />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle size="sm" />
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={toggleMobileMenu}
              onKeyDown={handleKeyDown}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div 
            id="mobile-menu"
            className="md:hidden border-t border-border"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                item.isInternal ? (
                  <button
                    key={item.href}
                    onClick={() => handleInternalNavigation(item.href)}
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                      isActiveLink(item.href)
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground'
                    }`}
                    aria-current={isActiveLink(item.href) ? 'page' : undefined}
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                      isActiveLink(item.href)
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground'
                    }`}
                    aria-current={isActiveLink(item.href) ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

/**
 * Skip navigation link for accessibility
 */
export function SkipNavigation() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      Skip to main content
    </a>
  );
}