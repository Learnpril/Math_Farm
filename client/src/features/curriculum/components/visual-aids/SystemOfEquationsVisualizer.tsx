import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Badge } from '../../../../components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../components/ui/tabs';
import { RotateCcw, Eye, EyeOff } from 'lucide-react';

interface SystemOfEquationsVisualizerProps {
  className?: string;
}

interface SystemEquation {
  a: number;
  b: number;
  c: number;
}

export function SystemOfEquationsVisualizer({
  className = '',
}: SystemOfEquationsVisualizerProps) {
  const [eq1, setEq1] = useState<SystemEquation>({ a: 1, b: 1, c: 7 });
  const [eq2, setEq2] = useState<SystemEquation>({ a: 2, b: -1, c: 5 });
  const [method, setMethod] = useState<
    'substitution' | 'elimination' | 'graphical'
  >('substitution');
  const [showSteps, setShowSteps] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Calculate solution
  const solution = useMemo(() => {
    const { a: a1, b: b1, c: c1 } = eq1;
    const { a: a2, b: b2, c: c2 } = eq2;

    const determinant = a1 * b2 - a2 * b1;

    if (Math.abs(determinant) < 0.0001) {
      return { x: null, y: null, type: 'no-unique-solution' };
    }

    const x = (c1 * b2 - c2 * b1) / determinant;
    const y = (a1 * c2 - a2 * c1) / determinant;

    return {
      x: Math.round(x * 1000) / 1000,
      y: Math.round(y * 1000) / 1000,
      type: 'unique',
    };
  }, [eq1, eq2]);

  // Generate substitution steps
  const getSubstitutionSteps = () => {
    const { a: a1, b: b1, c: c1 } = eq1;
    const { a: a2, b: b2, c: c2 } = eq2;

    const steps = [
      {
        title: 'Original System',
        content: [
          `${a1}x ${b1 >= 0 ? '+' : ''}${b1}y = ${c1}`,
          `${a2}x ${b2 >= 0 ? '+' : ''}${b2}y = ${c2}`,
        ],
        explanation: 'Start with the given system of equations',
      },
    ];

    // Solve first equation for x or y (choose easier one)
    if (Math.abs(b1) === 1) {
      const sign = b1 > 0 ? '-' : '+';
      const coeff = Math.abs(a1);
      steps.push({
        title: 'Solve first equation for y',
        content: [
          `${b1}y = ${c1} ${a1 >= 0 ? '-' : '+'} ${coeff}x`,
          `y = ${c1} ${a1 >= 0 ? '-' : '+'} ${coeff}x`,
        ],
        explanation: 'Isolate y in the first equation',
      });
    } else if (Math.abs(a1) === 1) {
      const sign = a1 > 0 ? '-' : '+';
      const coeff = Math.abs(b1);
      steps.push({
        title: 'Solve first equation for x',
        content: [
          `${a1}x = ${c1} ${b1 >= 0 ? '-' : '+'} ${coeff}y`,
          `x = ${c1} ${b1 >= 0 ? '-' : '+'} ${coeff}y`,
        ],
        explanation: 'Isolate x in the first equation',
      });
    }

    if (solution.x !== null && solution.y !== null) {
      steps.push({
        title: 'Substitute and solve',
        content: [
          'Substitute into second equation',
          `x = ${solution.x}, y = ${solution.y}`,
        ],
        explanation:
          'Substitute the expression and solve for the remaining variable',
      });

      steps.push({
        title: 'Solution',
        content: [`x = ${solution.x}`, `y = ${solution.y}`],
        explanation: 'The solution to the system',
      });
    }

    return steps;
  };

  // Generate elimination steps
  const getEliminationSteps = () => {
    const { a: a1, b: b1, c: c1 } = eq1;
    const { a: a2, b: b2, c: c2 } = eq2;

    const steps = [
      {
        title: 'Original System',
        content: [
          `${a1}x ${b1 >= 0 ? '+' : ''}${b1}y = ${c1}`,
          `${a2}x ${b2 >= 0 ? '+' : ''}${b2}y = ${c2}`,
        ],
        explanation: 'Start with the given system of equations',
      },
    ];

    // Check if we can eliminate directly
    if (b1 === -b2) {
      steps.push({
        title: 'Add equations to eliminate y',
        content: [
          `(${a1}x ${b1 >= 0 ? '+' : ''}${b1}y) + (${a2}x ${b2 >= 0 ? '+' : ''}${b2}y) = ${c1} + ${c2}`,
          `${a1 + a2}x = ${c1 + c2}`,
        ],
        explanation: 'The y-coefficients are opposites, so adding eliminates y',
      });
    } else if (a1 === -a2) {
      steps.push({
        title: 'Add equations to eliminate x',
        content: [
          `(${a1}x ${b1 >= 0 ? '+' : ''}${b1}y) + (${a2}x ${b2 >= 0 ? '+' : ''}${b2}y) = ${c1} + ${c2}`,
          `${b1 + b2}y = ${c1 + c2}`,
        ],
        explanation: 'The x-coefficients are opposites, so adding eliminates x',
      });
    } else {
      // Need to multiply equations
      steps.push({
        title: 'Multiply equations to create opposites',
        content: [
          `Multiply first equation by ${b2}, second by ${-b1}`,
          `${a1 * b2}x ${b1 * b2 >= 0 ? '+' : ''}${b1 * b2}y = ${c1 * b2}`,
          `${a2 * -b1}x ${b2 * -b1 >= 0 ? '+' : ''}${b2 * -b1}y = ${c2 * -b1}`,
        ],
        explanation: 'Create opposite coefficients for one variable',
      });
    }

    if (solution.x !== null && solution.y !== null) {
      steps.push({
        title: 'Solution',
        content: [`x = ${solution.x}`, `y = ${solution.y}`],
        explanation: 'The solution to the system',
      });
    }

    return steps;
  };

  const steps =
    method === 'substitution' ? getSubstitutionSteps() : getEliminationSteps();

  const formatEquation = (eq: SystemEquation) => {
    const { a, b, c } = eq;
    return `${a}x ${b >= 0 ? '+' : ''}${b}y = ${c}`;
  };

  const generateNewSystem = () => {
    setEq1({
      a: Math.floor(Math.random() * 5) + 1,
      b: Math.floor(Math.random() * 5) + 1,
      c: Math.floor(Math.random() * 20) + 5,
    });
    setEq2({
      a: Math.floor(Math.random() * 5) + 1,
      b: Math.floor(Math.random() * 5) + 1,
      c: Math.floor(Math.random() * 20) + 5,
    });
    setCurrentStep(0);
    setShowSteps(false);
  };

  const reset = () => {
    setCurrentStep(0);
    setShowSteps(false);
  };

  return (
    <Card className={`w-full max-w-4xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <span>System of Equations Visualizer</span>
          <div className='flex gap-2'>
            <Button onClick={generateNewSystem} variant='outline' size='sm'>
              New System
            </Button>
            <Button onClick={reset} variant='outline' size='sm'>
              <RotateCcw className='h-4 w-4' />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* System Display */}
        <div className='bg-muted/50 p-6 rounded-lg'>
          <div className='text-center'>
            <div className='text-xl font-mono mb-4'>
              <div>{formatEquation(eq1)}</div>
              <div>{formatEquation(eq2)}</div>
            </div>
            {solution.x !== null && solution.y !== null ? (
              <Badge variant='default' className='text-lg px-4 py-2'>
                Solution: x = {solution.x}, y = {solution.y}
              </Badge>
            ) : (
              <Badge variant='destructive'>No unique solution</Badge>
            )}
          </div>
        </div>

        {/* Method Selection */}
        <Tabs value={method} onValueChange={value => setMethod(value as any)}>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='substitution'>Substitution</TabsTrigger>
            <TabsTrigger value='elimination'>Elimination</TabsTrigger>
            <TabsTrigger value='graphical'>Graphical</TabsTrigger>
          </TabsList>

          <TabsContent value='substitution' className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h4 className='font-medium'>Substitution Method</h4>
              <Button
                onClick={() => setShowSteps(!showSteps)}
                variant='outline'
                size='sm'
              >
                {showSteps ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
                {showSteps ? 'Hide' : 'Show'} Steps
              </Button>
            </div>

            {showSteps && (
              <div className='space-y-4'>
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      index === currentStep
                        ? 'border-primary bg-primary/5'
                        : 'border-muted'
                    }`}
                  >
                    <div className='flex items-center gap-2 mb-2'>
                      <Badge
                        variant={index <= currentStep ? 'default' : 'outline'}
                      >
                        {index + 1}
                      </Badge>
                      <h5 className='font-medium'>{step.title}</h5>
                    </div>
                    <div className='font-mono text-sm space-y-1 mb-2'>
                      {step.content.map((line, lineIndex) => (
                        <div key={lineIndex}>{line}</div>
                      ))}
                    </div>
                    <p className='text-sm text-muted-foreground'>
                      {step.explanation}
                    </p>
                  </div>
                ))}

                <div className='flex justify-center gap-4'>
                  <Button
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    variant='outline'
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() =>
                      setCurrentStep(
                        Math.min(steps.length - 1, currentStep + 1)
                      )
                    }
                    disabled={currentStep === steps.length - 1}
                    variant='outline'
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value='elimination' className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h4 className='font-medium'>Elimination Method</h4>
              <Button
                onClick={() => setShowSteps(!showSteps)}
                variant='outline'
                size='sm'
              >
                {showSteps ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
                {showSteps ? 'Hide' : 'Show'} Steps
              </Button>
            </div>

            {showSteps && (
              <div className='space-y-4'>
                {getEliminationSteps().map((step, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      index === currentStep
                        ? 'border-primary bg-primary/5'
                        : 'border-muted'
                    }`}
                  >
                    <div className='flex items-center gap-2 mb-2'>
                      <Badge
                        variant={index <= currentStep ? 'default' : 'outline'}
                      >
                        {index + 1}
                      </Badge>
                      <h5 className='font-medium'>{step.title}</h5>
                    </div>
                    <div className='font-mono text-sm space-y-1 mb-2'>
                      {step.content.map((line, lineIndex) => (
                        <div key={lineIndex}>{line}</div>
                      ))}
                    </div>
                    <p className='text-sm text-muted-foreground'>
                      {step.explanation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value='graphical' className='space-y-4'>
            <div className='text-center p-8 bg-muted/30 rounded-lg'>
              <p className='text-muted-foreground'>
                Graphical method visualization coming soon!
              </p>
              <p className='text-sm text-muted-foreground mt-2'>
                This will show the intersection of two lines representing the
                equations.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Custom System Input */}
        <div className='border-t pt-4'>
          <h4 className='font-medium mb-3'>Customize System:</h4>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>First Equation:</label>
              <div className='flex items-center gap-2'>
                <Input
                  type='number'
                  value={eq1.a}
                  onChange={e =>
                    setEq1({ ...eq1, a: parseInt(e.target.value) || 1 })
                  }
                  className='w-16'
                />
                <span>x +</span>
                <Input
                  type='number'
                  value={eq1.b}
                  onChange={e =>
                    setEq1({ ...eq1, b: parseInt(e.target.value) || 1 })
                  }
                  className='w-16'
                />
                <span>y =</span>
                <Input
                  type='number'
                  value={eq1.c}
                  onChange={e =>
                    setEq1({ ...eq1, c: parseInt(e.target.value) || 1 })
                  }
                  className='w-16'
                />
              </div>
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Second Equation:</label>
              <div className='flex items-center gap-2'>
                <Input
                  type='number'
                  value={eq2.a}
                  onChange={e =>
                    setEq2({ ...eq2, a: parseInt(e.target.value) || 1 })
                  }
                  className='w-16'
                />
                <span>x +</span>
                <Input
                  type='number'
                  value={eq2.b}
                  onChange={e =>
                    setEq2({ ...eq2, b: parseInt(e.target.value) || 1 })
                  }
                  className='w-16'
                />
                <span>y =</span>
                <Input
                  type='number'
                  value={eq2.c}
                  onChange={e =>
                    setEq2({ ...eq2, c: parseInt(e.target.value) || 1 })
                  }
                  className='w-16'
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
