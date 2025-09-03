import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MathExpression, InlineMath, BlockMath } from '../MathExpression';

// Simple mock for useMathJax
vi.mock('../../hooks/useMathJax', () => ({
  useMathJax: () => ({
    isLoaded: false,
    renderMath: vi.fn(),
    error: null,
    isLoading: true,
  }),
}));

describe('MathExpression Integration', () => {
  it('renders with basic props', () => {
    render(<MathExpression expression="x^2 + y^2 = z^2" />);
    
    const mathElement = screen.getByRole('img');
    expect(mathElement).toBeInTheDocument();
    expect(mathElement).toHaveAttribute('title', 'x^2 + y^2 = z^2');
  });

  it('applies display classes correctly', () => {
    const { rerender } = render(<MathExpression expression="x + y" display="inline" />);
    
    let mathElement = screen.getByRole('img');
    expect(mathElement).toHaveClass('inline-block');
    
    rerender(<MathExpression expression="x + y" display="block" />);
    mathElement = screen.getByRole('img');
    expect(mathElement).toHaveClass('block', 'text-center', 'my-4');
  });

  it('InlineMath renders as inline', () => {
    render(<InlineMath expression="x + y" />);
    
    const mathElement = screen.getByRole('img');
    expect(mathElement).toHaveClass('inline-block');
  });

  it('BlockMath renders as block', () => {
    render(<BlockMath expression="\\int_0^1 x dx" />);
    
    const mathElement = screen.getByRole('img');
    expect(mathElement).toHaveClass('block', 'text-center', 'my-4');
  });

  it('provides accessibility attributes', () => {
    render(<MathExpression expression="E = mc^2" ariaLabel="Energy equals mass times speed of light squared" />);
    
    const mathElement = screen.getByRole('img');
    expect(mathElement).toHaveAttribute('aria-label', 'Energy equals mass times speed of light squared');
    expect(mathElement).toHaveAttribute('role', 'img');
  });
});