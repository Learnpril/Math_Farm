# Navigation System Testing Documentation

## Overview

This document describes the comprehensive testing suite for the Math Farm navigation system. The test suite covers all aspects of navigation functionality, from basic routing to complex user journeys and accessibility compliance.

## Test Structure

### Unit Tests

#### 1. Navigation & Routing Tests (`navigation-routing.test.tsx`)

**Purpose**: Test core routing functionality and parameter parsing

**Coverage**:

- Route parameter parsing and validation
- Navigation between different pages
- Header navigation component functionality
- Click handlers and navigation state management
- Error handling for invalid routes
- Mobile menu functionality
- Accessibility attributes (ARIA labels, roles)

**Key Test Cases**:

- ✅ Parse topic ID from URL parameters correctly
- ✅ Handle invalid topic IDs gracefully
- ✅ Navigate to all main pages (home, tools, guides)
- ✅ Show 404 page for invalid routes
- ✅ Highlight active navigation items
- ✅ Toggle mobile menu with keyboard support
- ✅ Handle back button functionality

#### 2. Topic Rendering Tests (`topic-rendering.test.tsx`)

**Purpose**: Test component rendering with different topic data

**Coverage**:

- Topic page rendering with valid data
- Handling different difficulty levels and prerequisites
- Math expression rendering
- Error handling for missing/malformed data
- Component state management during re-renders

**Key Test Cases**:

- ✅ Render topic page with valid topic data
- ✅ Display difficulty levels and estimated time
- ✅ Show prerequisites and completion status
- ✅ Handle missing topic data gracefully
- ✅ Render math expressions correctly
- ✅ Update when topic ID changes

#### 3. Navigation Error Handling Tests (`navigation-error-handling.test.tsx`)

**Purpose**: Test error boundaries and recovery mechanisms

**Coverage**:

- Error boundary functionality
- Route error handling
- Component loading failures
- User input validation
- Browser compatibility issues
- Recovery mechanisms

**Key Test Cases**:

- ✅ Catch and display errors in ErrorBoundary
- ✅ Handle invalid routes with 404 page
- ✅ Handle malformed URLs gracefully
- ✅ Provide accessible error recovery options
- ✅ Handle network errors during navigation
- ✅ Sanitize user input to prevent XSS

### Integration Tests

#### 4. User Journey Integration Tests (`user-journey-integration.test.tsx`)

**Purpose**: Test complete user flows from start to finish

**Coverage**:

- Complete navigation journeys
- Cross-topic navigation via prerequisites
- Tools and guide page functionality
- Mobile navigation flows
- Search and discovery features
- Theme and accessibility persistence
- Performance during navigation

**Key Test Cases**:

- ✅ Navigate from home to topic and back
- ✅ Maintain user progress throughout journey
- ✅ Handle topic completion flow
- ✅ Navigate between related topics via prerequisites
- ✅ Use tools and guides effectively
- ✅ Handle mobile menu navigation
- ✅ Search and navigate from 404 page
- ✅ Maintain theme across navigation
- ✅ Handle rapid navigation without issues

#### 5. Accessibility Integration Tests (`accessibility-integration.test.tsx`)

**Purpose**: Test accessibility compliance and screen reader support

**Coverage**:

- Automated accessibility testing with axe-core
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Color contrast and visual accessibility
- Form accessibility
- Error accessibility

**Key Test Cases**:

- ✅ No accessibility violations on all pages
- ✅ Full keyboard navigation support
- ✅ Proper ARIA landmarks and labels
- ✅ Logical heading hierarchy
- ✅ Focus management during navigation
- ✅ Screen reader announcements
- ✅ High contrast and reduced motion support
- ✅ Accessible error messages and recovery

## Running Tests

### Individual Test Files

```bash
# Run specific test file
npm run test:run -- client/src/components/__tests__/navigation-routing.test.tsx

# Run with watch mode
npm test client/src/components/__tests__/navigation-routing.test.tsx

# Run with UI
npm run test:ui
```

### Complete Navigation Test Suite

```bash
# Run all navigation tests
npm run test:navigation

# Run all tests
npm run test:run

# Run tests with coverage
npm run test:run -- --coverage
```

### Test Configuration

Tests are configured in `vitest.config.ts`:

- Environment: jsdom (for DOM testing)
- Setup file: `client/src/test/setup.ts`
- Global test utilities available
- Accessibility testing with jest-axe

## Test Utilities and Mocks

### Common Mocks

```typescript
// Heavy dependencies
vi.mock("../../lib/mathJaxLoader");
vi.mock("../../lib/domErrorHandler");
vi.mock("../../components/LazyComponents");

// Browser APIs
window.matchMedia = vi.fn();
Element.prototype.scrollIntoView = vi.fn();
localStorage = mockLocalStorage;
```

### Test Wrapper

```typescript
const TestWrapper = ({ children, initialPath = "/" }) => (
  <ThemeProvider>
    <Router base={initialPath}>{children}</Router>
  </ThemeProvider>
);
```

### Accessibility Testing

```typescript
import { axe, toHaveNoViolations } from "jest-axe";
expect.extend(toHaveNoViolations);

const results = await axe(container);
expect(results).toHaveNoViolations();
```

## Requirements Coverage

### Requirement 1: Topic Page Navigation

- ✅ Topic card click navigation
- ✅ Topic page display with content
- ✅ Prerequisites and estimated time
- ✅ MathJax expression rendering
- ✅ Breadcrumb navigation

### Requirement 2: Tools Page Implementation

- ✅ Tools overview page navigation
- ✅ Tool category display
- ✅ Interactive tool functionality
- ✅ Responsive design maintenance

### Requirement 3: Educational Guide Pages

- ✅ LaTeX guide navigation and content
- ✅ MATLAB guide navigation and content
- ✅ Structured content with examples
- ✅ Syntax highlighting support
- ✅ Interactive examples

### Requirement 4: Enhanced Navigation UX

- ✅ Loading states during navigation
- ✅ Active navigation item highlighting
- ✅ Error message display
- ✅ Keyboard navigation support
- ✅ Touch-friendly mobile navigation

### Requirement 5: Search and Discovery

- ✅ Real-time search suggestions
- ✅ Search result highlighting
- ✅ Navigation to search results
- ✅ Alternative topic suggestions
- ✅ Content search across topics/tools/guides

### Requirement 6: Progress Tracking

- ✅ Topic completion marking
- ✅ Progress indicator display
- ✅ Progress persistence across sessions
- ✅ Prerequisite unlocking
- ✅ Next topic recommendations

## Continuous Integration

### GitHub Actions (Future)

```yaml
name: Navigation Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:navigation
      - run: npm run test:run -- --coverage
```

### Pre-commit Hooks (Future)

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:navigation"
    }
  }
}
```

## Performance Testing

### Metrics to Monitor

- Route loading times
- Component render times
- Memory usage during navigation
- Bundle size impact
- Accessibility audit performance

### Tools

- Vitest for unit/integration testing
- jest-axe for accessibility testing
- React Testing Library for user interaction testing
- User Event for realistic user interactions

## Maintenance

### Adding New Tests

1. Follow existing test patterns
2. Use descriptive test names
3. Mock heavy dependencies
4. Test both success and error cases
5. Include accessibility checks
6. Update this documentation

### Test Data Management

- Use real topic data from `topicsData.json`
- Mock external dependencies consistently
- Keep test data minimal but realistic
- Update mocks when APIs change

### Debugging Tests

- Use `screen.debug()` to inspect DOM
- Use `--reporter=verbose` for detailed output
- Check browser console for errors
- Verify mock implementations

## Best Practices

1. **Test User Behavior**: Focus on what users actually do
2. **Accessibility First**: Include accessibility tests for all features
3. **Error Scenarios**: Test error cases as thoroughly as success cases
4. **Performance Aware**: Mock heavy operations to keep tests fast
5. **Maintainable**: Write tests that are easy to understand and update
6. **Comprehensive**: Cover all requirements and edge cases
7. **Realistic**: Use realistic data and user interactions

## Future Enhancements

- Visual regression testing with Playwright
- End-to-end testing with Cypress
- Performance testing with Lighthouse CI
- Cross-browser testing automation
- Mobile device testing
- Load testing for navigation performance
