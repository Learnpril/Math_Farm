# Calculus Lessons Template

## Section 1: Introduction to Limits

**Type:** explanation
**Content:** Limits describe the behavior of functions as inputs approach specific values. They form the foundation of calculus by allowing us to analyze what happens at points where functions might not be defined or where they approach infinity. Understanding limits is essential for derivatives and integrals.

### Key Mathematical Expressions:

- `\lim_{x \to a} f(x) = L`
- `\lim_{x \to \infty} \frac{1}{x} = 0`
- `\lim_{h \to 0} \frac{f(x+h) - f(x)}{h}` (derivative definition)

---

## Section 2: Understanding Derivatives

**Type:** example
**Content:** Derivatives measure the instantaneous rate of change of functions. They tell us how fast something is changing at any given point and have applications in physics, economics, and optimization.

### Examples:

#### Example 1: The Power Rule

**Concept:** How to differentiate polynomial functions using the power rule
**Demonstration:** Finding the derivative of f(x) = x³ using the power rule
**Steps:**

1. Identify the power rule formula: d/dx[xⁿ] = nxⁿ⁻¹
2. Apply to f(x) = x³ where n = 3
3. Calculate: d/dx[x³] = 3x³⁻¹ = 3x²
4. Verify using the limit definition if needed

**Math Expression:** `\frac{d}{dx}[x^3] = 3x^2`
**Key Takeaway:** The power rule provides a quick method for differentiating polynomial terms by bringing down the exponent and reducing the power by one.

#### Example 2: Chain Rule Application

**Concept:** Differentiating composite functions using the chain rule
**Demonstration:** Finding the derivative of f(x) = (2x + 1)³
**Steps:**

1. Identify the outer function u³ and inner function u = 2x + 1
2. Apply chain rule: d/dx[f(g(x))] = f'(g(x)) · g'(x)
3. Outer derivative: d/du[u³] = 3u²
4. Inner derivative: d/dx[2x + 1] = 2
5. Combine: 3(2x + 1)² · 2 = 6(2x + 1)²

**Math Expression:** `\frac{d}{dx}[(2x + 1)^3] = 6(2x + 1)^2`
**Key Takeaway:** The chain rule handles composite functions by multiplying the derivative of the outer function by the derivative of the inner function.

---

## Section 3: Integration Fundamentals

**Type:** example
**Content:** Integration is the reverse of differentiation. It finds the area under curves, accumulates quantities over intervals, and solves differential equations.

### Examples:

#### Example 1: Basic Integration - Power Rule

**Concept:** Using the power rule for integration to find antiderivatives
**Demonstration:** Finding ∫x² dx using the power rule for integration
**Steps:**

1. Recall the power rule for integration: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C
2. Apply to ∫x² dx where n = 2
3. Calculate: ∫x² dx = x²⁺¹/(2+1) + C = x³/3 + C
4. Verify by differentiating: d/dx[x³/3 + C] = 3x²/3 = x² ✓

**Math Expression:** `\int x^2 dx = \frac{x^3}{3} + C`
**Key Takeaway:** Integration adds 1 to the exponent and divides by the new exponent, opposite of differentiation. Always include the constant of integration C.

---

## Section 4: Applications of Calculus

**Type:** example
**Content:** Calculus has numerous real-world applications including optimization problems, motion analysis, and area calculations.

### Examples:

#### Example 1: Optimization Problem

**Concept:** Using derivatives to find maximum and minimum values
**Demonstration:** Finding the maximum area of a rectangle with fixed perimeter
**Steps:**

1. Set up the problem: rectangle with perimeter 20, find maximum area
2. Define variables: let width = x, then length = (20-2x)/2 = 10-x
3. Write area function: A(x) = x(10-x) = 10x - x²
4. Find critical points: A'(x) = 10 - 2x = 0, so x = 5
5. Verify maximum: A''(x) = -2 < 0, confirming maximum
6. Calculate maximum area: A(5) = 5(10-5) = 25

**Math Expression:** `A(x) = x(10-x), \quad A'(x) = 0 \Rightarrow x = 5, \quad A_{max} = 25`
**Key Takeaway:** Optimization problems use derivatives to find where rates of change equal zero, indicating maximum or minimum values.

---

_Continue this pattern for additional sections like:_

- Fundamental Theorem of Calculus
- Integration Techniques (substitution, parts, etc.)
- Applications to Physics and Engineering
- Differential Equations Introduction
