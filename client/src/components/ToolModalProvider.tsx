import React, { createContext, useContext } from 'react';
import { ToolModal, ToolType, useToolModal } from './ToolModal';

interface ToolModalContextType {
  openTool: (toolType: ToolType) => void;
  closeTool: () => void;
  currentTool: ToolType | null;
  isOpen: boolean;
}

const ToolModalContext = createContext<ToolModalContextType | undefined>(
  undefined
);

export function ToolModalProvider({ children }: { children: React.ReactNode }) {
  const toolModal = useToolModal();

  return (
    <ToolModalContext.Provider value={toolModal}>
      {children}
      <ToolModal
        toolType={toolModal.currentTool}
        isOpen={toolModal.isOpen}
        onClose={toolModal.closeTool}
      />
    </ToolModalContext.Provider>
  );
}

export function useToolModalContext() {
  const context = useContext(ToolModalContext);
  if (context === undefined) {
    throw new Error(
      'useToolModalContext must be used within a ToolModalProvider'
    );
  }
  return context;
}
