/**
 * Custom hook for managing shared drill state between DrillsSection and DrillAnswersSection
 * Ensures both components use the same drill problems
 */

import { useState, useCallback } from 'react';
import { drillGenerator } from '../lib/drill-generator';
import type { DrillSet, DigitSelection } from '../types';

interface UseDrillStateReturn {
  selectedOperation: 'addition' | 'subtraction' | 'multiplication' | 'division';
  selectedDigits: DigitSelection;
  currentDrillSet: DrillSet | null;
  isGenerating: boolean;
  setSelectedOperation: (
    operation: 'addition' | 'subtraction' | 'multiplication' | 'division'
  ) => void;
  setSelectedDigits: (digits: DigitSelection) => void;
  generateNewDrillSet: (
    operation?: 'addition' | 'subtraction' | 'multiplication' | 'division',
    digits?: DigitSelection
  ) => Promise<void>;
}

export function useDrillState(
  chapterId: string,
  chapterTitle: string
): UseDrillStateReturn {
  // Default operation based on chapter
  const getDefaultOperation = (
    chapterId: string
  ): 'addition' | 'subtraction' | 'multiplication' | 'division' => {
    if (chapterId === 'chapter-04') return 'multiplication';
    if (chapterId === 'chapter-05') return 'division';
    return 'addition';
  };

  const [selectedOperation, setSelectedOperation] = useState<
    'addition' | 'subtraction' | 'multiplication' | 'division'
  >(getDefaultOperation(chapterId));
  const [selectedDigits, setSelectedDigits] = useState<DigitSelection>('one');

  // Custom setter that prevents 'three' selection in Chapter 3
  const handleSetSelectedDigits = (digits: DigitSelection) => {
    // If Chapter 4 and trying to set 'three', default to 'one' instead
    if (chapterId === 'chapter-04' && digits === 'three') {
      setSelectedDigits('one');
    } else {
      setSelectedDigits(digits);
    }
  };
  const [currentDrillSet, setCurrentDrillSet] = useState<DrillSet | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateNewDrillSet = useCallback(
    async (
      operation?: 'addition' | 'subtraction' | 'multiplication' | 'division',
      digits?: DigitSelection
    ) => {
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
        if (digits) handleSetSelectedDigits(digits);
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
    setSelectedDigits: handleSetSelectedDigits,
    generateNewDrillSet,
  };
}
