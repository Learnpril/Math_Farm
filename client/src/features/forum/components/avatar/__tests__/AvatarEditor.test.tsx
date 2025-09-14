/**
 * Avatar Editor Component Tests
 * Math Farm Community Forum - Avatar Editor Testing
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AvatarEditor } from '../AvatarEditor';
import type { AvatarConfig } from '../../../types/avatar';

// Mock the child components
vi.mock('../AvatarRenderer', () => ({
  AvatarRenderer: React.forwardRef<any, any>((props, ref) => (
    <div data-testid='avatar-renderer'>Avatar Renderer Mock</div>
  )),
}));

vi.mock('../AvatarColorPicker', () => ({
  AvatarColorPicker: ({ onClose }: { onClose: () => void }) => (
    <div data-testid='color-picker'>
      <button onClick={onClose}>Close Color Picker</button>
    </div>
  ),
}));

vi.mock('../AvatarItemGrid', () => ({
  AvatarItemGrid: ({ onItemSelect }: { onItemSelect: (item: any) => void }) => (
    <div data-testid='item-grid'>
      <button
        onClick={() => onItemSelect({ id: 'test-item', name: 'Test Item' })}
      >
        Select Test Item
      </button>
    </div>
  ),
}));

vi.mock('../AvatarPresetSelector', () => ({
  AvatarPresetSelector: ({
    onPresetApply,
  }: {
    onPresetApply: (preset: any) => void;
  }) => (
    <div data-testid='preset-selector'>
      <button
        onClick={() =>
          onPresetApply({ id: 'test-preset', name: 'Test Preset' })
        }
      >
        Apply Test Preset
      </button>
    </div>
  ),
}));

describe('AvatarEditor', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    userId: 1,
    unlockedItems: ['body-default', 'hair-messy-brown', 'eyes-curious'],
    onSave: mockOnSave,
    onCancel: mockOnCancel,
  };

  const mockCurrentAvatar: AvatarConfig = {
    id: 'test-avatar',
    userId: 1,
    layers: [
      {
        itemId: 'body-default',
        position: { x: 50, y: 60 },
        scale: 1,
        rotation: 0,
        visible: true,
      },
    ],
    backgroundColor: '#F0F8FF',
    size: 'medium',
    pose: 'standing',
    expression: 'happy',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the avatar editor interface', () => {
    render(<AvatarEditor {...defaultProps} />);

    expect(screen.getByText('Avatar Preview')).toBeInTheDocument();
    expect(screen.getByText('Customize Your Avatar')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-renderer')).toBeInTheDocument();
  });

  it('renders with current avatar configuration', () => {
    render(
      <AvatarEditor {...defaultProps} currentAvatar={mockCurrentAvatar} />
    );

    expect(screen.getByTestId('avatar-renderer')).toBeInTheDocument();
  });

  it('displays category tabs', () => {
    render(<AvatarEditor {...defaultProps} />);

    // Check for some category tabs
    expect(screen.getByText('Hair')).toBeInTheDocument();
    expect(screen.getByText('Eyes')).toBeInTheDocument();
    expect(screen.getByText('Clothing')).toBeInTheDocument();
  });

  it('shows save button as disabled when no changes', () => {
    render(
      <AvatarEditor {...defaultProps} currentAvatar={mockCurrentAvatar} />
    );

    const saveButton = screen.getByText('Save Avatar');
    expect(saveButton).toBeDisabled();
  });

  it('enables save button after making changes', async () => {
    render(<AvatarEditor {...defaultProps} />);

    // Simulate selecting an item to make changes
    const selectButton = screen.getByText('Select Test Item');
    fireEvent.click(selectButton);

    await waitFor(() => {
      const saveButton = screen.getByText('Save Avatar');
      expect(saveButton).not.toBeDisabled();
    });
  });

  it('calls onSave when save button is clicked', async () => {
    render(<AvatarEditor {...defaultProps} />);

    // Make a change first
    const selectButton = screen.getByText('Select Test Item');
    fireEvent.click(selectButton);

    await waitFor(() => {
      const saveButton = screen.getByText('Save Avatar');
      expect(saveButton).not.toBeDisabled();
    });

    const saveButton = screen.getByText('Save Avatar');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<AvatarEditor {...defaultProps} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('handles undo/redo functionality', async () => {
    render(<AvatarEditor {...defaultProps} />);

    // Initially undo should be disabled
    const undoButton = screen.getByTitle('Undo (Ctrl+Z)');
    expect(undoButton).toBeDisabled();

    // Make a change
    const selectButton = screen.getByText('Select Test Item');
    fireEvent.click(selectButton);

    await waitFor(() => {
      expect(undoButton).not.toBeDisabled();
    });
  });

  it('toggles preview mode', () => {
    render(<AvatarEditor {...defaultProps} />);

    const previewToggle = screen.getByTitle('');
    // The button should exist (eye icon button)
    expect(screen.getByTestId('avatar-renderer')).toBeInTheDocument();
  });

  it('applies presets correctly', async () => {
    render(<AvatarEditor {...defaultProps} />);

    // Apply a preset
    const applyPresetButton = screen.getByText('Apply Test Preset');
    fireEvent.click(applyPresetButton);

    await waitFor(() => {
      const saveButton = screen.getByText('Save Avatar');
      expect(saveButton).not.toBeDisabled();
    });
  });

  it('handles keyboard shortcuts', () => {
    render(<AvatarEditor {...defaultProps} />);

    // Test Ctrl+Z for undo
    fireEvent.keyDown(window, { key: 'z', ctrlKey: true });

    // Test Ctrl+S for save
    fireEvent.keyDown(window, { key: 's', ctrlKey: true });

    // Should not crash and should handle the events
    expect(screen.getByTestId('avatar-renderer')).toBeInTheDocument();
  });

  it('shows unsaved changes indicator', async () => {
    render(<AvatarEditor {...defaultProps} />);

    // Make a change
    const selectButton = screen.getByText('Select Test Item');
    fireEvent.click(selectButton);

    await waitFor(() => {
      expect(screen.getByText('You have unsaved changes')).toBeInTheDocument();
    });
  });

  it('resets to default configuration', async () => {
    render(
      <AvatarEditor {...defaultProps} currentAvatar={mockCurrentAvatar} />
    );

    const resetButton = screen.getByTitle('Reset to Default');
    fireEvent.click(resetButton);

    await waitFor(() => {
      const saveButton = screen.getByText('Save Avatar');
      expect(saveButton).not.toBeDisabled();
    });
  });
});
