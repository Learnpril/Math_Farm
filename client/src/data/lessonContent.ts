// Lesson content data structure for topics

export interface ContentSection {
  id: string
  title: string
  type: "explanation" | "example" | "interactive" | "practice"
  content: string
  mathExpressions?: string[]
  interactiveDemo?: InteractiveDemo
  examples?: MathExample[]
}

export interface MathExample {
  id: string
  title: string
  problem: string
  solution: string
  steps: string[]
  mathExpression: string
}

export interface InteractiveDemo {
  id: string
  type: "jsxgraph" | "calculator" | "visualization"
  config: Record<string, any>
  description: string
}

export interface TopicLessonContent {
  topicId: string
  sections: ContentSection[]
}

// Sample lesson content for different topics
export const lessonContentData: Record<string, TopicLessonContent> = {
  arithmetic: {
    topicId: "arithmetic",
    sections: [
      {
        id: "intro",
        title: "Introduction to Arithmetic",
        type: "explanation",
        content: "Arithmetic is the foundation of all mathematics. It deals with basic operations on numbers: addition, subtraction, multiplication, and division.",
        mathExpressions: ["2 + 3 = 5", "7 - 4 = 3", "6 \\times 8 = 48", "15 \\div 3 = 5"]
      },
      {
        id: "addition",
        title: "Addition and Subtraction",
        type: "example",
        content: "Let's explore how to add and subtract numbers, including working with fractions.",
        examples: [
          {
            id: "basic-addition",
            title: "Basic Addition",
            problem: "What is 127 + 89?",
            solution: "216",
            steps: [
              "Align the numbers by place value",
              "Add ones: 7 + 9 = 16 (write 6, carry 1)",
              "Add tens: 2 + 8 + 1 = 11 (write 1, carry 1)", 
              "Add hundreds: 1 + 0 + 1 = 2",
              "Result: 216"
            ],
            mathExpression: "127 + 89 = 216"
          },
          {
            id: "fraction-addition",
            title: "Adding Fractions",
            problem: "What is 1/4 + 1/3?",
            solution: "7/12",
            steps: [
              "Find common denominator: LCM of 4 and 3 is 12",
              "Convert fractions: 1/4 = 3/12, 1/3 = 4/12",
              "Add numerators: 3 + 4 = 7",
              "Result: 7/12"
            ],
            mathExpression: "\\frac{1}{4} + \\frac{1}{3} = \\frac{3}{12} + \\frac{4}{12} = \\frac{7}{12}"
          }
        ]
      },
      {
        id: "multiplication",
        title: "Multiplication and Division",
        type: "example",
        content: "Multiplication and division are inverse operations. Let's see how they work together.",
        examples: [
          {
            id: "long-multiplication",
            title: "Long Multiplication",
            problem: "What is 23 × 47?",
            solution: "1081",
            steps: [
              "23 × 7 = 161",
              "23 × 40 = 920",
              "Add: 161 + 920 = 1081"
            ],
            mathExpression: "23 \\times 47 = 1081"
          }
        ]
      },
      {
        id: "practice",
        title: "Practice Problems",
        type: "practice",
        content: "Test your understanding with these practice problems.",
        mathExpressions: [
          "45 + 67 = ?",
          "\\frac{2}{5} + \\frac{1}{3} = ?",
          "84 \\times 12 = ?",
          "144 \\div 12 = ?"
        ]
      }
    ]
  },
  algebra: {
    topicId: "algebra",
    sections: [
      {
        id: "variables",
        title: "Introduction to Variables",
        type: "explanation",
        content: "Variables are symbols (usually letters) that represent unknown numbers. They allow us to write general mathematical relationships.",
        mathExpressions: ["x + 5 = 12", "2y - 3 = 7", "3a + 4b = 20"]
      },
      {
        id: "solving-equations",
        title: "Solving Linear Equations",
        type: "example",
        content: "Learn how to solve equations by isolating the variable.",
        examples: [
          {
            id: "simple-equation",
            title: "Solving x + 5 = 12",
            problem: "Solve for x: x + 5 = 12",
            solution: "x = 7",
            steps: [
              "Start with: x + 5 = 12",
              "Subtract 5 from both sides: x + 5 - 5 = 12 - 5",
              "Simplify: x = 7",
              "Check: 7 + 5 = 12 ✓"
            ],
            mathExpression: "x + 5 = 12 \\Rightarrow x = 7"
          },
          {
            id: "two-step-equation",
            title: "Solving 2x - 3 = 7",
            problem: "Solve for x: 2x - 3 = 7",
            solution: "x = 5",
            steps: [
              "Start with: 2x - 3 = 7",
              "Add 3 to both sides: 2x - 3 + 3 = 7 + 3",
              "Simplify: 2x = 10",
              "Divide by 2: x = 5",
              "Check: 2(5) - 3 = 10 - 3 = 7 ✓"
            ],
            mathExpression: "2x - 3 = 7 \\Rightarrow x = 5"
          }
        ]
      },
      {
        id: "factoring",
        title: "Factoring Expressions",
        type: "example",
        content: "Factoring is the process of breaking down expressions into their component parts.",
        examples: [
          {
            id: "factor-quadratic",
            title: "Factoring x² + 5x + 6",
            problem: "Factor: x² + 5x + 6",
            solution: "(x + 2)(x + 3)",
            steps: [
              "Look for two numbers that multiply to 6 and add to 5",
              "The numbers are 2 and 3: 2 × 3 = 6, 2 + 3 = 5",
              "Write as: (x + 2)(x + 3)",
              "Check: (x + 2)(x + 3) = x² + 3x + 2x + 6 = x² + 5x + 6 ✓"
            ],
            mathExpression: "x^2 + 5x + 6 = (x + 2)(x + 3)"
          }
        ]
      }
    ]
  },
  geometry: {
    topicId: "geometry",
    sections: [
      {
        id: "shapes",
        title: "Basic Shapes and Properties",
        type: "explanation",
        content: "Geometry studies shapes, sizes, and properties of space. Let's start with basic shapes.",
        mathExpressions: [
          "A_{circle} = \\pi r^2",
          "A_{rectangle} = l \\times w", 
          "A_{triangle} = \\frac{1}{2}bh"
        ]
      },
      {
        id: "area-perimeter",
        title: "Area and Perimeter",
        type: "example",
        content: "Learn to calculate area and perimeter of common shapes.",
        examples: [
          {
            id: "rectangle-area",
            title: "Rectangle Area",
            problem: "Find the area of a rectangle with length 8 cm and width 5 cm.",
            solution: "40 cm²",
            steps: [
              "Use the formula: Area = length × width",
              "Substitute values: Area = 8 × 5",
              "Calculate: Area = 40 cm²"
            ],
            mathExpression: "A = l \\times w = 8 \\times 5 = 40 \\text{ cm}^2"
          },
          {
            id: "circle-area",
            title: "Circle Area",
            problem: "Find the area of a circle with radius 3 cm.",
            solution: "9π cm² ≈ 28.27 cm²",
            steps: [
              "Use the formula: Area = πr²",
              "Substitute radius: Area = π × 3²",
              "Calculate: Area = π × 9 = 9π cm²",
              "Approximate: 9π ≈ 28.27 cm²"
            ],
            mathExpression: "A = \\pi r^2 = \\pi \\times 3^2 = 9\\pi \\text{ cm}^2"
          }
        ],
        interactiveDemo: {
          id: "shape-calculator",
          type: "jsxgraph",
          description: "Interactive shape area calculator",
          config: {
            boundingbox: [-5, 5, 5, -5],
            axis: true,
            showNavigation: false
          }
        }
      }
    ]
  }
}