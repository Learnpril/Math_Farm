# Design Document

## Overview

The printable math drills feature adds two new tabs ("Drills" and "Drill Answers") to the existing curriculum chapter interface. This system generates randomized addition and subtraction worksheets optimized for 8.5" x 11" printing, complete with corresponding answer keys.

## Architecture

### Component Structure

```
ChapterContent.tsx (existing)
├── Tab Navigation (existing)
│   ├── Reading (existing)
│   ├── Examples (existing)
│   ├── Practice (existing)
│   ├── Drills (NEW)
│   └── Drill Answers (NEW)
└── Tab Content (existing)
    ├── DrillsSection.tsx (NEW)
    └── DrillAnswersSection.tsx (NEW)
```

### New Components

#### DrillsSection.tsx

- Generates and displays printable math drill worksheets
- Handles drill type selection (Addition/Subtraction)
- Manages problem generation and layout
- Provides print optimization

#### DrillAnswersSection.tsx

- Displays identical layout to DrillsSection but with answers
- Shares problem generation logic with DrillsSection
- Maintains synchronized problem sets

#### DrillGenerator.ts (Utility)

- Generates randomized math problems based on chapter level
- Handles different difficulty levels and number ranges
- Provides consistent problem generation across drill and answer components

## Data Models

### DrillProblem Interface

```typescript
interface DrillProblem {
  id: string;
  operand1: number;
  operand2: number;
  operation: 'addition' | 'subtraction';
  answer: number;
  difficulty: 'easy' | 'medium' | 'hard';
}
```

### DrillSet Interface

```typescript
interface DrillSet {
  id: string;
  title: string;
  operation: 'addition' | 'subtraction';
  problems: DrillProblem[];
  generatedAt: Date;
  chapterLevel: number;
}
```

### DrillConfiguration Interface

```typescript
interface DrillConfiguration {
  problemCount: number;
  gridColumns: number;
  gridRows: number;
  numberRange: {
    min: number;
    max: number;
  };
  allowNegativeResults: boolean;
  mixedDifficulty: boolean;
}
```

## Components and Interfaces

### DrillsSection Component

**Props:**

- `chapterId: string` - Current chapter identifier
- `chapterTitle: string` - Display title for the worksheet header

**State:**

- `selectedOperation: 'addition' | 'subtraction'` - Currently selected drill type
- `currentDrillSet: DrillSet | null` - Generated problem set
- `isGenerating: boolean` - Loading state for problem generation

**Key Methods:**

- `generateNewDrillSet(operation)` - Creates new randomized problem set
- `handlePrint()` - Triggers browser print dialog with optimized styling
- `handleOperationChange(operation)` - Switches between addition/subtraction

### DrillAnswersSection Component

**Props:**

- `chapterId: string` - Current chapter identifier
- `chapterTitle: string` - Display title for the answer sheet header
- `drillSet: DrillSet` - Problem set from DrillsSection (shared state)

**Features:**

- Displays identical grid layout as DrillsSection
- Shows answers below each problem
- Maintains visual consistency with drill worksheet

### DrillGenerator Utility

**Core Functions:**

```typescript
generateAdditionProblems(config: DrillConfiguration): DrillProblem[]
generateSubtractionProblems(config: DrillConfiguration): DrillProblem[]
getChapterConfiguration(chapterId: string): DrillConfiguration
formatProblemForDisplay(problem: DrillProblem): string
```

**Problem Generation Logic:**

- **Addition**: Generates problems within specified number ranges
- **Subtraction**: Ensures positive results unless negative results are enabled
- **Difficulty Scaling**: Adjusts number ranges based on chapter level
- **Randomization**: Uses seeded random generation for reproducible results

## Error Handling

### Problem Generation Errors

- **Invalid Configuration**: Fallback to default settings
- **Number Range Issues**: Auto-adjust ranges to valid values
- **Generation Timeout**: Provide pre-generated fallback problems

### Print Errors

- **Browser Compatibility**: Graceful degradation for older browsers
- **Print Dialog Issues**: Provide manual print instructions
- **Layout Problems**: CSS fallbacks for different screen sizes

## Testing Strategy

### Unit Tests

- DrillGenerator problem generation accuracy
- Number range validation
- Answer calculation verification
- Configuration parsing

### Integration Tests

- Tab navigation between drills and answers
- Problem set synchronization
- Print functionality across browsers
- Responsive layout testing

### Visual Tests

- Print layout verification (8.5" x 11")
- Grid alignment and spacing
- Typography and readability
- Answer sheet formatting

## Print Optimization

### CSS Media Queries

```css
@media print {
  /* Hide navigation and non-essential elements */
  .navigation,
  .sidebar,
  .footer {
    display: none;
  }

  /* Optimize typography for print */
  body {
    font-size: 12pt;
    color: black;
  }

  /* Ensure proper page breaks */
  .drill-grid {
    page-break-inside: avoid;
  }

  /* Set proper margins for 8.5" x 11" */
  @page {
    margin: 0.75in;
  }
}
```

### Layout Specifications

- **Page Size**: 8.5" x 11" (US Letter)
- **Margins**: 0.75" on all sides
- **Grid Layout**: 5 columns × 8 rows (40 problems per page)
- **Problem Spacing**: Adequate space for handwritten answers
- **Header Space**: Math Farm branding + chapter title + student info fields

## Performance Considerations

### Problem Generation

- Generate problems on-demand to avoid memory overhead
- Cache configurations to prevent repeated calculations
- Use efficient random number generation

### Print Performance

- Minimize DOM manipulation during print preparation
- Use CSS transforms instead of JavaScript for layout
- Optimize image assets for print resolution

### Memory Management

- Clean up generated problem sets when switching chapters
- Limit stored drill history to prevent memory leaks
- Use lazy loading for drill components

## Accessibility Features

### Screen Reader Support

- Proper ARIA labels for drill navigation
- Semantic HTML structure for problem grids
- Alternative text for mathematical expressions

### Keyboard Navigation

- Tab order through drill type selection
- Keyboard shortcuts for print functionality
- Focus management between drill and answer tabs

### Visual Accessibility

- High contrast mode support for print
- Scalable fonts that work across different print sizes
- Clear visual hierarchy in problem layout

## Integration Points

### Existing Curriculum System

- Extends current tab navigation in ChapterContent.tsx
- Uses existing chapter data structure for configuration
- Maintains consistency with current design system

### Print System Integration

- Leverages browser's native print functionality
- Integrates with existing CSS framework
- Uses current color scheme and typography

### State Management

- Integrates with existing curriculum progress tracking
- Shares chapter context with other curriculum components
- Maintains drill preferences in local storage
