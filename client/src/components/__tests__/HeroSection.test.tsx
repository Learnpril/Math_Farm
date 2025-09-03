import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HeroSection } from '../HeroSection';

// Mock the CallToActionButtons component
vi.mock('../CallToActionButtons', () => ({
  CallToActionButtons: ({ onStartLearning, onExploreTools }: any) => (
    <div data-testid="cta-buttons">
      <button onClick={onStartLearning} data-testid="start-learning">
        Start Learning
      </button>
      <button onClick={onExploreTools} data-testid="explore-tools">
        Explore Tools
      </button>
    </div>
  ),
}));

describe('HeroSection', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    // Mock getElementById to return a mock element
    const mockElement = {
      scrollIntoView: vi.fn(),
    };
    vi.spyOn(document, 'getElementById').mockReturnValue(mockElement as any);
  });

  it('renders with correct structure and content', () => {
    render(<HeroSection />);

    // Check main heading
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Welcome to')).toBeInTheDocument();
    expect(screen.getByText('Math Farm')).toBeInTheDocument();

    // Check subtitle
    expect(screen.getByText(/Your comprehensive mathematics learning platform/)).toBeInTheDocument();

    // Check CTA buttons are rendered
    expect(screen.getByTestId('cta-buttons')).toBeInTheDocument();
  });

  it('has proper semantic structure and ARIA labels', () => {
    render(<HeroSection />);

    // Check section has proper ARIA label
    const heroSection = screen.getByLabelText('Welcome and introduction');
    expect(heroSection).toBeInTheDocument();
    expect(heroSection.tagName).toBe('SECTION');

    // Check heading hierarchy
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toBeInTheDocument();

    // Check features section heading (screen reader only)
    const featuresHeading = screen.getByRole('heading', { level: 2 });
    expect(featuresHeading).toBeInTheDocument();

    // Check feature headings
    const featureHeadings = screen.getAllByRole('heading', { level: 3 });
    expect(featureHeadings).toHaveLength(3);
    expect(featureHeadings[0]).toHaveTextContent('Interactive Learning');
    expect(featureHeadings[1]).toHaveTextContent('Self-Paced');
    expect(featureHeadings[2]).toHaveTextContent('Privacy-Focused');
  });

  it('applies gradient background classes', () => {
    render(<HeroSection />);

    const heroSection = screen.getByLabelText('Welcome and introduction');
    expect(heroSection).toHaveClass('bg-gradient-to-br', 'from-primary/10', 'to-accent/10');
  });

  it('accepts and applies custom className', () => {
    const customClass = 'custom-hero-class';
    render(<HeroSection className={customClass} />);

    const heroSection = screen.getByLabelText('Welcome and introduction');
    expect(heroSection).toHaveClass(customClass);
  });

  it('handles Start Learning button click correctly', () => {
    render(<HeroSection />);

    const startLearningButton = screen.getByTestId('start-learning');
    fireEvent.click(startLearningButton);

    // Check that getElementById was called with 'topics'
    expect(document.getElementById).toHaveBeenCalledWith('topics');
  });

  it('handles Explore Tools button click correctly', () => {
    // Mock window.location.href
    const originalLocation = window.location;
    delete (window as any).location;
    window.location = { ...originalLocation, href: '' };

    render(<HeroSection />);

    const exploreToolsButton = screen.getByTestId('explore-tools');
    fireEvent.click(exploreToolsButton);

    // Check that window.location.href was set to '/tools'
    expect(window.location.href).toBe('/tools');

    // Restore original location
    window.location = originalLocation;
  });

  it('displays feature highlights with correct content', () => {
    render(<HeroSection />);

    // Check Interactive Learning feature
    expect(screen.getByText('Interactive Learning')).toBeInTheDocument();
    expect(screen.getByText('Engage with dynamic problems and real-time feedback')).toBeInTheDocument();

    // Check Self-Paced feature
    expect(screen.getByText('Self-Paced')).toBeInTheDocument();
    expect(screen.getByText('Learn at your own speed with personalized progress tracking')).toBeInTheDocument();

    // Check Privacy-Focused feature
    expect(screen.getByText('Privacy-Focused')).toBeInTheDocument();
    expect(screen.getByText('All data stays local with complete privacy protection')).toBeInTheDocument();
  });

  it('has responsive text sizing classes', () => {
    render(<HeroSection />);

    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toHaveClass('text-4xl', 'md:text-6xl');

    const subtitle = screen.getByText(/Your comprehensive mathematics learning platform/);
    expect(subtitle).toHaveClass('text-xl', 'md:text-2xl');
  });

  it('uses proper color classes for theme support', () => {
    render(<HeroSection />);

    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toHaveClass('text-foreground');

    const mathFarmSpan = screen.getByText('Math Farm');
    expect(mathFarmSpan).toHaveClass('text-primary', 'bg-gradient-to-r', 'from-primary', 'to-accent');

    const subtitle = screen.getByText(/Your comprehensive mathematics learning platform/);
    expect(subtitle).toHaveClass('text-muted-foreground');
  });

  it('handles smooth scrolling when topics element exists', () => {
    const mockScrollIntoView = vi.fn();
    const mockElement = {
      scrollIntoView: mockScrollIntoView,
    };
    vi.spyOn(document, 'getElementById').mockReturnValue(mockElement as any);

    render(<HeroSection />);

    const startLearningButton = screen.getByTestId('start-learning');
    fireEvent.click(startLearningButton);

    expect(mockScrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start'
    });
  });

  it('handles case when topics element does not exist', () => {
    vi.spyOn(document, 'getElementById').mockReturnValue(null);

    render(<HeroSection />);

    const startLearningButton = screen.getByTestId('start-learning');
    
    // Should not throw an error when element doesn't exist
    expect(() => fireEvent.click(startLearningButton)).not.toThrow();
  });
});