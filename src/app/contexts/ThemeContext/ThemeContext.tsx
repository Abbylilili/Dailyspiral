import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'pastel' | 'ocean' | 'ink' | 'zen';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Try to get from local storage, default to 'pastel'
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('daily-spiral-theme');
      return (saved as Theme) || 'pastel';
    }
    return 'pastel';
  });

  useEffect(() => {
    localStorage.setItem('daily-spiral-theme', theme);
    // Remove old theme classes
    document.documentElement.classList.remove('theme-pastel', 'theme-ocean', 'theme-ink', 'theme-zen');
    // Add new theme class
    document.documentElement.classList.add(`theme-${theme}`);
    
    // Also handle dark mode preferences for Tailwind if needed, 
    // but we are doing custom themes.
    if (theme === 'ocean') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
