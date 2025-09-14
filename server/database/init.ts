#!/usr/bin/env tsx

/**
 * Database initialization script for Math Farm Community Forum
 *
 * This script:
 * 1. Tests database connection
 * 2. Creates forum tables
 * 3. Seeds initial data
 *
 * Usage:
 *   npm run db:init
 *   or
 *   tsx server/database/init.ts
 */

import {
  testConnection,
  initializeDatabase,
  closeConnection,
  healthCheck,
} from './connection.js';
import { seedDatabase } from './forum-seed-data.js';

async function initDatabase() {
  console.log('🚀 Starting Math Farm Forum database initialization...\n');

  try {
    // Step 1: Test connection
    console.log('1️⃣ Testing database connection...');
    const connectionOk = await testConnection();

    if (!connectionOk) {
      console.error('❌ Cannot proceed without database connection');
      process.exit(1);
    }

    // Step 2: Run health check
    console.log('\n2️⃣ Running health check...');
    const health = await healthCheck();
    console.log(`Database status: ${health.status}`);

    if (health.status !== 'healthy') {
      console.error('❌ Database is not healthy:', health.details);
      process.exit(1);
    }

    // Step 3: Initialize tables
    console.log('\n3️⃣ Creating database tables...');
    await initializeDatabase();

    // Step 4: Seed initial data
    console.log('\n4️⃣ Seeding initial data...');
    await seedDatabase();

    console.log('\n✅ Database initialization completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   • Forum tables created');
    console.log('   • Categories seeded with Math Farm curriculum structure');
    console.log('   • Default avatar items added');
    console.log('   • Database ready for forum functionality');
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    // Clean up connection
    await closeConnection();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabase();
}

export { initDatabase };
