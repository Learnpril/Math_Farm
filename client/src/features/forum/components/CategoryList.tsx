import React from 'react';
import { Link } from 'wouter';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { MessageSquare, Users, Clock, ChevronRight } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface ForumCategory {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  sortOrder: number;
  threadCount: number;
  postCount: number;
  lastActivity?: {
    threadTitle: string;
    authorName: string;
    timestamp: Date;
  };
  children?: ForumCategory[];
}

interface CategoryListProps {
  categories: ForumCategory[];
  className?: string;
  showHierarchy?: boolean;
}

/**
 * Forum category list component with hierarchical display support
 * Shows category information, thread counts, and recent activity
 */
export function CategoryList({
  categories,
  className = '',
  showHierarchy = true,
}: CategoryListProps) {
  // Filter and organize categories by hierarchy
  const rootCategories = categories.filter(cat => !cat.parentId);
  const categoryMap = new Map(categories.map(cat => [cat.id, cat]));

  // Build hierarchy
  const buildHierarchy = (cats: ForumCategory[]): ForumCategory[] => {
    return cats.map(category => ({
      ...category,
      children: showHierarchy
        ? categories.filter(cat => cat.parentId === category.id)
        : undefined,
    }));
  };

  const hierarchicalCategories = buildHierarchy(rootCategories);

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
    return `${diffInWeeks}w ago`;
  };

  const CategoryCard = ({
    category,
    level = 0,
  }: {
    category: ForumCategory;
    level?: number;
  }) => (
    <Card
      key={category.id}
      className={cn(
        'hover:shadow-md transition-shadow',
        level > 0 && 'ml-6 border-l-4 border-l-primary/20'
      )}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <CardTitle className='text-lg'>
              <Link
                href={`/forum/category/${category.id}`}
                className='hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm'
              >
                <span className='flex items-center gap-2'>
                  {category.name}
                  <ChevronRight className='h-4 w-4 opacity-50' />
                </span>
              </Link>
            </CardTitle>
            {category.description && (
              <p className='text-sm text-muted-foreground mt-1'>
                {category.description}
              </p>
            )}
          </div>

          {/* Category stats */}
          <div className='flex items-center gap-4 text-sm text-muted-foreground'>
            <div className='flex items-center gap-1'>
              <MessageSquare className='h-4 w-4' />
              <span>{category.threadCount}</span>
            </div>
            <div className='flex items-center gap-1'>
              <Users className='h-4 w-4' />
              <span>{category.postCount}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className='pt-0'>
        <div className='flex items-center justify-between'>
          {/* Subcategory count */}
          <div className='flex items-center gap-2'>
            {category.children && category.children.length > 0 && (
              <Badge variant='secondary' className='text-xs'>
                {category.children.length} subcategories
              </Badge>
            )}
          </div>

          {/* Last activity */}
          {category.lastActivity && (
            <div className='flex items-center gap-2 text-xs text-muted-foreground'>
              <Clock className='h-3 w-3' />
              <span>
                Last: {category.lastActivity.threadTitle} by{' '}
                {category.lastActivity.authorName}
              </span>
              <span>•</span>
              <span>{formatTimeAgo(category.lastActivity.timestamp)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div
      className={cn('space-y-4', className)}
      role='list'
      aria-label='Forum categories'
    >
      {hierarchicalCategories.map(category => (
        <div key={category.id} role='listitem'>
          <CategoryCard category={category} level={0} />

          {/* Render subcategories */}
          {category.children && category.children.length > 0 && (
            <div className='mt-2 space-y-2'>
              {category.children.map(subCategory => (
                <CategoryCard
                  key={subCategory.id}
                  category={subCategory}
                  level={1}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Compact category list for sidebar or smaller spaces
 */
interface CompactCategoryListProps {
  categories: ForumCategory[];
  className?: string;
}

export function CompactCategoryList({
  categories,
  className = '',
}: CompactCategoryListProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <h3 className='font-semibold text-sm text-muted-foreground uppercase tracking-wide'>
        Categories
      </h3>
      <nav role='navigation' aria-label='Category navigation'>
        <ul className='space-y-1'>
          {categories.map(category => (
            <li key={category.id}>
              <Link
                href={`/forum/category/${category.id}`}
                className='flex items-center justify-between p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
              >
                <span className='text-sm font-medium'>{category.name}</span>
                <Badge variant='secondary' className='text-xs'>
                  {category.threadCount}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
