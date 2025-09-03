import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TopicsSection } from '../TopicsSection';

// Mock the topics data
vi.mock('../../data/topicsData.json', () => ({
  default: [
    {
      id: 'arithmetic',
      title: 'Arithmetic',
      description: 'Master the fundamentals of numbers, operations, and basic calculations',
      level: 'elementary',
      icon: 'Calculator',
      mathExpression: '\\frac{3}{4} + \\frac{1}{2} = \\frac{5}{4}',
      prerequisites: [],
      estimatedTime: 45,
      difficulty: 1
    },
    {
      id: 'algebra',
      title: 'Algebra',
      description: 'Explore variables, equations, and algebraic expressions',
      level: 'middle',
      icon: 'Variable',
      mathExpression: 'x^2 + 5x - 6 = (x + 6)(x - 1)',
      prerequisites: ['arithmetic'],
      estimatedTime: 60,
      difficulty: 2
    },
    {
      id: 'geometry',
      title: 'Geometry',
      description: 'Study shapes, angles, and spatial relationships',
      level: 'middle',
      icon: 'Triangle',
      mathExpression: 'A = \\pi r^2',
      prerequisites: ['arithmetic'],
      estimatedTime: 55,
      difficulty: 2
    }
  ]
}));

// Mock the TopicCard component
vi.mock('../TopicCard', () => ({
  TopicCard: ({ topic, onClick, className }: any) => (
    <div
      data-testid={`topic-card-${topic.id}`}
      className={className}
      onClick={() => onClick(topic.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(topic.id);
        }
      }}
    >
      <h3>{topic.title}</h3>
      <p>{topic.description}</p>
    </div>
  )
}));

describe('TopicsSection', () => {
  const mockOnTopicClick = vi.fn();

  beforeEach(() => {
    mockOnTopicClick.mockClear();
  });

  describe('Rendering and Structure', () => {
    it('renders the section with proper semantic structure', () => {
      render(<TopicsSection onTopicClick={mockOnTopicClick} />);

      // Check for main section element
      const section = screen.getByRole('region', { name: /explore mathematics topics/i });
      expect(section).toBeInTheDocument();
      expect(section.tagName).toBe('SECTION');

      // Check for proper heading
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Explore Mathematics Topics');
      expect(heading).toHaveAttribute('id', 'topics-heading');

      // Check for descriptive text
      expect(screen.getByText(/discover our comprehensive collection/i)).toBeInTheDocument();
    });

    it('renders all topic cards in a grid layout', () => {
      render(<TopicsSection onTopicClick={mockOnTopicClick} />);

      // Check for grid container
      const grid = screen.getByRole('grid', { name: /mathematics topics/i });
      expect(grid).toBeInTheDocument();

      // Check that all topic cards are rendered
      expect(screen.getByTestId('topic-card-arithmetic')).toBeInTheDocument();
      expect(screen.getByTestId('topic-card-algebra')).toBeInTheDocument();
      expect(screen.getByTestId('topic-card-geometry')).toBeInTheDocument();

      // Check grid cells
      const gridCells = screen.getAllByRole('gridcell');
      expect(gridCells).toHaveLength(3);
    });

    it('renders call-to-action button', () => {
      render(<TopicsSection onTopicClick={mockOnTopicClick} />);

      const ctaButton = screen.getByRole('button', { name: /start with the first topic/i });
      expect(ctaButton).toBeInTheDocument();
      expect(ctaButton).toHaveTextContent('Start Learning');
    });
  });

  describe('Responsive Design', () => {
    it('applies mobile-first responsive grid classes', () => {
      render(<TopicsSection onTopicClick={mockOnTopicClick} />);

      const grid = screen.getByRole('grid');
      
      // Check for responsive grid classes
      expect(grid).toHaveClass('grid');
      expect(grid).toHaveClass('grid-cols-1'); // Mobile: single column
      expect(grid).toHaveClass('sm:grid-cols-2'); // Small screens: 2 columns
      expect(grid).toHaveClass('lg:grid-cols-3'); // Large screens: 3 columns
      expect(grid).toHaveClass('xl:grid-cols-3'); // Extra large: 3 columns
    });

    it('applies proper spacing and gap classes', () => {
      render(<TopicsSection onTopicClick={mockOnTopicClick} />);

      const grid = screen.getByRole('grid');
      expect(grid).toHaveClass('gap-6');

      const section = screen.getByRole('region');
      expect(section).toHaveClass('py-16');
      expect(section).toHaveClass('px-4');
      expect(section).toHaveClass('sm:px-6');
      expect(section).toHaveClass('lg:px-8');
    });

    it('applies proper visual hierarchy with spacing', () => {
      render(<TopicsSection onTopicClick={mockOnTopicClick} />);

      // Check header spacing
      const headerDiv = screen.getByRole('heading', { level: 2 }).parentElement;
      expect(headerDiv).toHaveClass('text-center');
      expect(headerDiv).toHaveClass('mb-12');

      // Check CTA section spacing (it should have mt-12)
      const ctaSection = screen.getByText('Ready to start your mathematical journey?').parentElement;
      expect(ctaSection).toHaveClass('mt-12');
    });
  });

  describe('Accessibility Features', () => {
    it('provides proper ARIA labels and semantic structure', () => {
      render(<TopicsSection onTopicClick={mockOnTopicClick} />);

      // Check section labeling
      const section = screen.getByRole('region');
      expect(section).toHaveAttribute('aria-labelledby', 'topics-heading');

      // Check grid labeling
      const grid = screen.getByRole('grid');
      expect(grid).toHaveAttribute('aria-label', 'Mathematics topics');

      // Check grid cells have proper ARIA attributes
      const gridCells = screen.getAllByRole('gridcell');
      gridCells.forEach((cell, index) => {
        expect(cell).toHaveAttribute('aria-rowindex', String(Math.floor(index / 3) + 1));
        expect(cell).toHaveAttribute('aria-colindex', String((index % 3) + 1));
      });
    });

    it('supports keyboard navigation for topic cards', () => {
      render(<TopicsSection onTopicClick={mockOnTopicClick} />);

      const firstTopicCard = screen.getByTestId('topic-card-arithmetic');
      
      // Test keyboard interaction
      fireEvent.keyDown(firstTopicCard, { key: 'Enter' });
      expect(mockOnTopicClick).toHaveBeenCalledWith('arithmetic');

      mockOnTopicClick.mockClear();
      
      fireEvent.keyDown(firstTopicCard, { key: ' ' });
      expect(mockOnTopicClick).toHaveBeenCalledWith('arithmetic');
    });

    it('supports keyboard navigation for CTA button', () => {
      render(<TopicsSection onTopicClick={mockOnTopicClick} />);

      const ctaButton = screen.getByRole('button', { name: /start with the first topic/i });
      
      // Check that button is focusable (buttons are focusable by default)
      expect(ctaButton.tagName).toBe('BUTTON');
      
      // Test keyboard activation
      fireEvent.keyDown(ctaButton, { key: 'Enter' });
      // Note: The actual click event would be triggered by the browser
    });

    it('provides proper focus management', () => {
      render(<TopicsSection onTopicClick={mockOnTopicClick} />);

      const ctaButton = screen.getByRole('button', { name: /start with the first topic/i });
      
      // Check focus styles are applied
      expect(ctaButton).toHaveClass('focus:outline-none');
      expect(ctaButton).toHaveClass('focus:ring-2');
      expect(ctaButton).toHaveClass('focus:ring-primary');
      expect(ctaButton).toHaveClass('focus:ring-offset-2');
    });
  });

  describe('Interactions', () => {
    it('calls onTopicClick when a topic card is clicked', () => {
      render(<TopicsSection onTopicClick={mockOnTopicClick} />);

      const algebraCard = screen.getByTestId('topic-card-algebra');
      fireEvent.click(algebraCard);

      expect(mockOnTopicClick).toHaveBeenCalledWith('algebra');
      expect(mockOnTopicClick).toHaveBeenCalledTimes(1);
    });

    it('calls onTopicClick with first topic when CTA button is clicked', () => {
      render(<TopicsSection onTopicClick={mockOnTopicClick} />);

      const ctaButton = screen.getByRole('button', { name: /start with the first topic/i });
      fireEvent.click(ctaButton);

      expect(mockOnTopicClick).toHaveBeenCalledWith('arithmetic');
      expect(mockOnTopicClick).toHaveBeenCalledTimes(1);
    });

    it('handles multiple topic card interactions', () => {
      render(<TopicsSection onTopicClick={mockOnTopicClick} />);

      // Click multiple cards
      fireEvent.click(screen.getByTestId('topic-card-arithmetic'));
      fireEvent.click(screen.getByTestId('topic-card-geometry'));

      expect(mockOnTopicClick).toHaveBeenCalledTimes(2);
      expect(mockOnTopicClick).toHaveBeenNthCalledWith(1, 'arithmetic');
      expect(mockOnTopicClick).toHaveBeenNthCalledWith(2, 'geometry');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className when provided', () => {
      const customClass = 'custom-topics-section';
      render(<TopicsSection onTopicClick={mockOnTopicClick} className={customClass} />);

      const section = screen.getByRole('region');
      expect(section).toHaveClass(customClass);
    });

    it('applies h-full class to topic cards for consistent height', () => {
      render(<TopicsSection onTopicClick={mockOnTopicClick} />);

      const topicCards = screen.getAllByTestId(/topic-card-/);
      topicCards.forEach(card => {
        expect(card).toHaveClass('h-full');
      });
    });
  });

  describe('Content and Layout', () => {
    it('displays proper heading hierarchy', () => {
      render(<TopicsSection onTopicClick={mockOnTopicClick} />);

      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toHaveTextContent('Explore Mathematics Topics');
      
      // Check responsive text sizing
      expect(mainHeading).toHaveClass('text-3xl');
      expect(mainHeading).toHaveClass('sm:text-4xl');
    });

    it('centers content properly', () => {
      render(<TopicsSection onTopicClick={mockOnTopicClick} />);

      // Check container centering
      const container = screen.getByRole('region').firstElementChild;
      expect(container).toHaveClass('max-w-7xl');
      expect(container).toHaveClass('mx-auto');

      // Check header centering
      const header = screen.getByRole('heading', { level: 2 }).parentElement;
      expect(header).toHaveClass('text-center');

      // Check CTA centering - find the actual button element (not topic card buttons)
      const ctaButton = screen.getByRole('button', { name: /start with the first topic/i });
      const ctaContainer = ctaButton.parentElement;
      expect(ctaContainer).toHaveClass('text-center');
    });
  });
});