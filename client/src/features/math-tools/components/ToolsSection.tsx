import React, { Suspense, useState } from 'react';
import { Link } from 'wouter';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { CalculatorDemo } from './CalculatorDemo';
import { FunctionGrapherDemo } from './FunctionGrapherDemo';
import { UnitConverterDemo } from './UnitConverterDemo';
import { EquationSolverDemo } from './EquationSolverDemo';
import LinesDrawingTool from './LinesDrawingTool';
import { ToolDemoErrorBoundary } from './ToolDemoErrorBoundary';
import { ToolErrorBoundary } from './ToolErrorBoundary';
import {
  ArrowRight,
  Calculator,
  BarChart3,
  ArrowLeftRight,
  Zap,
  Minus,
} from 'lucide-react';

export interface ToolsSectionProps {
  className?: string;
}

// Loading component for tools
const ToolLoadingFallback: React.FC<{ title: string }> = ({ title }) => (
  <Card className='w-full'>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>Loading interactive demonstration...</CardDescription>
    </CardHeader>
    <CardContent>
      <div
        className='flex items-center justify-center p-8'
        role='status'
        aria-label={`Loading ${title}`}
      >
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
        <span className='ml-2 text-muted-foreground'>Loading tool...</span>
      </div>
    </CardContent>
  </Card>
);

export const ToolsSection: React.FC<ToolsSectionProps> = ({
  className = '',
}) => {
  const [activeDemo, setActiveDemo] = useState<
    | 'calculator'
    | 'function-grapher'
    | 'unit-converter'
    | 'equation-solver'
    | 'lines-drawing'
    | null
  >(null);

  return (
    <section
      className={`py-16 px-4 ${className}`}
      aria-labelledby='tools-section-title'
    >
      <div className='container mx-auto max-w-6xl'>
        {/* Section Header */}
        <div className='text-center mb-12'>
          <h2
            id='tools-section-title'
            className='text-3xl md:text-4xl font-bold text-foreground mb-4'
            data-testid='tools-section-heading'
          >
            Interactive Tools
          </h2>
          <p
            className='text-lg text-muted-foreground max-w-2xl mx-auto mb-6'
            data-testid='tools-section-description'
          >
            Experience our powerful mathematical tools with live demonstrations.
            Perform calculations, create graphs, and solve complex problems
            instantly.
          </p>
          <Link href='/tools'>
            <Button
              size='lg'
              className='group'
              aria-label='Navigate to full tools page'
            >
              Explore All Tools
              <ArrowRight className='ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform' />
            </Button>
          </Link>
        </div>

        {/* Tool Selection */}
        <div className='flex flex-wrap gap-3 mb-8 justify-center'>
          <Button
            variant={activeDemo === 'calculator' ? 'default' : 'outline'}
            onClick={() =>
              setActiveDemo(activeDemo === 'calculator' ? null : 'calculator')
            }
            className='flex items-center gap-2'
            aria-pressed={activeDemo === 'calculator'}
            aria-label='Toggle calculator demonstration'
          >
            <Calculator className='h-4 w-4' />
            Advanced Calculator
          </Button>

          <Button
            variant={activeDemo === 'function-grapher' ? 'default' : 'outline'}
            onClick={() =>
              setActiveDemo(
                activeDemo === 'function-grapher' ? null : 'function-grapher'
              )
            }
            className='flex items-center gap-2'
            aria-pressed={activeDemo === 'function-grapher'}
            aria-label='Toggle function grapher demonstration'
          >
            <BarChart3 className='h-4 w-4' />
            Function Grapher
          </Button>
          <Button
            variant={activeDemo === 'unit-converter' ? 'default' : 'outline'}
            onClick={() =>
              setActiveDemo(
                activeDemo === 'unit-converter' ? null : 'unit-converter'
              )
            }
            className='flex items-center gap-2'
            aria-pressed={activeDemo === 'unit-converter'}
            aria-label='Toggle unit converter demonstration'
          >
            <ArrowLeftRight className='h-4 w-4' />
            Unit Converter
          </Button>

          <Button
            variant={activeDemo === 'equation-solver' ? 'default' : 'outline'}
            onClick={() =>
              setActiveDemo(
                activeDemo === 'equation-solver' ? null : 'equation-solver'
              )
            }
            className='flex items-center gap-2'
            aria-pressed={activeDemo === 'equation-solver'}
            aria-label='Toggle equation solver demonstration'
          >
            <Zap className='h-4 w-4' />
            Equation Solver
          </Button>

          <Button
            variant={activeDemo === 'lines-drawing' ? 'default' : 'outline'}
            onClick={() =>
              setActiveDemo(
                activeDemo === 'lines-drawing' ? null : 'lines-drawing'
              )
            }
            className='flex items-center gap-2'
            aria-pressed={activeDemo === 'lines-drawing'}
            aria-label='Toggle lines drawing tool demonstration'
          >
            <Minus className='h-4 w-4' />
            Lines Drawing
          </Button>
        </div>

        {/* Tool Demonstrations */}
        <div className='space-y-8'>
          {/* Calculator Demo */}
          {activeDemo === 'calculator' && (
            <div
              className='animate-in slide-in-from-top-4 duration-300'
              role='region'
              aria-labelledby='calculator-demo-title'
            >
              <ToolDemoErrorBoundary
                toolName='Advanced Calculator'
                showErrorDetails={process.env.NODE_ENV === 'development'}
              >
                <Suspense
                  fallback={<ToolLoadingFallback title='Advanced Calculator' />}
                >
                  <ToolErrorBoundary toolName='Advanced Calculator'>
                    <CalculatorDemo />
                  </ToolErrorBoundary>
                </Suspense>
              </ToolDemoErrorBoundary>
            </div>
          )}

          {/* Function Grapher Demo */}
          {activeDemo === 'function-grapher' && (
            <div
              className='animate-in slide-in-from-top-4 duration-300'
              role='region'
              aria-labelledby='function-grapher-demo-title'
            >
              <ToolDemoErrorBoundary
                toolName='Function Grapher'
                showErrorDetails={process.env.NODE_ENV === 'development'}
              >
                <Suspense
                  fallback={<ToolLoadingFallback title='Function Grapher' />}
                >
                  <ToolErrorBoundary toolName='Function Grapher'>
                    <FunctionGrapherDemo />
                  </ToolErrorBoundary>
                </Suspense>
              </ToolDemoErrorBoundary>
            </div>
          )}

          {/* Unit Converter Demo */}
          {activeDemo === 'unit-converter' && (
            <div
              className='animate-in slide-in-from-top-4 duration-300'
              role='region'
              aria-labelledby='unit-converter-demo-title'
            >
              <ToolDemoErrorBoundary
                toolName='Unit Converter'
                showErrorDetails={process.env.NODE_ENV === 'development'}
              >
                <Suspense
                  fallback={<ToolLoadingFallback title='Unit Converter' />}
                >
                  <ToolErrorBoundary toolName='Unit Converter'>
                    <UnitConverterDemo />
                  </ToolErrorBoundary>
                </Suspense>
              </ToolDemoErrorBoundary>
            </div>
          )}

          {/* Equation Solver Demo */}
          {activeDemo === 'equation-solver' && (
            <div
              className='animate-in slide-in-from-top-4 duration-300'
              role='region'
              aria-labelledby='equation-solver-demo-title'
            >
              <ToolDemoErrorBoundary
                toolName='Equation Solver'
                showErrorDetails={process.env.NODE_ENV === 'development'}
              >
                <Suspense
                  fallback={<ToolLoadingFallback title='Equation Solver' />}
                >
                  <ToolErrorBoundary toolName='Equation Solver'>
                    <EquationSolverDemo />
                  </ToolErrorBoundary>
                </Suspense>
              </ToolDemoErrorBoundary>
            </div>
          )}

          {/* Lines Drawing Tool Demo */}
          {activeDemo === 'lines-drawing' && (
            <div
              className='animate-in slide-in-from-top-4 duration-300'
              role='region'
              aria-labelledby='lines-drawing-demo-title'
            >
              <ToolDemoErrorBoundary
                toolName='Lines Drawing Tool'
                showErrorDetails={process.env.NODE_ENV === 'development'}
              >
                <Suspense
                  fallback={<ToolLoadingFallback title='Lines Drawing Tool' />}
                >
                  <ToolErrorBoundary toolName='Lines Drawing Tool'>
                    <LinesDrawingTool />
                  </ToolErrorBoundary>
                </Suspense>
              </ToolDemoErrorBoundary>
            </div>
          )}

          {/* Default state - show overview cards */}
          {!activeDemo && (
            <div className='grid md:grid-cols-2 lg:grid-cols-5 gap-6'>
              {/* Calculator Overview */}
              <Card className='cursor-pointer hover:shadow-lg transition-shadow flex flex-col h-full'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Calculator className='h-5 w-5 text-primary' />
                    Advanced Calculator
                  </CardTitle>
                  <CardDescription>
                    Perform complex mathematical calculations with support for
                    functions, constants, and advanced operations.
                  </CardDescription>
                </CardHeader>
                <CardContent className='flex-1 flex flex-col'>
                  <div className='space-y-2 text-sm text-muted-foreground mb-4 flex-1'>
                    <p>• Scientific functions (sin, cos, log, sqrt)</p>
                    <p>• Mathematical constants (π, e, φ)</p>
                    <p>• Real-time calculation results</p>
                    <p>• Calculation history tracking</p>
                  </div>
                  <Button
                    onClick={() => setActiveDemo('calculator')}
                    className='w-full mt-auto'
                    aria-label='Try calculator demonstration'
                  >
                    Try Calculator
                  </Button>
                </CardContent>
              </Card>

              {/* Function Grapher Overview */}
              <Card className='cursor-pointer hover:shadow-lg transition-shadow flex flex-col h-full'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <BarChart3 className='h-5 w-5 text-primary' />
                    Function Grapher
                  </CardTitle>
                  <CardDescription>
                    Plot and visualize multiple mathematical functions
                    simultaneously with customizable viewing ranges.
                  </CardDescription>
                </CardHeader>
                <CardContent className='flex-1 flex flex-col'>
                  <div className='space-y-2 text-sm text-muted-foreground mb-4 flex-1'>
                    <p>• Plot multiple functions at once</p>
                    <p>• Customizable X/Y axis ranges</p>
                    <p>• Function visibility controls</p>
                    <p>• Built-in function presets</p>
                  </div>
                  <Button
                    onClick={() => setActiveDemo('function-grapher')}
                    className='w-full mt-auto'
                    aria-label='Try function grapher demonstration'
                  >
                    Try Function Grapher
                  </Button>
                </CardContent>
              </Card>

              {/* Unit Converter Overview */}
              <Card className='cursor-pointer hover:shadow-lg transition-shadow flex flex-col h-full'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <ArrowLeftRight className='h-5 w-5 text-primary' />
                    Unit Converter
                  </CardTitle>
                  <CardDescription>
                    Convert between different units of measurement including
                    length, weight, temperature, and more.
                  </CardDescription>
                </CardHeader>
                <CardContent className='flex-1 flex flex-col'>
                  <div className='space-y-2 text-sm text-muted-foreground mb-4 flex-1'>
                    <p>• Length, weight, temperature units</p>
                    <p>• Real-time conversion results</p>
                    <p>• Quick conversion presets</p>
                    <p>• Precise calculation accuracy</p>
                  </div>
                  <Button
                    onClick={() => setActiveDemo('unit-converter')}
                    className='w-full mt-auto'
                    aria-label='Try unit converter demonstration'
                  >
                    Try Unit Converter
                  </Button>
                </CardContent>
              </Card>

              {/* Equation Solver Overview */}
              <Card className='cursor-pointer hover:shadow-lg transition-shadow flex flex-col h-full'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Zap className='h-5 w-5 text-primary' />
                    Equation Solver
                  </CardTitle>
                  <CardDescription>
                    Solve algebraic equations, derivatives, and integrals
                    symbolically with step-by-step solutions.
                  </CardDescription>
                </CardHeader>
                <CardContent className='flex-1 flex flex-col'>
                  <div className='space-y-2 text-sm text-muted-foreground mb-4 flex-1'>
                    <p>• Solve equations symbolically</p>
                    <p>• Find derivatives and integrals</p>
                    <p>• Simplify expressions</p>
                    <p>• Step-by-step solutions</p>
                  </div>
                  <Button
                    onClick={() => setActiveDemo('equation-solver')}
                    className='w-full mt-auto'
                    aria-label='Try equation solver demonstration'
                  >
                    Try Equation Solver
                  </Button>
                </CardContent>
              </Card>

              {/* Lines Drawing Tool Overview */}
              <Card className='cursor-pointer hover:shadow-lg transition-shadow flex flex-col h-full'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Minus className='h-5 w-5 text-primary' />
                    Lines Drawing
                  </CardTitle>
                  <CardDescription>
                    Create ASCII art and diagrams using single and double line
                    characters with an interactive drawing canvas.
                  </CardDescription>
                </CardHeader>
                <CardContent className='flex-1 flex flex-col'>
                  <div className='space-y-2 text-sm text-muted-foreground mb-4 flex-1'>
                    <p>• Single and double line types</p>
                    <p>• Interactive drawing canvas</p>
                    <p>• Export as text or download</p>
                    <p>• Perfect for ASCII diagrams</p>
                  </div>
                  <Button
                    onClick={() => setActiveDemo('lines-drawing')}
                    className='w-full mt-auto'
                    aria-label='Try lines drawing tool demonstration'
                  >
                    Try Lines Drawing
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className='text-center mt-12 p-6 bg-muted/50 rounded-lg'>
          <h3
            className='text-xl font-semibold text-foreground mb-2'
            data-testid='tools-cta-heading'
          >
            Ready for More?
          </h3>
          <p
            className='text-muted-foreground mb-4'
            data-testid='tools-cta-description'
          >
            Access our complete suite of mathematical tools including equation
            solvers, matrix calculators, and specialized utilities.
          </p>
          <Link href='/tools'>
            <Button
              variant='outline'
              size='lg'
              className='group'
              aria-label='Navigate to complete tools page'
            >
              <span data-testid='tools-cta-button-text'>View All Tools</span>
              <ArrowRight className='ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform' />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;
