// Core components (always loaded)
export {
  ForumLayout,
  ForumPageHeader,
  ForumSection,
} from './components/ForumLayout';
export { CategoryList, CompactCategoryList } from './components/CategoryList';

// Performance-optimized components
export {
  LazyThreadView,
  LazyPostComposer,
  LazyForumSearch,
  LazyModerationDashboard,
  LazyActivityFeed,
  SuspendedThreadView,
  SuspendedPostComposer,
  SuspendedForumSearch,
  preloadThreadView,
  preloadPostComposer,
  preloadForumSearch,
  usePreloadOnHover,
} from './components/LazyForumComponents';

// Virtualized components for performance
export { VirtualizedThreadList } from './components/VirtualizedThreadList';
export { VirtualizedPostList } from './components/VirtualizedPostList';
export { ThreadListItem } from './components/ThreadListItem';

// Optimized images
export {
  OptimizedForumImage,
  ForumAvatarImage,
  ForumAttachmentImage,
} from './components/OptimizedForumImage';

// Code splitting utilities
export {
  ForumPages,
  ForumComponents,
  AvatarComponents,
  HeavyFeatures,
  preloadForRoute,
  createPreloadTrigger,
  addForumResourceHints,
} from './lib/forum-code-splitting';

// Performance hooks
export {
  useForumPerformance,
  useVirtualizedListPerformance,
  useImageLoadingPerformance,
  useCodeSplittingPerformance,
  useForumPerformanceMonitor,
} from './hooks/useForumPerformance';

// Legacy exports for backward compatibility (direct imports)
export { ThreadList } from './components/ThreadList';
export { ThreadView } from './components/ThreadView';
export { PostItem } from './components/PostItem';

// Forum pages (can be lazy-loaded)
export { ForumHome } from './pages/ForumHome';
export { CategoryPage } from './pages/CategoryPage';
export { ThreadPage } from './pages/ThreadPage';

// Types
export type {
  ForumCategory,
  ForumThread,
  ForumPost,
  ForumUser,
  ForumReport,
  MathExpression,
  AvatarConfig,
  AvatarLayer,
  BreadcrumbItem,
  ForumApiResponse,
  PaginatedResponse,
  ThreadSortBy,
  PostSortBy,
  ForumPermission,
  UserPermissions,
} from './types';
