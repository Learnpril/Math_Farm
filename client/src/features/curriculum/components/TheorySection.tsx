import React from 'react';
import { TheoryConcept } from '../types';
import { MathExpression } from './MathExpression';
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
} from './visual-aids';

interface TheorySectionProps {
  concepts: TheoryConcept[];
  chapterNumber?: number;
}

export function TheorySection({
  concepts,
  chapterNumber = 1,
}: TheorySectionProps) {
  // Track used visuals to prevent reuse
  const usedVisuals = new Set<string>();
  // Global visual counter for unique numbering across all concepts
  let globalVisualCounter = 0;

  const getVisualDescription = (visualType: string): string => {
    switch (visualType) {
      // Place value and number structure
      case 'PlaceValueChart':
      case 'place-value-chart':
        return 'Below is a chart that shows how each digit in a number has a different value based on its position.';

      case 'DecimalPlaceValueChart':
      case 'decimal-place-chart':
        return 'The following chart demonstrates how decimal numbers work with tenths, hundredths, and more.';

      // Number lines and sequences
      case 'NumberLine':
      case 'number-line':
        return 'Below is a number line that helps you count, add, subtract, and see patterns.';

      // Base-10 blocks and concrete representations
      case 'Base10Blocks':
      case 'base-10-blocks':
      case 'fraction-circles':
      case 'fraction-bars':
      case 'fraction-strips':
        return 'The following visual blocks show how numbers are built from ones, tens, and hundreds.';

      // Expanded form and decomposition
      case 'ExpandedFormDiagram':
      case 'expanded-form-diagram':
      case 'area-model':
      case 'partial-products':
      case 'equivalent-fraction-models':
        return 'Below is a diagram that breaks apart numbers to show what each part is worth.';

      // Percentage visualization
      case 'PercentageGrid':
      case 'percent-grid':
      case 'pie-chart':
        return 'The following grid shows percentages as parts out of 100.';

      // Ratio and proportion visualization
      case 'RatioVisualizer':
      case 'ratio-bars':
      case 'proportion-cross':
        return 'Below is a visual that compares different amounts and shows how they relate to each other.';

      // Number comparison
      case 'NumberComparison':
      case 'comparison-chart':
        return 'The following comparison shows two numbers to help you see which is bigger, smaller, or if they are equal.';

      // Other comparisons and relationships
      case 'ComparisonChart':
      case 'conversion-chart':
      case 'equivalent-representations':
        return 'Below is a chart that compares different numbers or shows the same amount in different ways.';

      // Multiplication models
      case 'MultiplicationArrayModel':
      case 'array-model':
      case 'repeated-addition':
        return 'Below are dots arranged in rows and columns to show what multiplication means.';

      // Division models
      case 'DivisionGroupsModel':
      case 'equal-groups':
      case 'long-division-steps':
      case 'remainder-model':
      case 'sharing-with-leftovers':
        return 'The following demonstration shows how to share objects equally into groups to understand division.';

      // Addition algorithm
      case 'AdditionAlgorithm':
      case 'addition-algorithm':
        return 'Below is the step-by-step process for adding large numbers, including carrying.';

      // Subtraction algorithm
      case 'SubtractionAlgorithm':
      case 'subtraction-algorithm':
      case 'borrowing-demonstration':
        return 'The following shows the step-by-step process for subtracting large numbers, including borrowing.';

      // Counting dots for simple addition and subtraction
      case 'CountingDots':
      case 'counting-dots':
        return 'Below is an interactive visual that shows addition and subtraction using dots you can count step by step.';

      // Common Core strategies
      case 'CommonCoreStrategies':
      case 'common-core-strategies':
        return 'Below are interactive demonstrations of Common Core approaches like "making ten" and decomposition strategies that help build number sense.';

      // Multiplication visuals
      case 'MultiplicationGrid':
      case 'multiplication-grid':
        return 'Below is an interactive grid that shows multiplication as arrays of objects arranged in rows and columns.';

      case 'MultiplicationTable':
      case 'multiplication-table':
      case 'times-table':
        return 'Below is an interactive multiplication table (times table) showing all basic multiplication facts from 1×1 to 12×12. Click on any cell to see how the row and column numbers multiply together.';

      case 'DistributivePropertyDemo':
      case 'distributive-property-demo':
        return 'The following demonstration shows how to break apart numbers using the distributive property to make multiplication easier.';

      case 'RepeatedAdditionVisual':
      case 'repeated-addition-visual':
        return 'Below is a visual that shows how multiplication is really just repeated addition of the same number.';

      case 'TwoDigitMultiplicationDemo':
      case 'two-digit-multiplication-demo':
        return 'The following demonstration shows the step-by-step process for multiplying two-digit numbers using both the standard algorithm and area model.';

      // Division visuals
      case 'DivisionGroupingVisual':
      case 'division-grouping-visual':
        return 'Below is an interactive visual that shows division as splitting objects into equal groups, helping you understand what division really means.';

      case 'DivisionRemainderVisual':
      case 'division-remainder-visual':
        return "The following demonstration shows what happens when numbers don't divide evenly, explaining remainders step by step.";

      case 'LongDivisionDemo':
      case 'long-division-demo':
        return 'Below is an interactive step-by-step demonstration of the long division algorithm, showing the complete process for dividing larger numbers.';

      case 'DivisionFactsTable':
      case 'division-facts-table':
        return 'The following table shows the relationship between multiplication and division facts, helping you understand how these operations are connected.';

      // Other algorithms and procedures
      case 'standard-algorithm':
      case 'long-division-algorithm':
      case 'step-by-step-process':
        return 'Below is the standard way to solve math problems step by step.';

      // Decimal operations
      case 'decimal-alignment':
      case 'decimal-multiplication':
        return 'The following demonstration shows how to line up decimal points when doing math with decimal numbers.';

      // Real-world applications
      case 'discount-model':
      case 'recipe-scaling':
      case 'money-problems':
      case 'measurement-conversions':
        return 'Below are examples that show how math is used in everyday situations like shopping and cooking.';

      // Problem solving and strategies
      case 'problem-solving-flowchart':
      case 'strategy-diagram':
      case 'multi-step-diagram':
      case 'operation-sequence':
      case 'estimation-examples':
      case 'reasonableness-checks':
        return 'The following is a step-by-step guide for solving word problems and checking your answers.';

      default:
        return 'Below is a helpful visual that makes this math concept easier to understand.';
    }
  };

  const renderVisualAid = (
    visualType: string,
    conceptIndex: number,
    visualIndex: number
  ) => {
    // Check if this visual type has already been used
    if (usedVisuals.has(visualType)) {
      // Skip this visual to avoid reuse
      return null;
    }

    // Mark this visual type as used and increment global counter
    usedVisuals.add(visualType);
    globalVisualCounter++;

    // Sample numbers based on chapter context
    const getSampleNumber = () => {
      switch (chapterNumber) {
        case 1:
          return 45678; // Place value chapter
        case 2:
          return 1234; // Addition/subtraction
        case 3:
          return 567; // Multiplication
        default:
          return 1234;
      }
    };

    const renderVisualComponent = () => {
      switch (visualType) {
        // Place value and number structure
        case 'PlaceValueChart':
        case 'place-value-chart':
          return (
            <PlaceValueChart
              number={getSampleNumber().toString()}
              interactive={true}
              className='mt-4'
            />
          );

        // Decimal place value
        case 'DecimalPlaceValueChart':
        case 'decimal-place-chart':
          return (
            <DecimalPlaceValueChart
              number='123.456'
              interactive={true}
              className='mt-4'
            />
          );

        // Number lines and sequences
        case 'NumberLine':
        case 'number-line':
          return (
            <NumberLine
              min={0}
              max={100}
              step={10}
              highlightNumbers={[getSampleNumber() % 100]}
              interactive={true}
              className='mt-4'
            />
          );

        // Base-10 blocks and concrete representations
        case 'Base10Blocks':
        case 'base-10-blocks':
        case 'fraction-circles':
        case 'fraction-bars':
        case 'fraction-strips':
          return (
            <Base10Blocks
              number={getSampleNumber()}
              interactive={true}
              className='mt-4'
            />
          );

        // Expanded form and decomposition
        case 'ExpandedFormDiagram':
        case 'expanded-form-diagram':
        case 'area-model':
        case 'partial-products':
        case 'equivalent-fraction-models':
          return (
            <ExpandedFormDiagram
              number={getSampleNumber()}
              interactive={true}
              className='mt-4'
            />
          );

        // Percentage visualization
        case 'PercentageGrid':
        case 'percent-grid':
        case 'pie-chart':
          return (
            <PercentageGrid
              percentage={25}
              interactive={true}
              className='mt-4'
            />
          );

        // Ratio and proportion visualization
        case 'RatioVisualizer':
        case 'ratio-bars':
        case 'proportion-cross':
          return (
            <RatioVisualizer
              ratio1={3}
              ratio2={5}
              total={40}
              interactive={true}
              className='mt-4'
            />
          );

        // Number comparison
        case 'NumberComparison':
        case 'comparison-chart':
          return (
            <NumberComparison
              number1={12345}
              number2={12354}
              interactive={true}
              className='mt-4'
            />
          );

        // Other comparisons and relationships
        case 'ComparisonChart':
        case 'conversion-chart':
        case 'equivalent-representations':
          return (
            <ComparisonChart
              numbers={[getSampleNumber(), getSampleNumber() + 111]}
              interactive={true}
              className='mt-4'
            />
          );

        // Multiplication models
        case 'MultiplicationArrayModel':
        case 'array-model':
        case 'repeated-addition':
          return (
            <MultiplicationArrayModel
              rows={4}
              cols={6}
              interactive={true}
              className='mt-4'
            />
          );

        // Division models
        case 'DivisionGroupsModel':
        case 'equal-groups':
        case 'long-division-steps':
        case 'remainder-model':
        case 'sharing-with-leftovers':
          return (
            <DivisionGroupsModel
              dividend={24}
              divisor={6}
              interactive={true}
              className='mt-4'
            />
          );

        // Addition algorithm
        case 'AdditionAlgorithm':
        case 'addition-algorithm':
          return (
            <AdditionAlgorithm
              number1={156}
              number2={287}
              interactive={true}
              className='mt-4'
            />
          );

        // Subtraction algorithm
        case 'SubtractionAlgorithm':
        case 'subtraction-algorithm':
        case 'borrowing-demonstration':
          return (
            <SubtractionAlgorithm
              number1={524}
              number2={187}
              interactive={true}
              className='mt-4'
            />
          );

        // Counting dots for simple addition and subtraction
        case 'CountingDots':
        case 'counting-dots':
          return (
            <CountingDots
              problem='7 + 5'
              operation='addition'
              firstNumber={7}
              secondNumber={5}
              showAnswer={false}
            />
          );

        // Common Core strategies
        case 'CommonCoreStrategies':
        case 'common-core-strategies':
          return <CommonCoreStrategies problem='8 + 5' operation='addition' />;

        // Multiplication visuals
        case 'MultiplicationGrid':
        case 'multiplication-grid':
          return (
            <MultiplicationGrid
              rows={4}
              cols={6}
              interactive={true}
              showAnimation={true}
            />
          );

        case 'MultiplicationTable':
        case 'multiplication-table':
        case 'times-table':
          return (
            <MultiplicationTable
              maxNumber={12}
              interactive={true}
              className='mt-4'
            />
          );

        case 'DistributivePropertyDemo':
        case 'distributive-property-demo':
          return (
            <DistributivePropertyDemo
              number1={23}
              number2={4}
              interactive={true}
            />
          );

        case 'RepeatedAdditionVisual':
        case 'repeated-addition-visual':
          return (
            <RepeatedAdditionVisual
              multiplier={4}
              multiplicand={3}
              interactive={true}
            />
          );

        case 'TwoDigitMultiplicationDemo':
        case 'two-digit-multiplication-demo':
          return (
            <TwoDigitMultiplicationDemo
              number1={23}
              number2={45}
              interactive={true}
            />
          );

        // Division visuals
        case 'DivisionGroupingVisual':
        case 'division-grouping-visual':
          return (
            <DivisionGroupingVisual
              dividend={12}
              divisor={3}
              interactive={true}
            />
          );

        case 'DivisionRemainderVisual':
        case 'division-remainder-visual':
          return (
            <DivisionRemainderVisual
              dividend={17}
              divisor={5}
              interactive={true}
            />
          );

        case 'LongDivisionDemo':
        case 'long-division-demo':
          return (
            <LongDivisionDemo dividend={456} divisor={4} interactive={true} />
          );

        case 'DivisionFactsTable':
        case 'division-facts-table':
          return (
            <DivisionFactsTable
              maxNumber={12}
              interactive={true}
              className='mt-4'
            />
          );

        // Other algorithms and procedures
        case 'standard-algorithm':
        case 'long-division-algorithm':
        case 'step-by-step-process':
          return (
            <PlaceValueChart
              number={getSampleNumber().toString()}
              interactive={true}
              className='mt-4'
            />
          );

        // Decimal operations
        case 'decimal-alignment':
        case 'decimal-multiplication':
          return (
            <ExpandedFormDiagram
              number={getSampleNumber() / 100}
              interactive={true}
              className='mt-4'
            />
          );

        // Real-world applications
        case 'discount-model':
        case 'recipe-scaling':
        case 'money-problems':
        case 'measurement-conversions':
          return (
            <ComparisonChart
              numbers={[
                getSampleNumber(),
                Math.floor(getSampleNumber() * 1.25),
              ]}
              interactive={true}
              className='mt-4'
            />
          );

        // Problem solving and strategies
        case 'problem-solving-flowchart':
        case 'strategy-diagram':
        case 'multi-step-diagram':
        case 'operation-sequence':
        case 'estimation-examples':
        case 'reasonableness-checks':
          return (
            <div className='mt-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700'>
              <div className='flex items-center gap-3 mb-4'>
                <span className='text-2xl'>🧠</span>
                <h4 className='font-semibold text-blue-800 dark:text-blue-200'>
                  {visualType
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}
                </h4>
              </div>
              <div className='space-y-3 text-blue-700 dark:text-blue-300'>
                <div className='flex items-center gap-2'>
                  <span className='w-6 h-6 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-bold'>
                    1
                  </span>
                  <span>Read and understand the problem</span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='w-6 h-6 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-bold'>
                    2
                  </span>
                  <span>Identify what you know and what you need to find</span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='w-6 h-6 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-bold'>
                    3
                  </span>
                  <span>Choose the appropriate operation or strategy</span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='w-6 h-6 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-bold'>
                    4
                  </span>
                  <span>Solve step by step</span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='w-6 h-6 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-bold'>
                    5
                  </span>
                  <span>Check your answer for reasonableness</span>
                </div>
              </div>
            </div>
          );

        default:
          return (
            <div className='mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
              <p className='text-sm text-blue-800 dark:text-blue-200'>
                📊 Interactive visual aid: <strong>{visualType}</strong>
              </p>
              <p className='text-xs text-blue-600 dark:text-blue-400 mt-1'>
                This visual aid helps illustrate the concept with interactive
                elements.
              </p>
            </div>
          );
      }
    };

    return (
      <div key={visualIndex} className='mt-6'>
        <div className='mb-3'>
          <h4 className='text-lg font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2'>
            <span className='text-2xl'>📊</span>
            Visual {chapterNumber}-{globalVisualCounter}
          </h4>
          <p className='text-sm text-purple-600 dark:text-purple-400 mt-1'>
            {getVisualDescription(visualType)}
          </p>
        </div>
        <div className='border-l-4 border-purple-300 dark:border-purple-600 pl-4'>
          {renderVisualComponent()}
        </div>
      </div>
    );
  };

  return (
    <div className='max-w-4xl mx-auto'>
      {/* Main Chapter Content */}
      <div className='prose prose-lg max-w-none dark:prose-invert'>
        {concepts.map((concept, index) => {
          // Enhanced content based on concept title
          const getEnhancedContent = (
            title: string,
            originalContent: string
          ) => {
            // Chapter 1: Numbers and Place Value
            if (chapterNumber === 1) {
              switch (title) {
                case 'The Base-10 Number System':
                  return `Imagine grouping apples: when you have ten, you bundle them into a 'ten,' freeing up space for more. This is the essence of base-10 - grouping by tens.

Our number system is based on groups of 10. Each position in a number represents a different power of 10. Moving from right to left, each position is 10 times larger than the previous one. The base-10 (decimal) system uses ten digits (0-9), where each position represents a power of 10, starting from the right: 10⁰ (units), 10¹ (tens), 10² (hundreds), etc.

To understand this concretely, begin with base-10-blocks: a single block is 1 (unit), ten units make a 'long' (ten), ten longs a 'flat' (hundred). For 23: two longs and three units. Progress to symbolic: 23 = 2 × 10 + 3 × 1.

Base-10 likely arose from ten fingers, evidenced in ancient Egyptian hieroglyphs (ropes for tens, coils for hundreds). Alternatives like base-60 (Babylonian) were used for fractions, but base-10's simplicity won for everyday use. We see this system everywhere today: in metrics, kilometers (10³ meters); in computing, though binary underneath, user interfaces are decimal (e.g., file sizes like 1.2 GB). In population stats, 1,000,000 uses place value for readability.

Common misconceptions include thinking all number systems work like base-10, or ignoring the importance of zero as a placeholder. Remember: our ten-finger heritage shaped mathematics itself.`;

                case 'Place Value Positions':
                  return `Think of place value like seats in a theater - each 'place' has a different value based on position, from front-row units to balcony thousands.

Place values are the positional weights: rightmost is units (10⁰ = 1), then tens (10¹ = 10), hundreds (10² = 100), etc., extending left for integers and right for decimals (tenths 10⁻¹, etc.). Each digit in a number has a specific place value: ones, tens, hundreds, thousands, ten thousands, hundred thousands, and millions. The value of a digit depends on its position.

To work with this concretely, start with a place-value-chart to label columns. For 372: 3 in hundreds, 7 in tens, 2 in units. Build with base-10-blocks: three flats, seven longs, two units. This helps visualize how 372 = 3 × 100 + 7 × 10 + 2 × 1.

Place value evolved from Indian sundials (positional without zero) to full system with zero (Brahmagupta, 628 CE), enabling efficient arithmetic over additive systems like Greek letters. Today, in banking, check amounts rely on places (e.g., $1,234.56). In engineering, precision machining uses decimal places for exact measurements.

Watch out for confusing place names (thinking "ten thousands" means 10 × 1000) or believing trailing zeros don't matter. Zero changes everything: consider the difference between 15 and 105.`;

                case 'Expanded Form':
                  return `Expanded form is like unpacking a box - break down a number into its place value parts to see what's inside.

Expanded form writes a number as sum of its digit-place products, e.g., 456 = 400 + 50 + 6. This shows the value of each digit in a number, helping us understand what each digit contributes to the total value.

Start concretely: Use base-10-blocks to group, then write. Symbolic: Multiply digits by places. Abstract: Include exponents, 456 = 4 × 10² + 5 × 10¹ + 6 × 10⁰. This progression from concrete to abstract mirrors how mathematical understanding develops.

This concept ties to place value invention, aiding abacus calculations in China (200 BCE). Today we use expanded form in budgets (break down $123 into hundreds, etc.) and as a precursor to scientific notation for very large or small numbers.

A common error is omitting zeros in expanded form (writing 405 as 400 + 5 instead of 400 + 0 + 5). Think about breaking apart objects in real life - expanded form is similar to taking apart a toy to see its parts.`;

                case 'Comparing Numbers':
                  return `Comparing numbers is like weighing fruits - align by size (places) to see which is larger.

To compare numbers, start from the leftmost digit and compare place by place. The first position where digits differ determines which number is larger. Compare by aligning places from left; first differing digit decides, e.g., 456 > 432 since 5>3 in tens.

Work concretely with comparison-charts, then progress to abstract inequalities <, >, =. Line up numbers by place value, then scan from left to right until you find a difference.

Early inequalities appeared in Babylonian tablets for astronomy, showing this is an ancient mathematical need. Today we use comparisons constantly: scores, heights, prices, rankings, and measurements all rely on number comparison.

Students often err by thinking longer numbers are always bigger, or comparing from right to left instead of left to right. Remember: when you line up for height, you compare from the top down. Numbers work the same way - compare from left to right.`;

                default:
                  return originalContent;
              }
            }

            // Chapter 2: Addition and Subtraction
            if (chapterNumber === 2) {
              switch (title) {
                case 'Addition with Regrouping':
                  return `When combining quantities pushes a place value beyond its limit - like filling a cup to overflow - we "trade up," regrouping tens from units, hundreds from tens. Intuitively, imagine ten marbles filling a small box; add one more, and you bundle ten into a larger "ten" box, leaving one. This is addition with regrouping, or carrying, ensuring place value integrity.

Formally, regrouping occurs when a place sum ≥10; carry 1 to the next higher place. For 29 + 36: Units 9 + 6 = 15 (write 5, carry 1); tens 2 + 3 + 1 = 6; sum 65. This exchanges 10 units for 1 ten, mirroring base-10 structure.

Step-by-step development: Concrete with base-10-blocks - 9 units + 6 = 15; trade 10 for a ten-rod, leaving 5 units, add to existing tens. Semi-abstract: Draw models, circling groups of 10. Abstract: Algorithmic - align vertically, add right-to-left, carry as needed. Example: 456 + 789. Units: 6+9=15 (5, carry 1); tens: 5+8+1=14 (4, carry 1); hundreds: 4+7+1=12 (2, carry 1 to thousands). Sum: 1245.

Historically, carrying emerged with decimal systems. Egyptians regrouped symbols (ten frogs to a coil), but true algorithms came with Al-Khwarizmi (825 CE), describing carrying in column addition. European texts by 1400s, like Pacioli's "Summa" (1494), standardized it for accounting.

Applications include multi-digit budgets - $999 + $2 = $1001, carrying across places. Construction: Add beam lengths 456 cm + 789 cm = 1245 cm. Data analysis: Sum populations 12,345 + 67,890 = 80,235.

Watch out for forgetting to carry - resulting in 29 + 36 = 55 instead of 65. Use base-10-blocks to visualize overflow. Another error is carrying to the wrong column - address with the addition-algorithm visual, highlighting place values step by step.`;

                case 'Subtraction with Regrouping':
                  return `Borrowing addresses shortfall: like borrowing sugar from a neighbor, but in places - trade a ten for ten units when units are insufficient. Intuitively, if you have 1 ten and 2 units (12) minus 5 units, "trade down" the ten into ten units, making 12 units total, then subtract 5 for 7.

Formally, when the minuend digit is smaller than the subtrahend digit, borrow 1 from the left place, adding 10 to the current place while subtracting 1 from the lending place. For 52 - 27: Units 2 < 7, so borrow from tens: 12 - 7 = 5; tens (5-1) - 2 = 2; result 25.

Step-by-step development: Concrete - base-10-blocks: For 32-17, units 2<7; trade one ten-rod for 10 units (now 12 units, 2 tens). 12-7=5 units; 2-1=1 ten; result 15. Semi-abstract: Cross out and rewrite borrowed amounts. Abstract: 503 - 278. Units 3-8: borrow from tens (but tens is 0, so borrow from hundreds first): 13-8=5; tens 10-7=3 (after borrowing); hundreds 4-2=2; result 225.

Historically, borrowing methods varied. Equal additions (adding the same amount to both numbers to avoid borrowing) was popular from 1700-1900. Modern decomposition (borrowing) became standard in U.S. schools post-1940s, emphasizing place value understanding.

Applications include banking - $500 - $278 = $222 for remaining balance. Measurements - 503 mm - 278 mm = 225 mm difference. Time calculations - borrowing minutes from hours when subtracting time intervals.

Students often err by borrowing without adjusting the lending place - use the borrowing-demonstration visual to show the complete process. Another challenge is borrowing across zeros (like 500-123) - work through this step-by-step, borrowing from the hundreds to tens, then tens to units.`;

                default:
                  return originalContent;
              }
            }

            // Chapter 3: Multiplication Basics
            if (chapterNumber === 3) {
              switch (title) {
                case 'Understanding Multiplication':
                  return `Multiplication starts with grouping, an intuitive leap from addition: instead of adding 3 + 3 + 3 four times, multiply 3 × 4 for 12. Picture arranging cookies in rows - 3 per row, 4 rows: the total is the product. This transforms how we handle repeated quantities, making calculations faster and revealing mathematical patterns.

Formally, multiplication is a binary operation where a × b = p, with a and b as factors, p the product. It scales a by b times, rooted in set theory as Cartesian product cardinality. The operation represents repeated addition: 4 × 3 means "add 3 four times" or equivalently "add 4 three times."

Step-by-step development: Concrete - use base-10-blocks: 3 × 4 as four groups of three units = 12. Semi-abstract - number-line skips: from 0, jump 3 units four times to reach 12. Abstract - extend to larger numbers: 23 × 4 = (20 × 4) + (3 × 4) = 80 + 12 = 92, decomposing by place value from Chapter 1.

Historically, multiplication arose for scaling needs. Sumerian tablets (4000 BCE) listed multiples for calculating wages and trade quantities. Egyptians developed duplication methods (1650 BCE Ahmes papyrus) where they multiplied by repeatedly halving one factor while doubling the other - for example, 13 × 12: halve 13 to get 1 (noting odd numbers), then sum the corresponding doubles. Greeks geometricized multiplication: Euclid's "Elements" (300 BCE) proved fundamental properties like distributivity and commutativity.

Real-world applications make multiplication indispensable: scaling maps (2 cm represents 1 km, so 50 km = 100 cm on map), calculating traffic flow (cars per lane × number of lanes × time), and computing array dimensions in programming. These connect directly to our place value foundation - without understanding that 23 = 20 + 3, we couldn't break apart multiplication problems effectively.

Common misconceptions include confusing multiplication with addition - clarify that multiplication shortens repeated addition. Students sometimes think order matters, but commutativity (a × b = b × a) always holds - demonstrate this with arrays that can be rotated. Another pitfall is assuming multiplication always makes numbers bigger, forgetting about zero (5 × 0 = 0) and eventually fractions.`;

                case 'Distributive Property':
                  return `The distributive property unlocks multiplication's power by allowing us to break apart numbers strategically. Like unpacking a large box into smaller, manageable pieces, we can split one factor and multiply each part separately, then combine the results.

Formally, the distributive property states that a × (b + c) = (a × b) + (a × c). This means we can distribute the multiplication across addition inside parentheses. For example, 23 × 4 = (20 + 3) × 4 = (20 × 4) + (3 × 4) = 80 + 12 = 92.

Step-by-step development: Concrete - use area models with base-10-blocks: arrange 23 × 4 as a rectangle, then split it into a 20 × 4 rectangle and a 3 × 4 rectangle. Semi-abstract - draw rectangular diagrams showing the split. Abstract - apply algebraically to any numbers, recognizing that this property works because multiplication represents area, and areas can be combined.

This property has ancient roots. Babylonians (1800 BCE) used similar decomposition methods for their multiplication tables, breaking complex calculations into simpler parts. Indian mathematicians like Brahmagupta (628 CE) formalized these ideas, while Islamic scholars like Al-Khwarizmi (825 CE) developed systematic algorithms based on distributive principles.

Real-world applications include mental math shortcuts: calculating 99 × 5 as (100 - 1) × 5 = 500 - 5 = 495, or finding areas of irregular shapes by breaking them into rectangles. In construction, contractors use this to estimate materials: a 23-foot by 4-foot deck needs (20 × 4) + (3 × 4) = 80 + 12 = 92 square feet of decking.

Students often struggle with the distributive property by forgetting to multiply both parts or by adding instead of multiplying. Use area models consistently to show why this works - the total area doesn't change whether you calculate it as one rectangle or as the sum of smaller rectangles. Another common error is not maintaining the correct operation: (a + b) × c requires multiplying both a and b by c, not adding c to both.`;

                case 'Multi-digit Multiplication':
                  return `Multi-digit multiplication extends our basic facts to handle larger numbers systematically. Like building a house requires organizing materials and following a plan, multi-digit multiplication requires careful attention to place values and systematic organization of partial products.

The process builds on everything we've learned: place value from Chapter 1 tells us that 56 = 50 + 6, addition from Chapter 2 helps us combine partial products, and the distributive property lets us break apart the problem. For 56 × 78, we calculate 56 × (70 + 8) = (56 × 70) + (56 × 8) = 3,920 + 448 = 4,368.

Step-by-step development: Concrete - use base-10-blocks to build rectangular arrays, physically showing how 12 × 13 creates a rectangle that can be split into four smaller rectangles: (10 × 10) + (10 × 3) + (2 × 10) + (2 × 3). Semi-abstract - draw area models or use the lattice method, organizing partial products in grids. Abstract - master the standard algorithm, aligning place values and managing carries systematically.

Historically, various cultures developed different approaches. The lattice method originated in India around 400 CE and spread through Islamic scholars to medieval Europe. Fibonacci's "Liber Abaci" (1202) introduced the long multiplication method we use today. Different algorithms emerged: the Russian peasant method (similar to Egyptian duplication), the Vedic mathematics techniques from ancient India, and various mental math strategies.

Real-world applications are everywhere: calculating areas (a 56-meter by 78-meter field = 4,368 square meters), scaling recipes (making 78 servings of a recipe that serves 56 people), or computing costs (56 items at $78 each = $4,368). These calculations appear in construction, manufacturing, finance, and scientific research.

Common errors include misaligning partial products - the key is understanding that 56 × 70 means 56 × 7 tens, so the result should end in zero. Another frequent mistake is addition errors when combining partial products - always double-check this final step. Students sometimes forget to include all partial products or mix up the place values when using the standard algorithm.`;

                default:
                  return originalContent;
              }
            }

            // Chapter 4: Division Basics
            if (chapterNumber === 4) {
              switch (title) {
                case 'Understanding Division':
                  return `Division starts with partitioning, an intuitive counterpart to multiplication: take 12 apples and share among 4 people - each gets 3. This "sharing" or "grouping" reveals division's dual nature: quotative (how many groups of 4 in 12?) or partitive (12 shared by 4, how many each?). Division completes our arithmetic foundation, allowing us to partition quantities, find rates, and reverse multiplication in ways that model fairness and measurement.

Formally, division is multiplication's inverse: a ÷ b = q (or a / b = q), where q (quotient) satisfies q × b = a, assuming b ≠ 0. With remainders, we have the division algorithm: a = b × q + r, where 0 ≤ r < b. This means every division can be expressed as quotient times divisor plus remainder.

Step-by-step development: Concrete - use base-10-blocks: Divide 15 by 3 as three groups of 5 units each. Semi-abstract - number-line backward skips: From 15, subtract 3 repeatedly until reaching 0, counting the skips (5 times). Abstract - multi-digit: 92 ÷ 4 = (80 ÷ 4) + (12 ÷ 4) = 20 + 3 = 23, breaking apart by place value from Chapter 1.

Historically, division addressed allocation needs across civilizations. Sumerian tablets (4000 BCE) used inverse multiplication tables for dividing resources like beer rations, their base-60 system proving ideal for fractions. Egyptians (2000 BCE) employed unit fractions in the Ahmes papyrus, dividing via doubling inverses - to divide 19 by 3, they found multiples that summed to 19. Greeks like Euclid (300 BCE) formalized division as ratios in "Elements," proving the division algorithm we still use today.

Real-world applications make division essential for equity and analysis: sharing (divide 24 cookies among 6 friends = 4 each), calculating rates (120 miles ÷ 2 hours = 60 mph), scaling recipes (3/4 cup for 4 servings ÷ 2 = 3/8 cup per pair), and construction planning (1000 sq ft ÷ 50 sq ft tiles = 20 needed). These connect to our previous foundations - without multiplication facts, division becomes tedious; subtraction underpins its mechanics.

Common misconceptions include thinking division always makes numbers smaller - but dividing by fractions less than 1 actually increases the result (10 ÷ 0.5 = 20). Another error is attempting to divide by zero, which is undefined because no quotient can satisfy the requirement. Students also sometimes confuse dividend and divisor order, forgetting that division is not commutative like addition and multiplication.`;

                case 'Division with Remainders':
                  return `When numbers don't divide evenly, we encounter remainders - the "leftover" amount that represents what cannot be distributed equally. Think of sharing 17 stickers among 5 children: each gets 3, but 2 stickers remain. This remainder concept is crucial for real-world problem solving where perfect division rarely occurs.

Formally, when dividing a by b, if the result isn't exact, we express it as a = b × q + r, where q is the quotient and r is the remainder, with the critical constraint that 0 ≤ r < b. The remainder must always be smaller than the divisor - this ensures our division is complete and unique.

Step-by-step development: Concrete - use physical objects: Share 17 blocks among 5 groups, resulting in 3 per group with 2 left over. Semi-abstract - draw pictures showing the sharing process and highlighting leftovers. Abstract - apply the division algorithm: 17 ÷ 5 = 3 R2 because 3 × 5 + 2 = 17, and 2 < 5.

Historically, remainders posed challenges for ancient mathematicians. Babylonians (1800 BCE) developed sophisticated methods for handling fractional parts in their astronomical calculations. Chinese mathematicians in the "Nine Chapters on the Mathematical Art" (100 BCE) used remainder concepts for solving practical problems like distributing grain. The formal division algorithm with remainders wasn't fully developed until Indian mathematicians like Brahmagupta (628 CE) systematized these ideas.

Real-world applications of remainders are everywhere: in scheduling (if 100 minutes of work needs to be done in 7-minute intervals, you complete 14 intervals with 2 minutes remaining), in packaging (137 items in boxes of 12 means 11 full boxes plus 5 items for a partial box), and in time calculations (converting 100 minutes to hours gives 1 hour and 40 minutes remaining).

Students often struggle with interpreting remainders contextually. Sometimes we round up (if you need 137 items and boxes hold 12, you need 12 boxes, not 11), sometimes we use the remainder as a fraction (17 ÷ 5 = 3 2/5), and sometimes we ignore it (if dividing people into equal groups). The key is understanding what the remainder represents in each specific situation.`;

                case 'Long Division Algorithm':
                  return `Long division extends our division capabilities to handle larger numbers systematically, much like the standard algorithms for addition, subtraction, and multiplication. It's a methodical process that breaks complex divisions into manageable steps: divide, multiply, subtract, bring down, and repeat.

The algorithm follows a precise sequence: First, determine how many times the divisor fits into the leftmost digits of the dividend. Multiply this quotient digit by the divisor, subtract the result from those digits, then bring down the next digit and repeat. This process continues until all digits have been processed.

Step-by-step development: Concrete - use base-10-blocks to physically model the process: for 144 ÷ 12, arrange 144 blocks and systematically group them into sets of 12. Semi-abstract - use the traditional long division format with careful alignment and clear steps. Abstract - master multi-digit divisors like 987 ÷ 23, requiring estimation skills and careful arithmetic.

Historically, long division algorithms evolved across cultures. Al-Khwarizmi (825 CE) described systematic division methods in his algebraic works, using placeholders that prefigured our modern approach. Medieval European texts standardized the format by the 1600s, though various alternative methods existed - the "galley method" used in Renaissance Italy arranged calculations differently but achieved the same results.

The algorithm's power lies in its systematic approach to complex problems. Consider 789 ÷ 23: We estimate that 23 goes into 78 about 3 times (since 23 × 3 = 69), subtract to get 9, bring down the final 9 to make 99, then determine that 23 goes into 99 four times (23 × 4 = 92), leaving remainder 7. The final answer is 34 R7.

Real-world applications include calculating unit costs (if 789 items cost $23 each, how many can you buy with a budget?), determining time intervals (789 minutes divided into 23-minute segments), and solving measurement problems in construction and engineering where precise calculations matter.

Common errors include misaligning digits in the quotient, making arithmetic mistakes in the multiplication or subtraction steps, and incorrectly estimating how many times the divisor fits into the partial dividend. The key to mastery is practicing the systematic approach and checking work by multiplying the quotient by the divisor and adding any remainder to verify it equals the original dividend.`;

                default:
                  return originalContent;
              }
            }

            return originalContent;
          };

          const enhancedContent = getEnhancedContent(
            concept.title,
            concept.content
          );

          return (
            <div key={index} className='mb-12'>
              <h4 className='text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 border-b-2 border-purple-200 dark:border-purple-700 pb-2'>
                1.{index + 1} {concept.title}
              </h4>

              <div className='text-gray-700 dark:text-gray-300 leading-relaxed space-y-4 mb-8'>
                {enhancedContent.split('\n\n').map((paragraph, pIndex) => {
                  // Handle special formatting
                  if (
                    paragraph.includes('Common misconceptions') ||
                    paragraph.includes('Watch out for') ||
                    paragraph.includes('A common error') ||
                    paragraph.includes('Students often err')
                  ) {
                    return (
                      <div
                        key={pIndex}
                        className='my-6 p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 rounded-r-lg'
                      >
                        <p className='font-semibold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2'>
                          <span>⚠️</span>
                          Common Pitfalls
                        </p>
                        <p className='text-amber-700 dark:text-amber-300'>
                          {paragraph}
                        </p>
                      </div>
                    );
                  }
                  return (
                    <p key={pIndex} className='mb-4 text-lg leading-relaxed'>
                      {paragraph}
                    </p>
                  );
                })}
              </div>

              {concept.latex && (
                <div className='my-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm'>
                  <MathExpression
                    inline={false}
                    className='text-xl text-center'
                  >
                    {concept.latex}
                  </MathExpression>
                </div>
              )}

              {concept.visuals && concept.visuals.length > 0 && (
                <div className='my-8'>
                  <div className='space-y-2'>
                    {concept.visuals
                      .map((visual, vIndex) =>
                        renderVisualAid(visual, index, vIndex)
                      )
                      .filter(visual => visual !== null)}
                  </div>
                </div>
              )}

              {/* Self-check as a simple question - Skip for Common Core Concepts since it has its own interactive Quick Check */}
              {!(chapterNumber === 2 && index === 3) && (
                <div className='my-8 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700'>
                  <p className='font-medium text-purple-800 dark:text-purple-200 mb-2'>
                    ✓ Quick Check:
                  </p>
                  <p className='text-purple-700 dark:text-purple-300 italic'>
                    {chapterNumber === 1 &&
                      index === 0 &&
                      'Can you represent 56 using base-10 blocks? Try it mentally: 5 tens and 6 units.'}
                    {chapterNumber === 1 &&
                      index === 1 &&
                      "In the number 3,742, what is the value of the digit 7? (Answer: 700 - it's in the hundreds place)"}
                    {chapterNumber === 1 &&
                      index === 2 &&
                      'Write 789 in expanded form. (Answer: 700 + 80 + 9)'}
                    {chapterNumber === 1 &&
                      index === 3 &&
                      'Which is larger: 1,234 or 1,243? How do you know?'}

                    {chapterNumber === 2 &&
                      index === 1 &&
                      'Calculate 52 - 27 using borrowing. (Answer: 25)'}
                    {chapterNumber === 2 &&
                      index === 2 &&
                      'What is 15 - 8? Show your work step by step. (Answer: 7)'}
                    {chapterNumber === 3 &&
                      index === 0 &&
                      'Show 4 × 6 as repeated addition. (Answer: 6 + 6 + 6 + 6 = 24)'}
                    {chapterNumber === 3 &&
                      index === 1 &&
                      'Use the distributive property to calculate 15 × 4. (Answer: (10 + 5) × 4 = 40 + 20 = 60)'}
                    {chapterNumber === 3 &&
                      index === 2 &&
                      'Calculate 23 × 45 using partial products. (Answer: 1,035)'}
                    {chapterNumber === 4 &&
                      index === 0 &&
                      'Share 20 items equally among 4 groups. How many in each group? (Answer: 5)'}
                    {chapterNumber === 4 &&
                      index === 1 &&
                      'Calculate 17 ÷ 5 and express with remainder. (Answer: 3 R2)'}
                    {chapterNumber === 4 &&
                      index === 2 &&
                      'Use long division to find 456 ÷ 12. (Answer: 38)'}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Chapter Summary */}
      <div className='mt-16 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg'>
        <h4 className='font-semibold text-green-800 dark:text-green-200 mb-4 flex items-center gap-2'>
          <span className='text-xl'>📝</span>
          Chapter Summary
        </h4>
        <div className='text-green-700 dark:text-green-300 space-y-2'>
          <p>
            In this chapter, we explored the fundamental concepts that make our
            number system work:
          </p>
          <ul className='list-disc list-inside space-y-1 ml-4'>
            <li>
              The base-10 system groups numbers by tens, reflecting our
              ten-finger heritage
            </li>
            <li>
              Place value gives each digit a specific meaning based on its
              position
            </li>
            <li>Expanded form breaks numbers into their component parts</li>
            <li>
              Comparing numbers requires systematic left-to-right analysis
            </li>
          </ul>
          <p className='mt-4 font-medium'>
            These concepts form the foundation for all arithmetic operations and
            mathematical reasoning that follows.
          </p>
        </div>
      </div>
    </div>
  );
}
