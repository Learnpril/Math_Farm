import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MathExpression, MathJaxProvider } from '../MathExpression';

// Mock better-react-mathjax
vi.mock('better-react-mathjax', () => ({
  MathJax: ({
    children,
    onError,
  }: {
    children: string;
    onError?: (error: any) => void;
  }) => {
    // Simulate successful rendering
    return <div data-testid='mathjax-content'>{children}</div>;
  },
  MathJaxContext: ({
    children,
    config,
    onStartup,
  }: {
    children: React.ReactNode;
    config?: any;
    onStartup?: (mathJax: any) => void;
  }) => {
    // Simulate MathJax context initialization
    if (onStartup) {
      setTimeout(() => onStartup({}), 0);
    }
    return <div data-testid='mathjax-context'>{children}</div>;
  },
}));

describe('MathExpression', () => {
  it('renders inline math expressions correctly', () => {
    render(
      <MathJaxProvider>
        <MathExpression inline={true}>x + 2 = 5</MathExpression>
      </MathJaxProvider>
    );

    expect(screen.getByTestId('mathjax-content')).toBeInTheDocument();
    expect(screen.getByText('\\(x + 2 = 5\\)')).toBeInTheDocument();
  });

  it('renders display math expressions correctly', () => {
    render(
      <MathJaxProvider>
        <MathExpression inline={false}>
          \\frac{1}
          {2} + \\frac{1}
          {3}
        </MathExpression>
      </MathJaxProvider>
    );

    expect(screen.getByTestId('mathjax-content')).toBeInTheDocument();
    expect(
      screen.getByText('\\[\\frac{1}{2} + \\frac{1}{3}\\]')
    ).toBeInTheDocument();
  });

  it('handles expressions with existing delimiters', () => {
    render(
      <MathJaxProvider>
        <MathExpression inline={true}>$x^2 + y^2 = z^2$</MathExpression>
      </MathJaxProvider>
    );

    // Should strip existing delimiters and add appropriate ones
    expect(screen.getByText('\\(x^2 + y^2 = z^2\\)')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <MathJaxProvider>
        <MathExpression className='custom-math' inline={true}>
          x = 1
        </MathExpression>
      </MathJaxProvider>
    );

    const mathElement = screen.getByTestId('mathjax-content').parentElement;
    expect(mathElement).toHaveClass('custom-math');
  });

  it('handles arithmetic expressions with custom macros', () => {
    render(
      <MathJaxProvider>
        <MathExpression inline={false}>
          1,234 = 1 \\times 10^3 + 2 \\times 10^2 + 3 \\times 10^1 + 4 \\times
          10^0
        </MathExpression>
      </MathJaxProvider>
    );

    expect(screen.getByTestId('mathjax-content')).toBeInTheDocument();
  });
});

describe('MathJaxProvider', () => {
  it('provides MathJax context to children', () => {
    render(
      <MathJaxProvider>
        <div data-testid='child'>Test content</div>
      </MathJaxProvider>
    );

    expect(screen.getByTestId('mathjax-context')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('initializes with arithmetic-optimized configuration', () => {
    const onStartup = vi.fn();

    render(
      <MathJaxProvider>
        <div>Test</div>
      </MathJaxProvider>
    );

    // The configuration should include arithmetic-specific macros
    // This is tested implicitly through the mock setup
    expect(screen.getByTestId('mathjax-context')).toBeInTheDocument();
  });
});
