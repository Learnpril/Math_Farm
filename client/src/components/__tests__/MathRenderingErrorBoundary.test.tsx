import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MathRenderingErrorBoundary, withMathErrorBoundary } from '../MathRenderingErrorBoundary';

// Component that throws an error for testing
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Component that throws during render
const AlwaysThrowsError = () => {
  throw new Error('Always throws');
};

describe('MathRenderingErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.error for error boundary tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Normal Operation', () => {
    it('renders children when no error occurs', () => {
      render(
        <MathRenderingErrorBoundary>
          <div>Test content</div>
        </MathRenderingErrorBoundary>
      );
      
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('does not show error UI when children render successfully', () => {
      render(
        <MathRenderingErrorBoundary>
          <ThrowError shouldThrow={false} />
        </MathRenderingErrorBoundary>
      );
      
      expect(screen.getByText('No error')).toBeInTheDocument();
      expect(screen.queryByText('Math Rendering Error')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('catches errors and displays error UI', () => {
      render(
        <MathRenderingErrorBoundary>
          <AlwaysThrowsError />
        </MathRenderingErrorBoundary>
      );
      
      expect(screen.getByText('Math Rendering Error')).toBeInTheDocument();
      expect(screen.getByText(/There was a problem displaying the mathematical expression/)).toBeInTheDocument();
    });

    it('displays error reasons in the UI', () => {
      render(
        <MathRenderingErrorBoundary>
          <AlwaysThrowsError />
        </MathRenderingErrorBoundary>
      );
      
      expect(screen.getByText('MathJax library failed to load')).toBeInTheDocument();
      expect(screen.getByText('Invalid LaTeX syntax in the expression')).toBeInTheDocument();
      expect(screen.getByText('Network connectivity issues')).toBeInTheDocument();
    });

    it('calls onError callback when error occurs', () => {
      const onError = vi.fn();
      
      render(
        <MathRenderingErrorBoundary onError={onError}>
          <AlwaysThrowsError />
        </MathRenderingErrorBoundary>
      );
      
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });

    it('logs error to console', () => {
      const consoleSpy = vi.spyOn(console, 'error');
      
      render(
        <MathRenderingErrorBoundary>
          <AlwaysThrowsError />
        </MathRenderingErrorBoundary>
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'MathRenderingErrorBoundary caught an error:',
        expect.any(Error),
        expect.any(Object)
      );
    });
  });

  describe('Custom Fallback', () => {
    it('renders custom fallback when provided', () => {
      const customFallback = <div>Custom error message</div>;
      
      render(
        <MathRenderingErrorBoundary fallback={customFallback}>
          <AlwaysThrowsError />
        </MathRenderingErrorBoundary>
      );
      
      expect(screen.getByText('Custom error message')).toBeInTheDocument();
      expect(screen.queryByText('Math Rendering Error')).not.toBeInTheDocument();
    });
  });

  describe('Error Details', () => {
    it('shows error details when showErrorDetails is true', () => {
      render(
        <MathRenderingErrorBoundary showErrorDetails={true}>
          <AlwaysThrowsError />
        </MathRenderingErrorBoundary>
      );
      
      expect(screen.getByText('Error Details (Development)')).toBeInTheDocument();
    });

    it('hides error details when showErrorDetails is false', () => {
      render(
        <MathRenderingErrorBoundary showErrorDetails={false}>
          <AlwaysThrowsError />
        </MathRenderingErrorBoundary>
      );
      
      expect(screen.queryByText('Error Details (Development)')).not.toBeInTheDocument();
    });

    it('expands error details when clicked', () => {
      render(
        <MathRenderingErrorBoundary showErrorDetails={true}>
          <AlwaysThrowsError />
        </MathRenderingErrorBoundary>
      );
      
      const detailsElement = screen.getByText('Error Details (Development)');
      fireEvent.click(detailsElement);
      
      expect(screen.getByText(/Error: Always throws/)).toBeInTheDocument();
    });
  });

  describe('Retry Functionality', () => {
    it('provides retry button', () => {
      render(
        <MathRenderingErrorBoundary>
          <AlwaysThrowsError />
        </MathRenderingErrorBoundary>
      );
      
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('resets error state when retry is clicked', () => {
      // Create a component that can toggle between error and success states
      let shouldThrow = true;
      const ToggleError = () => {
        if (shouldThrow) {
          throw new Error('Test error');
        }
        return <div>No error</div>;
      };

      const { rerender } = render(
        <MathRenderingErrorBoundary>
          <ToggleError />
        </MathRenderingErrorBoundary>
      );
      
      // Error should be displayed
      expect(screen.getByText('Math Rendering Error')).toBeInTheDocument();
      
      // Click retry and change the error state
      shouldThrow = false;
      fireEvent.click(screen.getByText('Try Again'));
      
      // Re-render the component
      rerender(
        <MathRenderingErrorBoundary>
          <ToggleError />
        </MathRenderingErrorBoundary>
      );
      
      // Should show normal content after retry
      expect(screen.getByText('No error')).toBeInTheDocument();
      expect(screen.queryByText('Math Rendering Error')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <MathRenderingErrorBoundary>
          <AlwaysThrowsError />
        </MathRenderingErrorBoundary>
      );
      
      const errorContainer = screen.getByRole('alert');
      expect(errorContainer).toHaveAttribute('aria-live', 'polite');
    });

    it('has accessible retry button', () => {
      render(
        <MathRenderingErrorBoundary>
          <AlwaysThrowsError />
        </MathRenderingErrorBoundary>
      );
      
      const retryButton = screen.getByText('Try Again');
      expect(retryButton).toHaveAttribute('type', 'button');
      expect(retryButton).toHaveClass('focus:outline-none', 'focus:ring-2');
    });
  });

  describe('Theme Support', () => {
    it('applies dark mode classes', () => {
      render(
        <MathRenderingErrorBoundary>
          <AlwaysThrowsError />
        </MathRenderingErrorBoundary>
      );
      
      const errorContainer = screen.getByRole('alert');
      expect(errorContainer).toHaveClass('dark:border-red-700', 'dark:bg-red-950/20');
    });
  });
});

describe('withMathErrorBoundary', () => {
  it('wraps component with error boundary', () => {
    const TestComponent = () => <div>Test component</div>;
    const WrappedComponent = withMathErrorBoundary(TestComponent);
    
    render(<WrappedComponent />);
    
    expect(screen.getByText('Test component')).toBeInTheDocument();
  });

  it('catches errors in wrapped component', () => {
    const WrappedComponent = withMathErrorBoundary(AlwaysThrowsError);
    
    render(<WrappedComponent />);
    
    expect(screen.getByText('Math Rendering Error')).toBeInTheDocument();
  });

  it('passes error boundary props', () => {
    const onError = vi.fn();
    const TestComponent = () => <div>Test component</div>;
    const WrappedComponent = withMathErrorBoundary(TestComponent, { onError });
    
    render(<WrappedComponent />);
    
    // Component should render normally
    expect(screen.getByText('Test component')).toBeInTheDocument();
  });

  it('sets correct display name', () => {
    const TestComponent = () => <div>Test</div>;
    TestComponent.displayName = 'TestComponent';
    
    const WrappedComponent = withMathErrorBoundary(TestComponent);
    
    expect(WrappedComponent.displayName).toBe('withMathErrorBoundary(TestComponent)');
  });

  it('uses component name when displayName is not available', () => {
    function TestComponent() {
      return <div>Test</div>;
    }
    
    const WrappedComponent = withMathErrorBoundary(TestComponent);
    
    expect(WrappedComponent.displayName).toBe('withMathErrorBoundary(TestComponent)');
  });
});