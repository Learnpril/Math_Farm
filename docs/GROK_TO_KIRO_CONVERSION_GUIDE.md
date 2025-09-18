# Converting Grok Curriculum Specs to Kiro Implementation Tasks

## Workflow Overview

1. **Feed to Grok**: Use `CURRICULUM_TEMPLATE_FOR_GROK.md` with your chosen topic
2. **Get Spec**: Grok returns detailed curriculum specification
3. **Convert to Tasks**: Use this guide to create Kiro spec tasks
4. **Implement**: Feed tasks to Kiro for development

## Kiro Spec Structure Template

When you get Grok's curriculum spec, create a new Kiro spec using this structure:

### File: `.kiro/specs/[topic-name]-curriculum/requirements.md`

```markdown
# [Topic Name] Curriculum Implementation

## Overview

[Copy executive summary from Grok's output]

## User Stories

- As a learner, I want to access [topic] lessons in a structured, chapter-based format
- As a learner, I want to practice problems with immediate feedback after each chapter
- As a learner, I want to track my progress through the curriculum
- As a learner, I want to access interactive tools relevant to [topic]

## Technical Requirements

- Chapter-based navigation system
- Progress tracking and persistence
- MathJax integration for mathematical expressions
- Interactive problem-solving interface
- Mobile-responsive design
- Accessibility compliance (WCAG 2.2)

## Content Structure

[Paste Grok's chapter breakdown here]

## Success Criteria

- All chapters are navigable and content renders correctly
- Practice problems provide immediate feedback
- Progress is saved and restored between sessions
- All mathematical expressions render properly with MathJax
- Interface is fully accessible and mobile-friendly
```

### File: `.kiro/specs/[topic-name]-curriculum/design.md`

```markdown
# [Topic Name] Curriculum Design

## Architecture

- **Route**: `/topic/[topic-slug]/curriculum`
- **Components**: Chapter navigation, content renderer, practice interface
- **Data**: JSON-based curriculum content with embedded LaTeX
- **State**: Progress tracking via localStorage and optional backend sync

## Component Hierarchy
```

TopicCurriculumPage
├── CurriculumNavigation
├── ChapterContent
│ ├── TheorySection
│ ├── WorkedExamples
│ └── PracticeProblems
├── ProgressTracker
└── InteractiveTools

```

## Data Schema
[Include Grok's suggested data structures]

## UI/UX Considerations
- Purple theme consistency
- Chapter progress indicators
- Collapsible sections for better mobile experience
- Keyboard navigation support
- Screen reader compatibility
```

### File: `.kiro/specs/[topic-name]-curriculum/tasks.md`

```markdown
# [Topic Name] Curriculum Implementation Tasks

## Phase 1: Core Infrastructure

- [ ] Create curriculum data structure and JSON files
- [ ] Build chapter navigation component
- [ ] Implement progress tracking system
- [ ] Set up MathJax integration for curriculum content

## Phase 2: Content Rendering

- [ ] Create theory section component with LaTeX support
- [ ] Build worked examples component with step-by-step display
- [ ] Implement practice problems interface
- [ ] Add immediate feedback system

## Phase 3: Interactivity

- [ ] Integrate relevant Math Farm tools (calculator, grapher, etc.)
- [ ] Add hint system for practice problems
- [ ] Implement solution reveal functionality
- [ ] Create progress visualization

## Phase 4: Polish & Accessibility

- [ ] Ensure full WCAG 2.2 compliance
- [ ] Optimize for mobile devices
- [ ] Add keyboard navigation
- [ ] Test with screen readers

## Phase 5: Integration

- [ ] Connect to main Math Farm navigation
- [ ] Add to topic pages
- [ ] Update routing system
- [ ] Test end-to-end user flow
```

## Content Conversion Guidelines

### From Grok's Chapter Structure to Implementation:

1. **Theory Sections** → React components with MathJax
2. **Worked Examples** → Step-by-step reveal components
3. **Practice Problems** → Interactive problem-solving interface
4. **Assessments** → Progress tracking and mastery indicators

### Data File Structure:

```
client/src/data/curriculum/[topic-name]/
├── metadata.json          # Topic info, prerequisites, etc.
├── chapter-01.json        # First chapter content
├── chapter-02.json        # Second chapter content
└── practice-problems.json # All practice problems
```

### Component File Structure:

```
client/src/features/curriculum/
├── components/
│   ├── CurriculumNavigation.tsx
│   ├── ChapterContent.tsx
│   ├── TheorySection.tsx
│   ├── WorkedExamples.tsx
│   ├── PracticeProblems.tsx
│   └── ProgressTracker.tsx
├── hooks/
│   ├── useCurriculumProgress.ts
│   └── usePracticeProblems.ts
└── pages/
    └── TopicCurriculumPage.tsx
```

## Sample Prompt for Kiro

After creating the spec files, use this prompt with Kiro:

```
I have a curriculum spec for [Topic Name] that I'd like to implement. Please start with Phase 1 tasks:

1. Create the curriculum data structure based on the chapter breakdown in the requirements
2. Build the basic navigation component
3. Set up progress tracking
4. Ensure MathJax integration works for curriculum content

The spec files are in .kiro/specs/[topic-name]-curriculum/. Let's focus on creating a solid foundation before adding the interactive elements.
```

## Tips for Success

1. **Start Small**: Implement one chapter fully before moving to the next
2. **Test Early**: Verify MathJax rendering with sample content
3. **Iterate**: Use Grok's examples to test your implementation
4. **Accessibility First**: Build with screen readers in mind from the start
5. **Mobile Responsive**: Test on mobile devices throughout development

This workflow should give you a smooth path from Grok's curriculum design to a fully implemented Math Farm topic!
