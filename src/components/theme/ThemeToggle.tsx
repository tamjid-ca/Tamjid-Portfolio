'use client';

import React from 'react';
import { useTheme } from '@/components/theme/ThemeProvider';
import { IonIcon } from '@/components/ui/IonIcon';

export function ThemeToggle() {
  const { theme, enableThemeToggle, toggleTheme } = useTheme();

  if (!enableThemeToggle) {
    return null;
  }

  const label =
    theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <button
      type="button"
      className="theme-toggle-btn"
      data-theme-toggle
      aria-label={label}
      title={label}
      onClick={toggleTheme}
    >
      <IonIcon name={theme === 'dark' ? 'sunny-outline' : 'moon-outline'} />
    </button>
  );
}
