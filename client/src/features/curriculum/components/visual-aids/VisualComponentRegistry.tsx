/**
 * Visual Component Registry - Replaces the large switch statement in TheorySection
 * Provides a clean, maintainable way to register and render visual components
 */

import React from 'react';
import {
  PlaceValueChart,
  NumberLine,
  Base10Blocks,
  ExpandedFormDiagram,
  ComparisonChart,
  MultiplicationArrayModel,
  DivisionGroupsModel,
  DecimalPlaceValueChart,
  PercentageGrid,
  RatioVisualizer,
  AdditionAlgorithm,
  SubtractionAlgorithm,
  NumberComparison,
  CountingDots,
  CommonCoreStrategies,
  MultiplicationGrid,
  DistributivePropertyDemo,
  RepeatedAdditionVisual,
  TwoDigitMultiplicationDemo,
  MultiplicationTable,
  DivisionGroupingVisual,
  DivisionRemainderVisual,
  LongDivisionDemo,
  DivisionFactsTable,
  ExponentVisualizer,
  PowersOfTenChart,
  ExponentGrowthChart,
  ExponentComparison,
  ExponentPatterns,
  NegativeNumbersIntro,
  FractionCircles,
  FractionBars,
  EquivalentFractionBars,
  FractionAdditionBars,
  FractionMultiplicationGrid,
  FractionDivisionBars,
  EquivalentRatiosBars,
  PercentageChangeVisualizer,
  RatioToPercentageConverter,
} from './index';

// Pre-Algebra specific components
import { IntegerNumberLine } from './IntegerNumberLine';
import { AbsoluteValueVisualizer } from './AbsoluteValueVisualizer';
import { OrderOfOperationsVisualizer } from './OrderOfOperationsVisualizer';
import { AlgebraicExpressionBuilder } from './AlgebraicExpressionBuilder';
import { EquationBalanceScale } from './EquationBalanceScale';
import { EquationStepsVisualizer } from './EquationStepsVisualizer';
import { InverseOperationsDemonstrator } from './InverseOperationsDemonstrator';
import { SimpleInverseOperations } from './SimpleInverseOperations';
import { SimpleRatioDisplay } from './SimpleRatioDisplay';
import { DirectInverseComparison } from './DirectInverseComparison';
import { UnitRateComparison } from './UnitRateComparison';
import { InequalityNumberLine } from './InequalityNumberLine';
import { ProportionCrossMultiply } from './ProportionCrossMultiply';
import { GeometryShapeCalculator } from './GeometryShapeCalculator';
import { PythagoreanTheoremVisualizer } from './PythagoreanTheoremVisualizer';
import { CoordinatePlaneInteractive } from './CoordinatePlaneInteractive';
import { StatisticsDataVisualizer } from './StatisticsDataVisualizer';

// Algebra specific components
import { LinearEquationSolver } from './LinearEquationSolver';
import { SystemOfEquationsVisualizer } from './SystemOfEquationsVisualizer';
import { QuadraticGrapher } from './QuadraticGrapher';

// Type for visual component props - flexible to accommodate different component prop types
interface VisualComponentProps {
  className?: string;
  [key: string]: any;
}

// Type for visual component - more flexible to handle different prop types
type VisualComponent = React.ComponentType<any>;

// Registry of all visual components
const VISUAL_COMPONENTS: Record<string, VisualComponent> = {
  // Chapter 1: Numbers and Place Value
  PlaceValueChart,
  NumberLine,
  Base10Blocks,
  ExpandedFormDiagram,
  ComparisonChart,

  // Chapter 2: Decimals
  DecimalPlaceValueChart,
  NumberComparison,

  // Chapter 3: Addition and Subtraction
  AdditionAlgorithm,
  SubtractionAlgorithm,
  CountingDots,
  CommonCoreStrategies,

  // Chapter 4: Multiplication
  MultiplicationGrid,
  MultiplicationArrayModel,
  DistributivePropertyDemo,
  RepeatedAdditionVisual,
  TwoDigitMultiplicationDemo,
  MultiplicationTable,

  // Chapter 5: Division
  DivisionGroupingVisual,
  DivisionRemainderVisual,
  DivisionGroupsModel,
  LongDivisionDemo,
  DivisionFactsTable,

  // Chapter 4: Exponents (updated numbering)
  ExponentVisualizer,
  PowersOfTenChart,
  ExponentGrowthChart,
  ExponentComparison,
  ExponentPatterns,

  // Chapter 1: Negative Numbers (updated numbering)
  NegativeNumbersIntro,

  // Chapter 6: Fractions
  FractionCircles,
  FractionBars,
  EquivalentFractionBars,
  FractionAdditionBars,
  FractionMultiplicationGrid,
  FractionDivisionBars,

  // Chapter 7: Percentages and Ratios
  PercentageGrid,
  RatioVisualizer,
  EquivalentRatiosBars,
  PercentageChangeVisualizer,
  RatioToPercentageConverter,

  // Pre-Algebra Components
  // Chapter 1: Integers and Operations
  IntegerNumberLine,
  AbsoluteValueVisualizer,

  // Chapter 2: Order of Operations and Expressions
  OrderOfOperationsVisualizer,
  AlgebraicExpressionBuilder,

  // Chapter 3: Equations and Inequalities
  EquationBalanceScale,
  EquationStepsVisualizer,
  InverseOperationsDemonstrator,
  SimpleInverseOperations,
  SimpleRatioDisplay,
  DirectInverseComparison,
  UnitRateComparison,
  InequalityNumberLine,

  // Chapter 4: Algebraic Proportions
  ProportionCrossMultiply,

  // Chapter 5: Geometry Basics
  GeometryShapeCalculator,
  PythagoreanTheoremVisualizer,

  // Chapter 6: Coordinate Plane and Graphing
  CoordinatePlaneInteractive,

  // Chapter 7: Data and Statistics Basics
  StatisticsDataVisualizer,

  // Algebra Components
  // Chapter 1: Linear Equations and Inequalities
  LinearEquationSolver,

  // Chapter 2: Systems of Linear Equations
  SystemOfEquationsVisualizer,

  // Chapter 4: Quadratic Equations and Functions
  QuadraticGrapher,
} as const;

// Component name aliases for backward compatibility and alternative naming
const COMPONENT_ALIASES: Record<string, string> = {
  // Kebab-case alternatives
  'place-value-chart': 'PlaceValueChart',
  'number-line': 'NumberLine',
  'base10-blocks': 'Base10Blocks',
  'expanded-form-diagram': 'ExpandedFormDiagram',
  'comparison-chart': 'ComparisonChart',
  'decimal-place-value-chart': 'DecimalPlaceValueChart',
  'percentage-grid': 'PercentageGrid',
  'ratio-visualizer': 'RatioVisualizer',
  'addition-algorithm': 'AdditionAlgorithm',
  'subtraction-algorithm': 'SubtractionAlgorithm',
  'number-comparison': 'NumberComparison',
  'counting-dots': 'CountingDots',
  'common-core-strategies': 'CommonCoreStrategies',
  'multiplication-grid': 'MultiplicationGrid',
  'multiplication-array-model': 'MultiplicationArrayModel',
  'distributive-property-demo': 'DistributivePropertyDemo',
  'repeated-addition-visual': 'RepeatedAdditionVisual',
  'two-digit-multiplication-demo': 'TwoDigitMultiplicationDemo',
  'multiplication-table': 'MultiplicationTable',
  'division-grouping-visual': 'DivisionGroupingVisual',
  'division-remainder-visual': 'DivisionRemainderVisual',
  'division-groups-model': 'DivisionGroupsModel',
  'long-division-demo': 'LongDivisionDemo',
  'division-facts-table': 'DivisionFactsTable',
  'exponent-visualizer': 'ExponentVisualizer',
  'powers-of-ten-chart': 'PowersOfTenChart',
  'exponent-growth-chart': 'ExponentGrowthChart',
  'exponent-comparison': 'ExponentComparison',
  'exponent-patterns': 'ExponentPatterns',
  'negative-numbers-intro': 'NegativeNumbersIntro',
  'fraction-circles': 'FractionCircles',
  'fraction-bars': 'FractionBars',
  'equivalent-fraction-bars': 'EquivalentFractionBars',
  'fraction-addition-bars': 'FractionAdditionBars',
  'fraction-multiplication-grid': 'FractionMultiplicationGrid',
  'fraction-division-bars': 'FractionDivisionBars',
  'equivalent-ratios-bars': 'EquivalentRatiosBars',
  'percentage-change-visualizer': 'PercentageChangeVisualizer',
  'ratio-to-percentage-converter': 'RatioToPercentageConverter',

  // Pre-Algebra component aliases
  'integer-number-line': 'IntegerNumberLine',
  'absolute-value-visualizer': 'AbsoluteValueVisualizer',
  'order-of-operations-visualizer': 'OrderOfOperationsVisualizer',
  'algebraic-expression-builder': 'AlgebraicExpressionBuilder',
  'equation-balance-scale': 'EquationBalanceScale',
  'equation-steps-visualizer': 'EquationStepsVisualizer',
  'inverse-operations-demonstrator': 'InverseOperationsDemonstrator',
  'simple-inverse-operations': 'SimpleInverseOperations',
  'simple-ratio-display': 'SimpleRatioDisplay',
  'direct-inverse-comparison': 'DirectInverseComparison',
  'unit-rate-comparison': 'UnitRateComparison',
  'inequality-number-line': 'InequalityNumberLine',
  'proportion-cross-multiply': 'ProportionCrossMultiply',
  'geometry-shape-calculator': 'GeometryShapeCalculator',
  'pythagorean-theorem-visualizer': 'PythagoreanTheoremVisualizer',
  'coordinate-plane-interactive': 'CoordinatePlaneInteractive',
  'statistics-data-visualizer': 'StatisticsDataVisualizer',

  // Algebra component aliases
  'linear-equation-solver': 'LinearEquationSolver',
  'system-of-equations-visualizer': 'SystemOfEquationsVisualizer',
  'quadratic-grapher': 'QuadraticGrapher',

  // Legacy aliases for backward compatibility
  FractionSimplifier: 'EquivalentFractionBars',
  CommonDenominatorVisual: 'FractionAdditionBars',
  'standard-algorithm': 'AdditionAlgorithm',
  'long-division-algorithm': 'LongDivisionDemo',
  'step-by-step-process': 'AdditionAlgorithm',
};

// Fallback component for unknown visual types
const FallbackVisual: React.FC<{ type: string; className?: string }> = ({
  type,
  className = '',
}) => (
  <div
    className={`p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center ${className}`}
  >
    <div className='text-gray-500 dark:text-gray-400'>
      <div className='text-lg font-medium mb-2'>Visual Component Not Found</div>
      <div className='text-sm'>Component type: "{type}"</div>
      <div className='text-xs mt-2'>
        This visual aid is not yet implemented or the component name may be
        incorrect.
      </div>
    </div>
  </div>
);

// Main function to render visual components
export const renderVisualComponent = (
  type: string,
  props: VisualComponentProps = {}
): React.ReactElement => {
  // Normalize the component name
  const normalizedType = COMPONENT_ALIASES[type] || type;

  // Get the component from registry
  const Component = VISUAL_COMPONENTS[normalizedType];

  if (!Component) {
    console.warn(`Visual component "${type}" not found in registry`);
    return <FallbackVisual type={type} className={props.className || ''} />;
  }

  // Render the component with provided props
  return <Component {...props} />;
};

// Function to get all available visual component names
export const getAvailableVisualComponents = (): string[] => {
  return Object.keys(VISUAL_COMPONENTS);
};

// Function to check if a visual component exists
export const hasVisualComponent = (type: string): boolean => {
  const normalizedType = COMPONENT_ALIASES[type] || type;
  return normalizedType in VISUAL_COMPONENTS;
};

// Export the registry for testing or advanced usage
export { VISUAL_COMPONENTS, COMPONENT_ALIASES };
