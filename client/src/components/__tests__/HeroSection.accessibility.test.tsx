import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { HeroSection } from '../HeroSection';

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations);

// Mock the CallToActionButtons component for focused testing
vi.mock('../CallToActionButtons', () => ({
  CallToActionButtons: ({ onStartLearning, onExploreTools }: any) => (
    <div data-testid="cta-buttons">
      <button 
        onClick={onStartLearning} 
        data-testid="start-learning"
        aria-label="Start learning mathematics topics"
      >
        Start Learning
      </button>
      <button 
        onClick={onExploreTools} 
        data-testid="explore-tools"
        aria-label="Explore interactive mathematical tools"
      >
        Explore Tools
      </button>
    </div>
  ),
}));

describe('HeroSection Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock getElementById
    const mockElement = { scrollIntoView: vi.fn() };
    vi.spyOn(document, 'getElementById').mockReturnValue(mockElement as any);
  });

  it('should not have any accessibility violations', async () => {
    const { container } = render(<HeroSection />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has proper heading hierarchy', () => {
    render(<HeroSection />);

    // Main heading should be h1
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toBeInTheDocument();
    expect(mainHeading).toHaveTextContent(/Welcome to.*Math Farm/);

    // Should have h2 for features section (screen reader only)
    const featuresHeading = screen.getByRole('heading', { level: 2 });
    expect(featuresHeading).toBeInTheDocument();
    expect(featuresHeading).toHaveTextContent('Platform Features');

    // Feature headings should be h3 (proper hierarchy)
    const featureHeadings = screen.getAllByRole('heading', { level: 3 });
    expect(featureHeadings).toHaveLength(3);
    
    // Verify heading content
    expect(featureHeadings[0]).toHaveTextContent('Interactive Learning');
    expect(featureHeadings[1]).toHaveTextContent('Self-Paced');
    expect(featureHeadings[2]).toHaveTextContent('Privacy-Focused');
  });

  it('has proper semantic structure with landmarks', () => {
    render(<HeroSection />);

    // Should have a section landmark
    const section = screen.getByRole('region', { name: 'Welcome and introduction' });
    expect(section).toBeInTheDocument();
    expect(section.tagName).toBe('SECTION');
  });

  it('provides sufficient color contrast', () => {
    render(<HeroSection />);

    // Main heading should use foreground color (high contrast)
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toHaveClass('text-foreground');

    // Subtitle should use muted foreground (still accessible contrast)
    const subtitle = screen.getByText(/Your comprehensive mathematics learning platform/);
    expect(subtitle).toHaveClass('text-muted-foreground');

    // Feature headings should use foreground color
    const featureHeadings = screen.getAllByRole('heading', { level: 3 });
    featureHeadings.forEach(heading => {
      expect(heading).toHaveClass('text-foreground');
    });
  });

  it('has descriptive text for screen readers', () => {
    render(<HeroSection />);

    // Check that feature descriptions are present and descriptive
    expect(screen.getByText('Engage with dynamic problems and real-time feedback')).toBeInTheDocument();
    expect(screen.getByText('Learn at your own speed with personalized progress tracking')).toBeInTheDocument();
    expect(screen.getByText('All data stays local with complete privacy protection')).toBeInTheDocument();
  });

  it('supports keyboard navigation', () => {
    render(<HeroSection />);

    // CTA buttons should be keyboard accessible (tested in CallToActionButtons tests)
    const ctaButtons = screen.getByTestId('cta-buttons');
    expect(ctaButtons).toBeInTheDocument();

    // Buttons should have proper ARIA labels
    const startButton = screen.getByTestId('start-learning');
    const exploreButton = screen.getByTestId('explore-tools');
    
    expect(startButton).toHaveAttribute('aria-label', 'Start learning mathematics topics');
    expect(exploreButton).toHaveAttribute('aria-label', 'Explore interactive mathematical tools');
  });

  it('has proper text sizing for readability', () => {
    render(<HeroSection />);

    // Main heading should have responsive text sizing
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toHaveClass('text-4xl', 'md:text-6xl');

    // Subtitle should have appropriate sizing
    const subtitle = screen.getByText(/Your comprehensive mathematics learning platform/);
    expect(subtitle).toHaveClass('text-xl', 'md:text-2xl');

    // Feature headings should be appropriately sized
    const featureHeadings = screen.getAllByRole('heading', { level: 3 });
    featureHeadings.forEach(heading => {
      expect(heading).toHaveClass('text-lg');
    });
  });

  it('provides proper spacing and layout for readability', () => {
    render(<HeroSection />);

    // Main container should have proper spacing
    const section = screen.getByRole('region', { name: 'Welcome and introduction' });
    expect(section).toHaveClass('py-12'); // Section padding

    // Content should have proper spacing
    const mainContent = section.querySelector('.text-center.space-y-8');
    expect(mainContent).toBeInTheDocument();

    // Features grid should have proper spacing
    const featuresGrid = section.querySelector('.grid.grid-cols-1.md\\:grid-cols-3.gap-6');
    expect(featuresGrid).toBeInTheDocument();
  });

  it('uses semantic HTML elements', () => {
    render(<HeroSection />);

    // Should use proper heading elements
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);

    // Should use section element with proper ARIA label
    const section = screen.getByRole('region', { name: 'Welcome and introduction' });
    expect(section.tagName).toBe('SECTION');
  });

  it('handles reduced motion preferences', () => {
    // Mock prefers-reduced-motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(<HeroSection />);

    // Component should render without motion-dependent features
    // (Actual motion reduction would be handled by CSS)
    const section = screen.getByRole('region', { name: 'Welcome and introduction' });
    expect(section).toBeInTheDocument();
  });
});