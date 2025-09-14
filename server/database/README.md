# Math Farm Forum Database

This directory contains the database schema, connection utilities, and initialization scripts for the Math Farm Community Forum.

## Files Overview

- `forum-schema.sql` - Complete MariaDB/MySQL schema for forum tables
- `connection.ts` - Database connection pool and utilities
- `forum-repository.ts` - Repository pattern for database operations
- `forum-seed-data.ts` - Initial data seeding (categories, avatar items)
- `init.ts` - Database initialization script

## Setup Instructions

### 1. Database Prerequisites

Ensure you have MariaDB or MySQL installed and running:

```bash
# Install MariaDB (Ubuntu/Debian)
sudo apt update
sudo apt install mariadb-server

# Install MariaDB (macOS with Homebrew)
brew install mariadb

# Install MySQL (alternative)
# Follow instructions at https://dev.mysql.com/downloads/
```

### 2. Create Database and User

```sql
-- Connect to MariaDB as root
mysql -u root -p

-- Create database
CREATE DATABASE mathfarm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user with limited privileges
CREATE USER 'mathfarm'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX ON mathfarm.* TO 'mathfarm'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Environment Configuration

Copy the environment template and configure your database:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=mathfarm
DB_PASSWORD=your_secure_password
DB_NAME=mathfarm
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Initialize Database

Run the initialization script to create tables and seed data:

```bash
npm run db:init
```

This will:

- Test database connection
- Create all forum tables
- Seed initial categories based on Math Farm curriculum
- Add default avatar items

## Database Schema

### Core Tables

- `forum_categories` - Hierarchical forum categories
- `forum_threads` - Discussion threads
- `forum_posts` - Individual posts with math expression support
- `user_avatars` - Chibi avatar configurations
- `forum_reports` - Content moderation reports
- `forum_notifications` - User notifications
- `forum_thread_follows` - Thread subscription tracking
- `forum_moderation_log` - Audit trail for moderation actions

### User Extensions

The schema extends the existing `users` table with forum-specific fields:

- `forum_role` - User role (guest, member, moderator, admin)
- `forum_post_count` - Number of posts made
- `forum_banned_until` - Temporary ban expiration
- `forum_ban_reason` - Reason for ban

## Repository Pattern

The `ForumRepository` class provides a clean interface for database operations:

```typescript
import { forumRepository } from './forum-repository.js';

// Get all categories
const categories = await forumRepository.getCategories();

// Create a new thread
const threadId = await forumRepository.createThread({
  title: 'Help with calculus',
  categoryId: 1,
  authorId: 123,
  isPinned: false,
  isLocked: false,
});

// Get posts in a thread
const posts = await forumRepository.getPostsByThread(threadId);
```

## Security Considerations

- All database credentials are stored in environment variables
- Connection pool limits prevent resource exhaustion
- Parameterized queries prevent SQL injection
- User input is sanitized before storage
- Sensitive fields are excluded from public APIs

## Performance Features

- Proper indexing on frequently queried columns
- Connection pooling for efficient resource usage
- Full-text search capabilities for post content
- Optimized queries with appropriate LIMIT/OFFSET

## Maintenance

### Backup

```bash
# Create backup
mysqldump -u mathfarm -p mathfarm > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
mysql -u mathfarm -p mathfarm < backup_file.sql
```

### Monitoring

Check database health:

```bash
# Test connection
node -e "import('./connection.js').then(({healthCheck}) => healthCheck().then(console.log))"
```

### Updates

When updating the schema:

1. Create migration scripts in `migrations/` directory
2. Test on development database first
3. Backup production database before applying
4. Apply migrations during maintenance window
