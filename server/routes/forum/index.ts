import { Router } from 'express';
import categoriesRouter from './categories.js';
import threadsRouter from './threads.js';
import postsRouter from './posts.js';
import notificationsRouter from './notifications.js';

const router = Router();

// Mount forum sub-routes
router.use('/categories', categoriesRouter);
router.use('/threads', threadsRouter);
router.use('/posts', postsRouter);
router.use('/notifications', notificationsRouter);

// Forum health check
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'forum-api',
    timestamp: new Date().toISOString(),
  });
});

export default router;
