import type { Meta, StoryObj } from '@storybook/react';
import { Calculator } from '../features/math-tools/components/Calculator';

const meta: Meta<typeof Calculator> = {
  title: 'Math Tools/Calculator',
  component: Calculator,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Calculator Component

A comprehensive calculator component with support for:
- Basic arithmetic operations
- Trigonometric functions
- Memory operations
- Calculation history
- Real-time expression evaluation

## Features

- **Safe Evaluation**: All expressions are validated before evaluation
- **Error Handling**: Graceful error recovery with user-friendly messages
- **Memory Functions**: Store, recall, add, and subtract from memory
- **History**: Track calculation history with timestamps
- **Angle Modes**: Support for degrees and radians in trigonometric functions

## Usage

The calculator can be used for educational purposes, providing step-by-step
solutions and explanations for mathematical operations.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onCalculate: { action: 'calculated' },
    onError: { action: 'error occurred' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'The default calculator with all standard functions enabled.',
      },
    },
  },
};

export const WithInitialExpression: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Calculator with a pre-filled expression for demonstration.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    // This would simulate user interaction in a real Storybook setup
    console.log('Calculator story loaded on:', canvasElement);
  },
};

export const ErrorHandling: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates how the calculator handles invalid expressions and errors.',
      },
    },
  },
};

export const MemoryOperations: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Shows memory operations: store, recall, add, subtract, and clear.',
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
          'Demonstrates trigonometric functions with degree and radian modes.',
      },
    },
  },
};
