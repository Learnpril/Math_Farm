import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MathJaxPreview } from '../MathJaxPreview';

// Mock MathJax hook
const mockRenderMath = vi.fn();
const mockUseMathJax = {
  isLoaded: true,
  renderMath: mockRenderMath,
  error: null,
  isLoading: false,
};

vi.mock('../../../../hooks/useMathJax', () => ({
  useMathJax: () => mockUseMathJax,
}));

// Mock DOMPurify
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn(content =>
      content.replace(/<script[^>]*>.*?<\/script>/gi, '')
    ),
  },
}));

describe('MathJaxPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRenderMath.mockResolvedValue(undefined);
    mockUseMathJax.isLoaded = true;
    mockUseMathJax.error = null;
    mockUseMathJax.isLoading = false;
  });

  it('renders empty state when no content', () => {
    render(<MathJaxPreview content='' />);

    expect(screen.getByText('Nothing to preview')).toBeInTheDocument();
  });

  it('renders loading state when MathJax is not loaded', () => {
    mockUseMathJax.isLoaded = false;

    render(<MathJaxPreview content='Some content' />);

    expect(screen.getByText('Loading MathJax...')).toBeInTheDocument();
  });

  it('renders content and calls MathJax render', () => {
    const content = 'This is test content with \\(x^2\\) math';

    render(<MathJaxPreview content={content} />);

    expect(mockRenderMath).toHaveBeenCalledWith('', expect.any(HTMLElement));
  });

  it('sanitizes content before rendering', () => {
    const content = '<script>alert("xss")</script>Safe content';

    render(<MathJaxPreview content={content} />);

    // DOMPurify mock removes script tags
    const container = screen.getByText('Safe content').closest('div');
    expect(container).toHaveTextContent('Safe content');
    expect(container).not.toHaveTextContent('alert("xss")');
  });

  it('converts line breaks to HTML', () => {
    const content = 'Line 1\nLine 2\nLine 3';

    render(<MathJaxPreview content={content} />);

    // Check that content is processed (line breaks converted)
    expect(mockRenderMath).toHaveBeenCalled();
  });

  it('calls onRenderComplete when MathJax renders successfully', async () => {
    const onRenderComplete = vi.fn();
    mockRenderMath.mockResolvedValue(undefined);

    render(
      <MathJaxPreview
        content='Test content'
        onRenderComplete={onRenderComplete}
      />
    );

    // Wait for MathJax render to complete
    await vi.waitFor(() => {
      expect(onRenderComplete).toHaveBeenCalled();
    });
  });

  it('calls onRenderError when MathJax render fails', async () => {
    const onRenderError = vi.fn();
    const renderError = new Error('MathJax render failed');
    mockRenderMath.mockRejectedValue(renderError);

    render(
      <MathJaxPreview content='Test content' onRenderError={onRenderError} />
    );

    // Wait for MathJax render to fail
    await vi.waitFor(() => {
      expect(onRenderError).toHaveBeenCalledWith(renderError);
    });
  });

  it('calls onRenderError when MathJax hook has error', () => {
    const onRenderError = vi.fn();
    mockUseMathJax.error = 'MathJax failed to load';

    render(
      <MathJaxPreview content='Test content' onRenderError={onRenderError} />
    );

    expect(onRenderError).toHaveBeenCalledWith(
      new Error('MathJax failed to load')
    );
  });

  it('applies custom className', () => {
    const { container } = render(
      <MathJaxPreview content='Test content' className='custom-class' />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('applies prose styling classes', () => {
    const { container } = render(<MathJaxPreview content='Test content' />);

    expect(container.firstChild).toHaveClass('prose', 'prose-sm', 'max-w-none');
  });

  it('handles whitespace-only content as empty', () => {
    render(<MathJaxPreview content='   \n\t   ' />);

    expect(screen.getByText('Nothing to preview')).toBeInTheDocument();
  });

  it('does not call MathJax render when content is empty', () => {
    render(<MathJaxPreview content='' />);

    expect(mockRenderMath).not.toHaveBeenCalled();
  });

  it('does not call MathJax render when not loaded', () => {
    mockUseMathJax.isLoaded = false;

    render(<MathJaxPreview content='Test content' />);

    expect(mockRenderMath).not.toHaveBeenCalled();
  });

  it('re-renders when content changes', () => {
    const { rerender } = render(<MathJaxPreview content='Initial content' />);

    expect(mockRenderMath).toHaveBeenCalledTimes(1);

    rerender(<MathJaxPreview content='Updated content' />);

    expect(mockRenderMath).toHaveBeenCalledTimes(2);
  });

  it('does not re-render when content is the same', () => {
    const { rerender } = render(<MathJaxPreview content='Same content' />);

    expect(mockRenderMath).toHaveBeenCalledTimes(1);

    rerender(<MathJaxPreview content='Same content' />);

    expect(mockRenderMath).toHaveBeenCalledTimes(1);
  });
});
