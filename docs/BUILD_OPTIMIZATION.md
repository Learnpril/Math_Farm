# Build Optimization Guide

This document explains the Vite build optimizations implemented for Math Farm to improve performance and loading times.

## Overview

The Vite configuration has been optimized for production builds with the following key features:

- **Tree-shaking**: Removes unused code from the final bundle
- **Code splitting**: Separates code into logical chunks for better caching
- **Source maps**: Enables debugging in production
- **Bundle analysis**: Provides detailed insights into bundle composition
- **Lazy loading**: Math-heavy components load on demand

## Build Configuration Features

### 1. Tree-shaking

Enabled through Rollup's treeshake configuration:

- Removes unused exports and side-effect-free code
- Optimizes bundle size without affecting functionality
- Configured to be aggressive while maintaining safety

### 2. Code Splitting Strategy

Manual chunk splitting organizes code into logical groups:

- **vendor**: Core React libraries (`react`, `react-dom`, `wouter`)
- **math**: Math computation libraries (`mathjs`, `mathjax`, `better-react-mathjax`)
- **interactive**: Interactive components (`jsxgraph`)
- **ui**: UI component libraries (Radix UI components, `lucide-react`)
- **query**: State management (`@tanstack/react-query`)

### 3. Asset Optimization

Organized file structure for better caching:

- JavaScript files: `js/[name]-[hash].js`
- CSS files: `css/[name]-[hash].css`
- Images: `images/[name]-[hash][ext]`
- Other assets: `assets/[name]-[hash][ext]`

### 4. Bundle Analysis

The `rollup-plugin-visualizer` generates detailed bundle analysis:

- File: `dist/bundle-analysis.html`
- Shows gzipped and brotli sizes
- Visualizes chunk relationships
- Helps identify optimization opportunities

## Usage

### Standard Build

```bash
npm run build
```

### Build with Analysis

```bash
npm run build:analyze
```

This will:

1. Run the optimized build
2. Generate bundle analysis at `dist/bundle-analysis.html`
3. Display optimization summary

### Viewing Bundle Analysis

Open `dist/bundle-analysis.html` in your browser to see:

- Interactive treemap of bundle contents
- Chunk sizes and relationships
- Dependency analysis
- Optimization opportunities

## Lazy Loading Implementation

Math-heavy components are lazy loaded to improve initial page load:

### Lazy Components

- `LazyGraphPlotter`: JSXGraph-based graphing tool
- `LazyEquationSolver`: Symbolic math solver
- `LazyCalculator`: Advanced calculator
- `LazyMathExpression`: MathJax rendering component

### Lazy Pages

- `LazyTopicPage`: Topic pages with math content
- `LazyToolsPage`: Math tools collection
- `LazyLaTeXGuidePage`: LaTeX documentation
- `LazyMATLABGuidePage`: MATLAB documentation

### Implementation Pattern

```typescript
const LazyComponent = lazy(() =>
  import('./Component').then(module => ({
    default: module.Component,
  }))
);
```

## Dependency Optimization

### Pre-bundled Dependencies

Core libraries included in optimizeDeps for faster development:

- `react`, `react-dom`, `wouter`
- `@tanstack/react-query`
- `clsx`, `tailwind-merge`

### Excluded Dependencies

Math libraries excluded from pre-bundling for lazy loading:

- `mathjs`, `mathjax`, `better-react-mathjax`
- `jsxgraph`

## Performance Targets

### Bundle Size Goals

- Main bundle: < 500KB (unminified)
- Math libraries chunk: Lazy loaded when needed
- Component chunks: < 100KB each
- Total initial load: < 1MB

### Loading Performance

- Initial page load: < 2 seconds
- Math tool loading: < 500ms after user interaction
- Chunk loading: < 200ms for cached chunks

## Monitoring and Analysis

### Bundle Analysis Metrics

- **Chunk sizes**: Monitor individual chunk growth
- **Dependency relationships**: Identify circular dependencies
- **Unused code**: Find optimization opportunities
- **Loading patterns**: Analyze user interaction paths

### Performance Monitoring

The build includes performance hooks for tracking:

- Component render times
- Math operation execution
- Bundle loading performance
- Memory usage patterns

## Troubleshooting

### Large Bundle Sizes

1. Check bundle analysis for large dependencies
2. Verify tree-shaking is working correctly
3. Consider splitting large components further
4. Review lazy loading implementation

### Slow Loading

1. Verify chunks are properly cached
2. Check network tab for loading bottlenecks
3. Ensure lazy loading is working for math components
4. Review dependency optimization settings

### Build Errors

1. Check Vite configuration syntax
2. Verify all dependencies are installed
3. Ensure TypeScript types are correct
4. Review rollup plugin compatibility

## Future Optimizations

Potential improvements for future iterations:

- **Dynamic imports**: More granular code splitting
- **Service worker**: Offline caching strategy
- **Preloading**: Intelligent resource preloading
- **Compression**: Additional compression strategies
- **CDN optimization**: External library loading strategies
