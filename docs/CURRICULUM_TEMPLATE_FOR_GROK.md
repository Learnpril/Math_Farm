# Math Farm Curriculum Design Template

## Instructions for Grok

Please create a detailed curriculum specification for the topic: **[TOPIC_NAME]** using the following template. This will be used to generate implementation tasks for a self-hosted mathematics learning platform called Math Farm.

## Project Context

Math Farm is a comprehensive, self-hosted mathematics learning platform built with:

- React 19 + TypeScript frontend
- Express.js backend with SQLite database
- MathJax 4.0 for LaTeX rendering
- Interactive tools using math.js, Nerdamer, and JSXGraph
- Purple-themed UI with accessibility compliance (WCAG 2.2)
- Client-side computations for performance

## Target Audience

- Primary: Adult self-learners seeking independent math study
- Secondary: Students (elementary to advanced) for supplemental practice
- Learning approach: Self-paced with step-by-step explanations and instant feedback

## Curriculum Structure Requirements

### 1. Topic Overview

- **Topic Name**: [e.g., "Linear Algebra", "Calculus I", "Statistics"]
- **Difficulty Level**: [Elementary/Middle School/High School/Advanced/Specialized]
- **Prerequisites**: [List required prior knowledge]
- **Learning Objectives**: [3-5 clear, measurable goals]
- **Estimated Time**: [Hours needed to complete]

### 2. Chapter Breakdown

For each chapter, provide:

#### Chapter [N]: [Chapter Title]

- **Duration**: [Estimated time]
- **Learning Goals**: [Specific objectives for this chapter]
- **Key Concepts**: [Main ideas to be covered]
- **Mathematical Notation**: [Important symbols/formulas introduced]

**Content Structure**:

1. **Introduction** (5-10 minutes)
   - Real-world application/motivation
   - Connection to previous knowledge
2. **Theory Section** (15-25 minutes)
   - Core concepts with step-by-step explanations
   - Visual aids/diagrams needed
   - Interactive demonstrations
3. **Worked Examples** (10-15 minutes)
   - 2-3 progressively difficult examples
   - Step-by-step solutions with reasoning
   - Common mistakes to avoid
4. **Practice Problems** (20-30 minutes)
   - 5-8 problems of varying difficulty
   - Immediate feedback system
   - Hints available on demand
   - Solutions with explanations

**Interactive Elements Needed**:

- [ ] Calculator integration
- [ ] Graph plotting
- [ ] Step-by-step solver
- [ ] Visual demonstrations
- [ ] Formula reference

### 3. Assessment Strategy

- **Formative Assessment**: [How progress is tracked during learning]
- **Practice Problem Types**: [Multiple choice, fill-in, step-by-step, etc.]
- **Difficulty Progression**: [How problems increase in complexity]
- **Mastery Criteria**: [What constitutes successful completion]

### 4. Technical Implementation Notes

- **MathJax Requirements**: [Specific LaTeX commands needed]
- **Interactive Tools**: [Which Math Farm tools to integrate]
- **Data Structures**: [How to store problems/solutions]
- **Client-Side Computations**: [What can be calculated in browser]

### 5. Content Examples

Provide 2-3 complete examples of:

- A theory explanation with LaTeX formatting
- A worked example with step-by-step solution
- Practice problems with multiple difficulty levels

## Output Format

Please structure your response as a complete specification document that includes:

1. **Executive Summary** (1 paragraph overview)
2. **Detailed Chapter Breakdown** (as outlined above)
3. **Assessment Framework**
4. **Technical Requirements**
5. **Implementation Priority** (which chapters to build first)
6. **Integration Points** (how this connects to other Math Farm topics)

## Additional Considerations

- Ensure all content is accessible (screen reader friendly)
- Include alternative text for mathematical expressions
- Consider mobile-responsive design for all interactive elements
- Provide offline capability where possible
- Include gamification elements (progress tracking, achievements)
- Support for multiple learning styles (visual, auditory, kinesthetic)

## Sample Problem Format

For each practice problem, include:

```
Problem: [Clear statement with LaTeX if needed]
Difficulty: [1-5 scale]
Hints: [2-3 progressive hints]
Solution: [Step-by-step with reasoning]
Common Errors: [What students typically get wrong]
Extensions: [Related problems or deeper exploration]
```

---

**Note**: Focus on creating content that can be implemented incrementally, starting with core concepts and building complexity. Each chapter should be self-contained but build logically on previous material.
