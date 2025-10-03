/**
 * Shared hook for common visual component patterns
 * Reduces boilerplate across visual components
 */

import { useState, useCallback, useMemo } from 'react';
import { visualStyles } from '../lib/visual-component-utils';

// Generic state management for visual components
export function useVisualState<T>(initialState: T) {
  const [state, setState] = useState<T>(initialState);

  const updateState = useCallback((updates: Partial<T>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetState = useCallback(() => {
    setState(initialState);
  }, [initialState]);

  return { state, setState, updateState, resetState };
}

// Hook for managing preset buttons
export function usePresets<T>(
  presets: Array<{ label: string; value: T }>,
  currentValue: T,
  onSelect: (value: T) => void,
  compareValues: (a: T, b: T) => boolean = (a, b) =>
    JSON.stringify(a) === JSON.stringify(b)
) {
  const presetButtons = useMemo(() => {
    return presets.map(preset => ({
      ...preset,
      isActive: compareValues(currentValue, preset.value),
      onClick: () => onSelect(preset.value),
    }));
  }, [presets, currentValue, onSelect, compareValues]);

  return presetButtons;
}

// Hook for common visual component styling
export function useVisualStyles() {
  return useMemo(
    () => ({
      ...visualStyles,
      // Computed combinations for common use cases
      cardWithContent: `${visualStyles.card.base} rounded-lg border border-gray-200 dark:border-gray-700`,
      titleWithDescription: `${visualStyles.title.primary} mb-2`,
      explanationBox: (
        variant: keyof typeof visualStyles.background = 'blue'
      ) => `${visualStyles.background[variant]} p-4 rounded-lg`,
      sliderLabel: `${visualStyles.label.base}`,
      inlineLabel: `${visualStyles.label.inline}`,
    }),
    []
  );
}

// Hook for mathematical calculations commonly used in visual components
export function useMathCalculations() {
  const gcd = useCallback((a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  }, []);

  const simplifyFraction = useCallback(
    (num: number, den: number) => {
      const divisor = gcd(num, den);
      return { num: num / divisor, den: den / divisor };
    },
    [gcd]
  );

  const toPercentage = useCallback((value: number, decimals = 1): string => {
    return `${(value * 100).toFixed(decimals)}%`;
  }, []);

  const formatDecimal = useCallback((value: number, decimals = 3): string => {
    return value.toFixed(decimals);
  }, []);

  const crossMultiply = useCallback(
    (a: number, b: number, c: number): number => {
      // For proportion a:b = c:x, solve for x
      return (b * c) / a;
    },
    []
  );

  return {
    gcd,
    simplifyFraction,
    toPercentage,
    formatDecimal,
    crossMultiply,
  };
}

// Hook for slider configurations
export function useSliderConfig(
  value: number,
  onChange: (value: number) => void,
  options: {
    min: number;
    max: number;
    step?: number;
    label: string;
  }
) {
  const config = useMemo(
    () => ({
      value: [value],
      onValueChange: (newValue: number[]) =>
        onChange(newValue[0] || options.min),
      min: options.min,
      max: options.max,
      step: options.step || 1,
      className: 'flex-1',
    }),
    [value, onChange, options]
  );

  return config;
}

// Hook for managing interactive examples with common patterns
export function useInteractiveExample<T>(examples: T[], initialIndex = 0) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const currentExample = useMemo(
    () => examples[currentIndex],
    [examples, currentIndex]
  );

  const nextExample = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % examples.length);
  }, [examples.length]);

  const previousExample = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + examples.length) % examples.length);
  }, [examples.length]);

  const selectExample = useCallback(
    (index: number) => {
      if (index >= 0 && index < examples.length) {
        setCurrentIndex(index);
      }
    },
    [examples.length]
  );

  return {
    currentExample,
    currentIndex,
    nextExample,
    previousExample,
    selectExample,
    hasNext: currentIndex < examples.length - 1,
    hasPrevious: currentIndex > 0,
    totalExamples: examples.length,
  };
}

// Hook for managing step-by-step explanations
export function useStepByStep(steps: string[]) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showAllSteps, setShowAllSteps] = useState(false);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  }, [steps.length]);

  const previousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < steps.length) {
        setCurrentStep(step);
      }
    },
    [steps.length]
  );

  const toggleShowAll = useCallback(() => {
    setShowAllSteps(prev => !prev);
  }, []);

  const visibleSteps = useMemo(() => {
    return showAllSteps ? steps : steps.slice(0, currentStep + 1);
  }, [steps, currentStep, showAllSteps]);

  return {
    currentStep,
    visibleSteps,
    showAllSteps,
    nextStep,
    previousStep,
    goToStep,
    toggleShowAll,
    hasNext: currentStep < steps.length - 1,
    hasPrevious: currentStep > 0,
    isComplete: currentStep === steps.length - 1,
    totalSteps: steps.length,
  };
}
