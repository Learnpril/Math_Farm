# Math Farm - Math Library API Documentation

Welcome to the Math Farm Math Library API documentation. This comprehensive library provides safe, validated mathematical operations for the Math Farm educational platform.

## Overview

The Math Farm Math Library is designed with security, performance, and educational value in mind. It provides:

- **Safe Expression Evaluation**: All mathematical expressions are validated and sanitized before evaluation
- **Comprehensive Error Handling**: Graceful error recovery with detailed error messages
- **Step-by-Step Solutions**: Educational step-by-step breakdowns for complex operations
- **Multiple Math Operations**: Calculator functions, equation solving, function graphing, and more
- **Fallback Support**: Robust fallback mechanisms when external libraries are unavailable

## Core Modules

### Calculator (`calculator.ts`)

Pure calculator functions with support for:

- Basic arithmetic operations
- Trigonometric functions with angle mode support
- Memory operations (store, recall, add, subtract)
- Calculation history management
- Real-time expression evaluation

### Equation Solver (`equation-solver.ts`)

Advanced equation solving capabilities:

- Algebraic equation solving with symbolic and numerical methods
- Derivative calculation with step-by-step explanations
- Expression simplification
- Quadratic equation solver with detailed steps
- LaTeX formatting for mathematical expressions

### Function Grapher (`function-grapher.ts`)

Function visualization and analysis:

- Function evaluation at specific points
- Graph point generation for smooth curves
- Canvas-based graph rendering with grid and axes
- Critical point detection (maxima, minima)
- Optimal bounds calculation for function visualization

### Validation (`validation.ts`)

Comprehensive input validation and security:

- Mathematical expression validation
- Security threat detection and prevention
- Input sanitization and normalization
- Mathematical data structure validation (arrays, matrices, complex numbers)
- Floating-point precision handling

### Math Loader (`math-loader.ts`)

Dynamic library loading and management:

- Singleton-based math.js loading
- Fallback implementation when main library unavailable
- Configuration support for different math.js setups
- Error handling and recovery mechanisms

## Security Features

The Math Farm Math Library prioritizes security with:

- **Input Sanitization**: All user inputs are sanitized to prevent code injection
- **Whitelist Validation**: Only approved mathematical functions are allowed
- **Pattern Detection**: Dangerous code patterns are detected and blocked
- **Safe Evaluation**: Mathematical expressions are evaluated in a controlled environment
- **Error Boundaries**: Comprehensive error handling prevents crashes and data leaks

## Usage Examples

### Basic Calculator Operations

```typescript
import { calculatorUtils } from './calculator';

// Evaluate expressions
const result = calculatorUtils.evaluate('sin(pi/2) + cos(0)');
console.log(result.result); // "2"

// Memory operations
calculatorUtils.memory.store(42);
calculatorUtils.memory.add(8);
const memoryValue = calculatorUtils.memory.recall(); // 50
```

### Equation Solving

```typescript
import { equationSolver } from './equation-solver';

// Solve quadratic equation
const solution = equationSolver.solve('x^2 - 4', 'x', 'solve');
console.log(solution.result); // "x = 2, -2"
console.log(solution.steps); // Array of solution steps

// Find derivative
const derivative = equationSolver.solve('x^3 + 2*x', 'x', 'derivative');
console.log(derivative.result); // "3*x^2 + 2"
```

### Function Graphing

```typescript
import { functionGrapher } from './function-grapher';

// Create and graph functions
const func = functionGrapher.createFunction('x^2', 'blue');
const bounds = { xMin: -5, xMax: 5, yMin: -1, yMax: 25 };
const points = functionGrapher.generatePoints('x^2', bounds);

// Find critical points
const critical = functionGrapher.findCriticalPoints('x^3 - 3*x', bounds);
```

### Input Validation

```typescript
import { MathValidator } from './validation';

// Validate expressions
const validation = MathValidator.validateExpression('2 + 3 * x');
if (validation.valid) {
  console.log('Safe to evaluate:', validation.sanitized);
} else {
  console.error('Validation failed:', validation.error);
}
```

## Error Handling

All functions in the Math Farm Math Library follow consistent error handling patterns:

- **Never throw exceptions**: All errors are captured and returned in result objects
- **Detailed error messages**: User-friendly error descriptions with suggested actions
- **Fallback behaviors**: Graceful degradation when operations fail
- **Logging integration**: Comprehensive error logging for debugging and monitoring

## Performance Considerations

The library is optimized for performance with:

- **Memoization**: Results are cached where appropriate to avoid redundant calculations
- **Lazy Loading**: Heavy mathematical libraries are loaded only when needed
- **Web Workers**: Complex calculations can be offloaded to prevent UI blocking
- **Efficient Algorithms**: Optimized mathematical algorithms for common operations

## Browser Compatibility

The Math Farm Math Library supports:

- **Modern Browsers**: Chrome 120+, Firefox 115+, Safari 17+, Edge 120+
- **Fallback Support**: Graceful degradation for older browsers
- **Progressive Enhancement**: Advanced features are enabled when supported

## Contributing

When contributing to the Math Farm Math Library:

1. **Add JSDoc Comments**: All public methods must have comprehensive JSDoc documentation
2. **Include Examples**: Provide practical usage examples in documentation
3. **Write Tests**: Ensure comprehensive test coverage for new functionality
4. **Follow Security Guidelines**: Validate all inputs and handle errors gracefully
5. **Update Documentation**: Keep this API documentation current with changes

## License

The Math Farm Math Library is open source and available under the MIT License.

## Support

For questions, issues, or contributions:

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Comprehensive guides and examples
- **Community**: Join our community discussions

---

_This documentation is automatically generated from JSDoc comments in the source code. Last updated: {date}_
