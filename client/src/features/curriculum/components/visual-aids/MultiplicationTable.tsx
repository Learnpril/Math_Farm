import React, { useState } from 'react';

interface MultiplicationTableProps {
  maxNumber?: number;
  interactive?: boolean;
  className?: string;
}

export const MultiplicationTable: React.FC<MultiplicationTableProps> = ({
  maxNumber = 12,
  interactive = true,
  className = '',
}) => {
  const [highlightedRow, setHighlightedRow] = useState<number | null>(null);
  const [highlightedCol, setHighlightedCol] = useState<number | null>(null);
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);

  const handleCellClick = (row: number, col: number) => {
    if (!interactive) return;

    if (selectedCell?.row === row && selectedCell?.col === col) {
      setSelectedCell(null);
      setHighlightedRow(null);
      setHighlightedCol(null);
    } else {
      setSelectedCell({ row, col });
      setHighlightedRow(row);
      setHighlightedCol(col);
    }
  };

  const getCellClassName = (
    row: number,
    col: number,
    isHeader: boolean = false
  ) => {
    const baseClasses =
      'border border-border text-center font-medium transition-colors duration-200';

    if (isHeader) {
      return `${baseClasses} bg-primary text-primary-foreground font-bold p-3`;
    }

    const isHighlighted = highlightedRow === row || highlightedCol === col;
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;

    if (isSelected) {
      return `${baseClasses} bg-primary text-primary-foreground p-3 cursor-pointer`;
    } else if (isHighlighted) {
      return `${baseClasses} bg-primary/20 text-foreground p-3 cursor-pointer`;
    } else {
      return `${baseClasses} bg-card text-card-foreground p-3 hover:bg-primary/10 hover:text-foreground cursor-pointer`;
    }
  };

  return (
    <div className={`multiplication-table ${className}`}>
      <div className='mb-4'>
        <h4 className='text-lg font-semibold mb-2 text-foreground'>
          Multiplication Table (Times Table)
        </h4>
        <p className='text-sm text-muted-foreground mb-4'>
          {interactive
            ? 'Click on any cell to highlight the row and column. The intersection shows the product.'
            : 'This table shows all multiplication facts from 1×1 to 12×12.'}
        </p>
      </div>

      <div className='overflow-x-auto'>
        <table className='border-collapse border border-border mx-auto'>
          <thead>
            <tr>
              {/* Top-left corner cell */}
              <th className={getCellClassName(0, 0, true)}>×</th>
              {/* Column headers */}
              {Array.from({ length: maxNumber }, (_, i) => i + 1).map(col => (
                <th key={col} className={getCellClassName(0, col, true)}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxNumber }, (_, i) => i + 1).map(row => (
              <tr key={row}>
                {/* Row header */}
                <th className={getCellClassName(row, 0, true)}>{row}</th>
                {/* Data cells */}
                {Array.from({ length: maxNumber }, (_, i) => i + 1).map(col => (
                  <td
                    key={col}
                    className={getCellClassName(row, col)}
                    onClick={() => handleCellClick(row, col)}
                  >
                    {row * col}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCell && (
        <div className='mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20'>
          <div className='text-center'>
            <div className='text-lg font-bold text-primary mb-2'>
              {selectedCell.row} × {selectedCell.col} ={' '}
              {selectedCell.row * selectedCell.col}
            </div>
            <div className='text-sm text-muted-foreground'>
              Row {selectedCell.row} times Column {selectedCell.col} equals{' '}
              {selectedCell.row * selectedCell.col}
            </div>
          </div>
        </div>
      )}

      {interactive && (
        <div className='mt-4 p-4 bg-secondary rounded-lg border border-border'>
          <h5 className='font-semibold text-foreground mb-2'>
            💡 How to Use This Table
          </h5>
          <ul className='text-sm text-muted-foreground space-y-1'>
            <li>• Find the row for your first number</li>
            <li>• Find the column for your second number</li>
            <li>• The intersection shows the answer</li>
            <li>
              • Notice patterns: each row/column increases by the same amount
            </li>
            <li>• The table is symmetric: 3×4 = 4×3 (commutative property)</li>
          </ul>
        </div>
      )}
    </div>
  );
};
