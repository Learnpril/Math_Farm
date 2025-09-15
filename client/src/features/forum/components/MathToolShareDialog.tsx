import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
// Using HTML input checkbox instead of custom component
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import { Share2, MessageSquare, ExternalLink, Copy, Check } from 'lucide-react';
import { ToolResult } from '../../../lib/toolUtils';
import {
  MathToolShareData,
  ForumShareOptions,
  createForumPostWithMathTool,
  createMathToolDeepLink,
} from '../lib/math-tool-integration';
import { MathJaxPreview } from './MathJaxPreview';
import { useForumApi } from '../hooks/useForumApi';

interface MathToolShareDialogProps {
  toolResult: ToolResult;
  trigger?: React.ReactNode;
  onShared?: (threadId: string) => void;
}

const SHARE_TYPES = [
  {
    value: 'result',
    label: 'Share Result',
    description: 'Share the calculation result',
  },
  {
    value: 'problem',
    label: 'Ask for Help',
    description: 'Ask for help with this problem',
  },
  {
    value: 'solution',
    label: 'Share Solution',
    description: 'Share a complete solution',
  },
  {
    value: 'graph',
    label: 'Share Graph',
    description: 'Share a function graph',
  },
];

const FORUM_CATEGORIES = [
  {
    id: 1,
    name: 'General Math',
    description: 'General mathematical discussions',
  },
  {
    id: 2,
    name: 'Algebra',
    description: 'Algebraic equations and expressions',
  },
  {
    id: 3,
    name: 'Calculus',
    description: 'Derivatives, integrals, and limits',
  },
  {
    id: 4,
    name: 'Trigonometry',
    description: 'Angles and trigonometric functions',
  },
  {
    id: 5,
    name: 'Linear Algebra',
    description: 'Vectors, matrices, and transformations',
  },
  { id: 6, name: 'Statistics', description: 'Data analysis and probability' },
  {
    id: 7,
    name: 'Geometry',
    description: 'Shapes, angles, and spatial relationships',
  },
  { id: 8, name: 'Math Tools', description: 'Calculator and tool discussions' },
];

export function MathToolShareDialog({
  toolResult,
  trigger,
  onShared,
}: MathToolShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shareType, setShareType] = useState<string>('result');
  const [customMessage, setCustomMessage] = useState('');
  const [threadTitle, setThreadTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [includeSteps, setIncludeSteps] = useState(true);
  const [includeDeepLink, setIncludeDeepLink] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [deepLink, setDeepLink] = useState<string>('');
  const [linkCopied, setLinkCopied] = useState(false);

  const { createThread, categories } = useForumApi();

  // Update preview when inputs change
  useEffect(() => {
    const shareData: MathToolShareData = {
      toolResult,
      shareType: shareType as any,
      includeSteps,
      customMessage: customMessage.trim() || undefined,
    };

    const forumPost = createForumPostWithMathTool(shareData, {
      title: threadTitle.trim() || undefined,
      categoryId: selectedCategory ? parseInt(selectedCategory) : undefined,
      includeDeepLink,
    });

    setPreviewContent(forumPost.content.text);
    setThreadTitle(prev => prev || forumPost.title || '');
    setSelectedCategory(prev => prev || forumPost.categoryId?.toString() || '');

    if (forumPost.deepLink) {
      setDeepLink(forumPost.deepLink);
    }
  }, [
    toolResult,
    shareType,
    includeSteps,
    customMessage,
    threadTitle,
    selectedCategory,
    includeDeepLink,
  ]);

  const handleSubmit = async () => {
    if (!threadTitle.trim() || !selectedCategory) return;

    setIsSubmitting(true);
    try {
      const shareData: MathToolShareData = {
        toolResult,
        shareType: shareType as any,
        includeSteps,
        customMessage: customMessage.trim() || undefined,
      };

      const forumPost = createForumPostWithMathTool(shareData, {
        title: threadTitle.trim(),
        categoryId: parseInt(selectedCategory),
        includeDeepLink,
      });

      // Create the forum thread
      const thread = await createThread({
        title: forumPost.title!,
        categoryId: forumPost.categoryId!,
        content: forumPost.content,
      });

      setIsOpen(false);
      onShared?.(thread.id.toString());

      // Reset form
      setCustomMessage('');
      setThreadTitle('');
      setSelectedCategory('');
      setShareType('result');
      setIncludeSteps(true);
      setIncludeDeepLink(true);
    } catch (error) {
      console.error('Failed to share to forum:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyDeepLink = async () => {
    try {
      await navigator.clipboard.writeText(deepLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const selectedShareType = SHARE_TYPES.find(type => type.value === shareType);
  const selectedCategoryData = FORUM_CATEGORIES.find(
    cat => cat.id.toString() === selectedCategory
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant='outline'
            size='sm'
            className='flex items-center gap-2'
          >
            <Share2 className='h-4 w-4' />
            Share to Forum
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <MessageSquare className='h-5 w-5' />
            Share {toolResult.toolName} to Forum
          </DialogTitle>
        </DialogHeader>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Configuration Panel */}
          <div className='space-y-4'>
            <Card>
              <CardContent className='p-4 space-y-4'>
                <div>
                  <Label htmlFor='share-type'>Share Type</Label>
                  <Select value={shareType} onValueChange={setShareType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SHARE_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className='font-medium'>{type.label}</div>
                            <div className='text-xs text-muted-foreground'>
                              {type.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedShareType && (
                    <p className='text-xs text-muted-foreground mt-1'>
                      {selectedShareType.description}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor='thread-title'>Thread Title</Label>
                  <Input
                    id='thread-title'
                    value={threadTitle}
                    onChange={e => setThreadTitle(e.target.value)}
                    placeholder='Enter thread title...'
                    maxLength={200}
                  />
                </div>

                <div>
                  <Label htmlFor='category'>Forum Category</Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select category...' />
                    </SelectTrigger>
                    <SelectContent>
                      {FORUM_CATEGORIES.map(category => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          <div>
                            <div className='font-medium'>{category.name}</div>
                            <div className='text-xs text-muted-foreground'>
                              {category.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCategoryData && (
                    <p className='text-xs text-muted-foreground mt-1'>
                      {selectedCategoryData.description}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor='custom-message'>
                    Custom Message (Optional)
                  </Label>
                  <Textarea
                    id='custom-message'
                    value={customMessage}
                    onChange={e => setCustomMessage(e.target.value)}
                    placeholder='Add your own message or question...'
                    rows={3}
                    maxLength={500}
                  />
                  <div className='text-xs text-muted-foreground text-right'>
                    {customMessage.length}/500
                  </div>
                </div>

                <div className='space-y-2'>
                  <label className='flex items-center space-x-2 text-sm'>
                    <input
                      type='checkbox'
                      id='include-steps'
                      checked={includeSteps}
                      onChange={e => setIncludeSteps(e.target.checked)}
                      disabled={
                        !toolResult.steps || toolResult.steps.length === 0
                      }
                      className='rounded border-border'
                    />
                    <span>Include step-by-step solution</span>
                  </label>

                  <label className='flex items-center space-x-2 text-sm'>
                    <input
                      type='checkbox'
                      id='include-deep-link'
                      checked={includeDeepLink}
                      onChange={e => setIncludeDeepLink(e.target.checked)}
                      className='rounded border-border'
                    />
                    <span>Include link to recreate in tool</span>
                  </label>
                </div>

                {deepLink && includeDeepLink && (
                  <div className='space-y-2'>
                    <Label className='text-sm'>Deep Link</Label>
                    <div className='flex items-center gap-2'>
                      <Input
                        value={deepLink}
                        readOnly
                        className='text-xs font-mono'
                      />
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={copyDeepLink}
                        className='flex items-center gap-1'
                      >
                        {linkCopied ? (
                          <Check className='h-3 w-3' />
                        ) : (
                          <Copy className='h-3 w-3' />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className='flex items-center justify-between'>
              <Button
                variant='outline'
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={
                  isSubmitting || !threadTitle.trim() || !selectedCategory
                }
                className='flex items-center gap-2'
              >
                {isSubmitting ? (
                  <>
                    <div className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin' />
                    Sharing...
                  </>
                ) : (
                  <>
                    <MessageSquare className='h-4 w-4' />
                    Share to Forum
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Preview Panel */}
          <div className='space-y-4'>
            <div>
              <Label className='text-sm font-medium'>Preview</Label>
              <Card className='mt-2'>
                <CardContent className='p-4'>
                  <div className='space-y-3'>
                    {/* Thread Header Preview */}
                    <div className='border-b pb-3'>
                      <h3 className='font-semibold text-lg'>
                        {threadTitle || 'Thread Title'}
                      </h3>
                      <div className='flex items-center gap-2 mt-1'>
                        <Badge variant='outline' className='text-xs'>
                          {selectedCategoryData?.name || 'Category'}
                        </Badge>
                        <Badge variant='secondary' className='text-xs'>
                          {selectedShareType?.label || 'Share Type'}
                        </Badge>
                      </div>
                    </div>

                    {/* Content Preview */}
                    <div className='prose prose-sm max-w-none'>
                      <MathJaxPreview content={previewContent} />
                    </div>

                    {/* Deep Link Preview */}
                    {deepLink && includeDeepLink && (
                      <div className='border-t pt-3'>
                        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                          <ExternalLink className='h-3 w-3' />
                          <span>
                            Includes link to recreate in {toolResult.toolName}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
