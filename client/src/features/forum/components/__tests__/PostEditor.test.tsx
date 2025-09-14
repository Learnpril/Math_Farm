import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostEditor } from '../PostEditor';
import { ForumPost } from '../../types';

// Mock components
vi.mock('../PostComposer', () => ({
  PostComposer: ({ onSubmit, onCancel, initialContent, submitLabel }: any) => (
    <div data-testid='post-composer'>
      <textarea defaultValue={initialContent} data-testid='content-input' />
      <button
        onClick={() =>
          onSubmit({ text: 'Updated content', mathExpressions: [] })
        }
      >
        {submitLabel}
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

vi.mock('../MathJaxPreview', () => ({
  MathJaxPreview: ({ content }: any) => (
    <div data-testid='math-preview'>{content}</div>
  ),
}));

describe('PostEditor', () => {
  const mockPost: ForumPost = {
    id: 1,
    threadId: 1,
    authorId: 1,
    authorName: 'Test User',
    content: 'Original post content',
    isEdited: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    post: mockPost,
    onSave: mockOnSave,
    onCancel: mockOnCancel,
  };

  it('renders edit post header', () => {
    render(<PostEditor {...defaultProps} />);

    expect(screen.getByText('Edit Post')).toBeInTheDocument();
  });

  it('shows previously edited badge when post was edited', () => {
    const editedPost = { ...mockPost, isEdited: true };
    render(<PostEditor {...defaultProps} post={editedPost} />);

    expect(screen.getByText('Previously edited')).toBeInTheDocument();
  });

  it('renders edit reason input', () => {
    render(<PostEditor {...defaultProps} />);

    expect(screen.getByLabelText(/edit reason/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/briefly describe your changes/i)
    ).toBeInTheDocument();
  });

  it('renders PostComposer with initial content', () => {
    render(<PostEditor {...defaultProps} />);

    const composer = screen.getByTestId('post-composer');
    expect(composer).toBeInTheDocument();

    const contentInput = screen.getByTestId('content-input');
    expect(contentInput).toHaveValue('Original post content');
  });

  it('calls onSave with content and edit reason', async () => {
    const user = userEvent.setup();
    mockOnSave.mockResolvedValue(undefined);

    render(<PostEditor {...defaultProps} />);

    // Add edit reason
    const reasonInput = screen.getByLabelText(/edit reason/i);
    await user.type(reasonInput, 'Fixed typo');

    // Submit changes
    const saveButton = screen.getByText('Save Changes');
    await user.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(
      { text: 'Updated content', mathExpressions: [] },
      'Fixed typo'
    );
  });

  it('calls onSave without edit reason when not provided', async () => {
    const user = userEvent.setup();
    mockOnSave.mockResolvedValue(undefined);

    render(<PostEditor {...defaultProps} />);

    const saveButton = screen.getByText('Save Changes');
    await user.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(
      { text: 'Updated content', mathExpressions: [] },
      undefined
    );
  });

  it('calls onCancel when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<PostEditor {...defaultProps} />);

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows history button when edit history is available', () => {
    const editHistory = [
      {
        id: '1',
        postId: 1,
        previousContent: 'Old content',
        newContent: 'New content',
        editedBy: 1,
        editedByName: 'Editor',
        editedAt: new Date(),
      },
    ];

    render(
      <PostEditor
        {...defaultProps}
        editHistory={editHistory}
        canViewHistory={true}
      />
    );

    expect(screen.getByText(/history \(1\)/i)).toBeInTheDocument();
  });

  it('shows edit history when history button is clicked', async () => {
    const user = userEvent.setup();
    const editHistory = [
      {
        id: '1',
        postId: 1,
        previousContent: 'Old content',
        newContent: 'New content',
        editedBy: 1,
        editedByName: 'Editor',
        editReason: 'Fixed error',
        editedAt: new Date(),
      },
    ];

    render(
      <PostEditor
        {...defaultProps}
        editHistory={editHistory}
        canViewHistory={true}
      />
    );

    const historyButton = screen.getByText(/history \(1\)/i);
    await user.click(historyButton);

    expect(screen.getByText('Edit History')).toBeInTheDocument();
    expect(screen.getByText('Editor')).toBeInTheDocument();
    expect(screen.getByText('Fixed error')).toBeInTheDocument();
  });

  it('shows error when save fails', async () => {
    const user = userEvent.setup();
    mockOnSave.mockRejectedValue(new Error('Save failed'));

    render(<PostEditor {...defaultProps} />);

    const saveButton = screen.getByText('Save Changes');
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Save failed')).toBeInTheDocument();
    });
  });

  it('disables inputs during submission', async () => {
    const user = userEvent.setup();
    mockOnSave.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<PostEditor {...defaultProps} />);

    const reasonInput = screen.getByLabelText(/edit reason/i);
    const saveButton = screen.getByText('Save Changes');

    await user.click(saveButton);

    expect(reasonInput).toBeDisabled();
  });

  it('does not show history button when canViewHistory is false', () => {
    const editHistory = [
      {
        id: '1',
        postId: 1,
        previousContent: 'Old content',
        newContent: 'New content',
        editedBy: 1,
        editedByName: 'Editor',
        editedAt: new Date(),
      },
    ];

    render(
      <PostEditor
        {...defaultProps}
        editHistory={editHistory}
        canViewHistory={false}
      />
    );

    expect(screen.queryByText(/history/i)).not.toBeInTheDocument();
  });
});
