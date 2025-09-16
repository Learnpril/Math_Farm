-- Performance Optimization Indexes for Math Farm Community Forum
-- These indexes are designed to optimize common query patterns

-- ============================================================================
-- COMPOSITE INDEXES for common query patterns
-- ============================================================================

-- Threads by category with sorting (most common query)
CREATE INDEX IF NOT EXISTS idx_threads_category_activity 
ON forum_threads (category_id, is_pinned DESC, last_post_at DESC, created_at DESC);

-- Threads by category with post count (for popular threads)
CREATE INDEX IF NOT EXISTS idx_threads_category_popularity 
ON forum_threads (category_id, post_count DESC, created_at DESC);

-- Posts by thread with pagination (most common query)
CREATE INDEX IF NOT EXISTS idx_posts_thread_pagination 
ON forum_posts (thread_id, created_at ASC, id ASC);

-- Posts by author for user profiles
CREATE INDEX IF NOT EXISTS idx_posts_author_recent 
ON forum_posts (author_id, created_at DESC);

-- Notifications by user (for notification queries)
CREATE INDEX IF NOT EXISTS idx_notifications_user_status 
ON forum_notifications (user_id, is_read, created_at DESC);

-- Thread follows for notification triggers
CREATE INDEX IF NOT EXISTS idx_thread_follows_lookup 
ON forum_thread_follows (thread_id, user_id);

-- Reports by status for moderation
CREATE INDEX IF NOT EXISTS idx_reports_moderation 
ON forum_reports (status, created_at DESC);

-- ============================================================================
-- COVERING INDEXES for read-heavy queries
-- ============================================================================

-- Category list with thread counts (covers common category display)
CREATE INDEX IF NOT EXISTS idx_categories_display 
ON forum_categories (parent_id, sort_order, name, id, description);

-- Thread list display (covers thread listing without additional lookups)
CREATE INDEX IF NOT EXISTS idx_threads_list_display 
ON forum_threads (category_id, is_pinned, is_locked, last_post_at, title, author_id, post_count, id);

-- User forum profile (covers user stats queries)
CREATE INDEX IF NOT EXISTS idx_users_forum_profile 
ON users (id, username, forum_role, forum_post_count, created_at);

-- ============================================================================
-- SEARCH OPTIMIZATION INDEXES
-- ============================================================================

-- Full-text search optimization (already exists but ensuring it's optimal)
-- Note: FULLTEXT indexes are automatically created in the main schema

-- Search by author and content
CREATE INDEX IF NOT EXISTS idx_posts_search_author 
ON forum_posts (author_id, created_at DESC);

-- ============================================================================
-- PERFORMANCE MONITORING INDEXES
-- ============================================================================

-- Thread view tracking (for analytics)
CREATE INDEX IF NOT EXISTS idx_thread_views_analytics 
ON forum_thread_views (thread_id, created_at);

-- Post likes for engagement metrics
CREATE INDEX IF NOT EXISTS idx_post_likes_engagement 
ON forum_post_likes (post_id, created_at);

-- User activity tracking
CREATE INDEX IF NOT EXISTS idx_user_activity 
ON forum_posts (author_id, created_at);

-- ============================================================================
-- MODERATION OPTIMIZATION INDEXES
-- ============================================================================

-- Moderation log for audit trails
CREATE INDEX IF NOT EXISTS idx_moderation_log_audit 
ON forum_moderation_log (moderator_id, action, created_at DESC);

-- Moderation log by target for history
CREATE INDEX IF NOT EXISTS idx_moderation_log_target 
ON forum_moderation_log (target_type, target_id, created_at DESC);

-- ============================================================================
-- AVATAR SYSTEM OPTIMIZATION
-- ============================================================================

-- Avatar lookup optimization (already has user_id index)
-- No additional indexes needed as user_id is already unique

-- ============================================================================
-- CLEANUP OLD INDEXES (if any exist that are redundant)
-- ============================================================================

-- Remove any redundant single-column indexes that are covered by composite indexes
-- Note: Be careful with this in production - analyze query plans first

-- Example of checking for redundant indexes:
-- DROP INDEX IF EXISTS idx_threads_category_id; -- Covered by composite indexes
-- DROP INDEX IF EXISTS idx_posts_thread_id; -- Covered by composite indexes

-- ============================================================================
-- QUERY OPTIMIZATION HINTS
-- ============================================================================

-- For MariaDB/MySQL query optimization
-- These are not indexes but configuration suggestions:

-- Ensure these variables are optimized:
-- innodb_buffer_pool_size = 70-80% of available RAM
-- innodb_log_file_size = 256M or higher
-- query_cache_size = 64M (if using MySQL < 8.0)
-- tmp_table_size = 64M
-- max_heap_table_size = 64M

-- ============================================================================
-- INDEX USAGE MONITORING
-- ============================================================================

-- Queries to monitor index usage (run periodically):

-- Check unused indexes:
-- SELECT DISTINCT
--   s.table_schema,
--   s.table_name,
--   s.index_name
-- FROM information_schema.statistics s
-- LEFT JOIN information_schema.index_statistics i
--   ON s.table_schema = i.table_schema
--   AND s.table_name = i.table_name
--   AND s.index_name = i.index_name
-- WHERE s.table_schema = 'mathfarm'
--   AND i.index_name IS NULL
--   AND s.index_name != 'PRIMARY';

-- Check index cardinality:
-- SELECT 
--   table_name,
--   index_name,
--   cardinality,
--   sub_part,
--   packed,
--   nullable,
--   index_type
-- FROM information_schema.statistics 
-- WHERE table_schema = 'mathfarm'
-- ORDER BY table_name, index_name;

-- ============================================================================
-- PARTITIONING SUGGESTIONS (for very large datasets)
-- ============================================================================

-- If the forum grows very large (millions of posts), consider partitioning:

-- Partition posts by date (monthly partitions)
-- ALTER TABLE forum_posts PARTITION BY RANGE (YEAR(created_at) * 100 + MONTH(created_at)) (
--   PARTITION p202401 VALUES LESS THAN (202402),
--   PARTITION p202402 VALUES LESS THAN (202403),
--   -- Add more partitions as needed
--   PARTITION p_future VALUES LESS THAN MAXVALUE
-- );

-- Partition thread views by date (for analytics)
-- ALTER TABLE forum_thread_views PARTITION BY RANGE (TO_DAYS(created_at)) (
--   PARTITION p_old VALUES LESS THAN (TO_DAYS('2024-01-01')),
--   PARTITION p_current VALUES LESS THAN (TO_DAYS('2025-01-01')),
--   PARTITION p_future VALUES LESS THAN MAXVALUE
-- );