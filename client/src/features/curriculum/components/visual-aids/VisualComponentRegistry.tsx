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
