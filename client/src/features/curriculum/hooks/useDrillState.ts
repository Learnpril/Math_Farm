/**
 * Custom hook for managing shared drill state between DrillsSection and DrillAnswersSection
 * Ensures both components use the same drill problems
 */

import { useState, useCallback } from 'react';
import { drillGenerator } from '../lib/drill-generator';
import type { DrillSet, DigitSelection } from '../types';

interface UseDrillStateReturn {
  selectedOperation: 'addition' | 'subtraction';
  selectedDigits: DigitSelection;
  currentDrillSet: DrillSet | null;
  isGenerating: boolean;
  setSelectedOperation: (operation: 'addition' | 'subtraction') => void;
  setSelectedDigits: (digits: DigitSelection) => void;
  generateNewDrillSet: (
    operation?: 'addition' | 'subtraction',
    digits?: DigitSelection
  ) => Promise<void>;
}

export function useDrillState(
  chapterId: string,
  chapterTitle: string
): UseDrillStateReturn {
  const [selectedOperation, setSelectedOperation] = useState<
    'addition' | 'subtraction'
  >('addition');
  const [selectedDigits, setSelectedDigits] = useState<DigitSelection>('one');
  const [currentDrillSet, setCurrentDrillSet] = useState<DrillSet | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateNewDrillSet = useCallback(
    async (operation?: 'addition' | 'subtraction', digits?: DigitSelection) => {
      const op = operation || selectedOperation;
      const dig = digits || selectedDigits;

      setIsGenerating(true);
      try {
        // Add small delay to show loading state
        await new Promise(resolve => setTimeout(resolve, 300));
        const drillSet = drillGenerator.generateDrillSet(
          chapterId,
          op,
          chapterTitle,
          dig
        );
        setCurrentDrillSet(drillSet);

        // Update the selected values if they were passed as parameters
        if (operation) setSelectedOperation(operation);
        if (digits) setSelectedDigits(digits);
      } catch (error) {
        console.error('Error generating drill set:', error);
      } finally {
        setIsGenerating(false);
      }
    },
    [chapterId, chapterTitle, selectedOperation, selectedDigits]
  );

  return {
    selectedOperation,
    selectedDigits,
    currentDrillSet,
    isGenerating,
    setSelectedOperation,
    setSelectedDigits,
    generateNewDrillSet,
  };
}
