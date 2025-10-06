# Blue Background Math Font Size Fix Summary

## Problem
The user reported that math expressions in blue background sections within Arithmetic's Reading sections were too small and hard to read. These sections appear with a blur background (dark blue in dark mode and light blue in light mode) and contain LaTeX/MathJax rendered content.

## Root Cause
The issue was in the `ReadingSection` component (formerly `TheorySection`) where LaTeX expressions are rendered inside blue background containers. The MathExpression component had fixed font sizes that were too small for readability in these highlighted sections.

## Solution Implemented

### 1. Updated ReadingSection Component
**File:** `client/src/features/curriculum/components/TheorySection.tsx`

**Changes:**
- Added `text-xl` class to the blue background container div
- Added `text-xl` className prop to the MathExpression component

**Before:**
```tsx
<div className='my-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
  <MathExpression>{concept.latex}</MathExpression>
</div>
```

**After:**
```tsx
<div className='my-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 text-xl'>
  <MathExpression className="text-xl">{concept.latex}</MathExpression>
</div>
```

### 2. Updated MathExpression Component
**File:** `client/src/features/curriculum/components/MathExpression.tsx`

**Changes:**
- Modified the fontSize style logic to respect Tailwind text size classes when provided
- Added check for `text-` classes in className prop to use `inherit` instead of fixed sizes

**Before:**
```tsx
fontSize: inline ? '1.1em' : '1.25em',
```

**After:**
```tsx
fontSize: className.includes('text-') ? 'inherit' : (inline ? '1.1em' : '1.25em'),
```

## Impact
- Math expressions in blue background sections now display at `text-xl` size (1.25rem/20px)
- Improved readability for LaTeX/MathJax content in Reading sections
- Maintains backward compatibility - other MathExpression usages remain unchanged
- Only affects blue background math sections in curriculum Reading content

## Files Modified
1. `client/src/features/curriculum/components/TheorySection.tsx`
2. `client/src/features/curriculum/components/MathExpression.tsx`

## Testing
- Verified no TypeScript errors in TheorySection component
- Confirmed MathExpression component respects className-based font sizing
- Changes are isolated to blue background sections only

The fix specifically targets the blue background math sections that the user identified as problematic while preserving the existing behavior for all other math expressions throughout the application.