import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MathExpression } from '../MathExpression';

// Mock MathJax
const mockTypesetPromise = vi.fn();
const mockMathJax = {
  typesetPromise: mockTypesetPromise,
};

describe('MathExpression', () => {
  beforeEach(() => {
    mockTypesetPromise.mockClear();
    // Reset window.MathJax
    delete (window as any).MathJax;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders fallback when MathJax is not available', () => {
    render(<MathExpression expression="x^2 + 1" fallback="x squared plus 1" />);
    
    expect(screen.getByText('x squared plus 1')).toBeInTheDocument();
    expect(screen.getByTitle('Mathematical expression')).toBeInTheDocument();
  });

  it('renders expression as fallback when no fallback provided', () => {
    render(<MathExpression expression="x^2 + 1" />);
    
    expect(screen.getByText('x^2 + 1')).toBeInTheDocument();
  });

  it('renders with MathJax when available', async () => {
    // Mock MathJax being available
    (window as any).MathJax = mockMathJax;
    mockTypesetPromise.mockResolvedValue(undefined);

    const { container } = render(<MathExpression expression="x^2 + 1" />);
    
    await waitFor(() => {
      expect(mockTypesetPromise).toHaveBeenCalledWith([expect.any(HTMLElement)]);
    });

    const mathDiv = container.querySelector('.math-expression');
    expect(mathDiv).toBeInTheDocument();
  });

  it('handles MathJax rendering errors gracefully', async () => {
    (window as any).MathJax = mockMathJax;
    mockTypesetPromise.mockRejectedValue(new Error('MathJax error'));

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(<MathExpression expression="x^2 + 1" fallback="x squared plus 1" />);
    
    await waitFor(() => {
      expect(screen.getByText('x squared plus 1')).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalledWith('MathJax rendering error:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });

  it('renders inline math expressions', async () => {
    (window as any).MathJax = mockMathJax;
    mockTypesetPromise.mockResolvedValue(undefined);

    const { container } = render(<MathExpression expression="x^2" inline={true} />);
    
    await waitFor(() => {
      const mathDiv = container.querySelector('.math-expression');
      expect(mathDiv?.textContent).toContain('\\(x^2\\)');
    });
  });

  it('renders block math expressions by default', async () => {
    (window as any).MathJax = mockMathJax;
    mockTypesetPromise.mockResolvedValue(undefined);

    const { container } = render(<MathExpression expression="x^2" />);
    
    await waitFor(() => {
      const mathDiv = container.querySelector('.math-expression');
      expect(mathDiv?.textContent).toContain('\\[x^2\\]');
    });
  });

  it('applies custom className', () => {
    // Test with MathJax available
    (window as any).MathJax = mockMathJax;
    mockTypesetPromise.mockResolvedValue(undefined);
    
    const { container } = render(
      <MathExpression expression="x^2" className="custom-math-class" />
    );
    
    const mathElement = container.querySelector('.math-expression');
    expect(mathElement).toHaveClass('custom-math-class');
  });

  it('has proper accessibility attributes', () => {
    render(<MathExpression expression="x^2 + 1" fallback="x squared plus 1" />);
    
    const mathElement = screen.getByLabelText('Math expression: x squared plus 1');
    expect(mathElement).toBeInTheDocument();
  });

  it('shows loading state initially when MathJax is available', async () => {
    (window as any).MathJax = mockMathJax;
    mockTypesetPromise.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    const { container } = render(<MathExpression expression="x^2" fallback="x squared" />);
    
    // Should show loading state initially
    const mathDiv = container.querySelector('.math-expression');
    expect(mathDiv).toHaveClass('opacity-50');
    expect(screen.getByText('\\[x^2\\]')).toBeInTheDocument();
  });

  it('updates when expression changes', async () => {
    (window as any).MathJax = mockMathJax;
    mockTypesetPromise.mockResolvedValue(undefined);

    const { rerender } = render(<MathExpression expression="x^2" />);
    
    await waitFor(() => {
      expect(mockTypesetPromise).toHaveBeenCalledTimes(1);
    });

    rerender(<MathExpression expression="y^3" />);
    
    await waitFor(() => {
      expect(mockTypesetPromise).toHaveBeenCalledTimes(2);
    });
  });
});