import React, { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, X } from "lucide-react";
import { MathExpression } from "../components/MathExpression";

interface SymbolData {
  symbol: string;
  name: string;
  meaning: string;
  description?: string;
  examples?: string[];
}

interface SymbolModalProps {
  symbol: SymbolData | null;
  onClose: () => void;
}

function SymbolModal({ symbol, onClose }: SymbolModalProps) {
  if (!symbol) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background border rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-semibold text-foreground">
              {symbol.name}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
              aria-label="Close modal"
            >
              <X className="h-8 w-8" />
            </button>
          </div>

          <div className="text-center mb-8">
            <div className="text-8xl font-bold text-primary mb-6 font-math">
              {symbol.symbol}
            </div>
          </div>

          {symbol.description && (
            <p className="text-2xl text-muted-foreground mb-8">
              {symbol.description}
            </p>
          )}

          {symbol.examples && symbol.examples.length > 0 && (
            <div>
              <h3 className="text-3xl font-semibold mb-6">Examples:</h3>
              <div className="space-y-4">
                {symbol.examples.map((example, index) => (
                  <div
                    key={index}
                    className="bg-muted/50 p-6 rounded-md border-l-4 border-primary font-mono text-3xl"
                  >
                    <MathExpression expression={example} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function MathSymbolsPage() {
  const [selectedSymbol, setSelectedSymbol] = useState<SymbolData | null>(null);

  const symbolCategories = [
    {
      name: "BASIC ARITHMETIC",
      symbols: [
        {
          symbol: "+",
          name: "Plus",
          meaning: "Addition operation",
          description:
            "The plus sign is used for addition, the fundamental arithmetic operation of combining two numbers.",
          examples: ["3 + 5 = 8", "x + y", "2.5 + 1.7 = 4.2"],
        },
        {
          symbol: "−",
          name: "Minus",
          meaning: "Subtraction operation",
          description:
            "The minus sign is used for subtraction, taking one number away from another.",
          examples: ["8 - 3 = 5", "x - y", "10.5 - 2.3 = 8.2"],
        },
        {
          symbol: "×",
          name: "Times",
          meaning: "Multiplication operation",
          description:
            "The multiplication sign represents the operation of multiplying two or more numbers together.",
          examples: ["4 × 3 = 12", "a × b", "2.5 × 4 = 10"],
        },
        {
          symbol: "÷",
          name: "Division",
          meaning: "Division operation",
          description:
            "The division sign represents dividing one number by another.",
          examples: ["12 ÷ 3 = 4", "15 ÷ 5 = 3", "a ÷ b = a/b"],
        },
        {
          symbol: "±",
          name: "Plus-minus",
          meaning: "Indicates positive or negative value",
          description: "Shows that a value can be either positive or negative.",
          examples: ["√4 = ±2", "x = 5 ± 2", "10.5 ± 0.1 cm"],
        },
        {
          symbol: "!",
          name: "Factorial",
          meaning: "Product of all positive integers up to n",
          description:
            "Factorial of n is the product of all positive integers from 1 to n.",
          examples: ["5! = 5×4×3×2×1 = 120", "0! = 1", "n! = n×(n-1)×...×2×1"],
        },
      ],
    },
    {
      name: "EQUALITY & COMPARISON",
      symbols: [
        {
          symbol: "=",
          name: "Equals",
          meaning: "Equality relation",
          description:
            "The equals sign shows that two expressions have the same value.",
          examples: ["2 + 3 = 5", "x = 10", "A = πr²"],
        },
        {
          symbol: "≠",
          name: "Not equal",
          meaning: "Inequality relation",
          description: "Indicates that two values are not equal to each other.",
          examples: ["5 ≠ 3", "x² ≠ x", "a ≠ b"],
        },
        {
          symbol: ">",
          name: "Greater than",
          meaning: "Comparison showing larger value",
          description:
            "Indicates that the left value is larger than the right value.",
          examples: ["7 > 3", "x > 0", "a > b"],
        },
        {
          symbol: "<",
          name: "Less than",
          meaning: "Comparison showing smaller value",
          description:
            "Indicates that the left value is smaller than the right value.",
          examples: ["2 < 5", "x < 0", "a < b"],
        },
        {
          symbol: "≥",
          name: "Greater than or equal",
          meaning: "Comparison showing larger or equal value",
          description:
            "Indicates that the left value is either greater than or equal to the right value.",
          examples: ["x ≥ 0", "5 ≥ 5", "7 ≥ 3"],
        },
        {
          symbol: "≤",
          name: "Less than or equal",
          meaning: "Comparison showing smaller or equal value",
          description:
            "Indicates that the left value is either less than or equal to the right value.",
          examples: ["x ≤ 10", "3 ≤ 3", "2 ≤ 5"],
        },
        {
          symbol: "≈",
          name: "Approximately equal",
          meaning: "Approximate equality",
          description: "Indicates that two values are approximately equal.",
          examples: ["π ≈ 3.14159", "√2 ≈ 1.414", "22/7 ≈ π"],
        },
      ],
    },
    {
      name: "CALCULUS",
      symbols: [
        {
          symbol: "∫",
          name: "Integral",
          meaning: "Integration symbol",
          description:
            "The integral symbol represents integration, finding the area under a curve.",
          examples: [
            "∫x dx = x²/2 + C",
            "∫₀¹ x dx = 1/2",
            "∫ sin(x) dx = -cos(x) + C",
          ],
        },
        {
          symbol: "∂",
          name: "Partial derivative",
          meaning: "Partial differentiation",
          description:
            "Derivative with respect to one variable while keeping others constant.",
          examples: [
            "∂f/∂x",
            "∂z/∂x \\text{ where z} = f(x,y)",
            "∂u/∂t = k∇²u",
          ],
        },
        {
          symbol: "∇",
          name: "Nabla",
          meaning: "Del operator",
          description:
            "Vector differential operator for gradient, divergence, and curl.",
          examples: ["∇f = gradient", "∇·F = divergence", "∇×F = curl"],
        },
        {
          symbol: "Σ",
          name: "Sigma",
          meaning: "Summation notation",
          description: "Represents the sum of a series of terms.",
          examples: [
            "Σᵢ₌₁³ i = 1+2+3 = 6",
            "Σᵢ₌₁ⁿ i = n(n+1)/2",
            "Σᵢ₌₀∞ xⁱ = 1/(1-x)",
          ],
        },
        {
          symbol: "∏",
          name: "Product",
          meaning: "Product notation",
          description: "Represents the product of a sequence of terms.",
          examples: [
            "∏ᵢ₌₁ⁿ aᵢ = a₁ × a₂ × ... × aₙ",
            "∏ᵢ₌₁⁵ i = 5!",
            "n! = ∏ᵢ₌₁ⁿ i",
          ],
        },
      ],
    },
    {
      name: "SET THEORY",
      symbols: [
        {
          symbol: "∈",
          name: "Element of",
          meaning: "Set membership",
          description:
            "This symbol means that an element belongs to a particular set.",
          examples: ["3 ∈ {1, 2, 3, 4}", "x ∈ ℝ", "apple ∈ {fruits}"],
        },
        {
          symbol: "∉",
          name: "Not element of",
          meaning: "Not a member of a set",
          description: "Indicates that an element does not belong to a set.",
          examples: [
            "5 ∉ {1, 2, 3, 4}",
            "x ∉ ∅",
            "\\text{Used to show non-membership}",
          ],
        },
        {
          symbol: "⊆",
          name: "Subset",
          meaning: "Set containment",
          description:
            "Indicates that all elements of the left set are in the right set.",
          examples: [
            "A ⊆ B",
            "{1, 2} ⊆ {1, 2, 3}",
            "A ⊆ \\text{A is always true}",
          ],
        },
        {
          symbol: "∪",
          name: "Union",
          meaning: "Set union",
          description: "Combines all elements from both sets.",
          examples: ["A ∪ B", "{1, 2} ∪ {2, 3} = {1, 2, 3}", "A ∪ ∅ = A"],
        },
        {
          symbol: "∩",
          name: "Intersection",
          meaning: "Set intersection",
          description: "Contains only elements in both sets.",
          examples: ["A ∩ B", "{1, 2, 3} ∩ {2, 3, 4} = {2, 3}", "A ∩ ∅ = ∅"],
        },
        {
          symbol: "∅",
          name: "Empty set",
          meaning: "Set with no elements",
          description: "The unique set that contains no elements.",
          examples: ["∅ = {}", "|∅| = 0", "A ∩ ∅ = ∅"],
        },
      ],
    },
    {
      name: "GREEK LETTERS",
      symbols: [
        {
          symbol: "α",
          name: "Alpha",
          meaning: "Greek letter alpha",
          description:
            "First letter of Greek alphabet, often used for angles or coefficients.",
          examples: ["α = 30°", "y = αx + β", "α-particle"],
        },
        {
          symbol: "β",
          name: "Beta",
          meaning: "Greek letter beta",
          description:
            "Second letter of Greek alphabet, used for angles or coefficients.",
          examples: ["β = 45°", "y = αx + β", "β-decay"],
        },
        {
          symbol: "π",
          name: "Pi",
          meaning: "Mathematical constant ≈ 3.14159",
          description:
            "Pi is the ratio of a circle's circumference to its diameter.",
          examples: ["C = 2πr", "A = πr²", "π ≈ 3.14159..."],
        },
        {
          symbol: "θ",
          name: "Theta",
          meaning: "Angle measurement",
          description: "Commonly used to represent angles in mathematics.",
          examples: ["θ = 45°", "sin(θ)", "cos(θ) = adjacent/hypotenuse"],
        },
        {
          symbol: "λ",
          name: "Lambda",
          meaning: "Wavelength or eigenvalue",
          description: "Used for wavelength, eigenvalues, or lambda calculus.",
          examples: [
            "λ = \\text{550 nm}",
            "λ = eigenvalue",
            "\\text{Lambda functions}",
          ],
        },
        {
          symbol: "μ",
          name: "Mu",
          meaning: "Mean or micro prefix",
          description:
            "Used for mean, coefficient of friction, or micro- prefix.",
          examples: [
            "μ = mean",
            "μ = \\text{friction coefficient}",
            "μm = micrometer",
          ],
        },
        {
          symbol: "σ",
          name: "Sigma",
          meaning: "Standard deviation",
          description: "Used for standard deviation or stress in mechanics.",
          examples: [
            "σ = \\text{standard deviation}",
            "σ = stress",
            "σ = cross-section",
          ],
        },
        {
          symbol: "Ω",
          name: "Omega",
          meaning: "Ohm (electrical resistance)",
          description: "Unit of electrical resistance or solid angle.",
          examples: [
            "R = 100Ω",
            "Ω = solid angle",
            "\\text{Big Omega notation}",
          ],
        },
      ],
    },
    {
      name: "LOGIC",
      symbols: [
        {
          symbol: "∀",
          name: "For all",
          meaning: "Universal quantifier",
          description: "States that a property holds for every element.",
          examples: ["∀x ∈ ℕ, x > 0", "∀x (x² ≥ 0)", "\\text{Used in proofs}"],
        },
        {
          symbol: "∃",
          name: "There exists",
          meaning: "Existential quantifier",
          description:
            "States that there exists at least one element with a property.",
          examples: [
            "∃x ∈ ℝ, x² = 4",
            "∃n ∈ ℕ, n > 1000",
            "\\text{Used to assert existence}",
          ],
        },
        {
          symbol: "∧",
          name: "Logical AND",
          meaning: "Conjunction",
          description: "True only when both operands are true.",
          examples: ["P ∧ Q", "True ∧ True = True", "True ∧ False = False"],
        },
        {
          symbol: "∨",
          name: "Logical OR",
          meaning: "Disjunction",
          description: "True when at least one operand is true.",
          examples: ["P ∨ Q", "True ∨ False = True", "False ∨ False = False"],
        },
        {
          symbol: "¬",
          name: "Logical NOT",
          meaning: "Negation",
          description: "Reverses the truth value of a proposition.",
          examples: ["¬P", "¬True = False", "¬False = True"],
        },
        {
          symbol: "→",
          name: "Implies",
          meaning: "Logical implication",
          description: "If P then Q; false only when P is true and Q is false.",
          examples: ["P → Q", "True → False = False", "x > 5 → x > 3"],
        },
        {
          symbol: "∴",
          name: "Therefore",
          meaning: "Logical conclusion",
          description: "Indicates a logical conclusion from premises.",
          examples: [
            "\\text{All men are mortal. Socrates is a man. } ∴ \\text{ Socrates is mortal.}",
            "\\text{Used in Proofs}",
            "\\text{Logical arguments}",
          ],
        },
      ],
    },
  ];

  const handleSymbolClick = (symbol: SymbolData) => {
    setSelectedSymbol(symbol);
  };

  const closeModal = () => {
    setSelectedSymbol(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-6xl font-bold text-foreground mb-4">
          Mathematical Symbols Reference
        </h1>
        <p className="text-3xl text-muted-foreground max-w-2xl">
          A comprehensive reference of mathematical symbols organized by
          category. Click on any symbol to see detailed information and
          examples.
        </p>
      </div>

      {/* Symbols Table */}
      <div className="space-y-8">
        {symbolCategories.map((category) => (
          <div
            key={category.name}
            className="bg-card border rounded-lg overflow-hidden"
          >
            <div className="bg-primary/10 px-6 py-4 border-b">
              <h2 className="text-3xl font-semibold text-foreground">
                {category.name}
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-24" />
                  <col className="w-48" />
                  <col className="w-auto" />
                </colgroup>
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-6 py-4 text-center text-2xl font-semibold text-foreground">
                      Symbol
                    </th>
                    <th className="px-6 py-4 text-left text-2xl font-semibold text-foreground">
                      Name
                    </th>
                    <th className="px-8 py-4 text-left text-2xl font-semibold text-foreground">
                      Meaning
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {category.symbols.map((symbol, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-6 text-center align-middle">
                        <span className="text-6xl font-bold font-math text-primary">
                          {symbol.symbol}
                        </span>
                      </td>
                      <td className="px-6 py-6 align-middle">
                        <span className="font-semibold text-foreground text-2xl">
                          {symbol.name}
                        </span>
                      </td>
                      <td className="px-8 py-6 align-middle">
                        <button
                          onClick={() => handleSymbolClick(symbol)}
                          className="text-primary hover:text-primary/80 transition-colors cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md text-2xl w-full text-left"
                        >
                          {symbol.meaning}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <SymbolModal symbol={selectedSymbol} onClose={closeModal} />
    </div>
  );
}
