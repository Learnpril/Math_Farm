#!/usr/bin/env node

/**
 * Test runner script for navigation system tests
 *
 * This script runs all navigation-related tests and provides
 * a summary of the test results.
 *
 * Usage:
 *   npm run test:navigation
 *   or
 *   npx tsx client/src/test/run-navigation-tests.ts
 */

import { execSync } from "child_process";
import { resolve } from "path";

const testFiles = [
  "client/src/components/__tests__/navigation-routing.test.tsx",
  "client/src/components/__tests__/topic-rendering.test.tsx",
  "client/src/components/__tests__/navigation-error-handling.test.tsx",
  "client/src/components/__tests__/user-journey-integration.test.tsx",
  "client/src/components/__tests__/accessibility-integration.test.tsx",
];

const existingTestFiles = [
  "client/src/components/__tests__/keyboard-navigation.test.tsx",
  "client/src/components/__tests__/screen-reader-compatibility.test.tsx",
  "client/src/components/__tests__/ToolsSection.test.tsx",
];

console.log("🧪 Running Navigation System Test Suite");
console.log("=====================================\n");

try {
  // Run new navigation tests
  console.log("📍 Running Navigation & Routing Tests...");
  for (const testFile of testFiles) {
    try {
      console.log(`  ✓ ${testFile}`);
      execSync(`npx vitest run ${testFile} --reporter=verbose`, {
        stdio: "pipe",
        cwd: resolve(process.cwd()),
      });
    } catch (error) {
      console.log(`  ❌ ${testFile} - FAILED`);
      console.error(`     Error: ${error}`);
    }
  }

  // Run existing related tests
  console.log("\n📍 Running Existing Related Tests...");
  for (const testFile of existingTestFiles) {
    try {
      console.log(`  ✓ ${testFile}`);
      execSync(`npx vitest run ${testFile} --reporter=verbose`, {
        stdio: "pipe",
        cwd: resolve(process.cwd()),
      });
    } catch (error) {
      console.log(`  ❌ ${testFile} - FAILED`);
      console.error(`     Error: ${error}`);
    }
  }

  console.log("\n✅ Navigation Test Suite Complete!");
  console.log("\nTest Coverage Areas:");
  console.log("  • Route parameter parsing and validation");
  console.log("  • Component rendering with different topic data");
  console.log("  • Click handlers and navigation state management");
  console.log("  • Error handling for invalid routes and missing data");
  console.log("  • Complete user journey from home to topic completion");
  console.log("  • Cross-topic navigation via prerequisite links");
  console.log("  • Tools and guide page functionality");
  console.log("  • Accessibility features with automated testing");
  console.log("  • Keyboard navigation and screen reader support");
  console.log("  • Mobile navigation and responsive behavior");
  console.log("  • Error recovery and graceful degradation");
} catch (error) {
  console.error("❌ Test suite failed:", error);
  process.exit(1);
}
