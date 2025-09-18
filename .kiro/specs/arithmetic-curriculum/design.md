# Arithmetic Curriculum Design

## Architecture

- **Route**: `/topic/arithmetic/curriculum`
- **Components**: Chapter navigation, content renderer, practice interface, progress tracking
- **Data**: JSON-based curriculum content with embedded LaTeX stored in `client/src/data/curriculum/arithmetic/`
- **State**: Progress tracking via localStorage with React hooks for state management
- **Integration**: Seamless connection to existing Math Farm tools and components

## Component Hierarchy

```
ArithmeticCurriculumPage
├── CurriculumHeader (title, progress overview)
├── CurriculumNavigation (chapter list, progress indicators)
├── ChapterContent
│   ├── ChapterIntroduction (real-world context)
│   ├── TheorySection (concepts with MathJax)
│   ├── WorkedExamples (step-by-step solutions)
│   ├── PracticeProblems (interactive exercises)
│   └── ChapterSummary (key takeaways)
├── ProgressTracker (completion status, achievements)
├── ToolIntegration (embedded Math Farm tools)
└── NavigationControls (previous/next chapter)
```

## Data Schema

### Curriculum Metadata (`metadata.json`)

```json
{
  "topic": "arithmetic",
  "title": "Arithmetic Fundamentals",
  "difficulty": "elementary",
  "prerequisites": [],
  "objectives": [
    "Master basic arithmetic operations with whole numbers, fractions, and decimals",
    "Apply arithmetic concepts to solve real-world problems",
    "Develop number sense and computational fluency",
    "Use mathematical tools and notation accurately"
  ],
  "estimatedHours": 25,
  "chapters": 8,
  "tools": ["calculator", "fraction-visualizer", "place-value-chart"]
}
```

### Chapter Structure (`chapter-N.json`)

```json
{
  "id": "chapter-01",
  "title": "Numbers and Place Value",
  "duration": 2,
  "objectives": ["Understand place value system", "Compare and order numbers"],
  "prerequisites": [],
  "introduction": {
    "context": "Understanding large numbers in population counts, distances, and measurements",
    "connection": "Builds on basic counting and number recognition"
  },
  "theory": {
    "concepts": [
      {
        "title": "Place Value System",
        "content": "Numbers are organized in a base-10 system where each position represents a power of 10",
        "latex": "123 = 1 \\times 10^2 + 2 \\times 10^1 + 3 \\times 10^0",
        "visuals": ["place-value-chart", "number-line"]
      }
    ]
  },
  "examples": [
    {
      "problem": "Write 4,567 in expanded form",
      "solution": "4,567 = 4,000 + 500 + 60 + 7",
      "steps": [
        "Identify the place value of each digit",
        "4 is in the thousands place: 4 × 1,000 = 4,000",
        "5 is in the hundreds place: 5 × 100 = 500",
        "6 is in the tens place: 6 × 10 = 60",
        "7 is in the ones place: 7 × 1 = 7"
      ],
      "commonErrors": [
        "Forgetting to include zeros",
        "Misidentifying place values"
      ]
    }
  ],
  "practice": [
    {
      "id": "p1-1",
      "type": "multiple-choice",
      "problem": "What is the value of the digit 7 in 3,742?",
      "options": ["7", "70", "700", "7,000"],
      "correct": 1,
      "hints": ["Look at the position of the 7", "Count from right to left"],
      "explanation": "The 7 is in the tens place, so its value is 7 × 10 = 70"
    }
  ],
  "tools": ["calculator", "place-value-chart"],
  "assessment": {
    "masteryThreshold": 0.8,
    "requiredProblems": 6
  }
}
```

## UI/UX Design Principles

### Visual Design

- **Purple Theme**: Consistent with Math Farm's HSL-based purple color scheme
- **Typography**: Clear, readable fonts with proper contrast ratios
- **Spacing**: Generous whitespace for readability and touch targets
- **Icons**: Lucide React icons for navigation and interactive elements

### Responsive Layout

- **Mobile**: Single-column layout with collapsible navigation
- **Tablet**: Two-column layout with sidebar navigation
- **Desktop**: Multi-column layout with persistent sidebar

### Accessibility Features

- **Keyboard Navigation**: Full keyboard support with visible focus indicators
- **Screen Readers**: Proper ARIA labels and semantic HTML structure
- **Math Accessibility**: MathJax with alternative text for mathematical expressions
- **Color Contrast**: Minimum 4.5:1 ratio for all text elements

### Interactive Elements

- **Progress Indicators**: Visual progress bars and completion badges
- **Immediate Feedback**: Green/red indicators for correct/incorrect answers
- **Hint System**: Progressive hints that don't give away the answer
- **Tool Integration**: Seamless embedding of Math Farm calculators and visualizers

## State Management

### Progress Tracking

```typescript
interface CurriculumProgress {
  currentChapter: number;
  completedChapters: number[];
  chapterProgress: Record<string, ChapterProgress>;
  totalTimeSpent: number;
  achievements: string[];
}

interface ChapterProgress {
  completed: boolean;
  timeSpent: number;
  practiceScores: Record<string, number>;
  masteryLevel: number; // 0-1
}
```

### Local Storage Strategy

- **Key**: `mathfarm_arithmetic_progress`
- **Backup**: Optional sync with backend for registered users
- **Migration**: Version handling for data structure updates

## Integration Points

### Math Farm Tools

- **Calculator**: Embedded for verification and exploration
- **Visual Demonstrations**: Custom components for place value, fractions, etc.
- **Step-by-Step Solver**: Integration with existing Nerdamer-based solver

### Navigation Integration

- **Topic Page**: Link from main arithmetic topic page
- **Header Navigation**: Breadcrumb navigation showing current position
- **Related Content**: Suggestions for next topics or review materials

## Performance Considerations

### Loading Strategy

- **Lazy Loading**: Load chapters on demand to reduce initial bundle size
- **Caching**: Cache chapter content in localStorage for offline access
- **Code Splitting**: Separate bundles for each major component

### Client-Side Computations

- **Validation**: Use math.js for immediate answer checking
- **Visualization**: JSXGraph for interactive number lines and charts
- **Progress Calculation**: Real-time progress updates without server calls

## Technical Implementation Notes

### MathJax Integration

- **Configuration**: Optimized for arithmetic notation (fractions, decimals, basic operations)
- **Performance**: Lazy loading and caching of rendered expressions
- **Accessibility**: Proper alt-text generation for screen readers

### Component Architecture

- **Reusable Components**: Shared components for theory, examples, and practice
- **Custom Hooks**: `useCurriculumProgress`, `useChapterContent`, `usePracticeProblems`
- **Error Boundaries**: Graceful handling of content loading errors

### Data Validation

- **Schema Validation**: Runtime validation of curriculum JSON data
- **Content Sanitization**: Proper handling of user input in practice problems
- **Error Recovery**: Fallback content for missing or corrupted data
