import React, { useState, useRef } from 'react';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs';
import { Badge } from '../../../components/ui/badge';
import { Eye, Save, Send, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { usePostComposer } from '../hooks/usePostComposer';
import { MathJaxPreview } from './MathJaxPreview';
import { PostContent, MathExpression } from '../types';

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface PostComposerProps {
  threadId?: string;
  parentPostId?: string;
  onSubmit: (content: PostContent) => Promise<void>;
  onCancel?: () => void;
  initialContent?: string;
  mathJaxEnabled?: boolean;
  placeholder?: string;
  submitLabel?: string;
  isReply?: boolean;
  isEditing?: boolean;
  className?: string;
}

const MATH_SYNTAX_HELP = [
  { syntax: '\\(x^2\\)', description: 'Inline math: x²' },
  { syntax: '\\[\\frac{a}{b}\\]', description: 'Display math: fraction' },
  { syntax: '\\sum_{i=1}^{n}', description: 'Summation notation' },
  { syntax: '\\int_{a}^{b}', description: 'Integral notation' },
  { syntax: '\\sqrt{x}', description: 'Square root' },
  { syntax: '\\alpha, \\beta', description: 'Greek letters' },
];

/**
 * Rich text editor component with real-time MathJax preview
 * Supports LaTeX expressions, content sanitization, and draft saving
 */
export function PostComposer({
  threadId,
  parentPostId,
  onSubmit,
  onCancel,
  initialContent = '',
  mathJaxEnabled = true,
  placeholder = 'Write your post...',
  submitLabel = 'Post Reply',
  isReply = false,
  isEditing = false,
  className,
}: PostComposerProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMathHelp, setShowMathHelp] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    content,
    setContent,
    isDirty,
    isValid,
    validationErrors,
    draftSaved,
    clearDraft,
    processContentForSubmission,
  } = usePostComposer({
    threadId,
    parentPostId,
    initialContent,
    isEditing,
    mathJaxEnabled,
    autoSaveDrafts: !isEditing,
  });

  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const postContent = processContentForSubmission();
      await onSubmit(postContent);

      // Clear draft after successful submission
      if (!isEditing) {
        clearDraft();
      }

      // Reset form
      setContent('');
      setShowPreview(false);
    } catch (error) {
      console.error('Failed to submit post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Insert math template at cursor
  const insertMathTemplate = (template: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent =
      content.substring(0, start) + template + content.substring(end);

    setContent(newContent);

    // Focus and set cursor position
    setTimeout(() => {
      textarea.focus();
      const cursorPos = start + template.length;
      textarea.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className='pb-4'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg'>
            {isEditing ? 'Edit Post' : isReply ? 'Reply to Thread' : 'New Post'}
          </CardTitle>
          <div className='flex items-center gap-2'>
            {draftSaved && (
              <Badge variant='outline' className='text-xs'>
                <Save className='w-3 h-3 mr-1' />
                Draft saved
              </Badge>
            )}
            {mathJaxEnabled && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setShowMathHelp(!showMathHelp)}
              >
                <Info className='w-4 h-4 mr-1' />
                Math Help
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Math Help Panel */}
        {showMathHelp && mathJaxEnabled && (
          <Card className='bg-muted/50'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm'>LaTeX Math Syntax</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-2 text-sm'>
                {MATH_SYNTAX_HELP.map((item, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between p-2 rounded border cursor-pointer hover:bg-background'
                    onClick={() => insertMathTemplate(item.syntax)}
                  >
                    <code className='text-xs bg-background px-1 rounded'>
                      {item.syntax}
                    </code>
                    <span className='text-muted-foreground text-xs'>
                      {item.description}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Editor Tabs */}
        <Tabs value={showPreview ? 'preview' : 'write'} className='w-full'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='write' onClick={() => setShowPreview(false)}>
              Write
            </TabsTrigger>
            <TabsTrigger
              value='preview'
              onClick={() => setShowPreview(true)}
              disabled={!content.trim()}
            >
              <Eye className='w-4 h-4 mr-1' />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value='write' className='mt-4'>
            <div className='space-y-2'>
              <Label htmlFor='post-content'>Content</Label>
              <Textarea
                ref={textareaRef}
                id='post-content'
                value={content}
                onChange={handleContentChange}
                placeholder={placeholder}
                className='min-h-[200px] font-mono text-sm'
                disabled={isSubmitting}
              />
              <div className='flex justify-between text-xs text-muted-foreground'>
                <span>
                  {mathJaxEnabled &&
                    'Use \\(...\\) for inline math, \\[...\\] for display math'}
                </span>
                <span>{content.length}/10,000</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value='preview' className='mt-4'>
            <div className='space-y-2'>
              <Label>Preview</Label>
              <div className='min-h-[200px] p-4 border rounded-md bg-background'>
                <MathJaxPreview content={content} />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className='space-y-2'>
            {validationErrors.map((error, index) => (
              <div
                key={index}
                className='flex items-center gap-2 text-sm text-destructive'
              >
                <AlertCircle className='w-4 h-4' />
                {error}
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className='flex items-center justify-between pt-4'>
          <div className='flex items-center gap-2'>
            {onCancel && (
              <Button
                variant='outline'
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !isValid}
            className='min-w-[120px]'
          >
            {isSubmitting ? (
              <>
                <div className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2' />
                Posting...
              </>
            ) : (
              <>
                <Send className='w-4 h-4 mr-2' />
                {submitLabel}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
