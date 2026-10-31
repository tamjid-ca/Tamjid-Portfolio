import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main>
      <div className="main-content">
        <article className="about active" data-page="not-found">
          <header>
            <h2 className="h2 article-title">Page Not Found</h2>
          </header>
          <section className="about-text">
            <p>The page you are looking for does not exist or has been moved.</p>
            <Link href="/" className="form-btn" style={{ width: 'max-content' }}>
              <span>Return to Portfolio</span>
            </Link>
          </section>
        </article>
      </div>
    </main>
  );
}
