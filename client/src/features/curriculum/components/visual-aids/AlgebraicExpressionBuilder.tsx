/**
 * AlgebraicExpressionBuilder - Interactive tool for building and simplifying algebraic expressions
 * Specifically designed for Pre-Algebra Chapter 2: Order of Operations and Expressions
 */

import React, { useState } from 'react';

interface Term {
  coefficient: number;
  variable: string;
  exponent: number;
  isConstant: boolean;
}

interface AlgebraicExpressionBuilderProps {
  className?: string;
  showSimplification?: boolean;
}

export const AlgebraicExpressionBuilder: React.FC<
  AlgebraicExpressionBuilderProps
> = ({ className = '', showSimplification = true }) => {
  const [terms, setTerms] = useState<Term[]>([
    { coefficient: 3, variable: 'x', exponent: 1, isConstant: false },
    { coefficient: 5, variable: '', exponent: 0, isConstant: true },
    { coefficient: -2, variable: 'x', exponent: 1, isConstant: false },
    { coefficient: 7, variable: '', exponent: 0, isConstant: true },
  ]);

  const [newTerm, setNewTerm] = useState<Term>({
    coefficient: 1,
    variable: 'x',
    exponent: 1,
    isConstant: false,
  });

  const addTerm = () => {
    setTerms([...terms, { ...newTerm }]);
    setNewTerm({
      coefficient: 1,
      variable: 'x',
      exponent: 1,
      isConstant: false,
    });
  };

  const removeTerm = (index: number) => {
    setTerms(terms.filter((_, i) => i !== index));
  };

  const updateTerm = (index: number, field: keyof Term, value: any) => {
    const updatedTerms = [...terms];
    updatedTerms[index] = { ...updatedTerms[index], [field]: value };

    // Handle constant vs variable term logic
    if (field === 'isConstant') {
      if (value) {
        updatedTerms[index].variable = '';
        updatedTerms[index].exponent = 0;
      } else {
        updatedTerms[index].variable = 'x';
        updatedTerms[index].exponent = 1;
      }
    }

    setTerms(updatedTerms);
  };

  const formatTerm = (term: Term, isFirst: boolean = false) => {
    if (term.isConstant) {
      const sign = term.coefficient >= 0 ? (isFirst ? '' : ' + ') : ' - ';
      const value = Math.abs(term.coefficient);
      return `${sign}${value}`;
    }

    const sign = term.coefficient >= 0 ? (isFirst ? '' : ' + ') : ' - ';
    const coeff = Math.abs(term.coefficient);
    const coeffStr = coeff === 1 ? '' : coeff.toString();
    const variable = term.variable || 'x';
    const exponent = term.exponent === 1 ? '' : `^${term.exponent}`;

    return `${sign}${coeffStr}${variable}${exponent}`;
  };

  const getExpression = () => {
    if (terms.length === 0) return '0';
    return terms.map((term, index) => formatTerm(term, index === 0)).join('');
  };

  const simplifyExpression = () => {
    // Group like terms
    const likeTerms: { [key: string]: Term[] } = {};

    terms.forEach(term => {
      const key = term.isConstant
        ? 'constant'
        : `${term.variable}^${term.exponent}`;
      if (!likeTerms[key]) {
        likeTerms[key] = [];
      }
      likeTerms[key].push(term);
    });

    // Combine coefficients for like terms
    const simplified: Term[] = [];

    Object.entries(likeTerms).forEach(([key, termGroup]) => {
      const totalCoefficient = termGroup.reduce(
        (sum, term) => sum + term.coefficient,
        0
      );

      if (totalCoefficient !== 0) {
        const representativeTerm = termGroup[0];
        simplified.push({
          ...representativeTerm,
          coefficient: totalCoefficient,
        });
      }
    });

    // Sort: variables first (by exponent desc), then constants
    simplified.sort((a, b) => {
      if (a.isConstant && !b.isConstant) return 1;
      if (!a.isConstant && b.isConstant) return -1;
      if (!a.isConstant && !b.isConstant) {
        return b.exponent - a.exponent;
      }
      return 0;
    });

    return simplified;
  };

  const getSimplifiedExpression = () => {
    const simplified = simplifyExpression();
    if (simplified.length === 0) return '0';
    return simplified
      .map((term, index) => formatTerm(term, index === 0))
      .join('');
  };

  const identifyLikeTerms = () => {
    const groups: { [key: string]: number[] } = {};

    terms.forEach((term, index) => {
      const key = term.isConstant
        ? 'constant'
        : `${term.variable}^${term.exponent}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(index);
    });

    return groups;
  };

  const likeTermGroups = identifyLikeTerms();
  const colors = [
    'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200',
    'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200',
    'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200',
    'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200',
  ];

  const getTermColor = (index: number) => {
    let colorIndex = 0;
    for (const [key, indices] of Object.entries(likeTermGroups)) {
      if (indices.includes(index)) {
        return colors[colorIndex % colors.length];
      }
      colorIndex++;
    }
    return '';
  };

  return (
    <div
      className={`p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
          Algebraic Expression Builder
        </h3>
        <p className='text-sm text-gray-600 dark:text-gray-300'>
          Build expressions with terms and see how like terms combine when
          simplified.
        </p>
      </div>

      {/* Current Expression Display */}
      <div className='mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
        <div className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
          Current Expression:
        </div>
        <div className='text-xl font-mono text-gray-900 dark:text-white'>
          {getExpression()}
        </div>
      </div>

      {/* Terms List */}
      <div className='mb-6'>
        <h4 className='text-md font-medium text-gray-900 dark:text-white mb-3'>
          Terms:
        </h4>
        <div className='space-y-2'>
          {terms.map((term, index) => (
            <div
              key={index}
              className={`p-3 border rounded-lg ${getTermColor(index)} border-gray-200 dark:border-gray-600`}
            >
              <div className='flex items-center gap-4 flex-wrap'>
                <div className='flex items-center gap-2'>
                  <label className='text-sm font-medium'>Coefficient:</label>
                  <input
                    type='number'
                    value={term.coefficient}
                    onChange={e =>
                      updateTerm(index, 'coefficient', Number(e.target.value))
                    }
                    className='w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                  />
                </div>

                <div className='flex items-center gap-2'>
                  <label className='flex items-center gap-1'>
                    <input
                      type='checkbox'
                      checked={term.isConstant}
                      onChange={e =>
                        updateTerm(index, 'isConstant', e.target.checked)
                      }
                      className='rounded'
                    />
                    <span className='text-sm'>Constant</span>
                  </label>
                </div>

                {!term.isConstant && (
                  <>
                    <div className='flex items-center gap-2'>
                      <label className='text-sm font-medium'>Variable:</label>
                      <input
                        type='text'
                        value={term.variable}
                        onChange={e =>
                          updateTerm(index, 'variable', e.target.value)
                        }
                        className='w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                        maxLength={1}
                      />
                    </div>

                    <div className='flex items-center gap-2'>
                      <label className='text-sm font-medium'>Exponent:</label>
                      <input
                        type='number'
                        value={term.exponent}
                        onChange={e =>
                          updateTerm(index, 'exponent', Number(e.target.value))
                        }
                        className='w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                        min='0'
                      />
                    </div>
                  </>
                )}

                <button
                  onClick={() => removeTerm(index)}
                  className='px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors'
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Term */}
      <div className='mb-6 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg'>
        <h4 className='text-md font-medium text-gray-900 dark:text-white mb-3'>
          Add New Term:
        </h4>
        <div className='flex items-center gap-4 flex-wrap'>
          <div className='flex items-center gap-2'>
            <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
              Coefficient:
            </label>
            <input
              type='number'
              value={newTerm.coefficient}
              onChange={e =>
                setNewTerm({ ...newTerm, coefficient: Number(e.target.value) })
              }
              className='w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
            />
          </div>

          <div className='flex items-center gap-2'>
            <label className='flex items-center gap-1'>
              <input
                type='checkbox'
                checked={newTerm.isConstant}
                onChange={e =>
                  setNewTerm({
                    ...newTerm,
                    isConstant: e.target.checked,
                    variable: e.target.checked ? '' : 'x',
                    exponent: e.target.checked ? 0 : 1,
                  })
                }
                className='rounded'
              />
              <span className='text-sm text-gray-700 dark:text-gray-300'>
                Constant
              </span>
            </label>
          </div>

          {!newTerm.isConstant && (
            <>
              <div className='flex items-center gap-2'>
                <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  Variable:
                </label>
                <input
                  type='text'
                  value={newTerm.variable}
                  onChange={e =>
                    setNewTerm({ ...newTerm, variable: e.target.value })
                  }
                  className='w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                  maxLength={1}
                />
              </div>

              <div className='flex items-center gap-2'>
                <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  Exponent:
                </label>
                <input
                  type='number'
                  value={newTerm.exponent}
                  onChange={e =>
                    setNewTerm({ ...newTerm, exponent: Number(e.target.value) })
                  }
                  className='w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                  min='0'
                />
              </div>
            </>
          )}

          <button
            onClick={addTerm}
            className='px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors'
          >
            Add Term
          </button>
        </div>
      </div>

      {/* Simplification */}
      {showSimplification && (
        <div className='mb-4'>
          <h4 className='text-md font-medium text-gray-900 dark:text-white mb-3'>
            Simplified Expression:
          </h4>
          <div className='p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg'>
            <div className='text-xl font-mono text-green-800 dark:text-green-200'>
              {getSimplifiedExpression()}
            </div>
          </div>
        </div>
      )}

      {/* Like Terms Explanation */}
      <div className='p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
        <div className='text-sm text-blue-800 dark:text-blue-200'>
          <div className='font-medium mb-1'>💡 Like Terms:</div>
          <ul className='list-disc list-inside space-y-1 text-xs'>
            <li>Terms with the same variable and exponent can be combined</li>
            <li>
              Constants (numbers without variables) are like terms with each
              other
            </li>
            <li>Combine like terms by adding their coefficients</li>
            <li>The variable part stays the same when combining</li>
            <li>Different colors above show which terms are "like terms"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
