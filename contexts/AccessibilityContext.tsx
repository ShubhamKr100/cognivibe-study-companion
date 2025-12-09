
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AccessibilityState {
  isBionic: boolean;
  isSyllables: boolean;
  isRuler: boolean;
  isMicroChunking: boolean;
  isFocusTimer: boolean;
  isZenMode: boolean;
  isADHDSupport: boolean;
  isDyslexicFont: boolean;
  isDarkMode: boolean;
  bgColor: string; // Hex or tailwind class logic
  lineHeight: number;
  isToolbarOpen: boolean;
  toggleBionic: () => void;
  toggleSyllables: () => void;
  toggleRuler: () => void;
  toggleMicroChunking: () => void;
  toggleFocusTimer: () => void;
  toggleZenMode: () => void;
  toggleADHDSupport: () => void;
  toggleDyslexicFont: () => void;
  toggleTheme: () => void;
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
  const [isADHDSupport, setIsADHDSupport] = useState(false);
  const [isDyslexicFont, setIsDyslexicFont] = useState(false);
  
  // Default to Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Default backgrounds based on theme
  const [bgColor, setBgColor] = useState<string>('#2d2d2d'); 
  const [lineHeight, setLineHeight] = useState(1.6);
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);

  const toggleBionic = () => setIsBionic(prev => !prev);
  const toggleSyllables = () => setIsSyllables(prev => !prev);
  const toggleRuler = () => {
    setIsRuler(prev => !prev);
  };
  const toggleMicroChunking = () => setIsMicroChunking(prev => !prev);
  const toggleFocusTimer = () => setIsFocusTimer(prev => !prev);
  const toggleZenMode = () => {
      setIsZenMode(prev => {
          const newState = !prev;
          if (newState) setIsRuler(true);
          return newState;
      });
  };
  const toggleADHDSupport = () => setIsADHDSupport(prev => !prev);
  const toggleDyslexicFont = () => setIsDyslexicFont(prev => !prev);
  const toggleToolbar = () => setIsToolbarOpen(prev => !prev);

  // Global Theme Toggle
  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      // Automatically switch the content background color for better UX
      if (newMode) {
        setBgColor('#2d2d2d'); // Dark Panel Default
      } else {
        setBgColor('#ffffff'); // Light Panel Default
      }
      return newMode;
    });
  };

  return (
    <AccessibilityContext.Provider value={{
      isBionic,
      isSyllables,
      isRuler,
      isMicroChunking,
      isFocusTimer,
      isZenMode,
      isADHDSupport,
      isDyslexicFont,
      isDarkMode,
      bgColor,
      lineHeight,
      isToolbarOpen,
      toggleBionic,
      toggleSyllables,
      toggleRuler,
      toggleMicroChunking,
      toggleFocusTimer,
      toggleZenMode,
      toggleADHDSupport,
      toggleDyslexicFont,
      toggleTheme,
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
