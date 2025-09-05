import React from "react";
import { Link } from "wouter";
import { ArrowLeft, BookOpen, Code, Copy, Eye } from "lucide-react";
import { MathExpression } from "../components/MathExpression";

export function LaTeXGuidePage() {
  const sections = [
    {
      id: "basics",
      title: "LaTeX Basics",
      description:
        "Learn the fundamental syntax and structure of LaTeX mathematical expressions",
    },
    {
      id: "symbols",
      title: "Mathematical Symbols",
      description:
        "Comprehensive guide to Greek letters, operators, and special symbols",
    },
    {
      id: "equations",
      title: "Equations & Formulas",
      description:
        "Create complex equations, fractions, and multi-line expressions",
    },
    {
      id: "advanced",
      title: "Advanced Features",
      description: "Matrices, arrays, and advanced mathematical notation",
    },
  ];

  const examples = [
    {
      title: "Basic Fraction",
      latex: "\\frac{a}{b}",
      description: "Simple fraction notation",
    },
    {
      title: "Quadratic Formula",
      latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
      description: "The famous quadratic formula",
    },
    {
      title: "Integral",
      latex: "\\int_{a}^{b} f(x) \\, dx",
      description: "Definite integral notation",
    },
    {
      title: "Matrix",
      latex: "\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}",
      description: "2x2 matrix representation",
    },
  ];

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

      {/* Quick Examples */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-foreground mb-6">
          Quick Examples
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {examples.map((example, index) => (
            <div key={index} className="bg-card border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-foreground">{example.title}</h3>
                <button
                  onClick={() => navigator.clipboard.writeText(example.latex)}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
                  title="Copy LaTeX code"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-muted/50 rounded-md p-3 mb-3 font-mono text-sm">
                {example.latex}
              </div>

              <div className="text-center py-4 bg-background rounded-md border">
                <MathExpression expression={example.latex} />
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                {example.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Guide Sections */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-foreground mb-6">
          Learning Sections
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <div
              key={section.id}
              className="bg-card border rounded-lg p-6 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">
                    {section.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {section.description}
                  </p>

                  <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
                    Coming Soon
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Editor Preview */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Code className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">
            Interactive LaTeX Editor
          </h2>
        </div>

        <p className="text-muted-foreground mb-6">
          A live LaTeX editor with real-time preview will be available here in
          future updates. You'll be able to write LaTeX code and see the
          rendered output instantly.
        </p>

        <div className="bg-muted/50 rounded-lg p-8 text-center">
          <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Interactive editor coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
