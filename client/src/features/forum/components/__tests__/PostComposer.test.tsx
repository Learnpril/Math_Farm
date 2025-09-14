import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostComposer } from '../PostComposer';
import { PostContent } from '../../types';

// Mock MathJax hook
vi.mock('../../../../hooks/useMathJax', () => ({
  useMathJax: () => ({
    isLoaded: true,
    renderMath: vi.fn().mockResolvedValue(undefined),
    error: null,
    isLoading: false,
  }),
}));

// Mock DOMPurify
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn(content => content),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('PostComposer', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
    threadId: 'thread-1',
    parentPostId: 'post-1',
  };

  it('renders with default props', () => {
    render(<PostComposer {...defaultProps} />);

    expect(screen.getByText('Reply to Thread')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Write your post...')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /post reply/i })
    ).toBeInTheDocument();
  });

  it('renders as edit mode when isEditing is true', () => {
    render(<PostComposer {...defaultProps} isEditing={true} />);

    expect(screen.getByText('Edit Post')).toBeInTheDocument();
  });

  it('renders as new post when isReply is false', () => {
    render(<PostComposer {...defaultProps} isReply={false} />);

    expect(screen.getByText('New Post')).toBeInTheDocument();
  });

  it('loads initial content', () => {
    const initialContent = 'This is initial content';
    render(<PostComposer {...defaultProps} initialContent={initialContent} />);

    expect(screen.getByDisplayValue(initialContent)).toBeInTheDocument();
  });

  it('updates content when typing', async () => {
    const user = userEvent.setup();
    render(<PostComposer {...defaultProps} />);

    const textarea = screen.getByPlaceholderText('Write your post...');
    await user.type(textarea, 'Hello world');

    expect(textarea).toHaveValue('Hello world');
  });

  it('shows character count', async () => {
    const user = userEvent.setup();
    render(<PostComposer {...defaultProps} />);

    const textarea = screen.getByPlaceholderText('Write your post...');
    await user.type(textarea, 'Hello');

    expect(screen.getByText('5/10,000')).toBeInTheDocument();
  });

  it('disables submit button when content is empty', () => {
    render(<PostComposer {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /post reply/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when content is valid', async () => {
    const user = userEvent.setup();
    render(<PostComposer {...defaultProps} />);

    const textarea = screen.getByPlaceholderText('Write your post...');
    await user.type(textarea, 'Valid content');

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /post reply/i });
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('shows math help when math help button is clicked', async () => {
    const user = userEvent.setup();
    render(<PostComposer {...defaultProps} mathJaxEnabled={true} />);

    const mathHelpButton = screen.getByRole('button', { name: /math help/i });
    await user.click(mathHelpButton);

    expect(screen.getByText('LaTeX Math Syntax')).toBeInTheDocument();
    expect(screen.getByText('Inline math: x²')).toBeInTheDocument();
  });

  it('inserts math template when clicked', async () => {
    const user = userEvent.setup();
    render(<PostComposer {...defaultProps} mathJaxEnabled={true} />);

    // Open math help
    const mathHelpButton = screen.getByRole('button', { name: /math help/i });
    await user.click(mathHelpButton);

    // Click on a math template
    const template = screen.getByText('\\(x^2\\)');
    await user.click(template.closest('div')!);

    const textarea = screen.getByPlaceholderText('Write your post...');
    expect(textarea).toHaveValue('\\(x^2\\)');
  });

  it('switches to preview mode', async () => {
    const user = userEvent.setup();
    render(<PostComposer {...defaultProps} />);

    // Add some content first
    const textarea = screen.getByPlaceholderText('Write your post...');
    await user.type(textarea, 'Preview this content');

    // Switch to preview
    const previewTab = screen.getByRole('tab', { name: /preview/i });
    await user.click(previewTab);

    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('disables preview tab when content is empty', () => {
    render(<PostComposer {...defaultProps} />);

    const previewTab = screen.getByRole('tab', { name: /preview/i });
    expect(previewTab).toHaveAttribute('data-state', 'inactive');
  });

  it('calls onSubmit with processed content', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);

    render(<PostComposer {...defaultProps} />);

    const textarea = screen.getByPlaceholderText('Write your post...');
    await user.type(textarea, 'Test content with \\(x^2\\) math');

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /post reply/i });
      expect(submitButton).not.toBeDisabled();
    });

    const submitButton = screen.getByRole('button', { name: /post reply/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        text: 'Test content with \\(x^2\\) math',
        mathExpressions: [
          {
            type: 'latex',
            content: '\\(x^2\\)',
            displayMode: false,
          },
        ],
      });
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<PostComposer {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<PostComposer {...defaultProps} />);

    const textarea = screen.getByPlaceholderText('Write your post...');
    await user.type(textarea, 'Test content');

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /post reply/i });
      expect(submitButton).not.toBeDisabled();
    });

    const submitButton = screen.getByRole('button', { name: /post reply/i });
    await user.click(submitButton);

    expect(screen.getByText('Posting...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('saves draft to localStorage', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<PostComposer {...defaultProps} />);

    const textarea = screen.getByPlaceholderText('Write your post...');
    await user.type(textarea, 'Draft content');

    // Fast-forward time to trigger auto-save
    vi.advanceTimersByTime(2100);

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'forum_post_draft_thread-1_post-1',
        'Draft content'
      );
    });

    vi.useRealTimers();
  });

  it('loads draft from localStorage on mount', () => {
    localStorageMock.getItem.mockReturnValue('Saved draft content');

    render(<PostComposer {...defaultProps} />);

    expect(screen.getByDisplayValue('Saved draft content')).toBeInTheDocument();
  });

  it('shows validation errors for empty content', async () => {
    const user = userEvent.setup();
    render(<PostComposer {...defaultProps} />);

    const textarea = screen.getByPlaceholderText('Write your post...');
    await user.type(textarea, 'a');
    await user.clear(textarea);

    await waitFor(() => {
      expect(
        screen.getByText('Post content cannot be empty')
      ).toBeInTheDocument();
    });
  });

  it('shows validation errors for content too long', async () => {
    const user = userEvent.setup();
    render(<PostComposer {...defaultProps} />);

    const longContent = 'a'.repeat(10001);
    const textarea = screen.getByPlaceholderText('Write your post...');
    await user.type(textarea, longContent);

    await waitFor(() => {
      expect(screen.getByText(/Post content is too long/)).toBeInTheDocument();
    });
  });

  it('hides math help when mathJaxEnabled is false', () => {
    render(<PostComposer {...defaultProps} mathJaxEnabled={false} />);

    expect(
      screen.queryByRole('button', { name: /math help/i })
    ).not.toBeInTheDocument();
  });

  it('shows draft saved indicator', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<PostComposer {...defaultProps} />);

    const textarea = screen.getByPlaceholderText('Write your post...');
    await user.type(textarea, 'Draft content');

    // Fast-forward time to trigger auto-save
    vi.advanceTimersByTime(2100);

    await waitFor(() => {
      expect(screen.getByText('Draft saved')).toBeInTheDocument();
    });

    vi.useRealTimers();
  });
});
