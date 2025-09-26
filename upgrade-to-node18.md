# Node 18 Upgrade Guide

This guide will help you upgrade your Math Farm project to Node 18 with compatible package versions.

## Prerequisites

1. **Install Node.js 18**: Download and install Node.js 18.x from [nodejs.org](https://nodejs.org/)
2. **Verify installation**: Run `node --version` to confirm you're using Node 18.x

## Upgrade Steps

### 1. Clean existing dependencies

```bash
# Remove node_modules and lock files
rm -rf node_modules
rm -rf client/node_modules
rm package-lock.json
rm client/package-lock.json
```

### 2. Install updated dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 3. Verify the installation

```bash
# Check for any peer dependency warnings
npm ls

# Run type checking
npm run type-check

# Try building the project
npm run build
```

## Key Changes Made

### Package Versions Downgraded for Node 18 Compatibility:

**Core Dependencies:**

- React: `^18.2.0` (from `^18.3.1`)
- React DOM: `^18.2.0` (from `^18.3.1`)
- @tanstack/react-query: `^4.36.1` (from `^5.60.5`)
- Express: `^4.18.2` (from `^4.21.2`)
- Vite: `^5.2.10` (from `^5.4.19`)
- TypeScript: `^5.4.5` (from `5.6.3`)

**Radix UI Components:**

- All Radix UI components downgraded to their Node 18 compatible versions
- @radix-ui/react-accordion: `^1.1.2` (from `^1.2.12`)
- @radix-ui/react-dialog: `^1.0.5` (from `^1.1.15`)
- And others...

**Development Tools:**

- ESLint: `^8.57.0` (from `^9.35.0`)
- @typescript-eslint/\*: `^6.21.0` (from `^8.43.0`)
- Storybook: `^7.6.17` (from `^9.1.5`)
- Vitest: `^1.6.0` (from `^3.2.4`)

### Configuration Updates:

1. **package.json**: Added Node 18 engine requirement
2. **vite.config.ts**:
   - Fixed worker loading with proper URL handling
   - Added better static file serving
   - Improved compatibility settings

3. **Worker Interface**: Updated to use `new URL()` for worker loading instead of direct paths

4. **Curriculum Data Loader**: Added fallback loading mechanism using dynamic imports

## Troubleshooting

### If you encounter worker loading errors:

The worker loading has been updated to use `new URL()` for better compatibility. If issues persist, workers will automatically fall back to main thread execution.

### If curriculum data fails to load:

The curriculum loader now tries dynamic imports first, then falls back to fetch requests. This should resolve JSON parsing issues.

### If packages fail to install:

1. Clear npm cache: `npm cache clean --force`
2. Delete node_modules: `rm -rf node_modules`
3. Reinstall: `npm install`

### If TypeScript errors occur:

The TypeScript configuration has been kept compatible with Node 18. If you see module resolution errors, try:

```bash
npm run type-check
```

## Testing the Upgrade

After installation, test these key features:

1. **Development server**: `npm run dev`
2. **Math workers**: Test calculator and equation solver
3. **Curriculum loading**: Navigate to arithmetic curriculum
4. **Build process**: `npm run build`
5. **Tests**: `npm test`

## Performance Notes

- Some newer features from the latest package versions may not be available
- Performance should be similar or slightly better due to more stable package versions
- Worker functionality has been improved for better browser compatibility

## Next Steps

Once everything is working:

1. Test all major features thoroughly
2. Run the full test suite
3. Consider updating your CI/CD to use Node 18
4. Update any deployment scripts to use Node 18

## Rollback Plan

If you need to rollback:

1. Keep a backup of your original package.json files
2. The git history contains all the changes made
3. You can revert the package.json changes and reinstall with your original Node version
