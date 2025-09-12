import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import ToolDemo from './ToolDemo';
import { TrendingUp, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import {
  functionGrapher,
  loadMathJS,
  FunctionData,
  GraphBounds,
} from '../lib/math';

export interface FunctionGrapherDemoProps {
  className?: string;
}

export const FunctionGrapherDemo: React.FC<FunctionGrapherDemoProps> = ({
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [functions, setFunctions] = useState<FunctionData[]>([
    functionGrapher.createFunction('x^2', '#8b5cf6'),
    functionGrapher.createFunction('sin(x)', '#06b6d4'),
  ]);
  const [newFunction, setNewFunction] = useState('');
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [yMin, setYMin] = useState(-10);
  const [yMax, setYMax] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [mathLoaded, setMathLoaded] = useState(false);

  // Load math.js using utility
  useEffect(() => {
    const loadMathLibrary = async () => {
      try {
        const result = await loadMathJS();
        if (result.loaded) {
          setMathLoaded(true);
        }
      } catch (err) {
        console.warn('Failed to load math library:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMathLibrary();
  }, []);

  // Use utility function for evaluation
  const evaluateFunction = useCallback(
    (expression: string, x: number): number | null => {
      return functionGrapher.evaluate(expression, x);
    },
    []
  );

  // Draw the graph using utility
  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mathLoaded) return;

    const bounds: GraphBounds = { xMin, xMax, yMin, yMax };
    functionGrapher.drawGraph(canvas, functions, bounds);
  }, [functions, xMin, xMax, yMin, yMax, mathLoaded]);

  // Redraw when dependencies change
  useEffect(() => {
    drawGraph();
  }, [drawGraph]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = 400;
        drawGraph();
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [drawGraph]);

  const addFunction = () => {
    if (!newFunction.trim()) return;

    // Validate function using utility
    const validation = functionGrapher.validateFunction(newFunction);
    if (!validation.valid) {
      console.warn('Invalid function:', validation.error);
      return;
    }

    const newFunc = functionGrapher.createFunction(newFunction);
    setFunctions(prev => [...prev, newFunc]);
    setNewFunction('');
  };

  const removeFunction = (id: string) => {
    setFunctions(prev => prev.filter(f => f.id !== id));
  };

  const toggleFunction = (id: string) => {
    setFunctions(prev =>
      prev.map(f => (f.id === id ? { ...f, visible: !f.visible } : f))
    );
  };

  const presetFunctions = functionGrapher.getPresets();

  if (isLoading) {
    return (
      <ToolDemo
        title='Function Grapher'
        description='Visualize mathematical functions with interactive graphs.'
        demoType='graphing'
        interactive={true}
        isLoading={true}
        className={className}
      />
    );
  }

  return (
    <ToolDemo
      title='Function Grapher'
      description='Visualize mathematical functions with interactive graphs. Plot multiple functions and explore their behavior.'
      demoType='graphing'
      interactive={true}
      className={className}
    >
      <div className='space-y-6'>
        {/* Graph Canvas */}
        <div className='bg-white dark:bg-slate-900 border rounded-lg p-4'>
          <canvas
            ref={canvasRef}
            className='w-full border rounded'
            style={{ height: '400px' }}
          />
        </div>

        {/* Controls */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Add Function */}
          <div className='space-y-3'>
            <Label className='text-base font-semibold'>Add Function</Label>
            <div className='flex gap-2'>
              <Input
                value={newFunction}
                onChange={e => setNewFunction(e.target.value)}
                placeholder='e.g., x^2, sin(x), log(x)'
                className='font-mono'
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    addFunction();
                  }
                }}
              />
              <Button onClick={addFunction} size='sm'>
                <Plus className='h-4 w-4' />
              </Button>
            </div>

            {/* Preset Functions */}
            <div className='flex flex-wrap gap-1'>
              {presetFunctions.map(func => (
                <Button
                  key={func}
                  variant='outline'
                  size='sm'
                  onClick={() => setNewFunction(func)}
                  className='text-xs font-mono h-7'
                >
                  {func}
                </Button>
              ))}
            </div>
          </div>

          {/* View Range */}
          <div className='space-y-3'>
            <Label className='text-base font-semibold'>View Range</Label>
            <div className='grid grid-cols-2 gap-2'>
              <div>
                <Label htmlFor='x-min' className='text-xs'>
                  X Min
                </Label>
                <Input
                  id='x-min'
                  type='number'
                  value={xMin}
                  onChange={e => setXMin(Number(e.target.value))}
                  className='text-sm'
                />
              </div>
              <div>
                <Label htmlFor='x-max' className='text-xs'>
                  X Max
                </Label>
                <Input
                  id='x-max'
                  type='number'
                  value={xMax}
                  onChange={e => setXMax(Number(e.target.value))}
                  className='text-sm'
                />
              </div>
              <div>
                <Label htmlFor='y-min' className='text-xs'>
                  Y Min
                </Label>
                <Input
                  id='y-min'
                  type='number'
                  value={yMin}
                  onChange={e => setYMin(Number(e.target.value))}
                  className='text-sm'
                />
              </div>
              <div>
                <Label htmlFor='y-max' className='text-xs'>
                  Y Max
                </Label>
                <Input
                  id='y-max'
                  type='number'
                  value={yMax}
                  onChange={e => setYMax(Number(e.target.value))}
                  className='text-sm'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Function List */}
        <div className='space-y-3'>
          <Label className='text-base font-semibold'>Functions</Label>
          <div className='space-y-2'>
            {functions.map(func => (
              <div
                key={func.id}
                className='flex items-center gap-3 p-3 bg-muted/50 rounded-lg'
              >
                <div
                  className='w-4 h-4 rounded-full border-2'
                  style={{
                    backgroundColor: func.visible ? func.color : 'transparent',
                    borderColor: func.color,
                  }}
                />
                <code className='flex-1 font-mono text-sm'>
                  {func.expression}
                </code>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => toggleFunction(func.id)}
                  className='h-8 w-8 p-0'
                >
                  {func.visible ? (
                    <Eye className='h-4 w-4' />
                  ) : (
                    <EyeOff className='h-4 w-4' />
                  )}
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => removeFunction(func.id)}
                  className='h-8 w-8 p-0 text-destructive hover:text-destructive'
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Help Text */}
        <div className='p-4 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 rounded-lg border border-slate-200 dark:border-slate-700'>
          <h4 className='text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2'>
            <TrendingUp className='h-4 w-4' />
            Supported Functions
          </h4>
          <div className='text-xs text-slate-600 dark:text-slate-400 space-y-1'>
            <p>
              • <strong>Basic:</strong> +, -, *, /, ^, sqrt(), abs()
            </p>
            <p>
              • <strong>Trigonometric:</strong> sin(), cos(), tan()
            </p>
            <p>
              • <strong>Logarithmic:</strong> log(), ln(), exp()
            </p>
            <p>
              • <strong>Constants:</strong> pi, e
            </p>
          </div>
        </div>
      </div>
    </ToolDemo>
  );
};

export default FunctionGrapherDemo;
