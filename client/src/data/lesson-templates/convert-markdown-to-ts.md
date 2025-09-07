# Converting Markdown Lessons to TypeScript

## Process Overview

1. **Create/Edit** markdown lesson files
2. **Review with Grok** for accuracy and pedagogy
3. **Convert** approved content to TypeScript format
4. **Integrate** into the Math Farm application

## Conversion Example

### Input: Markdown Format

```markdown
## Section 1: Introduction to Limits

**Type:** explanation
**Content:** Limits describe the behavior of functions as inputs approach specific values...

### Key Mathematical Expressions:

- `\lim_{x \to a} f(x) = L`
- `\lim_{x \to \infty} \frac{1}{x} = 0`

#### Example 1: The Power Rule

**Concept:** How to differentiate polynomial functions
**Demonstration:** Finding the derivative of f(x) = x³
**Steps:**

1. Identify the power rule formula
2. Apply to f(x) = x³ where n = 3
3. Calculate: d/dx[x³] = 3x²

**Math Expression:** `\frac{d}{dx}[x^3] = 3x^2`
**Key Takeaway:** The power rule provides a quick method...
```

### Output: TypeScript Format

```typescript
{
  id: "intro-limits",
  title: "Introduction to Limits",
  type: "explanation",
  content: "Limits describe the behavior of functions as inputs approach specific values...",
  mathExpressions: [
    "\\lim_{x \\to a} f(x) = L",
    "\\lim_{x \\to \\infty} \\frac{1}{x} = 0"
  ]
},
{
  id: "power-rule-example",
  title: "Understanding Derivatives",
  type: "example",
  content: "Derivatives measure the instantaneous rate of change...",
  examples: [
    {
      id: "power-rule",
      title: "The Power Rule",
      concept: "How to differentiate polynomial functions",
      demonstration: "Finding the derivative of f(x) = x³",
      steps: [
        "Identify the power rule formula",
        "Apply to f(x) = x³ where n = 3",
        "Calculate: d/dx[x³] = 3x²"
      ],
      mathExpression: "\\frac{d}{dx}[x^3] = 3x^2",
      keyTakeaway: "The power rule provides a quick method..."
    }
  ]
}
```

## Workflow Benefits

### For Content Creation:

- **Focus on pedagogy** without worrying about code syntax
- **Easy collaboration** with Grok using familiar markdown
- **Quick iterations** and revisions
- **Mathematical accuracy** review before implementation

### For Implementation:

- **Clean separation** between content and code
- **Version control** of lesson content
- **Batch processing** of multiple subjects
- **Quality assurance** before going live

## Recommended File Structure

```
client/src/data/lesson-templates/
├── README-lesson-workflow.md          # This guide
├── conversion-script.js               # Automated conversion tool
├── subjects/
│   ├── arithmetic-lessons.md
│   ├── algebra-lessons.md
│   ├── geometry-lessons.md
│   ├── trigonometry-lessons.md
│   ├── calculus-lessons.md
│   ├── statistics-lessons.md
│   ├── linear-algebra-lessons.md
│   ├── differential-equations-lessons.md
│   └── game-design-math-lessons.md
└── converted/                         # Generated TypeScript files
    ├── arithmetic-content.ts
    ├── algebra-content.ts
    └── ...
```

## Next Steps

1. **Create markdown files** for each subject using the template
2. **Share with Grok** for mathematical review and pedagogical improvements
3. **Iterate and refine** content based on feedback
4. **Convert to TypeScript** using the conversion process
5. **Integrate** into Math Farm lesson system

This workflow ensures high-quality, mathematically accurate content while maintaining an efficient development process.
