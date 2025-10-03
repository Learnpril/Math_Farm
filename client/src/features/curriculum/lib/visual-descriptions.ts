/**
 * Centralized visual component descriptions
 * Replaces the large switch statement for descriptions in TheorySection
 */

// Type for visual description
interface VisualDescription {
  description: string;
  category: string;
}

// Registry of visual component descriptions
export const VISUAL_DESCRIPTIONS: Record<string, VisualDescription> = {
  // Chapter 1: Numbers and Place Value
  PlaceValueChart: {
    description:
      'This interactive chart helps you understand how digits represent different values based on their position.',
    category: 'place-value',
  },
  NumberLine: {
    description:
      'Use this number line to visualize number relationships, ordering, and basic operations.',
    category: 'place-value',
  },
  Base10Blocks: {
    description:
      'Manipulate base-10 blocks to understand place value concepts with ones, tens, hundreds, and thousands.',
    category: 'place-value',
  },
  ExpandedFormDiagram: {
    description:
      'See how numbers break down into their place value components with this expanded form visualization.',
    category: 'place-value',
  },
  ComparisonChart: {
    description:
      'Compare numbers visually to understand greater than, less than, and equal relationships.',
    category: 'place-value',
  },

  // Chapter 2: Decimals
  DecimalPlaceValueChart: {
    description:
      'Explore decimal place values from tenths to thousandths with this interactive chart.',
    category: 'decimals',
  },
  NumberComparison: {
    description:
      'Compare decimal numbers using visual representations and number lines.',
    category: 'decimals',
  },

  // Chapter 3: Addition and Subtraction
  AdditionAlgorithm: {
    description:
      'Step through the standard addition algorithm with visual support for carrying and regrouping.',
    category: 'addition-subtraction',
  },
  SubtractionAlgorithm: {
    description:
      'Learn the standard subtraction algorithm with visual aids for borrowing and regrouping.',
    category: 'addition-subtraction',
  },
  CountingDots: {
    description:
      'Use dot patterns to understand addition and subtraction through counting strategies.',
    category: 'addition-subtraction',
  },
  CommonCoreStrategies: {
    description:
      'Explore various addition and subtraction strategies including number bonds and mental math.',
    category: 'addition-subtraction',
  },

  // Chapter 4: Multiplication
  MultiplicationGrid: {
    description:
      'Visualize multiplication as arrays and area models with this interactive grid.',
    category: 'multiplication',
  },
  MultiplicationArrayModel: {
    description:
      'Understand multiplication through array models showing rows and columns.',
    category: 'multiplication',
  },
  DistributivePropertyDemo: {
    description:
      'See how the distributive property works by breaking apart numbers in multiplication.',
    category: 'multiplication',
  },
  RepeatedAdditionVisual: {
    description:
      'Connect multiplication to repeated addition with visual groupings.',
    category: 'multiplication',
  },
  TwoDigitMultiplicationDemo: {
    description:
      'Step through two-digit multiplication using the standard algorithm with visual support.',
    category: 'multiplication',
  },
  MultiplicationTable: {
    description:
      'Interactive multiplication table for practicing facts and discovering patterns.',
    category: 'multiplication',
  },

  // Chapter 5: Division
  DivisionGroupingVisual: {
    description:
      'Understand division as making equal groups with this hands-on visualization.',
    category: 'division',
  },
  DivisionRemainderVisual: {
    description:
      'Explore division with remainders using visual models and concrete examples.',
    category: 'division',
  },
  DivisionGroupsModel: {
    description:
      'See division as sharing equally among groups with interactive models.',
    category: 'division',
  },
  LongDivisionDemo: {
    description:
      'Step through the long division algorithm with detailed visual explanations.',
    category: 'division',
  },
  DivisionFactsTable: {
    description:
      'Practice division facts and explore the relationship between multiplication and division.',
    category: 'division',
  },

  // Exponents
  ExponentVisualizer: {
    description:
      'Visualize exponential growth and understand the power notation with interactive examples.',
    category: 'exponents',
  },
  PowersOfTenChart: {
    description:
      'Explore powers of ten and their relationship to place value and scientific notation.',
    category: 'exponents',
  },
  ExponentGrowthChart: {
    description:
      'See how exponential functions grow compared to linear functions with dynamic charts.',
    category: 'exponents',
  },
  ExponentComparison: {
    description:
      'Compare different exponential expressions and understand their relative sizes.',
    category: 'exponents',
  },
  ExponentPatterns: {
    description:
      'Discover patterns in exponents including rules for multiplication and division.',
    category: 'exponents',
  },

  // Negative Numbers
  NegativeNumbersIntro: {
    description:
      'Introduction to negative numbers using number lines and real-world contexts.',
    category: 'negative-numbers',
  },

  // Chapter 6: Fractions
  FractionCircles: {
    description:
      'Visualize fractions using circular models divided into equal parts.',
    category: 'fractions',
  },
  FractionBars: {
    description:
      'Understand fractions through rectangular bar models showing parts of wholes.',
    category: 'fractions',
  },
  EquivalentFractionBars: {
    description:
      'Below are multiple fraction bars that demonstrate how different fractions can represent the same value and how to simplify fractions.',
    category: 'fractions',
  },
  FractionAdditionBars: {
    description:
      'The following step-by-step visualization shows how to add fractions using common denominators with interactive bar models.',
    category: 'fractions',
  },
  FractionMultiplicationGrid: {
    description:
      'Below is an interactive grid that shows fraction multiplication as finding the area where two fractions overlap.',
    category: 'fractions',
  },
  FractionDivisionBars: {
    description:
      'The following demonstration shows fraction division as "how many groups fit?" using the invert-and-multiply method.',
    category: 'fractions',
  },

  // Chapter 7: Percentages and Ratios
  PercentageGrid: {
    description:
      'Visualize percentages using a 100-square grid to understand "per hundred" concepts.',
    category: 'percentages-ratios',
  },
  RatioVisualizer: {
    description:
      'Explore ratios using visual bars and understand proportional relationships.',
    category: 'percentages-ratios',
  },
  EquivalentRatiosBars: {
    description:
      'This interactive visualization shows how ratios remain equivalent when both parts are scaled by the same factor.',
    category: 'percentages-ratios',
  },
  PercentageChangeVisualizer: {
    description:
      'The following tool demonstrates how percentage increases and decreases affect values, with visual bars showing the changes.',
    category: 'percentages-ratios',
  },
  RatioToPercentageConverter: {
    description:
      'This converter shows the relationship between ratios and percentages using both pie charts and bar models.',
    category: 'percentages-ratios',
  },
};

// Component name aliases for descriptions (matches VisualComponentRegistry)
const DESCRIPTION_ALIASES: Record<string, string> = {
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

  // Legacy aliases
  FractionSimplifier: 'EquivalentFractionBars',
  'fraction-simplifier': 'EquivalentFractionBars',
  CommonDenominatorVisual: 'FractionAdditionBars',
  'common-denominator-visual': 'FractionAdditionBars',
  'standard-algorithm': 'AdditionAlgorithm',
  'long-division-algorithm': 'LongDivisionDemo',
  'step-by-step-process': 'AdditionAlgorithm',
};

// Function to get description for a visual component
export const getVisualDescription = (type: string): string => {
  const normalizedType = DESCRIPTION_ALIASES[type] || type;
  const visualInfo = VISUAL_DESCRIPTIONS[normalizedType];

  if (!visualInfo) {
    return `Interactive visualization for ${type}. This component helps illustrate mathematical concepts through visual representation.`;
  }

  return visualInfo.description;
};

// Function to get category for a visual component
export const getVisualCategory = (type: string): string => {
  const normalizedType = DESCRIPTION_ALIASES[type] || type;
  const visualInfo = VISUAL_DESCRIPTIONS[normalizedType];

  return visualInfo?.category || 'general';
};

// Function to get all visual components by category
export const getVisualsByCategory = (category: string): string[] => {
  return Object.entries(VISUAL_DESCRIPTIONS)
    .filter(([_, info]) => info.category === category)
    .map(([name, _]) => name);
};

// Function to get all available categories
export const getVisualCategories = (): string[] => {
  const categories = new Set(
    Object.values(VISUAL_DESCRIPTIONS).map(info => info.category)
  );
  return Array.from(categories).sort();
};
