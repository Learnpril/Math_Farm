import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WorkedExamples } from '../WorkedExamples';
import { WorkedExample } from '../../types';

// Mock MathExpression component
vi.mock('../MathExpression', () => ({
  MathExpression: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='math-expression'>{children}</div>
  ),
}));

const mockExamples: WorkedExample[] = [
  {
    problem: 'Solve: 2x + 5 = 13',
    solution: 'x = 4',
    steps: [
      'Subtract 5 from both sides: 2x = 8',
      'Divide both sides by 2: x = 4',
      'Check: 2(4) + 5 = 13 ✓',
    ],
    commonErrors: [
      'Forgetting to subtract 5 from both sides',
      'Making arithmetic errors',
    ],
    latex: '2x + 5 = 13',
  },
  {
    problem: 'Find the area of a rectangle with length 8 and width 5',
    solution: 'Area = 40 square units',
    steps: [
      'Use the formula: Area = length × width',
      'Substitute values: Area = 8 × 5',
      'Calculate: Area = 40 square units',
    ],
    commonErrors: ['Confusing area with perimeter'],
  },
];

describe('WorkedExamples', () => {
  it('renders examples with step-by-step reveal functionality', () => {
    render(<WorkedExamples examples={mockExamples} />);

    // Check that examples are rendered
    expect(screen.getByText('Example 1')).toBeInTheDocument();
    expect(screen.getByText('Example 2')).toBeInTheDocument();

    // First example should be expanded by default
    expect(screen.getByText('Solution: x = 4')).toBeInTheDocument();
  });

  it('allows step-by-step reveal of solution steps', async () => {
    render(<WorkedExamples examples={mockExamples} />);

    // Initially no steps should be visible
    expect(screen.queryByText('Step 1:')).not.toBeInTheDocument();

    // Click "Start" to reveal first step
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);

    // First step should be visible
    await waitFor(() => {
      expect(screen.getByText(/Step 1:/)).toBeInTheDocument();
      expect(
        screen.getByText(/Subtract 5 from both sides/)
      ).toBeInTheDocument();
    });

    // Button should now say "Next Step"
    expect(screen.getByText('Next Step')).toBeInTheDocument();
  });

  it('allows revealing all steps at once', async () => {
    render(<WorkedExamples examples={mockExamples} />);

    // First reveal one step
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('Show All')).toBeInTheDocument();
    });

    // Click "Show All"
    const showAllButton = screen.getByText('Show All');
    fireEvent.click(showAllButton);

    // All steps should be visible
    await waitFor(() => {
      expect(screen.getByText(/Step 1:/)).toBeInTheDocument();
      expect(screen.getByText(/Step 2:/)).toBeInTheDocument();
      expect(screen.getByText(/Step 3:/)).toBeInTheDocument();
    });
  });

  it('allows replaying the step-by-step process', async () => {
    render(<WorkedExamples examples={mockExamples} />);

    // Reveal all steps first
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);

    await waitFor(() => {
      const showAllButton = screen.getByText('Show All');
      fireEvent.click(showAllButton);
    });

    // Click replay
    await waitFor(() => {
      const replayButton = screen.getByText('Replay');
      fireEvent.click(replayButton);
    });

    // Steps should be hidden and start button should be available again
    await waitFor(() => {
      expect(screen.queryByText(/Step 1:/)).not.toBeInTheDocument();
      expect(screen.getByText('Start')).toBeInTheDocument();
    });
  });

  it('allows hiding all steps', async () => {
    render(<WorkedExamples examples={mockExamples} />);

    // Show all steps first
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);

    await waitFor(() => {
      const showAllButton = screen.getByText('Show All');
      fireEvent.click(showAllButton);
    });

    // Click "Hide All"
    await waitFor(() => {
      const hideAllButton = screen.getByText('Hide All');
      fireEvent.click(hideAllButton);
    });

    // Steps should be hidden
    await waitFor(() => {
      expect(screen.queryByText(/Step 1:/)).not.toBeInTheDocument();
      expect(screen.getByText('Start')).toBeInTheDocument();
    });
  });

  it('shows remaining steps count', async () => {
    render(<WorkedExamples examples={mockExamples} />);

    // Reveal first step
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);

    // Should show remaining steps count
    await waitFor(() => {
      expect(screen.getByText('2 more steps remaining...')).toBeInTheDocument();
    });

    // Reveal second step
    const nextButton = screen.getByText('Next Step');
    fireEvent.click(nextButton);

    // Should show 1 more step remaining
    await waitFor(() => {
      expect(screen.getByText('1 more step remaining...')).toBeInTheDocument();
    });
  });

  it('displays common errors when available', () => {
    render(<WorkedExamples examples={mockExamples} />);

    // Common errors should be visible for the first example
    expect(screen.getByText('Common Mistakes to Avoid:')).toBeInTheDocument();
    expect(
      screen.getByText('Forgetting to subtract 5 from both sides')
    ).toBeInTheDocument();
    expect(screen.getByText('Making arithmetic errors')).toBeInTheDocument();
  });

  it('can toggle between examples', () => {
    render(<WorkedExamples examples={mockExamples} />);

    // First example is expanded by default
    expect(screen.getByText('Solution: x = 4')).toBeInTheDocument();

    // Click on second example
    const example2Button = screen.getByText('Example 2');
    fireEvent.click(example2Button);

    // Second example should be expanded, first should be collapsed
    expect(
      screen.getByText('Solution: Area = 40 square units')
    ).toBeInTheDocument();
    expect(screen.queryByText('Solution: x = 4')).not.toBeInTheDocument();
  });

  it('resets step reveal state when collapsing examples', async () => {
    render(<WorkedExamples examples={mockExamples} />);

    // Reveal some steps in first example
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText(/Step 1:/)).toBeInTheDocument();
    });

    // Collapse the example by clicking on it again
    const example1Header = screen.getByText('Example 1');
    fireEvent.click(example1Header);

    // Expand it again
    fireEvent.click(example1Header);

    // Steps should be reset (hidden) and start button should be available
    expect(screen.queryByText(/Step 1:/)).not.toBeInTheDocument();
    expect(screen.getByText('Start')).toBeInTheDocument();
  });
});
