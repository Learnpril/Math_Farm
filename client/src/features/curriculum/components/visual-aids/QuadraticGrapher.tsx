import { useState, useEffect, useRef } from 'react';
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
import { RotateCcw, Info } from 'lucide-react';

interface QuadraticGrapherProps {
  className?: string;
}

export function QuadraticGrapher({ className = '' }: QuadraticGrapherProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [a, setA] = useState(1);
  const [b, setB] = useState(-4);
  const [c, setC] = useState(3);
  const [showVertex, setShowVertex] = useState(true);
  const [showIntercepts, setShowIntercepts] = useState(true);
  const [showAxisOfSymmetry, setShowAxisOfSymmetry] = useState(true);

  // Calculate key features
  const vertex = {
    x: -b / (2 * a),
    y: a * Math.pow(-b / (2 * a), 2) + b * (-b / (2 * a)) + c,
  };

  const yIntercept = c;

  const discriminant = b * b - 4 * a * c;
  const xIntercepts =
    discriminant >= 0
      ? [
          (-b + Math.sqrt(discriminant)) / (2 * a),
          (-b - Math.sqrt(discriminant)) / (2 * a),
        ]
      : [];

  const axisOfSymmetry = vertex.x;

  // Draw the graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 400;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set up coordinate system
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 20; // pixels per unit

    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    // Vertical grid lines
    for (let x = -10; x <= 10; x++) {
      const pixelX = centerX + x * scale;
      ctx.beginPath();
      ctx.moveTo(pixelX, 0);
      ctx.lineTo(pixelX, canvas.height);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let y = -10; y <= 10; y++) {
      const pixelY = centerY - y * scale;
      ctx.beginPath();
      ctx.moveTo(0, pixelY);
      ctx.lineTo(canvas.width, pixelY);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;

    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvas.height);
    ctx.stroke();

    // Draw axis labels
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';

    // X-axis numbers
    for (let x = -10; x <= 10; x += 2) {
      if (x !== 0) {
        const pixelX = centerX + x * scale;
        ctx.fillText(x.toString(), pixelX, centerY + 15);
      }
    }

    // Y-axis numbers
    ctx.textAlign = 'right';
    for (let y = -10; y <= 10; y += 2) {
      if (y !== 0) {
        const pixelY = centerY - y * scale;
        ctx.fillText(y.toString(), centerX - 5, pixelY + 4);
      }
    }

    // Draw parabola
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 3;
    ctx.beginPath();

    let firstPoint = true;
    for (let x = -10; x <= 10; x += 0.1) {
      const y = a * x * x + b * x + c;
      const pixelX = centerX + x * scale;
      const pixelY = centerY - y * scale;

      if (pixelY >= 0 && pixelY <= canvas.height) {
        if (firstPoint) {
          ctx.moveTo(pixelX, pixelY);
          firstPoint = false;
        } else {
          ctx.lineTo(pixelX, pixelY);
        }
      }
    }
    ctx.stroke();

    // Draw vertex
    if (showVertex) {
      const vertexPixelX = centerX + vertex.x * scale;
      const vertexPixelY = centerY - vertex.y * scale;

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(vertexPixelX, vertexPixelY, 6, 0, 2 * Math.PI);
      ctx.fill();

      // Vertex label
      ctx.fillStyle = '#ef4444';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `Vertex (${vertex.x.toFixed(1)}, ${vertex.y.toFixed(1)})`,
        vertexPixelX,
        vertexPixelY - 15
      );
    }

    // Draw x-intercepts
    if (showIntercepts && xIntercepts.length > 0) {
      ctx.fillStyle = '#10b981';
      xIntercepts.forEach((xInt, index) => {
        const pixelX = centerX + xInt * scale;
        const pixelY = centerY;

        ctx.beginPath();
        ctx.arc(pixelX, pixelY, 5, 0, 2 * Math.PI);
        ctx.fill();

        // Label
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          `(${xInt.toFixed(1)}, 0)`,
          pixelX,
          pixelY + (index === 0 ? 20 : -10)
        );
      });
    }

    // Draw y-intercept
    if (showIntercepts) {
      const yPixelX = centerX;
      const yPixelY = centerY - yIntercept * scale;

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(yPixelX, yPixelY, 5, 0, 2 * Math.PI);
      ctx.fill();

      // Label
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`(0, ${yIntercept})`, yPixelX + 10, yPixelY);
    }

    // Draw axis of symmetry
    if (showAxisOfSymmetry) {
      const axisPixelX = centerX + axisOfSymmetry * scale;

      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(axisPixelX, 0);
      ctx.lineTo(axisPixelX, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label
      ctx.fillStyle = '#6b7280';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`x = ${axisOfSymmetry.toFixed(1)}`, axisPixelX, 15);
    }
  }, [
    a,
    b,
    c,
    showVertex,
    showIntercepts,
    showAxisOfSymmetry,
    vertex,
    xIntercepts,
    yIntercept,
    axisOfSymmetry,
  ]);

  const resetToDefault = () => {
    setA(1);
    setB(-4);
    setC(3);
  };

  const generateRandom = () => {
    setA(Math.floor(Math.random() * 5) - 2 || 1);
    setB(Math.floor(Math.random() * 11) - 5);
    setC(Math.floor(Math.random() * 11) - 5);
  };

  const getStandardForm = () => {
    const aStr = a === 1 ? '' : a === -1 ? '-' : a.toString();
    const bStr = b === 0 ? '' : b > 0 ? ` + ${b}x` : ` - ${Math.abs(b)}x`;
    const cStr = c === 0 ? '' : c > 0 ? ` + ${c}` : ` - ${Math.abs(c)}`;
    return `f(x) = ${aStr}x²${bStr}${cStr}`;
  };

  const getVertexForm = () => {
    const h = vertex.x;
    const k = vertex.y;
    const hStr = h === 0 ? '' : h > 0 ? ` - ${h}` : ` + ${Math.abs(h)}`;
    const kStr = k === 0 ? '' : k > 0 ? ` + ${k}` : ` - ${Math.abs(k)}`;
    const aStr = a === 1 ? '' : a === -1 ? '-' : a.toString();
    return `f(x) = ${aStr}(x${hStr})²${kStr}`;
  };

  return (
    <Card className={`w-full max-w-6xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <span>Quadratic Function Grapher</span>
          <div className='flex gap-2'>
            <Button onClick={generateRandom} variant='outline' size='sm'>
              Random
            </Button>
            <Button onClick={resetToDefault} variant='outline' size='sm'>
              <RotateCcw className='h-4 w-4' />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Controls */}
          <div className='space-y-6'>
            {/* Equation Input */}
            <div className='space-y-4'>
              <h4 className='font-medium'>Equation: f(x) = ax² + bx + c</h4>
              <div className='grid grid-cols-3 gap-4'>
                <div>
                  <label className='text-sm font-medium'>a =</label>
                  <Input
                    type='number'
                    step='0.5'
                    value={a}
                    onChange={e => setA(parseFloat(e.target.value) || 1)}
                    className='mt-1'
                  />
                </div>
                <div>
                  <label className='text-sm font-medium'>b =</label>
                  <Input
                    type='number'
                    step='0.5'
                    value={b}
                    onChange={e => setB(parseFloat(e.target.value) || 0)}
                    className='mt-1'
                  />
                </div>
                <div>
                  <label className='text-sm font-medium'>c =</label>
                  <Input
                    type='number'
                    step='0.5'
                    value={c}
                    onChange={e => setC(parseFloat(e.target.value) || 0)}
                    className='mt-1'
                  />
                </div>
              </div>
            </div>

            {/* Display Options */}
            <div className='space-y-3'>
              <h4 className='font-medium'>Display Options</h4>
              <div className='space-y-2'>
                <label className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={showVertex}
                    onChange={e => setShowVertex(e.target.checked)}
                    className='rounded'
                  />
                  <span className='text-sm'>Show Vertex</span>
                </label>
                <label className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={showIntercepts}
                    onChange={e => setShowIntercepts(e.target.checked)}
                    className='rounded'
                  />
                  <span className='text-sm'>Show Intercepts</span>
                </label>
                <label className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={showAxisOfSymmetry}
                    onChange={e => setShowAxisOfSymmetry(e.target.checked)}
                    className='rounded'
                  />
                  <span className='text-sm'>Show Axis of Symmetry</span>
                </label>
              </div>
            </div>

            {/* Function Forms */}
            <Tabs defaultValue='standard' className='w-full'>
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='standard'>Standard Form</TabsTrigger>
                <TabsTrigger value='vertex'>Vertex Form</TabsTrigger>
              </TabsList>
              <TabsContent value='standard' className='space-y-2'>
                <div className='bg-muted/50 p-3 rounded font-mono text-center'>
                  {getStandardForm()}
                </div>
              </TabsContent>
              <TabsContent value='vertex' className='space-y-2'>
                <div className='bg-muted/50 p-3 rounded font-mono text-center'>
                  {getVertexForm()}
                </div>
              </TabsContent>
            </Tabs>

            {/* Key Features */}
            <div className='space-y-3'>
              <h4 className='font-medium'>Key Features</h4>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span>Direction:</span>
                  <Badge variant={a > 0 ? 'default' : 'secondary'}>
                    {a > 0 ? 'Opens Up' : 'Opens Down'}
                  </Badge>
                </div>
                <div className='flex justify-between'>
                  <span>Vertex:</span>
                  <span className='font-mono'>
                    ({vertex.x.toFixed(2)}, {vertex.y.toFixed(2)})
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span>Axis of Symmetry:</span>
                  <span className='font-mono'>
                    x = {axisOfSymmetry.toFixed(2)}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span>Y-intercept:</span>
                  <span className='font-mono'>(0, {yIntercept})</span>
                </div>
                <div className='flex justify-between'>
                  <span>X-intercepts:</span>
                  <span className='font-mono'>
                    {discriminant < 0
                      ? 'None (complex)'
                      : discriminant === 0
                        ? `(${xIntercepts[0]?.toFixed(2)}, 0)`
                        : `(${xIntercepts[0]?.toFixed(2)}, 0), (${xIntercepts[1]?.toFixed(2)}, 0)`}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span>Discriminant:</span>
                  <span className='font-mono'>{discriminant.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Graph */}
          <div className='flex flex-col items-center space-y-4'>
            <canvas
              ref={canvasRef}
              className='border rounded-lg bg-white'
              style={{ maxWidth: '100%', height: 'auto' }}
            />
            <div className='flex items-center gap-4 text-xs text-muted-foreground'>
              <div className='flex items-center gap-1'>
                <div className='w-3 h-0.5 bg-purple-500'></div>
                <span>Function</span>
              </div>
              <div className='flex items-center gap-1'>
                <div className='w-2 h-2 bg-red-500 rounded-full'></div>
                <span>Vertex</span>
              </div>
              <div className='flex items-center gap-1'>
                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                <span>X-intercepts</span>
              </div>
              <div className='flex items-center gap-1'>
                <div className='w-2 h-2 bg-yellow-500 rounded-full'></div>
                <span>Y-intercept</span>
              </div>
            </div>
          </div>
        </div>

        {/* Information Panel */}
        <div className='mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg'>
          <div className='flex items-start gap-2'>
            <Info className='h-5 w-5 text-blue-600 mt-0.5' />
            <div className='text-sm'>
              <p className='font-medium text-blue-900 dark:text-blue-100 mb-1'>
                Understanding Quadratic Functions:
              </p>
              <ul className='text-blue-800 dark:text-blue-200 space-y-1'>
                <li>
                  • The coefficient 'a' determines the direction and width of
                  the parabola
                </li>
                <li>
                  • The vertex represents the minimum (a &gt; 0) or maximum (a
                  &lt; 0) point
                </li>
                <li>
                  • The discriminant (b² - 4ac) tells us about the x-intercepts
                </li>
                <li>
                  • The axis of symmetry passes through the vertex at x =
                  -b/(2a)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
