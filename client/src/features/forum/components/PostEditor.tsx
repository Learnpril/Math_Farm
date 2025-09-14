import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs';
import { AlertCircle, Save, X, History, Eye } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { PostComposer } from './PostComposer';
import { MathJaxPreview } from './MathJaxPreview';
import { ForumPost, PostContent } from '../types';

export interface PostEditHistory {
  id: string;
  postId: number;
  previousContent: string;
  newContent: string;
  editedBy: number;
  editedByName: string;
  editReason?: string;
  editedAt: Date;
}

export interface PostEditorProps {
  post: ForumPost;
  onSave: (content: PostContent, editReason?: string) => Promise<void>;
  onCancel: () => void;
  editHistory?: PostEditHistory[];
  canViewHistory?: boolean;
  className?: string;
}

/**
 * Post editing interface with change tracking and edit history
 * Supports moderation features and transparent edit logging
 */
export function PostEditor({
  post,
  onSave,
  onCancel,
  editHistory = [],
  canViewHistory = false,
  className,
}: PostEditorProps) {
  const [editReason, setEditReason] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle save with edit reason
  const handleSave = async (content: PostContent) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await onSave(content, editReason.trim() || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
      throw err; // Re-throw to let PostComposer handle it
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format edit history for display
  const formatEditHistory = (history: PostEditHistory[]) => {
    return history.sort(
      (a, b) => new Date(b.editedAt).getTime() - new Date(a.editedAt).getTime()
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Edit Header */}
      <Card>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <CardTitle className='text-lg'>Edit Post</CardTitle>
              {post.isEdited && (
                <Badge variant='outline' className='text-xs'>
                  Previously edited
                </Badge>
              )}
            </div>
            <div className='flex items-center gap-2'>
              {canViewHistory && editHistory.length > 0 && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setShowHistory(!showHistory)}
                >
                  <History className='w-4 h-4 mr-1' />
                  History ({editHistory.length})
                </Button>
              )}
              <Button variant='ghost' size='sm' onClick={onCancel}>
                <X className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className='space-y-4'>
          {/* Edit Reason Input */}
          <div className='space-y-2'>
            <label htmlFor='edit-reason' className='text-sm font-medium'>
              Edit Reason (Optional)
            </label>
            <input
              id='edit-reason'
              type='text'
              value={editReason}
              onChange={e => setEditReason(e.target.value)}
              placeholder='Briefly describe your changes...'
              className='w-full px-3 py-2 text-sm border rounded-md bg-background'
              disabled={isSubmitting}
            />
            <p className='text-xs text-muted-foreground'>
              Providing an edit reason helps maintain transparency in the
              community
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className='flex items-center gap-2 text-sm text-destructive'>
              <AlertCircle className='w-4 h-4' />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Post Composer */}
      <PostComposer
        initialContent={post.content}
        onSubmit={handleSave}
        onCancel={onCancel}
        isEditing={true}
        submitLabel='Save Changes'
        placeholder='Edit your post content...'
        mathJaxEnabled={true}
      />

      {/* Edit History */}
      {showHistory && canViewHistory && (
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Edit History</CardTitle>
          </CardHeader>
          <CardContent>
            {editHistory.length === 0 ? (
              <p className='text-muted-foreground text-sm'>
                No edit history available
              </p>
            ) : (
              <div className='space-y-4'>
                {formatEditHistory(editHistory).map((edit, index) => (
                  <EditHistoryItem
                    key={edit.id}
                    edit={edit}
                    isLatest={index === 0}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface EditHistoryItemProps {
  edit: PostEditHistory;
  isLatest: boolean;
}

function EditHistoryItem({ edit, isLatest }: EditHistoryItemProps) {
  const [showDiff, setShowDiff] = useState(false);

  return (
    <div className='border rounded-lg p-4 space-y-3'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <span className='font-medium text-sm'>{edit.editedByName}</span>
          {isLatest && (
            <Badge variant='outline' className='text-xs'>
              Latest
            </Badge>
          )}
        </div>
        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          <span>{new Date(edit.editedAt).toLocaleString()}</span>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setShowDiff(!showDiff)}
          >
            <Eye className='w-3 h-3 mr-1' />
            {showDiff ? 'Hide' : 'Show'} Changes
          </Button>
        </div>
      </div>

      {edit.editReason && (
        <div className='text-sm'>
          <span className='font-medium'>Reason: </span>
          <span className='text-muted-foreground'>{edit.editReason}</span>
        </div>
      )}

      {showDiff && (
        <Tabs defaultValue='before' className='w-full'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='before'>Before</TabsTrigger>
            <TabsTrigger value='after'>After</TabsTrigger>
          </TabsList>

          <TabsContent value='before' className='mt-3'>
            <div className='p-3 border rounded bg-muted/50'>
              <MathJaxPreview
                content={edit.previousContent}
                className='text-sm'
              />
            </div>
          </TabsContent>

          <TabsContent value='after' className='mt-3'>
            <div className='p-3 border rounded bg-background'>
              <MathJaxPreview content={edit.newContent} className='text-sm' />
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
