import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'mathfarm',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mathfarm',
  charset: 'utf8mb4',
  timezone: '+00:00',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  // Connection pool settings
  connectionLimit: 10,
  queueLimit: 0,
  // SSL configuration for production
  ssl:
    process.env.NODE_ENV === 'production'
      ? {
          rejectUnauthorized: false,
        }
      : false,
};

// Create connection pool
export const pool = mysql.createPool(dbConfig);

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Execute a single query
export async function query<T = any>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Execute a query and return the first result
export async function queryOne<T = any>(
  sql: string,
  params: any[] = []
): Promise<T | null> {
  const results = await query<T>(sql, params);
  return results.length > 0 ? results[0] : null;
}

// Execute multiple queries in a transaction
export async function transaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Initialize database tables
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('🔄 Initializing database tables...');

    // Read and execute schema file
    const fs = await import('fs/promises');
    const path = await import('path');
    const { fileURLToPath } = await import('url');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const schemaPath = path.join(__dirname, 'forum-schema.sql');

    const schema = await fs.readFile(schemaPath, 'utf-8');

    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    // Execute each statement
    for (const statement of statements) {
      try {
        await query(statement);
      } catch (error: any) {
        // Ignore "table already exists" errors
        if (!error.message.includes('already exists')) {
          console.error('Schema execution error:', error);
          throw error;
        }
      }
    }

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Graceful shutdown
export async function closeConnection(): Promise<void> {
  try {
    await pool.end();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
}

// Health check query
export async function healthCheck(): Promise<{
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  details?: any;
}> {
  try {
    const result = await queryOne('SELECT 1 as test, NOW() as timestamp');
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      details: result,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      details: error,
    };
  }
}
