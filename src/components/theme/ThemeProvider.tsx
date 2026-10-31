'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  buildThemeInitScript,
  type PortfolioTheme,
  THEME_STORAGE_KEY,
} from '@/components/theme/theme-script';

export { buildThemeInitScript, type PortfolioTheme, THEME_STORAGE_KEY };

interface ThemeContextValue {
  theme: PortfolioTheme;
  defaultTheme: PortfolioTheme;
  enableThemeToggle: boolean;
  setTheme: (next: PortfolioTheme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  defaultTheme: 'dark',
  enableThemeToggle: true,
  setTheme: () => {},
  toggleTheme: () => {},
});

interface ThemeProviderProps {
  defaultTheme?: PortfolioTheme;
  enableThemeToggle?: boolean;
  children: React.ReactNode;
}

function applyDocumentTheme(theme: PortfolioTheme) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
  }
}

export function ThemeProvider({
  defaultTheme = 'dark',
  enableThemeToggle = true,
  children,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<PortfolioTheme>(() => {
    if (!enableThemeToggle) {
      return defaultTheme;
    }
    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'dark' || stored === 'light') {
          return stored;
        }
      } catch {
        // Ignore storage read errors in restricted environments
      }
    }
    return defaultTheme;
  });

  useEffect(() => {
    if (!enableThemeToggle) {
      setThemeState(defaultTheme);
      applyDocumentTheme(defaultTheme);
      return;
    }

    try {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') {
        setThemeState(stored);
        applyDocumentTheme(stored);
        return;
      }
    } catch {
      // Ignore storage access errors
    }

    setThemeState(defaultTheme);
    applyDocumentTheme(defaultTheme);
  }, [defaultTheme, enableThemeToggle]);

  const setTheme = useCallback(
    (next: PortfolioTheme) => {
      if (!enableThemeToggle) {
        return;
      }
      setThemeState(next);
      applyDocumentTheme(next);
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Ignore storage write errors
      }
    },
    [enableThemeToggle]
  );

  const toggleTheme = useCallback(() => {
    if (!enableThemeToggle) {
      return;
    }
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [enableThemeToggle, setTheme, theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        defaultTheme,
        enableThemeToggle,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
