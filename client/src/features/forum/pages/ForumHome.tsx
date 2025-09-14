import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import {
  Search,
  Plus,
  TrendingUp,
  MessageSquare,
  Users,
  Clock,
  Pin,
  Lock,
} from 'lucide-react';
import { ForumLayout, ForumPageHeader } from '../components/ForumLayout';
import { CategoryList } from '../components/CategoryList';

// Mock data - in real app this would come from API
const mockCategories = [
  {
    id: 1,
    name: 'General Math Discussion',
    description: 'General mathematics topics and questions',
    parentId: undefined,
    sortOrder: 1,
    threadCount: 45,
    postCount: 234,
    lastActivity: {
      threadTitle: 'Help with quadratic equations',
      authorName: 'MathStudent123',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
  },
  {
    id: 2,
    name: 'Algebra',
    description: 'Linear algebra, abstract algebra, and algebraic structures',
    parentId: undefined,
    sortOrder: 2,
    threadCount: 67,
    postCount: 412,
    lastActivity: {
      threadTitle: 'Matrix multiplication shortcuts',
      authorName: 'AlgebraExpert',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    },
  },
  {
    id: 3,
    name: 'Calculus',
    description: 'Differential and integral calculus discussions',
    parentId: undefined,
    sortOrder: 3,
    threadCount: 89,
    postCount: 567,
    lastActivity: {
      threadTitle: 'Integration by parts explained',
      authorName: 'CalculusGuru',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    },
  },
  {
    id: 4,
    name: 'Geometry',
    description: 'Euclidean geometry, coordinate geometry, and more',
    parentId: undefined,
    sortOrder: 4,
    threadCount: 34,
    postCount: 189,
    lastActivity: {
      threadTitle: 'Proof of Pythagorean theorem',
      authorName: 'GeometryFan',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    },
  },
];

const mockRecentThreads = [
  {
    id: 1,
    title: "Beautiful proof of Euler's identity",
    categoryName: 'Advanced Math',
    authorName: 'EulerFan',
    postCount: 15,
    lastActivity: new Date(Date.now() - 30 * 60 * 1000),
    isPinned: true,
    isLocked: false,
  },
  {
    id: 2,
    title: 'Help with quadratic formula derivation',
    categoryName: 'Algebra',
    authorName: 'MathLearner23',
    postCount: 8,
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isPinned: false,
    isLocked: false,
  },
  {
    id: 3,
    title: 'Integration techniques masterclass',
    categoryName: 'Calculus',
    authorName: 'CalculusTeacher',
    postCount: 23,
    lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000),
    isPinned: false,
    isLocked: true,
  },
];

/**
 * Forum home page component showing categories and recent activity
 */
export function ForumHome() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState(mockCategories);
  const [recentThreads, setRecentThreads] = useState(mockRecentThreads);

  const breadcrumbs = [{ label: 'Forum', isActive: true }];

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to search results
    window.location.href = `/forum/search?q=${encodeURIComponent(searchQuery)}`;
  };

  const sidebar = (
    <div className='space-y-6'>
      {/* Forum Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Forum Features</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <Link
            href='/forum/avatar-demo'
            className='flex items-center gap-3 p-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors group'
          >
            <div className='w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-white text-sm font-bold group-hover:scale-110 transition-transform'>
              🎭
            </div>
            <div className='flex-1'>
              <div className='font-medium'>Avatar System</div>
              <div className='text-xs text-muted-foreground'>
                Customize your chibi avatar
              </div>
            </div>
          </Link>

          <Link
            href='/forum/achievements'
            className='flex items-center gap-3 p-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors group opacity-60'
          >
            <div className='w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold'>
              🏆
            </div>
            <div className='flex-1'>
              <div className='font-medium'>Achievements</div>
              <div className='text-xs text-muted-foreground'>Coming soon</div>
            </div>
          </Link>

          <Link
            href='/forum/leaderboard'
            className='flex items-center gap-3 p-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors group opacity-60'
          >
            <div className='w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold'>
              📊
            </div>
            <div className='flex-1'>
              <div className='font-medium'>Leaderboard</div>
              <div className='text-xs text-muted-foreground'>Coming soon</div>
            </div>
          </Link>
        </CardContent>
      </Card>

      {/* Forum stats */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Forum Stats</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <MessageSquare className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm'>Total Threads</span>
            </div>
            <Badge variant='secondary'>235</Badge>
          </div>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Users className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm'>Total Posts</span>
            </div>
            <Badge variant='secondary'>1,402</Badge>
          </div>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <TrendingUp className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm'>Active Users</span>
            </div>
            <Badge variant='secondary'>89</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {recentThreads.slice(0, 5).map(thread => (
              <div key={thread.id} className='space-y-1'>
                <div className='flex items-start gap-2'>
                  {thread.isPinned && (
                    <Pin className='h-3 w-3 text-primary mt-1 flex-shrink-0' />
                  )}
                  {thread.isLocked && (
                    <Lock className='h-3 w-3 text-muted-foreground mt-1 flex-shrink-0' />
                  )}
                  <div className='min-w-0 flex-1'>
                    <Link
                      href={`/forum/thread/${thread.id}`}
                      className='text-sm font-medium hover:text-primary transition-colors line-clamp-2'
                    >
                      {thread.title}
                    </Link>
                    <div className='flex items-center gap-2 text-xs text-muted-foreground mt-1'>
                      <span>{thread.categoryName}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(thread.lastActivity)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <ForumLayout breadcrumbs={breadcrumbs} sidebar={sidebar}>
      <ForumPageHeader
        title='Math Farm Forum'
        description='Connect with fellow math enthusiasts, ask questions, and share knowledge'
        actions={
          <div className='flex gap-2'>
            <Button variant='outline' asChild>
              <Link href='/forum/avatar-demo'>
                <span className='mr-2'>🎭</span>
                Avatar System
              </Link>
            </Button>
            <Button asChild>
              <Link href='/forum/new-thread'>
                <Plus className='h-4 w-4 mr-2' />
                New Thread
              </Link>
            </Button>
          </div>
        }
      />

      {/* Search bar */}
      <Card className='mb-6'>
        <CardContent className='p-4'>
          <form onSubmit={handleSearch} className='flex gap-2'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search discussions, topics, or users...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>
            <Button type='submit'>Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-semibold'>Categories</h2>
          <div className='text-sm text-muted-foreground'>
            {categories.length} categories
          </div>
        </div>

        <CategoryList categories={categories} />
      </div>
    </ForumLayout>
  );
}
