/**
 * Weight Unit Provider - Backward Compatibility Layer
 * Provides the same API as the original WeightUnitProvider but uses Zustand store
 */

import React, { createContext, useContext } from 'react';
import { useUserStore } from '../../stores/user-store';
import type { WeightUnit } from '../../types/workout';

interface WeightUnitContextType {
  weightUnit: WeightUnit;
  setWeightUnit: (unit: WeightUnit) => void;
  canChangeWeightUnit: boolean;
  setCanChangeWeightUnit: (canChange: boolean) => void;
}

// Create context for backward compatibility (though not actually used)
const WeightUnitContext = createContext<WeightUnitContextType | undefined>(undefined);

interface WeightUnitProviderProps {
  children: React.ReactNode;
}

/**
 * Backward compatible WeightUnitProvider
 * This component maintains the same API as the original Context provider
 * but internally uses the Zustand user store
 */
export function WeightUnitProvider({ children }: WeightUnitProviderProps) {
  // No context provider needed - just render children
  // The store is accessed directly via the hook
  return <>{children}</>;
}

/**
 * Backward compatible useWeightUnit hook
 * Maintains the same API as the original hook but uses Zustand store
 */
export function useWeightUnit(): WeightUnitContextType {
  const weightUnit = useUserStore(state => state.weightUnit);
  const setWeightUnit = useUserStore(state => state.setWeightUnit);
  const canChangeWeightUnit = useUserStore(state => state.canChangeWeightUnit);
  const setCanChangeWeightUnit = useUserStore(state => state.setCanChangeWeightUnit);

  return {
    weightUnit,
    setWeightUnit,
    canChangeWeightUnit,
    setCanChangeWeightUnit,
  };
}

// Export for backward compatibility
export default WeightUnitProvider;