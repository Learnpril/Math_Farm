// React 19 - no need to import React
import { useState, useRef } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  BookOpen,
  Code,
  Copy,
  Search,
  Play,
  Check,
} from "lucide-react";
import { MathExpression } from "../components/MathExpression";
import { Button } from "../components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { Badge } from "../components/ui/badge";

export function LaTeXGuidePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editorInput, setEditorInput] = useState(
    "\\frac{a}{b} + \\sqrt{x^2 + y^2}"
  );
  const [copiedExample, setCopiedExample] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("basics");
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Comprehensive LaTeX examples database
  const examplesDatabase = [
    // Basic Operations
    {
      category: "basics",
      title: "Basic Fraction",
      latex: "\\frac{a}{b}",
      description: "Simple fraction notation",
      tags: ["fraction", "basic", "division"],
    },
    {
      category: "basics",
      title: "Exponents",
      latex: "x^2, x^{n+1}, e^{-x}",
      description: "Superscript notation for powers",
      tags: ["exponent", "power", "superscript"],
    },
    {
      category: "basics",
      title: "Subscripts",
      latex: "x_1, x_{i+1}, a_{n}",
      description: "Subscript notation for indices",
      tags: ["subscript", "index", "variable"],
    },
    {
      category: "basics",
      title: "Square Root",
      latex: "\\sqrt{x}, \\sqrt[n]{x}",
      description: "Square root and nth root notation",
      tags: ["root", "sqrt", "radical"],
    },

    // Greek Letters
    {
      category: "symbols",
      title: "Greek Letters (Lowercase)",
      latex:
        "\\alpha, \\beta, \\gamma, \\delta, \\epsilon, \\theta, \\lambda, \\mu, \\pi, \\sigma, \\phi, \\omega",
      description: "Common lowercase Greek letters",
      tags: ["greek", "letters", "lowercase"],
    },
    {
      category: "symbols",
      title: "Greek Letters (Uppercase)",
      latex:
        "\\alpha, \\beta, \\Gamma, \\Delta, \\Theta, \\Lambda, \\Pi, \\Sigma, \\Phi, \\Omega",
      description:
        "Greek letters (α, β are lowercase; Γ, Δ, etc. are uppercase)",
      tags: ["greek", "letters", "uppercase"],
    },
    {
      category: "symbols",
      title: "Mathematical Operators",
      latex:
        "\\pm, \\mp, \\times, \\div, \\cdot, \\ast, \\star, \\circ, \\bullet",
      description: "Basic mathematical operators",
      tags: ["operators", "multiplication", "division"],
    },
    {
      category: "symbols",
      title: "Comparison Operators",
      latex: "\\leq, \\geq, \\neq, \\approx, \\equiv, \\sim, \\propto",
      description: "Comparison and relation symbols",
      tags: ["comparison", "relations", "inequality"],
    },
    {
      category: "symbols",
      title: "Set Theory",
      latex:
        "\\in, \\notin, \\subset, \\supset, \\subseteq, \\supseteq, \\cup, \\cap, \\emptyset, \\infty",
      description: "Set theory and logic symbols",
      tags: ["sets", "logic", "membership"],
    },

    // Equations and Formulas
    {
      category: "equations",
      title: "Quadratic Formula",
      latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
      description: "The famous quadratic formula",
      tags: ["quadratic", "formula", "algebra"],
    },
    {
      category: "equations",
      title: "Binomial Theorem",
      latex: "(x + y)^n = \\sum_{k=0}^{n} \\binom{n}{k} x^{n-k} y^k",
      description: "Binomial expansion formula",
      tags: ["binomial", "expansion", "combinatorics"],
    },
    {
      category: "equations",
      title: "Euler's Formula",
      latex: "e^{i\\theta} = \\cos\\theta + i\\sin\\theta",
      description: "Euler's famous identity in complex analysis",
      tags: ["euler", "complex", "exponential"],
    },
    {
      category: "equations",
      title: "Taylor Series",
      latex: "f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n",
      description: "Taylor series expansion",
      tags: ["taylor", "series", "calculus"],
    },

    // Calculus
    {
      category: "equations",
      title: "Definite Integral",
      latex: "\\int_{a}^{b} f(x) \\, dx",
      description: "Definite integral notation",
      tags: ["integral", "calculus", "definite"],
    },
    {
      category: "equations",
      title: "Partial Derivatives",
      latex:
        "\\frac{\\partial f}{\\partial x}, \\frac{\\partial^2 f}{\\partial x \\partial y}",
      description: "Partial derivative notation",
      tags: ["derivative", "partial", "calculus"],
    },
    {
      category: "equations",
      title: "Limit",
      latex: "\\lim_{x \\to a} f(x) = L",
      description: "Limit notation",
      tags: ["limit", "calculus", "approach"],
    },

    // Advanced Features
    {
      category: "advanced",
      title: "2x2 Matrix",
      latex: "\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}",
      description: "2x2 matrix representation",
      tags: ["matrix", "linear algebra", "2x2"],
    },
    {
      category: "advanced",
      title: "3x3 Matrix",
      latex:
        "\\begin{bmatrix} a_{11} & a_{12} & a_{13} \\\\ a_{21} & a_{22} & a_{23} \\\\ a_{31} & a_{32} & a_{33} \\end{bmatrix}",
      description: "3x3 matrix with indexed elements",
      tags: ["matrix", "linear algebra", "3x3"],
    },
    {
      category: "advanced",
      title: "System of Equations",
      latex: "\\begin{cases} x + y = 5 \\\\ 2x - y = 1 \\end{cases}",
      description: "System of linear equations",
      tags: ["system", "equations", "cases"],
    },
    {
      category: "advanced",
      title: "Piecewise Function",
      latex:
        "f(x) = \\begin{cases} x^2 & \\text{if } x \\geq 0 \\\\ -x^2 & \\text{if } x < 0 \\end{cases}",
      description: "Piecewise function definition",
      tags: ["piecewise", "function", "conditional"],
    },
    {
      category: "advanced",
      title: "Summation",
      latex: "\\sum_{i=1}^{n} i^2 = \\frac{n(n+1)(2n+1)}{6}",
      description: "Summation notation with formula",
      tags: ["sum", "series", "formula"],
    },
    {
      category: "advanced",
      title: "Product Notation",
      latex: "\\prod_{i=1}^{n} i = n!",
      description: "Product notation for factorial",
      tags: ["product", "factorial", "notation"],
    },
  ];

  const sections = [
    {
      id: "basics",
      title: "LaTeX Basics",
      description:
        "Learn the fundamental syntax and structure of LaTeX mathematical expressions",
      content: {
        overview:
          "LaTeX is a powerful typesetting system for mathematical expressions. It uses backslash commands and curly braces to create beautiful mathematical notation.",
        keyPoints: [
          "Use backslash (\\) to start commands",
          "Enclose arguments in curly braces {}",
          "Use ^ for superscripts and _ for subscripts",
          "Fractions are created with \\frac{numerator}{denominator}",
          "Square roots use \\sqrt{expression}",
        ],
      },
    },
    {
      id: "symbols",
      title: "Mathematical Symbols",
      description:
        "Comprehensive guide to Greek letters, operators, and special symbols",
      content: {
        overview:
          "Mathematical symbols are essential for expressing complex mathematical concepts. LaTeX provides commands for Greek letters, operators, and special symbols.",
        keyPoints: [
          "Greek letters: \\alpha, \\beta, \\gamma, etc.",
          "Operators: \\pm, \\times, \\div, \\cdot",
          "Relations: \\leq, \\geq, \\neq, \\approx",
          "Set theory: \\in, \\subset, \\cup, \\cap",
          "Special symbols: \\infty, \\emptyset, \\nabla",
        ],
      },
    },
    {
      id: "equations",
      title: "Equations & Formulas",
      description:
        "Create complex equations, fractions, and multi-line expressions",
      content: {
        overview:
          "Complex equations combine multiple LaTeX elements to express mathematical relationships clearly and beautifully.",
        keyPoints: [
          "Use \\frac for fractions within equations",
          "Combine superscripts and subscripts",
          "Use \\sqrt for roots and radicals",
          "Integrals: \\int_{lower}^{upper}",
          "Limits: \\lim_{variable \\to value}",
        ],
      },
    },
    {
      id: "advanced",
      title: "Advanced Features",
      description: "Matrices, arrays, and advanced mathematical notation",
      content: {
        overview:
          "Advanced LaTeX features allow you to create matrices, systems of equations, and complex mathematical structures.",
        keyPoints: [
          "Matrices: \\begin{bmatrix}...\\end{bmatrix}",
          "Systems: \\begin{cases}...\\end{cases}",
          "Arrays and alignment structures",
          "Multi-line equations",
          "Custom spacing and formatting",
        ],
      },
    },
  ];

  // Filter examples based on search query
  const filteredExamples = examplesDatabase.filter(
    (example) =>
      example.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      example.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      example.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      example.latex.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Copy to clipboard function
  const copyToClipboard = async (text: string, exampleTitle: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedExample(exampleTitle);
      setTimeout(() => setCopiedExample(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Insert example into editor
  const insertIntoEditor = (latex: string) => {
    setEditorInput(latex);
    if (editorRef.current) {
      editorRef.current.focus();
    }
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
        <h1 className="text-4xl font-bold text-foreground mb-4">LaTeX Guide</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Master LaTeX mathematical notation to create beautiful equations and
          expressions. Perfect for academic writing, research papers, and
          mathematical documentation.
        </p>
      </div>

      {/* Interactive LaTeX Editor */}
      <div className="mb-12">
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b bg-muted/50">
            <Code className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">
              Interactive LaTeX Editor
            </h2>
          </div>

          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
            {/* Editor Input */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-foreground">LaTeX Input</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(editorInput, "editor-content")}
                  className="h-8"
                >
                  {copiedExample === "editor-content" ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
              <textarea
                ref={editorRef}
                value={editorInput}
                onChange={(e) => setEditorInput(e.target.value)}
                className="w-full h-32 p-3 bg-background border rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                placeholder="Enter LaTeX code here..."
              />
              <p className="text-xs text-muted-foreground mt-2">
                Type LaTeX code to see live preview on the right
              </p>
            </div>

            {/* Live Preview */}
            <div className="p-4">
              <h3 className="font-medium text-foreground mb-3">Live Preview</h3>
              <div className="min-h-32 p-4 bg-background border rounded-md flex items-center justify-center">
                {editorInput.trim() ? (
                  <MathExpression expression={editorInput} />
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Preview will appear here
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Searchable Examples Database */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-foreground">
            Examples Database
          </h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search examples..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-background border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={activeSection === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveSection("all")}
          >
            All ({examplesDatabase.length})
          </Button>
          {sections.map((section) => {
            const count = examplesDatabase.filter(
              (ex) => ex.category === section.id
            ).length;
            return (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSection(section.id)}
              >
                {section.title} ({count})
              </Button>
            );
          })}
        </div>

        {/* Examples Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredExamples
            .filter(
              (example) =>
                activeSection === "all" || example.category === activeSection
            )
            .map((example, index) => (
              <div
                key={index}
                className="bg-card border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground mb-1">
                      {example.title}
                    </h3>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {example.tags.slice(0, 2).map((tag, tagIndex) => (
                        <Badge
                          key={tagIndex}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertIntoEditor(example.latex)}
                      className="h-8 w-8 p-0"
                      title="Insert into editor"
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(example.latex, example.title)
                      }
                      className="h-8 w-8 p-0"
                      title="Copy LaTeX code"
                    >
                      {copiedExample === example.title ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-md p-2 mb-3 font-mono text-xs overflow-x-auto">
                  {example.latex}
                </div>

                <div className="text-center py-3 bg-background rounded-md border mb-2">
                  <MathExpression expression={example.latex} />
                </div>

                <p className="text-xs text-muted-foreground">
                  {example.description}
                </p>
              </div>
            ))}
        </div>

        {filteredExamples.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No examples found matching "{searchQuery}"
            </p>
          </div>
        )}
      </div>

      {/* Structured Learning Sections */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-foreground mb-6">
          Learning Sections
        </h2>

        <Accordion type="single" className="space-y-4">
          {sections.map((section) => (
            <AccordionItem
              key={section.id}
              value={section.id}
              className="bg-card border rounded-lg"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-4 text-left">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {section.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    {section.content.overview}
                  </p>

                  <div>
                    <h4 className="font-medium text-foreground mb-2">
                      Key Points:
                    </h4>
                    <ul className="space-y-1">
                      {section.content.keyPoints.map((point, index) => (
                        <li
                          key={index}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4">
                    <h4 className="font-medium text-foreground mb-3">
                      Related Examples:
                    </h4>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {examplesDatabase
                        .filter((ex) => ex.category === section.id)
                        .slice(0, 4)
                        .map((example, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => insertIntoEditor(example.latex)}
                            className="justify-start h-auto p-3 text-left"
                          >
                            <div>
                              <div className="font-medium text-xs">
                                {example.title}
                              </div>
                              <div className="font-mono text-xs text-muted-foreground mt-1">
                                {example.latex.length > 30
                                  ? example.latex.substring(0, 30) + "..."
                                  : example.latex}
                              </div>
                            </div>
                          </Button>
                        ))}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
