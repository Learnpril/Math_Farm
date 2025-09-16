/**
 * Lazy-loaded forum components for improved performance
 * Components are loaded only when needed to reduce initial bundle size
 */

import { lazy, Suspense } from 'react';
import { Skeleton } from '../../../components/ui/LoadingStates';

// Lazy load heavy forum components
export const LazyThreadView = lazy(() =>
  import('./ThreadView').then(module => ({
    default: module.ThreadView,
  }))
);

export const LazyPostComposer = lazy(() =>
  import('./PostComposer').then(module => ({
    default: module.PostComposer,
  }))
);

export const LazyAvatarEditor = lazy(() =>
  import('./avatar/AvatarEditor').then(module => ({
    default: module.AvatarEditor,
  }))
);

export const LazyModerationDashboard = lazy(() =>
  import('./ModerationDashboard').then(module => ({
    default: module.ModerationDashboard,
  }))
);

export const LazyForumSearch = lazy(() =>
  import('./ForumSearch').then(module => ({
    default: module.ForumSearch,
  }))
);

export const LazyActivityFeed = lazy(() =>
  import('./ActivityFeed').then(module => ({
    default: module.ActivityFeed,
  }))
);

export const LazyUserManagementPanel = lazy(() =>
  import('./UserManagementPanel').then(module => ({
    default: module.UserManagementPanel,
  }))
);

// Lazy load forum pages
export const LazyForumHome = lazy(() =>
  import('../pages/ForumHome').then(module => ({
    default: module.ForumHome,
  }))
);

export const LazyThreadPage = lazy(() =>
  import('../pages/ThreadPage').then(module => ({
    default: module.ThreadPage,
  }))
);

export const LazyCategoryPage = lazy(() =>
  import('../pages/CategoryPage').then(module => ({
    default: module.CategoryPage,
  }))
);

export const LazySearchResultsPage = lazy(() =>
  import('../pages/SearchResultsPage').then(module => ({
    default: module.SearchResultsPage,
  }))
);

export const LazyDiscoveryPage = lazy(() =>
  import('../pages/DiscoveryPage').then(module => ({
    default: module.DiscoveryPage,
  }))
);

export const LazyAvatarEditorDemo = lazy(() =>
  import('../pages/AvatarEditorDemo').then(module => ({
    default: module.AvatarEditorDemo,
  }))
);

// Loading fallback components
export const ThreadViewSkeleton = () => (
  <div className='space-y-4'>
    <Skeleton className='h-8 w-3/4' />
    <div className='space-y-3'>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className='border rounded-lg p-4'>
          <div className='flex gap-4'>
            <Skeleton className='h-12 w-12 rounded-full' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-4 w-1/4' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-3/4' />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const PostComposerSkeleton = () => (
  <div className='border rounded-lg p-4 space-y-4'>
    <Skeleton className='h-4 w-1/4' />
    <Skeleton className='h-32 w-full' />
    <div className='flex gap-2'>
      <Skeleton className='h-8 w-16' />
      <Skeleton className='h-8 w-16' />
    </div>
  </div>
);

export const AvatarEditorSkeleton = () => (
  <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
    <div className='space-y-4'>
      <Skeleton className='h-6 w-1/3' />
      <div className='grid grid-cols-4 gap-2'>
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className='h-16 w-16' />
        ))}
      </div>
    </div>
    <div className='space-y-4'>
      <Skeleton className='h-6 w-1/3' />
      <Skeleton className='h-64 w-full' />
    </div>
  </div>
);

export const ForumSearchSkeleton = () => (
  <div className='space-y-4'>
    <Skeleton className='h-10 w-full' />
    <div className='space-y-2'>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className='border rounded-lg p-3'>
          <Skeleton className='h-4 w-3/4 mb-2' />
          <Skeleton className='h-3 w-1/2' />
        </div>
      ))}
    </div>
  </div>
);

// Wrapper components with suspense
export const SuspendedThreadView = (props: any) => (
  <Suspense fallback={<ThreadViewSkeleton />}>
    <LazyThreadView {...props} />
  </Suspense>
);

export const SuspendedPostComposer = (props: any) => (
  <Suspense fallback={<PostComposerSkeleton />}>
    <LazyPostComposer {...props} />
  </Suspense>
);

export const SuspendedAvatarEditor = (props: any) => (
  <Suspense fallback={<AvatarEditorSkeleton />}>
    <LazyAvatarEditor {...props} />
  </Suspense>
);

export const SuspendedForumSearch = (props: any) => (
  <Suspense fallback={<ForumSearchSkeleton />}>
    <LazyForumSearch {...props} />
  </Suspense>
);

// Preload functions for better UX
export const preloadThreadView = () => import('./ThreadView');
export const preloadPostComposer = () => import('./PostComposer');
export const preloadAvatarEditor = () => import('./avatar/AvatarEditor');
export const preloadForumSearch = () => import('./ForumSearch');

// Hook for preloading on hover
export const usePreloadOnHover = (preloadFn: () => Promise<any>) => {
  let preloadPromise: Promise<any> | null = null;

  return {
    onMouseEnter: () => {
      if (!preloadPromise) {
        preloadPromise = preloadFn();
      }
    },
    onFocus: () => {
      if (!preloadPromise) {
        preloadPromise = preloadFn();
      }
    },
  };
};
