'use client';

import React from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main>
      <div className="main-content">
        <article className="about active" data-page="error">
          <header>
            <h2 className="h2 article-title">Something went wrong</h2>
          </header>
          <section className="about-text">
            <p>
              {error.message ||
                'An unexpected error occurred while rendering this section.'}
            </p>
            <button type="button" className="form-btn" onClick={() => reset()}>
              <span>Try Again</span>
            </button>
          </section>
        </article>
      </div>
    </main>
  );
}
