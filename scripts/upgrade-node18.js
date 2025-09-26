#!/usr/bin/env node

/**
 * Node 18 Upgrade Helper Script
 * Helps verify and complete the upgrade to Node 18
 */

import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import path from 'path';

console.log('🚀 Math Farm Node 18 Upgrade Helper\n');

// Check Node version
function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

  console.log(`📋 Current Node.js version: ${nodeVersion}`);

  if (majorVersion !== 18) {
    console.log('⚠️  Warning: You are not using Node.js 18');
    console.log('   Please install Node.js 18.x from https://nodejs.org/');
    console.log('   This upgrade is specifically designed for Node 18\n');
    return false;
  } else {
    console.log('✅ Node.js 18 detected\n');
    return true;
  }
}

// Clean existing installations
function cleanInstallation() {
  console.log('🧹 Cleaning existing installations...');

  const pathsToClean = [
    'node_modules',
    'client/node_modules',
    'package-lock.json',
    'client/package-lock.json',
  ];

  pathsToClean.forEach(pathToClean => {
    if (existsSync(pathToClean)) {
      console.log(`   Removing ${pathToClean}`);
      rmSync(pathToClean, { recursive: true, force: true });
    }
  });

  console.log('✅ Cleanup complete\n');
}

// Install dependencies
function installDependencies() {
  console.log('📦 Installing dependencies...');

  try {
    console.log('   Installing root dependencies...');
    execSync('npm install', { stdio: 'inherit' });

    console.log('   Installing client dependencies...');
    execSync('npm install', { cwd: 'client', stdio: 'inherit' });

    console.log('✅ Dependencies installed\n');
    return true;
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    return false;
  }
}

// Verify installation
function verifyInstallation() {
  console.log('🔍 Verifying installation...');

  try {
    console.log('   Checking for dependency conflicts...');
    execSync('npm ls --depth=0', { stdio: 'pipe' });

    console.log('   Running type check...');
    execSync('npm run type-check', { stdio: 'pipe' });

    console.log('✅ Installation verified\n');
    return true;
  } catch (error) {
    console.log('⚠️  Some verification steps failed, but this might be normal');
    console.log('   Please run the following commands manually to check:');
    console.log('   - npm ls');
    console.log('   - npm run type-check');
    console.log('   - npm run dev\n');
    return false;
  }
}

// Test key functionality
function testFunctionality() {
  console.log('🧪 Testing key functionality...');

  try {
    console.log('   Testing build process...');
    execSync('npm run build', { stdio: 'pipe' });
    console.log('✅ Build successful');

    console.log('   Testing development server startup...');
    // We can't easily test the dev server without hanging, so we skip this
    console.log('   (Skipping dev server test - please test manually)');

    return true;
  } catch (error) {
    console.log('⚠️  Some tests failed:', error.message);
    console.log('   Please test manually with: npm run dev');
    return false;
  }
}

// Main upgrade process
async function main() {
  console.log('Starting Node 18 upgrade process...\n');

  // Step 1: Check Node version
  if (!checkNodeVersion()) {
    process.exit(1);
  }

  // Step 2: Clean installation
  cleanInstallation();

  // Step 3: Install dependencies
  if (!installDependencies()) {
    console.log('❌ Upgrade failed during dependency installation');
    process.exit(1);
  }

  // Step 4: Verify installation
  verifyInstallation();

  // Step 5: Test functionality
  testFunctionality();

  // Final message
  console.log('🎉 Node 18 upgrade process complete!\n');
  console.log('Next steps:');
  console.log('1. Test the development server: npm run dev');
  console.log('2. Test math tools and curriculum loading');
  console.log('3. Run the full test suite: npm test');
  console.log('4. Check the upgrade guide: upgrade-to-node18.md\n');
  console.log(
    'If you encounter any issues, refer to the troubleshooting section'
  );
  console.log('in the upgrade guide.\n');
}

// Run the upgrade
main().catch(error => {
  console.error('❌ Upgrade script failed:', error);
  process.exit(1);
});
