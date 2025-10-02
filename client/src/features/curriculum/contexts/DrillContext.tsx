/**
 * Context for sharing drill state between DrillsSection and DrillAnswersSection
 * Ensures both components use the same drill problems
 */

import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useDrillState } from '../hooks/useDrillState';
import type { DrillSet, DigitSelection } from '../types';

interface DrillContextType {
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

const DrillContext = createContext<DrillContextType | undefined>(undefined);

interface DrillProviderProps {
  children: ReactNode;
  chapterId: string;
  chapterTitle: string;
}

export function DrillProvider({
  children,
  chapterId,
  chapterTitle,
}: DrillProviderProps) {
  const drillState = useDrillState(chapterId, chapterTitle);

  // Generate initial drill set when the provider mounts
  useEffect(() => {
    drillState.generateNewDrillSet();
  }, [chapterId]); // Only re-generate when chapter changes

  return (
    <DrillContext.Provider value={drillState}>{children}</DrillContext.Provider>
  );
}

export function useDrillContext(): DrillContextType {
  const context = useContext(DrillContext);
  if (context === undefined) {
    throw new Error('useDrillContext must be used within a DrillProvider');
  }
  return context;
}
