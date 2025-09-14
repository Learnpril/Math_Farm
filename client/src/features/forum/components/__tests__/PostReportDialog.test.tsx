import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostReportDialog } from '../PostReportDialog';

describe('PostReportDialog', () => {
  const mockOnSubmitReport = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    postId: 123,
    onSubmitReport: mockOnSubmitReport,
  };

  it('renders trigger button by default', () => {
    render(<PostReportDialog {...defaultProps} />);

    expect(screen.getByRole('button', { name: /report/i })).toBeInTheDocument();
  });

  it('renders custom trigger when provided', () => {
    const customTrigger = <button>Custom Report Button</button>;
    render(<PostReportDialog {...defaultProps} trigger={customTrigger} />);

    expect(screen.getByText('Custom Report Button')).toBeInTheDocument();
  });

  it('opens dialog when trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<PostReportDialog {...defaultProps} />);

    const triggerButton = screen.getByRole('button', { name: /report/i });
    await user.click(triggerButton);

    expect(screen.getByText('Report Post')).toBeInTheDocument();
  });

  it('displays all report categories', async () => {
    const user = userEvent.setup();
    render(<PostReportDialog {...defaultProps} />);

    const triggerButton = screen.getByRole('button', { name: /report/i });
    await user.click(triggerButton);

    expect(screen.getByText('Spam or Advertising')).toBeInTheDocument();
    expect(screen.getByText('Harassment or Abuse')).toBeInTheDocument();
    expect(screen.getByText('Inappropriate Content')).toBeInTheDocument();
    expect(screen.getByText('Misinformation')).toBeInTheDocument();
    expect(screen.getByText('Copyright Violation')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
  });

  it('allows selecting a report category', async () => {
    const user = userEvent.setup();
    render(<PostReportDialog {...defaultProps} />);

    const triggerButton = screen.getByRole('button', { name: /report/i });
    await user.click(triggerButton);

    const harassmentOption = screen.getByLabelText(/harassment or abuse/i);
    await user.click(harassmentOption);

    expect(harassmentOption).toBeChecked();
  });

  it('allows entering additional details', async () => {
    const user = userEvent.setup();
    render(<PostReportDialog {...defaultProps} />);

    const triggerButton = screen.getByRole('button', { name: /report/i });
    await user.click(triggerButton);

    const detailsTextarea = screen.getByLabelText(/additional details/i);
    await user.type(detailsTextarea, 'This post contains offensive language');

    expect(detailsTextarea).toHaveValue(
      'This post contains offensive language'
    );
  });

  it('submits report with selected category and details', async () => {
    const user = userEvent.setup();
    mockOnSubmitReport.mockResolvedValue(undefined);

    render(<PostReportDialog {...defaultProps} />);

    const triggerButton = screen.getByRole('button', { name: /report/i });
    await user.click(triggerButton);

    // Select category
    const spamOption = screen.getByLabelText(/spam or advertising/i);
    await user.click(spamOption);

    // Add details
    const detailsTextarea = screen.getByLabelText(/additional details/i);
    await user.type(detailsTextarea, 'Promotional content');

    // Submit
    const submitButton = screen.getByRole('button', { name: /submit report/i });
    await user.click(submitButton);

    expect(mockOnSubmitReport).toHaveBeenCalledWith({
      postId: 123,
      reason: 'Spam or Advertising',
      category: 'spam',
      details: 'Promotional content',
    });
  });

  it('requires details for "Other" category', async () => {
    const user = userEvent.setup();
    render(<PostReportDialog {...defaultProps} />);

    const triggerButton = screen.getByRole('button', { name: /report/i });
    await user.click(triggerButton);

    // Select "Other" category
    const otherOption = screen.getByLabelText(/other/i);
    await user.click(otherOption);

    // Try to submit without details
    const submitButton = screen.getByRole('button', { name: /submit report/i });
    await user.click(submitButton);

    expect(
      screen.getByText(/please provide details for "other" category/i)
    ).toBeInTheDocument();
    expect(mockOnSubmitReport).not.toHaveBeenCalled();
  });

  it('enables submit button when "Other" category has details', async () => {
    const user = userEvent.setup();
    render(<PostReportDialog {...defaultProps} />);

    const triggerButton = screen.getByRole('button', { name: /report/i });
    await user.click(triggerButton);

    // Select "Other" category
    const otherOption = screen.getByLabelText(/other/i);
    await user.click(otherOption);

    // Submit button should be disabled
    const submitButton = screen.getByRole('button', { name: /submit report/i });
    expect(submitButton).toBeDisabled();

    // Add details
    const detailsTextarea = screen.getByLabelText(/additional details/i);
    await user.type(detailsTextarea, 'Custom reason');

    // Submit button should be enabled
    expect(submitButton).not.toBeDisabled();
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    mockOnSubmitReport.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<PostReportDialog {...defaultProps} />);

    const triggerButton = screen.getByRole('button', { name: /report/i });
    await user.click(triggerButton);

    const submitButton = screen.getByRole('button', { name: /submit report/i });
    await user.click(submitButton);

    expect(screen.getByText('Submitting...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('shows error when submission fails', async () => {
    const user = userEvent.setup();
    mockOnSubmitReport.mockRejectedValue(new Error('Network error'));

    render(<PostReportDialog {...defaultProps} />);

    const triggerButton = screen.getByRole('button', { name: /report/i });
    await user.click(triggerButton);

    const submitButton = screen.getByRole('button', { name: /submit report/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('closes dialog after successful submission', async () => {
    const user = userEvent.setup();
    mockOnSubmitReport.mockResolvedValue(undefined);

    render(<PostReportDialog {...defaultProps} />);

    const triggerButton = screen.getByRole('button', { name: /report/i });
    await user.click(triggerButton);

    const submitButton = screen.getByRole('button', { name: /submit report/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText('Report Post')).not.toBeInTheDocument();
    });
  });

  it('closes dialog when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<PostReportDialog {...defaultProps} />);

    const triggerButton = screen.getByRole('button', { name: /report/i });
    await user.click(triggerButton);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(screen.queryByText('Report Post')).not.toBeInTheDocument();
  });

  it('displays disclaimer about false reports', async () => {
    const user = userEvent.setup();
    render(<PostReportDialog {...defaultProps} />);

    const triggerButton = screen.getByRole('button', { name: /report/i });
    await user.click(triggerButton);

    expect(
      screen.getByText(/false reports may result in action/i)
    ).toBeInTheDocument();
  });
});
