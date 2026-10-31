'use client';

import React, { Component, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const LazyAmbientBackgroundCanvas = dynamic(
  () => import('@/components/animations/AmbientBackgroundCanvas'),
  {
    ssr: false,
    loading: () => (
      <div
        className="ambient-bg-fallback"
        data-ambient-fallback="loading"
        aria-hidden="true"
      />
    ),
  }
);

interface ErrorBoundaryState {
  hasError: boolean;
}

class WebGLErrorBoundary extends Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div
          className="ambient-bg-fallback"
          data-ambient-fallback="error-boundary"
          aria-hidden="true"
        />
      );
    }
    return this.props.children;
  }
}

export function prefersReducedMotionEnabled(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return Boolean(
    window.matchMedia('(prefers-reduced-motion: reduce)')?.matches
  );
}

interface AmbientBackgroundLoaderProps {
  enabled: boolean;
}

export function AmbientBackgroundLoader({
  enabled,
}: AmbientBackgroundLoaderProps) {
  const [reducedMotion, setReducedMotion] = useState<boolean>(() =>
    prefersReducedMotionEnabled()
  );

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!mediaQuery) {
      return;
    }
    setReducedMotion(Boolean(mediaQuery.matches));

    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(Boolean(event.matches));
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    return undefined;
  }, []);

  if (!enabled) {
    return null;
  }

  if (reducedMotion) {
    return (
      <div
        className="ambient-bg-fallback"
        data-ambient-fallback="reduced-motion"
        aria-hidden="true"
      />
    );
  }

  return (
    <WebGLErrorBoundary>
      <LazyAmbientBackgroundCanvas />
    </WebGLErrorBoundary>
  );
}
