'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyThemeToDOM(effective: 'light' | 'dark') {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const body = document.body;

  if (effective === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
    if (body) {
      body.classList.add('dark');
      body.classList.remove('light');
    }
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
    if (body) {
      body.classList.remove('dark');
      body.classList.add('light');
    }
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  const updateTheme = useCallback((newTheme: ThemeMode) => {
    let effective: 'light' | 'dark' = 'light';

    if (newTheme === 'system') {
      const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      effective = prefersDark ? 'dark' : 'light';
    } else {
      effective = newTheme;
    }

    setThemeState(newTheme);
    setResolvedTheme(effective);
    applyThemeToDOM(effective);

    try {
      localStorage.setItem('smartonse_theme', newTheme);
    } catch {
      // ignore
    }
  }, []);

  // Initialize immediately on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('smartonse_theme') as ThemeMode | null;
      if (saved === 'dark' || saved === 'light' || saved === 'system') {
        updateTheme(saved);
      } else {
        updateTheme('system');
      }
    } catch {
      updateTheme('light');
    }
  }, [updateTheme]);

  // Listen to OS preference changes
  useEffect(() => {
    if (theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => {
      const effective = e.matches ? 'dark' : 'light';
      setResolvedTheme(effective);
      applyThemeToDOM(effective);
    };
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    updateTheme(newTheme);
  };

  const toggleTheme = () => {
    const isDark = typeof document !== 'undefined'
      ? document.documentElement.classList.contains('dark')
      : resolvedTheme === 'dark';

    const nextMode: 'light' | 'dark' = isDark ? 'light' : 'dark';
    updateTheme(nextMode);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
