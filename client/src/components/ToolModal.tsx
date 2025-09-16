import React, { Suspense } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { ToolErrorBoundary } from '../features/math-tools/components';
import { LazyWrapper } from './LazyWrapper';
import {
  LazyCalculator,
  LazyGraphPlotter,
  LazyUnitConverter,
  LazyEquationSolver,
} from './LazyComponents';
import { Calculator, TrendingUp, RotateCcw, Zap } from 'lucide-react';

export type ToolType =
  | 'calculator'
  | 'function-grapher'
  | 'unit-converter'
  | 'equation-solver';

interface ToolConfig {
  id: ToolType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
}

const toolConfigs: Record<ToolType, ToolConfig> = {
  calculator: {
    id: 'calculator',
    title: 'Advanced Calculator',
    description:
      'Perform complex mathematical calculations with step-by-step solutions',
    icon: Calculator,
    component: LazyCalculator,
  },
  'function-grapher': {
    id: 'function-grapher',
    title: 'Function Grapher',
    description:
      'Plot and visualize multiple mathematical functions simultaneously',
    icon: TrendingUp,
    component: LazyGraphPlotter,
  },
  'unit-converter': {
    id: 'unit-converter',
    title: 'Unit Converter',
    description: 'Convert between different units of measurement',
    icon: RotateCcw,
    component: LazyUnitConverter,
  },
  'equation-solver': {
    id: 'equation-solver',
    title: 'Equation Solver',
    description:
      'Solve algebraic equations, derivatives, and integrals symbolically',
    icon: Zap,
    component: LazyEquationSolver,
  },
};

interface ToolModalProps {
  toolType: ToolType | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ToolModal({ toolType, isOpen, onClose }: ToolModalProps) {
  if (!toolType || !isOpen) {
    return null;
  }

  const toolConfig = toolConfigs[toolType];
  const IconComponent = toolConfig.icon;
  const ToolComponent = toolConfig.component;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <IconComponent className='w-5 h-5 text-primary' />
            {toolConfig.title}
          </DialogTitle>
          <DialogDescription>{toolConfig.description}</DialogDescription>
        </DialogHeader>
        <div className='mt-4'>
          <ToolErrorBoundary toolName={toolConfig.title}>
            <LazyWrapper
              fallback='skeleton'
              skeletonVariant='tool'
              loadingText={`Loading ${toolConfig.title}...`}
            >
              <ToolComponent />
            </LazyWrapper>
          </ToolErrorBoundary>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook for managing tool modal state
export function useToolModal() {
  const [currentTool, setCurrentTool] = React.useState<ToolType | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  const openTool = (toolType: ToolType) => {
    setCurrentTool(toolType);
    setIsOpen(true);
  };

  const closeTool = () => {
    setIsOpen(false);
    // Delay clearing the tool to allow for exit animation
    setTimeout(() => setCurrentTool(null), 200);
  };

  return {
    currentTool,
    isOpen,
    openTool,
    closeTool,
  };
}
