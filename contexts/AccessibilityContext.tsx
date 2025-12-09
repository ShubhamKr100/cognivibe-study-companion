
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AccessibilityState {
  isBionic: boolean;
  isSyllables: boolean;
  isRuler: boolean;
  bgColor: string; // Hex or tailwind class logic
  lineHeight: number;
  isToolbarOpen: boolean;
  toggleBionic: () => void;
  toggleSyllables: () => void;
  toggleRuler: () => void;
  setBgColor: (color: string) => void;
  setLineHeight: (height: number) => void;
  toggleToolbar: () => void;
}

const AccessibilityContext = createContext<AccessibilityState | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isBionic, setIsBionic] = useState(false);
  const [isSyllables, setIsSyllables] = useState(false);
  const [isRuler, setIsRuler] = useState(false);
  const [bgColor, setBgColor] = useState<string>('#FFFFFF'); // Default white
  const [lineHeight, setLineHeight] = useState(1.6);
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);

  const toggleBionic = () => setIsBionic(prev => !prev);
  const toggleSyllables = () => setIsSyllables(prev => !prev);
  const toggleRuler = () => setIsRuler(prev => !prev);
  const toggleToolbar = () => setIsToolbarOpen(prev => !prev);

  return (
    <AccessibilityContext.Provider value={{
      isBionic,
      isSyllables,
      isRuler,
      bgColor,
      lineHeight,
      isToolbarOpen,
      toggleBionic,
      toggleSyllables,
      toggleRuler,
      setBgColor,
      setLineHeight,
      toggleToolbar
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
