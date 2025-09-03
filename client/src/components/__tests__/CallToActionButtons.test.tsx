import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CallToActionButtons, CompactCallToActionButtons } from '../CallToActionButtons';

describe('CallToActionButtons', () => {
  const mockOnStartLearning = vi.fn();
  const mockOnExploreTools = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CallToActionButtons', () => {
    it('renders both buttons with correct text and icons', () => {
      render(
        <CallToActionButtons
          onStartLearning={mockOnStartLearning}
          onExploreTools={mockOnExploreTools}
        />
      );

      // Check Start Learning button
      const startButton = screen.getByRole('button', { name: /start learning mathematics topics/i });
      expect(startButton).toBeInTheDocument();
      expect(startButton).toHaveTextContent('Start Learning');

      // Check Explore Tools button
      const exploreButton = screen.getByRole('button', { name: /explore interactive mathematical tools/i });
      expect(exploreButton).toBeInTheDocument();
      expect(exploreButton).toHaveTextContent('Explore Tools');
    });

    it('has proper accessibility attributes', () => {
      render(
        <CallToActionButtons
          onStartLearning={mockOnStartLearning}
          onExploreTools={mockOnExploreTools}
        />
      );

      const startButton = screen.getByRole('button', { name: /start learning mathematics topics/i });
      expect(startButton).toHaveAttribute('aria-label', 'Start learning mathematics topics');
      expect(startButton).toHaveAttribute('role', 'button');
      expect(startButton).toHaveAttribute('tabIndex', '0');

      const exploreButton = screen.getByRole('button', { name: /explore interactive mathematical tools/i });
      expect(exploreButton).toHaveAttribute('aria-label', 'Explore interactive mathematical tools');
      expect(exploreButton).toHaveAttribute('role', 'button');
      expect(exploreButton).toHaveAttribute('tabIndex', '0');
    });

    it('applies correct CSS classes for styling', () => {
      render(
        <CallToActionButtons
          onStartLearning={mockOnStartLearning}
          onExploreTools={mockOnExploreTools}
        />
      );

      const startButton = screen.getByRole('button', { name: /start learning mathematics topics/i });
      expect(startButton).toHaveClass('bg-primary', 'text-primary-foreground', 'hover:bg-primary/90');

      const exploreButton = screen.getByRole('button', { name: /explore interactive mathematical tools/i });
      expect(exploreButton).toHaveClass('border-2', 'border-border', 'bg-background', 'text-foreground');
    });

    it('calls onStartLearning when Start Learning button is clicked', () => {
      render(
        <CallToActionButtons
          onStartLearning={mockOnStartLearning}
          onExploreTools={mockOnExploreTools}
        />
      );

      const startButton = screen.getByRole('button', { name: /start learning mathematics topics/i });
      fireEvent.click(startButton);

      expect(mockOnStartLearning).toHaveBeenCalledTimes(1);
      expect(mockOnExploreTools).not.toHaveBeenCalled();
    });

    it('calls onExploreTools when Explore Tools button is clicked', () => {
      render(
        <CallToActionButtons
          onStartLearning={mockOnStartLearning}
          onExploreTools={mockOnExploreTools}
        />
      );

      const exploreButton = screen.getByRole('button', { name: /explore interactive mathematical tools/i });
      fireEvent.click(exploreButton);

      expect(mockOnExploreTools).toHaveBeenCalledTimes(1);
      expect(mockOnStartLearning).not.toHaveBeenCalled();
    });

    it('handles keyboard navigation with Enter key', async () => {
      const user = userEvent.setup();
      
      render(
        <CallToActionButtons
          onStartLearning={mockOnStartLearning}
          onExploreTools={mockOnExploreTools}
        />
      );

      const startButton = screen.getByRole('button', { name: /start learning mathematics topics/i });
      
      // Focus and press Enter
      startButton.focus();
      await user.keyboard('{Enter}');

      expect(mockOnStartLearning).toHaveBeenCalledTimes(1);
    });

    it('handles keyboard navigation with Space key', async () => {
      const user = userEvent.setup();
      
      render(
        <CallToActionButtons
          onStartLearning={mockOnStartLearning}
          onExploreTools={mockOnExploreTools}
        />
      );

      const exploreButton = screen.getByRole('button', { name: /explore interactive mathematical tools/i });
      
      // Focus and press Space
      exploreButton.focus();
      await user.keyboard(' ');

      expect(mockOnExploreTools).toHaveBeenCalledTimes(1);
    });

    it('applies custom className when provided', () => {
      const customClass = 'custom-cta-class';
      
      render(
        <CallToActionButtons
          onStartLearning={mockOnStartLearning}
          onExploreTools={mockOnExploreTools}
          className={customClass}
        />
      );

      const container = screen.getByRole('button', { name: /start learning mathematics topics/i }).parentElement;
      expect(container).toHaveClass(customClass);
    });

    it('has proper focus management and visual indicators', () => {
      render(
        <CallToActionButtons
          onStartLearning={mockOnStartLearning}
          onExploreTools={mockOnExploreTools}
        />
      );

      const startButton = screen.getByRole('button', { name: /start learning mathematics topics/i });
      const exploreButton = screen.getByRole('button', { name: /explore interactive mathematical tools/i });

      // Check focus-visible classes
      expect(startButton).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2');
      expect(exploreButton).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2');
    });

    it('includes proper ARIA hidden attributes for icons', () => {
      render(
        <CallToActionButtons
          onStartLearning={mockOnStartLearning}
          onExploreTools={mockOnExploreTools}
        />
      );

      // Check that SVG icons have aria-hidden="true"
      const container = screen.getByRole('button', { name: /start learning mathematics topics/i }).parentElement;
      const svgElements = container?.querySelectorAll('svg[aria-hidden="true"]');
      expect(svgElements?.length).toBeGreaterThan(0);
    });
  });

  describe('CompactCallToActionButtons', () => {
    it('renders compact version with smaller styling', () => {
      render(
        <CompactCallToActionButtons
          onStartLearning={mockOnStartLearning}
          onExploreTools={mockOnExploreTools}
        />
      );

      const startButton = screen.getByRole('button', { name: /start learning/i });
      const exploreButton = screen.getByRole('button', { name: /explore tools/i });

      // Check compact styling classes
      expect(startButton).toHaveClass('px-6', 'py-3', 'font-medium');
      expect(exploreButton).toHaveClass('px-6', 'py-3', 'font-medium');
    });

    it('calls handlers correctly in compact version', () => {
      render(
        <CompactCallToActionButtons
          onStartLearning={mockOnStartLearning}
          onExploreTools={mockOnExploreTools}
        />
      );

      const startButton = screen.getByRole('button', { name: /start learning/i });
      const exploreButton = screen.getByRole('button', { name: /explore tools/i });

      fireEvent.click(startButton);
      expect(mockOnStartLearning).toHaveBeenCalledTimes(1);

      fireEvent.click(exploreButton);
      expect(mockOnExploreTools).toHaveBeenCalledTimes(1);
    });

    it('applies custom className in compact version', () => {
      const customClass = 'compact-custom-class';
      
      render(
        <CompactCallToActionButtons
          onStartLearning={mockOnStartLearning}
          onExploreTools={mockOnExploreTools}
          className={customClass}
        />
      );

      const container = screen.getByRole('button', { name: /start learning/i }).parentElement;
      expect(container).toHaveClass(customClass);
    });
  });
});