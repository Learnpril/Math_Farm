// Math Topics Data
const mathTopics = [
  // Elementary
  {
    id: 'arithmetic',
    title: 'Arithmetic',
    description: 'Basic operations with numbers including addition, subtraction, multiplication, and division.',
    level: 'elementary',
    category: 'Basics',
    sampleExpression: '25 + 17 = 42',
    sampleDescription: 'Basic addition'
  },
  {
    id: 'fractions',
    title: 'Fractions',
    description: 'Understanding parts of a whole, equivalent fractions, and operations with fractions.',
    level: 'elementary',
    category: 'Basics',
    sampleExpression: '$\\frac{3}{4} + \\frac{1}{2} = \\frac{5}{4}$',
    sampleDescription: 'Adding fractions'
  },
  {
    id: 'decimals',
    title: 'Decimals',
    description: 'Working with decimal numbers and understanding place value.',
    level: 'elementary',
    category: 'Basics',
    sampleExpression: '12.5 × 2.4 = 30.0',
    sampleDescription: 'Decimal multiplication'
  },
  {
    id: 'percentages',
    title: 'Percentages',
    description: 'Converting between fractions, decimals, and percentages.',
    level: 'elementary',
    category: 'Basics',
    sampleExpression: '75% = 0.75 = $\\frac{3}{4}$',
    sampleDescription: 'Percentage conversion'
  },
  
  // Middle School
  {
    id: 'pre-algebra',
    title: 'Pre-Algebra',
    description: 'Introduction to variables, expressions, and basic algebraic thinking.',
    level: 'middle',
    category: 'Algebra',
    sampleExpression: '$3x + 7 = 22$',
    sampleDescription: 'Solving simple equations'
  },
  {
    id: 'geometry-basics',
    title: 'Basic Geometry',
    description: 'Understanding shapes, angles, perimeter, and area.',
    level: 'middle',
    category: 'Geometry',
    sampleExpression: '$A = l \\times w$',
    sampleDescription: 'Rectangle area'
  },
  {
    id: 'statistics-intro',
    title: 'Statistics Basics',
    description: 'Data collection, analysis, and basic statistical measures.',
    level: 'middle',
    category: 'Statistics',
    sampleExpression: '$\\bar{x} = \\frac{\\sum x_i}{n}$',
    sampleDescription: 'Mean calculation'
  },
  
  // High School
  {
    id: 'algebra',
    title: 'Algebra',
    description: 'Linear and quadratic equations, polynomials, and algebraic manipulation.',
    level: 'high',
    category: 'Algebra',
    sampleExpression: '$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$',
    sampleDescription: 'Quadratic formula'
  },
  {
    id: 'geometry',
    title: 'Geometry',
    description: 'Proofs, coordinate geometry, and advanced geometric concepts.',
    level: 'high',
    category: 'Geometry',
    sampleExpression: '$c^2 = a^2 + b^2$',
    sampleDescription: 'Pythagorean theorem'
  },
  {
    id: 'trigonometry',
    title: 'Trigonometry',
    description: 'Trigonometric functions, identities, and applications.',
    level: 'high',
    category: 'Trigonometry',
    sampleExpression: '$\\sin^2(x) + \\cos^2(x) = 1$',
    sampleDescription: 'Pythagorean identity'
  },
  {
    id: 'precalculus',
    title: 'Pre-Calculus',
    description: 'Advanced functions, limits, and preparation for calculus.',
    level: 'high',
    category: 'Pre-Calculus',
    sampleExpression: '$\\lim_{x \\to a} f(x) = L$',
    sampleDescription: 'Limit definition'
  },
  
  // Advanced
  {
    id: 'calculus',
    title: 'Calculus',
    description: 'Derivatives, integrals, and applications of calculus.',
    level: 'advanced',
    category: 'Calculus',
    sampleExpression: '$\\int_a^b f(x) dx = F(b) - F(a)$',
    sampleDescription: 'Fundamental theorem'
  },
  {
    id: 'linear-algebra',
    title: 'Linear Algebra',
    description: 'Vectors, matrices, eigenvalues, and vector spaces.',
    level: 'advanced',
    category: 'Linear Algebra',
    sampleExpression: '$\\mathbf{A}\\mathbf{x} = \\lambda\\mathbf{x}$',
    sampleDescription: 'Eigenvalue equation'
  },
  {
    id: 'differential-equations',
    title: 'Differential Equations',
    description: 'Ordinary and partial differential equations and their solutions.',
    level: 'advanced',
    category: 'Differential Equations',
    sampleExpression: '$\\frac{dy}{dx} = f(x,y)$',
    sampleDescription: 'General ODE form'
  },
  
  // Beyond
  {
    id: 'game-design-math',
    title: 'Game Design Mathematics',
    description: 'Mathematical concepts used in game development including vectors, physics, and algorithms.',
    level: 'beyond',
    category: 'Applied Math',
    sampleExpression: '$\\vec{v} = \\vec{v_0} + \\vec{a}t$',
    sampleDescription: 'Physics motion'
  },
  {
    id: 'latex',
    title: 'LaTeX',
    description: 'Mathematical typesetting and document preparation system.',
    level: 'beyond',
    category: 'Tools',
    sampleExpression: '\\\\int_{-\\\\infty}^{\\\\infty} e^{-x^2} dx = \\\\sqrt{\\\\pi}',
    sampleDescription: 'LaTeX markup'
  },
  {
    id: 'matlab',
    title: 'MATLAB',
    description: 'Mathematical computing environment for numerical computation and visualization.',
    level: 'beyond',
    category: 'Tools',
    sampleExpression: 'plot(x, sin(x))',
    sampleDescription: 'MATLAB plotting'
  }
];

// Practice Problems Data
const practiceProblems = [
  {
    id: 'algebra-quadratic-1',
    topicId: 'algebra',
    title: 'Quadratic Equation',
    description: 'Find all values of x that satisfy the equation.',
    problem: '$x^2 - 5x + 6 = 0$',
    solution: '$x = 2$ or $x = 3$',
    steps: [
      'Factor the quadratic: $(x - 2)(x - 3) = 0$',
      'Set each factor equal to zero: $x - 2 = 0$ or $x - 3 = 0$',
      'Solve for x: $x = 2$ or $x = 3$'
    ],
    hints: [
      'Look for two numbers that multiply to 6 and add to -5',
      'Try factoring the quadratic expression'
    ],
    category: 'Algebra'
  },
  {
    id: 'calculus-integration-1',
    topicId: 'calculus',
    title: 'Integration by Parts',
    description: 'Evaluate the integral using integration by parts.',
    problem: '$\\int x e^x dx$',
    solution: '$x e^x - e^x + C = e^x(x - 1) + C$',
    steps: [
      'Use integration by parts: $\\int u \\, dv = uv - \\int v \\, du$',
      'Let $u = x$ and $dv = e^x dx$',
      'Then $du = dx$ and $v = e^x$',
      'Apply the formula: $x e^x - \\int e^x dx$',
      'Evaluate: $x e^x - e^x + C = e^x(x - 1) + C$'
    ],
    hints: [
      'Choose u and dv using the LIATE rule',
      'Remember that the integral of $e^x$ is $e^x$'
    ],
    category: 'Calculus'
  },
  {
    id: 'geometry-triangle-1',
    topicId: 'geometry',
    title: 'Triangle Area',
    description: 'Find the area of a triangle using the given measurements.',
    problem: 'Find the area of a triangle with base 12 cm and height 8 cm.',
    solution: '$A = 48 \\text{ cm}^2$',
    steps: [
      'Use the triangle area formula: $A = \\frac{1}{2} \\times \\text{base} \\times \\text{height}$',
      'Substitute the values: $A = \\frac{1}{2} \\times 12 \\times 8$',
      'Calculate: $A = \\frac{1}{2} \\times 96 = 48 \\text{ cm}^2$'
    ],
    hints: [
      'Remember the formula for triangle area',
      'Make sure to include units in your answer'
    ],
    category: 'Geometry'
  },
  {
    id: 'trigonometry-identity-1',
    topicId: 'trigonometry',
    title: 'Trigonometric Identity',
    description: 'Prove the given trigonometric identity.',
    problem: 'Prove: $\\tan(x) + \\cot(x) = \\sec(x)\\csc(x)$',
    solution: 'Identity proven using basic trigonometric definitions',
    steps: [
      'Express in terms of sine and cosine: $\\frac{\\sin(x)}{\\cos(x)} + \\frac{\\cos(x)}{\\sin(x)}$',
      'Find common denominator: $\\frac{\\sin^2(x) + \\cos^2(x)}{\\sin(x)\\cos(x)}$',
      'Use Pythagorean identity: $\\frac{1}{\\sin(x)\\cos(x)}$',
      'Separate fractions: $\\frac{1}{\\sin(x)} \\cdot \\frac{1}{\\cos(x)} = \\csc(x)\\sec(x)$'
    ],
    hints: [
      'Express all functions in terms of sine and cosine',
      'Use the Pythagorean identity: $\\sin^2(x) + \\cos^2(x) = 1$'
    ],
    category: 'Trigonometry'
  },
  {
    id: 'game-design-vector-1',
    topicId: 'game-design-math',
    title: 'Vector Addition',
    description: 'Calculate the resultant vector for player movement in a 2D game.',
    problem: '\\text{A player moves with velocity } \\vec{v_1} = (3, 4) \\text{ and then applies boost } \\vec{v_2} = (2, -1). \\text{ Find the total velocity: } \\vec{v_{total}} = \\vec{v_1} + \\vec{v_2}',
    solution: '$\\vec{v_{total}} = (5, 3)$',
    steps: [
      'Add x-components: $3 + 2 = 5$',
      'Add y-components: $4 + (-1) = 3$',
      'Combine: $\\vec{v_{total}} = (5, 3)$'
    ],
    hints: [
      'Vector addition is done component-wise',
      'Add x-components together, then y-components together'
    ],
    category: 'Game Design'
  }
];

// Level titles for curriculum
const levelTitles = {
  elementary: 'Elementary',
  middle: 'Middle School',
  high: 'High School',
  advanced: 'Advanced',
  beyond: 'Beyond'
};

// DOM Elements
let currentSection = 'home';
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  initializeIcons();
  setupEventListeners();
  populateSidebar();
  populateTopics();
  populatePracticeProblems();
  initializeTheme();
  
  // Initialize MathJax after content is loaded
  setTimeout(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise();
    }
  }, 500);
});

// Initialize Lucide icons
function initializeIcons() {
  if (window.lucide) {
    lucide.createIcons();
  }
}

// Setup event listeners
function setupEventListeners() {
  // Theme toggle
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  
  // Mobile menu
  document.getElementById('mobile-menu-toggle').addEventListener('click', toggleMobileMenu);
  document.getElementById('mobile-menu-close').addEventListener('click', closeMobileMenu);
  document.getElementById('mobile-menu').addEventListener('click', function(e) {
    if (e.target === this) closeMobileMenu();
  });
  
  // Navigation links
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const sectionId = this.getAttribute('href').substring(1);
      showSection(sectionId);
      closeMobileMenu();
    });
  });
  
  // Close mobile menu when clicking outside
  document.addEventListener('click', function(e) {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    
    if (!mobileMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
      closeMobileMenu();
    }
  });
}

// Theme management
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Mobile menu functions
function toggleMobileMenu() {
  document.getElementById('mobile-menu').classList.toggle('active');
}

function closeMobileMenu() {
  document.getElementById('mobile-menu').classList.remove('active');
}

// Navigation functions
function showSection(sectionId) {
  // Hide all sections
  sections.forEach(section => section.classList.remove('active'));
  
  // Show target section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add('active');
    currentSection = sectionId;
    
    // Update navigation active states
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + sectionId) {
        link.classList.add('active');
      }
    });
    
    // Retypeset math after section change
    setTimeout(() => {
      if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise();
      }
    }, 100);
  }
}

// Populate sidebar with curriculum
function populateSidebar() {
  const sectionsContainer = document.getElementById('curriculum-sections');
  const levels = ['elementary', 'middle', 'high', 'advanced', 'beyond'];
  
  levels.forEach(level => {
    const levelTopics = mathTopics.filter(topic => topic.level === level);
    
    if (levelTopics.length > 0) {
      const levelDiv = document.createElement('div');
      levelDiv.className = 'curriculum-level';
      
      const levelTitle = document.createElement('h4');
      levelTitle.className = 'level-title';
      levelTitle.textContent = levelTitles[level];
      levelDiv.appendChild(levelTitle);
      
      levelTopics.forEach(topic => {
        const topicLink = document.createElement('a');
        topicLink.href = '#';
        topicLink.className = 'topic-item';
        topicLink.textContent = topic.title;
        topicLink.addEventListener('click', function(e) {
          e.preventDefault();
          showTopicDetail(topic.id);
        });
        levelDiv.appendChild(topicLink);
      });
      
      sectionsContainer.appendChild(levelDiv);
    }
  });
}

// Populate topics section
function populateTopics() {
  const topicsContent = document.getElementById('topics-content');
  const levels = ['elementary', 'middle', 'high', 'advanced', 'beyond'];
  
  levels.forEach(level => {
    const levelTopics = mathTopics.filter(topic => topic.level === level);
    
    if (levelTopics.length > 0) {
      const levelSection = document.createElement('div');
      levelSection.className = 'level-section';
      
      const levelTitle = document.createElement('h3');
      levelTitle.textContent = levelTitles[level];
      levelTitle.style.color = 'hsl(var(--accent))';
      levelTitle.style.marginBottom = '1.5rem';
      levelTitle.style.marginTop = '2rem';
      levelSection.appendChild(levelTitle);
      
      const topicsGrid = document.createElement('div');
      topicsGrid.className = 'topics-grid';
      
      levelTopics.forEach(topic => {
        const topicCard = document.createElement('div');
        topicCard.className = 'topic-card';
        topicCard.onclick = () => showTopicDetail(topic.id);
        
        topicCard.innerHTML = `
          <div class="topic-header">
            <div class="topic-category">${topic.category}</div>
          </div>
          <h3>${topic.title}</h3>
          <p>${topic.description}</p>
          <div class="math-sample">
            <div style="font-weight: 500; margin-bottom: 0.5rem;">${topic.sampleExpression}</div>
            <div style="font-size: 0.9rem; color: hsl(var(--muted-foreground));">${topic.sampleDescription}</div>
          </div>
        `;
        
        topicsGrid.appendChild(topicCard);
      });
      
      levelSection.appendChild(topicsGrid);
      topicsContent.appendChild(levelSection);
    }
  });
}

// Populate practice problems
function populatePracticeProblems() {
  const practiceContent = document.getElementById('practice-content');
  const problemsGrid = document.createElement('div');
  problemsGrid.className = 'problems-grid';
  
  practiceProblems.forEach(problem => {
    const problemCard = document.createElement('div');
    problemCard.className = 'problem-card';
    
    problemCard.innerHTML = `
      <div class="problem-header">
        <div class="topic-category">${problem.category}</div>
      </div>
      <h3>${problem.title}</h3>
      <div class="problem-statement">
        ${problem.problem}
      </div>
      <p class="problem-description">${problem.description}</p>
      
      <div class="solution-area" id="solution-${problem.id}">
        <h4 class="solution-title">Solution:</h4>
        <div style="margin-bottom: 1rem;">${problem.solution}</div>
        <ol class="solution-steps">
          ${problem.steps.map(step => `<li class="solution-step">${step}</li>`).join('')}
        </ol>
      </div>
      
      <div class="hints-area" id="hints-${problem.id}">
        <h4 class="hints-title">Hints:</h4>
        ${problem.hints.map(hint => `<div class="hint-item">• ${hint}</div>`).join('')}
      </div>
      
      <div class="problem-buttons">
        <button class="btn btn-primary" onclick="toggleSolution('${problem.id}')">
          Show Solution
        </button>
        <button class="btn btn-outline" onclick="toggleHints('${problem.id}')">
          Show Hints
        </button>
      </div>
    `;
    
    problemsGrid.appendChild(problemCard);
  });
  
  practiceContent.appendChild(problemsGrid);
}

// Show topic detail (for future enhancement)
function showTopicDetail(topicId) {
  const topic = mathTopics.find(t => t.id === topicId);
  if (topic) {
    alert(`Topic: ${topic.title}\n\n${topic.description}\n\nThis would open a detailed page about ${topic.title}.`);
  }
}

// Toggle solution visibility
function toggleSolution(problemId) {
  const solutionArea = document.getElementById(`solution-${problemId}`);
  const button = event.target;
  
  if (solutionArea.classList.contains('active')) {
    solutionArea.classList.remove('active');
    button.textContent = 'Show Solution';
  } else {
    solutionArea.classList.add('active');
    button.textContent = 'Hide Solution';
    
    // Retypeset math in solution
    setTimeout(() => {
      if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([solutionArea]);
      }
    }, 50);
  }
}

// Toggle hints visibility
function toggleHints(problemId) {
  const hintsArea = document.getElementById(`hints-${problemId}`);
  const button = event.target;
  
  if (hintsArea.classList.contains('active')) {
    hintsArea.classList.remove('active');
    button.textContent = 'Show Hints';
  } else {
    hintsArea.classList.add('active');
    button.textContent = 'Hide Hints';
  }
}

// Tool functions
function solveEquation() {
  const equation = document.getElementById('equation-input').value;
  const resultDiv = document.getElementById('equation-result');
  
  if (!equation.trim()) {
    resultDiv.textContent = 'Please enter an equation';
    return;
  }
  
  // Simple equation solver (basic implementation)
  try {
    let result = 'Solution steps would appear here.\n\n';
    
    // Basic pattern matching for simple linear equations like ax + b = c
    const match = equation.match(/^(\d*)\s*x\s*([+-])\s*(\d+)\s*=\s*(\d+)$/);
    if (match) {
      const a = parseInt(match[1]) || 1;
      const operator = match[2];
      const b = parseInt(match[3]);
      const c = parseInt(match[4]);
      
      let x;
      if (operator === '+') {
        x = (c - b) / a;
      } else {
        x = (c + b) / a;
      }
      
      result = `Step 1: ${equation}\n`;
      result += `Step 2: ${a}x = ${c} ${operator === '+' ? '-' : '+'} ${b}\n`;
      result += `Step 3: ${a}x = ${operator === '+' ? c - b : c + b}\n`;
      result += `Step 4: x = ${x}`;
    } else {
      result = 'This equation format is not yet supported.\nTry something like: 2x + 5 = 13';
    }
    
    resultDiv.textContent = result;
  } catch (error) {
    resultDiv.textContent = 'Error solving equation. Please check your input.';
  }
}

function evaluateExpression() {
  const expression = document.getElementById('expression-input').value;
  const resultDiv = document.getElementById('expression-result');
  
  if (!expression.trim()) {
    resultDiv.textContent = 'Please enter an expression';
    return;
  }
  
  try {
    // Basic expression evaluation (safe subset)
    let safeExpression = expression
      .replace(/\\^/g, '**')  // Convert ^ to **
      .replace(/[^0-9+\\-*/.()\\s]/g, ''); // Remove unsafe characters
    
    if (safeExpression !== expression.replace(/\\^/g, '**')) {
      resultDiv.textContent = 'Expression contains invalid characters';
      return;
    }
    
    const result = Function('"use strict"; return (' + safeExpression + ')')();
    resultDiv.textContent = `${expression} = ${result}`;
  } catch (error) {
    resultDiv.textContent = 'Error evaluating expression. Please check your input.';
  }
}

// Show guide (placeholder)
function showGuide(guideType) {
  if (guideType === 'latex') {
    alert('LaTeX Guide\\n\\nThis would open a comprehensive guide to LaTeX mathematical typesetting, including:\\n\\n• Basic syntax and commands\\n• Mathematical symbols and operators\\n• Fractions, integrals, and matrices\\n• Advanced formatting techniques');
  } else if (guideType === 'matlab') {
    alert('MATLAB Guide\\n\\nThis would open a guide to MATLAB for mathematical computing, including:\\n\\n• Basic syntax and operations\\n• Plotting and visualization\\n• Matrix operations\\n• Numerical methods');
  }
}

// Make functions global for onclick handlers
window.showSection = showSection;
window.toggleSolution = toggleSolution;
window.toggleHints = toggleHints;
window.solveEquation = solveEquation;
window.evaluateExpression = evaluateExpression;
window.showGuide = showGuide;