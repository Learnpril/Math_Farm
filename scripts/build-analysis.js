#!/usr/bin/env node

/**
 * Build Analysis Script
 *
 * This script runs the Vite build and provides information about the bundle analysis.
 * The bundle analysis HTML file will be generated at dist/bundle-analysis.html
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

console.log('🚀 Starting optimized build with bundle analysis...\n');

try {
  // Run the build
  execSync('npm run build', { stdio: 'inherit' });

  console.log('\n✅ Build completed successfully!');

  // Check if bundle analysis was generated
  const analysisPath = path.join(process.cwd(), 'dist', 'bundle-analysis.html');
  if (existsSync(analysisPath)) {
    console.log('📊 Bundle analysis generated at: dist/bundle-analysis.html');
    console.log(
      '   Open this file in your browser to view detailed bundle information.'
    );
  } else {
    console.log(
      '⚠️  Bundle analysis file not found. Check Vite configuration.'
    );
  }

  console.log('\n📦 Build optimizations applied:');
  console.log('   ✓ Tree-shaking enabled');
  console.log('   ✓ Source maps generated');
  console.log('   ✓ Code splitting with manual chunks');
  console.log('   ✓ Math libraries separated for lazy loading');
  console.log('   ✓ Asset optimization with cache-friendly naming');
  console.log('   ✓ No minification (as requested)');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
