-- Math Farm Community Forum Database Schema
-- MariaDB/MySQL Schema for forum functionality

-- Forum Categories Table
CREATE TABLE forum_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id INT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_parent_id (parent_id),
  INDEX idx_sort_order (sort_order),
  FOREIGN KEY (parent_id) REFERENCES forum_categories(id) ON DELETE CASCADE
);

-- Forum Threads Table
CREATE TABLE forum_threads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  category_id INT NOT NULL,
  author_id INT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  post_count INT DEFAULT 0,
  last_post_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_category_id (category_id),
  INDEX idx_author_id (author_id),
  INDEX idx_last_post_at (last_post_at),
  INDEX idx_created_at (created_at),
  INDEX idx_pinned_locked (is_pinned, is_locked),
  
  FOREIGN KEY (category_id) REFERENCES forum_categories(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Forum Posts Table
CREATE TABLE forum_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  thread_id INT NOT NULL,
  author_id INT NOT NULL,
  parent_post_id INT NULL,
  content TEXT NOT NULL,
  math_expressions JSON,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_thread_id (thread_id),
  INDEX idx_author_id (author_id),
  INDEX idx_parent_post_id (parent_post_id),
  INDEX idx_created_at (created_at),
  
  FOREIGN KEY (thread_id) REFERENCES forum_threads(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
  
  -- Full-text search index for content
  FULLTEXT KEY idx_content_search (content)
);

-- User Avatars Table
CREATE TABLE user_avatars (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  config JSON NOT NULL,
  unlocked_items JSON DEFAULT ('[]'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Forum Reports Table
CREATE TABLE forum_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  reporter_id INT NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('pending', 'resolved', 'dismissed') DEFAULT 'pending',
  moderator_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  
  INDEX idx_post_id (post_id),
  INDEX idx_reporter_id (reporter_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  
  FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (moderator_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Forum Notifications Table
CREATE TABLE forum_notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('mention', 'reply', 'thread_update', 'moderation') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_post_id INT NULL,
  related_thread_id INT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (related_post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (related_thread_id) REFERENCES forum_threads(id) ON DELETE CASCADE
);

-- User Forum Preferences Table
CREATE TABLE user_forum_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  email_notifications BOOLEAN DEFAULT TRUE,
  mention_notifications BOOLEAN DEFAULT TRUE,
  reply_notifications BOOLEAN DEFAULT TRUE,
  thread_follow_notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Thread Follows Table (for notification subscriptions)
CREATE TABLE forum_thread_follows (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  thread_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_user_thread (user_id, thread_id),
  INDEX idx_user_id (user_id),
  INDEX idx_thread_id (thread_id),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (thread_id) REFERENCES forum_threads(id) ON DELETE CASCADE
);

-- Moderation Log Table
CREATE TABLE forum_moderation_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  moderator_id INT NOT NULL,
  action ENUM('edit_post', 'delete_post', 'lock_thread', 'pin_thread', 'ban_user', 'warn_user') NOT NULL,
  target_type ENUM('post', 'thread', 'user') NOT NULL,
  target_id INT NOT NULL,
  reason TEXT,
  details JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_moderator_id (moderator_id),
  INDEX idx_action (action),
  INDEX idx_target (target_type, target_id),
  INDEX idx_created_at (created_at),
  
  FOREIGN KEY (moderator_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Extend existing users table with forum-specific fields
-- Note: This assumes a users table already exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS forum_role ENUM('guest', 'member', 'moderator', 'admin') DEFAULT 'member';
ALTER TABLE users ADD COLUMN IF NOT EXISTS forum_post_count INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS forum_banned_until TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS forum_ban_reason TEXT NULL;

-- Add indexes for forum-related user fields
ALTER TABLE users ADD INDEX IF NOT EXISTS idx_forum_role (forum_role);
ALTER TABLE users ADD INDEX IF NOT EXISTS idx_forum_banned (forum_banned_until);