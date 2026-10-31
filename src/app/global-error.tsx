'use client';

import React from 'react';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main>
          <div className="main-content">
            <article className="about active">
              <header>
                <h2 className="h2 article-title">Application Error</h2>
              </header>
              <section className="about-text">
                <p>A critical application error occurred.</p>
                <button
                  type="button"
                  className="form-btn"
                  onClick={() => reset()}
                >
                  <span>Reload Application</span>
                </button>
              </section>
            </article>
          </div>
        </main>
      </body>
    </html>
  );
}
