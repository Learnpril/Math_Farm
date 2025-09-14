import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePostComposer } from '../usePostComposer';

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

describe('usePostComposer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllTimers();
  });

  const defaultOptions = {
    threadId: 'thread-1',
    parentPostId: 'post-1',
    mathJaxEnabled: true,
    autoSaveDrafts: true,
  };

  it('initializes with empty content', () => {
    const { result } = renderHook(() => usePostComposer(defaultOptions));

    expect(result.current.content).toBe('');
    expect(result.current.isDirty).toBe(false);
    expect(result.current.isValid).toBe(false);
    expect(result.current.validationErrors).toEqual([
      'Post content cannot be empty',
    ]);
  });

  it('initializes with provided initial content', () => {
    const { result } = renderHook(() =>
      usePostComposer({ ...defaultOptions, initialContent: 'Initial content' })
    );

    expect(result.current.content).toBe('Initial content');
    expect(result.current.isDirty).toBe(false);
    expect(result.current.isValid).toBe(true);
  });

  it('loads draft from localStorage on mount', () => {
    localStorageMock.getItem.mockReturnValue('Saved draft');

    const { result } = renderHook(() => usePostComposer(defaultOptions));

    expect(result.current.content).toBe('Saved draft');
    expect(localStorageMock.getItem).toHaveBeenCalledWith(
      'forum_post_draft_thread-1_post-1'
    );
  });

  it('updates content and marks as dirty', () => {
    const { result } = renderHook(() => usePostComposer(defaultOptions));

    act(() => {
      result.current.setContent('New content');
    });

    expect(result.current.content).toBe('New content');
    expect(result.current.isDirty).toBe(true);
    expect(result.current.isValid).toBe(true);
  });

  it('validates content length', () => {
    const { result } = renderHook(() => usePostComposer(defaultOptions));

    act(() => {
      result.current.setContent('a'.repeat(10001));
    });

    expect(result.current.isValid).toBe(false);
    expect(result.current.validationErrors).toContain(
      'Post content is too long (maximum 10,000 characters)'
    );
  });

  it('extracts math expressions correctly', () => {
    const { result } = renderHook(() => usePostComposer(defaultOptions));

    act(() => {
      result.current.setContent(
        'Inline \\(x^2\\) and display \\[\\frac{a}{b}\\] math'
      );
    });

    const expressions = result.current.extractMathExpressions();

    expect(expressions).toHaveLength(2);
    expect(expressions[0]).toEqual({
      type: 'latex',
      content: '\\(x^2\\)',
      displayMode: false,
    });
    expect(expressions[1]).toEqual({
      type: 'latex',
      content: '\\[\\frac{a}{b}\\]',
      displayMode: true,
    });
  });

  it('validates math expressions', () => {
    const { result } = renderHook(() => usePostComposer(defaultOptions));

    act(() => {
      result.current.setContent('Mismatched braces \\(x^{2\\)');
    });

    expect(result.current.isValid).toBe(false);
    expect(result.current.validationErrors).toContain(
      'Math expression 1 has mismatched braces'
    );
  });

  it('auto-saves draft after delay', () => {
    const { result } = renderHook(() => usePostComposer(defaultOptions));

    act(() => {
      result.current.setContent('Draft content');
    });

    // Fast-forward time to trigger auto-save
    act(() => {
      vi.advanceTimersByTime(2100);
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'forum_post_draft_thread-1_post-1',
      'Draft content'
    );
    expect(result.current.draftSaved).toBe(true);
  });

  it('clears draft saved indicator after delay', () => {
    const { result } = renderHook(() => usePostComposer(defaultOptions));

    act(() => {
      result.current.setContent('Draft content');
    });

    // Trigger auto-save
    act(() => {
      vi.advanceTimersByTime(2100);
    });

    expect(result.current.draftSaved).toBe(true);

    // Clear indicator after delay
    act(() => {
      vi.advanceTimersByTime(2100);
    });

    expect(result.current.draftSaved).toBe(false);
  });

  it('does not auto-save when editing', () => {
    const { result } = renderHook(() =>
      usePostComposer({ ...defaultOptions, isEditing: true })
    );

    act(() => {
      result.current.setContent('Edit content');
    });

    act(() => {
      vi.advanceTimersByTime(2100);
    });

    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('does not auto-save when autoSaveDrafts is false', () => {
    const { result } = renderHook(() =>
      usePostComposer({ ...defaultOptions, autoSaveDrafts: false })
    );

    act(() => {
      result.current.setContent('No auto-save content');
    });

    act(() => {
      vi.advanceTimersByTime(2100);
    });

    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('clears draft from localStorage', () => {
    const { result } = renderHook(() => usePostComposer(defaultOptions));

    act(() => {
      result.current.clearDraft();
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith(
      'forum_post_draft_thread-1_post-1'
    );
  });

  it('sanitizes content for submission', () => {
    const { result } = renderHook(() => usePostComposer(defaultOptions));

    act(() => {
      result.current.setContent('<script>alert("xss")</script>Safe content');
    });

    const sanitized = result.current.sanitizeContent();
    expect(sanitized).toBe('<script>alert("xss")</script>Safe content'); // DOMPurify is mocked
  });

  it('processes content for submission', () => {
    const { result } = renderHook(() => usePostComposer(defaultOptions));

    act(() => {
      result.current.setContent('Content with \\(math\\) expression');
    });

    const processed = result.current.processContentForSubmission();

    expect(processed).toEqual({
      text: 'Content with \\(math\\) expression',
      mathExpressions: [
        {
          type: 'latex',
          content: '\\(math\\)',
          displayMode: false,
        },
      ],
    });
  });

  it('does not extract math expressions when mathJaxEnabled is false', () => {
    const { result } = renderHook(() =>
      usePostComposer({ ...defaultOptions, mathJaxEnabled: false })
    );

    act(() => {
      result.current.setContent('Content with \\(math\\) expression');
    });

    const expressions = result.current.extractMathExpressions();
    expect(expressions).toHaveLength(0);
  });

  it('clears validation errors when content changes', () => {
    const { result } = renderHook(() => usePostComposer(defaultOptions));

    // First, create validation errors
    act(() => {
      result.current.setContent('a'.repeat(10001));
    });

    expect(result.current.validationErrors.length).toBeGreaterThan(0);

    // Then, change content to clear errors
    act(() => {
      result.current.setContent('Valid content');
    });

    expect(result.current.validationErrors).toHaveLength(0);
  });

  it('generates correct draft key for different thread/post combinations', () => {
    const { result: result1 } = renderHook(() =>
      usePostComposer({ threadId: 'thread-1', parentPostId: 'post-1' })
    );

    const { result: result2 } = renderHook(() =>
      usePostComposer({ threadId: 'thread-2' })
    );

    act(() => {
      result1.current.setContent('Content 1');
      result2.current.setContent('Content 2');
    });

    act(() => {
      vi.advanceTimersByTime(2100);
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'forum_post_draft_thread-1_post-1',
      'Content 1'
    );
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'forum_post_draft_thread-2_root',
      'Content 2'
    );
  });
});
