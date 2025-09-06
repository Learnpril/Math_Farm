// Practice problems data for each topic
export interface PracticeProblem {
  id: string;
  question: string;
  type: 'multiple-choice' | 'numeric' | 'algebraic' | 'true-false';
  options?: string[]; // For multiple choice
  correctAnswer: string | number;
  explanation: string;
  hint?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  mathExpression?: string; // LaTeX expression for the problem
  solutionSteps?: string[]; // Step-by-step solution
}

export interface TopicProblems {
  [topicId: string]: PracticeProblem[];
}

export const practiceProblemsData: TopicProblems = {
  arithmetic: [
    {
      id: 'arith-1',
      question: 'What is 3/4 + 1/2?',
      type: 'multiple-choice',
      options: ['5/6', '5/4', '4/6', '1/4'],
      correctAnswer: '5/4',
      explanation: 'To add fractions, find a common denominator. 3/4 + 1/2 = 3/4 + 2/4 = 5/4',
      hint: 'Convert 1/2 to fourths first',
      difficulty: 2,
      mathExpression: '\\frac{3}{4} + \\frac{1}{2} = ?',
      solutionSteps: [
        'Find common denominator: LCM of 4 and 2 is 4',
        'Convert 1/2 to fourths: 1/2 = 2/4',
        'Add the fractions: 3/4 + 2/4 = 5/4'
      ]
    },
    {
      id: 'arith-2',
      question: 'Calculate 15% of 80',
      type: 'numeric',
      correctAnswer: 12,
      explanation: '15% of 80 = 0.15 × 80 = 12',
      hint: 'Convert percentage to decimal first',
      difficulty: 2,
      mathExpression: '15\\% \\times 80 = ?',
      solutionSteps: [
        'Convert percentage to decimal: 15% = 0.15',
        'Multiply: 0.15 × 80 = 12'
      ]
    },
    {
      id: 'arith-3',
      question: 'What is 7 × 8?',
      type: 'numeric',
      correctAnswer: 56,
      explanation: '7 × 8 = 56. This is a basic multiplication fact.',
      difficulty: 1,
      mathExpression: '7 \\times 8 = ?'
    },
    {
      id: 'arith-4',
      question: 'Is 0.75 equal to 3/4?',
      type: 'true-false',
      options: ['True', 'False'],
      correctAnswer: 'True',
      explanation: '3/4 = 3 ÷ 4 = 0.75, so they are equal.',
      difficulty: 2,
      mathExpression: '0.75 = \\frac{3}{4}?'
    },
    {
      id: 'arith-5',
      question: 'What is 144 ÷ 12?',
      type: 'numeric',
      correctAnswer: 12,
      explanation: '144 ÷ 12 = 12. You can think of this as "how many 12s are in 144?"',
      difficulty: 2,
      mathExpression: '144 \\div 12 = ?'
    }
  ],

  algebra: [
    {
      id: 'alg-1',
      question: 'Solve for x: 2x + 5 = 13',
      type: 'numeric',
      correctAnswer: 4,
      explanation: 'Subtract 5 from both sides: 2x = 8. Then divide by 2: x = 4',
      hint: 'Isolate the variable by doing inverse operations',
      difficulty: 2,
      mathExpression: '2x + 5 = 13',
      solutionSteps: [
        'Subtract 5 from both sides: 2x + 5 - 5 = 13 - 5',
        'Simplify: 2x = 8',
        'Divide both sides by 2: x = 4'
      ]
    },
    {
      id: 'alg-2',
      question: 'Factor: x² - 5x + 6',
      type: 'algebraic',
      correctAnswer: '(x-2)(x-3)',
      explanation: 'Find two numbers that multiply to 6 and add to -5: -2 and -3',
      hint: 'Look for two numbers that multiply to give the constant term',
      difficulty: 3,
      mathExpression: 'x^2 - 5x + 6 = ?',
      solutionSteps: [
        'Find factors of 6: 1×6, 2×3',
        'Check which pair adds to -5: (-2) + (-3) = -5',
        'Write as factors: (x - 2)(x - 3)'
      ]
    },
    {
      id: 'alg-3',
      question: 'What is the slope of the line y = 3x - 2?',
      type: 'numeric',
      correctAnswer: 3,
      explanation: 'In slope-intercept form y = mx + b, the coefficient of x is the slope.',
      difficulty: 2,
      mathExpression: 'y = 3x - 2',
      solutionSteps: [
        'Identify the slope-intercept form: y = mx + b',
        'Compare with y = 3x - 2',
        'The slope m = 3'
      ]
    },
    {
      id: 'alg-4',
      question: 'Simplify: 3(x + 4) - 2x',
      type: 'algebraic',
      correctAnswer: 'x + 12',
      explanation: 'Distribute 3: 3x + 12 - 2x = x + 12',
      difficulty: 2,
      mathExpression: '3(x + 4) - 2x = ?',
      solutionSteps: [
        'Distribute 3: 3(x + 4) = 3x + 12',
        'Substitute: 3x + 12 - 2x',
        'Combine like terms: x + 12'
      ]
    },
    {
      id: 'alg-5',
      question: 'If f(x) = x² + 1, what is f(3)?',
      type: 'numeric',
      correctAnswer: 10,
      explanation: 'Substitute x = 3: f(3) = 3² + 1 = 9 + 1 = 10',
      difficulty: 2,
      mathExpression: 'f(x) = x^2 + 1, \\text{ find } f(3)',
      solutionSteps: [
        'Substitute x = 3 into f(x) = x² + 1',
        'f(3) = 3² + 1',
        'f(3) = 9 + 1 = 10'
      ]
    }
  ],

  geometry: [
    {
      id: 'geo-1',
      question: 'What is the area of a circle with radius 5?',
      type: 'multiple-choice',
      options: ['25π', '10π', '5π', '50π'],
      correctAnswer: '25π',
      explanation: 'Area = πr² = π(5)² = 25π',
      difficulty: 2,
      mathExpression: 'A = \\pi r^2, \\text{ where } r = 5',
      solutionSteps: [
        'Use the formula A = πr²',
        'Substitute r = 5: A = π(5)²',
        'Calculate: A = π × 25 = 25π'
      ]
    },
    {
      id: 'geo-2',
      question: 'What is the sum of interior angles in a triangle?',
      type: 'numeric',
      correctAnswer: 180,
      explanation: 'The sum of interior angles in any triangle is always 180°',
      difficulty: 1,
      mathExpression: '\\alpha + \\beta + \\gamma = ?'
    },
    {
      id: 'geo-3',
      question: 'Find the hypotenuse of a right triangle with legs 3 and 4',
      type: 'numeric',
      correctAnswer: 5,
      explanation: 'Using Pythagorean theorem: c² = 3² + 4² = 9 + 16 = 25, so c = 5',
      difficulty: 2,
      mathExpression: 'c^2 = a^2 + b^2',
      solutionSteps: [
        'Apply Pythagorean theorem: c² = a² + b²',
        'Substitute: c² = 3² + 4² = 9 + 16 = 25',
        'Take square root: c = √25 = 5'
      ]
    },
    {
      id: 'geo-4',
      question: 'What is the perimeter of a rectangle with length 8 and width 5?',
      type: 'numeric',
      correctAnswer: 26,
      explanation: 'Perimeter = 2(length + width) = 2(8 + 5) = 2(13) = 26',
      difficulty: 1,
      mathExpression: 'P = 2(l + w)',
      solutionSteps: [
        'Use perimeter formula: P = 2(l + w)',
        'Substitute values: P = 2(8 + 5)',
        'Calculate: P = 2(13) = 26'
      ]
    },
    {
      id: 'geo-5',
      question: 'Is a square also a rectangle?',
      type: 'true-false',
      options: ['True', 'False'],
      correctAnswer: 'True',
      explanation: 'A square is a special type of rectangle where all sides are equal.',
      difficulty: 2
    }
  ],

  trigonometry: [
    {
      id: 'trig-1',
      question: 'What is sin(30°)?',
      type: 'multiple-choice',
      options: ['1/2', '√3/2', '√2/2', '1'],
      correctAnswer: '1/2',
      explanation: 'sin(30°) = 1/2. This is a standard angle value.',
      difficulty: 2,
      mathExpression: '\\sin(30°) = ?'
    },
    {
      id: 'trig-2',
      question: 'If sin²θ + cos²θ = 1, what is cos²θ when sinθ = 3/5?',
      type: 'multiple-choice',
      options: ['16/25', '9/25', '4/5', '3/4'],
      correctAnswer: '16/25',
      explanation: 'cos²θ = 1 - sin²θ = 1 - (3/5)² = 1 - 9/25 = 16/25',
      difficulty: 3,
      mathExpression: '\\sin^2\\theta + \\cos^2\\theta = 1',
      solutionSteps: [
        'Use the Pythagorean identity: sin²θ + cos²θ = 1',
        'Substitute sinθ = 3/5: (3/5)² + cos²θ = 1',
        'Solve: cos²θ = 1 - 9/25 = 16/25'
      ]
    },
    {
      id: 'trig-3',
      question: 'What is the period of y = sin(x)?',
      type: 'multiple-choice',
      options: ['π', '2π', 'π/2', '4π'],
      correctAnswer: '2π',
      explanation: 'The sine function repeats every 2π radians.',
      difficulty: 2,
      mathExpression: 'y = \\sin(x)'
    },
    {
      id: 'trig-4',
      question: 'Convert 45° to radians',
      type: 'multiple-choice',
      options: ['π/4', 'π/2', 'π/6', 'π/3'],
      correctAnswer: 'π/4',
      explanation: '45° × (π/180°) = π/4 radians',
      difficulty: 2,
      mathExpression: '45° = ? \\text{ radians}',
      solutionSteps: [
        'Use conversion formula: radians = degrees × (π/180)',
        'Substitute: radians = 45 × (π/180)',
        'Simplify: radians = π/4'
      ]
    },
    {
      id: 'trig-5',
      question: 'In a right triangle, if the opposite side is 4 and hypotenuse is 5, what is sin(θ)?',
      type: 'multiple-choice',
      options: ['4/5', '3/5', '4/3', '5/4'],
      correctAnswer: '4/5',
      explanation: 'sin(θ) = opposite/hypotenuse = 4/5',
      difficulty: 2,
      mathExpression: '\\sin(\\theta) = \\frac{\\text{opposite}}{\\text{hypotenuse}}'
    }
  ],

  calculus: [
    {
      id: 'calc-1',
      question: 'What is the derivative of x³?',
      type: 'algebraic',
      correctAnswer: '3x²',
      explanation: 'Using the power rule: d/dx[xⁿ] = nxⁿ⁻¹, so d/dx[x³] = 3x²',
      difficulty: 2,
      mathExpression: '\\frac{d}{dx}[x^3] = ?',
      solutionSteps: [
        'Apply the power rule: d/dx[xⁿ] = nxⁿ⁻¹',
        'For x³: n = 3',
        'Result: 3x³⁻¹ = 3x²'
      ]
    },
    {
      id: 'calc-2',
      question: 'What is ∫2x dx?',
      type: 'algebraic',
      correctAnswer: 'x² + C',
      explanation: 'The antiderivative of 2x is x² + C, where C is the constant of integration',
      difficulty: 2,
      mathExpression: '\\int 2x \\, dx = ?',
      solutionSteps: [
        'Use the power rule for integration: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C',
        'For 2x: ∫2x dx = 2∫x dx',
        'Result: 2 × x²/2 + C = x² + C'
      ]
    },
    {
      id: 'calc-3',
      question: 'What is the limit of (x² - 1)/(x - 1) as x approaches 1?',
      type: 'numeric',
      correctAnswer: 2,
      explanation: 'Factor the numerator: (x-1)(x+1)/(x-1) = x+1. As x→1, the limit is 2',
      difficulty: 3,
      mathExpression: '\\lim_{x \\to 1} \\frac{x^2 - 1}{x - 1} = ?',
      solutionSteps: [
        'Factor the numerator: x² - 1 = (x-1)(x+1)',
        'Simplify: (x-1)(x+1)/(x-1) = x+1 (for x ≠ 1)',
        'Take the limit: lim(x→1) (x+1) = 1+1 = 2'
      ]
    },
    {
      id: 'calc-4',
      question: 'Find the critical points of f(x) = x² - 4x + 3',
      type: 'numeric',
      correctAnswer: 2,
      explanation: 'f\'(x) = 2x - 4 = 0, so x = 2 is the critical point',
      difficulty: 3,
      mathExpression: 'f(x) = x^2 - 4x + 3',
      solutionSteps: [
        'Find the derivative: f\'(x) = 2x - 4',
        'Set equal to zero: 2x - 4 = 0',
        'Solve: x = 2'
      ]
    },
    {
      id: 'calc-5',
      question: 'What is the area under y = x from x = 0 to x = 2?',
      type: 'numeric',
      correctAnswer: 2,
      explanation: '∫₀² x dx = [x²/2]₀² = 4/2 - 0 = 2',
      difficulty: 3,
      mathExpression: '\\int_0^2 x \\, dx = ?',
      solutionSteps: [
        'Set up the definite integral: ∫₀² x dx',
        'Find antiderivative: x²/2',
        'Evaluate: [x²/2]₀² = 4/2 - 0 = 2'
      ]
    }
  ],

  statistics: [
    {
      id: 'stat-1',
      question: 'What is the mean of the data set: 2, 4, 6, 8, 10?',
      type: 'numeric',
      correctAnswer: 6,
      explanation: 'Mean = (2+4+6+8+10)/5 = 30/5 = 6',
      difficulty: 1,
      mathExpression: '\\bar{x} = \\frac{\\sum x_i}{n}',
      solutionSteps: [
        'Add all values: 2 + 4 + 6 + 8 + 10 = 30',
        'Count the values: n = 5',
        'Calculate mean: 30/5 = 6'
      ]
    },
    {
      id: 'stat-2',
      question: 'What is the median of: 1, 3, 5, 7, 9?',
      type: 'numeric',
      correctAnswer: 5,
      explanation: 'The median is the middle value when data is ordered. Here it\'s 5.',
      difficulty: 1,
      mathExpression: '1, 3, 5, 7, 9'
    },
    {
      id: 'stat-3',
      question: 'If P(A) = 0.3 and P(B) = 0.4, what is P(A ∪ B) if A and B are mutually exclusive?',
      type: 'multiple-choice',
      options: ['0.7', '0.12', '0.1', '0.58'],
      correctAnswer: '0.7',
      explanation: 'For mutually exclusive events: P(A ∪ B) = P(A) + P(B) = 0.3 + 0.4 = 0.7',
      difficulty: 2,
      mathExpression: 'P(A \\cup B) = P(A) + P(B)',
      solutionSteps: [
        'Since A and B are mutually exclusive: P(A ∩ B) = 0',
        'Use addition rule: P(A ∪ B) = P(A) + P(B) - P(A ∩ B)',
        'Calculate: P(A ∪ B) = 0.3 + 0.4 - 0 = 0.7'
      ]
    },
    {
      id: 'stat-4',
      question: 'What is the standard deviation of the data set: 2, 4, 6? (Population)',
      type: 'multiple-choice',
      options: ['√(8/3)', '2', '4/3', '√2'],
      correctAnswer: '√(8/3)',
      explanation: 'Mean = 4, variance = ((2-4)² + (4-4)² + (6-4)²)/3 = 8/3, so σ = √(8/3)',
      difficulty: 3,
      mathExpression: '\\sigma = \\sqrt{\\frac{\\sum(x_i - \\mu)^2}{N}}',
      solutionSteps: [
        'Calculate mean: μ = (2+4+6)/3 = 4',
        'Calculate variance: σ² = [(2-4)² + (4-4)² + (6-4)²]/3 = (4+0+4)/3 = 8/3',
        'Standard deviation: σ = √(8/3)'
      ]
    },
    {
      id: 'stat-5',
      question: 'In a normal distribution, approximately what percentage of data falls within 1 standard deviation of the mean?',
      type: 'multiple-choice',
      options: ['68%', '95%', '99.7%', '50%'],
      correctAnswer: '68%',
      explanation: 'The empirical rule states that about 68% of data falls within 1σ of the mean.',
      difficulty: 2,
      mathExpression: 'P(\\mu - \\sigma \\leq X \\leq \\mu + \\sigma) \\approx 0.68'
    }
  ],

  'linear-algebra': [
    {
      id: 'linalg-1',
      question: 'What is the result of [1, 2] + [3, 4]?',
      type: 'multiple-choice',
      options: ['[4, 6]', '[3, 8]', '[1, 8]', '[4, 2]'],
      correctAnswer: '[4, 6]',
      explanation: 'Vector addition: [1, 2] + [3, 4] = [1+3, 2+4] = [4, 6]',
      difficulty: 1,
      mathExpression: '\\begin{bmatrix} 1 \\\\ 2 \\end{bmatrix} + \\begin{bmatrix} 3 \\\\ 4 \\end{bmatrix} = ?'
    },
    {
      id: 'linalg-2',
      question: 'What is the dot product of [2, 3] and [1, 4]?',
      type: 'numeric',
      correctAnswer: 14,
      explanation: 'Dot product: [2, 3] · [1, 4] = 2×1 + 3×4 = 2 + 12 = 14',
      difficulty: 2,
      mathExpression: '\\vec{a} \\cdot \\vec{b} = a_1b_1 + a_2b_2',
      solutionSteps: [
        'Multiply corresponding components: 2×1 and 3×4',
        'Add the products: 2 + 12',
        'Result: 14'
      ]
    },
    {
      id: 'linalg-3',
      question: 'What is the determinant of the 2×2 matrix [[2, 3], [1, 4]]?',
      type: 'numeric',
      correctAnswer: 5,
      explanation: 'det(A) = ad - bc = 2×4 - 3×1 = 8 - 3 = 5',
      difficulty: 2,
      mathExpression: '\\det\\begin{bmatrix} 2 & 3 \\\\ 1 & 4 \\end{bmatrix} = ?',
      solutionSteps: [
        'Use formula: det([[a,b],[c,d]]) = ad - bc',
        'Substitute: det = 2×4 - 3×1',
        'Calculate: det = 8 - 3 = 5'
      ]
    },
    {
      id: 'linalg-4',
      question: 'What is 3 times the vector [2, -1]?',
      type: 'multiple-choice',
      options: ['[6, -3]', '[5, 2]', '[2, -3]', '[6, 3]'],
      correctAnswer: '[6, -3]',
      explanation: 'Scalar multiplication: 3[2, -1] = [3×2, 3×(-1)] = [6, -3]',
      difficulty: 1,
      mathExpression: '3\\begin{bmatrix} 2 \\\\ -1 \\end{bmatrix} = ?'
    },
    {
      id: 'linalg-5',
      question: 'Are the vectors [1, 2] and [2, 4] linearly independent?',
      type: 'true-false',
      options: ['True', 'False'],
      correctAnswer: 'False',
      explanation: '[2, 4] = 2[1, 2], so they are linearly dependent (one is a scalar multiple of the other)',
      difficulty: 3,
      mathExpression: '\\begin{bmatrix} 1 \\\\ 2 \\end{bmatrix}, \\begin{bmatrix} 2 \\\\ 4 \\end{bmatrix}'
    }
  ],

  'differential-equations': [
    {
      id: 'diffeq-1',
      question: 'What is the general solution to dy/dx = y?',
      type: 'algebraic',
      correctAnswer: 'y = Ce^x',
      explanation: 'This is a separable equation. The solution is y = Ce^x where C is an arbitrary constant.',
      difficulty: 3,
      mathExpression: '\\frac{dy}{dx} = y',
      solutionSteps: [
        'Separate variables: dy/y = dx',
        'Integrate both sides: ln|y| = x + C₁',
        'Solve for y: y = Ce^x where C = ±e^C₁'
      ]
    },
    {
      id: 'diffeq-2',
      question: 'What is the order of the differential equation d²y/dx² + 3dy/dx + 2y = 0?',
      type: 'numeric',
      correctAnswer: 2,
      explanation: 'The order is determined by the highest derivative, which is d²y/dx² (second derivative).',
      difficulty: 1,
      mathExpression: '\\frac{d^2y}{dx^2} + 3\\frac{dy}{dx} + 2y = 0'
    },
    {
      id: 'diffeq-3',
      question: 'Is y = x² a solution to the equation 2xy\' - 4y = 0?',
      type: 'true-false',
      options: ['True', 'False'],
      correctAnswer: 'True',
      explanation: 'If y = x², then y\' = 2x. Substituting: 2x(2x) - 4(x²) = 4x² - 4x² = 0 ✓',
      difficulty: 2,
      mathExpression: '2xy\' - 4y = 0, \\quad y = x^2',
      solutionSteps: [
        'Given y = x², find y\': y\' = 2x',
        'Substitute into equation: 2x(2x) - 4(x²)',
        'Simplify: 4x² - 4x² = 0 ✓'
      ]
    },
    {
      id: 'diffeq-4',
      question: 'What type of differential equation is dy/dx + P(x)y = Q(x)?',
      type: 'multiple-choice',
      options: ['Linear first-order', 'Separable', 'Homogeneous', 'Exact'],
      correctAnswer: 'Linear first-order',
      explanation: 'This is the standard form of a linear first-order differential equation.',
      difficulty: 2,
      mathExpression: '\\frac{dy}{dx} + P(x)y = Q(x)'
    },
    {
      id: 'diffeq-5',
      question: 'What is the integrating factor for dy/dx + 2y = x?',
      type: 'algebraic',
      correctAnswer: 'e^(2x)',
      explanation: 'The integrating factor is μ(x) = e^∫P(x)dx = e^∫2dx = e^(2x)',
      difficulty: 3,
      mathExpression: '\\frac{dy}{dx} + 2y = x',
      solutionSteps: [
        'Identify P(x) = 2',
        'Calculate integrating factor: μ(x) = e^∫P(x)dx',
        'μ(x) = e^∫2dx = e^(2x)'
      ]
    }
  ],

  'game-design-math': [
    {
      id: 'game-1',
      question: 'If a character moves with velocity vector [3, 4], what is its speed?',
      type: 'numeric',
      correctAnswer: 5,
      explanation: 'Speed is the magnitude of velocity: |v| = √(3² + 4²) = √(9 + 16) = √25 = 5',
      difficulty: 2,
      mathExpression: '\\vec{v} = \\begin{bmatrix} 3 \\\\ 4 \\end{bmatrix}',
      solutionSteps: [
        'Use magnitude formula: |v| = √(vₓ² + vᵧ²)',
        'Substitute: |v| = √(3² + 4²)',
        'Calculate: |v| = √(9 + 16) = √25 = 5'
      ]
    },
    {
      id: 'game-2',
      question: 'What is the dot product of vectors [1, 0] and [0, 1]?',
      type: 'numeric',
      correctAnswer: 0,
      explanation: 'Dot product: [1, 0] · [0, 1] = 1×0 + 0×1 = 0. These vectors are perpendicular.',
      difficulty: 2,
      mathExpression: '\\begin{bmatrix} 1 \\\\ 0 \\end{bmatrix} \\cdot \\begin{bmatrix} 0 \\\\ 1 \\end{bmatrix} = ?'
    },
    {
      id: 'game-3',
      question: 'In 2D rotation, what matrix rotates a point 90° counterclockwise?',
      type: 'multiple-choice',
      options: ['[[0, -1], [1, 0]]', '[[1, 0], [0, 1]]', '[[0, 1], [-1, 0]]', '[[-1, 0], [0, -1]]'],
      correctAnswer: '[[0, -1], [1, 0]]',
      explanation: 'The 90° counterclockwise rotation matrix is [[cos(90°), -sin(90°)], [sin(90°), cos(90°)]] = [[0, -1], [1, 0]]',
      difficulty: 3,
      mathExpression: 'R_{90°} = \\begin{bmatrix} \\cos(90°) & -\\sin(90°) \\\\ \\sin(90°) & \\cos(90°) \\end{bmatrix}'
    },
    {
      id: 'game-4',
      question: 'If an object starts at position (2, 3) and moves with velocity (1, -2) for 3 seconds, what is its final position?',
      type: 'multiple-choice',
      options: ['(5, -3)', '(3, 1)', '(6, 9)', '(2, -6)'],
      correctAnswer: '(5, -3)',
      explanation: 'Final position = initial + velocity × time = (2, 3) + (1, -2) × 3 = (2, 3) + (3, -6) = (5, -3)',
      difficulty: 2,
      mathExpression: '\\vec{p}_{final} = \\vec{p}_{initial} + \\vec{v} \\cdot t',
      solutionSteps: [
        'Use kinematic equation: p_final = p_initial + v × t',
        'Substitute: (2, 3) + (1, -2) × 3',
        'Calculate: (2, 3) + (3, -6) = (5, -3)'
      ]
    },
    {
      id: 'game-5',
      question: 'What is the angle between vectors [1, 1] and [1, 0] in degrees?',
      type: 'numeric',
      correctAnswer: 45,
      explanation: 'cos(θ) = (a·b)/(|a||b|) = 1/(√2×1) = 1/√2, so θ = 45°',
      difficulty: 3,
      mathExpression: '\\cos(\\theta) = \\frac{\\vec{a} \\cdot \\vec{b}}{|\\vec{a}||\\vec{b}|}',
      solutionSteps: [
        'Calculate dot product: [1,1]·[1,0] = 1×1 + 1×0 = 1',
        'Calculate magnitudes: |[1,1]| = √2, |[1,0]| = 1',
        'cos(θ) = 1/(√2×1) = 1/√2, so θ = 45°'
      ]
    }
  ]
};