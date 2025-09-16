/**
 * Script to apply performance optimizations to the forum database
 * This includes creating indexes, optimizing existing queries, and setting up monitoring
 */

import { query, testConnection } from './connection.js';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Apply all performance optimizations
 */
export async function applyPerformanceOptimizations(): Promise<void> {
  console.log('🚀 Starting performance optimization process...');

  try {
    // Test database connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }

    // Apply performance indexes
    await applyPerformanceIndexes();

    // Optimize existing tables
    await optimizeExistingTables();

    // Update database configuration
    await updateDatabaseConfiguration();

    // Verify optimizations
    await verifyOptimizations();

    console.log('✅ Performance optimizations applied successfully');
  } catch (error) {
    console.error('❌ Failed to apply performance optimizations:', error);
    throw error;
  }
}

/**
 * Apply performance indexes from SQL file
 */
async function applyPerformanceIndexes(): Promise<void> {
  console.log('📊 Applying performance indexes...');

  try {
    const indexesPath = join(__dirname, 'performance-indexes.sql');
    const indexesSQL = await readFile(indexesPath, 'utf-8');

    // Split SQL file into individual statements
    const statements = indexesSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(
        stmt =>
          stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*')
      );

    let appliedIndexes = 0;
    let skippedIndexes = 0;

    for (const statement of statements) {
      try {
        if (statement.toLowerCase().includes('create index')) {
          await query(statement);
          appliedIndexes++;

          // Extract index name for logging
          const indexNameMatch = statement.match(
            /CREATE INDEX\s+(?:IF NOT EXISTS\s+)?(\w+)/i
          );
          const indexName = indexNameMatch ? indexNameMatch[1] : 'unknown';
          console.log(`  ✓ Created index: ${indexName}`);
        }
      } catch (error: any) {
        if (
          error.message.includes('already exists') ||
          error.message.includes('Duplicate key')
        ) {
          skippedIndexes++;
          console.log(`  ⚠ Index already exists, skipping`);
        } else {
          console.error(`  ❌ Failed to create index:`, error.message);
          throw error;
        }
      }
    }

    console.log(
      `📊 Indexes applied: ${appliedIndexes}, skipped: ${skippedIndexes}`
    );
  } catch (error) {
    console.error('Failed to apply performance indexes:', error);
    throw error;
  }
}

/**
 * Optimize existing tables
 */
async function optimizeExistingTables(): Promise<void> {
  console.log('🔧 Optimizing existing tables...');

  const tables = [
    'forum_categories',
    'forum_threads',
    'forum_posts',
    'user_avatars',
    'forum_reports',
    'forum_notifications',
    'user_forum_preferences',
    'forum_thread_follows',
    'forum_moderation_log',
  ];

  for (const table of tables) {
    try {
      // Analyze table for query optimization
      await query(`ANALYZE TABLE ${table}`);

      // Optimize table structure
      await query(`OPTIMIZE TABLE ${table}`);

      console.log(`  ✓ Optimized table: ${table}`);
    } catch (error: any) {
      console.warn(`  ⚠ Could not optimize table ${table}:`, error.message);
      // Continue with other tables even if one fails
    }
  }
}

/**
 * Update database configuration for better performance
 */
async function updateDatabaseConfiguration(): Promise<void> {
  console.log('⚙️ Updating database configuration...');

  const optimizations = [
    // Query cache settings (MySQL < 8.0)
    'SET GLOBAL query_cache_type = ON',
    'SET GLOBAL query_cache_size = 67108864', // 64MB

    // InnoDB settings
    'SET GLOBAL innodb_buffer_pool_size = 134217728', // 128MB (adjust based on available memory)
    'SET GLOBAL innodb_log_file_size = 268435456', // 256MB

    // Connection settings
    'SET GLOBAL max_connections = 200',
    'SET GLOBAL connect_timeout = 30',
    'SET GLOBAL wait_timeout = 600',

    // Temporary table settings
    'SET GLOBAL tmp_table_size = 67108864', // 64MB
    'SET GLOBAL max_heap_table_size = 67108864', // 64MB

    // Sort and join settings
    'SET GLOBAL sort_buffer_size = 2097152', // 2MB
    'SET GLOBAL join_buffer_size = 2097152', // 2MB
  ];

  let appliedSettings = 0;
  let skippedSettings = 0;

  for (const setting of optimizations) {
    try {
      await query(setting);
      appliedSettings++;
      console.log(`  ✓ Applied: ${setting.split('=')[0].trim()}`);
    } catch (error: any) {
      skippedSettings++;
      console.warn(`  ⚠ Could not apply setting:`, error.message);
      // Continue with other settings
    }
  }

  console.log(
    `⚙️ Settings applied: ${appliedSettings}, skipped: ${skippedSettings}`
  );
}

/**
 * Verify that optimizations are working
 */
async function verifyOptimizations(): Promise<void> {
  console.log('🔍 Verifying optimizations...');

  try {
    // Check if key indexes exist
    const indexCheck = await query(`
      SELECT 
        TABLE_NAME,
        INDEX_NAME,
        COLUMN_NAME,
        CARDINALITY
      FROM information_schema.statistics 
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME LIKE 'forum_%'
        AND INDEX_NAME LIKE 'idx_%'
      ORDER BY TABLE_NAME, INDEX_NAME
    `);

    console.log(`  ✓ Found ${indexCheck.length} performance indexes`);

    // Check table optimization status
    const tableStatus = await query(`
      SELECT 
        TABLE_NAME,
        ENGINE,
        TABLE_ROWS,
        DATA_LENGTH,
        INDEX_LENGTH,
        AUTO_INCREMENT
      FROM information_schema.tables 
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME LIKE 'forum_%'
      ORDER BY TABLE_NAME
    `);

    console.log(`  ✓ Verified ${tableStatus.length} forum tables`);

    // Test a sample query performance
    const startTime = Date.now();
    await query(`
      SELECT COUNT(*) as total_posts 
      FROM forum_posts 
      WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
    const queryTime = Date.now() - startTime;

    console.log(`  ✓ Sample query executed in ${queryTime}ms`);

    if (queryTime > 1000) {
      console.warn(
        `  ⚠ Query time is high (${queryTime}ms), consider further optimization`
      );
    }
  } catch (error) {
    console.error('Failed to verify optimizations:', error);
    throw error;
  }
}

/**
 * Get optimization status report
 */
export async function getOptimizationStatus(): Promise<{
  indexes: any[];
  tableStats: any[];
  configuration: any[];
}> {
  try {
    // Get index information
    const indexes = await query(`
      SELECT 
        TABLE_NAME,
        INDEX_NAME,
        COLUMN_NAME,
        CARDINALITY,
        INDEX_TYPE
      FROM information_schema.statistics 
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME LIKE 'forum_%'
      ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX
    `);

    // Get table statistics
    const tableStats = await query(`
      SELECT 
        TABLE_NAME,
        ENGINE,
        TABLE_ROWS,
        ROUND(DATA_LENGTH / 1024 / 1024, 2) as DATA_SIZE_MB,
        ROUND(INDEX_LENGTH / 1024 / 1024, 2) as INDEX_SIZE_MB,
        ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) as TOTAL_SIZE_MB,
        AUTO_INCREMENT,
        CREATE_TIME,
        UPDATE_TIME
      FROM information_schema.tables 
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME LIKE 'forum_%'
      ORDER BY TOTAL_SIZE_MB DESC
    `);

    // Get relevant configuration
    const configuration = await query(`
      SELECT 
        VARIABLE_NAME,
        VARIABLE_VALUE
      FROM information_schema.global_variables 
      WHERE VARIABLE_NAME IN (
        'innodb_buffer_pool_size',
        'query_cache_size',
        'query_cache_type',
        'max_connections',
        'tmp_table_size',
        'max_heap_table_size',
        'sort_buffer_size',
        'join_buffer_size'
      )
      ORDER BY VARIABLE_NAME
    `);

    return {
      indexes,
      tableStats,
      configuration,
    };
  } catch (error) {
    console.error('Failed to get optimization status:', error);
    throw error;
  }
}

/**
 * CLI interface for running optimizations
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  applyPerformanceOptimizations()
    .then(() => {
      console.log('🎉 Performance optimization completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Performance optimization failed:', error);
      process.exit(1);
    });
}
