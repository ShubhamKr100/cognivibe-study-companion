
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AccessibilityState {
  isBionic: boolean;
  isSyllables: boolean;
  isRuler: boolean;
  isMicroChunking: boolean;
  isFocusTimer: boolean;
  isZenMode: boolean;
  bgColor: string; // Hex or tailwind class logic
  lineHeight: number;
  isToolbarOpen: boolean;
  toggleBionic: () => void;
  toggleSyllables: () => void;
  toggleRuler: () => void;
  toggleMicroChunking: () => void;
  toggleFocusTimer: () => void;
  toggleZenMode: () => void;
  setBgColor: (color: string) => void;
  setLineHeight: (height: number) => void;
  toggleToolbar: () => void;
}

const AccessibilityContext = createContext<AccessibilityState | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isBionic, setIsBionic] = useState(false);
  const [isSyllables, setIsSyllables] = useState(false);
  const [isRuler, setIsRuler] = useState(false);
  const [isMicroChunking, setIsMicroChunking] = useState(false);
  const [isFocusTimer, setIsFocusTimer] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  
  const [bgColor, setBgColor] = useState<string>('#FFFFFF'); // Default white
  const [lineHeight, setLineHeight] = useState(1.6);
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);

  const toggleBionic = () => setIsBionic(prev => !prev);
  const toggleSyllables = () => setIsSyllables(prev => !prev);
  const toggleRuler = () => {
    setIsRuler(prev => {
        // If turning OFF ruler, and Zen Mode is ON, we should probably keep it on? 
        // Or user explicitly toggles. Let's strictly toggle.
        return !prev;
    });
  };
  const toggleMicroChunking = () => setIsMicroChunking(prev => !prev);
  const toggleFocusTimer = () => setIsFocusTimer(prev => !prev);
  const toggleZenMode = () => {
      setIsZenMode(prev => {
          const newState = !prev;
          // Zen mode automatically enables Ruler for focus if turning ON
          if (newState) setIsRuler(true);
          return newState;
      });
  };
  const toggleToolbar = () => setIsToolbarOpen(prev => !prev);

  return (
    <AccessibilityContext.Provider value={{
      isBionic,
      isSyllables,
      isRuler,
      isMicroChunking,
      isFocusTimer,
      isZenMode,
      bgColor,
      lineHeight,
      isToolbarOpen,
      toggleBionic,
      toggleSyllables,
      toggleRuler,
      toggleMicroChunking,
      toggleFocusTimer,
      toggleZenMode,
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
