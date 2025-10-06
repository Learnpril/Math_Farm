# Responsive Math Font Size Fix Summary

## Problem
The user identified that math expressions in blue background sections (Reading sections) had a CSS rule `.math-expression mjx-math {font-size: 0.875rem !important;}` that was overriding Tailwind classes and making the text too small. They requested responsive font sizes: 1rem on mobile and 1.5rem on desktop.

## Root Cause
The global CSS rule in `client/src/index.css` was using `!important` to force a small font size (0.875rem) for all MathJax expressions, which overrode any Tailwind text size classes.

## Solution Implemented

### 1. Added Responsive CSS Rules
**File:** `client/src/index.css`

**Added CSS:**
```css
/* Responsive font sizes for reading section math expressions */
.reading-section-math .math-expression mjx-math {
  font-size: 1rem !important;
}

@media (min-width: 1024px) {
  .reading-section-math .math-expression mjx-math {
    font-size: 1.5rem !important;
  }
}
```

### 2. Updated Reading Section Component
**File:** `client/src/features/curriculum/components/TheorySection.tsx`

**Changes:**
- Replaced `text-xl` Tailwind classes with custom `reading-section-math` CSS class
- Removed redundant className prop from MathExpression component

**Before:**
```tsx
<div className='my-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 text-xl'>
  <MathExpression className="text-xl">{concept.latex}</MathExpression>
</div>
```

**After:**
```tsx
<div className='my-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 reading-section-math'>
  <MathExpression>{concept.latex}</MathExpression>
</div>
```

## Font Size Specifications
- **Mobile (< 1024px):** 1rem (16px)
- **Desktop (≥ 1024px):** 1.5rem (24px)

## Technical Details
- Uses CSS `!important` to override the existing global MathJax font size rule
- Targets only elements with the `reading-section-math` class to avoid affecting other math expressions
- Uses responsive breakpoint at 1024px (Tailwind's `lg` breakpoint)
- Maintains all existing functionality while improving readability

## Impact
- Math expressions in Reading section blue backgrounds now have proper responsive font sizes
- Mobile users get 1rem font size for better readability on small screens
- Desktop users get 1.5rem font size for optimal readability on larger screens
- Other math expressions throughout the application remain unchanged
- No breaking changes to existing functionality

## Files Modified
1. `client/src/index.css` - Added responsive CSS rules
2. `client/src/features/curriculum/components/TheorySection.tsx` - Added custom CSS class

## Testing
- Verified no TypeScript errors in TheorySection component
- CSS rules use proper specificity to override global MathJax styles
- Responsive breakpoints align with Tailwind CSS standards