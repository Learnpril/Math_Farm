// New lesson content structure focused on teaching concepts
// This will replace the existing lessonContent.ts

export interface ContentSection {
  id: string
  title: string
  type: "explanation" | "example" | "interactive"
  content: string
  mathExpressions?: string[]
  interactiveDemo?: InteractiveDemo
  examples?: MathExample[]
}

export interface MathExample {
  id: string
  title: string
  concept: string
  demonstration: string
  steps: string[]
  mathExpression: string
  keyTakeaway: string
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

// Educational lesson content for all topics
export const lessonContentData: Record<string, TopicLessonContent> = {
  arithmetic: {
    topicId: "arithmetic",
    sections: [
      {
        id: "intro",
        title: "What is Arithmetic?",
        type: "explanation",
        content: "Arithmetic is the foundation of all mathematics. It deals with four basic operations on numbers: addition, subtraction, multiplication, and division. These operations allow us to solve everyday problems involving quantities, measurements, and calculations. Understanding arithmetic is essential for all higher mathematics.",
        mathExpressions: [
          "2 + 3 = 5 \\text{ (addition combines quantities)}", 
          "7 - 4 = 3 \\text{ (subtraction finds differences)}", 
          "6 \\times 8 = 48 \\text{ (multiplication repeats addition)}", 
          "15 \\div 3 = 5 \\text{ (division splits into equal groups)}"
        ]
      },
      {
        id: "number-system",
        title: "Understanding Numbers and Place Value",
        type: "explanation",
        content: "Our number system is based on powers of 10, called the decimal system. Each position in a number represents a different power of 10. Understanding place value is crucial for performing arithmetic operations correctly.",
        mathExpressions: [
          "1,234 = 1 \\times 1000 + 2 \\times 100 + 3 \\times 10 + 4 \\times 1",
          "\\text{thousands} \\quad \\text{hundreds} \\quad \\text{tens} \\quad \\text{ones}",
          "10^3 \\quad\\quad\\quad 10^2 \\quad\\quad\\quad 10^1 \\quad\\quad\\quad 10^0"
        ]
      },
      {
        id: "addition-concepts",
        title: "Addition: Combining Quantities",
        type: "example",
        content: "Addition is the process of combining two or more quantities to find their total. It follows important properties that make calculations easier and more reliable.",
        mathExpressions: [
          "a + b = b + a \\text{ (commutative property)}",
          "(a + b) + c = a + (b + c) \\text{ (associative property)}",
          "a + 0 = a \\text{ (identity property)}"
        ],
        examples: [
          {
            id: "place-value-addition",
            title: "Adding Using Place Value",
            concept: "How to add multi-digit numbers by aligning place values",
            demonstration: "Let's learn to add 247 + 156 step by step",
            steps: [
              "Write the numbers vertically, aligning by place value (ones under ones, tens under tens, etc.)",
              "Start with the ones column: 7 + 6 = 13. Write down 3 and carry 1 to the tens column",
              "Tens column: 4 + 5 + 1(carried) = 10. Write down 0 and carry 1 to the hundreds column",
              "Hundreds column: 2 + 1 + 1(carried) = 4. Write down 4",
              "The sum is 403"
            ],
            mathExpression: "\\begin{array}{r} 247 \\\\ +156 \\\\ \\hline 403 \\end{array}",
            keyTakeaway: "When adding, always align numbers by place value and carry over when a column sum exceeds 9."
          },
          {
            id: "mental-addition",
            title: "Mental Addition Strategies",
            concept: "Techniques for adding numbers quickly in your head",
            demonstration: "Adding 67 + 28 using the 'make ten' strategy",
            steps: [
              "Break down 28 into parts: 28 = 3 + 25",
              "Add the part that makes a round number: 67 + 3 = 70",
              "Add the remaining part: 70 + 25 = 95",
              "This method works because we use the associative property: 67 + 28 = 67 + (3 + 25) = (67 + 3) + 25"
            ],
            mathExpression: "67 + 28 = 67 + (3 + 25) = (67 + 3) + 25 = 70 + 25 = 95",
            keyTakeaway: "Breaking numbers into friendly parts can make mental arithmetic much easier."
          }
        ]
      },
      {
        id: "subtraction-concepts",
        title: "Subtraction: Finding Differences",
        type: "example",
        content: "Subtraction finds the difference between quantities or removes one quantity from another. It's the inverse operation of addition.",
        examples: [
          {
            id: "borrowing-subtraction",
            title: "Subtraction with Borrowing",
            concept: "How to subtract when digits in the top number are smaller than those below",
            demonstration: "Subtracting 403 - 156 using the borrowing method",
            steps: [
              "Align numbers by place value: 403 - 156",
              "Ones column: 3 - 6. Since 3 < 6, we need to borrow from the tens place",
              "But tens place is 0, so borrow from hundreds: 4 becomes 3, tens becomes 10",
              "Now borrow from tens to ones: 10 becomes 9, ones becomes 13",
              "Calculate: ones: 13 - 6 = 7, tens: 9 - 5 = 4, hundreds: 3 - 1 = 2",
              "Result: 247"
            ],
            mathExpression: "403 - 156 = 247",
            keyTakeaway: "When borrowing, we're regrouping place values: 1 ten = 10 ones, 1 hundred = 10 tens."
          }
        ]
      },
      {
        id: "multiplication-concepts",
        title: "Multiplication: Repeated Addition",
        type: "example",
        content: "Multiplication is repeated addition of the same number. It's a faster way to add equal groups and follows important properties.",
        mathExpressions: [
          "a \\times b = b \\times a \\text{ (commutative)}",
          "a \\times (b + c) = a \\times b + a \\times c \\text{ (distributive)}",
          "a \\times 1 = a \\text{ (identity)}"
        ],
        examples: [
          {
            id: "area-model-multiplication",
            title: "Area Model for Multiplication",
            concept: "Visualizing multiplication as the area of a rectangle",
            demonstration: "Multiplying 23 × 47 using the area model",
            steps: [
              "Break down both numbers: 23 = 20 + 3, and 47 = 40 + 7",
              "Create a rectangle divided into four parts",
              "Calculate each area: (20×40) + (20×7) + (3×40) + (3×7)",
              "Compute: 800 + 140 + 120 + 21",
              "Add all parts: 800 + 140 + 120 + 21 = 1,081"
            ],
            mathExpression: "23 \\times 47 = (20+3) \\times (40+7) = 800 + 140 + 120 + 21 = 1,081",
            keyTakeaway: "The area model shows why the distributive property works and makes large multiplications manageable."
          }
        ]
      },
      {
        id: "division-concepts",
        title: "Division: Sharing and Grouping",
        type: "example",
        content: "Division splits quantities into equal groups or finds how many times one number fits into another. It's the inverse of multiplication.",
        examples: [
          {
            id: "long-division-method",
            title: "Long Division Algorithm",
            concept: "The systematic method for dividing large numbers",
            demonstration: "Dividing 1,081 ÷ 23 step by step",
            steps: [
              "Set up: How many times does 23 go into 1,081?",
              "Start with leftmost digits: 23 goes into 108 about 4 times (4 × 23 = 92)",
              "Subtract: 108 - 92 = 16, bring down the 1 to get 161",
              "23 goes into 161 exactly 7 times (7 × 23 = 161)",
              "Subtract: 161 - 161 = 0, so 1,081 ÷ 23 = 47"
            ],
            mathExpression: "1,081 \\div 23 = 47",
            keyTakeaway: "Long division repeatedly asks 'how many times does the divisor fit?' and builds the answer digit by digit."
          }
        ]
      },
      {
        id: "fractions-decimals",
        title: "Fractions and Decimals",
        type: "example",
        content: "Fractions and decimals represent parts of a whole. Understanding their relationship helps in many real-world applications.",
        examples: [
          {
            id: "fraction-concepts",
            title: "Understanding Fractions",
            concept: "Fractions as parts of a whole and their operations",
            demonstration: "Adding fractions with different denominators: 1/4 + 1/3",
            steps: [
              "Understand what each fraction means: 1/4 is one part out of four equal parts",
              "To add fractions, they must have the same denominator (same-sized parts)",
              "Find the least common multiple of 4 and 3: LCM(4,3) = 12",
              "Convert to equivalent fractions: 1/4 = 3/12 and 1/3 = 4/12",
              "Now add: 3/12 + 4/12 = 7/12"
            ],
            mathExpression: "\\frac{1}{4} + \\frac{1}{3} = \\frac{3}{12} + \\frac{4}{12} = \\frac{7}{12}",
            keyTakeaway: "Fractions must have common denominators to be added or subtracted, just like you can only add like units."
          },
          {
            id: "decimal-system",
            title: "The Decimal System",
            concept: "How decimals extend place value to represent parts smaller than one",
            demonstration: "Converting 3/8 to decimal form",
            steps: [
              "Decimals use place values that are fractions of 1: tenths, hundredths, thousandths",
              "To convert 3/8 to decimal, divide 3 by 8",
              "Set up division: 3.000 ÷ 8",
              "8 goes into 30 three times (remainder 6), into 60 seven times (remainder 4), into 40 five times exactly",
              "Result: 0.375"
            ],
            mathExpression: "\\frac{3}{8} = 0.375 = 3 \\times \\frac{1}{10} + 7 \\times \\frac{1}{100} + 5 \\times \\frac{1}{1000}",
            keyTakeaway: "Decimals are another way to write fractions, using powers of 10 as denominators."
          }
        ]
      }
    ]
  },

  algebra: {
    topicId: "algebra",
    sections: [
      {
        id: "intro-variables",
        title: "Introduction to Variables",
        type: "explanation",
        content: "Variables are symbols (usually letters) that represent unknown or changing numbers. They allow us to write general mathematical relationships and solve problems where some information is missing.",
        mathExpressions: [
          "x + 5 = 12 \\text{ (x represents an unknown number)}",
          "2y - 3 = 7 \\text{ (y is the variable we want to find)}",
          "A = l \\times w \\text{ (A, l, and w are all variables)}"
        ]
      },
      {
        id: "algebraic-expressions",
        title: "Building Algebraic Expressions",
        type: "example",
        content: "Algebraic expressions combine numbers, variables, and operations. Learning to translate word problems into algebraic expressions is a key skill.",
        examples: [
          {
            id: "expression-building",
            title: "Translating Words to Algebra",
            concept: "Converting everyday language into mathematical expressions",
            demonstration: "Expressing 'five more than twice a number' algebraically",
            steps: [
              "Identify the unknown: 'a number' → let's call it x",
              "Identify operations: 'twice a number' means 2 times x → 2x",
              "'Five more than' means add 5 → 2x + 5",
              "The complete expression is 2x + 5"
            ],
            mathExpression: "\\text{'five more than twice a number'} = 2x + 5",
            keyTakeaway: "Break down word problems into parts: identify the variable, then the operations in order."
          }
        ]
      },
      {
        id: "solving-equations",
        title: "Solving Linear Equations",
        type: "example",
        content: "Solving equations means finding the value of the variable that makes the equation true. We use inverse operations to isolate the variable.",
        examples: [
          {
            id: "one-step-equations",
            title: "One-Step Equations",
            concept: "Solving equations that require only one operation",
            demonstration: "Solving x + 5 = 12",
            steps: [
              "The equation states that x plus 5 equals 12",
              "To find x, we need to 'undo' the addition of 5",
              "The inverse of adding 5 is subtracting 5",
              "Subtract 5 from both sides: x + 5 - 5 = 12 - 5",
              "Simplify: x = 7",
              "Check: 7 + 5 = 12 ✓"
            ],
            mathExpression: "x + 5 = 12 \\Rightarrow x = 12 - 5 = 7",
            keyTakeaway: "Whatever you do to one side of an equation, you must do to the other side to keep it balanced."
          },
          {
            id: "two-step-equations",
            title: "Two-Step Equations",
            concept: "Solving equations that require two operations",
            demonstration: "Solving 2x - 3 = 7",
            steps: [
              "This equation has two operations: multiply by 2, then subtract 3",
              "To solve, we undo these operations in reverse order",
              "First, undo the subtraction: add 3 to both sides",
              "2x - 3 + 3 = 7 + 3 → 2x = 10",
              "Next, undo the multiplication: divide both sides by 2",
              "2x ÷ 2 = 10 ÷ 2 → x = 5",
              "Check: 2(5) - 3 = 10 - 3 = 7 ✓"
            ],
            mathExpression: "2x - 3 = 7 \\Rightarrow 2x = 10 \\Rightarrow x = 5",
            keyTakeaway: "For multi-step equations, undo operations in reverse order: addition/subtraction first, then multiplication/division."
          }
        ]
      },
      {
        id: "graphing-lines",
        title: "Graphing Linear Equations",
        type: "example",
        content: "Graphing equations helps us visualize the relationship between variables. Linear equations form straight lines when graphed.",
        examples: [
          {
            id: "slope-intercept-form",
            title: "Understanding Slope-Intercept Form",
            concept: "The form y = mx + b and what each part means",
            demonstration: "Analyzing the equation y = 2x + 1",
            steps: [
              "The general form is y = mx + b, where m is slope and b is y-intercept",
              "In y = 2x + 1: m = 2 (slope) and b = 1 (y-intercept)",
              "The y-intercept (1) is where the line crosses the y-axis: point (0, 1)",
              "The slope (2) means 'rise 2, run 1' or go up 2 units for every 1 unit right",
              "Starting at (0, 1), move right 1 and up 2 to get (1, 3)",
              "Draw a line through these points"
            ],
            mathExpression: "y = 2x + 1 \\text{ where slope } = 2, \\text{ y-intercept } = 1",
            keyTakeaway: "Slope-intercept form immediately tells you where the line starts (y-intercept) and how steep it is (slope)."
          }
        ]
      }
    ]
  },

  geometry: {
    topicId: "geometry",
    sections: [
      {
        id: "intro-geometry",
        title: "What is Geometry?",
        type: "explanation",
        content: "Geometry is the study of shapes, sizes, positions, and properties of space. It helps us understand the world around us, from the design of buildings to the patterns in nature.",
        mathExpressions: [
          "\\text{Point: has no size, only position}",
          "\\text{Line: extends infinitely in both directions}",
          "\\text{Plane: a flat surface extending infinitely}"
        ]
      },
      {
        id: "basic-shapes",
        title: "Understanding Basic Shapes",
        type: "example",
        content: "Basic geometric shapes are the building blocks of more complex figures. Each shape has specific properties and formulas.",
        examples: [
          {
            id: "triangle-properties",
            title: "Properties of Triangles",
            concept: "Understanding what makes a triangle and its key properties",
            demonstration: "Exploring the angle sum property of triangles",
            steps: [
              "A triangle is a polygon with three sides and three angles",
              "The most important property: the sum of interior angles is always 180°",
              "This is true for any triangle: acute, right, or obtuse",
              "If we know two angles, we can find the third: third angle = 180° - (first angle + second angle)",
              "For example, if angles are 60° and 70°, the third is 180° - (60° + 70°) = 50°"
            ],
            mathExpression: "\\alpha + \\beta + \\gamma = 180° \\text{ for any triangle}",
            keyTakeaway: "The angle sum property is fundamental to solving many triangle problems."
          }
        ]
      },
      {
        id: "area-perimeter",
        title: "Area and Perimeter Concepts",
        type: "example",
        content: "Area measures the space inside a shape, while perimeter measures the distance around it. These concepts help us solve real-world problems about space and materials.",
        examples: [
          {
            id: "rectangle-measurements",
            title: "Rectangle Area and Perimeter",
            concept: "Understanding how to measure rectangles",
            demonstration: "Finding area and perimeter of a 8×5 rectangle",
            steps: [
              "A rectangle has four right angles and opposite sides are equal",
              "Area = length × width (how many unit squares fit inside)",
              "For our rectangle: Area = 8 × 5 = 40 square units",
              "Perimeter = distance around = 2 × length + 2 × width",
              "Perimeter = 2 × 8 + 2 × 5 = 16 + 10 = 26 units"
            ],
            mathExpression: "A = l \\times w = 40, \\quad P = 2l + 2w = 26",
            keyTakeaway: "Area is measured in square units (units²), perimeter in linear units."
          },
          {
            id: "circle-measurements",
            title: "Circle Area and Circumference",
            concept: "Understanding circular measurements using π",
            demonstration: "Measuring a circle with radius 3",
            steps: [
              "A circle is defined by its center and radius (distance from center to edge)",
              "Circumference (perimeter) = 2πr, where π ≈ 3.14159",
              "For radius 3: C = 2π(3) = 6π ≈ 18.85 units",
              "Area = πr², the number of unit squares that fit inside",
              "For radius 3: A = π(3)² = 9π ≈ 28.27 square units"
            ],
            mathExpression: "C = 2\\pi r = 6\\pi, \\quad A = \\pi r^2 = 9\\pi",
            keyTakeaway: "π (pi) is the ratio of circumference to diameter, approximately 3.14159."
          }
        ]
      },
      {
        id: "pythagorean-theorem",
        title: "The Pythagorean Theorem",
        type: "example",
        content: "The Pythagorean theorem relates the sides of right triangles and is one of the most important theorems in mathematics.",
        examples: [
          {
            id: "pythagorean-concept",
            title: "Understanding the Pythagorean Theorem",
            concept: "Why a² + b² = c² works for right triangles",
            demonstration: "Proving the theorem with a 3-4-5 triangle",
            steps: [
              "In a right triangle, the longest side (opposite the right angle) is the hypotenuse",
              "The theorem states: (leg₁)² + (leg₂)² = (hypotenuse)²",
              "For a triangle with legs 3 and 4: 3² + 4² = 9 + 16 = 25",
              "The hypotenuse should be √25 = 5",
              "This creates a perfect right triangle: the 3-4-5 triangle"
            ],
            mathExpression: "a^2 + b^2 = c^2 \\Rightarrow 3^2 + 4^2 = 5^2 \\Rightarrow 9 + 16 = 25",
            keyTakeaway: "The Pythagorean theorem only works for right triangles, but it's incredibly useful for finding distances and solving real-world problems."
          }
        ]
      }
    ]
  }
};