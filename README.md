# Math Farm 🧮

A comprehensive, self-hosted mathematics learning platform built with modern web technologies. Math Farm provides interactive tools, step-by-step solutions, and educational content for learners from elementary to advanced levels.

![Math Farm Screenshot](attached_assets/MathfarmGirl.png)

## 🌟 Features

### 🧮 Interactive Math Tools

- **Advanced Calculator**: Scientific calculator with memory functions, history, and real-time evaluation
- **Equation Solver**: Algebraic equations, derivatives, and expression simplification with step-by-step solutions
- **Function Grapher**: Interactive graphing with critical point analysis and multiple function support
- **Unit Converter**: Comprehensive unit conversions for various measurement systems

### 📚 Educational Content

- **Structured Curriculum**: Progressive learning from elementary to advanced mathematics
- **LaTeX Guide**: Complete guide for mathematical typesetting and document preparation
- **MATLAB Guide**: Programming tutorials for mathematical computing and visualization
- **Practice Problems**: Interactive exercises with instant feedback and progress tracking

### 🔒 Security & Performance

- **Input Validation**: Comprehensive security measures preventing code injection
- **Error Handling**: Graceful error recovery with user-friendly messages
- **Performance Optimization**: Web Workers for heavy computations, lazy loading, and caching
- **Accessibility**: Full WCAG 2.2 compliance with keyboard navigation and screen reader support

## 🚀 Quick Start

### Prerequisites

- **Node.js** v20+
- **npm** v9+ or **yarn** v1.22+
- **Git** for version control

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/mathfarm/mathfarm.git
   cd mathfarm
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Production Deployment

1. **Build the application**

   ```bash
   npm run build:all
   ```

2. **Start production server**
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`

## 🏗️ Architecture

### Technology Stack

#### Frontend

- **React 18** - Modern UI library with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript with enhanced developer experience
- **Vite** - Fast build tool with Hot Module Replacement (HMR)
- **Tailwind CSS** - Utility-first CSS framework with custom design system
- **Wouter** - Lightweight client-side routing

#### Backend

- **Express.js** - Minimal web framework for Node.js
- **SQLite** - File-based database with Drizzle ORM
- **JWT** - Secure authentication with JSON Web Tokens

#### Math Libraries

- **MathJax 4.0** - LaTeX/TeX rendering for mathematical expressions
- **math.js** - Comprehensive math library for calculations and matrices
- **Nerdamer** - Symbolic mathematics for equation solving
- **JSXGraph** - Interactive geometry and function plotting

### Project Structure

```
Math_Farm/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── ui/        # shadcn/ui components
│   │   │   └── layout/    # Layout components
│   │   ├── features/      # Feature-based modules
│   │   │   ├── math-tools/    # Calculator, solver, grapher
│   │   │   ├── practice/      # Practice problems and tracking
│   │   │   └── guides/        # LaTeX and MATLAB guides
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility libraries
│   │   │   ├── math/      # Math utility functions
│   │   │   └── utils/     # General utilities
│   │   ├── pages/         # Route components
│   │   └── data/          # Static data and constants
│   ├── public/            # Static assets
│   └── dist/              # Build output
├── server/                # Backend Express application
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   └── storage.ts         # Database operations
├── shared/                # Shared types and schemas
│   ├── types.ts           # TypeScript interfaces
│   └── schema.ts          # Database schemas
├── docs/                  # Documentation
│   ├── api/               # Generated API docs
│   └── guides/            # User guides
├── .storybook/            # Storybook configuration
└── scripts/               # Build and utility scripts
```

### Key Design Principles

#### 🔒 Security First

- All user inputs are validated and sanitized
- Mathematical expressions are evaluated in a controlled environment
- No external API dependencies to prevent data leaks
- HTTPS enforcement in production

#### 📱 Responsive Design

- Mobile-first approach with progressive enhancement
- Breakpoints: Mobile (<640px), Tablet (640-1024px), Desktop (>1024px)
- Touch-friendly interfaces with appropriate sizing
- Adaptive layouts for different screen orientations

#### ♿ Accessibility

- WCAG 2.2 AA compliance
- Semantic HTML structure
- ARIA labels and descriptions
- Keyboard navigation support
- High contrast color schemes
- Screen reader compatibility

#### ⚡ Performance

- Code splitting and lazy loading
- Tree shaking for minimal bundle sizes
- Web Workers for heavy mathematical computations
- Efficient caching strategies
- Optimized images and assets

## 🧮 Math Library API

### Calculator Functions

```typescript
import { calculatorUtils } from './lib/math/calculator';

// Basic evaluation
const result = calculatorUtils.evaluate('sin(pi/2) + cos(0)');
console.log(result.result); // "2"

// Memory operations
calculatorUtils.memory.store(42);
calculatorUtils.memory.add(8);
const memoryValue = calculatorUtils.memory.recall(); // 50

// History management
const history = calculatorUtils.history.addToHistory('2+3', '5', []);
```

### Equation Solving

```typescript
import { equationSolver } from './lib/math/equation-solver';

// Solve algebraic equations
const solution = equationSolver.solve('x^2 - 4', 'x', 'solve');
console.log(solution.result); // "x = 2, -2"
console.log(solution.steps); // Detailed solution steps

// Find derivatives
const derivative = equationSolver.solve('x^3 + 2*x', 'x', 'derivative');
console.log(derivative.result); // "3*x^2 + 2"
```

### Function Graphing

```typescript
import { functionGrapher } from './lib/math/function-grapher';

// Create and graph functions
const func = functionGrapher.createFunction('x^2', 'blue');
const bounds = { xMin: -5, xMax: 5, yMin: -1, yMax: 25 };
const points = functionGrapher.generatePoints('x^2', bounds);

// Find critical points
const critical = functionGrapher.findCriticalPoints('x^3 - 3*x', bounds);
```

### Input Validation

```typescript
import { MathValidator } from './lib/math/validation';

// Validate expressions
const validation = MathValidator.validateExpression('2 + 3 * x');
if (validation.valid) {
  console.log('Safe to evaluate:', validation.sanitized);
} else {
  console.error('Validation failed:', validation.error);
}
```

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run dev:server       # Start backend server only

# Building
npm run build           # Build frontend
npm run build:server    # Build backend
npm run build:all       # Build both frontend and backend
npm run build:analyze   # Analyze bundle size

# Testing
npm run test            # Run tests in watch mode
npm run test:run        # Run tests once
npm run test:ui         # Run tests with UI

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run format          # Format code with Prettier
npm run type-check      # TypeScript type checking

# Documentation
npm run docs:generate   # Generate API documentation
npm run docs:serve      # Serve documentation locally
npm run storybook       # Start Storybook development server
npm run storybook:build # Build Storybook for production
```

### Testing Strategy

#### Unit Tests

- **Math Functions**: Comprehensive testing of mathematical operations
- **Validation**: Security and input validation testing
- **Components**: React component behavior and rendering
- **Edge Cases**: Floating-point precision, NaN, infinity handling

#### Integration Tests

- **API Endpoints**: Backend route testing
- **Math Library Integration**: Testing with real math.js and nerdamer
- **User Workflows**: Complete user interaction scenarios

#### Performance Tests

- **Bundle Analysis**: Monitor and optimize bundle sizes
- **Load Testing**: Ensure performance under heavy usage
- **Memory Profiling**: Prevent memory leaks in long-running sessions

### Code Quality Standards

#### TypeScript Configuration

- Strict mode enabled for maximum type safety
- Comprehensive type definitions for all math operations
- Interface-driven development for better maintainability

#### ESLint Rules

- React hooks rules for proper hook usage
- TypeScript-specific linting for type safety
- Accessibility rules for WCAG compliance
- Security rules for preventing common vulnerabilities

#### Prettier Configuration

- Consistent code formatting across the project
- Automatic formatting on save and pre-commit
- Integration with ESLint for seamless development

## 📖 Documentation

### API Documentation

- **TypeDoc**: Automatically generated from JSDoc comments
- **Interactive Examples**: Live code examples in documentation
- **Type Definitions**: Complete TypeScript interface documentation

### Component Documentation

- **Storybook**: Interactive component playground
- **Usage Examples**: Real-world usage scenarios
- **Props Documentation**: Complete prop interface documentation

### User Guides

- **Getting Started**: Step-by-step setup and usage guide
- **Math Tools**: Comprehensive guide to calculator, solver, and grapher
- **LaTeX Guide**: Complete LaTeX tutorial with live examples
- **MATLAB Guide**: Programming tutorials and examples

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL=./database/mathfarm.db

# Security Configuration
JWT_SECRET=your-super-secret-jwt-key
BCRYPT_ROUNDS=12

# Feature Flags
ENABLE_ANALYTICS=false
ENABLE_ERROR_REPORTING=false
```

### Customization

#### Theme Configuration

The application uses a purple-based color scheme defined in CSS custom properties:

```css
:root {
  --color-primary: hsl(262, 65%, 45%);
  --color-accent: hsl(270, 75%, 65%);
  --color-background: hsl(255, 15%, 98%);
  /* ... more color definitions */
}
```

#### Math Library Configuration

Configure math.js and other mathematical libraries in `client/src/lib/math/math-loader.ts`:

```typescript
const mathConfig = {
  angleUnit: 'deg', // or 'rad'
  precision: 14, // decimal precision
  predictable: false, // deterministic behavior
  randomSeed: null, // random seed for reproducibility
};
```

## 🚀 Deployment

### Self-Hosting Requirements

#### Minimum System Requirements

- **CPU**: 1 vCPU (2+ recommended)
- **RAM**: 512MB (1GB+ recommended)
- **Storage**: 1GB (5GB+ recommended for logs and database)
- **OS**: Linux, macOS, or Windows with Node.js support

#### Recommended Setup

- **Reverse Proxy**: Nginx or Apache for SSL termination
- **Process Manager**: PM2 for production process management
- **Monitoring**: Basic system monitoring for uptime and performance
- **Backups**: Regular SQLite database backups

### Docker Deployment

```dockerfile
# Dockerfile example
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build:all

EXPOSE 3000
CMD ["npm", "start"]
```

### Production Checklist

- [ ] Environment variables configured
- [ ] HTTPS certificates installed
- [ ] Database backups scheduled
- [ ] Error monitoring configured
- [ ] Performance monitoring enabled
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Log rotation configured

## 🤝 Contributing

We welcome contributions to Math Farm! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** with proper tests and documentation
4. **Run the test suite**: `npm run test:run`
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Code Standards

- Follow TypeScript strict mode requirements
- Add JSDoc comments for all public functions
- Include unit tests for new functionality
- Ensure accessibility compliance
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MathJax** team for excellent mathematical rendering
- **math.js** contributors for comprehensive mathematical functions
- **React** team for the amazing UI library
- **Vite** team for the fast build tool
- **Tailwind CSS** for the utility-first CSS framework

## 📞 Support

- **Documentation**: [https://mathfarm.dev/docs](https://mathfarm.dev/docs)
- **Issues**: [GitHub Issues](https://github.com/mathfarm/mathfarm/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mathfarm/mathfarm/discussions)
- **Email**: support@mathfarm.dev

---

**Math Farm** - Making mathematics accessible, interactive, and enjoyable for everyone! 🧮✨
