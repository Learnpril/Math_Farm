// React 19 - no need to import React
import { useState, useRef } from 'react';
import { Link } from 'wouter';
import {
  ArrowLeft,
  Terminal,
  Code,
  BookOpen,
  Play,
  Copy,
  Check,
  Search,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../../components/ui/accordion';
import { Badge } from '../../../components/ui/badge';

export function MATLABGuidePage() {
  const [consoleInput, setConsoleInput] = useState('');
  const [consoleHistory, setConsoleHistory] = useState<
    Array<{
      input: string;
      output: string;
      type: 'command' | 'result' | 'error';
    }>
  >([
    {
      input: '% Welcome to MATLAB Console Simulator',
      output: '',
      type: 'command',
    },
    {
      input: '% Type MATLAB commands below to see simulated results',
      output: '',
      type: 'command',
    },
    {
      input: 'version',
      output: 'MATLAB Version 9.14.0.2206163 (R2023a)',
      type: 'result',
    },
  ]);
  const [copiedExample, setCopiedExample] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const consoleRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Comprehensive MATLAB examples database
  const codeExamplesDatabase = [
    // Getting Started
    {
      category: 'getting-started',
      title: 'Basic Variables',
      code: `% Creating variables
x = 5;
y = 10;
z = x + y;
disp(['The sum is: ', num2str(z)]);`,
      description: 'Creating and using basic variables',
      tags: ['variables', 'basic', 'assignment'],
    },
    {
      category: 'getting-started',
      title: 'Workspace Commands',
      code: `% Workspace management
who          % List variables
whos         % Detailed variable info
clear x      % Clear specific variable
clear all    % Clear all variables
clc          % Clear command window`,
      description: 'Essential workspace management commands',
      tags: ['workspace', 'clear', 'management'],
    },
    {
      category: 'getting-started',
      title: 'Help System',
      code: `% Getting help
help sin     % Help for sine function
doc plot     % Documentation for plot
lookfor plot % Search for functions`,
      description: "Using MATLAB's built-in help system",
      tags: ['help', 'documentation', 'search'],
    },

    // Syntax
    {
      category: 'syntax',
      title: 'Data Types',
      code: `% Different data types
num = 42;              % Double (default)
str = 'Hello World';   % Character array
logical_val = true;    % Logical
complex_num = 3 + 4i;  % Complex number

% Display types
class(num)
class(str)`,
      description: 'Working with different MATLAB data types',
      tags: ['data types', 'variables', 'class'],
    },
    {
      category: 'syntax',
      title: 'Arrays and Indexing',
      code: `% Creating arrays
arr = [1, 2, 3, 4, 5];
matrix = [1 2 3; 4 5 6; 7 8 9];

% Indexing (1-based)
first_element = arr(1);
last_element = arr(end);
subarray = arr(2:4);
matrix_element = matrix(2, 3);`,
      description: 'Array creation and indexing fundamentals',
      tags: ['arrays', 'indexing', 'matrix'],
    },
    {
      category: 'syntax',
      title: 'Control Structures',
      code: `% If-else statement
x = 10;
if x > 5
    disp('x is greater than 5');
elseif x == 5
    disp('x equals 5');
else
    disp('x is less than 5');
end

% For loop
for i = 1:5
    fprintf('Iteration %d\\n', i);
end`,
      description: 'Control flow with if-else and loops',
      tags: ['control', 'if', 'for', 'loop'],
    },

    // Matrices
    {
      category: 'matrices',
      title: 'Matrix Creation',
      code: `% Different ways to create matrices
A = [1 2 3; 4 5 6; 7 8 9];     % Manual entry
B = zeros(3, 3);                % Zero matrix
C = ones(2, 4);                 % Ones matrix
D = eye(3);                     % Identity matrix
E = rand(2, 3);                 % Random matrix
F = linspace(0, 10, 5);         % Linear spacing`,
      description: 'Various methods for creating matrices',
      tags: ['matrix', 'creation', 'zeros', 'ones', 'eye'],
    },
    {
      category: 'matrices',
      title: 'Matrix Operations',
      code: `% Matrix operations
A = [1 2; 3 4];
B = [5 6; 7 8];

% Basic operations
C = A + B;        % Addition
D = A - B;        % Subtraction
E = A * B;        % Matrix multiplication
F = A .* B;       % Element-wise multiplication
G = A';           % Transpose
H = inv(A);       % Inverse`,
      description: 'Essential matrix operations and arithmetic',
      tags: ['matrix', 'operations', 'multiplication', 'transpose'],
    },
    {
      category: 'matrices',
      title: 'Linear Algebra',
      code: `% Linear algebra operations
A = [1 2 3; 4 5 6; 7 8 10];
b = [1; 2; 3];

% Solve linear system Ax = b
x = A \\ b;              % Left division
x_alt = inv(A) * b;     % Alternative method

% Eigenvalues and eigenvectors
[V, D] = eig(A);

% Matrix properties
det_A = det(A);         % Determinant
rank_A = rank(A);       % Rank`,
      description: 'Linear algebra computations and system solving',
      tags: ['linear algebra', 'solve', 'eigenvalues', 'determinant'],
    },

    // Plotting
    {
      category: 'plotting',
      title: 'Basic 2D Plots',
      code: `% Basic plotting
x = 0:0.1:2*pi;
y1 = sin(x);
y2 = cos(x);

% Create plot
figure;
plot(x, y1, 'b-', x, y2, 'r--');
title('Sine and Cosine Functions');
xlabel('x (radians)');
ylabel('y');
legend('sin(x)', 'cos(x)');
grid on;`,
      description: 'Creating basic 2D line plots with customization',
      tags: ['plot', '2D', 'sine', 'cosine', 'legend'],
    },
    {
      category: 'plotting',
      title: 'Multiple Plot Types',
      code: `% Different plot types
x = 1:10;
y = x.^2;

% Subplot example
figure;
subplot(2, 2, 1); plot(x, y); title('Line Plot');
subplot(2, 2, 2); bar(x, y); title('Bar Plot');
subplot(2, 2, 3); scatter(x, y); title('Scatter Plot');
subplot(2, 2, 4); stem(x, y); title('Stem Plot');`,
      description: 'Various plot types using subplots',
      tags: ['subplot', 'bar', 'scatter', 'stem', 'plot types'],
    },
    {
      category: 'plotting',
      title: '3D Plotting',
      code: `% 3D surface plot
[X, Y] = meshgrid(-2:0.1:2, -2:0.1:2);
Z = X.^2 + Y.^2;

figure;
surf(X, Y, Z);
title('3D Surface Plot');
xlabel('X'); ylabel('Y'); zlabel('Z');
colorbar;

% 3D line plot
t = 0:0.1:4*pi;
x = cos(t); y = sin(t); z = t;
figure; plot3(x, y, z);`,
      description: 'Creating 3D surface and line plots',
      tags: ['3D', 'surface', 'meshgrid', 'plot3'],
    },

    // Functions
    {
      category: 'syntax',
      title: 'Function Definition',
      code: `function [result1, result2] = myFunction(input1, input2)
    % MYFUNCTION - Example function with multiple outputs
    % Inputs: input1, input2 - numeric values
    % Outputs: result1 - sum, result2 - product
    
    result1 = input1 + input2;
    result2 = input1 * input2;
    
    % Display results
    fprintf('Sum: %.2f, Product: %.2f\\n', result1, result2);
end

% Usage
[sum_val, prod_val] = myFunction(5, 3);`,
      description: 'Creating functions with multiple inputs and outputs',
      tags: ['function', 'multiple outputs', 'documentation'],
    },
    {
      category: 'syntax',
      title: 'Anonymous Functions',
      code: `% Anonymous functions
square = @(x) x.^2;
add = @(a, b) a + b;
quadratic = @(a, b, c, x) a*x.^2 + b*x + c;

% Usage
result1 = square(5);
result2 = add(3, 7);
x_vals = -2:0.1:2;
y_vals = quadratic(1, -2, 1, x_vals);

% Plot the quadratic
plot(x_vals, y_vals);`,
      description: 'Creating and using anonymous functions',
      tags: ['anonymous', 'function', 'lambda', 'inline'],
    },
  ];

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'MATLAB basics, workspace, and command window fundamentals',
      content: {
        overview:
          'MATLAB is a powerful numerical computing environment. Learn the basics of the workspace, command window, and fundamental operations.',
        keyPoints: [
          'MATLAB uses 1-based indexing (arrays start at 1)',
          'Semicolon (;) suppresses output display',
          'Use % for comments',
          'Variables are case-sensitive',
          'The workspace stores all your variables',
        ],
      },
    },
    {
      id: 'syntax',
      title: 'MATLAB Syntax',
      description: 'Variables, operators, functions, and control structures',
      content: {
        overview:
          "Master MATLAB's syntax including variable assignment, operators, control structures, and function definitions.",
        keyPoints: [
          'No need to declare variable types',
          'Use .* for element-wise operations',
          'Control structures: if, for, while',
          'Functions can return multiple values',
          'Anonymous functions: @(x) x^2',
        ],
      },
    },
    {
      id: 'matrices',
      title: 'Matrix Operations',
      description:
        'Work with matrices, linear algebra, and numerical computations',
      content: {
        overview:
          'MATLAB excels at matrix operations. Learn to create, manipulate, and perform computations with matrices efficiently.',
        keyPoints: [
          'Matrices are fundamental data structures',
          'Use [] to create matrices',
          '* for matrix multiplication, .* for element-wise',
          'Built-in functions: inv(), det(), eig()',
          'Solve linear systems with \\ operator',
        ],
      },
    },
    {
      id: 'plotting',
      title: 'Plotting & Visualization',
      description:
        'Create 2D and 3D plots, customize graphics, and data visualization',
      content: {
        overview:
          'MATLAB provides powerful plotting capabilities for data visualization, from simple 2D plots to complex 3D surfaces.',
        keyPoints: [
          'plot() for 2D line plots',
          'subplot() for multiple plots',
          'Customize with title(), xlabel(), legend()',
          '3D plots: plot3(), surf(), mesh()',
          'Save plots with saveas() or print()',
        ],
      },
    },
  ];

  // Filter examples based on search
  const filteredExamples = codeExamplesDatabase.filter(
    example =>
      example.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      example.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      example.tags.some(tag =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      example.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Simple MATLAB command simulator
  const simulateCommand = (command: string): string => {
    const cmd = command.trim().toLowerCase();

    // Basic arithmetic
    if (cmd.match(/^\d+\s*[\+\-\*\/]\s*\d+$/)) {
      try {
        const result = eval(cmd.replace(/\*/g, '*'));
        return `ans = ${result}`;
      } catch {
        return 'Error in expression';
      }
    }

    // Common MATLAB commands
    const responses: Record<string, string> = {
      version: 'MATLAB Version 9.14.0.2206163 (R2023a)',
      who: 'Your variables are: x y z',
      whos: 'Name    Size    Bytes  Class     Attributes\n  x     1x1        8  double\n  y     1x1        8  double',
      clc: 'Command window cleared',
      clear: 'Workspace cleared',
      pwd: '/Users/matlab/Documents',
      pi: 'ans = 3.1416',
      ans: 'ans = [previous result]',
      'help plot':
        'PLOT Linear plot.\n    PLOT(X,Y) plots vector Y versus vector X.',
      date: new Date().toLocaleDateString(),
      clock: `ans = [${new Date().getFullYear()} ${
        new Date().getMonth() + 1
      } ${new Date().getDate()} ${new Date().getHours()} ${new Date().getMinutes()} ${new Date().getSeconds()}]`,
    };

    // Matrix operations
    if (cmd.includes('eye(')) {
      const match = cmd.match(/eye\((\d+)\)/);
      if (match) {
        const size = parseInt(match[1]);
        return `ans = ${size}×${size} identity matrix`;
      }
    }

    if (cmd.includes('zeros(')) {
      const match = cmd.match(/zeros\((\d+),?\s*(\d+)?\)/);
      if (match) {
        const rows = parseInt(match[1]);
        const cols = match[2] ? parseInt(match[2]) : rows;
        return `ans = ${rows}×${cols} matrix of zeros`;
      }
    }

    if (cmd.includes('ones(')) {
      const match = cmd.match(/ones\((\d+),?\s*(\d+)?\)/);
      if (match) {
        const rows = parseInt(match[1]);
        const cols = match[2] ? parseInt(match[2]) : rows;
        return `ans = ${rows}×${cols} matrix of ones`;
      }
    }

    // Variable assignments
    if (cmd.includes('=') && !cmd.includes('==')) {
      const varName = cmd.split('=')[0].trim();
      return `${varName} assigned`;
    }

    return responses[cmd] || `Simulated result for: ${command}`;
  };

  const executeCommand = () => {
    if (!consoleInput.trim()) return;

    const output = simulateCommand(consoleInput);
    const newEntry = {
      input: consoleInput,
      output: output,
      type: output.startsWith('Error')
        ? ('error' as const)
        : ('result' as const),
    };

    setConsoleHistory(prev => [...prev, newEntry]);
    setConsoleInput('');

    // Scroll to bottom
    setTimeout(() => {
      if (consoleRef.current) {
        consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
      }
    }, 100);
  };

  const copyToClipboard = async (text: string, exampleTitle: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedExample(exampleTitle);
      setTimeout(() => setCopiedExample(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const insertIntoConsole = (code: string) => {
    // Take first meaningful line of code
    const lines = code
      .split('\n')
      .filter(line => line.trim() && !line.trim().startsWith('%'));
    if (lines.length > 0) {
      setConsoleInput(lines[0].trim());
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Back Navigation */}
      <div className='mb-6'>
        <Link
          href='/'
          className='inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md'
        >
          <ArrowLeft className='w-4 h-4' />
          Back to Home
        </Link>
      </div>

      {/* Page Header */}
      <div className='mb-8'>
        <h1
          className='text-4xl font-bold text-foreground mb-4'
          data-testid='matlab-guide-heading'
        >
          MATLAB Guide
        </h1>
        <p
          className='text-lg text-muted-foreground max-w-2xl'
          data-testid='matlab-guide-description'
        >
          Learn MATLAB programming for mathematical computing, data analysis,
          and algorithm development. Perfect for engineering, scientific
          computing, and mathematical modeling.
        </p>
      </div>

      {/* Interactive MATLAB Console */}
      <div className='mb-12'>
        <div className='bg-card border rounded-lg overflow-hidden'>
          <div className='flex items-center gap-2 p-4 border-b bg-muted/50'>
            <Terminal className='w-5 h-5 text-primary' />
            <h2
              className='text-xl font-semibold text-foreground'
              data-testid='matlab-console-heading'
            >
              Interactive MATLAB Console Simulator
            </h2>
          </div>

          <div className='bg-gray-900 text-green-400 font-mono text-sm'>
            {/* Console History */}
            <div
              ref={consoleRef}
              className='h-64 overflow-y-auto p-4 space-y-1'
            >
              {consoleHistory.map((entry, index) => (
                <div key={index}>
                  {entry.input && (
                    <div className='flex'>
                      <span className='text-yellow-400 mr-2'>{'>> '}</span>
                      <span
                        className={
                          entry.type === 'command'
                            ? 'text-gray-400'
                            : 'text-green-400'
                        }
                      >
                        {entry.input}
                      </span>
                    </div>
                  )}
                  {entry.output && (
                    <div
                      className={`ml-4 ${
                        entry.type === 'error'
                          ? 'text-red-400'
                          : 'text-blue-300'
                      }`}
                    >
                      {entry.output}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input Line */}
            <div className='border-t border-gray-700 p-4'>
              <div className='flex items-center'>
                <span className='text-yellow-400 mr-2'>{'>> '}</span>
                <input
                  ref={inputRef}
                  type='text'
                  value={consoleInput}
                  onChange={e => setConsoleInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && executeCommand()}
                  className='flex-1 bg-transparent text-green-400 outline-none'
                  placeholder='Enter MATLAB command...'
                />
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={executeCommand}
                  className='ml-2 h-6 text-green-400 hover:text-green-300'
                >
                  <Play className='w-3 h-3' />
                </Button>
              </div>
              <div className='text-xs text-gray-500 mt-2'>
                Try: version, who, pi, 2+3, eye(3), zeros(2,3), help plot
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Searchable Code Examples Database */}
      <div className='mb-12'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-semibold text-foreground'>
            Code Examples Database
          </h2>
          <div className='relative'>
            <Search className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground' />
            <input
              type='text'
              placeholder='Search examples...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='pl-10 pr-4 py-2 bg-background border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
            />
          </div>
        </div>

        {/* Examples Grid */}
        <div className='space-y-6'>
          {filteredExamples.map((example, index) => (
            <div
              key={index}
              className='bg-card border rounded-lg overflow-hidden hover:bg-muted/50 transition-colors'
            >
              <div className='flex items-center justify-between p-4 border-b bg-muted/50'>
                <div className='flex-1'>
                  <h3 className='font-medium text-foreground mb-1'>
                    {example.title}
                  </h3>
                  <div className='flex flex-wrap gap-1'>
                    {example.tags.slice(0, 3).map((tag, tagIndex) => (
                      <Badge
                        key={tagIndex}
                        variant='secondary'
                        className='text-xs'
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => insertIntoConsole(example.code)}
                    className='h-8'
                    title='Try in console'
                  >
                    <Play className='w-3 h-3' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => copyToClipboard(example.code, example.title)}
                    className='h-8'
                    title='Copy code'
                  >
                    {copiedExample === example.title ? (
                      <Check className='w-3 h-3 text-green-600' />
                    ) : (
                      <Copy className='w-3 h-3' />
                    )}
                  </Button>
                </div>
              </div>

              <div className='p-4'>
                <pre className='bg-gray-900 text-green-400 rounded-md p-4 overflow-x-auto text-sm font-mono border'>
                  <code>{example.code}</code>
                </pre>

                <p className='text-sm text-muted-foreground mt-3'>
                  {example.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {filteredExamples.length === 0 && (
          <div className='text-center py-12'>
            <Search className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
            <p className='text-muted-foreground'>
              No examples found matching "{searchQuery}"
            </p>
          </div>
        )}
      </div>

      {/* Structured Learning Sections */}
      <div className='mb-12'>
        <h2 className='text-2xl font-semibold text-foreground mb-6'>
          Step-by-Step Learning Sections
        </h2>

        <Accordion type='single' className='space-y-4'>
          {sections.map(section => (
            <AccordionItem
              key={section.id}
              value={section.id}
              className='bg-card border rounded-lg'
            >
              <AccordionTrigger className='px-6 py-4 hover:no-underline'>
                <div className='flex items-center gap-4 text-left'>
                  <div className='flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center'>
                    <BookOpen className='w-5 h-5 text-primary' />
                  </div>
                  <div>
                    <h3 className='font-semibold text-foreground mb-1'>
                      {section.title}
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      {section.description}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className='px-6 pb-6'>
                <div className='space-y-4'>
                  <p className='text-muted-foreground'>
                    {section.content.overview}
                  </p>

                  <div>
                    <h4 className='font-medium text-foreground mb-2'>
                      Key Concepts:
                    </h4>
                    <ul className='space-y-1'>
                      {section.content.keyPoints.map((point, index) => (
                        <li
                          key={index}
                          className='text-sm text-muted-foreground flex items-start gap-2'
                        >
                          <span className='w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0'></span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className='pt-4'>
                    <h4 className='font-medium text-foreground mb-3'>
                      Related Examples:
                    </h4>
                    <div className='grid gap-2 sm:grid-cols-2'>
                      {codeExamplesDatabase
                        .filter(ex => ex.category === section.id)
                        .slice(0, 4)
                        .map((example, index) => (
                          <Button
                            key={index}
                            variant='outline'
                            size='sm'
                            onClick={() => insertIntoConsole(example.code)}
                            className='justify-start h-auto p-3 text-left'
                          >
                            <div>
                              <div className='font-medium text-xs'>
                                {example.title}
                              </div>
                              <div className='font-mono text-xs text-muted-foreground mt-1'>
                                {example.code.split('\n')[0].length > 30
                                  ? example.code
                                      .split('\n')[0]
                                      .substring(0, 30) + '...'
                                  : example.code.split('\n')[0]}
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

      {/* Quick Reference */}
      <div className='bg-card border rounded-lg p-6'>
        <h2 className='text-xl font-semibold text-foreground mb-4'>
          Quick Reference
        </h2>
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm'>
          <div>
            <h4 className='font-medium text-foreground mb-2'>
              Basic Operations
            </h4>
            <ul className='space-y-1 text-muted-foreground font-mono'>
              <li>+ - * / ^</li>
              <li>.* ./ .^</li>
              <li>= assignment</li>
              <li>== comparison</li>
            </ul>
          </div>
          <div>
            <h4 className='font-medium text-foreground mb-2'>
              Matrix Functions
            </h4>
            <ul className='space-y-1 text-muted-foreground font-mono'>
              <li>zeros(), ones(), eye()</li>
              <li>size(), length()</li>
              <li>inv(), det(), rank()</li>
              <li>eig(), svd()</li>
            </ul>
          </div>
          <div>
            <h4 className='font-medium text-foreground mb-2'>Plotting</h4>
            <ul className='space-y-1 text-muted-foreground font-mono'>
              <li>plot(), subplot()</li>
              <li>title(), xlabel()</li>
              <li>legend(), grid()</li>
              <li>surf(), mesh()</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
