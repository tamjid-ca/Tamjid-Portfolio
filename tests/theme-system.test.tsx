import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { PortfolioShell } from '@/components/portfolio/PortfolioShell';
import {
  buildThemeInitScript,
  THEME_STORAGE_KEY,
} from '@/components/theme/ThemeProvider';
import { V1_PORTFOLIO_SEED_DATA } from '@/seed/v1-portfolio-data';

describe('Phase 7 — Dark and Light Theme System', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.colorScheme = '';
  });

  it('defaults to Dark theme and renders the accessible theme toggle in the Navbar', () => {
    render(<PortfolioShell data={V1_PORTFOLIO_SEED_DATA} />);

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');

    const toggleBtn = screen.getByRole('button', {
      name: /Switch to light theme/i,
    });
    expect(toggleBtn).toBeInTheDocument();
    expect(
      toggleBtn.querySelector('[data-ion-icon="sunny-outline"]')
    ).not.toBeNull();
  });

  it('toggles between Dark and Light themes and persists preference in localStorage', () => {
    render(<PortfolioShell data={V1_PORTFOLIO_SEED_DATA} />);

    const toggleBtn = screen.getByRole('button', {
      name: /Switch to light theme/i,
    });

    // Switch to Light mode
    fireEvent.click(toggleBtn);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(document.documentElement.style.colorScheme).toBe('light');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(
      screen.getByRole('button', { name: /Switch to dark theme/i })
    ).toBeInTheDocument();
    expect(
      toggleBtn.querySelector('[data-ion-icon="moon-outline"]')
    ).not.toBeNull();

    // Switch back to Dark mode
    fireEvent.click(toggleBtn);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('restores saved Light theme preference from localStorage on initial render', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'light');

    render(<PortfolioShell data={V1_PORTFOLIO_SEED_DATA} />);

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(
      screen.getByRole('button', { name: /Switch to dark theme/i })
    ).toBeInTheDocument();
  });

  it('hides the theme toggle and enforces defaultTheme when enableThemeToggle is false', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'light');

    const lockedData = {
      ...V1_PORTFOLIO_SEED_DATA,
      siteSettings: {
        ...V1_PORTFOLIO_SEED_DATA.siteSettings,
        defaultTheme: 'dark' as const,
        enableThemeToggle: false,
      },
    };

    const { container } = render(<PortfolioShell data={lockedData} />);

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(container.querySelector('[data-theme-toggle]')).toBeNull();
  });

  it('generates a FOUC-prevention inline script that applies data-theme before paint', () => {
    const script = buildThemeInitScript('dark', true);
    expect(script).toContain(THEME_STORAGE_KEY);
    expect(script).toContain("setAttribute('data-theme'");

    window.localStorage.setItem(THEME_STORAGE_KEY, 'light');
    // Execute the inline script in JSDOM
    new Function(script)();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
