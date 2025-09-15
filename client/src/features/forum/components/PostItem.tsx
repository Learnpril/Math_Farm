import React, { useState } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  User,
  Clock,
  Heart,
  MessageSquare,
  Share2,
  Flag,
  Reply,
  ChevronDown,
  ChevronUp,
  Edit,
  Quote,
  MoreHorizontal,
  History,
} from 'lucide-react';
import { PostEditor } from './PostEditor';
import { PostReportDialog } from './PostReportDialog';
import { MathJaxPreview } from './MathJaxPreview';
import { PostContentRenderer } from './PostContentRenderer';
import { ForumAvatarDisplay } from './avatar/ForumAvatarDisplay';
import { useModeration } from '../hooks/useModeration';
import { cn } from '../../../lib/utils';
import type { AvatarConfig } from '../types/avatar';

interface ForumPost {
  id: number;
  threadId: number;
  authorId: number;
  authorName: string;
  parentPostId?: number;
  content: string;
  mathExpressions?: any[];
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
  likeCount?: number;
  isLiked?: boolean;
  replies?: ForumPost[];
  // Avatar and user data
  authorAvatar?: AvatarConfig;
  authorAchievements?: string[];
  authorStats?: {
    posts: number;
    likes: number;
    helpfulAnswers: number;
    joinDate: Date;
    lastActive: Date;
  };
}

interface PostItemProps {
  post: ForumPost;
  level?: number;
  expandedPosts?: Set<number>;
  onToggleExpansion?: (postId: number) => void;
  onReply?: (postId?: number) => void;
  onLike?: (postId: number) => void;
  onReport?: (postId: number) => void;
  onShare?: (postId: number) => void;
  onQuote?: (postId: number) => void;
  onEdit?: (
    postId: number,
    content?: any,
    editReason?: string
  ) => Promise<void>;
  currentUserId?: number;
  isThreadLocked?: boolean;
  className?: string;
  onStartTyping?: () => void;
  onStopTyping?: () => void;
}

/**
 * Individual post component with user avatar, content, and interaction buttons
 * Supports nested replies and MathJax expression rendering
 */
export function PostItem({
  post,
  level = 0,
  expandedPosts = new Set(),
  onToggleExpansion,
  onReply,
  onLike,
  onReport,
  onShare,
  onQuote,
  onEdit,
  currentUserId,
  isThreadLocked = false,
  className = '',
}: PostItemProps) {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showEditHistory, setShowEditHistory] = useState(false);
  const isExpanded = expandedPosts.has(post.id);
  const hasReplies = post.replies && post.replies.length > 0;
  const isAuthor = currentUserId === post.authorId;
  const maxNestingLevel = 3; // Limit nesting depth for readability

  const { submitReport, getEditHistory } = useModeration();

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    const diffInMonths = Math.floor(diffInWeeks / 4);
    return `${diffInMonths}mo ago`;
  };

  // Handle avatar click to view user profile
  const handleAvatarClick = () => {
    // Navigate to user profile page
    window.location.href = `/forum/user/${post.authorId}`;
  };

  return (
    <div
      className={cn(
        'relative',
        level > 0 && 'ml-6 border-l-2 border-muted pl-4',
        level > maxNestingLevel && 'ml-0 border-l-0 pl-0',
        className
      )}
      role='listitem'
    >
      <Card className='hover:shadow-sm transition-shadow'>
        <CardContent className='p-4'>
          <div className='flex gap-4'>
            {/* User avatar */}
            <div className='flex-shrink-0'>
              <ForumAvatarDisplay
                config={post.authorAvatar}
                username={post.authorName}
                userId={post.authorId}
                size='xl'
                showUsername={false}
                showAchievements={true}
                showHoverCard={true}
                achievements={post.authorAchievements}
                userStats={post.authorStats}
                onClick={handleAvatarClick}
              />
            </div>

            {/* Post content */}
            <div className='flex-1 min-w-0'>
              {/* Post header */}
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center gap-3'>
                  <span className='font-semibold text-foreground'>
                    {post.authorName}
                  </span>
                  <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                    <Clock className='h-3 w-3' />
                    <time dateTime={post.createdAt.toISOString()}>
                      {formatTimeAgo(post.createdAt)}
                    </time>
                  </div>
                  {post.isEdited && post.editedAt && (
                    <Badge variant='secondary' className='text-xs'>
                      Edited {formatTimeAgo(post.editedAt)}
                    </Badge>
                  )}
                </div>

                {/* Post actions menu */}
                <div className='relative'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setShowActions(!showActions)}
                    className='h-8 w-8 p-0'
                  >
                    <MoreHorizontal className='h-4 w-4' />
                    <span className='sr-only'>Post actions</span>
                  </Button>

                  {showActions && (
                    <div className='absolute right-0 top-full mt-1 bg-background border border-border rounded-md shadow-lg z-10 min-w-[120px]'>
                      <div className='py-1'>
                        {!isThreadLocked && (
                          <>
                            <button
                              onClick={() => {
                                onReply?.(post.id);
                                setShowActions(false);
                              }}
                              className='flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground'
                            >
                              <Reply className='h-3 w-3' />
                              Reply
                            </button>
                            <button
                              onClick={() => {
                                onQuote?.(post.id);
                                setShowActions(false);
                              }}
                              className='flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground'
                            >
                              <Quote className='h-3 w-3' />
                              Quote
                            </button>
                          </>
                        )}

                        {isAuthor && (
                          <>
                            <button
                              onClick={() => {
                                setIsEditing(true);
                                setShowActions(false);
                              }}
                              className='flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground'
                            >
                              <Edit className='h-3 w-3' />
                              Edit
                            </button>
                            {post.isEdited && (
                              <button
                                onClick={() => {
                                  setShowEditHistory(true);
                                  setShowActions(false);
                                }}
                                className='flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground'
                              >
                                <History className='h-3 w-3' />
                                Edit History
                              </button>
                            )}
                          </>
                        )}

                        <button
                          onClick={() => {
                            onShare?.(post.id);
                            setShowActions(false);
                          }}
                          className='flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground'
                        >
                          <Share2 className='h-3 w-3' />
                          Share
                        </button>

                        {!isAuthor && (
                          <PostReportDialog
                            postId={post.id}
                            onSubmitReport={submitReport}
                            trigger={
                              <button
                                onClick={() => setShowActions(false)}
                                className='flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground text-destructive'
                              >
                                <Flag className='h-3 w-3' />
                                Report
                              </button>
                            }
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Post content or editor */}
              {isEditing ? (
                <div className='mb-4'>
                  <PostEditor
                    post={post}
                    onSave={async (content, editReason) => {
                      // Handle post update
                      await onEdit?.(post.id, content, editReason);
                      setIsEditing(false);
                    }}
                    onCancel={() => setIsEditing(false)}
                    canViewHistory={isAuthor}
                  />
                </div>
              ) : (
                <div className='mb-4'>
                  <PostContentRenderer
                    content={post.content}
                    showEmbeddedContent={true}
                    compactEmbeds={false}
                  />
                </div>
              )}

              {/* Post interaction buttons */}
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => onLike?.(post.id)}
                    className={cn(
                      'h-8 px-2',
                      post.isLiked && 'text-red-500 hover:text-red-600'
                    )}
                  >
                    <Heart
                      className={cn(
                        'h-4 w-4 mr-1',
                        post.isLiked && 'fill-current'
                      )}
                    />
                    {post.likeCount || 0}
                  </Button>

                  {hasReplies && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => onToggleExpansion?.(post.id)}
                      className='h-8 px-2'
                    >
                      <MessageSquare className='h-4 w-4 mr-1' />
                      {post.replies!.length} replies
                      {isExpanded ? (
                        <ChevronUp className='h-3 w-3 ml-1' />
                      ) : (
                        <ChevronDown className='h-3 w-3 ml-1' />
                      )}
                    </Button>
                  )}
                </div>

                {!isThreadLocked && (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => onReply?.(post.id)}
                    className='h-8 px-2'
                  >
                    <Reply className='h-4 w-4 mr-1' />
                    Reply
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nested replies */}
      {hasReplies && isExpanded && level < maxNestingLevel && (
        <div className='mt-4 space-y-4'>
          {post.replies!.map(reply => (
            <PostItem
              key={reply.id}
              post={reply}
              level={level + 1}
              expandedPosts={expandedPosts}
              onToggleExpansion={onToggleExpansion}
              onReply={onReply}
              onLike={onLike}
              onReport={onReport}
              onShare={onShare}
              onQuote={onQuote}
              onEdit={onEdit}
              currentUserId={currentUserId}
              isThreadLocked={isThreadLocked}
            />
          ))}
        </div>
      )}

      {/* Show "View more replies" for deeply nested threads */}
      {hasReplies && level >= maxNestingLevel && (
        <div className='mt-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              // Navigate to dedicated reply view
              window.location.href = `/forum/post/${post.id}/replies`;
            }}
          >
            View {post.replies!.length} more replies
          </Button>
        </div>
      )}

      {/* Click outside to close actions menu */}
      {showActions && (
        <div
          className='fixed inset-0 z-0'
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  );
}
