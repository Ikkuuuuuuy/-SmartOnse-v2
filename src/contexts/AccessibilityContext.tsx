'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ColorVisionMode = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'high-contrast' | 'monochrome';
export type TextSizeMode = 'normal' | 'large' | 'extra-large';

interface AccessibilityContextType {
  colorVision: ColorVisionMode;
  setColorVision: (mode: ColorVisionMode) => void;
  textSize: TextSizeMode;
  setTextSize: (size: TextSizeMode) => void;
  reducedMotion: boolean;
  setReducedMotion: (active: boolean) => void;
  screenReaderFriendly: boolean;
  setScreenReaderFriendly: (active: boolean) => void;
  resetAccessibility: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [colorVision, setColorVision] = useState<ColorVisionMode>('normal');
  const [textSize, setTextSize] = useState<TextSizeMode>('normal');
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [screenReaderFriendly, setScreenReaderFriendly] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedColor = localStorage.getItem('smartonse_accessibility_color') as ColorVisionMode;
      const savedText = localStorage.getItem('smartonse_accessibility_text') as TextSizeMode;
      const savedMotion = localStorage.getItem('smartonse_accessibility_motion');
      const savedReader = localStorage.getItem('smartonse_accessibility_reader');

      if (savedColor) setColorVision(savedColor);
      if (savedText) setTextSize(savedText);
      if (savedMotion) setReducedMotion(savedMotion === 'true');
      if (savedReader) setScreenReaderFriendly(savedReader === 'true');
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('smartonse_accessibility_color', colorVision);
      localStorage.setItem('smartonse_accessibility_text', textSize);
      localStorage.setItem('smartonse_accessibility_motion', String(reducedMotion));
      localStorage.setItem('smartonse_accessibility_reader', String(screenReaderFriendly));

      const doc = document.documentElement;
      
      // Remove all accessibility classes first
      doc.classList.remove(
        'cvd-protanopia',
        'cvd-deuteranopia',
        'cvd-tritanopia',
        'cvd-high-contrast',
        'cvd-monochrome',
        'text-size-large',
        'text-size-xl',
        'reduced-motion',
        'screen-reader-mode'
      );

      // Apply Color Vision Modes
      if (colorVision !== 'normal') {
        doc.classList.add(`cvd-${colorVision}`);
      }

      // Apply Text Size for Seniors & PWD
      if (textSize === 'large') {
        doc.classList.add('text-size-large');
      } else if (textSize === 'extra-large') {
        doc.classList.add('text-size-xl');
      }

      // Reduced Motion
      if (reducedMotion) {
        doc.classList.add('reduced-motion');
      }

      // Screen Reader Mode
      if (screenReaderFriendly) {
        doc.classList.add('screen-reader-mode');
      }
    } catch {}
  }, [colorVision, textSize, reducedMotion, screenReaderFriendly]);

  const resetAccessibility = () => {
    setColorVision('normal');
    setTextSize('normal');
    setReducedMotion(false);
    setScreenReaderFriendly(false);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        colorVision,
        setColorVision,
        textSize,
        setTextSize,
        reducedMotion,
        setReducedMotion,
        screenReaderFriendly,
        setScreenReaderFriendly,
        resetAccessibility,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

