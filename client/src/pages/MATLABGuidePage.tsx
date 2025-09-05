import React from "react";
import { Link } from "wouter";
import { ArrowLeft, Terminal, Code, Play, BookOpen } from "lucide-react";

export function MATLABGuidePage() {
  const sections = [
    {
      id: "getting-started",
      title: "Getting Started",
      description: "MATLAB basics, workspace, and command window fundamentals",
    },
    {
      id: "syntax",
      title: "MATLAB Syntax",
      description: "Variables, operators, functions, and control structures",
    },
    {
      id: "plotting",
      title: "Plotting & Visualization",
      description:
        "Create 2D and 3D plots, customize graphics, and data visualization",
    },
    {
      id: "matrices",
      title: "Matrix Operations",
      description:
        "Work with matrices, linear algebra, and numerical computations",
    },
  ];

  const codeExamples = [
    {
      title: "Basic Matrix Operations",
      code: `% Create matrices
A = [1 2; 3 4];
B = [5 6; 7 8];

% Matrix multiplication
C = A * B;

% Display result
disp('Result of A * B:');
disp(C);`,
      description: "Basic matrix creation and multiplication",
    },
    {
      title: "Simple Plot",
      code: `% Create data
x = 0:0.1:2*pi;
y = sin(x);

% Create plot
plot(x, y);
title('Sine Wave');
xlabel('x');
ylabel('sin(x)');
grid on;`,
      description: "Creating a simple sine wave plot",
    },
    {
      title: "Function Definition",
      code: `function result = quadratic(a, b, c, x)
    % Calculate quadratic function
    result = a*x.^2 + b*x + c;
end

% Usage example
x_values = -5:0.1:5;
y_values = quadratic(1, -2, 1, x_values);`,
      description: "Defining and using a custom function",
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
        <h1 className="text-4xl font-bold text-foreground mb-4">
          MATLAB Guide
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Learn MATLAB programming for mathematical computing, data analysis,
          and algorithm development. Perfect for engineering, scientific
          computing, and mathematical modeling.
        </p>
      </div>

      {/* Code Examples */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-foreground mb-6">
          Code Examples
        </h2>
        <div className="space-y-6">
          {codeExamples.map((example, index) => (
            <div
              key={index}
              className="bg-card border rounded-lg overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b bg-muted/50">
                <h3 className="font-medium text-foreground">{example.title}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(example.code)}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
                    title="Copy code"
                  >
                    <Code className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <pre className="bg-background rounded-md p-4 overflow-x-auto text-sm font-mono border">
                  <code>{example.code}</code>
                </pre>

                <p className="text-sm text-muted-foreground mt-3">
                  {example.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Sections */}
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

      {/* Interactive Console Preview */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Terminal className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">
            Interactive MATLAB Console
          </h2>
        </div>

        <p className="text-muted-foreground mb-6">
          An interactive MATLAB console simulator will be available here in
          future updates. You'll be able to run basic MATLAB commands and see
          the results instantly.
        </p>

        <div className="bg-black rounded-lg p-6 font-mono text-sm">
          <div className="text-green-400 mb-2">MATLAB Console Simulator</div>
          <div className="text-gray-400 mb-4">
            {">> % Interactive console coming soon..."}
          </div>
          <div className="flex items-center">
            <span className="text-green-400">{">> "}</span>
            <span className="text-gray-500 ml-2">Ready for input...</span>
            <span className="animate-pulse text-green-400 ml-1">|</span>
          </div>
        </div>
      </div>
    </div>
  );
}
