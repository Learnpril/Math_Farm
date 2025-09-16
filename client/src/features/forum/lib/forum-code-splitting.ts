/**
 * Code splitting utilities for forum feature modules
 * Implements dynamic imports and lazy loading for better performance
 */

import { lazy } from 'react';

// Forum page lazy imports
export const ForumPages = {
  Home: lazy(() =>
    import('../pages/ForumHome').then(module => ({
      default: module.ForumHome,
    }))
  ),

  Thread: lazy(() =>
    import('../pages/ThreadPage').then(module => ({
      default: module.ThreadPage,
    }))
  ),

  Category: lazy(() =>
    import('../pages/CategoryPage').then(module => ({
      default: module.CategoryPage,
    }))
  ),

  Search: lazy(() =>
    import('../pages/SearchResultsPage').then(module => ({
      default: module.SearchResultsPage,
    }))
  ),

  Discovery: lazy(() =>
    import('../pages/DiscoveryPage').then(module => ({
      default: module.DiscoveryPage,
    }))
  ),

  AvatarEditor: lazy(() =>
    import('../pages/AvatarEditorDemo').then(module => ({
      default: module.AvatarEditorDemo,
    }))
  ),

  AvatarSystem: lazy(() =>
    import('../pages/AvatarSystemDemo').then(module => ({
      default: module.AvatarSystemDemo,
    }))
  ),
};

// Forum component lazy imports
export const ForumComponents = {
  ThreadView: lazy(() =>
    import('../components/ThreadView').then(module => ({
      default: module.ThreadView,
    }))
  ),

  PostComposer: lazy(() =>
    import('../components/PostComposer').then(module => ({
      default: module.PostComposer,
    }))
  ),

  ForumSearch: lazy(() =>
    import('../components/ForumSearch').then(module => ({
      default: module.ForumSearch,
    }))
  ),

  ModerationDashboard: lazy(() =>
    import('../components/ModerationDashboard').then(module => ({
      default: module.ModerationDashboard,
    }))
  ),

  UserManagementPanel: lazy(() =>
    import('../components/UserManagementPanel').then(module => ({
      default: module.UserManagementPanel,
    }))
  ),

  ActivityFeed: lazy(() =>
    import('../components/ActivityFeed').then(module => ({
      default: module.ActivityFeed,
    }))
  ),

  NotificationDropdown: lazy(() =>
    import('../components/NotificationDropdown').then(module => ({
      default: module.NotificationDropdown,
    }))
  ),
};

// Avatar system lazy imports
export const AvatarComponents = {
  AvatarEditor: lazy(() =>
    import('../components/avatar/AvatarEditor').then(module => ({
      default: module.AvatarEditor,
    }))
  ),

  AvatarRenderer: lazy(() =>
    import('../components/avatar/AvatarRenderer').then(module => ({
      default: module.AvatarRenderer,
    }))
  ),

  AvatarManager: lazy(() =>
    import('../components/avatar/AvatarManager').then(module => ({
      default: module.AvatarManager,
    }))
  ),

  ForumAvatarDisplay: lazy(() =>
    import('../components/avatar/ForumAvatarDisplay').then(module => ({
      default: module.ForumAvatarDisplay,
    }))
  ),
};

// Heavy feature lazy imports
export const HeavyFeatures = {
  MathJaxPreview: lazy(() =>
    import('../components/MathJaxPreview').then(module => ({
      default: module.MathJaxPreview,
    }))
  ),

  PostContentRenderer: lazy(() =>
    import('../components/PostContentRenderer').then(module => ({
      default: module.PostContentRenderer,
    }))
  ),

  EmbeddedMathResult: lazy(() =>
    import('../components/EmbeddedMathResult').then(module => ({
      default: module.EmbeddedMathResult,
    }))
  ),

  MathToolShareDialog: lazy(() =>
    import('../components/MathToolShareDialog').then(module => ({
      default: module.MathToolShareDialog,
    }))
  ),
};

// Preload functions for better UX
export const preloadForumPages = {
  home: () => import('../pages/ForumHome'),
  thread: () => import('../pages/ThreadPage'),
  category: () => import('../pages/CategoryPage'),
  search: () => import('../pages/SearchResultsPage'),
  discovery: () => import('../pages/DiscoveryPage'),
  avatarEditor: () => import('../pages/AvatarEditorDemo'),
};

export const preloadForumComponents = {
  threadView: () => import('../components/ThreadView'),
  postComposer: () => import('../components/PostComposer'),
  forumSearch: () => import('../components/ForumSearch'),
  moderationDashboard: () => import('../components/ModerationDashboard'),
  activityFeed: () => import('../components/ActivityFeed'),
};

export const preloadAvatarComponents = {
  avatarEditor: () => import('../components/avatar/AvatarEditor'),
  avatarRenderer: () => import('../components/avatar/AvatarRenderer'),
  avatarManager: () => import('../components/avatar/AvatarManager'),
};

export const preloadHeavyFeatures = {
  mathJaxPreview: () => import('../components/MathJaxPreview'),
  postContentRenderer: () => import('../components/PostContentRenderer'),
  embeddedMathResult: () => import('../components/EmbeddedMathResult'),
};

// Route-based preloading
export const preloadForRoute = (route: string) => {
  switch (route) {
    case '/community':
    case '/forum':
      return Promise.all([
        preloadForumPages.home(),
        preloadForumComponents.forumSearch(),
      ]);

    case '/forum/thread':
      return Promise.all([
        preloadForumPages.thread(),
        preloadForumComponents.threadView(),
        preloadForumComponents.postComposer(),
        preloadHeavyFeatures.mathJaxPreview(),
      ]);

    case '/forum/category':
      return Promise.all([
        preloadForumPages.category(),
        preloadForumComponents.forumSearch(),
      ]);

    case '/forum/search':
      return Promise.all([
        preloadForumPages.search(),
        preloadForumComponents.forumSearch(),
      ]);

    case '/forum/discovery':
      return Promise.all([
        preloadForumPages.discovery(),
        preloadForumComponents.activityFeed(),
      ]);

    case '/forum/avatar':
      return Promise.all([
        preloadForumPages.avatarEditor(),
        preloadAvatarComponents.avatarEditor(),
        preloadAvatarComponents.avatarRenderer(),
      ]);

    case '/forum/moderation':
      return Promise.all([
        preloadForumComponents.moderationDashboard(),
        preloadForumComponents.userManagementPanel(),
      ]);

    default:
      return Promise.resolve();
  }
};

// Intersection Observer for preloading on hover/focus
export const createPreloadTrigger = (preloadFn: () => Promise<any>) => {
  let preloadPromise: Promise<any> | null = null;

  const preload = () => {
    if (!preloadPromise) {
      preloadPromise = preloadFn().catch(error => {
        console.warn('Failed to preload module:', error);
        preloadPromise = null; // Reset on error to allow retry
      });
    }
    return preloadPromise;
  };

  return {
    onMouseEnter: preload,
    onFocus: preload,
    onTouchStart: preload,
  };
};

// Bundle analysis helpers
export const getBundleInfo = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const navigation = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType(
      'resource'
    ) as PerformanceResourceTiming[];

    return {
      navigationTiming: {
        domContentLoaded:
          navigation.domContentLoadedEventEnd -
          navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalTime: navigation.loadEventEnd - navigation.fetchStart,
      },
      resources: resources
        .filter(
          resource =>
            resource.name.includes('.js') || resource.name.includes('.css')
        )
        .map(resource => ({
          name: resource.name,
          size: resource.transferSize,
          loadTime: resource.responseEnd - resource.requestStart,
        })),
    };
  }

  return null;
};

// Performance monitoring for code splitting
export const monitorChunkLoading = () => {
  if (typeof window !== 'undefined') {
    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('chunk') && entry.entryType === 'resource') {
          console.log(`Chunk loaded: ${entry.name} in ${entry.duration}ms`);
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });

    return () => observer.disconnect();
  }

  return () => {};
};

// Critical resource hints
export const addForumResourceHints = () => {
  if (typeof document === 'undefined') return;

  // Preload critical forum assets
  const criticalAssets = [
    '/forum/avatar-items.json',
    '/forum/default-avatars.json',
  ];

  criticalAssets.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = 'fetch';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });

  // Prefetch likely-needed chunks
  const prefetchChunks = [
    'forum-thread-view',
    'forum-post-composer',
    'avatar-editor',
  ];

  prefetchChunks.forEach(chunk => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = `/chunks/${chunk}.js`;
    document.head.appendChild(link);
  });
};
