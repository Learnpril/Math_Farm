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
  },
  trigonometry: {
    topicId: "trigonometry",
    sections: [
      {
        id: "intro-trig",
        title: "Introduction to Trigonometry",
        type: "explanation",
        content: "Trigonometry studies the relationships between angles and sides in triangles. It's fundamental to understanding periodic phenomena, waves, and rotational motion.",
        mathExpressions: [
          "\\sin(\\theta) = \\frac{\\text{opposite}}{\\text{hypotenuse}}",
          "\\cos(\\theta) = \\frac{\\text{adjacent}}{\\text{hypotenuse}}",
          "\\tan(\\theta) = \\frac{\\text{opposite}}{\\text{adjacent}}"
        ]
      },
      {
        id: "unit-circle",
        title: "The Unit Circle",
        type: "example",
        content: "The unit circle is a circle with radius 1 centered at the origin. It helps us understand trigonometric functions for all angles.",
        examples: [
          {
            id: "special-angles",
            title: "Special Angles",
            problem: "Find sin(30°), cos(30°), and tan(30°)",
            solution: "sin(30°) = 1/2, cos(30°) = √3/2, tan(30°) = √3/3",
            steps: [
              "Draw a 30-60-90 triangle",
              "In this triangle, sides are in ratio 1:√3:2",
              "For 30° angle: opposite = 1, adjacent = √3, hypotenuse = 2",
              "sin(30°) = 1/2, cos(30°) = √3/2, tan(30°) = 1/√3 = √3/3"
            ],
            mathExpression: "\\sin(30°) = \\frac{1}{2}, \\cos(30°) = \\frac{\\sqrt{3}}{2}, \\tan(30°) = \\frac{\\sqrt{3}}{3}"
          }
        ]
      },
      {
        id: "trig-identities",
        title: "Trigonometric Identities",
        type: "example",
        content: "Trigonometric identities are equations that are true for all values of the variables involved.",
        mathExpressions: [
          "\\sin^2(\\theta) + \\cos^2(\\theta) = 1",
          "\\tan(\\theta) = \\frac{\\sin(\\theta)}{\\cos(\\theta)}",
          "\\sin(2\\theta) = 2\\sin(\\theta)\\cos(\\theta)"
        ],
        examples: [
          {
            id: "pythagorean-identity",
            title: "Pythagorean Identity",
            problem: "Prove that sin²(θ) + cos²(θ) = 1",
            solution: "This follows directly from the Pythagorean theorem",
            steps: [
              "Consider a right triangle with hypotenuse 1",
              "Let the sides be sin(θ) and cos(θ)",
              "By Pythagorean theorem: sin²(θ) + cos²(θ) = 1²",
              "Therefore: sin²(θ) + cos²(θ) = 1"
            ],
            mathExpression: "\\sin^2(\\theta) + \\cos^2(\\theta) = 1"
          }
        ]
      }
    ]
  },
  calculus: {
    topicId: "calculus",
    sections: [
      {
        id: "limits",
        title: "Introduction to Limits",
        type: "explanation",
        content: "Limits describe the behavior of functions as inputs approach specific values. They form the foundation of calculus.",
        mathExpressions: [
          "\\lim_{x \\to a} f(x) = L",
          "\\lim_{x \\to \\infty} \\frac{1}{x} = 0",
          "\\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}"
        ]
      },
      {
        id: "derivatives",
        title: "Derivatives and Differentiation",
        type: "example",
        content: "Derivatives measure the rate of change of functions. They tell us how fast something is changing at any given point.",
        examples: [
          {
            id: "power-rule",
            title: "Power Rule",
            problem: "Find the derivative of f(x) = x³",
            solution: "f'(x) = 3x²",
            steps: [
              "Apply the power rule: d/dx[xⁿ] = nxⁿ⁻¹",
              "For f(x) = x³, n = 3",
              "f'(x) = 3x³⁻¹ = 3x²"
            ],
            mathExpression: "\\frac{d}{dx}[x^3] = 3x^2"
          },
          {
            id: "chain-rule",
            title: "Chain Rule",
            problem: "Find the derivative of f(x) = (2x + 1)³",
            solution: "f'(x) = 6(2x + 1)²",
            steps: [
              "Let u = 2x + 1, so f(x) = u³",
              "f'(x) = 3u² · u'",
              "u' = d/dx[2x + 1] = 2",
              "f'(x) = 3(2x + 1)² · 2 = 6(2x + 1)²"
            ],
            mathExpression: "\\frac{d}{dx}[(2x + 1)^3] = 6(2x + 1)^2"
          }
        ]
      },
      {
        id: "integrals",
        title: "Integration",
        type: "example",
        content: "Integration is the reverse of differentiation. It finds the area under curves and accumulates quantities over intervals.",
        examples: [
          {
            id: "basic-integration",
            title: "Basic Integration",
            problem: "Find ∫x² dx",
            solution: "x³/3 + C",
            steps: [
              "Use the power rule for integration: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C",
              "For ∫x² dx, n = 2",
              "∫x² dx = x²⁺¹/(2+1) + C = x³/3 + C"
            ],
            mathExpression: "\\int x^2 \\, dx = \\frac{x^3}{3} + C"
          }
        ]
      }
    ]
  },
  statistics: {
    topicId: "statistics",
    sections: [
      {
        id: "descriptive-stats",
        title: "Descriptive Statistics",
        type: "explanation",
        content: "Descriptive statistics summarize and describe the main features of a dataset using measures of central tendency and variability.",
        mathExpressions: [
          "\\bar{x} = \\frac{1}{n}\\sum_{i=1}^{n} x_i",
          "s^2 = \\frac{1}{n-1}\\sum_{i=1}^{n} (x_i - \\bar{x})^2",
          "s = \\sqrt{s^2}"
        ]
      },
      {
        id: "probability",
        title: "Probability Fundamentals",
        type: "example",
        content: "Probability quantifies the likelihood of events occurring. It ranges from 0 (impossible) to 1 (certain).",
        examples: [
          {
            id: "basic-probability",
            title: "Basic Probability",
            problem: "What's the probability of rolling a 6 on a fair die?",
            solution: "1/6 ≈ 0.167",
            steps: [
              "Identify favorable outcomes: rolling a 6 (1 outcome)",
              "Identify total possible outcomes: 1, 2, 3, 4, 5, 6 (6 outcomes)",
              "P(rolling 6) = favorable/total = 1/6"
            ],
            mathExpression: "P(\\text{rolling 6}) = \\frac{1}{6}"
          },
          {
            id: "conditional-probability",
            title: "Conditional Probability",
            problem: "Given P(A) = 0.3, P(B) = 0.4, P(A∩B) = 0.1, find P(A|B)",
            solution: "P(A|B) = 0.25",
            steps: [
              "Use conditional probability formula: P(A|B) = P(A∩B)/P(B)",
              "Substitute values: P(A|B) = 0.1/0.4",
              "P(A|B) = 0.25"
            ],
            mathExpression: "P(A|B) = \\frac{P(A \\cap B)}{P(B)} = \\frac{0.1}{0.4} = 0.25"
          }
        ]
      },
      {
        id: "distributions",
        title: "Probability Distributions",
        type: "example",
        content: "Probability distributions describe how probabilities are distributed over the values of a random variable.",
        mathExpressions: [
          "f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}",
          "P(X = k) = \\binom{n}{k} p^k (1-p)^{n-k}",
          "E[X] = \\mu, \\text{Var}(X) = \\sigma^2"
        ]
      }
    ]
  },
  "linear-algebra": {
    topicId: "linear-algebra",
    sections: [
      {
        id: "vectors",
        title: "Vectors and Vector Operations",
        type: "explanation",
        content: "Vectors are mathematical objects that have both magnitude and direction. They're fundamental to linear algebra and many applications.",
        mathExpressions: [
          "\\vec{v} = \\begin{bmatrix} v_1 \\\\ v_2 \\\\ v_3 \\end{bmatrix}",
          "\\vec{u} + \\vec{v} = \\begin{bmatrix} u_1 + v_1 \\\\ u_2 + v_2 \\\\ u_3 + v_3 \\end{bmatrix}",
          "\\vec{u} \\cdot \\vec{v} = u_1v_1 + u_2v_2 + u_3v_3"
        ]
      },
      {
        id: "matrices",
        title: "Matrices and Matrix Operations",
        type: "example",
        content: "Matrices are rectangular arrays of numbers that can represent linear transformations and systems of equations.",
        examples: [
          {
            id: "matrix-multiplication",
            title: "Matrix Multiplication",
            problem: "Multiply matrices A = [[1,2],[3,4]] and B = [[5,6],[7,8]]",
            solution: "AB = [[19,22],[43,50]]",
            steps: [
              "For element (1,1): 1×5 + 2×7 = 5 + 14 = 19",
              "For element (1,2): 1×6 + 2×8 = 6 + 16 = 22",
              "For element (2,1): 3×5 + 4×7 = 15 + 28 = 43",
              "For element (2,2): 3×6 + 4×8 = 18 + 32 = 50"
            ],
            mathExpression: "\\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix} \\begin{bmatrix} 5 & 6 \\\\ 7 & 8 \\end{bmatrix} = \\begin{bmatrix} 19 & 22 \\\\ 43 & 50 \\end{bmatrix}"
          }
        ]
      },
      {
        id: "eigenvalues",
        title: "Eigenvalues and Eigenvectors",
        type: "example",
        content: "Eigenvalues and eigenvectors reveal the fundamental directions and scaling factors of linear transformations.",
        mathExpressions: [
          "A\\vec{v} = \\lambda\\vec{v}",
          "\\det(A - \\lambda I) = 0",
          "\\text{characteristic polynomial}"
        ]
      }
    ]
  },
  "differential-equations": {
    topicId: "differential-equations",
    sections: [
      {
        id: "intro-de",
        title: "Introduction to Differential Equations",
        type: "explanation",
        content: "Differential equations involve functions and their derivatives. They model how quantities change over time or space.",
        mathExpressions: [
          "\\frac{dy}{dx} = f(x, y)",
          "\\frac{d^2y}{dx^2} + p(x)\\frac{dy}{dx} + q(x)y = g(x)",
          "y' + P(x)y = Q(x)"
        ]
      },
      {
        id: "first-order",
        title: "First-Order Differential Equations",
        type: "example",
        content: "First-order differential equations involve only the first derivative of the unknown function.",
        examples: [
          {
            id: "separable-de",
            title: "Separable Differential Equation",
            problem: "Solve dy/dx = xy",
            solution: "y = Ce^(x²/2)",
            steps: [
              "Separate variables: dy/y = x dx",
              "Integrate both sides: ∫dy/y = ∫x dx",
              "ln|y| = x²/2 + C₁",
              "y = e^(x²/2 + C₁) = Ce^(x²/2)"
            ],
            mathExpression: "\\frac{dy}{dx} = xy \\Rightarrow y = Ce^{\\frac{x^2}{2}}"
          }
        ]
      },
      {
        id: "applications",
        title: "Applications of Differential Equations",
        type: "example",
        content: "Differential equations model many real-world phenomena including population growth, radioactive decay, and oscillations.",
        mathExpressions: [
          "\\frac{dP}{dt} = kP \\text{ (exponential growth)}",
          "m\\frac{d^2x}{dt^2} + c\\frac{dx}{dt} + kx = F(t) \\text{ (damped oscillator)}",
          "\\frac{dN}{dt} = -\\lambda N \\text{ (radioactive decay)}"
        ]
      }
    ]
  },
  "game-design-math": {
    topicId: "game-design-math",
    sections: [
      {
        id: "vectors-games",
        title: "Vectors in Game Development",
        type: "explanation",
        content: "Vectors are essential in game development for representing positions, velocities, forces, and directions in 2D and 3D space.",
        mathExpressions: [
          "\\vec{position} = \\vec{position_0} + \\vec{velocity} \\cdot t",
          "\\vec{F} = m\\vec{a}",
          "\\vec{v}_{final} = \\vec{v}_{initial} + \\vec{a} \\cdot t"
        ]
      },
      {
        id: "physics-simulation",
        title: "Physics Simulation",
        type: "example",
        content: "Game physics simulate realistic motion using mathematical models of forces, collisions, and constraints.",
        examples: [
          {
            id: "projectile-motion",
            title: "Projectile Motion",
            problem: "Calculate the trajectory of a projectile launched at 45° with initial velocity 20 m/s",
            solution: "Range ≈ 40.8 m, Max height ≈ 10.2 m",
            steps: [
              "Break velocity into components: vₓ = 20cos(45°) = 14.14 m/s, vᵧ = 20sin(45°) = 14.14 m/s",
              "Time to max height: t = vᵧ/g = 14.14/9.8 = 1.44 s",
              "Max height: h = vᵧt - ½gt² = 14.14(1.44) - ½(9.8)(1.44)² = 10.2 m",
              "Total flight time: 2t = 2.88 s, Range: R = vₓ × 2t = 14.14 × 2.88 = 40.8 m"
            ],
            mathExpression: "x(t) = v_0 \\cos(\\theta) \\cdot t, \\quad y(t) = v_0 \\sin(\\theta) \\cdot t - \\frac{1}{2}gt^2"
          }
        ]
      },
      {
        id: "collision-detection",
        title: "Collision Detection and Response",
        type: "example",
        content: "Collision detection uses geometric algorithms to determine when objects intersect, enabling realistic interactions.",
        examples: [
          {
            id: "circle-collision",
            title: "Circle-Circle Collision",
            problem: "Detect collision between circles at (0,0) radius 3 and (4,0) radius 2",
            solution: "Collision detected: distance = 4, sum of radii = 5",
            steps: [
              "Calculate distance between centers: d = √[(4-0)² + (0-0)²] = 4",
              "Sum of radii: r₁ + r₂ = 3 + 2 = 5",
              "Since d < r₁ + r₂ (4 < 5), circles are colliding",
              "Overlap distance: 5 - 4 = 1 unit"
            ],
            mathExpression: "\\text{collision if } |\\vec{c_1} - \\vec{c_2}| < r_1 + r_2"
          }
        ]
      },
      {
        id: "game-mechanics",
        title: "Mathematical Game Mechanics",
        type: "example",
        content: "Game mechanics often rely on mathematical formulas for damage calculation, experience systems, and procedural generation.",
        mathExpressions: [
          "\\text{damage} = \\text{base} \\times (1 + \\text{multipliers}) - \\text{defense}",
          "\\text{XP needed} = \\text{level}^2 \\times \\text{base XP}",
          "\\text{drop rate} = \\text{base rate} \\times (1 + \\text{luck bonus})"
        ]
      }
    ]
  }
}