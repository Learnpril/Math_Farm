import type { Meta, StoryObj } from '@storybook/react';
import { FunctionGrapher } from '../features/math-tools/components/GraphPlotter';

const meta: Meta<typeof FunctionGrapher> = {
  title: 'Math Tools/Function Grapher',
  component: FunctionGrapher,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Function Grapher Component

A powerful function graphing component with advanced visualization capabilities:

## Graphing Features

### Function Support
- Polynomial functions (linear, quadratic, cubic, etc.)
- Trigonometric functions (sin, cos, tan, etc.)
- Exponential and logarithmic functions
- Rational functions
- Piecewise functions
- Parametric equations

### Visualization
- **Interactive Canvas**: HTML5 canvas with smooth rendering
- **Multiple Functions**: Graph multiple functions simultaneously
- **Custom Colors**: Assign colors to different function curves
- **Grid and Axes**: Coordinate grid with labeled axes
- **Zoom and Pan**: Interactive viewing controls

### Analysis Tools
- **Critical Points**: Automatic detection of maxima and minima
- **Intercepts**: Find x and y intercepts
- **Asymptotes**: Identify vertical and horizontal asymptotes
- **Domain and Range**: Calculate function domain and range

## Educational Value

- **Real-time Graphing**: See functions update as you type
- **Function Library**: Preset functions for common mathematical concepts
- **Export Options**: Save graphs as images for assignments
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Performance

- **Optimized Rendering**: Efficient canvas drawing with smooth animations
- **Adaptive Resolution**: Automatic point density based on function complexity
- **Memory Management**: Efficient handling of large datasets
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onFunctionAdd: { action: 'function added' },
    onFunctionRemove: { action: 'function removed' },
    onBoundsChange: { action: 'bounds changed' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'The default function grapher with empty canvas ready for function input.',
      },
    },
  },
};

export const QuadraticFunction: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Graphing a quadratic function (parabola) with vertex and intercepts highlighted.',
      },
    },
  },
};

export const TrigonometricFunctions: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Multiple trigonometric functions (sin, cos, tan) graphed together.',
      },
    },
  },
};

export const ExponentialAndLogarithmic: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Exponential and logarithmic functions showing inverse relationships.',
      },
    },
  },
};

export const PolynomialFunctions: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Various polynomial functions of different degrees.',
      },
    },
  },
};

export const CriticalPointAnalysis: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates critical point detection and analysis features.',
      },
    },
  },
};

export const CustomBounds: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Function grapher with custom viewing bounds and zoom levels.',
      },
    },
  },
};
