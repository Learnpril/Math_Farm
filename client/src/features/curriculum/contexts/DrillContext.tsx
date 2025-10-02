/**
 * Context for sharing drill state between DrillsSection and DrillAnswersSection
 * Ensures both components use the same drill problems
 */

import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useDrillState } from '../hooks/useDrillState';
import type { DrillSet, DigitSelection } from '../types';

interface DrillContextType {
  chapterId: string;
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
    <DrillContext.Provider value={{ ...drillState, chapterId }}>
      {children}
    </DrillContext.Provider>
  );
}

export function useDrillContext(): DrillContextType {
  const context = useContext(DrillContext);
  if (context === undefined) {
    throw new Error('useDrillContext must be used within a DrillProvider');
  }
  return context;
}
