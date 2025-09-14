import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'wouter';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import {
  ArrowLeft,
  Share2,
  Flag,
  Users,
  MessageSquare,
  Clock,
  Eye,
} from 'lucide-react';
import { ForumLayout, ForumPageHeader } from '../components/ForumLayout';
import { ThreadView } from '../components/ThreadView';

// Mock data - in real app this would come from API
const mockThread = {
  id: 1,
  title: "Beautiful proof of Euler's identity",
  categoryId: 1,
  categoryName: 'General Math Discussion',
  authorId: 1,
  authorName: 'EulerFan',
  isPinned: true,
  isLocked: false,
  postCount: 15,
  lastPostAt: new Date(Date.now() - 30 * 60 * 1000),
  createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
};

const mockPosts = [
  {
    id: 1,
    threadId: 1,
    authorId: 1,
    authorName: 'EulerFan',
    parentPostId: undefined,
    content: `I wanted to share this elegant proof I found that connects e^(iπ) + 1 = 0. 

The way it brings together exponentials, trigonometry, and complex numbers is absolutely beautiful!

Starting with Euler's formula: e^(ix) = cos(x) + i·sin(x)

When we substitute x = π:
e^(iπ) = cos(π) + i·sin(π)
e^(iπ) = -1 + i·0
e^(iπ) = -1

Therefore: e^(iπ) + 1 = 0

This simple equation connects five fundamental mathematical constants: e, i, π, 1, and 0. It's often called "the most beautiful equation in mathematics."`,
    mathExpressions: [
      { type: 'latex', content: 'e^{i\\pi} + 1 = 0' },
      { type: 'latex', content: 'e^{ix} = \\cos(x) + i\\sin(x)' },
    ],
    isEdited: false,
    editedAt: undefined,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    likeCount: 45,
    isLiked: false,
  },
  {
    id: 2,
    threadId: 1,
    authorId: 2,
    authorName: 'MathStudent123',
    parentPostId: 1,
    content: `This is amazing! I never understood why this equation was considered so beautiful until I saw this explanation. 

The way it connects all these fundamental constants is mind-blowing. Thank you for sharing!`,
    mathExpressions: [],
    isEdited: false,
    editedAt: undefined,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
    likeCount: 12,
    isLiked: true,
  },
  {
    id: 3,
    threadId: 1,
    authorId: 3,
    authorName: 'ComplexAnalyst',
    parentPostId: 1,
    content: `Great explanation! For those interested in diving deeper, this identity is a special case of Euler's formula when x = π.

The geometric interpretation is also fascinating - it represents a rotation of 180° in the complex plane, which takes you from 1 to -1.`,
    mathExpressions: [
      {
        type: 'latex',
        content: 'e^{i\\theta} = \\cos(\\theta) + i\\sin(\\theta)',
      },
    ],
    isEdited: true,
    editedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(
      Date.now() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
    ),
    likeCount: 23,
    isLiked: false,
  },
];

const mockRelatedThreads = [
  {
    id: 2,
    title: 'Complex numbers and their applications',
    categoryName: 'Advanced Math',
    postCount: 18,
    lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 3,
    title: 'Understanding e and natural logarithms',
    categoryName: 'Calculus',
    postCount: 12,
    lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 4,
    title: 'Trigonometric identities masterlist',
    categoryName: 'Trigonometry',
    postCount: 31,
    lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
];

/**
 * Thread page component showing a forum thread with all its posts
 */
export function ThreadPage() {
  const { threadId } = useParams<{ threadId: string }>();
  const [thread, setThread] = useState(mockThread);
  const [posts, setPosts] = useState(mockPosts);
  const [loading, setLoading] = useState(false);
  const [viewCount] = useState(127); // Mock view count

  useEffect(() => {
    // In real app, fetch thread and posts data
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [threadId]);

  const breadcrumbs = [
    { label: 'Forum', href: '/community' },
    {
      label: thread.categoryName,
      href: `/forum/category/${thread.categoryId}`,
    },
    { label: thread.title, isActive: true },
  ];

  const handleReply = (postId?: number) => {
    // In real app, open reply composer
    console.log('Reply to post:', postId || 'thread');
  };

  const handleLike = (postId: number) => {
    // In real app, toggle like status
    console.log('Like post:', postId);
  };

  const handleReport = (postId: number) => {
    // In real app, open report dialog
    console.log('Report post:', postId);
  };

  const handleShare = (postId: number) => {
    // In real app, copy share link
    const url = `${window.location.origin}/forum/thread/${threadId}#post-${postId}`;
    navigator.clipboard.writeText(url);
    console.log('Shared post:', postId);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const sidebar = (
    <div className='space-y-6'>
      {/* Thread stats */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Thread Stats</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <MessageSquare className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm'>Replies</span>
            </div>
            <Badge variant='secondary'>{thread.postCount}</Badge>
          </div>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Eye className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm'>Views</span>
            </div>
            <Badge variant='secondary'>{viewCount}</Badge>
          </div>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Clock className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm'>Last Reply</span>
            </div>
            <span className='text-xs text-muted-foreground'>
              {thread.lastPostAt
                ? formatTimeAgo(thread.lastPostAt)
                : 'No replies'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Related threads */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Related Discussions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {mockRelatedThreads.map(relatedThread => (
              <div key={relatedThread.id} className='space-y-1'>
                <Link
                  href={`/forum/thread/${relatedThread.id}`}
                  className='text-sm font-medium hover:text-primary transition-colors line-clamp-2'
                >
                  {relatedThread.title}
                </Link>
                <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                  <span>{relatedThread.categoryName}</span>
                  <span>•</span>
                  <span>{relatedThread.postCount} replies</span>
                  <span>•</span>
                  <span>{formatTimeAgo(relatedThread.lastActivity)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Thread actions */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Actions</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          <Button
            variant='outline'
            size='sm'
            className='w-full justify-start'
            onClick={() => handleShare(posts[0]?.id)}
          >
            <Share2 className='h-4 w-4 mr-2' />
            Share Thread
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='w-full justify-start'
            onClick={() => handleReport(posts[0]?.id)}
          >
            <Flag className='h-4 w-4 mr-2' />
            Report Thread
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <ForumLayout breadcrumbs={breadcrumbs} sidebar={sidebar}>
        <div className='space-y-4'>
          <div className='h-8 bg-muted animate-pulse rounded' />
          <div className='h-32 bg-muted animate-pulse rounded' />
          <div className='h-32 bg-muted animate-pulse rounded' />
          <div className='h-32 bg-muted animate-pulse rounded' />
        </div>
      </ForumLayout>
    );
  }

  return (
    <ForumLayout breadcrumbs={breadcrumbs} sidebar={sidebar}>
      <div className='space-y-6'>
        {/* Back button */}
        <div className='flex items-center gap-4'>
          <Button variant='outline' asChild>
            <Link href={`/forum/category/${thread.categoryId}`}>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to {thread.categoryName}
            </Link>
          </Button>
        </div>

        {/* Thread view */}
        <ThreadView
          thread={thread}
          posts={posts}
          onReply={handleReply}
          onLike={handleLike}
          onReport={handleReport}
          onShare={handleShare}
          currentUserId={1} // Mock current user ID
        />
      </div>
    </ForumLayout>
  );
}
