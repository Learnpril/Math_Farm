// Forum components
export {
  ForumLayout,
  ForumPageHeader,
  ForumSection,
} from './components/ForumLayout';
export { CategoryList, CompactCategoryList } from './components/CategoryList';
export { ThreadList } from './components/ThreadList';
export { ThreadView } from './components/ThreadView';
export { PostItem } from './components/PostItem';

// Forum pages
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
