import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TheorySection } from '../TheorySection';
import { TheoryConcept } from '../../types/curriculum';

// Mock MathJax components
vi.mock('../MathExpression', () => ({
  MathExpression: ({ children }: { children: string }) => (
    <div data-testid='math-expression'>{children}</div>
  ),
}));

// Mock visual aid components
vi.mock('../visual-aids', () => ({
  PlaceValueChart: ({ number }: { number: string }) => (
    <div data-testid='place-value-chart'>Place Value Chart ({number})</div>
  ),
  NumberLine: ({ highlightNumbers }: { highlightNumbers: number[] }) => (
    <div data-testid='number-line'>
      Number Line ({highlightNumbers.join(', ')})
    </div>
  ),
  Base10Blocks: ({ number }: { number: number }) => (
    <div data-testid='base-10-blocks'>Base 10 Blocks ({number})</div>
  ),
  ExpandedFormDiagram: ({ number }: { number: number }) => (
    <div data-testid='expanded-form-diagram'>
      Expanded Form Diagram ({number})
    </div>
  ),
  ComparisonChart: ({ numbers }: { numbers: number[] }) => (
    <div data-testid='comparison-chart'>
      Comparison Chart ({numbers.join(' vs ')})
    </div>
  ),
}));

describe('TheorySection', () => {
  const mockConcepts: TheoryConcept[] = [
    {
      title: 'Place Value System',
      content:
        'Numbers are organized in a base-10 system where each position represents a power of 10.',
      latex: '123 = 1 \\times 10^2 + 2 \\times 10^1 + 3 \\times 10^0',
      visuals: ['place-value-chart', 'base-10-blocks'],
    },
    {
      title: 'Expanded Form',
      content: 'Expanded form shows the value of each digit in a number.',
      visuals: ['expanded-form-diagram'],
    },
    {
      title: 'Basic Concept',
      content: 'A concept without visuals or latex.',
    },
  ];

  it('renders all theory concepts', () => {
    render(<TheorySection concepts={mockConcepts} />);

    expect(screen.getByText('Core Concepts')).toBeInTheDocument();
    expect(screen.getByText('Place Value System')).toBeInTheDocument();
    expect(screen.getByText('Expanded Form')).toBeInTheDocument();
    expect(screen.getByText('Basic Concept')).toBeInTheDocument();
  });

  it('renders concept content', () => {
    render(<TheorySection concepts={mockConcepts} />);

    expect(
      screen.getByText(/Numbers are organized in a base-10 system/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Expanded form shows the value/)
    ).toBeInTheDocument();
    expect(screen.getByText(/A concept without visuals/)).toBeInTheDocument();
  });

  it('renders LaTeX expressions when present', () => {
    render(<TheorySection concepts={mockConcepts} />);

    const mathExpression = screen.getByTestId('math-expression');
    expect(mathExpression).toBeInTheDocument();
    expect(mathExpression).toHaveTextContent(
      '123 = 1 \\times 10^2 + 2 \\times 10^1 + 3 \\times 10^0'
    );
  });

  it('renders visual aid buttons when visuals are present', () => {
    render(<TheorySection concepts={mockConcepts} />);

    expect(screen.getByText('Place Value Chart')).toBeInTheDocument();
    expect(screen.getByText('Base 10 Blocks')).toBeInTheDocument();
    expect(screen.getByText('Expanded Form Diagram')).toBeInTheDocument();
  });

  it('expands visual aids when clicked', () => {
    render(<TheorySection concepts={mockConcepts} />);

    const placeValueButton = screen.getByText('Place Value Chart');
    fireEvent.click(placeValueButton);

    // Should show the interactive place value chart
    expect(screen.getByTestId('place-value-chart')).toBeInTheDocument();
  });

  it('collapses visual aids when clicked again', () => {
    render(<TheorySection concepts={mockConcepts} />);

    const placeValueButton = screen.getByText('Place Value Chart');

    // Expand
    fireEvent.click(placeValueButton);
    expect(screen.getByTestId('place-value-chart')).toBeInTheDocument();

    // Collapse
    fireEvent.click(placeValueButton);
    expect(screen.queryByTestId('place-value-chart')).not.toBeInTheDocument();
  });

  it('handles concepts without visuals gracefully', () => {
    const conceptsWithoutVisuals: TheoryConcept[] = [
      {
        title: 'Simple Concept',
        content: 'This concept has no visual aids.',
      },
    ];

    render(<TheorySection concepts={conceptsWithoutVisuals} />);

    expect(screen.getByText('Simple Concept')).toBeInTheDocument();
    expect(
      screen.getByText('This concept has no visual aids.')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Visual Learning Tools:')
    ).not.toBeInTheDocument();
  });

  it('renders learning tips section', () => {
    render(<TheorySection concepts={mockConcepts} />);

    expect(screen.getByText('Learning Tips')).toBeInTheDocument();
    expect(screen.getByText(/Take your time/)).toBeInTheDocument();
    expect(screen.getByText(/Use the visuals/)).toBeInTheDocument();
    expect(screen.getByText(/Practice as you go/)).toBeInTheDocument();
    expect(screen.getByText(/Ask questions/)).toBeInTheDocument();
  });

  it('uses chapter number for sample data', () => {
    render(<TheorySection concepts={mockConcepts} chapterNumber={2} />);

    const placeValueButton = screen.getByText('Place Value Chart');
    fireEvent.click(placeValueButton);

    // Should use chapter 2 sample number (1234)
    expect(screen.getByTestId('place-value-chart')).toHaveTextContent('1234');
  });

  it('renders concept numbers', () => {
    render(<TheorySection concepts={mockConcepts} />);

    // Should show numbered concepts
    const conceptNumbers = screen.getAllByText(/^[1-3]$/);
    expect(conceptNumbers).toHaveLength(3);
  });

  it('shows interactive badges on visual aid buttons', () => {
    render(<TheorySection concepts={mockConcepts} />);

    const interactiveBadges = screen.getAllByText('Interactive');
    expect(interactiveBadges.length).toBeGreaterThan(0);
  });
});
