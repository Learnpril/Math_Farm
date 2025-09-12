import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  useKeyboardNavigation,
  useGlobalKeyboardShortcuts,
  useFocusTrap,
} from '../../hooks/useKeyboardNavigation';
import { KeyboardShortcuts } from '../accessibility/KeyboardShortcuts';
import { FocusManager } from '../accessibility/FocusManager';
import { TopicsGrid } from '../TopicsGrid';
import { PracticeProblems } from '../../features/practice/components/PracticeProblems';

// Mock data
const mockTopics = [
  {
    id: 'algebra',
    title: 'Algebra',
    description: 'Basic algebra',
    level: 'middle',
    icon: 'Calculator',
    mathExpression: 'x + 1 = 2',
    prerequisites: [],
    estimatedTime: 30,
    difficulty: 2,
  },
  {
    id: 'geometry',
    title: 'Geometry',
    description: 'Basic geometry',
    level: 'middle',
    icon: 'Triangle',
    mathExpression: 'A = πr²',
    prerequisites: [],
    estimatedTime: 45,
    difficulty: 3,
  },
];

// Mock practice problems
const mockPracticeProblems = {
  algebra: [
    {
      id: 'alg-1',
      question: 'Solve for x: 2x + 3 = 7',
      type: 'numeric' as const,
      correctAnswer: '2',
      difficulty: 2,
      explanation: 'Subtract 3 from both sides, then divide by 2',
      hint: 'Start by isolating the term with x',
    },
  ],
};

// Mock modules
vi.mock('../../data/topicsData.json', () => ({
  default: mockTopics,
}));

vi.mock('../../data/practiceProblems', () => ({
  practiceProblemsData: mockPracticeProblems,
}));

vi.mock('../../lib/symbolSets', () => ({
  getTopicSymbols: () => [{ symbol: 'π', name: 'pi' }],
}));

// Test component for useKeyboardNavigation hook
function TestKeyboardNavigation() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { focusNext, focusPrevious, focusFirst, focusLast } =
    useKeyboardNavigation(containerRef, {
      enableArrowKeys: true,
      enableHomeEnd: true,
      customHandlers: {
        'Ctrl+N': () => console.log('Next shortcut'),
        'Ctrl+P': () => console.log('Previous shortcut'),
      },
    });

  return (
    <div ref={containerRef} data-testid='keyboard-nav-container'>
      <button onClick={focusNext}>Focus Next</button>
      <button onClick={focusPrevious}>Focus Previous</button>
      <button onClick={focusFirst}>Focus First</button>
      <button onClick={focusLast}>Focus Last</button>
      <input type='text' placeholder='Input 1' />
      <input type='text' placeholder='Input 2' />
      <input type='text' placeholder='Input 3' />
    </div>
  );
}

// Test component for global shortcuts
function TestGlobalShortcuts() {
  const [message, setMessage] = React.useState('');

  useGlobalKeyboardShortcuts({
    'Ctrl+T': () => setMessage('Test shortcut triggered'),
    'Alt+H': () => setMessage('Help shortcut triggered'),
    F1: () => setMessage('F1 pressed'),
  });

  return <div data-testid='shortcut-message'>{message}</div>;
}

// Test component for focus trap
function TestFocusTrap({ isActive }: { isActive: boolean }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  useFocusTrap(containerRef, isActive);

  return (
    <div>
      <button>Outside Button</button>
      <div ref={containerRef} data-testid='focus-trap'>
        <button>Inside Button 1</button>
        <button>Inside Button 2</button>
        <input type='text' placeholder='Inside Input' />
      </div>
    </div>
  );
}

describe('Keyboard Navigation', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useKeyboardNavigation hook', () => {
    it('should navigate between focusable elements with arrow keys', async () => {
      render(<TestKeyboardNavigation />);

      const container = screen.getByTestId('keyboard-nav-container');
      const inputs = screen.getAllByRole('textbox');

      // Focus first input
      inputs[0].focus();
      expect(document.activeElement).toBe(inputs[0]);

      // Navigate with arrow keys
      fireEvent.keyDown(container, { key: 'ArrowDown' });
      await waitFor(() => {
        expect(document.activeElement).toBe(inputs[1]);
      });

      fireEvent.keyDown(container, { key: 'ArrowUp' });
      await waitFor(() => {
        expect(document.activeElement).toBe(inputs[0]);
      });
    });

    it('should handle Home and End keys', async () => {
      render(<TestKeyboardNavigation />);

      const container = screen.getByTestId('keyboard-nav-container');
      const inputs = screen.getAllByRole('textbox');

      // Focus middle input
      inputs[1].focus();

      // Press Home to go to first
      fireEvent.keyDown(container, { key: 'Home' });
      await waitFor(() => {
        expect(document.activeElement).toBe(inputs[0]);
      });

      // Press End to go to last
      fireEvent.keyDown(container, { key: 'End' });
      await waitFor(() => {
        expect(document.activeElement).toBe(inputs[2]);
      });
    });

    it('should handle custom keyboard shortcuts', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      render(<TestKeyboardNavigation />);

      const container = screen.getByTestId('keyboard-nav-container');

      // Test custom shortcuts
      fireEvent.keyDown(container, { key: 'N', ctrlKey: true });
      expect(consoleSpy).toHaveBeenCalledWith('Next shortcut');

      fireEvent.keyDown(container, { key: 'P', ctrlKey: true });
      expect(consoleSpy).toHaveBeenCalledWith('Previous shortcut');

      consoleSpy.mockRestore();
    });
  });

  describe('useGlobalKeyboardShortcuts hook', () => {
    it('should handle global keyboard shortcuts', async () => {
      render(<TestGlobalShortcuts />);

      const messageElement = screen.getByTestId('shortcut-message');

      // Test Ctrl+T
      fireEvent.keyDown(document, { key: 'T', ctrlKey: true });
      await waitFor(() => {
        expect(messageElement).toHaveTextContent('Test shortcut triggered');
      });

      // Test Alt+H
      fireEvent.keyDown(document, { key: 'H', altKey: true });
      await waitFor(() => {
        expect(messageElement).toHaveTextContent('Help shortcut triggered');
      });

      // Test F1
      fireEvent.keyDown(document, { key: 'F1' });
      await waitFor(() => {
        expect(messageElement).toHaveTextContent('F1 pressed');
      });
    });
  });

  describe('useFocusTrap hook', () => {
    it('should trap focus within container when active', async () => {
      const { rerender } = render(<TestFocusTrap isActive={true} />);

      const outsideButton = screen.getByText('Outside Button');
      const insideButtons = screen.getAllByText(/Inside Button/);
      const insideInput = screen.getByPlaceholderText('Inside Input');

      // Focus should be trapped inside
      insideButtons[0].focus();
      expect(document.activeElement).toBe(insideButtons[0]);

      // Tab should cycle within container
      await user.tab();
      expect(document.activeElement).toBe(insideButtons[1]);

      await user.tab();
      expect(document.activeElement).toBe(insideInput);

      // Tab from last element should go to first
      await user.tab();
      expect(document.activeElement).toBe(insideButtons[0]);

      // Shift+Tab should go backwards
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(insideInput);
    });

    it('should not trap focus when inactive', async () => {
      render(<TestFocusTrap isActive={false} />);

      const outsideButton = screen.getByText('Outside Button');
      const insideButtons = screen.getAllByText(/Inside Button/);

      // Focus should not be trapped
      outsideButton.focus();
      expect(document.activeElement).toBe(outsideButton);

      await user.tab();
      // Should be able to tab to inside elements normally
      expect(document.activeElement).toBe(insideButtons[0]);
    });
  });

  describe('KeyboardShortcuts component', () => {
    it('should render keyboard shortcuts dialog', async () => {
      render(<KeyboardShortcuts />);

      const shortcutsButton = screen.getByRole('button', {
        name: /keyboard shortcuts/i,
      });
      expect(shortcutsButton).toBeInTheDocument();

      // Open dialog
      await user.click(shortcutsButton);

      // Check if dialog content is visible
      expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
      expect(screen.getByText('Navigation')).toBeInTheDocument();
      expect(screen.getByText('Practice')).toBeInTheDocument();
    });

    it('should filter shortcuts based on search', async () => {
      render(<KeyboardShortcuts />);

      const shortcutsButton = screen.getByRole('button', {
        name: /keyboard shortcuts/i,
      });
      await user.click(shortcutsButton);

      const searchInput = screen.getByPlaceholderText('Search shortcuts...');
      await user.type(searchInput, 'navigation');

      // Should show navigation-related shortcuts
      expect(screen.getByText('Go to home page')).toBeInTheDocument();

      // Should not show practice-related shortcuts
      expect(
        screen.queryByText('Submit answer in practice problems')
      ).not.toBeInTheDocument();
    });
  });

  describe('FocusManager component', () => {
    it('should manage focus within container', async () => {
      const TestComponent = () => (
        <FocusManager autoFocus={true}>
          <button>First Button</button>
          <button>Second Button</button>
          <input type='text' placeholder='Input' />
        </FocusManager>
      );

      render(<TestComponent />);

      // First focusable element should be focused
      const firstButton = screen.getByText('First Button');
      await waitFor(() => {
        expect(document.activeElement).toBe(firstButton);
      });
    });
  });

  describe('TopicsGrid keyboard navigation', () => {
    it('should support grid navigation with arrow keys', async () => {
      const mockOnTopicClick = vi.fn();
      render(<TopicsGrid onTopicClick={mockOnTopicClick} />);

      const topicCards = screen.getAllByRole('gridcell');
      expect(topicCards).toHaveLength(2);

      // First card should have tabindex 0
      expect(topicCards[0]).toHaveAttribute('tabindex', '0');
      expect(topicCards[1]).toHaveAttribute('tabindex', '-1');

      // Focus first card
      topicCards[0].focus();
      expect(document.activeElement).toBe(topicCards[0]);

      // Arrow key navigation should work
      fireEvent.keyDown(topicCards[0], { key: 'ArrowRight' });
      await waitFor(() => {
        expect(document.activeElement).toBe(topicCards[1]);
      });
    });
  });

  describe('PracticeProblems keyboard navigation', () => {
    it('should support practice problem shortcuts', async () => {
      const mockOnProblemComplete = vi.fn();
      render(
        <PracticeProblems
          topicId='algebra'
          onProblemComplete={mockOnProblemComplete}
          completedProblems={[]}
        />
      );

      const practiceContainer = screen.getByRole('main', {
        name: /practice problems/i,
      });
      expect(practiceContainer).toBeInTheDocument();

      // Should have keyboard shortcuts help
      expect(
        screen.getByText(/Use Ctrl\+H to toggle hints/)
      ).toBeInTheDocument();

      // Should have data attributes for keyboard shortcuts
      const hintButton = screen.getByRole('button', { name: /show hint/i });
      expect(hintButton).toHaveAttribute('data-action', 'toggle-hint');
    });
  });

  describe('Accessibility compliance', () => {
    it('should have proper ARIA attributes', () => {
      const mockOnTopicClick = vi.fn();
      render(<TopicsGrid onTopicClick={mockOnTopicClick} />);

      const grid = screen.getByRole('grid');
      expect(grid).toHaveAttribute('aria-label', 'Mathematics topics');

      const gridCells = screen.getAllByRole('gridcell');
      gridCells.forEach((cell, index) => {
        expect(cell).toHaveAttribute('aria-posinset', String(index + 1));
        expect(cell).toHaveAttribute('aria-setsize', String(gridCells.length));
      });
    });

    it('should provide screen reader announcements', async () => {
      const TestComponent = () => (
        <FocusManager announcement='Test announcement' autoFocus={false}>
          <button>Test Button</button>
        </FocusManager>
      );

      render(<TestComponent />);

      // Should create announcement element
      await waitFor(() => {
        const announcements = document.querySelectorAll('[aria-live]');
        expect(announcements.length).toBeGreaterThan(0);
      });
    });

    it('should support skip navigation', () => {
      render(
        <div>
          <div id='main-content'>Main Content</div>
          <div id='topics'>Topics</div>
          <div id='practice'>Practice</div>
        </div>
      );

      // Skip links should be available (though hidden by default)
      const skipLinks = document.querySelectorAll('a[href^="#"]');
      expect(skipLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Error handling', () => {
    it('should handle missing container gracefully', () => {
      const TestComponent = () => {
        const containerRef = React.useRef<HTMLDivElement>(null);
        const { focusNext } = useKeyboardNavigation(containerRef);

        return (
          <div>
            <button onClick={focusNext}>Focus Next</button>
          </div>
        );
      };

      expect(() => render(<TestComponent />)).not.toThrow();
    });

    it('should handle keyboard events on unmounted components', () => {
      const { unmount } = render(<TestGlobalShortcuts />);

      unmount();

      // Should not throw error when firing events after unmount
      expect(() => {
        fireEvent.keyDown(document, { key: 'T', ctrlKey: true });
      }).not.toThrow();
    });
  });
});

describe('Integration Tests', () => {
  it('should work together in a complete page scenario', async () => {
    const user = userEvent.setup();

    const TestPage = () => (
      <div>
        <KeyboardShortcuts />
        <FocusManager>
          <TopicsGrid onTopicClick={() => {}} />
          <PracticeProblems
            topicId='algebra'
            onProblemComplete={() => {}}
            completedProblems={[]}
          />
        </FocusManager>
      </div>
    );

    render(<TestPage />);

    // Should render all components without errors
    expect(
      screen.getByRole('button', { name: /keyboard shortcuts/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(screen.getByText('Practice Problems')).toBeInTheDocument();

    // Should support keyboard navigation
    const topicCards = screen.getAllByRole('gridcell');
    topicCards[0].focus();

    // Arrow navigation should work
    fireEvent.keyDown(topicCards[0], { key: 'ArrowRight' });
    await waitFor(() => {
      expect(document.activeElement).toBe(topicCards[1]);
    });
  });
});
