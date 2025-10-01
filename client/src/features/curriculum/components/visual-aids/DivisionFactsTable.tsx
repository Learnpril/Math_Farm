import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Divide } from 'lucide-react';

interface DivisionFactsTableProps {
  maxNumber?: number;
  interactive?: boolean;
  className?: string;
}

export const DivisionFactsTable: React.FC<DivisionFactsTableProps> = ({
  maxNumber = 12,
  interactive = true,
  className = '',
}) => {
  const [selectedCell, setSelectedCell] = useState<{
    dividend: number;
    divisor: number;
  } | null>(null);
  const [highlightedRow, setHighlightedRow] = useState<number | null>(null);
  const [highlightedCol, setHighlightedCol] = useState<number | null>(null);

  const handleCellClick = (dividend: number, divisor: number) => {
    if (!interactive) return;

    if (
      selectedCell?.dividend === dividend &&
      selectedCell?.divisor === divisor
    ) {
      setSelectedCell(null);
      setHighlightedRow(null);
      setHighlightedCol(null);
    } else {
      setSelectedCell({ dividend, divisor });
      setHighlightedRow(dividend);
      setHighlightedCol(divisor);
    }
  };

  const getCellClassName = (
    dividend: number,
    divisor: number,
    isHeader: boolean = false
  ) => {
    const baseClasses =
      'border border-border text-center font-medium transition-colors duration-200';

    if (isHeader) {
      return `${baseClasses} bg-primary text-primary-foreground font-bold p-3`;
    }

    const isHighlighted =
      highlightedRow === dividend || highlightedCol === divisor;
    const isSelected =
      selectedCell?.dividend === dividend && selectedCell?.divisor === divisor;

    if (isSelected) {
      return `${baseClasses} bg-primary text-primary-foreground p-3 cursor-pointer`;
    } else if (isHighlighted) {
      return `${baseClasses} bg-primary/20 text-foreground p-3 cursor-pointer`;
    } else {
      return `${baseClasses} bg-card text-card-foreground p-3 hover:bg-primary/10 hover:text-foreground cursor-pointer`;
    }
  };

  // Generate division facts (products from 1x1 to 12x12)
  const generateDivisionFacts = () => {
    const facts = [];
    for (let multiplier = 1; multiplier <= maxNumber; multiplier++) {
      for (let multiplicand = 1; multiplicand <= maxNumber; multiplicand++) {
        const product = multiplier * multiplicand;
        if (product <= maxNumber * maxNumber) {
          facts.push({
            dividend: product,
            divisor: multiplier,
            quotient: multiplicand,
          });
        }
      }
    }
    return facts.sort(
      (a, b) => a.dividend - b.dividend || a.divisor - b.divisor
    );
  };

  const divisionFacts = generateDivisionFacts();

  return (
    <Card className={`w-full max-w-5xl mx-auto ${className}`}>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <Divide className='w-5 h-5 text-primary' />
          <CardTitle className='text-lg'>Division Facts Table</CardTitle>
        </div>
        <p className='text-sm text-muted-foreground'>
          {interactive
            ? 'Click on any cell to see the division fact and its multiplication check.'
            : 'This table shows division facts and their relationship to multiplication.'}
        </p>
      </CardHeader>

      <CardContent>
        <div className='space-y-6'>
          {/* Quick Reference */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='p-4 bg-primary/10 rounded-lg border border-primary/20'>
              <h4 className='font-semibold text-primary mb-2'>
                Division Facts
              </h4>
              <p className='text-sm text-muted-foreground'>
                Every multiplication fact creates a division fact: if 3 × 4 =
                12, then 12 ÷ 3 = 4 and 12 ÷ 4 = 3
              </p>
            </div>

            <div className='p-4 bg-accent/10 rounded-lg border border-accent/20'>
              <h4 className='font-semibold text-accent mb-2'>
                Inverse Operations
              </h4>
              <p className='text-sm text-muted-foreground'>
                Division "undoes" multiplication. They are inverse operations
                that work together.
              </p>
            </div>

            <div className='p-4 bg-secondary rounded-lg border border-border'>
              <h4 className='font-semibold text-foreground mb-2'>
                Check Your Work
              </h4>
              <p className='text-sm text-muted-foreground'>
                Always verify division: quotient × divisor = dividend
              </p>
            </div>
          </div>

          {/* Sample Division Facts Grid */}
          <div className='overflow-x-auto'>
            <div className='grid grid-cols-4 gap-2 max-w-4xl mx-auto'>
              {/* Headers */}
              <div className='font-bold text-center p-2 bg-primary text-primary-foreground rounded'>
                Dividend
              </div>
              <div className='font-bold text-center p-2 bg-primary text-primary-foreground rounded'>
                ÷
              </div>
              <div className='font-bold text-center p-2 bg-primary text-primary-foreground rounded'>
                Divisor
              </div>
              <div className='font-bold text-center p-2 bg-primary text-primary-foreground rounded'>
                = Quotient
              </div>

              {/* Sample facts */}
              {[
                { dividend: 12, divisor: 3, quotient: 4 },
                { dividend: 12, divisor: 4, quotient: 3 },
                { dividend: 24, divisor: 6, quotient: 4 },
                { dividend: 24, divisor: 4, quotient: 6 },
                { dividend: 36, divisor: 6, quotient: 6 },
                { dividend: 36, divisor: 9, quotient: 4 },
                { dividend: 48, divisor: 8, quotient: 6 },
                { dividend: 48, divisor: 6, quotient: 8 },
              ].map((fact, index) => {
                const isHighlighted =
                  selectedCell?.dividend === fact.dividend &&
                  selectedCell?.divisor === fact.divisor;
                const cellClass = isHighlighted
                  ? 'p-2 text-center rounded bg-primary text-primary-foreground cursor-pointer'
                  : 'p-2 text-center rounded bg-card text-card-foreground hover:bg-primary/10 cursor-pointer';

                return (
                  <React.Fragment key={index}>
                    <div
                      className={cellClass}
                      onClick={() =>
                        handleCellClick(fact.dividend, fact.divisor)
                      }
                    >
                      {fact.dividend}
                    </div>
                    <div className='p-2 text-center text-muted-foreground'>
                      ÷
                    </div>
                    <div
                      className={cellClass}
                      onClick={() =>
                        handleCellClick(fact.dividend, fact.divisor)
                      }
                    >
                      {fact.divisor}
                    </div>
                    <div
                      className={cellClass}
                      onClick={() =>
                        handleCellClick(fact.dividend, fact.divisor)
                      }
                    >
                      {fact.quotient}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Selected Fact Display */}
          {selectedCell && (
            <div className='p-4 bg-primary/10 rounded-lg border border-primary/20'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-primary mb-2'>
                  {selectedCell.dividend} ÷ {selectedCell.divisor} ={' '}
                  {selectedCell.dividend / selectedCell.divisor}
                </div>
                <div className='text-lg text-muted-foreground mb-2'>
                  Check: {selectedCell.dividend / selectedCell.divisor} ×{' '}
                  {selectedCell.divisor} = {selectedCell.dividend}
                </div>
                <div className='text-sm text-accent'>
                  This division fact comes from the multiplication:{' '}
                  {selectedCell.dividend / selectedCell.divisor} ×{' '}
                  {selectedCell.divisor} = {selectedCell.dividend}
                </div>
              </div>
            </div>
          )}

          {/* Interactive Practice Section */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='p-4 bg-secondary rounded-lg border border-border'>
              <h4 className='font-semibold text-foreground mb-3'>
                🎯 Practice Strategy
              </h4>
              <ul className='text-sm text-muted-foreground space-y-2'>
                <li>
                  • Start with division facts you know from multiplication
                </li>
                <li>• If you know 6 × 7 = 42, then you know 42 ÷ 6 = 7</li>
                <li>
                  • Practice fact families together (6×7, 7×6, 42÷6, 42÷7)
                </li>
                <li>• Use the multiplication table to find division answers</li>
              </ul>
            </div>

            <div className='p-4 bg-accent/10 rounded-lg border border-accent/20'>
              <h4 className='font-semibold text-accent mb-3'>
                🔍 Fact Families
              </h4>
              <div className='text-sm text-muted-foreground space-y-2'>
                <p>
                  <strong>Example Family:</strong>
                </p>
                <p>3 × 4 = 12</p>
                <p>4 × 3 = 12</p>
                <p>12 ÷ 3 = 4</p>
                <p>12 ÷ 4 = 3</p>
                <p className='text-accent font-medium'>
                  All four facts use the same three numbers!
                </p>
              </div>
            </div>
          </div>

          {/* Common Division Facts */}
          <div className='p-4 bg-card rounded-lg border border-border'>
            <h4 className='font-semibold text-foreground mb-3'>
              📚 Essential Division Facts to Memorize
            </h4>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
              <div>
                <h5 className='font-medium text-primary mb-2'>÷ 2 (Halves)</h5>
                <div className='space-y-1 text-muted-foreground'>
                  <div>4 ÷ 2 = 2</div>
                  <div>6 ÷ 2 = 3</div>
                  <div>8 ÷ 2 = 4</div>
                  <div>10 ÷ 2 = 5</div>
                </div>
              </div>
              <div>
                <h5 className='font-medium text-primary mb-2'>÷ 5 (Fifths)</h5>
                <div className='space-y-1 text-muted-foreground'>
                  <div>10 ÷ 5 = 2</div>
                  <div>15 ÷ 5 = 3</div>
                  <div>20 ÷ 5 = 4</div>
                  <div>25 ÷ 5 = 5</div>
                </div>
              </div>
              <div>
                <h5 className='font-medium text-primary mb-2'>÷ 10 (Tenths)</h5>
                <div className='space-y-1 text-muted-foreground'>
                  <div>20 ÷ 10 = 2</div>
                  <div>30 ÷ 10 = 3</div>
                  <div>40 ÷ 10 = 4</div>
                  <div>50 ÷ 10 = 5</div>
                </div>
              </div>
              <div>
                <h5 className='font-medium text-primary mb-2'>
                  Perfect Squares
                </h5>
                <div className='space-y-1 text-muted-foreground'>
                  <div>9 ÷ 3 = 3</div>
                  <div>16 ÷ 4 = 4</div>
                  <div>25 ÷ 5 = 5</div>
                  <div>36 ÷ 6 = 6</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
