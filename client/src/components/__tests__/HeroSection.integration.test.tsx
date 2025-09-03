import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HeroSection } from '../HeroSection';

describe('HeroSection Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock a topics section element
    const mockTopicsElement = {
      scrollIntoView: vi.fn(),
    };
    vi.spyOn(document, 'getElementById').mockImplementation((id) => {
      if (id === 'topics') {
        return mockTopicsElement as any;
      }
      return null;
    });

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        href: '',
        assign: vi.fn(),
        replace: vi.fn(),
        reload: vi.fn(),
      },
      writable: true,
    });
  });

  it('integrates properly with page navigation', () => {
    render(<HeroSection />);

    // Test Start Learning button navigation
    const startLearningButton = screen.getByRole('button', { name: /start learning mathematics topics/i });
    fireEvent.click(startLearningButton);

    expect(document.getElementById).toHaveBeenCalledWith('topics');
  });

  it('handles tools page navigation', () => {
    render(<HeroSection />);

    // Test Explore Tools button navigation
    const exploreToolsButton = screen.getByRole('button', { name: /explore interactive mathematical tools/i });
    fireEvent.click(exploreToolsButton);

    expect(window.location.href).toBe('/tools');
  });

  it('renders all content sections correctly', () => {
    render(<HeroSection />);

    // Check main content is present
    expect(screen.getByText('Welcome to')).toBeInTheDocument();
    expect(screen.getByText('Math Farm')).toBeInTheDocument();
    expect(screen.getByText(/Your comprehensive mathematics learning platform/)).toBeInTheDocument();

    // Check feature highlights are present
    expect(screen.getByText('Interactive Learning')).toBeInTheDocument();
    expect(screen.getByText('Self-Paced')).toBeInTheDocument();
    expect(screen.getByText('Privacy-Focused')).toBeInTheDocument();

    // Check CTA buttons are present
    expect(screen.getByRole('button', { name: /start learning mathematics topics/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /explore interactive mathematical tools/i })).toBeInTheDocument();
  });

  it('maintains proper responsive behavior', () => {
    render(<HeroSection />);

    // Check responsive classes are applied
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toHaveClass('text-4xl', 'md:text-6xl');

    const subtitle = screen.getByText(/Your comprehensive mathematics learning platform/);
    expect(subtitle).toHaveClass('text-xl', 'md:text-2xl');

    // Check grid layout classes
    const featuresGrid = screen.getByRole('heading', { level: 2 }).parentElement?.querySelector('.grid');
    expect(featuresGrid).toHaveClass('grid-cols-1', 'md:grid-cols-3');
  });

  it('provides consistent theme support', () => {
    render(<HeroSection />);

    // Check theme-aware classes
    const section = screen.getByLabelText('Welcome and introduction');
    expect(section).toHaveClass('bg-gradient-to-br', 'from-primary/10', 'to-accent/10');

    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toHaveClass('text-foreground');

    const mathFarmSpan = screen.getByText('Math Farm');
    expect(mathFarmSpan).toHaveClass('text-primary', 'bg-gradient-to-r', 'from-primary', 'to-accent');
  });

  it('handles smooth scrolling gracefully when target element does not exist', () => {
    // Mock getElementById to return null (element not found)
    vi.spyOn(document, 'getElementById').mockReturnValue(null);

    render(<HeroSection />);

    const startLearningButton = screen.getByRole('button', { name: /start learning mathematics topics/i });
    
    // Should not throw an error when target element doesn't exist
    expect(() => fireEvent.click(startLearningButton)).not.toThrow();
    expect(document.getElementById).toHaveBeenCalledWith('topics');
  });

  it('maintains accessibility across different viewport sizes', () => {
    render(<HeroSection />);

    // All headings should maintain proper hierarchy regardless of viewport
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);

    // ARIA labels should be consistent
    const section = screen.getByLabelText('Welcome and introduction');
    expect(section).toBeInTheDocument();

    // Interactive elements should maintain accessibility
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAttribute('aria-label');
    });
  });
});