import { useState, useEffect, useCallback, useRef } from 'react';
import { PostContent, MathExpression } from '../types';
import DOMPurify from 'dompurify';

export interface UsePostComposerOptions {
  threadId?: string;
  parentPostId?: string;
  initialContent?: string;
  isEditing?: boolean;
  mathJaxEnabled?: boolean;
  autoSaveDrafts?: boolean;
}

export interface UsePostComposerReturn {
  content: string;
  setContent: (content: string) => void;
  isDirty: boolean;
  isValid: boolean;
  validationErrors: string[];
  draftSaved: boolean;
  saveDraft: () => void;
  clearDraft: () => void;
  extractMathExpressions: () => MathExpression[];
  sanitizeContent: () => string;
  validateContent: () => string[];
  processContentForSubmission: () => PostContent;
}

const DRAFT_STORAGE_KEY = 'forum_post_draft';
const MAX_CONTENT_LENGTH = 10000;

/**
 * Hook for managing post composition state, validation, and draft functionality
 */
export function usePostComposer({
  threadId,
  parentPostId,
  initialContent = '',
  isEditing = false,
  mathJaxEnabled = true,
  autoSaveDrafts = true,
}: UsePostComposerOptions): UsePostComposerReturn {
  const [content, setContentState] = useState(initialContent);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [draftSaved, setDraftSaved] = useState(false);

  const draftTimeoutRef = useRef<NodeJS.Timeout>();
  const initialContentRef = useRef(initialContent);

  // Calculate derived state
  const isDirty = content !== initialContentRef.current;
  const isValid = validationErrors.length === 0 && content.trim().length > 0;

  // Generate draft key
  const getDraftKey = useCallback(() => {
    return `${DRAFT_STORAGE_KEY}_${threadId || 'new'}_${parentPostId || 'root'}`;
  }, [threadId, parentPostId]);

  // Load draft on mount
  useEffect(() => {
    if (!isEditing && !initialContent && autoSaveDrafts) {
      const draftKey = getDraftKey();
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        setContentState(savedDraft);
      }
    }
  }, [getDraftKey, isEditing, initialContent, autoSaveDrafts]);

  // Auto-save draft
  const saveDraft = useCallback(() => {
    if (!content.trim() || isEditing || !autoSaveDrafts) return;

    const draftKey = getDraftKey();
    localStorage.setItem(draftKey, content);
    setDraftSaved(true);

    setTimeout(() => setDraftSaved(false), 2000);
  }, [content, getDraftKey, isEditing, autoSaveDrafts]);

  // Clear draft
  const clearDraft = useCallback(() => {
    if (!autoSaveDrafts) return;

    const draftKey = getDraftKey();
    localStorage.removeItem(draftKey);
    setDraftSaved(false);
  }, [getDraftKey, autoSaveDrafts]);

  // Debounced draft saving
  useEffect(() => {
    if (!autoSaveDrafts || !isDirty) return;

    if (draftTimeoutRef.current) {
      clearTimeout(draftTimeoutRef.current);
    }

    draftTimeoutRef.current = setTimeout(saveDraft, 2000);

    return () => {
      if (draftTimeoutRef.current) {
        clearTimeout(draftTimeoutRef.current);
      }
    };
  }, [content, saveDraft, autoSaveDrafts, isDirty]);

  // Extract math expressions from content
  const extractMathExpressions = useCallback((): MathExpression[] => {
    if (!mathJaxEnabled) return [];

    const expressions: MathExpression[] = [];

    // Match inline math: \(...\)
    const inlineMatches = content.match(/\\\\?\([^)]+\\\\?\)/g) || [];
    inlineMatches.forEach(match => {
      expressions.push({
        type: 'latex',
        content: match,
        displayMode: false,
      });
    });

    // Match display math: \[...\]
    const displayMatches = content.match(/\\\\?\[[^\]]+\\\\?\]/g) || [];
    displayMatches.forEach(match => {
      expressions.push({
        type: 'latex',
        content: match,
        displayMode: true,
      });
    });

    return expressions;
  }, [content, mathJaxEnabled]);

  // Sanitize content for security
  const sanitizeContent = useCallback((): string => {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        'p',
        'br',
        'strong',
        'em',
        'code',
        'pre',
        'blockquote',
        'ul',
        'ol',
        'li',
      ],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    });
  }, [content]);

  // Validate content
  const validateContent = useCallback((): string[] => {
    const errors: string[] = [];

    if (!content.trim()) {
      errors.push('Post content cannot be empty');
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      errors.push(
        `Post content is too long (maximum ${MAX_CONTENT_LENGTH.toLocaleString()} characters)`
      );
    }

    // Validate math expressions
    if (mathJaxEnabled) {
      const mathExpressions = extractMathExpressions();
      mathExpressions.forEach((expr, index) => {
        if (!expr.content.trim()) {
          errors.push(`Math expression ${index + 1} is empty`);
        }

        // Basic LaTeX syntax validation
        if (expr.type === 'latex') {
          const openBraces = (expr.content.match(/\{/g) || []).length;
          const closeBraces = (expr.content.match(/\}/g) || []).length;
          if (openBraces !== closeBraces) {
            errors.push(`Math expression ${index + 1} has mismatched braces`);
          }
        }
      });
    }

    return errors;
  }, [content, mathJaxEnabled, extractMathExpressions]);

  // Process content for submission
  const processContentForSubmission = useCallback((): PostContent => {
    return {
      text: sanitizeContent(),
      mathExpressions: extractMathExpressions(),
    };
  }, [sanitizeContent, extractMathExpressions]);

  // Update content with validation
  const setContent = useCallback(
    (newContent: string) => {
      setContentState(newContent);

      // Clear validation errors when user starts typing
      if (validationErrors.length > 0) {
        setValidationErrors([]);
      }
    },
    [validationErrors.length]
  );

  // Update validation errors when content changes
  useEffect(() => {
    if (content.trim()) {
      const errors = validateContent();
      setValidationErrors(errors);
    }
  }, [content, validateContent]);

  return {
    content,
    setContent,
    isDirty,
    isValid,
    validationErrors,
    draftSaved,
    saveDraft,
    clearDraft,
    extractMathExpressions,
    sanitizeContent,
    validateContent,
    processContentForSubmission,
  };
}
