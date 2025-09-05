import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Calculator, Guitar, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";
import { AccessibilitySettings } from "../accessibility/AccessibilitySettings";

interface HeaderProps {
  className?: string;
}

/**
 * Main header component with navigation and theme toggle
 * Includes responsive mobile menu and accessibility features
 */
export function Header({ className = "" }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Music control functions
  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        setShowVolumeSlider(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
        setShowVolumeSlider(true);
      }
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      if (newVolume === 0 && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        setShowVolumeSlider(false);
      }
    }
  };

  // Initialize audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.loop = true;
    }
  }, [volume]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      closeMobileMenu();
    }
  };

  // Navigation items
  const navigationItems = [
    { href: "/#topics", label: "Topics", isInternal: true },
    { href: "/tools", label: "Tools", isInternal: false },
    { href: "/latex-guide", label: "LaTeX Guide", isInternal: false },
    { href: "/matlab-guide", label: "MATLAB Guide", isInternal: false },
    { href: "/#practice", label: "Practice", isInternal: true },
    { href: "/#hours", label: "Hours", isInternal: true },
    { href: "/community", label: "Community", isInternal: false },
    { href: "/#about", label: "About", isInternal: true },
  ];

  const handleInternalNavigation = (href: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
    }
    closeMobileMenu();

    if (href.includes("#")) {
      const targetId = href.split("#")[1];

      // If we're not on the home page, navigate to home first
      if (location !== "/") {
        window.location.href = href;
        return;
      }

      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        // Update URL hash without triggering navigation
        window.history.pushState(null, "", href);
      }
    }
  };

  const isActiveLink = (href: string) => {
    if (href.includes("#")) {
      return location === "/" && window.location.hash === href.split("#")[1];
    }
    return location === href;
  };

  // Check if we're on a non-home page to show back button
  const showBackButton = location !== "/" && !location.includes("#");

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}
      role="banner"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Back Button */}
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <button
                onClick={() => window.history.back()}
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md p-1"
                aria-label="Go back to previous page"
              >
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                <span className="hidden sm:inline text-sm">Back</span>
              </button>
            )}
            <Link href="/" className="flex items-center space-x-2 group">
              <Calculator
                className="h-8 w-8 text-primary transition-transform group-hover:scale-110"
                aria-hidden="true"
              />
              <span className="text-xl font-bold text-foreground">
                Math Farm
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center space-x-6"
            role="navigation"
            aria-label="Main navigation"
          >
            {navigationItems.map((item) =>
              item.isInternal ? (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(event) =>
                    handleInternalNavigation(item.href, event)
                  }
                  className={`text-sm font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    isActiveLink(item.href)
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                  aria-current={isActiveLink(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    isActiveLink(item.href)
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                  aria-current={isActiveLink(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center space-x-4">
            <AccessibilitySettings />
            <ThemeToggle size="sm" />
            <div className="relative">
              <button
                type="button"
                onClick={toggleMusic}
                className={`inline-flex items-center justify-center rounded-md p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  isPlaying
                    ? "text-primary bg-primary/10 hover:bg-primary/20"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
                aria-label={isPlaying ? "Stop music" : "Play music"}
              >
                <Guitar className="h-5 w-5" aria-hidden="true" />
              </button>
              {showVolumeSlider && (
                <div className="absolute top-full right-0 mt-2 p-3 bg-background border border-border rounded-md shadow-lg z-50">
                  <div className="flex items-center space-x-2 min-w-[120px]">
                    <span className="text-xs text-muted-foreground">Vol:</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) =>
                        handleVolumeChange(parseFloat(e.target.value))
                      }
                      className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                      aria-label="Volume control"
                    />
                    <span className="text-xs text-muted-foreground w-8">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <AccessibilitySettings />
            <ThemeToggle size="sm" />
            <div className="relative">
              <button
                type="button"
                onClick={toggleMusic}
                className={`inline-flex items-center justify-center rounded-md p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  isPlaying
                    ? "text-primary bg-primary/10 hover:bg-primary/20"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
                aria-label={isPlaying ? "Stop music" : "Play music"}
              >
                <Guitar className="h-5 w-5" aria-hidden="true" />
              </button>
              {showVolumeSlider && (
                <div className="absolute top-full right-0 mt-2 p-3 bg-background border border-border rounded-md shadow-lg z-50">
                  <div className="flex items-center space-x-2 min-w-[120px]">
                    <span className="text-xs text-muted-foreground">Vol:</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) =>
                        handleVolumeChange(parseFloat(e.target.value))
                      }
                      className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                      aria-label="Volume control"
                    />
                    <span className="text-xs text-muted-foreground w-8">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
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
              {navigationItems.map((item) =>
                item.isInternal ? (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={(event) => {
                      handleInternalNavigation(item.href, event);
                      closeMobileMenu();
                    }}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                      isActiveLink(item.href)
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    }`}
                    aria-current={isActiveLink(item.href) ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                      isActiveLink(item.href)
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    }`}
                    aria-current={isActiveLink(item.href) ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src="/MATHFARM.mp3"
        preload="metadata"
        aria-hidden="true"
      />
    </header>
  );
}
