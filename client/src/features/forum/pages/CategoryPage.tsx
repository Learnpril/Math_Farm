import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'wouter';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import {
  Plus,
  ArrowLeft,
  MessageSquare,
  Users,
  TrendingUp,
  Filter,
} from 'lucide-react';
import { ForumLayout, ForumPageHeader } from '../components/ForumLayout';
import { ThreadList } from '../components/ThreadList';
import { CompactCategoryList } from '../components/CategoryList';

// Mock data - in real app this would come from API
const mockCategory = {
  id: 1,
  name: 'General Math Discussion',
  description: 'General mathematics topics and questions for all skill levels',
  parentId: undefined,
  sortOrder: 1,
  threadCount: 45,
  postCount: 234,
};

const mockThreads = [
  {
    id: 1,
    title: "Beautiful proof of Euler's identity",
    categoryId: 1,
    authorId: 1,
    authorName: 'EulerFan',
    isPinned: true,
    isLocked: false,
    postCount: 15,
    lastPostAt: new Date(Date.now() - 30 * 60 * 1000),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    lastPostAuthor: 'MathExpert42',
  },
  {
    id: 2,
    title: 'Help with quadratic formula derivation',
    categoryId: 1,
    authorId: 2,
    authorName: 'MathLearner23',
    isPinned: false,
    isLocked: false,
    postCount: 8,
    lastPostAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    lastPostAuthor: 'AlgebraHelper',
  },
  {
    id: 3,
    title: 'Integration techniques masterclass',
    categoryId: 1,
    authorId: 3,
    authorName: 'CalculusTeacher',
    isPinned: false,
    isLocked: true,
    postCount: 23,
    lastPostAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    lastPostAuthor: 'StudentHelper',
  },
];

const mockRelatedCategories = [
  {
    id: 2,
    name: 'Algebra',
    threadCount: 67,
    parentId: undefined,
    sortOrder: 2,
    postCount: 412,
  },
  {
    id: 3,
    name: 'Calculus',
    threadCount: 89,
    parentId: undefined,
    sortOrder: 3,
    postCount: 567,
  },
  {
    id: 4,
    name: 'Geometry',
    threadCount: 34,
    parentId: undefined,
    sortOrder: 4,
    postCount: 189,
  },
];

/**
 * Category page component showing threads within a specific category
 */
export function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [category, setCategory] = useState(mockCategory);
  const [threads, setThreads] = useState(mockThreads);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<
    'recent' | 'popular' | 'oldest' | 'title'
  >('recent');
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(threads.length / 10); // 10 threads per page

  useEffect(() => {
    // In real app, fetch category and threads data
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [categoryId]);

  const breadcrumbs = [
    { label: 'Forum', href: '/community' },
    { label: category.name, isActive: true },
  ];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // In real app, fetch new page data
  };

  const handleSortChange = (newSort: typeof sortBy) => {
    setSortBy(newSort);
    // In real app, re-fetch with new sort order
  };

  const sidebar = (
    <div className='space-y-6'>
      {/* Category info */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Category Info</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <MessageSquare className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm'>Threads</span>
            </div>
            <Badge variant='secondary'>{category.threadCount}</Badge>
          </div>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Users className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm'>Posts</span>
            </div>
            <Badge variant='secondary'>{category.postCount}</Badge>
          </div>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <TrendingUp className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm'>Active Today</span>
            </div>
            <Badge variant='secondary'>12</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Related categories */}
      <CompactCategoryList categories={mockRelatedCategories} />

      {/* Category rules */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Category Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2 text-sm text-muted-foreground'>
            <p>• Keep discussions math-related and constructive</p>
            <p>• Use clear, descriptive thread titles</p>
            <p>• Show your work when asking for help</p>
            <p>• Be respectful and helpful to other members</p>
            <p>• Search before posting to avoid duplicates</p>
          </div>
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
      <ForumPageHeader
        title={category.name}
        description={category.description}
        actions={
          <div className='flex items-center gap-2'>
            <Button variant='outline' asChild>
              <Link href='/community'>
                <ArrowLeft className='h-4 w-4 mr-2' />
                Back to Forum
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/forum/category/${categoryId}/new-thread`}>
                <Plus className='h-4 w-4 mr-2' />
                New Thread
              </Link>
            </Button>
          </div>
        }
      />

      {/* Category description */}
      {category.description && (
        <Card className='mb-6'>
          <CardContent className='p-4'>
            <p className='text-muted-foreground'>{category.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Threads */}
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-semibold'>Discussions</h2>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm'>
              <Filter className='h-4 w-4 mr-2' />
              Filter
            </Button>
          </div>
        </div>

        <ThreadList
          threads={threads}
          showPagination={true}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          sortBy={sortBy}
          onSortChange={handleSortChange}
        />
      </div>
    </ForumLayout>
  );
}
