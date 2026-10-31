import React from 'react';
import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AmbientBackgroundCanvas from '@/components/animations/AmbientBackgroundCanvas';
import { AmbientBackgroundLoader } from '@/components/animations/AmbientBackgroundLoader';
import { PortfolioShell } from '@/components/portfolio/PortfolioShell';
import { V1_PORTFOLIO_SEED_DATA } from '@/seed/v1-portfolio-data';

describe('Phase 8 — Three.js Ambient Background & Reduced-Motion Fallbacks', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not mount any backdrop when siteSettings.enableThreeD is false', () => {
    const { container } = render(<AmbientBackgroundLoader enabled={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders static reduced-motion fallback when prefers-reduced-motion is active', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });

    const { container } = render(<AmbientBackgroundLoader enabled={true} />);
    const fallback = container.querySelector(
      '[data-ambient-fallback="reduced-motion"]'
    );
    expect(fallback).not.toBeNull();
    expect(fallback?.getAttribute('aria-hidden')).toBe('true');
  });

  it('gracefully falls back when WebGL context is unavailable in JSDOM/headless environments', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    const { container } = render(<AmbientBackgroundCanvas />);
    const fallback = container.querySelector(
      '[data-ambient-fallback="webgl-unavailable"]'
    );
    expect(fallback).not.toBeNull();
    expect(fallback?.getAttribute('aria-hidden')).toBe('true');
  });

  it('keeps PortfolioShell layout and content hierarchy untouched when 3D backdrop is enabled or disabled', () => {
    const { container: enabledContainer } = render(
      <PortfolioShell data={V1_PORTFOLIO_SEED_DATA} />
    );
    expect(enabledContainer.querySelector('aside.sidebar')).not.toBeNull();
    expect(enabledContainer.querySelector('.main-content')).not.toBeNull();

    const disabledData = {
      ...V1_PORTFOLIO_SEED_DATA,
      siteSettings: {
        ...V1_PORTFOLIO_SEED_DATA.siteSettings,
        enableThreeD: false,
      },
    };
    const { container: disabledContainer } = render(
      <PortfolioShell data={disabledData} />
    );
    expect(
      disabledContainer.querySelector('[data-ambient-fallback]')
    ).toBeNull();
    expect(
      disabledContainer.querySelector('[data-ambient-canvas]')
    ).toBeNull();
    expect(disabledContainer.querySelector('aside.sidebar')).not.toBeNull();
  });
});
