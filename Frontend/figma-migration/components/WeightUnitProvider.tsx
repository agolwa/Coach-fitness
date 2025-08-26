import React, { createContext, useContext, useEffect, useState } from 'react';

type WeightUnit = 'kg' | 'lbs';

interface WeightUnitContextType {
  weightUnit: WeightUnit;
  setWeightUnit: (unit: WeightUnit) => void;
  canChangeWeightUnit: boolean;
  setCanChangeWeightUnit: (canChange: boolean) => void;
}

const WeightUnitContext = createContext<WeightUnitContextType | undefined>(undefined);

export function WeightUnitProvider({ children }: { children: React.ReactNode }) {
  const [weightUnit, setWeightUnitState] = useState<WeightUnit>('kg');
  const [canChangeWeightUnit, setCanChangeWeightUnit] = useState(true);

  // Initialize weight unit from localStorage
  useEffect(() => {
    const storedUnit = localStorage.getItem('weightUnit') as WeightUnit;
    if (storedUnit && (storedUnit === 'kg' || storedUnit === 'lbs')) {
      setWeightUnitState(storedUnit);
    }
  }, []);

  // Update localStorage when weight unit changes
  useEffect(() => {
    localStorage.setItem('weightUnit', weightUnit);
  }, [weightUnit]);

  const setWeightUnit = (unit: WeightUnit) => {
    if (canChangeWeightUnit) {
      setWeightUnitState(unit);
    }
  };

  return (
    <WeightUnitContext.Provider value={{ 
      weightUnit, 
      setWeightUnit, 
      canChangeWeightUnit, 
      setCanChangeWeightUnit 
    }}>
      {children}
    </WeightUnitContext.Provider>
  );
}

export function useWeightUnit() {
  const context = useContext(WeightUnitContext);
  if (context === undefined) {
    throw new Error('useWeightUnit must be used within a WeightUnitProvider');
  }
  return context;
}