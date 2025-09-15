-- Forum Notifications Table
CREATE TABLE IF NOT EXISTS forum_notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('mention', 'reply', 'thread_reply', 'thread_locked', 'post_liked', 'achievement') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSON,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  expires_at TIMESTAMP NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at),
  INDEX idx_expires_at (expires_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notification Preferences Table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  mentions_enabled BOOLEAN DEFAULT TRUE,
  replies_enabled BOOLEAN DEFAULT TRUE,
  thread_replies_enabled BOOLEAN DEFAULT TRUE,
  thread_updates_enabled BOOLEAN DEFAULT TRUE,
  likes_enabled BOOLEAN DEFAULT TRUE,
  achievements_enabled BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT FALSE,
  digest_frequency ENUM('none', 'daily', 'weekly') DEFAULT 'none',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notification Subscriptions Table (for thread/category subscriptions)
CREATE TABLE IF NOT EXISTS notification_subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subscription_type ENUM('thread', 'category', 'user') NOT NULL,
  target_id INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_subscription_type (subscription_type),
  INDEX idx_target_id (target_id),
  INDEX idx_is_active (is_active),
  UNIQUE KEY unique_subscription (user_id, subscription_type, target_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);