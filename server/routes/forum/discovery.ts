import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import { discoveryService } from '../../services/discovery-service.js';
import { z } from 'zod';

const router = Router();

// Trending topics endpoint
router.get('/trending', async (req, res) => {
  try {
    const { timeframe = 'week', limit = 10 } = req.query;

    const trendingTopics = await discoveryService.getTrendingTopics({
      timeframe: timeframe as 'day' | 'week' | 'month',
      limit: parseInt(limit as string),
    });

    res.json({
      success: true,
      data: trendingTopics,
    });
  } catch (error) {
    console.error('Trending topics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get trending topics',
    });
  }
});

// Popular discussions endpoint
router.get('/popular', async (req, res) => {
  try {
    const { timeframe = 'week', limit = 10 } = req.query;

    const popularDiscussions = await discoveryService.getPopularDiscussions({
      timeframe: timeframe as 'day' | 'week' | 'month',
      limit: parseInt(limit as string),
    });

    res.json({
      success: true,
      data: popularDiscussions,
    });
  } catch (error) {
    console.error('Popular discussions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get popular discussions',
    });
  }
});

// User activity feed endpoint (requires authentication)
router.get('/activity-feed', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const { page = 1, limit = 20 } = req.query;

    const activityFeed = await discoveryService.getUserActivityFeed({
      userId,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });

    res.json({
      success: true,
      data: activityFeed,
    });
  } catch (error) {
    console.error('Activity feed error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get activity feed',
    });
  }
});

// Follow/unfollow user endpoint
router.post('/follow/:userId', authenticateToken, async (req, res) => {
  try {
    const followerId = req.user?.userId;
    const followingId = parseInt(req.params.userId);

    if (!followerId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    if (followerId === followingId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot follow yourself',
      });
    }

    const result = await discoveryService.followUser(followerId, followingId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to follow user',
    });
  }
});

router.delete('/follow/:userId', authenticateToken, async (req, res) => {
  try {
    const followerId = req.user?.userId;
    const followingId = parseInt(req.params.userId);

    if (!followerId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    await discoveryService.unfollowUser(followerId, followingId);

    res.json({
      success: true,
      data: { message: 'User unfollowed successfully' },
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unfollow user',
    });
  }
});

// Get user's following list
router.get('/following', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const following = await discoveryService.getUserFollowing(userId);

    res.json({
      success: true,
      data: following,
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get following list',
    });
  }
});

// Related threads endpoint
router.get('/related/:threadId', async (req, res) => {
  try {
    const threadId = parseInt(req.params.threadId);
    const { limit = 5 } = req.query;

    const relatedThreads = await discoveryService.getRelatedThreads({
      threadId,
      limit: parseInt(limit as string),
    });

    res.json({
      success: true,
      data: relatedThreads,
    });
  } catch (error) {
    console.error('Related threads error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get related threads',
    });
  }
});

// Tags endpoints
router.get('/tags', async (req, res) => {
  try {
    const { popular = false, limit = 50 } = req.query;

    const tags = await discoveryService.getTags({
      popular: popular === 'true',
      limit: parseInt(limit as string),
    });

    res.json({
      success: true,
      data: tags,
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get tags',
    });
  }
});

router.get('/tags/:tag/threads', async (req, res) => {
  try {
    const tag = req.params.tag;
    const { page = 1, limit = 20 } = req.query;

    const threads = await discoveryService.getThreadsByTag({
      tag,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });

    res.json({
      success: true,
      data: threads,
    });
  } catch (error) {
    console.error('Get threads by tag error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get threads by tag',
    });
  }
});

export default router;
