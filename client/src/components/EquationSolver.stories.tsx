import type { Meta, StoryObj } from '@storybook/react';
import { EquationSolver } from '../features/math-tools/components/EquationSolver';

const meta: Meta<typeof EquationSolver> = {
  title: 'Math Tools/Equation Solver',
  component: EquationSolver,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Equation Solver Component

An advanced equation solver with comprehensive mathematical capabilities:

## Solver Types

### Algebraic Solving
- Linear equations
- Quadratic equations with detailed steps
- Polynomial equations
- System of equations

### Calculus Operations
- Derivatives with step-by-step explanations
- Integration (basic cases)
- Limit calculations

### Expression Manipulation
- Algebraic simplification
- Factoring
- Expansion
- Rationalization

## Educational Features

- **Step-by-Step Solutions**: Detailed explanations for each solution step
- **LaTeX Rendering**: Mathematical expressions rendered with MathJax
- **Multiple Methods**: Symbolic and numerical solving approaches
- **Error Recovery**: Graceful fallback when advanced methods fail

## Security

All input expressions are validated and sanitized to prevent code injection
while maintaining full mathematical functionality.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onSolve: { action: 'equation solved' },
    onError: { action: 'solving error' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'The default equation solver ready for input.',
      },
    },
  },
};

export const QuadraticEquation: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Solving a quadratic equation with detailed steps using the quadratic formula.',
      },
    },
  },
};

export const DerivativeCalculation: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Finding derivatives with step-by-step explanations and power rule application.',
      },
    },
  },
};

export const ExpressionSimplification: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Simplifying complex algebraic expressions with detailed steps.',
      },
    },
  },
};

export const ErrorHandling: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates error handling for invalid equations and expressions.',
      },
    },
  },
};

export const SymbolicVsNumerical: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Shows the difference between symbolic and numerical solving methods.',
      },
    },
  },
};
